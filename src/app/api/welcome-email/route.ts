// src/app/api/welcome-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { applyRateLimit } from '@/lib/rate-limit';

// This route can be used to manually send a welcome email
// Only accessible by authenticated users or via a secret token
export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting
    const { success, message } = await applyRateLimit(req, {
      windowMs: 60 * 60 * 1000, // 1 hour window
      max: 3, // 3 requests per hour per IP
      message: 'Too many welcome email requests. Please try again later.',
    });
    
    if (!success) {
      return NextResponse.json({ message }, { status: 429 });
    }
    
    // Verify authentication
    const session = await getServerSession(authOptions);
    let authorized = false;
    let targetEmail: string | null = null;
    let userName: string | null = null;
    
    // Check if user is authenticated
    if (session?.user?.email) {
      authorized = true;
      targetEmail = session.user.email;
      
      // Get user's name from database
      const user = await prisma.user.findUnique({
        where: { email: targetEmail },
      });
      
      userName = user?.name || 'there';
    } else {
      // Alternative: Check if request contains secret token
      const body = await req.json();
      const { email, secretToken } = body;
      
      if (secretToken === process.env.API_SECRET_TOKEN) {
        authorized = true;
        targetEmail = email;
        
        // Get user's name from database if email is provided
        if (email) {
          const user = await prisma.user.findUnique({
            where: { email },
          });
          
          userName = user?.name || 'there';
        } else {
          return NextResponse.json(
            { message: 'Email is required when using token authorization' },
            { status: 400 }
          );
        }
      }
    }
    
    if (!authorized || !targetEmail) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Send welcome email
    await sendWelcomeEmail(targetEmail, userName);
    
    return NextResponse.json(
      { message: 'Welcome email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Welcome email error:', error);
    return NextResponse.json(
      { message: 'Failed to send welcome email' },
      { status: 500 }
    );
  }
}
