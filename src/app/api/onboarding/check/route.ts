import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { resolveUser } from '@/lib/resolve-user'

/**
 * GET /api/onboarding/check?type=system_design
 * Returns { isFirstTime: true/false } based on whether the user has
 * completed at least one ActivityLog of the given activityType.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ isFirstTime: false })
    }

    const user = await resolveUser(session.user)
    if (!user) {
      return NextResponse.json({ isFirstTime: false })
    }

    const type = request.nextUrl.searchParams.get('type')
    if (!type) {
      return NextResponse.json({ isFirstTime: false })
    }

    const count = await (prisma as any).activityLog.count({
      where: {
        userId: user.id,
        activityType: type,
      },
    })

    return NextResponse.json({ isFirstTime: count === 0 })
  } catch (error) {
    console.error('Onboarding check error:', error)
    return NextResponse.json({ isFirstTime: false })
  }
}
