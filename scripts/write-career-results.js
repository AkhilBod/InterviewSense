const fs = require('fs');
const path = require('path');

const content = `'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from "@/components/ProtectedRoute"
import { DashboardLayout } from '@/components/DashboardLayout'

const pageStyles = \`
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
\`;

interface RoadmapAnalysis {
  overallScore: number;
  summary: string;
  currentRoleAnalysis: {
    strengths: string[];
    skillGaps: string[];
    marketDemand: number;
  };
  careerPath: {
    phases: Array<{
      title: string;
      timeframe: string;
      description: string;
      keyMilestones: string[];
      skillsToAcquire: string[];
      estimatedSalaryRange: string;
    }>;
  };
  skillsAnalysis: {
    technicalSkills: Array<{
      skill: string;
      importance: number;
      currentLevel: string;
      targetLevel: string;
      learningPriority: string;
    }>;
    softSkills: Array<{
      skill: string;
      importance: number;
      description: string;
    }>;
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  certifications: Array<{
    name: string;
    provider: string;
    priority: string;
    estimatedTime: string;
    description: string;
  }>;
  networking: {
    communities: string[];
    events: string[];
    platforms: string[];
  };
  resources: {
    courses: Array<{
      title: string;
      provider: string;
      type: string;
      duration: string;
    }>;
    books: string[];
    podcasts: string[];
    blogs: string[];
  };
}

export default function CareerRoadmapResultsPage() {
  const router = useRouter()
  const [analysis, setAnalysis] = useState<RoadmapAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedData = localStorage.getItem('careerRoadmapResults');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        if (parsedData.success && parsedData.analysis) {
          setAnalysis(parsedData.analysis);
          setTimeout(() => { localStorage.removeItem('careerRoadmapResults'); }, 5000);
        } else if (parsedData.analysis) {
          setAnalysis(parsedData.analysis);
        } else if (parsedData.overallScore !== undefined) {
          setAnalysis(parsedData);
        } else {
          setAnalysis(null);
        }
      } catch {
        setAnalysis(null);
      }
    } else {
      setAnalysis(null);
    }
    setIsLoading(false);
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#eab308';
    return '#ef4444';
  };

  if (isLoading) {
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
                Loading your career roadmap...
              </p>
              <style>{\`@keyframes spin { to { transform: rotate(360deg); } }\`}</style>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!analysis) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.1rem', color: '#ef4444', marginBottom: 12 }}>
                No Analysis Data Found
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', color: '#5a6380', marginBottom: 24 }}>
                Unable to load your career roadmap analysis.
              </p>
              <button
                onClick={() => router.push('/career-roadmap')}
                style={{
                  padding: '12px 28px', background: '#2563eb', color: '#fff',
                  border: 'none', borderRadius: 10, fontFamily: "'Inter', sans-serif",
                  fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer',
                }}
              >
                Create New Roadmap
              </button>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

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
            Career Roadmap
          </h1>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.88rem',
            color: '#5a6380',
            marginBottom: 40,
          }}>
            {analysis.summary}
          </p>

          {/* Score Card */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
            marginBottom: 32,
          }}>
            <div style={{
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
                textTransform: 'uppercase',
                color: '#5a6380',
                marginBottom: 12,
              }}>READINESS SCORE</div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '2.2rem',
                fontWeight: 500,
                color: getScoreColor(analysis.overallScore),
                lineHeight: 1,
                marginBottom: 4,
              }}>{analysis.overallScore}</div>
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.75rem',
                color: '#3e4560',
              }}>/ 100</div>
            </div>

            <div style={{
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
                textTransform: 'uppercase',
                color: '#5a6380',
                marginBottom: 12,
              }}>MARKET DEMAND</div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '2.2rem',
                fontWeight: 500,
                color: getScoreColor(analysis.currentRoleAnalysis?.marketDemand || 0),
                lineHeight: 1,
                marginBottom: 4,
              }}>{analysis.currentRoleAnalysis?.marketDemand || 0}</div>
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.75rem',
                color: '#3e4560',
              }}>/ 100</div>
            </div>

            <div style={{
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
                textTransform: 'uppercase',
                color: '#5a6380',
                marginBottom: 12,
              }}>CAREER PHASES</div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '2.2rem',
                fontWeight: 500,
                color: '#dde2f0',
                lineHeight: 1,
                marginBottom: 4,
              }}>{analysis.careerPath?.phases?.length || 0}</div>
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.75rem',
                color: '#3e4560',
              }}>milestones</div>
            </div>
          </div>

          {/* Strengths */}
          {analysis.currentRoleAnalysis?.strengths && analysis.currentRoleAnalysis.strengths.length > 0 && (
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
                textTransform: 'uppercase',
                color: '#22c55e',
                marginBottom: 16,
              }}>CURRENT STRENGTHS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {analysis.currentRoleAnalysis.strengths.map((s: string, i: number) => (
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

          {/* Skill Gaps */}
          {analysis.currentRoleAnalysis?.skillGaps && analysis.currentRoleAnalysis.skillGaps.length > 0 && (
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
                textTransform: 'uppercase',
                color: '#eab308',
                marginBottom: 16,
              }}>SKILL GAPS TO ADDRESS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {analysis.currentRoleAnalysis.skillGaps.map((g: string, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%', background: '#eab308',
                      marginTop: 7, flexShrink: 0,
                    }} />
                    <span style={{
                      fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', color: '#b0bec5', lineHeight: 1.6,
                    }}>{g}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Career Path Phases */}
          {analysis.careerPath?.phases && analysis.careerPath.phases.length > 0 && (
            <div style={{
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
                textTransform: 'uppercase',
                color: '#5a6380',
                marginBottom: 20,
              }}>CAREER PATH</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {analysis.careerPath.phases.map((phase, i: number) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderRadius: 12,
                    padding: 22,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem',
                        color: '#3b82f6', fontWeight: 600,
                      }}>{i + 1}</div>
                      <div>
                        <div style={{
                          fontFamily: "'Inter', sans-serif", fontSize: '1rem',
                          fontWeight: 600, color: '#dde2f0',
                        }}>{phase.title}</div>
                        <div style={{
                          fontFamily: "'Inter', sans-serif", fontSize: '0.75rem',
                          color: '#5a6380',
                        }}>{phase.timeframe}{phase.estimatedSalaryRange ? \` · \${phase.estimatedSalaryRange}\` : ''}</div>
                      </div>
                    </div>
                    <p style={{
                      fontFamily: "'Inter', sans-serif", fontSize: '0.85rem',
                      color: '#8892b0', lineHeight: 1.6, marginBottom: 12, marginTop: 0,
                    }}>{phase.description}</p>

                    {phase.keyMilestones && phase.keyMilestones.length > 0 && (
                      <div style={{ marginBottom: 10 }}>
                        <div style={{
                          fontFamily: "'Inter', sans-serif", fontSize: '0.68rem',
                          fontWeight: 600, color: '#5a6380', marginBottom: 6,
                          textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>Key Milestones</div>
                        {phase.keyMilestones.map((m: string, j: number) => (
                          <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#3b82f6', marginTop: 7, flexShrink: 0 }} />
                            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: '#b0bec5', lineHeight: 1.5 }}>{m}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {phase.skillsToAcquire && phase.skillsToAcquire.length > 0 && (
                      <div>
                        <div style={{
                          fontFamily: "'Inter', sans-serif", fontSize: '0.68rem',
                          fontWeight: 600, color: '#5a6380', marginBottom: 6,
                          textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>Skills to Acquire</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {phase.skillsToAcquire.map((s: string, j: number) => (
                            <span key={j} style={{
                              padding: '4px 10px', borderRadius: 6,
                              background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)',
                              fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: '#7da8d4',
                            }}>{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills Analysis */}
          {analysis.skillsAnalysis && (
            <div style={{
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
                textTransform: 'uppercase',
                color: '#5a6380',
                marginBottom: 20,
              }}>SKILLS ANALYSIS</div>

              {analysis.skillsAnalysis.technicalSkills && analysis.skillsAnalysis.technicalSkills.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{
                    fontFamily: "'Inter', sans-serif", fontSize: '0.72rem',
                    fontWeight: 600, color: '#8892b0', marginBottom: 12,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>Technical Skills</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {analysis.skillsAnalysis.technicalSkills.map((skill, i: number) => (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: '#b0bec5' }}>{skill.skill}</span>
                          <span style={{
                            fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem',
                            color: getScoreColor(skill.importance),
                          }}>{skill.importance}%</span>
                        </div>
                        <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
                          <div style={{
                            height: '100%', width: \`\${skill.importance}%\`,
                            background: getScoreColor(skill.importance),
                            borderRadius: 3, opacity: 0.7, transition: 'width 0.5s ease',
                          }} />
                        </div>
                        <div style={{
                          display: 'flex', gap: 12, marginTop: 4,
                          fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: '#5a6380',
                        }}>
                          <span>{skill.currentLevel} → {skill.targetLevel}</span>
                          <span style={{
                            color: skill.learningPriority === 'High' ? '#ef4444' :
                              skill.learningPriority === 'Medium' ? '#eab308' : '#22c55e',
                          }}>{skill.learningPriority} priority</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.skillsAnalysis.softSkills && analysis.skillsAnalysis.softSkills.length > 0 && (
                <div>
                  <div style={{
                    fontFamily: "'Inter', sans-serif", fontSize: '0.72rem',
                    fontWeight: 600, color: '#8892b0', marginBottom: 12,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>Soft Skills</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {analysis.skillsAnalysis.softSkills.map((skill, i: number) => (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: '#b0bec5' }}>{skill.skill}</span>
                          <span style={{
                            fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem',
                            color: getScoreColor(skill.importance),
                          }}>{skill.importance}%</span>
                        </div>
                        <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
                          <div style={{
                            height: '100%', width: \`\${skill.importance}%\`,
                            background: getScoreColor(skill.importance),
                            borderRadius: 3, opacity: 0.7, transition: 'width 0.5s ease',
                          }} />
                        </div>
                        <p style={{
                          fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: '#5a6380',
                          marginTop: 4, margin: '4px 0 0 0',
                        }}>{skill.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Plan - Recommendations */}
          {analysis.recommendations && (
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
                textTransform: 'uppercase',
                color: '#3b82f6',
                marginBottom: 20,
              }}>ACTION PLAN</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
                {analysis.recommendations.immediate && analysis.recommendations.immediate.length > 0 && (
                  <div>
                    <div style={{
                      fontFamily: "'Inter', sans-serif", fontSize: '0.72rem',
                      fontWeight: 600, color: '#22c55e', marginBottom: 10,
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>Immediate (0-3 months)</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {analysis.recommendations.immediate.map((r: string, i: number) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', color: '#22c55e', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: '#b0bec5', lineHeight: 1.5 }}>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.recommendations.shortTerm && analysis.recommendations.shortTerm.length > 0 && (
                  <div>
                    <div style={{
                      fontFamily: "'Inter', sans-serif", fontSize: '0.72rem',
                      fontWeight: 600, color: '#eab308', marginBottom: 10,
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>Short-term (3-12 months)</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {analysis.recommendations.shortTerm.map((r: string, i: number) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', color: '#eab308', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: '#b0bec5', lineHeight: 1.5 }}>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.recommendations.longTerm && analysis.recommendations.longTerm.length > 0 && (
                  <div>
                    <div style={{
                      fontFamily: "'Inter', sans-serif", fontSize: '0.72rem',
                      fontWeight: 600, color: '#3b82f6', marginBottom: 10,
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>Long-term (1+ years)</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {analysis.recommendations.longTerm.map((r: string, i: number) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', color: '#3b82f6', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: '#b0bec5', lineHeight: 1.5 }}>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Certifications */}
          {analysis.certifications && analysis.certifications.length > 0 && (
            <div style={{
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
                textTransform: 'uppercase',
                color: '#5a6380',
                marginBottom: 20,
              }}>RECOMMENDED CERTIFICATIONS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {analysis.certifications.map((cert, i: number) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderRadius: 10,
                    padding: 16,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.92rem', fontWeight: 600, color: '#dde2f0' }}>{cert.name}</span>
                      <span style={{
                        padding: '3px 10px', borderRadius: 6, fontSize: '0.68rem',
                        fontFamily: "'Inter', sans-serif", fontWeight: 600,
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                        background: cert.priority === 'High' ? 'rgba(239,68,68,0.1)' : cert.priority === 'Medium' ? 'rgba(234,179,8,0.1)' : 'rgba(34,197,94,0.1)',
                        color: cert.priority === 'High' ? '#ef4444' : cert.priority === 'Medium' ? '#eab308' : '#22c55e',
                        border: \`1px solid \${cert.priority === 'High' ? 'rgba(239,68,68,0.2)' : cert.priority === 'Medium' ? 'rgba(234,179,8,0.2)' : 'rgba(34,197,94,0.2)'}\`,
                      }}>{cert.priority}</span>
                    </div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: '#5a6380', marginBottom: 4 }}>
                      {cert.provider} · {cert.estimatedTime}
                    </div>
                    <p style={{
                      fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: '#8892b0',
                      lineHeight: 1.5, margin: 0,
                    }}>{cert.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Networking & Community */}
          {analysis.networking && (
            <div style={{
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
                textTransform: 'uppercase',
                color: '#5a6380',
                marginBottom: 20,
              }}>NETWORKING & COMMUNITY</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                {analysis.networking.communities && analysis.networking.communities.length > 0 && (
                  <div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', fontWeight: 600, color: '#8892b0', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Communities</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {analysis.networking.communities.map((c: string, i: number) => (
                        <span key={i} style={{
                          padding: '4px 10px', borderRadius: 6,
                          background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)',
                          fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: '#7da8d4',
                        }}>{c}</span>
                      ))}
                    </div>
                  </div>
                )}
                {analysis.networking.events && analysis.networking.events.length > 0 && (
                  <div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', fontWeight: 600, color: '#8892b0', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Events</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {analysis.networking.events.map((e: string, i: number) => (
                        <span key={i} style={{
                          padding: '4px 10px', borderRadius: 6,
                          background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)',
                          fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: '#a78bfa',
                        }}>{e}</span>
                      ))}
                    </div>
                  </div>
                )}
                {analysis.networking.platforms && analysis.networking.platforms.length > 0 && (
                  <div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', fontWeight: 600, color: '#8892b0', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Platforms</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {analysis.networking.platforms.map((p: string, i: number) => (
                        <span key={i} style={{
                          padding: '4px 10px', borderRadius: 6,
                          background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)',
                          fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: '#86efac',
                        }}>{p}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Learning Resources */}
          {analysis.resources && (
            <div style={{
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
                textTransform: 'uppercase',
                color: '#5a6380',
                marginBottom: 20,
              }}>LEARNING RESOURCES</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
                {analysis.resources.courses && analysis.resources.courses.length > 0 && (
                  <div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', fontWeight: 600, color: '#8892b0', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Courses</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {analysis.resources.courses.map((course, i: number) => (
                        <div key={i} style={{
                          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                          borderRadius: 8, padding: 12,
                        }}>
                          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', fontWeight: 500, color: '#dde2f0', marginBottom: 2 }}>{course.title}</div>
                          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: '#5a6380' }}>{course.provider} · {course.type} · {course.duration}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {analysis.resources.books && analysis.resources.books.length > 0 && (
                    <div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', fontWeight: 600, color: '#8892b0', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Books</div>
                      {analysis.resources.books.map((b: string, i: number) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#5a6380', marginTop: 7, flexShrink: 0 }} />
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: '#b0bec5', lineHeight: 1.5 }}>{b}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {analysis.resources.podcasts && analysis.resources.podcasts.length > 0 && (
                    <div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', fontWeight: 600, color: '#8892b0', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Podcasts</div>
                      {analysis.resources.podcasts.map((p: string, i: number) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#5a6380', marginTop: 7, flexShrink: 0 }} />
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: '#b0bec5', lineHeight: 1.5 }}>{p}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {analysis.resources.blogs && analysis.resources.blogs.length > 0 && (
                    <div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', fontWeight: 600, color: '#8892b0', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Blogs</div>
                      {analysis.resources.blogs.map((b: string, i: number) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#5a6380', marginTop: 7, flexShrink: 0 }} />
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: '#b0bec5', lineHeight: 1.5 }}>{b}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            marginTop: 40,
            flexWrap: 'wrap',
          }}>
            <button
              onClick={() => router.push('/career-roadmap')}
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
              Create New Roadmap
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
  )
}
`;

const targetPath = path.join(__dirname, '..', 'src', 'app', 'career-roadmap', 'results', 'page.tsx');
fs.writeFileSync(targetPath, content, 'utf8');
console.log('Written to:', targetPath);
console.log('File size:', fs.statSync(targetPath).size, 'bytes');
