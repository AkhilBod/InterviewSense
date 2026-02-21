'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import SaveQuestionButton from '@/components/SaveQuestionButton'
import { ArrowLeft, Brain, Code, Sparkles } from 'lucide-react'
import questions from '@/../../data/curated-questions.json'

export default function QuestionsPage() {
  const router = useRouter()
  const [filter, setFilter] = useState<'ALL' | 'BEHAVIORAL' | 'TECHNICAL'>('ALL')

  const filteredQuestions =
    filter === 'ALL'
      ? questions.questions
      : questions.questions.filter((q) => q.type === filter)

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Practice Questions</h1>
                <p className="text-slate-400">
                  {questions.questions.length} curated questions to ace your interviews
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Button
                variant={filter === 'ALL' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('ALL')}
                className={filter === 'ALL' ? 'bg-blue-600' : ''}
              >
                All ({questions.questions.length})
              </Button>
              <Button
                variant={filter === 'BEHAVIORAL' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('BEHAVIORAL')}
                className={filter === 'BEHAVIORAL' ? 'bg-blue-600' : ''}
              >
                <Brain className="h-4 w-4 mr-2" />
                Behavioral (
                {questions.questions.filter((q) => q.type === 'BEHAVIORAL').length})
              </Button>
              <Button
                variant={filter === 'TECHNICAL' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('TECHNICAL')}
                className={filter === 'TECHNICAL' ? 'bg-blue-600' : ''}
              >
                <Code className="h-4 w-4 mr-2" />
                Technical (
                {questions.questions.filter((q) => q.type === 'TECHNICAL').length})
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Questions Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          {filteredQuestions.map((question, index) => (
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
                      <Badge variant="outline" className="text-slate-400">
                        {question.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg text-white leading-relaxed">
                      {question.question}
                    </CardTitle>
                  </div>
                  <SaveQuestionButton
                    questionId={question.id}
                    questionText={question.question}
                    type={question.type}
                    company={question.companies?.join(', ')}
                    difficulty={question.difficulty}
                    category={question.category}
                    showText={false}
                  />
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Category */}
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Category</p>
                    <Badge variant="secondary" className="bg-slate-700">
                      {question.category}
                    </Badge>
                  </div>

                  {/* Companies */}
                  {question.companies && question.companies.length > 0 && (
                    <div>
                      <p className="text-sm text-slate-400 mb-2">
                        Asked at these companies
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {question.companies.slice(0, 3).map((company) => (
                          <Badge
                            key={company}
                            variant="outline"
                            className="border-blue-500/30 text-blue-400"
                          >
                            {company}
                          </Badge>
                        ))}
                        {question.companies.length > 3 && (
                          <Badge variant="outline" className="text-slate-400">
                            +{question.companies.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tips */}
                  {question.tips && question.tips.length > 0 && (
                    <div>
                      <p className="text-sm text-slate-400 mb-2">Tips</p>
                      <ul className="space-y-1">
                        {question.tips.map((tip, i) => (
                          <li key={i} className="text-sm text-slate-300 flex items-start">
                            <span className="text-blue-400 mr-2">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Practice Button */}
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      // Navigate to practice page or start interview
                      if (question.type === 'BEHAVIORAL') {
                        router.push('/interview/behavioral')
                      } else {
                        router.push('/interview')
                      }
                    }}
                  >
                    Practice This Question
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredQuestions.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">
              No questions found for this filter
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
