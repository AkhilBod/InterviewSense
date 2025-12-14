#!/usr/bin/env node

/**
 * Content Generation CLI
 * Command-line tool for generating SEO articles from internship data
 */

import { ContentManager } from '../lib/content-manager';
import { join } from 'path';

interface CLIOptions {
  outputDir?: string;
  baseUrl?: string;
  batchSize?: number;
  generateSitemap?: boolean;
  generateIndex?: boolean;
  help?: boolean;
}

class ContentGenerationCLI {
  private async parseArgs(): Promise<CLIOptions> {
    const args = process.argv.slice(2);
    const options: CLIOptions = {};

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      switch (arg) {
        case '--output-dir':
        case '-o':
          options.outputDir = args[++i];
          break;
        case '--base-url':
        case '-u':
          options.baseUrl = args[++i];
          break;
        case '--batch-size':
        case '-b':
          options.batchSize = parseInt(args[++i]);
          break;
        case '--sitemap':
        case '-s':
          options.generateSitemap = true;
          break;
        case '--index':
        case '-i':
          options.generateIndex = true;
          break;
        case '--help':
        case '-h':
          options.help = true;
          break;
        default:
          if (arg.startsWith('-')) {
            console.error(`Unknown option: ${arg}`);
            process.exit(1);
          }
      }
    }

    return options;
  }

  private showHelp(): void {
    console.log(`
🚀 Internship SEO Content Generator

Usage: npm run generate-content [options]

Options:
  -o, --output-dir <dir>     Output directory for generated content (default: ./generated-content)
  -u, --base-url <url>       Base URL for your site (default: https://interviewsense.com)
  -b, --batch-size <size>    Number of articles to process at once (default: 50)
  -s, --sitemap              Generate XML sitemap
  -i, --index                Generate index pages for categories, companies, and locations
  -h, --help                 Show this help message

Examples:
  npm run generate-content
  npm run generate-content --output-dir ./content --sitemap --index
  npm run generate-content -o ./seo-content -u https://mysite.com -b 25

The generator will:
1. 📊 Scrape fresh internship data from SimplifyJobs repository
2. 📝 Generate SEO-optimized articles for each internship
3. 🗂️ Create organized directory structure
4. 🗺️ Generate sitemaps and index pages (if requested)
5. 📈 Provide detailed statistics on the generation process

Generated content includes:
- Individual internship articles (JSON + Markdown)
- Category-based indexes
- Company and location indexes
- XML sitemaps for SEO
- Raw data files for analysis
    `);
  }

  async run(): Promise<void> {
    try {
      const options = await this.parseArgs();

      if (options.help) {
        this.showHelp();
        return;
      }

      // Set defaults
      const outputDir = options.outputDir || join(process.cwd(), 'generated-content');
      const baseUrl = options.baseUrl || 'https://interviewsense.com';
      const batchSize = options.batchSize || 50;
      const generateSitemap = options.generateSitemap || false;
      const generateIndex = options.generateIndex || false;

      console.log('🎯 Content Generation Configuration:');
      console.log(`   Output Directory: ${outputDir}`);
      console.log(`   Base URL: ${baseUrl}`);
      console.log(`   Batch Size: ${batchSize}`);
      console.log(`   Generate Sitemap: ${generateSitemap ? '✅' : '❌'}`);
      console.log(`   Generate Indexes: ${generateIndex ? '✅' : '❌'}`);
      console.log('');

      // Initialize content manager
      const contentManager = new ContentManager({
        baseUrl,
        defaultImage: `${baseUrl}/og-image.png`,
        companyName: 'InterviewSense'
      });

      // Generate content
      const stats = await contentManager.generateAllContent({
        outputDir,
        seoConfig: {
          baseUrl,
          defaultImage: `${baseUrl}/og-image.png`,
          companyName: 'InterviewSense'
        },
        generateSitemap,
        generateIndex,
        batchSize
      });

      console.log('\n🎉 Content generation completed successfully!');
      console.log('\n📊 Final Statistics:');
      console.log(`   Total Processed: ${stats.totalProcessed}`);
      console.log(`   New Articles: ${stats.newArticles}`);
      console.log(`   Updated Articles: ${stats.updatedArticles}`);
      console.log(`   Errors: ${stats.errors}`);
      console.log(`   Processing Time: ${(stats.processingTime / 1000).toFixed(2)}s`);
      
      if (stats.errors > 0) {
        console.log('\n⚠️  Some articles had errors. Check the logs above for details.');
      }

      console.log(`\n📁 Generated content saved to: ${outputDir}`);
      console.log('\n🚀 Next steps:');
      console.log('   1. Review generated articles in the markdown/ directory');
      console.log('   2. Integrate articles into your Next.js application');
      console.log('   3. Upload sitemaps to your public directory');
      console.log('   4. Set up automated regeneration for fresh content');

    } catch (error) {
      console.error('\n❌ Content generation failed:', error);
      process.exit(1);
    }
  }
}

// Run CLI if this file is executed directly
if (require.main === module) {
  const cli = new ContentGenerationCLI();
  cli.run();
}

export default ContentGenerationCLI;
