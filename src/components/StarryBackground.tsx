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
      // Solid navy background - no gradients
      ctx.fillStyle = "#0a0e1a"
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
