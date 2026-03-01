import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        onboardingCompleted: true,
        resumeUrl: true,
        resumeFilename: true,
        targetRole: true,
        targetCompany: true,
        jobDescription: true,
        onboardingCompletedAt: true,
      } as Parameters<typeof prisma.user.findUnique>[0]['select'],
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      onboardingCompleted: user.onboardingCompleted,
      resumeUrl: user.resumeUrl,
      resumeFilename: user.resumeFilename,
      targetRole: user.targetRole,
      targetCompany: user.targetCompany,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jobDescription: (user as any).jobDescription ?? null,
      onboardingCompletedAt: user.onboardingCompletedAt,
    })
  } catch (error) {
    console.error('Onboarding status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
