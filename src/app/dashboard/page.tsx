"use client"

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Briefcase, 
  FileText, 
  FileCheck2, 
  MessageSquare, 
  Brain,
  ChevronRight,
  Flame,
  Target,
  Trophy,
  GitBranch,
  Code2,
  Route
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { UserAccountDropdown } from '@/components/UserAccountDropdown';
import Image from 'next/image';

interface RecentSession {
  id: string;
  type: string;
  score: number;
  completedAt: string;
}

interface RecentAnalysis {
  id: string;
  score: number;
  createdAt: string;
}

interface UserProgressData {
  dailyStreak: number;
  weeklyGoal: number;
  weeklyProgress: number;
  bestScore: number;
  averageScore: number;
  totalInterviews: number;
  behavioralInterviews: number;
  technicalInterviews: number;
  resumeChecks: number;
  totalSessions: number;
  recentSessions: RecentSession[];
  averageFillerWords: number;
  bestFillerWordCount: number;
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  lastActivityDate: string | null;
  totalXP: number;
  level: number;
  hasActivityToday: boolean;
  quickStats: {
    practiceStreak: number;
    weeklyProgress: string;
    improvementRate: string;
    activeDays: number;
  };
}

function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [recentAnalyses, setRecentAnalyses] = useState<RecentAnalysis[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgressData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Function to refresh progress data
  const refreshProgress = async () => {
    if (!session?.user?.id) return;
    
    try {
      setRefreshing(true);
      const progressRes = await fetch('/api/user-progress');
      if (progressRes.ok) {
        const progressData = await progressRes.json();
        setUserProgress(progressData);
        setRecentSessions(progressData.recentSessions || []);
      }
    } catch (error) {
      console.error('Error refreshing progress:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Test function to simulate completing an interview
  const testInterview = async () => {
    try {
      setRefreshing(true);
      await fetch('/api/test-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'behavioral',
          score: 75 + Math.floor(Math.random() * 25) // Random score 75-100
        })
      });
      
      // Refresh progress after test
      await refreshProgress();
    } catch (error) {
      console.error('Error running test interview:', error);
    }
  };

  useEffect(() => {
    // Debug logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log('Dashboard auth check:', { status, hasSession: !!session?.user });
    }
    
    // Don't redirect while session is still loading
    if (status === "loading") return;
    
    // For unauthenticated users, add a delay to account for OAuth redirects
    // especially for new Google users who might have a slight delay in session establishment
    if (status === "unauthenticated" || !session?.user) {
      const timer = setTimeout(() => {
        // Double-check session status after a brief delay
        // Only redirect if we're definitively unauthenticated
        if (status === "unauthenticated") {
          if (process.env.NODE_ENV === 'development') {
            console.log('Redirecting to login after delay - still unauthenticated');
          }
          router.push('/login');
        }
      }, 2000); // 2 second delay to allow session to establish for OAuth flows
      
      return () => clearTimeout(timer);
    }

    const fetchData = async () => {
      try {
        setDashboardLoading(true);
        
        // Fetch user progress
        const progressRes = await fetch('/api/user-progress');
        if (progressRes.ok) {
          const progressData = await progressRes.json();
          setUserProgress(progressData);
          // Use the recent sessions from progress data as well
          setRecentSessions(progressData.recentSessions || []);
        }
        
        // Fetch recent activity (keep for analyses)
        const recentActivityRes = await fetch(`/api/recent-activity/${session.user.id}`);
        if (recentActivityRes.ok) {
          const activityData = await recentActivityRes.json();
          setRecentAnalyses(activityData.analyses || []);
          // Only use sessions if we don't have them from progress
          if (!userProgress?.recentSessions?.length) {
            setRecentSessions(activityData.sessions || []);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setDashboardLoading(false);
      }
    };

    // Only fetch data if we have a session
    if (session?.user) {
      fetchData();
    }
  }, [session, router, status]);

  // Show loading while session is being fetched or during OAuth redirect flow
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-500 mx-auto"></div>
          <p className="mt-4 text-zinc-400">Setting up your account...</p>
        </div>
      </div>
    );
  }

  // Show loading for a brief moment if no session yet (OAuth might still be completing)
  if (!session && status !== "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-500 mx-auto"></div>
          <p className="mt-4 text-zinc-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-zinc-950/80 border-b border-zinc-800/50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="https://i.ibb.co/hNsCy7F/logo.webp" alt="InterviewSense" width={32} height={32} className="object-contain" />
            <span className="font-semibold text-white">InterviewSense</span>
          </Link>
          <nav className="flex items-center gap-4">
            {session ? (
              <UserAccountDropdown />
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-white">Log in</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-16 px-4 h-full overflow-y-auto">
        <main className="max-w-7xl mx-auto px-2 py-8 w-full">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome back, {session?.user?.name?.split(' ')[0] || 'Interviewer'}! 
          </h1>
        </div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Behavioral Interview */}
          <Card className="bg-gradient-to-br from-slate-800/60 via-blue-900/30 to-slate-800/60 border-blue-700/30 backdrop-blur-sm hover:from-slate-800/80 hover:via-blue-900/50 hover:to-slate-800/80 transition-all duration-300 shadow-lg hover:shadow-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-gradient-to-br from-blue-500/30 to-blue-600/30 rounded-xl border border-blue-500/20">
                  <MessageSquare className="h-10 w-10 text-blue-300" />
                </div>
                <ChevronRight className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-2">Behavioral Interview</h3>
              <p className="text-blue-200 text-sm mb-4">Practice behavioral questions and storytelling skills</p>
              <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg">
                <Link href="/start?type=behavioral">
                  Start Practice
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Technical Interview */}
          <Card className="bg-gradient-to-br from-slate-800/60 via-green-900/30 to-slate-800/60 border-green-700/30 backdrop-blur-sm hover:from-slate-800/80 hover:via-green-900/50 hover:to-slate-800/80 transition-all duration-300 shadow-lg hover:shadow-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-gradient-to-br from-green-500/30 to-green-600/30 rounded-xl border border-green-500/20">
                  <Brain className="h-10 w-10 text-green-300" />
                </div>
                <ChevronRight className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent mb-2">Technical Interview</h3>
              <p className="text-green-200 text-sm mb-4">Challenge yourself with coding and technical problem-solving</p>
              <Button asChild className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0 shadow-lg">
                <Link href="/dashboard/technical">
                  Start Practice
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Resume Analysis */}
          <Card className="bg-gradient-to-br from-slate-800/60 via-purple-900/30 to-slate-800/60 border-purple-700/30 backdrop-blur-sm hover:from-slate-800/80 hover:via-purple-900/50 hover:to-slate-800/80 transition-all duration-300 shadow-lg hover:shadow-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-gradient-to-br from-purple-500/30 to-purple-600/30 rounded-xl border border-purple-500/20">
                  <FileCheck2 className="h-10 w-10 text-purple-300" />
                </div>
                <ChevronRight className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2">Resume Analysis</h3>
              <p className="text-purple-200 text-sm mb-4">Get AI-powered feedback to optimize your resume</p>
              <Button asChild className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0 shadow-lg">
                <Link href="/resume-checker">
                  Analyze Resume
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Cover Letter */}
          <Card className="bg-gradient-to-br from-slate-800/60 via-orange-900/30 to-slate-800/60 border-orange-700/30 backdrop-blur-sm hover:from-slate-800/80 hover:via-orange-900/50 hover:to-slate-800/80 transition-all duration-300 shadow-lg hover:shadow-orange-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-gradient-to-br from-orange-500/30 to-orange-600/30 rounded-xl border border-orange-500/20">
                  <FileText className="h-10 w-10 text-orange-300" />
                </div>
                <ChevronRight className="h-6 w-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent mb-2">Cover Letter</h3>
              <p className="text-orange-200 text-sm mb-4">Create compelling cover letters that stand out</p>
              <Button asChild className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white border-0 shadow-lg">
                <Link href="/cover-letter">
                  Create Cover Letter
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Daily Streak/Weekly Goal/Best Score Stats */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Your Progress</h2>
            <Button
              onClick={refreshProgress}
              disabled={refreshing}
              size="sm"
              variant="ghost"
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
          {dashboardLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="h-4 bg-zinc-700 rounded animate-pulse mb-2"></div>
                        <div className="h-8 bg-zinc-700 rounded animate-pulse"></div>
                      </div>
                      <div className="p-3 bg-zinc-700 rounded-xl animate-pulse">
                        <div className="h-8 w-8"></div>
                      </div>
                    </div>
                    <div className="h-3 bg-zinc-700 rounded animate-pulse mt-2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Daily Streak */}
            <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm">Daily Streak</p>
                    <p className="text-3xl font-bold text-white">
                      {userProgress?.dailyStreak || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-500/20 rounded-xl">
                    <Flame className="h-8 w-8 text-orange-400" />
                  </div>
                </div>
                <p className="text-xs text-zinc-400 mt-2">
                  {userProgress?.dailyStreak === 1 ? 'Day' : 'Days'} of practice
                </p>
              </CardContent>
            </Card>

            {/* Weekly Goal */}
            <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm">Weekly Goal</p>
                    <p className="text-3xl font-bold text-white">
                      {userProgress?.weeklyProgress || 0}/{userProgress?.weeklyGoal || 3}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Target className="h-8 w-8 text-blue-400" />
                  </div>
                </div>
                <p className="text-xs text-zinc-400 mt-2">
                  Sessions this week
                  {userProgress?.weeklyProgress && userProgress?.weeklyGoal && 
                   userProgress.weeklyProgress >= userProgress.weeklyGoal && (
                    <span className="text-green-400 ml-1">✓ Goal reached!</span>
                  )}
                </p>
              </CardContent>
            </Card>

            {/* Best Score */}
            <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm">Best Score</p>
                    <p className="text-3xl font-bold text-white">
                      {userProgress?.bestScore ? userProgress.bestScore.toFixed(0) : '0'}
                    </p>
                  </div>
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <Trophy className="h-8 w-8 text-green-400" />
                  </div>
                </div>
                <p className="text-xs text-zinc-400 mt-2">
                  Your highest score
                  {userProgress?.averageScore && userProgress?.bestScore && (
                    <span className="block text-green-400 text-xs mt-1">
                      Avg: {userProgress.averageScore.toFixed(1)}
                    </span>
                  )}
                </p>
              </CardContent>
            </Card>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-zinc-100">Interview Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {recentSessions.length > 0 ? (
                  <div className="space-y-3">
                    {recentSessions.slice(0, 3).map((session) => (
                      <div key={session.id} className="flex justify-between items-center p-3 bg-zinc-700/30 rounded-lg">
                        <div>
                          <p className="text-zinc-200 font-medium capitalize">{session.type}</p>
                          <p className="text-zinc-400 text-sm">
                            {new Date(session.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-zinc-100 font-semibold">{session.score?.toFixed(0) || 'N/A'}</p>
                          <p className="text-zinc-400 text-sm">Score</p>
                        </div>
                      </div>
                    ))}
                    {recentSessions.length > 3 && (
                      <p className="text-zinc-400 text-sm text-center mt-2">
                        +{recentSessions.length - 3} more sessions
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Briefcase className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                    <p className="text-zinc-400">No recent sessions</p>
                    <p className="text-zinc-500 text-sm">Complete your first interview to see your progress here!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-zinc-100">Resume Analyses</CardTitle>
              </CardHeader>
              <CardContent>
                {recentAnalyses.length > 0 ? (
                  <div className="space-y-3">
                    {recentAnalyses.slice(0, 3).map((analysis) => (
                      <div key={analysis.id} className="flex justify-between items-center p-3 bg-zinc-700/30 rounded-lg">
                        <div>
                          <p className="text-zinc-200 font-medium">Resume Check</p>
                          <p className="text-zinc-400 text-sm">
                            {new Date(analysis.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-zinc-100 font-semibold">{analysis.score?.toFixed(0) || 'N/A'}</p>
                          <p className="text-zinc-400 text-sm">Score</p>
                        </div>
                      </div>
                    ))}
                    {recentAnalyses.length > 3 && (
                      <p className="text-zinc-400 text-sm text-center mt-2">
                        +{recentAnalyses.length - 3} more analyses
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <FileCheck2 className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                    <p className="text-zinc-400">No recent analyses</p>
                    <p className="text-zinc-500 text-sm">Analyze your resume to see your progress here!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-zinc-100">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Practice Streak</span>
                    <span className="text-white font-semibold">
                      {userProgress?.quickStats?.practiceStreak || 0} days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Total Sessions</span>
                    <span className="text-white font-semibold">
                      {userProgress?.totalSessions || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Resume Analyses</span>
                    <span className="text-white font-semibold">
                      {userProgress?.resumeChecks || recentAnalyses.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Weekly Progress</span>
                    <span className="text-white font-semibold">
                      {userProgress?.quickStats?.weeklyProgress || '0/3'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Improvement Rate</span>
                    <span className={`font-semibold ${
                      userProgress?.quickStats?.improvementRate?.startsWith('+') 
                        ? 'text-green-400' 
                        : userProgress?.quickStats?.improvementRate?.startsWith('-')
                        ? 'text-red-400'
                        : 'text-white'
                    }`}>
                      {userProgress?.quickStats?.improvementRate || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Active Days</span>
                    <span className="text-white font-semibold">
                      {userProgress?.quickStats?.activeDays || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardPageWithSuspense() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-500 mx-auto"></div>
          <p className="mt-4 text-zinc-400">Loading...</p>
        </div>
      </div>
    }>
      <DashboardPage />
    </Suspense>
  );
}
