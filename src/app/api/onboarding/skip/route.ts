import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cache, cacheKeys } from '@/lib/cache'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
      },
    })

    // Invalidate onboarding cache after skip
    await cache.del(cacheKeys.onboardingStatus(session.user.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Onboarding skip error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
