import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Brain, Building2, Code } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Data Structures Interview Questions for CS Internships | InterviewSense',
  description: 'Master Data Structures interview questions for CS internships. Practice with 120+ real questions from top tech companies.',
  keywords: 'Data Structures interview questions, Data Structures coding interview, CS internship Data Structures, computer science Data Structures',
}

export default function DataStructuresTopicPage() {
  const companyPages = [
  {
    "type": "company-skill",
    "title": "Google Data Structures Interview Questions",
    "slug": "google-data-structures",
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
    "keyword": "Google Data Structures interview questions",
    "description": "Master Data Structures questions asked at Google interviews."
  },
  {
    "type": "company-skill",
    "title": "Meta Data Structures Interview Questions",
    "slug": "meta-data-structures",
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
    "keyword": "Meta Data Structures interview questions",
    "description": "Master Data Structures questions asked at Meta interviews."
  },
  {
    "type": "company-skill",
    "title": "Amazon Data Structures Interview Questions",
    "slug": "amazon-data-structures",
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
    "keyword": "Amazon Data Structures interview questions",
    "description": "Master Data Structures questions asked at Amazon interviews."
  },
  {
    "type": "company-skill",
    "title": "Apple Data Structures Interview Questions",
    "slug": "apple-data-structures",
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
    "keyword": "Apple Data Structures interview questions",
    "description": "Master Data Structures questions asked at Apple interviews."
  },
  {
    "type": "company-skill",
    "title": "Netflix Data Structures Interview Questions",
    "slug": "netflix-data-structures",
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
    "keyword": "Netflix Data Structures interview questions",
    "description": "Master Data Structures questions asked at Netflix interviews."
  },
  {
    "type": "company-skill",
    "title": "Microsoft Data Structures Interview Questions",
    "slug": "microsoft-data-structures",
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
    "keyword": "Microsoft Data Structures interview questions",
    "description": "Master Data Structures questions asked at Microsoft interviews."
  },
  {
    "type": "company-skill",
    "title": "Nvidia Data Structures Interview Questions",
    "slug": "nvidia-data-structures",
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
    "keyword": "Nvidia Data Structures interview questions",
    "description": "Master Data Structures questions asked at Nvidia interviews."
  },
  {
    "type": "company-skill",
    "title": "Tesla Data Structures Interview Questions",
    "slug": "tesla-data-structures",
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
    "keyword": "Tesla Data Structures interview questions",
    "description": "Master Data Structures questions asked at Tesla interviews."
  },
  {
    "type": "company-skill",
    "title": "Uber Data Structures Interview Questions",
    "slug": "uber-data-structures",
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
    "keyword": "Uber Data Structures interview questions",
    "description": "Master Data Structures questions asked at Uber interviews."
  },
  {
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
  },
  {
    "type": "company-skill",
    "title": "Spotify Data Structures Interview Questions",
    "slug": "spotify-data-structures",
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
    "keyword": "Spotify Data Structures interview questions",
    "description": "Master Data Structures questions asked at Spotify interviews."
  },
  {
    "type": "company-skill",
    "title": "Stripe Data Structures Interview Questions",
    "slug": "stripe-data-structures",
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
    "keyword": "Stripe Data Structures interview questions",
    "description": "Master Data Structures questions asked at Stripe interviews."
  }
]
  const rolePages = [
  {
    "type": "role-skill",
    "title": "Software Engineer Intern Data Structures Questions",
    "slug": "software-engineer-intern-data-structures",
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
    "keyword": "Software Engineer Intern Data Structures questions",
    "description": "Practice Data Structures questions specifically for Software Engineer Intern positions."
  },
  {
    "type": "role-skill",
    "title": "Software Developer Intern Data Structures Questions",
    "slug": "software-developer-intern-data-structures",
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
    "keyword": "Software Developer Intern Data Structures questions",
    "description": "Practice Data Structures questions specifically for Software Developer Intern positions."
  },
  {
    "type": "role-skill",
    "title": "SDE Intern Data Structures Questions",
    "slug": "sde-intern-data-structures",
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
    "keyword": "SDE Intern Data Structures questions",
    "description": "Practice Data Structures questions specifically for SDE Intern positions."
  },
  {
    "type": "role-skill",
    "title": "Data Science Intern Data Structures Questions",
    "slug": "data-science-intern-data-structures",
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
    "keyword": "Data Science Intern Data Structures questions",
    "description": "Practice Data Structures questions specifically for Data Science Intern positions."
  },
  {
    "type": "role-skill",
    "title": "Machine Learning Intern Data Structures Questions",
    "slug": "machine-learning-intern-data-structures",
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
    "keyword": "Machine Learning Intern Data Structures questions",
    "description": "Practice Data Structures questions specifically for Machine Learning Intern positions."
  },
  {
    "type": "role-skill",
    "title": "Frontend Developer Intern Data Structures Questions",
    "slug": "frontend-developer-intern-data-structures",
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
    "keyword": "Frontend Developer Intern Data Structures questions",
    "description": "Practice Data Structures questions specifically for Frontend Developer Intern positions."
  },
  {
    "type": "role-skill",
    "title": "Backend Developer Intern Data Structures Questions",
    "slug": "backend-developer-intern-data-structures",
    "role": {
      "title": "Backend Developer Intern",
      "slug": "backend-developer-intern",
      "description": "Backend system development roles",
      "skills": [
        "APIs",
        "Databases",
        "System Design",
        "Server Architecture"
      ],
      "difficulty": "Medium-Hard"
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
    "keyword": "Backend Developer Intern Data Structures questions",
    "description": "Practice Data Structures questions specifically for Backend Developer Intern positions."
  },
  {
    "type": "role-skill",
    "title": "Full Stack Developer Intern Data Structures Questions",
    "slug": "full-stack-developer-intern-data-structures",
    "role": {
      "title": "Full Stack Developer Intern",
      "slug": "full-stack-developer-intern",
      "description": "End-to-end web development positions",
      "skills": [
        "JavaScript",
        "React",
        "APIs",
        "Databases"
      ],
      "difficulty": "Medium-Hard"
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
    "keyword": "Full Stack Developer Intern Data Structures questions",
    "description": "Practice Data Structures questions specifically for Full Stack Developer Intern positions."
  },
  {
    "type": "role-skill",
    "title": "DevOps Intern Data Structures Questions",
    "slug": "devops-intern-data-structures",
    "role": {
      "title": "DevOps Intern",
      "slug": "devops-intern",
      "description": "Infrastructure and deployment automation",
      "skills": [
        "Cloud Computing",
        "CI/CD",
        "Docker",
        "System Administration"
      ],
      "difficulty": "Medium-Hard"
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
    "keyword": "DevOps Intern Data Structures questions",
    "description": "Practice Data Structures questions specifically for DevOps Intern positions."
  },
  {
    "type": "role-skill",
    "title": "Cybersecurity Intern Data Structures Questions",
    "slug": "cybersecurity-intern-data-structures",
    "role": {
      "title": "Cybersecurity Intern",
      "slug": "cybersecurity-intern",
      "description": "Information security and cybersecurity roles",
      "skills": [
        "Security",
        "Networking",
        "Cryptography",
        "Risk Assessment"
      ],
      "difficulty": "Medium-Hard"
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
    "keyword": "Cybersecurity Intern Data Structures questions",
    "description": "Practice Data Structures questions specifically for Cybersecurity Intern positions."
  }
]

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Brain className="h-16 w-16 text-purple-500" />
              <h1 className="text-4xl md:text-6xl font-bold">
                <span className="text-purple-500">Data Structures</span> Interview Questions
              </h1>
            </div>
            
            <p className="text-xl text-zinc-400 mb-8 max-w-3xl mx-auto">
              Master Data Structures for CS internship interviews. Practice 120+ real questions with AI-powered feedback.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">120+</div>
                <div className="text-sm text-zinc-400">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">Medium</div>
                <div className="text-sm text-zinc-400">Difficulty</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">Technical</div>
                <div className="text-sm text-zinc-400">Category</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">7</div>
                <div className="text-sm text-zinc-400">Subtopics</div>
              </div>
            </div>

            <Button
              asChild
              size="lg"
              className="text-lg px-10 py-6 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-full shadow-lg"
            >
              <Link href="/signup">
                Practice Data Structures Questions <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Company-specific pages */}
      <section className="py-16 bg-zinc-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Data Structures Questions by Company
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companyPages.map((page: any) => (
              <Card key={page.slug} className="bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Building2 className="h-8 w-8 text-blue-500" />
                    <h3 className="text-lg font-bold text-white">{page.company.name}</h3>
                  </div>
                  <p className="text-zinc-400 text-sm mb-4">{page.description}</p>
                  <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                    <Link href={`/internships/${page.slug}`}>
                      Practice Questions <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Role-specific pages */}
      <section className="py-16 bg-zinc-950">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Data Structures Questions by Role
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rolePages.map((page: any) => (
              <Card key={page.slug} className="bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Code className="h-8 w-8 text-green-500" />
                    <h3 className="text-lg font-bold text-white">{page.role.title}</h3>
                  </div>
                  <p className="text-zinc-400 text-sm mb-4">{page.description}</p>
                  <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                    <Link href={`/internships/${page.slug}`}>
                      Practice Questions <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
