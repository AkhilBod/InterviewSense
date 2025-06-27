import fs from 'fs'
import path from 'path'

export async function GET() {
  const baseUrl = 'https://www.interviewsense.org'
  
  // Get all opportunity slugs
  const opportunitiesDir = path.join(process.cwd(), 'generated-content', 'articles')
  let opportunitySlugs: string[] = []
  
  try {
    const filenames = fs.readdirSync(opportunitiesDir)
    opportunitySlugs = filenames
      .filter(name => name.endsWith('.json'))
      .map(filename => filename.replace('.json', ''))
  } catch (error) {
    console.error('Error reading opportunities directory:', error)
  }

  // Generate sitemap entries for opportunities
  const opportunityEntries = opportunitySlugs.map(slug => `
    <url>
      <loc>${baseUrl}/opportunities/${slug}</loc>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`).join('')

  // Static pages
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/dashboard', priority: '0.9', changefreq: 'daily' },
    { url: '/opportunities', priority: '0.9', changefreq: 'daily' },
    { url: '/interview/behavioral', priority: '0.8', changefreq: 'weekly' },
    { url: '/system-design', priority: '0.8', changefreq: 'weekly' },
    { url: '/technical-assessment', priority: '0.8', changefreq: 'weekly' },
    { url: '/career-roadmap', priority: '0.7', changefreq: 'weekly' },
    { url: '/portfolio-review', priority: '0.7', changefreq: 'weekly' },
    { url: '/resume-checker', priority: '0.7', changefreq: 'weekly' },
    { url: '/cover-letter', priority: '0.7', changefreq: 'weekly' },
    { url: '/contact', priority: '0.6', changefreq: 'monthly' },
    { url: '/support', priority: '0.6', changefreq: 'monthly' }
  ]

  const staticEntries = staticPages.map(page => `
    <url>
      <loc>${baseUrl}${page.url}</loc>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority}</priority>
    </url>`).join('')

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticEntries}
  ${opportunityEntries}
</urlset>`

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
    }
  })
}
