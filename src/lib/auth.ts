import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        // Check email verification for credentials provider
        if (!user.emailVerified) {
          throw new Error('Please verify your email before logging in');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id,
          email: user.email || '',
          name: user.name || '',
          image: user.image || '',
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      // For credentials provider, we already check email verification in authorize
      if (account?.type === 'credentials') {
        return true;
      }

      // For OAuth providers (like Google), automatically verify email
      if (account?.type === 'oauth') {
        try {
          // For OAuth providers, we can trust the email is verified
          const verifiedDate = new Date();

          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          // If user doesn't exist, create new user with verified email
          if (!dbUser) {
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                emailVerified: verifiedDate,
                onboardingCompleted: false,
              } as Prisma.UserCreateInput,
            });
            return true;
          }

          // If user exists, ensure email is verified and update other fields
          await prisma.user.update({
            where: { id: dbUser.id },
            data: {
              emailVerified: verifiedDate,
              name: user.name,
              image: user.image,
            } as Prisma.UserUpdateInput,
          });

          return true;
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
        }
      }

      return true;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      try {
        const dbUser = await prisma.user.findFirst({
          where: {
            email: token.email as string,
          },
        });

        if (!dbUser) {
          if (user) {
            token.id = user?.id;
          }
          return token;
        }

        return {
          id: dbUser.id,
          name: dbUser.name || '',
          email: dbUser.email || '',
          picture: dbUser.image || '',
        };
      } catch (error) {
        console.error('Error in jwt callback:', error);
        return token;
      }
    }
  },
  debug: process.env.NODE_ENV === 'development',
}; 