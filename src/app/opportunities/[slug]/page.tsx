import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ContentManager } from '@/lib/content-manager';
import { join } from 'path';

/**
 * Dynamic Internship Opportunity Article Page
 * Renders SEO-optimized articles for individual internship listings
 */

interface PageProps {
  params: {
    slug: string;
  };
}

// Generate static params for build time generation
export async function generateStaticParams() {
  try {
    const contentManager = new ContentManager({
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://interviewsense.com',
      defaultImage: '/og-image.png',
      companyName: 'InterviewSense'
    });

    const outputDir = join(process.cwd(), 'generated-content');
    const articles = await contentManager.getGeneratedArticles(outputDir);
    
    return articles.map((filename) => ({
      slug: filename.replace('.json', '')
    }));
  } catch {
    return [];
  }
}

// Generate metadata for each page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const contentManager = new ContentManager({
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://interviewsense.com',
    defaultImage: '/og-image.png',
    companyName: 'InterviewSense'
  });

  const outputDir = join(process.cwd(), 'generated-content');
  const article = await contentManager.getArticleBySlug(params.slug, outputDir);

  if (!article) {
    return {
      title: 'Internship Not Found',
      description: 'The requested internship article could not be found.'
    };
  }

  return {
    title: article.title,
    description: article.metaDescription,
    keywords: article.keywords,
    openGraph: {
      title: article.openGraph.title,
      description: article.openGraph.description,
      images: [{ url: article.openGraph.image }],
      url: article.openGraph.url,
      type: 'article',
      siteName: 'InterviewSense'
    },
    twitter: {
      card: 'summary_large_image',
      title: article.openGraph.title,
      description: article.openGraph.description,
      images: [article.openGraph.image]
    },
    alternates: {
      canonical: article.openGraph.url
    },
    other: {
      'article:published_time': article.lastUpdated,
      'article:modified_time': article.lastUpdated
    }
  };
}

export default async function InternshipOpportunityPage({ params }: PageProps) {
  const contentManager = new ContentManager({
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://interviewsense.com',
    defaultImage: '/og-image.png',
    companyName: 'InterviewSense'
  });

  const outputDir = join(process.cwd(), 'generated-content');
  const article = await contentManager.getArticleBySlug(params.slug, outputDir);

  if (!article) {
    notFound();
  }

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(article.structuredData)
        }}
      />

      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Article Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            {article.metaDescription}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {article.keywords.slice(0, 5).map((keyword) => (
              <span
                key={keyword}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {keyword}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-500">
            Last updated: {new Date(article.lastUpdated).toLocaleDateString()}
          </p>
        </header>

        {/* Article Content */}
        <div 
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900"
          dangerouslySetInnerHTML={{ __html: formatMarkdownToHTML(article.content) }}
        />

        {/* Related Articles */}
        <aside className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Related Internship Opportunities
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                Browse by Category
              </h3>
              <ul className="space-y-1">
                <li><a href="/internship-opportunities#software" className="text-blue-600 hover:underline">Software Engineering</a></li>
                <li><a href="/internship-opportunities#data-science" className="text-blue-600 hover:underline">Data Science & AI</a></li>
                <li><a href="/internship-opportunities#quant" className="text-blue-600 hover:underline">Quantitative Finance</a></li>
                <li><a href="/internship-opportunities#hardware" className="text-blue-600 hover:underline">Hardware Engineering</a></li>
              </ul>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                Helpful Resources
              </h3>
              <ul className="space-y-1">
                <li><a href="/resume-checker" className="text-blue-600 hover:underline">Resume Checker</a></li>
                <li><a href="/interview" className="text-blue-600 hover:underline">Practice Interviews</a></li>
                <li><a href="/cover-letter" className="text-blue-600 hover:underline">Cover Letter Generator</a></li>
                <li><a href="/technical-assessment" className="text-blue-600 hover:underline">Technical Assessment</a></li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Call to Action */}
        <section className="mt-12 p-6 bg-blue-50 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Land Your Dream Internship?
          </h2>
          <p className="text-gray-700 mb-6">
            Get personalized help with your internship applications using our AI-powered tools.
          </p>
          <div className="space-y-3 sm:space-y-0 sm:space-x-3 sm:flex sm:justify-center">
            <a
              href="/resume-checker"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Check Your Resume
            </a>
            <a
              href="/interview"
              className="inline-block px-6 py-3 bg-white text-blue-600 font-medium rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors"
            >
              Practice Interviews
            </a>
          </div>
        </section>
      </article>
    </>
  );
}

// Helper function to convert markdown to HTML (basic implementation)
function formatMarkdownToHTML(markdown: string): string {
  return markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-8 mb-4">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-10 mb-6">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-12 mb-8">$1</h1>')
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
    // Lists
    .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
    .replace(/^(\d+)\. (.*$)/gim, '<li class="ml-4">$2</li>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/^(?!<[hlu])/gm, '<p class="mb-4">')
    .replace(/(?<!>)$/gm, '</p>')
    // Clean up extra p tags
    .replace(/<p class="mb-4"><\/p>/g, '')
    .replace(/<p class="mb-4">(<[hlu])/g, '$1');
}
