import { prisma } from '@/lib/prisma';

interface ActivityData {
  activityType: string;
  problemId?: number | null;
  problemTitle?: string | null;
  topic?: string | null;
  difficulty?: string | null;
  language?: string | null;
  isCorrect?: boolean | null;
  score?: number | null;
  durationSec?: number | null;
  metadata?: Record<string, any> | null;
}

/**
 * Log an activity and update aggregated UserStats.
 * Fire-and-forget: errors are caught and logged but never thrown.
 */
export async function logActivity(userId: string, data: ActivityData): Promise<void> {
  try {
    // Create activity log entry
    await (prisma as any).activityLog.create({
      data: {
        userId,
        activityType: data.activityType,
        problemId: data.problemId ?? null,
        problemTitle: data.problemTitle ?? null,
        topic: data.topic ?? null,
        difficulty: data.difficulty ?? null,
        language: data.language ?? null,
        isCorrect: data.isCorrect ?? null,
        score: data.score ?? null,
        durationSec: data.durationSec ?? null,
        metadata: data.metadata ?? null,
      },
    });

    // Update aggregated stats
    await updateUserStats(userId, data);
  } catch (err) {
    console.error('[activity-logger] Failed to log activity:', err);
  }
}

async function updateUserStats(userId: string, activity: ActivityData) {
  let stats: any = await prisma.userStats.findUnique({ where: { userId } });
  if (!stats) {
    stats = await prisma.userStats.create({ data: { userId } });
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Calculate streak
  let newDailyStreak = stats.dailyStreak;
  if (stats.lastActivityDate) {
    const lastDay = new Date(
      stats.lastActivityDate.getFullYear(),
      stats.lastActivityDate.getMonth(),
      stats.lastActivityDate.getDate()
    );
    const daysDiff = Math.floor((today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff === 0) {
      // Same day — no change
    } else if (daysDiff === 1) {
      newDailyStreak += 1;
    } else {
      newDailyStreak = 1;
    }
  } else {
    newDailyStreak = 1;
  }

  const updateData: any = {
    dailyStreak: newDailyStreak,
    longestStreak: Math.max(stats.longestStreak, newDailyStreak),
    lastActivityDate: now,
    totalSessions: stats.totalSessions + 1,
    weeklyProgress: stats.weeklyProgress + 1,
    updatedAt: now,
  };

  if (activity.score != null) {
    updateData.lastScore = activity.score;
  }

  if (activity.durationSec) {
    updateData.totalTimeMinutes = stats.totalTimeMinutes + Math.ceil(activity.durationSec / 60);
  }

  switch (activity.activityType) {
    case 'technical': {
      updateData.techTotalSolved = stats.techTotalSolved + 1;
      if (activity.isCorrect) {
        updateData.techTotalCorrect = stats.techTotalCorrect + 1;
      }
      if (activity.score != null) {
        updateData.techAvgScore =
          stats.techTotalSolved > 0
            ? (stats.techAvgScore * stats.techTotalSolved + activity.score) / (stats.techTotalSolved + 1)
            : activity.score;
        updateData.bestTechnicalScore = Math.max(stats.bestTechnicalScore, activity.score);
      }
      if (activity.topic) {
        const topicData = (stats.techByTopic as Record<string, any>) || {};
        const existing = topicData[activity.topic] || { solved: 0, correct: 0, totalScore: 0 };
        topicData[activity.topic] = {
          solved: existing.solved + 1,
          correct: existing.correct + (activity.isCorrect ? 1 : 0),
          totalScore: existing.totalScore + (activity.score || 0),
        };
        updateData.techByTopic = topicData;
      }
      if (activity.difficulty) {
        const diffData = (stats.techByDifficulty as Record<string, number>) || {};
        diffData[activity.difficulty] = (diffData[activity.difficulty] || 0) + 1;
        updateData.techByDifficulty = diffData;
      }
      break;
    }
    case 'behavioral': {
      updateData.totalInterviews = stats.totalInterviews + 1;
      updateData.behavTotalSessions = stats.behavTotalSessions + 1;
      if (activity.score != null) {
        updateData.behavAvgScore =
          stats.behavTotalSessions > 0
            ? (stats.behavAvgScore * stats.behavTotalSessions + activity.score) / (stats.behavTotalSessions + 1)
            : activity.score;
        updateData.bestBehavioralScore = Math.max(stats.bestBehavioralScore, activity.score);
        updateData.bestInterviewScore = Math.max(stats.bestInterviewScore, activity.score);
      }
      break;
    }
    case 'system_design': {
      updateData.sdTotalSessions = stats.sdTotalSessions + 1;
      if (activity.score != null) {
        updateData.sdAvgScore =
          stats.sdTotalSessions > 0
            ? (stats.sdAvgScore * stats.sdTotalSessions + activity.score) / (stats.sdTotalSessions + 1)
            : activity.score;
      }
      break;
    }
    case 'resume': {
      updateData.totalResumeChecks = stats.totalResumeChecks + 1;
      if (activity.score != null) {
        updateData.bestResumeScore = Math.max(stats.bestResumeScore, activity.score);
      }
      break;
    }
    case 'portfolio': {
      updateData.portfolioTotalReviews = stats.portfolioTotalReviews + 1;
      if (activity.score != null) {
        updateData.portfolioBestScore = Math.max(stats.portfolioBestScore, activity.score);
      }
      break;
    }
  }

  await prisma.userStats.update({
    where: { userId },
    data: updateData,
  });
}
