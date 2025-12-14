import fs from 'fs'
import path from 'path'

/**
 * Script to delete half of the generated articles to reduce build time and storage
 * This will randomly select and delete 50% of the articles while keeping the most popular companies
 */

// Companies to always keep (high-value/popular companies)
const PRIORITY_COMPANIES = [
  'google',
  'meta',
  'amazon', 
  'apple',
  'microsoft',
  'netflix',
  'tesla',
  'uber',
  'airbnb',
  'spotify',
  'adobe',
  'salesforce',
  'nvidia',
  'openai',
  'anthropic',
  'bytedance',
  'tiktok',
  'citadel',
  'jane-street',
  'two-sigma',
  'hudson-river-trading',
  'optiver',
  'palantir',
  'stripe',
  'ramp',
  'figma',
  'notion',
  'discord',
  'coinbase',
  'robinhood'
]

interface ArticleInfo {
  filename: string
  slug: string
  company: string
  isPriority: boolean
  size: number
}

function extractCompanyFromSlug(slug: string): string {
  // Extract company name from slug (first part before first hyphen)
  const parts = slug.split('-')
  return parts[0].toLowerCase()
}

function isHighPriorityCompany(company: string): boolean {
  return PRIORITY_COMPANIES.some(priorityCompany => 
    company.includes(priorityCompany) || priorityCompany.includes(company)
  )
}

async function main() {
  console.log('🗂️  Starting article cleanup process...')
  
  const articlesDir = path.join(process.cwd(), 'generated-content', 'articles')
  
  if (!fs.existsSync(articlesDir)) {
    console.log('❌ Articles directory not found')
    return
  }

  // Get all article files
  const files = fs.readdirSync(articlesDir).filter(file => file.endsWith('.json'))
  console.log(`📄 Found ${files.length} total articles`)

  if (files.length === 0) {
    console.log('❌ No articles found to process')
    return
  }

  // Analyze all articles
  const articles: ArticleInfo[] = files.map(filename => {
    const slug = filename.replace('.json', '')
    const company = extractCompanyFromSlug(slug)
    const filePath = path.join(articlesDir, filename)
    const size = fs.statSync(filePath).size
    
    return {
      filename,
      slug,
      company,
      isPriority: isHighPriorityCompany(company),
      size
    }
  })

  // Separate priority and non-priority articles
  const priorityArticles = articles.filter(article => article.isPriority)
  const nonPriorityArticles = articles.filter(article => !article.isPriority)
  
  console.log(`⭐ Priority articles (keeping all): ${priorityArticles.length}`)
  console.log(`📦 Non-priority articles: ${nonPriorityArticles.length}`)

  // Calculate how many non-priority articles to keep
  const targetTotal = Math.floor(articles.length * 0.5) // Keep 50% total
  const nonPriorityToKeep = Math.max(0, targetTotal - priorityArticles.length)
  const nonPriorityToDelete = nonPriorityArticles.length - nonPriorityToKeep

  console.log(`🎯 Target total articles: ${targetTotal}`)
  console.log(`📝 Non-priority articles to keep: ${nonPriorityToKeep}`)
  console.log(`🗑️  Non-priority articles to delete: ${nonPriorityToDelete}`)

  if (nonPriorityToDelete <= 0) {
    console.log('✅ No articles need to be deleted')
    return
  }

  // Randomly shuffle non-priority articles and select ones to delete
  const shuffled = [...nonPriorityArticles].sort(() => Math.random() - 0.5)
  const articlesToDelete = shuffled.slice(0, nonPriorityToDelete)

  console.log('\n🗑️  Deleting articles...')
  
  let deletedCount = 0
  let deletedSize = 0
  const deletedCompanies = new Set<string>()

  for (const article of articlesToDelete) {
    try {
      const filePath = path.join(articlesDir, article.filename)
      fs.unlinkSync(filePath)
      deletedCount++
      deletedSize += article.size
      deletedCompanies.add(article.company)
      
      if (deletedCount % 50 === 0) {
        console.log(`   Deleted ${deletedCount}/${articlesToDelete.length} articles...`)
      }
    } catch (error) {
      console.error(`❌ Error deleting ${article.filename}:`, error)
    }
  }

  // Check for corresponding app pages and delete them too
  console.log('\n🗑️  Cleaning up corresponding app pages...')
  
  const appArticlesDir = path.join(process.cwd(), 'src', 'app', 'articles')
  let appPagesDeleted = 0
  
  if (fs.existsSync(appArticlesDir)) {
    for (const article of articlesToDelete) {
      try {
        const pageDir = path.join(appArticlesDir, article.slug)
        if (fs.existsSync(pageDir)) {
          fs.rmSync(pageDir, { recursive: true, force: true })
          appPagesDeleted++
        }
      } catch (error) {
        console.error(`❌ Error deleting app page ${article.slug}:`, error)
      }
    }
  }

  // Final statistics
  const remainingFiles = fs.readdirSync(articlesDir).filter(file => file.endsWith('.json'))
  
  console.log('\n✅ Cleanup complete!')
  console.log(`📊 Statistics:`)
  console.log(`   Articles deleted: ${deletedCount}`)
  console.log(`   App pages deleted: ${appPagesDeleted}`)
  console.log(`   Storage freed: ${(deletedSize / 1024 / 1024).toFixed(2)} MB`)
  console.log(`   Companies affected: ${deletedCompanies.size}`)
  console.log(`   Remaining articles: ${remainingFiles.length}`)
  console.log(`   Reduction: ${((deletedCount / articles.length) * 100).toFixed(1)}%`)
  
  console.log('\n🏢 Priority companies kept:')
  const keptPriorityCompanies = [...new Set(priorityArticles.map(a => a.company))]
  console.log(`   ${keptPriorityCompanies.join(', ')}`)
  
  console.log('\n🗂️  Remember to regenerate sitemap and rebuild the app!')
  console.log('   Run: npm run generate-opportunities-sitemap')
}

// Run the script
if (require.main === module) {
  main().catch(console.error)
}

export default main
