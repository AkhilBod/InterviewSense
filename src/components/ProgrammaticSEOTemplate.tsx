import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Code, Brain, Clock, BadgeCheck, CheckCircle2, Target } from 'lucide-react'
import FlipQuestionCard from './FlipQuestionCard'

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

// Get questions for page
const getQuestionsForPage = (data: PageData) => {
  const technicalQuestions: Record<string, any[]> = {
    'data-structures': [
      { question: "Two Sum - Given an array of integers and a target, return indices of the two numbers that add up to target", difficulty: "Easy", topic: "Arrays & Hashing", type: "technical", company: "Google", acceptance: "48.5%", frequency: "Very High" },
      { question: "Valid Parentheses - Determine if the input string has valid bracket pairs", difficulty: "Easy", topic: "Stack", type: "technical", company: "Amazon", acceptance: "40.2%", frequency: "High" },
      { question: "Merge Two Sorted Lists - Merge two sorted linked lists into one sorted list", difficulty: "Easy", topic: "Linked Lists", type: "technical", company: "Meta", acceptance: "61.8%", frequency: "High" },
      { question: "Clone Graph - Create a deep copy of an undirected graph", difficulty: "Medium", topic: "Graphs", type: "technical", company: "Meta", acceptance: "43.2%", frequency: "High" },
      { question: "LRU Cache - Design a data structure for Least Recently Used cache", difficulty: "Medium", topic: "Design", type: "technical", company: "Amazon", acceptance: "38.5%", frequency: "Very High" },
      { question: "Binary Tree Vertical Order Traversal - Return vertical order traversal of nodes", difficulty: "Medium", topic: "Trees", type: "technical", company: "Meta", acceptance: "45.9%", frequency: "High" }
    ],
    'algorithms': [
      { question: "Longest Substring Without Repeating Characters - Find the length of the longest substring without repeating characters", difficulty: "Medium", topic: "Sliding Window", type: "technical", company: "Amazon", acceptance: "33.8%", frequency: "Very High" },
      { question: "Best Time to Buy and Sell Stock - Find the maximum profit from buying and selling one share of stock", difficulty: "Easy", topic: "Greedy", type: "technical", company: "Microsoft", acceptance: "51.7%", frequency: "High" },
      { question: "Product of Array Except Self - Return an array where each element is the product of all other elements", difficulty: "Medium", topic: "Arrays", type: "technical", company: "Meta", acceptance: "64.5%", frequency: "High" },
      { question: "Rotate Image - Rotate an N x N matrix by 90 degrees clockwise in-place", difficulty: "Medium", topic: "Arrays", type: "technical", company: "Amazon", acceptance: "65.3%", frequency: "High" },
      { question: "K Closest Points to Origin - Find K points closest to origin using Manhattan distance", difficulty: "Medium", topic: "Heap", type: "technical", company: "Meta", acceptance: "66.1%", frequency: "Very High" },
      { question: "Merge Intervals - Merge all overlapping intervals", difficulty: "Medium", topic: "Intervals", type: "technical", company: "Amazon", acceptance: "45.9%", frequency: "Very High" }
    ],
    'system-design': [
      { question: "Design TinyURL - Design a URL shortening service like bit.ly", difficulty: "Medium", topic: "System Design", type: "technical", company: "Amazon", frequency: "Very High" },
      { question: "Design Rate Limiter - Implement an API rate limiting system", difficulty: "Medium", topic: "System Design", type: "technical", company: "Stripe", frequency: "High" },
      { question: "Design Web Crawler - Design a distributed web crawling system", difficulty: "Hard", topic: "System Design", type: "technical", company: "Google", frequency: "Medium" }
    ],
    'javascript': [
      { question: "Implement Debounce - Create a debounce function that delays execution", difficulty: "Medium", topic: "JavaScript", type: "technical", company: "Airbnb", acceptance: "52.3%", frequency: "High" },
      { question: "Deep Clone Object - Implement a function to deep clone a JavaScript object", difficulty: "Medium", topic: "JavaScript", type: "technical", company: "Uber", acceptance: "45.1%", frequency: "Medium" },
      { question: "Event Emitter - Build a simple pub/sub event emitter class", difficulty: "Medium", topic: "OOP", type: "technical", company: "Netflix", acceptance: "58.9%", frequency: "Medium" }
    ],
    'web-development': [
      { question: "Implement Virtual DOM Diffing - Create a basic virtual DOM reconciliation algorithm", difficulty: "Hard", topic: "React Internals", type: "technical", company: "Meta", acceptance: "38.4%", frequency: "Medium" },
      { question: "Build Autocomplete - Implement a search autocomplete with debouncing", difficulty: "Medium", topic: "React", type: "technical", company: "Google", acceptance: "55.2%", frequency: "High" },
      { question: "Infinite Scroll - Implement infinite scrolling with virtualization", difficulty: "Medium", topic: "Performance", type: "technical", company: "Pinterest", acceptance: "47.6%", frequency: "High" }
    ]
  };

  const behavioralQuestions = [
    {
      question: "Tell me about a time when you had to work with a difficult team member",
      difficulty: "Medium",
      topic: "Teamwork",
      type: "behavioral",
      company: "Google",
      frequency: "High",
      solution: "<strong class='text-blue-400'>Situation:</strong> During my CS capstone project, I was paired with a teammate who rarely attended meetings and didn't complete assigned tasks on time. <br/><br/><strong class='text-green-400'>Task:</strong> I needed to ensure our group project (a web application) stayed on track while maintaining team harmony. <br/><br/><strong class='text-purple-400'>Action:</strong> I first approached them privately to understand if they were facing personal challenges. I discovered they were struggling with the React framework we chose. Instead of escalating to the professor, I offered to pair-program with them and created a shared study schedule. I also redistributed some tasks to better match everyone's strengths. <br/><br/><strong class='text-orange-400'>Result:</strong> Our teammate became more engaged, contributed meaningfully to the project, and we delivered a successful application. I learned that apparent 'difficult' behavior often stems from underlying challenges, and proactive communication can resolve most team conflicts."
    },
    {
      question: "Describe a challenging project you worked on and how you overcame obstacles",
      difficulty: "Medium",
      topic: "Problem Solving",
      type: "behavioral",
      company: "Amazon",
      frequency: "High",
      solution: "<strong class='text-blue-400'>Situation:</strong> For my internship application portfolio, I decided to build a real-time chat application using technologies I'd never used before - Node.js, Socket.io, and MongoDB. <br/><br/><strong class='text-green-400'>Task:</strong> I had 3 weeks to complete it while managing coursework and a part-time job. <br/><br/><strong class='text-purple-400'>Action:</strong> I broke the project into smaller milestones: basic server setup, user authentication, real-time messaging, and UI polish. When I got stuck on implementing WebSocket connections, I systematically researched documentation, watched tutorials, and posted specific questions on Stack Overflow. I also reached out to a senior student who had experience with similar projects. <br/><br/><strong class='text-orange-400'>Result:</strong> I successfully completed the application, which helped me land my internship. The experience taught me how to learn new technologies quickly and the importance of asking for help when needed. I now use this same methodical approach for tackling unfamiliar technical challenges."
    },
    {
      question: "How do you handle tight deadlines and pressure?",
      difficulty: "Medium",
      topic: "Time Management",
      type: "behavioral",
      company: "Meta",
      frequency: "Very High",
      solution: "<strong class='text-blue-400'>Situation:</strong> During finals week last semester, I had three major coding assignments due within 48 hours, plus two exams to study for. <br/><br/><strong class='text-green-400'>Task:</strong> I needed to manage my time effectively to complete everything without compromising quality. <br/><br/><strong class='text-purple-400'>Action:</strong> I started by listing all tasks and estimating time for each. I prioritized based on due dates and complexity, then created a detailed schedule with specific time blocks. I eliminated distractions by working in the library, used the Pomodoro Technique for focused coding sessions, and took strategic breaks to avoid burnout. When I realized one assignment was taking longer than expected, I reached out to the TA for clarification rather than spending hours debugging alone. <br/><br/><strong class='text-orange-400'>Result:</strong> I completed all assignments on time and performed well on my exams. This experience taught me the importance of planning, prioritization, and knowing when to seek help. I now proactively manage my schedule to avoid such situations, but I'm confident in my ability to perform under pressure when necessary."
    },
    {
      question: "Tell me about a time you disagreed with a decision and how you handled it",
      difficulty: "Medium",
      topic: "Leadership Principles",
      type: "behavioral",
      company: "Amazon",
      frequency: "Very High",
      solution: "<strong class='text-blue-400'>Situation:</strong> In a software engineering group project, our team lead decided to use a NoSQL database for our e-commerce application without discussing alternatives. <br/><br/><strong class='text-green-400'>Task:</strong> I believed a relational database would be more suitable given our need for complex transactions and data relationships. <br/><br/><strong class='text-purple-400'>Action:</strong> I scheduled a one-on-one meeting with the team lead and presented my concerns with specific examples of transaction requirements. I created a comparison document showing pros and cons of both approaches. I focused on the project's success rather than being right, and suggested we prototype both approaches with a small feature. <br/><br/><strong class='text-orange-400'>Result:</strong> After the prototype, the team agreed that a relational database better suited our needs. The team lead appreciated my data-driven approach and collaborative attitude. This taught me the importance of respectful disagreement and backing opinions with evidence."
    },
    {
      question: "Describe a time when you had to learn something quickly to complete a project",
      difficulty: "Medium",
      topic: "Learning & Growth",
      type: "behavioral",
      company: "Meta",
      frequency: "High",
      solution: "<strong class='text-blue-400'>Situation:</strong> Two weeks before our mobile app project demo, our React Native developer had to leave the team due to personal reasons. <br/><br/><strong class='text-green-400'>Task:</strong> As the team's web developer with no mobile experience, I needed to take over the mobile frontend to ensure we met our deadline. <br/><br/><strong class='text-purple-400'>Action:</strong> I immediately created a learning plan: spent 2 days on React Native fundamentals through documentation and tutorials, then dove into our existing codebase. I set up daily check-ins with a friend who had mobile dev experience, and focused on understanding patterns rather than memorizing syntax. I prioritized completing existing features over adding new ones. <br/><br/><strong class='text-orange-400'>Result:</strong> We successfully demoed on time with all core features working. The professor praised our adaptability. I learned that strong fundamentals in one framework translate well to others, and that focused, deliberate learning beats panic-studying. This experience gave me confidence to tackle new technologies in future roles."
    },
    {
      question: "Give an example of when you had to make a difficult trade-off decision",
      difficulty: "Medium",
      topic: "Customer Obsession",
      type: "behavioral",
      company: "Amazon",
      frequency: "High",
      solution: "<strong class='text-blue-400'>Situation:</strong> While building a course registration web app, we had one week left and two major features incomplete: an advanced search filter and email notifications for course openings. <br/><br/><strong class='text-green-400'>Task:</strong> I needed to decide which feature to prioritize, as we only had time to properly implement one. <br/><br/><strong class='text-purple-400'>Action:</strong> I analyzed user feedback from our beta testers and found that 80% of users mentioned wanting notifications, while only 30% mentioned search filters. I presented data to the team showing that notifications would provide more value. I also proposed a simpler basic search that we could implement in 2 days, allowing us to deliver both features in limited form. <br/><br/><strong class='text-orange-400'>Result:</strong> We implemented full notification functionality and basic search. User satisfaction scores in our final presentation were 4.5/5. This taught me to make data-driven decisions focused on user needs, and to look for creative solutions that don't require choosing between extremes."
    }
  ];

  // Get all questions and shuffle
  const allTechQuestions = Object.values(technicalQuestions).flat();
  const shuffledTech = shuffleArray(allTechQuestions);
  const shuffledBehavioral = shuffleArray(behavioralQuestions);

  const relevantTechnical = shuffledTech;
  const relevantBehavioral = shuffledBehavioral;

  // Select top 5 questions total (3 technical, 2 behavioral for balanced split)
  const selectedTechnical = relevantTechnical.slice(0, 3);
  const selectedBehavioral = relevantBehavioral.slice(0, 2);

  // Return as separate arrays for 50/50 display
  return {
    technical: selectedTechnical,
    behavioral: selectedBehavioral,
    all: [...selectedTechnical, ...selectedBehavioral]
  };
};

export function generateMetadata(data: PageData): Metadata {
  const companyName = data.company?.name || 'Tech Company'
  const roleTitle = data.role?.title || 'Software Engineering Intern'
  const location = data.internship?.location || 'Remote'
  const currentYear = new Date().getFullYear()
  
  // Enhanced SEO keywords
  const baseKeywords = [
    `${companyName.toLowerCase()} interview questions`,
    `${roleTitle.toLowerCase()} interview prep`,
    `${companyName.toLowerCase()} coding interview`,
    `${roleTitle.toLowerCase()} practice questions`,
    `${location.toLowerCase()} tech internships`,
    `${companyName.toLowerCase()} ${roleTitle.toLowerCase()}`,
    `computer science internship interview`,
    `technical interview preparation`,
    `coding interview practice`,
    `software engineering interview guide`,
    `${currentYear} internship interview questions`,
    `${companyName.toLowerCase()} recruitment process`,
    `${data.company?.tier?.toLowerCase() || 'tech'} company interviews`,
    `algorithm interview questions`,
    `data structures interview prep`
  ]

  return {
    title: data.title,
    description: data.description,
    keywords: baseKeywords.join(', '),
    authors: [{ name: 'InterviewSense', url: 'https://www.interviewsense.org' }],
    creator: 'InterviewSense',
    publisher: 'InterviewSense',
    category: 'Education',
    classification: 'Interview Preparation',
    openGraph: {
      title: data.title,
      description: data.description,
      type: 'article',
      url: `https://www.interviewsense.org/opportunities/${data.slug}`,
      siteName: 'InterviewSense',
      locale: 'en_US',
      images: [
        {
          url: `https://www.interviewsense.org/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${companyName} ${roleTitle} Interview Preparation Guide`,
        },
      ],
      publishedTime: new Date().toISOString(),
      modifiedTime: new Date().toISOString(),
      authors: ['InterviewSense'],
      section: 'Interview Preparation',
      tags: baseKeywords.slice(0, 10),
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: data.description,
      creator: '@InterviewSense',
      images: [`https://www.interviewsense.org/og-image.png`],
    },
    alternates: {
      canonical: `https://www.interviewsense.org/opportunities/${data.slug}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: 'your-google-verification-code',
      yandex: 'your-yandex-verification-code',
      yahoo: 'your-yahoo-verification-code',
    },
  }
}

export function ProgrammaticSEOTemplate({ data, questions, relatedPages }: TemplateProps) {
  // Handle both old format (array) and new format (object with technical/behavioral)
  const questionsData = Array.isArray(questions) ? { technical: [], behavioral: [], all: questions } : questions;

  const companyName = data.company?.name || 'Tech Company'
  const roleTitle = data.role?.title || 'Software Engineering Intern'
  const location = data.internship?.location || 'Remote'
  const currentYear = new Date().getFullYear()

  // Enhanced structured data with multiple schema types
  const structuredDataArray = [
    // Main Article Schema
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": data.title,
      "description": data.description,
      "url": `https://www.interviewsense.org/opportunities/${data.slug}`,
      "datePublished": new Date().toISOString(),
      "dateModified": new Date().toISOString(),
      "author": {
        "@type": "Organization",
        "name": "InterviewSense",
        "url": "https://www.interviewsense.org"
      },
      "publisher": {
        "@type": "Organization",
        "name": "InterviewSense",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.interviewsense.org/logo.webp"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://www.interviewsense.org/opportunities/${data.slug}`
      },
      "keywords": `${companyName} interview, ${roleTitle} questions, coding interview prep, technical interview`
    },
    // Educational Course Schema
    {
      "@context": "https://schema.org",
      "@type": "Course",
      "name": `${companyName} ${roleTitle} Interview Preparation`,
      "description": `Complete interview preparation course for ${companyName} ${roleTitle} positions with practice questions and expert guidance`,
      "provider": {
        "@type": "Organization",
        "name": "InterviewSense"
      },
      "courseMode": "online",
      "educationalLevel": "undergraduate",
      "teaches": questionsData.all?.map(q => q.topic) || [],
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "online",
        "instructor": {
          "@type": "Organization",
          "name": "InterviewSense"
        }
      }
    },
    // JobPosting Schema (if apply URL exists)
    ...(data.internship?.applyUrl && data.internship.applyUrl !== '#' ? [{
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": roleTitle,
      "description": `${roleTitle} position at ${companyName} in ${location}`,
      "hiringOrganization": {
        "@type": "Organization",
        "name": companyName
      },
      "jobLocation": {
        "@type": "Place",
        "address": location
      },
      "employmentType": "INTERN",
      "datePosted": new Date().toISOString(),
      "validThrough": new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
      "url": data.internship.applyUrl,
      "industry": "Technology",
      "occupationalCategory": "Software Engineering"
    }] : []),
    // FAQPage Schema for questions
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": questionsData.all?.slice(0, 5).map((q, index) => ({
        "@type": "Question",
        "name": q.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": q.solution || `Practice question for ${companyName} ${roleTitle} technical interview focusing on ${q.topic || 'software engineering'} concepts.`
        }
      })) || []
    }
  ];

  return (
    <>
      {/* Enhanced structured data with multiple schemas */}
      {structuredDataArray.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://cdn.jsdelivr.net" />
      
      {/* SEO Meta Tags (these are invisible but crucial for SEO) */}
      <meta name="geo.region" content="US" />
      <meta name="geo.placename" content={location} />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      <meta name="revisit-after" content="7 days" />
      <meta name="language" content="en" />
      
      {/* Breadcrumb structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.interviewsense.org"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Opportunities",
                "item": "https://www.interviewsense.org/opportunities"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": data.title,
                "item": `https://www.interviewsense.org/opportunities/${data.slug}`
              }
            ]
          })
        }}
      />

      <div className="min-h-screen bg-black text-white">
        {/* Hero Section */}
        <section className="pt-24 pb-16 px-4 relative border-b" style={{ borderColor: 'rgba(29,100,255,0.15)' }}>
          <div className="container mx-auto max-w-6xl relative z-10">
            {/* Back Button */}
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-2 mb-12 text-sm hover:opacity-80 transition-opacity"
              style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Back to Opportunities
            </Link>

            {/* Company Profile Header - Left Aligned */}
            {data.company && (
              <div className="flex items-start gap-6">
                {/* Large Logo */}
                <div className="relative flex-shrink-0">
                  <img
                    src={`https://img.logo.dev/${data.company.slug}.com?token=pk_Qc_me_jVR_W-pQM8CWOeAw`}
                    alt={`${data.company.name} logo`}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-contain"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(29,100,255,0.3)',
                      padding: '16px',
                      boxShadow: '0 0 30px rgba(29,100,255,0.2)'
                    }}
                  />
                </div>

                {/* Company Info */}
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl md:text-4xl font-bold text-white" style={{
                      fontFamily: 'Syne, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
                      letterSpacing: '-0.02em'
                    }}>
                      {data.company.name}
                    </h1>
                    <BadgeCheck className="h-7 w-7 md:h-8 md:w-8 flex-shrink-0" style={{ color: '#1877f2' }} />
                  </div>
                  <p className="text-sm md:text-base" style={{
                    color: 'rgba(255,255,255,0.5)',
                    fontFamily: 'DM Sans, -apple-system, sans-serif'
                  }}>
                    {data.company.slug}.com
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Sample Questions Section - 50/50 Split */}
        <section id="questions" className="py-16 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4" style={{
                fontFamily: 'Syne, -apple-system, sans-serif'
              }}>Interview Questions</h2>
              <p className="text-lg max-w-2xl mx-auto" style={{
                color: 'rgba(255,255,255,0.7)',
                fontFamily: 'DM Sans, -apple-system, sans-serif'
              }}>
                Practice with real questions asked in interviews. Click any card to reveal the answer.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Technical Questions - Left Side (50%) */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Code className="h-6 w-6" style={{ color: '#1877f2' }} />
                  <h3 className="text-2xl font-bold text-white" style={{
                    fontFamily: 'Syne, -apple-system, sans-serif'
                  }}>Technical Questions</h3>
                </div>
                <div className="space-y-6">
                  {questionsData.technical.length > 0 ? (
                    questionsData.technical.map((question, index) => (
                      <FlipQuestionCard key={index} question={question} companyName={data.company?.name} />
                    ))
                  ) : (
                    <div className="p-6 text-center" style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(29,100,255,0.2)',
                      borderRadius: '16px'
                    }}>
                      <p style={{ color: 'rgba(255,255,255,0.6)' }}>Sign up to access technical questions</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Behavioral Questions - Right Side (50%) */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Brain className="h-6 w-6" style={{ color: '#1877f2' }} />
                  <h3 className="text-2xl font-bold text-white" style={{
                    fontFamily: 'Syne, -apple-system, sans-serif'
                  }}>Behavioral Questions</h3>
                </div>
                <div className="space-y-6">
                  {questionsData.behavioral.length > 0 ? (
                    questionsData.behavioral.map((question, index) => (
                      <FlipQuestionCard key={index} question={question} companyName={data.company?.name} />
                    ))
                  ) : (
                    <div className="p-6 text-center" style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(29,100,255,0.2)',
                      borderRadius: '16px'
                    }}>
                      <p style={{ color: 'rgba(255,255,255,0.6)' }}>Sign up to access behavioral questions</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </section>


        {/* Related Pages */}
        {relatedPages.length > 0 && (
          <section className="py-16 px-4">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4" style={{
                  fontFamily: 'Syne, -apple-system, sans-serif'
                }}>Related Interview Prep</h2>
                <p className="text-lg" style={{
                  color: 'rgba(255,255,255,0.7)',
                  fontFamily: 'DM Sans, -apple-system, sans-serif'
                }}>Explore more interview questions and topics</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPages.slice(0, 6).map((page, index) => (
                  <div key={index} className="p-6 transition-all duration-300 hover:scale-105" style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(29,100,255,0.2)',
                    borderRadius: '16px'
                  }}>
                    <h3 className="text-lg font-bold text-white mb-2" style={{
                      fontFamily: 'Syne, -apple-system, sans-serif'
                    }}>{page.title}</h3>
                    <p className="text-sm mb-4" style={{
                      color: 'rgba(255,255,255,0.6)',
                      fontFamily: 'DM Sans, -apple-system, sans-serif'
                    }}>{page.description}</p>
                    <Button
                      asChild
                      size="sm"
                      className="w-full text-white font-medium"
                      style={{
                        background: 'rgba(24,119,242,0.15)',
                        color: '#1877f2',
                        borderRadius: '8px',
                        fontFamily: 'Syne, -apple-system, sans-serif'
                      }}
                    >
                      <Link href="/signup">
                        View Questions <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* SEO Content Section - Hidden from users but visible to search engines */}
        <section style={{ 
          color: '#000000', 
          backgroundColor: '#000000',
          fontSize: '1px',
          lineHeight: '1px',
          position: 'absolute',
          left: '-9999px',
          width: '1px',
          height: '1px',
          overflow: 'hidden'
        }}>
          <div>
            {/* Interview Process Overview */}
            <div>
              <h2>
                {companyName} {roleTitle} Interview Process {currentYear}
              </h2>
              <div>
                <p>
                  The {companyName} {roleTitle} interview typically consists of {data.company?.typical_questions || 220}+ technical questions 
                  covering algorithms, data structures, and system design. Located in {location}, this position offers 
                  hands-on experience with cutting-edge technology and mentorship from senior engineers.
                </p>
                <p>
                  Key interview stages include: initial screening, technical coding rounds focusing on {data.company?.focus_areas?.join(', ') || 'software development, system design, behavioral'}, 
                  and final rounds with team leads. The difficulty level is rated as {data.company?.difficulty || 'Medium'} 
                  within the {data.company?.tier || 'Enterprise'} tier.
                </p>
              </div>
            </div>

            {/* Skills & Preparation Tips */}
            <div>
              <h3>
                Essential Skills for {companyName} {roleTitle} Role
              </h3>
              <div>
                <div>
                  <h4>Technical Skills</h4>
                  <ul>
                    {(data.role?.skills || ['Programming', 'Problem Solving', 'System Design', 'Algorithms']).map((skill: string, index: number) => (
                      <li key={index}>{skill}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4>Interview Topics</h4>
                  <ul>
                    {(data.company?.focus_areas || ['Data Structures', 'Algorithms', 'System Design', 'Behavioral']).map((topic: string, index: number) => (
                      <li key={index}>{topic}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Company-Specific Insights */}
            <div>
              <h3>
                What Makes {companyName} Different
              </h3>
              <div>
                <p>
                  {companyName} is known for its {data.company?.tier === 'FAANG' ? 'rigorous technical standards and innovative culture' :
                   data.company?.tier === 'Big Tech' ? 'cutting-edge technology and rapid growth' : 
                   'collaborative environment and meaningful impact'}. 
                  Interns work on real production systems and contribute to projects used by millions of users.
                </p>
                <p>
                  The company offers comprehensive learning opportunities, including mentorship programs, 
                  technical talks, and hands-on experience with industry-leading tools and frameworks. 
                  {roleTitle} interns typically work in {location} with hybrid flexibility.
                </p>
              </div>
            </div>

            {/* Frequently Asked Questions */}
            <div>
              <h3>
                Frequently Asked Questions
              </h3>
              <div>
                <div>
                  <h4>
                    How difficult is the {companyName} {roleTitle} interview?
                  </h4>
                  <p>
                    The interview is rated as {data.company?.difficulty || 'Medium'} difficulty. Candidates should prepare 
                    for {data.company?.typical_questions || 220}+ practice questions covering algorithms, data structures, 
                    and system design fundamentals.
                  </p>
                </div>
                <div>
                  <h4>
                    What programming languages are accepted?
                  </h4>
                  <p>
                    Most candidates use Python, Java, C++, or JavaScript. Choose the language you're most comfortable with 
                    for optimal performance during coding rounds.
                  </p>
                </div>
                <div>
                  <h4>
                    How long is the {companyName} interview process?
                  </h4>
                  <p>
                    The process typically takes 2-4 weeks from initial application to final decision, 
                    including phone screens, technical rounds, and team interviews.
                  </p>
                </div>
                <div>
                  <h4>
                    {companyName} {roleTitle} salary and benefits
                  </h4>
                  <p>
                    {companyName} offers competitive compensation packages for {roleTitle} positions in {location}. 
                    Benefits include health insurance, learning stipends, mentorship programs, and potential full-time conversion opportunities.
                  </p>
                </div>
                <div>
                  <h4>
                    Best preparation resources for {companyName} interviews
                  </h4>
                  <p>
                    Practice coding problems on LeetCode, study system design fundamentals, review computer science concepts, 
                    and prepare behavioral questions using the STAR method. Focus on {data.company?.focus_areas?.join(', ') || 'algorithms, data structures, and problem solving'}.
                  </p>
                </div>
              </div>
            </div>

            {/* Additional SEO Keywords */}
            <div>
              <h3>
                {companyName} Internship Program {currentYear}
              </h3>
              <p>
                Apply for {companyName} {roleTitle} internship {currentYear}. Summer internship opportunities at {companyName} in {location}. 
                Software engineering intern jobs {currentYear}. Tech internships {location}. Computer science internship interview preparation. 
                {companyName} recruiting process. {data.company?.tier || 'Tech'} company internships. 
                Coding interview practice for {companyName}. {roleTitle} interview questions and answers.
                {companyName} internship application tips. How to get internship at {companyName}.
                {companyName} interview experience. {roleTitle} salary {location}. 
                {companyName} internship review. Best {companyName} interview preparation.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center p-12" style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(29,100,255,0.2)',
              borderRadius: '16px'
            }}>
              <h2 className="text-4xl font-bold text-white mb-4" style={{
                fontFamily: 'Syne, -apple-system, sans-serif'
              }}>
                Ready to Ace Your Interview?
              </h2>
              <p className="text-xl mb-8" style={{
                color: 'rgba(255,255,255,0.7)',
                fontFamily: 'DM Sans, -apple-system, sans-serif'
              }}>
                Join thousands of CS students landing internships at top tech companies.
              </p>

              <Button
                asChild
                size="lg"
                className="text-lg px-10 py-6 text-white font-semibold"
                style={{
                  background: '#1877f2',
                  borderRadius: '12px',
                  fontFamily: 'Syne, -apple-system, sans-serif'
                }}
              >
                <Link href="/signup">
                  Start Practicing Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <p className="text-sm mt-6" style={{
                color: 'rgba(255,255,255,0.5)',
                fontFamily: 'DM Sans, -apple-system, sans-serif'
              }}>
                No credit card required
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
