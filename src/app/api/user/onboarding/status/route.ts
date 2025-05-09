import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's onboarding status from database
    const user = await prisma.user.findUnique({
      where: { 
        email: session.user.email,
        emailVerified: { not: null } // Only consider verified users
      },
      select: {
        onboardingCompleted: true,
        emailVerified: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found or not verified' }, { status: 404 });
    }

    if (!user.emailVerified) {
      return NextResponse.json({ error: 'Email not verified' }, { status: 403 });
    }

    return NextResponse.json({ 
      onboardingCompleted: user.onboardingCompleted 
    });
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return NextResponse.json({ error: 'Failed to check onboarding status' }, { status: 500 });
  }
} 