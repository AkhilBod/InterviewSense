'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TypewriterHeadlineProps {
  phrases?: string[]
  typingSpeed?: number
  highlightDuration?: number
  holdDuration?: number
  /** Set to true only after the loading screen has fully disappeared */
  started?: boolean
}

// Font used WHILE typing — Noto Serif Devanagari
const NOTO: React.CSSProperties = {
  fontFamily: 'var(--font-noto-serif), "Noto Serif Devanagari", Georgia, serif',
  fontWeight: 600,
  fontStyle: 'normal',
}

// Font used AFTER highlight (rotating phrases) — Playfair italic
const PLAYFAIR: React.CSSProperties = {
  fontFamily: 'var(--font-playfair), Georgia, serif',
  fontWeight: 400,
  fontStyle: 'italic',
}

export default function TypewriterHeadline({
  phrases = ['behavioral interviews', 'technical interviews', 'resume screen', 'system design'],
  typingSpeed = 42,
  highlightDuration = 320,
  holdDuration = 2400,
  started = true,
}: TypewriterHeadlineProps) {
  // phases: idle → typing → highlight → rotate
  const [phase, setPhase] = useState<'idle' | 'typing' | 'highlight' | 'rotate'>('idle')
  const [typed, setTyped] = useState('')
  const [phraseIdx, setPhraseIdx] = useState(0)

  const staticPart = 'Never fail another '
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

  // ── highlight hold → immediately rotate ──────────────────────────────────
  // Font switches to PLAYFAIR the instant highlight fires (no transform delay)
  useEffect(() => {
    if (phase !== 'highlight') return
    const t = setTimeout(() => setPhase('rotate'), highlightDuration)
    return () => clearTimeout(t)
  }, [phase, highlightDuration])

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
  // As soon as highlight fires, switch font to PLAYFAIR instantly
  const phraseFont = (phase === 'highlight' || phase === 'rotate') ? PLAYFAIR : NOTO

  const LINE2_HEIGHT = '1.3em'

  return (
    <h1
      style={{
        ...NOTO,
        letterSpacing: '-0.02em',
        lineHeight: 1.25,
        color: '#e8f0ff',
      }}
      className="text-3xl sm:text-4xl md:text-[2.6rem] lg:text-[3.1rem]"
    >
      {/* ── Line 1: "Never fail another" ── */}
      <span style={{ display: 'block', color: '#e8f0ff', ...NOTO }}>
        {phase === 'idle' ? (
          <span style={{ opacity: 0 }}>N</span>
        ) : phase === 'typing' ? (
          typedStatic || <span style={{ opacity: 0 }}>Never fail another</span>
        ) : (
          'Never fail another'
        )}
      </span>

      {/* ── Line 2: rotating phrase — fixed height ── */}
      <span
        style={{
          display: 'block',
          height: LINE2_HEIGHT,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* TYPING + HIGHLIGHT: show typed phrase with instant font switch on highlight */}
        {(phase === 'typing' || phase === 'highlight') && (
          <span
            style={{
              display: 'block',
              ...phraseFont,
              color: isHighlighted ? '#93c5fd' : 'white',
              transition: 'color 0.15s ease',
            }}
          >
            <span
              style={{
                borderRadius: '4px',
                padding: isHighlighted ? '1px 6px' : '0',
                margin: isHighlighted ? '0 -6px' : '0',
                background: isHighlighted ? 'rgba(59,130,246,0.2)' : 'transparent',
                transition: 'background 0.15s ease, padding 0.15s ease',
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

        {/* ROTATE: AnimatePresence swap with Playfair italic */}
        {phase === 'rotate' && (
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={phraseIdx}
              style={{
                display: 'block',
                ...PLAYFAIR,
                color: '#60a5fa',
              }}
              initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0,  filter: 'blur(0px)' }}
              exit={{    opacity: 0, y: -18, filter: 'blur(6px)' }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
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
