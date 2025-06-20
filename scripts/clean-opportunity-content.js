const fs = require('fs');
const path = require('path');

const articlesDir = path.join(process.cwd(), 'generated-content', 'articles');

// Patterns to remove
const removePatterns = [
  /\*\*Status:\*\* Currently accepting applications \| \*\*Posted:\*\* \d+mo ago \| /g,
  /Posted: \d+mo ago/g,
  /\*Last updated: [^|]+ \| Posted \d+mo ago\*/g,
  /🚀 \*\*\[Apply Now for [^\]]+\]\(\)\*\*/g,
  /\[Apply directly here\]\(#\)\./g,
  /Apply via Simplify/gi,
  /Apply Now/gi,
  /📚 \*\*Need more help\?\*\* Check out our \[internship preparation guide\]\(\/internship-prep\) and \[resume templates\]\(\/resume-templates\)\./g
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
      const originalContent = data.content;
      data.content = cleanContent(originalContent);
      
      // Clean meta description
      if (data.metaDescription) {
        data.metaDescription = data.metaDescription
          .replace(/Apply now for the /gi, '')
          .replace(/\. Learn about requirements, application process, and tips for landing this .+ internship\./gi, '');
      }
      
      // Clean title if needed
      if (data.title) {
        data.title = data.title.replace(/Apply now for the /gi, '');
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
