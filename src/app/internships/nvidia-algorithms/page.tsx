import { Metadata } from 'next'
import { ProgrammaticSEOTemplate, generateMetadata, getQuestionsForPage } from '@/components/ProgrammaticSEOTemplate'

const pageData = {
  "type": "company-skill",
  "title": "Nvidia Algorithms Interview Questions",
  "slug": "nvidia-algorithms",
  "company": {
    "name": "Nvidia",
    "slug": "nvidia",
    "tier": "Big Tech",
    "locations": [
      "Santa Clara",
      "Austin",
      "Tel Aviv"
    ],
    "hiring_seasons": [
      "Summer",
      "Fall"
    ],
    "typical_questions": 220,
    "difficulty": "Hard",
    "focus_areas": [
      "GPU Computing",
      "AI/ML",
      "System Design"
    ]
  },
  "skill": {
    "name": "Algorithms",
    "slug": "algorithms",
    "category": "Technical",
    "difficulty": "Medium-Hard",
    "topics": [
      "Sorting",
      "Searching",
      "Dynamic Programming",
      "Greedy",
      "Graph Algorithms"
    ],
    "question_count": 150
  },
  "keyword": "Nvidia Algorithms interview questions",
  "description": "Master Algorithms questions asked at Nvidia interviews."
}

export const metadata: Metadata = generateMetadata(pageData)

export default function NvidiaAlgorithmsPage() {
  const questions = getQuestionsForPage(pageData)
  const relatedPages = [
  {
    "type": "company-role",
    "title": "Nvidia Software Engineer Intern Interview Questions",
    "slug": "nvidia-software-engineer-intern",
    "company": {
      "name": "Nvidia",
      "slug": "nvidia",
      "tier": "Big Tech",
      "locations": [
        "Santa Clara",
        "Austin",
        "Tel Aviv"
      ],
      "hiring_seasons": [
        "Summer",
        "Fall"
      ],
      "typical_questions": 220,
      "difficulty": "Hard",
      "focus_areas": [
        "GPU Computing",
        "AI/ML",
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
    "keyword": "Nvidia Software Engineer Intern interview questions",
    "description": "Ace your Nvidia Software Engineer Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Nvidia Software Developer Intern Interview Questions",
    "slug": "nvidia-software-developer-intern",
    "company": {
      "name": "Nvidia",
      "slug": "nvidia",
      "tier": "Big Tech",
      "locations": [
        "Santa Clara",
        "Austin",
        "Tel Aviv"
      ],
      "hiring_seasons": [
        "Summer",
        "Fall"
      ],
      "typical_questions": 220,
      "difficulty": "Hard",
      "focus_areas": [
        "GPU Computing",
        "AI/ML",
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
    "keyword": "Nvidia Software Developer Intern interview questions",
    "description": "Ace your Nvidia Software Developer Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Nvidia SDE Intern Interview Questions",
    "slug": "nvidia-sde-intern",
    "company": {
      "name": "Nvidia",
      "slug": "nvidia",
      "tier": "Big Tech",
      "locations": [
        "Santa Clara",
        "Austin",
        "Tel Aviv"
      ],
      "hiring_seasons": [
        "Summer",
        "Fall"
      ],
      "typical_questions": 220,
      "difficulty": "Hard",
      "focus_areas": [
        "GPU Computing",
        "AI/ML",
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
    "keyword": "Nvidia SDE Intern interview questions",
    "description": "Ace your Nvidia SDE Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Nvidia Data Science Intern Interview Questions",
    "slug": "nvidia-data-science-intern",
    "company": {
      "name": "Nvidia",
      "slug": "nvidia",
      "tier": "Big Tech",
      "locations": [
        "Santa Clara",
        "Austin",
        "Tel Aviv"
      ],
      "hiring_seasons": [
        "Summer",
        "Fall"
      ],
      "typical_questions": 220,
      "difficulty": "Hard",
      "focus_areas": [
        "GPU Computing",
        "AI/ML",
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
    "keyword": "Nvidia Data Science Intern interview questions",
    "description": "Ace your Nvidia Data Science Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Nvidia Machine Learning Intern Interview Questions",
    "slug": "nvidia-machine-learning-intern",
    "company": {
      "name": "Nvidia",
      "slug": "nvidia",
      "tier": "Big Tech",
      "locations": [
        "Santa Clara",
        "Austin",
        "Tel Aviv"
      ],
      "hiring_seasons": [
        "Summer",
        "Fall"
      ],
      "typical_questions": 220,
      "difficulty": "Hard",
      "focus_areas": [
        "GPU Computing",
        "AI/ML",
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
    "keyword": "Nvidia Machine Learning Intern interview questions",
    "description": "Ace your Nvidia Machine Learning Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Nvidia Frontend Developer Intern Interview Questions",
    "slug": "nvidia-frontend-developer-intern",
    "company": {
      "name": "Nvidia",
      "slug": "nvidia",
      "tier": "Big Tech",
      "locations": [
        "Santa Clara",
        "Austin",
        "Tel Aviv"
      ],
      "hiring_seasons": [
        "Summer",
        "Fall"
      ],
      "typical_questions": 220,
      "difficulty": "Hard",
      "focus_areas": [
        "GPU Computing",
        "AI/ML",
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
    "keyword": "Nvidia Frontend Developer Intern interview questions",
    "description": "Ace your Nvidia Frontend Developer Intern interview with real questions and AI-powered practice."
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
