// src/app/api/auth/[...nextauth]/route.ts (FOR V4)
import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
  ],
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET,
  // Add callbacks, pages, adapter etc. here if needed
};

const handler = NextAuth(authOptions);

// Export named handlers for GET and POST
export { handler as GET, handler as POST };