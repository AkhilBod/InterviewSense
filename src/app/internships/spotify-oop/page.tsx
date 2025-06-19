import { Metadata } from 'next'
import { ProgrammaticSEOTemplate, generateMetadata, getQuestionsForPage } from '@/components/ProgrammaticSEOTemplate'

const pageData = {
  "type": "company-skill",
  "title": "Spotify Object-Oriented Programming Interview Questions",
  "slug": "spotify-oop",
  "company": {
    "name": "Spotify",
    "slug": "spotify",
    "tier": "Unicorn",
    "locations": [
      "New York",
      "Boston",
      "San Francisco"
    ],
    "hiring_seasons": [
      "Summer",
      "Fall"
    ],
    "typical_questions": 160,
    "difficulty": "Medium",
    "focus_areas": [
      "Algorithms",
      "System Design",
      "Product Thinking"
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
  "keyword": "Spotify Object-Oriented Programming interview questions",
  "description": "Master Object-Oriented Programming questions asked at Spotify interviews."
}

export const metadata: Metadata = generateMetadata(pageData)

export default function SpotifyOopPage() {
  const questions = getQuestionsForPage(pageData)
  const relatedPages = [
  {
    "type": "company-role",
    "title": "Spotify Software Engineer Intern Interview Questions",
    "slug": "spotify-software-engineer-intern",
    "company": {
      "name": "Spotify",
      "slug": "spotify",
      "tier": "Unicorn",
      "locations": [
        "New York",
        "Boston",
        "San Francisco"
      ],
      "hiring_seasons": [
        "Summer",
        "Fall"
      ],
      "typical_questions": 160,
      "difficulty": "Medium",
      "focus_areas": [
        "Algorithms",
        "System Design",
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
    "keyword": "Spotify Software Engineer Intern interview questions",
    "description": "Ace your Spotify Software Engineer Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Spotify Software Developer Intern Interview Questions",
    "slug": "spotify-software-developer-intern",
    "company": {
      "name": "Spotify",
      "slug": "spotify",
      "tier": "Unicorn",
      "locations": [
        "New York",
        "Boston",
        "San Francisco"
      ],
      "hiring_seasons": [
        "Summer",
        "Fall"
      ],
      "typical_questions": 160,
      "difficulty": "Medium",
      "focus_areas": [
        "Algorithms",
        "System Design",
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
    "keyword": "Spotify Software Developer Intern interview questions",
    "description": "Ace your Spotify Software Developer Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Spotify SDE Intern Interview Questions",
    "slug": "spotify-sde-intern",
    "company": {
      "name": "Spotify",
      "slug": "spotify",
      "tier": "Unicorn",
      "locations": [
        "New York",
        "Boston",
        "San Francisco"
      ],
      "hiring_seasons": [
        "Summer",
        "Fall"
      ],
      "typical_questions": 160,
      "difficulty": "Medium",
      "focus_areas": [
        "Algorithms",
        "System Design",
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
    "keyword": "Spotify SDE Intern interview questions",
    "description": "Ace your Spotify SDE Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Spotify Data Science Intern Interview Questions",
    "slug": "spotify-data-science-intern",
    "company": {
      "name": "Spotify",
      "slug": "spotify",
      "tier": "Unicorn",
      "locations": [
        "New York",
        "Boston",
        "San Francisco"
      ],
      "hiring_seasons": [
        "Summer",
        "Fall"
      ],
      "typical_questions": 160,
      "difficulty": "Medium",
      "focus_areas": [
        "Algorithms",
        "System Design",
        "Product Thinking"
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
    "keyword": "Spotify Data Science Intern interview questions",
    "description": "Ace your Spotify Data Science Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Spotify Machine Learning Intern Interview Questions",
    "slug": "spotify-machine-learning-intern",
    "company": {
      "name": "Spotify",
      "slug": "spotify",
      "tier": "Unicorn",
      "locations": [
        "New York",
        "Boston",
        "San Francisco"
      ],
      "hiring_seasons": [
        "Summer",
        "Fall"
      ],
      "typical_questions": 160,
      "difficulty": "Medium",
      "focus_areas": [
        "Algorithms",
        "System Design",
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
    "keyword": "Spotify Machine Learning Intern interview questions",
    "description": "Ace your Spotify Machine Learning Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Spotify Frontend Developer Intern Interview Questions",
    "slug": "spotify-frontend-developer-intern",
    "company": {
      "name": "Spotify",
      "slug": "spotify",
      "tier": "Unicorn",
      "locations": [
        "New York",
        "Boston",
        "San Francisco"
      ],
      "hiring_seasons": [
        "Summer",
        "Fall"
      ],
      "typical_questions": 160,
      "difficulty": "Medium",
      "focus_areas": [
        "Algorithms",
        "System Design",
        "Product Thinking"
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
    "keyword": "Spotify Frontend Developer Intern interview questions",
    "description": "Ace your Spotify Frontend Developer Intern interview with real questions and AI-powered practice."
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
