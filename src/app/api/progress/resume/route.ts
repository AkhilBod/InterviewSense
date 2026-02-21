import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { score, improvementCount, wordCount, analysis, categories } = body;

    // Use new stats system
    const { StatsManager } = await import('@/lib/stats');
    const result = await StatsManager.updateStatsAfterSession(session.user.id, {
      sessionType: 'resume',
      score: score || 0,
      duration: Math.floor(Math.random() * 10) + 5, // Estimate 5-15 minutes
      completed: true,
      improvements: analysis?.improvements?.slice(0, 3) || []
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating resume progress with new stats system:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
