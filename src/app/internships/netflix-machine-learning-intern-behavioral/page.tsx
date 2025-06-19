import { Metadata } from 'next'
import { ProgrammaticSEOTemplate, generateMetadata, getQuestionsForPage } from '@/components/ProgrammaticSEOTemplate'

const pageData = {
  "type": "company-role-skill",
  "title": "Netflix Machine Learning Intern Behavioral Questions Questions",
  "slug": "netflix-machine-learning-intern-behavioral",
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
  "keyword": "Netflix Machine Learning Intern Behavioral Questions questions",
  "description": "Targeted Behavioral Questions practice for Netflix Machine Learning Intern interviews."
}

export const metadata: Metadata = generateMetadata(pageData)

export default function NetflixMachineLearningInternBehavioralPage() {
  const questions = getQuestionsForPage(pageData)
  const relatedPages = [
  {
    "type": "company-role",
    "title": "Google Machine Learning Intern Interview Questions",
    "slug": "google-machine-learning-intern",
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
    "keyword": "Google Machine Learning Intern interview questions",
    "description": "Ace your Google Machine Learning Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Meta Machine Learning Intern Interview Questions",
    "slug": "meta-machine-learning-intern",
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
    "keyword": "Meta Machine Learning Intern interview questions",
    "description": "Ace your Meta Machine Learning Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Amazon Machine Learning Intern Interview Questions",
    "slug": "amazon-machine-learning-intern",
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
    "keyword": "Amazon Machine Learning Intern interview questions",
    "description": "Ace your Amazon Machine Learning Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Apple Machine Learning Intern Interview Questions",
    "slug": "apple-machine-learning-intern",
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
    "keyword": "Apple Machine Learning Intern interview questions",
    "description": "Ace your Apple Machine Learning Intern interview with real questions and AI-powered practice."
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
