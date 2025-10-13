import { NextRequest, NextResponse } from 'next/server';
import { AchievementService } from '@/lib/achievements';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { userId } = await params;
    
    // Only allow users to access their own achievements
    if (!session?.user?.id || session.user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const recommendations = await AchievementService.getRecommendedAchievements(userId, 5);
    
    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Error fetching recommended achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
