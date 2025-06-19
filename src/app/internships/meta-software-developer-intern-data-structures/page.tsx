import { Metadata } from 'next'
import { ProgrammaticSEOTemplate, generateMetadata, getQuestionsForPage } from '@/components/ProgrammaticSEOTemplate'

const pageData = {
  "type": "company-role-skill",
  "title": "Meta Software Developer Intern Data Structures Questions",
  "slug": "meta-software-developer-intern-data-structures",
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
  "keyword": "Meta Software Developer Intern Data Structures questions",
  "description": "Targeted Data Structures practice for Meta Software Developer Intern interviews."
}

export const metadata: Metadata = generateMetadata(pageData)

export default function MetaSoftwareDeveloperInternDataStructuresPage() {
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
    "title": "Meta Software Engineer Intern Interview Questions",
    "slug": "meta-software-engineer-intern",
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
    "keyword": "Meta Software Engineer Intern interview questions",
    "description": "Ace your Meta Software Engineer Intern interview with real questions and AI-powered practice."
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
    "title": "Meta Data Science Intern Interview Questions",
    "slug": "meta-data-science-intern",
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
    "keyword": "Meta Data Science Intern interview questions",
    "description": "Ace your Meta Data Science Intern interview with real questions and AI-powered practice."
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
