'use client'

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, ChevronLeft, ArrowRight, User } from "lucide-react"
import JobRoleSelect from "./components/job-role-select"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { useEffect, useState, Suspense } from 'react'

interface JobDetails {
  jobTitle: string;
  company: string;
  industry: string;
  experienceLevel: string;
  jobAd: string;
  resume: File | null;
  interviewType: string;
  interviewStage: string;
}

function StartPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');
  const [jobDetails, setJobDetails] = useState<JobDetails>({
    jobTitle: '',
    company: '',
    industry: '',
    experienceLevel: '',
    jobAd: '',
    resume: null,
    interviewType: typeParam === 'technical' ? 'Technical' : typeParam === 'behavioral' ? 'Behavioral' : 'Mixed',
    interviewStage: 'Initial Screening'
  })

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

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const handleStartInterview = () => {
    // Save job details to localStorage
    localStorage.setItem('jobTitle', jobDetails.jobTitle)
    localStorage.setItem('company', jobDetails.company)
    localStorage.setItem('industry', jobDetails.industry)
    localStorage.setItem('experienceLevel', jobDetails.experienceLevel)
    localStorage.setItem('jobAd', jobDetails.jobAd)
    localStorage.setItem('interviewType', jobDetails.interviewType)
    localStorage.setItem('interviewStage', jobDetails.interviewStage)
    
    // Handle resume file if present
    if (jobDetails.resume) {
      // Read the resume file content
      const reader = new FileReader();
      reader.onload = (e) => {
        const resumeText = e.target?.result;
        if (typeof resumeText === 'string') {
          localStorage.setItem('resume', resumeText);
        }
      };
      reader.readAsText(jobDetails.resume);
      localStorage.setItem('resumeFileName', jobDetails.resume.name)
    }

    router.push('/interview')
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-zinc-950/80 border-b border-zinc-800/50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image src="/logo.webp" alt="InterviewSense" width={24} height={24} className="object-contain" />
            <Link href="/" className="font-bold text-xl">
              InterviewSense
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.image || ''} alt={session.user?.name || 'User'} />
                      <AvatarFallback className="bg-blue-500">
                        {session.user?.name?.charAt(0) || <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-zinc-900 border-zinc-800" align="end">
                  <DropdownMenuLabel className="text-zinc-400">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer text-white hover:text-white hover:bg-zinc-800">
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back to Home
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-400 hover:bg-zinc-800 hover:text-red-300 cursor-pointer"
                    onClick={handleSignOut}
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" size="sm" asChild className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                <Link href="/login">Sign in</Link>
              </Button>
            )}
          </nav>
        </div>
      </header>

      <div className="flex-1 py-12 md:py-20 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto">
            <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"></div>
              <CardHeader className="text-center relative z-10 pt-10">
                <CardTitle className="text-2xl md:text-3xl font-bold">Prepare for Your Interview</CardTitle>
                <CardDescription className="text-base mt-3 text-zinc-400">
                  Select the job role you're interviewing for to get started with a tailored mock interview experience.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 px-6 md:px-10">
                <JobRoleSelect onJobDetailsChange={setJobDetails} interviewType={jobDetails.interviewType} />
              </CardContent>
              <CardFooter className="flex flex-col space-y-4 pb-10 relative z-10 px-6 md:px-10">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-full py-6" 
                  size="lg"
                  onClick={handleStartInterview}
                  disabled={!jobDetails.jobTitle}
                >
                  <span className="flex items-center justify-center">
                    Start Mock Interview
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </span>
                </Button>
                <p className="text-sm text-zinc-400 text-center">
                  We'll create a personalized interview based on the job role you selected.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-zinc-800 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Image src="/logo.webp" alt="InterviewSense" width={20} height={20} className="object-contain" />
              <span className="font-bold text-white">InterviewSense</span>
            </div>
            <p className="text-sm text-zinc-500">© {new Date().getFullYear()} InterviewSense. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function StartPageWithSuspense() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-zinc-400">Loading...</p>
        </div>
      </div>
    }>
      <StartPage />
    </Suspense>
  );
}
