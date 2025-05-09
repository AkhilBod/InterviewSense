import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    
    // Update user's onboarding status in the database
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        onboardingCompleted: true,
        // You can add more fields to store other onboarding data if needed
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving onboarding status:', error);
    return NextResponse.json({ error: 'Failed to save onboarding status' }, { status: 500 });
  }
} 