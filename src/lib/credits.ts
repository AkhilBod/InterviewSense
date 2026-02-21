import { prisma } from './prisma'
import { FeatureType, SubscriptionPlan } from '@prisma/client'

// Credit costs per feature
export const CREDIT_COSTS = {
  COVER_LETTER: 1,
  RESUME_REVIEW: 1,
  RESUME_ANALYSIS: 1,
  TECHNICAL_INTERVIEW: 10, // per question
  BEHAVIORAL_PRACTICE: 0.25, // per question
  SYSTEM_DESIGN: 5,
  PORTFOLIO_REVIEW: 2,
  CAREER_ROADMAP: 3,
} as const

// Daily credit limits by plan
export const DAILY_CREDIT_LIMITS = {
  FREE: 15,
  MONTHLY: 50,
  ANNUAL: 65,
} as const

/**
 * Get credit cost for a feature
 */
export function getCreditCost(
  featureType: FeatureType,
  quantity: number = 1
): number {
  const baseCost = CREDIT_COSTS[featureType] || 0
  return baseCost * quantity
}

/**
 * Get daily credit limit based on subscription plan
 */
export function getDailyCreditLimit(plan: SubscriptionPlan): number {
  return DAILY_CREDIT_LIMITS[plan]
}

/**
 * Check if credits need to be reset (daily)
 */
export function shouldResetCredits(lastReset: Date): boolean {
  const now = new Date()
  const lastResetDate = new Date(lastReset)

  // Reset if it's a new day
  return (
    now.getDate() !== lastResetDate.getDate() ||
    now.getMonth() !== lastResetDate.getMonth() ||
    now.getFullYear() !== lastResetDate.getFullYear()
  )
}

/**
 * Reset user's daily credits
 */
export async function resetDailyCredits(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const plan = user.subscription?.plan || SubscriptionPlan.FREE
  const creditLimit = getDailyCreditLimit(plan)

  await prisma.user.update({
    where: { id: userId },
    data: {
      dailyCredits: creditLimit,
      dailyCreditLimit: creditLimit,
      lastCreditReset: new Date(),
    },
  })

  return { dailyCredits: creditLimit, dailyCreditLimit: creditLimit }
}

/**
 * Check and reset credits if needed
 */
export async function checkAndResetCredits(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      dailyCredits: true,
      dailyCreditLimit: true,
      lastCreditReset: true,
      subscription: {
        select: { plan: true },
      },
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Check if we need to reset credits
  if (shouldResetCredits(user.lastCreditReset)) {
    return await resetDailyCredits(userId)
  }

  return {
    dailyCredits: user.dailyCredits,
    dailyCreditLimit: user.dailyCreditLimit,
  }
}

/**
 * Check if user has enough credits
 */
export async function hasEnoughCredits(
  userId: string,
  featureType: FeatureType,
  quantity: number = 1
): Promise<{ hasCredits: boolean; available: number; required: number }> {
  // First check and reset if needed
  const { dailyCredits } = await checkAndResetCredits(userId)

  const required = getCreditCost(featureType, quantity)

  return {
    hasCredits: dailyCredits >= required,
    available: dailyCredits,
    required,
  }
}

/**
 * Deduct credits from user account
 */
export async function deductCredits(
  userId: string,
  featureType: FeatureType,
  quantity: number = 1,
  metadata?: Record<string, any>
): Promise<{ success: boolean; remainingCredits: number; error?: string }> {
  try {
    // Check if user has enough credits
    const check = await hasEnoughCredits(userId, featureType, quantity)

    if (!check.hasCredits) {
      return {
        success: false,
        remainingCredits: check.available,
        error: `Insufficient credits. You need ${check.required} credits but only have ${check.available} remaining today.`,
      }
    }

    // Deduct credits and log usage
    const creditsUsed = getCreditCost(featureType, quantity)

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        dailyCredits: {
          decrement: creditsUsed,
        },
        featureUsage: {
          create: {
            featureType,
            creditsUsed,
            success: true,
            metadata: metadata || {},
          },
        },
      },
      select: {
        dailyCredits: true,
      },
    })

    return {
      success: true,
      remainingCredits: user.dailyCredits,
    }
  } catch (error) {
    console.error('Error deducting credits:', error)
    return {
      success: false,
      remainingCredits: 0,
      error: 'Failed to deduct credits',
    }
  }
}

/**
 * Get user's credit status
 */
export async function getCreditStatus(userId: string) {
  const { dailyCredits, dailyCreditLimit } = await checkAndResetCredits(userId)

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: true,
      featureUsage: {
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)), // Today
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  return {
    dailyCredits,
    dailyCreditLimit,
    plan: user.subscription?.plan || SubscriptionPlan.FREE,
    usageToday: user.featureUsage,
    percentageUsed: Math.round(((dailyCreditLimit - dailyCredits) / dailyCreditLimit) * 100),
  }
}

/**
 * Refund credits (for failed operations)
 */
export async function refundCredits(
  userId: string,
  amount: number,
  reason?: string
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      dailyCredits: {
        increment: amount,
      },
    },
  })

  console.log(`Refunded ${amount} credits to user ${userId}. Reason: ${reason}`)
}
