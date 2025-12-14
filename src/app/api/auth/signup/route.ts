// src/app/api/auth/signup/route.ts (or wherever your POST handler is)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Assuming prisma is initialized here
import bcrypt from 'bcryptjs';
import * as z from 'zod';
import { nanoid } from 'nanoid';
import { sendVerificationEmail } from '@/lib/email';
import { applyRateLimit } from '@/lib/rate-limit';

// Define validation schema
const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  creatorCode: z.string().optional()
});

export async function POST(req: NextRequest) {
  let user = null;
  
  try {
    // Apply rate limiting - strict for signup to prevent abuse
    const { success, message } = await applyRateLimit(req, {
      windowMs: 60 * 60 * 1000, // 1 hour window
      max: 5, // 5 signup attempts per hour per IP
      message: 'Too many signup attempts. Please try again later.',
    });
    
    if (!success) {
      return NextResponse.json({ message }, { status: 429 });
    }
    
    const { email, password, name, creatorCode } = await req.json();
    console.log('[SIGNUP] Attempt for:', email);

    // Validate input
    if (!email || !password || !name) {
      console.warn('[SIGNUP] Missing required fields');
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    console.log('[SIGNUP] Checking for existing user:', normalizedEmail);
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // If user exists and is verified, reject
    if (existingUser && existingUser.emailVerified) {
      console.warn('[SIGNUP] Email already verified');
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // If there's an unverified user, delete it to allow re-registration
    if (existingUser && !existingUser.emailVerified) {
      console.log('[SIGNUP] Cleaning up unverified user');
      // Delete any existing verification tokens first
      await prisma.verificationToken.deleteMany({
        where: { identifier: normalizedEmail }
      });
      
      // Then delete the user
      await prisma.user.delete({
        where: { id: existingUser.id }
      });
      console.log('[SIGNUP] Cleaned up');
    }

    // Hash password
    console.log('[SIGNUP] Hashing password');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user first
    console.log('[SIGNUP] Creating user');
    user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name,
        password: hashedPassword,
        creatorCode: creatorCode || null,
      },
    });
    console.log('[SIGNUP] User created:', user.id);

    // Generate verification token
    const verificationToken = nanoid(32);
    const tokenExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    console.log('[SIGNUP] Generated token');

    // Create verification token - handle unique constraint
    console.log('[SIGNUP] Creating verification token for:', normalizedEmail);
    try {
      // First delete any existing tokens for this email
      await prisma.verificationToken.deleteMany({
        where: { identifier: normalizedEmail }
      });
      console.log('[SIGNUP] Cleaned old tokens');
      
      // Now create the new one
      await prisma.verificationToken.create({
        data: {
          identifier: normalizedEmail,
          token: verificationToken,
          expires: tokenExpiration,
        },
      });
      console.log('[SIGNUP] Token created');
    } catch (tokenError) {
      console.error('[SIGNUP] Token creation failed:', tokenError);
      throw tokenError;
    }

    // Send verification email - don't let email errors fail signup
    console.log('[SIGNUP] Sending email');
    try {
      await sendVerificationEmail(normalizedEmail, verificationToken);
      console.log('[SIGNUP] Email sent');
    } catch (emailError) {
      console.error('[SIGNUP] Email failed (non-fatal):', emailError);
      // Log but don't fail - user is already created
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    console.log('[SIGNUP] Success');

    return NextResponse.json(
      { message: 'User created successfully', user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error('[SIGNUP] ERROR:', error);
    if (error instanceof Error) {
      console.error('[SIGNUP] Message:', error.message);
      console.error('[SIGNUP] Code:', (error as any).code);
    }
    
    // If user was created but something failed after, that's OK
    if (user) {
      console.log('[SIGNUP] User was created, returning success');
      const { password: _, ...userWithoutPassword } = user;
      return NextResponse.json(
        { message: 'User created successfully', user: userWithoutPassword },
        { status: 201 }
      );
    }
    
    return NextResponse.json(
      { message: 'Error creating user' },
      { status: 500 }
    );
  }
}