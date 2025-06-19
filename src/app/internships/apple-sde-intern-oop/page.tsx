import { Metadata } from 'next'
import { ProgrammaticSEOTemplate, generateMetadata, getQuestionsForPage } from '@/components/ProgrammaticSEOTemplate'

const pageData = {
  "type": "company-role-skill",
  "title": "Apple SDE Intern Object-Oriented Programming Questions",
  "slug": "apple-sde-intern-oop",
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
    "title": "SDE Intern",
    "slug": "sde-intern",
    "description": "Software Development Engineer internship positions",
    "skills": [
      "Data Structures",
      "Algorithms",
      "System Design",
      "Object-Oriented Programming"
    ],
    "difficulty": "Medium-Hard"
  },
  "skill": {
    "name": "Object-Oriented Programming",
    "slug": "oop",
    "category": "Technical",
    "difficulty": "Medium",
    "topics": [
      "Inheritance",
      "Polymorphism",
      "Encapsulation",
      "Design Patterns"
    ],
    "question_count": 70
  },
  "keyword": "Apple SDE Intern Object-Oriented Programming questions",
  "description": "Targeted Object-Oriented Programming practice for Apple SDE Intern interviews."
}

export const metadata: Metadata = generateMetadata(pageData)

export default function AppleSdeInternOopPage() {
  const questions = getQuestionsForPage(pageData)
  const relatedPages = [
  {
    "type": "company-role",
    "title": "Google SDE Intern Interview Questions",
    "slug": "google-sde-intern",
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
      "title": "SDE Intern",
      "slug": "sde-intern",
      "description": "Software Development Engineer internship positions",
      "skills": [
        "Data Structures",
        "Algorithms",
        "System Design",
        "Object-Oriented Programming"
      ],
      "difficulty": "Medium-Hard"
    },
    "keyword": "Google SDE Intern interview questions",
    "description": "Ace your Google SDE Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Meta SDE Intern Interview Questions",
    "slug": "meta-sde-intern",
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
      "title": "SDE Intern",
      "slug": "sde-intern",
      "description": "Software Development Engineer internship positions",
      "skills": [
        "Data Structures",
        "Algorithms",
        "System Design",
        "Object-Oriented Programming"
      ],
      "difficulty": "Medium-Hard"
    },
    "keyword": "Meta SDE Intern interview questions",
    "description": "Ace your Meta SDE Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Amazon SDE Intern Interview Questions",
    "slug": "amazon-sde-intern",
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
      "title": "SDE Intern",
      "slug": "sde-intern",
      "description": "Software Development Engineer internship positions",
      "skills": [
        "Data Structures",
        "Algorithms",
        "System Design",
        "Object-Oriented Programming"
      ],
      "difficulty": "Medium-Hard"
    },
    "keyword": "Amazon SDE Intern interview questions",
    "description": "Ace your Amazon SDE Intern interview with real questions and AI-powered practice."
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
    "title": "Apple SDE Intern Interview Questions",
    "slug": "apple-sde-intern",
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
      "title": "SDE Intern",
      "slug": "sde-intern",
      "description": "Software Development Engineer internship positions",
      "skills": [
        "Data Structures",
        "Algorithms",
        "System Design",
        "Object-Oriented Programming"
      ],
      "difficulty": "Medium-Hard"
    },
    "keyword": "Apple SDE Intern interview questions",
    "description": "Ace your Apple SDE Intern interview with real questions and AI-powered practice."
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
