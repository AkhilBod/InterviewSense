'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, RotateCcw } from 'lucide-react'

interface FlipQuestionCardProps {
  question: {
    question: string
    difficulty: string
    topic: string
    type: string
    solution?: string
    company?: string
    acceptance?: string
    frequency?: string
  }
  companyName?: string
}

export default function FlipQuestionCard({ question, companyName }: FlipQuestionCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const formatStarAnswer = (solution: string) => {
    // Remove ** markers and format nicely
    return solution
      .replace(/\*\*Situation:\*\*/g, '<strong class="text-blue-400">Situation:</strong>')
      .replace(/\*\*Task:\*\*/g, '<strong class="text-green-400">Task:</strong>')
      .replace(/\*\*Action:\*\*/g, '<strong class="text-purple-400">Action:</strong>')
      .replace(/\*\*Result:\*\*/g, '<strong class="text-orange-400">Result:</strong>')
  }

  return (
    <div className="perspective-1000 h-[450px]">
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front of card */}
        <Card
          className={`absolute w-full h-full hover:scale-[1.02] transition-all duration-300 backface-hidden cursor-pointer ${!isFlipped ? '' : 'hidden'}`}
          onClick={() => setIsFlipped(true)}
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(29,100,255,0.15)',
            borderRadius: '20px',
            boxShadow: '0 0 20px rgba(29, 100, 255, 0.15)'
          }}
        >
          <CardContent className="p-8 md:p-10 flex flex-col h-full">
            {/* Category Label - Eyebrow */}
            <div className="mb-6">
              <span className="text-[10px] uppercase tracking-[0.15em] font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {question.topic}
              </span>
            </div>

            {/* Question Text - Main Focus */}
            <h3 className="text-xl md:text-2xl font-bold text-white mb-6 flex-grow leading-tight">
              {question.question}
            </h3>

            {/* Tags - Cleaner Pills */}
            <div className="flex gap-2 flex-wrap mb-6">
              <span className={`px-3 py-1.5 text-[11px] font-medium rounded-full ${
                question.difficulty === 'Easy' ? 'text-green-400' :
                question.difficulty === 'Medium' ? 'text-yellow-400' :
                'text-red-400'
              }`} style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)'
              }}>
                {question.difficulty}
              </span>
              <span className="px-3 py-1.5 text-[11px] font-medium rounded-full" style={{
                background: 'rgba(24,119,242,0.1)',
                color: '#1877f2',
                border: '1px solid rgba(24,119,242,0.2)'
              }}>
                {question.type === 'behavioral' ? 'Behavioral' : 'Technical'}
              </span>
              {companyName && (
                <span className="px-3 py-1.5 text-[11px] font-medium rounded-full" style={{
                  background: 'rgba(24,119,242,0.1)',
                  color: '#1877f2',
                  border: '1px solid rgba(24,119,242,0.2)'
                }}>
                  {companyName}
                </span>
              )}
            </div>

            {/* Divider */}
            <div className="border-t mb-6" style={{ borderColor: 'rgba(255,255,255,0.08)' }}></div>

            {/* Bottom Section */}
            <div className="mt-auto">
              <div className="text-xs mb-4 text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Click to see answer
              </div>
              <Button
                asChild
                size="lg"
                className="w-full text-white font-semibold text-sm"
                style={{
                  background: '#1877f2',
                  borderRadius: '12px',
                  padding: '14px 24px'
                }}
              >
                <Link href="/signup">
                  Practice This Question <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Back of card */}
        <Card
          className={`absolute w-full h-full backface-hidden cursor-pointer overflow-y-auto ${isFlipped ? '' : 'hidden'}`}
          onClick={() => setIsFlipped(false)}
          style={{
            transform: 'rotateY(180deg)',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(29,100,255,0.15)',
            borderRadius: '20px',
            boxShadow: '0 0 20px rgba(29, 100, 255, 0.15)'
          }}
        >
          <CardContent className="p-8 md:p-10 flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
              <h4 className="text-sm font-semibold" style={{ color: '#1877f2' }}>
                {question.type === 'behavioral' ? 'Sample Answer (STAR Method)' : 'Approach & Solution'}
              </h4>
              <RotateCcw className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.4)' }} />
            </div>

            {question.solution ? (
              <div
                className="text-sm leading-relaxed mb-6 flex-grow overflow-y-auto"
                style={{ color: 'rgba(255,255,255,0.8)' }}
                dangerouslySetInnerHTML={{ __html: formatStarAnswer(question.solution) }}
              />
            ) : (
              <div className="mb-6 p-6 rounded-xl flex-grow" style={{
                background: 'rgba(24,119,242,0.08)',
                border: '1px solid rgba(24,119,242,0.2)'
              }}>
                <p className="text-sm" style={{ color: '#1877f2' }}>
                  <strong>Approach:</strong> Consider time/space complexity, edge cases, and explain your thought process clearly. Sign up to access detailed solutions!
                </p>
              </div>
            )}

            {/* Divider */}
            <div className="border-t mb-6" style={{ borderColor: 'rgba(255,255,255,0.08)' }}></div>

            <div className="mt-auto">
              <div className="text-xs mb-4 text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Click to flip back
              </div>
              <Button
                asChild
                size="lg"
                className="w-full text-white font-semibold text-sm"
                style={{
                  background: '#1877f2',
                  borderRadius: '12px',
                  padding: '14px 24px'
                }}
              >
                <Link href="/signup">
                  Get Full Solution <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  )
}
