"use client"

import React, { useEffect, useRef, useState } from 'react'

type Props = {
  end: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
}

export default function CountUpOnView({ end, duration = 1500, decimals = 0, prefix = '', suffix = '', className = '' }: Props) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const [value, setValue] = useState(0)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true
          // start animation
          startRef.current = null
          const animate = (ts: number) => {
            if (startRef.current == null) startRef.current = ts
            const progress = Math.min(1, (ts - (startRef.current as number)) / duration)
            const current = end * progress
            setValue(current)
            if (progress < 1) {
              rafRef.current = requestAnimationFrame(animate)
            } else {
              // ensure final value
              setValue(end)
            }
          }
          rafRef.current = requestAnimationFrame(animate)
        }
      })
    }, { threshold: 0.2 })

    obs.observe(el)

    return () => {
      obs.disconnect()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [end, duration])

  const formatted = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString()

  return (
    <span ref={ref} className={className} aria-hidden={false}>
      {prefix}{formatted}{suffix}
    </span>
  )
}
