# Programmatic SEO System for Internships

This system automatically scrapes internship data from the SimplifyJobs Summer2025-Internships repository and generates SEO-optimized articles for each listing.

## Features

- 🔄 **Automated Data Scraping**: Fetches fresh data from the SimplifyJobs repository
- 📝 **SEO Article Generation**: Creates unique, optimized content for each internship
- 🗂️ **Organized Content Structure**: Categorizes by company, location, and job type
- 🗺️ **Sitemap Generation**: Automatic XML sitemaps for search engines
- 📊 **Analytics & Indexing**: Comprehensive data organization and statistics
- 🚀 **Scalable Architecture**: Handles hundreds of internship listings efficiently

## Quick Start

### 1. Generate Content

```bash
# Development (local URLs)
npm run generate-content:dev

# Production (live URLs)
npm run generate-content:prod

# Custom configuration
npm run generate-content -- --output-dir ./my-content --base-url https://mysite.com --sitemap --index
```

### 2. API Usage

```bash
# Trigger content generation via API
curl -X POST http://localhost:3000/api/generate-content \
  -H "Content-Type: application/json" \
  -d '{"generateSitemap": true, "generateIndex": true}'

# Check generation status
curl http://localhost:3000/api/generate-content
```

## System Architecture

### Core Components

1. **InternshipScraper** (`src/lib/internship-scraper.ts`)
   - Fetches data from SimplifyJobs repository
   - Parses markdown tables into structured data
   - Handles active/inactive status and special markers

2. **SEOArticleGenerator** (`src/lib/seo-generator.ts`)
   - Creates SEO-optimized content for each listing
   - Generates metadata, structured data, and OpenGraph tags
   - Produces comprehensive articles with actionable content

3. **ContentManager** (`src/lib/content-manager.ts`)
   - Orchestrates the entire generation process
   - Manages file organization and batch processing
   - Creates indexes and sitemaps

### Generated Content Structure

```
generated-content/
├── articles/           # JSON metadata for each internship
│   ├── company-role-internship-location-hash.json
│   └── ...
├── markdown/          # Markdown content files
│   ├── company-role-internship-location-hash.md
│   └── ...
├── data/             # Raw scraped data
│   ├── latest.json
│   └── 2025-01-XX.json
├── sitemaps/         # XML sitemaps
│   └── internships.xml
└── indexes/          # Category and company indexes
    ├── main.json
    ├── companies.json
    ├── locations.json
    ├── software.json
    ├── data-science.json
    ├── quant.json
    └── hardware.json
```

## Generated Page Routes

### Internship Listings
- `/internship-opportunities` - Main directory page
- `/opportunities/[slug]` - Individual internship articles

### Article URLs
Each internship gets a unique URL based on:
- Company name
- Role title  
- Location
- Unique hash for disambiguation

Example: `/opportunities/google-software-engineer-internship-mountain-view-ca-abc123`

## SEO Features

### Article Optimization
- **Title Tags**: Optimized for search with company, role, and location
- **Meta Descriptions**: Compelling descriptions under 160 characters
- **Keywords**: Targeted keyword sets for each internship
- **Headers**: Semantic H1-H6 structure for readability
- **Internal Linking**: Strategic links to related content

### Structured Data
- Schema.org JobPosting markup
- Rich snippets for search results
- Company and location information
- Application status and requirements

### Technical SEO
- XML sitemaps with proper priorities
- Canonical URLs for duplicate prevention
- OpenGraph and Twitter Card meta tags
- Last modified dates for freshness signals

## Content Strategy

### Article Sections
Each generated article includes:

1. **Introduction** - Overview with key details
2. **About the Role** - Detailed job description
3. **Application Process** - Requirements and tips
4. **Company Overview** - Why work there
5. **Location Info** - City and workplace details
6. **Success Tips** - Interview and application advice
7. **Similar Opportunities** - Related internships
8. **Timeline** - Application deadlines and process
9. **FAQ** - Common questions and answers
10. **Conclusion** - Call to action

### Content Uniqueness
- Dynamic content based on:
  - Company specifics
  - Role requirements
  - Location characteristics
  - Application status
  - Sponsorship requirements

## Integration with Next.js

### Static Generation
```typescript
// pages/opportunities/[slug].tsx
export async function generateStaticParams() {
  const contentManager = new ContentManager(config);
  const articles = await contentManager.getGeneratedArticles(outputDir);
  return articles.map(filename => ({ slug: filename.replace('.json', '') }));
}
```

### Dynamic Metadata
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const article = await contentManager.getArticleBySlug(params.slug, outputDir);
  return {
    title: article.title,
    description: article.metaDescription,
    // ... other SEO tags
  };
}
```

## Performance Considerations

### Batch Processing
- Processes articles in configurable batches (default: 50)
- Prevents memory overflow with large datasets
- Provides progress tracking

### Caching Strategy
- Generated content cached to disk
- Incremental updates for changed listings
- Timestamp-based freshness checks

### Build Integration
```bash
# Add to your build process
npm run generate-content:prod && npm run build
```

## Monitoring & Analytics

### Generation Statistics
```json
{
  "totalProcessed": 275,
  "newArticles": 180,
  "updatedArticles": 95,
  "errors": 0,
  "processingTime": 45000
}
```

### Content Metrics
- Articles per category
- Active vs inactive listings
- Geographic distribution
- Company coverage

## Automation

### GitHub Actions Example
```yaml
name: Generate SEO Content
on:
  schedule:
    - cron: '0 6 * * *'  # Daily at 6 AM
  workflow_dispatch:

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Generate content
        run: npm run generate-content:prod
      - name: Deploy to production
        run: npm run deploy
```

### Webhook Integration
Set up webhooks to regenerate content when the source repository updates:

```typescript
// pages/api/webhook/internships.ts
export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Trigger content regeneration
    const response = await fetch('/api/generate-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ generateSitemap: true, generateIndex: true })
    });
    
    return res.status(200).json({ success: true });
  }
}
```

## Configuration

### Environment Variables
```env
NEXT_PUBLIC_BASE_URL=https://interviewsense.com
CONTENT_OUTPUT_DIR=./generated-content
CONTENT_BATCH_SIZE=50
ENABLE_SITEMAPS=true
ENABLE_INDEXES=true
```

### Custom Configuration
```typescript
const config: SEOConfig = {
  baseUrl: 'https://yoursite.com',
  defaultImage: '/your-og-image.png',
  companyName: 'Your Company'
};

const contentManager = new ContentManager(config);
```

## Troubleshooting

### Common Issues

1. **Rate Limiting**: Add delays between requests
2. **Memory Issues**: Reduce batch size
3. **Parsing Errors**: Check markdown format changes
4. **Build Timeouts**: Use incremental generation

### Debugging
```bash
# Enable verbose logging
DEBUG=true npm run generate-content

# Check specific article
curl http://localhost:3000/api/generate-content?slug=company-role-hash
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Test with development configuration
4. Submit pull request with examples

## License

MIT License - see LICENSE file for details.
