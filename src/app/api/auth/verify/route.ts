import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  
  if (!token) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=missing-token`);
  }
  
  try {
    // Find the verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    });
    
    if (!verificationToken) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=invalid-token`);
    }
    
    // Check if token is expired
    if (new Date() > verificationToken.expires) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=expired-token`);
    }
    
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier }
    });
    
    if (!user) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=user-not-found`);
    }
    
    // Update the user's email verification status
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() }
    });
    
    // Delete the verification token
    await prisma.verificationToken.delete({
      where: { token }
    });
    
    // Redirect to login with success message
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?success=email-verified`);
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=verification-failed`);
  }
}
