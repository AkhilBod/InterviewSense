import { Metadata } from 'next'
import { ProgrammaticSEOTemplate, generateMetadata, getQuestionsForPage } from '@/components/ProgrammaticSEOTemplate'

const pageData = {
  "type": "company-skill",
  "title": "Stripe System Design Interview Questions",
  "slug": "stripe-system-design",
  "company": {
    "name": "Stripe",
    "slug": "stripe",
    "tier": "Fintech",
    "locations": [
      "San Francisco",
      "New York",
      "Seattle"
    ],
    "hiring_seasons": [
      "Summer",
      "Fall"
    ],
    "typical_questions": 190,
    "difficulty": "Hard",
    "focus_areas": [
      "System Design",
      "API Design",
      "Problem Solving"
    ]
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
  "keyword": "Stripe System Design interview questions",
  "description": "Master System Design questions asked at Stripe interviews."
}

export const metadata: Metadata = generateMetadata(pageData)

export default function StripeSystemDesignPage() {
  const questions = getQuestionsForPage(pageData)
  const relatedPages = [
  {
    "type": "company-role",
    "title": "Stripe Software Engineer Intern Interview Questions",
    "slug": "stripe-software-engineer-intern",
    "company": {
      "name": "Stripe",
      "slug": "stripe",
      "tier": "Fintech",
      "locations": [
        "San Francisco",
        "New York",
        "Seattle"
      ],
      "hiring_seasons": [
        "Summer",
        "Fall"
      ],
      "typical_questions": 190,
      "difficulty": "Hard",
      "focus_areas": [
        "System Design",
        "API Design",
        "Problem Solving"
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
    "keyword": "Stripe Software Engineer Intern interview questions",
    "description": "Ace your Stripe Software Engineer Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Stripe Software Developer Intern Interview Questions",
    "slug": "stripe-software-developer-intern",
    "company": {
      "name": "Stripe",
      "slug": "stripe",
      "tier": "Fintech",
      "locations": [
        "San Francisco",
        "New York",
        "Seattle"
      ],
      "hiring_seasons": [
        "Summer",
        "Fall"
      ],
      "typical_questions": 190,
      "difficulty": "Hard",
      "focus_areas": [
        "System Design",
        "API Design",
        "Problem Solving"
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
    "keyword": "Stripe Software Developer Intern interview questions",
    "description": "Ace your Stripe Software Developer Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Stripe SDE Intern Interview Questions",
    "slug": "stripe-sde-intern",
    "company": {
      "name": "Stripe",
      "slug": "stripe",
      "tier": "Fintech",
      "locations": [
        "San Francisco",
        "New York",
        "Seattle"
      ],
      "hiring_seasons": [
        "Summer",
        "Fall"
      ],
      "typical_questions": 190,
      "difficulty": "Hard",
      "focus_areas": [
        "System Design",
        "API Design",
        "Problem Solving"
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
    "keyword": "Stripe SDE Intern interview questions",
    "description": "Ace your Stripe SDE Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Stripe Data Science Intern Interview Questions",
    "slug": "stripe-data-science-intern",
    "company": {
      "name": "Stripe",
      "slug": "stripe",
      "tier": "Fintech",
      "locations": [
        "San Francisco",
        "New York",
        "Seattle"
      ],
      "hiring_seasons": [
        "Summer",
        "Fall"
      ],
      "typical_questions": 190,
      "difficulty": "Hard",
      "focus_areas": [
        "System Design",
        "API Design",
        "Problem Solving"
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
    "keyword": "Stripe Data Science Intern interview questions",
    "description": "Ace your Stripe Data Science Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Stripe Machine Learning Intern Interview Questions",
    "slug": "stripe-machine-learning-intern",
    "company": {
      "name": "Stripe",
      "slug": "stripe",
      "tier": "Fintech",
      "locations": [
        "San Francisco",
        "New York",
        "Seattle"
      ],
      "hiring_seasons": [
        "Summer",
        "Fall"
      ],
      "typical_questions": 190,
      "difficulty": "Hard",
      "focus_areas": [
        "System Design",
        "API Design",
        "Problem Solving"
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
    "keyword": "Stripe Machine Learning Intern interview questions",
    "description": "Ace your Stripe Machine Learning Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Stripe Frontend Developer Intern Interview Questions",
    "slug": "stripe-frontend-developer-intern",
    "company": {
      "name": "Stripe",
      "slug": "stripe",
      "tier": "Fintech",
      "locations": [
        "San Francisco",
        "New York",
        "Seattle"
      ],
      "hiring_seasons": [
        "Summer",
        "Fall"
      ],
      "typical_questions": 190,
      "difficulty": "Hard",
      "focus_areas": [
        "System Design",
        "API Design",
        "Problem Solving"
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
    "keyword": "Stripe Frontend Developer Intern interview questions",
    "description": "Ace your Stripe Frontend Developer Intern interview with real questions and AI-powered practice."
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
