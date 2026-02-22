'use client'

import { TechnicalAssessment } from "@/components/TechnicalAssessment"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { DashboardLayout } from '@/components/DashboardLayout'
import { useEffect, Suspense } from 'react'

function TechnicalAssessmentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-zinc-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const resumeFeedback = {
    overallAssessment: "This resume is well-structured and presents a strong profile for a Software Engineering (SWE) position...",
    strengths: [
      "Strong Technical Skills: The resume highlights a diverse range of programming languages...",
      "Quantifiable Achievements: The candidate has successfully quantified the impact of their work...",
      // ...
    ],
    areasForImprovement: [
      "Experience Detail: Some experience descriptions could be more detailed...",
      // ...
    ],
    specificSuggestions: [
      "Expand on Verizon Internship: Provide more detail about the specific challenges...",
      // ...
    ],
    atsTips: [
      "Use Standard Section Headings: Ensure standard section headings like 'Experience', 'Education', and 'Skills' are used.",
      // ...
    ],
    formatFeedback: [
      "Clean and Readable: The resume has a clean and readable layout...",
      // ...
    ],
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <TechnicalAssessment />
      </div>
    </DashboardLayout>
  )
}

export default function TechnicalAssessmentPageWithSuspense() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#0a0f1e]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-zinc-400">Loading...</p>
        </div>
      </div>
    }>
      <TechnicalAssessmentPage />
    </Suspense>
  );
}