import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/stats/topic-breakdown — Returns tech topic and difficulty breakdowns
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const stats = await (prisma as any).userStats.findUnique({
      where: { userId: user.id },
      select: {
        techByTopic: true,
        techByDifficulty: true,
        techTotalSolved: true,
        techTotalCorrect: true,
        techAvgScore: true,
      },
    });

    if (!stats) {
      return NextResponse.json({
        techByTopic: {},
        techByDifficulty: {},
        techTotalSolved: 0,
        techTotalCorrect: 0,
        techAvgScore: 0,
      });
    }

    return NextResponse.json({
      techByTopic: stats.techByTopic || {},
      techByDifficulty: stats.techByDifficulty || {},
      techTotalSolved: stats.techTotalSolved || 0,
      techTotalCorrect: stats.techTotalCorrect || 0,
      techAvgScore: stats.techAvgScore || 0,
    });
  } catch (error) {
    console.error('Error fetching topic breakdown:', error);
    return NextResponse.json({ error: 'Failed to fetch topic breakdown' }, { status: 500 });
  }
}
