import { Metadata } from 'next'
import Link from 'next/link'
import fs from 'fs'
import path from 'path'

export const metadata: Metadata = {
  title: 'Interview Opportunities | InterviewSense',
  description: 'Browse through hundreds of tech internship interview questions and practice opportunities from top companies.',
  openGraph: {
    title: 'Interview Opportunities | InterviewSense',
    description: 'Browse through hundreds of tech internship interview questions and practice opportunities from top companies.',
    url: 'https://interviewsense.org/opportunities',
    siteName: 'InterviewSense',
    type: 'website',
  },
}

function getOpportunities() {
  try {
    const articlesDir = path.join(process.cwd(), 'generated-content', 'articles')
    const filenames = fs.readdirSync(articlesDir)
    
    return filenames
      .filter(name => name.endsWith('.json'))
      .map((filename) => {
        const slug = filename.replace('.json', '')
        const filePath = path.join(articlesDir, filename)
        const fileContents = fs.readFileSync(filePath, 'utf8')
        const article = JSON.parse(fileContents)
        
        return {
          slug,
          title: article.title || `${extractCompanyName(slug)} Interview Questions`,
          company: extractCompanyName(slug),
          description: article.metaDescription || `Ace your ${extractCompanyName(slug)} interview with real questions and AI-powered practice.`
        }
      })
      .sort((a, b) => a.company.localeCompare(b.company))
  } catch {
    return []
  }
}

function extractCompanyName(slug: string): string {
  const parts = slug.split('-')
  const companyPart = parts[0]
  return companyPart.charAt(0).toUpperCase() + companyPart.slice(1)
}

export default function OpportunitiesPage() {
  const opportunities = getOpportunities()
  
  // Group opportunities by company
  const groupedOpportunities = opportunities.reduce((acc, opportunity) => {
    const company = opportunity.company
    if (!acc[company]) {
      acc[company] = []
    }
    acc[company].push(opportunity)
    return acc
  }, {} as Record<string, typeof opportunities>)

  const companies = Object.keys(groupedOpportunities).sort()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Interview Opportunities
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Practice with real interview questions from top tech companies. 
            Get AI-powered feedback and ace your next interview.
          </p>
          <div className="mt-6 text-sm text-gray-500">
            {opportunities.length} opportunities available from {companies.length} companies
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Companies
                </label>
                <input
                  type="text"
                  placeholder="Search by company name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">All Roles</option>
                  <option value="intern">Internship</option>
                  <option value="fulltime">Full Time</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">All Locations</option>
                  <option value="remote">Remote</option>
                  <option value="onsite">On-site</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Opportunities Grid */}
        <div className="space-y-8">
          {companies.map(company => (
            <div key={company} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  {company}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {groupedOpportunities[company].length} {groupedOpportunities[company].length === 1 ? 'opportunity' : 'opportunities'}
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedOpportunities[company].map(opportunity => (
                    <Link
                      key={opportunity.slug}
                      href={`/opportunities/${opportunity.slug}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
                    >
                      <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                        {opportunity.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {opportunity.description}
                      </p>
                      <div className="mt-3 text-sm text-blue-600 font-medium">
                        View Questions →
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {opportunities.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
            <p className="text-gray-600">
              Check back later for new interview opportunities.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
