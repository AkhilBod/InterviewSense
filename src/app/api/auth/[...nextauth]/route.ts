import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import AzureADProvider from 'next-auth/providers/azure-ad'
import CredentialsProvider from 'next-auth/providers/credentials'
import EmailProvider from 'next-auth/providers/email'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma' // Import the proper prisma instance

// Extend the built-in session types
declare module "next-auth" {
  interface User {
    id: string
    email: string
    name?: string | null
  }
  
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Email provider for email/password verification 
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
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
    }),
    
    // Google provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    // Microsoft provider
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID,
    }),
  ],
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login', // Error code passed in query string as ?error=
    verifyRequest: '/verify-request', // (used for check email message)
    newUser: '/start' // New users will be directed here on first sign in
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
      }
      return session
    }
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };