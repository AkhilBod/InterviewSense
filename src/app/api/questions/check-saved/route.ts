import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Check if a question is already saved by the user
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
    const questionId = searchParams.get('questionId')

    if (!questionId) {
      return NextResponse.json(
        { error: 'Missing questionId parameter' },
        { status: 400 }
      )
    }

    const savedQuestion = await prisma.savedQuestion.findUnique({
      where: {
        userId_questionId: {
          userId: user.id,
          questionId,
        },
      },
    })

    return NextResponse.json({
      isSaved: !!savedQuestion,
      question: savedQuestion || null,
    })
  } catch (error) {
    console.error('Error checking saved question:', error)
    return NextResponse.json(
      { error: 'Failed to check question status' },
      { status: 500 }
    )
  }
}
