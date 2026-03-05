"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import ProtectedRoute from "@/components/ProtectedRoute";
import { DashboardLayout } from '@/components/DashboardLayout';
import { toast } from "@/components/ui/use-toast";

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
`;

export interface TechnicalAssessmentResult {
  company: string;
  role: string;
  date: string;
  difficulty: string;
  questions: TechnicalQuestionResult[];
  overallScore: number;
  strengths: string[];
  improvementAreas: string[];
  codeFeedback: string;
  explanationFeedback: string;
}

export interface TechnicalQuestionResult {
  id: number;
  leetCodeTitle: string;
  prompt: string;
  code: string;
  codeLanguage: string;
  codeScore: number;
  explanation: string;
  explanationScore: number;
  audioUrl?: string | null;
  feedback?: string;
}

export default function TechnicalAssessmentResultsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<TechnicalAssessmentResult | null>(null);

  useEffect(() => {
    const loadResults = async () => {
      setIsLoading(true);
      try {
        const analyzed = localStorage.getItem("technicalAssessmentResult");
        if (analyzed) {
          setResult(JSON.parse(analyzed));
          setIsLoading(false);
          return;
        }

        const assessmentDataStr = localStorage.getItem("technicalAssessmentData");
        if (!assessmentDataStr) {
          toast({ title: "No assessment data found", description: "Returning to dashboard.", variant: "destructive" });
          router.push('/dashboard');
          return;
        }

        const assessmentData = JSON.parse(assessmentDataStr);
        const question = assessmentData.questions[0];

        try {
          const response = await fetch('/api/technical-assessment', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              company: assessmentData.company,
              role: assessmentData.role,
              difficulty: assessmentData.difficulty,
              question: question.prompt,
              code: question.code,
              explanation: question.explanation
            }),
          });

          const analysis = await response.json();

          const fullResult: TechnicalAssessmentResult = {
            company: assessmentData.company,
            role: assessmentData.role,
            date: new Date(assessmentData.date).toLocaleDateString(),
            difficulty: assessmentData.difficulty,
            overallScore: analysis.overallScore || 0,
            strengths: analysis.strengths || ["Code submitted successfully"],
            improvementAreas: analysis.improvementAreas || ["Unable to analyze automatically"],
            codeFeedback: analysis.codeFeedback || "Analysis not available.",
            explanationFeedback: analysis.explanationFeedback || "Analysis not available.",
            questions: [{
              id: 1,
              leetCodeTitle: question.leetCodeTitle,
              prompt: question.prompt,
              code: question.code,
              codeLanguage: "javascript",
              codeScore: analysis.codeScore || 0,
              explanation: question.explanation,
              explanationScore: analysis.explanationScore || 0,
              audioUrl: question.audioUrl,
              feedback: analysis.codeFeedback || ""
            }]
          };

          localStorage.setItem("technicalAssessmentResult", JSON.stringify(fullResult));
          localStorage.removeItem("technicalAssessmentData");
          setResult(fullResult);
        } catch (analysisError) {
          console.error('Error analyzing solution:', analysisError);
          toast({ title: "Analysis failed", description: "Could not analyze your submission.", variant: "destructive" });
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error loading assessment data:', error);
        router.push('/dashboard');
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

  if (isLoading || !result) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 48, height: 48, border: '3px solid rgba(255,255,255,0.1)',
                borderTopColor: '#3b82f6', borderRadius: '50%',
                animation: 'spin 1s linear infinite', margin: '0 auto 16px',
              }} />
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.95rem', color: '#5a6380' }}>
                Analyzing your technical assessment...
              </p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const codeScore = result.questions?.[0]?.codeScore || 0;
  const explScore = result.questions?.[0]?.explanationScore || 0;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <style>{pageStyles}</style>
        <div style={{
          minHeight: '100vh',
          padding: '48px 24px 64px',
          maxWidth: 820,
          margin: '0 auto',
        }}>
          {/* Title */}
          <h1 style={{
            fontFamily: "'Instrument Serif', serif",
            fontWeight: 400,
            fontSize: 'clamp(2rem, 4vw, 2.6rem)',
            color: '#dde2f0',
            marginBottom: 6,
          }}>
            Technical Assessment
          </h1>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.88rem',
            color: '#5a6380',
            marginBottom: 40,
          }}>
            {result.role} at {result.company} &middot; {result.date} &middot; {result.difficulty} Difficulty
          </p>

          {/* Score Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
            marginBottom: 32,
          }}>
            {[
              { label: 'OVERALL', score: result.overallScore },
              { label: 'CODE QUALITY', score: codeScore },
              { label: 'EXPLANATION', score: explScore },
            ].map((item) => (
              <div key={item.label} style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16,
                padding: 28,
                textAlign: 'center',
              }}>
                <div style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase' as const,
                  color: '#5a6380',
                  marginBottom: 12,
                }}>{item.label}</div>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '2.2rem',
                  fontWeight: 500,
                  color: getScoreColor(item.score),
                  lineHeight: 1,
                  marginBottom: 4,
                }}>{item.score}</div>
                <div style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.75rem',
                  color: '#3e4560',
                }}>/ 100</div>
              </div>
            ))}
          </div>

          {/* Category Breakdown */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16,
            padding: 28,
            marginBottom: 32,
          }}>
            <div style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.68rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              color: '#5a6380',
              marginBottom: 20,
            }}>PERFORMANCE BREAKDOWN</div>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 14 }}>
              {[
                { label: 'Code Quality', score: codeScore },
                { label: 'Explanation', score: explScore },
              ].map((item) => (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: '#8892b0' }}>{item.label}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: getScoreColor(item.score) }}>{item.score}</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
                    <div style={{
                      height: '100%',
                      width: `${item.score}%`,
                      background: getScoreColor(item.score),
                      borderRadius: 3,
                      opacity: 0.7,
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analytics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 16,
            marginBottom: 32,
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16,
              padding: 24,
            }}>
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.62rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase' as const,
                color: '#5a6380',
                marginBottom: 12,
              }}>OVERALL GRADE</div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '2rem',
                fontWeight: 500,
                color: getScoreColor(result.overallScore),
              }}>
                {result.overallScore >= 90 ? 'A' : result.overallScore >= 80 ? 'B+' : result.overallScore >= 70 ? 'B' : result.overallScore >= 60 ? 'C' : 'D'}
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: '#5a6380', marginTop: 2 }}>
                {result.overallScore >= 80 ? 'Strong' : result.overallScore >= 70 ? 'Good' : result.overallScore >= 60 ? 'Average' : 'Needs Work'}
              </div>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16,
              padding: 24,
            }}>
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.62rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase' as const,
                color: '#5a6380',
                marginBottom: 12,
              }}>DIFFICULTY</div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '1.5rem',
                fontWeight: 500,
                color: result.difficulty === 'Easy' ? '#22c55e' : result.difficulty === 'Medium' ? '#eab308' : '#ef4444',
              }}>{result.difficulty}</div>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16,
              padding: 24,
            }}>
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.62rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase' as const,
                color: '#5a6380',
                marginBottom: 12,
              }}>PROBLEMS</div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '2rem',
                fontWeight: 500,
                color: '#dde2f0',
              }}>{result.questions?.length || 1}</div>
            </div>
          </div>

          {/* Strengths */}
          {result.strengths && result.strengths.length > 0 && (
            <div style={{
              background: 'rgba(34,197,94,0.04)',
              border: '1px solid rgba(34,197,94,0.12)',
              borderRadius: 16,
              padding: 28,
              marginBottom: 24,
            }}>
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.68rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase' as const,
                color: '#22c55e',
                marginBottom: 16,
              }}>KEY STRENGTHS</div>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
                {result.strengths.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%', background: '#22c55e',
                      marginTop: 7, flexShrink: 0,
                    }} />
                    <span style={{
                      fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', color: '#b0bec5', lineHeight: 1.6,
                    }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Areas for Improvement */}
          {result.improvementAreas && result.improvementAreas.length > 0 && (
            <div style={{
              background: 'rgba(234,179,8,0.04)',
              border: '1px solid rgba(234,179,8,0.12)',
              borderRadius: 16,
              padding: 28,
              marginBottom: 24,
            }}>
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.68rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase' as const,
                color: '#eab308',
                marginBottom: 16,
              }}>AREAS FOR IMPROVEMENT</div>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
                {result.improvementAreas.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%', background: '#eab308',
                      marginTop: 7, flexShrink: 0,
                    }} />
                    <span style={{
                      fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', color: '#b0bec5', lineHeight: 1.6,
                    }}>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Coach Feedback */}
          <div style={{
            background: 'rgba(59,130,246,0.04)',
            border: '1px solid rgba(59,130,246,0.12)',
            borderRadius: 16,
            padding: 28,
            marginBottom: 24,
          }}>
            <div style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.68rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              color: '#3b82f6',
              marginBottom: 16,
            }}>AI COACH FEEDBACK</div>

            {result.codeFeedback && result.codeFeedback !== 'Analysis not available.' && (
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#7da8d4',
                  marginBottom: 8,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em',
                }}>Code Review</div>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.88rem',
                  color: '#b0bec5',
                  lineHeight: 1.7,
                  margin: 0,
                }}>{result.codeFeedback}</p>
              </div>
            )}

            {result.explanationFeedback && result.explanationFeedback !== 'Analysis not available.' && (
              <div>
                <div style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#7da8d4',
                  marginBottom: 8,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em',
                }}>Explanation Review</div>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.88rem',
                  color: '#b0bec5',
                  lineHeight: 1.7,
                  margin: 0,
                }}>{result.explanationFeedback}</p>
              </div>
            )}
          </div>

          {/* Your Solution */}
          {result.questions?.map((q) => (
            <div key={q.id} style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16,
              padding: 28,
              marginBottom: 24,
            }}>
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.68rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase' as const,
                color: '#5a6380',
                marginBottom: 16,
              }}>YOUR SOLUTION — {q.leetCodeTitle || 'Technical Problem'}</div>

              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#8892b0',
                  marginBottom: 8,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em',
                }}>Code</div>
                <pre style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 10,
                  padding: 16,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.82rem',
                  color: '#b0bec5',
                  overflowX: 'auto',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word' as const,
                  margin: 0,
                }}>
                  <code>{q.code || 'No code submitted'}</code>
                </pre>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: '#5a6380' }}>Code Score:</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', fontWeight: 500, color: getScoreColor(q.codeScore) }}>{q.codeScore}</span>
                </div>
              </div>

              {q.audioUrl && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: '#8892b0',
                    marginBottom: 8,
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                  }}>Recorded Explanation</div>
                  <audio controls src={q.audioUrl} style={{ width: '100%' }} />
                </div>
              )}

              <div>
                <div style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#8892b0',
                  marginBottom: 8,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em',
                }}>Your Explanation</div>
                <div style={{
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 10,
                  padding: 16,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.85rem',
                  color: '#b0bec5',
                  lineHeight: 1.7,
                }}>{q.explanation || 'No explanation provided'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: '#5a6380' }}>Explanation Score:</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', fontWeight: 500, color: getScoreColor(q.explanationScore) }}>{q.explanationScore}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            marginTop: 40,
            flexWrap: 'wrap' as const,
          }}>
            <button
              onClick={() => router.push('/dashboard/technical')}
              style={{
                padding: '12px 28px',
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.85rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Try Another Problem
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              style={{
                padding: '12px 28px',
                background: 'transparent',
                color: '#5a6380',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.85rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#8892b0'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#5a6380'; }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
