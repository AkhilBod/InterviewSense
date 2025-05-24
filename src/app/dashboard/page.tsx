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
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-blue-950 text-white px-2 sm:px-4 py-8 relative overflow-x-hidden">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="w-full h-full bg-[radial-gradient(circle_at_60%_20%,rgba(59,130,246,0.10),transparent_60%)]"></div>
      </div>
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header with profile dropdown */}
        <header className="mb-10 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 rounded-full p-2 shadow-lg shadow-blue-500/20">
              <Brain className="h-7 w-7 text-white" />
            </div>
            <span className="font-extrabold text-2xl sm:text-3xl tracking-tight bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent drop-shadow">InterviewSense</span>
            <span className="hidden sm:inline-block text-zinc-400 font-semibold text-lg ml-4">Dashboard</span>
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
        {session?.user?.name && (
          <h2 className="text-xl sm:text-2xl font-bold mb-2 text-white">Welcome back, <span className="text-blue-400">{session.user.name.split(' ')[0]}</span>!</h2>
        )}
        <p className="text-zinc-400 mb-8 text-base sm:text-lg">Choose an action to get started.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-14">
          {/* Behavioral Interview */}
          <div className="bg-zinc-800 rounded-2xl shadow-2xl p-8 sm:p-10 flex flex-col items-start gap-6 hover:bg-zinc-700 hover:scale-[1.03] transition-all duration-200 min-h-[260px] group border border-zinc-700/40">
            <div className="bg-blue-500/10 rounded-xl p-3 mb-2 group-hover:bg-blue-500/20 transition-colors">
              <Briefcase className="h-10 w-10 text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold text-2xl">Behavioral Interview</h2>
              <p className="text-zinc-400 text-base mb-6">Practice behavioral questions tailored to your role and experience.</p>
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-full px-8 py-3 shadow-lg shadow-blue-500/20">
                <Link href="/start?type=behavioral">Start</Link>
              </Button>
            </div>
          </div>
          {/* Technical Interview */}
          <div className="bg-zinc-800 rounded-2xl shadow-2xl p-8 sm:p-10 flex flex-col items-start gap-6 hover:bg-zinc-700 hover:scale-[1.03] transition-all duration-200 min-h-[260px] group border border-zinc-700/40">
            <div className="bg-green-500/10 rounded-xl p-3 mb-2 group-hover:bg-green-500/20 transition-colors">
              <Brain className="h-10 w-10 text-green-400" />
            </div>
            <div>
              <h2 className="font-semibold text-2xl">Technical Assessment</h2>
              <p className="text-white text-base mb-6">Practice real LeetCode-style coding questions tailored to your company, role, and difficulty.</p>
              <Button asChild size="lg" className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 rounded-full px-8 py-3 shadow-lg shadow-green-500/20">
                <Link href="/dashboard/technical">Start</Link>
              </Button>
            </div>
          </div>
          {/* Resume Checker */}
          <div className="bg-zinc-800 rounded-2xl shadow-2xl p-8 sm:p-10 flex flex-col items-start gap-6 hover:bg-zinc-700 hover:scale-[1.03] transition-all duration-200 min-h-[260px] group border border-zinc-700/40">
            <div className="bg-purple-500/10 rounded-xl p-3 mb-2 group-hover:bg-purple-500/20 transition-colors">
              <FileCheck2 className="h-10 w-10 text-purple-400" />
            </div>
            <div>
              <h2 className="font-semibold text-2xl">Resume Checker</h2>
              <p className="text-zinc-400 text-base mb-6">Get instant feedback and suggestions to improve your resume.</p>
              <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded-full px-8 py-3 shadow-lg shadow-purple-500/20">
                <Link href="/resume-checker">Check Resume</Link>
              </Button>
            </div>
          </div>
          {/* Cover Letter Generator */}
          <div className="bg-zinc-800 rounded-2xl shadow-2xl p-8 sm:p-10 flex flex-col items-start gap-6 hover:bg-zinc-700 hover:scale-[1.03] transition-all duration-200 min-h-[260px] group border border-zinc-700/40">
            <div className="bg-pink-500/10 rounded-xl p-3 mb-2 group-hover:bg-pink-500/20 transition-colors">
              <FileText className="h-10 w-10 text-pink-400" />
            </div>
            <div>
              <h2 className="font-semibold text-2xl">Cover Letter Generator</h2>
              <p className="text-zinc-400 text-base mb-6">Generate a personalized cover letter for your next application.</p>
              <Button asChild size="lg" className="bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 rounded-full px-8 py-3 shadow-lg shadow-pink-500/20">
                <Link href="/cover-letter">Generate</Link>
              </Button>
            </div>
          </div>
        </div>
        {/* Placeholder for All Notes or Folders */}
        <h2 className="text-xl font-semibold mb-4 mt-10 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-400" />
          All Notes
        </h2>
        <div className="flex flex-col items-center justify-center py-10">
          <div className="bg-zinc-800 rounded-full p-6 mb-4 shadow-lg">
            <FileText className="h-10 w-10 text-zinc-400" />
          </div>
          <div className="text-zinc-400 text-center text-base">(Coming soon: Your saved interviews, notes, and folders will appear here.)</div>
        </div>
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