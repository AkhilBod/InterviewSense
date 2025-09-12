// app/api/auth/resend-verification/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { sendVerificationEmail } from '@/lib/email';
import * as z from 'zod';

const emailSchema = z.object({
  email: z.string().email('Invalid email address')
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = emailSchema.parse(body);
    
    // Check if this email has a pending verification
    const pendingUser = await prisma.pendingUser.findUnique({
      where: { email }
    });
    
    // Check if the user exists but is not verified
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!pendingUser && !existingUser) {
      // Don't reveal if the email exists or not for security
      return NextResponse.json(
        { message: 'If your email is registered, a verification link has been sent.' },
        { status: 200 }
      );
    }
    
    if (existingUser?.emailVerified) {
      return NextResponse.json(
        { message: 'Your email is already verified. Please login.' },
        { status: 400 }
      );
    }
    
    // Generate a new token
    const verificationToken = nanoid(32);
    const tokenExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    if (pendingUser) {
      // Update the existing pending user with a new token
      await prisma.pendingUser.update({
        where: { id: pendingUser.id },
        data: {
          verificationToken,
          expiresAt: tokenExpiration
        }
      });
    } else if (existingUser) {
      // Create a verification token for the existing user
      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token: verificationToken,
          expires: tokenExpiration
        }
      });
    }
    
    // Send a new verification email
    await sendVerificationEmail(email, verificationToken);
    
    return NextResponse.json(
      { message: 'Verification email sent. Please check your inbox.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Resend verification error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}