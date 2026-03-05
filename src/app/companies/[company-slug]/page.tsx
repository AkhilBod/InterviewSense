import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getArticlesByCompany, getUniqueCompanies } from '@/lib/articles'
import { generateRoleContent, generateSchema, CURRENT_YEAR, BASE_URL } from '@/lib/seo-utils'

export const dynamic = 'force-static'

interface PageProps {
  params: Promise<{ 'company-slug': string }>
}

export async function generateStaticParams() {
  return getUniqueCompanies()
    .filter(c => c.count >= 1)
    .map(c => ({ 'company-slug': c.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const companySlug = (await params)['company-slug']
  const articles    = getArticlesByCompany(companySlug)
  if (!articles.length) return { title: 'Company Not Found' }

  const company = articles[0].company
  const n       = articles.length
  const title   = `${company} Interview Prep — All Roles & Questions (${CURRENT_YEAR}) | InterviewSense`
  const description = `Prepare for your ${company} interview. AI mock interviews, real questions, and prep guides for all ${n} ${company} roles on InterviewSense.`
  const canonical   = `${BASE_URL}/companies/${companySlug}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'website', siteName: 'InterviewSense' },
  }
}

export default async function CompanyPage({ params }: PageProps) {
  const companySlug = (await params)['company-slug']
  const articles    = getArticlesByCompany(companySlug)
  if (!articles.length) notFound()

  const company  = articles[0].company
  const topics   = articles[0].topics
  const content  = generateRoleContent(company, articles[0].role, topics)
  const schemas  = generateSchema('company', { company, roleCount: articles.length })

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
                {articles.length} open {articles.length === 1 ? 'role' : 'roles'} · updated daily
              </span>
            </div>

            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '16px' }}>
              {company} Interview Prep
            </h1>

            <p style={{ color: '#71717a', fontSize: '17px', maxWidth: '520px', margin: '0 auto 12px', lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
              {content.overview}
            </p>

            {/* Difficulty badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
              <span style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', color: '#fbbf24', borderRadius: '9999px', padding: '4px 12px', fontSize: '12px', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                ⚡ Medium difficulty
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#3b82f6', color: 'white', fontWeight: 500, borderRadius: '8px', padding: '12px 24px', fontSize: '15px', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif" }}>
                Practice {company} interviews free →
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">

          {/* ── Interview format card ── */}
          <div style={{ background: 'rgba(24,24,27,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(63,63,70,0.5)', borderRadius: '14px', padding: '24px', marginBottom: '32px' }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '10px' }}>
              Interview Format
            </h2>
            <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
              {content.interview_format}
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '14px' }}>
              {content.top_topics.map(t => (
                <span key={t} style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: '#93C5FD', borderRadius: '9999px', padding: '3px 10px', fontSize: '12px', fontFamily: "'DM Sans', sans-serif" }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* ── Open roles ── */}
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
            Open Roles at {company}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '48px' }}>
            {articles.map((a, i) => (
              <Link
                key={a.slug}
                href={`/opportunities/${a.slug}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(24,24,27,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(63,63,70,0.5)', borderRadius: '12px', padding: '14px 18px', textDecoration: 'none' }}
              >
                <div>
                  <p style={{ color: '#fff', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, margin: 0 }}>{a.role}</p>
                  <p style={{ color: '#52525b', fontSize: '12px', fontFamily: "'DM Sans', sans-serif", margin: '3px 0 0' }}>{a.location}</p>
                </div>
                <span style={{ color: '#3b82f6', fontSize: '12px', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, flexShrink: 0 }}>
                  Practice →
                </span>
              </Link>
            ))}
          </div>

          {/* ── Bottom CTA ── */}
          <div style={{ background: 'rgba(24,24,27,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(63,63,70,0.5)', borderRadius: '20px', padding: '40px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '180px', background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 700, color: '#fff', marginBottom: '10px', position: 'relative' }}>
              Ready to nail your {company} interview?
            </h2>
            <p style={{ color: '#71717a', fontSize: '15px', maxWidth: '400px', margin: '0 auto 24px', lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif", position: 'relative' }}>
              Get AI feedback tuned to {company}'s exact interview style.
            </p>
            <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#3b82f6', color: 'white', fontWeight: 500, borderRadius: '8px', padding: '12px 24px', fontSize: '15px', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", position: 'relative' }}>
              Start free →
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
