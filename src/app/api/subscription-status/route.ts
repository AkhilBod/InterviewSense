import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SubscriptionStatus } from '@prisma/client'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscription: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has an active subscription
    const hasActiveSubscription = user.subscription && (
      user.subscription.status === SubscriptionStatus.ACTIVE ||
      user.subscription.status === SubscriptionStatus.TRIALING
    )

    // Check if trial is still valid
    let trialDaysRemaining = 0
    if (
      user.subscription?.status === SubscriptionStatus.TRIALING &&
      user.subscription.trialEnd
    ) {
      const now = new Date()
      const trialEnd = new Date(user.subscription.trialEnd)
      const diffTime = trialEnd.getTime() - now.getTime()
      trialDaysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
    }

    return NextResponse.json({
      hasActiveSubscription,
      subscription: user.subscription ? {
        plan: user.subscription.plan,
        status: user.subscription.status,
        trialDaysRemaining,
        currentPeriodEnd: user.subscription.currentPeriodEnd,
        cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
      } : null,
    })
  } catch (error) {
    console.error('Error checking subscription status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
