// src/app/api/auth/signup/route.ts (or wherever your POST handler is)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Assuming prisma is initialized here
import bcrypt from 'bcryptjs';
import * as z from 'zod';
import { nanoid } from 'nanoid';
import { sendVerificationEmail } from '@/lib/email';

// Define validation schema
const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  name: z.string().min(2, 'Name must be at least 2 characters long')
});

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists and is verified
    const existingUser = await prisma.user.findUnique({
      where: { 
        email: email.toLowerCase(),
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
        email: email.toLowerCase(),
        emailVerified: null
      },
    });

    // If there's an unverified user, delete it to allow re-registration
    if (unverifiedUser) {
      // Delete any existing verification tokens first
      await prisma.verificationToken.deleteMany({
        where: { identifier: email.toLowerCase() }
      });
      
      // Then delete the user
      await prisma.user.delete({
        where: { id: unverifiedUser.id }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = nanoid(32);
    const tokenExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user and verification token in a transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create the user
      const newUser = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          name,
          password: hashedPassword,
          onboardingCompleted: false,
        },
      });

      // Create verification token
      await tx.verificationToken.create({
        data: {
          identifier: email.toLowerCase(),
          token: verificationToken,
          expires: tokenExpiration,
        },
      });

      return newUser;
    });

    // Send verification email
    await sendVerificationEmail(email.toLowerCase(), verificationToken);

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