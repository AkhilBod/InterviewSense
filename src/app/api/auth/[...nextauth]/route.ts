import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import EmailProvider from 'next-auth/providers/email'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma' // Import the proper prisma instance
import { applyRateLimit } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'

// Extend the built-in session types
declare module "next-auth" {
  interface User {
    id: string
    email: string // email is non-optional in the User interface by default
    name?: string | null
    // Ensure these match your Prisma schema if you use them directly on the User object
    emailVerified?: Date | null;
    password?: string | null;
  }
  
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      // Add any other custom session user properties here
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    // Add any other custom JWT properties here
  }
}

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    // Email provider for magic link sign-in and email verification
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
    
    // Credentials provider for email/password login
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter both email and password')
        }
    
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email.toLowerCase(),
          },
        })
    
        if (!user || !user.email) {
          throw new Error('No user found with this email')
        }

        // If user signed up via OAuth, they might not have a password
        if (!user.password) {
          throw new Error('This email is registered with Google. Please sign in using Google.')
        }
    
        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error('Please verify your email address before logging in. Check your inbox for a verification link.')
        }
    
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )
    
        if (!isPasswordValid) {
          throw new Error('Invalid password')
        }
    
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      }
    }),
    
    // Google provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      /**
       * This option allows NextAuth.js to automatically link an OAuth account
       * (like this Google account) to an existing user record in your database
       * if the email address provided by Google matches the email of an existing user.
       * This is useful if a user initially signed up via email/password or another
       * OAuth provider and then tries to sign in with Google using the same email.
       * * IMPORTANT: Only enable this if you trust that the email from the OAuth
       * provider (Google, in this case) has been securely verified by them.
       * For major providers like Google, this is generally a safe assumption.
       */
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
    verifyRequest: '/verify-request',
    // Remove newUser redirect - let new users go to their intended destination
    // newUser: '/signup'
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // Log sign-in attempt for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('SignIn callback:', { 
          user: user?.email, 
          account: account?.provider,
          error: null 
        });
      }
      
      // Allow all sign-ins
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Log redirect for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('Redirect callback:', { url, baseUrl });
      }
      
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
    async jwt({ token, user, account }) {
      // Log JWT callback for debugging
      if (process.env.NODE_ENV === 'development' && account) {
        console.log('JWT callback:', { 
          provider: account.provider, 
          userId: user?.id 
        });
      }
      
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      if (process.env.NODE_ENV === 'development') {
        console.log('User signed in:', { 
          email: user.email, 
          provider: account?.provider,
          isNewUser 
        });
      }
    },
    async createUser({ user }) {
      if (process.env.NODE_ENV === 'development') {
        console.log('New user created:', { email: user.email });
      }
    }
  },
  debug: process.env.NODE_ENV === 'development',
  // Configure to reduce database calls
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 // 30 days
      }
    }
  }
})

// Export the handler directly for both GET and POST methods
// This is the recommended way to use NextAuth with the App Router
export { handler as GET, handler as POST };