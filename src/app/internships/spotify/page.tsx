import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Building2, Code, Brain } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Spotify Internship Interview Questions | CS Interview Prep - InterviewSense',
  description: 'Ace your Spotify internship interview with real questions and AI-powered practice. 160+ questions from actual Spotify interviews.',
  keywords: 'Spotify interview questions, Spotify internship, Spotify coding interview, Spotify software engineer intern',
}

export default function SpotifyInterviewPage() {
  const rolePages = [
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
  },
  {
    "type": "company-role",
    "title": "Spotify Backend Developer Intern Interview Questions",
    "slug": "spotify-backend-developer-intern",
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
    "keyword": "Spotify Backend Developer Intern interview questions",
    "description": "Ace your Spotify Backend Developer Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Spotify Full Stack Developer Intern Interview Questions",
    "slug": "spotify-full-stack-developer-intern",
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
    "keyword": "Spotify Full Stack Developer Intern interview questions",
    "description": "Ace your Spotify Full Stack Developer Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Spotify DevOps Intern Interview Questions",
    "slug": "spotify-devops-intern",
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
    "keyword": "Spotify DevOps Intern interview questions",
    "description": "Ace your Spotify DevOps Intern interview with real questions and AI-powered practice."
  },
  {
    "type": "company-role",
    "title": "Spotify Cybersecurity Intern Interview Questions",
    "slug": "spotify-cybersecurity-intern",
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
    "keyword": "Spotify Cybersecurity Intern interview questions",
    "description": "Ace your Spotify Cybersecurity Intern interview with real questions and AI-powered practice."
  }
]
  const skillPages = [
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
    "title": "Spotify Algorithms Interview Questions",
    "slug": "spotify-algorithms",
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
    "keyword": "Spotify Algorithms interview questions",
    "description": "Master Algorithms questions asked at Spotify interviews."
  },
  {
    "type": "company-skill",
    "title": "Spotify System Design Interview Questions",
    "slug": "spotify-system-design",
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
    "keyword": "Spotify System Design interview questions",
    "description": "Master System Design questions asked at Spotify interviews."
  },
  {
    "type": "company-skill",
    "title": "Spotify Behavioral Questions Interview Questions",
    "slug": "spotify-behavioral",
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
    "keyword": "Spotify Behavioral Questions interview questions",
    "description": "Master Behavioral Questions questions asked at Spotify interviews."
  },
  {
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
  },
  {
    "type": "company-skill",
    "title": "Spotify Database Design Interview Questions",
    "slug": "spotify-database-design",
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
    "keyword": "Spotify Database Design interview questions",
    "description": "Master Database Design questions asked at Spotify interviews."
  },
  {
    "type": "company-skill",
    "title": "Spotify Web Development Interview Questions",
    "slug": "spotify-web-development",
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
    "keyword": "Spotify Web Development interview questions",
    "description": "Master Web Development questions asked at Spotify interviews."
  },
  {
    "type": "company-skill",
    "title": "Spotify Machine Learning Interview Questions",
    "slug": "spotify-machine-learning",
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
    "keyword": "Spotify Machine Learning interview questions",
    "description": "Master Machine Learning questions asked at Spotify interviews."
  },
  {
    "type": "company-skill",
    "title": "Spotify Python Programming Interview Questions",
    "slug": "spotify-python",
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
    "keyword": "Spotify Python Programming interview questions",
    "description": "Master Python Programming questions asked at Spotify interviews."
  },
  {
    "type": "company-skill",
    "title": "Spotify JavaScript Interview Questions",
    "slug": "spotify-javascript",
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
    "keyword": "Spotify JavaScript interview questions",
    "description": "Master JavaScript questions asked at Spotify interviews."
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
                <span className="text-blue-500">Spotify</span> Interview Questions
              </h1>
            </div>
            
            <p className="text-xl text-zinc-400 mb-8 max-w-3xl mx-auto">
              Practice real Spotify internship interview questions. Get AI-powered feedback and land your dream CS internship at Spotify.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">160+</div>
                <div className="text-sm text-zinc-400">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">Medium</div>
                <div className="text-sm text-zinc-400">Difficulty</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">Unicorn</div>
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
                Practice Spotify Questions Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Questions by Role */}
      <section className="py-16 bg-zinc-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Spotify Questions by Role
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
            Spotify Questions by Topic
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
