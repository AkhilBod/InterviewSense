import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { put } from '@vercel/blob'

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
    if (resume.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    const ext = resume.name.split('.').pop()?.toLowerCase() || 'pdf'
    const filename = `resumes/${session.user.id}-onboarding-resume.${ext}`
    const blob = await put(filename, resume, { access: 'public', allowOverwrite: true })

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        resumeUrl: blob.url,
        resumeFilename: resume.name,
        resumeUploadedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, url: blob.url, filename: resume.name })
  } catch (error) {
    console.error('Resume upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
