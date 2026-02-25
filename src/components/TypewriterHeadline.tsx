'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TypewriterHeadlineProps {
  phrases?: string[]
  typingSpeed?: number
  highlightDuration?: number
  holdDuration?: number
  fadeDuration?: number
  /** Set to true only after the loading screen has fully disappeared */
  started?: boolean
}

const SORA: React.CSSProperties = {
  fontFamily: 'var(--font-sora), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontWeight: 800,
  fontStyle: 'normal',
}
const PLAYFAIR: React.CSSProperties = {
  fontFamily: 'var(--font-playfair), Georgia, serif',
  fontWeight: 400,
  fontStyle: 'italic',
}

export default function TypewriterHeadline({
  phrases = ['behavioral interviews', 'technical interviews', 'resume review'],
  typingSpeed = 42,
  highlightDuration = 900,
  holdDuration = 2400,
  started = true,
}: TypewriterHeadlineProps) {
  // phases: idle → typing → highlight → transform → rotate
  const [phase, setPhase] = useState<'idle' | 'typing' | 'highlight' | 'transform' | 'rotate'>('idle')
  const [typed, setTyped] = useState('')
  const [phraseIdx, setPhraseIdx] = useState(0)

  const staticPart = 'AI tool for '
  const fullFirstPhrase = staticPart + phrases[0]

  // ── start once hero is ready ──────────────────────────────────────────────
  useEffect(() => {
    if (started && phase === 'idle') setPhase('typing')
  }, [started, phase])

  // ── typewriter ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'typing') return
    if (typed.length < fullFirstPhrase.length) {
      const t = setTimeout(() => setTyped(fullFirstPhrase.slice(0, typed.length + 1)), typingSpeed)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setPhase('highlight'), 250)
    return () => clearTimeout(t)
  }, [phase, typed, fullFirstPhrase, typingSpeed])

  // ── highlight hold ────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'highlight') return
    const t = setTimeout(() => setPhase('transform'), highlightDuration)
    return () => clearTimeout(t)
  }, [phase, highlightDuration])

  // ── transform → rotate ───────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'transform') return
    const t = setTimeout(() => setPhase('rotate'), 600)
    return () => clearTimeout(t)
  }, [phase])

  // ── rotation loop ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'rotate') return
    const t = setInterval(() => setPhraseIdx(i => (i + 1) % phrases.length), holdDuration)
    return () => clearInterval(t)
  }, [phase, holdDuration, phrases.length])

  // ── derived ───────────────────────────────────────────────────────────────
  const typedStatic = typed.slice(0, Math.min(typed.length, staticPart.length))
  const typedPhrase = typed.length > staticPart.length ? typed.slice(staticPart.length) : ''
  const isHighlighted = phase === 'highlight'
  const isCursive = phase === 'transform' || phase === 'rotate'

  // Line 2 height stays rock-solid — never let font/length affect layout
  const LINE2_HEIGHT = '1.3em'

  return (
    <h1
      style={{
        ...SORA,
        letterSpacing: '-0.02em',
        lineHeight: 1.25,
        color: '#e8f0ff',
      }}
      className="text-3xl sm:text-4xl md:text-[2.6rem] lg:text-[3.1rem]"
    >
      {/* ── Line 1: always "AI tool for" ── */}
      <span style={{ display: 'block', color: '#e8f0ff' }}>
        {phase === 'idle' ? (
          <span style={{ opacity: 0 }}>AI tool for</span>
        ) : (
          // During typing phase, type out just the static part
          phase === 'typing'
            ? typedStatic || <span style={{ opacity: 0 }}>AI tool for</span>
            : 'AI tool for'
        )}
      </span>

      {/* ── Line 2: always the rotating phrase — fixed height so it never jumps ── */}
      <span
        style={{
          display: 'block',
          height: LINE2_HEIGHT,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* TYPING: phrase chars appear after static part is done */}
        {(phase === 'typing' || phase === 'highlight') && (
          <span
            style={{
              display: 'block',
              ...SORA,
              color: 'white',
            }}
          >
            <span
              style={{
                borderRadius: '4px',
                padding: isHighlighted ? '1px 6px' : '0',
                margin: isHighlighted ? '0 -6px' : '0',
                background: isHighlighted ? 'rgba(59,130,246,0.25)' : 'transparent',
                transition: 'background 0.35s ease, padding 0.35s ease',
              }}
            >
              {typedPhrase}
            </span>
            {phase === 'typing' && (
              <span
                style={{
                  display: 'inline-block',
                  width: '2.5px',
                  height: '0.85em',
                  background: '#60a5fa',
                  marginLeft: '3px',
                  verticalAlign: 'middle',
                  borderRadius: '1px',
                  animation: 'tw-blink 1s step-end infinite',
                }}
              />
            )}
          </span>
        )}

        {/* TRANSFORM + ROTATE: AnimatePresence swap, always block on line 2 */}
        {(phase === 'transform' || phase === 'rotate') && (
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={phraseIdx}
              style={{
                display: 'block',
                ...(isCursive ? PLAYFAIR : SORA),
                color: '#60a5fa',
              }}
              initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0,  filter: 'blur(0px)' }}
              exit={{    opacity: 0, y: -18, filter: 'blur(8px)' }}
              transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
            >
              {phrases[phraseIdx]}
            </motion.span>
          </AnimatePresence>
        )}
      </span>

      <style jsx>{`
        @keyframes tw-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>
    </h1>
  )
}
