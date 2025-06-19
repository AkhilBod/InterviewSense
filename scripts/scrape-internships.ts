// Scraper for SimplifyJobs Summer2025 Internships
// Fetches data from GitHub and creates SEO articles for each company

import * as fs from 'fs';
import * as path from 'path';

interface InternshipData {
  company: string;
  position: string;
  location: string;
  applyUrl: string;
  simplifyUrl: string;
  postedDays: string;
  slug: string;
  companySlug: string;
}

interface CompanyData {
  name: string;
  slug: string;
  tier: string;
  locations: string[];
  typical_questions: number;
  difficulty: string;
  focus_areas: string[];
}

// Map common job titles to our standardized roles
const roleMapping: Record<string, any> = {
  'Software Engineer': {
    title: "Software Engineer Intern",
    slug: "software-engineer-intern",
    description: "Entry-level software development positions",
    skills: ["Data Structures", "Algorithms", "System Design", "Coding"],
    difficulty: "Medium"
  },
  'Software Developer': {
    title: "Software Developer Intern",
    slug: "software-developer-intern", 
    description: "Software development and programming roles",
    skills: ["Programming", "Web Development", "APIs", "Databases"],
    difficulty: "Medium"
  },
  'SDE': {
    title: "SDE Intern",
    slug: "sde-intern",
    description: "Software Development Engineer internship positions", 
    skills: ["Data Structures", "Algorithms", "System Design", "Object-Oriented Programming"],
    difficulty: "Medium-Hard"
  },
  'Data Science': {
    title: "Data Science Intern",
    slug: "data-science-intern",
    description: "Data analysis and machine learning internships",
    skills: ["Statistics", "Python", "Machine Learning", "SQL"],
    difficulty: "Medium-Hard"
  },
  'Machine Learning': {
    title: "Machine Learning Intern", 
    slug: "machine-learning-intern",
    description: "AI and ML engineering positions",
    skills: ["Machine Learning", "Python", "Statistics", "Deep Learning"],
    difficulty: "Hard"
  },
  'Frontend': {
    title: "Frontend Developer Intern",
    slug: "frontend-developer-intern",
    description: "Frontend web development internships", 
    skills: ["JavaScript", "React", "HTML/CSS", "Web Development"],
    difficulty: "Medium"
  },
  'Backend': {
    title: "Backend Developer Intern",
    slug: "backend-developer-intern",
    description: "Backend system development roles",
    skills: ["APIs", "Databases", "System Design", "Server Architecture"], 
    difficulty: "Medium-Hard"
  },
  'Full Stack': {
    title: "Full Stack Developer Intern",
    slug: "full-stack-developer-intern",
    description: "End-to-end web development positions",
    skills: ["JavaScript", "React", "APIs", "Databases"],
    difficulty: "Medium-Hard"
  }
};

// Default company tiers and data
const getCompanyData = (companyName: string): CompanyData => {
  const faangCompanies = ['Google', 'Meta', 'Amazon', 'Apple', 'Netflix', 'Microsoft'];
  const bigTechCompanies = ['Nvidia', 'Tesla', 'Salesforce', 'Oracle', 'IBM', 'Adobe'];
  const unicornCompanies = ['Uber', 'Airbnb', 'Spotify', 'Stripe', 'Square', 'Robinhood'];
  
  let tier = 'Growth';
  let typical_questions = 150;
  let difficulty = 'Medium';
  let focus_areas = ['Algorithms', 'System Design', 'Behavioral'];
  
  if (faangCompanies.includes(companyName)) {
    tier = 'FAANG';
    typical_questions = 350;
    difficulty = 'Hard';
    focus_areas = ['Algorithms', 'System Design', 'Behavioral'];
  } else if (bigTechCompanies.includes(companyName)) {
    tier = 'Big Tech';
    typical_questions = 250;
    difficulty = 'Medium-Hard';
  } else if (unicornCompanies.includes(companyName)) {
    tier = 'Unicorn';
    typical_questions = 200;
    difficulty = 'Medium-Hard';
  }
  
  return {
    name: companyName,
    slug: companyName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''),
    tier,
    locations: ['Remote', 'San Francisco', 'New York'], // Default locations
    typical_questions,
    difficulty,
    focus_areas
  };
};

// Extract role from position title
const extractRole = (position: string): any => {
  const positionLower = position.toLowerCase();
  
  for (const [key, role] of Object.entries(roleMapping)) {
    if (positionLower.includes(key.toLowerCase())) {
      return role;
    }
  }
  
  // Default role if no match found
  return roleMapping['Software Engineer'];
};

// Create slug from company and position
const createSlug = (company: string, position: string): string => {
  const companySlug = company.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const role = extractRole(position);
  return `${companySlug}-${role.slug}`;
};

// Fetch and parse the GitHub README
async function fetchInternshipData(): Promise<InternshipData[]> {
  try {
    console.log('🔍 Fetching internship data from GitHub...');
    
    const response = await fetch('https://raw.githubusercontent.com/SimplifyJobs/Summer2025-Internships/dev/README.md');
    const content = await response.text();
    
    // Extract table content between <!-- Please leave a one line gap between this and the table TABLE_START --> and <!-- TABLE_END -->
    const tableStart = content.indexOf('<!-- Please leave a one line gap between this and the table TABLE_START -->');
    const tableEnd = content.indexOf('<!-- TABLE_END -->');
    
    if (tableStart === -1 || tableEnd === -1) {
      throw new Error('Could not find table markers in README');
    }
    
    const tableContent = content.slice(tableStart, tableEnd);
    
    // Parse table rows
    const rows = tableContent.split('\n').filter(line => line.trim().startsWith('<tr>'));
    const internships: InternshipData[] = [];
    
    for (const row of rows) {
      try {
        // Extract company name
        const companyMatch = row.match(/<strong><a[^>]*>([^<]+)<\/a><\/strong>/);
        if (!companyMatch) continue;
        
        const company = companyMatch[1].trim();
        
        // Extract position
        const tdMatches = row.match(/<td[^>]*>([^<]+(?:<[^>]*>[^<]*<\/[^>]*>[^<]*)*)<\/td>/g);
        if (!tdMatches || tdMatches.length < 3) continue;
        
        const position = tdMatches[1].replace(/<\/?td[^>]*>/g, '').trim();
        const location = tdMatches[2].replace(/<\/?td[^>]*>/g, '').trim();
        
        // Extract URLs
        const applyMatch = row.match(/href="([^"]*apply[^"]*)"/);
        const simplifyMatch = row.match(/href="(https:\/\/simplify\.jobs\/p\/[^"]*)"/);
        
        // Extract posted days
        const daysMatch = row.match(/<td[^>]*>(\d+d)<\/td>/);
        const postedDays = daysMatch ? daysMatch[1] : '0d';
        
        const slug = createSlug(company, position);
        const companySlug = company.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        
        internships.push({
          company: company,
          position: position,
          location: location,
          applyUrl: applyMatch ? applyMatch[1] : '',
          simplifyUrl: simplifyMatch ? simplifyMatch[1] : '',
          postedDays: postedDays,
          slug: slug,
          companySlug: companySlug
        });
        
      } catch (error) {
        console.error(`Error parsing row: ${row}`, error);
        continue;
      }
    }
    
    console.log(`✅ Found ${internships.length} internship listings`);
    return internships;
    
  } catch (error) {
    console.error('❌ Error fetching internship data:', error);
    return [];
  }
}

// Generate SEO article for a single internship
function generateInternshipArticle(internship: InternshipData): string {
  const company = getCompanyData(internship.company);
  const role = extractRole(internship.position);
  
  const pageData = {
    type: "internship-listing",
    title: `${internship.company} ${role.title} Interview Questions`,
    slug: internship.slug,
    company: {
      ...company,
      locations: [internship.location, ...company.locations].filter((loc, index, arr) => arr.indexOf(loc) === index).slice(0, 3)
    },
    role: role,
    keyword: `${internship.company} ${role.title} interview questions`,
    description: `Ace your ${internship.company} ${role.title} interview with real questions and AI-powered practice. Apply now!`,
    internship: {
      applyUrl: internship.applyUrl,
      simplifyUrl: internship.simplifyUrl,
      postedDays: internship.postedDays,
      location: internship.location
    }
  };

  return `import { Metadata } from 'next'
import { ProgrammaticSEOTemplate, generateMetadata, getQuestionsForPage } from '@/components/ProgrammaticSEOTemplate'

const pageData = ${JSON.stringify(pageData, null, 2)}

export const metadata: Metadata = generateMetadata(pageData)

export default function ${internship.company.replace(/[^a-zA-Z0-9]/g, '')}${role.title.replace(/[^a-zA-Z0-9]/g, '')}Page() {
  const questions = getQuestionsForPage(pageData)
  const relatedPages = [
    // Related pages would be populated here with similar companies/roles
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

// Main function to generate all articles
async function generateInternshipArticles() {
  console.log('🚀 Starting internship article generation...');
  
  const internships = await fetchInternshipData();
  
  if (internships.length === 0) {
    console.log('❌ No internships found, exiting...');
    return;
  }
  
  const baseDir = path.join(process.cwd(), 'src', 'app', 'internships');
  let successCount = 0;
  let errorCount = 0;
  
  // Process in batches to avoid overwhelming the system
  const batchSize = 50;
  for (let i = 0; i < internships.length; i += batchSize) {
    const batch = internships.slice(i, i + batchSize);
    
    console.log(`📝 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(internships.length/batchSize)} (${batch.length} articles)...`);
    
    await Promise.all(batch.map(async (internship) => {
      try {
        const articleDir = path.join(baseDir, internship.slug);
        const articlePath = path.join(articleDir, 'page.tsx');
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(articleDir)) {
          fs.mkdirSync(articleDir, { recursive: true });
        }
        
        // Skip if file already exists (unless we want to overwrite)
        if (fs.existsSync(articlePath)) {
          console.log(`⏭️  Skipping ${internship.slug} (already exists)`);
          return;
        }
        
        const articleContent = generateInternshipArticle(internship);
        fs.writeFileSync(articlePath, articleContent);
        
        successCount++;
        
      } catch (error) {
        console.error(`❌ Error generating article for ${internship.company}:`, error);
        errorCount++;
      }
    }));
    
    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`✅ Article generation complete!`);
  console.log(`📊 Results: ${successCount} successful, ${errorCount} errors`);
  
  // Generate updated sitemap
  await generateSitemap(internships);
}

// Generate sitemap with all pages
async function generateSitemap(internships: InternshipData[]) {
  console.log('🗺️  Generating sitemap...');
  
  const baseUrl = 'https://interviewsense.org';
  const currentDate = new Date().toISOString().split('T')[0];
  
  const urls = internships.map(internship => 
    `  <url>
    <loc>${baseUrl}/internships/${internship.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  ).join('\n');
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/internships</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
${urls}
</urlset>`;
  
  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap-internships.xml');
  fs.writeFileSync(sitemapPath, sitemap);
  
  console.log(`✅ Sitemap generated with ${internships.length} internship pages`);
}

// Export for use in package.json scripts
if (require.main === module) {
  generateInternshipArticles().catch(console.error);
}

export { generateInternshipArticles, fetchInternshipData };
