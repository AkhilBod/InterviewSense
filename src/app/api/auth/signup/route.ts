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

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // If user exists and is verified, reject
    if (existingUser && existingUser.emailVerified) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // If there's an unverified user, delete it to allow re-registration
    if (existingUser && !existingUser.emailVerified) {
      // Delete any existing verification tokens first
      await prisma.verificationToken.deleteMany({
        where: { identifier: normalizedEmail }
      });
      
      // Then delete the user
      await prisma.user.delete({
        where: { id: existingUser.id }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user first
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name,
        password: hashedPassword,
        creatorCode: creatorCode || null,
      },
    });

    // Generate verification token
    const verificationToken = nanoid(32);
    const tokenExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create verification token
    await prisma.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        token: verificationToken,
        expires: tokenExpiration,
      },
    });

    // Send verification email - don't let email errors fail signup
    try {
      await sendVerificationEmail(normalizedEmail, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Log but don't fail - user is already created
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { message: 'User created successfully', user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error code:', (error as any).code);
    }
    return NextResponse.json(
      { message: 'Error creating user' },
      { status: 500 }
    );
  }
}