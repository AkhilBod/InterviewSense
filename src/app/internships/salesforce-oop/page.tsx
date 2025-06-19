import { Metadata } from 'next'
import { ProgrammaticSEOTemplate, generateMetadata, getQuestionsForPage } from '@/components/ProgrammaticSEOTemplate'

const pageData = {
  "type": "company-skill",
  "title": "Salesforce Object-Oriented Programming Interview Questions",
  "slug": "salesforce-oop",
  "company": {
    "name": "Salesforce",
    "slug": "salesforce",
    "tier": "Enterprise",
    "locations": [
      "San Francisco",
      "Seattle",
      "Indianapolis"
    ],
    "hiring_seasons": [
      "Summer",
      "Fall"
    ],
    "typical_questions": 200,
    "difficulty": "Medium",
    "focus_areas": [
      "Cloud Computing",
      "APIs",
      "System Design"
    ]
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
  "keyword": "Salesforce Object-Oriented Programming interview questions",
  "description": "Master Object-Oriented Programming questions asked at Salesforce interviews."
}

export const metadata: Metadata = generateMetadata(pageData)

export default function SalesforceOopPage() {
  const questions = getQuestionsForPage(pageData)
  const relatedPages = [
  {
    "type": "company-role",
    "title": "Salesforce Software Engineer Intern Interview Questions",
    "slug": "salesforce-software-engineer-intern",
    "company": {
      "name": "Salesforce",
      "slug": "salesforce",
      "tier": "Enterprise",
      "locations": [
        "San Francisco",
        "Seattle",
        "Indianapolis"
      ],
      "hiring_seasons": [
        "Summer",
        "Fall"
      ],
      "typical_questions": 200,
      "difficulty": "Medium",
      "focus_areas": [
        "Cloud Computing",
        "APIs",
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
    "keyword": "Salesforce Software Engineer Intern interview questions",
    "description": "Ace your Salesforce Software Engineer Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Salesforce Software Developer Intern Interview Questions",
    "slug": "salesforce-software-developer-intern",
    "company": {
      "name": "Salesforce",
      "slug": "salesforce",
      "tier": "Enterprise",
      "locations": [
        "San Francisco",
        "Seattle",
        "Indianapolis"
      ],
      "hiring_seasons": [
        "Summer",
        "Fall"
      ],
      "typical_questions": 200,
      "difficulty": "Medium",
      "focus_areas": [
        "Cloud Computing",
        "APIs",
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
    "keyword": "Salesforce Software Developer Intern interview questions",
    "description": "Ace your Salesforce Software Developer Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Salesforce SDE Intern Interview Questions",
    "slug": "salesforce-sde-intern",
    "company": {
      "name": "Salesforce",
      "slug": "salesforce",
      "tier": "Enterprise",
      "locations": [
        "San Francisco",
        "Seattle",
        "Indianapolis"
      ],
      "hiring_seasons": [
        "Summer",
        "Fall"
      ],
      "typical_questions": 200,
      "difficulty": "Medium",
      "focus_areas": [
        "Cloud Computing",
        "APIs",
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
    "keyword": "Salesforce SDE Intern interview questions",
    "description": "Ace your Salesforce SDE Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Salesforce Data Science Intern Interview Questions",
    "slug": "salesforce-data-science-intern",
    "company": {
      "name": "Salesforce",
      "slug": "salesforce",
      "tier": "Enterprise",
      "locations": [
        "San Francisco",
        "Seattle",
        "Indianapolis"
      ],
      "hiring_seasons": [
        "Summer",
        "Fall"
      ],
      "typical_questions": 200,
      "difficulty": "Medium",
      "focus_areas": [
        "Cloud Computing",
        "APIs",
        "System Design"
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
    "keyword": "Salesforce Data Science Intern interview questions",
    "description": "Ace your Salesforce Data Science Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Salesforce Machine Learning Intern Interview Questions",
    "slug": "salesforce-machine-learning-intern",
    "company": {
      "name": "Salesforce",
      "slug": "salesforce",
      "tier": "Enterprise",
      "locations": [
        "San Francisco",
        "Seattle",
        "Indianapolis"
      ],
      "hiring_seasons": [
        "Summer",
        "Fall"
      ],
      "typical_questions": 200,
      "difficulty": "Medium",
      "focus_areas": [
        "Cloud Computing",
        "APIs",
        "System Design"
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
    "keyword": "Salesforce Machine Learning Intern interview questions",
    "description": "Ace your Salesforce Machine Learning Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Salesforce Frontend Developer Intern Interview Questions",
    "slug": "salesforce-frontend-developer-intern",
    "company": {
      "name": "Salesforce",
      "slug": "salesforce",
      "tier": "Enterprise",
      "locations": [
        "San Francisco",
        "Seattle",
        "Indianapolis"
      ],
      "hiring_seasons": [
        "Summer",
        "Fall"
      ],
      "typical_questions": 200,
      "difficulty": "Medium",
      "focus_areas": [
        "Cloud Computing",
        "APIs",
        "System Design"
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
    "keyword": "Salesforce Frontend Developer Intern interview questions",
    "description": "Ace your Salesforce Frontend Developer Intern interview with real questions and AI-powered practice."
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
