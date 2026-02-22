import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import { NextRequest } from "next/server";

/**
 * Autonomous Internship Sync — Vercel Cron
 *
 * Runs daily. Fetches the SimplifyJobs README, parses every open listing,
 * writes each one as a JSON article into generated-content/articles/ (the
 * same directory your existing /opportunities and /opportunities/[slug]
 * pages already read from), prunes stale files, appends new slugs to the
 * internship sitemap, and revalidates affected pages.
 *
 * Nothing in the existing listing or slug pages needs to change — they
 * continue to read from generated-content/articles/ as before, and the
 * new files follow the exact same schema.
 */

const ARTICLES_DIR = path.join(process.cwd(), "generated-content", "articles");
const TRACKER_DIR = path.join(process.cwd(), "data", "internships");
const SITEMAP_PATH = path.join(process.cwd(), "public", "sitemap-internships.xml");
const BASE_URL = "https://www.interviewsense.org";
const MAX_AGE_DAYS = 30;

export const dynamic = "force-dynamic";
export const maxDuration = 60; // allow up to 60 s on Vercel

export async function GET(req: NextRequest) {
  // ── Auth ───────────────────────────────────────────────────────
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // ── 1. Fetch the SimplifyJobs README ─────────────────────────
    const md = await fetch(
      "https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/dev/README.md",
      { cache: "no-store" }
    ).then((r) => r.text());

    // ── 2. Parse all sections into flat rows ─────────────────────
    const rows = parseAllSections(md);

    if (rows.length === 0) {
      return Response.json(
        { error: "Parsed 0 rows — README format may have changed" },
        { status: 500 }
      );
    }

    // ── 3. Ensure directories exist ──────────────────────────────
    for (const dir of [ARTICLES_DIR, TRACKER_DIR]) {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }

    // ── 4. Write article JSON files (same schema as existing) ────
    const now = new Date().toISOString();
    const newSlugs: string[] = [];
    const currentSlugs = new Set<string>();

    for (const row of rows) {
      currentSlugs.add(row.slug);
      const articlePath = path.join(ARTICLES_DIR, `${row.slug}.json`);
      const trackerPath = path.join(TRACKER_DIR, `${row.slug}.json`);
      const isNew = !fs.existsSync(articlePath);

      // Build article in the EXACT format the existing [slug]/page.tsx reads
      const article = buildArticleJson(row, now);
      fs.writeFileSync(articlePath, JSON.stringify(article, null, 2));

      // Also write a lightweight tracker file (for pruning by mtime)
      fs.writeFileSync(
        trackerPath,
        JSON.stringify({ slug: row.slug, synced_at: now }, null, 2)
      );

      if (isNew) newSlugs.push(row.slug);
    }

    // ── 5. Prune stale tracker + article files (>30 days) ────────
    const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
    const trackerFiles = fs
      .readdirSync(TRACKER_DIR)
      .filter((f) => f.endsWith(".json"));
    const deletedSlugs: string[] = [];

    for (const file of trackerFiles) {
      const slug = file.replace(".json", "");
      const tp = path.join(TRACKER_DIR, file);
      const { mtimeMs } = fs.statSync(tp);

      // Delete if stale AND not in the current parse (still active = keep)
      if (mtimeMs < cutoff && !currentSlugs.has(slug)) {
        fs.unlinkSync(tp);
        const ap = path.join(ARTICLES_DIR, file);
        if (fs.existsSync(ap)) fs.unlinkSync(ap);
        deletedSlugs.push(slug);
      }
    }

    // ── 6. Append new slugs to sitemap-internships.xml ───────────
    if (newSlugs.length > 0) {
      const today = now.split("T")[0];
      const newEntries = newSlugs
        .map(
          (slug) =>
            `  <url>\n    <loc>${BASE_URL}/opportunities/${slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`
        )
        .join("\n");

      if (fs.existsSync(SITEMAP_PATH)) {
        let xml = fs.readFileSync(SITEMAP_PATH, "utf-8");
        xml = xml.replace("</urlset>", `${newEntries}\n</urlset>`);
        fs.writeFileSync(SITEMAP_PATH, xml);
      } else {
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          `  <url>`,
          `    <loc>${BASE_URL}/opportunities</loc>`,
          `    <lastmod>${today}</lastmod>`,
          `    <changefreq>daily</changefreq>`,
          `    <priority>0.9</priority>`,
          `  </url>`,
          newEntries,
          `</urlset>`,
        ].join("\n");
        fs.writeFileSync(SITEMAP_PATH, xml);
      }
    }

    // ── 7. Revalidate existing pages ─────────────────────────────
    revalidatePath("/opportunities");
    revalidatePath("/opportunities/[slug]", "page");
    revalidatePath("/internship-opportunities");

    return Response.json({
      synced: rows.length,
      new: newSlugs.length,
      deleted: deletedSlugs.length,
      newSlugs: newSlugs.slice(0, 25),
      deletedSlugs: deletedSlugs.slice(0, 25),
    });
  } catch (err: any) {
    console.error("sync-internships error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// ─── Article Builder ──────────────────────────────────────────────
// Outputs the EXACT shape that /opportunities/[slug]/page.tsx expects.

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
      "interview practice",
      "AI interview prep",
      row.role,
      `${row.category} interview questions`,
    ],
    content: [
      `**Company:** ${row.company}`,
      `**Role:** ${row.role}`,
      `**Location:** ${row.location}`,
      `**Status:** Open`,
      `**Posted:** ${row.date_posted}`,
      row.apply_link ? `\n[Apply here](${row.apply_link})` : "",
    ].join("\n"),
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Article",
      headline: title,
      description: desc,
      author: { "@type": "Organization", name: "InterviewSense" },
      publisher: { "@type": "Organization", name: "InterviewSense" },
      datePublished: now,
      url: `${BASE_URL}/opportunities/${row.slug}`,
    },
    openGraph: {
      title,
      description: desc,
      url: `${BASE_URL}/opportunities/${row.slug}`,
      type: "article",
      site_name: "InterviewSense",
    },
    lastUpdated: now,
    originalData: {
      company: row.company,
      role: row.role,
      location: row.location,
      applicationUrl: row.apply_link,
      datePosted: Math.floor(Date.now() / 1000),
      isClosed: false,
      source: "SimplifyJobs",
      originalData: {
        source: "Simplify",
        category: row.category,
        company_name: row.company,
        title: row.role,
        active: true,
        date_updated: Math.floor(Date.now() / 1000),
        date_posted: Math.floor(Date.now() / 1000),
        url: row.apply_link,
        locations: row.location.split(",").map((l: string) => l.trim()),
        is_visible: true,
      },
    },
  };
}

// ─── Parsing Helpers ──────────────────────────────────────────────

interface ParsedRow {
  slug: string;
  company: string;
  role: string;
  location: string;
  apply_link: string;
  date_posted: string;
  category: string;
}

/**
 * Extract every category section from the SimplifyJobs README
 * and parse all table rows into a flat listing array.
 */
function parseAllSections(md: string): ParsedRow[] {
  const rows: ParsedRow[] = [];
  const seenSlugs = new Set<string>();

  const sectionPatterns: { pattern: RegExp; category: string }[] = [
    { pattern: /## 💻 Software Engineering Internship Roles([\s\S]*?)(?=##|$)/, category: "software" },
    { pattern: /## 🤖 Data Science, AI & Machine Learning Internship Roles([\s\S]*?)(?=##|$)/, category: "data-science" },
    { pattern: /## 📈 Quantitative Finance Internship Roles([\s\S]*?)(?=##|$)/, category: "quant" },
    { pattern: /## 🔧 Hardware Engineering Internship Roles([\s\S]*?)(?=##|$)/, category: "hardware" },
  ];

  let matched = false;
  for (const { pattern, category } of sectionPatterns) {
    const m = md.match(pattern);
    if (!m) continue;
    matched = true;
    rows.push(...parseTable(m[1], category, seenSlugs));
  }

  // Fallback: treat entire file as one table
  if (!matched) rows.push(...parseTable(md, "software", seenSlugs));

  return rows;
}

function parseTable(
  section: string,
  category: string,
  seenSlugs: Set<string>
): ParsedRow[] {
  const rows: ParsedRow[] = [];
  
  // Handle HTML table format (Summer 2026 repo uses HTML tables)
  const tableRows = section.match(/<tr>[\s\S]*?<\/tr>/g);
  
  if (tableRows) {
    for (const tableRow of tableRows) {
      // Skip header rows
      if (tableRow.includes('<th>') || tableRow.includes('Company')) continue;
      
      // Extract table cells
      const cells = tableRow.match(/<td[^>]*>([\s\S]*?)<\/td>/g);
      if (!cells || cells.length < 4) continue;
      
      // Clean and extract content from each cell
      const cleanCells = cells.map(cell => 
        cell.replace(/<[^>]*>/g, '').trim().replace(/\s+/g, ' ')
      );
      
      const [rawCompany, rawRole, rawLocation, linksCell, rawAge] = cleanCells;
      
      if (!rawCompany || !rawRole) continue;
      
      // Extract company name (remove any extra formatting)
      const company = rawCompany.replace(/[🛂🇺🇸🔒]/g, '').trim();
      const role = rawRole.replace(/[🛂🇺🇸🔒]/g, '').trim();
      const location = (rawLocation || '').replace(/<br>/g, ', ').trim();
      
      // Extract apply link from the original HTML cell
      const applyMatch = cells[3]?.match(/href="([^"]*)"[^>]*><img[^>]*alt="Apply"/i);
      const apply_link = applyMatch?.[1] ?? '';
      
      if (!apply_link) continue; // Skip if no apply link
      
      // Generate unique slug
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
    
    return rows;
  }
  
  // Fallback: Handle markdown table format (older repos)
  const lines = section.split("\n");
  let inTable = false;

  for (const line of lines) {
    if (line.includes("🗃️ Inactive roles")) break;

    if (line.includes("|---") || (line.includes("| Company") && line.includes("|"))) {
      inTable = true;
      continue;
    }
    if (!inTable || !line.trim().startsWith("|")) continue;

    const cells = line.split("|").map((s) => s.trim()).filter(Boolean);
    if (cells.length < 4) continue;

    const [rawCompany, rawRole, rawLocation, linksCell, rawDate] = cells;
    if (rawCompany.startsWith("↳")) continue;

    // Company name
    let company = rawCompany;
    const boldLink = rawCompany.match(/\*\*\[([^\]]+)\]/);
    if (boldLink) {
      company = boldLink[1];
    } else {
      company = rawCompany.replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
    }
    company = company.replace(/[🛂🇺🇸🔒]/g, "").trim();

    const role = (rawRole || "").replace(/[🛂🇺🇸🔒]/g, "").replace(/\*\*/g, "").trim();
    const location = (rawLocation || "").trim();
    if (!company || !role) continue;

    // Apply link
    const linkMatch = linksCell?.match(/\[Apply\]\((.*?)\)/i);
    const apply_link = linkMatch?.[1] ?? "";
    if (!apply_link || linksCell?.includes("🔒") || rawRole.includes("🔒")) continue;

    // Slug (unique, ≤100 chars)
    let slug = `${company}-${role}-${location.split(",")[0].trim()}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 100);

    if (seenSlugs.has(slug)) slug = `${slug}-${seenSlugs.size}`;
    seenSlugs.add(slug);

    rows.push({
      slug,
      company,
      role,
      location,
      apply_link,
      date_posted: (rawDate || "").trim(),
      category,
    });
  }

  return rows;
}
