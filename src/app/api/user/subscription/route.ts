import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ 
        hasActiveSubscription: false,
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    // Check if user has an active subscription (not FREE plan)
    const hasActiveSubscription = 
      subscription && 
      subscription.plan !== 'FREE' && 
      subscription.status === 'ACTIVE';

    return NextResponse.json({ 
      hasActiveSubscription,
      plan: subscription?.plan || 'FREE',
      status: subscription?.status || null,
    });

  } catch (error: any) {
    console.error('Subscription check error:', error);
    return NextResponse.json(
      { 
        hasActiveSubscription: false,
        error: error.message || 'Failed to check subscription' 
      },
      { status: 500 }
    );
  }
}
