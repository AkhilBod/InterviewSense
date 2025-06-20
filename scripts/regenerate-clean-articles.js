const fs = require('fs');
const path = require('path');

const GENERATED_CONTENT_DIR = path.join(__dirname, '..', 'generated-content', 'articles');
const ARTICLES_DIR = path.join(__dirname, '..', 'src', 'app', 'articles');

// Function to create a clean article page from JSON data
function createArticlePage(articleData) {
  return `import { Metadata } from 'next'
import { ArticleTemplate } from '@/components/ArticleTemplate'

const articleData = ${JSON.stringify(articleData, null, 2)}

export const metadata: Metadata = {
  title: articleData.title,
  description: articleData.metaDescription,
  keywords: articleData.keywords,
}

export default function ArticlePage() {
  return <ArticleTemplate data={articleData} />
}
`;
}

async function regenerateArticles() {
  console.log('Starting article regeneration...');
  
  // Remove existing articles directory
  if (fs.existsSync(ARTICLES_DIR)) {
    console.log('Removing existing articles directory...');
    fs.rmSync(ARTICLES_DIR, { recursive: true, force: true });
  }
  
  // Create new articles directory
  fs.mkdirSync(ARTICLES_DIR, { recursive: true });
  
  // Read all article JSON files
  const articleFiles = fs.readdirSync(GENERATED_CONTENT_DIR)
    .filter(file => file.endsWith('.json'))
    .map(file => {
      const filePath = path.join(GENERATED_CONTENT_DIR, file);
      const stats = fs.statSync(filePath);
      return {
        file,
        filePath,
        mtime: stats.mtime
      };
    })
    .sort((a, b) => b.mtime - a.mtime) // Sort by modification time, newest first
    .slice(0, 1000); // Keep only 1000 most recent
  
  console.log(`Processing ${articleFiles.length} most recent articles...`);
  
  let processed = 0;
  let errors = 0;
  
  for (const { file, filePath } of articleFiles) {
    try {
      // Read article data
      const articleData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Use the slug from the JSON file (which should be clean)
      const slug = articleData.slug;
      
      if (!slug) {
        console.log(`Skipping ${file} - no slug found`);
        continue;
      }
      
      // Validate slug is clean (no URLs, special characters, etc.)
      if (slug.includes('http') || slug.includes('?') || slug.includes('&') || slug.length > 100) {
        console.log(`Skipping ${file} - malformed slug: ${slug.substring(0, 50)}...`);
        continue;
      }
      
      // Create article directory
      const articleDir = path.join(ARTICLES_DIR, slug);
      fs.mkdirSync(articleDir, { recursive: true });
      
      // Create page.tsx
      const pageContent = createArticlePage(articleData);
      fs.writeFileSync(path.join(articleDir, 'page.tsx'), pageContent);
      
      processed++;
      
      if (processed % 100 === 0) {
        console.log(`Processed ${processed} articles...`);
      }
      
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
      errors++;
    }
  }
  
  console.log(`\nRegeneration complete!`);
  console.log(`Processed: ${processed} articles`);
  console.log(`Errors: ${errors}`);
  console.log(`Articles directory: ${ARTICLES_DIR}`);
}

regenerateArticles().catch(console.error);
