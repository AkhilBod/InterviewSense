import { Metadata } from 'next'
import { ProgrammaticSEOTemplate, generateMetadata, getQuestionsForPage } from '@/components/ProgrammaticSEOTemplate'

const pageData = {
  "type": "role-skill",
  "title": "Cybersecurity Intern Data Structures Questions",
  "slug": "cybersecurity-intern-data-structures",
  "role": {
    "title": "Cybersecurity Intern",
    "slug": "cybersecurity-intern",
    "description": "Information security and cybersecurity roles",
    "skills": [
      "Security",
      "Networking",
      "Cryptography",
      "Risk Assessment"
    ],
    "difficulty": "Medium-Hard"
  },
  "skill": {
    "name": "Data Structures",
    "slug": "data-structures",
    "category": "Technical",
    "difficulty": "Medium",
    "topics": [
      "Arrays",
      "Linked Lists",
      "Trees",
      "Graphs",
      "Hash Tables",
      "Stacks",
      "Queues"
    ],
    "question_count": 120
  },
  "keyword": "Cybersecurity Intern Data Structures questions",
  "description": "Practice Data Structures questions specifically for Cybersecurity Intern positions."
}

export const metadata: Metadata = generateMetadata(pageData)

export default function CybersecurityInternDataStructuresPage() {
  const questions = getQuestionsForPage(pageData)
  const relatedPages = [
  {
    "type": "company-role",
    "title": "Google Cybersecurity Intern Interview Questions",
    "slug": "google-cybersecurity-intern",
    "company": {
      "name": "Google",
      "slug": "google",
      "tier": "FAANG",
      "locations": [
        "Mountain View",
        "New York",
        "Seattle",
        "Austin"
      ],
      "hiring_seasons": [
        "Summer",
        "Fall",
        "Spring"
      ],
      "typical_questions": 350,
      "difficulty": "Hard",
      "focus_areas": [
        "Algorithms",
        "System Design",
        "Behavioral"
      ]
    },
    "role": {
      "title": "Cybersecurity Intern",
      "slug": "cybersecurity-intern",
      "description": "Information security and cybersecurity roles",
      "skills": [
        "Security",
        "Networking",
        "Cryptography",
        "Risk Assessment"
      ],
      "difficulty": "Medium-Hard"
    },
    "keyword": "Google Cybersecurity Intern interview questions",
    "description": "Ace your Google Cybersecurity Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Meta Cybersecurity Intern Interview Questions",
    "slug": "meta-cybersecurity-intern",
    "company": {
      "name": "Meta",
      "slug": "meta",
      "tier": "FAANG",
      "locations": [
        "Menlo Park",
        "New York",
        "Seattle",
        "Austin"
      ],
      "hiring_seasons": [
        "Summer",
        "Fall"
      ],
      "typical_questions": 320,
      "difficulty": "Hard",
      "focus_areas": [
        "Data Structures",
        "System Design",
        "Behavioral"
      ]
    },
    "role": {
      "title": "Cybersecurity Intern",
      "slug": "cybersecurity-intern",
      "description": "Information security and cybersecurity roles",
      "skills": [
        "Security",
        "Networking",
        "Cryptography",
        "Risk Assessment"
      ],
      "difficulty": "Medium-Hard"
    },
    "keyword": "Meta Cybersecurity Intern interview questions",
    "description": "Ace your Meta Cybersecurity Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Amazon Cybersecurity Intern Interview Questions",
    "slug": "amazon-cybersecurity-intern",
    "company": {
      "name": "Amazon",
      "slug": "amazon",
      "tier": "FAANG",
      "locations": [
        "Seattle",
        "New York",
        "Austin",
        "Boston"
      ],
      "hiring_seasons": [
        "Summer",
        "Fall",
        "Spring"
      ],
      "typical_questions": 400,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "Leadership Principles",
        "Algorithms",
        "System Design"
      ]
    },
    "role": {
      "title": "Cybersecurity Intern",
      "slug": "cybersecurity-intern",
      "description": "Information security and cybersecurity roles",
      "skills": [
        "Security",
        "Networking",
        "Cryptography",
        "Risk Assessment"
      ],
      "difficulty": "Medium-Hard"
    },
    "keyword": "Amazon Cybersecurity Intern interview questions",
    "description": "Ace your Amazon Cybersecurity Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Apple Cybersecurity Intern Interview Questions",
    "slug": "apple-cybersecurity-intern",
    "company": {
      "name": "Apple",
      "slug": "apple",
      "tier": "FAANG",
      "locations": [
        "Cupertino",
        "Austin",
        "New York"
      ],
      "hiring_seasons": [
        "Summer",
        "Fall"
      ],
      "typical_questions": 280,
      "difficulty": "Hard",
      "focus_areas": [
        "System Design",
        "Coding",
        "Product Thinking"
      ]
    },
    "role": {
      "title": "Cybersecurity Intern",
      "slug": "cybersecurity-intern",
      "description": "Information security and cybersecurity roles",
      "skills": [
        "Security",
        "Networking",
        "Cryptography",
        "Risk Assessment"
      ],
      "difficulty": "Medium-Hard"
    },
    "keyword": "Apple Cybersecurity Intern interview questions",
    "description": "Ace your Apple Cybersecurity Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Netflix Cybersecurity Intern Interview Questions",
    "slug": "netflix-cybersecurity-intern",
    "company": {
      "name": "Netflix",
      "slug": "netflix",
      "tier": "FAANG",
      "locations": [
        "Los Gatos",
        "Los Angeles",
        "New York"
      ],
      "hiring_seasons": [
        "Summer"
      ],
      "typical_questions": 180,
      "difficulty": "Hard",
      "focus_areas": [
        "Culture Fit",
        "System Design",
        "Algorithms"
      ]
    },
    "role": {
      "title": "Cybersecurity Intern",
      "slug": "cybersecurity-intern",
      "description": "Information security and cybersecurity roles",
      "skills": [
        "Security",
        "Networking",
        "Cryptography",
        "Risk Assessment"
      ],
      "difficulty": "Medium-Hard"
    },
    "keyword": "Netflix Cybersecurity Intern interview questions",
    "description": "Ace your Netflix Cybersecurity Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Microsoft Cybersecurity Intern Interview Questions",
    "slug": "microsoft-cybersecurity-intern",
    "company": {
      "name": "Microsoft",
      "slug": "microsoft",
      "tier": "Big Tech",
      "locations": [
        "Redmond",
        "New York",
        "Austin",
        "San Francisco"
      ],
      "hiring_seasons": [
        "Summer",
        "Fall",
        "Spring"
      ],
      "typical_questions": 340,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "Algorithms",
        "System Design",
        "Behavioral"
      ]
    },
    "role": {
      "title": "Cybersecurity Intern",
      "slug": "cybersecurity-intern",
      "description": "Information security and cybersecurity roles",
      "skills": [
        "Security",
        "Networking",
        "Cryptography",
        "Risk Assessment"
      ],
      "difficulty": "Medium-Hard"
    },
    "keyword": "Microsoft Cybersecurity Intern interview questions",
    "description": "Ace your Microsoft Cybersecurity Intern interview with real questions and AI-powered practice."
  }
]

  return (
    <ProgrammaticSEOTemplate 
      data={pageData}
      questions={questions}
      relatedPages={relatedPages}
    />
  )
}
