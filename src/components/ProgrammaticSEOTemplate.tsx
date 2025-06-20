import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Code, Brain, Building2, Users, Target, CheckCircle2, Star, Clock, TrendingUp } from 'lucide-react'

interface PageData {
  type: string;
  title: string;
  slug: string;
  company?: any;
  role?: any;
  skill?: any;
  keyword: string;
  description: string;
  internship?: {
    applyUrl: string;
    simplifyUrl: string;
    postedDays: string;
    location: string;
  };
}

interface TemplateProps {
  data: PageData;
  questions: any[];
  relatedPages: PageData[];
}

// AI-generated question samples (this would be expanded with real AI generation)
const getQuestionsForPage = (data: PageData) => {
  const technicalQuestions: Record<string, any[]> = {
    'data-structures': [
      { question: "Implement a binary search tree with insert, delete, and search operations", difficulty: "Medium", topic: "Trees", type: "technical" },
      { question: "Design a hash table that handles collisions using chaining", difficulty: "Medium", topic: "Hash Tables", type: "technical" },
      { question: "Reverse a linked list iteratively and recursively", difficulty: "Easy", topic: "Linked Lists", type: "technical" }
    ],
    'algorithms': [
      { question: "Find the maximum subarray sum (Kadane's algorithm)", difficulty: "Medium", topic: "Dynamic Programming", type: "technical" },
      { question: "Implement merge sort and analyze its time complexity", difficulty: "Medium", topic: "Sorting", type: "technical" },
      { question: "Solve the coin change problem using dynamic programming", difficulty: "Medium", topic: "Dynamic Programming", type: "technical" }
    ],
    'system-design': [
      { question: "Design a URL shortener like bit.ly", difficulty: "Medium", topic: "System Architecture", type: "technical" },
      { question: "Design a chat application like WhatsApp", difficulty: "Hard", topic: "Real-time Systems", type: "technical" },
      { question: "Design a caching system for a web application", difficulty: "Medium", topic: "Caching", type: "technical" }
    ],
    'javascript': [
      { question: "Implement a debounce function in JavaScript", difficulty: "Medium", topic: "JavaScript Fundamentals", type: "technical" },
      { question: "Create a custom Promise implementation", difficulty: "Hard", topic: "Async Programming", type: "technical" },
      { question: "Build a simple event emitter class", difficulty: "Medium", topic: "Object-Oriented Programming", type: "technical" }
    ],
    'web-development': [
      { question: "Implement infinite scrolling in React", difficulty: "Medium", topic: "React", type: "technical" },
      { question: "Create a responsive CSS grid layout", difficulty: "Easy", topic: "CSS", type: "technical" },
      { question: "Build a REST API with proper error handling", difficulty: "Medium", topic: "Backend Development", type: "technical" }
    ]
  };

  const behavioralQuestions = [
    { 
      question: "Tell me about a time when you had to work with a difficult team member", 
      difficulty: "Medium", 
      topic: "Teamwork", 
      type: "behavioral",
      solution: "**Situation:** During my CS capstone project, I was paired with a teammate who rarely attended meetings and didn't complete assigned tasks on time. **Task:** I needed to ensure our group project (a web application) stayed on track while maintaining team harmony. **Action:** I first approached them privately to understand if they were facing personal challenges. I discovered they were struggling with the React framework we chose. Instead of escalating to the professor, I offered to pair-program with them and created a shared study schedule. I also redistributed some tasks to better match everyone's strengths. **Result:** Our teammate became more engaged, contributed meaningfully to the project, and we delivered a successful application. I learned that apparent 'difficult' behavior often stems from underlying challenges, and proactive communication can resolve most team conflicts."
    },
    { 
      question: "Describe a challenging project you worked on and how you overcame obstacles", 
      difficulty: "Medium", 
      topic: "Problem Solving", 
      type: "behavioral",
      solution: "**Situation:** For my internship application portfolio, I decided to build a real-time chat application using technologies I'd never used before - Node.js, Socket.io, and MongoDB. **Task:** I had 3 weeks to complete it while managing coursework and a part-time job. **Action:** I broke the project into smaller milestones: basic server setup, user authentication, real-time messaging, and UI polish. When I got stuck on implementing WebSocket connections, I systematically researched documentation, watched tutorials, and posted specific questions on Stack Overflow. I also reached out to a senior student who had experience with similar projects. **Result:** I successfully completed the application, which helped me land my internship. The experience taught me how to learn new technologies quickly and the importance of asking for help when needed. I now use this same methodical approach for tackling unfamiliar technical challenges."
    },
    { 
      question: "How do you handle tight deadlines and pressure?", 
      difficulty: "Medium", 
      topic: "Time Management", 
      type: "behavioral",
      solution: "**Situation:** During finals week last semester, I had three major coding assignments due within 48 hours, plus two exams to study for. **Task:** I needed to manage my time effectively to complete everything without compromising quality. **Action:** I started by listing all tasks and estimating time for each. I prioritized based on due dates and complexity, then created a detailed schedule with specific time blocks. I eliminated distractions by working in the library, used the Pomodoro Technique for focused coding sessions, and took strategic breaks to avoid burnout. When I realized one assignment was taking longer than expected, I reached out to the TA for clarification rather than spending hours debugging alone. **Result:** I completed all assignments on time and performed well on my exams. This experience taught me the importance of planning, prioritization, and knowing when to seek help. I now proactively manage my schedule to avoid such situations, but I'm confident in my ability to perform under pressure when necessary."
    }
  ];

  // Get relevant technical questions based on page content
  let relevantTechnical = [];
  if (data.skill && data.skill.slug && technicalQuestions[data.skill.slug]) {
    relevantTechnical = technicalQuestions[data.skill.slug];
  } else if (data.role?.skills && Array.isArray(data.role.skills)) {
    const primarySkill = data.role.skills[0].toLowerCase().replace(/[^a-z]/g, '-');
    relevantTechnical = technicalQuestions[primarySkill] || technicalQuestions['algorithms'];
  } else {
    relevantTechnical = technicalQuestions['algorithms'];
  }

  // Select 3 technical and 3 behavioral questions
  const selectedTechnical = relevantTechnical.slice(0, 3);
  const selectedBehavioral = behavioralQuestions.slice(0, 3);

  // Combine and shuffle
  const allQuestions = [...selectedTechnical, ...selectedBehavioral];
  return shuffleArray(allQuestions);
};

export function generateMetadata(data: PageData): Metadata {
  return {
    title: `${data.title} | CS Interview Prep - InterviewSense`,
    description: data.description,
    keywords: `${data.keyword}, programming interview questions, computer science interview prep, coding interview practice, ${data.company?.name || ''} interview, ${data.role?.title || ''} questions`,
    openGraph: {
      title: data.title,
      description: data.description,
      type: 'website',
      url: `https://interviewsense.org/internships/${data.slug}`,
    },
    alternates: {
      canonical: `https://interviewsense.org/internships/${data.slug}`,
    }
  }
}

export function ProgrammaticSEOTemplate({ data, questions, relatedPages }: TemplateProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": `InterviewSense - ${data.title}`,
    "description": data.description,
    "url": `https://interviewsense.org/internships/${data.slug}`,
    "teaches": questions.map(q => q.topic),
    "educationalLevel": "undergraduate",
    "courseMode": "online"
  };

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
              {/* Breadcrumb */}
              <nav className="text-sm text-zinc-400 mb-6">
                <Link href="/internships" className="hover:text-blue-400">CS Internships</Link>
                {data.company && (
                  <>
                    <span className="mx-2">→</span>
                    <Link href="/signup" className="hover:text-blue-400">
                      {data.company.name}
                    </Link>
                  </>
                )}
                <span className="mx-2">→</span>
                <span className="text-zinc-300">{data.title}</span>
              </nav>

              <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tighter mb-6">
                {data.company && (
                  <span className="text-blue-500">{data.company.name}</span>
                )}
                {data.role && !data.company && (
                  <span className="text-blue-500">{data.role.title}</span>
                )}
                {data.skill && (
                  <span className="text-green-500"> {data.skill.name}</span>
                )}
                <br />
                <span className="text-white">Interview Questions</span>
              </h1>

              <p className="text-xl text-zinc-400 mb-8 max-w-3xl mx-auto">
                {data.description} Get AI-powered feedback and land your dream CS internship with targeted practice.
              </p>
              
              {/* Apply Buttons for Internship Listings */}

              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button
                  asChild
                  size="lg"
                  className="text-base px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg shadow-lg font-semibold"
                >
                  <Link href="/signup">
                    Practice These Programming Questions <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="text-base px-8 py-4 border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-lg"
                >
                  <Link href="#questions">View Sample Questions</Link>
                </Button>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">{questions.length}+</div>
                  <div className="text-sm text-zinc-400">Practice Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">95%</div>
                  <div className="text-sm text-zinc-400">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">AI</div>
                  <div className="text-sm text-zinc-400">Powered Feedback</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">Free</div>
                  <div className="text-sm text-zinc-400">To Get Started</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Company/Role Info Section */}
        {(data.company || data.role) && (
          <section className="py-16 bg-zinc-900">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {data.company && (
                    <Card className="bg-zinc-800/50 border-zinc-700/50">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Building2 className="h-8 w-8 text-blue-500" />
                          <h3 className="text-2xl font-bold text-white">{data.company.name}</h3>
                        </div>
                        <div className="space-y-3 text-zinc-300">
                          {data.company.tier && <p><span className="text-zinc-400">Tier:</span> {data.company.tier}</p>}
                          {data.company.locations && <p><span className="text-zinc-400">Locations:</span> {data.company.locations.join(', ')}</p>}
                          {data.company.hiring_seasons && <p><span className="text-zinc-400">Hiring Seasons:</span> {data.company.hiring_seasons.join(', ')}</p>}
                          {data.company.difficulty && <p><span className="text-zinc-400">Interview Difficulty:</span> {data.company.difficulty}</p>}
                          {data.company.focus_areas && <p><span className="text-zinc-400">Focus Areas:</span> {data.company.focus_areas.join(', ')}</p>}
                          {data.company.typical_questions && <p><span className="text-zinc-400">Question Count:</span> {data.company.typical_questions}+</p>}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {data.role && (
                    <Card className="bg-zinc-800/50 border-zinc-700/50">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Code className="h-8 w-8 text-green-500" />
                          <h3 className="text-2xl font-bold text-white">{data.role.title}</h3>
                        </div>
                        <div className="space-y-3 text-zinc-300">
                          <p>{data.role.description}</p>
                          {data.role.skills && Array.isArray(data.role.skills) && (
                            <p><span className="text-zinc-400">Key Skills:</span> {data.role.skills.join(', ')}</p>
                          )}
                          {data.role.difficulty && <p><span className="text-zinc-400">Difficulty Level:</span> {data.role.difficulty}</p>}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Sample Questions Section */}
        <section id="questions" className="py-16 bg-zinc-950">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Sample Interview Questions
                </h2>
                <p className="text-zinc-400 max-w-2xl mx-auto">
                  Practice with these real interview questions. Get detailed solutions and AI feedback when you sign up.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {questions.map((question, index) => (
                  <Card key={index} className="bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            question.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                            question.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {question.difficulty}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            question.type === 'behavioral' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {question.type === 'behavioral' ? 'Behavioral' : 'Technical'}
                          </span>
                        </div>
                        <span className="text-xs text-zinc-500">{question.topic}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-3">
                        {question.question}
                      </h3>
                      
                      {/* Show solution for behavioral questions */}
                      {question.type === 'behavioral' && question.solution && (
                        <div className="mb-4 p-4 bg-zinc-900/50 rounded-lg border border-zinc-700/30">
                          <h4 className="text-sm font-semibold text-purple-400 mb-2">Sample Answer (STAR Method):</h4>
                          <p className="text-sm text-zinc-300 leading-relaxed">
                            {question.solution}
                          </p>
                        </div>
                      )}
                      
                      {/* Show hint for technical questions */}
                      {question.type === 'technical' && (
                        <div className="mb-4 p-3 bg-blue-900/20 rounded-lg border border-blue-700/30">
                          <p className="text-sm text-blue-300">
                            💡 <strong>Approach:</strong> Consider time/space complexity, edge cases, and explain your thought process clearly.
                          </p>
                        </div>
                      )}
                      
                      <Button
                        asChild
                        size="sm"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Link href="/signup">
                          Practice This Question <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* CTA to see all questions */}
              <div className="text-center">
                <Button
                  asChild
                  size="lg"
                  className="text-lg px-10 py-6 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-full shadow-lg"
                >
                  <Link href="/signup">
                    Access All {data.company?.typical_questions || 200}+ Questions <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Why Practice Here */}
        <section className="py-16 bg-zinc-900">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Why Practice {data.company?.name || data.role?.title || 'These'} Questions Here?
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Brain className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">AI-Powered Feedback</h3>
                    <p className="text-zinc-400">Get instant feedback on your code quality, time complexity, and communication skills with our advanced AI system.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Real Interview Questions</h3>
                    <p className="text-zinc-400">Practice questions actually asked in recent interviews, updated regularly based on candidate reports.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Internship-Focused</h3>
                    <p className="text-zinc-400">Content specifically tailored for internship and new grad positions, not senior-level expectations.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Timed Practice</h3>
                    <p className="text-zinc-400">Practice under realistic time constraints to simulate actual interview conditions and improve your speed.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Pages */}
        {relatedPages.length > 0 && (
          <section className="py-16 bg-zinc-950">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-white mb-4">Related Interview Prep</h2>
                  <p className="text-zinc-400">Explore more interview questions and topics</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedPages.slice(0, 6).map((page, index) => (
                    <Card key={index} className="bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800 transition-all duration-300">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-white mb-2">{page.title}</h3>
                        <p className="text-zinc-400 text-sm mb-4">{page.description}</p>
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="w-full border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                        >
                          <Link href="/signup">
                            View Questions <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Final CTA */}
        <section className="py-16 bg-zinc-900">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Ace Your {data.company?.name || data.role?.title || 'CS'} Interview?
              </h2>
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
  );
}

// Generate behavioral question solutions using Gemini API
async function generateBehavioralSolution(question: string, pageData: PageData) {
  try {
    const companyContext = pageData.company ? `for a ${pageData.company.name} interview` : 'for a tech company interview';
    const roleContext = pageData.role ? `as a ${pageData.role.title}` : 'as a software engineering intern';
    
    const prompt = `
    You are an expert career coach helping CS students prepare for internship interviews. 
    
    Generate a comprehensive answer to this behavioral interview question: "${question}"
    
    Context: This is ${companyContext} ${roleContext}.
    
    Please provide:
    1. A structured answer using the STAR method (Situation, Task, Action, Result)
    2. Specific details that would be relevant for a CS intern
    3. Quantifiable results where possible
    4. Key learning points or growth demonstrated
    
    Keep the answer concise but comprehensive (2-3 paragraphs), suitable for a 2-3 minute response.
    Format it as a natural-sounding answer that an intern candidate might give.
    `;

    const response = await fetch('/api/gemini-behavioral', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate solution');
    }

    const data = await response.json();
    return data.solution || "Sample answer: Focus on a specific situation where you demonstrated the relevant skill. Use the STAR method (Situation, Task, Action, Result) to structure your response, and highlight what you learned from the experience.";
    
  } catch (error) {
    console.error('Error generating behavioral solution:', error);
    return "Sample answer: Focus on a specific situation where you demonstrated the relevant skill. Use the STAR method (Situation, Task, Action, Result) to structure your response, and highlight what you learned from the experience.";
  }
}

// Utility function to shuffle array
function shuffleArray(array: any[]) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export { getQuestionsForPage };
