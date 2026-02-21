import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('Session:', session)
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        session: session,
        message: 'No session or email found'
      }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })
    
    console.log('User found:', user?.id)

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found',
        email: session.user.email
      }, { status: 404 })
    }

    // Get ALL saved questions for this user (no filters)
    const savedQuestions = await prisma.SavedQuestion.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    console.log('Found saved questions:', savedQuestions.length)
    console.log('First question:', savedQuestions[0])

    return NextResponse.json({
      success: true,
      userId: user.id,
      userEmail: session.user.email,
      count: savedQuestions.length,
      questions: savedQuestions,
    })
  } catch (error) {
    console.error('Error in debug endpoint:', error)
    return NextResponse.json(
      { error: 'Server error', details: String(error) },
      { status: 500 }
    )
  }
}
