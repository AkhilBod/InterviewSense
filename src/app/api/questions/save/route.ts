import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { QuestionType } from '@prisma/client'

export async function POST(req: Request) {
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

    const body = await req.json()
    const { questionId, questionText, type, company, difficulty, category } = body

    if (!questionId || !questionText || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: questionId, questionText, type' },
        { status: 400 }
      )
    }

    // Check if question already saved
    const existing = await prisma.savedQuestion.findUnique({
      where: {
        userId_questionId: {
          userId: user.id,
          questionId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Question already saved', alreadySaved: true },
        { status: 409 }
      )
    }

    // Save question
    const savedQuestion = await prisma.savedQuestion.create({
      data: {
        userId: user.id,
        questionId,
        questionText,
        type: type as QuestionType,
        company,
        difficulty,
        category,
      },
    })

    return NextResponse.json({
      success: true,
      question: savedQuestion,
      message: 'Question saved to your bank!',
    })
  } catch (error) {
    console.error('Error saving question:', error)
    return NextResponse.json(
      { error: 'Failed to save question' },
      { status: 500 }
    )
  }
}
