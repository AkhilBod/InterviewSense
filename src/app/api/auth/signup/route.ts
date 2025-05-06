import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Note: import { prisma } not default import
import bcrypt from 'bcryptjs';
import * as z from 'zod';

// Define validation schema
const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters')
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validate input
    const validatedData = userSchema.parse(body)
    const { email, password, name } = validatedData
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      )
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    })
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user
    
    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: userWithoutPassword 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { message: 'Failed to create user' },
      { status: 500 }
    )
  }
}