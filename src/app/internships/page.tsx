import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Code, Brain, Building2, Users, Target, CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'CS Internship Interview Prep | Practice Programming Questions - InterviewSense',
  description: 'Ace your computer science internship interviews with AI-powered practice. Get real coding questions from Google, Meta, Amazon & more. Free interview prep for CS students.',
  keywords: 'CS internship interview questions, programming interview prep, coding questions, FAANG internships, computer science interview practice',
  openGraph: {
    title: 'CS Internship Interview Prep - Practice Programming Questions',
    description: 'Ace your computer science internship interviews with AI-powered practice. Get real coding questions from Google, Meta, Amazon & more.',
    type: 'website',
  },
}

const companies = [
  { name: 'Google', slug: 'google', color: 'bg-blue-500', questions: 450 },
  { name: 'Meta', slug: 'meta', color: 'bg-blue-600', questions: 380 },
  { name: 'Amazon', slug: 'amazon', color: 'bg-orange-500', questions: 520 },
  { name: 'Microsoft', slug: 'microsoft', color: 'bg-blue-700', questions: 340 },
  { name: 'Netflix', slug: 'netflix', color: 'bg-red-600', questions: 180 },
  { name: 'Apple', slug: 'apple', color: 'bg-gray-600', questions: 280 },
]

const topics = [
  { name: 'Arrays & Strings', slug: 'arrays-strings', count: 120, difficulty: 'Easy-Medium' },
  { name: 'Linked Lists', slug: 'linked-lists', count: 85, difficulty: 'Easy-Medium' },
  { name: 'Trees & Graphs', slug: 'trees-graphs', count: 95, difficulty: 'Medium-Hard' },
  { name: 'Dynamic Programming', slug: 'dynamic-programming', count: 75, difficulty: 'Medium-Hard' },
  { name: 'System Design', slug: 'system-design', count: 40, difficulty: 'Medium-Hard' },
  { name: 'Behavioral Questions', slug: 'behavioral', count: 60, difficulty: 'All Levels' },
]

const structuredData = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "InterviewSense CS Internship Prep",
  "description": "AI-powered computer science internship interview preparation platform",
  "url": "https://interviewsense.org/internships",
  "courseMode": "online",
  "educationalLevel": "undergraduate",
  "teaches": [
    "Programming Interview Questions",
    "Data Structures and Algorithms",
    "System Design for Internships",
    "Behavioral Interview Skills"
  ]
}

export default function InternshipsPage() {
  return (
    <>
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} 
      />
      
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-white">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_50%)]"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tighter mb-6">
                Ace Your <span className="text-blue-500">CS Internship</span> Interviews
              </h1>
              <p className="text-xl text-zinc-400 mb-8 max-w-3xl mx-auto">
                Practice real programming questions asked at top tech companies. Get AI-powered feedback on your coding interviews and behavioral responses. Land your dream CS internship.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button
                  asChild
                  size="lg"
                  className="text-lg px-10 py-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-full shadow-lg font-semibold"
                >
                  <Link href="/signup">Practice These Programming Questions <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
                
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="text-base px-8 py-6 border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-lg"
                >
                  <Link href="#topics">Browse Topics</Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">2000+</div>
                  <div className="text-sm text-zinc-400">Practice Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">95%</div>
                  <div className="text-sm text-zinc-400">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">50+</div>
                  <div className="text-sm text-zinc-400">Top Companies</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Company-Specific Questions */}
        <section className="py-16 bg-zinc-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Practice Questions by Company</h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                Get access to real interview questions asked at top tech companies for their internship programs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company) => (
                <Card key={company.slug} className="bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 ${company.color} rounded-lg flex items-center justify-center`}>
                        <Building2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{company.name}</h3>
                        <p className="text-zinc-400 text-sm">{company.questions} Questions</p>
                      </div>
                    </div>
                    
                    <p className="text-zinc-300 mb-4 text-sm">
                      Practice real {company.name} internship interview questions with detailed solutions and explanations.
                    </p>
                    
                    <Button
                      asChild
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                      <Link href="/signup">
                        Practice {company.name} Questions <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Topics Section */}
        <section id="topics" className="py-16 bg-zinc-950">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Practice by Topic</h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                Master the most important CS concepts with targeted practice sessions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topics.map((topic) => (
                <Card key={topic.slug} className="bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Code className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{topic.name}</h3>
                        <p className="text-zinc-400 text-sm">{topic.count} Questions • {topic.difficulty}</p>
                      </div>
                    </div>
                    
                    <p className="text-zinc-300 mb-4 text-sm">
                      Master {topic.name.toLowerCase()} with curated questions from top tech companies.
                    </p>
                    
                    <Button
                      asChild
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                      <Link href="/signup">
                        Start Practicing <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Combinations Section */}
        <section className="py-16 bg-zinc-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Most Popular Interview Prep</h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                Start with these highly searched interview question combinations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Google SWE Intern</h3>
                      <p className="text-zinc-400 text-sm">350+ Questions</p>
                    </div>
                  </div>
                  <p className="text-zinc-300 mb-4 text-sm">
                    Practice real Google Software Engineer Intern interview questions with AI feedback.
                  </p>
                  <Button
                    asChild
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    <Link href="/signup">
                      Practice Questions <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Code className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Meta Frontend Intern</h3>
                      <p className="text-zinc-400 text-sm">240+ Questions</p>
                    </div>
                  </div>
                  <p className="text-zinc-300 mb-4 text-sm">
                    Master React, JavaScript, and frontend questions for Meta internship interviews.
                  </p>
                  <Button
                    asChild
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    <Link href="/signup">
                      Practice Questions <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Amazon System Design</h3>
                      <p className="text-zinc-400 text-sm">80+ Questions</p>
                    </div>
                  </div>
                  <p className="text-zinc-300 mb-4 text-sm">
                    Learn system design concepts and practice Amazon's scalability questions.
                  </p>
                  <Button
                    asChild
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    <Link href="/signup">
                      Practice Questions <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 bg-zinc-900">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">Why InterviewSense for CS Internships?</h2>
                <p className="text-zinc-400">Built specifically for computer science students and new grads.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Real Interview Questions</h3>
                    <p className="text-zinc-400">Practice questions actually asked in recent internship interviews at top companies.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Brain className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">AI-Powered Feedback</h3>
                    <p className="text-zinc-400">Get instant feedback on your code quality, time complexity, and communication skills.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Internship-Focused</h3>
                    <p className="text-zinc-400">Content tailored specifically for internship-level expectations and requirements.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Peer Learning</h3>
                    <p className="text-zinc-400">Connect with other CS students and share interview experiences and tips.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-zinc-950">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Land Your CS Internship?</h2>
              <p className="text-xl text-zinc-400 mb-8">
                Join thousands of CS students who've already landed internships at top tech companies.
              </p>
              
              <Button
                asChild
                size="lg"
                className="text-lg px-10 py-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-full shadow-lg"
              >
                <Link href="/signup">
                  Start Practicing Now - It's Free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <p className="text-sm text-zinc-500 mt-4">
                No credit card required • Join 10,000+ CS students
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
