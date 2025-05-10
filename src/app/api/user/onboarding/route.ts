import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    try {
      // Update user's onboarding status
      await prisma.user.update({
        where: { email: session.user.email },
        data: {
          onboardingCompleted: true,
        } as Prisma.UserUpdateInput,
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error updating onboarding status:', error);
      return NextResponse.json(
        { error: 'Failed to update onboarding status' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in onboarding API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 