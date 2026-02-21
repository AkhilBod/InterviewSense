import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') // Optional filter by type

    // Get user's saved questions
    const savedQuestions = await prisma.savedQuestion.findMany({
      where: {
        userId: user.id,
        ...(type && { type: type as any }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      questions: savedQuestions,
      total: savedQuestions.length,
    })
  } catch (error) {
    console.error('Error fetching saved questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch saved questions' },
      { status: 500 }
    )
  }
}
