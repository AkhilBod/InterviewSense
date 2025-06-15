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

    // Fetch recent interview sessions (last 10)
    const recentSessions = await prisma.interviewSession.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        score: true,
        completedAt: true,
      }
    });

    // Fetch recent resume analyses (last 10)
    const recentAnalyses = await prisma.resumeAnalysis.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        overallScore: true,
        createdAt: true,
      }
    });
    
    return NextResponse.json({
      sessions: recentSessions,
      analyses: recentAnalyses.map(analysis => ({
        id: analysis.id,
        score: analysis.overallScore, // Map overallScore to score for consistency
        createdAt: analysis.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent activity' },
      { status: 500 }
    );
  }
}
