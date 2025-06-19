import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

// Article metadata
const articleData = {
  slug: "apple-internship-distributed-build-system-internship-london",
  title: "Apple Internship: Internship - Distributed Build System Position in London, UK (2025)",
  metaDescription: "Apply now for the Apple Internship - Distributed Build System internship in London, UK. Learn about requirements, application process, and tips for landing this Summer 2025 tech internship.",
  keywords: ["Apple internship", "Internship - Distributed Build System internship", "Apple Internship - Distributed Build System", "summer 2025 internship", "tech internship London, UK", "software internship", "Apple careers", "internship application", "tech jobs 2025", "London internship", "Apple London", "UK internship", "Apple UK", "software engineering internship", "software developer internship"],
  lastUpdated: "2025-06-19T22:10:25.759Z",
  structuredData: {
  "@context": "https://schema.org/",
  "@type": "JobPosting",
  "title": "Internship - Distributed Build System Internship",
  "description": "Internship - Distributed Build System internship opportunity at Apple in London, UK for Summer 2025.",
  "hiringOrganization": {
    "@type": "Organization",
    "name": "Apple"
  },
  "jobLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "London, UK"
    }
  },
  "datePosted": "2025-06-14T22:10:25.759Z",
  "employmentType": "INTERN",
  "workHours": "40 hours per week",
  "jobBenefits": "Competitive compensation, mentorship, professional development",
  "industry": "Technology",
  "occupationalCategory": "Software Engineering",
  "qualifications": "Currently enrolled in Computer Science or related field",
  "responsibilities": "Work on software projects, collaborate with teams, contribute to innovative solutions",
  "url": "http://localhost:3000/internships/apple-internship-distributed-build-system-internship-london",
  "applicationDeadline": "Applications accepted on rolling basis"
},
  openGraph: {
  "title": "Apple Internship: Internship - Distributed Build System Position in London, UK (2025)",
  "description": "Apply now for the Apple Internship - Distributed Build System internship in London, UK. Learn about requirements, application process, and tips for landing this Summer 2025 tech internship.",
  "image": "http://localhost:3000/og-image.png",
  "url": "http://localhost:3000/internships/apple-internship-distributed-build-system-internship-london",
  "type": "article",
  "site_name": "InterviewSense"
}
};

export const metadata: Metadata = {
  title: articleData.title,
  description: articleData.metaDescription,
  keywords: articleData.keywords,
  openGraph: {
    title: articleData.openGraph.title,
    description: articleData.openGraph.description,
    images: [{ url: articleData.openGraph.image }],
    url: articleData.openGraph.url,
    type: 'article',
    siteName: articleData.openGraph.site_name
  },
  twitter: {
    card: 'summary_large_image',
    title: articleData.openGraph.title,
    description: articleData.openGraph.description,
    images: [articleData.openGraph.image]
  },
  alternates: {
    canonical: articleData.openGraph.url
  },
  other: {
    'article:published_time': articleData.lastUpdated,
    'article:modified_time': articleData.lastUpdated
  }
};

// JSON-LD Structured Data
function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(articleData.structuredData) }}
    />
  );
}

// Loading component
function ArticleLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  );
}

// Article content component
async function ArticleContent() {
  try {
    // Dynamically import the article content
    const { ContentManager } = await import('@/lib/content-manager');
    const { join } = await import('path');
    
    const contentManager = new ContentManager({
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://interviewsense.com',
      defaultImage: '/og-image.png',
      companyName: 'InterviewSense'
    });

    const outputDir = join(process.cwd(), 'generated-content');
    const article = await contentManager.getArticleBySlug("apple-internship-distributed-build-system-internship-london", outputDir);

    if (!article) {
      notFound();
    }

    return (
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Article Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            {article.metaDescription}
          </p>
          <div className="flex items-center text-sm text-gray-500 space-x-4">
            <time dateTime={article.lastUpdated}>
              Last updated: {new Date(article.lastUpdated).toLocaleDateString()}
            </time>
            <span>•</span>
            <span>{article.keywords.length} keywords</span>
          </div>
        </header>

        {/* Article Content */}
        <div 
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-links:text-blue-600 prose-strong:text-gray-900"
          dangerouslySetInnerHTML={{ __html: formatMarkdownToHTML(article.content) }}
        />

        {/* Call to Action */}
        <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-xl font-semibold text-blue-900 mb-3">
            Ready to Practice Interview Questions?
          </h3>
          <p className="text-blue-700 mb-4">
            Get access to thousands of practice questions and expert guidance to ace your next tech interview.
          </p>
          <a
            href="/questionnaire"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Start Practicing Now
          </a>
        </div>

        {/* Related Articles */}
        <div className="mt-12 border-t pt-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">
            Related Opportunities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Related articles would be populated here based on similar companies, roles, or locations */}
            <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <h4 className="font-medium text-gray-900 mb-2">Similar Internships</h4>
              <p className="text-sm text-gray-600">
                Explore more opportunities in the same field
              </p>
              <a href="/articles" className="text-blue-600 text-sm font-medium hover:underline">
                View All →
              </a>
            </div>
          </div>
        </div>
      </article>
    );
  } catch (error) {
    console.error('Error loading article:', error);
    notFound();
  }
}

// Helper function to convert markdown to HTML (basic implementation)
function formatMarkdownToHTML(markdown) {
  return markdown
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^\)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\n\n/gim, '</p><p>')
    .replace(/\n/gim, '<br>')
    .replace(/^(.+)$/gim, '<p>$1</p>');
}

export default function ArticlePage() {
  return (
    <>
      <StructuredData />
      <Suspense fallback={<ArticleLoading />}>
        <ArticleContent />
      </Suspense>
    </>
  );
}
