// Types for the new retention stats system

export interface UserStatsData {
  id: string
  userId: string
  
  // Daily streak tracking
  dailyStreak: number
  longestStreak: number
  lastActivityDate: Date | null
  
  // Weekly goals
  weeklyGoal: number
  weeklyProgress: number
  weeklyGoalsMet: number
  lastWeekReset: Date
  
  // Best scores
  bestInterviewScore: number
  bestResumeScore: number
  bestTechnicalScore: number
  bestBehavioralScore: number
  
  // Quick stats
  totalSessions: number
  totalInterviews: number
  totalResumeChecks: number
  totalTimeMinutes: number
  
  // Recent performance
  lastScore: number
  averageScore: number
  recentSessions: RecentSession[]
  
  // Improvement tracking
  scoreImprovement: number
  streakImprovement: number
  
  // Quick insights
  strongestArea: string | null
  improvementArea: string | null
  
  createdAt: Date
  updatedAt: Date
}

export interface RecentSession {
  type: string
  score: number | null
  duration: number | null
  date: string
  improvements?: string[]
}

export interface PracticeSessionData {
  id: string
  userId: string
  type: 'behavioral' | 'technical' | 'resume' | 'system-design'
  score: number | null
  duration: number | null
  completed: boolean
  improvements: any
  createdAt: Date
}

export interface StatsUpdate {
  sessionType: string
  score?: number
  duration?: number
  completed?: boolean
  improvements?: string[]
}

export interface WeeklyGoalStatus {
  current: number
  target: number
  percentage: number
  isAchieved: boolean
  daysRemaining: number
}

export interface StreakData {
  current: number
  longest: number
  lastActivity: Date | null
  daysSinceLastActivity: number
  isActive: boolean
}

export interface ScoreInsights {
  bestScores: {
    interview: number
    resume: number
    technical: number
    behavioral: number
  }
  recentAverage: number
  improvement: number
  strongestArea: string | null
  improvementArea: string | null
}

export interface QuickStats {
  totalSessions: number
  totalTime: string // formatted time (e.g., "2h 30m")
  averageSessionTime: string
  completionRate: number
} 