/**
 * Build-time Internship Data Generator
 * 
 * This script runs during the build process to fetch and generate
 * internship articles as static JSON files. Called from package.json
 * build script to ensure fresh data is available at build time.
 */

import fs from 'fs';
import path from 'path';

const ARTICLES_DIR = path.join(process.cwd(), 'generated-content', 'articles');
const TRACKER_DIR = path.join(process.cwd(), 'data', 'internships');
const MAX_AGE_DAYS = 30;

interface ParsedRow {
  slug: string;
  company: string;
  role: string;
  location: string;
  apply_link: string;
  date_posted: string;
  category: string;
}

async function generateInternshipData() {
  try {
    console.log('🚀 Fetching internship data from SimplifyJobs...');
    
    // Fetch README
    const md = await fetch(
      'https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/dev/README.md',
      { cache: 'no-store' }
    ).then(r => r.text());

    // Parse data
    const rows = parseAllSections(md);
    console.log(`📊 Parsed ${rows.length} internship listings`);

    if (rows.length === 0) {
      console.log('⚠️ No listings found - README format may have changed');
      return;
    }

    // Ensure directories exist
    for (const dir of [ARTICLES_DIR, TRACKER_DIR]) {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }

    const now = new Date().toISOString();
    const currentSlugs = new Set(rows.map(r => r.slug));

    // Generate article files
    for (const row of rows) {
      const articlePath = path.join(ARTICLES_DIR, `${row.slug}.json`);
      const trackerPath = path.join(TRACKER_DIR, `${row.slug}.json`);

      const article = buildArticleJson(row, now);
      fs.writeFileSync(articlePath, JSON.stringify(article, null, 2));
      fs.writeFileSync(trackerPath, JSON.stringify({ slug: row.slug, synced_at: now }, null, 2));
    }

    // Prune stale files
    const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
    if (fs.existsSync(TRACKER_DIR)) {
      const trackerFiles = fs.readdirSync(TRACKER_DIR).filter(f => f.endsWith('.json'));
      
      for (const file of trackerFiles) {
        const slug = file.replace('.json', '');
        const tp = path.join(TRACKER_DIR, file);
        const { mtimeMs } = fs.statSync(tp);

        if (mtimeMs < cutoff && !currentSlugs.has(slug)) {
          fs.unlinkSync(tp);
          const ap = path.join(ARTICLES_DIR, file);
          if (fs.existsSync(ap)) fs.unlinkSync(ap);
        }
      }
    }

    console.log(`✅ Generated ${rows.length} internship articles`);
    
  } catch (error) {
    console.error('❌ Error generating internship data:', error);
    // Don't fail the build - just log the error
  }
}

function buildArticleJson(row: ParsedRow, now: string) {
  const title = `${row.company} ${row.role} Interview Questions`;
  const desc = `Ace your ${row.company} ${row.role} interview with AI-powered practice questions and feedback. Get ready for your ${row.location} internship.`;

  return {
    slug: row.slug,
    title,
    metaDescription: desc,
    keywords: [
      `${row.company} interview`,
      `${row.company} ${row.role} interview questions`,
      `${row.company} internship`,
      'interview practice',
      'AI interview prep',
      row.role,
      `${row.category} interview questions`,
    ],
    content: [
      `**Company:** ${row.company}`,
      `**Role:** ${row.role}`,
      `**Location:** ${row.location}`,
      `**Status:** Open`,
      `**Posted:** ${row.date_posted}`,
      row.apply_link ? `\n[Apply here](${row.apply_link})` : '',
    ].join('\n'),
    structuredData: {
      '@context': 'https://schema.org/',
      '@type': 'Article',
      headline: title,
      description: desc,
      author: { '@type': 'Organization', name: 'InterviewSense' },
      publisher: { '@type': 'Organization', name: 'InterviewSense' },
      datePublished: now,
      url: `https://www.interviewsense.org/opportunities/${row.slug}`,
    },
    openGraph: {
      title,
      description: desc,
      url: `https://www.interviewsense.org/opportunities/${row.slug}`,
      type: 'article',
      site_name: 'InterviewSense',
    },
    lastUpdated: now,
    originalData: {
      company: row.company,
      role: row.role,
      location: row.location,
      applicationUrl: row.apply_link,
      datePosted: Math.floor(Date.now() / 1000),
      isClosed: false,
      source: 'SimplifyJobs',
      originalData: {
        source: 'Simplify',
        category: row.category,
        company_name: row.company,
        title: row.role,
        active: true,
        date_updated: Math.floor(Date.now() / 1000),
        date_posted: Math.floor(Date.now() / 1000),
        url: row.apply_link,
        locations: row.location.split(',').map((l: string) => l.trim()),
        is_visible: true,
      },
    },
  };
}

function parseAllSections(md: string): ParsedRow[] {
  const rows: ParsedRow[] = [];
  const seenSlugs = new Set<string>();

  const sectionPatterns: { pattern: RegExp; category: string }[] = [
    { pattern: /## 💻 Software Engineering Internship Roles([\s\S]*?)(?=##|$)/, category: 'software' },
    { pattern: /## 🤖 Data Science, AI & Machine Learning Internship Roles([\s\S]*?)(?=##|$)/, category: 'data-science' },
    { pattern: /## 📈 Quantitative Finance Internship Roles([\s\S]*?)(?=##|$)/, category: 'quant' },
    { pattern: /## 🔧 Hardware Engineering Internship Roles([\s\S]*?)(?=##|$)/, category: 'hardware' },
  ];

  let matched = false;
  for (const { pattern, category } of sectionPatterns) {
    const m = md.match(pattern);
    if (!m) continue;
    matched = true;
    rows.push(...parseTable(m[1], category, seenSlugs));
  }

  if (!matched) rows.push(...parseTable(md, 'software', seenSlugs));

  return rows;
}

function parseTable(section: string, category: string, seenSlugs: Set<string>): ParsedRow[] {
  const rows: ParsedRow[] = [];
  
  // Handle HTML table format (Summer 2026 repo)
  const tableRows = section.match(/<tr>[\s\S]*?<\/tr>/g);
  
  if (tableRows) {
    for (const tableRow of tableRows) {
      if (tableRow.includes('<th>') || tableRow.includes('Company')) continue;
      
      const cells = tableRow.match(/<td[^>]*>([\s\S]*?)<\/td>/g);
      if (!cells || cells.length < 4) continue;
      
      const cleanCells = cells.map(cell => 
        cell.replace(/<[^>]*>/g, '').trim().replace(/\s+/g, ' ')
      );
      
      const [rawCompany, rawRole, rawLocation, linksCell, rawAge] = cleanCells;
      
      if (!rawCompany || !rawRole) continue;
      
      const company = rawCompany.replace(/[🛂🇺🇸🔒]/g, '').trim();
      const role = rawRole.replace(/[🛂🇺🇸🔒]/g, '').trim();
      const location = (rawLocation || '').replace(/<br>/g, ', ').trim();
      
      const applyMatch = cells[3]?.match(/href="([^"]*)"[^>]*><img[^>]*alt="Apply"/i);
      const apply_link = applyMatch?.[1] ?? '';
      
      if (!apply_link) continue;
      
      let slug = `${company}-${role}-${location.split(',')[0].trim()}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 100);
      
      if (seenSlugs.has(slug)) slug = `${slug}-${seenSlugs.size}`;
      seenSlugs.add(slug);
      
      rows.push({
        slug,
        company,
        role,
        location,
        apply_link,
        date_posted: (rawAge || '').trim(),
        category,
      });
    }
  }
  
  return rows;
}

// Run the generator
generateInternshipData();