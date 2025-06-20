const fs = require('fs');
const path = require('path');

const GENERATED_CONTENT_DIR = path.join(__dirname, '..', 'generated-content', 'articles');
const OPPORTUNITIES_DIR = path.join(__dirname, '..', 'src', 'app', 'opportunities');

// Function to create a clean opportunity page from JSON data
function createOpportunityPage(opportunityData) {
  // Generate function name from slug
  const functionName = opportunityData.slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('') + 'Page';

  return `import { Metadata } from 'next'
import { ProgrammaticSEOTemplate, generateMetadata, getQuestionsForPage } from '@/components/ProgrammaticSEOTemplate'

const pageData = ${JSON.stringify(opportunityData, null, 2)}

export const metadata: Metadata = generateMetadata(pageData)

export default function ${functionName}() {
  const questions = getQuestionsForPage(pageData)
  const relatedPages = [
    // Related pages would be populated here
  ]

  return (
    <ProgrammaticSEOTemplate 
      data={pageData}
      questions={questions}
      relatedPages={relatedPages}
    />
  )
}
`;
}

async function regenerateOpportunities() {
  console.log('Starting opportunities regeneration...');
  
  // Remove existing opportunities directory
  if (fs.existsSync(OPPORTUNITIES_DIR)) {
    console.log('Removing existing opportunities directory...');
    fs.rmSync(OPPORTUNITIES_DIR, { recursive: true, force: true });
  }
  
  // Create new opportunities directory
  fs.mkdirSync(OPPORTUNITIES_DIR, { recursive: true });
  
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
  
  console.log(`Processing ${articleFiles.length} most recent opportunities...`);
  
  let processed = 0;
  let errors = 0;
  
  for (const { file, filePath } of articleFiles) {
    try {
      // Read opportunity data
      const opportunityData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Use the slug from the JSON file (which should be clean)
      const slug = opportunityData.slug;
      
      if (!slug) {
        console.log(`Skipping ${file} - no slug found`);
        continue;
      }
      
      // Validate slug is clean (no URLs, special characters, etc.)
      if (slug.includes('http') || slug.includes('?') || slug.includes('&') || slug.length > 100) {
        console.log(`Skipping ${file} - malformed slug: ${slug.substring(0, 50)}...`);
        continue;
      }
      
      // Create opportunity directory
      const opportunityDir = path.join(OPPORTUNITIES_DIR, slug);
      fs.mkdirSync(opportunityDir, { recursive: true });
      
      // Create page.tsx
      const pageContent = createOpportunityPage(opportunityData);
      fs.writeFileSync(path.join(opportunityDir, 'page.tsx'), pageContent);
      
      processed++;
      
      if (processed % 100 === 0) {
        console.log(`Processed ${processed} opportunities...`);
      }
      
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
      errors++;
    }
  }
  
  console.log(`\nRegeneration complete!`);
  console.log(`Processed: ${processed} opportunities`);
  console.log(`Errors: ${errors}`);
  console.log(`Opportunities directory: ${OPPORTUNITIES_DIR}`);
}

regenerateOpportunities().catch(console.error);
