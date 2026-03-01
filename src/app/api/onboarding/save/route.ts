import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const resume = formData.get('resume') as File | null
    const targetRole = formData.get('targetRole') as string | null
    const targetCompany = formData.get('targetCompany') as string | null
    const jobDescription = formData.get('jobDescription') as string | null

    let resumeUrl: string | null = null
    let resumeFilename: string | null = null

    // Handle resume upload
    if (resume && resume.size > 0) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
      ]
      if (!allowedTypes.includes(resume.type)) {
        return NextResponse.json(
          { error: 'Invalid file type. Please upload a PDF or DOCX file.' },
          { status: 400 }
        )
      }

      // Validate file size (5MB max)
      if (resume.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File too large. Maximum size is 5MB.' },
          { status: 400 }
        )
      }

      // Ensure uploads directory exists
      const uploadsDir = join(process.cwd(), 'uploads', 'resumes')
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true })
      }

      // Create unique filename with user ID prefix (matches existing pattern)
      const ext = resume.name.split('.').pop()?.toLowerCase() || 'pdf'
      const safeFilename = `${session.user.id}-onboarding-resume.${ext}`
      const filepath = join(uploadsDir, safeFilename)

      // Write file
      const bytes = await resume.arrayBuffer()
      await writeFile(filepath, Buffer.from(bytes))

      resumeUrl = `/api/uploads/resumes/${safeFilename}`
      resumeFilename = resume.name
    }

    // Update user with onboarding data
    const updateData: Record<string, unknown> = {
      onboardingCompleted: true,
      onboardingCompletedAt: new Date(),
    }

    if (resumeUrl) updateData.resumeUrl = resumeUrl
    if (resumeFilename) updateData.resumeFilename = resumeFilename
    if (resumeUrl) updateData.resumeUploadedAt = new Date()
    if (targetRole) updateData.targetRole = targetRole
    if (targetCompany) updateData.targetCompany = targetCompany
    if (jobDescription) updateData.jobDescription = jobDescription

    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Onboarding save error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
