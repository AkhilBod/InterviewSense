import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  
  console.log('Verification request received:', {
    url: req.url,
    token: token ? 'present' : 'missing'
  });
  
  if (!token) {
    console.error('Verification failed: Missing token');
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=missing-token`);
  }
  
  try {
    console.log('Starting verification process for token:', token);
    
    // Find the verification token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: { token }
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
    const now = new Date();
    if (now > verificationToken.expires) {
      console.error('Verification failed: Token expired at', verificationToken.expires);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=expired-token`);
    }
    
    // Find the user by email
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
    
    // Update the user's email verification status
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
      });
      console.log('Updated user email verification status');
    } catch (updateError) {
      console.error('Failed to update user verification status:', updateError);
      throw updateError;
    }
    
    // Delete the verification token
    try {
      await prisma.verificationToken.delete({
        where: { token }
      });
      console.log('Deleted verification token');
    } catch (deleteError) {
      console.error('Failed to delete verification token:', deleteError);
      // Don't throw here, as the verification was successful
    }
    
    console.log('Email verification completed successfully for user:', user.email);
    
    // Redirect to login with success message
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?success=email-verified`);
  } catch (error) {
    console.error('Verification error:', error);
    // Log the full error details
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=verification-failed`);
  }
}
