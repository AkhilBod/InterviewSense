import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(req: Request) {
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

    // Delete the saved question
    const deleted = await prisma.savedQuestion.deleteMany({
      where: {
        userId: user.id,
        questionId,
      },
    })

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: 'Question not found in your bank' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Question removed from your bank',
    })
  } catch (error) {
    console.error('Error removing question:', error)
    return NextResponse.json(
      { error: 'Failed to remove question' },
      { status: 500 }
    )
  }
}
