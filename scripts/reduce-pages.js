const fs = require('fs');
const path = require('path');

/**
 * Reduces the number of generated pages to make builds more manageable
 * Keeps the most recent and important internship pages
 */
function reducePages() {
  console.log('🔧 Reducing number of pages for better build performance...');
  
  try {
    // Paths
    const articlesDir = path.join(process.cwd(), 'generated-content', 'articles');
    const pagesDir = path.join(process.cwd(), 'src', 'app', 'internships');
    
    // Read all article files
    const articleFiles = fs.readdirSync(articlesDir)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(articlesDir, file);
        try {
          const stats = fs.statSync(filePath);
          const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          
          return {
            filename: file,
            filepath: filePath,
            slug: content.slug || file.replace('.json', ''),
            lastModified: stats.mtime,
            title: content.title || '',
            company: extractCompany(content.title || file),
            priority: calculatePriority(content, file)
          };
        } catch (error) {
          console.warn(`⚠️ Skipping malformed file: ${file}`);
          return null;
        }
      })
      .filter(Boolean); // Remove null entries
    
    console.log(`📊 Found ${articleFiles.length} article files`);
    
    // Sort by priority (higher priority = more important companies/positions)
    const sortedArticles = articleFiles.sort((a, b) => {
      // First by priority, then by last modified date
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return b.lastModified - a.lastModified;
    });
    
    // Keep top 1000 articles
    const keepCount = 1000;
    const articlesToKeep = sortedArticles.slice(0, keepCount);
    const articlesToDelete = sortedArticles.slice(keepCount);
    
    console.log(`✂️ Keeping ${keepCount} most important articles`);
    console.log(`🗑️ Deleting ${articlesToDelete.length} articles`);
    
    // Delete article files
    let deletedArticles = 0;
    for (const article of articlesToDelete) {
      try {
        fs.unlinkSync(article.filepath);
        deletedArticles++;
      } catch (error) {
        console.warn(`⚠️ Could not delete article: ${article.filename}`);
      }
    }
    
    // Read all page directories
    const pageDirectories = fs.readdirSync(pagesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .filter(name => !['[slug]', 'topics'].includes(name)); // Exclude dynamic routes and special directories
    
    console.log(`📁 Found ${pageDirectories.length} page directories`);
    
    // Get slugs of articles we're keeping
    const keepSlugs = new Set(articlesToKeep.map(article => article.slug));
    
    // Delete page directories that don't have corresponding articles
    let deletedPages = 0;
    for (const dirName of pageDirectories) {
      if (!keepSlugs.has(dirName)) {
        const dirPath = path.join(pagesDir, dirName);
        try {
          fs.rmSync(dirPath, { recursive: true, force: true });
          deletedPages++;
        } catch (error) {
          console.warn(`⚠️ Could not delete page directory: ${dirName}`);
        }
      }
    }
    
    console.log(`✅ Cleanup completed!`);
    console.log(`📊 Deleted ${deletedArticles} article files`);
    console.log(`📊 Deleted ${deletedPages} page directories`);
    console.log(`📊 Remaining articles: ${keepCount}`);
    
    // Show some stats about what we kept
    const companies = {};
    articlesToKeep.forEach(article => {
      companies[article.company] = (companies[article.company] || 0) + 1;
    });
    
    const topCompanies = Object.entries(companies)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    console.log(`\n🏢 Top companies in remaining articles:`);
    topCompanies.forEach(([company, count]) => {
      console.log(`  ${company}: ${count} positions`);
    });
    
    return {
      success: true,
      deletedArticles,
      deletedPages,
      remainingArticles: keepCount,
      topCompanies
    };
    
  } catch (error) {
    console.error('❌ Error reducing pages:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Extract company name from title or filename
 */
function extractCompany(titleOrFilename) {
  // Common patterns for company extraction
  const patterns = [
    /^([^-\s]+)/,  // First word before dash or space
    /^(.+?)\s+(internship|intern)/i,  // Everything before "internship" or "intern"
  ];
  
  for (const pattern of patterns) {
    const match = titleOrFilename.match(pattern);
    if (match) {
      return match[1].toLowerCase().replace(/[^a-z0-9]/g, '');
    }
  }
  
  return 'unknown';
}

/**
 * Calculate priority score for an article (higher = more important)
 */
function calculatePriority(content, filename) {
  let priority = 0;
  
  const title = (content.title || filename).toLowerCase();
  const company = extractCompany(title);
  
  // High priority companies (FAANG + major tech)
  const tier1Companies = ['google', 'meta', 'amazon', 'apple', 'microsoft', 'netflix', 'tesla', 'uber', 'airbnb', 'stripe'];
  const tier2Companies = ['nvidia', 'salesforce', 'spotify', 'square', 'robinhood', 'palantir', 'databricks'];
  
  if (tier1Companies.includes(company)) {
    priority += 100;
  } else if (tier2Companies.includes(company)) {
    priority += 50;
  }
  
  // High priority roles
  if (title.includes('software engineer') || title.includes('sde')) {
    priority += 30;
  } else if (title.includes('data science') || title.includes('machine learning')) {
    priority += 25;
  } else if (title.includes('frontend') || title.includes('backend') || title.includes('full stack')) {
    priority += 20;
  }
  
  // Recent posts get slight boost
  if (content.lastUpdated) {
    const lastUpdate = new Date(content.lastUpdated);
    const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 30) {
      priority += 10;
    }
  }
  
  // Popular locations
  if (title.includes('san francisco') || title.includes('new york') || title.includes('seattle')) {
    priority += 5;
  }
  
  return priority;
}

// Run the reduction
if (require.main === module) {
  reducePages();
}

module.exports = { reducePages };
