'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Brain, Code, Loader2, Trash2, BookOpen } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface SavedQuestion {
  id: string
  questionId: string
  questionText: string
  type: 'BEHAVIORAL' | 'TECHNICAL'
  company?: string
  difficulty?: string
  category?: string
  practiced: boolean
  completed: boolean
  createdAt: string
}

export default function SavedQuestionsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [questions, setQuestions] = useState<SavedQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'BEHAVIORAL' | 'TECHNICAL'>('ALL')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchSavedQuestions()
  }, [filter])

  const fetchSavedQuestions = async () => {
    setIsLoading(true)
    try {
      const typeParam = filter !== 'ALL' ? `?type=${filter}` : ''
      const response = await fetch(`/api/questions/saved${typeParam}`)

      if (response.ok) {
        const data = await response.json()
        setQuestions(data.questions)
      } else {
        throw new Error('Failed to fetch saved questions')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load saved questions',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (questionId: string) => {
    if (!confirm('Remove this question from your saved list?')) return

    setDeletingId(questionId)
    try {
      const response = await fetch(`/api/questions/remove?questionId=${questionId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setQuestions((prev) => prev.filter((q) => q.questionId !== questionId))
        toast({
          title: 'Question removed',
          description: 'Removed from your saved questions',
        })
      } else {
        throw new Error('Failed to remove question')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove question',
        variant: 'destructive',
      })
    } finally {
      setDeletingId(null)
    }
  }

  const filteredQuestions =
    filter === 'ALL' ? questions : questions.filter((q) => q.type === filter)

  const stats = {
    total: questions.length,
    behavioral: questions.filter((q) => q.type === 'BEHAVIORAL').length,
    technical: questions.filter((q) => q.type === 'TECHNICAL').length,
    practiced: questions.filter((q) => q.practiced).length,
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="text-slate-400 hover:text-white mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">My Saved Questions</h1>
              <p className="text-slate-400">{stats.total} questions in your bank</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <p className="text-sm text-slate-400">Total</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <p className="text-sm text-slate-400">Behavioral</p>
                <p className="text-2xl font-bold text-purple-400">{stats.behavioral}</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <p className="text-sm text-slate-400">Technical</p>
                <p className="text-2xl font-bold text-green-400">{stats.technical}</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <p className="text-sm text-slate-400">Practiced</p>
                <p className="text-2xl font-bold text-blue-400">{stats.practiced}</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Button
              variant={filter === 'ALL' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('ALL')}
              className={filter === 'ALL' ? 'bg-blue-600' : ''}
            >
              All ({stats.total})
            </Button>
            <Button
              variant={filter === 'BEHAVIORAL' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('BEHAVIORAL')}
              className={filter === 'BEHAVIORAL' ? 'bg-blue-600' : ''}
            >
              <Brain className="h-4 w-4 mr-2" />
              Behavioral ({stats.behavioral})
            </Button>
            <Button
              variant={filter === 'TECHNICAL' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('TECHNICAL')}
              className={filter === 'TECHNICAL' ? 'bg-blue-600' : ''}
            >
              <Code className="h-4 w-4 mr-2" />
              Technical ({stats.technical})
            </Button>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No saved questions yet</h3>
            <p className="text-slate-400 mb-6">
              Start saving questions from our curated list
            </p>
            <Button onClick={() => router.push('/questions')} className="bg-blue-600">
              Browse Questions
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredQuestions.map((question) => (
              <Card
                key={question.id}
                className="bg-slate-800 border-slate-700 hover:border-blue-500 transition-all"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        {question.type === 'BEHAVIORAL' ? (
                          <Brain className="h-4 w-4 text-purple-400" />
                        ) : (
                          <Code className="h-4 w-4 text-green-400" />
                        )}
                        <Badge
                          variant="outline"
                          className={
                            question.type === 'BEHAVIORAL'
                              ? 'border-purple-500/50 text-purple-400'
                              : 'border-green-500/50 text-green-400'
                          }
                        >
                          {question.type}
                        </Badge>
                        {question.difficulty && (
                          <Badge variant="outline" className="text-slate-400">
                            {question.difficulty}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg text-white leading-relaxed">
                        {question.questionText}
                      </CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(question.questionId)}
                      disabled={deletingId === question.questionId}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      {deletingId === question.questionId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {question.category && (
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Category</p>
                        <Badge variant="secondary" className="bg-slate-700">
                          {question.category}
                        </Badge>
                      </div>
                    )}

                    {question.company && (
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Companies</p>
                        <p className="text-sm text-slate-300">{question.company}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          if (question.type === 'BEHAVIORAL') {
                            router.push('/interview/behavioral')
                          } else {
                            router.push('/interview')
                          }
                        }}
                      >
                        Practice Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
