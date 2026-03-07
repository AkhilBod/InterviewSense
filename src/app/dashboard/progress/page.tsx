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
  weeklyGoal?: number;
  weeklyProgress?: number;
  scoreImprovement?: number;
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

/* ───────── Score Over Time Graph ───────── */

const TYPE_LABELS: Record<string, string> = {
  behavioral: 'Behavioral',
  technical: 'Technical',
  resume: 'Resume',
  system_design: 'Sys Design',
  portfolio: 'Portfolio',
  career: 'Career',
};

function ScoreGraph({ activities }: { activities: ActivityItem[] }) {
  const scored = useMemo(() =>
    activities.filter(a => a.score != null && a.score > 0)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [activities]
  );

  if (scored.length < 2) {
    return (
      <div style={{ padding: '32px 0', textAlign: 'center', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'hsl(215, 15%, 38%)' }}>
        Complete more sessions to see your score trend.
      </div>
    );
  }

  const W = 680, H = 200, PX = 40, PY = 24, PB = 28;
  const plotW = W - PX * 2, plotH = H - PY - PB;
  const minScore = Math.max(0, Math.min(...scored.map(s => s.score!)) - 10);
  const maxScore = Math.min(100, Math.max(...scored.map(s => s.score!)) + 10);
  const range = maxScore - minScore || 1;

  const points = scored.map((s, i) => ({
    x: PX + (i / (scored.length - 1)) * plotW,
    y: PY + plotH - ((s.score! - minScore) / range) * plotH,
    score: s.score!,
    type: s.activityType,
    date: new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1].x},${PY + plotH} L${points[0].x},${PY + plotH} Z`;

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(pct => {
    const val = Math.round(minScore + range * pct);
    const y = PY + plotH - pct * plotH;
    return { val, y };
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      {gridLines.map((g, i) => (
        <g key={i}>
          <line x1={PX} y1={g.y} x2={W - PX} y2={g.y} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
          <text x={PX - 8} y={g.y + 3.5} textAnchor="end" fill="hsl(215, 15%, 38%)" fontSize={9} fontFamily="'JetBrains Mono', monospace">{g.val}</text>
        </g>
      ))}
      <path d={areaPath} fill="url(#scoreGradient)" />
      <defs>
        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(59,130,246,0.15)" />
          <stop offset="100%" stopColor="rgba(59,130,246,0)" />
        </linearGradient>
      </defs>
      <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill="#3b82f6" stroke="hsl(222.2, 84%, 4.9%)" strokeWidth={2} />
          <title>{`${p.date} \u00B7 ${TYPE_LABELS[p.type] || p.type} \u00B7 ${p.score}`}</title>
        </g>
      ))}
      {[0, Math.floor(points.length / 2), points.length - 1].filter((v, i, a) => a.indexOf(v) === i).map(idx => (
        <text key={idx} x={points[idx].x} y={H - 4} textAnchor="middle" fill="hsl(215, 15%, 38%)" fontSize={9} fontFamily="'Inter', sans-serif">{points[idx].date}</text>
      ))}
    </svg>
  );
}

/* ───────── Topic Bars ───────── */

function TopicBars({ data }: { data: Record<string, { solved: number; correct: number }> }) {
  const entries = Object.entries(data).sort((a, b) => b[1].solved - a[1].solved);
  if (entries.length === 0) return (
    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'hsl(215, 15%, 38%)', padding: '12px 0' }}>No topic data yet.</div>
  );
  const maxSolved = Math.max(...entries.map(([, v]) => v.solved));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {entries.slice(0, 8).map(([topic, { solved, correct }]) => {
        const pct = maxSolved > 0 ? (solved / maxSolved) * 100 : 0;
        const acc = solved > 0 ? Math.round((correct / solved) * 100) : 0;
        return (
          <div key={topic}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'hsl(215, 15%, 65%)' }}>{topic}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', color: 'hsl(215, 15%, 45%)' }}>{solved} solved · {acc}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 3, width: `${pct}%`, background: 'rgba(59,130,246,0.45)', transition: 'width 0.5s ease' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ───────── Helpers ───────── */

function formatDuration(sec: number): string {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function formatMinutes(min: number): string {
  if (min < 60) return `${Math.round(min)}m`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
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
          fetch('/api/stats/history?page=1&type=all&limit=100'),
        ]);
        if (s.ok) { const d = await s.json(); setStats(d.stats || {}); }
        if (h.ok) { const d = await h.json(); setActivities(d.activities || []); }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [session, status, router]);

  const solved = stats?.techTotalSolved || 0;
  const correct = stats?.techTotalCorrect || 0;
  const accuracy = solved > 0 ? Math.round((correct / solved) * 100) : 0;
  const totalTime = stats?.totalTimeMinutes || 0;
  const weeklyGoal = stats?.weeklyGoal || 3;
  const weeklyProgress = stats?.weeklyProgress || 0;
  const weeklyPct = Math.min(100, Math.round((weeklyProgress / weeklyGoal) * 100));

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

  const techByTopic = (stats?.techByTopic && typeof stats.techByTopic === 'object') ? stats.techByTopic : {};
  const techByDiff = (stats?.techByDifficulty && typeof stats.techByDifficulty === 'object') ? stats.techByDifficulty : {};

  return (
    <DashboardLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
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

          {/* Stats */}
          <div style={{ display: 'flex', gap: 56, flexWrap: 'wrap', marginBottom: 48 }}>
            {[
              { label: 'Time Practiced', value: totalTime > 0 ? formatMinutes(totalTime) : '\u2014' },
              { label: 'Problems Solved', value: String(solved) },
              { label: 'Accuracy', value: accuracy > 0 ? `${accuracy}%` : '\u2014' },
              { label: 'Weekly Goal', value: `${weeklyProgress}/${weeklyGoal}` },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(215, 15%, 45%)', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.6rem', fontWeight: 600, color: '#f8fafc', lineHeight: 1 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Weekly Goal Bar */}
          {weeklyGoal > 0 && (
            <div style={{ marginBottom: 48 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: 'hsl(215, 15%, 55%)' }}>
                  {weeklyProgress >= weeklyGoal ? 'Weekly goal reached!' : `${weeklyGoal - weeklyProgress} more to hit your goal`}
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: '#3b82f6' }}>{weeklyPct}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 3, width: `${weeklyPct}%`, background: '#3b82f6', transition: 'width 0.5s ease' }} />
              </div>
            </div>
          )}

          {/* Score Over Time */}
          <SectionLabel>Score Trend</SectionLabel>
          <div style={{ marginBottom: 48, overflowX: 'auto' }}>
            <ScoreGraph activities={activities} />
          </div>

          {/* Heatmap */}
          <SectionLabel>Activity</SectionLabel>
          <div style={{ marginBottom: 48, overflowX: 'auto' }}>
            <ActivityHeatmap activities={activities} />
          </div>

          {/* Feature Breakdown */}
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

          {/* Best Scores */}
          <SectionLabel>Best Scores</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 48 }}>
            {[
              { label: 'Interview', value: stats?.bestInterviewScore || 0 },
              { label: 'Behavioral', value: stats?.bestBehavioralScore || 0 },
              { label: 'Technical', value: stats?.bestTechnicalScore || 0 },
              { label: 'Resume', value: stats?.bestResumeScore || 0 },
            ].map(b => (
              <div key={b.label}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'hsl(215, 15%, 45%)', marginBottom: 8, whiteSpace: 'nowrap' }}>{b.label}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.4rem', fontWeight: 600, color: b.value > 0 ? '#3b82f6' : 'hsl(215, 15%, 30%)', lineHeight: 1 }}>
                  {b.value > 0 ? Math.round(b.value) : '\u2014'}
                </div>
              </div>
            ))}
          </div>

          {/* Technical: Difficulty Breakdown */}
          {Object.keys(techByDiff).length > 0 && (
            <>
              <SectionLabel>Difficulty</SectionLabel>
              <div style={{ display: 'flex', gap: 48, marginBottom: 48 }}>
                {(['easy', 'medium', 'hard'] as const).filter(d => techByDiff[d]).map(d => {
                  const { solved: s, correct: c } = techByDiff[d]!;
                  return (
                    <div key={d}>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(215, 15%, 45%)', marginBottom: 6 }}>{d}</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.6rem', fontWeight: 600, color: '#f8fafc', lineHeight: 1 }}>{s}<span style={{ fontSize: '0.85rem', color: 'hsl(215, 15%, 40%)' }}> solved</span></div>
                      {c > 0 && <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: 'hsl(215, 15%, 45%)', marginTop: 4 }}>{Math.round((c / s) * 100)}% correct</div>}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Technical: Topic Breakdown */}
          {Object.keys(techByTopic).length > 0 && (
            <>
              <SectionLabel>Topics</SectionLabel>
              <div style={{ marginBottom: 48 }}>
                <TopicBars data={techByTopic} />
              </div>
            </>
          )}

          {/* Recent Activity Feed */}
          <SectionLabel>Recent Sessions</SectionLabel>
          {activities.length > 0 ? (
            <div style={{ marginBottom: 48 }}>
              {activities.slice(0, 15).map((a, i) => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: '#f8fafc', fontWeight: 500 }}>
                        {TYPE_LABELS[a.activityType] || a.activityType}
                      </span>
                      {a.problemTitle && (
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: 'hsl(215, 15%, 50%)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {a.problemTitle}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 2 }}>
                      {a.topic && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.65rem', color: 'hsl(215, 15%, 40%)' }}>{a.topic}</span>}
                      {a.difficulty && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.65rem', color: 'hsl(215, 15%, 45%)' }}>{a.difficulty}</span>}
                      {a.durationSec != null && a.durationSec > 0 && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.65rem', color: 'hsl(215, 15%, 40%)' }}>{formatDuration(a.durationSec)}</span>}
                    </div>
                  </div>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.68rem', color: 'hsl(215, 15%, 40%)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                    {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', fontWeight: 600, color: a.score ? '#3b82f6' : 'hsl(215, 15%, 30%)', minWidth: 32, textAlign: 'right', flexShrink: 0 }}>
                    {a.score ? Math.round(a.score) : a.isCorrect != null ? (a.isCorrect ? '\u2713' : '\u2717') : '\u2014'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: 'hsl(215, 15%, 38%)', padding: '16px 0', marginBottom: 48 }}>
              No sessions yet. Start practicing to build your history.
            </p>
          )}

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
