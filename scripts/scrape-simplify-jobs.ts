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

// Generate comprehensive article content
function generateArticleContent(opportunity: InternshipOpportunity): string {
  const skills = extractSkills(opportunity.role)
  const tier = getCompanyTier(opportunity.company)
  
  return `# ${opportunity.company} ${opportunity.role} Internship - Summer 2025

Are you looking for a ${opportunity.role.toLowerCase()} internship at ${opportunity.company}? This comprehensive guide covers everything you need to know about applying for the **${opportunity.company} ${opportunity.role} internship** in ${opportunity.location} for Summer 2025.

**Location:** ${opportunity.location}
**Company Tier:** ${tier}
**Application Status:** ${opportunity.status === 'closed' ? 'Currently Closed' : 'Open for Applications'}

This internship opportunity is part of the Software Engineering field and offers valuable hands-on experience at ${tier === 'FAANG' ? 'one of the most prestigious technology companies' : tier === 'Big Tech' ? 'a leading technology company' : 'an innovative company'}.

## About the ${opportunity.role} Internship at ${opportunity.company}

The ${opportunity.role} internship at ${opportunity.company} offers students an exceptional opportunity to gain real-world experience in software development and engineering. As an intern, you'll work alongside experienced professionals on meaningful projects that directly impact the company's success.

### What You'll Do:
- Collaborate with cross-functional teams on software projects
- Apply theoretical knowledge to practical, real-world challenges
- Work with technologies including: ${skills.join(', ')}
- Participate in code reviews, design discussions, and team meetings
- Contribute to ${opportunity.company}'s innovative technology solutions
- Receive mentorship from senior engineers and industry experts

### Program Highlights:
- Duration: Summer 2025 (typically 10-12 weeks)
- Location: ${opportunity.location}
- Competitive compensation and benefits
- Networking opportunities with industry professionals
- Potential for full-time offer upon graduation
- Hands-on experience with cutting-edge technology

## Application Requirements and Process

### How to Apply
${opportunity.applicationUrl && opportunity.applicationUrl !== '#' ? `[Apply directly here](${opportunity.applicationUrl})` : 'The application for this position is currently open.'}
${opportunity.simplifyUrl ? `\n[Apply with Simplify](${opportunity.simplifyUrl})` : ''}

### Typical Requirements:
- Currently enrolled in a Computer Science, Engineering, or related program
- Expected graduation date between December 2025 and June 2027
- Strong programming fundamentals in relevant languages
- Previous internship or project experience (preferred)
- Excellent problem-solving and communication skills
- Ability to work collaboratively in a team environment
- Experience with: ${skills.join(', ')}

### Application Materials:
- Updated resume highlighting relevant coursework and projects
- Cover letter tailored to ${opportunity.company} and this specific role
- Academic transcripts (may be required)
- Portfolio or GitHub repository showcasing your work
- References from professors or previous employers

### Application Tips:
1. **Tailor your resume** to highlight ${skills[0].toLowerCase()} experience
2. **Research ${opportunity.company}** thoroughly and mention specific projects or values
3. **Showcase relevant projects** that demonstrate your technical abilities
4. **Apply early** - many companies review applications on a rolling basis
5. **Follow up** appropriately after submitting your application

## ${opportunity.company} Company Overview

${opportunity.company} is ${tier === 'FAANG' ? 'a leading technology giant known for innovation and excellence' : tier === 'Big Tech' ? 'a prominent technology company known for innovation and excellence' : 'an innovative technology company'} in the software space. The company offers interns the opportunity to work on cutting-edge projects while building valuable skills and professional networks.

### Why Choose ${opportunity.company}?
- **Innovation:** Work on projects that push the boundaries of technology
- **Mentorship:** Learn from experienced professionals in your field
- **Growth:** Develop both technical and professional skills
- **Impact:** Contribute to products and services used by ${tier === 'FAANG' ? 'billions' : tier === 'Big Tech' ? 'millions' : 'thousands'}
- **Culture:** Experience a collaborative and inclusive work environment
- **Career Development:** Access to training, workshops, and career guidance

### Internship Program Benefits:
- Competitive hourly compensation
- Housing stipend or corporate housing (location dependent)
- Health and wellness benefits
- Professional development opportunities
- Networking events and social activities
- Potential for return offers and full-time employment

## Location: ${opportunity.location}

This internship is located in **${opportunity.location}**, offering interns the opportunity to experience working in ${opportunity.location.includes('Remote') ? 'a flexible remote environment' : 'a dynamic tech hub'}.

### About Working in ${opportunity.location.split(',')[0]}:
${opportunity.location.includes('Remote') ? 
`- Flexibility to work from anywhere
- Access to virtual collaboration tools
- Work-life balance opportunities
- No commuting required
- Global team collaboration experience` :
`- Access to a thriving tech ecosystem and networking opportunities
- Vibrant cultural scene and recreational activities
- Public transportation and commuting options
- Cost of living considerations for interns
- Housing resources and recommendations`}

### Workplace Environment:
- Modern office facilities with state-of-the-art technology
- Collaborative workspaces designed for innovation
- On-site amenities and employee perks
- Flexible work arrangements (policies vary by company)
- Health and safety protocols

*Note: Some positions may offer remote or hybrid work options. Check with ${opportunity.company} for specific arrangements.*

## Technical Skills and Technologies

As a ${opportunity.role} intern at ${opportunity.company}, you'll work with a variety of technologies and develop skills in:

### Primary Technologies:
${skills.map(skill => `- **${skill}:** Essential for this role`).join('\n')}

### Additional Skills You'll Develop:
- Version control systems (Git)
- Agile development methodologies
- Code review and testing practices
- Documentation and technical writing
- Cross-functional collaboration
- Project management basics

## Tips for Landing This Internship

### Technical Preparation:
1. **Review fundamentals** in data structures, algorithms, and system design
2. **Practice coding** on platforms like LeetCode, HackerRank, or Codewars
3. **Build projects** that demonstrate your skills in ${skills[0]} and ${skills[1]}
4. **Contribute to open source** projects to show collaboration skills
5. **Learn ${opportunity.company}'s tech stack** through online resources

### Interview Preparation:
- **Technical interviews:** Expect questions on data structures, algorithms, and ${skills[0]}
- **Behavioral interviews:** Prepare STAR method responses for common questions
- **Company research:** Understand ${opportunity.company}'s mission, values, and recent news
- **Mock interviews:** Practice with peers, career services, or online platforms
- **Questions to ask:** Prepare thoughtful questions about the role and company culture

### Standing Out as a Candidate:
- **Demonstrate passion** for ${skills[0].toLowerCase()} and ${opportunity.company}'s work
- **Show impact** in your previous experiences and projects
- **Highlight leadership** experience and teamwork abilities
- **Express curiosity** and eagerness to learn
- **Communicate clearly** both verbally and in writing

## Similar Internship Opportunities

If you're interested in this ${opportunity.role} position, you might also want to explore these similar opportunities:

### Other ${skills[0]} Internships:
- Similar roles at companies in ${opportunity.location}
- ${opportunity.role} positions at other ${tier.toLowerCase()} companies
- Related roles in ${skills[1]} and ${skills[2]}

### Expanding Your Search:
- **Different locations:** Consider remote or other city options
- **Company size:** Look at startups, mid-size companies, and corporations
- **Role variations:** Explore related positions that match your skills
- **Industry focus:** Consider different sectors that need ${skills[0].toLowerCase()} talent

## Application Timeline and Deadlines

### Application Process Timeline:
- Applications typically reviewed on a rolling basis
- Early applications often receive faster responses
${opportunity.age ? `- **Posted:** ${opportunity.age}` : ''}

**Typical Interview Process:**
1. **Resume screening** (1-2 weeks after application)
2. **Phone/video screening** (30-45 minutes)
3. **Technical interview(s)** (1-2 rounds, 45-60 minutes each)
4. **Final round interviews** (may include behavioral and technical components)
5. **Decision and offer** (1-2 weeks after final interview)

### Key Dates to Remember:
- **Early applications:** Best chances for interview consideration
- **Interview seasons:** Most active from January through April
- **Decision timeline:** Offers typically made by March-May
- **Internship start:** Most Summer 2025 programs begin in June

## Frequently Asked Questions

**Q: What is the duration of this internship?**
A: Most Summer 2025 internships run for 10-12 weeks, typically from June through August.

**Q: Is this a paid internship?**
A: Yes, ${tier === 'FAANG' ? 'FAANG companies typically offer highly competitive compensation' : tier === 'Big Tech' ? 'big tech companies typically offer competitive compensation' : 'most technology internships are paid positions'}.

**Q: What year students can apply?**
A: Most internships are open to undergraduate and graduate students, typically juniors and seniors.

**Q: What programming languages should I know?**
A: Based on this role, focus on: ${skills.slice(0, 3).join(', ')}

**Q: How competitive is this internship?**
A: ${tier === 'FAANG' ? 'Extremely competitive - thousands of applications for limited spots' : tier === 'Big Tech' ? 'Highly competitive with strong technical requirements' : 'Competitive, but achievable with proper preparation'}.

## Conclusion

The ${opportunity.company} ${opportunity.role} internship represents an excellent opportunity to gain valuable experience while working at ${tier === 'FAANG' ? 'one of the world\'s most prestigious technology companies' : 'a leading technology company'}. Don't miss this opportunity to apply and take the first step toward launching your career in tech.

Remember to:
- **Apply early** when positions become available
- **Tailor your application** to ${opportunity.company} specifically
- **Prepare thoroughly** for the interview process focusing on ${skills[0]}
- **Network actively** within the tech community
- **Keep developing** your technical skills in ${skills.join(', ')}

Good luck with your application! The tech industry offers incredible opportunities for motivated students who are willing to put in the effort to prepare and apply strategically.

${opportunity.applicationUrl && opportunity.applicationUrl !== '#' ? `\n[Apply Now](${opportunity.applicationUrl})` : ''}
${opportunity.simplifyUrl ? `\n[Apply with Simplify](${opportunity.simplifyUrl})` : ''}`
}

// Parse README content from SimplifyJobs repository
async function parseSimplifyJobsData(): Promise<InternshipOpportunity[]> {
  try {
    // Fetch the README content from SimplifyJobs repository
    const response = await fetch('https://raw.githubusercontent.com/SimplifyJobs/Summer2025-Internships/dev/README.md')
    const content = await response.text()
    
    // Extract table content (everything after "| Company" and before "⬆️ Back to Top")
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
          
          // Extract application URL
          let applicationUrl = '#'
          let simplifyUrl = ''
          let status: 'open' | 'closed' = 'open'
          let age = ''
          
          if (applicationCol.includes('🔒')) {
            status = 'closed'
          }
          
          // Extract application URL
          const applyMatch = applicationCol.match(/\[Apply\]\((.*?)\)/)
          if (applyMatch) {
            applicationUrl = applyMatch[1]
          }
          
          // Extract Simplify URL
          const simplifyMatch = applicationCol.match(/\[Simplify\]\((.*?)\)/)
          if (simplifyMatch) {
            simplifyUrl = simplifyMatch[1]
          }
          
          // Extract age if present
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

// Generate article for a single opportunity
function generateArticle(opportunity: InternshipOpportunity): GeneratedArticle {
  const slug = createSlug(opportunity.company, opportunity.role, opportunity.location)
  const title = `${opportunity.company} ${opportunity.role} Interview Questions & Practice`
  const metaDescription = `Ace your ${opportunity.company} ${opportunity.role} interview with AI-powered practice questions and feedback. Get ready for your ${opportunity.location} internship.`
  
  const content = `# ${opportunity.company} ${opportunity.role} Interview Preparation

Prepare for your ${opportunity.company} ${opportunity.role} internship interview with comprehensive practice questions and AI-powered feedback.

**Location:** ${opportunity.location}
**Application Status:** ${opportunity.status === 'closed' ? 'Currently Closed' : 'Open for Applications'}

## Interview Practice Features

- Real interview questions from ${opportunity.company}
- AI-powered feedback and scoring
- Technical and behavioral question practice
- Company-specific preparation tips
- Industry insights and trends

## About This Opportunity

${opportunity.company} is offering a ${opportunity.role} internship position in ${opportunity.location}. This is an excellent opportunity to gain hands-on experience in software engineering.

${opportunity.applicationUrl && opportunity.applicationUrl !== '#' ? `[Apply Here](${opportunity.applicationUrl})` : ''}
${opportunity.simplifyUrl ? `\n[Apply with Simplify](${opportunity.simplifyUrl})` : ''}

## Interview Preparation Tips

1. Research ${opportunity.company}'s products and mission
2. Practice coding problems and system design
3. Prepare behavioral examples using the STAR method
4. Review your resume and be ready to discuss projects
5. Prepare thoughtful questions about the role and company

## Start Your Interview Practice

Use our AI-powered interview practice tool to prepare for your ${opportunity.company} interview and increase your chances of success.`

  return {
    slug,
    title,
    metaDescription,
    keywords: [
      `${opportunity.company} interview`,
      `${opportunity.role} interview questions`,
      `${opportunity.company} internship`,
      'interview practice',
      'AI interview prep'
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

// Main function to scrape and generate articles
async function main() {
  console.log('Fetching opportunities from SimplifyJobs repository...')
  
  const opportunities = await parseSimplifyJobsData()
  console.log(`Found ${opportunities.length} opportunities`)
  
  if (opportunities.length === 0) {
    console.log('No opportunities found, exiting...')
    return
  }
  
  // Create directories if they don't exist
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
  
  // Generate summary data
  const summaryData = {
    totalOpportunities: opportunities.length,
    companies: Array.from(new Set(opportunities.map(o => o.company))).sort(),
    locations: Array.from(new Set(opportunities.map(o => o.location))).sort(),
    roles: Array.from(new Set(opportunities.map(o => o.role))).sort(),
    lastUpdated: new Date().toISOString()
  }
  
  const dataDir = path.join(process.cwd(), 'generated-content', 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  
  fs.writeFileSync(path.join(dataDir, 'latest.json'), JSON.stringify(summaryData, null, 2))
  
  console.log(`\nGeneration complete!`)
  console.log(`- Generated ${opportunities.length} articles`)
  console.log(`- Companies: ${summaryData.companies.length}`)
  console.log(`- Unique locations: ${summaryData.locations.length}`)
  console.log(`- Unique roles: ${summaryData.roles.length}`)
}

// Run the script
if (require.main === module) {
  main().catch(console.error)
}

export { parseSimplifyJobsData, generateArticle } 