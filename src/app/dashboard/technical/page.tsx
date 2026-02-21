'use client'

import Link from "next/link"
import { MessageSquare, User } from "lucide-react"
import Image from 'next/image'
import { TechnicalAssessment } from "@/components/TechnicalAssessment"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { UserAccountDropdown } from '@/components/UserAccountDropdown'
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

  const model = "models/gemini-2.0-flash"

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
    <div className="flex flex-col min-h-screen bg-zinc-900 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-[#000818]/80">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="https://i.ibb.co/hJC8n6NB/Generated-Image-February-20-2026-7-04-PM-Photoroom.png" alt="InterviewSense" width={50} height={50} className="object-contain" />
            <span className="font-bold text-xl text-white">InterviewSense</span>
          </Link>
          <nav className="flex items-center gap-4">
            <UserAccountDropdown />
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex-1 pt-20">
        <TechnicalAssessment />
      </div>
    </div>
  )
}

export default function TechnicalAssessmentPageWithSuspense() {
  return (
    <Suspense fallback={ 
      <div className="flex min-h-screen items-center justify-center bg-zinc-900">
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