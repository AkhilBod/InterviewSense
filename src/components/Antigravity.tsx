'use client'

import { useRef, useEffect, useCallback } from 'react'

interface AntigravityProps {
  count?: number
  magnetRadius?: number
  ringRadius?: number
  waveSpeed?: number
  waveAmplitude?: number
  particleSize?: number
  lerpSpeed?: number
  color?: string
  autoAnimate?: boolean
  particleVariance?: number
  rotationSpeed?: number
  depthFactor?: number
  pulseSpeed?: number
  particleShape?: 'capsule' | 'sphere' | 'box' | 'tetrahedron'
  fieldStrength?: number
  className?: string
}

interface Particle {
  t: number
  speed: number
  mx: number
  my: number
  mz: number
  cx: number
  cy: number
  cz: number
  randomRadiusOffset: number
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const bigint = parseInt(h, 16)
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255]
}

export default function Antigravity({
  count = 300,
  magnetRadius = 10,
  ringRadius = 10,
  waveSpeed = 0.4,
  waveAmplitude = 1,
  particleSize = 2,
  lerpSpeed = 0.1,
  color = '#2663eb',
  autoAnimate = false,
  particleVariance = 1,
  rotationSpeed = 0,
  depthFactor = 1,
  pulseSpeed = 3,
  particleShape = 'capsule',
  fieldStrength = 10,
  className = '',
}: AntigravityProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const mouseRef = useRef({ x: 0, y: 0 })  // normalized -1..1
  const lastMouseMoveTime = useRef(0)
  const lastMousePos = useRef({ x: 0, y: 0 })
  const virtualMouse = useRef({ x: 0, y: 0 }) // in canvas px coords
  const startTime = useRef(performance.now())
  const particlesRef = useRef<Particle[]>([])
  const rgbRef = useRef(hexToRgb(color))

  // Re-parse color when it changes
  useEffect(() => {
    rgbRef.current = hexToRgb(color)
  }, [color])

  const initParticles = useCallback((w: number, h: number) => {
    const temp: Particle[] = []
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * w
      const y = (Math.random() - 0.5) * h
      const z = (Math.random() - 0.5) * 20
      temp.push({
        t: Math.random() * 100,
        speed: 0.01 + Math.random() / 200,
        mx: x,
        my: y,
        mz: z,
        cx: x,
        cy: y,
        cz: z,
        randomRadiusOffset: (Math.random() - 0.5) * 2,
      })
    }
    particlesRef.current = temp
  }, [count])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = container.clientWidth
    let h = container.clientHeight

    const resize = () => {
      w = container.clientWidth
      h = container.clientHeight
      canvas.width = w
      canvas.height = h
      // Re-init particles on resize so they fill the new viewport
      initParticles(w, h)
    }

    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(container)

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      // normalized -1..1
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1)

      const dist = Math.sqrt(
        Math.pow(nx - lastMousePos.current.x, 2) + Math.pow(ny - lastMousePos.current.y, 2)
      )
      if (dist > 0.001) {
        lastMouseMoveTime.current = Date.now()
        lastMousePos.current = { x: nx, y: ny }
      }
      mouseRef.current = { x: nx, y: ny }
    }

    window.addEventListener('mousemove', onMouseMove)

    // Draw a capsule shape (rounded rectangle) centered at (0,0) with given half-dims
    const drawShape = (
      ctx: CanvasRenderingContext2D,
      shape: string,
      scale: number,
      r: number,
      g: number,
      b: number,
      alpha: number
    ) => {
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
      const s = scale * particleSize * 0.8

      if (shape === 'sphere' || shape === 'tetrahedron') {
        ctx.beginPath()
        ctx.arc(0, 0, Math.max(0.5, s * 0.5), 0, Math.PI * 2)
        ctx.fill()
      } else if (shape === 'box') {
        const half = Math.max(0.5, s * 0.5)
        ctx.fillRect(-half, -half, half * 2, half * 2)
      } else {
        // capsule: rounded rect
        const rw = Math.max(0.5, s * 0.3)
        const rh = Math.max(1, s * 0.8)
        const radius = rw
        ctx.beginPath()
        ctx.moveTo(-rw + radius, -rh)
        ctx.lineTo(rw - radius, -rh)
        ctx.arcTo(rw, -rh, rw, -rh + radius, radius)
        ctx.lineTo(rw, rh - radius)
        ctx.arcTo(rw, rh, rw - radius, rh, radius)
        ctx.lineTo(-rw + radius, rh)
        ctx.arcTo(-rw, rh, -rw, rh - radius, radius)
        ctx.lineTo(-rw, -rh + radius)
        ctx.arcTo(-rw, -rh, -rw + radius, -rh, radius)
        ctx.closePath()
        ctx.fill()
      }
    }

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate)
      ctx.clearRect(0, 0, w, h)

      const elapsed = (performance.now() - startTime.current) / 1000

      const m = mouseRef.current
      let destX: number
      let destY: number

      if (autoAnimate && Date.now() - lastMouseMoveTime.current > 2000) {
        destX = Math.sin(elapsed * 0.5) * (w / 4)
        destY = Math.cos(elapsed * 0.5 * 2) * (h / 4)
      } else {
        // m is -1..1, map to canvas coords (origin at center)
        destX = (m.x * w) / 2
        destY = (m.y * h) / 2
      }

      const smoothFactor = 0.05
      virtualMouse.current.x += (destX - virtualMouse.current.x) * smoothFactor
      virtualMouse.current.y += (destY - virtualMouse.current.y) * smoothFactor

      const targetX = virtualMouse.current.x
      const targetY = virtualMouse.current.y

      const globalRotation = elapsed * rotationSpeed

      const [r, g, b] = rgbRef.current

      for (const particle of particlesRef.current) {
        particle.t += particle.speed / 2

        const t = particle.t
        const { mz, cz, randomRadiusOffset } = particle

        // project target based on depth
        const projectionFactor = 1 - cz / 50
        const projectedTargetX = targetX * projectionFactor
        const projectedTargetY = targetY * projectionFactor

        const dx = particle.mx - projectedTargetX
        const dy = particle.my - projectedTargetY
        const dist = Math.sqrt(dx * dx + dy * dy)

        let tpx = particle.mx
        let tpy = particle.my
        let tpz = mz * depthFactor

        if (dist < magnetRadius) {
          const angle = Math.atan2(dy, dx) + globalRotation
          const wave = Math.sin(t * waveSpeed + angle) * (0.5 * waveAmplitude)
          const deviation = randomRadiusOffset * (5 / (fieldStrength + 0.1))
          const currentRingRadius = ringRadius + wave + deviation

          tpx = projectedTargetX + currentRingRadius * Math.cos(angle)
          tpy = projectedTargetY + currentRingRadius * Math.sin(angle)
          tpz = mz * depthFactor + Math.sin(t) * (1 * waveAmplitude * depthFactor)
        }

        particle.cx += (tpx - particle.cx) * lerpSpeed
        particle.cy += (tpy - particle.cy) * lerpSpeed
        particle.cz += (tpz - particle.cz) * lerpSpeed

        // Compute scale
        const currentDistToMouse = Math.sqrt(
          Math.pow(particle.cx - projectedTargetX, 2) + Math.pow(particle.cy - projectedTargetY, 2)
        )
        const distFromRing = Math.abs(currentDistToMouse - ringRadius)
        let scaleFactor = 1 - distFromRing / 10
        scaleFactor = Math.max(0, Math.min(1, scaleFactor))

        const finalScale =
          scaleFactor * (0.8 + Math.sin(t * pulseSpeed) * 0.2 * particleVariance) * particleSize

        if (finalScale < 0.05) continue

        // Depth alpha: further particles slightly dimmer
        const depthAlpha = Math.max(0.1, 1 - Math.abs(particle.cz) / 30)

        // Orientation angle (pointing toward target center)
        const angle = Math.atan2(
          projectedTargetY - particle.cy,
          projectedTargetX - particle.cx
        )

        // Draw at canvas coordinates (origin = center)
        ctx.save()
        ctx.translate(w / 2 + particle.cx, h / 2 - particle.cy)
        ctx.rotate(angle + Math.PI / 2)
        drawShape(ctx, particleShape, finalScale, r, g, b, depthAlpha * 0.85)
        ctx.restore()
      }
    }

    animate()

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [
    count,
    magnetRadius,
    ringRadius,
    waveSpeed,
    waveAmplitude,
    particleSize,
    lerpSpeed,
    autoAnimate,
    particleVariance,
    rotationSpeed,
    depthFactor,
    pulseSpeed,
    particleShape,
    fieldStrength,
    initParticles,
  ])

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ pointerEvents: 'none' }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  )
}
