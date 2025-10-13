#!/usr/bin/env node

/**
 * Script to fetch SimplifyJobs Summer 2026 Internships data and convert to InterviewSense format
 * This script fetches data from the SimplifyJobs GitHub repository and generates JSON files
 * compatible with the InterviewSense application format.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const REPO_URL = 'https://api.github.com/repos/SimplifyJobs/Summer2026-Internships/contents';
const GENERATED_CONTENT_DIR = path.join(__dirname, '..', 'generated-content');
const ARTICLES_DIR = path.join(GENERATED_CONTENT_DIR, 'articles');
const DATA_DIR = path.join(GENERATED_CONTENT_DIR, 'data');
const INDEXES_DIR = path.join(GENERATED_CONTENT_DIR, 'indexes');

/**
 * Fetch internship data from SimplifyJobs repository
 */
async function fetchInternshipData() {
  console.log('📡 Fetching internship data from SimplifyJobs repository...');
  
  try {
    const jsonUrl = 'https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/refs/heads/dev/.github/scripts/listings.json';
    const response = await fetch(jsonUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('✓ Successfully fetched internship data');
    console.log(`📄 Found ${data.length} internship listings`);
    
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch internship data:', error.message);
    throw error;
  }
}

/**
 * Process internship data from JSON (take 500 most recent)
 */
function processInternshipsFromJson(data) {
  console.log('📊 Processing internships from JSON data...');
  
  // Take the last 500 items (most recent from bottom)
  const recentData = data.slice(-500);
  console.log(`📅 Taking 500 most recent internships from ${data.length} total`);
  
  const internships = [];
  
  for (const item of recentData) {
    const internship = processJsonInternship(item);
    if (internship) {
      internships.push(internship);
    }
  }
  
  console.log(`✓ Processed ${internships.length} internships`);
  return internships;
}

/**
 * Process a single JSON internship object
 */
function processJsonInternship(item) {
  try {
    // Skip if essential fields are missing
    if (!item.company_name || !item.title) {
      return null;
    }
    
    // Check if internship is active (not closed)
    const isActive = item.is_visible !== false && item.active !== false;
    
    // Skip inactive/closed internships for open positions only
    // Note: We're keeping closed ones for historical data but marking them
    
    // Extract location - handle multiple locations
    let location = 'Remote';
    if (item.locations && item.locations.length > 0) {
      location = item.locations.map(loc => {
        if (typeof loc === 'string') return loc;
        if (loc.name) return loc.name;
        if (loc.city && loc.state) return `${loc.city}, ${loc.state}`;
        if (loc.city) return loc.city;
        return 'Remote';
      }).join(', ');
    } else if (item.location) {
      location = item.location;
    }
    
    return {
      company: item.company_name.trim(),
      role: item.title.trim(),
      location: location,
      applicationUrl: item.url || item.application_url || '',
      datePosted: item.date_posted || item.created_at || '',
      isClosed: !isActive,
      source: 'SimplifyJobs',
      originalData: item
    };
  } catch (error) {
    console.warn('⚠️  Error processing JSON internship:', error.message);
    return null;
  }
}

/**
 * Generate slug from company and role
 */
function generateSlug(company, role, location) {
  const text = `${company} ${role} ${location}`;
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100); // Limit length
}

/**
 * Convert internship to InterviewSense JSON format
 */
function convertToInterviewSenseFormat(internship) {
  const slug = generateSlug(internship.company, internship.role, internship.location);
  const title = `${internship.company} ${internship.role} Interview Questions`;
  const description = `Ace your ${internship.company} ${internship.role} interview with AI-powered practice questions and feedback. Get ready for your ${internship.location} internship.`;
  
  return {
    slug,
    title,
    metaDescription: description,
    keywords: [
      `${internship.company} interview`,
      `${internship.company} ${internship.role} interview questions`,
      `${internship.company} internship`,
      'interview practice',
      'AI interview prep',
      `${internship.company} ${internship.role}`,
      'Software Engineering interview questions'
    ],
    content: `**Company:** ${internship.company}\n**Role:** ${internship.role}\n**Location:** ${internship.location}\n**Status:** ${internship.isClosed ? 'Closed' : 'Open'}\n\n\n`,
    structuredData: {
      '@context': 'https://schema.org/',
      '@type': 'Article',
      headline: title,
      description,
      author: {
        '@type': 'Organization',
        name: 'InterviewSense'
      },
      publisher: {
        '@type': 'Organization',
        name: 'InterviewSense'
      },
      datePublished: new Date().toISOString(),
      url: `https://interviewsense.org/opportunities/${slug}`
    },
    openGraph: {
      title,
      description,
      url: `https://interviewsense.org/opportunities/${slug}`,
      type: 'article',
      site_name: 'InterviewSense'
    },
    lastUpdated: new Date().toISOString(),
    originalData: internship
  };
}

/**
 * Ensure directories exist
 */
function ensureDirectories() {
  const dirs = [GENERATED_CONTENT_DIR, ARTICLES_DIR, DATA_DIR, INDEXES_DIR];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✓ Created directory: ${dir}`);
    }
  });
}

/**
 * Save internship as JSON file
 */
function saveInternshipFile(internshipData) {
  const filename = `${internshipData.slug}.json`;
  const filepath = path.join(ARTICLES_DIR, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(internshipData, null, 2));
  return filename;
}

/**
 * Generate summary data file
 */
function generateSummaryData(internships) {
  const today = new Date().toISOString().split('T')[0];
  const summaryPath = path.join(DATA_DIR, `${today}.json`);
  
  const summary = {
    generatedAt: new Date().toISOString(),
    source: 'SimplifyJobs/Summer2026-Internships',
    totalInternships: internships.length,
    openInternships: internships.filter(i => !i.isClosed).length,
    closedInternships: internships.filter(i => i.isClosed).length,
    companies: [...new Set(internships.map(i => i.company))].length,
    locations: [...new Set(internships.map(i => i.location))].length,
    internships: internships.map(i => ({
      slug: generateSlug(i.company, i.role, i.location),
      company: i.company,
      role: i.role,
      location: i.location,
      isClosed: i.isClosed
    }))
  };
  
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`✓ Generated summary data: ${summaryPath}`);
  
  return summary;
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🚀 Starting SimplifyJobs data ingestion...');
    
    // Ensure directories exist
    ensureDirectories();
    
    // Fetch and parse data
    const rawInternships = await fetchInternshipData();
    const internships = processInternshipsFromJson(rawInternships);
    
    if (internships.length === 0) {
      console.warn('⚠️  No internships found in the data');
      return;
    }
    
    // Convert and save internships
    console.log('💾 Converting and saving internship data...');
    let savedCount = 0;
    
    for (const internship of internships) {
      try {
        const internshipData = convertToInterviewSenseFormat(internship);
        const filename = saveInternshipFile(internshipData);
        savedCount++;
        
        if (savedCount % 50 === 0) {
          console.log(`✓ Saved ${savedCount}/${internships.length} internships...`);
        }
      } catch (error) {
        console.warn(`⚠️  Error saving internship for ${internship.company}: ${error.message}`);
      }
    }
    
    // Generate summary
    const summary = generateSummaryData(internships);
    
    console.log('\n✅ Data ingestion completed successfully!');
    console.log(`📊 Total internships processed: ${internships.length}`);
    console.log(`💾 Files saved: ${savedCount}`);
    console.log(`🏢 Unique companies: ${summary.companies}`);
    console.log(`📍 Unique locations: ${summary.locations}`);
    console.log(`✅ Open positions: ${summary.openInternships}`);
    console.log(`🔒 Closed positions: ${summary.closedInternships}`);
    
  } catch (error) {
    console.error('❌ Error during data ingestion:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, fetchInternshipData, processInternshipsFromJson, convertToInterviewSenseFormat };