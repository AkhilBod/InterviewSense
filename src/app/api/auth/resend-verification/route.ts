import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { sendVerificationEmail } from '@/lib/email';
import * as z from 'zod';

const emailSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .transform(val => val.toLowerCase().trim())
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate email
    const result = emailSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: 'Invalid email address', errors: result.error.errors },
        { status: 400 }
      );
    }
    
    const { email } = result.data;
    console.log('[RESEND] Attempt for:', email);
    
    // Check if the user exists and is not verified
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.log('[RESEND] User not found:', email);
      // Don't reveal if the email exists or not for security
      return NextResponse.json(
        { message: 'If your email is registered, a verification link has been sent.' },
        { status: 200 }
      );
    }
    
    if (user.emailVerified) {
      console.log('[RESEND] Email already verified:', email);
      return NextResponse.json(
        { message: 'Your email is already verified. Please login.' },
        { status: 400 }
      );
    }
    
    console.log('[RESEND] Deleting old tokens for:', email);
    // Delete any existing verification tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    });
    
    // Generate a new token
    const verificationToken = nanoid(32);
    const tokenExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    console.log('[RESEND] Generated new token');
    
    // Create a new verification token
    console.log('[RESEND] Creating token');
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires: tokenExpiration
      }
    });
    console.log('[RESEND] Token created');
    
    // Send a new verification email
    console.log('[RESEND] Sending email');
    try {
      await sendVerificationEmail(email, verificationToken);
      console.log('[RESEND] Email sent successfully');
    } catch (emailError) {
      console.error('[RESEND] Email send failed:', emailError);
      throw emailError;
    }
    
    return NextResponse.json(
      { message: 'Verification email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[RESEND] ERROR:', error);
    if (error instanceof Error) {
      console.error('[RESEND] Message:', error.message);
      console.error('[RESEND] Code:', (error as any).code);
    }
    
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
