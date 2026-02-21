"use client"

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import SubscriptionGate from '@/components/SubscriptionGate';
import { DashboardLayout } from '@/components/DashboardLayout';

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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'loading' || !session?.user?.id) return;

    const fetchDashboard = async () => {
      try {
        setDashboardLoading(true);
        const [statsRes, sessionsRes, analysesRes] = await Promise.all([
          fetch('/api/user-stats'),
          fetch('/api/interviews/recent'),
          fetch('/api/analyze-resume/recent')
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          const mappedProgress = {
            dailyStreak: statsData.stats?.dailyStreak || 0,
            weeklyGoal: statsData.stats?.weeklyGoal || 3,
            weeklyProgress: statsData.stats?.weeklyProgress || 0,
            bestScore: Math.max(
              statsData.stats?.bestInterviewScore || 0,
              statsData.stats?.bestResumeScore || 0,
              statsData.stats?.bestScore || 0
            ),
            averageScore: statsData.stats?.averageScore || 0,
            totalInterviews: statsData.stats?.totalInterviews || 0,
            behavioralInterviews: statsData.stats?.behavioralInterviews || 0,
            technicalInterviews: statsData.stats?.technicalInterviews || 0,
            resumeChecks: statsData.stats?.resumeChecks || 0,
            totalSessions: (statsData.stats?.totalInterviews || 0) + (statsData.stats?.resumeChecks || 0),
            recentSessions: statsData.recentSessions || [],
            averageFillerWords: statsData.stats?.averageFillerWords || 0,
            bestFillerWordCount: statsData.stats?.bestFillerWordCount || 0,
            currentStreak: statsData.stats?.currentStreak || 0,
            longestStreak: statsData.stats?.longestStreak || 0,
            totalActiveDays: statsData.stats?.totalActiveDays || 0,
            lastActivityDate: statsData.stats?.lastActivityDate || null,
            totalXP: statsData.stats?.totalXP || 0,
            level: statsData.stats?.level || 1,
            hasActivityToday: statsData.stats?.hasActivityToday || false,
            quickStats: {
              practiceStreak: statsData.stats?.dailyStreak || 0,
              weeklyProgress: `${statsData.stats?.weeklyProgress || 0}/${statsData.stats?.weeklyGoal || 3}`,
              improvementRate: statsData.stats?.improvementRate || 'N/A',
              activeDays: statsData.stats?.totalActiveDays || 0
            }
          };
          setUserProgress(mappedProgress);
        }

        if (sessionsRes.ok) {
          const sessionsData = await sessionsRes.json();
          setRecentSessions(sessionsData.recentSessions || []);
        }

        if (analysesRes.ok) {
          const analysesData = await analysesRes.json();
          setRecentAnalyses(analysesData.analyses || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchDashboard();
  }, [session, status, router]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0f1e]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <DashboardLayout>
      {/* Top Bar with Stats */}
      <header className="h-12 bg-[#0a0f1e] border-b border-[#1f2937] flex items-center justify-end px-6 gap-4">
        {/* Stats */}
        <div className="flex items-center gap-4 text-[13px] text-[#9ca3af]">
          <div className="flex items-center gap-2">
            <span>Streak</span>
            <span className="font-semibold text-white">{userProgress?.dailyStreak || 0}</span>
          </div>
          <div className="w-px h-4 bg-[#1f2937]"></div>
          <div className="flex items-center gap-2">
            <span>Score</span>
            <span className="font-semibold text-white">{userProgress?.bestScore ? userProgress.bestScore.toFixed(0) : '0'}</span>
          </div>
        </div>
        {/* Avatar */}
        {session?.user?.image ? (
          <Image src={session.user.image} alt="Profile" width={24} height={24} className="rounded-full" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-[#3b82f6] flex items-center justify-center text-white text-xs font-semibold">
            {session?.user?.name?.charAt(0) || 'U'}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          {/* Greeting */}
          <h1 className="text-2xl font-semibold text-white mb-6">
            {getGreeting()}, {session?.user?.name?.split(' ')[0] || 'Interviewer'}.
          </h1>

          {/* Daily Goal - inline */}
          <div className="flex items-center gap-4 mb-8">
            <span className="text-xs uppercase tracking-wide text-[#6b7280]">Daily goal</span>
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded ${
                    i <= (userProgress?.weeklyProgress || 0) ? 'bg-[#3b82f6]' : 'bg-[#1f2937]'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-[#6b7280]">
              {userProgress?.weeklyProgress || 0} / {userProgress?.weeklyGoal || 3}
            </span>
          </div>

          {/* Continue CTA */}
          {recentSessions.length > 0 && (
            <div className="mb-12">
              <Link
                href={`/start?type=${recentSessions[0]?.type || 'behavioral'}`}
                className="inline-flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-150"
              >
                → Continue {recentSessions[0]?.type ? recentSessions[0].type.charAt(0).toUpperCase() + recentSessions[0].type.slice(1) : 'Behavioral'} Practice
              </Link>
              <div className="mt-2 text-sm text-[#6b7280]">
                Last session: {recentSessions[0]?.score?.toFixed(0) || 0} / 100 ·{' '}
                {new Date(recentSessions[0]?.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          )}

          {/* Your Stats - flat numbers */}
          <div className="mb-12">
            <h2 className="text-[11px] uppercase tracking-wider text-[#4b5563] mb-4">Stats</h2>
            <div className="flex items-start gap-8">
              <div>
                <div className="text-[28px] font-bold text-white mb-1">{userProgress?.dailyStreak || 0} days</div>
                <div className="text-xs text-[#6b7280]">Practice Streak</div>
              </div>
              <div className="w-px h-12 bg-[#1f2937]"></div>
              <div>
                <div className="text-[28px] font-bold text-white mb-1">{userProgress?.totalSessions || 0}</div>
                <div className="text-xs text-[#6b7280]">Total Sessions</div>
              </div>
              <div className="w-px h-12 bg-[#1f2937]"></div>
              <div>
                <div className="text-[28px] font-bold text-white mb-1">{userProgress?.bestScore ? userProgress.bestScore.toFixed(0) : '0'}</div>
                <div className="text-xs text-[#6b7280]">Best Score</div>
              </div>
            </div>
          </div>

          {/* Saved Questions - Coming Soon */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[11px] uppercase tracking-wider text-[#4b5563]">Saved Questions</h2>
            </div>
            <div className="bg-[#111827] border border-[#1f2937] rounded-lg p-8 text-center">
              <div className="text-[#6b7280] text-sm">
                <p className="mb-2">🔖 Practicing these questions - Coming Soon</p>
                <p className="text-xs text-[#4b5563]">Save questions during practice sessions to review later</p>
              </div>
            </div>
          </div>

          {/* Recent Activity - minimal table */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[11px] uppercase tracking-wider text-[#4b5563]">Recent Activity</h2>
              <button
                onClick={() => window.location.reload()}
                className="text-xs text-[#6b7280] hover:text-white transition-colors duration-150"
              >
                Refresh
              </button>
            </div>
            {dashboardLoading ? (
              <div className="py-8 text-center text-[#6b7280] text-sm">
                Loading...
              </div>
            ) : recentSessions.length > 0 || recentAnalyses.length > 0 ? (
              <div className="space-y-0">
                {[...recentSessions.slice(0, 5).map(s => ({ ...s, sessionType: s.type, date: s.completedAt })), ...recentAnalyses.slice(0, 5).map(a => ({ ...a, sessionType: 'resume', date: a.createdAt }))]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 5)
                  .map((item, i) => (
                    <div key={item.id} className={`py-3 flex items-center justify-between ${i > 0 ? 'border-t border-[#1f2937]' : ''}`}>
                      <div className="flex-1">
                        <span className="text-sm text-white capitalize">{item.sessionType} {item.sessionType === 'resume' ? 'Analysis' : 'Practice'}</span>
                      </div>
                      <div className="flex-1 text-center">
                        <span className="text-sm text-[#6b7280]">
                          {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex-1 text-right">
                        <span className="text-sm text-[#3b82f6] font-semibold">{item.score?.toFixed(0) || 'N/A'}</span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="py-8 text-center text-[#6b7280] text-sm">
                No recent activity. Start practicing to see your history.
              </div>
            )}
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}

export default function DashboardPageWithSuspense() {
  return (
    <SubscriptionGate>
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0a0f1e]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading...</p>
          </div>
        </div>
      }>
        <DashboardPage />
      </Suspense>
    </SubscriptionGate>
  );
}
