'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState, Suspense } from 'react'

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 26, height: 26, border: '2px solid rgba(255,255,255,0.08)', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'onb-spin 0.7s linear infinite' }} />
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  )
}

function OnboardingContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [currentStep, setCurrentStep] = useState(1)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [cardUploaded, setCardUploaded] = useState(false)
  const [targetRole, setTargetRole] = useState('')
  const [targetCompany, setTargetCompany] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [verifyingSubscription, setVerifyingSubscription] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── auth guards ────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  // Verify user has active subscription before allowing onboarding
  useEffect(() => {
    if (status !== 'authenticated') return
    
    const fromCheckout = searchParams.get('from') === 'checkout'
    
    // Only allow onboarding if coming from checkout or if user has subscription
    fetch('/api/user/subscription')
      .then((r) => r.json())
      .then((data) => {
        if (!data.hasActiveSubscription && !fromCheckout) {
          // No subscription and not from checkout - redirect to pricing
          router.push('/pricing')
          return
        }
        setVerifyingSubscription(false)
      })
      .catch(() => {
        router.push('/pricing')
      })
  }, [status, router, searchParams])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/onboarding/status')
      .then((r) => r.json())
      .then((data) => {
        if (data.onboardingCompleted) {
          const fromCheckout = searchParams.get('from') === 'checkout'
          router.push(fromCheckout ? '/dashboard?success=true' : '/dashboard')
        }
      })
      .catch(() => {})
  }, [status, router, searchParams])

  // Show loading while verifying subscription
  if (verifyingSubscription) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 26, height: 26, border: '2px solid rgba(255,255,255,0.08)', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'onb-spin 0.7s linear infinite' }} />
      </div>
    )
  }

  // ── file handlers ──────────────────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setResumeFile(file)
    setCardUploaded(true)
  }

  function swapFile(e: React.MouseEvent) {
    e.stopPropagation()
    setResumeFile(null)
    setCardUploaded(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
      setTimeout(() => fileInputRef.current?.click(), 0)
    }
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault()
    if (!cardUploaded) setDragOver(true)
  }
  function onDragLeave() { setDragOver(false) }
  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (cardUploaded) return
    const file = e.dataTransfer.files[0]
    if (file) { setResumeFile(file); setCardUploaded(true) }
  }

  // ── navigation ─────────────────────────────────────────────────
  function goStep(n: number) { setCurrentStep(n) }

  // ── save / skip ────────────────────────────────────────────────
  async function handleFinish() {
    setSaving(true)
    try {
      const formData = new FormData()
      if (resumeFile) formData.append('resume', resumeFile)
      if (targetRole) formData.append('targetRole', targetRole)
      if (targetCompany) formData.append('targetCompany', targetCompany)
      if (jobDescription) formData.append('jobDescription', jobDescription)
      const res = await fetch('/api/onboarding/save', { method: 'POST', body: formData })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }
      router.push('/dashboard?success=true')
    } catch (err) {
      console.error('Onboarding save failed:', err)
      setSaving(false)
    }
  }

  async function skipOnboarding() {
    try { await fetch('/api/onboarding/skip', { method: 'POST' }) } catch { /* ignore */ }
    router.push('/dashboard')
  }

  // ── guards ─────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 26, height: 26, border: '2px solid rgba(255,255,255,0.08)', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'onb-spin 0.7s linear infinite' }} />
      </div>
    )
  }
  if (!session) return null

  // ── dynamic card colours ───────────────────────────────────────
  const cardBorderColor = dragOver
    ? 'rgba(59,130,246,0.5)'
    : cardUploaded ? 'rgba(59,130,246,0.35)' : 'rgba(255,255,255,0.08)'
  const cardBg = cardUploaded
    ? 'rgba(37,99,235,0.06)'
    : dragOver ? 'rgba(37,99,235,0.07)' : 'rgba(255,255,255,0.04)'

  // ── render ─────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body {
          height: 100%;
          font-family: 'Inter', sans-serif;
          background: #0a0e1a;
          color: #e8eaf2;
          overflow-x: hidden;
        }
        /* Blue glow blob — visual identity, do not remove */
        body::after {
          content: '';
          position: fixed;
          bottom: -160px;
          left: 50%;
          transform: translateX(-50%);
          width: 900px;
          height: 380px;
          background: radial-gradient(ellipse at center, rgba(37,99,235,0.55) 0%, rgba(99,102,241,0.3) 40%, transparent 75%);
          pointer-events: none;
          z-index: 0;
          filter: blur(8px);
        }
        @keyframes onb-fadein {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes onb-spin { to { transform: rotate(360deg); } }
        .onb-input::placeholder { color: rgba(100,130,200,0.4); font-style: italic; }
      `}</style>

      {/* shell */}
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* empty header */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px' }} />

        {/* step label + skip link */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '6px 24px 0' }}>
          <span style={{ fontSize: '0.78rem', color: '#5a6380', letterSpacing: '0.01em', fontFamily: "'Inter', sans-serif" }}>
            Step {currentStep} / 2
          </span>
          <button
            onClick={skipOnboarding}
            style={{ position: 'absolute', right: 24, fontSize: '0.78rem', color: '#5a6380', cursor: 'pointer', background: 'none', border: 'none', fontFamily: "'Inter', sans-serif" }}
            onMouseEnter={e => (e.currentTarget.style.color = '#8892b0')}
            onMouseLeave={e => (e.currentTarget.style.color = '#5a6380')}
          >
            Skip to explore
          </button>
        </div>

        {/* main */}
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>

          {/* ════ STEP 1 ════ */}
          {currentStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', animation: 'onb-fadein 0.35s ease both' }}>

              <h1 style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 'clamp(2rem, 4.5vw, 2.8rem)',
                fontWeight: 400,
                color: '#dde2f0',
                textAlign: 'center',
                marginBottom: 48,
                letterSpacing: '-0.01em',
              }}>
                Let&apos;s set you up for success
              </h1>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 420 }}>

                {/* upload card */}
                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  style={{
                    background: cardBg,
                    border: `1px solid ${cardBorderColor}`,
                    borderRadius: 14,
                    padding: '20px 22px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    cursor: cardUploaded ? 'default' : 'pointer',
                    transition: 'border-color 0.2s, background 0.2s',
                    position: 'relative',
                  }}
                  onMouseEnter={e => {
                    if (!cardUploaded) {
                      e.currentTarget.style.background = 'rgba(37,99,235,0.07)'
                      e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!cardUploaded) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                    }
                  }}
                >
                  {/* invisible file input covers entire card */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: 0,
                      cursor: cardUploaded ? 'default' : 'pointer',
                      zIndex: 2,
                      pointerEvents: cardUploaded ? 'none' : 'auto',
                    }}
                  />

                  {/* DEFAULT STATE */}
                  {!cardUploaded && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', pointerEvents: 'none' }}>
                      {/* left icon */}
                      <div style={{ width: 32, height: 32, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="3" y="1.5" width="13" height="17" rx="1.8" stroke="#60a5fa" strokeWidth="1.3" fill="none"/>
                          <path d="M11.5 1.5V5.5H15.5" stroke="#60a5fa" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M11.5 1.5L15.5 5.5" stroke="#60a5fa" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                          <line x1="6" y1="9" x2="12" y2="9" stroke="#60a5fa" strokeWidth="1.1" strokeLinecap="round"/>
                          <line x1="6" y1="11.5" x2="13" y2="11.5" stroke="#60a5fa" strokeWidth="1.1" strokeLinecap="round"/>
                          <line x1="6" y1="14" x2="10" y2="14" stroke="#60a5fa" strokeWidth="1.1" strokeLinecap="round"/>
                          <circle cx="17" cy="17" r="4.2" fill="#0a0e1a" stroke="#2563eb" strokeWidth="1.2"/>
                          <path d="M17 19V15.5M17 15.5L15.5 17M17 15.5L18.5 17" stroke="#60a5fa" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      {/* title + desc */}
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 500, color: '#c8d0e8', marginBottom: 4, fontFamily: "'Inter', sans-serif" }}>
                          Upload resume
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#4a5370', lineHeight: 1.5, maxWidth: 180, fontFamily: "'Inter', sans-serif" }}>
                          Add your resume and let InterviewSense personalize your answers for you.
                        </div>
                      </div>
                      {/* right thumbnail — rotated 3deg */}
                      <div style={{ marginLeft: 'auto', flexShrink: 0, opacity: 0.85, transform: 'rotate(3deg)', filter: 'drop-shadow(0 4px 12px rgba(37,99,235,0.2))' }}>
                        <svg width="72" height="88" viewBox="0 0 72 88" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="72" height="88" rx="6" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
                          <rect x="10" y="10" width="30" height="5" rx="2" fill="rgba(255,255,255,0.18)"/>
                          <rect x="10" y="18" width="20" height="3" rx="1.5" fill="rgba(255,255,255,0.08)"/>
                          <line x1="10" y1="26" x2="62" y2="26" stroke="rgba(255,255,255,0.07)" strokeWidth="0.8"/>
                          <rect x="10" y="31" width="18" height="2.5" rx="1.2" fill="rgba(96,165,250,0.4)"/>
                          <rect x="10" y="37" width="52" height="2" rx="1" fill="rgba(255,255,255,0.08)"/>
                          <rect x="10" y="42" width="44" height="2" rx="1" fill="rgba(255,255,255,0.06)"/>
                          <rect x="10" y="47" width="48" height="2" rx="1" fill="rgba(255,255,255,0.06)"/>
                          <rect x="10" y="55" width="22" height="2.5" rx="1.2" fill="rgba(96,165,250,0.4)"/>
                          <rect x="10" y="61" width="52" height="2" rx="1" fill="rgba(255,255,255,0.08)"/>
                          <rect x="10" y="66" width="38" height="2" rx="1" fill="rgba(255,255,255,0.06)"/>
                          <rect x="10" y="74" width="16" height="6" rx="3" fill="rgba(37,99,235,0.25)" stroke="rgba(59,130,246,0.3)" strokeWidth="0.8"/>
                          <rect x="29" y="74" width="14" height="6" rx="3" fill="rgba(37,99,235,0.15)" stroke="rgba(59,130,246,0.2)" strokeWidth="0.8"/>
                          <rect x="46" y="74" width="16" height="6" rx="3" fill="rgba(37,99,235,0.15)" stroke="rgba(59,130,246,0.2)" strokeWidth="0.8"/>
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* UPLOADED STATE — card transforms in place */}
                  {cardUploaded && resumeFile && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%', pointerEvents: 'none' }}>
                      {/* doc icon with green check badge */}
                      <div style={{ flexShrink: 0 }}>
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="2" y="1" width="18" height="23" rx="2.5" fill="rgba(37,99,235,0.12)" stroke="#3b82f6" strokeWidth="1.3"/>
                          <path d="M14 1V7H20" stroke="#3b82f6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                          <line x1="6" y1="12" x2="16" y2="12" stroke="#93c5fd" strokeWidth="1.1" strokeLinecap="round"/>
                          <line x1="6" y1="15" x2="18" y2="15" stroke="#93c5fd" strokeWidth="1.1" strokeLinecap="round"/>
                          <line x1="6" y1="18" x2="12" y2="18" stroke="#93c5fd" strokeWidth="1.1" strokeLinecap="round"/>
                          <circle cx="22" cy="22" r="5.5" fill="#0a0e1a" stroke="#22c55e" strokeWidth="1.3"/>
                          <path d="M19.5 22L21 23.5L24.5 20" stroke="#22c55e" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      {/* filename + size */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 500, color: '#c8d0e8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220, fontFamily: "'Inter', sans-serif" }}>
                          {resumeFile.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#4a5370', marginTop: 2, fontFamily: "'Inter', sans-serif" }}>
                          {(resumeFile.size / 1024).toFixed(0)} KB
                        </div>
                      </div>
                      {/* swap button — needs its own pointer-events */}
                      <button
                        onClick={swapFile}
                        style={{
                          background: 'none',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 6,
                          padding: '4px 10px',
                          fontSize: '0.72rem',
                          color: '#5a6380',
                          cursor: 'pointer',
                          fontFamily: "'Inter', sans-serif",
                          pointerEvents: 'all',
                          zIndex: 3,
                          position: 'relative',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)'; e.currentTarget.style.color = '#8892b0' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#5a6380' }}
                      >
                        swap
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Continue button */}
              <button
                onClick={() => goStep(2)}
                style={{
                  marginTop: 28,
                  padding: '13px 32px',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.88rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#1d4ed8' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#2563eb' }}
              >
                Continue
              </button>
            </div>
          )}

          {/* ════ STEP 2 ════ */}
          {currentStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', animation: 'onb-fadein 0.35s ease both' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%', maxWidth: 520, padding: '0 24px' }}>

                {/* "My target role is ___" */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', marginBottom: 22, width: '100%' }}>
                  <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 'clamp(1.3rem, 3vw, 1.6rem)', color: '#dde2f0', whiteSpace: 'nowrap' }}>
                    My target role is
                  </span>
                  <input
                    type="text"
                    className="onb-input"
                    value={targetRole}
                    onChange={e => setTargetRole(e.target.value)}
                    placeholder="Software Engineer Intern"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1.5px solid rgba(255,255,255,0.15)',
                      padding: '4px 2px',
                      fontFamily: "'Instrument Serif', serif",
                      fontSize: 'clamp(1.3rem, 3vw, 1.6rem)',
                      color: '#7aa3f5',
                      outline: 'none',
                      minWidth: 0,
                      flex: 1,
                    }}
                    onFocus={e => (e.currentTarget.style.borderBottomColor = '#3b82f6')}
                    onBlur={e => (e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.15)')}
                  />
                </div>

                {/* "at ___" */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', marginBottom: 32, width: '100%' }}>
                  <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 'clamp(1.3rem, 3vw, 1.6rem)', color: '#dde2f0', whiteSpace: 'nowrap' }}>
                    at
                  </span>
                  <input
                    type="text"
                    className="onb-input"
                    value={targetCompany}
                    onChange={e => setTargetCompany(e.target.value)}
                    placeholder="Google, Meta, your dream company"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1.5px solid rgba(255,255,255,0.15)',
                      padding: '4px 2px',
                      fontFamily: "'Instrument Serif', serif",
                      fontSize: 'clamp(1.3rem, 3vw, 1.6rem)',
                      color: '#7aa3f5',
                      outline: 'none',
                      minWidth: 0,
                      flex: 1,
                    }}
                    onFocus={e => (e.currentTarget.style.borderBottomColor = '#3b82f6')}
                    onBlur={e => (e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.15)')}
                  />
                </div>

                {/* Job description */}
                <div style={{ width: '100%', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
                    <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 'clamp(1.3rem, 3vw, 1.6rem)', color: '#dde2f0', whiteSpace: 'nowrap' }}>
                      and the job description
                    </span>
                    <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 'clamp(0.85rem, 2vw, 1rem)', color: '#4a5370', fontStyle: 'italic', whiteSpace: 'nowrap', alignSelf: 'flex-end', paddingBottom: 6 }}>
                      optional
                    </span>
                  </div>
                  <textarea
                    className="onb-input"
                    value={jobDescription}
                    onChange={e => setJobDescription(e.target.value)}
                    placeholder="Paste the job description — we'll tailor your prep to exactly what they're hiring for."
                    rows={4}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1.5px solid rgba(255,255,255,0.15)',
                      padding: '6px 2px',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.88rem',
                      color: '#c8d0e8',
                      outline: 'none',
                      resize: 'none',
                      lineHeight: 1.7,
                    }}
                    onFocus={e => (e.currentTarget.style.borderBottomColor = '#3b82f6')}
                    onBlur={e => (e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.15)')}
                  />
                </div>

                {/* Let's go */}
                <button
                  onClick={handleFinish}
                  disabled={saving}
                  style={{
                    marginTop: 28,
                    padding: '13px 32px',
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.88rem',
                    fontWeight: 500,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    alignSelf: 'flex-start',
                    opacity: saving ? 0.5 : 1,
                  }}
                  onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#1d4ed8' }}
                  onMouseLeave={e => { if (!saving) e.currentTarget.style.background = '#2563eb' }}
                >
                  {saving ? 'Saving…' : "Let's go"}
                </button>

                {/* Back */}
                <button
                  onClick={() => goStep(1)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#4a5370',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    marginTop: 16,
                    padding: 0,
                    alignSelf: 'flex-start',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#8892b0')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#4a5370')}
                >
                  ← Back
                </button>
              </div>
            </div>
          )}

        </main>
      </div>
    </>
  )
}
