import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { message: 'Missing token' },
      { status: 400 }
    );
  }

  try {
    // Find the verification token
    const verificationRecord = await prisma.verificationToken.findUnique({
      where: { token }
    });

    if (
      !verificationRecord ||
      verificationRecord.expires < new Date()
    ) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Mark user's email as verified
    await prisma.user.updateMany({
      where: { email: verificationRecord.identifier },
      data: { emailVerified: new Date() }
    });

    // Delete the token after use
    await prisma.verificationToken.delete({
      where: { token }
    });

    // Redirect or confirm success
    return NextResponse.redirect(new URL('/verified-successfully', req.url));
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { message: 'Failed to verify email' },
      { status: 500 }
    );
  }
}

