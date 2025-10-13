import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get or create user progress
    let userProgress = await prisma.userProgress.findUnique({
      where: { userId }
    });

    if (!userProgress) {
      // Create initial progress record
      userProgress = await prisma.userProgress.create({
        data: {
          userId,
          weeklyGoal: 3,
          monthlyGoal: 12,
          lastWeekReset: new Date(),
          lastMonthReset: new Date(),
        }
      });
    }

    // Calculate current week's sessions
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const thisWeekSessions = await prisma.interviewSession.count({
      where: {
        userId,
        completedAt: {
          gte: oneWeekAgo
        }
      }
    });

    // Calculate daily streak
    const dailyStreak = await calculateCurrentStreak(userId);
    
    // Get recent sessions for additional stats
    const recentSessions = await prisma.interviewSession.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        score: true,
        completedAt: true,
        fillerWords: true
      }
    });

    // Calculate interview sessions count (total)
    const totalSessions = await prisma.interviewSession.count({
      where: { userId }
    });

    // Get today's activity
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayActivity = await prisma.dailyActivity.findFirst({
      where: {
        userId,
        date: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    });

    const response = {
      // Core statistics
      dailyStreak,
      weeklyGoal: userProgress.weeklyGoal,
      weeklyProgress: thisWeekSessions,
      bestScore: userProgress.bestScore,
      averageScore: userProgress.averageScore,
      
      // Detailed progress
      totalInterviews: userProgress.totalInterviews,
      behavioralInterviews: userProgress.behavioralInterviews,
      technicalInterviews: userProgress.technicalInterviews,
      resumeChecks: userProgress.resumeChecks,
      
      // Session data
      totalSessions,
      recentSessions,
      
      // Speech improvement
      averageFillerWords: userProgress.averageFillerWords,
      bestFillerWordCount: userProgress.bestFillerWordCount,
      
      // Engagement
      currentStreak: userProgress.currentStreak,
      longestStreak: userProgress.longestStreak,
      totalActiveDays: userProgress.totalActiveDays,
      lastActivityDate: userProgress.lastActivityDate,
      
      // Gamification
      totalXP: userProgress.totalXP,
      level: userProgress.level,
      
      // Today's activity
      hasActivityToday: !!todayActivity,
      
      // Quick stats calculations
      quickStats: {
        practiceStreak: dailyStreak,
        weeklyProgress: `${thisWeekSessions}/${userProgress.weeklyGoal}`,
        improvementRate: calculateImprovementRate(recentSessions),
        activeDays: userProgress.totalActiveDays,
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user progress' },
      { status: 500 }
    );
  }
}

// Helper function to calculate current streak
async function calculateCurrentStreak(userId: string): Promise<number> {
  try {
    // Get all daily activities ordered by date
    const activities = await prisma.dailyActivity.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      select: { date: true }
    });

    if (activities.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Check if user has activity today or yesterday (to account for timezone differences)
    const todayOrYesterday = activities.some(activity => {
      const activityDate = new Date(activity.date);
      activityDate.setHours(0, 0, 0, 0);
      const yesterday = new Date(currentDate);
      yesterday.setDate(yesterday.getDate() - 1);
      
      return activityDate.getTime() === currentDate.getTime() || 
             activityDate.getTime() === yesterday.getTime();
    });

    if (!todayOrYesterday) return 0;

    // Count consecutive days going backward
    for (const activity of activities) {
      const activityDate = new Date(activity.date);
      activityDate.setHours(0, 0, 0, 0);
      
      if (activityDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (activityDate.getTime() < currentDate.getTime()) {
        // Gap in activity, break the streak
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error('Error calculating streak:', error);
    return 0;
  }
}

// Helper function to calculate improvement rate
function calculateImprovementRate(sessions: any[]): string {
  if (sessions.length < 2) return 'Not enough data';
  
  const recentScores = sessions
    .filter(s => s.score !== null)
    .slice(0, 5)
    .map(s => s.score);
  
  if (recentScores.length < 2) return 'Not enough data';
  
  const latestAvg = recentScores.slice(0, Math.ceil(recentScores.length / 2))
    .reduce((sum, score) => sum + score, 0) / Math.ceil(recentScores.length / 2);
  
  const earlierAvg = recentScores.slice(Math.ceil(recentScores.length / 2))
    .reduce((sum, score) => sum + score, 0) / Math.floor(recentScores.length / 2);
  
  const improvement = ((latestAvg - earlierAvg) / earlierAvg) * 100;
  
  if (improvement > 0) {
    return `+${improvement.toFixed(1)}%`;
  } else if (improvement < 0) {
    return `${improvement.toFixed(1)}%`;
  } else {
    return 'Stable';
  }
}
