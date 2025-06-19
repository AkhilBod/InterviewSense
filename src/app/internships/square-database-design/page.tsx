import { Metadata } from 'next'
import { ProgrammaticSEOTemplate, generateMetadata, getQuestionsForPage } from '@/components/ProgrammaticSEOTemplate'

const pageData = {
  "type": "company-skill",
  "title": "Square Database Design Interview Questions",
  "slug": "square-database-design",
  "company": {
    "name": "Square",
    "slug": "square",
    "tier": "Fintech",
    "locations": [
      "San Francisco",
      "Atlanta",
      "New York"
    ],
    "hiring_seasons": [
      "Summer"
    ],
    "typical_questions": 150,
    "difficulty": "Medium-Hard",
    "focus_areas": [
      "Payment Systems",
      "APIs",
      "Security"
    ]
  },
  "skill": {
    "name": "Database Design",
    "slug": "database-design",
    "category": "Technical",
    "difficulty": "Medium",
    "topics": [
      "SQL",
      "NoSQL",
      "Schema Design",
      "Normalization",
      "Indexing"
    ],
    "question_count": 60
  },
  "keyword": "Square Database Design interview questions",
  "description": "Master Database Design questions asked at Square interviews."
}

export const metadata: Metadata = generateMetadata(pageData)

export default function SquareDatabaseDesignPage() {
  const questions = getQuestionsForPage(pageData)
  const relatedPages = [
  {
    "type": "company-role",
    "title": "Square Software Engineer Intern Interview Questions",
    "slug": "square-software-engineer-intern",
    "company": {
      "name": "Square",
      "slug": "square",
      "tier": "Fintech",
      "locations": [
        "San Francisco",
        "Atlanta",
        "New York"
      ],
      "hiring_seasons": [
        "Summer"
      ],
      "typical_questions": 150,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "Payment Systems",
        "APIs",
        "Security"
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
    "keyword": "Square Software Engineer Intern interview questions",
    "description": "Ace your Square Software Engineer Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Square Software Developer Intern Interview Questions",
    "slug": "square-software-developer-intern",
    "company": {
      "name": "Square",
      "slug": "square",
      "tier": "Fintech",
      "locations": [
        "San Francisco",
        "Atlanta",
        "New York"
      ],
      "hiring_seasons": [
        "Summer"
      ],
      "typical_questions": 150,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "Payment Systems",
        "APIs",
        "Security"
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
    "keyword": "Square Software Developer Intern interview questions",
    "description": "Ace your Square Software Developer Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Square SDE Intern Interview Questions",
    "slug": "square-sde-intern",
    "company": {
      "name": "Square",
      "slug": "square",
      "tier": "Fintech",
      "locations": [
        "San Francisco",
        "Atlanta",
        "New York"
      ],
      "hiring_seasons": [
        "Summer"
      ],
      "typical_questions": 150,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "Payment Systems",
        "APIs",
        "Security"
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
    "keyword": "Square SDE Intern interview questions",
    "description": "Ace your Square SDE Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Square Data Science Intern Interview Questions",
    "slug": "square-data-science-intern",
    "company": {
      "name": "Square",
      "slug": "square",
      "tier": "Fintech",
      "locations": [
        "San Francisco",
        "Atlanta",
        "New York"
      ],
      "hiring_seasons": [
        "Summer"
      ],
      "typical_questions": 150,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "Payment Systems",
        "APIs",
        "Security"
      ]
    },
    "role": {
      "title": "Data Science Intern",
      "slug": "data-science-intern",
      "description": "Data analysis and machine learning internships",
      "skills": [
        "Statistics",
        "Python",
        "Machine Learning",
        "SQL"
      ],
      "difficulty": "Medium-Hard"
    },
    "keyword": "Square Data Science Intern interview questions",
    "description": "Ace your Square Data Science Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Square Machine Learning Intern Interview Questions",
    "slug": "square-machine-learning-intern",
    "company": {
      "name": "Square",
      "slug": "square",
      "tier": "Fintech",
      "locations": [
        "San Francisco",
        "Atlanta",
        "New York"
      ],
      "hiring_seasons": [
        "Summer"
      ],
      "typical_questions": 150,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "Payment Systems",
        "APIs",
        "Security"
      ]
    },
    "role": {
      "title": "Machine Learning Intern",
      "slug": "machine-learning-intern",
      "description": "AI and ML engineering positions",
      "skills": [
        "Machine Learning",
        "Python",
        "Statistics",
        "Deep Learning"
      ],
      "difficulty": "Hard"
    },
    "keyword": "Square Machine Learning Intern interview questions",
    "description": "Ace your Square Machine Learning Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Square Frontend Developer Intern Interview Questions",
    "slug": "square-frontend-developer-intern",
    "company": {
      "name": "Square",
      "slug": "square",
      "tier": "Fintech",
      "locations": [
        "San Francisco",
        "Atlanta",
        "New York"
      ],
      "hiring_seasons": [
        "Summer"
      ],
      "typical_questions": 150,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "Payment Systems",
        "APIs",
        "Security"
      ]
    },
    "role": {
      "title": "Frontend Developer Intern",
      "slug": "frontend-developer-intern",
      "description": "Frontend web development internships",
      "skills": [
        "JavaScript",
        "React",
        "HTML/CSS",
        "Web Development"
      ],
      "difficulty": "Medium"
    },
    "keyword": "Square Frontend Developer Intern interview questions",
    "description": "Ace your Square Frontend Developer Intern interview with real questions and AI-powered practice."
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
