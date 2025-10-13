import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Fetch user stats
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get or create user stats
    let userStats = await prisma.userStats.findUnique({
      where: { userId }
    })

    if (!userStats) {
      // Initialize stats for new user
      userStats = await prisma.userStats.create({
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
    }

    // Calculate additional insights
    const now = new Date()
    const lastActivity = userStats.lastActivityDate
    
    let daysSinceLastActivity = 0
    let isStreakActive = false
    
    if (lastActivity) {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const lastActivityDay = new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate())
      daysSinceLastActivity = Math.floor((today.getTime() - lastActivityDay.getTime()) / (1000 * 60 * 60 * 24))
      isStreakActive = daysSinceLastActivity <= 1
    }

    // Weekly goal progress
    const currentWeekStart = getWeekStart(now)
    const weekEnd = new Date(currentWeekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    const daysRemainingInWeek = Math.max(0, Math.ceil((weekEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

    const response = {
      stats: userStats,
      insights: {
        streak: {
          current: userStats.dailyStreak,
          longest: userStats.longestStreak,
          isActive: isStreakActive,
          daysSinceLastActivity
        },
        weeklyGoal: {
          current: userStats.weeklyProgress,
          target: userStats.weeklyGoal,
          percentage: Math.min(100, (userStats.weeklyProgress / userStats.weeklyGoal) * 100),
          isAchieved: userStats.weeklyProgress >= userStats.weeklyGoal,
          daysRemaining: daysRemainingInWeek
        },
        quickStats: {
          totalSessions: userStats.totalSessions,
          totalTime: formatTime(userStats.totalTimeMinutes),
          averageSessionTime: userStats.totalSessions > 0 
            ? formatTime(userStats.totalTimeMinutes / userStats.totalSessions)
            : '0m',
          completionRate: 100
        }
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    )
  }
}

// POST - Update stats after a session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()
    const { sessionType, score, duration, completed = true, improvements } = body

    // Get current stats
    let userStats = await prisma.userStats.findUnique({
      where: { userId }
    })

    if (!userStats) {
      return NextResponse.json({ error: 'User stats not found' }, { status: 404 })
    }

    // Update calculations
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

    // Update best scores
    const updateData: any = {
      dailyStreak: newDailyStreak,
      longestStreak: Math.max(userStats.longestStreak, newDailyStreak),
      lastActivityDate: now,
      totalSessions: userStats.totalSessions + 1,
      totalTimeMinutes: userStats.totalTimeMinutes + (duration || 0),
      streakImprovement,
    }

    if (score) {
      updateData.lastScore = score
      updateData.scoreImprovement = score - userStats.lastScore

      // Update best scores based on session type
      switch (sessionType) {
        case 'behavioral':
          updateData.bestBehavioralScore = Math.max(userStats.bestBehavioralScore, score)
          updateData.bestInterviewScore = Math.max(userStats.bestInterviewScore, score)
          updateData.totalInterviews = userStats.totalInterviews + 1
          break
        case 'technical':
          updateData.bestTechnicalScore = Math.max(userStats.bestTechnicalScore, score)
          updateData.bestInterviewScore = Math.max(userStats.bestInterviewScore, score)
          updateData.totalInterviews = userStats.totalInterviews + 1
          break
        case 'resume':
          updateData.bestResumeScore = Math.max(userStats.bestResumeScore, score)
          updateData.totalResumeChecks = userStats.totalResumeChecks + 1
          break
        case 'system-design':
          updateData.bestTechnicalScore = Math.max(userStats.bestTechnicalScore, score)
          updateData.totalInterviews = userStats.totalInterviews + 1
          break
      }
    }

    // Update recent sessions (keep last 10)
    const recentSessions = Array.isArray(userStats.recentSessions) 
      ? userStats.recentSessions as any[] 
      : []
    
    const newSession = {
      type: sessionType,
      score: score || null,
      duration: duration || null,
      date: now.toISOString(),
      improvements: improvements || []
    }
    
    const updatedRecentSessions = [newSession, ...recentSessions].slice(0, 10)
    updateData.recentSessions = updatedRecentSessions

    // Calculate new average score
    const sessionsWithScores = updatedRecentSessions.filter((s: any) => s.score !== null)
    if (sessionsWithScores.length > 0) {
      updateData.averageScore = sessionsWithScores.reduce((sum: number, s: any) => sum + s.score, 0) / sessionsWithScores.length
    }

    // Update weekly progress
    const currentWeekStart = getWeekStart(now)
    const lastWeekReset = new Date(userStats.lastWeekReset)
    
    if (currentWeekStart > lastWeekReset) {
      // New week
      if (userStats.weeklyProgress >= userStats.weeklyGoal) {
        updateData.weeklyGoalsMet = userStats.weeklyGoalsMet + 1
      }
      updateData.weeklyProgress = 1
      updateData.lastWeekReset = currentWeekStart
    } else {
      updateData.weeklyProgress = userStats.weeklyProgress + 1
    }

    // Update user stats
    const updatedStats = await prisma.userStats.update({
      where: { userId },
      data: updateData
    })

    // Create practice session record
    await prisma.practiceSession.create({
      data: {
        userId,
        type: sessionType,
        score: score || null,
        duration: duration || null,
        completed,
        improvements: improvements || null,
      }
    })

    return NextResponse.json({ 
      success: true, 
      stats: updatedStats,
      message: 'Stats updated successfully'
    })

  } catch (error) {
    console.error('Error updating user stats:', error)
    return NextResponse.json(
      { error: 'Failed to update user stats' },
      { status: 500 }
    )
  }
}

// Helper functions
function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  return new Date(d.setDate(diff))
}

function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = Math.round(minutes % 60)
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
} 