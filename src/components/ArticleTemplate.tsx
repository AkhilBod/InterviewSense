import { Metadata } from 'next'

interface ArticleData {
  slug: string
  title: string
  metaDescription: string
  keywords: string[]
  content?: string
  company?: string
  location?: string
  internshipType?: string
  requirements?: string[]
  benefits?: string[]
  applicationDeadline?: string
  url?: string
}

interface ArticleTemplateProps {
  data: ArticleData
}

export function ArticleTemplate({ data }: ArticleTemplateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {data.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {data.metaDescription}
          </p>
        </header>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            {/* Company and Location */}
            {(data.company || data.location) && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex flex-wrap gap-4">
                  {data.company && (
                    <div>
                      <span className="font-semibold text-blue-900">Company:</span>
                      <span className="ml-2 text-blue-800">{data.company}</span>
                    </div>
                  )}
                  {data.location && (
                    <div>
                      <span className="font-semibold text-blue-900">Location:</span>
                      <span className="ml-2 text-blue-800">{data.location}</span>
                    </div>
                  )}
                  {data.internshipType && (
                    <div>
                      <span className="font-semibold text-blue-900">Type:</span>
                      <span className="ml-2 text-blue-800">{data.internshipType}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Content */}
            {data.content && (
              <div className="prose max-w-none mb-8">
                <div dangerouslySetInnerHTML={{ __html: data.content }} />
              </div>
            )}

            {/* Requirements */}
            {data.requirements && data.requirements.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h3>
                <ul className="list-disc list-inside space-y-2">
                  {data.requirements.map((req, index) => (
                    <li key={index} className="text-gray-700">{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {data.benefits && data.benefits.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Benefits</h3>
                <ul className="list-disc list-inside space-y-2">
                  {data.benefits.map((benefit, index) => (
                    <li key={index} className="text-gray-700">{benefit}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Application Deadline */}
            {data.applicationDeadline && (
              <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Application Deadline</h3>
                <p className="text-yellow-700">{data.applicationDeadline}</p>
              </div>
            )}

            {/* Apply Button */}

          </div>

          {/* Keywords for SEO */}
          {data.keywords && data.keywords.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Related Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {data.keywords.slice(0, 10).map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white text-gray-700 rounded-full text-sm border"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function generateMetadata(data: ArticleData): Metadata {
  return {
    title: data.title,
    description: data.metaDescription,
    keywords: data.keywords.join(', '),
    openGraph: {
      title: data.title,
      description: data.metaDescription,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: data.metaDescription,
    },
  }
}
