import { Metadata } from 'next'
import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import { getAllArticles } from '@/lib/articles'
import { CURRENT_YEAR } from '@/lib/seo-utils'
import OpportunitiesClient from './opportunities-client'

// Fully static — data is refreshed on each Vercel deployment triggered by the cron webhook.
// ISR caused blank pages because the runtime environment can't read the build-time JSON files.
export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  const n     = getAllArticles().length
  const title = `Internship Interview Prep — ${n.toLocaleString()} Roles | InterviewSense`
  const desc  = `AI-powered interview prep for ${n.toLocaleString()} internship roles in ${CURRENT_YEAR}. Practice system design, behavioral, and technical questions tailored to each company. Free.`
  return {
    title,
    description: desc,
    openGraph: { title, description: desc, url: 'https://www.interviewsense.org/opportunities', siteName: 'InterviewSense', type: 'website' },
  }
}

function getOpportunities() {
  const articlesDir = path.join(process.cwd(), 'generated-content', 'articles')

  let filenames: string[]
  try {
    filenames = fs.readdirSync(articlesDir).filter(name => name.endsWith('.json'))
  } catch {
    return []
  }

  return filenames
    .flatMap((filename) => {
      try {
        const slug = filename.replace('.json', '')
        const article = JSON.parse(fs.readFileSync(path.join(articlesDir, filename), 'utf8'))
        return [{
          slug,
          title: article.title || `${extractCompanyName(slug)} Interview Questions`,
          company: extractCompanyName(slug),
          description: article.metaDescription || `Ace your ${extractCompanyName(slug)} interview with real questions and focused practice.`,
          datePosted: article.originalData?.datePosted ?? 0,
        }]
      } catch {
        return []
      }
    })
    // Sort newest first; fall back to alphabetical when timestamps are equal
    .sort((a, b) => (b.datePosted - a.datePosted) || a.company.localeCompare(b.company))
}

function extractCompanyName(slug: string): string {
  const parts = slug.split('-')
  const companyPart = parts[0]
  return companyPart.charAt(0).toUpperCase() + companyPart.slice(1)
}

const CTA_INTERVAL = 8

export default function OpportunitiesPage() {
  const opportunities = getOpportunities()

  const groupedOpportunities = opportunities.reduce((acc, opportunity) => {
    const company = opportunity.company
    if (!acc[company]) acc[company] = []
    acc[company].push(opportunity)
    return acc
  }, {} as Record<string, typeof opportunities>)

  // Preserve recency order: first appearance of each company in the sorted array sets its rank
  const companies = [...new Set(opportunities.map(o => o.company))]

  return (
    <div style={{ background: '#0c0c10', minHeight: '100vh' }}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&family=Playfair+Display:ital@1&display=swap"
        rel="stylesheet"
      />

      {/* ── Hero ── */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: '-120px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '400px',
          background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="max-w-4xl mx-auto px-6 py-24 text-center" style={{ position: 'relative', zIndex: 1 }}>

          {/* Live badge */}
          <div className="inline-flex items-center gap-2 mb-8" style={{
            background: 'rgba(59,130,246,0.08)',
            border: '1px solid rgba(59,130,246,0.25)',
            borderRadius: '9999px',
            padding: '6px 16px',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#60A5FA', display: 'inline-block' }} />
            <span style={{ color: '#93C5FD', fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}>
              {opportunities.length.toLocaleString()} open roles · updated daily
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 'clamp(2.5rem, 6vw, 3.75rem)',
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: '20px',
          }}>
            <span style={{ fontStyle: 'italic', fontFamily: "'Playfair Display', serif" }}>Find your role.</span><br />
            <span style={{ color: '#60A5FA', fontStyle: 'italic', fontFamily: "'Playfair Display', serif" }}>Ace the interview.</span>
          </h1>

          <p style={{
            color: '#71717a',
            fontSize: '18px',
            maxWidth: '580px',
            margin: '0 auto 36px',
            lineHeight: 1.6,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Browse {companies.length}+ companies hiring right now. Practice with mock interviews tailored to each specific role.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/signup"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#3b82f6',
                color: 'white',
                fontWeight: 500,
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '15px',
                textDecoration: 'none',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Start Practicing Free
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link
              href="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#a1a1aa',
                fontWeight: 500,
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '15px',
                textDecoration: 'none',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Go to Dashboard
            </Link>
          </div>


        </div>
      </div>

      {/* ── Company listings ── */}
      <OpportunitiesClient
        opportunities={opportunities}
        companies={companies}
        groupedOpportunities={groupedOpportunities}
        CTA_INTERVAL={CTA_INTERVAL}
      />
    </div>
  )
}
