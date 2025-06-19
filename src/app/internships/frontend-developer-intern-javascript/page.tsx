import { Metadata } from 'next'
import { ProgrammaticSEOTemplate, generateMetadata, getQuestionsForPage } from '@/components/ProgrammaticSEOTemplate'

const pageData = {
  "type": "role-skill",
  "title": "Frontend Developer Intern JavaScript Questions",
  "slug": "frontend-developer-intern-javascript",
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
  "skill": {
    "name": "JavaScript",
    "slug": "javascript",
    "category": "Technical",
    "difficulty": "Medium",
    "topics": [
      "ES6+",
      "Async Programming",
      "DOM Manipulation",
      "Frameworks",
      "Testing"
    ],
    "question_count": 80
  },
  "keyword": "Frontend Developer Intern JavaScript questions",
  "description": "Practice JavaScript questions specifically for Frontend Developer Intern positions."
}

export const metadata: Metadata = generateMetadata(pageData)

export default function FrontendDeveloperInternJavascriptPage() {
  const questions = getQuestionsForPage(pageData)
  const relatedPages = [
  {
    "type": "company-role",
    "title": "Google Frontend Developer Intern Interview Questions",
    "slug": "google-frontend-developer-intern",
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
    "keyword": "Google Frontend Developer Intern interview questions",
    "description": "Ace your Google Frontend Developer Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Meta Frontend Developer Intern Interview Questions",
    "slug": "meta-frontend-developer-intern",
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
    "keyword": "Meta Frontend Developer Intern interview questions",
    "description": "Ace your Meta Frontend Developer Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Amazon Frontend Developer Intern Interview Questions",
    "slug": "amazon-frontend-developer-intern",
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
    "keyword": "Amazon Frontend Developer Intern interview questions",
    "description": "Ace your Amazon Frontend Developer Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Apple Frontend Developer Intern Interview Questions",
    "slug": "apple-frontend-developer-intern",
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
    "keyword": "Apple Frontend Developer Intern interview questions",
    "description": "Ace your Apple Frontend Developer Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Netflix Frontend Developer Intern Interview Questions",
    "slug": "netflix-frontend-developer-intern",
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
    "keyword": "Netflix Frontend Developer Intern interview questions",
    "description": "Ace your Netflix Frontend Developer Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Microsoft Frontend Developer Intern Interview Questions",
    "slug": "microsoft-frontend-developer-intern",
    "company": {
      "name": "Microsoft",
      "slug": "microsoft",
      "tier": "Big Tech",
      "locations": [
        "Redmond",
        "New York",
        "Austin",
        "San Francisco"
      ],
      "hiring_seasons": [
        "Summer",
        "Fall",
        "Spring"
      ],
      "typical_questions": 340,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "Algorithms",
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
    "keyword": "Microsoft Frontend Developer Intern interview questions",
    "description": "Ace your Microsoft Frontend Developer Intern interview with real questions and AI-powered practice."
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
