import { Metadata } from 'next'
import { ProgrammaticSEOTemplate, getQuestionsForPage } from '@/components/ProgrammaticSEOTemplate'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getArticleBySlug, getSimilarArticles, getAllArticles } from '@/lib/articles'
import { generateRoleContent, generateSchema, companyNameToSlug, CURRENT_YEAR, BASE_URL, BEST_PAGES, CURATED_TOPICS, topicNameToSlug } from '@/lib/seo-utils'

interface PageProps {
  params: Promise<{ slug: string }>
}

export const dynamicParams = true
export const revalidate = 3600

export async function generateStaticParams() {
  try {
    return getAllArticles().map(a => ({ slug: a.slug }))
  } catch {
    return []
  }
}

// ── Page data ────────────────────────────────────────────────────────────────

function getPageData(slug: string) {
  const article = getArticleBySlug(slug)
  if (!article) return null

  const company  = article.company
  const role     = article.role
  const location = article.location
  const topics   = article.topics
  const content  = generateRoleContent(company, role, topics)

  return {
    type: 'company-role',
    title: `${company} ${role} Interview Questions`,
    slug,
    company: {
      name:              company,
      slug:              companyNameToSlug(company),
      tier:              getTierForCompany(company),
      locations:         [location],
      hiring_seasons:    ['Summer', 'Fall', 'Spring'],
      typical_questions: getTypicalQuestions(company),
      difficulty:        getDifficultyForCompany(company),
      focus_areas:       content.top_topics.slice(0, 3),
    },
    role: {
      title:       role,
      slug:        slug,
      description: article.metaDescription || content.overview,
      skills:      topics,
      difficulty:  'Medium',
    },
    keyword:     `${company.toLowerCase()} interview questions`,
    description: article.metaDescription || content.overview,
    internship: {
      applyUrl:   article.applyUrl,
      simplifyUrl: `https://simplify.jobs/c/${companyNameToSlug(company)}`,
      postedDays: extractPostedDays(article),
      location,
    },
    _meta: { company, role, location, topics, article },
  }
}

// ── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article  = getArticleBySlug(slug)

  if (!article) return { title: 'Internship Not Found' }

  const company  = article.company
  const role     = article.role
  const location = article.location

  // Strip trailing intern/co-op suffix to keep titles concise
  const shortRole = role
    .replace(/\s*[/\\]?\s*(Intern(?:ship)?|PEY|Co-op|Fellow|Trainee).*$/i, '')
    .trim() || role

  const title = `${company} ${shortRole} Interview Questions (${CURRENT_YEAR}) | InterviewSense`

  const hasCustomDesc = article.metaDescription && !article.metaDescription.startsWith('Ace your ')
  const description = hasCustomDesc
    ? article.metaDescription
    : `Preparing for your ${company} ${shortRole} interview? Practice with AI mock interviews, see real questions, and get a personalized prep plan. Free.`

  const canonical = `${BASE_URL}/opportunities/${slug}`

  return {
    title,
    description,
    keywords: [
      `${company} interview questions`,
      `${company} ${shortRole} interview`,
      `${company} internship interview`,
      `${company} interview process`,
      `${location} tech internships ${CURRENT_YEAR}`,
      'internship interview prep',
      'AI mock interview',
    ].join(', '),
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
      siteName: 'InterviewSense',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function OpportunityPage({ params }: PageProps) {
  const { slug } = await params
  const pageData = getPageData(slug)
  if (!pageData) notFound()

  const { company, role, location, topics, article } = pageData._meta

  // Schema markup
  const schemas = generateSchema('role', {
    company,
    role,
    location,
    datePosted: article.datePosted
      ? new Date(article.datePosted * 1000).toISOString().split('T')[0]
      : undefined,
    description: article.metaDescription,
    topics,
  })

  // Related data for internal links
  const similar   = getSimilarArticles(slug, 3)
  const compSlug  = companyNameToSlug(company)
  const roleTopicSlugs = topics.map(topicNameToSlug).filter(ts => CURATED_TOPICS.some(ct => ct.slug === ts))
  const bestPage  = BEST_PAGES.find(p => p.category === article.category)

  const questionsData = getQuestionsForPage(pageData)

  return (
    <>
      {/* JSON-LD schemas */}
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <ProgrammaticSEOTemplate
        data={pageData}
        questions={questionsData}
        relatedPages={similar.map(s => ({
          type: 'company-role',
          slug: s.slug,
          title: s.title,
          keyword: `${s.company.toLowerCase()} interview questions`,
          description: s.metaDescription || `${s.company} ${s.role} interview prep`,
          company: { name: s.company, slug: s.companySlug },
          role: { title: s.role },
        }))}
      />

      {/* ── Internal linking section ── */}
      <div style={{
        background: '#0c0c10',
        borderTop: '1px solid rgba(63,63,70,0.4)',
        padding: '48px 24px',
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: '18px',
            fontWeight: 700,
            color: '#fff',
            marginBottom: '24px',
          }}>
            Explore More
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
            {/* Company hub */}
            <LinkCard
              href={`/companies/${compSlug}`}
              label="Company hub"
              text={`All ${company} interview prep`}
            />

            {/* Topic pages */}
            {roleTopicSlugs.slice(0, 2).map(ts => (
              <LinkCard
                key={ts}
                href={`/topics/${ts}`}
                label="Topic guide"
                text={`${topicSlugToDisplay(ts)} interview questions`}
              />
            ))}

            {/* Best page */}
            {bestPage && (
              <LinkCard
                href={`/best/${bestPage.slug}`}
                label="Rankings"
                text={`Best ${bestPage.label} internships ${CURRENT_YEAR}`}
              />
            )}

            {/* Similar roles */}
            {similar.slice(0, 2).map(s => (
              <LinkCard
                key={s.slug}
                href={`/opportunities/${s.slug}`}
                label="Similar role"
                text={`${s.company} — ${s.role}`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function LinkCard({ href, label, text }: { href: string; label: string; text: string }) {
  return (
    <Link
      href={href}
      style={{
        display: 'block',
        background: 'rgba(24,24,27,0.5)',
        border: '1px solid rgba(63,63,70,0.5)',
        borderRadius: '10px',
        padding: '14px 16px',
        textDecoration: 'none',
      }}
    >
      <span style={{ display: 'block', color: '#3b82f6', fontSize: '11px', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
      <span style={{ display: 'block', color: '#a1a1aa', fontSize: '13px', fontFamily: "'DM Sans', sans-serif" }}>
        {text}
      </span>
    </Link>
  )
}

// ── Helper functions ──────────────────────────────────────────────────────────

function extractPostedDays(article: ReturnType<typeof getArticleBySlug>): string {
  if (!article) return '1mo ago'
  // Try to get from datePosted unix timestamp
  if (article.datePosted) {
    const days = Math.floor((Date.now() / 1000 - article.datePosted) / 86400)
    if (days < 1)  return 'today'
    if (days < 7)  return `${days}d ago`
    if (days < 30) return `${Math.floor(days / 7)}w ago`
    return `${Math.floor(days / 30)}mo ago`
  }
  return '1mo ago'
}

function topicSlugToDisplay(slug: string): string {
  return CURATED_TOPICS.find(t => t.slug === slug)?.name ?? slug
    .split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function getTierForCompany(company: string): string {
  const lower = company.toLowerCase()
  if (['google', 'meta', 'amazon', 'apple', 'netflix', 'microsoft'].includes(lower)) return 'FAANG'
  if (['salesforce', 'uber', 'airbnb', 'spotify', 'tesla', 'nvidia', 'adobe', 'paypal', 'intel'].includes(lower)) return 'Big Tech'
  return 'Enterprise'
}

function getTypicalQuestions(company: string): number {
  const lower = company.toLowerCase()
  if (['google', 'meta', 'amazon'].includes(lower)) return 350
  if (['microsoft', 'apple', 'netflix'].includes(lower)) return 320
  if (['salesforce', 'uber', 'airbnb'].includes(lower)) return 280
  return 220
}

function getDifficultyForCompany(company: string): string {
  const lower = company.toLowerCase()
  if (['google', 'meta', 'apple', 'netflix'].includes(lower)) return 'Hard'
  if (['amazon', 'microsoft', 'salesforce', 'uber'].includes(lower)) return 'Medium-Hard'
  return 'Medium'
}
