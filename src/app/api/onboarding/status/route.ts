import { NextResponse, NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { resolveUser } from '@/lib/resolve-user'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await resolveUser(session.user)

    if (!user) {
      // Return sensible defaults instead of 404 so UI doesn't break
      return NextResponse.json({
        onboardingCompleted: false,
        resumeUrl: null,
        resumeFilename: null,
        targetRole: null,
        targetCompany: null,
        jobDescription: null,
        preferredCodingLanguage: null,
        onboardingCompletedAt: null,
      })
    }

    return NextResponse.json({
      onboardingCompleted: user.onboardingCompleted,
      resumeUrl: user.resumeUrl,
      resumeFilename: user.resumeFilename,
      targetRole: user.targetRole,
      targetCompany: user.targetCompany,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jobDescription: (user as any).jobDescription ?? null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      preferredCodingLanguage: (user as any).preferredCodingLanguage ?? null,
      onboardingCompletedAt: user.onboardingCompletedAt,
    })
  } catch (error) {
    console.error('Onboarding status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await resolveUser(session.user)
    if (!user) {
      return NextResponse.json({ error: 'User not found. Please log out and log back in.' }, { status: 404 })
    }

    const body = await req.json()
    const { targetRole, targetCompany, jobDescription, preferredCodingLanguage } = body

    const updateData: Record<string, unknown> = {}
    if (targetRole !== undefined) updateData.targetRole = targetRole
    if (targetCompany !== undefined) updateData.targetCompany = targetCompany
    if (jobDescription !== undefined) updateData.jobDescription = jobDescription
    if (preferredCodingLanguage !== undefined) updateData.preferredCodingLanguage = preferredCodingLanguage

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Onboarding status update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
