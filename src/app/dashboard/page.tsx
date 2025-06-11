"use client"

import { Button } from '@/components/ui/button';
import { Briefcase, FileText, FileCheck2, MessageSquare, Brain } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { UserAccountDropdown } from '@/components/UserAccountDropdown';
import { Analytics } from "@vercel/analytics/react";

function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      const checkOnboardingStatus = async () => {
        try {
          const response = await fetch('/api/user/onboarding/status');
          const data = await response.json();
          
          if (!data.onboardingCompleted) {
            router.push('/questionnaire');
            return;
          }
          
          setIsLoading(false);
        } catch (error) {
          console.error('Error checking onboarding status:', error);
          setIsLoading(false);
        }
      };

      checkOnboardingStatus();
    }
  }, [status, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-blue-950 text-white px-4 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Header with profile dropdown */}
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.webp" alt="InterviewSense" width={36} height={36} className="object-contain" />
            <h1 className="text-3xl font-bold">InterviewSense</h1>
          </div>
          <nav className="flex items-center gap-4">
            {session ? (
              <UserAccountDropdown />
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-white">Log in</Button>
              </Link>
            )}
          </nav>
        </header>
        <p className="text-zinc-400 mt-2 mb-8">Choose an action to get started.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Behavioral Interview */}
          <div className="bg-zinc-800 rounded-2xl shadow-xl p-8 flex flex-col items-start min-h-[260px] border border-zinc-700/40 group transition-all duration-300 ease-in-out hover:shadow-2xl hover:border-blue-500/60 hover:scale-[1.02]">
            <div className="bg-blue-500/10 rounded-xl p-3 mb-2 group-hover:bg-blue-500/20 transition-colors">
              <Briefcase className="h-10 w-10 text-blue-400" />
            </div>
            <h2 className="font-semibold text-2xl mb-2">Behavioral Practice</h2>
            <p className="text-zinc-400 text-base mb-4">Sharpen your answers to common behavioral questions with our AI-powered practice module.</p>
            <div className="mt-auto w-full flex">
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-full px-8 py-3 shadow-lg shadow-blue-500/20 w-full">
                <Link href="/start?type=behavioral">Start</Link>
              </Button>
            </div>
          </div>
          {/* Technical Interview */}
          <div className="bg-zinc-800 rounded-2xl shadow-xl p-8 flex flex-col items-start min-h-[260px] border border-zinc-700/40 group transition-all duration-300 ease-in-out hover:shadow-2xl hover:border-blue-500/60 hover:scale-[1.02]">
            <div className="bg-blue-500/10 rounded-xl p-3 mb-2 group-hover:bg-blue-500/20 transition-colors">
              <Brain className="h-10 w-10 text-blue-400" />
            </div>
            <h2 className="font-semibold text-2xl mb-2">Technical Drills</h2>
            <p className="text-zinc-400 text-base mb-4">Tackle LeetCode-style coding problems tailored to your target company and role.</p>
            <div className="mt-auto w-full flex">
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-full px-8 py-3 shadow-lg shadow-blue-500/20 w-full">
                <Link href="/dashboard/technical">Start</Link>
              </Button>
            </div>
          </div>
          {/* Resume Checker */}
          <div className="bg-zinc-800 rounded-2xl shadow-xl p-8 flex flex-col items-start min-h-[260px] border border-zinc-700/40 group transition-all duration-300 ease-in-out hover:shadow-2xl hover:border-blue-500/60 hover:scale-[1.02]">
            <div className="bg-blue-500/10 rounded-xl p-3 mb-2 group-hover:bg-blue-500/20 transition-colors">
              <FileCheck2 className="h-10 w-10 text-blue-400" />
            </div>
            <h2 className="font-semibold text-2xl mb-2">Resume Optimizer</h2>
            <p className="text-zinc-400 text-base mb-4">Get instant AI feedback to improve your resume and catch the eye of recruiters.</p>
            <div className="mt-auto w-full flex">
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-full px-8 py-3 shadow-lg shadow-blue-500/20 w-full">
                <Link href="/resume-checker">Check Resume</Link>
              </Button>
            </div>
          </div>
          {/* Cover Letter Generator */}
          <div className="bg-zinc-800 rounded-2xl shadow-xl p-8 flex flex-col items-start min-h-[260px] border border-zinc-700/40 group transition-all duration-300 ease-in-out hover:shadow-2xl hover:border-blue-500/60 hover:scale-[1.02]">
            <div className="bg-blue-500/10 rounded-xl p-3 mb-2 group-hover:bg-blue-500/20 transition-colors">
              <FileText className="h-10 w-10 text-blue-400" />
            </div>
            <h2 className="font-semibold text-2xl mb-2">Cover Letter Builder</h2>
            <p className="text-zinc-400 text-base mb-4">Create compelling, personalized cover letters for every job application effortlessly.</p>
            <div className="mt-auto w-full flex">
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-full px-8 py-3 shadow-lg shadow-blue-500/20 w-full">
                <Link href="/cover-letter">Generate</Link>
              </Button>
            </div>
          </div>
        </div>
        {/* Placeholder for All Notes or Folders */}
        <h2 className="text-xl font-semibold mb-4">All Notes</h2>
        <div className="text-zinc-500">(Coming soon: Your saved interviews, notes, and folders will appear here.)</div>
      </div>
      <Analytics />
    </div>
  );
}

export default function DashboardPageWithSuspense() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-zinc-400">Loading...</p>
        </div>
      </div>
    }>
      <DashboardPage />
    </Suspense>
  );
}
