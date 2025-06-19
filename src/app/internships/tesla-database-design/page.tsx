import { Metadata } from 'next'
import { ProgrammaticSEOTemplate, generateMetadata, getQuestionsForPage } from '@/components/ProgrammaticSEOTemplate'

const pageData = {
  "type": "company-skill",
  "title": "Tesla Database Design Interview Questions",
  "slug": "tesla-database-design",
  "company": {
    "name": "Tesla",
    "slug": "tesla",
    "tier": "Innovative",
    "locations": [
      "Palo Alto",
      "Austin",
      "Fremont"
    ],
    "hiring_seasons": [
      "Summer",
      "Fall"
    ],
    "typical_questions": 200,
    "difficulty": "Medium-Hard",
    "focus_areas": [
      "Problem Solving",
      "System Design",
      "Behavioral"
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
  "keyword": "Tesla Database Design interview questions",
  "description": "Master Database Design questions asked at Tesla interviews."
}

export const metadata: Metadata = generateMetadata(pageData)

export default function TeslaDatabaseDesignPage() {
  const questions = getQuestionsForPage(pageData)
  const relatedPages = [
  {
    "type": "company-role",
    "title": "Tesla Software Engineer Intern Interview Questions",
    "slug": "tesla-software-engineer-intern",
    "company": {
      "name": "Tesla",
      "slug": "tesla",
      "tier": "Innovative",
      "locations": [
        "Palo Alto",
        "Austin",
        "Fremont"
      ],
      "hiring_seasons": [
        "Summer",
        "Fall"
      ],
      "typical_questions": 200,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "Problem Solving",
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
    "keyword": "Tesla Software Engineer Intern interview questions",
    "description": "Ace your Tesla Software Engineer Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Tesla Software Developer Intern Interview Questions",
    "slug": "tesla-software-developer-intern",
    "company": {
      "name": "Tesla",
      "slug": "tesla",
      "tier": "Innovative",
      "locations": [
        "Palo Alto",
        "Austin",
        "Fremont"
      ],
      "hiring_seasons": [
        "Summer",
        "Fall"
      ],
      "typical_questions": 200,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "Problem Solving",
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
    "keyword": "Tesla Software Developer Intern interview questions",
    "description": "Ace your Tesla Software Developer Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Tesla SDE Intern Interview Questions",
    "slug": "tesla-sde-intern",
    "company": {
      "name": "Tesla",
      "slug": "tesla",
      "tier": "Innovative",
      "locations": [
        "Palo Alto",
        "Austin",
        "Fremont"
      ],
      "hiring_seasons": [
        "Summer",
        "Fall"
      ],
      "typical_questions": 200,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "Problem Solving",
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
    "keyword": "Tesla SDE Intern interview questions",
    "description": "Ace your Tesla SDE Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Tesla Data Science Intern Interview Questions",
    "slug": "tesla-data-science-intern",
    "company": {
      "name": "Tesla",
      "slug": "tesla",
      "tier": "Innovative",
      "locations": [
        "Palo Alto",
        "Austin",
        "Fremont"
      ],
      "hiring_seasons": [
        "Summer",
        "Fall"
      ],
      "typical_questions": 200,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "Problem Solving",
        "System Design",
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
    "keyword": "Tesla Data Science Intern interview questions",
    "description": "Ace your Tesla Data Science Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Tesla Machine Learning Intern Interview Questions",
    "slug": "tesla-machine-learning-intern",
    "company": {
      "name": "Tesla",
      "slug": "tesla",
      "tier": "Innovative",
      "locations": [
        "Palo Alto",
        "Austin",
        "Fremont"
      ],
      "hiring_seasons": [
        "Summer",
        "Fall"
      ],
      "typical_questions": 200,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "Problem Solving",
        "System Design",
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
    "keyword": "Tesla Machine Learning Intern interview questions",
    "description": "Ace your Tesla Machine Learning Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Tesla Frontend Developer Intern Interview Questions",
    "slug": "tesla-frontend-developer-intern",
    "company": {
      "name": "Tesla",
      "slug": "tesla",
      "tier": "Innovative",
      "locations": [
        "Palo Alto",
        "Austin",
        "Fremont"
      ],
      "hiring_seasons": [
        "Summer",
        "Fall"
      ],
      "typical_questions": 200,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "Problem Solving",
        "System Design",
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
    "keyword": "Tesla Frontend Developer Intern interview questions",
    "description": "Ace your Tesla Frontend Developer Intern interview with real questions and AI-powered practice."
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
