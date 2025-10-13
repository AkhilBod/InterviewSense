import { PrismaClient } from '@prisma/client'
import { UserStatsData, StatsUpdate, RecentSession, WeeklyGoalStatus, StreakData, ScoreInsights, QuickStats } from '@/types/stats'

const prisma = new PrismaClient()

export class StatsManager {
  // Initialize stats for a new user
  static async initializeUserStats(userId: string): Promise<UserStatsData> {
    const userStats = await prisma.userStats.create({
      data: {
        userId,
        dailyStreak: 0,
        longestStreak: 0,
        weeklyGoal: 3,
        weeklyProgress: 0,
        weeklyGoalsMet: 0,
        bestInterviewScore: 0,
        bestResumeScore: 0,
        bestTechnicalScore: 0,
        bestBehavioralScore: 0,
        totalSessions: 0,
        totalInterviews: 0,
        totalResumeChecks: 0,
        totalTimeMinutes: 0,
        lastScore: 0,
        averageScore: 0,
        recentSessions: [],
        scoreImprovement: 0,
        streakImprovement: 0,
      }
    })
    return userStats as UserStatsData
  }

  // Get user stats with computed insights
  static async getUserStats(userId: string): Promise<UserStatsData | null> {
    let userStats = await prisma.userStats.findUnique({
      where: { userId }
    })

    // Initialize if doesn't exist
    if (!userStats) {
      userStats = await this.initializeUserStats(userId)
    }

    return userStats as UserStatsData
  }

  // Update stats after a practice session
  static async updateStatsAfterSession(
    userId: string, 
    sessionData: StatsUpdate
  ): Promise<UserStatsData> {
    const userStats = await this.getUserStats(userId)
    if (!userStats) throw new Error('User stats not found')

    // Calculate new values
    const newTotalSessions = userStats.totalSessions + 1
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    // Update streak logic
    const lastActivityDate = userStats.lastActivityDate
    let newDailyStreak = userStats.dailyStreak
    let streakImprovement = 0
    
    if (lastActivityDate) {
      const lastActivityDay = new Date(lastActivityDate.getFullYear(), lastActivityDate.getMonth(), lastActivityDate.getDate())
      const daysDiff = Math.floor((today.getTime() - lastActivityDay.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === 0) {
        // Same day, no streak change
      } else if (daysDiff === 1) {
        // Consecutive day, increment streak
        newDailyStreak += 1
        streakImprovement = 1
      } else {
        // Streak broken, reset to 1
        newDailyStreak = 1
        streakImprovement = 1 - userStats.dailyStreak
      }
    } else {
      // First activity
      newDailyStreak = 1
      streakImprovement = 1
    }

    // Update best scores based on session type
    const bestScores = {
      bestInterviewScore: userStats.bestInterviewScore,
      bestResumeScore: userStats.bestResumeScore,
      bestTechnicalScore: userStats.bestTechnicalScore,
      bestBehavioralScore: userStats.bestBehavioralScore,
    }

    if (sessionData.score) {
      switch (sessionData.sessionType) {
        case 'behavioral':
          bestScores.bestBehavioralScore = Math.max(bestScores.bestBehavioralScore, sessionData.score)
          bestScores.bestInterviewScore = Math.max(bestScores.bestInterviewScore, sessionData.score)
          break
        case 'technical':
          bestScores.bestTechnicalScore = Math.max(bestScores.bestTechnicalScore, sessionData.score)
          bestScores.bestInterviewScore = Math.max(bestScores.bestInterviewScore, sessionData.score)
          break
        case 'resume':
          bestScores.bestResumeScore = Math.max(bestScores.bestResumeScore, sessionData.score)
          break
        case 'system-design':
          bestScores.bestTechnicalScore = Math.max(bestScores.bestTechnicalScore, sessionData.score)
          break
      }
    }

    // Update recent sessions (keep last 10)
    const recentSessions = Array.isArray(userStats.recentSessions) 
      ? userStats.recentSessions as RecentSession[] 
      : []
    
    const newSession: RecentSession = {
      type: sessionData.sessionType,
      score: sessionData.score || null,
      duration: sessionData.duration || null,
      date: now.toISOString(),
      improvements: sessionData.improvements
    }
    
    const updatedRecentSessions = [newSession, ...recentSessions].slice(0, 10)

    // Calculate new average score
    const sessionsWithScores = updatedRecentSessions.filter(s => s.score !== null)
    const newAverageScore = sessionsWithScores.length > 0
      ? sessionsWithScores.reduce((sum, s) => sum + (s.score || 0), 0) / sessionsWithScores.length
      : 0

    // Calculate score improvement
    const scoreImprovement = sessionData.score 
      ? sessionData.score - userStats.lastScore 
      : 0

    // Update weekly progress
    const currentWeekStart = this.getWeekStart(now)
    const lastWeekResetDate = new Date(userStats.lastWeekReset)
    let weeklyProgress = userStats.weeklyProgress
    let weeklyGoalsMet = userStats.weeklyGoalsMet
    let newLastWeekReset = userStats.lastWeekReset

    if (currentWeekStart > lastWeekResetDate) {
      // New week
      if (weeklyProgress >= userStats.weeklyGoal) {
        weeklyGoalsMet += 1
      }
      weeklyProgress = 1
      newLastWeekReset = currentWeekStart
    } else {
      weeklyProgress += 1
    }

    // Update session type counters
    const totalInterviews = ['behavioral', 'technical', 'system-design'].includes(sessionData.sessionType)
      ? userStats.totalInterviews + 1
      : userStats.totalInterviews
    
    const totalResumeChecks = sessionData.sessionType === 'resume'
      ? userStats.totalResumeChecks + 1
      : userStats.totalResumeChecks

    // Calculate insights
    const { strongestArea, improvementArea } = this.calculateInsights(bestScores, updatedRecentSessions)

    // Save to database
    const updatedStats = await prisma.userStats.update({
      where: { userId },
      data: {
        dailyStreak: newDailyStreak,
        longestStreak: Math.max(userStats.longestStreak, newDailyStreak),
        lastActivityDate: now,
        weeklyProgress,
        weeklyGoalsMet,
        lastWeekReset: newLastWeekReset,
        ...bestScores,
        totalSessions: newTotalSessions,
        totalInterviews,
        totalResumeChecks,
        totalTimeMinutes: userStats.totalTimeMinutes + (sessionData.duration || 0),
        lastScore: sessionData.score || userStats.lastScore,
        averageScore: newAverageScore,
        recentSessions: updatedRecentSessions,
        scoreImprovement,
        streakImprovement,
        strongestArea,
        improvementArea,
      }
    })

    // Also create a practice session record
    await prisma.practiceSession.create({
      data: {
        userId,
        type: sessionData.sessionType,
        score: sessionData.score,
        duration: sessionData.duration,
        completed: sessionData.completed ?? true,
        improvements: sessionData.improvements || null,
      }
    })

    return updatedStats as UserStatsData
  }

  // Get formatted streak data
  static getStreakData(userStats: UserStatsData): StreakData {
    const now = new Date()
    const lastActivity = userStats.lastActivityDate
    
    let daysSinceLastActivity = 0
    let isActive = false
    
    if (lastActivity) {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const lastActivityDay = new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate())
      daysSinceLastActivity = Math.floor((today.getTime() - lastActivityDay.getTime()) / (1000 * 60 * 60 * 24))
      isActive = daysSinceLastActivity <= 1
    }

    return {
      current: userStats.dailyStreak,
      longest: userStats.longestStreak,
      lastActivity,
      daysSinceLastActivity,
      isActive
    }
  }

  // Get weekly goal status
  static getWeeklyGoalStatus(userStats: UserStatsData): WeeklyGoalStatus {
    const now = new Date()
    const currentWeekStart = this.getWeekStart(now)
    const weekEnd = new Date(currentWeekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    
    const daysRemaining = Math.max(0, Math.ceil((weekEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    
    return {
      current: userStats.weeklyProgress,
      target: userStats.weeklyGoal,
      percentage: Math.min(100, (userStats.weeklyProgress / userStats.weeklyGoal) * 100),
      isAchieved: userStats.weeklyProgress >= userStats.weeklyGoal,
      daysRemaining
    }
  }

  // Get quick stats with formatted time
  static getQuickStats(userStats: UserStatsData): QuickStats {
    const totalMinutes = userStats.totalTimeMinutes
    const averageSessionTime = userStats.totalSessions > 0 
      ? totalMinutes / userStats.totalSessions 
      : 0

    return {
      totalSessions: userStats.totalSessions,
      totalTime: this.formatTime(totalMinutes),
      averageSessionTime: this.formatTime(averageSessionTime),
      completionRate: 100 // Assuming all sessions are completed for now
    }
  }

  // Helper: Get start of current week (Monday)
  private static getWeekStart(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    return new Date(d.setDate(diff))
  }

  // Helper: Format time in minutes to readable format
  private static formatTime(minutes: number): string {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = Math.round(minutes % 60)
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  // Helper: Calculate strongest and improvement areas
  private static calculateInsights(
    bestScores: any, 
    recentSessions: RecentSession[]
  ): { strongestArea: string | null, improvementArea: string | null } {
    // Find strongest area based on best scores
    const scores = {
      behavioral: bestScores.bestBehavioralScore,
      technical: bestScores.bestTechnicalScore,
      resume: bestScores.bestResumeScore
    }

    const strongestArea = Object.entries(scores)
      .filter(([_, score]) => score > 0)
      .sort(([_, a], [__, b]) => b - a)[0]?.[0] || null

    // Find improvement area based on recent low scores
    const recentScoresByType = recentSessions
      .filter(s => s.score !== null)
      .reduce((acc, session) => {
        if (!acc[session.type]) acc[session.type] = []
        acc[session.type].push(session.score!)
        return acc
      }, {} as Record<string, number[]>)

    const averagesByType = Object.entries(recentScoresByType)
      .map(([type, scores]) => ({
        type,
        average: scores.reduce((sum, score) => sum + score, 0) / scores.length
      }))
      .sort((a, b) => a.average - b.average)

    const improvementArea = averagesByType[0]?.type || null

    return { strongestArea, improvementArea }
  }

  // Update weekly goal
  static async updateWeeklyGoal(userId: string, newGoal: number): Promise<UserStatsData> {
    const updatedStats = await prisma.userStats.update({
      where: { userId },
      data: { weeklyGoal: newGoal }
    })
    return updatedStats as UserStatsData
  }
} 