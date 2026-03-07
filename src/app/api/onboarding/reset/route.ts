import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { resolveUser } from '@/lib/resolve-user'

/**
 * POST /api/onboarding/reset
 * Deletes all ActivityLog entries for the current user so the
 * onboarding dialogs re-trigger on every page. Also resets the
 * onboardingCompleted flag on the user record.
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await resolveUser(session.user)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete activity logs so isFirstTime checks return true again
    await (prisma as any).activityLog.deleteMany({
      where: { userId: user.id },
    })

    // Reset the onboarding flag on the user record
    await prisma.user.update({
      where: { id: user.id },
      data: {
        onboardingCompleted: false,
        onboardingCompletedAt: null,
      } as any,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Onboarding reset error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
