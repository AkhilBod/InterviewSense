import { Metadata } from 'next'
import { ProgrammaticSEOTemplate, generateMetadata as generateSEOMetadata, getQuestionsForPage } from '@/components/ProgrammaticSEOTemplate'
import fs from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'

interface PageProps {
  params: {
    slug: string;
  };
}

// Generate static params for build time generation
export async function generateStaticParams() {
  try {
    const articlesDir = path.join(process.cwd(), 'generated-content', 'articles')
    const filenames = fs.readdirSync(articlesDir)
    
    return filenames
      .filter(name => name.endsWith('.json'))
      .map((filename) => ({
        slug: filename.replace('.json', '')
      }))
  } catch {
    return []
  }
}

// Load article data from JSON file and convert to Node.js template format
function getPageData(slug: string) {
  try {
    const filePath = path.join(process.cwd(), 'generated-content', 'articles', `${slug}.json`)
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const article = JSON.parse(fileContents)
    
    // Convert article data to Node.js template format matching demo script structure
    const companyName = extractCompanyName(slug)
    const roleTitle = extractRoleTitle(slug, article.title || '')
    
    return {
      type: "company-role",
      title: `${companyName} ${roleTitle} Interview Questions`,
      slug: article.slug || slug,
      company: {
        name: companyName,
        slug: extractCompanySlug(slug),
        tier: getTierForCompany(companyName),
        locations: extractLocations(article.content || ''),
        hiring_seasons: ["Summer", "Fall", "Spring"],
        typical_questions: getTypicalQuestions(companyName),
        difficulty: getDifficultyForCompany(companyName),
        focus_areas: getFocusAreas(companyName)
      },
      role: {
        title: roleTitle,
        slug: extractRoleSlug(slug),
        description: article.metaDescription || `${roleTitle} position with hands-on technical experience`,
        skills: extractSkills(article.content || '', roleTitle),
        difficulty: "Medium"
      },
      keyword: article.keywords?.[0] || `${companyName} ${roleTitle} interview questions`,
      description: article.metaDescription || `Ace your ${companyName} ${roleTitle} interview with real questions and AI-powered practice.`,
      internship: {
        applyUrl: extractApplyUrl(article.content || ''),
        simplifyUrl: `https://simplify.jobs/c/${extractCompanySlug(slug)}`,
        postedDays: extractPostedDays(article.content || ''),
        location: extractMainLocation(article.content || '')
      }
    }
  } catch {
    return null
  }
}

// Helper functions to extract data from slug and content
function extractCompanyName(slug: string): string {
  const parts = slug.split('-')
  const companyPart = parts[0]
  return companyPart.charAt(0).toUpperCase() + companyPart.slice(1)
}

function extractCompanySlug(slug: string): string {
  return slug.split('-')[0]
}

function extractRoleTitle(slug: string, title: string): string {
  if (title.includes('Intern')) {
    const match = title.match(/([^:]+Intern[^,]*)/i)
    return match ? match[1].trim() : 'Software Engineering Intern'
  }
  return 'Software Engineering Intern'
}

function extractRoleSlug(slug: string): string {
  const parts = slug.split('-')
  return parts.slice(1, -1).join('-') || 'software-engineering-intern'
}

function extractLocations(content: string): string[] {
  const locationMatches = content.match(/(?:located in|Location:|in )([A-Z][a-z]+(?: [A-Z][a-z]+)*(?:, [A-Z]{2})?)/g)
  if (locationMatches) {
    return locationMatches.map(match => 
      match.replace(/(?:located in|Location:|in )/i, '').trim()
    ).slice(0, 3)
  }
  return ['Remote', 'USA']
}

function extractMainLocation(content: string): string {
  const locations = extractLocations(content)
  return locations[0] || 'Remote'
}

function extractSkills(content: string, roleTitle: string): string[] {
  const defaultSkills = ['Software Engineering', 'Problem Solving', 'Teamwork', 'Communication']
  
  // Role-based skill extraction
  if (roleTitle.toLowerCase().includes('frontend') || roleTitle.toLowerCase().includes('ui')) {
    return ['JavaScript', 'React', 'HTML/CSS', 'Web Development']
  }
  if (roleTitle.toLowerCase().includes('data') || roleTitle.toLowerCase().includes('analytics')) {
    return ['Python', 'SQL', 'Data Analysis', 'Statistics']
  }
  if (roleTitle.toLowerCase().includes('mobile') || roleTitle.toLowerCase().includes('ios') || roleTitle.toLowerCase().includes('android')) {
    return ['Mobile Development', 'Swift/Kotlin', 'UI/UX', 'App Store Optimization']
  }
  if (roleTitle.toLowerCase().includes('embedded') || roleTitle.toLowerCase().includes('firmware')) {
    return ['C/C++', 'Embedded Systems', 'Hardware Integration', 'Real-time Systems']
  }
  if (roleTitle.toLowerCase().includes('ml') || roleTitle.toLowerCase().includes('ai') || roleTitle.toLowerCase().includes('machine learning')) {
    return ['Machine Learning', 'Python', 'TensorFlow/PyTorch', 'Statistics']
  }
  
  // Content-based skill extraction
  if (content.includes('JavaScript') || content.includes('React')) {
    return ['JavaScript', 'React', 'Node.js', 'HTML/CSS']
  }
  if (content.includes('Python')) {
    return ['Python', 'Data Structures', 'Algorithms', 'Machine Learning']
  }
  if (content.includes('Java')) {
    return ['Java', 'Object-Oriented Programming', 'Spring', 'SQL']
  }
  
  return defaultSkills
}

function getTierForCompany(companyName: string): string {
  const faangCompanies = ['google', 'meta', 'amazon', 'apple', 'netflix', 'microsoft']
  const bigTechCompanies = ['salesforce', 'uber', 'airbnb', 'spotify', 'tesla', 'nvidia', 'adobe', 'paypal', 'intel']
  
  const lowerName = companyName.toLowerCase()
  
  if (faangCompanies.includes(lowerName)) {
    return 'FAANG'
  }
  if (bigTechCompanies.includes(lowerName)) {
    return 'Big Tech'
  }
  return 'Enterprise'
}

function getTypicalQuestions(companyName: string): number {
  const lowerName = companyName.toLowerCase()
  
  if (['google', 'meta', 'amazon'].includes(lowerName)) {
    return 350
  }
  if (['microsoft', 'apple', 'netflix'].includes(lowerName)) {
    return 320
  }
  if (['salesforce', 'uber', 'airbnb'].includes(lowerName)) {
    return 280
  }
  return 220
}

function getDifficultyForCompany(companyName: string): string {
  const hardCompanies = ['google', 'meta', 'apple', 'netflix']
  const mediumHardCompanies = ['amazon', 'microsoft', 'salesforce', 'uber']
  
  const lowerName = companyName.toLowerCase()
  
  if (hardCompanies.includes(lowerName)) {
    return 'Hard'
  }
  if (mediumHardCompanies.includes(lowerName)) {
    return 'Medium-Hard'
  }
  return 'Medium'
}

function getFocusAreas(companyName: string): string[] {
  const lowerName = companyName.toLowerCase()
  
  if (lowerName === 'amazon') {
    return ['Leadership Principles', 'Algorithms', 'System Design']
  }
  if (lowerName === 'google') {
    return ['Algorithms', 'System Design', 'Behavioral']
  }
  if (lowerName === 'meta') {
    return ['Data Structures', 'System Design', 'Behavioral']
  }
  if (lowerName === 'apple') {
    return ['System Design', 'Coding', 'Product Thinking']
  }
  if (lowerName === 'microsoft') {
    return ['Algorithms', 'System Design', 'Behavioral']
  }
  
  return ['Software Development', 'System Design', 'Behavioral']
}

function extractApplyUrl(content: string): string {
  // Look for apply links in content
  const applyMatch = content.match(/\[Apply[^\]]*\]\(([^)]+)\)/i)
  if (applyMatch && applyMatch[1] !== '#') {
    return applyMatch[1]
  }
  return '#'
}

function extractPostedDays(content: string): string {
  const postedMatch = content.match(/\*\*Posted:\*\*\s*([^|]+)/i)
  if (postedMatch) {
    return postedMatch[1].trim()
  }
  return '1mo ago'
}

// Generate metadata for each page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const pageData = getPageData(params.slug)

  if (!pageData) {
    return {
      title: 'Internship Not Found',
      description: 'The requested internship article could not be found.'
    }
  }

  return generateSEOMetadata(pageData)
}

export default function OpportunityPage({ params }: PageProps) {
  const pageData = getPageData(params.slug)

  if (!pageData) {
    notFound()
  }

  const questions = getQuestionsForPage(pageData)
  const relatedPages: any[] = [
    // Related pages would be populated here based on company/role similarity
  ]

  return (
    <ProgrammaticSEOTemplate 
      data={pageData}
      questions={questions}
      relatedPages={relatedPages}
    />
  )
}
