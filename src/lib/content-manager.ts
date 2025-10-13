/**
 * Content Management System
 * Handles data scraping, article generation, and file management
 */

import { writeFile, readFile, mkdir, readdir } from 'fs/promises';
import { join } from 'path';
import { InternshipScraper, type InternshipListing, type ScrapedData } from './internship-scraper';
import { SEOArticleGenerator, type SEOArticle, type SEOConfig } from './seo-generator';

export interface ContentGenerationOptions {
  outputDir: string;
  seoConfig: SEOConfig;
  generateSitemap?: boolean;
  generateIndex?: boolean;
  batchSize?: number;
}

export interface GenerationStats {
  totalProcessed: number;
  newArticles: number;
  updatedArticles: number;
  errors: number;
  processingTime: number;
}

export class ContentManager {
  private scraper: InternshipScraper;
  private generator: SEOArticleGenerator;
  
  constructor(seoConfig: SEOConfig) {
    this.scraper = new InternshipScraper();
    this.generator = new SEOArticleGenerator(seoConfig);
  }

  async generateAllContent(options: ContentGenerationOptions): Promise<GenerationStats> {
    const startTime = Date.now();
    const stats: GenerationStats = {
      totalProcessed: 0,
      newArticles: 0,
      updatedArticles: 0,
      errors: 0,
      processingTime: 0
    };

    try {
      console.log('🚀 Starting content generation process...');
      
      // Step 1: Scrape fresh data
      console.log('📊 Scraping internship data...');
      const scrapedData = await this.scraper.scrapeInternships();
      console.log(`✅ Found ${scrapedData.totalListings} total listings (${scrapedData.activeListings} active)`);

      // Step 2: Set up directory structure
      await this.setupDirectories(options.outputDir);

      // Step 3: Save raw data
      await this.saveRawData(scrapedData, options.outputDir);

      // Step 4: Generate articles in batches
      const batchSize = options.batchSize || 50;
      const listings = scrapedData.listings;
      
      for (let i = 0; i < listings.length; i += batchSize) {
        const batch = listings.slice(i, i + batchSize);
        console.log(`📝 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(listings.length / batchSize)} (${batch.length} articles)...`);
        
        await this.processBatch(batch, options, stats);
      }

      // Step 5: Generate additional content
      if (options.generateSitemap) {
        await this.generateSitemap(scrapedData, options);
      }

      if (options.generateIndex) {
        await this.generateIndexPages(scrapedData, options);
      }

      stats.processingTime = Date.now() - startTime;
      
      console.log('🎉 Content generation completed!');
      console.log(`📊 Stats: ${stats.totalProcessed} processed, ${stats.newArticles} new, ${stats.updatedArticles} updated, ${stats.errors} errors`);
      console.log(`⏱️ Total time: ${stats.processingTime / 1000}s`);
      
      return stats;
      
    } catch (error) {
      console.error('❌ Content generation failed:', error);
      stats.errors++;
      stats.processingTime = Date.now() - startTime;
      throw error;
    }
  }

  private async processBatch(
    listings: InternshipListing[], 
    options: ContentGenerationOptions, 
    stats: GenerationStats
  ): Promise<void> {
    const promises = listings.map(async (listing) => {
      try {
        stats.totalProcessed++;
        
        // Generate article
        const article = this.generator.generateArticle(listing);
        
        // Check if article already exists
        const articlePath = join(options.outputDir, 'articles', `${article.slug}.json`);
        const markdownPath = join(options.outputDir, 'markdown', `${article.slug}.md`);
        
        let isUpdate = false;
        try {
          await readFile(articlePath);
          isUpdate = true;
        } catch {
          // File doesn't exist, this is a new article
        }

        // Save article as JSON (for metadata and structured data)
        await writeFile(articlePath, JSON.stringify(article, null, 2));
        
        // Save article as Markdown (for content)
        await this.saveMarkdownFile(article, markdownPath);
        
        if (isUpdate) {
          stats.updatedArticles++;
        } else {
          stats.newArticles++;
        }
        
      } catch (error) {
        console.error(`❌ Error processing ${listing.company} ${listing.role}:`, error);
        stats.errors++;
      }
    });

    await Promise.all(promises);
  }

  private async setupDirectories(outputDir: string): Promise<void> {
    const dirs = [
      outputDir,
      join(outputDir, 'articles'),
      join(outputDir, 'markdown'),
      join(outputDir, 'data'),
      join(outputDir, 'sitemaps'),
      join(outputDir, 'indexes')
    ];

    for (const dir of dirs) {
      await mkdir(dir, { recursive: true });
    }
  }

  private async saveRawData(data: ScrapedData, outputDir: string): Promise<void> {
    const dataPath = join(outputDir, 'data', 'latest.json');
    const timestampedPath = join(outputDir, 'data', `${new Date().toISOString().split('T')[0]}.json`);
    
    await writeFile(dataPath, JSON.stringify(data, null, 2));
    await writeFile(timestampedPath, JSON.stringify(data, null, 2));
  }

  private async saveMarkdownFile(article: SEOArticle, filePath: string): Promise<void> {
    const frontMatter = `---
title: "${article.title}"
description: "${article.metaDescription}"
keywords: [${article.keywords.map(k => `"${k}"`).join(', ')}]
slug: "${article.slug}"
lastUpdated: "${article.lastUpdated}"
openGraph:
  title: "${article.openGraph.title}"
  description: "${article.openGraph.description}"
  image: "${article.openGraph.image}"
  url: "${article.openGraph.url}"
structuredData: ${JSON.stringify(article.structuredData, null, 2)}
---

${article.content}`;

    await writeFile(filePath, frontMatter);
  }

  private async generateSitemap(data: ScrapedData, options: ContentGenerationOptions): Promise<void> {
    const sitemapContent = this.createSitemap(data, options.seoConfig.baseUrl);
    const sitemapPath = join(options.outputDir, 'sitemaps', 'internships.xml');
    await writeFile(sitemapPath, sitemapContent);
  }

  private createSitemap(data: ScrapedData, baseUrl: string): string {
    const urls = data.listings.map(listing => {
      const lastmod = new Date(Date.now() - this.parseDaysAgo(listing.daysAgo) * 24 * 60 * 60 * 1000);
      const priority = listing.isActive ? '0.8' : '0.6';
      
      return `  <url>
    <loc>${baseUrl}/internships/${listing.slug}</loc>
    <lastmod>${lastmod.toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
    });

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
  }

  private async generateIndexPages(data: ScrapedData, options: ContentGenerationOptions): Promise<void> {
    // Generate category index pages
    const categories = ['software', 'data-science', 'quant', 'hardware'] as const;
    
    for (const category of categories) {
      const categoryListings = data.listings.filter(l => l.category === category);
      const indexContent = this.createCategoryIndex(category, categoryListings, options.seoConfig);
      const indexPath = join(options.outputDir, 'indexes', `${category}.json`);
      await writeFile(indexPath, JSON.stringify(indexContent, null, 2));
    }

    // Generate main index
    const mainIndex = this.createMainIndex(data, options.seoConfig);
    const mainIndexPath = join(options.outputDir, 'indexes', 'main.json');
    await writeFile(mainIndexPath, JSON.stringify(mainIndex, null, 2));

    // Generate company index
    const companyIndex = this.createCompanyIndex(data, options.seoConfig);
    const companyIndexPath = join(options.outputDir, 'indexes', 'companies.json');
    await writeFile(companyIndexPath, JSON.stringify(companyIndex, null, 2));

    // Generate location index
    const locationIndex = this.createLocationIndex(data, options.seoConfig);
    const locationIndexPath = join(options.outputDir, 'indexes', 'locations.json');
    await writeFile(locationIndexPath, JSON.stringify(locationIndex, null, 2));
  }

  private createCategoryIndex(category: string, listings: InternshipListing[], config: SEOConfig) {
    const categoryNames: Record<string, string> = {
      'software': 'Software Engineering',
      'data-science': 'Data Science, AI & Machine Learning',
      'quant': 'Quantitative Finance',
      'hardware': 'Hardware Engineering'
    };

    const activeListings = listings.filter(l => l.isActive);
    
    return {
      category,
      displayName: categoryNames[category],
      totalListings: listings.length,
      activeListings: activeListings.length,
      lastUpdated: new Date().toISOString(),
      seo: {
        title: `${categoryNames[category]} Internships Summer 2025 - ${activeListings.length} Open Positions`,
        description: `Find ${categoryNames[category].toLowerCase()} internships for Summer 2025. ${activeListings.length} active positions from top tech companies.`,
        url: `${config.baseUrl}/internships/${category}`
      },
      listings: listings.map(l => ({
        slug: l.slug,
        company: l.company,
        role: l.role,
        location: l.location,
        isActive: l.isActive,
        daysAgo: l.daysAgo
      }))
    };
  }

  private createMainIndex(data: ScrapedData, config: SEOConfig) {
    return {
      totalListings: data.totalListings,
      activeListings: data.activeListings,
      categories: data.categories,
      lastUpdated: data.lastUpdated,
      seo: {
        title: `Summer 2025 Tech Internships - ${data.activeListings} Open Positions`,
        description: `Browse ${data.totalListings} tech internships for Summer 2025. Find software engineering, data science, and more internship opportunities.`,
        url: `${config.baseUrl}/internships`
      },
      featured: data.listings
        .filter(l => l.isActive)
        .slice(0, 20)
        .map(l => ({
          slug: l.slug,
          company: l.company,
          role: l.role,
          location: l.location,
          category: l.category,
          daysAgo: l.daysAgo
        }))
    };
  }

  private createCompanyIndex(data: ScrapedData, config: SEOConfig) {
    const companies = new Map<string, InternshipListing[]>();
    
    data.listings.forEach(listing => {
      if (!companies.has(listing.company)) {
        companies.set(listing.company, []);
      }
      companies.get(listing.company)!.push(listing);
    });

    const companyData = Array.from(companies.entries())
      .map(([company, listings]) => ({
        company,
        totalPositions: listings.length,
        activePositions: listings.filter(l => l.isActive).length,
        categories: [...new Set(listings.map(l => l.category))],
        locations: [...new Set(listings.map(l => l.location))],
        listings: listings.map(l => ({
          slug: l.slug,
          role: l.role,
          location: l.location,
          category: l.category,
          isActive: l.isActive,
          daysAgo: l.daysAgo
        }))
      }))
      .sort((a, b) => b.activePositions - a.activePositions);

    return {
      totalCompanies: companies.size,
      lastUpdated: new Date().toISOString(),
      seo: {
        title: `Tech Companies Hiring Summer 2025 Interns - ${companies.size} Companies`,
        description: `Explore internship opportunities at ${companies.size} top tech companies for Summer 2025.`,
        url: `${config.baseUrl}/companies`
      },
      companies: companyData
    };
  }

  private createLocationIndex(data: ScrapedData, config: SEOConfig) {
    const locations = new Map<string, InternshipListing[]>();
    
    data.listings.forEach(listing => {
      const primaryLocation = listing.location.split(',')[0].trim();
      if (!locations.has(primaryLocation)) {
        locations.set(primaryLocation, []);
      }
      locations.get(primaryLocation)!.push(listing);
    });

    const locationData = Array.from(locations.entries())
      .map(([location, listings]) => ({
        location,
        totalPositions: listings.length,
        activePositions: listings.filter(l => l.isActive).length,
        categories: [...new Set(listings.map(l => l.category))],
        companies: [...new Set(listings.map(l => l.company))],
        listings: listings.map(l => ({
          slug: l.slug,
          company: l.company,
          role: l.role,
          category: l.category,
          isActive: l.isActive,
          daysAgo: l.daysAgo
        }))
      }))
      .sort((a, b) => b.activePositions - a.activePositions);

    return {
      totalLocations: locations.size,
      lastUpdated: new Date().toISOString(),
      seo: {
        title: `Tech Internships by Location - Summer 2025 Opportunities`,
        description: `Find tech internships by location for Summer 2025. Opportunities in ${locations.size} cities worldwide.`,
        url: `${config.baseUrl}/locations`
      },
      locations: locationData
    };
  }

  private parseDaysAgo(daysAgoString: string): number {
    const match = daysAgoString.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  // Utility methods for accessing generated content
  async getGeneratedArticles(outputDir: string): Promise<string[]> {
    try {
      const articlesDir = join(outputDir, 'articles');
      const files = await readdir(articlesDir);
      return files.filter(file => file.endsWith('.json'));
    } catch {
      return [];
    }
  }

  async getArticleBySlug(slug: string, outputDir: string): Promise<SEOArticle | null> {
    try {
      const articlePath = join(outputDir, 'articles', `${slug}.json`);
      const content = await readFile(articlePath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  async getLatestData(outputDir: string): Promise<ScrapedData | null> {
    try {
      const dataPath = join(outputDir, 'data', 'latest.json');
      const content = await readFile(dataPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }
}
