import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getArticlesByTopicSlug } from '@/lib/articles'
import { generateSchema, CURATED_TOPICS, topicSlugToName, CURRENT_YEAR, BASE_URL } from '@/lib/seo-utils'

export const dynamic = 'force-static'

interface PageProps {
  params: Promise<{ 'topic-slug': string }>
}

export async function generateStaticParams() {
  return CURATED_TOPICS.map(t => ({ 'topic-slug': t.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const topicSlug = (await params)['topic-slug']
  const topic     = CURATED_TOPICS.find(t => t.slug === topicSlug)
  if (!topic) return { title: 'Topic Not Found' }

  const articles  = getArticlesByTopicSlug(topicSlug)
  const title       = `${topic.name} Interview Questions — Top Companies (${CURRENT_YEAR}) | InterviewSense`
  const description = `Practice ${topic.name} interviews for ${articles.length}+ companies. AI mock interviews tailored to each role. Free.`
  const canonical   = `${BASE_URL}/topics/${topicSlug}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'website', siteName: 'InterviewSense' },
  }
}

export default async function TopicPage({ params }: PageProps) {
  const topicSlug = (await params)['topic-slug']
  const topic     = CURATED_TOPICS.find(t => t.slug === topicSlug)
  if (!topic) notFound()

  const articles = getArticlesByTopicSlug(topicSlug)
  if (!articles.length) notFound()

  const schemas = generateSchema('topic', { topic: topic.name, companyCount: articles.length })

  // Group by company
  const byCompany = new Map<string, typeof articles>()
  for (const a of articles) {
    if (!byCompany.has(a.company)) byCompany.set(a.company, [])
    byCompany.get(a.company)!.push(a)
  }
  const companies = Array.from(byCompany.entries()).sort((a, b) => b[1].length - a[1].length)

  const topicDesc: Record<string, string> = {
    'data-structures': 'Fundamental building blocks: arrays, linked lists, trees, graphs, heaps, and hash maps. Tested in nearly every technical interview.',
    'algorithms':      'Sorting, searching, dynamic programming, greedy strategies, and graph traversal. The core of technical screening.',
    'system-design':   'Designing scalable, reliable distributed systems — databases, caching, load balancing, and API design at scale.',
    'behavioral':      'Leadership, teamwork, and problem-solving stories. Assessed via STAR-format questions in every interview loop.',
    'machine-learning':'Model training, evaluation, bias-variance tradeoff, feature engineering, and ML system design.',
    'python':          'Python fundamentals, data structures, libraries (NumPy, Pandas), and scripting — required for data and AI roles.',
    'sql':             'Querying, aggregations, joins, window functions, and database optimization.',
    'javascript':      'ES6+, async/await, event loop, DOM manipulation, and framework fundamentals.',
    'react':           'Component lifecycle, hooks, state management, and front-end architecture patterns.',
    'statistics':      'Probability distributions, hypothesis testing, A/B testing, and statistical inference.',
    'probability':     'Combinatorics, conditional probability, Bayesian reasoning, and expected value — critical for quant roles.',
    'embedded-systems':'Interrupts, memory management, RTOS, I2C/SPI protocols, and low-level C programming.',
    'distributed-systems': 'CAP theorem, consensus algorithms, sharding, replication, and fault tolerance.',
    'c-cpp':           'Pointers, memory management, templates, concurrency, and systems-level programming.',
    'networking':      'TCP/IP, HTTP, DNS, load balancers, firewalls, and network security fundamentals.',
  }

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
                {articles.length} roles across {companies.length} companies
              </span>
            </div>

            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '16px' }}>
              {topic.name} Interview Questions
            </h1>

            <p style={{ color: '#71717a', fontSize: '17px', maxWidth: '560px', margin: '0 auto 28px', lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
              {topicDesc[topicSlug] ?? `Master ${topic.name} to ace technical interviews at top tech companies.`}
            </p>

            <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#3b82f6', color: 'white', fontWeight: 500, borderRadius: '8px', padding: '12px 24px', fontSize: '15px', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif" }}>
              Practice {topic.name} with AI →
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">

          {/* ── Companies grouped ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '48px' }}>
            {companies.map(([company, roles]) => (
              <div key={company} style={{ background: 'rgba(24,24,27,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(63,63,70,0.5)', borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 18px', borderBottom: '1px solid rgba(63,63,70,0.4)' }}>
                  <span style={{ color: '#fff', fontSize: '14px', fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>{company}</span>
                  <span style={{ color: '#52525b', fontSize: '12px', fontFamily: "'DM Sans', sans-serif" }}>{roles.length} {roles.length === 1 ? 'role' : 'roles'}</span>
                </div>
                {roles.slice(0, 4).map((a, i) => (
                  <Link
                    key={a.slug}
                    href={`/opportunities/${a.slug}`}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 18px', borderTop: i === 0 ? 'none' : '1px solid rgba(39,39,42,0.6)', textDecoration: 'none' }}
                  >
                    <span style={{ color: '#a1a1aa', fontSize: '13px', fontFamily: "'DM Sans', sans-serif" }}>{a.role}</span>
                    <span style={{ color: '#3b82f6', fontSize: '12px', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, flexShrink: 0 }}>Practice →</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>

          {/* ── CTA ── */}
          <div style={{ background: 'rgba(24,24,27,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(63,63,70,0.5)', borderRadius: '20px', padding: '40px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '180px', background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 700, color: '#fff', marginBottom: '10px', position: 'relative' }}>
              Ready to master {topic.name}?
            </h2>
            <p style={{ color: '#71717a', fontSize: '15px', maxWidth: '400px', margin: '0 auto 24px', lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif", position: 'relative' }}>
              AI mock interviews that adapt to your weak spots and give real-time feedback.
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
