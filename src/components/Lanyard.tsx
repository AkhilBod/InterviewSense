'use client'

import { useEffect, useRef } from 'react'

const GRAVITY     = 0.35
const DAMPING     = 0.98
const ROPE_SEGS   = 14
const ROPE_LEN    = 26
const CARD_W      = 260
const CARD_H      = 380
const CARD_R      = 16

const COMPANIES = [
  { name: 'Netflix',    color: '#E50914' }, // official Netflix red
  { name: 'Stripe',     color: '#625AFA' }, // official Stripe indigo/purple
  { name: 'Databricks', color: '#FF3621' }, // official Databricks orange-red
  { name: 'Ramp',       color: '#16A34A' }, // Ramp dark green
  { name: 'LinkedIn',   color: '#0A66C2' }, // official LinkedIn blue
  { name: 'HRT',        color: '#1A1A2E' }, // HRT navy — dark brand, light text handled below
]

interface Pt { x: number; y: number; ox: number; oy: number; pinned: boolean }

function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawCard(ctx: CanvasRenderingContext2D, cx: number, cy: number, dpr: number) {
  const w  = CARD_W * dpr
  const h  = CARD_H * dpr
  const r  = CARD_R * dpr
  const x  = cx - w / 2
  const y  = cy

  // Shadow
  ctx.save()
  ctx.shadowColor  = 'rgba(0,0,0,0.5)'
  ctx.shadowBlur   = 32 * dpr
  ctx.shadowOffsetY = 8 * dpr

  // Card bg
  drawRoundRect(ctx, x, y, w, h, r)
  ctx.fillStyle = '#0d1b2e'
  ctx.fill()
  ctx.restore()

  // Border
  drawRoundRect(ctx, x, y, w, h, r)
  ctx.strokeStyle = '#1e3a5f'
  ctx.lineWidth   = 1.5 * dpr
  ctx.stroke()

  // Top blue bar
  ctx.fillStyle = '#3b82f6'
  ctx.fillRect(x + 48 * dpr, y + 22 * dpr, w - 96 * dpr, 2 * dpr)

  // Title
  ctx.fillStyle  = '#f1f5f9'
  ctx.font       = `bold ${22 * dpr}px system-ui, sans-serif`
  ctx.textAlign  = 'center'
  ctx.fillText('InterviewSense', cx, y + 58 * dpr)

  // Subtitle
  ctx.fillStyle = '#64748b'
  ctx.font      = `${12 * dpr}px system-ui, sans-serif`
  ctx.fillText('AI Interview Coaching', cx, y + 78 * dpr)

  // Divider
  ctx.fillStyle = 'rgba(59,130,246,0.2)'
  ctx.fillRect(x + 28 * dpr, y + 90 * dpr, w - 56 * dpr, 1 * dpr)

  // "Trusted by" label
  ctx.fillStyle = '#475569'
  ctx.font      = `${10 * dpr}px system-ui, sans-serif`
  ctx.fillText('TRUSTED BY ENGINEERS AT', cx, y + 110 * dpr)

  // Company grid 2×3
  const cols   = 2
  const rows   = 3
  const padX   = 20 * dpr
  const gridY  = y + 122 * dpr
  const cellW  = (w - padX * 2) / cols
  const cellH  = (h - 122 * dpr - 44 * dpr) / rows

  COMPANIES.forEach((co, i) => {
    const col  = i % cols
    const row  = Math.floor(i / cols)
    const bx   = x + padX + col * cellW
    const by   = gridY + row * cellH
    const midX = bx + cellW / 2
    const midY = by + cellH / 2

    // Cell background — filled with brand color
    ctx.fillStyle = co.color
    drawRoundRect(ctx, bx + 4 * dpr, by + 5 * dpr, cellW - 8 * dpr, cellH - 10 * dpr, 6 * dpr)
    ctx.fill()

    // Company name in white
    ctx.fillStyle  = '#ffffff'
    ctx.font       = `bold ${12 * dpr}px system-ui, -apple-system, sans-serif`
    ctx.textAlign  = 'center'
    ctx.fillText(co.name, midX, midY + 4 * dpr)
  })

  // Bottom strip
  ctx.fillStyle = 'rgba(59,130,246,0.06)'
  drawRoundRect(ctx, x, y + h - 36 * dpr, w, 36 * dpr, [0, 0, r, r] as any)
  ctx.fill()
  ctx.fillStyle = 'rgba(59,130,246,0.45)'
  ctx.font      = `${9 * dpr}px system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('interviewsense.org', cx, y + h - 14 * dpr)

  // Metal clip at top
  ctx.fillStyle = '#475569'
  drawRoundRect(ctx, cx - 12 * dpr, y - 6 * dpr, 24 * dpr, 16 * dpr, 4 * dpr)
  ctx.fill()
  ctx.fillStyle = '#94a3b8'
  drawRoundRect(ctx, cx - 6 * dpr, y - 10 * dpr, 12 * dpr, 12 * dpr, 3 * dpr)
  ctx.fill()
}

export default function Lanyard() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let pts: Pt[] = []
    let raf: number
    let dragIdx: number | null = null
    let mouseX = 0, mouseY = 0

    const resize = () => {
      const rect  = cv.getBoundingClientRect()
      cv.width    = rect.width  * dpr
      cv.height   = rect.height * dpr
      const ax    = cv.width / 2
      if (!pts.length) {
        pts = Array.from({ length: ROPE_SEGS + 1 }, (_, i) => {
          const t = i / ROPE_SEGS
          const y = t * ROPE_LEN * ROPE_SEGS * 0.3
          return { x: ax, y, ox: ax, oy: y, pinned: i === 0 }
        })
        // initial swing
        setTimeout(() => { if (pts.length) pts[pts.length - 1].ox -= 40 * dpr }, 80)
      } else {
        pts[0].x = ax
        pts[0].y = 0
      }
    }

    resize()
    window.addEventListener('resize', resize)

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect    = cv.getBoundingClientRect()
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      return { x: (clientX - rect.left) * dpr, y: (clientY - rect.top) * dpr }
    }

    const onDown = (e: MouseEvent | TouchEvent) => {
      const { x, y } = getPos(e)
      mouseX = x; mouseY = y
      for (let i = pts.length - 1; i >= 1; i--) {
        const dx = pts[i].x - x, dy = pts[i].y - y
        if (Math.sqrt(dx * dx + dy * dy) < 140 * dpr) { dragIdx = i; break }
      }
    }
    const onMove = (e: MouseEvent | TouchEvent) => {
      const { x, y } = getPos(e); mouseX = x; mouseY = y
    }
    const onUp = () => { dragIdx = null }

    cv.addEventListener('mousedown', onDown)
    cv.addEventListener('mousemove', onMove)
    cv.addEventListener('mouseup',   onUp)
    cv.addEventListener('mouseleave',onUp)
    cv.addEventListener('touchstart', onDown, { passive: true })
    cv.addEventListener('touchmove',  onMove, { passive: true })
    cv.addEventListener('touchend',   onUp)

    const ctx = cv.getContext('2d')!

    const draw = () => {
      // Simulate
      for (const p of pts) {
        if (p.pinned) continue
        const vx = (p.x - p.ox) * DAMPING
        const vy = (p.y - p.oy) * DAMPING
        p.ox = p.x; p.oy = p.y
        p.x += vx; p.y += vy + GRAVITY
      }
      if (dragIdx !== null && pts[dragIdx] && !pts[dragIdx].pinned) {
        pts[dragIdx].x = mouseX; pts[dragIdx].y = mouseY
      }
      for (let iter = 0; iter < 8; iter++) {
        for (let i = 0; i < pts.length - 1; i++) {
          const a = pts[i], b = pts[i + 1]
          const dx = b.x - a.x, dy = b.y - a.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const diff = (ROPE_LEN - dist) / dist / 2
          if (!a.pinned) { a.x -= dx * diff; a.y -= dy * diff }
          if (!b.pinned) { b.x += dx * diff; b.y += dy * diff }
        }
      }

      ctx.clearRect(0, 0, cv.width, cv.height)
      if (pts.length < 2) { raf = requestAnimationFrame(draw); return }

      // Band
      const drawBand = (lw: number, style: string | CanvasGradient) => {
        ctx.beginPath()
        ctx.moveTo(pts[0].x, pts[0].y)
        for (let i = 1; i < pts.length; i++) {
          const p = pts[i - 1], c = pts[i]
          ctx.quadraticCurveTo(p.x, p.y, (p.x + c.x) / 2, (p.y + c.y) / 2)
        }
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y)
        ctx.strokeStyle = style
        ctx.lineWidth   = lw
        ctx.lineCap     = 'round'
        ctx.lineJoin    = 'round'
        ctx.stroke()
      }

      const g = ctx.createLinearGradient(pts[0].x, pts[0].y, pts[pts.length - 1].x, pts[pts.length - 1].y)
      g.addColorStop(0,   '#1d4ed8')
      g.addColorStop(0.5, '#3b82f6')
      g.addColorStop(1,   '#1d4ed8')
      drawBand(10 * dpr, g)
      drawBand(3  * dpr, 'rgba(147,197,253,0.25)')

      // Anchor dot
      ctx.beginPath(); ctx.arc(pts[0].x, pts[0].y, 7 * dpr, 0, Math.PI * 2)
      ctx.fillStyle = '#334155'; ctx.fill()
      ctx.beginPath(); ctx.arc(pts[0].x, pts[0].y, 3.5 * dpr, 0, Math.PI * 2)
      ctx.fillStyle = '#94a3b8'; ctx.fill()

      // Card — fixed upright, no rotation
      const last = pts[pts.length - 1]
      drawCard(ctx, last.x, last.y, dpr)

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      cv.removeEventListener('mousedown', onDown)
      cv.removeEventListener('mousemove', onMove)
      cv.removeEventListener('mouseup',   onUp)
      cv.removeEventListener('mouseleave',onUp)
      cv.removeEventListener('touchstart', onDown)
      cv.removeEventListener('touchmove',  onMove)
      cv.removeEventListener('touchend',   onUp)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}