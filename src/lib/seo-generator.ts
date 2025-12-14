/**
 * SEO Article Generator
 * Generates optimized content for internship listings
 */

import { InternshipListing } from './internship-scraper';

export interface SEOArticle {
  slug: string;
  title: string;
  metaDescription: string;
  keywords: string[];
  content: string;
  structuredData: any;
  openGraph: {
    title: string;
    description: string;
    image: string;
    url: string;
  };
  lastUpdated: string;
}

export interface SEOConfig {
  baseUrl: string;
  defaultImage: string;
  companyName: string;
}

export class SEOArticleGenerator {
  private config: SEOConfig;

  constructor(config: SEOConfig) {
    this.config = config;
  }

  generateArticle(listing: InternshipListing): SEOArticle {
    const keywords = this.generateKeywords(listing);
    const title = this.generateTitle(listing);
    const metaDescription = this.generateMetaDescription(listing);
    const content = this.generateContent(listing);
    const structuredData = this.generateStructuredData(listing);
    const openGraph = this.generateOpenGraph(listing, title, metaDescription);

    return {
      slug: listing.slug,
      title,
      metaDescription,
      keywords,
      content,
      structuredData,
      openGraph,
      lastUpdated: new Date().toISOString()
    };
  }

  private generateKeywords(listing: InternshipListing): string[] {
    const baseKeywords = [
      `${listing.company} internship`,
      `${listing.role} internship`,
      `${listing.company} ${listing.role}`,
      `summer 2025 internship`,
      `tech internship ${listing.location}`,
      `${listing.category} internship`,
      `${listing.company} careers`,
      `internship application`,
      `tech jobs 2025`
    ];

    // Add location-specific keywords
    const locationParts = listing.location.split(',').map(part => part.trim());
    locationParts.forEach(part => {
      baseKeywords.push(`${part} internship`);
      baseKeywords.push(`${listing.company} ${part}`);
    });

    // Add category-specific keywords
    const categoryKeywords = this.getCategoryKeywords(listing.category);
    baseKeywords.push(...categoryKeywords);

    return baseKeywords.filter((keyword, index, self) => 
      self.indexOf(keyword) === index
    ).slice(0, 15); // Limit to 15 keywords
  }

  private getCategoryKeywords(category: string): string[] {
    const categoryMap: Record<string, string[]> = {
      'software': [
        'software engineering internship',
        'software developer internship',
        'programming internship',
        'coding internship',
        'full stack internship',
        'backend internship',
        'frontend internship'
      ],
      'data-science': [
        'data science internship',
        'machine learning internship',
        'AI internship',
        'data analyst internship',
        'data engineering internship',
        'analytics internship'
      ],
      'quant': [
        'quantitative finance internship',
        'quant internship',
        'trading internship',
        'finance internship',
        'algorithmic trading internship'
      ],
      'hardware': [
        'hardware engineering internship',
        'electrical engineering internship',
        'computer hardware internship',
        'FPGA internship',
        'embedded systems internship'
      ]
    };

    return categoryMap[category] || [];
  }

  private generateTitle(listing: InternshipListing): string {
    const year = '2025';
    const templates = [
      `${listing.company} ${listing.role} Internship ${year} - Apply Now in ${listing.location}`,
      `${listing.role} Summer Internship at ${listing.company} | ${listing.location} ${year}`,
      `How to Get ${listing.company} ${listing.role} Internship in ${listing.location} - ${year}`,
      `${listing.company} Internship: ${listing.role} Position in ${listing.location} (${year})`
    ];

    // Choose template based on company length to optimize title length
    const selectedTemplate = listing.company.length > 15 ? templates[1] : templates[0];
    
    // Ensure title is under 60 characters for SEO
    if (selectedTemplate.length > 60) {
      return templates[1].length <= 60 ? templates[1] : templates[3];
    }

    return selectedTemplate;
  }

  private generateMetaDescription(listing: InternshipListing): string {
    const statusText = listing.isActive ? 'Apply now' : 'Get insights';
    const sponsorshipText = listing.requiresSponsorship ? ' (No sponsorship)' : '';
    
    return `${statusText} for the ${listing.company} ${listing.role} internship in ${listing.location}. Learn about requirements, application process, and tips for landing this Summer 2025 tech internship${sponsorshipText}.`;
  }

  private generateContent(listing: InternshipListing): string {
    const content = `
# ${listing.company} ${listing.role} Internship - Summer 2025

${this.generateIntroSection(listing)}

## About the ${listing.role} Internship at ${listing.company}

${this.generateAboutSection(listing)}

## Application Requirements and Process

${this.generateApplicationSection(listing)}

## ${listing.company} Company Overview

${this.generateCompanySection(listing)}

## Location: ${listing.location}

${this.generateLocationSection(listing)}

## Tips for Landing This Internship

${this.generateTipsSection(listing)}

## Similar Internship Opportunities

${this.generateSimilarOpportunitiesSection(listing)}

## Application Timeline and Deadlines

${this.generateTimelineSection(listing)}

## Frequently Asked Questions

${this.generateFAQSection(listing)}

## Conclusion

${this.generateConclusionSection(listing)}

---

*Last updated: ${new Date().toLocaleDateString()} | Posted ${listing.daysAgo} ago*

${this.generateApplicationCTA(listing)}
    `.trim();

    return content;
  }

  private generateIntroSection(listing: InternshipListing): string {
    const statusText = listing.isActive 
      ? 'Currently accepting applications' 
      : 'Recently posted (application may be closed)';
    
    const sponsorshipNote = listing.requiresSponsorship 
      ? ' **Note: This position does not offer visa sponsorship.**'
      : '';

    const citizenshipNote = listing.requiresCitizenship
      ? ' **Note: This position requires U.S. citizenship.**'
      : '';

    return `
Are you looking for a ${listing.role.toLowerCase()} internship at ${listing.company}? This comprehensive guide covers everything you need to know about applying for the **${listing.company} ${listing.role} internship** in ${listing.location} for Summer 2025.

**Status:** ${statusText} | **Posted:** ${listing.daysAgo} ago | **Location:** ${listing.location}${sponsorshipNote}${citizenshipNote}

This internship opportunity is part of the ${this.getCategoryDisplayName(listing.category)} field and offers valuable hands-on experience at one of the industry's leading companies.
    `.trim();
  }

  private generateAboutSection(listing: InternshipListing): string {
    const categoryContext = this.getCategoryContext(listing.category);
    
    return `
The ${listing.role} internship at ${listing.company} offers students an exceptional opportunity to gain real-world experience in ${categoryContext}. As an intern, you'll work alongside experienced professionals on meaningful projects that directly impact the company's success.

### What You'll Do:
- Collaborate with cross-functional teams on ${listing.category} projects
- Apply theoretical knowledge to practical, real-world challenges
- Participate in code reviews, design discussions, and team meetings
- Contribute to ${listing.company}'s innovative technology solutions
- Receive mentorship from senior engineers and industry experts

### Program Highlights:
- Duration: Summer 2025 (typically 10-12 weeks)
- Location: ${listing.location}
- Competitive compensation and benefits
- Networking opportunities with industry professionals
- Potential for full-time offer upon graduation
    `.trim();
  }

  private generateApplicationSection(listing: InternshipListing): string {
    const applicationLink = listing.applicationLink || '#';
    const simplifyText = listing.simplifyLink 
      ? `\n\n**Quick Apply:** Use [Simplify](${listing.simplifyLink}) to autofill your application with one click.`
      : '';

    return `
### How to Apply

${listing.isActive ? 
  `The application for this position is currently open. [Apply directly here](${applicationLink}).` :
  `This position was recently posted but may no longer be accepting applications. Check the [application link](${applicationLink}) for current status.`
}${simplifyText}

### Typical Requirements:
- Currently enrolled in a Computer Science, Engineering, or related program
- Expected graduation date between December 2025 and June 2027
- Strong programming fundamentals
- Previous internship or project experience (preferred)
- Excellent problem-solving and communication skills
- Ability to work collaboratively in a team environment

### Application Materials:
- Updated resume highlighting relevant coursework and projects
- Cover letter tailored to ${listing.company} and this specific role
- Academic transcripts (may be required)
- Portfolio or GitHub repository showcasing your work
- References from professors or previous employers

### Application Tips:
1. **Tailor your resume** to highlight ${listing.category} experience
2. **Research ${listing.company}** thoroughly and mention specific projects or values
3. **Showcase relevant projects** that demonstrate your technical abilities
4. **Apply early** - many companies review applications on a rolling basis
5. **Follow up** appropriately after submitting your application
    `.trim();
  }

  private generateCompanySection(listing: InternshipListing): string {
    // This would ideally pull from a company database, but for now we'll generate generic content
    return `
${listing.company} is a leading technology company known for innovation and excellence in the ${listing.category} space. The company offers interns the opportunity to work on cutting-edge projects while building valuable skills and professional networks.

### Why Choose ${listing.company}?
- **Innovation:** Work on projects that push the boundaries of technology
- **Mentorship:** Learn from experienced professionals in your field
- **Growth:** Develop both technical and professional skills
- **Impact:** Contribute to products and services used by millions
- **Culture:** Experience a collaborative and inclusive work environment
- **Career Development:** Access to training, workshops, and career guidance

### Internship Program Benefits:
- Competitive hourly compensation
- Housing stipend or corporate housing (location dependent)
- Health and wellness benefits
- Professional development opportunities
- Networking events and social activities
- Potential for return offers and full-time employment
    `.trim();
  }

  private generateLocationSection(listing: InternshipListing): string {
    const locationParts = listing.location.split(',').map(part => part.trim());
    const primaryLocation = locationParts[0];
    
    return `
This internship is located in **${listing.location}**, offering interns the opportunity to experience working in a dynamic tech hub.

### About Working in ${primaryLocation}:
- Access to a thriving tech ecosystem and networking opportunities
- Vibrant cultural scene and recreational activities
- Public transportation and commuting options
- Cost of living considerations for interns
- Housing resources and recommendations

### Workplace Environment:
- Modern office facilities with state-of-the-art technology
- Collaborative workspaces designed for innovation
- On-site amenities and employee perks
- Flexible work arrangements (policies vary by company)
- Health and safety protocols

*Note: Some positions may offer remote or hybrid work options. Check with ${listing.company} for specific arrangements.*
    `.trim();
  }

  private generateTipsSection(listing: InternshipListing): string {
    return `
### Technical Preparation:
1. **Review fundamentals** in ${this.getCategorySkills(listing.category)}
2. **Practice coding** on platforms like LeetCode, HackerRank, or Codewars
3. **Build projects** that demonstrate your skills in relevant technologies
4. **Contribute to open source** projects to show collaboration skills
5. **Learn ${listing.company}'s tech stack** through online resources and documentation

### Interview Preparation:
- **Technical interviews:** Expect questions on data structures, algorithms, and system design
- **Behavioral interviews:** Prepare STAR method responses for common questions
- **Company research:** Understand ${listing.company}'s mission, values, and recent news
- **Mock interviews:** Practice with peers, career services, or online platforms
- **Questions to ask:** Prepare thoughtful questions about the role and company culture

### Standing Out as a Candidate:
- **Demonstrate passion** for ${listing.category} and ${listing.company}'s work
- **Show impact** in your previous experiences and projects
- **Highlight leadership** experience and teamwork abilities
- **Express curiosity** and eagerness to learn
- **Communicate clearly** both verbally and in writing

### Timeline Strategy:
- Apply as early as possible when applications open
- Follow up appropriately (but don't be pushy)
- Prepare for multiple rounds of interviews
- Be patient - the process can take several weeks
- Have backup options while waiting for responses
    `.trim();
  }

  private generateSimilarOpportunitiesSection(listing: InternshipListing): string {
    return `
If you're interested in this ${listing.role} position, you might also want to explore these similar opportunities:

### Other ${listing.category} Internships:
- Similar roles at companies in ${listing.location}
- ${listing.role} positions at other major tech companies
- Related roles in ${this.getCategoryDisplayName(listing.category)}

### Expanding Your Search:
- **Different locations:** Consider remote or other city options
- **Company size:** Look at startups, mid-size companies, and corporations
- **Role variations:** Explore related positions that match your skills
- **Industry focus:** Consider different sectors that need ${listing.category} talent

### Additional Resources:
- [University career services](https://career.pitt.edu/) for personalized guidance
- Professional associations and student organizations
- Tech meetups and networking events in your area
- Online job boards and internship databases
- LinkedIn for networking and job searching
    `.trim();
  }

  private generateTimelineSection(listing: InternshipListing): string {
    return `
### Application Process Timeline:

**Application Submission:** ${listing.daysAgo} ago
- Applications typically reviewed on a rolling basis
- Early applications often receive faster responses

**Typical Interview Process:**
1. **Resume screening** (1-2 weeks after application)
2. **Phone/video screening** (30-45 minutes)
3. **Technical interview(s)** (1-2 rounds, 45-60 minutes each)
4. **Final round interviews** (may include behavioral and technical components)
5. **Decision and offer** (1-2 weeks after final interview)

### Key Dates to Remember:
- **Early applications:** Best chances for interview consideration
- **Interview seasons:** Most active from January through April
- **Decision timeline:** Offers typically made by March-May
- **Internship start:** Most Summer 2025 programs begin in June

### What to Do While Waiting:
- Continue applying to other positions
- Work on technical skills and personal projects
- Network with professionals in your field
- Prepare for additional interview opportunities
- Stay updated on industry trends and company news
    `.trim();
  }

  private generateFAQSection(listing: InternshipListing): string {
    const sponsorshipFAQ = listing.requiresSponsorship 
      ? `\n\n**Q: Does ${listing.company} sponsor visas for this internship?**\nA: No, this position does not offer visa sponsorship. Candidates must be authorized to work in the country where the position is located.`
      : `\n\n**Q: Does ${listing.company} provide visa sponsorship?**\nA: Check directly with ${listing.company} regarding their visa sponsorship policies for internships.`;

    return `
**Q: What is the duration of this internship?**
A: Most Summer 2025 internships run for 10-12 weeks, typically from June through August. Specific dates vary by company.

**Q: Is this a paid internship?**
A: Yes, ${listing.company} internships are typically paid positions with competitive hourly rates plus benefits.

**Q: What year students can apply?**
A: Most internships are open to undergraduate and graduate students. Specific requirements vary, but typically juniors and seniors have the best chances.

**Q: Can I apply if I'm not a CS major?**
A: Many companies accept students from related fields like Computer Engineering, Electrical Engineering, Mathematics, and other STEM disciplines.

**Q: What programming languages should I know?**
A: Requirements vary by role, but common languages include ${this.getCategoryLanguages(listing.category)}. Check the job description for specific requirements.${sponsorshipFAQ}

**Q: How competitive is this internship?**
A: ${listing.company} internships are highly competitive. Strong technical skills, relevant experience, and early application improve your chances.

**Q: Can this lead to a full-time offer?**
A: Many companies extend full-time offers to successful interns. Performance during the internship is a key factor in receiving an offer.
    `.trim();
  }

  private generateConclusionSection(listing: InternshipListing): string {
    const actionText = listing.isActive 
      ? 'Don\'t miss this opportunity to apply' 
      : 'Keep an eye out for similar opportunities';

    return `
The ${listing.company} ${listing.role} internship represents an excellent opportunity to gain valuable experience in ${this.getCategoryDisplayName(listing.category)} while working at a leading technology company. ${actionText} and take the first step toward launching your career in tech.

Remember to:
- **Apply early** when positions become available
- **Tailor your application** to ${listing.company} specifically
- **Prepare thoroughly** for the interview process
- **Network actively** within the tech community
- **Keep developing** your technical and professional skills

Good luck with your application! The tech industry offers incredible opportunities for motivated students who are willing to put in the effort to prepare and apply strategically.
    `.trim();
  }

  private generateApplicationCTA(listing: InternshipListing): string {
    if (listing.isActive) {
      return `
## Ready to Apply?

🚀 **[Apply Now for ${listing.company} ${listing.role} Internship](${listing.applicationLink})**

${listing.simplifyLink ? `💡 **Quick Apply:** [Use Simplify to autofill your application](${listing.simplifyLink})` : ''}

📚 **Need more help?** Check out our [internship preparation guide](/internship-prep) and [resume templates](/resume-templates).
      `.trim();
    } else {
      return `
## Stay Updated on Similar Opportunities

📧 **Get Notified:** Sign up for our internship alerts to be notified when similar positions become available.

🔍 **Keep Searching:** Browse our [current internship listings](/internships) for more opportunities.

📚 **Prepare for Next Time:** Use our [internship preparation resources](/internship-prep) to get ready for future applications.
      `.trim();
    }
  }

  private getCategoryDisplayName(category: string): string {
    const displayNames: Record<string, string> = {
      'software': 'Software Engineering',
      'data-science': 'Data Science, AI & Machine Learning',
      'quant': 'Quantitative Finance',
      'hardware': 'Hardware Engineering'
    };
    return displayNames[category] || category;
  }

  private getCategoryContext(category: string): string {
    const contexts: Record<string, string> = {
      'software': 'software development and engineering',
      'data-science': 'data science, machine learning, and artificial intelligence',
      'quant': 'quantitative finance and algorithmic trading',
      'hardware': 'hardware engineering and computer systems'
    };
    return contexts[category] || 'technology';
  }

  private getCategorySkills(category: string): string {
    const skills: Record<string, string> = {
      'software': 'data structures, algorithms, object-oriented programming, and system design',
      'data-science': 'statistics, machine learning algorithms, data analysis, and programming',
      'quant': 'mathematical modeling, statistics, programming, and financial markets',
      'hardware': 'digital logic, computer architecture, embedded systems, and hardware design'
    };
    return skills[category] || 'technical fundamentals';
  }

  private getCategoryLanguages(category: string): string {
    const languages: Record<string, string> = {
      'software': 'Java, Python, C++, JavaScript, and Go',
      'data-science': 'Python, R, SQL, and MATLAB',
      'quant': 'Python, C++, R, and MATLAB',
      'hardware': 'C, C++, Verilog, VHDL, and Python'
    };
    return languages[category] || 'Python, Java, and C++';
  }

  private generateStructuredData(listing: InternshipListing): any {
    return {
      "@context": "https://schema.org/",
      "@type": "JobPosting",
      "title": `${listing.role} Internship`,
      "description": `${listing.role} internship opportunity at ${listing.company} in ${listing.location} for Summer 2025.`,
      "hiringOrganization": {
        "@type": "Organization",
        "name": listing.company
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": listing.location
        }
      },
      "datePosted": new Date(Date.now() - this.parseDaysAgo(listing.daysAgo) * 24 * 60 * 60 * 1000).toISOString(),
      "employmentType": "INTERN",
      "workHours": "40 hours per week",
      "jobBenefits": "Competitive compensation, mentorship, professional development",
      "industry": "Technology",
      "occupationalCategory": this.getCategoryDisplayName(listing.category),
      "qualifications": "Currently enrolled in Computer Science or related field",
      "responsibilities": `Work on ${listing.category} projects, collaborate with teams, contribute to innovative solutions`,
      "url": `${this.config.baseUrl}/internships/${listing.slug}`,
      "applicationDeadline": listing.isActive ? "Applications accepted on rolling basis" : "Application may be closed"
    };
  }

  private generateOpenGraph(listing: InternshipListing, title: string, description: string): any {
    return {
      title,
      description,
      image: this.config.defaultImage,
      url: `${this.config.baseUrl}/internships/${listing.slug}`,
      type: 'article',
      site_name: this.config.companyName
    };
  }

  private parseDaysAgo(daysAgoString: string): number {
    const match = daysAgoString.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }
}
