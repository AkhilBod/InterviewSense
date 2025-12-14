import { NextRequest, NextResponse } from 'next/server';
import { ProgressService } from '@/lib/progress';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, score, duration, fillerWords, metrics } = body;

    const result = await ProgressService.updateInterviewProgress(session.user.id, {
      type,
      score,
      duration,
      fillerWords,
      metrics,
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating interview progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
