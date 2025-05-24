import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const CREDIT_COSTS = {
  technical: 2,
  behavioral: 2,
  resume: 1,
  coverLetter: 1,
};

const DEFAULT_CREDITS = 10;

async function resetUserCredits(userEmail: string): Promise<number> {
  const now = new Date();
  const user = await prisma.user.findUnique({ where: { email: userEmail } });

  if (!user) {
    throw new Error('User not found for credit reset');
  }

  let needsReset = false;
  if (user.lastCreditReset) {
    const lastResetDate = new Date(user.lastCreditReset);
    // Reset if it's a new month
    if (lastResetDate.getFullYear() < now.getFullYear() || lastResetDate.getMonth() < now.getMonth()) {
      needsReset = true;
    }
  } else {
    // If lastCreditReset is null (e.g., new user or first time this logic runs for them), set it.
    needsReset = true; 
  }

  if (needsReset) {
    await prisma.user.update({
      where: { email: userEmail },
      data: {
        credits: DEFAULT_CREDITS,
        lastCreditReset: now,
      },
    });
    return DEFAULT_CREDITS;
  }
  return user.credits;
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentCredits = await resetUserCredits(session.user.email);

    return NextResponse.json({ credits: currentCredits });
  } catch (error) {
    console.error('Error fetching user credits:', error);
    return NextResponse.json({ error: 'Failed to fetch user credits' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { featureType } = await req.json() as { featureType: keyof typeof CREDIT_COSTS };

    if (!featureType || !CREDIT_COSTS[featureType]) {
      return NextResponse.json({ error: 'Invalid feature type' }, { status: 400 });
    }

    const cost = CREDIT_COSTS[featureType];
    
    // Ensure credits are up-to-date before attempting deduction
    await resetUserCredits(session.user.email); 
    
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.credits < cost) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        credits: {
          decrement: cost,
        },
      },
    });

    return NextResponse.json({ success: true, credits: updatedUser.credits });
  } catch (error) {
    console.error('Error deducting user credits:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
