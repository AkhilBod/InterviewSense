import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { applyRateLimit } from '@/lib/rate-limit'
import { getToken } from 'next-auth/jwt'

export async function POST(req: Request) {
  try {
    // Apply rate limiting - restrict password reset attempts
    const { success, message } = await applyRateLimit(req, {
      windowMs: 10 * 60 * 1000, // 10 minute window
      max: 5, // 5 reset password attempts per 10 minutes per IP
      message: 'Too many password reset attempts. Please try again later.',
    });
    
    if (!success) {
      return NextResponse.json({ message }, { status: 429 });
    }
    
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json(
        { message: 'Token and password are required' },
        { status: 400 }
      )
    }

    // Find the reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!resetToken) {
      return NextResponse.json(
        { message: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Check if token has expired
    if (resetToken.expires < new Date()) {
      // Delete expired token
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      })

      return NextResponse.json(
        { message: 'Reset token has expired' },
        { status: 400 }
      )
    }

    // Hash the new password
    const hashedPassword = await hash(password, 12)

    // Update user's password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    })

    // Delete the used token
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    })

    // We don't need to create a session token in the App Router
    // The user will be redirected to login with their new password

    return NextResponse.json(
      { 
        message: 'Password has been reset successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { message: 'An error occurred while resetting your password.' },
      { status: 500 }
    )
  }
} 