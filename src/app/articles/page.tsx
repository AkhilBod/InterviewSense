import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Tech Internship Articles & Opportunities | InterviewSense',
  description: 'Browse 4337+ comprehensive guides for tech internship opportunities at top companies. Get application tips, requirements, and interview preparation advice.',
  keywords: ['tech internships', 'software engineering internships', 'internship applications', 'tech careers', 'interview preparation'],
  openGraph: {
    title: 'Tech Internship Articles & Opportunities | InterviewSense',
    description: 'Browse 4337+ comprehensive guides for tech internship opportunities at top companies.',
    images: [{ url: '/og-image.png' }],
    type: 'website',
    siteName: 'InterviewSense'
  }
};

// Loading component for the articles list
function ArticlesLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}

// Articles list component
async function ArticlesList() {
  try {
    const { ContentManager } = await import('@/lib/content-manager');
    const { join } = await import('path');
    
    const contentManager = new ContentManager({
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://interviewsense.com',
      defaultImage: '/og-image.png',
      companyName: 'InterviewSense'
    });

    const outputDir = join(process.cwd(), 'generated-content');
    const articleSlugs = await contentManager.getGeneratedArticles(outputDir);
    
    // Get first 50 articles for the main page (you can implement pagination later)
    const displayArticles = articleSlugs.slice(0, 50);
    
    const articles = await Promise.all(
      displayArticles.map(async (slug) => {
        return await contentManager.getArticleBySlug(slug.replace('.json', ''), outputDir);
      })
    );

    const validArticles = articles.filter(Boolean);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {validArticles.map((article) => (
          <article key={article.slug} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                {article.title}
              </h2>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {article.metaDescription}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {article.keywords.slice(0, 2).map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/articles/${article.slug}`}
                  className="text-blue-600 font-medium text-sm hover:underline"
                >
                  Read More →
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    );
  } catch (error) {
    console.error('Error loading articles:', error);
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Error loading articles. Please try again later.</p>
      </div>
    );
  }
}

export default function ArticlesIndexPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Tech Internship Opportunities
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Comprehensive guides for 4337+ internship opportunities at top tech companies
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            href="/questionnaire"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Practice Interview Questions
          </Link>
          <Link
            href="/cover-letter"
            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Generate Cover Letter
          </Link>
        </div>
      </header>

      {/* Search and Filter Section */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Find Your Perfect Internship</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2">
              <option>All Companies</option>
              <option>Google</option>
              <option>Microsoft</option>
              <option>Amazon</option>
              <option>Meta</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2">
              <option>All Roles</option>
              <option>Software Engineer</option>
              <option>Data Scientist</option>
              <option>Product Manager</option>
              <option>UX Designer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2">
              <option>All Locations</option>
              <option>Remote</option>
              <option>San Francisco</option>
              <option>New York</option>
              <option>Seattle</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="text-center p-6 bg-blue-50 rounded-lg">
          <div className="text-3xl font-bold text-blue-600">4337+</div>
          <div className="text-blue-800 font-medium">Total Opportunities</div>
        </div>
        <div className="text-center p-6 bg-green-50 rounded-lg">
          <div className="text-3xl font-bold text-green-600">200+</div>
          <div className="text-green-800 font-medium">Top Companies</div>
        </div>
        <div className="text-center p-6 bg-purple-50 rounded-lg">
          <div className="text-3xl font-bold text-purple-600">50+</div>
          <div className="text-purple-800 font-medium">Cities</div>
        </div>
        <div className="text-center p-6 bg-orange-50 rounded-lg">
          <div className="text-3xl font-bold text-orange-600">24/7</div>
          <div className="text-orange-800 font-medium">Updated</div>
        </div>
      </div>

      {/* Articles Grid */}
      <Suspense fallback={<ArticlesLoading />}>
        <ArticlesList />
      </Suspense>

      {/* Call to Action */}
      <div className="mt-16 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg">
        <h2 className="text-3xl font-bold mb-4">Ready to Land Your Dream Internship?</h2>
        <p className="text-xl mb-6">
          Get personalized interview questions and expert guidance to ace your applications
        </p>
        <Link
          href="/questionnaire"
          className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
        >
          Start Your Interview Prep
        </Link>
      </div>
    </div>
  );
}
