import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Test endpoint to simulate completing a resume analysis (for testing)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { score = 80 } = body;

    // Use StatsManager to update stats
    const { StatsManager } = await import('@/lib/stats');
    const result = await StatsManager.updateStatsAfterSession(session.user.id, {
      sessionType: 'resume',
      score: score,
      duration: Math.floor(Math.random() * 10) + 5, // Random 5-15 minutes
      completed: true,
      improvements: ['Add more quantified achievements', 'Strengthen action verbs', 'Include relevant keywords']
    });

    return NextResponse.json({
      message: 'Test resume analysis completed successfully',
      result,
      note: 'This is a test endpoint for development. Remove in production.'
    });
  } catch (error) {
    console.error('Error in test resume analysis:', error);
    return NextResponse.json(
      { error: 'Failed to complete test resume analysis' },
      { status: 500 }
    );
  }
} 