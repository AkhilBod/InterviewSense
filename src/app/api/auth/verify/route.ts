import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      console.error('Verification failed: Missing token');
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=missing-token`);
    }

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: { token: token },
      include: { user: true }
    });

    if (!verificationToken) {
      console.error('Verification failed: Token not found in database');
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=invalid-token`);
    }

    console.log('Found verification token:', {
      identifier: verificationToken.identifier,
      expires: verificationToken.expires
    });

    // Check if token is expired
    if (new Date() > verificationToken.expires) {
      console.error('Verification failed: Token expired at', verificationToken.expires);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=expired-token`);
    }

    // Get user from database using the identifier (email)
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier }
    });

    if (!user) {
      console.error('Verification failed: No user found for email:', verificationToken.identifier);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=user-not-found`);
    }

    console.log('Found user:', {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified
    });

    // Update user's email verification status
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() }
    });

    // Delete the verification token
    await prisma.verificationToken.delete({
      where: { token: token }
    });

    // Redirect to login page with auto-login parameters
    const redirectUrl = `${process.env.NEXTAUTH_URL}/login?success=email-verified&autoLogin=true&email=${encodeURIComponent(user.email)}`;
    console.log('Redirecting to:', redirectUrl);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=verification-failed`);
  }
}
