'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

export function usePostLoginQuestionSave() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Check if there's a pending question to save
      const pendingQuestionStr = localStorage.getItem('pendingQuestionSave')
      if (pendingQuestionStr) {
        try {
          const pendingQuestion = JSON.parse(pendingQuestionStr)
          
          // Save the question now that user is logged in
          fetch('/api/questions/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pendingQuestion),
          })
            .then((response) => {
              if (response.ok || response.status === 409) {
                // 409 means already saved, which is fine
                // Clear from localStorage since it's now saved or already exists
                localStorage.removeItem('pendingQuestionSave')
                console.log('Pending question saved after login')
              } else {
                console.error('Error saving pending question:', response.status)
              }
            })
            .catch((error) => {
              console.error('Error saving pending question:', error)
            })
        } catch (error) {
          console.error('Error parsing pending question:', error)
          localStorage.removeItem('pendingQuestionSave')
        }
      }
    }
  }, [status, session])
}
