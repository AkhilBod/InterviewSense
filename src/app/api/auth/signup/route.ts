// src/app/api/auth/signup/route.ts (or wherever your POST handler is)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Assuming prisma is initialized here
import bcrypt from 'bcryptjs';
import * as z from 'zod';
import { nanoid } from 'nanoid';
import { sendVerificationEmail } from '@/lib/email'; // Your email sending utility

// Define validation schema (remains the same)
const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  name: z.string().min(2, 'Name must be at least 2 characters long')
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const validatedData = userSchema.parse(body);
    const email = validatedData.email.toLowerCase(); // Standardize email to lowercase
    const { password, name } = validatedData;

    // 1. Check if a user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email }, // Use the standardized lowercase email
    });

    if (existingUser) {
      if (existingUser.emailVerified) {
        // Email is genuinely in use by a VERIFIED user
        return NextResponse.json(
          { message: 'This email address is already registered and verified.' },
          { status: 409 } // 409 Conflict
        );
      } else {
        // Email exists but is NOT VERIFIED.
        // We will delete the old unverified user and their associated verification tokens
        // to allow the new registration attempt to proceed.
        console.log(`Email ${email} was previously registered by unverified user ID: ${existingUser.id}. Deleting old record to allow new registration.`);

        // A. Delete associated VerificationTokens for this email.
        //    This assumes VerificationToken.identifier stores the email.
        await prisma.verificationToken.deleteMany({
          where: { identifier: existingUser.email }, // Use the email of the existing unverified user
        });

        // B. Delete the old unverified user.
        //    If your Account and Session models have `onDelete: Cascade` linked to User,
        //    their records will be cleaned up automatically.
        await prisma.user.delete({
          where: { email: existingUser.email }, // Use the email to ensure we delete the correct user
        });
        console.log(`Successfully deleted unverified user (ID: ${existingUser.id}) and their associated verification tokens for email: ${email}.`);
        // Now, the flow will continue below to create a new user with this email.
      }
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create the new user (this happens if email was new, or old unverified user was deleted)
    const newUser = await prisma.user.create({
      data: {
        email: email, // Store the standardized lowercase email
        name,
        password: hashedPassword,
        // emailVerified will be null by default as per your Prisma schema (DateTime?)
        // createdAt will be set by @default(now())
      },
    });

    // 4. Generate verification token (expires in 24 hours - as in your original code)
    const token = nanoid(32);
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: newUser.email, // Use the email of the newly created user
        token,
        expires,
      },
    });

    // 5. Send verification email
    await sendVerificationEmail(newUser.email, token);

    // 6. Prepare user data for response (remove password)
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      {
        message: 'User created successfully. Please check your email to verify your account.',
        user: userWithoutPassword,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Signup error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    // Fallback for unique constraint violations if the above logic somehow misses a case
    // (e.g., race condition, though unlikely with this flow for email).
    // Or if another field had a unique constraint issue.
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        return NextResponse.json({ message: 'This email address is already in use.' }, { status: 409 });
    }

    return NextResponse.json(
      { message: 'An unexpected error occurred. Failed to create user.' },
      { status: 500 }
    );
  }
  // No prisma.$disconnect() here, assuming a shared Prisma client instance as is common in Next.js
  // (e.g., initialized in @/lib/prisma.ts)
}