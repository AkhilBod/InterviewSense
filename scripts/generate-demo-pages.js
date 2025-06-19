#!/usr/bin/env node

// Simple page generator for demonstrating programmatic SEO
console.log('🚀 Starting programmatic SEO page generation...')

const fs = require('fs')
const path = require('path')

// Sample data (simplified from the full TypeScript version)
const companies = [
  { 
    name: 'Google', 
    slug: 'google', 
    tier: 'FAANG', 
    typical_questions: 350, 
    difficulty: 'Hard',
    locations: ['Mountain View', 'New York', 'Seattle', 'Austin'],
    hiring_seasons: ['Summer', 'Fall', 'Spring'],
    focus_areas: ['Algorithms', 'System Design', 'Behavioral']
  },
  { 
    name: 'Meta', 
    slug: 'meta', 
    tier: 'FAANG', 
    typical_questions: 320, 
    difficulty: 'Hard',
    locations: ['Menlo Park', 'New York', 'Seattle', 'Austin'],
    hiring_seasons: ['Summer', 'Fall'],
    focus_areas: ['Data Structures', 'System Design', 'Behavioral']
  },
  { 
    name: 'Amazon', 
    slug: 'amazon', 
    tier: 'FAANG', 
    typical_questions: 400, 
    difficulty: 'Medium-Hard',
    locations: ['Seattle', 'New York', 'Austin', 'Boston'],
    hiring_seasons: ['Summer', 'Fall', 'Spring'],
    focus_areas: ['Leadership Principles', 'Algorithms', 'System Design']
  },
  { 
    name: 'Microsoft', 
    slug: 'microsoft', 
    tier: 'Big Tech', 
    typical_questions: 340, 
    difficulty: 'Medium-Hard',
    locations: ['Redmond', 'New York', 'Austin', 'San Francisco'],
    hiring_seasons: ['Summer', 'Fall', 'Spring'],
    focus_areas: ['Algorithms', 'System Design', 'Behavioral']
  },
  { 
    name: 'Apple', 
    slug: 'apple', 
    tier: 'FAANG', 
    typical_questions: 280, 
    difficulty: 'Hard',
    locations: ['Cupertino', 'Austin', 'New York'],
    hiring_seasons: ['Summer', 'Fall'],
    focus_areas: ['System Design', 'Coding', 'Product Thinking']
  }
]

const roles = [
  { 
    title: 'Software Engineer Intern', 
    slug: 'software-engineer-intern', 
    description: 'Entry-level software development positions',
    skills: ['Data Structures', 'Algorithms', 'System Design', 'Coding'],
    difficulty: 'Medium'
  },
  { 
    title: 'Frontend Developer Intern', 
    slug: 'frontend-developer-intern', 
    description: 'Frontend web development internships',
    skills: ['JavaScript', 'React', 'HTML/CSS', 'Web Development'],
    difficulty: 'Medium'
  },
  { 
    title: 'Data Science Intern', 
    slug: 'data-science-intern', 
    description: 'Data analysis and machine learning internships',
    skills: ['Statistics', 'Python', 'Machine Learning', 'SQL'],
    difficulty: 'Medium-Hard'
  },
  { 
    title: 'SDE Intern', 
    slug: 'sde-intern', 
    description: 'Software Development Engineer internship positions',
    skills: ['Data Structures', 'Algorithms', 'System Design', 'Object-Oriented Programming'],
    difficulty: 'Medium-Hard'
  }
]

const skills = [
  { 
    name: 'Data Structures', 
    slug: 'data-structures', 
    category: 'Technical',
    difficulty: 'Medium',
    topics: ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Hash Tables', 'Stacks', 'Queues'],
    question_count: 120 
  },
  { 
    name: 'Algorithms', 
    slug: 'algorithms', 
    category: 'Technical',
    difficulty: 'Medium-Hard',
    topics: ['Sorting', 'Searching', 'Dynamic Programming', 'Greedy', 'Graph Algorithms'],
    question_count: 150 
  },
  { 
    name: 'System Design', 
    slug: 'system-design', 
    category: 'Technical',
    difficulty: 'Hard',
    topics: ['Scalability', 'Load Balancing', 'Databases', 'Caching', 'Microservices'],
    question_count: 80 
  },
  { 
    name: 'JavaScript', 
    slug: 'javascript', 
    category: 'Technical',
    difficulty: 'Medium',
    topics: ['ES6+', 'Async Programming', 'DOM Manipulation', 'Frameworks', 'Testing'],
    question_count: 80 
  }
]

// Generate combinations
const combinations = []

// Company + Role combinations (limit to first 3 companies for demo)
companies.slice(0, 3).forEach(company => {
  roles.slice(0, 2).forEach(role => {
    combinations.push({
      type: 'company-role',
      title: `${company.name} ${role.title} Interview Questions`,
      slug: `${company.slug}-${role.slug}`,
      company,
      role,
      description: `Ace your ${company.name} ${role.title} interview with real questions and AI-powered practice.`
    })
  })
})

// Company + Skill combinations (limit for demo)
companies.slice(0, 2).forEach(company => {
  skills.slice(0, 2).forEach(skill => {
    combinations.push({
      type: 'company-skill', 
      title: `${company.name} ${skill.name} Interview Questions`,
      slug: `${company.slug}-${skill.slug}`,
      company,
      skill,
      description: `Master ${skill.name} questions asked at ${company.name} interviews.`
    })
  })
})

console.log(`📊 Generated ${combinations.length} page combinations`)

// Create directories and pages
const internshipsDir = path.join(process.cwd(), 'src/app/internships')

combinations.forEach((combo, index) => {
  const pageDir = path.join(internshipsDir, combo.slug)
  
  // Create directory
  if (!fs.existsSync(pageDir)) {
    fs.mkdirSync(pageDir, { recursive: true })
  }

const pageContent = `import { Metadata } from 'next'
import { ProgrammaticSEOTemplate, generateMetadata, getQuestionsForPage } from '@/components/ProgrammaticSEOTemplate'

const pageData = ${JSON.stringify(combo, null, 2)}

export const metadata: Metadata = generateMetadata(pageData)

export default function ${combo.slug.split('-').map(word => 
  word.charAt(0).toUpperCase() + word.slice(1)
).join('')}Page() {
  const questions = getQuestionsForPage(pageData)
  const relatedPages = [
    // Related pages would be populated here
  ]

  return (
    <ProgrammaticSEOTemplate 
      data={pageData}
      questions={questions}
      relatedPages={relatedPages}
    />
  )
}
`

  // Write page file
  const pageFile = path.join(pageDir, 'page.tsx')
  fs.writeFileSync(pageFile, pageContent)
  
  console.log(`✅ Generated: /internships/${combo.slug}`)
})

// Generate a simple sitemap
const sitemapUrls = [
  'https://interviewsense.org',
  'https://interviewsense.org/internships',
  ...combinations.map(c => `https://interviewsense.org/internships/${c.slug}`)
]

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(url => `  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`

fs.writeFileSync(path.join(process.cwd(), 'public/sitemap.xml'), sitemap)

console.log('🗺️ Generated sitemap.xml')
console.log(`🎉 Success! Generated ${combinations.length} SEO-optimized pages`)
console.log('\n📋 Sample URLs created:')
combinations.slice(0, 5).forEach(combo => {
  console.log(`   • /internships/${combo.slug}`)
})
console.log('\n💡 Each page includes:')
console.log('   • Targeted long-tail keywords')
console.log('   • "Practice These Programming Questions" CTA buttons')
console.log('   • AI-powered question samples')  
console.log('   • Company/role-specific content')
console.log('   • Internal linking for SEO')
console.log('   • Schema.org structured data')
