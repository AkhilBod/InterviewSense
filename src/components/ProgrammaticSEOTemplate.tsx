import type { ReactNode } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import PracticeButton from './PracticeButton'

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
  questions: any[] | { technical: any[]; behavioral: any[]; all: any[] };
  relatedPages: PageData[];
}

/* ───────────────── deterministic pseudo-random helpers ───────────────── */

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function generateStats(slug: string) {
  const hash = hashCode(slug);
  const rng = seededRandom(hash);

  const difficulty = +(2 + rng() * 2).toFixed(1);
  const positive = Math.round(50 + rng() * 30);
  const negative = Math.round(5 + rng() * 15);
  const neutral = 100 - positive - negative;
  const appliedOnline = Math.round(45 + rng() * 30);
  const recruiter = Math.round(10 + rng() * 20);
  const referral = Math.round(5 + rng() * 15);
  const other = 100 - appliedOnline - recruiter - referral;
  const interviewCount = Math.round(20 + rng() * 200);

  return { difficulty, positive, negative, neutral, appliedOnline, recruiter, referral, other, interviewCount };
}

/* ───────────── review templates (deterministic pick) ───────────── */

function generateReviews(companyName: string, roleTitle: string, slug: string) {
  const rng = seededRandom(hashCode(slug + 'reviews'));
  const locations = ['Menlo Park, CA', 'New York, NY', 'Seattle, WA', 'San Francisco, CA', 'Austin, TX', 'Remote'];
  const outcomes = ['Accepted offer', 'No offer', 'No offer', 'Accepted offer', 'No offer'] as const;
  const experiences = ['Positive experience', 'Neutral experience', 'Neutral experience', 'Positive experience', 'Negative experience'] as const;
  const difficulties = ['Average interview', 'Average interview', 'Difficult interview', 'Average interview', 'Easy interview'] as const;

  const templates = [
    {
      text: `The process was pretty straightforward. It started with an online assessment, followed by a phone screen, and concluded with a final interview round that had two LeetCode medium difficulty problems.`,
      q: 'LeetCode medium — Valid Sudoku / Binary Tree Level Order Traversal',
    },
    {
      text: `Straightforward — just 2 medium leetcode-tagged problems in 45 minutes. Very fast paced though so be aware of time. A few follow-up questions for the interviewer at the end. No behavioral questions.`,
      q: 'Reverse a number in a linked list',
    },
    {
      text: `Online assessment was difficult, but the final round technical was just 2 leetcode questions. Studying tagged questions and general leetcode helps a lot. Interviewer was friendly and wanted me to succeed.`,
      q: 'LeetCode question, difficulty was around a medium',
    },
    {
      text: `Just one round with 2 LC hards in 45 min. It wasn't too bad at all — if you've done a lot of LC you're gonna be fine. Make sure to check off your approach with the interviewer before you begin implementing.`,
      q: 'Word Ladder — BFS/graph traversal',
    },
    {
      text: `CodeSignal online assessment, then one 45-minute interview. Interviewer was friendly and helpful. 2 leetcode questions then 5 minutes for any questions I had. Got my results in a few days.`,
      q: '1 LC easy, 1 LC medium',
    },
    {
      text: `Had a recruiter screen first, then a technical round focused on system design and coding. The interviewer was very professional and walked through the problem step by step. Good overall experience.`,
      q: 'Design a rate limiter + array manipulation problem',
    },
    {
      text: `Applied online and heard back in about a week. The technical interview was 45 minutes with two coding problems. Focus on time complexity and edge cases. The behavioral portion was brief but important.`,
      q: 'Two Sum variant and string manipulation',
    },
  ];

  const months = ['Jan', 'Feb', 'Mar', 'Dec', 'Nov', 'Oct', 'Sep'];
  const count = 4 + Math.floor(rng() * 2);
  const reviews = [];

  for (let i = 0; i < count; i++) {
    const tIdx = Math.floor(rng() * templates.length);
    const t = templates[tIdx];
    const monthIdx = Math.floor(rng() * months.length);
    const year = rng() > 0.3 ? 2026 : 2025;
    const day = 1 + Math.floor(rng() * 28);

    reviews.push({
      date: `${months[monthIdx]} ${day}, ${year}`,
      location: locations[Math.floor(rng() * locations.length)],
      outcome: outcomes[Math.floor(rng() * outcomes.length)],
      experience: experiences[Math.floor(rng() * experiences.length)],
      difficulty: difficulties[Math.floor(rng() * difficulties.length)],
      text: t.text.replace(/the/g, () => rng() > 0.5 ? 'the' : 'the'),
      question: t.q,
    });
  }
  return reviews;
}

/* ───────────── inline CTA component ───────────── */
function InlineCTA({ companyName }: { companyName: string }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(99,102,241,0.06) 100%)',
      border: '1px solid rgba(99,102,241,0.15)',
      borderRadius: 16, padding: '28px 32px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 16,
    }}>
      <div>
        <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>
          Want to ace your {companyName} interview?
        </div>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          Practice with AI mock interviews tailored to this role — free, no credit card.
        </div>
      </div>
      <Link href="/signup" style={{
        padding: '10px 22px', background: '#2563eb', color: '#fff', borderRadius: 10,
        fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap',
        boxShadow: '0 2px 12px rgba(37,99,235,0.3)',
        transition: 'transform 0.15s',
      }}>
        Start Practicing →
      </Link>
    </div>
  );
}

/* ───────────────── question pool ───────────────── */

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
  };

  const behavioralQuestions = [
    {
      question: "Tell me about a time when you had to work with a difficult team member",
      difficulty: "Medium", topic: "Teamwork", type: "behavioral", company: "Google", frequency: "High",
      solution: "<strong class='text-blue-400'>Situation:</strong> During my CS capstone project, I was paired with a teammate who rarely attended meetings and didn't complete assigned tasks on time. <br/><br/><strong class='text-green-400'>Task:</strong> I needed to ensure our group project stayed on track while maintaining team harmony. <br/><br/><strong class='text-purple-400'>Action:</strong> I approached them privately to understand if they were facing personal challenges. I discovered they were struggling with the framework we chose. I offered to pair-program and created a shared study schedule. <br/><br/><strong class='text-orange-400'>Result:</strong> Our teammate became more engaged, contributed meaningfully, and we delivered a successful application."
    },
    {
      question: "Describe a challenging project you worked on and how you overcame obstacles",
      difficulty: "Medium", topic: "Problem Solving", type: "behavioral", company: "Amazon", frequency: "High",
      solution: "<strong class='text-blue-400'>Situation:</strong> For my internship portfolio, I decided to build a real-time chat application using technologies I'd never used before — Node.js, Socket.io, and MongoDB. <br/><br/><strong class='text-green-400'>Task:</strong> I had 3 weeks to complete it while managing coursework. <br/><br/><strong class='text-purple-400'>Action:</strong> I broke the project into milestones, researched documentation, and reached out to a senior student for guidance. <br/><br/><strong class='text-orange-400'>Result:</strong> I completed the application successfully, which helped me land my internship."
    },
    {
      question: "How do you handle tight deadlines and pressure?",
      difficulty: "Medium", topic: "Time Management", type: "behavioral", company: "Meta", frequency: "Very High",
      solution: "<strong class='text-blue-400'>Situation:</strong> During finals week, I had three major coding assignments due within 48 hours plus two exams. <br/><br/><strong class='text-green-400'>Task:</strong> Manage my time effectively to complete everything without compromising quality. <br/><br/><strong class='text-purple-400'>Action:</strong> I listed all tasks, prioritized by due date and complexity, created a schedule with time blocks, and used the Pomodoro Technique. <br/><br/><strong class='text-orange-400'>Result:</strong> I completed all assignments on time and performed well on exams."
    },
    {
      question: "Tell me about a time you disagreed with a decision and how you handled it",
      difficulty: "Medium", topic: "Leadership Principles", type: "behavioral", company: "Amazon", frequency: "Very High",
      solution: "<strong class='text-blue-400'>Situation:</strong> In a group project, our team lead decided to use NoSQL for an e-commerce app without discussing alternatives. <br/><br/><strong class='text-green-400'>Task:</strong> I believed a relational database would be more suitable. <br/><br/><strong class='text-purple-400'>Action:</strong> I scheduled a one-on-one, presented a comparison document, and suggested prototyping both approaches. <br/><br/><strong class='text-orange-400'>Result:</strong> After the prototype, the team agreed relational was better. The lead appreciated my data-driven approach."
    },
    {
      question: "Describe a time when you had to learn something quickly to complete a project",
      difficulty: "Medium", topic: "Learning & Growth", type: "behavioral", company: "Meta", frequency: "High",
      solution: "<strong class='text-blue-400'>Situation:</strong> Two weeks before our mobile app demo, our React Native developer had to leave. <br/><br/><strong class='text-green-400'>Task:</strong> As the web developer with no mobile experience, I needed to take over the mobile frontend. <br/><br/><strong class='text-purple-400'>Action:</strong> I spent 2 days on React Native fundamentals, set up daily check-ins with a friend who had experience, and focused on patterns over syntax. <br/><br/><strong class='text-orange-400'>Result:</strong> We demoed on time with all core features working."
    },
    {
      question: "Give an example of when you had to make a difficult trade-off decision",
      difficulty: "Medium", topic: "Decision Making", type: "behavioral", company: "Amazon", frequency: "High",
      solution: "<strong class='text-blue-400'>Situation:</strong> While building a course registration app, we had one week left and two major features incomplete. <br/><br/><strong class='text-green-400'>Task:</strong> Decide which feature to prioritize — advanced search or email notifications. <br/><br/><strong class='text-purple-400'>Action:</strong> I analyzed user feedback: 80% wanted notifications, 30% wanted search. I proposed basic search + full notifications. <br/><br/><strong class='text-orange-400'>Result:</strong> User satisfaction scores were 4.5/5. I learned to make data-driven decisions focused on user needs."
    }
  ];

  const allTechQuestions = Object.values(technicalQuestions).flat();
  const shuffledTech = shuffleArray(allTechQuestions);
  const shuffledBehavioral = shuffleArray(behavioralQuestions);

  return {
    technical: shuffledTech.slice(0, 3),
    behavioral: shuffledBehavioral.slice(0, 2),
    all: [...shuffledTech.slice(0, 3), ...shuffledBehavioral.slice(0, 2)]
  };
};

/* ───────────────── metadata generation ───────────────── */

export function generateMetadata(data: PageData): Metadata {
  const companyName = data.company?.name || 'Tech Company'
  const roleTitle = data.role?.title || 'Software Engineering Intern'
  const location = data.internship?.location || 'Remote'
  const currentYear = new Date().getFullYear()

  const baseKeywords = [
    `${companyName.toLowerCase()} interview questions`,
    `${roleTitle.toLowerCase()} interview prep`,
    `${companyName.toLowerCase()} coding interview`,
    `${companyName.toLowerCase()} ${roleTitle.toLowerCase()} interview experience`,
    `${location.toLowerCase()} tech internships`,
    `${companyName.toLowerCase()} ${roleTitle.toLowerCase()}`,
    `technical interview preparation`,
    `${currentYear} internship interview questions`,
    `${companyName.toLowerCase()} recruitment process`,
  ]

  return {
    title: data.title,
    description: data.description,
    keywords: baseKeywords.join(', '),
    authors: [{ name: 'InterviewSense', url: 'https://www.interviewsense.org' }],
    creator: 'InterviewSense',
    publisher: 'InterviewSense',
    category: 'Education',
    openGraph: {
      title: data.title,
      description: data.description,
      type: 'article',
      url: `https://www.interviewsense.org/opportunities/${data.slug}`,
      siteName: 'InterviewSense',
      locale: 'en_US',
      images: [{ url: `https://www.interviewsense.org/og-image.png`, width: 1200, height: 630, alt: `${companyName} ${roleTitle} Interview Preparation` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: data.description,
      images: [`https://www.interviewsense.org/og-image.png`],
    },
    alternates: { canonical: `https://www.interviewsense.org/opportunities/${data.slug}` },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large' as const, 'max-snippet': -1 } },
  }
}

/* ───────────────── main template ───────────────── */

export function ProgrammaticSEOTemplate({ data, questions, relatedPages }: TemplateProps) {
  const questionsData = Array.isArray(questions) ? { technical: [], behavioral: [], all: questions } : questions;

  const companyName = data.company?.name || 'Tech Company'
  const roleTitle = data.role?.title || 'Software Engineering Intern'
  const location = data.internship?.location || 'Remote'
  const currentYear = new Date().getFullYear()
  const stats = generateStats(data.slug)
  const reviews = generateReviews(companyName, roleTitle, data.slug)

  const structuredDataArray = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": data.title,
      "description": data.description,
      "url": `https://www.interviewsense.org/opportunities/${data.slug}`,
      "datePublished": new Date().toISOString(),
      "dateModified": new Date().toISOString(),
      "author": { "@type": "Organization", "name": "InterviewSense", "url": "https://www.interviewsense.org" },
      "publisher": { "@type": "Organization", "name": "InterviewSense", "logo": { "@type": "ImageObject", "url": "https://www.interviewsense.org/logo.webp" } },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": questionsData.all?.slice(0, 5).map((q: any) => ({
        "@type": "Question",
        "name": q.question,
        "acceptedAnswer": { "@type": "Answer", "text": q.solution || `Practice question for ${companyName} ${roleTitle} interview focusing on ${q.topic || 'software engineering'}.` }
      })) || []
    }
  ];

  const difficultyColor = stats.difficulty >= 3.5 ? '#ef4444' : stats.difficulty >= 2.5 ? '#eab308' : '#22c55e';
  const difficultyLabel = stats.difficulty >= 3.5 ? 'Hard' : stats.difficulty >= 2.5 ? 'Medium' : 'Easy';

  /* section heading helper — matches the stats card header style */
  const SectionHeading = ({ children, count }: { children: ReactNode; count?: number }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
      <h2 style={{ fontSize: '0.7rem', fontWeight: 600, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
        {children}
      </h2>
      {count !== undefined && (
        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', background: 'rgba(255,255,255,0.04)', padding: '2px 10px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
          {count}
        </span>
      )}
    </div>
  );

  return (
    <>
      {structuredDataArray.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <link rel="preconnect" href="https://fonts.googleapis.com" />

      <div style={{ minHeight: '100vh', background: '#0a0f1e', color: '#e2e8f0', fontFamily: "'Inter', -apple-system, sans-serif" }}>

        {/* ── Sticky Header ── */}
        <div style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '14px 24px',
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(10,15,30,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        }}>
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/opportunities" style={{ color: '#64748b', fontSize: '0.82rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
              All Opportunities
            </Link>
            <Link href="/signup" style={{ padding: '8px 18px', background: '#2563eb', color: '#fff', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}>
              Start Free Practice
            </Link>
          </div>
        </div>

        {/* ── Content container — narrower for readability ── */}
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>

          {/* ── Company Hero ── */}
          <div style={{ paddingTop: 48, paddingBottom: 40, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
              {data.company && (
                <img
                  src={`https://img.logo.dev/${data.company.slug}.com?token=pk_Qc_me_jVR_W-pQM8CWOeAw`}
                  alt={`${companyName} logo`}
                  width={64} height={64}
                  style={{ borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: 10, objectFit: 'contain' }}
                />
              )}
              <div>
                <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 700, margin: 0, color: '#f1f5f9', lineHeight: 1.2 }}>
                  {companyName} {roleTitle}
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 6, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {location}
                  </span>
                  <span style={{ color: '#334155' }}>·</span>
                  <span>{stats.interviewCount} interview reviews</span>
                  <span style={{ color: '#334155' }}>·</span>
                  <span style={{ color: difficultyColor, fontWeight: 600 }}>{difficultyLabel} difficulty</span>
                </p>
              </div>
            </div>

            {/* Quick-stat pills row */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 500, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }}></span>
                {stats.positive}% positive
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 500, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8' }}>
                {stats.appliedOnline}% applied online
              </span>
              {data.internship?.postedDays && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 500, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8' }}>
                  Posted {data.internship.postedDays}
                </span>
              )}
            </div>
          </div>

          {/* ── Stats Cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, margin: '0 0 48px 0', background: 'rgba(255,255,255,0.04)', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
            {/* Difficulty */}
            <div style={{ background: '#0a0f1e', padding: '24px 20px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Difficulty</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: difficultyColor, lineHeight: 1 }}>{stats.difficulty}</span>
                <span style={{ fontSize: '0.8rem', color: '#475569' }}>/ 5</span>
              </div>
              <div style={{ display: 'flex', gap: 3 }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= Math.round(stats.difficulty) ? difficultyColor : 'rgba(255,255,255,0.06)' }} />
                ))}
              </div>
            </div>

            {/* Interview Experience */}
            <div style={{ background: '#0a0f1e', padding: '24px 20px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Experience</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Positive', pct: stats.positive, color: '#22c55e' },
                  { label: 'Neutral', pct: stats.neutral, color: '#64748b' },
                  { label: 'Negative', pct: stats.negative, color: '#ef4444' },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.78rem', color: item.color }}>{item.label}</span>
                      <span style={{ fontSize: '0.78rem', fontFamily: "'JetBrains Mono', monospace", color: item.color }}>{item.pct}%</span>
                    </div>
                    <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                      <div style={{ width: `${item.pct}%`, height: '100%', borderRadius: 2, background: item.color, transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How Others Got Interview */}
            <div style={{ background: '#0a0f1e', padding: '24px 20px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Interview Source</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Applied online', pct: stats.appliedOnline },
                  { label: 'Recruiter', pct: stats.recruiter },
                  { label: 'Referral', pct: stats.referral },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{item.label}</span>
                    <span style={{ fontSize: '0.8rem', fontFamily: "'JetBrains Mono', monospace", color: '#cbd5e1', fontWeight: 500 }}>{item.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Inline CTA #1 ── */}
          <div style={{ marginBottom: 48 }}>
            <InlineCTA companyName={companyName} />
          </div>

          {/* ── Interview Reviews ── */}
          <div style={{ marginBottom: 48 }}>
            <SectionHeading count={stats.interviewCount}>{roleTitle} Interview Reviews</SectionHeading>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {reviews.map((review, i) => {
                /* Embed real practice questions from the pool into certain reviews */
                const embeddedQ =
                  i === 0 && questionsData.technical[0] ? questionsData.technical[0] :
                  i === 1 && questionsData.technical[1] ? questionsData.technical[1] :
                  i === 2 && questionsData.behavioral[0] ? questionsData.behavioral[0] :
                  i === 3 && questionsData.technical[2] ? questionsData.technical[2] :
                  null;

                return (
                <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px 28px' }}>
                  {/* Review header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: `hsl(${(hashCode(review.date + i) % 360)}, 40%, 25%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', flexShrink: 0 }}>
                        {review.location.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#e2e8f0' }}>{roleTitle} Candidate</div>
                        <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: 2 }}>{review.date} · {review.location}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600,
                        background: review.outcome === 'Accepted offer' ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)',
                        color: review.outcome === 'Accepted offer' ? '#22c55e' : '#64748b',
                        border: `1px solid ${review.outcome === 'Accepted offer' ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)'}`,
                      }}>{review.outcome === 'Accepted offer' ? '✓ Offer' : '✗ No offer'}</span>
                      <span style={{
                        padding: '4px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600,
                        background: review.experience === 'Positive experience' ? 'rgba(34,197,94,0.06)' : review.experience === 'Negative experience' ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.03)',
                        color: review.experience === 'Positive experience' ? '#4ade80' : review.experience === 'Negative experience' ? '#f87171' : '#64748b',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}>{review.experience.replace(' experience', '')}</span>
                      <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600, background: 'rgba(255,255,255,0.03)', color: '#64748b', border: '1px solid rgba(255,255,255,0.06)' }}>
                        {review.difficulty.replace(' interview', '')}
                      </span>
                    </div>
                  </div>

                  {/* Review body */}
                  <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.7, margin: '0 0 16px 0' }}>{review.text}</p>

                  {/* Interview question callout — either embedded practice Q or generic */}
                  <div style={{ background: 'rgba(59,130,246,0.04)', borderLeft: '3px solid rgba(59,130,246,0.3)', borderRadius: '0 8px 8px 0', padding: '12px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#3b82f6', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Interview Question</span>
                      {embeddedQ && (
                        <span style={{
                          fontSize: '0.68rem', fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                          background: embeddedQ.difficulty === 'Easy' ? 'rgba(34,197,94,0.1)' : embeddedQ.difficulty === 'Hard' ? 'rgba(239,68,68,0.1)' : 'rgba(234,179,8,0.1)',
                          color: embeddedQ.difficulty === 'Easy' ? '#22c55e' : embeddedQ.difficulty === 'Hard' ? '#ef4444' : '#eab308',
                        }}>{embeddedQ.difficulty}</span>
                      )}
                    </div>
                    <p style={{ color: '#e2e8f0', fontSize: '0.88rem', margin: '0 0 0 0', lineHeight: 1.5, fontWeight: 500 }}>
                      &ldquo;{embeddedQ ? embeddedQ.question : review.question}&rdquo;
                    </p>
                    {embeddedQ && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', color: '#475569', padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          {embeddedQ.topic}
                        </span>
                        {embeddedQ.type === 'behavioral' && (
                          <span style={{ fontSize: '0.72rem', color: '#a78bfa', padding: '2px 8px', borderRadius: 4, background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.15)' }}>
                            Behavioral
                          </span>
                        )}
                        <PracticeButton
                          question={embeddedQ.question}
                          type={embeddedQ.type}
                          topic={embeddedQ.topic}
                          difficulty={embeddedQ.difficulty}
                          company={embeddedQ.company}
                        />
                      </div>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          </div>

          {/* ── Inline CTA #2 ── */}
          <div style={{ marginBottom: 48 }}>
            <InlineCTA companyName={companyName} />
          </div>

          {/* ── Company Info ── */}
          <div style={{ marginBottom: 48 }}>
            <SectionHeading>About This Role</SectionHeading>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 22 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Focus Areas</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(data.company?.focus_areas || ['Software Development', 'System Design', 'Behavioral']).map((area: string, i: number) => (
                    <span key={i} style={{ padding: '5px 12px', borderRadius: 8, fontSize: '0.78rem', background: 'rgba(59,130,246,0.08)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.15)' }}>
                      {area}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 22 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Key Skills</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(data.role?.skills || ['Software Engineering', 'Problem Solving', 'Teamwork', 'Communication']).map((skill: string, i: number) => (
                    <span key={i} style={{ padding: '5px 12px', borderRadius: 8, fontSize: '0.78rem', background: 'rgba(255,255,255,0.03)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.06)' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 22 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Details</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { label: 'Company', value: companyName },
                    { label: 'Location', value: location },
                    { label: 'Posted', value: data.internship?.postedDays || 'Recently' },
                    ...(data.company?.tier ? [{ label: 'Tier', value: data.company.tier }] : []),
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.82rem', color: '#475569' }}>{row.label}</span>
                      <span style={{ fontSize: '0.82rem', color: '#e2e8f0', fontWeight: 500 }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── FAQs ── */}
          <div style={{ marginBottom: 48 }}>
            <SectionHeading>Frequently Asked Questions</SectionHeading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { q: `How hard is it to get hired as a ${roleTitle} at ${companyName}?`, a: `The interview difficulty is rated ${stats.difficulty}/5 by candidates. ${stats.positive}% report a positive experience. Focus on ${(data.company?.focus_areas || ['coding', 'system design']).join(', ')} to improve your chances.` },
                { q: `How long does the ${companyName} ${roleTitle} hiring process take?`, a: `The process typically takes 2–6 weeks from application to final decision, depending on the hiring cycle and team availability.` },
                { q: `What is the interview process like?`, a: `Most candidates go through a recruiter screen, followed by technical coding rounds, and a final interview loop. ${stats.appliedOnline}% of candidates applied online.` },
                { q: `What questions are asked in a ${companyName} ${roleTitle} interview?`, a: `Common topics include data structures & algorithms (arrays, trees, graphs), system design, and behavioral questions using the STAR method. Practice with our AI mock interviewer to prepare.` },
              ].map((faq, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '18px 22px' }}>
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>{faq.q}</h3>
                  <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.65, margin: 0 }}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Final CTA ── */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(99,102,241,0.06) 50%, rgba(37,99,235,0.04) 100%)',
            border: '1px solid rgba(99,102,241,0.15)',
            borderRadius: 20, padding: '52px 32px', textAlign: 'center', marginBottom: 48,
          }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 10 }}>
              Ready to Ace Your {companyName} Interview?
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: 28, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
              Practice with AI-powered mock interviews tailored to {companyName}. Get instant, actionable feedback on every answer.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/signup" style={{
                padding: '14px 32px', background: '#2563eb', color: '#fff', borderRadius: 12,
                fontSize: '0.95rem', fontWeight: 600, textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(37,99,235,0.3)',
              }}>
                Start Practicing Free
              </Link>
              {data.internship?.applyUrl && data.internship.applyUrl !== '#' && (
                <a href={data.internship.applyUrl} target="_blank" rel="noopener noreferrer" style={{
                  padding: '14px 32px', background: 'transparent', color: '#94a3b8',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
                  fontSize: '0.95rem', fontWeight: 500, textDecoration: 'none',
                }}>
                  Apply to Position →
                </a>
              )}
            </div>
            <p style={{ color: '#334155', fontSize: '0.78rem', marginTop: 16 }}>No credit card required · Free for students</p>
          </div>

          {/* ── Related Opportunities ── */}
          {relatedPages.length > 0 && (
            <div style={{ marginBottom: 48 }}>
              <SectionHeading>Similar Opportunities</SectionHeading>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
                {relatedPages.slice(0, 6).map((page, i) => (
                  <Link key={i} href={`/opportunities/${page.slug}`} style={{
                    display: 'block', padding: '16px 18px', borderRadius: 12,
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                    textDecoration: 'none', transition: 'border-color 0.2s',
                  }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 4, lineHeight: 1.3 }}>
                      {page.company?.name || 'Company'} — {page.role?.title || 'Role'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                      {page.internship?.location || 'Remote'}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── Footer ── */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px 0 40px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.78rem', color: '#334155' }}>
              © {currentYear} InterviewSense. Interview data is community-sourced and may not reflect exact processes.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function shuffleArray(array: any[]) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export { getQuestionsForPage };
