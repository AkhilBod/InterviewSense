import { prisma } from './prisma';

export class ProgressService {
  // Update progress after interview completion - key retention moment
  static async updateInterviewProgress(
    userId: string, 
    sessionData: {
      type: 'behavioral' | 'technical';
      score?: number;
      duration?: number;
      fillerWords?: number;
      metrics?: any;
    }
  ) {
    const progress = await this.getOrCreateProgress(userId);
    
    // Calculate score improvement for motivation
    const scoreImprovement = sessionData.score && progress.lastScore 
      ? sessionData.score - progress.lastScore 
      : 0;

    // Update interview counts
    const updateData: any = {
      totalInterviews: { increment: 1 },
      lastActivityDate: new Date(),
    };
    
    if (sessionData.type === 'behavioral') {
      updateData.behavioralInterviews = { increment: 1 };
    } else {
      updateData.technicalInterviews = { increment: 1 };
    }
    
    // Update scores with motivation focus
    if (sessionData.score) {
      const recentScores = (progress.recentScores as number[]) || [];
      recentScores.push(sessionData.score);
      if (recentScores.length > 10) recentScores.shift(); // Keep last 10
      
      updateData.recentScores = recentScores;
      updateData.averageScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
      updateData.bestScore = Math.max(progress.bestScore, sessionData.score);
      updateData.lastScore = sessionData.score;
      updateData.scoreImprovement = scoreImprovement;
    }
    
    // Update filler words - key speech improvement metric
    if (sessionData.fillerWords !== undefined) {
      updateData.totalFillerWords = { increment: sessionData.fillerWords };
      updateData.bestFillerWordCount = Math.min(progress.bestFillerWordCount, sessionData.fillerWords);
      
      // Calculate average filler words for recent sessions
      const recentSessions = await prisma.interviewSession.findMany({
        where: { userId },
        orderBy: { completedAt: 'desc' },
        take: 5,
        select: { fillerWords: true }
      });
      
      if (recentSessions.length > 0) {
        const avgFillerWords = recentSessions.reduce((sum, session) => sum + session.fillerWords, 0) / recentSessions.length;
        updateData.averageFillerWords = avgFillerWords;
      }
    }
    
    // Update streak - critical for retention
    await this.updateStreak(userId);
    
    // Add XP and check level - gamification
    const xpGained = this.calculateXP(sessionData, scoreImprovement);
    updateData.totalXP = { increment: xpGained };
    
    // Update weekly/monthly progress
    await this.updateGoalProgress(userId);
    
    const updatedProgress = await prisma.userProgress.update({
      where: { userId },
      data: updateData,
    });
    
    // Check for duplicate session creation (prevent duplicates within 30 seconds)
    const recentSession = await prisma.interviewSession.findFirst({
      where: {
        userId,
        type: sessionData.type,
        completedAt: {
          gte: new Date(Date.now() - 30000) // 30 seconds ago
        }
      },
      orderBy: { completedAt: 'desc' }
    });
    
    // Only create a new session if no recent duplicate exists
    if (!recentSession) {
      // Create detailed session record
      await prisma.interviewSession.create({
        data: {
          userId,
          type: sessionData.type,
          score: sessionData.score,
          duration: sessionData.duration,
          fillerWords: sessionData.fillerWords || 0,
          metrics: sessionData.metrics,
          scoreImprovement,
        },
      });
      console.log('✅ New interview session created');
    } else {
      console.log('⚠️ Duplicate session prevented - recent session exists');
    }

    // Record daily activity
    await this.recordDailyActivity(userId, 'interview', sessionData.duration || 0, xpGained);
    
    // Check for new achievements - key retention driver
    await this.checkAchievements(userId, updatedProgress);
    
    return {
      progress: updatedProgress,
      xpGained,
      scoreImprovement,
      achievements: await this.getNewAchievements(userId)
    };
  }
  
  // Update progress after resume analysis
  static async updateResumeProgress(
    userId: string, 
    analysisData: {
      score: number;
      improvementCount: number;
      wordCount: number;
      analysis: any;
      categories?: any;
    }
  ) {
    // Validate score to prevent undefined entries
    const validScore = typeof analysisData.score === 'number' && !isNaN(analysisData.score) 
      ? analysisData.score 
      : 0;
    
    // Double-check for recent duplicates before creating new analysis
    const recentAnalysis = await prisma.resumeAnalysis.findFirst({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 60000) // 1 minute ago - longer window
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    if (recentAnalysis) {
      console.log('⚠️ Duplicate resume analysis prevented in ProgressService');
      return {
        xpGained: 0,
        achievements: await this.getNewAchievements(userId)
      };
    }
    
    const progress = await this.getOrCreateProgress(userId);
    
    const xpGained = 50 + (analysisData.improvementCount * 10); // Bonus XP for improvements
    
    await prisma.userProgress.update({
      where: { userId },
      data: {
        resumeChecks: { increment: 1 },
        lastActivityDate: new Date(),
        totalXP: { increment: xpGained },
      },
    });
    
    // Create resume analysis record with validated score
    await prisma.resumeAnalysis.create({
      data: {
        userId,
        overallScore: validScore,
        improvementCount: analysisData.improvementCount || 0,
        wordCount: analysisData.wordCount || 0,
        analysis: analysisData.analysis,
        categories: analysisData.categories,
      },
    });

    // Record daily activity
    await this.recordDailyActivity(userId, 'resume', 10, xpGained); // Estimate 10 min for resume check
    
    await this.checkAchievements(userId);
    
    return {
      xpGained,
      achievements: await this.getNewAchievements(userId)
    };
  }

  // Critical retention mechanism - daily streaks
  private static async updateStreak(userId: string) {
    const progress = await prisma.userProgress.findUnique({
      where: { userId },
    });
    
    if (!progress) return;
    
    // Calculate streak based on consecutive days of activity in DailyActivity table
    const currentStreak = await this.calculateCurrentStreak(userId);
    
    // Only update if the streak has changed
    if (currentStreak !== progress.currentStreak) {
      await prisma.userProgress.update({
        where: { userId },
        data: {
          currentStreak,
          longestStreak: Math.max(currentStreak, progress.longestStreak),
        },
      });
    }
  }

  // Calculate current streak by counting consecutive days backwards from today
  private static async calculateCurrentStreak(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all daily activities for this user, ordered by date descending
    const activities = await prisma.dailyActivity.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      select: { date: true }
    });
    
    if (activities.length === 0) {
      return 0;
    }
    
    let streak = 0;
    let currentDate = new Date(today);
    
    // Count consecutive days backwards from today
    for (const activity of activities) {
      const activityDate = new Date(activity.date);
      activityDate.setHours(0, 0, 0, 0);
      
      // Check if this activity is on the current date we're checking
      if (activityDate.getTime() === currentDate.getTime()) {
        streak++;
        // Move to the previous day
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        // Gap found, streak is broken
        break;
      }
    }
    
    return streak;
  }

  // Gamification XP calculation
  private static calculateXP(sessionData: any, scoreImprovement: number): number {
    let xp = 100; // Base XP for completing interview
    
    // Score-based bonus
    if (sessionData.score) {
      xp += Math.floor(sessionData.score); // 1 XP per score point
    }
    
    // Improvement bonus - key for retention
    if (scoreImprovement > 0) {
      xp += Math.floor(scoreImprovement * 10); // 10 XP per point improvement
    }
    
    // Duration bonus for longer sessions
    if (sessionData.duration && sessionData.duration > 300) {
      xp += 50; // 5+ minute bonus
    }
    
    // Speech improvement bonus
    if (sessionData.fillerWords !== undefined && sessionData.fillerWords < 5) {
      xp += 25; // Clean speech bonus
    }
    
    return xp;
  }

  // Weekly/monthly goal tracking for engagement
  private static async updateGoalProgress(userId: string) {
    const progress = await prisma.userProgress.findUnique({
      where: { userId },
    });

    if (!progress) return;

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Start of week
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Reset weekly progress if needed
    if (progress.lastWeekReset < weekStart) {
      await prisma.userProgress.update({
        where: { userId },
        data: {
          weeklyProgress: 1,
          lastWeekReset: now,
        },
      });
    } else {
      await prisma.userProgress.update({
        where: { userId },
        data: {
          weeklyProgress: { increment: 1 },
        },
      });
    }

    // Reset monthly progress if needed
    if (progress.lastMonthReset < monthStart) {
      await prisma.userProgress.update({
        where: { userId },
        data: {
          monthlyProgress: 1,
          lastMonthReset: now,
        },
      });
    } else {
      await prisma.userProgress.update({
        where: { userId },
        data: {
          monthlyProgress: { increment: 1 },
        },
      });
    }
  }

  // Record daily activity for analytics
  private static async recordDailyActivity(userId: string, type: 'interview' | 'resume', timeMinutes: number, xpEarned: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activity = await prisma.dailyActivity.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        interviewCount: type === 'interview' ? { increment: 1 } : undefined,
        resumeChecks: type === 'resume' ? { increment: 1 } : undefined,
        timeSpentMinutes: { increment: timeMinutes },
        xpEarned: { increment: xpEarned },
      },
      create: {
        userId,
        date: today,
        interviewCount: type === 'interview' ? 1 : 0,
        resumeChecks: type === 'resume' ? 1 : 0,
        timeSpentMinutes: timeMinutes,
        xpEarned,
      },
    });

    return activity;
  }

  // Get user progress with retention metrics
  static async getProgress(userId: string) {
    const progress = await this.getOrCreateProgress(userId);
    
    // Calculate level from XP
    const level = Math.floor(progress.totalXP / 1000) + 1;
    const xpForNextLevel = level * 1000;
    const xpProgress = (progress.totalXP % 1000) / 1000 * 100;

    // Get recent performance trend
    const recentSessions = await prisma.interviewSession.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: 5,
      select: { score: true, scoreImprovement: true, completedAt: true }
    });

    // Calculate percentile rank
    const percentile = await this.calculatePercentileRank(userId);

    return {
      ...progress,
      level,
      xpForNextLevel,
      xpProgress,
      recentSessions,
      percentile,
      retentionMetrics: {
        streakMotivation: this.getStreakMotivation(progress.currentStreak),
        goalProgress: {
          weekly: Math.min(100, (progress.weeklyProgress / progress.weeklyGoal) * 100),
          monthly: Math.min(100, (progress.monthlyProgress / progress.monthlyGoal) * 100),
        },
        nextMilestone: this.getNextMilestone(progress),
      }
    };
  }

  // Achievement checking - key retention driver
  private static async checkAchievements(userId: string, progress?: any) {
    if (!progress) {
      progress = await prisma.userProgress.findUnique({
        where: { userId },
      });
    }

    const achievements = await prisma.achievement.findMany({
      where: { isActive: true },
    });

    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    });

    const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));

    for (const achievement of achievements) {
      if (unlockedIds.has(achievement.id)) continue;

      const requirement = achievement.requirement as any;
      let isUnlocked = false;

      switch (achievement.category) {
        case 'interview':
          isUnlocked = this.checkRequirement(progress, requirement);
          break;
        case 'streak':
          isUnlocked = this.checkRequirement(progress, requirement);
          break;
        case 'score':
          isUnlocked = this.checkRequirement(progress, requirement);
          break;
        case 'speech':
          isUnlocked = this.checkRequirement(progress, requirement);
          break;
        case 'milestone':
          isUnlocked = this.checkRequirement(progress, requirement);
          break;
      }

      if (isUnlocked) {
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
          },
        });

        // Award XP
        await prisma.userProgress.update({
          where: { userId },
          data: {
            totalXP: { increment: achievement.xpReward },
          },
        });
      }
    }
  }

  private static checkRequirement(progress: any, requirement: any): boolean {
    for (const [key, value] of Object.entries(requirement)) {
      if (progress[key] < value) {
        return false;
      }
    }
    return true;
  }

  // Get newly unlocked achievements
  private static async getNewAchievements(userId: string) {
    return await prisma.userAchievement.findMany({
      where: { userId, isNew: true },
      include: { achievement: true },
    });
  }

  // Mark achievements as seen
  static async markAchievementsAsSeen(userId: string) {
    await prisma.userAchievement.updateMany({
      where: { userId, isNew: true },
      data: { isNew: false },
    });
  }

  // Calculate percentile ranking
  private static async calculatePercentileRank(userId: string): Promise<number> {
    const userProgress = await prisma.userProgress.findUnique({
      where: { userId },
      select: { totalXP: true },
    });

    if (!userProgress) return 0;

    const totalUsers = await prisma.userProgress.count();
    const usersBelow = await prisma.userProgress.count({
      where: { totalXP: { lt: userProgress.totalXP } },
    });

    return Math.round((usersBelow / totalUsers) * 100);
  }

  // Retention motivational helpers
  private static getStreakMotivation(streak: number): string {
    if (streak === 0) return "Start your practice streak today! 🚀";
    if (streak === 1) return "Great start! Keep it going tomorrow! 💪";
    if (streak < 7) return `${streak} days strong! You're building a habit! 🔥`;
    if (streak < 30) return `Amazing ${streak}-day streak! You're on fire! 🔥🔥`;
    return `Incredible ${streak}-day streak! You're a master! 👑`;
  }

  private static getNextMilestone(progress: any): { type: string; target: number; current: number } {
    const milestones = [
      { type: 'interviews', target: 5, current: progress.totalInterviews },
      { type: 'interviews', target: 10, current: progress.totalInterviews },
      { type: 'interviews', target: 25, current: progress.totalInterviews },
      { type: 'interviews', target: 50, current: progress.totalInterviews },
      { type: 'streak', target: 7, current: progress.currentStreak },
      { type: 'streak', target: 30, current: progress.currentStreak },
      { type: 'score', target: 80, current: progress.bestScore },
      { type: 'score', target: 90, current: progress.bestScore },
    ];

    for (const milestone of milestones) {
      if (milestone.current < milestone.target) {
        return milestone;
      }
    }

    return { type: 'expert', target: 100, current: progress.totalInterviews };
  }

  private static async getOrCreateProgress(userId: string) {
    let progress = await prisma.userProgress.findUnique({
      where: { userId },
    });
    
    if (!progress) {
      progress = await prisma.userProgress.create({
        data: { userId },
      });
    }
    
    return progress;
  }
}
