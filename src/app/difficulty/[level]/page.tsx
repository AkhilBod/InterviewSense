import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllArticles } from '@/lib/articles'
import { CURRENT_YEAR, BASE_URL } from '@/lib/seo-utils'

export const dynamic = 'force-static'

const HARD_COMPANIES   = new Set(['google', 'meta', 'apple', 'netflix', 'jane street', 'citadel', 'two sigma', 'de shaw', 'jump trading'])
const MEDIUM_H_COMPANIES = new Set(['amazon', 'microsoft', 'salesforce', 'uber', 'airbnb', 'stripe', 'palantir', 'databricks', 'openai', 'anthropic', 'nvidia'])

type Level = 'hard' | 'medium' | 'easy'

const LEVELS: Level[] = ['hard', 'medium', 'easy']

const META: Record<Level, { title: string; description: string; headline: string; sub: string }> = {
  hard: {
    title:       `Hardest CS Internship Interviews (${CURRENT_YEAR}) — Ranked | InterviewSense`,
    description: `The most competitive CS internship interviews in ${CURRENT_YEAR}. Ranked by difficulty. Prep with AI mock interviews on InterviewSense.`,
    headline:    'Hardest Internship Interviews',
    sub:         `FAANG and elite quant firms — the most rigorous technical screens in ${CURRENT_YEAR}.`,
  },
  medium: {
    title:       `Medium-Difficulty CS Internship Interviews (${CURRENT_YEAR}) | InterviewSense`,
    description: `Mid-tier tech company internship interviews ranked by difficulty. Practice with AI mock interviews for free.`,
    headline:    'Medium-Difficulty Interviews',
    sub:         `Big Tech and high-growth startups — competitive but approachable with the right prep.`,
  },
  easy: {
    title:       `Entry-Level CS Internship Interviews (${CURRENT_YEAR}) | InterviewSense`,
    description: `Entry-level and beginner-friendly tech internship interviews. Great for first-time applicants. AI mock interviews free.`,
    headline:    'Entry-Level Internship Interviews',
    sub:         `Startups and smaller tech companies — good starting points for first-time internship seekers.`,
  },
}

interface PageProps {
  params: Promise<{ level: string }>
}

export async function generateStaticParams() {
  return LEVELS.map(l => ({ level: l }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { level } = await params
  if (!LEVELS.includes(level as Level)) return { title: 'Not Found' }
  const m = META[level as Level]
  const canonical = `${BASE_URL}/difficulty/${level}`
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical },
    openGraph: { title: m.title, description: m.description, url: canonical, type: 'website', siteName: 'InterviewSense' },
  }
}

export default async function DifficultyPage({ params }: PageProps) {
  const { level } = await params
  if (!LEVELS.includes(level as Level)) notFound()

  const lvl      = level as Level
  const m        = META[lvl]
  const all      = getAllArticles()

  const filtered = all.filter(a => {
    const lower = a.company.toLowerCase()
    if (lvl === 'hard')   return HARD_COMPANIES.has(lower)
    if (lvl === 'medium') return MEDIUM_H_COMPANIES.has(lower) && !HARD_COMPANIES.has(lower)
    return !HARD_COMPANIES.has(lower) && !MEDIUM_H_COMPANIES.has(lower)
  }).slice(0, 200)

  const difficultyLabel = lvl === 'hard' ? '4–5 / 5' : lvl === 'medium' ? '3 / 5' : '1–2 / 5'
  const badgeColor      = lvl === 'hard' ? 'rgba(239,68,68,0.15)' : lvl === 'medium' ? 'rgba(234,179,8,0.1)' : 'rgba(34,197,94,0.1)'
  const badgeBorder     = lvl === 'hard' ? 'rgba(239,68,68,0.3)'  : lvl === 'medium' ? 'rgba(234,179,8,0.3)'  : 'rgba(34,197,94,0.3)'
  const badgeText       = lvl === 'hard' ? '#f87171'              : lvl === 'medium' ? '#fbbf24'              : '#4ade80'

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

      <div style={{ background: '#0c0c10', minHeight: '100vh' }}>

        {/* ── Hero ── */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '500px', height: '350px', background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div className="max-w-4xl mx-auto px-6 py-20 text-center" style={{ position: 'relative', zIndex: 1 }}>
            <div className="inline-flex items-center gap-2 mb-6" style={{ background: badgeColor, border: `1px solid ${badgeBorder}`, borderRadius: '9999px', padding: '5px 14px' }}>
              <span style={{ color: badgeText, fontSize: '13px', fontFamily: "'DM Sans', sans-serif" }}>
                Difficulty: {difficultyLabel}
              </span>
            </div>

            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '16px' }}>
              {m.headline}
            </h1>

            <p style={{ color: '#71717a', fontSize: '17px', maxWidth: '540px', margin: '0 auto 28px', lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
              {m.sub}
            </p>

            {/* Level nav */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '28px' }}>
              {LEVELS.map(l => (
                <Link key={l} href={`/difficulty/${l}`} style={{ display: 'inline-block', background: l === lvl ? '#3b82f6' : 'rgba(255,255,255,0.04)', border: `1px solid ${l === lvl ? '#3b82f6' : 'rgba(255,255,255,0.1)'}`, color: l === lvl ? '#fff' : '#71717a', borderRadius: '8px', padding: '7px 16px', fontSize: '13px', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", textTransform: 'capitalize' }}>
                  {l}
                </Link>
              ))}
            </div>

            <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#3b82f6', color: 'white', fontWeight: 500, borderRadius: '8px', padding: '12px 24px', fontSize: '15px', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif" }}>
              Start practicing free →
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">

          {filtered.length === 0 ? (
            <p style={{ color: '#52525b', textAlign: 'center', fontFamily: "'DM Sans', sans-serif" }}>
              No roles in this difficulty tier yet — check back soon.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filtered.map((a, idx) => (
                <Link
                  key={a.slug}
                  href={`/opportunities/${a.slug}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(24,24,27,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(63,63,70,0.5)', borderRadius: '12px', padding: '14px 18px', textDecoration: 'none' }}
                >
                  <span style={{ color: '#3f3f46', fontSize: '12px', fontFamily: "'DM Sans', sans-serif", width: '24px', flexShrink: 0 }}>#{idx + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#fff', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.company}</p>
                    <p style={{ color: '#52525b', fontSize: '12px', fontFamily: "'DM Sans', sans-serif", margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.role}</p>
                  </div>
                  <span style={{ background: badgeColor, border: `1px solid ${badgeBorder}`, color: badgeText, borderRadius: '9999px', padding: '2px 8px', fontSize: '11px', fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>
                    {difficultyLabel}
                  </span>
                  <span style={{ color: '#3b82f6', fontSize: '12px', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, flexShrink: 0 }}>Prep →</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
