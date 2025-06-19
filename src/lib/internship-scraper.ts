/**
 * Internship Data Scraper
 * Scrapes and parses internship data from the SimplifyJobs Summer2025-Internships repository
 */

export interface InternshipListing {
  id: string;
  company: string;
  role: string;
  location: string;
  applicationLink: string;
  simplifyLink?: string;
  daysAgo: string;
  category: 'software' | 'data-science' | 'quant' | 'hardware';
  isActive: boolean;
  requiresSponsorship?: boolean;
  requiresCitizenship?: boolean;
  slug: string;
}

export interface ScrapedData {
  lastUpdated: string;
  totalListings: number;
  activeListings: number;
  categories: {
    software: number;
    'data-science': number;
    quant: number;
    hardware: number;
  };
  listings: InternshipListing[];
}

export class InternshipScraper {
  private static readonly REPO_URL = 'https://raw.githubusercontent.com/SimplifyJobs/Summer2025-Internships/dev/README.md';
  
  async scrapeInternships(): Promise<ScrapedData> {
    try {
      const response = await fetch(InternshipScraper.REPO_URL);
      const markdown = await response.text();
      
      return this.parseMarkdown(markdown);
    } catch (error) {
      console.error('Error scraping internships:', error);
      throw new Error('Failed to scrape internship data');
    }
  }

  private parseMarkdown(markdown: string): ScrapedData {
    const listings: InternshipListing[] = [];
    const sections = this.extractSections(markdown);
    
    // Parse each category section
    const softwareListings = this.parseSection(sections.software, 'software');
    const dataListings = this.parseSection(sections.dataScience, 'data-science');
    const quantListings = this.parseSection(sections.quant, 'quant');
    const hardwareListings = this.parseSection(sections.hardware, 'hardware');
    
    listings.push(...softwareListings, ...dataListings, ...quantListings, ...hardwareListings);
    
    const activeListings = listings.filter(listing => listing.isActive);
    
    return {
      lastUpdated: new Date().toISOString(),
      totalListings: listings.length,
      activeListings: activeListings.length,
      categories: {
        software: softwareListings.length,
        'data-science': dataListings.length,
        quant: quantListings.length,
        hardware: hardwareListings.length,
      },
      listings
    };
  }

  private extractSections(markdown: string) {
    const sections = {
      software: '',
      dataScience: '',
      quant: '',
      hardware: ''
    };

    // Extract Software Engineering section
    const softwareMatch = markdown.match(/## 💻 Software Engineering Internship Roles([\s\S]*?)(?=##|$)/);
    if (softwareMatch) sections.software = softwareMatch[1];

    // Extract Data Science section
    const dataMatch = markdown.match(/## 🤖 Data Science, AI & Machine Learning Internship Roles([\s\S]*?)(?=##|$)/);
    if (dataMatch) sections.dataScience = dataMatch[1];

    // Extract Quant section
    const quantMatch = markdown.match(/## 📈 Quantitative Finance Internship Roles([\s\S]*?)(?=##|$)/);
    if (quantMatch) sections.quant = quantMatch[1];

    // Extract Hardware section
    const hardwareMatch = markdown.match(/## 🔧 Hardware Engineering Internship Roles([\s\S]*?)(?=##|$)/);
    if (hardwareMatch) sections.hardware = hardwareMatch[1];

    return sections;
  }

  private parseSection(sectionContent: string, category: InternshipListing['category']): InternshipListing[] {
    const listings: InternshipListing[] = [];
    
    // Split into lines and find table rows
    const lines = sectionContent.split('\n');
    let inTable = false;
    
    for (const line of lines) {
      // Skip header rows and separators
      if (line.includes('|---') || line.includes('Company') || !line.includes('|')) {
        if (line.includes('|')) inTable = true;
        continue;
      }
      
      if (line.trim().startsWith('|') && inTable) {
        const listing = this.parseTableRow(line, category);
        if (listing) {
          listings.push(listing);
        }
      }
      
      // Stop parsing if we hit inactive roles
      if (line.includes('🗃️ Inactive roles')) {
        break;
      }
    }
    
    return listings;
  }

  private parseTableRow(row: string, category: InternshipListing['category']): InternshipListing | null {
    try {
      // Split by | and clean up
      const columns = row.split('|').map(col => col.trim()).filter(col => col);
      
      if (columns.length < 5) return null;
      
      const [rawCompany, rawRole, location, links, daysAgo] = columns;
      
      // Skip if this is a continuation row (starts with ↳)
      if (rawCompany.startsWith('↳')) {
        return null;
      }
      
      // Clean company name - extract from markdown links
      let company = rawCompany;
      const companyLinkMatch = rawCompany.match(/\*\*\[([^\]]+)\]/);
      if (companyLinkMatch) {
        company = companyLinkMatch[1];
      } else {
        // Remove markdown formatting
        company = rawCompany.replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      }
      
      // Parse application links
      const { applicationLink, simplifyLink } = this.parseLinks(links);
      
      // Check for special markers
      const requiresSponsorship = rawRole.includes('🛂');
      const requiresCitizenship = rawRole.includes('🇺🇸');
      const isActive = !rawRole.includes('🔒');
      
      // Clean up role and company names
      const cleanRole = rawRole.replace(/[🛂🇺🇸🔒]/g, '').trim();
      const cleanCompany = company.replace(/[🛂🇺🇸🔒]/g, '').trim();
      
      // Skip if essential fields are empty
      if (!cleanCompany || !cleanRole || !location) {
        return null;
      }
      
      // Generate unique ID and slug
      const id = this.generateId(cleanCompany, cleanRole, location);
      const slug = this.generateSlug(cleanCompany, cleanRole, location);
      
      return {
        id,
        company: cleanCompany,
        role: cleanRole,
        location: location.trim(),
        applicationLink,
        simplifyLink,
        daysAgo: daysAgo.trim(),
        category,
        isActive,
        requiresSponsorship,
        requiresCitizenship,
        slug
      };
    } catch (error) {
      console.error('Error parsing table row:', row, error);
      return null;
    }
  }

  private parseLinks(linksColumn: string): { applicationLink: string; simplifyLink?: string } {
    // Look for Apply and Simplify links
    const applyMatch = linksColumn.match(/\[Apply\]\((.*?)\)/);
    const simplifyMatch = linksColumn.match(/\[.*?Simplify.*?\]\((.*?)\)/i);
    
    return {
      applicationLink: applyMatch ? applyMatch[1] : '',
      simplifyLink: simplifyMatch ? simplifyMatch[1] : undefined
    };
  }

  private generateId(company: string, role: string, location: string): string {
    const base = `${company}-${role}-${location}`.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100); // Limit length
    
    // Add a hash for uniqueness
    const hash = this.simpleHash(base);
    return `${base}-${hash}`;
  }

  private generateSlug(company: string, role: string, location: string): string {
    // Clean company name - remove URLs and special characters
    const cleanCompany = company.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links
      .replace(/\*\*/g, '') // Remove bold markdown
      .replace(/[^a-z0-9\s]/gi, '')
      .trim();
    
    // Clean role name
    const cleanRole = role.replace(/[^a-z0-9\s]/gi, '').trim();
    
    // Clean location - take only first part if multiple locations
    const cleanLocation = location.split(',')[0].trim().replace(/[^a-z0-9\s]/gi, '');
    
    const slug = `${cleanCompany}-${cleanRole}-internship-${cleanLocation}`.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 80); // Limit to 80 characters
    
    return slug;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36).substring(0, 6);
  }
}

// Export instance for easy use
export const internshipScraper = new InternshipScraper();
