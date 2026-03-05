'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface PracticeButtonProps {
  question: string
  type: string
  topic: string
  difficulty: string
  company?: string
}

export default function PracticeButton({ question, type, topic, difficulty, company }: PracticeButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [state, setState] = useState<'idle' | 'saving' | 'saved'>('idle')

  const handleClick = async () => {
    if (state !== 'idle') return
    setState('saving')

    const questionData = {
      questionId: `seo-${topic}-${question.substring(0, 30)}`.replace(/[^a-z0-9-]/gi, '-').toLowerCase(),
      questionText: question,
      type: type === 'behavioral' ? 'BEHAVIORAL' : 'TECHNICAL',
      category: topic,
      company,
      difficulty,
    }

    if (session) {
      // Save to DB, then start focused practice session
      try {
        await fetch('/api/questions/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(questionData),
        })
      } catch {}
      setState('saved')
      localStorage.setItem('practiceQuestion', JSON.stringify(questionData))
      router.push('/interview')
    } else {
      // Not logged in — store for post-login save and go to signup
      localStorage.setItem('pendingQuestionSave', JSON.stringify(questionData))
      router.push('/signup')
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={state === 'saving'}
      style={{
        marginLeft: 'auto',
        fontSize: '0.75rem',
        color: state === 'saved' ? '#22c55e' : '#3b82f6',
        fontWeight: 600,
        background: 'none',
        border: 'none',
        cursor: state === 'saving' ? 'wait' : 'pointer',
        padding: 0,
        opacity: state === 'saving' ? 0.6 : 1,
      }}
    >
      {state === 'saving' ? 'Saving…' : state === 'saved' ? 'Saved ✓' : 'Practice this →'}
    </button>
  )
}
