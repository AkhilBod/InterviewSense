"use client"

import { useEffect, useRef, useState, useCallback } from "react"

/* ─── Behavioral Animation ─── */
function BehavioralAnimation() {
  const [phase, setPhase] = useState(0) // 0=idle, 1=left, 2=right, 3=pause
  useEffect(() => {
    const timings = [500, 2000, 2000, 2500] // idle, show left, show right, pause then reset
    const timeout = setTimeout(() => {
      setPhase((p) => (p + 1) % 4)
    }, timings[phase])
    return () => clearTimeout(timeout)
  }, [phase])

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative flex items-end gap-12 sm:gap-16 lg:gap-20">
        {/* Left figure */}
        <div className="flex flex-col items-center">
          {/* Speech bubble */}
          <div
            className="mb-4 transition-all duration-700 ease-out"
            style={{
              opacity: phase === 1 || phase === 2 ? 1 : 0,
              transform: phase === 1 || phase === 2 ? "translateY(0)" : "translateY(8px)",
            }}
          >
            <div
              className="relative px-4 py-2.5 rounded-lg border"
              style={{
                borderColor: "rgba(255,255,255,0.15)",
                background: phase === 1 ? "rgba(58,57,132,0.25)" : "rgba(255,255,255,0.03)",
                boxShadow: phase === 1 ? "0 0 20px rgba(58,57,132,0.3)" : "none",
                transition: "background 0.5s, box-shadow 0.5s",
              }}
            >
              <span className="text-[13px] sm:text-sm text-zinc-400 whitespace-nowrap" style={{ fontFamily: "monospace" }}>
                Tell me about a time…
              </span>
              {/* Tail */}
              <div
                className="absolute -bottom-1.5 left-4 w-3 h-3 rotate-45 border-b border-r"
                style={{
                  borderColor: "rgba(255,255,255,0.15)",
                  background: phase === 1 ? "rgba(58,57,132,0.25)" : "rgba(255,255,255,0.03)",
                }}
              />
            </div>
          </div>
          {/* Figure - wireframe silhouette */}
          <svg width="44" height="72" viewBox="0 0 40 64" fill="none">
            <circle cx="20" cy="12" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
            <rect x="8" y="26" width="24" height="34" rx="8" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Right figure */}
        <div className="flex flex-col items-center">
          {/* Speech bubble */}
          <div
            className="mb-4 transition-all duration-700 ease-out"
            style={{
              opacity: phase === 2 ? 1 : 0,
              transform: phase === 2 ? "translateY(0)" : "translateY(8px)",
            }}
          >
            <div
              className="relative px-4 py-2.5 rounded-lg border"
              style={{
                borderColor: "rgba(255,255,255,0.15)",
                background: phase === 2 ? "rgba(58,57,132,0.25)" : "rgba(255,255,255,0.03)",
                boxShadow: phase === 2 ? "0 0 20px rgba(58,57,132,0.3)" : "none",
                transition: "background 0.5s, box-shadow 0.5s",
              }}
            >
              <span className="text-[13px] sm:text-sm text-zinc-400 whitespace-nowrap" style={{ fontFamily: "monospace" }}>
                In my last role, I…
              </span>
              <div
                className="absolute -bottom-1.5 right-4 w-3 h-3 rotate-45 border-b border-r"
                style={{
                  borderColor: "rgba(255,255,255,0.15)",
                  background: phase === 2 ? "rgba(58,57,132,0.25)" : "rgba(255,255,255,0.03)",
                }}
              />
            </div>
          </div>
          {/* Figure */}
          <svg width="44" height="72" viewBox="0 0 40 64" fill="none">
            <circle cx="20" cy="12" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
            <rect x="8" y="26" width="24" height="34" rx="8" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
    </div>
  )
}

/* ─── System Design Animation (kept as-is) ─── */
function SystemDesignAnimation() {
  return (
    <div className="w-full h-full flex items-center justify-center p-6">
      <svg viewBox="0 0 200 120" className="w-full h-full max-h-[240px]" fill="none">
        <path d="M40 30 L100 30 L100 60" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="200" style={{ animation: "drawPath 3s ease-in-out infinite" }} />
        <path d="M100 60 L160 60" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="200" style={{ animation: "drawPath 3s ease-in-out infinite 0.5s" }} />
        <path d="M100 60 L100 90 L60 90" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="200" style={{ animation: "drawPath 3s ease-in-out infinite 1s" }} />
        <path d="M100 90 L140 90" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="200" style={{ animation: "drawPath 3s ease-in-out infinite 1.5s" }} />
        <circle cx="40" cy="30" fill="#3b82f6"><animate attributeName="r" values="0;6;6" dur="3s" repeatCount="indefinite" /></circle>
        <circle cx="100" cy="30" fill="#3b82f6"><animate attributeName="r" values="0;6;6" dur="3s" begin="0.3s" repeatCount="indefinite" /></circle>
        <circle cx="160" cy="60" fill="#3b82f6"><animate attributeName="r" values="0;6;6" dur="3s" begin="0.8s" repeatCount="indefinite" /></circle>
        <circle cx="60" cy="90" fill="#8b5cf6"><animate attributeName="r" values="0;6;6" dur="3s" begin="1.3s" repeatCount="indefinite" /></circle>
        <circle cx="140" cy="90" fill="#8b5cf6"><animate attributeName="r" values="0;6;6" dur="3s" begin="1.8s" repeatCount="indefinite" /></circle>
        <text x="40" y="18" textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="monospace">Client</text>
        <text x="100" y="18" textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="monospace">Load Balancer</text>
        <text x="160" y="50" textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="monospace">API</text>
        <text x="60" y="105" textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="monospace">Cache</text>
        <text x="140" y="105" textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="monospace">DB</text>
      </svg>
    </div>
  )
}

/* ─── Resume Review Animation ─── */
const DOC_LINES = [
  { status: "green" },
  { status: "green" },
  { status: "amber" },
  { status: "green" },
  { status: "red" },
  { status: "amber" },
  { status: "green" },
] as const

function ResumeReviewAnimation() {
  // phases: 0=scanning, 1=score, 2=ats, 3=pause, 4=fadeout
  const [phase, setPhase] = useState(0)
  const [scanProgress, setScanProgress] = useState(0) // 0-100
  const [atsProgress, setAtsProgress] = useState(0)
  const scanRef = useRef<number>(0)
  const atsRef = useRef<number>(0)

  const reset = useCallback(() => {
    setPhase(0)
    setScanProgress(0)
    setAtsProgress(0)
  }, [])

  // Scan animation
  useEffect(() => {
    if (phase !== 0) return
    const start = performance.now()
    const duration = 2500
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      setScanProgress(p * 100)
      if (p < 1) {
        scanRef.current = requestAnimationFrame(tick)
      } else {
        setPhase(1)
      }
    }
    scanRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(scanRef.current)
  }, [phase])

  // Score fade in → ATS bar
  useEffect(() => {
    if (phase === 1) {
      const t = setTimeout(() => setPhase(2), 800)
      return () => clearTimeout(t)
    }
    if (phase === 2) {
      const start = performance.now()
      const duration = 1200
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1)
        setAtsProgress(p * 100)
        if (p < 1) {
          atsRef.current = requestAnimationFrame(tick)
        } else {
          setPhase(3)
        }
      }
      atsRef.current = requestAnimationFrame(tick)
      return () => cancelAnimationFrame(atsRef.current)
    }
    if (phase === 3) {
      const t = setTimeout(() => setPhase(4), 2500)
      return () => clearTimeout(t)
    }
    if (phase === 4) {
      const t = setTimeout(reset, 800)
      return () => clearTimeout(t)
    }
  }, [phase, reset])

  const containerOpacity = phase === 4 ? 0 : 1
  const lineScanned = (idx: number) => scanProgress > (idx / DOC_LINES.length) * 100

  const statusColor = (s: string) => {
    if (s === "green") return { dot: "#22c55e", bg: "rgba(34,197,94,0.08)" }
    if (s === "amber") return { dot: "#f59e0b", bg: "rgba(245,158,11,0.08)" }
    return { dot: "#ef4444", bg: "rgba(239,68,68,0.08)" }
  }

  return (
    <div className="w-full h-full flex items-center justify-center" style={{ transition: "opacity 0.8s", opacity: containerOpacity }}>
      <div className="relative">
        {/* Document */}
        <div className="relative w-36 sm:w-44 border border-white/10 rounded-lg overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
          <div className="p-4 space-y-2.5">
            {DOC_LINES.map((line, i) => {
              const scanned = lineScanned(i)
              const c = statusColor(line.status)
              return (
                <div key={i} className="flex items-center gap-2 transition-all duration-500" style={{ background: scanned ? c.bg : "transparent", borderRadius: 4, padding: "2px 4px" }}>
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-500"
                    style={{ background: scanned ? c.dot : "transparent" }}
                  />
                  <div
                    className="h-1.5 rounded transition-all duration-500"
                    style={{
                      width: `${60 + (i % 3) * 15}%`,
                      background: scanned ? `${c.dot}33` : "rgba(255,255,255,0.08)",
                    }}
                  />
                </div>
              )
            })}
          </div>
          {/* Scan line */}
          {phase === 0 && (
            <div
              className="absolute left-0 w-full h-0.5"
              style={{
                top: `${scanProgress}%`,
                background: "linear-gradient(90deg, transparent, #7c3aed, transparent)",
                boxShadow: "0 0 8px rgba(124,58,237,0.5)",
                transition: "top 0.05s linear",
              }}
            />
          )}
        </div>

        {/* Score badge */}
        <div
          className="absolute -top-4 -right-14 sm:-right-16 px-4 py-2 rounded-lg border border-white/10 transition-all duration-500"
          style={{
            opacity: phase >= 1 && phase < 4 ? 1 : 0,
            transform: phase >= 1 && phase < 4 ? "translateY(0)" : "translateY(6px)",
            background: "rgba(34,197,94,0.1)",
          }}
        >
          <div className="text-[11px] text-zinc-500">Score</div>
          <div className="text-xl font-bold" style={{ color: "#22c55e" }}>87</div>
        </div>

        {/* ATS simulation bar */}
        <div
          className="mt-4 transition-all duration-500"
          style={{
            opacity: phase >= 2 && phase < 4 ? 1 : 0,
            transform: phase >= 2 && phase < 4 ? "translateY(0)" : "translateY(6px)",
          }}
        >
          <div className="w-36 sm:w-44 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div
              className="h-full rounded-full transition-all duration-100"
              style={{
                width: `${atsProgress}%`,
                background: "linear-gradient(90deg, #22c55e, #4ade80)",
              }}
            />
          </div>
          <div
            className="flex items-center gap-1 mt-1.5 transition-all duration-500"
            style={{
              opacity: phase >= 3 ? 1 : 0,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[10px] font-medium" style={{ color: "#22c55e" }}>ATS Pass</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Technical Review Animation ─── */
const CODE_LINES = [
  { text: "def twoSum(nums, target):", color: "#c084fc" },
  { text: "    seen = {}", color: "#60a5fa" },
  { text: "    for i, n in enumerate(nums):", color: "#c084fc" },
  { text: "        if target - n in seen:", color: "#60a5fa" },
  { text: "            return [seen[target-n], i]", color: "#34d399" },
]

function TechnicalReviewAnimation() {
  const [typedLines, setTypedLines] = useState<string[]>([])
  const [currentLine, setCurrentLine] = useState(0)
  const [currentChar, setCurrentChar] = useState(0)
  const [showTag, setShowTag] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (fading) {
      const t = setTimeout(() => {
        setFading(false)
        setTypedLines([])
        setCurrentLine(0)
        setCurrentChar(0)
        setShowTag(false)
      }, 800)
      return () => clearTimeout(t)
    }

    if (currentLine >= CODE_LINES.length) {
      // Done typing — show tag
      const t1 = setTimeout(() => setShowTag(true), 400)
      const t2 = setTimeout(() => setFading(true), 3000)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }

    const line = CODE_LINES[currentLine].text
    if (currentChar < line.length) {
      const t = setTimeout(() => {
        setTypedLines((prev) => {
          const copy = [...prev]
          copy[currentLine] = line.slice(0, currentChar + 1)
          return copy
        })
        setCurrentChar((c) => c + 1)
      }, 40)
      return () => clearTimeout(t)
    } else {
      // Move to next line
      const t = setTimeout(() => {
        setCurrentLine((l) => l + 1)
        setCurrentChar(0)
      }, 200)
      return () => clearTimeout(t)
    }
  }, [currentLine, currentChar, fading])

  const waveHeights = [0.4, 0.7, 0.3, 0.9, 0.5, 0.8, 0.35, 0.95, 0.6, 0.45, 0.75, 0.5, 0.85, 0.4, 0.65, 0.55, 0.9, 0.3]
  const isTyping = currentLine < CODE_LINES.length && !fading

  return (
    <div
      className="w-full h-full flex items-center gap-6 sm:gap-8 p-6"
      style={{ opacity: fading ? 0 : 1, transition: "opacity 0.8s" }}
    >
      {/* Code editor */}
      <div className="flex-1 min-w-0">
        <div className="rounded-lg border border-white/10 overflow-hidden" style={{ background: "rgba(0,0,0,0.3)" }}>
          {/* Window chrome */}
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
          </div>
          {/* Code */}
          <div className="p-3 font-mono text-[11px] sm:text-xs leading-relaxed space-y-1 min-h-[120px]">
            {CODE_LINES.map((line, i) => (
              <div key={i} className="flex">
                <span className="text-zinc-600 w-4 flex-shrink-0 select-none">{i + 1}</span>
                <span style={{ color: line.color, opacity: 0.8 }}>
                  {typedLines[i] || ""}
                  {i === currentLine && currentChar < line.text.length && (
                    <span className="inline-block w-[1px] h-3 ml-px bg-blue-400" style={{ animation: "typeCursorBlink 0.8s ease-in-out infinite" }} />
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Waveform */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-[2px] h-20 sm:h-28">
          {waveHeights.map((h, i) => (
            <div
              key={i}
              className="w-[3px] rounded-full"
              style={{
                height: `${h * 100}%`,
                background: "rgba(58,57,132,0.6)",
                transform: isTyping ? undefined : "scaleY(0.2)",
                animation: isTyping ? `waveBar 1s ease-in-out infinite ${i * 0.06}s` : "none",
                transformOrigin: "center",
                transition: "transform 0.5s",
              }}
            />
          ))}
        </div>
        {/* Tag */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-white/10 transition-all duration-500"
          style={{
            opacity: showTag ? 1 : 0,
            transform: showTag ? "translateY(0)" : "translateY(4px)",
            background: "rgba(34,197,94,0.1)",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 10 10" fill="none">
            <path d="M2 5L4 7L8 3" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[11px] font-medium" style={{ color: "#22c55e" }}>Clear explanation</span>
        </div>
      </div>
    </div>
  )
}

/* ─── Feature Card (Large — top row) ─── */
interface FeatureCardProps {
  heading: string
  body: string
  animation: React.ReactNode
}

function FeatureCard({ heading, body, animation }: FeatureCardProps) {
  return (
    <div className="w-full rounded-2xl overflow-hidden border border-white/[0.06] relative" style={{ background: "#0c0c0e" }}>
      {/* Animation fills the top portion seamlessly — no inner box */}
      <div className="w-full h-[200px] sm:h-[230px] lg:h-[260px] relative overflow-hidden">
        {/* Subtle gradient fade at the bottom so animation blends into text area */}
        <div className="absolute inset-0 z-0">
          {animation}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 z-[1]" style={{ background: 'linear-gradient(to top, #0c0c0e, transparent)' }} />
      </div>
      {/* Text */}
      <div className="px-6 sm:px-7 lg:px-8 pb-6 sm:pb-7 lg:pb-8 pt-1">
        <h3
          className="text-lg sm:text-xl lg:text-[1.4rem] font-semibold text-[#e8f0ff] mb-2 tracking-[-0.03em]"
          style={{
            fontFamily: 'var(--font-sora), Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontWeight: 700,
            lineHeight: 1.3,
          }}
        >
          {heading}
        </h3>
        <p className="text-sm sm:text-[15px] leading-[1.6] text-white/40">
          {body}
        </p>
      </div>
    </div>
  )
}

/* ─── Main Export ─── */
export default function PreparationSection() {
  return (
    <section id="features" className="py-16 lg:py-20 relative z-[1]" style={{ background: "#000000" }}>
      <style>{`
        @keyframes drawPath { 0% { stroke-dashoffset: 200; } 100% { stroke-dashoffset: 0; } }
        @keyframes typeCursorBlink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes waveBar { 0%,100% { transform: scaleY(0.3); } 50% { transform: scaleY(1); } }
      `}</style>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Section Title */}
          <div className="text-center mb-10 lg:mb-12">
            <h2
              className="text-[36px] sm:text-[42px] md:text-[48px] font-bold text-white mb-2 tracking-[-0.03em]"
              style={{ fontFamily: 'var(--font-sora), Inter, -apple-system, sans-serif' }}
            >
              Preparation Beyond Code
            </h2>
            <p className="text-sm text-white/40">Master the interview.</p>
          </div>

          {/* 2x2 grid — all same size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
            <FeatureCard
              heading="Master the Human Side"
              body="Go beyond algorithms. Learn behavioral interviews, present yourself clearly, and handle difficult conversations."
              animation={<BehavioralAnimation />}
            />
            <FeatureCard
              heading="Think Like an Architect"
              body="Develop system design skills with practice questions. Learn to diagram designs and present your thinking."
              animation={<SystemDesignAnimation />}
            />
            <FeatureCard
              heading="Resume, Optimized by AI"
              body="Upload your resume and get instant, actionable advice to increase your callback chances."
              animation={<ResumeReviewAnimation />}
            />
            <FeatureCard
              heading="Code with Confidence"
              body="Get real-time analysis of your code and ability to explain it clearly to interviewers."
              animation={<TechnicalReviewAnimation />}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
