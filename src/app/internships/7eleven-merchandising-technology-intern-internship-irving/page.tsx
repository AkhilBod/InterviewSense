import { Metadata } from 'next'
import { ProgrammaticSEOTemplate, generateMetadata, getQuestionsForPage } from '@/components/ProgrammaticSEOTemplate'

const pageData = {
  "type": "company-role",
  "title": "7-Eleven Merchandising Technology Intern Interview Questions",
  "slug": "7eleven-merchandising-technology-intern-internship-irving",
  "company": {
    "name": "7-Eleven",
    "slug": "7eleven",
    "tier": "Enterprise",
    "locations": [
      "Irving",
      "Dallas",
      "Texas"
    ],
    "hiring_seasons": [
      "Summer"
    ],
    "typical_questions": 120,
    "difficulty": "Medium",
    "focus_areas": [
      "Software Development",
      "System Design",
      "Behavioral"
    ]
  },
  "role": {
    "title": "Merchandising Technology Intern",
    "slug": "merchandising-technology-intern",
    "description": "Technology internship focused on merchandising systems and retail technology",
    "skills": [
      "Software Engineering",
      "Java",
      "Python",
      "SQL",
      "System Design"
    ],
    "difficulty": "Medium"
  },
  "keyword": "7-Eleven Merchandising Technology Intern interview questions",
  "description": "Ace your 7-Eleven Merchandising Technology Intern interview with real questions and AI-powered practice."
}

export const metadata: Metadata = generateMetadata(pageData)

export default function SevenElevenMerchandisingTechnologyInternPage() {
  const questions = getQuestionsForPage(pageData)
  const relatedPages = [
    {
      "type": "company-role",
      "title": "7-Eleven Software Engineer Intern Interview Questions",
      "slug": "7eleven-software-engineer-intern",
      "company": {
        "name": "7-Eleven",
        "slug": "7eleven",
        "tier": "Enterprise",
        "locations": [
          "Irving",
          "Dallas",
          "Texas"
        ],
        "hiring_seasons": [
          "Summer"
        ],
        "typical_questions": 120,
        "difficulty": "Medium",
        "focus_areas": [
          "Software Development",
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
      "keyword": "7-Eleven Software Engineer Intern interview questions",
      "description": "Ace your 7-Eleven Software Engineer Intern interview with real questions and AI-powered practice."
    },
    {
      "type": "company-role",
      "title": "7-Eleven Data Science Intern Interview Questions",
      "slug": "7eleven-data-science-intern",
      "company": {
        "name": "7-Eleven",
        "slug": "7eleven",
        "tier": "Enterprise",
        "locations": [
          "Irving",
          "Dallas",
          "Texas"
        ],
        "hiring_seasons": [
          "Summer"
        ],
        "typical_questions": 120,
        "difficulty": "Medium",
        "focus_areas": [
          "Data Analysis",
          "Statistics",
          "Machine Learning"
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
      "keyword": "7-Eleven Data Science Intern interview questions",
      "description": "Ace your 7-Eleven Data Science Intern interview with real questions and AI-powered practice."
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
        "difficulty": "Hard",
        "focus_areas": [
          "Algorithms",
          "System Design",
          "Leadership Principles"
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
      "title": "Microsoft Software Engineer Intern Interview Questions",
      "slug": "microsoft-software-engineer-intern",
      "company": {
        "name": "Microsoft",
        "slug": "microsoft",
        "tier": "FAANG",
        "locations": [
          "Redmond",
          "Seattle",
          "San Francisco",
          "New York"
        ],
        "hiring_seasons": [
          "Summer",
          "Fall"
        ],
        "typical_questions": 380,
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
      "keyword": "Microsoft Software Engineer Intern interview questions",
      "description": "Ace your Microsoft Software Engineer Intern interview with real questions and AI-powered practice."
    },
    {
      "type": "company-role",
      "title": "Target Software Engineer Intern Interview Questions",
      "slug": "target-software-engineer-intern",
      "company": {
        "name": "Target",
        "slug": "target",
        "tier": "Enterprise",
        "locations": [
          "Minneapolis",
          "San Francisco",
          "Austin"
        ],
        "hiring_seasons": [
          "Summer"
        ],
        "typical_questions": 150,
        "difficulty": "Medium",
        "focus_areas": [
          "Software Development",
          "System Design",
          "Retail Technology"
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
      "keyword": "Target Software Engineer Intern interview questions",
      "description": "Ace your Target Software Engineer Intern interview with real questions and AI-powered practice."
    },
    {
      "type": "company-role",
      "title": "Walmart Technology Intern Interview Questions",
      "slug": "walmart-technology-intern",
      "company": {
        "name": "Walmart",
        "slug": "walmart",
        "tier": "Enterprise",
        "locations": [
          "Bentonville",
          "San Francisco",
          "Austin"
        ],
        "hiring_seasons": [
          "Summer"
        ],
        "typical_questions": 140,
        "difficulty": "Medium",
        "focus_areas": [
          "Software Development",
          "E-commerce",
          "System Design"
        ]
      },
      "role": {
        "title": "Technology Intern",
        "slug": "technology-intern",
        "description": "Technology and software development internships",
        "skills": [
          "Programming",
          "Web Development",
          "APIs",
          "Databases"
        ],
        "difficulty": "Medium"
      },
      "keyword": "Walmart Technology Intern interview questions",
      "description": "Ace your Walmart Technology Intern interview with real questions and AI-powered practice."
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
