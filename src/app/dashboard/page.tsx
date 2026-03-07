"use client"

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import SubscriptionGate from '@/components/SubscriptionGate';
import { DashboardLayout } from '@/components/DashboardLayout';

/* ───────── Types ───────── */

interface ActivityItem {
  id: string;
  activityType: string;
  score: number | null;
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
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  lastActivityDate: string | null;
  hasActivityToday: boolean;
}

interface SavedQuestion {
  id: string;
  questionId: string;
  questionText: string;
  type: 'BEHAVIORAL' | 'TECHNICAL';
  company?: string;
  difficulty?: string;
  category?: string;
}

/* ───────── Helpers ───────── */

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(215, 15%, 45%)', marginBottom: 16 }}>
    {children}
  </div>
);

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  behavioral: 'Behavioral',
  technical: 'Technical',
  resume: 'Resume',
  system_design: 'System Design',
  portfolio: 'Portfolio',
  career_roadmap: 'Career Roadmap',
};

function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgressData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [savedQuestions, setSavedQuestions] = useState<SavedQuestion[]>([]);
  const [savedTab, setSavedTab] = useState<'BEHAVIORAL' | 'TECHNICAL'>('BEHAVIORAL');

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status === 'loading' || !session?.user?.id) return;

    (async () => {
      setDashboardLoading(true);
      try {
        const [statsRes, activityRes, savedRes] = await Promise.all([
          fetch('/api/user-stats'),
          fetch('/api/stats/history'),
          fetch('/api/questions/saved'),
        ]);

        if (statsRes.ok) {
          const d = await statsRes.json();
          const s = d.stats || {};
          setUserProgress({
            dailyStreak: s.dailyStreak || 0,
            weeklyGoal: s.weeklyGoal || 3,
            weeklyProgress: s.weeklyProgress || 0,
            bestScore: Math.max(s.bestInterviewScore || 0, s.bestResumeScore || 0, s.bestScore || 0),
            averageScore: s.averageScore || 0,
            totalInterviews: s.totalInterviews || 0,
            behavioralInterviews: s.behavioralInterviews || 0,
            technicalInterviews: s.technicalInterviews || 0,
            resumeChecks: s.resumeChecks || 0,
            totalSessions: (s.totalInterviews || 0) + (s.resumeChecks || 0),
            currentStreak: s.currentStreak || 0,
            longestStreak: s.longestStreak || 0,
            totalActiveDays: s.totalActiveDays || 0,
            lastActivityDate: s.lastActivityDate || null,
            hasActivityToday: s.hasActivityToday || false,
          });
        }

        if (activityRes.ok) { const d = await activityRes.json(); setRecentActivity(d.activities || []); }
        if (savedRes.ok) { const d = await savedRes.json(); setSavedQuestions(d.questions || []); }
      } catch (e) { console.error(e); }
      finally { setDashboardLoading(false); }
    })();
  }, [session, status, router]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (status === 'loading') {
    return (
      <DashboardLayout>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'hsl(222.2, 84%, 4.9%)' }}>
          <div style={{ width: 32, height: 32, border: '2px solid transparent', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </DashboardLayout>
    );
  }

  if (!session) return null;

  const streak = userProgress?.currentStreak || userProgress?.dailyStreak || 0;
  const totalSessions = userProgress?.totalSessions || 0;
  const bestScore = userProgress?.bestScore || 0;
  const avgScore = Math.round(userProgress?.averageScore || 0);
  const activeDays = userProgress?.totalActiveDays || 0;

  const allActivity = recentActivity.slice(0, 6).map(a => ({
    id: a.id,
    type: a.activityType,
    score: a.score,
    date: a.createdAt,
  }));

  const filteredSaved = savedQuestions.filter(q => q.type === savedTab);

  return (
    <DashboardLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <main style={{ flex: 1, overflowY: 'auto', background: 'hsl(222.2, 84%, 4.9%)', position: 'relative', minHeight: '100vh' }}>
        {/* Aurora */}
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '80vw', height: 340, background: 'radial-gradient(ellipse at bottom center, rgba(37,99,235,0.13) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto', padding: '80px 24px 120px' }}>

          {/* Greeting */}
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', color: '#f8fafc', margin: 0, lineHeight: 1.15 }}>
            {getGreeting()}, {session?.user?.name?.split(' ')[0] || 'there'}.
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', color: 'hsl(215, 15%, 55%)', marginTop: 8, marginBottom: 56 }}>
            {totalSessions === 0
              ? 'Start your first practice session today.'
              : streak > 0
              ? `${streak}-day streak — keep it going.`
              : 'Pick up where you left off.'}
          </p>

          {/* Stats Row */}
          <SectionLabel>Overview</SectionLabel>
          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', marginBottom: 64 }}>
            {[
              { label: 'Sessions', value: String(totalSessions) },
              { label: 'Best Score', value: bestScore > 0 ? String(Math.round(bestScore)) : '\u2014' },
              { label: 'Avg Score', value: avgScore > 0 ? String(avgScore) : '\u2014' },
              { label: 'Streak', value: `${streak}d` },
              { label: 'Active Days', value: String(activeDays) },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(215, 15%, 45%)', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.6rem', fontWeight: 600, color: '#f8fafc', lineHeight: 1 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* ── Bottom sections ── */}
          <div style={{ marginTop: 40 }} />

          {/* Saved Questions */}
          <SectionLabel>Saved Questions · {savedQuestions.length}</SectionLabel>

          <div style={{ display: 'flex', gap: 20, marginBottom: 16, borderBottom: '1px solid hsl(220, 20%, 18%)' }}>
            {(['BEHAVIORAL', 'TECHNICAL'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setSavedTab(tab)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', paddingBottom: 10,
                  fontFamily: "'Inter', sans-serif", fontSize: '0.68rem', fontWeight: 500,
                  letterSpacing: '0.06em', textTransform: 'capitalize',
                  color: savedTab === tab ? '#3b82f6' : 'hsl(215, 15%, 40%)',
                  borderBottom: savedTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
                  transition: 'color 0.15s ease',
                }}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()} ({savedQuestions.filter(q => q.type === tab).length})
              </button>
            ))}
          </div>

          {filteredSaved.length === 0 ? (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'hsl(215, 15%, 38%)', padding: '16px 0', marginBottom: 64 }}>
              No {savedTab.toLowerCase()} questions saved yet.
            </p>
          ) : (
            <div style={{ marginBottom: 64 }}>
              {filteredSaved.slice(0, 5).map((q, i) => (
                <div
                  key={q.id}
                  onClick={() => {
                    if (q.type === 'TECHNICAL') {
                      const numMatch = q.questionId.match(/^technical-(\d+)$/);
                      const leetcodeNumber = numMatch ? parseInt(numMatch[1]) : null;
                      localStorage.setItem('practiceTechnicalQuestion', JSON.stringify({ leetcodeNumber, questionText: q.questionText }));
                      router.push('/dashboard/technical');
                    } else {
                      localStorage.setItem('practiceQuestion', JSON.stringify(q));
                      router.push('/interview');
                    }
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                    padding: '12px 0', cursor: 'pointer',
                    borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  }}
                  onMouseEnter={e => { const t = e.currentTarget; const qt = t.querySelector<HTMLElement>('.q-text'); const qa = t.querySelector<HTMLElement>('.q-arrow'); if (qt) qt.style.color = '#f8fafc'; if (qa) qa.style.opacity = '1'; }}
                  onMouseLeave={e => { const t = e.currentTarget; const qt = t.querySelector<HTMLElement>('.q-text'); const qa = t.querySelector<HTMLElement>('.q-arrow'); if (qt) qt.style.color = 'hsl(215, 15%, 55%)'; if (qa) qa.style.opacity = '0'; }}
                >
                  <span className="q-text" style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: 'hsl(215, 15%, 55%)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 0.15s ease' }}>
                    {q.questionText}
                  </span>
                  <span className="q-arrow" style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: '#3b82f6', flexShrink: 0, opacity: 0, transition: 'opacity 0.15s ease' }}>
                    Practice →
                  </span>
                </div>
              ))}
              {filteredSaved.length > 5 && (
                <div style={{ paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <button
                    onClick={() => router.push('/dashboard/saved-questions')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: 'hsl(215, 15%, 40%)', padding: 0, transition: 'color 0.15s ease' }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.color = '#f8fafc'; }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.color = 'hsl(215, 15%, 40%)'; }}
                  >
                    View all {filteredSaved.length} →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Recent Activity */}
          <SectionLabel>Recent Activity</SectionLabel>
          {dashboardLoading ? (
            <div style={{ padding: '32px 0', textAlign: 'center' }}>
              <div style={{ width: 20, height: 20, border: '2px solid transparent', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
            </div>
          ) : allActivity.length > 0 ? (
            <div style={{ marginBottom: 64 }}>
              {allActivity.map((item, i) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: '#f8fafc', flex: 1 }}>
                    {ACTIVITY_TYPE_LABELS[item.type] || item.type} {item.type === 'resume' ? 'Review' : 'Practice'}
                  </span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: 'hsl(215, 15%, 40%)', flex: 1, textAlign: 'center' }}>
                    {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', fontWeight: 600, color: '#3b82f6', minWidth: 36, textAlign: 'right' }}>
                    {item.score ? Math.round(item.score) : '\u2014'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'hsl(215, 15%, 38%)', padding: '16px 0' }}>
              No recent activity. Start practicing to see your history.
            </p>
          )}

        </div>
      </main>
    </DashboardLayout>
  );
}

export default function DashboardPageWithSuspense() {
  return (
    <SubscriptionGate>
      <Suspense fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'hsl(222.2, 84%, 4.9%)' }}>
          <div style={{ width: 32, height: 32, border: '2px solid transparent', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      }>
        <DashboardPage />
      </Suspense>
    </SubscriptionGate>
  );
}
