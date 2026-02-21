import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { userId } = await params;
    
    // Only allow users to access their own recent activity
    if (!session?.user?.id || session.user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user stats which contain recent sessions
    const userStats = await prisma.userStats.findUnique({
      where: { userId },
      select: {
        recentSessions: true,
        totalResumeChecks: true,
      }
    });

    // Get recent practice sessions (last 10)
    const recentPracticeSessions = await prisma.practiceSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        score: true,
        createdAt: true,
      }
    });
    
    // Transform sessions to match expected format
    const sessions = recentPracticeSessions.map(session => ({
      id: session.id,
      type: session.type,
      score: session.score,
      completedAt: session.createdAt.toISOString()
    }));

    // Create mock analyses from resume sessions
    const resumeSessions = recentPracticeSessions.filter(session => session.type === 'resume');
    const analyses = resumeSessions.map(session => ({
      id: session.id,
      score: session.score,
      createdAt: session.createdAt.toISOString()
    }));
    
    return NextResponse.json({
      sessions: sessions.filter(s => s.type !== 'resume'), // Interview sessions only
      analyses: analyses // Resume analyses
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent activity' },
      { status: 500 }
    );
  }
}
