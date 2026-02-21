"use client"

import { useEffect, useRef } from "react"

/**
 * DeSo-style starfield background — closely matched to deso.com.
 *
 * From deso.com's CSS & visual analysis:
 *   --black: #000818   (deep navy base)
 *   --blue:  #2e9dff
 *   Gradient: #0157ff → #2e9dff → #02b0ff
 *
 * Key observations from the DeSo screenshot:
 *   1. Background is a LARGE, soft blue-navy gradient — brighter blue
 *      sweeps across the entire top half, heaviest at top-right.
 *   2. Stars are sparse, tiny, faint — almost subliminal. They are NOT
 *      the dominant visual; the gradient/glow is.
 *   3. The transition from blue to navy is very smooth and wide.
 *   4. There's a subtle warm amber/gold tint in the lower portion
 *      (from the light bouncing off the 3D model).
 *   5. Overall: deep cinematic space feel, not a busy starfield.
 */

interface Star {
  x: number
  y: number
  z: number
  baseSize: number
  baseOpacity: number
  speed: number
  twinkleOffset: number
  twinkleSpeed: number
  isBlue: boolean
}

export default function StarryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let stars: Star[] = []
    let time = 0

    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = window.innerWidth + "px"
      canvas.style.height = window.innerHeight + "px"
    }

    const createStars = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      // Slightly denser than before for visibility: ~1 per 3000px², max 600
      const count = Math.min(Math.floor((w * h) / 3000), 600)
      stars = []
      for (let i = 0; i < count; i++) {
        const z = Math.random()
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z,
          baseSize: Math.random() * 1.2 + 0.4, // 0.4–1.6px
          baseOpacity: Math.random() * 0.4 + 0.15, // 0.15–0.55
          speed: 0.008 + z * 0.025,
          twinkleOffset: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.3 + Math.random() * 0.8,
          isBlue: Math.random() > 0.75,
        })
      }
    }

    const drawBackground = (w: number, h: number) => {
      // ─── BASE: DeSo navy #000818 ───
      ctx.fillStyle = "#000818"
      ctx.fillRect(0, 0, w, h)

      // ─── PRIMARY: Large diffuse blue sweep across top-right ───
      // This is the dominant visual — a huge soft wash that covers
      // nearly the entire upper 60% of the screen, brightest at top-right
      const g1 = ctx.createRadialGradient(
        w * 0.75, h * 0.0, 0,
        w * 0.75, h * 0.0, Math.max(w, h) * 0.85
      )
      g1.addColorStop(0,    "rgba(14, 80, 180, 0.35)")   // rich blue core
      g1.addColorStop(0.15, "rgba(10, 60, 150, 0.28)")   // slightly darker
      g1.addColorStop(0.35, "rgba(5, 40, 120, 0.18)")    // fading
      g1.addColorStop(0.6,  "rgba(2, 25, 80, 0.08)")     // subtle
      g1.addColorStop(1,    "rgba(0, 8, 24, 0)")          // fade to base
      ctx.fillStyle = g1
      ctx.fillRect(0, 0, w, h)

      // ─── SECONDARY: Brighter blue accent at top-right corner ───
      // Adds that concentrated blue "hot spot" visible in DeSo's top-right
      const g2 = ctx.createRadialGradient(
        w * 0.85, h * -0.05, 0,
        w * 0.85, h * -0.05, w * 0.45
      )
      g2.addColorStop(0,    "rgba(46, 157, 255, 0.22)")  // #2e9dff bright
      g2.addColorStop(0.2,  "rgba(1, 87, 255, 0.15)")    // #0157ff
      g2.addColorStop(0.5,  "rgba(2, 176, 255, 0.06)")   // #02b0ff cyan edge
      g2.addColorStop(1,    "rgba(0, 8, 24, 0)")
      ctx.fillStyle = g2
      ctx.fillRect(0, 0, w, h)

      // ─── TERTIARY: Wide horizontal blue band across upper quarter ───
      // Creates the smooth horizon-like transition visible in DeSo
      const g3 = ctx.createLinearGradient(0, 0, 0, h * 0.7)
      g3.addColorStop(0,    "rgba(8, 50, 130, 0.20)")
      g3.addColorStop(0.25, "rgba(5, 35, 100, 0.12)")
      g3.addColorStop(0.5,  "rgba(2, 20, 60, 0.05)")
      g3.addColorStop(1,    "rgba(0, 8, 24, 0)")
      ctx.fillStyle = g3
      ctx.fillRect(0, 0, w, h)

      // ─── QUATERNARY: Soft left-side blue glow ───
      // Balances the composition — DeSo has subtle blue on both sides
      const g4 = ctx.createRadialGradient(
        w * 0.15, h * 0.15, 0,
        w * 0.15, h * 0.15, w * 0.55
      )
      g4.addColorStop(0,    "rgba(5, 50, 140, 0.12)")
      g4.addColorStop(0.3,  "rgba(3, 30, 90, 0.06)")
      g4.addColorStop(1,    "rgba(0, 8, 24, 0)")
      ctx.fillStyle = g4
      ctx.fillRect(0, 0, w, h)

      // ─── SUBTLE VIGNETTE: Darken edges/bottom ───
      // DeSo's bottom is very dark — the glow fades cleanly to navy
      const vignette = ctx.createRadialGradient(
        w * 0.5, h * 0.35, w * 0.15,
        w * 0.5, h * 0.35, Math.max(w, h) * 0.85
      )
      vignette.addColorStop(0,   "rgba(0, 8, 24, 0)")
      vignette.addColorStop(0.6, "rgba(0, 8, 24, 0)")
      vignette.addColorStop(1,   "rgba(0, 6, 18, 0.3)")
      ctx.fillStyle = vignette
      ctx.fillRect(0, 0, w, h)
    }

    const draw = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      time += 0.016

      // Reset transform for HiDPI
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Draw the deep navy background + gradient glows
      drawBackground(w, h)

      // ── Draw stars (subtle, sparse, DeSo-like) ──
      for (const star of stars) {
        // Very slow upward drift
        star.y -= star.speed * (0.3 + star.z * 0.4)

        // Near-imperceptible horizontal sway
        star.x += Math.sin(time * 0.2 + star.twinkleOffset) * 0.012

        // Wrap around edges
        if (star.y < -5) {
          star.y = h + 5
          star.x = Math.random() * w
        }
        if (star.x < -5) star.x = w + 5
        if (star.x > w + 5) star.x = -5

        // Gentle twinkle
        const twinkle = 0.55 + 0.45 * Math.sin(time * star.twinkleSpeed + star.twinkleOffset)
        const opacity = star.baseOpacity * twinkle

        // Size: depth-dependent
        const size = star.baseSize * (0.4 + star.z * 0.6)

        // Color: mostly soft white, some DeSo blue
        if (star.isBlue) {
          ctx.fillStyle = `rgba(140, 190, 255, ${opacity})` // soft blue-white
        } else {
          ctx.fillStyle = `rgba(200, 210, 225, ${opacity})` // warm white
        }

        ctx.beginPath()
        ctx.arc(star.x, star.y, size, 0, Math.PI * 2)
        ctx.fill()

        // Soft glow halo only on the closest, biggest stars
        if (star.z > 0.75 && star.baseSize > 0.8) {
          const glowSize = size * 4
          const glowOpacity = opacity * 0.06
          const glow = ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, glowSize
          )
          if (star.isBlue) {
            glow.addColorStop(0, `rgba(100, 170, 255, ${glowOpacity})`)
          } else {
            glow.addColorStop(0, `rgba(200, 210, 225, ${glowOpacity})`)
          }
          glow.addColorStop(1, "rgba(0, 8, 24, 0)")
          ctx.fillStyle = glow
          ctx.beginPath()
          ctx.arc(star.x, star.y, glowSize, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      animationId = requestAnimationFrame(draw)
    }

    resize()
    createStars()
    draw()

    const handleResize = () => {
      resize()
      createStars()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
