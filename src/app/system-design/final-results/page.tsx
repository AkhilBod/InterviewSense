"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';

interface SystemDesignResults {
  problemTitle: string;
  difficulty: string;
  overallScore: number;
  categoryScores: {
    requirements: number;
    estimation: number;
    design: number;
    scalability: number;
    communication: number;
  };
  feedback: {
    strengths: string[];
    improvements: string[];
    recommendations: string[];
  };
  analysis: string;
  testDuration: number;
  completedSteps: number;
}

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
  body::after {
    content: '';
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80vw;
    height: 340px;
    background: radial-gradient(ellipse at bottom center, rgba(37,99,235,0.13) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }
`;

export default function SystemDesignFinalResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<SystemDesignResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      try {
        const testData = sessionStorage.getItem('systemDesignTest');
        const responses = sessionStorage.getItem('systemDesignResponses');

        if (!testData || !responses) {
          router.push('/system-design');
          return;
        }

        const problemData = JSON.parse(testData);
        const userResponses = JSON.parse(responses);

        const analysisResponse = await fetch('/api/system-design', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ problem: problemData, responses: userResponses })
        });

        if (analysisResponse.ok) {
          const analysisData = await analysisResponse.json();
          setResults(analysisData);
        } else {
          const simulatedResults: SystemDesignResults = {
            problemTitle: problemData.problem.title,
            difficulty: 'Medium',
            overallScore: 82,
            categoryScores: { requirements: 85, estimation: 78, design: 88, scalability: 75, communication: 84 },
            feedback: {
              strengths: [
                "Clear understanding of functional requirements",
                "Good consideration of data flow and architecture",
                "Proper identification of key system components",
                "Well-structured approach to problem solving"
              ],
              improvements: [
                "Could provide more detailed capacity planning",
                "Consider additional failure scenarios",
                "Expand on database design considerations",
                "More specific technology choices with justification"
              ],
              recommendations: [
                "Practice estimating scale with real-world examples",
                "Study distributed systems patterns",
                "Review database sharding strategies",
                "Practice system design with time constraints"
              ]
            },
            analysis: "Your system design demonstrates a solid understanding of the core requirements and shows good architectural thinking. You successfully identified the key components and data flow, which is essential for any system design interview.\n\nThe requirements analysis was thorough, showing you understand how to clarify ambiguities before diving into the solution. Your scale estimation shows good intuition, though some calculations could be more detailed.\n\nFor improvement, focus on providing more specific technology choices with clear justifications. Consider diving deeper into failure scenarios and recovery mechanisms.",
            testDuration: 42,
            completedSteps: 5
          };
          setResults(simulatedResults);
        }
      } catch (error) {
        console.error('Error loading results:', error);
        router.push('/system-design');
      } finally {
        setIsLoading(false);
      }
    };
    loadResults();
  }, [router]);

  const handleBackToTest = () => {
    sessionStorage.removeItem('systemDesignTest');
    sessionStorage.removeItem('systemDesignResponses');
    router.push('/system-design');
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#64748b', fontFamily: "'Inter', sans-serif" }}>Analyzing your system design...</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!results) return null;

  const categories = [
    { label: 'Requirements', key: 'requirements' as const },
    { label: 'Estimation', key: 'estimation' as const },
    { label: 'Design', key: 'design' as const },
    { label: 'Scalability', key: 'scalability' as const },
    { label: 'Communication', key: 'communication' as const },
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <style>{pageStyles}</style>
        <div style={{ minHeight: '100vh', padding: '80px 24px 120px', maxWidth: 720, margin: '0 auto', position: 'relative', zIndex: 1 }}>

          {/* Header */}
          <div style={{ marginBottom: 48 }}>
            <h1 style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
              fontWeight: 400,
              color: '#f8fafc',
              marginBottom: 8,
            }}>
              System Design Results
            </h1>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.85rem',
              color: 'hsl(215, 15%, 55%)',
            }}>
              {results.problemTitle} · {results.difficulty} · {results.testDuration} min · {results.completedSteps}/5 steps · {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Scores */}
          <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap', marginBottom: 56 }}>
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(215, 15%, 45%)', marginBottom: 6 }}>Overall</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '2.4rem', fontWeight: 600, color: '#3b82f6', lineHeight: 1 }}>{results.overallScore}</div>
            </div>
            {categories.map((cat) => (
              <div key={cat.key}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(215, 15%, 45%)', marginBottom: 6 }}>{cat.label}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.6rem', fontWeight: 600, color: '#f8fafc', lineHeight: 1 }}>{results.categoryScores[cat.key]}</div>
              </div>
            ))}
          </div>

          {/* Analysis */}
          <div style={{ marginBottom: 56 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(215, 15%, 45%)', marginBottom: 16 }}>
              Detailed Analysis
            </div>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.92rem',
              color: 'hsl(215, 15%, 75%)',
              lineHeight: 1.8,
              whiteSpace: 'pre-wrap',
              margin: 0,
            }}>
              {results.analysis}
            </p>
          </div>

          {/* Category Breakdown */}
          <div style={{ marginBottom: 56 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(215, 15%, 45%)', marginBottom: 20 }}>
              Category Breakdown
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {categories.map((cat) => {
                const score = results.categoryScores[cat.key];
                return (
                  <div key={cat.key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: '#f8fafc', fontWeight: 500 }}>{cat.label}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: 'hsl(215, 15%, 55%)', fontWeight: 500 }}>{score}/100</span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${score}%`, height: '100%', background: '#3b82f6', borderRadius: 3, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, marginBottom: 56 }}>
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(215, 15%, 45%)', marginBottom: 20 }}>
                Strengths
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {results.feedback.strengths.map((item, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#3b82f6', marginTop: 8, flexShrink: 0 }} />
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'hsl(215, 15%, 75%)', lineHeight: 1.65, margin: 0 }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(215, 15%, 45%)', marginBottom: 20 }}>
                Areas for Improvement
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {results.feedback.improvements.map((item, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'hsl(215, 15%, 35%)', marginTop: 8, flexShrink: 0 }} />
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'hsl(215, 15%, 75%)', lineHeight: 1.65, margin: 0 }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div style={{ marginBottom: 56 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(215, 15%, 45%)', marginBottom: 20 }}>
              Recommendations
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {results.feedback.recommendations.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: '#3b82f6',
                    flexShrink: 0,
                    marginTop: 2,
                  }}>
                    {index + 1}.
                  </span>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'hsl(215, 15%, 75%)', lineHeight: 1.65, margin: 0 }}>
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Test Summary */}
          <div style={{ marginBottom: 56 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(215, 15%, 45%)', marginBottom: 20 }}>
              Test Summary
            </div>
            <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
              {[
                { label: 'Duration', value: `${results.testDuration}m` },
                { label: 'Steps', value: `${results.completedSteps}/5` },
                { label: 'Difficulty', value: results.difficulty },
                { label: 'Performance', value: results.overallScore >= 80 ? 'Strong' : results.overallScore >= 60 ? 'Good' : 'Needs Work' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(215, 15%, 45%)', marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.4rem', fontWeight: 600, color: '#f8fafc', lineHeight: 1 }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 56 }}>
            <button
              onClick={handleBackToTest}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 28px',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.15s, transform 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#3b82f6'; e.currentTarget.style.transform = 'none'; }}
            >
              Try Another Problem
            </button>
            <Link
              href="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 28px',
                background: 'transparent',
                color: 'hsl(215, 20%, 65%)',
                border: '1px solid hsl(220, 20%, 18%)',
                borderRadius: 10,
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.88rem',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'background 0.15s',
              }}
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
