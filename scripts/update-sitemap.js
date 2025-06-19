const fs = require('fs');
const path = require('path');

/**
 * Updates the main sitemap to include all generated internship pages
 */
function updateSitemap() {
  const baseUrl = 'https://interviewsense.org';
  const currentDate = new Date().toISOString().split('T')[0];
  
  console.log('📄 Updating sitemap with new internship pages...');
  
  try {
    // Read the existing main sitemap
    const mainSitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    const mainSitemapContent = fs.readFileSync(mainSitemapPath, 'utf8');
    
    // Read the generated internships sitemap
    const internshipsSitemapPath = path.join(process.cwd(), 'generated-content', 'sitemaps', 'internships.xml');
    const internshipsSitemapContent = fs.readFileSync(internshipsSitemapPath, 'utf8');
    
    // Extract URLs from internships sitemap and convert localhost to production domain
    const internshipUrlMatches = internshipsSitemapContent.match(/<url>[\s\S]*?<\/url>/g) || [];
    const internshipUrls = internshipUrlMatches
      .map(urlBlock => {
        // Replace localhost with production domain
        const updatedBlock = urlBlock
          .replace(/http:\/\/localhost:3000/g, baseUrl)
          .replace(/<lastmod>[\d-]+<\/lastmod>/, `<lastmod>${currentDate}</lastmod>`);
        return updatedBlock;
      })
      .filter(url => {
        // Filter out the generic "/internships/internship" URL
        return !url.includes(`${baseUrl}/internships/internship<`);
      });
    
    console.log(`🔍 Found ${internshipUrls.length} internship URLs to add`);
    
    // Parse existing main sitemap to avoid duplicates
    const existingUrlMatches = mainSitemapContent.match(/<loc>(.*?)<\/loc>/g) || [];
    const existingUrls = new Set(
      existingUrlMatches.map(match => {
        const url = match.replace(/<\/?loc>/g, '');
        return url;
      })
    );
    
    // Filter out URLs that already exist in main sitemap
    const newInternshipUrls = internshipUrls.filter(urlBlock => {
      const locMatch = urlBlock.match(/<loc>(.*?)<\/loc>/);
      if (locMatch) {
        const url = locMatch[1];
        return !existingUrls.has(url);
      }
      return false;
    });
    
    console.log(`➕ Adding ${newInternshipUrls.length} new internship URLs`);
    
    // Create the updated sitemap content
    const sitemapHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
    
    const sitemapFooter = `</urlset>`;
    
    // Extract existing URLs from main sitemap (excluding header and footer)
    const existingContent = mainSitemapContent
      .replace(/<\?xml[^>]*\?>/, '')
      .replace(/<urlset[^>]*>/, '')
      .replace(/<\/urlset>/, '')
      .trim();
    
    // Combine all URLs
    const allUrls = [
      existingContent,
      ...newInternshipUrls
    ].filter(Boolean);
    
    const updatedSitemapContent = [
      sitemapHeader,
      ...allUrls,
      sitemapFooter
    ].join('\n');
    
    // Write the updated sitemap
    fs.writeFileSync(mainSitemapPath, updatedSitemapContent, 'utf8');
    
    // Also create a backup of the updated internships sitemap with correct domain
    const productionInternshipsSitemap = internshipsSitemapContent
      .replace(/http:\/\/localhost:3000/g, baseUrl)
      .replace(/<lastmod>[\d-]+<\/lastmod>/g, `<lastmod>${currentDate}</lastmod>`);
    
    const productionSitemapPath = path.join(process.cwd(), 'public', 'internships-sitemap.xml');
    fs.writeFileSync(productionSitemapPath, productionInternshipsSitemap, 'utf8');
    
    // Count total URLs in updated sitemap
    const finalUrlCount = (updatedSitemapContent.match(/<url>/g) || []).length;
    
    console.log('✅ Sitemap update completed!');
    console.log(`📊 Total URLs in main sitemap: ${finalUrlCount}`);
    console.log(`📁 Main sitemap: ${mainSitemapPath}`);
    console.log(`📁 Internships sitemap: ${productionSitemapPath}`);
    console.log(`🌐 All URLs now use production domain: ${baseUrl}`);
    
    return {
      totalUrls: finalUrlCount,
      newUrls: newInternshipUrls.length,
      success: true
    };
    
  } catch (error) {
    console.error('❌ Error updating sitemap:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the update
if (require.main === module) {
  updateSitemap();
}

module.exports = { updateSitemap };
