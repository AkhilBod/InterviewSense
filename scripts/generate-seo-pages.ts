import fs from 'fs'
import path from 'path'
import { allCombinations, companies, jobRoles, skills } from './seo-data'

// Generate individual page files for each combination
async function generatePages() {
  const internshipsDir = path.join(process.cwd(), 'src/app/internships')
  
  // Ensure base directories exist
  if (!fs.existsSync(internshipsDir)) {
    fs.mkdirSync(internshipsDir, { recursive: true })
  }

  let generatedCount = 0
  
  // Generate pages for each combination
  for (const combo of allCombinations) {
    const pagePath = path.join(internshipsDir, combo.slug)
    
    // Create directory for the page
    if (!fs.existsSync(pagePath)) {
      fs.mkdirSync(pagePath, { recursive: true })
    }

    // Generate the page.tsx file
    const pageContent = generatePageContent(combo)
    const pageFile = path.join(pagePath, 'page.tsx')
    
    fs.writeFileSync(pageFile, pageContent)
    generatedCount++
    
    if (generatedCount % 100 === 0) {
      console.log(`Generated ${generatedCount} pages...`)
    }
  }

  // Generate index pages for companies
  for (const company of companies) {
    await generateCompanyIndexPage(company)
  }

  // Generate topic index pages  
  for (const skill of skills) {
    await generateTopicIndexPage(skill)
  }

  // Generate sitemap
  await generateSitemap()

  console.log(`✅ Generated ${generatedCount} total pages`)
  console.log(`📄 Generated ${companies.length} company index pages`)
  console.log(`🎯 Generated ${skills.length} topic index pages`)
  console.log(`🗺️ Generated sitemap.xml`)
}

function generatePageContent(combo: any) {
  // Find related pages (same company or role or skill)
  const relatedPages = allCombinations
    .filter(p => 
      p.slug !== combo.slug && (
        (p.company?.slug === combo.company?.slug) ||
        (p.role?.slug === combo.role?.slug) ||
        (p.skill?.slug === combo.skill?.slug)
      )
    )
    .slice(0, 6)

  return `import { Metadata } from 'next'
import { ProgrammaticSEOTemplate, generateMetadata, getQuestionsForPage } from '@/components/ProgrammaticSEOTemplate'

const pageData = ${JSON.stringify(combo, null, 2)}

export const metadata: Metadata = generateMetadata(pageData)

export default function ${combo.slug.split('-').map((word: string) => 
  word.charAt(0).toUpperCase() + word.slice(1)
).join('')}Page() {
  const questions = getQuestionsForPage(pageData)
  const relatedPages = ${JSON.stringify(relatedPages, null, 2)}

  return (
    <ProgrammaticSEOTemplate 
      data={pageData}
      questions={questions}
      relatedPages={relatedPages}
    />
  )
}
`
}

async function generateCompanyIndexPage(company: any) {
  const companyDir = path.join(process.cwd(), 'src/app/internships', company.slug)
  
  if (!fs.existsSync(companyDir)) {
    fs.mkdirSync(companyDir, { recursive: true })
  }

  // Find all pages for this company
  const companyPages = allCombinations.filter(p => p.company?.slug === company.slug)
  const rolePages = companyPages.filter(p => p.type === 'company-role')
  const skillPages = companyPages.filter(p => p.type === 'company-skill')

  const pageContent = `import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Building2, Code, Brain } from 'lucide-react'

export const metadata: Metadata = {
  title: '${company.name} Internship Interview Questions | CS Interview Prep - InterviewSense',
  description: 'Ace your ${company.name} internship interview with real questions and AI-powered practice. ${company.typical_questions}+ questions from actual ${company.name} interviews.',
  keywords: '${company.name} interview questions, ${company.name} internship, ${company.name} coding interview, ${company.name} software engineer intern',
}

export default function ${company.name}InterviewPage() {
  const rolePages = ${JSON.stringify(rolePages.slice(0, 12), null, 2)}
  const skillPages = ${JSON.stringify(skillPages.slice(0, 12), null, 2)}

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_50%)]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Building2 className="h-16 w-16 text-blue-500" />
              <h1 className="text-4xl md:text-6xl font-bold">
                <span className="text-blue-500">${company.name}</span> Interview Questions
              </h1>
            </div>
            
            <p className="text-xl text-zinc-400 mb-8 max-w-3xl mx-auto">
              Practice real ${company.name} internship interview questions. Get AI-powered feedback and land your dream CS internship at ${company.name}.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">${company.typical_questions}+</div>
                <div className="text-sm text-zinc-400">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">${company.difficulty}</div>
                <div className="text-sm text-zinc-400">Difficulty</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">${company.tier}</div>
                <div className="text-sm text-zinc-400">Company Tier</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">${company.locations.length}+</div>
                <div className="text-sm text-zinc-400">Locations</div>
              </div>
            </div>

            <Button
              asChild
              size="lg"
              className="text-lg px-10 py-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-full shadow-lg"
            >
              <Link href="/signup">
                Practice ${company.name} Questions Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Questions by Role */}
      <section className="py-16 bg-zinc-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            ${company.name} Questions by Role
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rolePages.map((page: any) => (
              <Card key={page.slug} className="bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Code className="h-8 w-8 text-green-500" />
                    <h3 className="text-lg font-bold text-white">{page.role.title}</h3>
                  </div>
                  <p className="text-zinc-400 text-sm mb-4">{page.description}</p>
                  <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                    <Link href={\`/internships/\${page.slug}\`}>
                      Practice Questions <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Questions by Topic */}
      <section className="py-16 bg-zinc-950">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            ${company.name} Questions by Topic
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skillPages.map((page: any) => (
              <Card key={page.slug} className="bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Brain className="h-8 w-8 text-purple-500" />
                    <h3 className="text-lg font-bold text-white">{page.skill.name}</h3>
                  </div>
                  <p className="text-zinc-400 text-sm mb-4">{page.description}</p>
                  <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                    <Link href={\`/internships/\${page.slug}\`}>
                      Practice Questions <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
`

  fs.writeFileSync(path.join(companyDir, 'page.tsx'), pageContent)
}

async function generateTopicIndexPage(skill: any) {
  const topicsDir = path.join(process.cwd(), 'src/app/internships/topics')
  const skillDir = path.join(topicsDir, skill.slug)
  
  if (!fs.existsSync(skillDir)) {
    fs.mkdirSync(skillDir, { recursive: true })
  }

  // Find all pages for this skill
  const skillPages = allCombinations.filter(p => p.skill?.slug === skill.slug)
  const companyPages = skillPages.filter(p => p.type === 'company-skill')
  const rolePages = skillPages.filter(p => p.type === 'role-skill')

  const pageContent = `import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Brain, Building2, Code } from 'lucide-react'

export const metadata: Metadata = {
  title: '${skill.name} Interview Questions for CS Internships | InterviewSense',
  description: 'Master ${skill.name} interview questions for CS internships. Practice with ${skill.question_count}+ real questions from top tech companies.',
  keywords: '${skill.name} interview questions, ${skill.name} coding interview, CS internship ${skill.name}, computer science ${skill.name}',
}

export default function ${skill.slug.split('-').map((word: string) => 
  word.charAt(0).toUpperCase() + word.slice(1)
).join('')}TopicPage() {
  const companyPages = ${JSON.stringify(companyPages.slice(0, 12), null, 2)}
  const rolePages = ${JSON.stringify(rolePages.slice(0, 12), null, 2)}

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Brain className="h-16 w-16 text-purple-500" />
              <h1 className="text-4xl md:text-6xl font-bold">
                <span className="text-purple-500">${skill.name}</span> Interview Questions
              </h1>
            </div>
            
            <p className="text-xl text-zinc-400 mb-8 max-w-3xl mx-auto">
              Master ${skill.name} for CS internship interviews. Practice ${skill.question_count}+ real questions with AI-powered feedback.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">${skill.question_count}+</div>
                <div className="text-sm text-zinc-400">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">${skill.difficulty}</div>
                <div className="text-sm text-zinc-400">Difficulty</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">${skill.category}</div>
                <div className="text-sm text-zinc-400">Category</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">${skill.topics.length}</div>
                <div className="text-sm text-zinc-400">Subtopics</div>
              </div>
            </div>

            <Button
              asChild
              size="lg"
              className="text-lg px-10 py-6 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-full shadow-lg"
            >
              <Link href="/signup">
                Practice ${skill.name} Questions <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Company-specific pages */}
      <section className="py-16 bg-zinc-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            ${skill.name} Questions by Company
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companyPages.map((page: any) => (
              <Card key={page.slug} className="bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Building2 className="h-8 w-8 text-blue-500" />
                    <h3 className="text-lg font-bold text-white">{page.company.name}</h3>
                  </div>
                  <p className="text-zinc-400 text-sm mb-4">{page.description}</p>
                  <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                    <Link href={\`/internships/\${page.slug}\`}>
                      Practice Questions <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Role-specific pages */}
      <section className="py-16 bg-zinc-950">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            ${skill.name} Questions by Role
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rolePages.map((page: any) => (
              <Card key={page.slug} className="bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Code className="h-8 w-8 text-green-500" />
                    <h3 className="text-lg font-bold text-white">{page.role.title}</h3>
                  </div>
                  <p className="text-zinc-400 text-sm mb-4">{page.description}</p>
                  <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                    <Link href={\`/internships/\${page.slug}\`}>
                      Practice Questions <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
`

  fs.writeFileSync(path.join(skillDir, 'page.tsx'), pageContent)
}

async function generateSitemap() {
  const urls = [
    'https://interviewsense.org',
    'https://interviewsense.org/internships',
    ...companies.map(c => `https://interviewsense.org/internships/${c.slug}`),
    ...skills.map(s => `https://interviewsense.org/internships/topics/${s.slug}`),
    ...allCombinations.map(c => `https://interviewsense.org/internships/${c.slug}`)
  ]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${url.includes('internships/') && !url.endsWith('/internships') ? '0.8' : '0.9'}</priority>
  </url>`).join('\n')}
</urlset>`

  fs.writeFileSync(path.join(process.cwd(), 'public/sitemap.xml'), sitemap)
}

// Run the generation
generatePages().catch(console.error)

export { generatePages }
