import fs from 'fs'
import path from 'path'
import { getRoleTopics, companyNameToSlug, topicNameToSlug } from './seo-utils'

const ARTICLES_DIR = path.join(process.cwd(), 'generated-content', 'articles')

export interface Article {
  slug: string
  company: string
  companySlug: string
  role: string
  location: string
  category: string
  topics: string[]
  topicSlugs: string[]
  datePosted: number
  applyUrl: string
  title: string
  metaDescription: string
  difficulty: number
}

// Module-level cache — populated once per Node.js process (i.e., once per build)
let _cache: Article[] | null = null

export function getAllArticles(): Article[] {
  if (_cache) return _cache

  let filenames: string[]
  try {
    filenames = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.json'))
  } catch {
    return []
  }

  _cache = filenames.flatMap((filename): Article[] => {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(ARTICLES_DIR, filename), 'utf8'))
      const od = raw.originalData ?? {}
      const inner = od.originalData ?? {}

      const rawCompany: string = od.company || inner.company_name || ''
      // Skip continuation rows (↳) and articles with no real company name
      if (!rawCompany || !/^[A-Za-z0-9]/.test(rawCompany)) return []
      // Strip leading emoji / non-word characters (e.g., "🔥 Amazon" → "Amazon")
      const company = rawCompany.replace(/^[^A-Za-z0-9]+/, '').trim() || rawCompany
      const role: string    = od.role    || inner.title        || 'Software Engineering Intern'
      const category: string = inner.category ?? 'software'
      const topics   = getRoleTopics(category, role)
      const locations: string[] = inner.locations ?? []
      const location = od.location || (locations.length ? locations.join(', ') : 'United States')

      return [{
        slug:         filename.replace('.json', ''),
        company,
        companySlug:  companyNameToSlug(company),
        role,
        location,
        category,
        topics,
        topicSlugs:   topics.map(topicNameToSlug),
        datePosted:   od.datePosted ?? inner.date_posted ?? 0,
        applyUrl:     od.applicationUrl ?? inner.url ?? '#',
        title:        raw.title         ?? `${company} ${role} Interview Questions`,
        metaDescription: raw.metaDescription ?? '',
        difficulty:   3,
      }]
    } catch {
      return []
    }
  })

  // Sort newest first globally
  _cache.sort((a, b) => b.datePosted - a.datePosted)

  return _cache
}

// ── Queries ───────────────────────────────────────────────────────────────────

export function getArticleBySlug(slug: string): Article | undefined {
  return getAllArticles().find(a => a.slug === slug)
}

export function getArticlesByCompany(companySlug: string): Article[] {
  return getAllArticles().filter(a => a.companySlug === companySlug)
}

export function getArticlesByTopicSlug(topicSlug: string): Article[] {
  return getAllArticles().filter(a => a.topicSlugs.includes(topicSlug))
}

export function getArticlesByCategory(category: string): Article[] {
  return getAllArticles().filter(a => a.category === category)
}

export function getSimilarArticles(slug: string, limit = 3): Article[] {
  const all    = getAllArticles()
  const target = all.find(a => a.slug === slug)
  if (!target) return []

  // Prefer other roles at the same company first
  const sameCompany = all
    .filter(a => a.slug !== slug && a.companySlug === target.companySlug)
    .slice(0, limit)

  if (sameCompany.length >= limit) return sameCompany

  // Fill remaining slots with topic-similar roles from other companies
  const usedSlugs = new Set(sameCompany.map(a => a.slug))
  const topicSimilar = all
    .filter(a => a.slug !== slug && !usedSlugs.has(a.slug) && a.companySlug !== target.companySlug)
    .map(a => ({ article: a, score: target.topics.filter(t => a.topics.includes(t)).length }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score || b.article.datePosted - a.article.datePosted)
    .slice(0, limit - sameCompany.length)
    .map(x => x.article)

  return [...sameCompany, ...topicSimilar]
}

// ── Company aggregations ──────────────────────────────────────────────────────

export interface CompanySummary {
  name: string
  slug: string
  count: number
  topics: string[]
}

let _companyCache: CompanySummary[] | null = null

export function getUniqueCompanies(): CompanySummary[] {
  if (_companyCache) return _companyCache

  const map = new Map<string, CompanySummary>()
  for (const a of getAllArticles()) {
    if (!map.has(a.companySlug)) {
      map.set(a.companySlug, { name: a.company, slug: a.companySlug, count: 0, topics: [] })
    }
    const entry = map.get(a.companySlug)!
    entry.count++
    for (const t of a.topics) {
      if (!entry.topics.includes(t)) entry.topics.push(t)
    }
  }

  _companyCache = Array.from(map.values()).sort((a, b) => b.count - a.count)
  return _companyCache
}

export function getComparableCompanies(companySlug: string, limit = 5): string[] {
  const companies      = getUniqueCompanies()
  const target         = companies.find(c => c.slug === companySlug)
  if (!target) return []

  const targetTopics = new Set(target.topics)

  return companies
    .filter(c => c.slug !== companySlug)
    .map(c => ({ slug: c.slug, overlap: c.topics.filter(t => targetTopics.has(t)).length }))
    .filter(x => x.overlap >= 2)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, limit)
    .map(x => x.slug)
}
