'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface SaveQuestionButtonProps {
  questionId: string
  questionText: string
  type: 'BEHAVIORAL' | 'TECHNICAL'
  company?: string
  difficulty?: string
  category?: string
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  showText?: boolean
}

export default function SaveQuestionButton({
  questionId,
  questionText,
  type,
  company,
  difficulty,
  category,
  variant = 'outline',
  size = 'sm',
  showText = true,
}: SaveQuestionButtonProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  // Check if question is already saved
  useEffect(() => {
    if (!session) {
      setIsChecking(false)
      return
    }

    async function checkSaved() {
      try {
        const response = await fetch(`/api/questions/check-saved?questionId=${questionId}`)
        if (response.ok) {
          const data = await response.json()
          setIsSaved(data.isSaved)
        }
      } catch (error) {
        console.error('Error checking saved status:', error)
      } finally {
        setIsChecking(false)
      }
    }

    checkSaved()
  }, [questionId, session])

  const handleSaveToggle = async () => {
    if (!session) {
      toast({
        title: 'Login required',
        description: 'Please login to save questions',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      if (isSaved) {
        // Remove question
        const response = await fetch(`/api/questions/remove?questionId=${questionId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          setIsSaved(false)
          toast({
            title: 'Question removed',
            description: 'Removed from your saved questions',
          })
        } else {
          throw new Error('Failed to remove question')
        }
      } else {
        // Save question
        const response = await fetch('/api/questions/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId,
            questionText,
            type,
            company,
            difficulty,
            category,
          }),
        })

        const data = await response.json()

        if (response.ok) {
          setIsSaved(true)
          toast({
            title: 'Question saved!',
            description: 'Added to your question bank',
          })
        } else if (response.status === 409) {
          setIsSaved(true)
          toast({
            title: 'Already saved',
            description: 'This question is already in your bank',
          })
        } else {
          throw new Error(data.error || 'Failed to save question')
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save question',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isChecking) {
    return (
      <Button variant={variant} size={size} disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSaveToggle}
      disabled={isLoading}
      className={isSaved ? 'text-blue-400' : ''}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isSaved ? (
        <>
          <BookmarkCheck className="h-4 w-4" />
          {showText && <span className="ml-2">Saved</span>}
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4" />
          {showText && <span className="ml-2">Save Question</span>}
        </>
      )}
    </Button>
  )
}
