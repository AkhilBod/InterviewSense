"use client"

import { Button } from '@/components/ui/button';
import { Briefcase, Brain, FileText, FileCheck2, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { UserAccountDropdown } from '@/components/UserAccountDropdown';

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
    <div className="min-h-screen bg-zinc-900 text-white px-4 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Header with profile dropdown */}
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-500" />
            <h1 className="text-3xl font-bold">Dashboard</h1>
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
          <div className="bg-zinc-800 rounded-2xl shadow-xl p-10 flex flex-col items-start gap-6 hover:bg-zinc-700 transition-colors min-h-[260px]">
            <Briefcase className="h-12 w-12 text-blue-400" />
            <div>
              <h2 className="font-semibold text-2xl">Behavioral Interview</h2>
              <p className="text-zinc-400 text-base mb-6">Practice behavioral questions tailored to your role and experience.</p>
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 rounded-full px-8 py-3">
                <Link href="/start?type=behavioral">Start</Link>
              </Button>
            </div>
          </div>
          {/* Technical Interview */}
          <div className="bg-zinc-800 rounded-2xl shadow-xl p-10 flex flex-col items-start gap-6 hover:bg-zinc-700 transition-colors min-h-[260px]">
            <Brain className="h-12 w-12 text-green-400" />
            <div>
              <h2 className="font-semibold text-2xl">Technical Assessment</h2>
              <p className="text-white text-base mb-6">Practice real LeetCode-style coding questions tailored to your company, role, and difficulty.</p>
              <Button asChild size="lg" className="bg-green-600 hover:bg-green-500 rounded-full px-8 py-3">
                <Link href="/dashboard/technical">Start</Link>
              </Button>
            </div>
          </div>
          {/* Resume Checker */}
          <div className="bg-zinc-800 rounded-2xl shadow-xl p-10 flex flex-col items-start gap-6 hover:bg-zinc-700 transition-colors min-h-[260px]">
            <FileCheck2 className="h-12 w-12 text-purple-400" />
            <div>
              <h2 className="font-semibold text-2xl">Resume Checker</h2>
              <p className="text-zinc-400 text-base mb-6">Get instant feedback and suggestions to improve your resume.</p>
              <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-500 rounded-full px-8 py-3">
                <Link href="/resume-checker">Check Resume</Link>
              </Button>
            </div>
          </div>
          {/* Cover Letter Generator */}
          <div className="bg-zinc-800 rounded-2xl shadow-xl p-10 flex flex-col items-start gap-6 hover:bg-zinc-700 transition-colors min-h-[260px]">
            <FileText className="h-12 w-12 text-pink-400" />
            <div>
              <h2 className="font-semibold text-2xl">Cover Letter Generator</h2>
              <p className="text-zinc-400 text-base mb-6">Generate a personalized cover letter for your next application.</p>
              <Button asChild size="lg" className="bg-pink-600 hover:bg-pink-500 rounded-full px-8 py-3">
                <Link href="/cover-letter">Generate</Link>
              </Button>
            </div>
          </div>
        </div>
        {/* Placeholder for All Notes or Folders */}
        <h2 className="text-xl font-semibold mb-4">All Notes</h2>
        <div className="text-zinc-500">(Coming soon: Your saved interviews, notes, and folders will appear here.)</div>
      </div>
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