#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🗺️ Generating opportunities-only sitemap...')

function generateOpportunitiesSitemap() {
  const articlesDir = path.join(process.cwd(), 'generated-content', 'articles')
  
  if (!fs.existsSync(articlesDir)) {
    console.error('❌ Generated content articles directory not found')
    return
  }

  const articles = fs.readdirSync(articlesDir)
    .filter(filename => filename.endsWith('.json'))
    .map(filename => filename.replace('.json', ''))

  const baseUrl = 'https://interviewsense.org'
  const currentDate = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/opportunities</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`

  // Add all opportunity pages
  articles.forEach(slug => {
    sitemap += `  <url>
    <loc>${baseUrl}/opportunities/${slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`
  })

  sitemap += '</urlset>'

  // Write the sitemap
  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml')
  fs.writeFileSync(sitemapPath, sitemap)

  console.log(`✅ Generated sitemap with ${articles.length} opportunities`)
  console.log(`📍 Sitemap saved to: ${sitemapPath}`)
  
  return articles.length
}

// Run the generator
const count = generateOpportunitiesSitemap()
console.log(`🎉 Sitemap generation complete! Total URLs: ${count + 2}`) // +2 for home and opportunities index
