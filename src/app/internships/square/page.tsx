import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Building2, Code, Brain } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Square Internship Interview Questions | CS Interview Prep - InterviewSense',
  description: 'Ace your Square internship interview with real questions and AI-powered practice. 150+ questions from actual Square interviews.',
  keywords: 'Square interview questions, Square internship, Square coding interview, Square software engineer intern',
}

export default function SquareInterviewPage() {
  const rolePages = [
  {
    "type": "company-role",
    "title": "Square Software Engineer Intern Interview Questions",
    "slug": "square-software-engineer-intern",
    "company": {
      "name": "Square",
      "slug": "square",
      "tier": "Fintech",
      "locations": [
        "San Francisco",
        "Atlanta",
        "New York"
      ],
      "hiring_seasons": [
        "Summer"
      ],
      "typical_questions": 150,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "Payment Systems",
        "APIs",
        "Security"
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
    "keyword": "Square Software Engineer Intern interview questions",
    "description": "Ace your Square Software Engineer Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Square Software Developer Intern Interview Questions",
    "slug": "square-software-developer-intern",
    "company": {
      "name": "Square",
      "slug": "square",
      "tier": "Fintech",
      "locations": [
        "San Francisco",
        "Atlanta",
        "New York"
      ],
      "hiring_seasons": [
        "Summer"
      ],
      "typical_questions": 150,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "Payment Systems",
        "APIs",
        "Security"
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
    "keyword": "Square Software Developer Intern interview questions",
    "description": "Ace your Square Software Developer Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Square SDE Intern Interview Questions",
    "slug": "square-sde-intern",
    "company": {
      "name": "Square",
      "slug": "square",
      "tier": "Fintech",
      "locations": [
        "San Francisco",
        "Atlanta",
        "New York"
      ],
      "hiring_seasons": [
        "Summer"
      ],
      "typical_questions": 150,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "Payment Systems",
        "APIs",
        "Security"
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
    "keyword": "Square SDE Intern interview questions",
    "description": "Ace your Square SDE Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Square Data Science Intern Interview Questions",
    "slug": "square-data-science-intern",
    "company": {
      "name": "Square",
      "slug": "square",
      "tier": "Fintech",
      "locations": [
        "San Francisco",
        "Atlanta",
        "New York"
      ],
      "hiring_seasons": [
        "Summer"
      ],
      "typical_questions": 150,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "Payment Systems",
        "APIs",
        "Security"
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
    "keyword": "Square Data Science Intern interview questions",
    "description": "Ace your Square Data Science Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Square Machine Learning Intern Interview Questions",
    "slug": "square-machine-learning-intern",
    "company": {
      "name": "Square",
      "slug": "square",
      "tier": "Fintech",
      "locations": [
        "San Francisco",
        "Atlanta",
        "New York"
      ],
      "hiring_seasons": [
        "Summer"
      ],
      "typical_questions": 150,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "Payment Systems",
        "APIs",
        "Security"
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
    "keyword": "Square Machine Learning Intern interview questions",
    "description": "Ace your Square Machine Learning Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Square Frontend Developer Intern Interview Questions",
    "slug": "square-frontend-developer-intern",
    "company": {
      "name": "Square",
      "slug": "square",
      "tier": "Fintech",
      "locations": [
        "San Francisco",
        "Atlanta",
        "New York"
      ],
      "hiring_seasons": [
        "Summer"
      ],
      "typical_questions": 150,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "Payment Systems",
        "APIs",
        "Security"
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
    "keyword": "Square Frontend Developer Intern interview questions",
    "description": "Ace your Square Frontend Developer Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Square Backend Developer Intern Interview Questions",
    "slug": "square-backend-developer-intern",
    "company": {
      "name": "Square",
      "slug": "square",
      "tier": "Fintech",
      "locations": [
        "San Francisco",
        "Atlanta",
        "New York"
      ],
      "hiring_seasons": [
        "Summer"
      ],
      "typical_questions": 150,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "Payment Systems",
        "APIs",
        "Security"
      ]
    },
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
    "keyword": "Square Backend Developer Intern interview questions",
    "description": "Ace your Square Backend Developer Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Square Full Stack Developer Intern Interview Questions",
    "slug": "square-full-stack-developer-intern",
    "company": {
      "name": "Square",
      "slug": "square",
      "tier": "Fintech",
      "locations": [
        "San Francisco",
        "Atlanta",
        "New York"
      ],
      "hiring_seasons": [
        "Summer"
      ],
      "typical_questions": 150,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "Payment Systems",
        "APIs",
        "Security"
      ]
    },
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
    "keyword": "Square Full Stack Developer Intern interview questions",
    "description": "Ace your Square Full Stack Developer Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Square DevOps Intern Interview Questions",
    "slug": "square-devops-intern",
    "company": {
      "name": "Square",
      "slug": "square",
      "tier": "Fintech",
      "locations": [
        "San Francisco",
        "Atlanta",
        "New York"
      ],
      "hiring_seasons": [
        "Summer"
      ],
      "typical_questions": 150,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "Payment Systems",
        "APIs",
        "Security"
      ]
    },
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
    "keyword": "Square DevOps Intern interview questions",
    "description": "Ace your Square DevOps Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Square Cybersecurity Intern Interview Questions",
    "slug": "square-cybersecurity-intern",
    "company": {
      "name": "Square",
      "slug": "square",
      "tier": "Fintech",
      "locations": [
        "San Francisco",
        "Atlanta",
        "New York"
      ],
      "hiring_seasons": [
        "Summer"
      ],
      "typical_questions": 150,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "Payment Systems",
        "APIs",
        "Security"
      ]
    },
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
    "keyword": "Square Cybersecurity Intern interview questions",
    "description": "Ace your Square Cybersecurity Intern interview with real questions and AI-powered practice."
  }
]
  const skillPages = [
  {
    "type": "company-skill",
    "title": "Square Data Structures Interview Questions",
    "slug": "square-data-structures",
    "company": {
      "name": "Square",
      "slug": "square",
      "tier": "Fintech",
      "locations": [
        "San Francisco",
        "Atlanta",
        "New York"
      ],
      "hiring_seasons": [
        "Summer"
      ],
      "typical_questions": 150,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "Payment Systems",
        "APIs",
        "Security"
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
    "keyword": "Square Data Structures interview questions",
    "description": "Master Data Structures questions asked at Square interviews."
  },
  {
    "type": "company-skill",
    "title": "Square Algorithms Interview Questions",
    "slug": "square-algorithms",
    "company": {
      "name": "Square",
      "slug": "square",
      "tier": "Fintech",
      "locations": [
        "San Francisco",
        "Atlanta",
        "New York"
      ],
      "hiring_seasons": [
        "Summer"
      ],
      "typical_questions": 150,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "Payment Systems",
        "APIs",
        "Security"
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
    "keyword": "Square Algorithms interview questions",
    "description": "Master Algorithms questions asked at Square interviews."
  },
  {
    "type": "company-skill",
    "title": "Square System Design Interview Questions",
    "slug": "square-system-design",
    "company": {
      "name": "Square",
      "slug": "square",
      "tier": "Fintech",
      "locations": [
        "San Francisco",
        "Atlanta",
        "New York"
      ],
      "hiring_seasons": [
        "Summer"
      ],
      "typical_questions": 150,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "Payment Systems",
        "APIs",
        "Security"
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
    "keyword": "Square System Design interview questions",
    "description": "Master System Design questions asked at Square interviews."
  },
  {
    "type": "company-skill",
    "title": "Square Behavioral Questions Interview Questions",
    "slug": "square-behavioral",
    "company": {
      "name": "Square",
      "slug": "square",
      "tier": "Fintech",
      "locations": [
        "San Francisco",
        "Atlanta",
        "New York"
      ],
      "hiring_seasons": [
        "Summer"
      ],
      "typical_questions": 150,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "Payment Systems",
        "APIs",
        "Security"
      ]
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
    "keyword": "Square Behavioral Questions interview questions",
    "description": "Master Behavioral Questions questions asked at Square interviews."
  },
  {
    "type": "company-skill",
    "title": "Square Object-Oriented Programming Interview Questions",
    "slug": "square-oop",
    "company": {
      "name": "Square",
      "slug": "square",
      "tier": "Fintech",
      "locations": [
        "San Francisco",
        "Atlanta",
        "New York"
      ],
      "hiring_seasons": [
        "Summer"
      ],
      "typical_questions": 150,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "Payment Systems",
        "APIs",
        "Security"
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
    "keyword": "Square Object-Oriented Programming interview questions",
    "description": "Master Object-Oriented Programming questions asked at Square interviews."
  },
  {
    "type": "company-skill",
    "title": "Square Database Design Interview Questions",
    "slug": "square-database-design",
    "company": {
      "name": "Square",
      "slug": "square",
      "tier": "Fintech",
      "locations": [
        "San Francisco",
        "Atlanta",
        "New York"
      ],
      "hiring_seasons": [
        "Summer"
      ],
      "typical_questions": 150,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "Payment Systems",
        "APIs",
        "Security"
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
    "keyword": "Square Database Design interview questions",
    "description": "Master Database Design questions asked at Square interviews."
  },
  {
    "type": "company-skill",
    "title": "Square Web Development Interview Questions",
    "slug": "square-web-development",
    "company": {
      "name": "Square",
      "slug": "square",
      "tier": "Fintech",
      "locations": [
        "San Francisco",
        "Atlanta",
        "New York"
      ],
      "hiring_seasons": [
        "Summer"
      ],
      "typical_questions": 150,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "Payment Systems",
        "APIs",
        "Security"
      ]
    },
    "skill": {
      "name": "Web Development",
      "slug": "web-development",
      "category": "Technical",
      "difficulty": "Medium",
      "topics": [
        "HTML/CSS",
        "JavaScript",
        "React",
        "APIs",
        "Frontend/Backend"
      ],
      "question_count": 85
    },
    "keyword": "Square Web Development interview questions",
    "description": "Master Web Development questions asked at Square interviews."
  },
  {
    "type": "company-skill",
    "title": "Square Machine Learning Interview Questions",
    "slug": "square-machine-learning",
    "company": {
      "name": "Square",
      "slug": "square",
      "tier": "Fintech",
      "locations": [
        "San Francisco",
        "Atlanta",
        "New York"
      ],
      "hiring_seasons": [
        "Summer"
      ],
      "typical_questions": 150,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "Payment Systems",
        "APIs",
        "Security"
      ]
    },
    "skill": {
      "name": "Machine Learning",
      "slug": "machine-learning",
      "category": "Technical",
      "difficulty": "Hard",
      "topics": [
        "Supervised Learning",
        "Unsupervised Learning",
        "Neural Networks",
        "Model Evaluation"
      ],
      "question_count": 65
    },
    "keyword": "Square Machine Learning interview questions",
    "description": "Master Machine Learning questions asked at Square interviews."
  },
  {
    "type": "company-skill",
    "title": "Square Python Programming Interview Questions",
    "slug": "square-python",
    "company": {
      "name": "Square",
      "slug": "square",
      "tier": "Fintech",
      "locations": [
        "San Francisco",
        "Atlanta",
        "New York"
      ],
      "hiring_seasons": [
        "Summer"
      ],
      "typical_questions": 150,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "Payment Systems",
        "APIs",
        "Security"
      ]
    },
    "skill": {
      "name": "Python Programming",
      "slug": "python",
      "category": "Technical",
      "difficulty": "Medium",
      "topics": [
        "Syntax",
        "Libraries",
        "Data Science",
        "Web Frameworks",
        "Testing"
      ],
      "question_count": 95
    },
    "keyword": "Square Python Programming interview questions",
    "description": "Master Python Programming questions asked at Square interviews."
  },
  {
    "type": "company-skill",
    "title": "Square JavaScript Interview Questions",
    "slug": "square-javascript",
    "company": {
      "name": "Square",
      "slug": "square",
      "tier": "Fintech",
      "locations": [
        "San Francisco",
        "Atlanta",
        "New York"
      ],
      "hiring_seasons": [
        "Summer"
      ],
      "typical_questions": 150,
      "difficulty": "Medium-Hard",
      "focus_areas": [
        "Payment Systems",
        "APIs",
        "Security"
      ]
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
    "keyword": "Square JavaScript interview questions",
    "description": "Master JavaScript questions asked at Square interviews."
  }
]

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_50%)]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Building2 className="h-16 w-16 text-blue-500" />
              <h1 className="text-4xl md:text-6xl font-bold">
                <span className="text-blue-500">Square</span> Interview Questions
              </h1>
            </div>
            
            <p className="text-xl text-zinc-400 mb-8 max-w-3xl mx-auto">
              Practice real Square internship interview questions. Get AI-powered feedback and land your dream CS internship at Square.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">150+</div>
                <div className="text-sm text-zinc-400">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">Medium-Hard</div>
                <div className="text-sm text-zinc-400">Difficulty</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">Fintech</div>
                <div className="text-sm text-zinc-400">Company Tier</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">3+</div>
                <div className="text-sm text-zinc-400">Locations</div>
              </div>
            </div>

            <Button
              asChild
              size="lg"
              className="text-lg px-10 py-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-full shadow-lg"
            >
              <Link href="/signup">
                Practice Square Questions Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Questions by Role */}
      <section className="py-16 bg-zinc-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Square Questions by Role
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

      {/* Questions by Topic */}
      <section className="py-16 bg-zinc-950">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Square Questions by Topic
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skillPages.map((page: any) => (
              <Card key={page.slug} className="bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Brain className="h-8 w-8 text-purple-500" />
                    <h3 className="text-lg font-bold text-white">{page.skill.name}</h3>
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
