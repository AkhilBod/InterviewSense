import { Metadata } from 'next'
import { ProgrammaticSEOTemplate, generateMetadata, getQuestionsForPage } from '@/components/ProgrammaticSEOTemplate'

const pageData = {
  "type": "company-role-skill",
  "title": "Uber Software Engineer Intern System Design Questions",
  "slug": "uber-software-engineer-intern-system-design",
  "company": {
    "name": "Uber",
    "slug": "uber",
    "tier": "Unicorn",
    "locations": [
      "San Francisco",
      "New York",
      "Seattle"
    ],
    "hiring_seasons": [
      "Summer",
      "Fall"
    ],
    "typical_questions": 250,
    "difficulty": "Medium-Hard",
    "focus_areas": [
      "System Design",
      "Algorithms",
      "Behavioral"
    ]
  },
  "role": {
    "title": "Software Engineer Intern",
    "slug": "software-engineer-intern",
    "description": "Entry-level software development positions",
    "skills": [
      "Data Structures",
      "Algorithms",
      "System Design",
      "Coding"
    ],
    "difficulty": "Medium"
  },
  "skill": {
    "name": "System Design",
    "slug": "system-design",
    "category": "Technical",
    "difficulty": "Hard",
    "topics": [
      "Scalability",
      "Load Balancing",
      "Databases",
      "Caching",
      "Microservices"
    ],
    "question_count": 80
  },
  "keyword": "Uber Software Engineer Intern System Design questions",
  "description": "Targeted System Design practice for Uber Software Engineer Intern interviews."
}

export const metadata: Metadata = generateMetadata(pageData)

export default function UberSoftwareEngineerInternSystemDesignPage() {
  const questions = getQuestionsForPage(pageData)
  const relatedPages = [
  {
    "type": "company-role",
    "title": "Google Software Engineer Intern Interview Questions",
    "slug": "google-software-engineer-intern",
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
      "title": "Software Engineer Intern",
      "slug": "software-engineer-intern",
      "description": "Entry-level software development positions",
      "skills": [
        "Data Structures",
        "Algorithms",
        "System Design",
        "Coding"
      ],
      "difficulty": "Medium"
    },
    "keyword": "Google Software Engineer Intern interview questions",
    "description": "Ace your Google Software Engineer Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Meta Software Engineer Intern Interview Questions",
    "slug": "meta-software-engineer-intern",
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
      "title": "Software Engineer Intern",
      "slug": "software-engineer-intern",
      "description": "Entry-level software development positions",
      "skills": [
        "Data Structures",
        "Algorithms",
        "System Design",
        "Coding"
      ],
      "difficulty": "Medium"
    },
    "keyword": "Meta Software Engineer Intern interview questions",
    "description": "Ace your Meta Software Engineer Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Amazon Software Engineer Intern Interview Questions",
    "slug": "amazon-software-engineer-intern",
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
      "title": "Software Engineer Intern",
      "slug": "software-engineer-intern",
      "description": "Entry-level software development positions",
      "skills": [
        "Data Structures",
        "Algorithms",
        "System Design",
        "Coding"
      ],
      "difficulty": "Medium"
    },
    "keyword": "Amazon Software Engineer Intern interview questions",
    "description": "Ace your Amazon Software Engineer Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Apple Software Engineer Intern Interview Questions",
    "slug": "apple-software-engineer-intern",
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
      "title": "Software Engineer Intern",
      "slug": "software-engineer-intern",
      "description": "Entry-level software development positions",
      "skills": [
        "Data Structures",
        "Algorithms",
        "System Design",
        "Coding"
      ],
      "difficulty": "Medium"
    },
    "keyword": "Apple Software Engineer Intern interview questions",
    "description": "Ace your Apple Software Engineer Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Netflix Software Engineer Intern Interview Questions",
    "slug": "netflix-software-engineer-intern",
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
      "title": "Software Engineer Intern",
      "slug": "software-engineer-intern",
      "description": "Entry-level software development positions",
      "skills": [
        "Data Structures",
        "Algorithms",
        "System Design",
        "Coding"
      ],
      "difficulty": "Medium"
    },
    "keyword": "Netflix Software Engineer Intern interview questions",
    "description": "Ace your Netflix Software Engineer Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Microsoft Software Engineer Intern Interview Questions",
    "slug": "microsoft-software-engineer-intern",
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
      "title": "Software Engineer Intern",
      "slug": "software-engineer-intern",
      "description": "Entry-level software development positions",
      "skills": [
        "Data Structures",
        "Algorithms",
        "System Design",
        "Coding"
      ],
      "difficulty": "Medium"
    },
    "keyword": "Microsoft Software Engineer Intern interview questions",
    "description": "Ace your Microsoft Software Engineer Intern interview with real questions and AI-powered practice."
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
