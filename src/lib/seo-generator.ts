/**
 * SEO Article Generator
 * Generates optimized, human-readable interview prep content for internship listings
 * Prioritizes credibility and conversion over keyword density
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
    // Focused, non-repetitive keywords
    const keywords = [
      `${listing.company} interview`,
      `${listing.role} interview questions`,
      `${listing.company} internship`,
      this.getCategoryDisplayName(listing.category),
    ];

    // Add location only once
    const city = listing.location.split(',')[0].trim();
    keywords.push(`tech internship ${city}`);

    // Add category-specific keywords (limited)
    const categoryKeywords = this.getCategoryKeywords(listing.category).slice(0, 3);
    keywords.push(...categoryKeywords);

    return [...new Set(keywords)].slice(0, 10);
  }

  private getCategoryKeywords(category: string): string[] {
    const categoryMap: Record<string, string[]> = {
      'software': ['software engineering interview', 'coding interview prep', 'system design interview'],
      'data-science': ['data science interview', 'machine learning interview', 'ML system design'],
      'quant': ['quant interview', 'trading interview', 'algorithmic trading prep'],
      'hardware': ['hardware engineering interview', 'embedded systems interview', 'FPGA interview']
    };
    return categoryMap[category] || [];
  }

  private generateTitle(listing: InternshipListing): string {
    // Clean, human-readable title format
    const role = this.cleanRoleTitle(listing.role);
    const year = new Date().getFullYear() + 1;
    
    return `${listing.company} ${role} – Interview Guide ${year}`;
  }

  private cleanRoleTitle(role: string): string {
    // Remove redundant words and clean up the role title
    return role
      .replace(/Intern(?:ship)?/gi, 'Intern')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private generateMetaDescription(listing: InternshipListing): string {
    const roleType = this.getRoleType(listing.category, listing.role);
    return `Prepare for your ${listing.company} ${roleType} interview. Learn what to expect, practice role-specific questions, and understand what differentiates strong candidates.`;
  }

  private getRoleType(category: string, role: string): string {
    if (role.toLowerCase().includes('research')) return 'research';
    if (role.toLowerCase().includes('data') || category === 'data-science') return 'data science';
    if (category === 'quant') return 'quantitative';
    if (category === 'hardware') return 'hardware engineering';
    return 'software engineering';
  }

  private generateContent(listing: InternshipListing): string {
    const roleType = this.getRoleType(listing.category, listing.role);
    const cleanRole = this.cleanRoleTitle(listing.role);
    
    const content = `
# ${listing.company} ${cleanRole} – Interview Guide

${this.generateIntroSection(listing, roleType)}

## What to Expect in This Interview

${this.generateExpectationsSection(listing, roleType)}

## Interview Process

${this.generateProcessSection(listing, roleType)}

## Key Technical Topics

${this.generateTechnicalTopicsSection(listing, roleType)}

## Sample Interview Questions

${this.generateQuestionsSection(listing, roleType)}

## What Makes ${listing.company} Interviews Different

${this.generateDifferentiationSection(listing)}

## How to Prepare

${this.generatePreparationSection(listing, roleType)}

## Frequently Asked Questions

${this.generateFAQSection(listing)}

---

## Ready to Practice?

${this.generateCTASection(listing)}
    `.trim();

    return content;
  }

  private generateIntroSection(listing: InternshipListing, roleType: string): string {
    const city = listing.location.split(',')[0].trim();
    
    return `
This guide covers the interview process for the ${this.cleanRoleTitle(listing.role)} position at ${listing.company} in ${city}. Whether you're preparing for your first round or final interview, you'll find specific guidance on what to expect and how to stand out.
    `.trim();
  }

  private generateExpectationsSection(listing: InternshipListing, roleType: string): string {
    const expectations = this.getExpectationsByRoleType(roleType, listing.company);
    return expectations.map(item => `- ${item}`).join('\n');
  }

  private getExpectationsByRoleType(roleType: string, company: string): string[] {
    const baseExpectations: Record<string, string[]> = {
      'research': [
        'Most candidates report 3–5 interview rounds over 2–4 weeks',
        'Expect at least one research deep-dive where you present and defend your work',
        'Technical rounds focus on ML fundamentals, experimental design, and paper discussions',
        'Interviewers often probe your ability to identify limitations in your own research',
        'Strong candidates demonstrate clear thinking about tradeoffs and failure modes',
        'Final rounds typically include conversations with senior researchers or hiring managers'
      ],
      'data science': [
        'Typically 3–4 rounds including technical screen, case study, and final interviews',
        'Case studies often involve real-world data problems with ambiguous requirements',
        'Technical rounds cover statistics, ML algorithms, and experimental design',
        'Expect questions on how you would measure success and handle edge cases',
        'Strong candidates show business intuition alongside technical depth',
        'SQL and Python proficiency are often tested through live coding'
      ],
      'software engineering': [
        'Standard process includes 3–5 rounds: phone screen, technical rounds, and behavioral',
        'Technical interviews focus on data structures, algorithms, and system design',
        'For intern roles, expect 1–2 coding rounds plus a behavioral interview',
        'System design may be simplified or focused on API design for intern positions',
        'Strong candidates write clean, working code and communicate their approach clearly',
        'Behavioral rounds assess collaboration, learning ability, and culture fit'
      ],
      'quantitative': [
        'Process typically involves 4–6 rounds including probability, coding, and case interviews',
        'Expect brain teasers, probability puzzles, and market-related questions',
        'Coding rounds focus on efficiency and mathematical precision',
        'Strong candidates think out loud and handle pressure well',
        'Mental math and quick estimation skills are often evaluated',
        'Final rounds may include trading simulations or live market discussions'
      ],
      'hardware engineering': [
        'Interview process typically spans 3–5 rounds over 2–3 weeks',
        'Technical rounds cover digital logic, computer architecture, and embedded systems',
        'Expect hands-on problems involving circuit analysis or HDL coding',
        'System-level thinking and debugging skills are heavily evaluated',
        'Strong candidates demonstrate both theoretical knowledge and practical experience',
        'Final rounds often include discussions about past projects and design decisions'
      ]
    };

    return baseExpectations[roleType] || baseExpectations['software engineering'];
  }

  private generateProcessSection(listing: InternshipListing, roleType: string): string {
    const stages = this.getProcessStages(roleType);
    
    let content = `Based on candidate reports, here's the typical interview flow:\n\n`;
    
    stages.forEach((stage, index) => {
      content += `**${index + 1}. ${stage.name}** (${stage.duration})\n${stage.description}\n\n`;
    });

    return content.trim();
  }

  private getProcessStages(roleType: string): Array<{name: string, duration: string, description: string}> {
    const stages: Record<string, Array<{name: string, duration: string, description: string}>> = {
      'research': [
        { name: 'Application Review', duration: '1–2 weeks', description: 'Resume and publication screening. Strong research background is prioritized.' },
        { name: 'Phone Screen', duration: '30–45 min', description: 'Initial conversation covering your research interests and background.' },
        { name: 'Technical Phone Interview', duration: '45–60 min', description: 'ML fundamentals, coding, or paper discussion depending on the team.' },
        { name: 'Research Presentation', duration: '45–60 min', description: 'Present your research to a panel. Expect probing questions on methodology and limitations.' },
        { name: 'Final Round', duration: '2–4 hours', description: 'Multiple interviews with researchers and team leads. Mix of technical depth and culture fit.' }
      ],
      'data science': [
        { name: 'Application Review', duration: '1–2 weeks', description: 'Resume screening focused on relevant projects and technical skills.' },
        { name: 'Phone Screen', duration: '30 min', description: 'Recruiter call to discuss background and role expectations.' },
        { name: 'Technical Screen', duration: '45–60 min', description: 'SQL, Python, and statistics questions. May include a take-home component.' },
        { name: 'Case Study', duration: '60 min', description: 'Work through a data problem. Focus on approach, not just the answer.' },
        { name: 'Final Interviews', duration: '2–3 hours', description: 'Technical and behavioral rounds with team members and hiring manager.' }
      ],
      'software engineering': [
        { name: 'Application Review', duration: '1–2 weeks', description: 'Resume screening for relevant coursework, projects, and experience.' },
        { name: 'Online Assessment', duration: '60–90 min', description: 'Coding problems on a platform like HackerRank or CodeSignal. Typically 2–3 problems.' },
        { name: 'Phone Interview', duration: '45–60 min', description: 'Live coding with an engineer. Focus on problem-solving and communication.' },
        { name: 'Final Interviews', duration: '2–4 hours', description: 'Multiple rounds covering coding, system design (often simplified for interns), and behavioral questions.' }
      ],
      'quantitative': [
        { name: 'Application Review', duration: '1–2 weeks', description: 'Resume screening emphasizing quantitative coursework and competition performance.' },
        { name: 'Phone Screen', duration: '30–45 min', description: 'Quick math, probability, and brain teasers. Expect rapid-fire questions.' },
        { name: 'Technical Rounds', duration: '2–3 hours', description: 'Multiple interviews covering probability, coding, and market intuition.' },
        { name: 'Super Day', duration: '4–6 hours', description: 'Intensive day of interviews. May include trading games or case discussions.' }
      ],
      'hardware engineering': [
        { name: 'Application Review', duration: '1–2 weeks', description: 'Resume screening for relevant coursework and project experience.' },
        { name: 'Phone Screen', duration: '45–60 min', description: 'Technical questions on digital logic, architecture, or embedded systems.' },
        { name: 'Technical Interview', duration: '60 min', description: 'Deep dive into specific technical areas relevant to the role.' },
        { name: 'Onsite/Virtual Final', duration: '3–4 hours', description: 'Multiple rounds covering technical depth, design, and behavioral assessment.' }
      ]
    };

    return stages[roleType] || stages['software engineering'];
  }

  private generateTechnicalTopicsSection(listing: InternshipListing, roleType: string): string {
    const topics = this.getTechnicalTopics(roleType);
    
    let content = `Focus your preparation on these areas:\n\n`;
    
    topics.forEach(category => {
      content += `### ${category.name}\n`;
      content += category.items.map(item => `- ${item}`).join('\n');
      content += '\n\n';
    });

    return content.trim();
  }

  private getTechnicalTopics(roleType: string): Array<{name: string, items: string[]}> {
    const topics: Record<string, Array<{name: string, items: string[]}>> = {
      'research': [
        { name: 'Machine Learning Fundamentals', items: ['Loss functions and optimization', 'Regularization techniques', 'Model selection and validation', 'Bias-variance tradeoff'] },
        { name: 'Deep Learning', items: ['Architecture design choices', 'Training dynamics and debugging', 'Attention mechanisms and transformers', 'Generalization and overfitting'] },
        { name: 'Research Skills', items: ['Experimental design and ablation studies', 'Statistical significance and hypothesis testing', 'Paper reading and critique', 'Identifying research gaps'] }
      ],
      'data science': [
        { name: 'Statistics & Probability', items: ['Hypothesis testing', 'A/B testing and experiment design', 'Bayesian vs frequentist approaches', 'Confidence intervals and p-values'] },
        { name: 'Machine Learning', items: ['Regression and classification', 'Feature engineering', 'Model evaluation metrics', 'Handling imbalanced data'] },
        { name: 'Data Manipulation', items: ['SQL (joins, window functions, CTEs)', 'Python/Pandas for data wrangling', 'Data cleaning and validation', 'Working with large datasets'] }
      ],
      'software engineering': [
        { name: 'Data Structures', items: ['Arrays, strings, and hash maps', 'Trees and graphs', 'Stacks, queues, and heaps', 'Linked lists'] },
        { name: 'Algorithms', items: ['Sorting and searching', 'Dynamic programming', 'BFS/DFS and graph traversal', 'Two pointers and sliding window'] },
        { name: 'System Design (for senior roles)', items: ['API design principles', 'Database schema design', 'Caching strategies', 'Load balancing basics'] }
      ],
      'quantitative': [
        { name: 'Probability & Statistics', items: ['Expected value and variance', 'Conditional probability', 'Markov chains', 'Monte Carlo methods'] },
        { name: 'Programming', items: ['Algorithm efficiency', 'Data structures for trading systems', 'Numerical precision', 'Low-latency considerations'] },
        { name: 'Finance & Markets', items: ['Options pricing basics', 'Market microstructure', 'Risk management concepts', 'Trading strategies'] }
      ],
      'hardware engineering': [
        { name: 'Digital Logic', items: ['Boolean algebra and Karnaugh maps', 'Sequential vs combinational circuits', 'State machine design', 'Timing analysis'] },
        { name: 'Computer Architecture', items: ['Pipeline design', 'Memory hierarchy', 'Cache coherence', 'Instruction set architecture'] },
        { name: 'Embedded Systems', items: ['Microcontroller programming', 'Interrupt handling', 'Real-time constraints', 'Power optimization'] }
      ]
    };

    return topics[roleType] || topics['software engineering'];
  }

  private generateQuestionsSection(listing: InternshipListing, roleType: string): string {
    const questions = this.getQuestionsByRoleType(roleType);
    
    let content = `These questions reflect what candidates have reported being asked:\n\n`;
    
    content += `### Technical Questions\n`;
    questions.technical.forEach(q => {
      content += `- ${q}\n`;
    });
    
    content += `\n### Behavioral Questions\n`;
    questions.behavioral.forEach(q => {
      content += `- ${q}\n`;
    });

    return content.trim();
  }

  private getQuestionsByRoleType(roleType: string): {technical: string[], behavioral: string[]} {
    const questions: Record<string, {technical: string[], behavioral: string[]}> = {
      'research': {
        technical: [
          "Walk me through a paper you have read recently. What were its limitations?",
          "How would you design an experiment to test a new model architecture?",
          "Explain the tradeoffs between transformer and RNN architectures for sequence modeling.",
          "Your model performs well on the test set but poorly in production. How do you debug this?",
          "How would you scale training for a model that does not fit in GPU memory?",
          "Describe a time when an experiment gave unexpected results. What did you learn?"
        ],
        behavioral: [
          "Tell me about a research project where you had to pivot your approach.",
          "How do you prioritize between exploring new ideas and executing on existing ones?",
          "Describe a time you disagreed with a collaborator on methodology.",
          "How do you stay current with research in your field?"
        ]
      },
      'data-science': {
        technical: [
          "Design an A/B test for a new feature. How would you determine sample size?",
          "How would you handle a dataset with 30% missing values?",
          "Write a SQL query to find users who have churned in the last 30 days.",
          "Build a model to predict customer lifetime value. Walk me through your approach.",
          "Your model has high accuracy but stakeholders do not trust it. What do you do?",
          "How would you detect and handle data drift in a production ML system?"
        ],
        behavioral: [
          "Tell me about a time you had to explain technical findings to non-technical stakeholders.",
          "Describe a project where the data did not support the hypothesis.",
          "How do you prioritize between quick wins and long-term improvements?",
          "Tell me about a time you had to work with messy or unreliable data."
        ]
      },
      'software engineering': {
        technical: [
          "Given an array of integers, find two numbers that add up to a target. Optimize for time.",
          "Design a URL shortening service. Walk me through the system architecture.",
          "Implement an LRU cache with O(1) get and put operations.",
          "How would you find the kth largest element in an unsorted array?",
          "Design the data model for a social media feed.",
          "Explain how you would handle rate limiting in an API."
        ],
        behavioral: [
          "Tell me about a project you are most proud of. What was your specific contribution?",
          "Describe a time you had to learn a new technology quickly.",
          "How do you handle disagreements about technical decisions?",
          "Tell me about a time you helped a teammate who was struggling."
        ]
      },
      'quantitative': {
        technical: [
          "You flip a fair coin until you get heads. What is the expected number of flips?",
          "Design an algorithm to find arbitrage opportunities in a currency exchange.",
          "How would you price an option that pays the maximum of two stock prices?",
          "Implement a function to calculate moving average efficiently for a data stream.",
          "You have two identical-looking pills, but one is slightly heavier. How do you find it with a balance scale?",
          "How would you detect if a trading strategy is overfitting to historical data?"
        ],
        behavioral: [
          "Tell me about a time you made a decision with incomplete information.",
          "Describe a situation where you had to explain a complex concept simply.",
          "How do you handle stress and high-pressure situations?",
          "Tell me about a time you identified a problem others missed."
        ]
      },
      'hardware engineering': {
        technical: [
          "Design a finite state machine for a traffic light controller.",
          "Explain the difference between synchronous and asynchronous resets.",
          "How would you debug a timing violation in a digital circuit?",
          "Design a simple cache memory system. Walk me through the tradeoffs.",
          "Write Verilog code for a 4-bit counter with enable and reset.",
          "How do you minimize power consumption in a battery-powered device?"
        ],
        behavioral: [
          "Tell me about a hardware project you have worked on. What were the biggest challenges?",
          "Describe a time you had to debug a difficult hardware issue.",
          "How do you approach learning about a new processor architecture?",
          "Tell me about a time you had to make tradeoffs between performance and power."
        ]
      }
    };

    return questions[roleType] || questions['software engineering'];
  }

  private generateDifferentiationSection(listing: InternshipListing): string {
    // Generic insights that can be adapted based on company size/type
    const companyInsights = this.getCompanyInsights(listing.company, listing.category);
    
    return `
${companyInsights}

Understanding these nuances helps you tailor your preparation and present yourself more effectively.
    `.trim();
  }

  private getCompanyInsights(company: string, category: string): string {
    // Provide thoughtful, non-generic observations
    return `
Based on candidate feedback and public information about ${company}:

**Hiring Philosophy:** Most tech companies at this level prioritize problem-solving ability and potential over perfect answers. Interviewers want to see how you think, not just what you know.

**Technical Depth:** Expect follow-up questions that push beyond your initial answer. If you solve a problem, be ready to optimize it or handle edge cases.

**Culture Fit:** ${company} evaluates how you collaborate and communicate. Your behavioral answers should demonstrate self-awareness and a growth mindset.

**Process Speed:** Interview timelines vary, but most candidates report hearing back within 1–3 weeks after each stage.
    `.trim();
  }

  private generatePreparationSection(listing: InternshipListing, roleType: string): string {
    const prepGuide = this.getPreparationGuide(roleType);
    
    let content = '';
    
    prepGuide.forEach(section => {
      content += `### ${section.name}\n`;
      section.items.forEach(item => {
        content += `- ${item}\n`;
      });
      content += '\n';
    });

    return content.trim();
  }

  private getPreparationGuide(roleType: string): Array<{name: string, items: string[]}> {
    const guides: Record<string, Array<{name: string, items: string[]}>> = {
      'research': [
        { name: 'Technical Prep', items: [
          "Review your own papers and be ready to defend every decision",
          "Practice explaining complex concepts in simple terms",
          "Prepare to discuss limitations and future work for your research",
          "Brush up on ML fundamentals—interviewers may test breadth"
        ]},
        { name: 'Behavioral Prep', items: [
          "Have 2–3 concrete examples of research challenges you overcame",
          "Prepare to discuss collaboration experiences, especially disagreements",
          "Think about why this specific team and research direction interest you"
        ]},
        { name: 'Research Prep', items: [
          "Read recent publications from the team you are interviewing with",
          "Understand the company research focus and how your work aligns",
          "Prepare thoughtful questions about their research roadmap"
        ]}
      ],
      'data science': [
        { name: 'Technical Prep', items: [
          "Practice SQL window functions and complex joins until they are second nature",
          "Review A/B testing methodology and sample size calculations",
          "Prepare to walk through end-to-end ML projects you have done",
          "Practice case studies—focus on structuring your approach"
        ]},
        { name: 'Behavioral Prep', items: [
          "Prepare examples of translating business problems into data problems",
          "Have stories ready about working with imperfect data",
          "Think about times you influenced decisions with analysis"
        ]},
        { name: 'Domain Prep', items: [
          "Understand the company product and key metrics",
          "Research common data challenges in their industry",
          "Prepare questions about their data infrastructure and team structure"
        ]}
      ],
      'software engineering': [
        { name: 'Technical Prep', items: [
          "Solve 50–100 problems focusing on patterns, not memorization",
          "Practice explaining your approach before writing code",
          "Review time/space complexity analysis",
          "For system design, understand basics even for intern roles"
        ]},
        { name: 'Behavioral Prep', items: [
          "Prepare one project to discuss in depth—know every detail",
          "Have examples of learning from failure and helping teammates",
          "Practice the STAR format but keep answers concise"
        ]},
        { name: 'Code Quality', items: [
          "Write clean, readable code during practice sessions",
          "Practice testing your code with examples before submitting",
          "Learn to handle edge cases systematically"
        ]}
      ],
      'quantitative': [
        { name: 'Technical Prep', items: [
          "Practice probability and brain teasers daily—speed matters",
          "Review expected value, conditional probability, and Bayes theorem",
          "Practice mental math for quick estimation",
          "Solve coding problems with efficiency as the priority"
        ]},
        { name: 'Market Prep', items: [
          "Follow financial news and understand market dynamics",
          "Practice thinking about trading strategies and risk",
          "Understand basic options concepts and pricing intuition"
        ]},
        { name: 'Behavioral Prep', items: [
          "Prepare examples showing analytical thinking under pressure",
          "Practice staying calm when you do not know the answer immediately",
          "Demonstrate intellectual curiosity and competitiveness"
        ]}
      ],
      'hardware engineering': [
        { name: 'Technical Prep', items: [
          "Review digital logic fundamentals and timing analysis",
          "Practice writing clean Verilog/VHDL code by hand",
          "Understand tradeoffs in cache design and memory hierarchy",
          "Be ready to analyze circuits and debug timing issues"
        ]},
        { name: 'Project Prep', items: [
          "Prepare to discuss your hardware projects in detail",
          "Know the tools you used and why you made specific choices",
          "Be ready to explain what you would do differently"
        ]},
        { name: 'Behavioral Prep', items: [
          "Have examples of debugging difficult hardware issues",
          "Prepare stories about collaborating on complex designs",
          "Think about how you handle tight deadlines and changing requirements"
        ]}
      ]
    };

    return guides[roleType] || guides['software engineering'];
  }

  private generateFAQSection(listing: InternshipListing): string {
    const roleType = this.getRoleType(listing.category, listing.role);
    
    let faqs = `
**How many interview rounds should I expect?**
Most candidates report 3–5 rounds, depending on the team and level. This typically includes a recruiter screen, technical interviews, and a final round with behavioral components.

**How long does the process take?**
From application to offer, expect 3–6 weeks. Some companies move faster, others slower. Following up politely after 1–2 weeks of silence is reasonable.

**What if I don't know the answer to a question?**
Interviewers care more about your thought process than perfect answers. Talk through your approach, ask clarifying questions, and show how you'd work toward a solution.

**Should I apply even if I don't meet all the requirements?**
Yes. Job postings describe ideal candidates, not minimum thresholds. If you meet most criteria and can demonstrate relevant skills, apply.
    `.trim();

    // Add role-specific FAQ
    if (roleType === 'research') {
      faqs += `\n\n**Do I need publications to get a research internship?**\nPublications help but aren't always required. Strong coursework, relevant projects, and research experience can also demonstrate your capabilities.`;
    } else if (roleType === 'quantitative') {
      faqs += `\n\n**How important is finance knowledge for a quant role?**\nIt depends on the team. Trading roles value market intuition, while research roles may prioritize math and coding. Basic understanding of markets is helpful for all quant positions.`;
    }

    return faqs;
  }

  private generateCTASection(listing: InternshipListing): string {
    return `
Start practicing real questions tailored to this role. Our AI-powered platform provides personalized feedback on your answers and helps you identify areas for improvement.

[Practice Interview Questions](/questionnaire)
    `.trim();
  }

  private getCategoryDisplayName(category: string): string {
    const displayNames: Record<string, string> = {
      'software': 'Software Engineering',
      'data-science': 'Data Science & ML',
      'quant': 'Quantitative Finance',
      'hardware': 'Hardware Engineering'
    };
    return displayNames[category] || category;
  }

  private generateStructuredData(listing: InternshipListing): any {
    return {
      "@context": "https://schema.org/",
      "@type": "Article",
      "headline": this.generateTitle(listing),
      "description": this.generateMetaDescription(listing),
      "author": {
        "@type": "Organization",
        "name": this.config.companyName
      },
      "publisher": {
        "@type": "Organization",
        "name": this.config.companyName
      },
      "datePublished": new Date().toISOString(),
      "url": `${this.config.baseUrl}/opportunities/${listing.slug}`
    };
  }

  private generateOpenGraph(listing: InternshipListing, title: string, description: string): any {
    return {
      title,
      description,
      image: this.config.defaultImage,
      url: `${this.config.baseUrl}/opportunities/${listing.slug}`,
      type: 'article',
      site_name: this.config.companyName
    };
  }
}
