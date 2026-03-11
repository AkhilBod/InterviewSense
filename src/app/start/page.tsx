'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, Mic, Volume2 } from "lucide-react"
import { DashboardLayout } from '@/components/DashboardLayout'
import { useProfileData } from '@/hooks/useProfileData'
import { PrefilledChip } from '@/components/ProfileFormComponents'

// Behavioral question presets — soft-skill categories, 10 questions each

const BEHAVIORAL_CATEGORIES: { name: string; questions: string[] }[] = [
  {
    name: 'Leadership',
    questions: [
      'Tell me about a time you led a team through a challenging project.',
      'Describe a situation where you influenced a decision without formal authority.',
      'Give an example of how you motivated a team when morale was low.',
      'Tell me about a time you had to make an unpopular decision as a leader.',
      'Describe a situation where you delegated work effectively and why it mattered.',
      'Tell me about a time you mentored or coached someone to grow in their role.',
      'Describe a moment when you had to hold your team accountable for results.',
      'Give an example of when you led a cross-functional initiative. How did you align people?',
      'Tell me about a time you stepped up to lead when no one else did.',
      'Describe a situation where your leadership directly impacted the outcome of a project.',
    ],
  },
  {
    name: 'Teamwork',
    questions: [
      'Tell me about a time you collaborated closely with a team to hit a tough deadline.',
      'Describe a situation where a team member was underperforming. How did you handle it?',
      "Give an example of a time you put the team's needs ahead of your own.",
      'Tell me about a time you had to onboard or mentor a new team member.',
      'Describe a project where you had to rely heavily on others. How did you build trust?',
      'Tell me about a time you helped resolve a conflict within your team.',
      'Describe a situation where you had to work with someone whose style was very different from yours.',
      'Give an example of a time you celebrated a team win. What did you do?',
      'Tell me about a time when teamwork was essential and how you contributed to it.',
      'Describe a situation where you proactively supported a struggling teammate.',
    ],
  },
  {
    name: 'Communication',
    questions: [
      'Tell me about a time you had to communicate a complex idea to a non-technical audience.',
      'Describe a situation where miscommunication caused a problem. What did you do?',
      'Give an example of how you adapted your communication style for different stakeholders.',
      'Tell me about a time you delivered difficult feedback. How did you approach it?',
      'Describe a situation where you successfully persuaded someone to change their mind.',
      'Tell me about a time you had to present to senior leadership. How did you prepare?',
      'Describe a moment when active listening helped you resolve a situation.',
      'Give an example of a time you wrote something that had a significant positive impact.',
      'Tell me about a time you had to communicate during a crisis or under pressure.',
      'Describe a situation where clear communication prevented a major mistake.',
    ],
  },
  {
    name: 'Problem Solving',
    questions: [
      'Tell me about a time you solved a problem that no one else could figure out.',
      'Describe a situation where you had to solve a problem with very limited resources.',
      'Give an example of when you broke a large, complex problem into manageable pieces.',
      'Tell me about a time you used data to make a critical decision.',
      'Describe a situation where your first solution failed and what you did next.',
      'Tell me about a time you had to think outside the box to solve a business problem.',
      'Describe a moment when you identified the root cause of a recurring issue.',
      'Give an example of a time you had to solve a problem under significant time pressure.',
      'Tell me about a time you had to balance multiple competing solutions. How did you choose?',
      'Describe a situation where you prevented a problem before it escalated.',
    ],
  },
  {
    name: 'Adaptability',
    questions: [
      'Tell me about a time you had to quickly adapt to a major change at work.',
      'Describe a situation where you had to learn a new skill rapidly to complete a project.',
      'Give an example of when project requirements changed mid-way. How did you adjust?',
      'Tell me about a time you had to work outside your comfort zone.',
      'Describe a moment when your ability to adapt directly saved a project.',
      'Tell me about a time you embraced a new process or technology others resisted.',
      'Describe a situation where you had to pivot strategy based on new information.',
      'Give an example of how you handled working in an ambiguous, fast-changing environment.',
      'Tell me about a time you thrived in an unstructured or startup-like environment.',
      'Describe a situation where you helped your team adapt to a significant organizational change.',
    ],
  },
  {
    name: 'Initiative',
    questions: [
      'Tell me about a time you identified a process improvement and implemented it.',
      'Describe a situation where you saw an opportunity others missed and acted on it.',
      'Give an example of a time you volunteered for a challenging or high-visibility assignment.',
      'Tell me about something you built or started without being asked.',
      "Describe a time you took ownership of a problem that wasn't technically yours to solve.",
      'Tell me about a time you went beyond your job description to create value.',
      'Describe a situation where your proactive action prevented a serious issue.',
      'Give an example of a new idea you proposed that was adopted by your team or company.',
      'Tell me about a time you took initiative to improve team culture or morale.',
      'Describe a moment when you pushed forward on a project when others hesitated.',
    ],
  },
  {
    name: 'Conflict Resolution',
    questions: [
      'Tell me about a time you had a significant disagreement with a colleague. How was it resolved?',
      'Describe a situation where you had to navigate conflict between two team members.',
      'Give an example of a time you had to work with a difficult manager or stakeholder.',
      'Tell me about a time you had to compromise to move a project forward.',
      'Describe a situation where you turned a tense disagreement into a productive outcome.',
      'Tell me about a time you pushed back on a decision you thought was wrong.',
      'Describe a moment where managing conflict helped preserve an important relationship.',
      'Give an example of when you had to de-escalate a situation under high stakes.',
      'Tell me about a time you handled a disagreement with a client or external partner.',
      'Describe a situation where a conflict ultimately led to a better outcome for the team.',
    ],
  },
  {
    name: 'Failure & Learning',
    questions: [
      'Tell me about a time you failed at something important. What did you learn?',
      "Describe a project that didn't go as planned. What would you do differently?",
      'Give an example of a mistake that had significant consequences and how you handled it.',
      'Tell me about a time you received critical feedback that was hard to hear.',
      'Describe a moment where failure ultimately led to a better approach.',
      'Tell me about a time you had to admit you were wrong in front of others.',
      'Describe a situation where you helped your team learn from a collective failure.',
      'Give an example of how a past failure shaped the way you work today.',
      'Tell me about a time you underestimated the difficulty of a task. What happened?',
      'Describe a situation where you had to rebuild trust after a mistake.',
    ],
  },
  {
    name: 'Achievement',
    questions: [
      'Tell me about your greatest professional achievement and what made it significant.',
      'Describe a time you set an ambitious goal and successfully achieved it.',
      'Give an example of a project you are most proud of and why.',
      'Tell me about a time you exceeded expectations on an important deliverable.',
      'Describe a situation where you delivered results despite significant obstacles.',
      'Tell me about a time you were recognized for exceptional work. What did you do?',
      'Describe an achievement where the outcome had a measurable impact on the business.',
      'Give an example of a time you improved a key metric or outcome significantly.',
      'Tell me about the most technically challenging thing you have ever accomplished.',
      'Describe a situation where you achieved something others said was not possible.',
    ],
  },
  {
    name: 'Pressure & Stress',
    questions: [
      'Tell me about a time you had to meet multiple competing deadlines simultaneously.',
      'Describe the most stressful work situation you have faced and how you managed it.',
      'Give an example of a time you stayed calm and effective under extreme pressure.',
      'Tell me about a time a project was in crisis. How did you respond?',
      'Describe a situation where you had to deliver high-quality work on a very tight timeline.',
      'Tell me about a time when the stakes were very high and what you did to perform well.',
      'Describe a moment where stress could have derailed you but did not. What helped?',
      'Give an example of a time you helped your team stay focused during a high-pressure period.',
      'Tell me about a time you had to prioritize ruthlessly when everything felt urgent.',
      'Describe a situation where you managed your own well-being while still delivering results.',
    ],
  },
]

// Types

interface MicrophoneState {
  devices: MediaDeviceInfo[]
  selectedDevice: string
  volume: number
  isSupported: boolean
  isLoading: boolean
}

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600&display=swap');
  body { background: #0a0e1a; overflow-x: hidden; }
  body::after {
    content: '';
    position: fixed;
    bottom: -160px; left: 50%;
    transform: translateX(-50%);
    width: 900px; height: 380px;
    background: radial-gradient(ellipse at center, rgba(37,99,235,0.45) 0%, rgba(99,102,241,0.22) 40%, transparent 75%);
    pointer-events: none;
    z-index: 0;
    filter: blur(8px);
  }
`

function StartPageInner() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { profile, loading: profileLoading } = useProfileData()

  const [mode, setMode] = useState<'ai' | 'custom'>('ai')

  // AI mode
  const [company, setCompany] = useState('')
  const [overridingCompany, setOverridingCompany] = useState(false)
  const [interviewType, setInterviewType] = useState('behavioral')

  // Custom tab — presets
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])

  // Custom tab — free-form
  const [customText, setCustomText] = useState('')

  // Mic
  const [showMicSetup, setShowMicSetup] = useState(false)
  const [micState, setMicState] = useState<MicrophoneState>({
    devices: [],
    selectedDevice: '',
    volume: 100,
    isSupported: false,
    isLoading: false,
  })

  useEffect(() => {
    if (profile.targetCompany) setCompany(profile.targetCompany)
  }, [profile.targetCompany])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    checkMicrophoneSupport()
  }, [status, router])

  const checkMicrophoneSupport = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicState(prev => ({ ...prev, isSupported: false, isLoading: false }))
      return
    }
    setMicState(prev => ({ ...prev, isLoading: true }))
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const devices = await navigator.mediaDevices.enumerateDevices()
      const audioDevices = devices.filter(d => d.kind === 'audioinput')
      stream.getTracks().forEach(t => t.stop())
      setMicState(prev => ({
        ...prev,
        isSupported: true,
        devices: audioDevices,
        selectedDevice: audioDevices[0]?.deviceId || '',
        isLoading: false,
      }))
    } catch {
      setMicState(prev => ({ ...prev, isSupported: false, isLoading: false }))
    }
  }

  const toggleQuestion = (q: string) => {
    setSelectedQuestions(prev =>
      prev.includes(q) ? prev.filter(x => x !== q) : [...prev, q]
    )
  }

  const selectAllInCategory = (questions: string[]) => {
    const allSelected = questions.every(q => selectedQuestions.includes(q))
    if (allSelected) {
      setSelectedQuestions(prev => prev.filter(q => !questions.includes(q)))
    } else {
      setSelectedQuestions(prev => [...new Set([...prev, ...questions])])
    }
  }

  const handleStartAI = async () => {
    await checkMicrophoneSupport()
    setShowMicSetup(true)
  }

  const handleContinueToInterview = () => {
    const jobTitle = profile.targetRole || 'Software Engineer'
    localStorage.setItem('jobTitle', jobTitle)
    localStorage.setItem('company', company)
    localStorage.setItem('industry', '')
    localStorage.setItem('experienceLevel', 'Mid-level')
    localStorage.setItem('interviewType', interviewType === 'recruiter_screen' ? 'Recruiter Screen' : interviewType === 'technical' ? 'Technical' : interviewType === 'mix' ? 'Mix' : 'Behavioral')
    localStorage.setItem('interviewStage', 'Initial Screening')
    localStorage.setItem('jobDescription', '')
    localStorage.setItem('numberOfQuestions', '5')
    router.push('/interview')
  }

  const handleStartCustom = () => {
    const textLines = customText
      .split('\n')
      .map(l => l.replace(/^\d+[\.\)]\s*/, '').trim())
      .filter(l => l.length > 5)

    const questions = [...selectedQuestions, ...textLines]
    if (questions.length === 0) return

    localStorage.setItem('behavioralCustomSession', JSON.stringify(questions))
    localStorage.setItem('interviewType', 'Behavioral')
    router.push('/interview')
  }

  const textLineCount = customText
    .split('\n')
    .map(l => l.replace(/^\d+[\.\)]\s*/, '').trim())
    .filter(l => l.length > 5).length

  const customTotalCount = selectedQuestions.length + textLineCount

  const canStart = mode === 'ai' ? true : customTotalCount > 0

  const startLabel =
    mode === 'ai' ? 'Start Interview'
    : customTotalCount > 0
      ? `Start with ${customTotalCount} Question${customTotalCount > 1 ? 's' : ''}`
      : 'Add Questions to Start'

  const handleStart = () => {
    if (mode === 'ai') handleStartAI()
    else handleStartCustom()
  }

  if (status === 'loading' || profileLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 26, height: 26, border: '2px solid rgba(255,255,255,0.08)', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  const activeCategoryData = selectedCategory
    ? BEHAVIORAL_CATEGORIES.find(c => c.name === selectedCategory)
    : null

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '12px 14px',
    fontFamily: "'Inter', sans-serif", fontSize: '0.88rem',
    color: '#dde2f0', outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontFamily: "'Inter', sans-serif",
    fontSize: '0.68rem', fontWeight: 600,
    letterSpacing: '0.1em', textTransform: 'uppercase',
    color: '#8892b0', marginBottom: 7,
  }

  return (
    <DashboardLayout>
      <style>{pageStyles}</style>
      <div style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '52px 24px 80px', position: 'relative', zIndex: 1,
      }}>
        <div style={{ width: '100%', maxWidth: 600 }}>

          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', color: '#dde2f0', marginBottom: 8, marginTop: 0 }}>
            Behavioral Interview
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', color: '#5a6380', marginBottom: 36, marginTop: 0 }}>
            AI-generated questions, curated presets, or bring your own.
          </p>

          {/* 2-tab switcher */}
          <div style={{
            display: 'flex', gap: 4,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, padding: 4, marginBottom: 32,
          }}>
            {([
              { key: 'ai',     label: 'AI Generated'    },
              { key: 'custom', label: 'Custom Questions' },
            ] as const).map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setMode(tab.key)}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 7, border: 'none',
                  fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.15s',
                  background: mode === tab.key ? 'rgba(59,130,246,0.18)' : 'transparent',
                  color: mode === tab.key ? '#93c5fd' : '#5a6380',
                  borderBottom: mode === tab.key ? '1px solid rgba(59,130,246,0.4)' : '1px solid transparent',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* AI GENERATED TAB */}
          {mode === 'ai' && (
            <>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>
                  Company <span style={{ color: '#4a5370', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                </label>
                {profile.targetCompany && !overridingCompany ? (
                  <PrefilledChip label="Company" value={profile.targetCompany} onChangeRequest={() => setOverridingCompany(true)} />
                ) : (
                  <input
                    type="text" value={company}
                    onChange={e => setCompany(e.target.value)}
                    placeholder="e.g., Google, Meta, Apple"
                    autoFocus={overridingCompany}
                    style={inputStyle}
                    onFocus={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none' }}
                  />
                )}
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Interview Type</label>
                <select
                  value={interviewType}
                  onChange={e => setInterviewType(e.target.value)}
                  style={{
                    ...inputStyle,
                    cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%238892b0' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center',
                  }}
                >
                  <option value="recruiter_screen" style={{ background: '#18181b', color: '#dde2f0' }}>Recruiter Screen</option>
                  <option value="behavioral"       style={{ background: '#18181b', color: '#dde2f0' }}>Behavioral</option>
                  <option value="technical"        style={{ background: '#18181b', color: '#dde2f0' }}>Technical</option>
                  <option value="mix"              style={{ background: '#18181b', color: '#dde2f0' }}>Mix (All Types)</option>
                </select>
              </div>
            </>
          )}

          {/* CUSTOM QUESTIONS TAB */}
          {mode === 'custom' && (
            <div>

              {/* Section A: Quick Presets */}
              <div style={{ marginBottom: 28 }}>
                <p style={{ ...labelStyle, marginBottom: 12 }}>Quick Presets</p>

                {/* Category pill chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: selectedCategory ? 18 : 0 }}>
                  {BEHAVIORAL_CATEGORIES.map(cat => {
                    const catSelected = selectedCategory === cat.name
                    const catCount = cat.questions.filter(q => selectedQuestions.includes(q)).length
                    return (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => setSelectedCategory(catSelected ? null : cat.name)}
                        style={{
                          padding: '7px 16px',
                          borderRadius: 20,
                          border: `1px solid ${catSelected ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.1)'}`,
                          background: catSelected ? 'rgba(59,130,246,0.14)' : 'rgba(255,255,255,0.03)',
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '0.78rem',
                          fontWeight: 500,
                          color: catSelected ? '#93c5fd' : '#8892b0',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                        onMouseEnter={e => {
                          if (!catSelected) {
                            e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)'
                            e.currentTarget.style.color = '#dde2f0'
                          }
                        }}
                        onMouseLeave={e => {
                          if (!catSelected) {
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                            e.currentTarget.style.color = '#8892b0'
                          }
                        }}
                      >
                        {cat.name}
                        {catCount > 0 && (
                          <span style={{
                            background: '#2563eb', color: '#fff',
                            borderRadius: 10, fontSize: '0.65rem', fontWeight: 600,
                            padding: '1px 6px', lineHeight: 1.5,
                          }}>
                            {catCount}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Expanded category questions */}
                {selectedCategory && activeCategoryData && (
                  <div style={{
                    marginTop: 4,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 12,
                    padding: '14px 14px 10px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', fontWeight: 600, color: '#dde2f0' }}>
                        {selectedCategory}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {(() => {
                          const allSelected = activeCategoryData.questions.every(q => selectedQuestions.includes(q))
                          return (
                            <button
                              type="button"
                              onClick={() => selectAllInCategory(activeCategoryData.questions)}
                              style={{
                                background: 'none', border: 'none',
                                fontFamily: "'Inter', sans-serif", fontSize: '0.72rem',
                                color: allSelected ? '#f87171' : '#3b82f6',
                                cursor: 'pointer', padding: 0,
                              }}
                            >
                              {allSelected ? 'Deselect all' : 'Select all'}
                            </button>
                          )
                        })()}
                        <button
                          type="button"
                          onClick={() => setSelectedCategory(null)}
                          style={{ background: 'none', border: 'none', color: '#4a5370', cursor: 'pointer', padding: 0, fontSize: '0.72rem', fontFamily: "'Inter', sans-serif" }}
                        >
                          Close
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {activeCategoryData.questions.map(q => {
                        const sel = selectedQuestions.includes(q)
                        return (
                          <button
                            key={q}
                            type="button"
                            onClick={() => toggleQuestion(q)}
                            style={{
                              display: 'flex', alignItems: 'flex-start', gap: 10,
                              padding: '9px 12px', borderRadius: 8, textAlign: 'left',
                              border: `1px solid ${sel ? 'rgba(59,130,246,0.45)' : 'rgba(255,255,255,0.06)'}`,
                              background: sel ? 'rgba(59,130,246,0.09)' : 'transparent',
                              cursor: 'pointer', transition: 'all 0.12s',
                            }}
                          >
                            <span style={{
                              flexShrink: 0, marginTop: 2,
                              width: 15, height: 15, borderRadius: 4,
                              border: `1.5px solid ${sel ? '#3b82f6' : 'rgba(255,255,255,0.18)'}`,
                              background: sel ? '#3b82f6' : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              {sel && (
                                <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
                                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </span>
                            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: sel ? '#93c5fd' : '#8892b0', lineHeight: 1.5 }}>
                              {q}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', color: '#3a4258', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  or type your own
                </span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              </div>

              {/* Section B: Free-form textarea */}
              <div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: '#4a5370', marginBottom: 10, marginTop: 0 }}>
                  Enter one question per line, or use a numbered list. Each line becomes a separate question.
                </p>
                <textarea
                  value={customText}
                  onChange={e => setCustomText(e.target.value)}
                  placeholder={`e.g.\nTell me about yourself.\nDescribe a time you resolved a conflict at work.\nWhat is your greatest weakness?`}
                  rows={6}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10, padding: '14px 16px',
                    fontFamily: "'Inter', sans-serif", fontSize: '0.88rem',
                    color: '#dde2f0', outline: 'none', resize: 'vertical', lineHeight: 1.7,
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none' }}
                />
                {customText.trim().length > 5 && (
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: '#34d399', marginTop: 6 }}>
                    {textLineCount} question{textLineCount !== 1 ? 's' : ''} from text
                  </p>
                )}
              </div>

              {/* Selected presets summary */}
              {selectedQuestions.length > 0 && (
                <div style={{
                  marginTop: 16, padding: '10px 14px', borderRadius: 8,
                  background: 'rgba(52,211,153,0.06)',
                  border: '1px solid rgba(52,211,153,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: '#34d399' }}>
                    {selectedQuestions.length} preset question{selectedQuestions.length > 1 ? 's' : ''} selected
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedQuestions([])}
                    style={{ background: 'none', border: 'none', color: '#4a5370', cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', padding: 0 }}
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Start button */}
          <button
            onClick={handleStart}
            disabled={!canStart}
            style={{
              width: '100%', marginTop: 32, padding: 14,
              background: '#2563eb', color: '#fff', border: 'none',
              borderRadius: 10, fontFamily: "'Inter', sans-serif",
              fontSize: '0.88rem', fontWeight: 500,
              cursor: canStart ? 'pointer' : 'not-allowed',
              boxShadow: canStart ? '0 4px 20px rgba(37,99,235,0.3)' : 'none',
              opacity: canStart ? 1 : 0.4,
              transition: 'opacity 0.2s, transform 0.15s',
            }}
            onMouseEnter={e => { if (canStart) { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
            onMouseLeave={e => { e.currentTarget.style.opacity = canStart ? '1' : '0.4'; e.currentTarget.style.transform = 'none' }}
          >
            {startLabel}
          </button>
        </div>
      </div>

      {/* Microphone Setup Dialog */}
      <Dialog open={showMicSetup} onOpenChange={setShowMicSetup}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-700">
          <DialogHeader>
            <div className="flex items-center space-x-2">
              <Mic className="h-5 w-5 text-blue-400" />
              <DialogTitle className="text-white">Microphone Setup</DialogTitle>
            </div>
            <DialogDescription className="text-zinc-400">
              Configure your microphone before starting the interview
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-zinc-300">Microphone</Label>
                <button type="button" onClick={checkMicrophoneSupport} className="text-zinc-400 hover:text-zinc-300 p-1 bg-transparent border-none cursor-pointer">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              {micState.isLoading ? (
                <div className="bg-zinc-800 border border-zinc-600 rounded-md p-3 text-center">
                  <div className="flex items-center justify-center space-x-2 text-zinc-400">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Detecting microphones...</span>
                  </div>
                </div>
              ) : micState.devices.length === 0 ? (
                <div className="bg-zinc-800 border border-zinc-600 rounded-md p-3 text-center">
                  <p className="text-sm text-zinc-400 mb-2">No microphones detected. Please allow microphone access.</p>
                  <button type="button" onClick={checkMicrophoneSupport} className="text-sm text-blue-400 underline bg-transparent border-none cursor-pointer">
                    Detect Microphones
                  </button>
                </div>
              ) : (
                <Select value={micState.selectedDevice} onValueChange={value => setMicState(prev => ({ ...prev, selectedDevice: value }))}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-600">
                    <SelectValue placeholder="Select microphone" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-600">
                    {micState.devices.filter(d => d.deviceId?.trim()).map(d => (
                      <SelectItem key={d.deviceId} value={d.deviceId}>
                        {d.label || `Microphone ${d.deviceId.slice(0, 8)}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-zinc-300">Volume</Label>
                <span className="text-zinc-400">{micState.volume}%</span>
              </div>
              <div className="flex items-center space-x-3">
                <Volume2 className="h-4 w-4 text-zinc-400" />
                <Slider value={[micState.volume]} onValueChange={value => setMicState(prev => ({ ...prev, volume: value[0] }))} max={100} step={1} className="flex-1" />
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowMicSetup(false)}
              style={{ flex: 1, padding: '10px 0', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#8892b0', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleContinueToInterview}
              style={{ flex: 1, padding: '10px 0', background: '#2563eb', border: 'none', borderRadius: 8, color: '#fff', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}
            >
              Continue to Interview
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}

export default function StartPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 26, height: 26, border: '2px solid rgba(255,255,255,0.08)', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <StartPageInner />
    </Suspense>
  )
}
