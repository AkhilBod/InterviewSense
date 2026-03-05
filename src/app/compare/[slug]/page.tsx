import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getArticlesByCompany, getUniqueCompanies, getComparableCompanies } from '@/lib/articles'
import { generateRoleContent, generateSchema, CURRENT_YEAR, BASE_URL } from '@/lib/seo-utils'

export const dynamic = 'force-static'
export const dynamicParams = true

interface PageProps {
  params: Promise<{ slug: string }>
}

/** Parse `cohere-vs-anthropic-internship` → ['cohere', 'anthropic'] */
function parseCompareSlug(slug: string): [string, string] | null {
  const withoutSuffix = slug.replace(/-internship$/, '')
  const idx = withoutSuffix.indexOf('-vs-')
  if (idx === -1) return null
  return [withoutSuffix.slice(0, idx), withoutSuffix.slice(idx + 4)]
}

function buildCompareSlug(a: string, b: string) {
  return `${a}-vs-${b}-internship`
}

export async function generateStaticParams() {
  // Top 30 companies by role count, pair each with up to 4 comparable companies
  const top = getUniqueCompanies().slice(0, 30)
  const slugs = new Set<string>()

  for (const company of top) {
    if (!company.slug) continue
    const comparable = getComparableCompanies(company.slug, 4)
    for (const other of comparable) {
      if (!other) continue
      const key = [company.slug, other].sort().join('---')
      if (!slugs.has(key)) {
        slugs.add(key)
      }
    }
  }

  return Array.from(slugs).map(key => {
    const [a, b] = key.split('---')
    return { slug: buildCompareSlug(a, b) }
  })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const parsed   = parseCompareSlug(slug)
  if (!parsed) return { title: 'Not Found' }

  const [slugA, slugB] = parsed
  const articlesA      = getArticlesByCompany(slugA)
  const articlesB      = getArticlesByCompany(slugB)
  if (!articlesA.length || !articlesB.length) return { title: 'Not Found' }

  const companyA = articlesA[0].company
  const companyB = articlesB[0].company
  const title       = `${companyA} vs ${companyB} Internship — Which is Harder? (${CURRENT_YEAR}) | InterviewSense`
  const description = `${companyA} vs ${companyB} internship interview comparison. See difficulty, topics, and format side-by-side. Prep for both on InterviewSense.`
  const canonical   = `${BASE_URL}/compare/${slug}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'website', siteName: 'InterviewSense' },
  }
}

export default async function ComparePage({ params }: PageProps) {
  const { slug } = await params
  const parsed   = parseCompareSlug(slug)
  if (!parsed) notFound()

  const [slugA, slugB] = parsed
  const articlesA      = getArticlesByCompany(slugA)
  const articlesB      = getArticlesByCompany(slugB)
  if (!articlesA.length || !articlesB.length) notFound()

  const companyA = articlesA[0].company
  const companyB = articlesB[0].company
  const topicsA  = articlesA[0].topics
  const topicsB  = articlesB[0].topics
  const contentA = generateRoleContent(companyA, articlesA[0].role, topicsA)
  const contentB = generateRoleContent(companyB, articlesB[0].role, topicsB)

  const schemas = generateSchema('compare', { companyA, companyB })

  const sharedTopics = topicsA.filter(t => topicsB.includes(t))

  const rows: { label: string; a: string; b: string }[] = [
    { label: 'Open Roles',       a: `${articlesA.length}`,                    b: `${articlesB.length}` },
    { label: 'Difficulty',       a: contentA.difficulty_rating + ' / 5',      b: contentB.difficulty_rating + ' / 5' },
    { label: 'Top Topics',       a: topicsA.slice(0, 3).join(', '),           b: topicsB.slice(0, 3).join(', ') },
    { label: 'Interview Format', a: contentA.interview_format.slice(0, 120) + '…', b: contentB.interview_format.slice(0, 120) + '…' },
    { label: 'Locations',        a: articlesA[0].location.split(',')[0],       b: articlesB[0].location.split(',')[0] },
  ]

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
                Internship comparison · {CURRENT_YEAR}
              </span>
            </div>

            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.75rem, 4.5vw, 2.75rem)', fontWeight: 700, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '16px' }}>
              {companyA} vs {companyB}
              <br />
              <span style={{ color: '#60A5FA' }}>Which is harder?</span>
            </h1>

            <p style={{ color: '#71717a', fontSize: '16px', maxWidth: '520px', margin: '0 auto 28px', lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
              Both companies test similar topics
              {sharedTopics.length > 0 && ` including ${sharedTopics.slice(0, 2).join(' and ')}`}.
              Use InterviewSense to prep for both simultaneously.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">

          {/* ── Comparison table ── */}
          <div style={{ background: 'rgba(24,24,27,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(63,63,70,0.5)', borderRadius: '14px', overflow: 'hidden', marginBottom: '32px' }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid rgba(63,63,70,0.5)' }}>
              <div style={{ padding: '14px 16px', color: '#52525b', fontSize: '12px', fontFamily: "'DM Sans', sans-serif" }} />
              {[companyA, companyB].map(c => (
                <div key={c} style={{ padding: '14px 16px', textAlign: 'center', borderLeft: '1px solid rgba(63,63,70,0.4)' }}>
                  <span style={{ color: '#fff', fontSize: '14px', fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>{c}</span>
                </div>
              ))}
            </div>

            {/* Rows */}
            {rows.map((row, i) => (
              <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderTop: i === 0 ? 'none' : '1px solid rgba(39,39,42,0.5)' }}>
                <div style={{ padding: '14px 16px', color: '#71717a', fontSize: '12px', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {row.label}
                </div>
                {[row.a, row.b].map((val, j) => (
                  <div key={j} style={{ padding: '14px 16px', color: '#a1a1aa', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5, borderLeft: '1px solid rgba(63,63,70,0.4)' }}>
                    {val}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* ── Summary paragraph ── */}
          <div style={{ background: 'rgba(24,24,27,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(63,63,70,0.5)', borderRadius: '14px', padding: '24px', marginBottom: '32px' }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '10px' }}>Summary</h2>
            <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
              Both {companyA} and {companyB} offer competitive internship opportunities and test similar core competencies
              {sharedTopics.length > 0 && ` including ${sharedTopics.join(', ')}`}.
              {companyA} has {articlesA.length} open {articlesA.length === 1 ? 'role' : 'roles'} while {companyB} has {articlesB.length}.
              Both interviews are rated Medium difficulty overall. Strong preparation in data structures, algorithms, and system design
              will serve you well at either company.
            </p>
          </div>

          {/* ── Dual CTAs ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '48px' }}>
            {[[companyA, slugA, articlesA], [companyB, slugB, articlesB]].map(([company, cSlug, arts]) => (
              <div key={cSlug as string} style={{ background: 'rgba(24,24,27,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(63,63,70,0.5)', borderRadius: '14px', padding: '24px', textAlign: 'center' }}>
                <p style={{ color: '#fff', fontSize: '15px', fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: '6px' }}>{company as string}</p>
                <p style={{ color: '#52525b', fontSize: '12px', fontFamily: "'DM Sans', sans-serif", marginBottom: '16px' }}>
                  {(arts as typeof articlesA).length} open roles
                </p>
                <Link href={`/companies/${cSlug}`} style={{ display: 'block', background: '#3b82f6', color: 'white', fontWeight: 500, borderRadius: '8px', padding: '10px 16px', fontSize: '13px', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", marginBottom: '8px' }}>
                  Prep for {company as string} →
                </Link>
                <Link href={`/companies/${cSlug}`} style={{ display: 'block', color: '#52525b', fontSize: '12px', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif" }}>
                  View all {company as string} roles →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
