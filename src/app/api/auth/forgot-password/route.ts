import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'
import { sendEmail } from '@/lib/email'
import { applyRateLimit } from '@/lib/rate-limit'

export async function POST(req: Request) {
  try {
    // Apply rate limiting - strict for password reset to prevent enumeration attacks
    const { success, message } = await applyRateLimit(req, {
      windowMs: 15 * 60 * 1000, // 15 minute window
      max: 3, // 3 password reset requests per 15 minutes per IP
      message: 'Too many password reset attempts. Please try again later.',
    });
    
    if (!success) {
      return NextResponse.json({ message }, { status: 429 });
    }
    
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Return success even if user doesn't exist to prevent email enumeration
      return NextResponse.json(
        { message: 'If an account exists with this email, you will receive password reset instructions.' },
        { status: 200 }
      )
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Save reset token
    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        expires: resetTokenExpiry,
        userId: user.id,
      },
    })

    // Send reset email
    const resetUrl = `${process.env.NEXTAUTH_URL}reset-password?token=${resetToken}`
    await sendEmail({
      to: email,
      subject: 'Reset your password',
      html: `
        <p>Hello,</p>
        <p>You requested to reset your password. Click the link below to reset your password:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    })

    return NextResponse.json(
      { message: 'If an account exists with this email, you will receive password reset instructions.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { message: 'An error occurred while processing your request.' },
      { status: 500 }
    )
  }
} 