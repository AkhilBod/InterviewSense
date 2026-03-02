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

    if (!resume || resume.size === 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

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

    // Use the same filename pattern as onboarding/save so it overwrites the old file
    const ext = resume.name.split('.').pop()?.toLowerCase() || 'pdf'
    const safeFilename = `${session.user.id}-onboarding-resume.${ext}`
    const filepath = join(uploadsDir, safeFilename)

    const bytes = await resume.arrayBuffer()
    await writeFile(filepath, Buffer.from(bytes))

    const resumeUrl = `/api/uploads/resumes/${safeFilename}`
    const resumeFilename = resume.name

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        resumeUrl,
        resumeFilename,
        resumeUploadedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, url: resumeUrl, filename: resumeFilename })
  } catch (error) {
    console.error('Resume upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
