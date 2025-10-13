import fs from 'fs'
import path from 'path'

interface InternshipOpportunity {
  company: string
  role: string
  location: string
  applicationUrl?: string
  simplifyUrl?: string
  age?: string
  notes?: string
  status?: 'open' | 'closed'
}

interface GeneratedArticle {
  slug: string
  title: string
  metaDescription: string
  keywords: string[]
  content: string
  structuredData: any
  openGraph: any
  lastUpdated: string
}

// Helper function to create a clean slug from company and role
function createSlug(company: string, role: string, location: string): string {
  const cleanCompany = company.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
  
  const cleanRole = role.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
  
  const cleanLocation = location.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .split('-')[0] // Take first part of location
  
  return `${cleanCompany}-${cleanRole}-internship-${cleanLocation}`.replace(/--+/g, '-')
}

// Helper function to extract company tier
function getCompanyTier(company: string): string {
  const faangCompanies = ['google', 'meta', 'amazon', 'apple', 'netflix', 'microsoft']
  const bigTechCompanies = ['salesforce', 'uber', 'airbnb', 'spotify', 'tesla', 'nvidia', 'adobe', 'paypal', 'intel']
  
  const lowerName = company.toLowerCase()
  
  if (faangCompanies.includes(lowerName)) {
    return 'FAANG'
  }
  if (bigTechCompanies.includes(lowerName)) {
    return 'Big Tech'
  }
  return 'Enterprise'
}

// Helper function to extract skills based on role
function extractSkills(role: string): string[] {
  const lowerRole = role.toLowerCase()
  
  if (lowerRole.includes('frontend') || lowerRole.includes('ui') || lowerRole.includes('web')) {
    return ['JavaScript', 'React', 'HTML/CSS', 'Web Development']
  }
  if (lowerRole.includes('backend') || lowerRole.includes('server') || lowerRole.includes('api')) {
    return ['Java', 'Python', 'Node.js', 'Database Design']
  }
  if (lowerRole.includes('data') || lowerRole.includes('analytics') || lowerRole.includes('ml') || lowerRole.includes('ai')) {
    return ['Python', 'SQL', 'Data Analysis', 'Machine Learning']
  }
  if (lowerRole.includes('mobile') || lowerRole.includes('ios') || lowerRole.includes('android')) {
    return ['Mobile Development', 'Swift/Kotlin', 'UI/UX', 'App Development']
  }
  if (lowerRole.includes('embedded') || lowerRole.includes('firmware') || lowerRole.includes('hardware')) {
    return ['C/C++', 'Embedded Systems', 'Hardware Integration', 'Real-time Systems']
  }
  if (lowerRole.includes('security') || lowerRole.includes('cybersecurity')) {
    return ['Cybersecurity', 'Network Security', 'Penetration Testing', 'Risk Assessment']
  }
  if (lowerRole.includes('devops') || lowerRole.includes('infrastructure') || lowerRole.includes('sre')) {
    return ['DevOps', 'Cloud Platforms', 'CI/CD', 'Infrastructure']
  }
  if (lowerRole.includes('qa') || lowerRole.includes('test') || lowerRole.includes('quality')) {
    return ['Quality Assurance', 'Test Automation', 'Bug Testing', 'Software Testing']
  }
  
  return ['Software Engineering', 'Problem Solving', 'Teamwork', 'Communication']
}

// Generate typical question count based on company tier
function getQuestionCount(tier: string): number {
  switch (tier) {
    case 'FAANG': return Math.floor(Math.random() * 100) + 300 // 300-400
    case 'Big Tech': return Math.floor(Math.random() * 80) + 250 // 250-330
    default: return Math.floor(Math.random() * 50) + 150 // 150-200
  }
}

// Generate difficulty based on company tier
function getDifficulty(tier: string): string {
  switch (tier) {
    case 'FAANG': return 'Hard'
    case 'Big Tech': return 'Medium-Hard'
    default: return 'Medium'
  }
}

// Generate sample questions based on role and company
function generateSampleQuestions(role: string, company: string, skills: string[]): string {
  const behavioralQuestions = [
    {
      category: 'Time Management',
      question: 'How do you handle tight deadlines and pressure?',
      difficulty: 'Medium',
      type: 'Behavioral',
      answer: `**Situation:** During finals week last semester, I had three major coding assignments due within 48 hours, plus two exams to study for. **Task:** I needed to manage my time effectively to complete everything without compromising quality. **Action:** I started by listing all tasks and estimating time for each. I prioritized based on due dates and complexity, then created a detailed schedule with specific time blocks. I eliminated distractions by working in the library, used the Pomodoro Technique for focused coding sessions, and took strategic breaks to avoid burnout. When I realized one assignment was taking longer than expected, I reached out to the TA for clarification rather than spending hours debugging alone. **Result:** I completed all assignments on time and performed well on my exams. This experience taught me the importance of planning, prioritization, and knowing when to seek help. I now proactively manage my schedule to avoid such situations, but I'm confident in my ability to perform under pressure when necessary.`
    },
    {
      category: 'Problem Solving',
      question: 'Describe a challenging project you worked on and how you overcame obstacles',
      difficulty: 'Medium',
      type: 'Behavioral',
      answer: `**Situation:** For my internship application portfolio, I decided to build a real-time chat application using technologies I'd never used before - Node.js, Socket.io, and MongoDB. **Task:** I had 3 weeks to complete it while managing coursework and a part-time job. **Action:** I broke the project into smaller milestones: basic server setup, user authentication, real-time messaging, and UI polish. When I got stuck on implementing WebSocket connections, I systematically researched documentation, watched tutorials, and posted specific questions on Stack Overflow. I also reached out to a senior student who had experience with similar projects. **Result:** I successfully completed the application, which helped me land my internship. The experience taught me how to learn new technologies quickly and the importance of asking for help when needed. I now use this same methodical approach for tackling unfamiliar technical challenges.`
    },
    {
      category: 'Teamwork',
      question: 'Tell me about a time when you had to work with a difficult team member',
      difficulty: 'Medium',
      type: 'Behavioral',
      answer: `**Situation:** During my CS capstone project, I was paired with a teammate who rarely attended meetings and didn't complete assigned tasks on time. **Task:** I needed to ensure our group project (a web application) stayed on track while maintaining team harmony. **Action:** I first approached them privately to understand if they were facing personal challenges. I discovered they were struggling with the React framework we chose. Instead of escalating to the professor, I offered to pair-program with them and created a shared study schedule. I also redistributed some tasks to better match everyone's strengths. **Result:** Our teammate became more engaged, contributed meaningfully to the project, and we delivered a successful application. I learned that apparent 'difficult' behavior often stems from underlying challenges, and proactive communication can resolve most team conflicts.`
    }
  ]

  const technicalQuestions = skills.includes('JavaScript') ? [
    {
      category: 'JavaScript Fundamentals',
      question: 'Implement a debounce function in JavaScript',
      difficulty: 'Medium',
      type: 'Technical',
      hint: 'Consider time/space complexity, edge cases, and explain your thought process clearly.'
    },
    {
      category: 'Async Programming',
      question: 'Create a custom Promise implementation',
      difficulty: 'Hard',
      type: 'Technical',
      hint: 'Consider time/space complexity, edge cases, and explain your thought process clearly.'
    },
    {
      category: 'Object-Oriented Programming',
      question: 'Build a simple event emitter class',
      difficulty: 'Medium',
      type: 'Technical',
      hint: 'Consider time/space complexity, edge cases, and explain your thought process clearly.'
    }
  ] : [
    {
      category: 'Data Structures',
      question: 'Implement a binary search tree with insert and search operations',
      difficulty: 'Medium',
      type: 'Technical',
      hint: 'Consider time/space complexity, edge cases, and explain your thought process clearly.'
    },
    {
      category: 'Algorithms',
      question: 'Find the longest substring without repeating characters',
      difficulty: 'Medium',
      type: 'Technical',
      hint: 'Consider time/space complexity, edge cases, and explain your thought process clearly.'
    },
    {
      category: 'System Design',
      question: 'Design a URL shortener service like bit.ly',
      difficulty: 'Hard',
      type: 'Technical',
      hint: 'Consider scalability, database design, and system architecture.'
    }
  ]

  let questionsHTML = ''
  
  // Add behavioral questions
  behavioralQuestions.forEach(q => {
    questionsHTML += `
${q.difficulty}${q.type}

${q.category}

### ${q.question}

#### Sample Answer (STAR Method):

${q.answer}

Practice This Question`
  })

  // Add technical questions
  technicalQuestions.forEach(q => {
    questionsHTML += `

${q.difficulty}${q.type}

${q.category}

### ${q.question}

💡 **Approach:** ${q.hint}

Practice This Question`
  })

  return questionsHTML
}

// Parse README content from SimplifyJobs repository
async function parseSimplifyJobsData(): Promise<InternshipOpportunity[]> {
  try {
    // Fetch the README content from SimplifyJobs repository
    const response = await fetch('https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/dev/README.md')
    const content = await response.text()
    
    // Extract table content
    const tableStart = content.indexOf('| Company')
    const tableEnd = content.indexOf('⬆️ Back to Top ⬆️')
    
    if (tableStart === -1 || tableEnd === -1) {
      console.log('Could not find table boundaries in README')
      return []
    }
    
    const tableContent = content.slice(tableStart, tableEnd)
    const lines = tableContent.split('\n').filter(line => line.trim().startsWith('|') && !line.includes('Company') && !line.includes('---'))
    
    const opportunities: InternshipOpportunity[] = []
    
    for (const line of lines.slice(0, 1000)) { // Limit to first 1000
      try {
        const columns = line.split('|').map(col => col.trim()).filter(col => col)
        
        if (columns.length >= 4) {
          const company = columns[0].replace(/\*\*(.*?)\*\*/g, '$1').replace(/\[(.*?)\]\(.*?\)/g, '$1').trim()
          const role = columns[1].trim()
          const location = columns[2].trim()
          const applicationCol = columns[3]
          
          let applicationUrl = '#'
          let simplifyUrl = ''
          let status: 'open' | 'closed' = 'open'
          let age = ''
          
          if (applicationCol.includes('🔒')) {
            status = 'closed'
          }
          
          const applyMatch = applicationCol.match(/\[Apply\]\((.*?)\)/)
          if (applyMatch) {
            applicationUrl = applyMatch[1]
          }
          
          const simplifyMatch = applicationCol.match(/\[Simplify\]\((.*?)\)/)
          if (simplifyMatch) {
            simplifyUrl = simplifyMatch[1]
          }
          
          if (columns.length > 4) {
            age = columns[4].trim()
          }
          
          opportunities.push({
            company,
            role,
            location,
            applicationUrl,
            simplifyUrl,
            status,
            age
          })
        }
      } catch (error) {
        console.error('Error parsing line:', line, error)
      }
    }
    
    return opportunities
  } catch (error) {
    console.error('Error fetching SimplifyJobs data:', error)
    return []
  }
}

// Parse README content from vanshb03 repository
async function parseVanshJobsData(): Promise<InternshipOpportunity[]> {
  try {
    // Fetch the README content from vanshb03 repository
    const response = await fetch('https://raw.githubusercontent.com/vanshb03/Summer2026-Internships/main/README.md')
    const content = await response.text()
    
    // Extract table content
    const tableStart = content.indexOf('| Company')
    const tableEnd = content.indexOf('⬆️ Back to Top ⬆️') || content.indexOf('## Additional Resources') || content.length
    
    if (tableStart === -1) {
      console.log('Could not find table boundaries in vanshb03 README')
      return []
    }
    
    const tableContent = content.slice(tableStart, tableEnd)
    const lines = tableContent.split('\n').filter(line => line.trim().startsWith('|') && !line.includes('Company') && !line.includes('---'))
    
    const opportunities: InternshipOpportunity[] = []
    
    for (const line of lines.slice(0, 1000)) { // Limit to first 1000
      try {
        const columns = line.split('|').map(col => col.trim()).filter(col => col)
        
        if (columns.length >= 4) {
          const company = columns[0].replace(/\*\*(.*?)\*\*/g, '$1').replace(/\[(.*?)\]\(.*?\)/g, '$1').trim()
          const role = columns[1].trim()
          const location = columns[2].trim()
          const applicationCol = columns[3]
          
          let applicationUrl = '#'
          let simplifyUrl = ''
          let status: 'open' | 'closed' = 'open'
          let age = ''
          
          if (applicationCol.includes('🔒') || applicationCol.includes('Closed')) {
            status = 'closed'
          }
          
          const applyMatch = applicationCol.match(/\[Apply\]\((.*?)\)/)
          if (applyMatch) {
            applicationUrl = applyMatch[1]
          }
          
          const simplifyMatch = applicationCol.match(/\[Simplify\]\((.*?)\)/)
          if (simplifyMatch) {
            simplifyUrl = simplifyMatch[1]
          }
          
          if (columns.length > 4) {
            age = columns[4].trim()
          }
          
          opportunities.push({
            company,
            role,
            location,
            applicationUrl,
            simplifyUrl,
            status,
            age
          })
        }
      } catch (error) {
        console.error('Error parsing line:', line, error)
      }
    }
    
    return opportunities
  } catch (error) {
    console.error('Error fetching vanshb03 data:', error)
    return []
  }
}

// Generate article for a single opportunity
function generateArticle(opportunity: InternshipOpportunity): GeneratedArticle {
  const slug = createSlug(opportunity.company, opportunity.role, opportunity.location)
  const title = `${opportunity.company} ${opportunity.role} Interview Questions`
  const metaDescription = `Ace your ${opportunity.company} ${opportunity.role} interview with AI-powered practice questions and feedback. Get ready for your ${opportunity.location} internship.`
  
  const tier = getCompanyTier(opportunity.company)
  const skills = extractSkills(opportunity.role)
  const questionCount = getQuestionCount(tier)
  const difficulty = getDifficulty(tier)
  
  // Minimal content - the ProgrammaticSEOTemplate generates the full UI
  const content = `**Location:** ${opportunity.location}
**Posted:** ${opportunity.age || '1mo ago'}

${opportunity.applicationUrl && opportunity.applicationUrl !== '#' ? `[Apply](${opportunity.applicationUrl})` : ''}
${opportunity.simplifyUrl ? `[Apply with Simplify](${opportunity.simplifyUrl})` : ''}`

  return {
    slug,
    title,
    metaDescription,
    keywords: [
      `${opportunity.company} interview`,
      `${opportunity.role} interview questions`,
      `${opportunity.company} internship`,
      'interview practice',
      'AI interview prep',
      `${opportunity.company} ${opportunity.role}`,
      `${skills[0]} interview questions`
    ],
    content,
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Article",
      "headline": title,
      "description": metaDescription,
      "author": {
        "@type": "Organization",
        "name": "InterviewSense"
      },
      "publisher": {
        "@type": "Organization",
        "name": "InterviewSense"
      },
      "datePublished": new Date().toISOString(),
      "url": `https://interviewsense.org/opportunities/${slug}`
    },
    openGraph: {
      title,
      description: metaDescription,
      url: `https://interviewsense.org/opportunities/${slug}`,
      type: "article",
      site_name: "InterviewSense"
    },
    lastUpdated: new Date().toISOString()
  }
}

// Main function
async function main() {
  console.log('Fetching opportunities from both Summer2026 repositories...')
  
  const [simplifyOpportunities, vanshOpportunities] = await Promise.all([
    parseSimplifyJobsData(),
    parseVanshJobsData()
  ])
  
  console.log(`Found ${simplifyOpportunities.length} opportunities from SimplifyJobs`)
  console.log(`Found ${vanshOpportunities.length} opportunities from vanshb03`)
  
  // Merge and deduplicate opportunities
  const allOpportunities = [...simplifyOpportunities, ...vanshOpportunities]
  const uniqueOpportunities = new Map<string, InternshipOpportunity>()
  
  for (const opportunity of allOpportunities) {
    const key = `${opportunity.company.toLowerCase()}-${opportunity.role.toLowerCase()}-${opportunity.location.toLowerCase()}`
    if (!uniqueOpportunities.has(key)) {
      uniqueOpportunities.set(key, opportunity)
    }
  }
  
  const opportunities = Array.from(uniqueOpportunities.values())
  console.log(`Total unique opportunities: ${opportunities.length}`)
  
  if (opportunities.length === 0) {
    console.log('No opportunities found, exiting...')
    return
  }
  
  const articlesDir = path.join(process.cwd(), 'generated-content', 'articles')
  if (!fs.existsSync(articlesDir)) {
    fs.mkdirSync(articlesDir, { recursive: true })
  }
  
  console.log('Generating articles...')
  
  for (const opportunity of opportunities) {
    try {
      const article = generateArticle(opportunity)
      const filePath = path.join(articlesDir, `${article.slug}.json`)
      
      fs.writeFileSync(filePath, JSON.stringify(article, null, 2))
      console.log(`Generated: ${article.slug}`)
    } catch (error) {
      console.error(`Error generating article for ${opportunity.company} ${opportunity.role}:`, error)
    }
  }
  
  console.log(`\nGeneration complete! Generated ${opportunities.length} articles`)
}

// Run the script
if (require.main === module) {
  main().catch(console.error)
}

export { parseSimplifyJobsData, parseVanshJobsData, generateArticle }