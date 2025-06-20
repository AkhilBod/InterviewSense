const fs = require('fs');
const path = require('path');

const ARTICLES_DIR = path.join(__dirname, '..', 'src', 'app', 'articles');
const SITEMAP_PATH = path.join(__dirname, '..', 'public', 'articles-sitemap.xml');

function generateArticlesSitemap() {
  console.log('Generating articles sitemap...');
  
  if (!fs.existsSync(ARTICLES_DIR)) {
    console.log('Articles directory does not exist');
    return;
  }
  
  const articleFolders = fs.readdirSync(ARTICLES_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(name => !name.includes('http') && !name.includes('?') && !name.includes('&'))
    .sort();
  
  console.log(`Found ${articleFolders.length} clean article folders`);
  
  const baseUrl = 'https://interviewsense.ai'; // Update with your actual domain
  const now = new Date().toISOString();
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  articleFolders.forEach(folder => {
    sitemap += `  <url>
    <loc>${baseUrl}/articles/${folder}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  });
  
  sitemap += `</urlset>`;
  
  fs.writeFileSync(SITEMAP_PATH, sitemap);
  console.log(`Articles sitemap generated: ${SITEMAP_PATH}`);
  console.log(`Added ${articleFolders.length} URLs to sitemap`);
}

generateArticlesSitemap();
