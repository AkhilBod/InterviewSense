import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { resolveUser } from '@/lib/resolve-user'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ recentSessions: [] })
    }

    const user = await resolveUser(session.user)
    if (!user) {
      return NextResponse.json({ recentSessions: [] })
    }

    const sessions = await prisma.practiceSession.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        score: true,
        createdAt: true,
      },
    })

    const recentSessions = sessions.map(s => ({
      id: s.id,
      type: s.type,
      score: s.score ?? 0,
      completedAt: s.createdAt.toISOString(),
    }))

    return NextResponse.json({ recentSessions })
  } catch (error) {
    console.error('Error fetching recent interviews:', error)
    return NextResponse.json({ recentSessions: [] })
  }
}
