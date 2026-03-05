'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from "@/components/ProtectedRoute"
import { DashboardLayout } from '@/components/DashboardLayout'

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

const scoreColor = (score: number) => {
  if (score >= 70) return '#22c55e'
  if (score >= 45) return '#eab308'
  return '#ef4444'
}

const priorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'high': return { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', text: '#ef4444' }
    case 'medium': return { bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.2)', text: '#eab308' }
    default: return { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', text: '#22c55e' }
  }
}

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 16,
  padding: '24px',
}

const sectionLabel: React.CSSProperties = {
  fontSize: '0.7rem',
  fontWeight: 600,
  color: '#64748b',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  marginBottom: 12,
}

const dot = (color: string) => (
  <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0, marginTop: 7 }} />
)

export default function CareerRoadmapResultsPage() {
  const router = useRouter()
  const [analysis, setAnalysis] = useState<RoadmapAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedData = localStorage.getItem('careerRoadmapResults')
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData)
        if (parsedData.success && parsedData.analysis) {
          setAnalysis(parsedData.analysis)
          setTimeout(() => localStorage.removeItem('careerRoadmapResults'), 5000)
        } else if (parsedData.analysis) {
          setAnalysis(parsedData.analysis)
        } else if (parsedData.overallScore !== undefined) {
          setAnalysis(parsedData)
        } else {
          setAnalysis(null)
        }
      } catch {
        setAnalysis(null)
      }
    } else {
      setAnalysis(null)
    }
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: '#64748b', fontFamily: 'Inter, sans-serif' }}>Loading your career roadmap...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!analysis) {
    return (
      <ProtectedRoute>
        <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ color: '#ef4444', fontFamily: "'Instrument Serif', serif", fontSize: '1.75rem', marginBottom: 12 }}>No Analysis Data Found</h1>
            <p style={{ color: '#64748b', fontFamily: 'Inter, sans-serif', marginBottom: 24 }}>Unable to load your career roadmap analysis.</p>
            <button
              onClick={() => router.push('/career-roadmap')}
              style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontFamily: 'Inter, sans-serif', fontWeight: 600, cursor: 'pointer' }}
            >
              Create New Roadmap
            </button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const sc = scoreColor(analysis.overallScore)
  const circumference = 2 * Math.PI * 40

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
        <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e2e8f0', fontFamily: 'Inter, sans-serif', padding: '40px 24px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h1 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 'clamp(2rem, 4vw, 2.75rem)', color: '#e2e8f0', margin: 0 }}>
                Career Roadmap
              </h1>
              <p style={{ color: '#64748b', marginTop: 8, fontSize: '0.95rem' }}>Personalized guidance for your career journey</p>
            </div>

            {/* Overall Score + Summary */}
            <div style={{ ...card, background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.12)', marginBottom: 24, display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 120 }}>
                <svg width={96} height={96} viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx={50} cy={50} r={40} stroke="rgba(255,255,255,0.06)" strokeWidth={8} fill="transparent" />
                  <circle cx={50} cy={50} r={40} stroke={sc} strokeWidth={8} fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - analysis.overallScore / 100)}
                    style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 6px ${sc})` }}
                  />
                </svg>
                <div style={{ textAlign: 'center', marginTop: -8 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: '2.5rem', color: sc, lineHeight: 1 }}>
                    {analysis.overallScore}
                  </span>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>/100</span>
                  <p style={{ ...sectionLabel, marginTop: 4, marginBottom: 0 }}>Achievability</p>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 240 }}>
                <p style={{ ...sectionLabel }}>Career Path Summary</p>
                <p style={{ color: '#cbd5e1', lineHeight: 1.7, margin: 0, fontSize: '0.95rem' }}>{analysis.summary}</p>
              </div>
            </div>

            {/* Current Role Analysis */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
              {/* Strengths */}
              <div style={{ ...card, background: 'rgba(34,197,94,0.03)', border: '1px solid rgba(34,197,94,0.1)' }}>
                <p style={{ ...sectionLabel, color: '#22c55e' }}>Current Strengths</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {analysis.currentRoleAnalysis.strengths.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      {dot('#22c55e')}
                      <span style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.5 }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skill Gaps */}
              <div style={{ ...card, background: 'rgba(234,179,8,0.03)', border: '1px solid rgba(234,179,8,0.1)' }}>
                <p style={{ ...sectionLabel, color: '#eab308' }}>Skill Gaps</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {analysis.currentRoleAnalysis.skillGaps.map((g, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      {dot('#eab308')}
                      <span style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.5 }}>{g}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Market Demand */}
              <div style={card}>
                <p style={{ ...sectionLabel }}>Market Demand</p>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '2.25rem', fontWeight: 700, color: scoreColor(analysis.currentRoleAnalysis.marketDemand), marginBottom: 10 }}>
                  {analysis.currentRoleAnalysis.marketDemand}%
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${analysis.currentRoleAnalysis.marketDemand}%`, background: scoreColor(analysis.currentRoleAnalysis.marketDemand), borderRadius: 3 }} />
                </div>
                <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: 8 }}>
                  {analysis.currentRoleAnalysis.marketDemand >= 80 ? 'High demand' : analysis.currentRoleAnalysis.marketDemand >= 60 ? 'Moderate demand' : 'Lower demand'}
                </p>
              </div>
            </div>

            {/* Career Path Phases */}
            <div style={{ ...card, marginBottom: 24 }}>
              <p style={{ ...sectionLabel }}>Career Path Phases</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {analysis.careerPath.phases.map((phase, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(59,130,246,0.15)', color: '#3b82f6', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                          <h3 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: '1.2rem', color: '#e2e8f0', margin: 0 }}>{phase.title}</h3>
                        </div>
                        <p style={{ color: '#3b82f6', fontSize: '0.8rem', marginTop: 4, marginLeft: 34 }}>{phase.timeframe}</p>
                      </div>
                      <span style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', fontSize: '0.8rem', padding: '3px 10px', borderRadius: 6, fontWeight: 500 }}>
                        {phase.estimatedSalaryRange}
                      </span>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 16 }}>{phase.description}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                      <div>
                        <p style={{ ...sectionLabel, marginBottom: 8 }}>Key Milestones</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {phase.keyMilestones.map((m, j) => (
                            <div key={j} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                              {dot('#3b82f6')}
                              <span style={{ fontSize: '0.825rem', color: '#cbd5e1', lineHeight: 1.5 }}>{m}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p style={{ ...sectionLabel, marginBottom: 8 }}>Skills to Acquire</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {phase.skillsToAcquire.map((skill, j) => (
                            <span key={j} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: '0.75rem', padding: '3px 10px', borderRadius: 6 }}>{skill}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills Analysis */}
            {analysis.skillsAnalysis && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 24 }}>
                {/* Technical Skills */}
                <div style={card}>
                  <p style={{ ...sectionLabel }}>Technical Skills</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {analysis.skillsAnalysis.technicalSkills?.map((skill, i) => {
                      const pc = priorityColor(skill.learningPriority)
                      return (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <span style={{ color: '#e2e8f0', fontSize: '0.875rem', fontWeight: 500 }}>{skill.skill}</span>
                            <span style={{ background: pc.bg, border: `1px solid ${pc.border}`, color: pc.text, fontSize: '0.7rem', padding: '2px 8px', borderRadius: 5, fontWeight: 600 }}>
                              {skill.learningPriority}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: 16, fontSize: '0.775rem', color: '#64748b', marginBottom: 8 }}>
                            <span>Current: <span style={{ color: '#94a3b8' }}>{skill.currentLevel}</span></span>
                            <span>Target: <span style={{ color: '#94a3b8' }}>{skill.targetLevel}</span></span>
                          </div>
                          <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.04)' }}>
                            <div style={{ height: '100%', width: `${skill.importance}%`, background: '#3b82f6', borderRadius: 2 }} />
                          </div>
                          <p style={{ color: '#475569', fontSize: '0.7rem', marginTop: 4 }}>Importance: {skill.importance}%</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Soft Skills */}
                <div style={card}>
                  <p style={{ ...sectionLabel }}>Soft Skills</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {analysis.skillsAnalysis.softSkills?.map((skill, i) => (
                      <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ color: '#e2e8f0', fontSize: '0.875rem', fontWeight: 500 }}>{skill.skill}</span>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', color: '#a78bfa', fontWeight: 600 }}>{skill.importance}%</span>
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '0.825rem', lineHeight: 1.5, marginBottom: 8 }}>{skill.description}</p>
                        <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.04)' }}>
                          <div style={{ height: '100%', width: `${skill.importance}%`, background: '#a78bfa', borderRadius: 2 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Action Plan */}
            <div style={{ ...card, marginBottom: 24 }}>
              <p style={{ ...sectionLabel }}>Action Plan</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
                <div>
                  <p style={{ color: '#22c55e', fontSize: '0.825rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>Immediate (0–3 months)</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {analysis.recommendations.immediate.map((a, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        {dot('#22c55e')}
                        <span style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.5 }}>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p style={{ color: '#eab308', fontSize: '0.825rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>Short-term (3–12 months)</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {analysis.recommendations.shortTerm.map((a, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        {dot('#eab308')}
                        <span style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.5 }}>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p style={{ color: '#3b82f6', fontSize: '0.825rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>Long-term (1+ years)</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {analysis.recommendations.longTerm.map((a, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        {dot('#3b82f6')}
                        <span style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.5 }}>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Certifications + Networking */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 24 }}>
              {analysis.certifications && analysis.certifications.length > 0 && (
                <div style={card}>
                  <p style={{ ...sectionLabel }}>Recommended Certifications</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {analysis.certifications.map((cert, i) => {
                      const pc = priorityColor(cert.priority)
                      return (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '14px 16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                            <span style={{ color: '#e2e8f0', fontSize: '0.875rem', fontWeight: 500 }}>{cert.name}</span>
                            <span style={{ background: pc.bg, border: `1px solid ${pc.border}`, color: pc.text, fontSize: '0.7rem', padding: '2px 8px', borderRadius: 5, fontWeight: 600, flexShrink: 0 }}>
                              {cert.priority}
                            </span>
                          </div>
                          <p style={{ color: '#64748b', fontSize: '0.775rem', margin: '0 0 6px' }}>{cert.provider}</p>
                          <p style={{ color: '#94a3b8', fontSize: '0.825rem', lineHeight: 1.5, margin: '0 0 8px' }}>{cert.description}</p>
                          <p style={{ color: '#475569', fontSize: '0.75rem', margin: 0 }}>Est. time: {cert.estimatedTime}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {analysis.networking && (
                <div style={card}>
                  <p style={{ ...sectionLabel }}>Networking & Community</p>
                  {analysis.networking.communities?.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Communities</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {analysis.networking.communities.map((c, i) => (
                          <span key={i} style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', color: '#93c5fd', fontSize: '0.775rem', padding: '3px 10px', borderRadius: 6 }}>{c}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {analysis.networking.events?.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Events</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {analysis.networking.events.map((e, i) => (
                          <span key={i} style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', color: '#93c5fd', fontSize: '0.775rem', padding: '3px 10px', borderRadius: 6 }}>{e}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {analysis.networking.platforms?.length > 0 && (
                    <div>
                      <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Platforms</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {analysis.networking.platforms.map((p, i) => (
                          <span key={i} style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', color: '#93c5fd', fontSize: '0.775rem', padding: '3px 10px', borderRadius: 6 }}>{p}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Learning Resources */}
            {analysis.resources && (
              <div style={{ ...card, marginBottom: 40 }}>
                <p style={{ ...sectionLabel }}>Learning Resources</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
                  {analysis.resources.courses?.length > 0 && (
                    <div>
                      <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Courses</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {analysis.resources.courses.map((course, i) => (
                          <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 14px' }}>
                            <p style={{ color: '#e2e8f0', fontSize: '0.875rem', fontWeight: 500, margin: '0 0 2px' }}>{course.title}</p>
                            <p style={{ color: '#475569', fontSize: '0.75rem', margin: 0 }}>{course.provider} · {course.type} · {course.duration}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {analysis.resources.books?.length > 0 && (
                      <div>
                        <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Books</p>
                        {analysis.resources.books.map((b, i) => (
                          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 4 }}>
                            {dot('#64748b')}
                            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{b}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {analysis.resources.podcasts?.length > 0 && (
                      <div>
                        <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Podcasts</p>
                        {analysis.resources.podcasts.map((p, i) => (
                          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 4 }}>
                            {dot('#64748b')}
                            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{p}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {analysis.resources.blogs?.length > 0 && (
                      <div>
                        <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Blogs</p>
                        {analysis.resources.blogs.map((b, i) => (
                          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 4 }}>
                            {dot('#64748b')}
                            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{b}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => router.push('/career-roadmap')}
                style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Create New Roadmap
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                style={{ background: 'transparent', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 24px', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Back to Dashboard
              </button>
            </div>

          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
