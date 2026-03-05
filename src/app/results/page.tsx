'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { generateInterviewSummary, InterviewSummary } from '@/lib/gemini';
import { toast } from "@/components/ui/use-toast";
import { useSession } from 'next-auth/react';

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Inter:wght@400;500;600&display=swap');
`;

function ResultsPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [interviewSummary, setInterviewSummary] = useState<InterviewSummary>({
    jobRole: "Software Engineer",
    company: "Google",
    date: new Date().toLocaleDateString(),
    duration: "24 minutes",
    overallScore: 83,
    strengthAreas: ["Problem solving", "Technical knowledge", "Communication"],
    improvementAreas: ["Leadership examples", "Quantifying achievements", "Brevity"],
    completedQuestions: 5,
    questionScores: [
      { id: 1, question: "Tell me about yourself", score: 86 },
      { id: 2, question: "Describe a challenging project", score: 92 },
      { id: 3, question: "How do you handle conflicting priorities", score: 78 },
      { id: 4, question: "What are your greatest strengths", score: 88 },
      { id: 5, question: "Where do you see yourself in 5 years", score: 71 }
    ],
    fillerWordStats: {
      total: 27,
      mostCommon: "like"
    },
    keywordStats: {
      matched: 14,
      missed: 7,
      mostImpactful: ["algorithms", "distributed systems", "scalability"]
    }
  });
  
  useEffect(() => {
    const loadInterviewSummary = async () => {
      setIsLoading(true);
      try {
        const answersJson = localStorage.getItem('interviewAnswers');
        if (!answersJson) {
          toast({ title: "No interview data found", description: "Using sample data instead", variant: "destructive" });
          setIsLoading(false);
          return;
        }
        const summary = await generateInterviewSummary();
        setInterviewSummary(summary);
        localStorage.removeItem('interviewAnswers');
        localStorage.removeItem('visibleQuestions');
        localStorage.removeItem('completedQuestionsCount');
        const resumeText = localStorage.getItem('resume') || '';
        if (resumeText.trim() !== '') {
          toast({ title: "Resume-enhanced analysis", description: "Your interview analysis includes resume context", variant: "default" });
        }
      } catch (error) {
        console.error('Error loading interview summary:', error);
        toast({ title: "Error generating summary", description: "Using sample data instead", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    loadInterviewSummary();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#eab308';
    return '#ef4444';
  };

  const getBarBg = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#eab308';
    return '#ef4444';
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#94a3b8', fontFamily: "'Inter', sans-serif" }}>Analyzing your interview performance...</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference * (1 - interviewSummary.overallScore / 100);
  const keywordMatchRate = Math.round((interviewSummary.keywordStats.matched / (interviewSummary.keywordStats.matched + interviewSummary.keywordStats.missed)) * 100);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <style>{pageStyles}</style>
        <div id="interview-results-content" style={{ minHeight: '100vh', padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: 40 }}>
            <h1 style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
              fontWeight: 400,
              color: '#e2e8f0',
              marginBottom: 8,
            }}>
              Interview Performance
            </h1>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.9rem',
              color: '#64748b',
            }}>
              {interviewSummary.jobRole} at {interviewSummary.company} · {interviewSummary.date}
            </p>
          </div>

          {/* Score Overview */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 20,
            marginBottom: 40,
          }}>
            {/* Overall Score */}
            <div style={{
              background: 'rgba(59, 130, 246, 0.06)',
              border: '1px solid rgba(59, 130, 246, 0.12)',
              borderRadius: 16,
              padding: 28,
              textAlign: 'center',
            }}>
              <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 12px' }}>
                <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="50" cy="50" r="42" stroke="rgba(71,85,105,0.3)" strokeWidth="6" fill="transparent" />
                  <circle cx="50" cy="50" r="42" stroke={getScoreColor(interviewSummary.overallScore)} strokeWidth="6" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${getScoreColor(interviewSummary.overallScore)})` }} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 700, fontFamily: "'Inter', sans-serif", color: getScoreColor(interviewSummary.overallScore) }}>{interviewSummary.overallScore}</span>
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif" }}>
                Overall Score
              </div>
            </div>

            {/* Stats Cards */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28, textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 600, fontFamily: "'Inter', sans-serif", color: '#e2e8f0', lineHeight: 1, marginBottom: 8 }}>
                {interviewSummary.duration.split(' ')[0]}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif" }}>Minutes</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28, textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 600, fontFamily: "'Inter', sans-serif", color: '#e2e8f0', lineHeight: 1, marginBottom: 8 }}>
                {interviewSummary.completedQuestions}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif" }}>Questions</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28, textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 600, fontFamily: "'Inter', sans-serif", color: '#eab308', lineHeight: 1, marginBottom: 8 }}>
                {interviewSummary.fillerWordStats.total}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif" }}>Filler Words</div>
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 32 }}>
            <div style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.12)', borderRadius: 16, padding: 28 }}>
              <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: '#22c55e', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
                Key Strengths
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {interviewSummary.strengthAreas.map((strength, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginTop: 8, flexShrink: 0 }} />
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6 }}>{strength}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'rgba(234,179,8,0.04)', border: '1px solid rgba(234,179,8,0.12)', borderRadius: 16, padding: 28 }}>
              <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: '#eab308', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
                Areas for Growth
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {interviewSummary.improvementAreas.map((area, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#eab308', marginTop: 8, flexShrink: 0 }} />
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6 }}>{area}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Question Performance */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 32 }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28 }}>
              <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: '#64748b', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
                Question Performance
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {interviewSummary.questionScores.map((item) => (
                  <div key={item.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', color: '#cbd5e1', flex: 1, paddingRight: 16 }}>{item.question}</span>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', fontWeight: 700, color: getScoreColor(item.score), minWidth: 50, textAlign: 'right' }}>{item.score}%</span>
                    </div>
                    <div style={{ height: 6, width: '100%', background: 'rgba(71,85,105,0.3)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${item.score}%`, background: getBarBg(item.score), borderRadius: 3, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Keyword Analysis */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28 }}>
              <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: '#64748b', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
                Keyword Analysis
              </h2>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: '#cbd5e1' }}>Match Rate</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', fontWeight: 700, color: '#3b82f6' }}>{keywordMatchRate}%</span>
                </div>
                <div style={{ height: 6, background: 'rgba(71,85,105,0.3)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${keywordMatchRate}%`, background: '#3b82f6', borderRadius: 3 }} />
                </div>
              </div>
              <div>
                <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  High-Impact Keywords
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {interviewSummary.keywordStats.mostImpactful.map((keyword) => (
                    <span key={keyword} style={{
                      background: 'rgba(59,130,246,0.1)',
                      border: '1px solid rgba(59,130,246,0.2)',
                      borderRadius: 6,
                      padding: '4px 10px',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.75rem',
                      color: '#93c5fd',
                    }}>
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.12)', borderRadius: 10 }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: '#fbbf24' }}>
                  Most common filler: &quot;{interviewSummary.fillerWordStats.mostCommon}&quot;
                </span>
              </div>
            </div>
          </div>

          {/* AI Coach Feedback */}
          <div style={{ background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.12)', borderRadius: 16, padding: 28, marginBottom: 32 }}>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: '#3b82f6', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
              AI Coach Feedback
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.7 }}>
                Based on your mock interview for <strong style={{ color: '#e2e8f0' }}>{interviewSummary.jobRole}</strong> at <strong style={{ color: '#e2e8f0' }}>{interviewSummary.company}</strong>, here are observations and recommendations:
              </p>
              <div>
                <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Strengths:</h3>
                <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <li style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6 }}>Your technical knowledge came across clearly with good problem-solving skills.</li>
                  <li style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6 }}>You articulated thoughts well and maintained good communication throughout.</li>
                  <li style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6 }}>Your answers to behavioral questions followed a logical structure.</li>
                </ul>
              </div>
              <div>
                <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Areas for Improvement:</h3>
                <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <li style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6 }}>Include more examples of leadership and initiative in your responses.</li>
                  <li style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6 }}>Try to quantify achievements with specific metrics and numbers.</li>
                  <li style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6 }}>Practice being more concise while still being thorough.</li>
                  <li style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6 }}>Watch for filler words like &quot;{interviewSummary.fillerWordStats.mostCommon}&quot;.</li>
                </ul>
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.7 }}>
                For a <strong style={{ color: '#e2e8f0' }}>{interviewSummary.jobRole}</strong> position, emphasize your experience with system design, algorithms, and collaborative problem-solving. Prepare more specific examples that demonstrate how your technical skills translated to business impact.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 48 }}>
            <Link href="/start" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px',
              background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10,
              fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
            }}>
              Try Another Role
            </Link>
            <Link href="/dashboard" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px',
              background: 'transparent', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
              fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none',
            }}>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default function ResultsPageWithSuspense() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0a0f1e' }}>
        <p style={{ color: '#94a3b8', fontFamily: "'Inter', sans-serif" }}>Loading...</p>
      </div>
    }>
      <ResultsPage />
    </Suspense>
  );
}
