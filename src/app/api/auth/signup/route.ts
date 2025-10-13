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

    // Check if user already exists and is verified
    const existingUser = await prisma.user.findUnique({
      where: { 
        email: normalizedEmail,
        emailVerified: { not: null } // Only consider verified users
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Check for unverified user
    const unverifiedUser = await prisma.user.findUnique({
      where: { 
        email: normalizedEmail,
        emailVerified: null
      },
    });

    // If there's an unverified user, delete it to allow re-registration
    if (unverifiedUser) {
      // Delete any existing verification tokens first
      await prisma.verificationToken.deleteMany({
        where: { identifier: normalizedEmail }
      });
      
      // Then delete the user
      await prisma.user.delete({
        where: { id: unverifiedUser.id }
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

    // Send verification email
    await sendVerificationEmail(normalizedEmail, verificationToken);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { message: 'User created successfully', user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Error creating user' },
      { status: 500 }
    );
  }
}