import { Metadata } from 'next'
import { ProgrammaticSEOTemplate, generateMetadata, getQuestionsForPage } from '@/components/ProgrammaticSEOTemplate'

const pageData = {
  "type": "company-role-skill",
  "title": "Microsoft Software Developer Intern Behavioral Questions Questions",
  "slug": "microsoft-software-developer-intern-behavioral",
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
    "title": "Software Developer Intern",
    "slug": "software-developer-intern",
    "description": "Software development and programming roles",
    "skills": [
      "Programming",
      "Web Development",
      "APIs",
      "Databases"
    ],
    "difficulty": "Medium"
  },
  "skill": {
    "name": "Behavioral Questions",
    "slug": "behavioral",
    "category": "Soft Skills",
    "difficulty": "Medium",
    "topics": [
      "Leadership",
      "Teamwork",
      "Problem Solving",
      "Communication",
      "Conflict Resolution"
    ],
    "question_count": 90
  },
  "keyword": "Microsoft Software Developer Intern Behavioral Questions questions",
  "description": "Targeted Behavioral Questions practice for Microsoft Software Developer Intern interviews."
}

export const metadata: Metadata = generateMetadata(pageData)

export default function MicrosoftSoftwareDeveloperInternBehavioralPage() {
  const questions = getQuestionsForPage(pageData)
  const relatedPages = [
  {
    "type": "company-role",
    "title": "Google Software Developer Intern Interview Questions",
    "slug": "google-software-developer-intern",
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
      "title": "Software Developer Intern",
      "slug": "software-developer-intern",
      "description": "Software development and programming roles",
      "skills": [
        "Programming",
        "Web Development",
        "APIs",
        "Databases"
      ],
      "difficulty": "Medium"
    },
    "keyword": "Google Software Developer Intern interview questions",
    "description": "Ace your Google Software Developer Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Meta Software Developer Intern Interview Questions",
    "slug": "meta-software-developer-intern",
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
      "title": "Software Developer Intern",
      "slug": "software-developer-intern",
      "description": "Software development and programming roles",
      "skills": [
        "Programming",
        "Web Development",
        "APIs",
        "Databases"
      ],
      "difficulty": "Medium"
    },
    "keyword": "Meta Software Developer Intern interview questions",
    "description": "Ace your Meta Software Developer Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Amazon Software Developer Intern Interview Questions",
    "slug": "amazon-software-developer-intern",
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
      "title": "Software Developer Intern",
      "slug": "software-developer-intern",
      "description": "Software development and programming roles",
      "skills": [
        "Programming",
        "Web Development",
        "APIs",
        "Databases"
      ],
      "difficulty": "Medium"
    },
    "keyword": "Amazon Software Developer Intern interview questions",
    "description": "Ace your Amazon Software Developer Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Apple Software Developer Intern Interview Questions",
    "slug": "apple-software-developer-intern",
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
      "title": "Software Developer Intern",
      "slug": "software-developer-intern",
      "description": "Software development and programming roles",
      "skills": [
        "Programming",
        "Web Development",
        "APIs",
        "Databases"
      ],
      "difficulty": "Medium"
    },
    "keyword": "Apple Software Developer Intern interview questions",
    "description": "Ace your Apple Software Developer Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Netflix Software Developer Intern Interview Questions",
    "slug": "netflix-software-developer-intern",
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
      "title": "Software Developer Intern",
      "slug": "software-developer-intern",
      "description": "Software development and programming roles",
      "skills": [
        "Programming",
        "Web Development",
        "APIs",
        "Databases"
      ],
      "difficulty": "Medium"
    },
    "keyword": "Netflix Software Developer Intern interview questions",
    "description": "Ace your Netflix Software Developer Intern interview with real questions and AI-powered practice."
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
