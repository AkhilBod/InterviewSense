import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ProgressService } from '@/lib/progress';

// Test endpoint to simulate completing an interview (for testing)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type = 'behavioral', score = 85 } = body;

    // Simulate interview completion
    const result = await ProgressService.updateInterviewProgress(session.user.id, {
      type: type as 'behavioral' | 'technical',
      score: score,
      duration: 1200, // 20 minutes
      fillerWords: Math.floor(Math.random() * 5), // Random 0-4 filler words
      metrics: {
        questionsAnswered: 5,
        averageAnswerScore: score - Math.floor(Math.random() * 10)
      }
    });

    return NextResponse.json({
      message: 'Test interview completed successfully',
      result,
      note: 'This is a test endpoint for development. Remove in production.'
    });
  } catch (error) {
    console.error('Error in test interview:', error);
    return NextResponse.json(
      { error: 'Failed to complete test interview' },
      { status: 500 }
    );
  }
}
