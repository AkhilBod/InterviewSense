import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

interface LCProblem {
  frontendQuestionId: string
  title: string
  difficulty: string
  titleSlug: string
}

let _cache: LCProblem[] | null = null
function getProblems(): LCProblem[] {
  if (_cache) return _cache
  const filePath = path.join(process.cwd(), 'leetcode_problems.json')
  _cache = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  return _cache!
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title')
  if (!title) return NextResponse.json({ id: null })

  const normalized = title.toLowerCase().trim()
  const problems = getProblems()
  const match = problems.find(
    (p) => p.title.toLowerCase() === normalized || p.titleSlug === normalized.replace(/\s+/g, '-')
  )

  if (match) {
    return NextResponse.json({
      id: parseInt(match.frontendQuestionId),
      title: match.title,
      difficulty: match.difficulty,
    })
  }
  return NextResponse.json({ id: null })
}
