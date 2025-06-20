const fs = require('fs');
const path = require('path');

/**
 * Regenerates the internships sitemap based on current articles
 */
function regenerateInternshipsSitemap() {
  const baseUrl = 'https://interviewsense.org';
  const currentDate = new Date().toISOString().split('T')[0];
  
  console.log('🔄 Regenerating internships sitemap from current articles...');
  
  try {
    const articlesDir = path.join(process.cwd(), 'generated-content', 'articles');
    const sitemapsDir = path.join(process.cwd(), 'generated-content', 'sitemaps');
    
    // Read all current article files
    const articleFiles = fs.readdirSync(articlesDir)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const slug = file.replace('.json', '');
        return {
          url: `${baseUrl}/internships/${slug}`,
          lastmod: currentDate,
          changefreq: 'weekly',
          priority: '0.8'
        };
      });
    
    console.log(`📄 Found ${articleFiles.length} articles to include in sitemap`);
    
    // Generate XML content
    const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
    
    const xmlFooter = `</urlset>`;
    
    const urlEntries = articleFiles.map(item => `  <url>
    <loc>${item.url}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`);
    
    const xmlContent = [
      xmlHeader,
      ...urlEntries,
      xmlFooter
    ].join('\n');
    
    // Ensure sitemaps directory exists
    if (!fs.existsSync(sitemapsDir)) {
      fs.mkdirSync(sitemapsDir, { recursive: true });
    }
    
    // Write the new sitemap
    const sitemapPath = path.join(sitemapsDir, 'internships.xml');
    fs.writeFileSync(sitemapPath, xmlContent, 'utf8');
    
    console.log(`✅ Generated new internships sitemap with ${articleFiles.length} URLs`);
    console.log(`📁 Saved to: ${sitemapPath}`);
    
    return {
      success: true,
      urlCount: articleFiles.length,
      path: sitemapPath
    };
    
  } catch (error) {
    console.error('❌ Error regenerating sitemap:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the regeneration
if (require.main === module) {
  regenerateInternshipsSitemap();
}

module.exports = { regenerateInternshipsSitemap };
