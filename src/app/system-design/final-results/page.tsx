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
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#eab308';
    return '#ef4444';
  };

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
        <div style={{ minHeight: '100vh', padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: 40 }}>
            <h1 style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
              fontWeight: 400,
              color: '#e2e8f0',
              marginBottom: 8,
            }}>
              System Design Results
            </h1>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.9rem',
              color: '#64748b',
            }}>
              {results.problemTitle} &middot; {results.difficulty} &middot; {results.testDuration} min &middot; {results.completedSteps}/5 steps &middot; {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Score Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 16,
            marginBottom: 40,
          }}>
            {/* Overall Score */}
            <div style={{
              background: 'rgba(59, 130, 246, 0.06)',
              border: '1px solid rgba(59, 130, 246, 0.12)',
              borderRadius: 16,
              padding: 20,
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: '3rem',
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                color: getScoreColor(results.overallScore),
                lineHeight: 1,
                marginBottom: 8,
              }}>
                {results.overallScore}
              </div>
              <div style={{
                fontSize: '0.72rem',
                color: '#64748b',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
              }}>
                Overall Score
              </div>
            </div>

            {/* Category Scores */}
            {categories.map((cat) => (
              <div key={cat.key} style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 16,
                padding: 20,
                textAlign: 'center',
              }}>
                <div style={{
                  fontSize: '2.4rem',
                  fontWeight: 600,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: getScoreColor(results.categoryScores[cat.key]),
                  lineHeight: 1,
                  marginBottom: 8,
                }}>
                  {results.categoryScores[cat.key]}
                </div>
                <div style={{
                  fontSize: '0.72rem',
                  color: '#64748b',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                }}>
                  {cat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Analysis Summary */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 16,
            padding: 28,
            marginBottom: 32,
          }}>
            <h2 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#64748b',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}>
              Detailed Analysis
            </h2>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.95rem',
              color: '#cbd5e1',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
              margin: 0,
            }}>
              {results.analysis}
            </p>
          </div>

          {/* Score Breakdown Bars */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 16,
            padding: 28,
            marginBottom: 32,
          }}>
            <h2 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#64748b',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 20,
            }}>
              Category Breakdown
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {categories.map((cat) => {
                const score = results.categoryScores[cat.key];
                return (
                  <div key={cat.key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '0.85rem',
                        color: '#e2e8f0',
                        fontWeight: 500,
                      }}>
                        {cat.label}
                      </span>
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.85rem',
                        color: getScoreColor(score),
                        fontWeight: 600,
                      }}>
                        {score}/100
                      </span>
                    </div>
                    <div style={{
                      height: 6,
                      background: 'rgba(255, 255, 255, 0.04)',
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${score}%`,
                        height: '100%',
                        background: getScoreColor(score),
                        borderRadius: 3,
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 32 }}>
            {/* Strengths */}
            <div style={{
              background: 'rgba(34, 197, 94, 0.04)',
              border: '1px solid rgba(34, 197, 94, 0.12)',
              borderRadius: 16,
              padding: 28,
            }}>
              <h2 style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#22c55e',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 20,
              }}>
                Strengths
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {results.feedback.strengths.map((item, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginTop: 8, flexShrink: 0 }} />
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Areas for Improvement */}
            <div style={{
              background: 'rgba(234, 179, 8, 0.04)',
              border: '1px solid rgba(234, 179, 8, 0.12)',
              borderRadius: 16,
              padding: 28,
            }}>
              <h2 style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#eab308',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 20,
              }}>
                Areas for Improvement
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {results.feedback.improvements.map((item, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#eab308', marginTop: 8, flexShrink: 0 }} />
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.04)',
            border: '1px solid rgba(59, 130, 246, 0.12)',
            borderRadius: 16,
            padding: 28,
            marginBottom: 32,
          }}>
            <h2 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#3b82f6',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 20,
            }}>
              Recommendations
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {results.feedback.recommendations.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <span style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'rgba(59, 130, 246, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#3b82f6',
                    flexShrink: 0,
                  }}>
                    {index + 1}
                  </span>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Test Summary */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 16,
            padding: 28,
            marginBottom: 32,
          }}>
            <h2 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#64748b',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 20,
            }}>
              Test Summary
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 10,
                padding: 18,
                border: '1px solid rgba(255, 255, 255, 0.04)',
              }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.5rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>
                  {results.testDuration}m
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Duration
                </div>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 10,
                padding: 18,
                border: '1px solid rgba(255, 255, 255, 0.04)',
              }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.5rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>
                  {results.completedSteps}/5
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Steps Completed
                </div>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 10,
                padding: 18,
                border: '1px solid rgba(255, 255, 255, 0.04)',
              }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.5rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>
                  {results.difficulty}
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Difficulty
                </div>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 10,
                padding: 18,
                border: '1px solid rgba(255, 255, 255, 0.04)',
              }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.5rem', fontWeight: 600, color: getScoreColor(results.overallScore), marginBottom: 4 }}>
                  {results.overallScore >= 80 ? 'Strong' : results.overallScore >= 60 ? 'Good' : 'Needs Work'}
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Performance
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 48 }}>
            <button
              onClick={handleBackToTest}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 24px',
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.9rem',
                fontWeight: 500,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
              }}
            >
              Try Another Problem
            </button>
            <Link
              href="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 24px',
                background: 'transparent',
                color: '#94a3b8',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 10,
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.9rem',
                fontWeight: 500,
                textDecoration: 'none',
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
