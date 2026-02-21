'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bookmark, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface SavedQuestion {
  questionId: string
  questionText: string
  type: string
  difficulty?: string
  category?: string
  company?: string
}

export default function SavedQuestionsSection() {
  const [questions, setQuestions] = useState<SavedQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTrendingQuestions()
  }, [])

  const fetchTrendingQuestions = async () => {
    try {
      const response = await fetch('/api/questions/trending')
      if (response.ok) {
        const data = await response.json()
        setQuestions(data.questions || [])
      }
    } catch (error) {
      console.error('Error fetching trending questions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
      </div>
    )
  }

  if (questions.length === 0) {
    return null // Don't show section if no saved questions
  }

  return (
    <section className="py-16" style={{ background: '#0a0e1a' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Bookmark className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Trending Questions</h2>
              <p className="text-slate-400 text-sm mt-1">Most saved by our community</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {questions.map((question) => (
              <Card
                key={question.questionId}
                className="bg-slate-800/50 border-slate-700 hover:border-blue-500 transition-all"
              >
                <CardContent className="p-4">
                  <div className="mb-3">
                    <p className="text-sm text-slate-300 font-medium leading-relaxed line-clamp-3">
                      {question.questionText}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {question.type && (
                      <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400">
                        {question.type === 'BEHAVIORAL' ? 'Behavioral' : 'Technical'}
                      </span>
                    )}
                    {question.difficulty && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        question.difficulty === 'Hard'
                          ? 'bg-red-500/20 text-red-400'
                          : question.difficulty === 'Medium'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-green-500/20 text-green-400'
                      }`}>
                        {question.difficulty}
                      </span>
                    )}
                  </div>

                  <Button
                    asChild
                    size="sm"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Link href="/questions">
                      Practice
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Link href="/questions">
                View All Questions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
