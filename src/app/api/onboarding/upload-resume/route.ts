import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { resolveUser } from '@/lib/resolve-user'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id && !session?.user?.email) {
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

    // Resolve user — JWT id may be stale after DB reset, fall back to email
    const user = await resolveUser(session.user)
    if (!user) {
      return NextResponse.json({ error: 'User not found. Please log out and log back in.' }, { status: 404 })
    }

    const ext = resume.name.split('.').pop()?.toLowerCase() || 'pdf'
    const filename = `${user.id}-onboarding-resume.${ext}`
    let url = ''

    // Try Vercel Blob first (production), fall back to local filesystem (dev)
    try {
      const { put } = await import('@vercel/blob')
      const blob = await put(`resumes/${filename}`, resume, {
        access: 'public',
        allowOverwrite: true,
      })
      url = blob.url
    } catch (blobError) {
      console.warn('Vercel Blob upload failed, falling back to local storage:', blobError)
      // Local filesystem fallback for development
      const uploadsDir = path.join(process.cwd(), 'uploads', 'resumes')
      await mkdir(uploadsDir, { recursive: true })
      const bytes = await resume.arrayBuffer()
      const filePath = path.join(uploadsDir, filename)
      await writeFile(filePath, Buffer.from(bytes))
      url = `/uploads/resumes/${filename}`
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resumeUrl: url,
        resumeFilename: resume.name,
        resumeUploadedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, url, filename: resume.name })
  } catch (error) {
    console.error('Resume upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
