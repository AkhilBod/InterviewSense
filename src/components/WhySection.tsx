"use client"

import { useEffect, useRef, useState } from "react"

/* ─── Card 1: Topic Pills ─── */
function TopicsPillsGraphic() {
  const pills = [
    { label: "Voice Analysis", bg: "rgba(59,130,246,0.12)", color: "#60a5fa" },
    { label: "Behavioral", bg: "rgba(6,182,212,0.12)", color: "#22d3ee" },
    { label: "System Design", bg: "rgba(16,185,129,0.12)", color: "#34d399" },
    { label: "Coding Problems", bg: "rgba(251,191,36,0.12)", color: "#fbbf24" },
    { label: "Resume Review", bg: "rgba(244,63,94,0.12)", color: "#fb7185" },
    { label: "Salary Negotiation", bg: "rgba(139,92,246,0.12)", color: "#a78bfa" },
  ]

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <span className="absolute top-3 right-3 text-white/15 text-sm">↗</span>
      <div className="flex flex-col items-start gap-2 px-6 py-4">
        {pills.map((p, i) => (
          <span
            key={i}
            className="px-4 py-1.5 rounded-md text-[12.5px] font-medium opacity-0"
            style={{
              background: p.bg,
              color: p.color,
              animation: `pillIn 0.4s ease forwards ${0.15 + i * 0.15}s`,
            }}
          >
            {p.label}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ─── Card 2: Progress Bars Chart ─── */
function ProgressChartGraphic() {
  const heights = [25, 35, 30, 45, 40, 55, 50, 60, 55, 65, 58, 70, 62, 75, 68, 80, 72, 85, 78, 88]

  return (
    <div className="w-full h-full flex flex-col justify-center px-5 py-4">
      <div className="relative pl-8">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[9px] text-white/20">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>
        {/* Average line */}
        <div
          className="absolute left-8 right-0 border-t border-dashed border-white/10"
          style={{ top: "40%" }}
        />
        {/* Bars */}
        <div className="flex items-end gap-[3px] h-[120px] border-b border-white/[0.06]">
          {heights.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm opacity-0"
              style={{
                height: `${h}%`,
                background: "rgba(59,130,246,0.5)",
                transformOrigin: "bottom",
                animation: `barGrow 0.6s ease forwards ${0.3 + i * 0.04}s`,
              }}
            />
          ))}
        </div>
      </div>
      {/* X-axis labels */}
      <div className="flex justify-between text-[9px] text-white/20 mt-1.5 pl-8">
        <span>Week 1</span>
        <span>Week 2</span>
        <span>Week 3</span>
        <span>Week 4</span>
      </div>
    </div>
  )
}

/* ─── Card 3: Gmail Offer Notification ─── */
function GmailOfferGraphic() {
  return (
    <div className="w-full h-full flex items-center justify-center px-5 py-4">
      <div
        className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-white/[0.08] w-full opacity-0"
        style={{
          background: "rgba(255,255,255,0.05)",
          transform: "translateY(10px) scale(0.97)",
          animation: "gmailIn 0.5s cubic-bezier(0.34,1.4,0.64,1) 0.6s forwards",
        }}
      >
        {/* Gmail icon */}
        <svg className="w-8 h-8 flex-shrink-0" viewBox="0 -31.5 256 256" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
          <path d="M58.182 192.05V93.14L27.507 65.077 0 49.504V174.595C0 184.253 7.825 192.05 17.455 192.05H58.182z" fill="#4285F4"/>
          <path d="M197.818 192.05H238.545C248.204 192.05 256 184.224 256 174.595V49.504L224.844 67.342 197.818 93.14V192.05z" fill="#34A853"/>
          <polygon fill="#EA4335" points="58.182 93.14 54.008 54.493 58.182 17.504 128 69.868 197.818 17.504 202.487 52.496 197.818 93.14 128 145.504"/>
          <path d="M197.818 17.504V93.14L256 49.504V26.231C256 4.646 231.36-7.66 214.109 5.286L197.818 17.504z" fill="#FBBC04"/>
          <path d="M0 49.504L26.759 69.573 58.182 93.14V17.504L41.891 5.286C24.611-7.66 0 4.646 0 26.231V49.504z" fill="#C5221F"/>
        </svg>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-slate-200">Offer Letter Inside</div>
          <div className="text-[11px] text-white/35 mt-0.5 truncate">We&apos;re excited to extend an offer to...</div>
        </div>
        <span className="text-[10px] text-white/20 flex-shrink-0 self-start mt-0.5">now</span>
      </div>
    </div>
  )
}

/* ─── Why Card ─── */
interface WhyCardProps {
  title: string
  description: string
  graphic: React.ReactNode
}

function WhyCard({ title, description, graphic }: WhyCardProps) {
  return (
    <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: "#0c0c0e" }}>
      <div className="h-[195px] border-b border-white/[0.05] relative overflow-hidden" style={{ background: "#131316" }}>
        {graphic}
      </div>
      <div className="px-5 py-5">
        <h3
          className="text-[15px] font-semibold text-slate-100 mb-1.5 tracking-[-0.01em]"
          style={{ fontFamily: 'var(--font-sora), Inter, -apple-system, sans-serif' }}
        >
          {title}
        </h3>
        <p className="text-[13px] leading-[1.55] text-white/40">
          {description}
        </p>
      </div>
    </div>
  )
}

/* ─── Main Export ─── */
export default function WhySection() {
  return (
    <section className="py-16 lg:py-20 relative z-[1]" style={{ background: "#000000" }}>
      <style>{`
        @keyframes pillIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes barGrow {
          from { opacity: 0; transform: scaleY(0); }
          to { opacity: 1; transform: scaleY(1); }
        }
        @keyframes gmailIn {
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="text-center mb-12 lg:mb-14">
            <h2
              className="text-[36px] sm:text-[42px] md:text-[48px] font-bold text-white mb-3 tracking-[-0.03em]"
              style={{ fontFamily: 'var(--font-sora), Inter, -apple-system, sans-serif' }}
            >
              Why InterviewSense?
            </h2>
            <p className="text-base text-white/40">
              Prep your code, your voice, and your story. <span className="text-white/70 font-medium">All in one place.</span>
            </p>
          </div>

          {/* 3-column grid with generous spacing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <WhyCard
              title="Full interview coverage"
              description="Practice every round companies throw at you, not just the coding one."
              graphic={<TopicsPillsGraphic />}
            />
            <WhyCard
              title="Track your progress"
              description="See exactly where you stand with scores and benchmarks across every skill."
              graphic={<ProgressChartGraphic />}
            />
            <WhyCard
              title="Proven results, real offers"
              description="Join thousands who turned practice into offers at top companies."
              graphic={<GmailOfferGraphic />}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
