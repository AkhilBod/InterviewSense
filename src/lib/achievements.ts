import { prisma } from './prisma';

export class AchievementService {
  // Initialize retention-focused achievements
  static async initializeAchievements() {
    const achievements = [
      // Quick wins for new users
      {
        name: "Welcome Aboard!",
        description: "Complete your first interview practice",
        icon: "🎯",
        category: "interview",
        requirement: { totalInterviews: 1 },
        xpReward: 100,
        rarity: "common",
      },
      {
        name: "Resume Ready",
        description: "Analyze your first resume",
        icon: "📄",
        category: "resume",
        requirement: { resumeChecks: 1 },
        xpReward: 50,
        rarity: "common",
      },

      // Daily engagement rewards
      {
        name: "Daily Habit",
        description: "Practice for 3 consecutive days",
        icon: "🔥",
        category: "streak",
        requirement: { currentStreak: 3 },
        xpReward: 200,
        rarity: "common",
      },
      {
        name: "Week Warrior",
        description: "Practice for 7 consecutive days",
        icon: "💪",
        category: "streak",
        requirement: { currentStreak: 7 },
        xpReward: 500,
        rarity: "rare",
      },
      {
        name: "Consistency Champion",
        description: "Practice for 30 consecutive days",
        icon: "👑",
        category: "streak",
        requirement: { currentStreak: 30 },
        xpReward: 1500,
        rarity: "epic",
      },
      {
        name: "Unstoppable Force",
        description: "Practice for 100 consecutive days",
        icon: "⚡",
        category: "streak",
        requirement: { currentStreak: 100 },
        xpReward: 5000,
        rarity: "legendary",
      },

      // Interview volume milestones
      {
        name: "Getting Started",
        description: "Complete 5 interview practices",
        icon: "🚀",
        category: "interview",
        requirement: { totalInterviews: 5 },
        xpReward: 250,
        rarity: "common",
      },
      {
        name: "Interview Rookie",
        description: "Complete 10 interview practices",
        icon: "🎪",
        category: "interview",
        requirement: { totalInterviews: 10 },
        xpReward: 400,
        rarity: "common",
      },
      {
        name: "Practice Pro",
        description: "Complete 25 interview practices",
        icon: "🏆",
        category: "interview",
        requirement: { totalInterviews: 25 },
        xpReward: 750,
        rarity: "rare",
      },
      {
        name: "Interview Veteran",
        description: "Complete 50 interview practices",
        icon: "🎖️",
        category: "interview",
        requirement: { totalInterviews: 50 },
        xpReward: 1200,
        rarity: "epic",
      },
      {
        name: "Master Interviewer",
        description: "Complete 100 interview practices",
        icon: "👨‍🎓",
        category: "interview",
        requirement: { totalInterviews: 100 },
        xpReward: 2500,
        rarity: "legendary",
      },

      // Skill-specific achievements
      {
        name: "Behavioral Expert",
        description: "Complete 10 behavioral interviews",
        icon: "🗣️",
        category: "interview",
        requirement: { behavioralInterviews: 10 },
        xpReward: 400,
        rarity: "rare",
      },
      {
        name: "Technical Wizard",
        description: "Complete 10 technical interviews",
        icon: "💻",
        category: "interview",
        requirement: { technicalInterviews: 10 },
        xpReward: 400,
        rarity: "rare",
      },

      // Performance achievements
      {
        name: "Rising Star",
        description: "Score above 75 in any interview",
        icon: "⭐",
        category: "score",
        requirement: { bestScore: 75 },
        xpReward: 300,
        rarity: "common",
      },
      {
        name: "High Achiever",
        description: "Score above 85 in any interview",
        icon: "🌟",
        category: "score",
        requirement: { bestScore: 85 },
        xpReward: 600,
        rarity: "rare",
      },
      {
        name: "Excellence Embodied",
        description: "Score above 95 in any interview",
        icon: "💎",
        category: "score",
        requirement: { bestScore: 95 },
        xpReward: 1000,
        rarity: "epic",
      },
      {
        name: "Perfect Performance",
        description: "Achieve a perfect 100 score",
        icon: "🏅",
        category: "score",
        requirement: { bestScore: 100 },
        xpReward: 2000,
        rarity: "legendary",
      },

      // Speech improvement - key differentiator
      {
        name: "Clear Speaker",
        description: "Complete interview with 5 or fewer filler words",
        icon: "🎤",
        category: "speech",
        requirement: { bestFillerWordCount: 5 },
        xpReward: 200,
        rarity: "common",
      },
      {
        name: "Smooth Talker",
        description: "Complete interview with 2 or fewer filler words",
        icon: "🎭",
        category: "speech",
        requirement: { bestFillerWordCount: 2 },
        xpReward: 400,
        rarity: "rare",
      },
      {
        name: "Eloquent Orator",
        description: "Complete interview with zero filler words",
        icon: "🎯",
        category: "speech",
        requirement: { bestFillerWordCount: 0 },
        xpReward: 800,
        rarity: "epic",
      },

      // Resume achievements
      {
        name: "Resume Reviewer",
        description: "Analyze 5 different resumes",
        icon: "📋",
        category: "resume",
        requirement: { resumeChecks: 5 },
        xpReward: 200,
        rarity: "common",
      },
      {
        name: "Document Doctor",
        description: "Analyze 15 different resumes",
        icon: "📊",
        category: "resume",
        requirement: { resumeChecks: 15 },
        xpReward: 500,
        rarity: "rare",
      },

      // Long-term engagement
      {
        name: "Dedicated Learner",
        description: "Practice on 30 different days",
        icon: "📚",
        category: "milestone",
        requirement: { totalActiveDays: 30 },
        xpReward: 800,
        rarity: "rare",
      },
      {
        name: "Lifelong Student",
        description: "Practice on 100 different days",
        icon: "🎓",
        category: "milestone",
        requirement: { totalActiveDays: 100 },
        xpReward: 2000,
        rarity: "epic",
      },

      // XP milestones
      {
        name: "XP Collector",
        description: "Earn 5,000 total XP",
        icon: "💰",
        category: "milestone",
        requirement: { totalXP: 5000 },
        xpReward: 500,
        rarity: "rare",
      },
      {
        name: "Point Master",
        description: "Earn 15,000 total XP",
        icon: "💸",
        category: "milestone",
        requirement: { totalXP: 15000 },
        xpReward: 1000,
        rarity: "epic",
      },
    ];

    for (const achievement of achievements) {
      await prisma.achievement.upsert({
        where: { name: achievement.name },
        update: achievement,
        create: achievement,
      });
    }

    console.log(`Initialized ${achievements.length} retention-focused achievements`);
  }

  // Get user achievements with progress indicators
  static async getUserAchievements(userId: string) {
    const userProgress = await prisma.userProgress.findUnique({
      where: { userId },
    });

    const allAchievements = await prisma.achievement.findMany({
      where: { isActive: true },
      orderBy: [
        { rarity: 'asc' },
        { xpReward: 'asc' }
      ],
    });

    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
    });

    const unlockedMap = new Map(
      userAchievements.map(ua => [ua.achievementId, ua])
    );

    const achievementsWithProgress = allAchievements.map(achievement => {
      const unlocked = unlockedMap.get(achievement.id);
      const requirement = achievement.requirement as any;
      
      let progress = 0;
      let progressText = '';
      
      if (!unlocked && userProgress) {
        // Calculate progress towards achievement
        const reqKey = Object.keys(requirement)[0];
        const reqValue = requirement[reqKey];
        const currentValue = userProgress[reqKey as keyof typeof userProgress] || 0;
        
        progress = Math.min(100, (Number(currentValue) / reqValue) * 100);
        progressText = `${currentValue}/${reqValue}`;
      }

      return {
        ...achievement,
        unlocked: !!unlocked,
        unlockedAt: unlocked?.unlockedAt,
        isNew: unlocked?.isNew || false,
        progress,
        progressText,
      };
    });

    // Group by rarity for better UX
    const grouped = {
      legendary: achievementsWithProgress.filter(a => a.rarity === 'legendary'),
      epic: achievementsWithProgress.filter(a => a.rarity === 'epic'),
      rare: achievementsWithProgress.filter(a => a.rarity === 'rare'),
      common: achievementsWithProgress.filter(a => a.rarity === 'common'),
    };

    const stats = {
      total: allAchievements.length,
      unlocked: userAchievements.length,
      percentage: Math.round((userAchievements.length / allAchievements.length) * 100),
      newCount: userAchievements.filter(ua => ua.isNew).length,
    };

    return { achievements: grouped, stats };
  }

  // Get next recommended achievements for user engagement
  static async getRecommendedAchievements(userId: string, limit = 3) {
    const userProgress = await prisma.userProgress.findUnique({
      where: { userId },
    });

    if (!userProgress) return [];

    const userAchievementIds = await prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    });

    const unlockedIds = userAchievementIds.map(ua => ua.achievementId);

    const availableAchievements = await prisma.achievement.findMany({
      where: {
        isActive: true,
        id: { notIn: unlockedIds },
      },
    });

    // Score achievements by how close user is to unlocking them
    const scoredAchievements = availableAchievements.map(achievement => {
      const requirement = achievement.requirement as any;
      const reqKey = Object.keys(requirement)[0];
      const reqValue = requirement[reqKey];
      const currentValue = userProgress[reqKey as keyof typeof userProgress] || 0;
      
      const progress = Math.min(100, (Number(currentValue) / reqValue) * 100);
      
      return {
        ...achievement,
        progress,
        progressText: `${currentValue}/${reqValue}`,
        score: progress + (achievement.rarity === 'common' ? 20 : 0), // Prioritize easier achievements
      };
    });

    // Sort by score (closest to completion) and return top recommendations
    return scoredAchievements
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}
