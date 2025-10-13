import fs from 'fs'
import path from 'path'

async function validateOpportunities() {
  const articlesDir = path.join(process.cwd(), 'generated-content', 'articles')
  
  try {
    const filenames = fs.readdirSync(articlesDir)
    const jsonFiles = filenames.filter(name => name.endsWith('.json'))
    
    console.log(`Found ${jsonFiles.length} opportunity articles`)
    
    // Validate a few random articles
    const sampleSize = Math.min(5, jsonFiles.length)
    const sampleFiles = jsonFiles.slice(0, sampleSize)
    
    console.log('\nValidating sample articles:')
    
    for (const filename of sampleFiles) {
      const filePath = path.join(articlesDir, filename)
      const content = fs.readFileSync(filePath, 'utf8')
      const article = JSON.parse(content)
      
      console.log(`\n✓ ${filename}`)
      console.log(`  Title: ${article.title}`)
      console.log(`  Description: ${article.metaDescription}`)
      console.log(`  Keywords: ${article.keywords.length} keywords`)
      console.log(`  Content length: ${article.content.length} characters`)
      console.log(`  URL: /opportunities/${article.slug}`)
      
      // Validate required fields
      const requiredFields = ['slug', 'title', 'metaDescription', 'keywords', 'content', 'structuredData', 'openGraph']
      const missingFields = requiredFields.filter(field => !article[field])
      
      if (missingFields.length > 0) {
        console.log(`  ⚠ Missing fields: ${missingFields.join(', ')}`)
      } else {
        console.log(`  ✓ All required fields present`)
      }
    }
    
    // Company analysis
    const companies = new Set()
    const locations = new Set()
    const roles = new Set()
    
    for (const filename of jsonFiles) {
      const filePath = path.join(articlesDir, filename)
      const content = fs.readFileSync(filePath, 'utf8')
      const article = JSON.parse(content)
      
      // Extract company from title
      const titleParts = article.title.split(' ')
      const company = titleParts[0]
      companies.add(company)
      
      // Extract role and location from content
      const lines = article.content.split('\n')
      const locationLine = lines.find((line: string) => line.startsWith('**Location:'))
      if (locationLine) {
        const location = locationLine.replace('**Location:**', '').trim()
        locations.add(location)
      }
      
      // Extract role from title
      const roleMatch = article.title.match(/^[A-Za-z0-9\s-]+\s(.+?)\s(Interview|Internship)/)
      if (roleMatch) {
        roles.add(roleMatch[1])
      }
    }
    
    console.log(`\n📊 Summary Statistics:`)
    console.log(`- Total opportunities: ${jsonFiles.length}`)
    console.log(`- Unique companies: ${companies.size}`)
    console.log(`- Unique locations: ${locations.size}`)
    console.log(`- Unique roles: ${roles.size}`)
    
    console.log(`\n🎯 Top 10 Companies:`)
    Array.from(companies).slice(0, 10).forEach(company => {
      console.log(`  - ${company}`)
    })
    
    console.log(`\n📍 Top 10 Locations:`)
    Array.from(locations).slice(0, 10).forEach(location => {
      console.log(`  - ${location}`)
    })
    
  } catch (error) {
    console.error('Error validating opportunities:', error)
  }
}

// Run validation
if (require.main === module) {
  validateOpportunities()
} 