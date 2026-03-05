import { MetadataRoute } from 'next'
import { getAllArticles, getUniqueCompanies, getComparableCompanies } from '@/lib/articles'
import { CURATED_TOPICS, BEST_PAGES } from '@/lib/seo-utils'

const BASE = 'https://www.interviewsense.org'
const now  = new Date()

export default function sitemap(): MetadataRoute.Sitemap {
  const articles  = getAllArticles()
  const companies = getUniqueCompanies()

  // ── Static pages ──────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                                    priority: 1,    changeFrequency: 'daily',   lastModified: now },
    { url: `${BASE}/opportunities`,                 priority: 0.95, changeFrequency: 'hourly',  lastModified: now },
    { url: `${BASE}/internship-opportunities`,      priority: 0.95, changeFrequency: 'hourly',  lastModified: now },
    { url: `${BASE}/login`,                         priority: 0.8,  changeFrequency: 'monthly', lastModified: now },
    { url: `${BASE}/signup`,                        priority: 0.8,  changeFrequency: 'monthly', lastModified: now },
    { url: `${BASE}/dashboard`,                     priority: 0.9,  changeFrequency: 'weekly',  lastModified: now },
    { url: `${BASE}/interview`,                     priority: 0.9,  changeFrequency: 'weekly',  lastModified: now },
    { url: `${BASE}/technical-assessment`,          priority: 0.9,  changeFrequency: 'weekly',  lastModified: now },
    { url: `${BASE}/resume-checker`,                priority: 0.9,  changeFrequency: 'weekly',  lastModified: now },
  ]

  // ── /opportunities/{slug} — priority 0.8 ─────────────────────────────────
  const opportunityPages: MetadataRoute.Sitemap = articles.map(a => ({
    url:             `${BASE}/opportunities/${a.slug}`,
    priority:        0.8,
    changeFrequency: 'weekly' as const,
    lastModified:    now,
  }))

  // ── /companies/{slug} — priority 0.9 ─────────────────────────────────────
  const companyPages: MetadataRoute.Sitemap = companies.map(c => ({
    url:             `${BASE}/companies/${c.slug}`,
    priority:        0.9,
    changeFrequency: 'weekly' as const,
    lastModified:    now,
  }))

  // ── /topics/{slug} — priority 0.7 ────────────────────────────────────────
  const topicPages: MetadataRoute.Sitemap = CURATED_TOPICS.map(t => ({
    url:             `${BASE}/topics/${t.slug}`,
    priority:        0.7,
    changeFrequency: 'weekly' as const,
    lastModified:    now,
  }))

  // ── /difficulty/{level} — priority 0.7 ───────────────────────────────────
  const difficultyPages: MetadataRoute.Sitemap = ['hard', 'medium', 'easy'].map(l => ({
    url:             `${BASE}/difficulty/${l}`,
    priority:        0.7,
    changeFrequency: 'weekly' as const,
    lastModified:    now,
  }))

  // ── /best/{slug} — priority 0.7 ──────────────────────────────────────────
  const bestPages: MetadataRoute.Sitemap = BEST_PAGES.map(p => ({
    url:             `${BASE}/best/${p.slug}`,
    priority:        0.7,
    changeFrequency: 'weekly' as const,
    lastModified:    now,
  }))

  // ── /compare/{slug} — priority 0.6 ───────────────────────────────────────
  const top30     = companies.slice(0, 30)
  const seenPairs = new Set<string>()
  const comparePages: MetadataRoute.Sitemap = []

  for (const company of top30) {
    for (const otherSlug of getComparableCompanies(company.slug, 4)) {
      const key = [company.slug, otherSlug].sort().join('|')
      if (seenPairs.has(key)) continue
      seenPairs.add(key)
      comparePages.push({
        url:             `${BASE}/compare/${company.slug}-vs-${otherSlug}-internship`,
        priority:        0.6,
        changeFrequency: 'weekly' as const,
        lastModified:    now,
      })
    }
  }

  return [
    ...staticPages,
    ...opportunityPages,
    ...companyPages,
    ...topicPages,
    ...difficultyPages,
    ...bestPages,
    ...comparePages,
  ]
}
