'use client'

import { useEffect, useRef } from 'react'

interface AuroraProps {
  color1?: string
  color2?: string
  color3?: string
  blend?: number
  speed?: number
  className?: string
}

/**
 * Aurora animated background - CSS-based aurora effect
 * Inspired by reactbits.dev/backgrounds/aurora
 */
export default function Aurora({
  color1 = '000000',
  color2 = '0044ff',
  color3 = '0d4baf',
  blend = 1,
  speed = 1.2,
  className = '',
}: AuroraProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Convert hex to rgb for CSS
  const hexToRgb = (hex: string) => {
    const h = hex.replace('#', '')
    const r = parseInt(h.substring(0, 2), 16)
    const g = parseInt(h.substring(2, 4), 16)
    const b = parseInt(h.substring(4, 6), 16)
    return `${r}, ${g}, ${b}`
  }

  const c1 = hexToRgb(color1)
  const c2 = hexToRgb(color2)
  const c3 = hexToRgb(color3)

  const animationDuration = 20 / speed

  return (
    <div
      ref={containerRef}
      className={`aurora-container ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: `rgb(${c1})`,
        zIndex: 0,
      }}
    >
      <style jsx>{`
        @keyframes aurora-shift {
          0%, 100% {
            transform: translate(0%, 0%) rotate(0deg) scale(1);
          }
          25% {
            transform: translate(5%, -5%) rotate(3deg) scale(1.05);
          }
          50% {
            transform: translate(-3%, 3%) rotate(-2deg) scale(0.98);
          }
          75% {
            transform: translate(-5%, -3%) rotate(4deg) scale(1.03);
          }
        }

        @keyframes aurora-shift-2 {
          0%, 100% {
            transform: translate(0%, 0%) rotate(0deg) scale(1);
          }
          25% {
            transform: translate(-7%, 5%) rotate(-4deg) scale(1.08);
          }
          50% {
            transform: translate(5%, -5%) rotate(3deg) scale(0.95);
          }
          75% {
            transform: translate(3%, 7%) rotate(-3deg) scale(1.02);
          }
        }

        @keyframes aurora-shift-3 {
          0%, 100% {
            transform: translate(0%, 0%) rotate(0deg) scale(1);
          }
          25% {
            transform: translate(8%, 3%) rotate(5deg) scale(0.97);
          }
          50% {
            transform: translate(-6%, -4%) rotate(-4deg) scale(1.06);
          }
          75% {
            transform: translate(-4%, 6%) rotate(2deg) scale(1);
          }
        }

        .aurora-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          mix-blend-mode: screen;
          opacity: ${blend};
        }

        .aurora-blob-1 {
          width: 80%;
          height: 80%;
          top: -20%;
          right: -20%;
          background: radial-gradient(circle at center, rgba(${c2}, 0.6) 0%, rgba(${c2}, 0) 70%);
          animation: aurora-shift ${animationDuration}s ease-in-out infinite;
        }

        .aurora-blob-2 {
          width: 70%;
          height: 70%;
          bottom: -10%;
          left: -10%;
          background: radial-gradient(circle at center, rgba(${c3}, 0.5) 0%, rgba(${c3}, 0) 70%);
          animation: aurora-shift-2 ${animationDuration * 1.3}s ease-in-out infinite;
        }

        .aurora-blob-3 {
          width: 60%;
          height: 60%;
          top: 30%;
          left: 30%;
          background: radial-gradient(circle at center, rgba(${c2}, 0.4) 0%, rgba(${c2}, 0) 70%);
          animation: aurora-shift-3 ${animationDuration * 0.9}s ease-in-out infinite;
        }

        .aurora-blob-4 {
          width: 50%;
          height: 50%;
          top: 10%;
          left: 50%;
          background: radial-gradient(circle at center, rgba(${c3}, 0.35) 0%, rgba(${c3}, 0) 70%);
          animation: aurora-shift ${animationDuration * 1.5}s ease-in-out infinite reverse;
        }

        .aurora-noise {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.03;
          mix-blend-mode: overlay;
          pointer-events: none;
        }
      `}</style>

      <div className="aurora-blob aurora-blob-1" />
      <div className="aurora-blob aurora-blob-2" />
      <div className="aurora-blob aurora-blob-3" />
      <div className="aurora-blob aurora-blob-4" />
      <div className="aurora-noise" />
    </div>
  )
}
