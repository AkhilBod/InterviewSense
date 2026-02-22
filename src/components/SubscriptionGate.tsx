'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'

const Lanyard = dynamic(() => import('./Lanyard'), { ssr: false })

// ─── Constants ────────────────────────────────────────────────────
const BLUE = '#3b82f6'
const BG = '#09090b'
const CARD = '#111827'
const BORDER = '#1f2937'
const MUTED = '#6b7280'
const WHITE = '#f9fafb'

interface SubscriptionGateProps {
  children: React.ReactNode
}

type Answers = Record<string, string[]>

// ═══════════════════════════════════════════════════════════════════
//  SIDE PANELS
// ═══════════════════════════════════════════════════════════════════

function SideCompanies() {
  return (
    <div style={{ height: '100%', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Label */}
      <div style={{ position: 'relative', zIndex: 2, padding: '36px 28px 0', textAlign: 'center' }}>
        <p style={{ color: MUTED, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', margin: 0 }}>
          Trusted by engineers at
        </p>
      </div>

      {/* Lanyard badge */}
      <div style={{ flex: 1, position: 'relative', minHeight: 320 }}>
        <Lanyard />
      </div>
    </div>
  )
}

function SideStats() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [vals, setVals] = useState([0, 0, 0])
  const targets = [10000, 94, 220]

  useEffect(() => {
    targets.forEach((t, i) => {
      let start: number | null = null
      const step = (ts: number) => {
        if (!start) start = ts
        const p = Math.min((ts - start) / 1600, 1)
        const e = 1 - Math.pow(1 - p, 3)
        setVals(v => { const n = [...v]; n[i] = Math.round(e * t); return n })
        if (p < 1) requestAnimationFrame(step)
      }
      setTimeout(() => requestAnimationFrame(step), i * 280)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    let frame: number; let t = 0
    const draw = () => {
      cv.width = cv.offsetWidth; cv.height = cv.offsetHeight
      const w = cv.width, h = cv.height
      ctx.clearRect(0, 0, w, h)
      const pts: [number, number][] = Array.from({ length: 60 }, (_, i) => {
        const x = (i / 59) * w
        const base = h * 0.75 - (i / 59) * h * 0.55
        const n = Math.sin(i * 0.35 + t * 0.04) * 8 + Math.sin(i * 0.7 + t * 0.025) * 4
        return [x, base + n]
      })
      const grad = ctx.createLinearGradient(0, 0, 0, h)
      grad.addColorStop(0, 'rgba(59,130,246,0.18)')
      grad.addColorStop(1, 'rgba(59,130,246,0)')
      ctx.beginPath(); ctx.moveTo(0, h)
      pts.forEach(([x, y]) => ctx.lineTo(x, y))
      ctx.lineTo(w, h); ctx.closePath()
      ctx.fillStyle = grad; ctx.fill()
      ctx.beginPath()
      pts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y))
      ctx.strokeStyle = BLUE; ctx.lineWidth = 1.8; ctx.stroke()
      const [lx, ly] = pts[pts.length - 1]
      ctx.beginPath(); ctx.arc(lx, ly, 3.5, 0, Math.PI * 2)
      ctx.fillStyle = BLUE; ctx.fill()
      t++
      frame = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div style={{ height: '100%', padding: '44px 36px', display: 'flex', flexDirection: 'column' }}>
      <p style={{ color: MUTED, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 32 }}>Platform results</p>
      {[
        { val: vals[0].toLocaleString() + '+', label: 'Developers trained' },
        { val: vals[1] + '%', label: 'Report more confidence' },
        { val: '$' + vals[2] + 'K', label: 'Highest reported offer' },
      ].map((s, i) => (
        <div key={i} style={{ marginBottom: 24, paddingBottom: 24, borderBottom: i < 2 ? `1px solid ${BORDER}` : 'none' }}>
          <p style={{ color: WHITE, fontSize: 40, fontWeight: 800, margin: 0, fontVariantNumeric: 'tabular-nums', letterSpacing: '-1px' }}>{s.val}</p>
          <p style={{ color: MUTED, fontSize: 12, margin: '4px 0 0' }}>{s.label}</p>
        </div>
      ))}
      <div style={{ flex: 1, minHeight: 80 }}>
        <p style={{ color: MUTED, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Interview scores over time</p>
        <canvas ref={canvasRef} style={{ width: '100%', height: 80, display: 'block' }} />
      </div>
    </div>
  )
}

function SideStar() {
  const [active, setActive] = useState(0)
  const [typing, setTyping] = useState('')
  const parts = [
    { k: 'Situation', ex: 'During my internship at a fintech startup, our payment service had a critical outage affecting 12,000 users on a peak trading day.' },
    { k: 'Task', ex: 'I was responsible for diagnosing the root cause and restoring service within our 2-hour SLA window — alone.' },
    { k: 'Action', ex: 'I traced it to a race condition in our async queue handler, wrote a hotfix, tested on staging, and deployed with zero downtime.' },
    { k: 'Result', ex: 'Service restored in 47 minutes. My post-mortem prevented 3 similar incidents. I was offered a return offer at $185K.' },
  ]

  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % 4), 3000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    setTyping('')
    const txt = parts[active].ex
    let i = 0
    const t = setInterval(() => { i++; setTyping(txt.slice(0, i)); if (i >= txt.length) clearInterval(t) }, 16)
    return () => clearInterval(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  return (
    <div style={{ height: '100%', padding: '44px 36px' }}>
      <p style={{ color: MUTED, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 28 }}>AI behavioral coaching</p>
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {parts.map((p, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            flex: 1, padding: '8px 4px', background: active === i ? BLUE : CARD,
            border: `1px solid ${active === i ? BLUE : BORDER}`, borderRadius: 6,
            color: active === i ? '#fff' : MUTED, fontSize: 12, fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s',
          }}>{p.k[0]}</button>
        ))}
      </div>
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '20px 22px', minHeight: 130 }}>
        <p style={{ color: BLUE, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 10px', fontWeight: 700 }}>{parts[active].k}</p>
        <p style={{ color: WHITE, fontSize: 13, lineHeight: 1.75, margin: 0 }}>
          {typing}<span style={{ color: BLUE, animation: 'blink 1s infinite' }}>|</span>
        </p>
      </div>
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[['Clarity', '91'], ['Filler words', '0'], ['Impact quantified', 'Yes']].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${BORDER}` }}>
            <span style={{ color: MUTED, fontSize: 12 }}>{k}</span>
            <span style={{ color: WHITE, fontSize: 12, fontWeight: 600 }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SideTimeline() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    let frame: number; let t = 0
    const rings = [
      { r: 60, speed: 0.001, dotR: 4, label: '' },
      { r: 100, speed: -0.0006, dotR: 4, label: '' },
      { r: 140, speed: 0.0005, dotR: 4, label: '' },
      { r: 180, speed: -0.0004, dotR: 4, label: '' },
    ]
    const draw = () => {
      cv.width = cv.offsetWidth; cv.height = cv.offsetHeight
      const cx = cv.width / 2, cy = cv.height / 2
      ctx.clearRect(0, 0, cv.width, cv.height)
      const pulseR = 14 + Math.sin(t * 0.06) * 3
      const pg = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseR * 2)
      pg.addColorStop(0, 'rgba(59,130,246,0.6)')
      pg.addColorStop(1, 'rgba(59,130,246,0)')
      ctx.beginPath(); ctx.arc(cx, cy, pulseR * 2, 0, Math.PI * 2)
      ctx.fillStyle = pg; ctx.fill()
      ctx.beginPath(); ctx.arc(cx, cy, pulseR, 0, Math.PI * 2)
      ctx.fillStyle = BLUE; ctx.fill()
      rings.forEach((ring, ri) => {
        ctx.beginPath(); ctx.arc(cx, cy, ring.r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(59,130,246,${0.08 + ri * 0.02})`
        ctx.lineWidth = 1; ctx.stroke()
        const angle = t * ring.speed * 60 + ri * 1.2
        const dx = cx + Math.cos(angle) * ring.r
        const dy = cy + Math.sin(angle) * ring.r
        ctx.beginPath(); ctx.arc(dx, dy, ring.dotR, 0, Math.PI * 2)
        ctx.fillStyle = BLUE; ctx.fill()
        ctx.font = '11px system-ui'
        ctx.fillStyle = 'rgba(156,163,175,0.75)'
        ctx.fillText(ring.label, dx + 8, dy + 4)
      })
      t++
      frame = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div style={{ height: '100%', padding: '44px 36px', display: 'flex', flexDirection: 'column' }}>
      <p style={{ color: MUTED, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Your learning orbit</p>
      <p style={{ color: WHITE, fontSize: 14, margin: '0 0 20px' }}>4 modules. 21 days. One offer.</p>
      <canvas ref={canvasRef} style={{ flex: 1, width: '100%', display: 'block' }} />
    </div>
  )
}

function SideUrgency({ answers }: { answers: Answers }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const u = answers.urgency?.[0] || ''
  const cfg: Record<string, { intensity: number; label: string; sessions: string; freq: number }> = {
    'This week': { intensity: 95, label: 'Intensive', sessions: '4 sessions / day', freq: 3.5 },
    'This month': { intensity: 65, label: 'Focused', sessions: '2 sessions / day', freq: 2 },
    '1–3 months': { intensity: 38, label: 'Steady', sessions: '1 session / day', freq: 1.2 },
    'Just exploring': { intensity: 18, label: 'Exploratory', sessions: 'At your own pace', freq: 0.6 },
  }
  const c = cfg[u] || cfg['This month']
  const [bar, setBar] = useState(0)

  useEffect(() => { setBar(0); const t = setTimeout(() => setBar(c.intensity), 80); return () => clearTimeout(t) }, [u, c.intensity])

  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    let frame: number; let t = 0
    const freq = c.freq
    const amp = 18 + (c.intensity / 100) * 28
    const draw = () => {
      cv.width = cv.offsetWidth; cv.height = cv.offsetHeight
      const w = cv.width, h = cv.height, mid = h / 2
      ctx.clearRect(0, 0, w, h)
      const pts: [number, number][] = Array.from({ length: w }, (_, x) => {
        const phase = (x / w) * Math.PI * 2 * freq + t * 0.05
        const y = mid + Math.sin(phase) * amp + Math.sin(phase * 1.7 + 1) * (amp * 0.4)
        return [x, y]
      })
      const g = ctx.createLinearGradient(0, 0, w, 0)
      g.addColorStop(0, 'rgba(59,130,246,0)')
      g.addColorStop(0.5, BLUE)
      g.addColorStop(1, 'rgba(59,130,246,0)')
      ctx.beginPath()
      pts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y))
      ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.stroke()
      ctx.beginPath()
      pts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y))
      ctx.strokeStyle = 'rgba(59,130,246,0.15)'; ctx.lineWidth = 8; ctx.stroke()
      t++
      frame = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(frame)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [u])

  return (
    <div style={{ height: '100%', padding: '44px 36px', display: 'flex', flexDirection: 'column' }}>
      <p style={{ color: MUTED, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 24 }}>Recommended plan intensity</p>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
          <p style={{ color: WHITE, fontSize: 34, fontWeight: 800, margin: 0 }}>{c.label}</p>
          <p style={{ color: BLUE, fontSize: 24, fontWeight: 700, margin: 0 }}>{c.intensity}%</p>
        </div>
        <div style={{ background: BORDER, borderRadius: 2, height: 4 }}>
          <div style={{ width: `${bar}%`, height: '100%', background: BLUE, transition: 'width 0.8s cubic-bezier(.4,0,.2,1)', borderRadius: 2 }} />
        </div>
        <p style={{ color: MUTED, fontSize: 12, margin: '8px 0 0' }}>{c.sessions}</p>
      </div>
      <canvas ref={canvasRef} style={{ flex: 1, width: '100%', display: 'block', maxHeight: 120 }} />
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {['Behavioral coaching', 'Resume analysis', 'Mock interviews', 'System design drills'].map((f, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: `1px solid ${BORDER}` }}>
            <span style={{ color: '#d1d5db', fontSize: 12 }}>{f}</span>
            <span style={{ color: BLUE, fontSize: 11, fontWeight: 600 }}>Included</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SideOffer({ answers }: { answers: Answers }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const goals = answers.goal || []
  const [revealed, setRevealed] = useState<number[]>([])
  const features = [
    { label: 'Behavioral Practice', sub: 'STAR-method AI coaching', always: true, cond: true },
    { label: 'Resume Analysis', sub: 'ATS scoring + line-by-line notes', always: true, cond: true },
    { label: 'Technical Prep', sub: 'Curated for your target role', always: true, cond: true },
    { label: 'Cover Letter Gen', sub: 'Tailored to each company', always: false, cond: goals.some(g => g.includes('FAANG') || g.includes('internship')) },
    { label: 'System Design', sub: 'Architecture & scalability drills', always: false, cond: goals.some(g => g.includes('2x') || g.includes('compensation')) },
    { label: 'Career Roadmap', sub: 'Step-by-step path to your goal', always: false, cond: goals.some(g => g.includes('Break') || g.includes('confidence')) },
  ].filter(f => f.always || f.cond)

  useEffect(() => {
    setRevealed([])
    const timers = features.map((_, i) =>
      setTimeout(() => setRevealed(r => [...r, i]), i * 110 + 100)
    )
    return () => timers.forEach(clearTimeout)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goals.length])

  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    let frame: number
    const lines = Array.from({ length: 12 }, () => ({
      x: Math.random() * 300, y: Math.random() * 120,
      len: 30 + Math.random() * 60, speed: 0.4 + Math.random() * 0.8,
      opacity: 0.06 + Math.random() * 0.12,
    }))
    const draw = () => {
      cv.width = cv.offsetWidth; cv.height = cv.offsetHeight
      ctx.clearRect(0, 0, cv.width, cv.height)
      lines.forEach(l => {
        l.x += l.speed
        if (l.x > cv.width + l.len) l.x = -l.len
        const g = ctx.createLinearGradient(l.x, 0, l.x + l.len, 0)
        g.addColorStop(0, 'rgba(59,130,246,0)')
        g.addColorStop(0.5, `rgba(59,130,246,${l.opacity})`)
        g.addColorStop(1, 'rgba(59,130,246,0)')
        ctx.beginPath(); ctx.moveTo(l.x, l.y); ctx.lineTo(l.x + l.len, l.y)
        ctx.strokeStyle = g; ctx.lineWidth = 1.5; ctx.stroke()
      })
      frame = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div style={{ height: '100%', padding: '44px 36px', display: 'flex', flexDirection: 'column' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: 60, display: 'block', marginBottom: 16, opacity: 0.8 }} />
      <p style={{ color: MUTED, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 6px' }}>Your personalized plan</p>
      <p style={{ color: WHITE, fontSize: 18, fontWeight: 700, margin: '0 0 22px' }}>{features.length} modules activated</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {features.map((f, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '11px 14px', background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8,
            opacity: revealed.includes(i) ? 1 : 0,
            transform: revealed.includes(i) ? 'translateX(0)' : 'translateX(-14px)',
            transition: 'all 0.35s cubic-bezier(.2,.8,.4,1)',
          }}>
            <div>
              <p style={{ margin: 0, color: WHITE, fontSize: 13, fontWeight: 600 }}>{f.label}</p>
              <p style={{ margin: '2px 0 0', color: MUTED, fontSize: 11 }}>{f.sub}</p>
            </div>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: BLUE, flexShrink: 0 }} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 'auto', paddingTop: 20, padding: '14px 16px', background: '#0a1628', border: `1px solid ${BLUE}25`, borderRadius: 8 }}>
        <p style={{ margin: 0, color: BLUE, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em' }}>PLAN READY</p>
        <p style={{ margin: '3px 0 0', color: '#94a3b8', fontSize: 12 }}>Start your free trial to unlock your custom curriculum.</p>
      </div>
    </div>
  )
}

// ─── Steps config ─────────────────────────────────────────────────
const STEPS = [
  {
    id: 'role', q: 'What type of role are you targeting?', sub: 'Select all that apply', multi: true, side: 'companies' as const,
    opts: ['Software Engineering Intern', 'Full-time SWE', 'Data Science / ML', 'Systems / Infrastructure', 'Frontend / UI', 'Product Manager'],
  },
  {
    id: 'target', q: 'Which companies are on your radar?', sub: 'Select all that apply', multi: true, side: 'stats' as const,
    opts: ['FAANG / Big Tech', 'Quant / HFT Firms', 'Series A–C Startups', 'Defense / Gov', 'Fintech', 'Open to anything'],
  },
  {
    id: 'weakest', q: 'Where do you struggle most in interviews?', sub: 'Be honest — this shapes your entire plan', multi: false, side: 'star' as const,
    opts: ['Behavioral / STAR storytelling', 'LeetCode-style coding', 'System design', 'Resume & getting interviews', 'Cover letters & outreach', 'All of the above'],
  },
  {
    id: 'experience', q: "What's your current experience level?", sub: null, multi: false, side: 'timeline' as const,
    opts: [
      { label: 'Student / No experience yet', desc: 'Still in school, building first projects' },
      { label: '0–1 years', desc: 'New grad or completing first internship' },
      { label: '1–3 years', desc: 'Some professional experience' },
      { label: '3+ years', desc: 'Senior or looking to level up significantly' },
    ],
  },
  {
    id: 'urgency', q: 'When is your next target interview?', sub: "We'll calibrate the intensity of your plan", multi: false, side: 'urgency' as const,
    opts: ['This week', 'This month', '1–3 months', 'Just exploring'],
  },
  {
    id: 'goal', q: 'What does success look like?', sub: 'Select all that apply', multi: true, side: 'offer' as const,
    opts: ['Land a FAANG / top-tier offer', 'Break into tech from another field', '2x my current compensation', 'Get my first CS internship', 'Build real interview confidence', 'Ace behavioral rounds specifically'],
  },
]

const PANELS: Record<string, React.ComponentType<{ answers: Answers }>> = {
  companies: () => <SideCompanies />,
  stats: () => <SideStats />,
  star: () => <SideStar />,
  timeline: () => <SideTimeline />,
  urgency: SideUrgency,
  offer: SideOffer,
}

// ═══════════════════════════════════════════════════════════════════
//  PAYMENT SCREEN
// ═══════════════════════════════════════════════════════════════════
function PaymentScreen({
  onSubscribe,
  loading,
}: {
  onSubscribe: (priceId: string | undefined, plan: string) => void
  loading: string | null
}) {
  const [billing, setBilling] = useState('annual')

  return (
    <div style={{
      minHeight: '100vh', background: BG, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '48px 24px',
      fontFamily: 'system-ui,-apple-system,sans-serif',
    }}>
      <p style={{ color: MUTED, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
        Your plan is ready
      </p>
      <h1 style={{ color: WHITE, fontSize: 30, fontWeight: 800, margin: '0 0 8px', textAlign: 'center' }}>
        Unlock InterviewSense
      </h1>
      <p style={{ color: MUTED, fontSize: 14, margin: '0 0 44px' }}>3-day free trial. Cancel anytime.</p>
      <div style={{ display: 'flex', gap: 16, width: '100%', maxWidth: 720 }}>
        {[
          {
            id: 'monthly', label: 'Monthly', price: '$25', per: '/month', badge: null,
            priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID,
            features: ['All 6 practice modes', 'AI-powered feedback', 'Resume & cover letter tools', 'LeetCode-style problems', '5% off coaching'],
          },
          {
            id: 'annual', label: 'Annual', price: '$199', per: '/year', badge: 'Save 33%',
            priceId: process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID,
            features: ['All 6 practice modes', 'AI-powered feedback', 'Resume & cover letter tools', 'LeetCode-style problems', '15% off coaching', 'Premium community access'],
          },
        ].map(plan => (
          <div key={plan.id} onClick={() => setBilling(plan.id)} style={{
            flex: 1, background: CARD,
            border: `1px solid ${billing === plan.id ? BLUE : BORDER}`,
            borderRadius: 12, padding: '28px 24px', cursor: 'pointer',
            position: 'relative', transition: 'border-color 0.2s',
          }}>
            {plan.badge && (
              <div style={{
                position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                background: BLUE, color: '#fff', fontSize: 11, fontWeight: 700,
                padding: '4px 14px', borderRadius: 20, whiteSpace: 'nowrap',
              }}>{plan.badge}</div>
            )}
            <p style={{ color: WHITE, fontSize: 15, fontWeight: 700, margin: '0 0 14px' }}>{plan.label}</p>
            <p style={{ margin: '0 0 4px' }}>
              <span style={{ color: WHITE, fontSize: 40, fontWeight: 800 }}>{plan.price}</span>
              <span style={{ color: MUTED, fontSize: 14 }}>{plan.per}</span>
            </p>
            <p style={{ color: MUTED, fontSize: 13, margin: '0 0 24px' }}>Full platform access.</p>
            <button
              onClick={(e) => { e.stopPropagation(); onSubscribe(plan.priceId, plan.label) }}
              disabled={loading === plan.label}
              style={{
                width: '100%', padding: 13, borderRadius: 8, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                background: billing === plan.id ? BLUE : '#1f2937',
                color: billing === plan.id ? '#fff' : MUTED,
                fontWeight: 600, fontSize: 14, transition: 'all 0.2s',
                opacity: loading === plan.label ? 0.6 : 1,
              }}
            >
              {loading === plan.label ? 'Processing…' : 'Try 3-day free trial'}
            </button>
            <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {plan.features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: BLUE, flexShrink: 0 }} />
                  <span style={{ color: '#d1d5db', fontSize: 13 }}>{f}</span>
                </div>
              ))}
            </div>
            <p style={{ margin: '20px 0 0', color: '#374151', fontSize: 12, textAlign: 'center' }}>Cancel anytime</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function SubscriptionGate({ children }: SubscriptionGateProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [hasSubscription, setHasSubscription] = useState(false)
  const [subscriptionLoading, setSubscriptionLoading] = useState<string | null>(null)
  const [questionnaireComplete, setQuestionnaireComplete] = useState(false)

  // Questionnaire state
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [fading, setFading] = useState(false)
  const [sideKey, setSideKey] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  const cur = STEPS[step]
  const sel = answers[cur?.id] || []

  // ─── Stripe checkout ────────────────────────────────────────────
  const handleSubscribe = useCallback(async (priceId: string | undefined, planName: string) => {
    if (!priceId) { alert('Price ID not configured.'); return }
    setSubscriptionLoading(planName)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      const data = await res.json()
      if (data.error) { alert(data.error); setSubscriptionLoading(null); return }
      if (data.url) window.location.href = data.url
    } catch {
      alert('Failed to start checkout. Please try again.')
      setSubscriptionLoading(null)
    }
  }, [])

  // ─── Check subscription + questionnaire on mount ────────────────
  useEffect(() => {
    // Track mobile status
    const checkMobile = () => {
      setIsMobile(typeof window !== 'undefined' && window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // ─── Load questionnaire data ────────────────────────────────────
  useEffect(() => {
    async function check() {
      if (status === 'loading') return
      if (!session) { router.push('/login'); return }

      // Check questionnaire from DB — ONLY trust the DB, never stale localStorage
      let qDone = false
      try {
        const qRes = await fetch('/api/user/questionnaire-status')
        if (qRes.ok) {
          const qJson = await qRes.json()
          if (qJson.questionnaireCompleted === true) {
            qDone = true
            const saved = localStorage.getItem('isQuestionnaireData')
            if (saved) try { setAnswers(JSON.parse(saved)) } catch { /* ignore */ }
          }
        }
        // If response is not ok (401, 404, 500), questionnaire is NOT complete
        // Do NOT fall back to localStorage — it may be stale from a previous session
      } catch {
        // Network error — default to showing the questionnaire (safe default)
        // Don't trust localStorage here, it could be from a different user/session
        console.warn('Failed to check questionnaire status, defaulting to showing questionnaire')
      }
      setQuestionnaireComplete(qDone)

      try {
        const response = await fetch('/api/subscription-status')
        const data = await response.json()
        setHasSubscription(!!data.hasActiveSubscription)
      } catch {
        setHasSubscription(false)
      } finally {
        setChecking(false)
      }
    }
    check()
  }, [session, status, router])

  // ─── Toggle answer selection ────────────────────────────────────
  const toggle = (label: string) => {
    if (cur.multi) {
      setAnswers(a => {
        const arr = a[cur.id] || []
        return { ...a, [cur.id]: arr.includes(label) ? arr.filter(x => x !== label) : [...arr, label] }
      })
    } else {
      setAnswers(a => ({ ...a, [cur.id]: [label] }))
    }
  }

  // ─── Next step or complete ──────────────────────────────────────
  const next = async () => {
    setFading(true)
    setTimeout(async () => {
      if (step < STEPS.length - 1) {
        setStep(s => s + 1)
        setSideKey(k => k + 1)
      } else {
        // Map answers to the API format for DB persistence
        const mappedData = {
          goal: (answers.goal || []).join(', '),
          interviewType: (answers.role || []).join(', '),
          experience: (answers.experience || []).join(', '),
          timeline: (answers.urgency || []).join(', '),
          weakestArea: (answers.weakest || []).join(', '),
        }
        // Save to localStorage as backup
        localStorage.setItem('isQuestionnaireData', JSON.stringify(answers))
        // Persist to DB — this is the source of truth
        try {
          const res = await fetch('/api/user/questionnaire', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mappedData),
          })
          if (!res.ok) {
            console.error('Failed to save questionnaire to DB:', await res.text())
          }
        } catch (err) {
          console.error('Failed to save questionnaire:', err)
        }
        setQuestionnaireComplete(true)
      }
      setFading(false)
    }, 180)
  }

  const canNext = sel.length > 0

  // ─── Loading ────────────────────────────────────────────────────
  if (status === 'loading' || checking) {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    )
  }

  // ─── Has subscription → render dashboard ────────────────────────
  if (hasSubscription) return <>{children}</>

  // ─── Questionnaire completed → payment ──────────────────────────
  if (questionnaireComplete) {
    return <PaymentScreen onSubscribe={handleSubscribe} loading={subscriptionLoading} />
  }

  // ─── Questionnaire ──────────────────────────────────────────────
  const Panel = PANELS[cur.side]

  return (
    <>
      {/* Blink animation for cursor */}
      <style>{`@keyframes blink { 0%,100% { opacity: 1 } 50% { opacity: 0 } }`}</style>
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', fontFamily: 'system-ui,-apple-system,sans-serif', flexDirection: isMobile ? 'column' : 'row' }}>
        {/* Left: questions */}
        <div style={{ flex: isMobile ? 'none' : '0 0 48%', display: 'flex', flexDirection: 'column', padding: isMobile ? '32px 20px' : '44px 52px', width: isMobile ? '100%' : 'auto' }}>
          {/* Progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 60 }}>
            <span style={{ color: MUTED, fontSize: 12 }}>Step {step + 1} of {STEPS.length}</span>
            <div style={{ display: 'flex', gap: 4, flex: 1 }}>
              {STEPS.map((_, i) => (
                <div key={i} style={{ flex: 1, height: 2, borderRadius: 1, background: i <= step ? BLUE : BORDER, transition: 'background 0.3s' }} />
              ))}
            </div>
          </div>

          {/* Question */}
          <div style={{
            opacity: fading ? 0 : 1,
            transform: fading ? 'translateY(6px)' : 'translateY(0)',
            transition: 'all 0.18s ease',
          }}>
            <h2 style={{ color: WHITE, fontSize: isMobile ? 20 : 25, fontWeight: 700, lineHeight: 1.3, margin: '0 0 6px' }}>{cur.q}</h2>
            {cur.sub && <p style={{ color: MUTED, fontSize: 13, margin: '0 0 26px' }}>{cur.sub}</p>}
            {!cur.sub && <div style={{ marginBottom: 26 }} />}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {cur.opts.map(opt => {
                const label = typeof opt === 'string' ? opt : opt.label
                const desc = typeof opt === 'object' ? opt.desc : null
                const isOn = sel.includes(label)
                return (
                  <div key={label} onClick={() => toggle(label)} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', borderRadius: 8, cursor: 'pointer',
                    border: `1px solid ${isOn ? BLUE : BORDER}`,
                    background: isOn ? '#0c1a30' : 'transparent',
                    transition: 'all 0.15s ease',
                  }}>
                    <div>
                      <p style={{ margin: 0, color: WHITE, fontSize: 14, fontWeight: isOn ? 500 : 400 }}>{label}</p>
                      {desc && <p style={{ margin: '2px 0 0', color: MUTED, fontSize: 12 }}>{desc}</p>}
                    </div>
                    {isOn && <div style={{ width: 8, height: 8, borderRadius: '50%', background: BLUE, flexShrink: 0 }} />}
                  </div>
                )
              })}
            </div>

            <button onClick={next} disabled={!canNext} style={{
              marginTop: 26, padding: '12px 28px', borderRadius: 8, border: 'none',
              background: canNext ? BLUE : '#1f2937',
              color: canNext ? '#fff' : '#374151',
              fontWeight: 600, fontSize: 14,
              cursor: canNext ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s ease',
            }}>
              {step === STEPS.length - 1 ? 'See my plan →' : 'Continue →'}
            </button>
          </div>
        </div>

        {/* Divider — hidden on mobile */}
        {!isMobile && <div style={{ width: 1, background: BORDER, flexShrink: 0 }} />}

        {/* Right: animated panel — hidden on mobile */}
        {!isMobile && (
          <div key={sideKey} style={{ flex: 1, opacity: fading ? 0 : 1, transition: 'opacity 0.25s ease', overflow: 'hidden' }}>
            <Panel answers={answers} />
          </div>
        )}
      </div>
    </>
  )
}
