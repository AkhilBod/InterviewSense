#!/usr/bin/env node

/**
 * Article Page Generator
 * Generates Next.js pages for all articles in the generated-content/articles directory
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const articlesDir = path.join(projectRoot, 'generated-content', 'articles');
const pagesDir = path.join(projectRoot, 'src', 'app', 'articles');

interface ArticleData {
  slug: string;
  title: string;
  metaDescription: string;
  keywords: string[];
  content: string;
  structuredData: any;
  openGraph: any;
  lastUpdated: string;
}

async function generateArticlePages() {
  console.log('🚀 Starting article page generation...');
  
  // Check if articles directory exists
  if (!fs.existsSync(articlesDir)) {
    console.error('❌ Articles directory not found:', articlesDir);
    console.log('💡 Please run the content generation script first.');
    process.exit(1);
  }

  // Create pages directory structure
  if (!fs.existsSync(pagesDir)) {
    fs.mkdirSync(pagesDir, { recursive: true });
    console.log('📁 Created articles directory:', pagesDir);
  }

  // Get all article files
  const articleFiles = fs.readdirSync(articlesDir)
    .filter(file => file.endsWith('.json'))
    .sort();

  console.log(`📄 Found ${articleFiles.length} article files`);

  let generatedCount = 0;
  let errorCount = 0;

  // Generate page for each article
  for (const articleFile of articleFiles) {
    try {
      const articlePath = path.join(articlesDir, articleFile);
      const articleData: ArticleData = JSON.parse(fs.readFileSync(articlePath, 'utf-8'));
      
      await generateIndividualPage(articleData);
      generatedCount++;
      
      if (generatedCount % 100 === 0) {
        console.log(`⏳ Generated ${generatedCount}/${articleFiles.length} pages...`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${articleFile}:`, error);
      errorCount++;
    }
  }

  // Generate main articles index page
  await generateIndexPage(articleFiles.length);

  // Generate articles sitemap
  await generateArticlesSitemap(articleFiles);

  console.log('\n✅ Article page generation complete!');
  console.log(`📊 Statistics:`);
  console.log(`   - Generated: ${generatedCount} pages`);
  console.log(`   - Errors: ${errorCount}`);
  console.log(`   - Total articles: ${articleFiles.length}`);
  console.log(`\n📂 Pages created in: ${pagesDir}`);
}

async function generateIndividualPage(article: ArticleData) {
  const pageDir = path.join(pagesDir, article.slug);
  
  // Create directory for the article
  if (!fs.existsSync(pageDir)) {
    fs.mkdirSync(pageDir, { recursive: true });
  }

  const pageContent = generatePageTemplate(article);
  const pagePath = path.join(pageDir, 'page.tsx');
  
  fs.writeFileSync(pagePath, pageContent);
}

function generatePageTemplate(article: ArticleData): string {
  // Escape quotes and format for TypeScript
  const escapedTitle = article.title.replace(/"/g, '\\"');
  const escapedDescription = article.metaDescription.replace(/"/g, '\\"');
  const keywords = article.keywords.map(k => `"${k.replace(/"/g, '\\"')}"`).join(', ');
  
  return `import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

// Article metadata
const articleData = {
  slug: "${article.slug}",
  title: "${escapedTitle}",
  metaDescription: "${escapedDescription}",
  keywords: [${keywords}],
  lastUpdated: "${article.lastUpdated}",
  structuredData: ${JSON.stringify(article.structuredData, null, 2)},
  openGraph: ${JSON.stringify(article.openGraph, null, 2)}
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
    const article = await contentManager.getArticleBySlug("${article.slug}", outputDir);

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
function formatMarkdownToHTML(markdown: string): string {
  return markdown
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    .replace(/\\*\\*(.*?)\\*\\*/gim, '<strong>$1</strong>')
    .replace(/\\*(.*?)\\*/gim, '<em>$1</em>')
    .replace(/\\[([^\\]]+)\\]\\(([^\\)]+)\\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\\n\\n/gim, '</p><p>')
    .replace(/\\n/gim, '<br>')
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
`;
}

async function generateIndexPage(totalArticles: number) {
  const indexPageContent = `import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Tech Internship Articles & Opportunities | InterviewSense',
  description: 'Browse ${totalArticles}+ comprehensive guides for tech internship opportunities at top companies. Get application tips, requirements, and interview preparation advice.',
  keywords: ['tech internships', 'software engineering internships', 'internship applications', 'tech careers', 'interview preparation'],
  openGraph: {
    title: 'Tech Internship Articles & Opportunities | InterviewSense',
    description: 'Browse ${totalArticles}+ comprehensive guides for tech internship opportunities at top companies.',
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
          <article key={article!.slug} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                {article!.title}
              </h2>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {article!.metaDescription}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {article!.keywords.slice(0, 2).map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
                <Link
                  href={\`/articles/\${article!.slug}\`}
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
          Comprehensive guides for ${totalArticles}+ internship opportunities at top tech companies
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
          <div className="text-3xl font-bold text-blue-600">${totalArticles}+</div>
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
`;

  const indexPath = path.join(pagesDir, 'page.tsx');
  fs.writeFileSync(indexPath, indexPageContent);
  console.log('📝 Generated articles index page');
}

async function generateArticlesSitemap(articleFiles: string[]) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://interviewsense.com';
  
  const urls = articleFiles.map(file => {
    const slug = file.replace('.json', '');
    return `  <url>
    <loc>${baseUrl}/articles/${slug}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/articles</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
${urls.join('\n')}
</urlset>`;

  const sitemapDir = path.join(projectRoot, 'public');
  const sitemapPath = path.join(sitemapDir, 'articles-sitemap.xml');
  
  if (!fs.existsSync(sitemapDir)) {
    fs.mkdirSync(sitemapDir, { recursive: true });
  }
  
  fs.writeFileSync(sitemapPath, sitemapContent);
  console.log('🗺️ Generated articles sitemap');
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  generateArticlePages().catch(console.error);
}

export { generateArticlePages };
