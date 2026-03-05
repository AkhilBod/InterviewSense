export const CURRENT_YEAR = new Date().getFullYear()
export const BASE_URL = 'https://www.interviewsense.org'

// ── Topic taxonomy ──────────────────────────────────────────────────────────

export const CURATED_TOPICS: { slug: string; name: string }[] = [
  { slug: 'data-structures', name: 'Data Structures' },
  { slug: 'algorithms', name: 'Algorithms' },
  { slug: 'system-design', name: 'System Design' },
  { slug: 'behavioral', name: 'Behavioral' },
  { slug: 'machine-learning', name: 'Machine Learning' },
  { slug: 'python', name: 'Python' },
  { slug: 'sql', name: 'SQL' },
  { slug: 'javascript', name: 'JavaScript' },
  { slug: 'react', name: 'React' },
  { slug: 'statistics', name: 'Statistics' },
  { slug: 'probability', name: 'Probability' },
  { slug: 'embedded-systems', name: 'Embedded Systems' },
  { slug: 'distributed-systems', name: 'Distributed Systems' },
  { slug: 'c-cpp', name: 'C/C++' },
  { slug: 'networking', name: 'Networking' },
]

export function topicNameToSlug(name: string): string {
  if (name === 'C/C++') return 'c-cpp'
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function topicSlugToName(slug: string): string {
  return CURATED_TOPICS.find(t => t.slug === slug)?.name ?? slug
    .split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

// ── Category taxonomy ────────────────────────────────────────────────────────

export const BEST_PAGES: { slug: string; category: string; label: string }[] = [
  { slug: `software-engineering-internships-${CURRENT_YEAR}`, category: 'software', label: 'Software Engineering' },
  { slug: `ai-internships-${CURRENT_YEAR}`, category: 'data-science', label: 'AI & Machine Learning' },
  { slug: `quant-trading-internships-${CURRENT_YEAR}`, category: 'quant', label: 'Quant Trading' },
  { slug: `hardware-engineering-internships-${CURRENT_YEAR}`, category: 'hardware', label: 'Hardware Engineering' },
]

export function bestSlugToCategory(slug: string): { category: string; label: string } | null {
  return BEST_PAGES.find(p => p.slug === slug) ?? null
}

// ── Slug parsing ─────────────────────────────────────────────────────────────

/** Best-effort parse of a role slug when JSON data is not available. */
export function parseSlug(slug: string): { company: string; role: string; location: string; year: number } {
  const parts = slug.split('-')
  const company = parts[0].charAt(0).toUpperCase() + parts[0].slice(1)

  const locationKeywords = new Set([
    'usa', 'remote', 'ny', 'ca', 'tx', 'wa', 'ma', 'il', 'co', 'ga', 'uk', 'canada',
    'london', 'toronto', 'nyc', 'sf', 'seattle', 'boston', 'chicago', 'austin', 'berlin',
    'paris', 'on', 'bc', 'ab', 'qc',
  ])

  let locationStart = parts.length
  for (let i = 1; i < parts.length; i++) {
    if (locationKeywords.has(parts[i].toLowerCase())) { locationStart = i; break }
  }

  const role = parts.slice(1, locationStart).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')
  const location = parts.slice(locationStart).join(', ').toUpperCase() || 'United States'

  return { company, role: role || 'Software Engineering Intern', location, year: CURRENT_YEAR }
}

export function companyNameToSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// ── Topic inference ───────────────────────────────────────────────────────────

export function getRoleTopics(category: string, roleTitle: string): string[] {
  const lower = roleTitle.toLowerCase()

  if (lower.includes('machine learning') || lower.includes('deep learning') || lower.includes(' ml ') || lower.endsWith(' ml')) {
    return ['Machine Learning', 'Python', 'Statistics', 'Algorithms']
  }
  if (lower.includes('data science') || (lower.includes('data') && lower.includes('analytics'))) {
    return ['Python', 'SQL', 'Statistics', 'Data Structures']
  }
  if (lower.includes('quant') || lower.includes('trading') || lower.includes('financial engineer')) {
    return ['Statistics', 'Python', 'Probability', 'Algorithms']
  }
  if (lower.includes('frontend') || lower.includes('front-end') || lower.includes('ui ') || lower.includes('ui/ux')) {
    return ['JavaScript', 'React', 'System Design', 'Algorithms']
  }
  if (lower.includes('backend') || lower.includes('back-end') || lower.includes('server') || lower.includes('api')) {
    return ['System Design', 'Algorithms', 'Distributed Systems', 'Data Structures']
  }
  if (lower.includes('fullstack') || lower.includes('full-stack') || lower.includes('full stack')) {
    return ['JavaScript', 'React', 'System Design', 'Algorithms']
  }
  if (lower.includes('mobile') || lower.includes('ios') || lower.includes('android')) {
    return ['Algorithms', 'System Design', 'Behavioral', 'Data Structures']
  }
  if (lower.includes('embedded') || lower.includes('firmware') || lower.includes('low-level') || lower.includes('low level')) {
    return ['C/C++', 'Embedded Systems', 'Algorithms', 'Networking']
  }
  if (lower.includes('security') || lower.includes('cybersecurity')) {
    return ['Networking', 'Algorithms', 'System Design', 'Data Structures']
  }
  if (lower.includes('devops') || lower.includes('platform') || lower.includes('sre') || lower.includes('infrastructure') || lower.includes('cloud')) {
    return ['Distributed Systems', 'Networking', 'System Design', 'Python']
  }
  if (lower.includes('ai') || lower.includes('nlp') || lower.includes('computer vision') || lower.includes('research')) {
    return ['Machine Learning', 'Python', 'Statistics', 'Algorithms']
  }
  if (lower.includes('hardware') || lower.includes('silicon') || lower.includes('vlsi') || lower.includes('fpga')) {
    return ['C/C++', 'Embedded Systems', 'Algorithms', 'Networking']
  }

  switch (category) {
    case 'data-science': return ['Python', 'Machine Learning', 'Statistics', 'Algorithms']
    case 'quant':        return ['Statistics', 'Python', 'Probability', 'Algorithms']
    case 'hardware':     return ['C/C++', 'Embedded Systems', 'Algorithms', 'Data Structures']
    default:             return ['Data Structures', 'Algorithms', 'System Design', 'Behavioral']
  }
}

// ── Content generation ────────────────────────────────────────────────────────

export function generateRoleContent(company: string, role: string, topics: string[]) {
  const t0 = topics[0] ?? 'Data Structures'
  const t1 = topics[1] ?? 'Behavioral'
  const hasSystemDesign = topics.some(t => t.toLowerCase().includes('system'))

  return {
    overview: `${company} is a leading technology company. The ${role} position is a competitive internship targeting top CS students.`,
    interview_format: `The ${company} ${role} interview typically consists of a recruiter screen followed by 1–2 technical rounds. Expect ${t0} and ${t1} questions.`,
    difficulty_rating: 3,
    top_topics: topics.length ? topics : ['Data Structures', 'Algorithms', 'Behavioral'],
    sample_questions: [
      {
        question: `Describe a challenging ${t0} problem you solved.`,
        type: 'behavioral',
        difficulty: 'medium',
        answer_framework: 'Use the STAR method. Focus on your specific contribution and measurable outcome.',
      },
      {
        question: 'Implement a function to find the longest substring without repeating characters.',
        type: 'technical',
        difficulty: 'medium',
        answer_framework: 'Use a sliding window approach with a hashmap. O(n) time complexity.',
      },
      {
        question: `Design a scalable ${hasSystemDesign ? 'rate limiter' : 'URL shortener'}.`,
        type: 'system_design',
        difficulty: 'hard',
        answer_framework: 'Start with requirements, estimate scale, then walk through components.',
      },
    ],
    prep_plan: [
      { day: 1, focus: 'Company research',  tasks: [`Read about ${company}'s products`, 'Review job description', 'Set up LeetCode'] },
      { day: 2, focus: 'Data structures',   tasks: ['Arrays & hashmaps', 'Practice 5 easy problems'] },
      { day: 3, focus: 'Algorithms',        tasks: ['Sorting & searching', 'Practice 5 medium problems'] },
      { day: 4, focus: t0,                  tasks: ['Study core concepts', 'Practice 2 problems'] },
      { day: 5, focus: 'Behavioral prep',   tasks: ['Write 5 STAR stories', 'Practice out loud'] },
      { day: 6, focus: 'Mock interview',    tasks: ['Do a full AI mock interview on InterviewSense', 'Review feedback'] },
      { day: 7, focus: 'Review & relax',    tasks: ['Redo weakest problems', 'Rest'] },
    ],
    resume_tips: [
      `Highlight any experience with ${t0}`,
      'Quantify your impact with numbers and metrics',
      `Tailor your summary to mention ${company} specifically`,
    ],
  }
}

// ── Schema generation ─────────────────────────────────────────────────────────

type SchemaPageType = 'role' | 'company' | 'topic' | 'best' | 'compare'

export function generateSchema(pageType: SchemaPageType, data: Record<string, any>): object[] {
  if (pageType === 'role') {
    const { company, role, location, datePosted, description, topics } = data
    const content = generateRoleContent(company, role, topics ?? [])
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: role,
        hiringOrganization: { '@type': 'Organization', name: company },
        jobLocation: { '@type': 'Place', address: location },
        employmentType: 'INTERN',
        datePosted: datePosted ?? new Date().toISOString().split('T')[0],
        description: description || `${company} ${role} internship opportunity.`,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `How hard is the ${company} ${role} interview?`,
            acceptedAnswer: { '@type': 'Answer', text: `The ${company} ${role} interview is rated Medium difficulty. ${content.interview_format}` },
          },
          {
            '@type': 'Question',
            name: `What questions are asked in the ${company} ${role} interview?`,
            acceptedAnswer: { '@type': 'Answer', text: `Common topics include ${content.top_topics.join(', ')}. ${content.sample_questions[0].question}` },
          },
          {
            '@type': 'Question',
            name: `How long does the ${company} ${role} hiring process take?`,
            acceptedAnswer: { '@type': 'Answer', text: `The ${company} hiring process typically takes 2–4 weeks from application to offer, including a recruiter screen and 1–2 technical rounds.` },
          },
        ],
      },
    ]
  }

  if (pageType === 'company') {
    const { company, roleCount } = data
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `How hard is the ${company} internship interview?`,
            acceptedAnswer: { '@type': 'Answer', text: `The ${company} internship interview is rated Medium difficulty on average. Expect rounds covering data structures, algorithms, and behavioral questions. Practice on InterviewSense for free.` },
          },
          {
            '@type': 'Question',
            name: `What does ${company} look for in internship candidates?`,
            acceptedAnswer: { '@type': 'Answer', text: `${company} looks for strong problem-solving skills, clean code, and effective communication. There are ${roleCount} open roles available — use InterviewSense AI mock interviews to prepare.` },
          },
        ],
      },
    ]
  }

  if (pageType === 'topic') {
    const { topic, companyCount } = data
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `What is ${topic} in technical interviews?`,
            acceptedAnswer: { '@type': 'Answer', text: `${topic} is tested at ${companyCount}+ companies. It covers fundamental concepts that appear in coding rounds and technical screens across software and hardware internships.` },
          },
          {
            '@type': 'Question',
            name: `How do I prepare for ${topic} interviews?`,
            acceptedAnswer: { '@type': 'Answer', text: `Study core ${topic} concepts, practice with real company questions, and use InterviewSense AI mock interviews for personalized feedback and coaching.` },
          },
        ],
      },
    ]
  }

  if (pageType === 'best') {
    const { label, year, count } = data
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `Which companies offer the best ${label} internships in ${year}?`,
            acceptedAnswer: { '@type': 'Answer', text: `There are ${count} ${label} internships available on InterviewSense. Top companies are ranked by interview difficulty and prestige. Practice for any of them with free AI mock interviews.` },
          },
          {
            '@type': 'Question',
            name: `How competitive are ${label} internships?`,
            acceptedAnswer: { '@type': 'Answer', text: `${label} internships are highly competitive. Most require 1–3 technical rounds plus a behavioral screen. InterviewSense provides company-specific prep to give you an edge.` },
          },
        ],
      },
    ]
  }

  if (pageType === 'compare') {
    const { companyA, companyB } = data
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `Is the ${companyA} or ${companyB} internship interview harder?`,
            acceptedAnswer: { '@type': 'Answer', text: `Both ${companyA} and ${companyB} have Medium-difficulty internship interviews. They share overlapping topics such as algorithms and system design. Practice for both on InterviewSense.` },
          },
        ],
      },
    ]
  }

  return []
}
