import { Metadata } from 'next';
import Link from 'next/link';
import { ContentManager } from '@/lib/content-manager';
import { join } from 'path';

// Revalidate every hour so newly synced listings appear without a rebuild
export const revalidate = 3600;

/**
 * Internship Opportunities Directory Page
 * Lists all available internship articles organized by category
 */

export const metadata: Metadata = {
  title: 'Summer 2025 Tech Internship Opportunities - Browse All Listings | InterviewSense',
  description: 'Browse hundreds of Summer 2025 tech internships from top companies. Find software engineering, data science, quant, and hardware internship opportunities.',
  keywords: [
    'summer 2025 internships',
    'tech internships',
    'software engineering internship',
    'data science internship',
    'internship opportunities',
    'tech jobs 2025',
    'computer science internship'
  ],
  openGraph: {
    title: 'Summer 2025 Tech Internship Opportunities - Browse All Listings',
    description: 'Browse hundreds of Summer 2025 tech internships from top companies.',
    type: 'website',
    url: '/internship-opportunities'
  }
};

interface CategoryData {
  category: string;
  displayName: string;
  totalListings: number;
  activeListings: number;
  listings: Array<{
    slug: string;
    company: string;
    role: string;
    location: string;
    isActive: boolean;
    daysAgo: string;
  }>;
}

async function getInternshipData() {
  try {
    const contentManager = new ContentManager({
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://interviewsense.com',
      defaultImage: '/og-image.png',
      companyName: 'InterviewSense'
    });

    const outputDir = join(process.cwd(), 'generated-content');
    const latestData = await contentManager.getLatestData(outputDir);

    if (!latestData) {
      return null;
    }

    // Group listings by category
    const categorizedData: Record<string, CategoryData> = {};
    
    const categoryNames: Record<string, string> = {
      'software': 'Software Engineering',
      'data-science': 'Data Science, AI & Machine Learning', 
      'quant': 'Quantitative Finance',
      'hardware': 'Hardware Engineering'
    };

    latestData.listings.forEach(listing => {
      if (!categorizedData[listing.category]) {
        categorizedData[listing.category] = {
          category: listing.category,
          displayName: categoryNames[listing.category] || listing.category,
          totalListings: 0,
          activeListings: 0,
          listings: []
        };
      }

      categorizedData[listing.category].totalListings++;
      if (listing.isActive) {
        categorizedData[listing.category].activeListings++;
      }

      categorizedData[listing.category].listings.push({
        slug: listing.slug,
        company: listing.company,
        role: listing.role,
        location: listing.location,
        isActive: listing.isActive,
        daysAgo: listing.daysAgo
      });
    });

    // Sort listings within each category by activity and recency
    Object.values(categorizedData).forEach(category => {
      category.listings.sort((a, b) => {
        if (a.isActive !== b.isActive) {
          return a.isActive ? -1 : 1; // Active first
        }
        // Then by recency (parse days ago)
        const aDays = parseInt(a.daysAgo.match(/\d+/)?.[0] || '999');
        const bDays = parseInt(b.daysAgo.match(/\d+/)?.[0] || '999');
        return aDays - bDays;
      });
    });

    return {
      totalListings: latestData.totalListings,
      activeListings: latestData.activeListings,
      lastUpdated: latestData.lastUpdated,
      categories: Object.values(categorizedData)
    };

  } catch (error) {
    console.error('Error loading internship data:', error);
    return null;
  }
}

export default async function InternshipOpportunitiesPage() {
  const data = await getInternshipData();

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Internship Data Not Available
          </h1>
          <p className="text-gray-600 mb-6">
            The internship database is currently being updated. Please check back soon.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Summer 2025 Tech Internship Opportunities
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Browse {data.totalListings} internship opportunities from top tech companies
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
          <span>📊 {data.activeListings} Currently Active</span>
          <span>🏢 Multiple Categories</span>
          <span>🌍 Global Opportunities</span>
          <span>⏰ Updated {new Date(data.lastUpdated).toLocaleDateString()}</span>
        </div>
      </section>

      {/* Statistics Cards */}
      <section className="grid md:grid-cols-4 gap-6 mb-12">
        {data.categories.map((category) => (
          <div key={category.category} className="bg-white rounded-lg shadow-md p-6 border">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {category.displayName}
              </h3>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {category.activeListings}
              </div>
              <div className="text-sm text-gray-500">
                of {category.totalListings} total
              </div>
              <Link
                href={`#${category.category}`}
                className="inline-block mt-3 px-4 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded hover:bg-blue-100 transition-colors"
              >
                View All →
              </Link>
            </div>
          </div>
        ))}
      </section>

      {/* Search and Filter */}
      <section className="mb-8">
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Find Your Perfect Internship
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by Company or Role
              </label>
              <input
                type="text"
                placeholder="e.g., Google, Software Engineer"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">All Locations</option>
                <option value="sf">San Francisco, CA</option>
                <option value="nyc">New York, NY</option>
                <option value="seattle">Seattle, WA</option>
                <option value="austin">Austin, TX</option>
                <option value="remote">Remote</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">All Listings</option>
                <option value="active">Active Only</option>
                <option value="recent">Recently Posted</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Category Sections */}
      {data.categories.map((category) => (
        <section key={category.category} id={category.category} className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {category.displayName}
            </h2>
            <div className="text-sm text-gray-500">
              {category.activeListings} active of {category.totalListings} total
            </div>
          </div>

          <div className="grid gap-4">
            {category.listings.slice(0, 10).map((listing) => (
              <Link
                key={listing.slug}
                href={`/opportunities/${listing.slug}`}
                className="block bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {listing.company}
                      </h3>
                      {listing.isActive ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                          Closed
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 font-medium mb-1">
                      {listing.role}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>📍 {listing.location}</span>
                      <span>⏰ {listing.daysAgo} ago</span>
                    </div>
                  </div>
                  <div className="flex items-center text-blue-600">
                    <span className="text-sm font-medium">View Details</span>
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}

            {category.listings.length > 10 && (
              <div className="text-center pt-4">
                <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  Show All {category.listings.length} {category.displayName} Internships
                </button>
              </div>
            )}
          </div>
        </section>
      ))}

      {/* CTA Section */}
      <section className="mt-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to Land Your Dream Internship?
        </h2>
        <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
          Use our AI-powered tools to optimize your applications, practice interviews, 
          and increase your chances of getting hired at top tech companies.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/resume-checker"
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Check Your Resume
          </Link>
          <Link
            href="/interview"
            className="px-8 py-3 bg-white text-blue-600 font-medium rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors"
          >
            Practice Interviews
          </Link>
          <Link
            href="/cover-letter"
            className="px-8 py-3 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors"
          >
            Generate Cover Letter
          </Link>
        </div>
      </section>
    </div>
  );
}
