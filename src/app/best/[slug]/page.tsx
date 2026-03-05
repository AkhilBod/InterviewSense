import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getArticlesByCategory } from '@/lib/articles'
import { generateSchema, BEST_PAGES, bestSlugToCategory, CURRENT_YEAR, BASE_URL } from '@/lib/seo-utils'

export const dynamic = 'force-static'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return BEST_PAGES.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug }    = await params
  const mapping     = bestSlugToCategory(slug)
  if (!mapping) return { title: 'Not Found' }

  const articles    = getArticlesByCategory(mapping.category)
  const title       = `Best ${mapping.label} Internships for CS Students (${CURRENT_YEAR}) | InterviewSense`
  const description = `The best ${mapping.label} internships in ${CURRENT_YEAR} ranked by interview difficulty and prestige. Prep for each with AI mock interviews on InterviewSense. ${articles.length} open roles.`
  const canonical   = `${BASE_URL}/best/${slug}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'website', siteName: 'InterviewSense' },
  }
}

export default async function BestPage({ params }: PageProps) {
  const { slug } = await params
  const mapping  = bestSlugToCategory(slug)
  if (!mapping) notFound()

  const articles = getArticlesByCategory(mapping.category)
  if (!articles.length) notFound()

  // Top 10: one role per company (most recent first), deduped by company
  const seenCompanies = new Set<string>()
  const top10 = articles.filter(a => {
    if (seenCompanies.has(a.companySlug)) return false
    seenCompanies.add(a.companySlug)
    return true
  }).slice(0, 10)
  const schemas = generateSchema('best', { label: mapping.label, year: CURRENT_YEAR, count: articles.length })

  return (
    <>
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}

      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

      <div style={{ background: '#0c0c10', minHeight: '100vh' }}>

        {/* ── Hero ── */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '500px', height: '350px', background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div className="max-w-4xl mx-auto px-6 py-20 text-center" style={{ position: 'relative', zIndex: 1 }}>
            <div className="inline-flex items-center gap-2 mb-6" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: '9999px', padding: '5px 14px' }}>
              <span style={{ color: '#93C5FD', fontSize: '13px', fontFamily: "'DM Sans', sans-serif" }}>
                {articles.length} open roles · {CURRENT_YEAR}
              </span>
            </div>

            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '16px' }}>
              Best {mapping.label} Internships ({CURRENT_YEAR})
            </h1>

            <p style={{ color: '#71717a', fontSize: '17px', maxWidth: '540px', margin: '0 auto 28px', lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
              {articles.length} {mapping.label} internship roles available right now, ranked by recency and company prestige.
              Practice for any role with free AI mock interviews tailored to each company.
            </p>

            <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#3b82f6', color: 'white', fontWeight: 500, borderRadius: '8px', padding: '12px 24px', fontSize: '15px', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif" }}>
              Start practicing free →
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">

          {/* ── Top 10 ranked list ── */}
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
            Top {mapping.label} Internships
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '40px' }}>
            {top10.map((a, idx) => (
              <div key={a.slug} style={{ background: 'rgba(24,24,27,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(63,63,70,0.5)', borderRadius: '12px', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ color: idx < 3 ? '#fbbf24' : '#3f3f46', fontSize: '14px', fontFamily: "'Syne', sans-serif", fontWeight: 700, width: '28px', flexShrink: 0 }}>
                  #{idx + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#fff', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, margin: 0 }}>{a.company}</p>
                  <p style={{ color: '#71717a', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {a.role} · {a.location.split(',')[0].trim()}
                  </p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {a.topics.slice(0, 3).map(t => (
                      <span key={t} style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: '#93C5FD', borderRadius: '9999px', padding: '2px 8px', fontSize: '11px', fontFamily: "'DM Sans', sans-serif" }}>{t}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0, alignItems: 'flex-end' }}>
                  <span style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', color: '#fbbf24', borderRadius: '9999px', padding: '2px 8px', fontSize: '11px', fontFamily: "'DM Sans', sans-serif" }}>
                    ⚡ Medium
                  </span>
                  <Link href={`/opportunities/${a.slug}`} style={{ color: '#3b82f6', fontSize: '12px', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, textDecoration: 'none' }}>
                    Start prepping →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* ── All roles ── */}
          {articles.length > 10 && (
            <>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
                All {mapping.label} Internships ({articles.length})
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '48px' }}>
                {articles.slice(10).map(a => (
                  <Link
                    key={a.slug}
                    href={`/opportunities/${a.slug}`}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(24,24,27,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(63,63,70,0.5)', borderRadius: '10px', padding: '12px 16px', textDecoration: 'none' }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <span style={{ color: '#a1a1aa', fontSize: '13px', fontFamily: "'DM Sans', sans-serif' " }}>{a.company}</span>
                      <span style={{ color: '#3f3f46', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", marginLeft: '8px' }}>— {a.role}</span>
                    </div>
                    <span style={{ color: '#3b82f6', fontSize: '12px', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, flexShrink: 0 }}>Prep →</span>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* ── Category nav ── */}
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
            Browse by category
          </h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '48px' }}>
            {BEST_PAGES.map(p => (
              <Link key={p.slug} href={`/best/${p.slug}`} style={{ display: 'inline-block', background: p.slug === slug ? '#3b82f6' : 'rgba(255,255,255,0.04)', border: `1px solid ${p.slug === slug ? '#3b82f6' : 'rgba(255,255,255,0.1)'}`, color: p.slug === slug ? '#fff' : '#71717a', borderRadius: '8px', padding: '7px 14px', fontSize: '13px', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif" }}>
                {p.label}
              </Link>
            ))}
          </div>

          {/* ── CTA ── */}
          <div style={{ background: 'rgba(24,24,27,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(63,63,70,0.5)', borderRadius: '20px', padding: '40px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '180px', background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 700, color: '#fff', marginBottom: '10px', position: 'relative' }}>
              Found your role? Now nail the interview.
            </h2>
            <p style={{ color: '#71717a', fontSize: '15px', maxWidth: '400px', margin: '0 auto 24px', lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif", position: 'relative' }}>
              AI-powered mock interviews tuned to each company and role.
            </p>
            <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#3b82f6', color: 'white', fontWeight: 500, borderRadius: '8px', padding: '12px 24px', fontSize: '15px', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", position: 'relative' }}>
              Get started free →
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
