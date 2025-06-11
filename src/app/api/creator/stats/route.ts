import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

export async function GET(req: NextRequest) {
  try {
    // Get the creator code from query parameters
    const { searchParams } = new URL(req.url)
    const creatorCode = searchParams.get('code')
    
    if (!creatorCode) {
      return NextResponse.json(
        { message: 'Creator code is required' },
        { status: 400 }
      )
    }

    // Get stats for the creator code
    const stats = await prisma.user.groupBy({
      by: ['creatorCode'],
      where: {
        creatorCode: {
          equals: creatorCode,
          mode: 'insensitive' // Case insensitive comparison
        }
      },
      _count: {
        id: true
      }
    })

    // Get detailed signups with dates for the creator code
    const signups = await prisma.user.findMany({
      where: {
        creatorCode: {
          equals: creatorCode,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        createdAt: true,
        emailVerified: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Group signups by date for analytics
    const signupsByDate = signups.reduce((acc, signup) => {
      const date = signup.createdAt.toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = { total: 0, verified: 0 }
      }
      acc[date].total++
      if (signup.emailVerified) {
        acc[date].verified++
      }
      return acc
    }, {} as Record<string, { total: number, verified: number }>)

    const totalSignups = stats[0]?._count?.id || 0
    const verifiedSignups = signups.filter(s => s.emailVerified).length

    return NextResponse.json({
      creatorCode,
      totalSignups,
      verifiedSignups,
      signupsByDate,
      recentSignups: signups.slice(0, 10).map(s => ({
        id: s.id,
        createdAt: s.createdAt,
        verified: !!s.emailVerified
      }))
    })
  } catch (error) {
    console.error('Creator stats error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch creator stats' },
      { status: 500 }
    )
  }
}
