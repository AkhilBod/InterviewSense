const fs = require('fs');
const path = require('path');

const articlesDir = path.join(process.cwd(), 'generated-content', 'articles');

// More comprehensive patterns to remove
const removePatterns = [
  // Posted timestamps
  /\*\*Application Submission:\*\* \d+mo ago/g,
  /Posted: \d+mo ago/g,
  /Posted \d+mo ago/g,
  /\*\*Posted:\*\* \d+mo ago/g,
  
  // Apply buttons and links
  /🚀 \*\*\[Apply Now[^\]]*\]\([^)]*\)\*\*/g,
  /\[Apply directly here\]\([^)]*\)/g,
  /Apply directly here/g,
  /Apply Now/gi,
  /Apply via Simplify/gi,
  
  // Ready to apply sections
  /## Ready to Apply\?[\s\S]*$/g,
  /---\s*## Ready to Apply\?[\s\S]*$/g,
  
  // Help sections
  /📚 \*\*Need more help\?\*\*[^\n]*\n?/g,
  
  // Status lines
  /\*\*Status:\*\* Currently accepting applications \| /g,
  
  // Last updated with posted date
  /\*Last updated: [^|]+ \| Posted \d+mo ago\*/g,
];

// Clean meta descriptions
const metaCleanPatterns = [
  /Apply now for the /gi,
  /\. Learn about requirements, application process, and tips for landing this [^.]*\./gi
];

// Clean titles
const titleCleanPatterns = [
  /Apply now for the /gi
];

function cleanContent(content) {
  let cleaned = content;
  
  // Remove all the patterns
  removePatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });
  
  // Clean up extra whitespace and line breaks
  cleaned = cleaned
    .replace(/\n\n\n+/g, '\n\n') // Multiple line breaks
    .replace(/\s+\n/g, '\n') // Trailing spaces
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Multiple empty lines
    .replace(/---\s*$/, '') // Trailing dashes
    .trim();
    
  return cleaned;
}

function processArticleFiles() {
  const files = fs.readdirSync(articlesDir).filter(file => file.endsWith('.json'));
  let processed = 0;
  
  console.log(`Found ${files.length} article files to process...`);
  
  files.forEach(file => {
    const filePath = path.join(articlesDir, file);
    
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Clean the content
      if (data.content) {
        data.content = cleanContent(data.content);
      }
      
      // Clean meta description
      if (data.metaDescription) {
        metaCleanPatterns.forEach(pattern => {
          data.metaDescription = data.metaDescription.replace(pattern, '');
        });
        data.metaDescription = data.metaDescription.trim();
      }
      
      // Clean title
      if (data.title) {
        titleCleanPatterns.forEach(pattern => {
          data.title = data.title.replace(pattern, '');
        });
        data.title = data.title.trim();
      }
      
      // Clean openGraph description
      if (data.openGraph && data.openGraph.description) {
        metaCleanPatterns.forEach(pattern => {
          data.openGraph.description = data.openGraph.description.replace(pattern, '');
        });
        data.openGraph.description = data.openGraph.description.trim();
      }
      
      // Write back the cleaned data
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      processed++;
      
      if (processed % 100 === 0) {
        console.log(`Processed ${processed} files...`);
      }
      
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  });
  
  console.log(`✅ Successfully processed ${processed} article files`);
}

// Run the cleanup
processArticleFiles();
