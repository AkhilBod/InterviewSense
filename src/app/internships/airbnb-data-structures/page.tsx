import { Metadata } from 'next'
import { ProgrammaticSEOTemplate, generateMetadata, getQuestionsForPage } from '@/components/ProgrammaticSEOTemplate'

const pageData = {
  "type": "company-skill",
  "title": "Airbnb Data Structures Interview Questions",
  "slug": "airbnb-data-structures",
  "company": {
    "name": "Airbnb",
    "slug": "airbnb",
    "tier": "Unicorn",
    "locations": [
      "San Francisco",
      "Seattle",
      "Portland"
    ],
    "hiring_seasons": [
      "Summer"
    ],
    "typical_questions": 180,
    "difficulty": "Medium-Hard",
    "focus_areas": [
      "System Design",
      "Product Thinking",
      "Culture Fit"
    ]
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
  "keyword": "Airbnb Data Structures interview questions",
  "description": "Master Data Structures questions asked at Airbnb interviews."
}

export const metadata: Metadata = generateMetadata(pageData)

export default function AirbnbDataStructuresPage() {
  const questions = getQuestionsForPage(pageData)
  const relatedPages = [
  {
    "type": "company-role",
    "title": "Airbnb Software Engineer Intern Interview Questions",
    "slug": "airbnb-software-engineer-intern",
    "company": {
      "name": "Airbnb",
      "slug": "airbnb",
      "tier": "Unicorn",
      "locations": [
        "San Francisco",
        "Seattle",
        "Portland"
      ],
      "hiring_seasons": [
        "Summer"
      ],
      "typical_questions": 180,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "System Design",
        "Product Thinking",
        "Culture Fit"
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
    "keyword": "Airbnb Software Engineer Intern interview questions",
    "description": "Ace your Airbnb Software Engineer Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Airbnb Software Developer Intern Interview Questions",
    "slug": "airbnb-software-developer-intern",
    "company": {
      "name": "Airbnb",
      "slug": "airbnb",
      "tier": "Unicorn",
      "locations": [
        "San Francisco",
        "Seattle",
        "Portland"
      ],
      "hiring_seasons": [
        "Summer"
      ],
      "typical_questions": 180,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "System Design",
        "Product Thinking",
        "Culture Fit"
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
    "keyword": "Airbnb Software Developer Intern interview questions",
    "description": "Ace your Airbnb Software Developer Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Airbnb SDE Intern Interview Questions",
    "slug": "airbnb-sde-intern",
    "company": {
      "name": "Airbnb",
      "slug": "airbnb",
      "tier": "Unicorn",
      "locations": [
        "San Francisco",
        "Seattle",
        "Portland"
      ],
      "hiring_seasons": [
        "Summer"
      ],
      "typical_questions": 180,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "System Design",
        "Product Thinking",
        "Culture Fit"
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
    "keyword": "Airbnb SDE Intern interview questions",
    "description": "Ace your Airbnb SDE Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Airbnb Data Science Intern Interview Questions",
    "slug": "airbnb-data-science-intern",
    "company": {
      "name": "Airbnb",
      "slug": "airbnb",
      "tier": "Unicorn",
      "locations": [
        "San Francisco",
        "Seattle",
        "Portland"
      ],
      "hiring_seasons": [
        "Summer"
      ],
      "typical_questions": 180,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "System Design",
        "Product Thinking",
        "Culture Fit"
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
    "keyword": "Airbnb Data Science Intern interview questions",
    "description": "Ace your Airbnb Data Science Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Airbnb Machine Learning Intern Interview Questions",
    "slug": "airbnb-machine-learning-intern",
    "company": {
      "name": "Airbnb",
      "slug": "airbnb",
      "tier": "Unicorn",
      "locations": [
        "San Francisco",
        "Seattle",
        "Portland"
      ],
      "hiring_seasons": [
        "Summer"
      ],
      "typical_questions": 180,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "System Design",
        "Product Thinking",
        "Culture Fit"
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
    "keyword": "Airbnb Machine Learning Intern interview questions",
    "description": "Ace your Airbnb Machine Learning Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Airbnb Frontend Developer Intern Interview Questions",
    "slug": "airbnb-frontend-developer-intern",
    "company": {
      "name": "Airbnb",
      "slug": "airbnb",
      "tier": "Unicorn",
      "locations": [
        "San Francisco",
        "Seattle",
        "Portland"
      ],
      "hiring_seasons": [
        "Summer"
      ],
      "typical_questions": 180,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "System Design",
        "Product Thinking",
        "Culture Fit"
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
    "keyword": "Airbnb Frontend Developer Intern interview questions",
    "description": "Ace your Airbnb Frontend Developer Intern interview with real questions and AI-powered practice."
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
