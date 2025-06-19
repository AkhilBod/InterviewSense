import { Metadata } from 'next'
import { ProgrammaticSEOTemplate, generateMetadata, getQuestionsForPage } from '@/components/ProgrammaticSEOTemplate'

const pageData = {
  "type": "company-skill",
  "title": "Uber Python Programming Interview Questions",
  "slug": "uber-python",
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
  "skill": {
    "name": "Python Programming",
    "slug": "python",
    "category": "Technical",
    "difficulty": "Medium",
    "topics": [
      "Syntax",
      "Libraries",
      "Data Science",
      "Web Frameworks",
      "Testing"
    ],
    "question_count": 95
  },
  "keyword": "Uber Python Programming interview questions",
  "description": "Master Python Programming questions asked at Uber interviews."
}

export const metadata: Metadata = generateMetadata(pageData)

export default function UberPythonPage() {
  const questions = getQuestionsForPage(pageData)
  const relatedPages = [
  {
    "type": "company-role",
    "title": "Uber Software Engineer Intern Interview Questions",
    "slug": "uber-software-engineer-intern",
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
    "keyword": "Uber Software Engineer Intern interview questions",
    "description": "Ace your Uber Software Engineer Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Uber Software Developer Intern Interview Questions",
    "slug": "uber-software-developer-intern",
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
    "keyword": "Uber Software Developer Intern interview questions",
    "description": "Ace your Uber Software Developer Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Uber SDE Intern Interview Questions",
    "slug": "uber-sde-intern",
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
    "keyword": "Uber SDE Intern interview questions",
    "description": "Ace your Uber SDE Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Uber Data Science Intern Interview Questions",
    "slug": "uber-data-science-intern",
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
    "keyword": "Uber Data Science Intern interview questions",
    "description": "Ace your Uber Data Science Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Uber Machine Learning Intern Interview Questions",
    "slug": "uber-machine-learning-intern",
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
    "keyword": "Uber Machine Learning Intern interview questions",
    "description": "Ace your Uber Machine Learning Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Uber Frontend Developer Intern Interview Questions",
    "slug": "uber-frontend-developer-intern",
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
    "keyword": "Uber Frontend Developer Intern interview questions",
    "description": "Ace your Uber Frontend Developer Intern interview with real questions and AI-powered practice."
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
