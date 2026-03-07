"use client"

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import SubscriptionGate from '@/components/SubscriptionGate';

/* ───────── Types ───────── */

interface UserStats {
  dailyStreak?: number;
  longestStreak?: number;
  currentStreak?: number;
  totalSessions?: number;
  totalInterviews?: number;
  totalResumeChecks?: number;
  resumeChecks?: number;
  bestInterviewScore?: number;
  bestResumeScore?: number;
  bestTechnicalScore?: number;
  bestBehavioralScore?: number;
  bestScore?: number;
  averageScore?: number;
  totalActiveDays?: number;
  totalTimeMinutes?: number;
  techTotalSolved?: number;
  techTotalCorrect?: number;
  techAvgScore?: number;
  techByTopic?: Record<string, { solved: number; correct: number }>;
  techByDifficulty?: Record<string, { solved: number; correct: number }>;
  behavTotalSessions?: number;
  behavAvgScore?: number;
  sdTotalSessions?: number;
  sdAvgScore?: number;
  portfolioTotalReviews?: number;
  portfolioBestScore?: number;
}

interface ActivityItem {
  id: string;
  activityType: string;
  problemTitle?: string;
  topic?: string;
  difficulty?: string;
  score?: number;
  isCorrect?: boolean;
  durationSec?: number;
  createdAt: string;
}

/* ───────── Heatmap ───────── */

function ActivityHeatmap({ activities }: { activities: ActivityItem[] }) {
  const weeks = 42;
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);

  const countByDay = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of activities) {
      const d = new Date(a.createdAt).toISOString().slice(0, 10);
      map[d] = (map[d] || 0) + 1;
    }
    return map;
  }, [activities]);

  const cells = useMemo(() => {
    const result: { date: string; count: number; dayOfWeek: number; weekIdx: number }[] = [];
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (weeks * 7) + (7 - today.getDay()));
    for (let w = 0; w < weeks; w++) {
      for (let d = 0; d < 7; d++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(cellDate.getDate() + w * 7 + d);
        if (cellDate > today) continue;
        const dateStr = cellDate.toISOString().slice(0, 10);
        result.push({ date: dateStr, count: countByDay[dateStr] || 0, dayOfWeek: d, weekIdx: w });
      }
    }
    return result;
  }, [countByDay, today]);

  const maxCount = Math.max(1, ...cells.map(c => c.count));

  const getColor = (count: number) => {
    if (count === 0) return 'rgba(255,255,255,0.03)';
    const intensity = count / maxCount;
    if (intensity > 0.75) return 'rgba(59,130,246,0.7)';
    if (intensity > 0.5) return 'rgba(59,130,246,0.45)';
    if (intensity > 0.25) return 'rgba(59,130,246,0.25)';
    return 'rgba(59,130,246,0.12)';
  };

  const monthLabels = useMemo(() => {
    const labels: { label: string; weekIdx: number }[] = [];
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (weeks * 7) + (7 - today.getDay()));
    let lastMonth = -1;
    for (let w = 0; w < weeks; w++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + w * 7);
      if (d.getMonth() !== lastMonth) {
        lastMonth = d.getMonth();
        labels.push({ label: d.toLocaleDateString('en-US', { month: 'short' }), weekIdx: w });
      }
    }
    return labels;
  }, [today]);

  const cellSize = 14;
  const gap = 3;

  return (
    <div>
      <div style={{ display: 'flex', marginLeft: 28, marginBottom: 6, position: 'relative', height: 14 }}>
        {monthLabels.map((m, i) => (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: m.weekIdx * (cellSize + gap),
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.58rem',
              color: 'hsl(215, 15%, 45%)',
              letterSpacing: '0.03em',
            }}
          >
            {m.label}
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap, paddingTop: 0 }}>
          {['', 'M', '', 'W', '', 'F', ''].map((label, i) => (
            <div key={i} style={{ height: cellSize, display: 'flex', alignItems: 'center', fontFamily: "'Inter', sans-serif", fontSize: '0.52rem', color: 'hsl(215, 15%, 38%)', width: 20, justifyContent: 'flex-end', paddingRight: 4 }}>
              {label}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap }}>
          {Array.from({ length: weeks }, (_, w) => (
            <div key={w} style={{ display: 'flex', flexDirection: 'column', gap }}>
              {Array.from({ length: 7 }, (_, d) => {
                const cell = cells.find(c => c.weekIdx === w && c.dayOfWeek === d);
                return (
                  <div
                    key={d}
                    title={cell ? `${cell.date}: ${cell.count} sessions` : ''}
                    style={{ width: cellSize, height: cellSize, borderRadius: 2, background: cell ? getColor(cell.count) : 'transparent' }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10, marginLeft: 28 }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.52rem', color: 'hsl(215, 15%, 38%)', marginRight: 4 }}>Less</span>
        {[0, 0.12, 0.25, 0.45, 0.7].map((v, i) => (
          <div key={i} style={{ width: cellSize, height: cellSize, borderRadius: 2, background: v === 0 ? 'rgba(255,255,255,0.03)' : `rgba(59,130,246,${v})` }} />
        ))}
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.52rem', color: 'hsl(215, 15%, 38%)', marginLeft: 4 }}>More</span>
      </div>
    </div>
  );
}

/* ───────── Main Page ───────── */

function ProgressPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status === 'loading' || !session?.user?.id) return;
    (async () => {
      setLoading(true);
      try {
        const [s, h] = await Promise.all([
          fetch('/api/user-stats'),
          fetch('/api/stats/history?page=1&type=all'),
        ]);
        if (s.ok) { const d = await s.json(); setStats(d.stats || {}); }
        if (h.ok) { const d = await h.json(); setActivities(d.activities || []); }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [session, status, router]);

  const correct = stats?.techTotalCorrect || 0;
  const solved = stats?.techTotalSolved || 0;
  const score = Math.round(stats?.averageScore || 0);
  const sessions = (stats?.totalInterviews || 0) + (stats?.totalResumeChecks || stats?.resumeChecks || 0);
  const streak = stats?.currentStreak || stats?.dailyStreak || 0;
  const bestStreak = stats?.longestStreak || 0;
  const accuracy = solved > 0 ? Math.round((correct / solved) * 100) : 0;

  if (status === 'loading' || loading) {
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

  return (
    <DashboardLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
      `}</style>
      <main style={{ flex: 1, overflowY: 'auto', background: 'hsl(222.2, 84%, 4.9%)', position: 'relative' }}>
        {/* Aurora */}
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '80vw', height: 340, background: 'radial-gradient(ellipse at bottom center, rgba(37,99,235,0.13) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto', padding: '80px 24px 60px' }}>

          {/* Title */}
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', color: '#f8fafc', margin: 0, lineHeight: 1.15 }}>
            Progress
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', color: 'hsl(215, 15%, 55%)', marginTop: 8, marginBottom: 48 }}>
            Track your preparation across every feature.
          </p>

          {/* Top Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, marginBottom: 48 }}>
            {[
              { label: 'Sessions', value: String(sessions) },
              { label: 'Avg Score', value: score > 0 ? String(score) : '\u2014' },
              { label: 'Solved', value: String(solved) },
              { label: 'Streak', value: `${streak}d` },
              { label: 'Best', value: `${bestStreak}d` },
              { label: 'Accuracy', value: correct > 0 ? `${accuracy}%` : '\u2014' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(215, 15%, 45%)', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.6rem', fontWeight: 600, color: '#f8fafc', lineHeight: 1 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Heatmap */}
          <SectionLabel>Activity</SectionLabel>
          <div style={{ marginBottom: 48, overflowX: 'auto' }}>
            <ActivityHeatmap activities={activities} />
          </div>

          {/* Feature Breakdown — blue-only */}
          <SectionLabel>Breakdown</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 48 }}>
            {[
              { label: 'Technical', val: stats?.techTotalSolved || 0, sub: `Avg ${Math.round(stats?.techAvgScore || 0)}` },
              { label: 'Behavioral', val: stats?.behavTotalSessions || 0, sub: `Avg ${Math.round(stats?.behavAvgScore || 0)}` },
              { label: 'Sys Design', val: stats?.sdTotalSessions || 0, sub: `Avg ${Math.round(stats?.sdAvgScore || 0)}` },
              { label: 'Resume', val: stats?.totalResumeChecks || stats?.resumeChecks || 0, sub: `Best ${stats?.bestResumeScore || 0}` },
              { label: 'Portfolio', val: stats?.portfolioTotalReviews || 0, sub: `Best ${stats?.portfolioBestScore || 0}` },
            ].map(f => (
              <div key={f.label}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'hsl(215, 15%, 45%)', marginBottom: 8, whiteSpace: 'nowrap' }}>{f.label}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.6rem', fontWeight: 600, color: '#f8fafc', lineHeight: 1, marginBottom: 4 }}>{f.val}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.68rem', color: 'hsl(215, 15%, 40%)', whiteSpace: 'nowrap' }}>{f.sub}</div>
              </div>
            ))}
          </div>

        </div>
      </main>
    </DashboardLayout>
  );
}

/* ───────── Shared ───────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'hsl(215, 20%, 65%)', marginBottom: 16 }}>
      {children}
    </h2>
  );
}

/* ───────── Gate ───────── */

export default function ProgressPageWithGate() {
  return (
    <SubscriptionGate>
      <ProgressPage />
    </SubscriptionGate>
  );
}
