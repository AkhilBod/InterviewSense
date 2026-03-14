"use client"

import Link from "next/link";
import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useProfileData } from '@/hooks/useProfileData';
import { PrefilledChip, ToggleGroup } from '@/components/ProfileFormComponents';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, User, Mic, MicOff, Play, CheckCircle, ChevronDown, ChevronUp, Lightbulb, Clock, Box, ExternalLink, BookOpen, Zap, Target, RefreshCw, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { toast } from "@/components/ui/use-toast";
import { transcribeAndAnalyzeAudio } from '@/lib/gemini';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { MicrophonePermissionGuide } from '@/components/MicrophonePermissionGuide';
import { MicrophoneTest } from '@/components/MicrophoneTest';
import { testMicrophone } from '@/lib/microphone';
import Editor from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import OnboardingDialog from '@/components/OnboardingDialog';

const TECH_ONBOARDING_STEPS = [
  {
    title: 'Your code editor',
    description: 'Write your solution here — it works just like a real coding interview. Type, paste, and edit freely. Drag the divider on the left to resize the panels.',
    target: '[data-onboarding="tech-editor"]',
    position: 'left' as const,
  },
  {
    title: 'Pick your language',
    description: 'Switch between Python, JavaScript, Java, C++, and more. The starter template updates when you change it.',
    target: '[data-onboarding="tech-lang"]',
    position: 'bottom' as const,
  },
  {
    title: 'Explain while you code',
    description: 'This records your voice as you think out loud — interviewers grade your thought process. Tap to start, tap again to stop.',
    target: '[data-onboarding="tech-record"]',
    position: 'bottom' as const,
  },
  {
    title: 'Submit for AI evaluation',
    description: 'When you\'re done, hit Submit to get scored on correctness, time complexity, and code quality. Check the Solutions tab on the left if you get stuck.',
    target: '[data-onboarding="tech-submit"]',
    position: 'bottom' as const,
  },
];

interface TechnicalAssessmentProps {
  onComplete?: () => void;
}

const TECH_JOB_TITLES = [
  { id: 'frontend-developer', title: 'Frontend Developer', description: 'React, Vue, Angular, JavaScript, TypeScript' },
  { id: 'backend-developer', title: 'Backend Developer', description: 'Node.js, Python, Java, Go, APIs, Databases' },
  { id: 'fullstack-developer', title: 'Full Stack Developer', description: 'Frontend + Backend Development' },
  { id: 'mobile-developer', title: 'Mobile Developer', description: 'React Native, Flutter, iOS, Android' },
  { id: 'devops-engineer', title: 'DevOps Engineer', description: 'AWS, Docker, Kubernetes, CI/CD, Infrastructure' },
  { id: 'software-engineer', title: 'Software Engineer', description: 'General Software Development' },
  { id: 'senior-software-engineer', title: 'Senior Software Engineer', description: 'Advanced Software Development & Leadership' },
  { id: 'tech-lead', title: 'Tech Lead', description: 'Technical Leadership & Architecture' },
  { id: 'engineering-manager', title: 'Engineering Manager', description: 'Team Management & Technical Strategy' },
  { id: 'aiml-engineer', title: 'AI/ML Engineer', description: 'Python, TensorFlow, PyTorch, Machine Learning' },
  { id: 'data-engineer', title: 'Data Engineer', description: 'SQL, Spark, Data Pipelines, ETL' },
  { id: 'data-scientist', title: 'Data Scientist', description: 'Statistics, Machine Learning, Analytics' },
  { id: 'security-engineer', title: 'Security Engineer', description: 'Cybersecurity, Penetration Testing, InfoSec' },
  { id: 'qa-engineer', title: 'QA Engineer', description: 'Testing, Automation, Quality Assurance' },
  { id: 'platform-engineer', title: 'Platform Engineer', description: 'Infrastructure, Platform Tools, Developer Experience' },
  { id: 'site-reliability-engineer', title: 'Site Reliability Engineer (SRE)', description: 'System Reliability, Monitoring, Performance' },
  { id: 'cloud-engineer', title: 'Cloud Engineer', description: 'AWS, Azure, GCP, Cloud Architecture' },
  { id: 'solutions-architect', title: 'Solutions Architect', description: 'System Design, Architecture, Technical Strategy' },
  { id: 'product-engineer', title: 'Product Engineer', description: 'Product Development, User Experience, Business Logic' },
  { id: 'embedded-engineer', title: 'Embedded Systems Engineer', description: 'C/C++, Hardware, IoT, Firmware' },
  { id: 'other', title: 'Other', description: 'Enter your own job title' }
];

// Add type definition for category
// ── Company list (GitHub: snehasishroy/leetcode-companywise-interview-questions) ──
const FEATURED_COMPANIES = ['google','amazon','meta','microsoft','apple','netflix','uber','airbnb','bloomberg','linkedin','stripe','shopify','snowflake','databricks','coinbase','doordash'];
const ALL_COMPANIES = [
  'adobe','agoda','airbnb','airtel','akamai','amazon','american-express','amplitude','apple',
  'applied-intuition','arcesium','atlassian','audible','baidu','bloomberg','bytedance',
  'capital-one','cisco','citadel','citi','cloudflare','coinbase','coupang','coursera',
  'crowdstrike','databricks','datadog','de-shaw','deloitte','discord','disney','doordash',
  'dropbox','duolingo','ebay','epic-games','expedia','figma','flipkart','freshworks',
  'github','goldman-sachs','google','grab','grammarly','groww','hsbc','hubspot','hulu',
  'ibm','instacart','intel','intuit','jane-street','jpmorgan','juspay','karat','lacework',
  'linkedin','lyft','mastercard','meesho','meta','microsoft','mongodb','morgan-stanley',
  'netflix','nvidia','okta','openai','oracle','palantir-technologies','palo-alto-networks',
  'paypal','paytm','phonepe','pinterest','plaid','postman','qualcomm','quora','razorpay',
  'reddit','roblox','robinhood','rubrik','salesforce','samsung','sap','scale-ai',
  'servicenow','shopify','siemens','snapchat','snowflake','spotify','square','stripe',
  'swiggy','target','tcs','tesla','the-trade-desk','tiktok','tinder','two-sigma','uber',
  'upstart','visa','vmware','walmart-labs','wayfair','waymo','wells-fargo','wise','workday',
  'yahoo','yelp','zillow','zoom','zomato','zoho','zscaler',
].sort();

const COMPANY_TIMEFRAMES = [
  { value: 'thirty-days',           label: '30 Days' },
  { value: 'three-months',          label: '3 Months' },
  { value: 'six-months',            label: '6 Months' },
  { value: 'more-than-six-months',  label: '6+ Months' },
  { value: 'all',                   label: 'All Time' },
];

function fmtCompany(slug: string): string {
  return slug.split('-').map(w =>
    w === 'jp' ? 'JP' : w === 'bnp' ? 'BNP' : w === 'sap' ? 'SAP' :
    w === 'ibm' ? 'IBM' : w === 'tcs' ? 'TCS' : w === 'hsbc' ? 'HSBC' :
    w.charAt(0).toUpperCase() + w.slice(1)
  ).join(' ');
}

interface PresetCategory {
  name: string;
  count: number;
  icon: string;
}

interface LeetCodePreset {
  id: string;
  title: string;
  description: string;
  totalProblems: number;
  categories: PresetCategory[];
  difficulty: string;
  estimatedHours: number;
  icon: string;
}

const LEETCODE_PRESETS: LeetCodePreset[] = [
  {
    id: 'blind75',
    title: 'Blind 75',
    description: 'Classic collection of coding interview problems',
    totalProblems: 75,
    categories: [
      { name: 'Arrays & Hashing', count: 8, icon: '📦' },
      { name: 'Two Pointers', count: 3, icon: '🧭' },
      { name: 'Sliding Window', count: 4, icon: '🚪' },
      { name: 'Stack', count: 1, icon: '🧱' },
      { name: 'Binary Search', count: 2, icon: '🔍' },
      { name: 'Linked List', count: 6, icon: '🔗' },
      { name: 'Trees', count: 11, icon: '🌲' },
      { name: 'Heap / Priority Queue', count: 1, icon: '📊' },
      { name: 'Backtracking', count: 2, icon: '🧠' },
      { name: 'Tries', count: 3, icon: '✏️' },
      { name: 'Graphs', count: 6, icon: '🌐' },
      { name: 'Advanced Graphs', count: 1, icon: '🔁' },
      { name: '1-D Dynamic Programming', count: 10, icon: '➕' },
      { name: '2-D Dynamic Programming', count: 2, icon: '🔢' },
      { name: 'Greedy', count: 2, icon: '🪙' },
      { name: 'Intervals', count: 5, icon: '⏱' },
      { name: 'Math & Geometry', count: 3, icon: '📐' },
      { name: 'Bit Manipulation', count: 5, icon: '⚙️' }
    ],
    difficulty: 'Mixed',
    estimatedHours: 40,
    icon: '👨‍💻'
  },
  {
    id: 'neetcode150',
    title: 'NeetCode 150',
    description: 'Extended collection of must-solve problems',
    totalProblems: 150,
    categories: [
      { name: 'Arrays & Hashing', count: 9, icon: '📦' },
      { name: 'Two Pointers', count: 5, icon: '🧭' },
      { name: 'Sliding Window', count: 6, icon: '🚪' },
      { name: 'Stack', count: 7, icon: '🧱' },
      { name: 'Binary Search', count: 7, icon: '🔍' },
      { name: 'Linked List', count: 11, icon: '🔗' },
      { name: 'Trees', count: 15, icon: '🌲' },
      { name: 'Heap / Priority Queue', count: 7, icon: '📊' },
      { name: 'Backtracking', count: 9, icon: '🧠' },
      { name: 'Tries', count: 3, icon: '✏️' },
      { name: 'Graphs', count: 13, icon: '🌐' },
      { name: 'Advanced Graphs', count: 6, icon: '🧭' },
      { name: '1-D Dynamic Programming', count: 12, icon: '➕' },
      { name: '2-D Dynamic Programming', count: 11, icon: '🔢' },
      { name: 'Greedy', count: 8, icon: '🪙' },
      { name: 'Intervals', count: 6, icon: '⏱' },
      { name: 'Math & Geometry', count: 8, icon: '🧮' },
      { name: 'Bit Manipulation', count: 7, icon: '⚙️' }
    ],
    difficulty: 'Mixed',
    estimatedHours: 75,
    icon: '🎯'
  },
  {
    id: 'grind75',
    title: 'Grind 75',
    description: 'Time-efficient list of 75 essential coding interview questions',
    totalProblems: 75,
    categories: [
      { name: 'Array', count: 11, icon: '📦' },
      { name: 'Binary', count: 1, icon: '🔢' },
      { name: 'Binary Search', count: 5, icon: '🔍' },
      { name: 'Binary Tree', count: 9, icon: '🌲' },
      { name: 'Dynamic Programming', count: 5, icon: '📈' },
      { name: 'Graph', count: 10, icon: '🌐' },
      { name: 'Hash Table', count: 1, icon: '🧮' },
      { name: 'Heap', count: 4, icon: '📊' },
      { name: 'Linked List', count: 5, icon: '🔗' },
      { name: 'Matrix', count: 1, icon: '🧱' },
      { name: 'Recursion', count: 3, icon: '🔁' },
      { name: 'Stack', count: 7, icon: '📚' },
      { name: 'String', count: 8, icon: '🧵' },
      { name: 'Trie', count: 2, icon: '✏️' }
    ],
    difficulty: 'Mixed',
    estimatedHours: 25,
    icon: '💪'
  }
];

// Helper function to clean markdown formatting from text
function cleanMarkdownText(text: string): string {
  return text
    // Remove bold markdown
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Remove italic markdown
    .replace(/\*(.*?)\*/g, '$1')
    // Remove code backticks
    .replace(/`(.*?)`/g, '$1')
    // Remove extra spaces
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper function to parse LeetCode problem from text with better formatting
function parseLeetCodeProblem(problemText: string) {
  const lines = problemText.split('\n').filter(line => line.trim());
  
  let number = 0;
  let title = '';
  let difficulty = 'Medium';
  let description = '';
  let examples: { input: string; output: string; explanation?: string }[] = [];
  let constraints: string[] = [];
  let hints: string[] = [];
  let timeComplexity = '';
  let spaceComplexity = '';
  
  let currentSection = '';
  let currentExample: any = {};
  let descriptionStarted = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Extract problem number and title - Handle various formats
    const problemMatch = line.match(/^(?:\*\*)?(?:Problem)?:?\s*(?:#\s*)?(\d+)\.\s*(.+?)(?:\*\*)?$/);
    if (problemMatch) {
      number = parseInt(problemMatch[1]);
      title = problemMatch[2].replace(/\*/g, '').trim();
      continue;
    }
    
    // Alternative title extraction
    const titleMatch = line.match(/^#\s*(\d+)\.\s*(.+)$/);
    if (titleMatch) {
      number = parseInt(titleMatch[1]);
      title = titleMatch[2].trim();
      continue;
    }
    
    // Extract difficulty
    if (line.includes('**Difficulty:**') || line.includes('Difficulty:')) {
      const diffMatch = line.match(/(?:Easy|Medium|Hard)/i);
      if (diffMatch) {
        difficulty = diffMatch[0];
      }
      continue;
    }
    
    // Detect section changes
    if (line.includes('**Example') || line.startsWith('Example')) {
      if (currentExample.input || currentExample.output) {
        examples.push({ ...currentExample });
        currentExample = {};
      }
      currentSection = 'examples';
      continue;
    }
    
    if (line.includes('**Constraints:**') || line.includes('Constraints:')) {
      if (currentExample.input || currentExample.output) {
        examples.push({ ...currentExample });
        currentExample = {};
      }
      currentSection = 'constraints';
      continue;
    }

    // Extract hints
    if (line.includes('**Hint') || line.startsWith('Hint')) {
      currentSection = 'hints';
      continue;
    }

    // Extract complexity
    if (line.includes('Time Complexity:')) {
      timeComplexity = line.replace('Time Complexity:', '').trim();
      continue;
    }

    if (line.includes('Space Complexity:')) {
      spaceComplexity = line.replace('Space Complexity:', '').trim();
      continue;
    }
    
    if (line.includes('Follow up') || line.includes('Follow-up')) {
      currentSection = 'followup';
      continue;
    }
    
    // Process main description
    if (!descriptionStarted && !line.startsWith('**') && !line.startsWith('#') && 
        !line.includes('Input:') && !line.includes('Output:') && 
        !line.includes('Example') && !line.includes('Constraints') &&
        line.length > 20) {
      descriptionStarted = true;
      currentSection = 'description';
    }
    
    if (currentSection === 'description' && !line.startsWith('**') && line.length > 0) {
      description += (description ? ' ' : '') + line;
    } else if (currentSection === 'examples') {
      // Enhanced example parsing
      if (line.includes('Input:')) {
        const inputMatch = line.match(/Input:\s*(.+)/);
        if (inputMatch) currentExample.input = inputMatch[1].trim();
      } else if (line.includes('Output:')) {
        const outputMatch = line.match(/Output:\s*(.+)/);
        if (outputMatch) currentExample.output = outputMatch[1].trim();
      } else if (line.includes('Explanation:')) {
        const explanationMatch = line.match(/Explanation:\s*(.+)/);
        if (explanationMatch) currentExample.explanation = explanationMatch[1].trim();
      }
    } else if (currentSection === 'constraints') {
      if (line.startsWith('* ') || line.startsWith('- ') || line.startsWith('• ')) {
        constraints.push(line.substring(2).trim());
      } else if (line.match(/^\d+/) || line.includes('<=') || line.includes('>=')) {
        constraints.push(line);
      }
    } else if (currentSection === 'hints' && line.length > 0 && !line.startsWith('**') && !line.startsWith('Hint')) {
      hints.push(line.trim());
    }
  }
  
  // Add last example if exists
  if (currentExample.input || currentExample.output) {
    examples.push({ ...currentExample });
  }
  
  // Fallback parsing for common patterns
  if (!title && lines.length > 0) {
    // Try to find title in first few lines
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const line = lines[i];
      if (line.includes('.') && !line.includes('Input:') && !line.includes('Output:')) {
        const parts = line.split('.');
        if (parts.length >= 2) {
          const numPart = parts[0].replace(/[^\d]/g, '');
          if (numPart) {
            number = parseInt(numPart);
            title = parts.slice(1).join('.').replace(/[*#]/g, '').trim();
            break;
          }
        }
      }
    }
  }
  
  // Default values if not found
  if (!title) title = "Technical Problem";
  if (!number) number = 1;
  if (!description) {
    // Extract first substantial paragraph as description
    const substantialLines = lines.filter(line => 
      line.length > 30 && 
      !line.includes('Input:') && 
      !line.includes('Output:') && 
      !line.includes('Example') &&
      !line.startsWith('#') &&
      !line.startsWith('**')
    );
    description = substantialLines.slice(0, 3).join(' ').substring(0, 300) + '...';
  }

  // Default hints if none found
  if (hints.length === 0) {
    // Check if it's a string manipulation problem
    if (description.toLowerCase().includes('string') || examples.some(ex => typeof ex.input === 'string' && ex.input.includes('"'))) {
      hints = [
        "First, clean up the string by handling extra spaces (leading, trailing, and between words)",
        "Consider splitting the string into an array of words for easier manipulation",
        "Think about how to efficiently join the words back together in reverse order"
      ];
    } else {
      hints = [
        "Try to break down the problem into smaller subproblems",
        "Consider using appropriate data structures",
        "Think about edge cases"
      ];
    }
  }

  // Default complexities if none found
  if (!timeComplexity || !spaceComplexity) {
    // For string manipulation problems
    if (description.toLowerCase().includes('string') || examples.some(ex => typeof ex.input === 'string' && ex.input.includes('"'))) {
      timeComplexity = "O(n) where n is the length of the string";
      spaceComplexity = "O(n) to store the array of words";
    } else {
      timeComplexity = "O(n)";
      spaceComplexity = "O(1)";
    }
  }
  
  return {
    number,
    title,
    difficulty: difficulty as 'Easy' | 'Medium' | 'Hard',
    description: cleanMarkdownText(description.trim()),
    examples,
    hints,
    timeComplexity,
    spaceComplexity,
    followUp: "Can you optimize your solution further?" // Generic follow-up question
  };
}

// Add this component near the top, after imports
const ProblemStatement = ({ text }: { text: string }) => {
  return (
    <div className="space-y-2">
      <p className="text-lg leading-relaxed text-slate-100">{text}</p>
    </div>
  );
};

export function TechnicalAssessment({ onComplete }: TechnicalAssessmentProps) {
  // Loading state for submit button
  const [isLoading, setIsLoading] = useState(false);
  const [company, setCompany] = useState('');
  const [overridingCompany, setOverridingCompany] = useState(false);
  const [role, setRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [question, setQuestion] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [thoughtProcess, setThoughtProcess] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const isTranscribingRef = useRef(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();
  const { profile } = useProfileData();

  // Pre-fill company, role, and coding language from profile on first load
  useEffect(() => {
    if (profile.targetCompany && !company) setCompany(profile.targetCompany);
    if (profile.targetRole && !role) setRole(profile.targetRole);
    if (profile.preferredCodingLanguage) setLanguage(profile.preferredCodingLanguage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.targetCompany, profile.targetRole, profile.preferredCodingLanguage]);

  // Auto-start with a saved technical question from the dashboard
  useEffect(() => {
    const stored = localStorage.getItem('practiceTechnicalQuestion');
    if (!stored) return;
    localStorage.removeItem('practiceTechnicalQuestion');

    const { leetcodeNumber, questionText } = JSON.parse(stored) as { leetcodeNumber: number | null; questionText: string };

    const loadQuestion = async (id: number) => {
      setIsLoading(true);
      setQuestionSaved(false);
      try {
        const res = await fetch('/api/technical-assessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ useCustomNumber: true, leetcodeNumber: id }),
        });
        const data = await res.json();
        if (data.success) {
          setQuestion(data.question);
          setProblemTopics(data.topics || []);
          setProblemId(data.problemId || null);
          if (data.codeTemplates) setApiCodeTemplates(data.codeTemplates);
        } else {
          toast({ title: 'Error', description: data.error || 'Failed to load question.', variant: 'destructive' });
        }
      } catch {
        toast({ title: 'Error', description: 'Failed to load question.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };

    if (leetcodeNumber) {
      loadQuestion(leetcodeNumber);
    } else if (questionText) {
      // Look up by title in the LeetCode problems database
      fetch(`/api/questions/lookup-leetcode?title=${encodeURIComponent(questionText)}`)
        .then(r => r.json())
        .then(data => {
          if (data.id) {
            loadQuestion(data.id);
          } else {
            toast({ title: 'Question not found', description: `Could not find "${questionText}" in LeetCode database.`, variant: 'destructive' });
          }
        })
        .catch(() => {
          toast({ title: 'Error', description: 'Failed to look up question.', variant: 'destructive' });
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Add state for question progression
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(3); // Default to 3 questions
  const [questions, setQuestions] = useState<Array<{
    question: string;
    code: string;
    thoughtProcess: string;
    audioUrl: string | null;
    completed: boolean;
    skipped: boolean;
  }>>([]);
  const [questionsGenerated, setQuestionsGenerated] = useState(false);
  
  // Add state for problem selection mode
  const [problemMode, setProblemMode] = useState<'ai' | 'specific' | 'preset'>('ai');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Company questions state
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [companyTimeframe, setCompanyTimeframe] = useState('all');
  const [companyQuestions, setCompanyQuestions] = useState<Array<{id:number;title:string;difficulty:string;frequency:string}> | null>(null);
  const [isLoadingCompany, setIsLoadingCompany] = useState(false);
  const [companySearch, setCompanySearch] = useState('');
  const [companyError, setCompanyError] = useState<string | null>(null);

  // Terminal resize
  const [terminalHeight, setTerminalHeight] = useState(220);
  const isDraggingTerminal = useRef(false);
  const dragStartY = useRef(0);
  const dragStartH = useRef(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDraggingTerminal.current) return;
      const delta = dragStartY.current - e.clientY;
      setTerminalHeight(Math.max(80, Math.min(600, dragStartH.current + delta)));
    };
    const onUp = () => { isDraggingTerminal.current = false; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  }, []);
  
  // Add state for microphone permission guide
  const [showPermissionGuide, setShowPermissionGuide] = useState(false);
  
  // Add state for LeetCode question number functionality
  const [leetcodeNumber, setLeetcodeNumber] = useState('');
  const [useCustomNumber, setUseCustomNumber] = useState(false);
  
  // Add state for active tab
  const [activeTab, setActiveTab] = useState('problem');
  
  // Add state for dynamic solutions
  const [solutions, setSolutions] = useState<any[]>([]);
  const [solutionsLoading, setSolutionsLoading] = useState(false);
  const [solutionsGenerated, setSolutionsGenerated] = useState(false);
  const [problemTopics, setProblemTopics] = useState<string[]>([]);
  const [problemId, setProblemId] = useState<number | null>(null);
  const [questionSaved, setQuestionSaved] = useState(false);
  // API-returned code templates (with real function signatures)
  const [apiCodeTemplates, setApiCodeTemplates] = useState<Record<string, string> | null>(null);
  // Resizable split state: left panel width as percentage
  const [splitPos, setSplitPos] = useState(45);
  const splitDragging = useRef(false);

  // Client-side duration timer
  const [elapsedSec, setElapsedSec] = useState(0);
  const timerStartRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start timer when a question loads
  useEffect(() => {
    if (question) {
      // Reset and start
      timerStartRef.current = Date.now();
      setElapsedSec(0);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        if (timerStartRef.current) {
          setElapsedSec(Math.floor((Date.now() - timerStartRef.current) / 1000));
        }
      }, 1000);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [question]);

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };
  
  // Monaco Editor ref
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Language templates
  const languageTemplates: Record<string, string> = {
    javascript: `function solution() {
    // Write your solution here
    
}`,
    python: `def solution():
    # Write your solution here
    pass`,
    java: `public class Solution {
    public int[] solution() {
        // Write your solution here
        
    }
}`,
    cpp: `#include <vector>
using namespace std;

class Solution {
public:
    vector<int> solution() {
        // Write your solution here
        
    }
};`,
    typescript: `function solution(): number[] {
    // Write your solution here
    
}`,
    go: `func solution() []int {
    // Write your solution here
    
}`,
    rust: `impl Solution {
    pub fn solution() -> Vec<i32> {
        // Write your solution here
        
    }
}`,
    csharp: `public class Solution {
    public int[] Solution() {
        // Write your solution here
        
    }
}`
  };

  // Generate solutions using Gemini
  const generateSolutions = async () => {
    if (solutionsLoading || solutionsGenerated) return;
    
    setSolutionsLoading(true);
    try {
      const leetcodeProblem = parseLeetCodeProblem(question);
      
      const prompt = `
Generate 3 different solution approaches for this coding problem:

Problem: ${leetcodeProblem.title}
Description: ${leetcodeProblem.description}
Difficulty: ${leetcodeProblem.difficulty}

For each approach, provide:
1. Title (descriptive name)
2. Time complexity
3. Space complexity  
4. Description (2-3 sentences)
5. 3 pros and 3 cons
6. Code implementation in JavaScript, Python, and Java

Please structure as a JSON array with this format:
[
  {
    "id": "approach-1",
    "title": "Approach Name",
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(1)",
    "difficulty": "Easy|Medium|Hard",
    "description": "Brief description",
    "pros": ["Pro 1", "Pro 2", "Pro 3"],
    "cons": ["Con 1", "Con 2", "Con 3"],
    "code": {
      "javascript": "function solution() { ... }",
      "python": "def solution(): ...",
      "java": "public class Solution { ... }"
    }
  }
]

Generate approaches from brute force to optimal, ensuring code is syntactically correct and well-commented.
`;

      const response = await fetch('/api/gemini-behavioral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt,
          systemPrompt: "You are an expert software engineer providing multiple solution approaches for coding problems. Always return valid JSON."
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.response) {
        try {
          // Extract JSON from response if it's wrapped in markdown
          let jsonStr = data.response;
          if (jsonStr.includes('```json')) {
            jsonStr = jsonStr.match(/```json\s*([\s\S]*?)\s*```/)?.[1] || jsonStr;
          } else if (jsonStr.includes('```')) {
            jsonStr = jsonStr.match(/```\s*([\s\S]*?)\s*```/)?.[1] || jsonStr;
          }
          
          const generatedSolutions = JSON.parse(jsonStr);
          setSolutions(generatedSolutions);
          setSolutionsGenerated(true);
          
          toast({
            title: "Solutions generated",
            description: `${generatedSolutions.length} solution approaches ready`,
          });
        } catch (parseError) {
          console.error('Error parsing solutions JSON:', parseError);
          toast({
            title: "Error parsing solutions",
            description: "Failed to parse generated solutions. Using fallback.",
            variant: "destructive"
          });
          // Fallback to basic solutions
          setSolutions(getFallbackSolutions());
          setSolutionsGenerated(true);
        }
      } else {
        throw new Error('Failed to generate solutions');
      }
    } catch (error) {
      console.error('Error generating solutions:', error);
      toast({
        title: "Error generating solutions",
        description: "Using fallback solutions instead.",
        variant: "destructive"
      });
      // Fallback to basic solutions
      setSolutions(getFallbackSolutions());
      setSolutionsGenerated(true);
    } finally {
      setSolutionsLoading(false);
    }
  };

  // Fallback solutions in case Gemini fails
  const getFallbackSolutions = () => {
    return [
      {
        id: 'brute-force',
        title: 'Brute Force Approach',
        timeComplexity: 'O(n²)',
        spaceComplexity: 'O(1)',
        difficulty: 'Easy',
        description: 'A straightforward approach that checks all possible combinations.',
        pros: ['Easy to understand', 'Simple implementation', 'Good starting point'],
        cons: ['High time complexity', 'May timeout on large inputs', 'Not scalable'],
        code: {
          javascript: `// Brute force approach
function solution() {
    // Implementation details depend on the specific problem
    // This is a placeholder for the actual solution
    return [];
}`,
          python: `# Brute force approach
def solution():
    # Implementation details depend on the specific problem
    # This is a placeholder for the actual solution
    pass`,
          java: `// Brute force approach
public class Solution {
    public int[] solution() {
        // Implementation details depend on the specific problem
        // This is a placeholder for the actual solution
        return new int[]{};
    }
}`
        }
      },
      {
        id: 'optimal',
        title: 'Optimized Approach',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        difficulty: 'Medium',
        description: 'An optimized solution using efficient data structures and algorithms.',
        pros: ['Better time complexity', 'Scalable solution', 'Industry standard'],
        cons: ['Uses more space', 'Slightly more complex', 'Requires understanding of data structures'],
        code: {
          javascript: `// Optimized approach
function solution() {
    // Implementation details depend on the specific problem
    // This is a placeholder for the actual solution
    return [];
}`,
          python: `# Optimized approach
def solution():
    # Implementation details depend on the specific problem
    # This is a placeholder for the actual solution
    pass`,
          java: `// Optimized approach
public class Solution {
    public int[] solution() {
        // Implementation details depend on the specific problem
        // This is a placeholder for the actual solution
        return new int[]{};
    }
}`
        }
      }
    ];
  };

  // Update code when language changes
  useEffect(() => {
    const templates = apiCodeTemplates || languageTemplates;
    const allGenericTemplates = Object.values(languageTemplates);
    if (!code || allGenericTemplates.includes(code) || (apiCodeTemplates && Object.values(apiCodeTemplates).includes(code))) {
      setCode(templates[language] || languageTemplates[language]);
    }
  }, [language, code, languageTemplates, apiCodeTemplates]);

  // Initialize with default template
  useEffect(() => {
    if (!code) {
      const templates = apiCodeTemplates || languageTemplates;
      setCode(templates[language] || languageTemplates[language]);
    }
  }, [code, language, languageTemplates, apiCodeTemplates]);

  // When apiCodeTemplates arrive, update the editor code
  useEffect(() => {
    if (apiCodeTemplates && apiCodeTemplates[language]) {
      setCode(apiCodeTemplates[language]);
    }
  }, [apiCodeTemplates]);

  // Reset solutions when question changes
  useEffect(() => {
    if (question) {
      setSolutions([]);
      setSolutionsGenerated(false);
      setSolutionsLoading(false);
      setActiveTab('problem'); // Start with problem tab
    }
  }, [question]);

  // Auto-load solutions when switching to solutions tab — use fallback data, NO AI call
  useEffect(() => {
    if (activeTab === 'solutions' && question && !solutionsGenerated && !solutionsLoading) {
      // Load from local fallback data — no AI call
      setSolutions(getFallbackSolutions());
      setSolutionsGenerated(true);
    }
  }, [activeTab, question, solutionsGenerated, solutionsLoading]);

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  };

  const handleSaveTechnicalQuestion = async () => {
    if (!question) return;
    const lc = parseLeetCodeProblem(question);
    const questionId = `technical-${lc.number || lc.title.toLowerCase().replace(/\s+/g, '-')}`;
    try {
      const res = await fetch('/api/questions/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          questionText: lc.title || question.slice(0, 200),
          type: 'TECHNICAL',
          difficulty: lc.difficulty || difficulty,
          company: company || undefined,
        }),
      });
      if (res.ok || res.status === 409) {
        setQuestionSaved(true);
        toast({ title: 'Question saved', description: 'Added to your saved questions.' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to save question.', variant: 'destructive' });
    }
  };

  // Test execution state
  const [isRunning, setIsRunning] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [testResults, setTestResults] = useState<{
    passed: number;
    total: number;
    status: string;
    error?: string;
    stderr?: string;
    results: Array<{ passed: boolean | null; output: string; expected: string | null; isCustom?: boolean }>;
    customResults?: Array<{ output: string }>;
  } | null>(null);

  const loadCompanyQuestions = async (company: string, timeframe: string) => {
    setIsLoadingCompany(true);
    setCompanyError(null);
    setCompanyQuestions(null);
    try {
      const url = `https://raw.githubusercontent.com/snehasishroy/leetcode-companywise-interview-questions/master/${company}/${timeframe}.csv`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Not available for this timeframe');
      const text = await res.text();
      const lines = text.trim().split('\n').filter(Boolean);
      // Skip header row if present (starts with non-numeric)
      const start = isNaN(parseInt(lines[0]?.split(',')[0])) ? 1 : 0;
      const parsed = lines.slice(start).map(line => {
        const cols = line.split(',');
        return {
          id: parseInt(cols[0]) || 0,
          title: (cols[2] || '').replace(/"/g, '').trim(),
          difficulty: (cols[3] || '').replace(/"/g, '').trim(),
          frequency: (cols[5] || '').replace(/"/g, '').trim(),
        };
      }).filter(q => q.id > 0 && q.title);
      setCompanyQuestions(parsed);
    } catch {
      setCompanyError('Questions not available for this timeframe — try "All Time"');
    } finally {
      setIsLoadingCompany(false);
    }
  };

  const runCode = async () => {
    if (!code || !problemId || isRunning) return;
    setIsRunning(true);
    setTestResults(null);
    try {
      const res = await fetch('/api/execute-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code, language, problemId,
          customInputs: customInput.trim() ? [customInput.trim()] : [],
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setTestResults({
          passed: 0, total: 0, status: data.status || 'error',
          error: data.error || 'Execution failed',
          stderr: data.stderr,
          results: [],
        });
      } else {
        setTestResults(data);
      }
    } catch {
      setTestResults({ passed: 0, total: 0, status: 'error', error: 'Network error', results: [] });
    } finally {
      setIsRunning(false);
    }
  };

  // Add state for tracking current LeetCode number
  const [currentLeetCodeNumber, setCurrentLeetCodeNumber] = useState<number | null>(null);

  const [isSkipping, setIsSkipping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to get the next question
  const getNextQuestion = async () => {
    try {
      setIsLoading(true);
      setQuestion('');
      setQuestionSaved(false);
      setApiCodeTemplates(null);
      setSolutions([]);
      setSolutionsGenerated(false);
      setTestResults(null);
      setCustomInput('');

      // If a specific question is selected, use its ID
      const response = await fetch('/api/technical-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company,
          role,
          difficulty,
          useCustomNumber: selectedQuestion ? true : false,
          leetcodeNumber: selectedQuestion?.id,
          preset: selectedPreset,
          category: selectedCategory,
          generateSolutions: false
        }),
      });

      const data = await response.json();

      if (data.success) {
        setQuestion(data.question);
        if (data.codeTemplates) setApiCodeTemplates(data.codeTemplates);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to generate question. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error getting question:', error);
      toast({
        title: "Error",
        description: "Failed to generate question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    if (isSkipping) return;
    setIsSkipping(true);
    try {
      // Get next question
      await getNextQuestion();
      toast({
        title: "Question Skipped",
        description: "Moving to next question...",
      });
    } catch (error) {
      console.error('Error skipping question:', error);
      toast({
        title: "Error",
        description: "Failed to skip question. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSkipping(false);
    }
  };

  const handleNext = async () => {
    if (isSubmitting) return;
    if (!code) {
      toast({
        title: "Incomplete Solution",
        description: "Please write your code solution before continuing.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Save current solution first
      const currentNumber = currentLeetCodeNumber || 
        (question ? parseLeetCodeProblem(question).number : null);
        
      const solutionData = {
        id: currentNumber,
        leetCodeTitle: question ? parseLeetCodeProblem(question).title : "Technical Question",
        prompt: question,
        code,
        codeLanguage: language,
        explanation: thoughtProcess,
        audioUrl
      };

      // If the user is still recording, stop first so we save a clean audio file
      try { stopRecording(); } catch (e) { /* swallow if recorder not initialized */ }

      // Wait for any ongoing transcription to finish before sending to API
      if (isTranscribingRef.current) {
        toast({ title: "Finishing transcription…", description: "Waiting for audio to finish processing." });
        await new Promise<void>((resolve) => {
          const checkInterval = setInterval(() => {
            if (!isTranscribingRef.current) { clearInterval(checkInterval); resolve(); }
          }, 200);
          // Safety timeout: don't wait forever
          setTimeout(() => { clearInterval(checkInterval); resolve(); }, 15000);
        });
      }

      // Save preferred coding language in the background
      fetch('/api/onboarding/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferredCodingLanguage: language }),
      }).catch(() => {});

      // Get analysis of current solution
      const response = await fetch('/api/technical-assessment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company,
          role,
          difficulty,
          question,
          code,
          explanation: thoughtProcess
        }),
      });

      const analysisData = await response.json();
      
      // Store result and redirect to results page
      localStorage.setItem("technicalAssessmentResult", JSON.stringify({
        ...analysisData,
        company,
        role,
        date: new Date().toISOString(),
        difficulty,
        questions: [{
          id: 1,
          leetCodeTitle: question ? parseLeetCodeProblem(question).title : "Technical Question",
          prompt: question,
          code,
          codeLanguage: language,
          codeScore: analysisData.codeScore || 0,
          explanation: thoughtProcess,
          explanationScore: analysisData.explanationScore || 0,
          audioUrl,
          feedback: `Code: ${analysisData.codeFeedback || "No feedback"} | Explanation: ${analysisData.explanationFeedback || "No feedback"}`
        }]
      }));

      toast({
        title: "Solution Submitted",
        description: "Redirecting to results...",
      });

      // Navigate to results page
      router.push('/technical-assessment/results');
      
    } catch (error) {
      console.error('Error saving solution:', error);
      toast({
        title: "Error",
        description: "Failed to save your solution. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modify handleSubmit to set initial question number
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    try {
      setIsLoading(true);
      setQuestion('');
      setQuestionSaved(false);
      setSolutions([]);
      setSolutionsGenerated(false);

      // Validate specific mode input
      if (problemMode === 'specific') {
        const num = parseInt(leetcodeNumber);
        if (isNaN(num) || num < 1 || num > 3549) {
          toast({
            title: "Invalid problem number",
            description: "Please enter a number between 1 and 3549.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }

      if (problemMode === 'preset' && !selectedQuestion) {
        toast({
          title: "No problem selected",
          description: "Please select a problem from the list.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const problemId = problemMode === 'specific'
        ? leetcodeNumber
        : problemMode === 'preset'
          ? String(selectedQuestion!.id)
          : undefined;

      const response = await fetch('/api/technical-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company,
          role,
          difficulty,
          useCustomNumber: problemMode !== 'ai',
          leetcodeNumber: problemId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setQuestion(data.question);
        setProblemTopics(data.topics || []);
        setProblemId(data.problemId || null);
        if (data.codeTemplates) setApiCodeTemplates(data.codeTemplates);
        toast({
          title: "Problem Loaded",
          description: problemId
            ? `Problem #${problemId} is ready.`
            : "Your problem is ready.",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to generate question. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error getting question:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle completing a question and moving to next
  // Handled by the async handleNext function above

  // Function to handle final submission
  const handleFinalSubmission = () => {
    const completedQuestions = questions.filter(q => q.completed).length;
    const skippedQuestions = questions.filter(q => q.skipped).length;
    
    const technicalAssessmentData = {
      company,
      role,
      date: new Date().toISOString(),
      difficulty,
      questions: questions.map((q, idx) => ({
        id: idx + 1,
        leetCodeTitle: q.question ? parseLeetCodeProblem(q.question).title : `Technical Question ${idx + 1}`,
        prompt: q.question,
        code: q.code || '',
        codeLanguage: language,
        explanation: q.thoughtProcess || '',
        audioUrl: q.audioUrl,
        status: q.completed ? 'completed' : 'skipped'
      }))
    };
    
    try {
      localStorage.removeItem("technicalAssessmentResult");
      localStorage.setItem("technicalAssessmentData", JSON.stringify(technicalAssessmentData));
      
      toast({
        title: "Assessment Completed",
        description: `Completed ${completedQuestions} questions, skipped ${skippedQuestions} questions.`,
      });
      
      if (onComplete) {
        onComplete();
      } else {
        router.push('/technical-assessment/results');
      }
    } catch (error) {
      console.error("Error saving assessment data:", error);
      toast({
        title: "Error submitting assessment",
        description: "There was an error saving your solutions. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Add function to handle saving current progress
  const saveCurrentProgress = () => {
    if (questions[currentQuestionIndex]) {
      const updatedQuestions = [...questions];
      updatedQuestions[currentQuestionIndex] = {
        ...updatedQuestions[currentQuestionIndex],
        code,
        thoughtProcess,
        audioUrl
      };
      setQuestions(updatedQuestions);
    }
  };

  // Add function to load saved progress
  const loadSavedProgress = () => {
    const currentQuestionData = questions[currentQuestionIndex];
    if (currentQuestionData) {
      setCode(currentQuestionData.code || languageTemplates[language]);
      setThoughtProcess(currentQuestionData.thoughtProcess || '');
      setAudioUrl(currentQuestionData.audioUrl);
    }
  };

  // Add function to handle navigation
  const navigateToQuestion = (direction: 'next' | 'skip') => {
    if (direction === 'next') {
      saveCurrentProgress();
    }
    
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < totalQuestions) {
      setCurrentQuestionIndex(nextIndex);
      setQuestion(questions[nextIndex].question);
      if (direction === 'skip') {
        // Reset fields for skipped question
        setCode(languageTemplates[language]);
        setThoughtProcess('');
        setAudioUrl(null);
      } else {
        loadSavedProgress();
      }
      
      // Reset solutions when changing questions
      setSolutions([]);
      setSolutionsGenerated(false);
      setSolutionsLoading(false);
      setActiveTab('problem');
      
      window.scrollTo(0, 0);
    } else {
      // All questions completed, prepare final submission
      const technicalAssessmentData = {
        company,
        role,
        date: new Date().toISOString(),
        difficulty,
        questions: questions.map((q, idx) => ({
          id: idx + 1,
          leetCodeTitle: q.question ? parseLeetCodeProblem(q.question).title : `Technical Question ${idx + 1}`,
          prompt: q.question,
          code: q.code,
          codeLanguage: language,
          explanation: q.thoughtProcess,
          audioUrl: q.audioUrl
        }))
      };
      
      try {
        // Ensure any active recording is stopped before finalizing the assessment
        try { stopRecording(); } catch (e) { /* ignore */ }
        localStorage.removeItem("technicalAssessmentResult");
        localStorage.setItem("technicalAssessmentData", JSON.stringify(technicalAssessmentData));
        
        toast({
          title: "Assessment completed",
          description: "Your solutions have been submitted for analysis."
        });
        
        if (onComplete) {
          onComplete();
        } else {
          router.push('/technical-assessment/results');
        }
      } catch (error) {
        console.error("Error saving assessment data:", error);
        toast({
          title: "Error submitting solutions",
          description: "There was an error saving your solutions. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  // Start or stop the recording process
  const startRecording = async () => {
    try {
      // First check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          title: "Browser Compatibility Error",
          description: "Your browser doesn't support microphone access. Please try using Chrome, Firefox, or Safari.",
          variant: "destructive"
        });
        return;
      }
      
      // Do a pre-check on microphone accessibility
      const micTest = await testMicrophone();
      if (!micTest.success) {
        toast({
          title: "Microphone Error",
          description: micTest.message || "Could not access your microphone. Please check permissions.",
          variant: "destructive"
        });
        
        // Show the permission guide for denied permissions
        if (micTest.message?.includes("denied") || micTest.message?.includes("settings")) {
          setShowPermissionGuide(true);
        }
        return;
      }
      
      // Request permission with improved error handling
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
        } 
      });
      
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      });
      
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      recorder.onstop = async () => {
        // Create a blob from audio chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Create a URL for the audio blob
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        
        // Start transcription
        await transcribeAudio(audioBlob);
      };
      
      recorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Explain your solution clearly into your microphone",
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      
      // Provide more detailed error messages based on the error type
      let errorMessage = "Could not access your microphone.";
      
      if (error instanceof DOMException) {
        switch (error.name) {
          case 'NotAllowedError':
          case 'PermissionDeniedError':
            errorMessage = "Microphone access was denied. Please allow microphone access in your browser settings and try again.";
            // Show the microphone permission guide dialog
            setShowPermissionGuide(true);
            break;
          case 'NotFoundError':
          case 'DevicesNotFoundError':
            errorMessage = "No microphone detected. Please connect a microphone and try again.";
            break;
          case 'NotReadableError':
          case 'TrackStartError':
            errorMessage = "Your microphone is in use by another application. Please close other applications that might be using your microphone.";
            break;
          case 'OverconstrainedError':
            errorMessage = "Could not find a microphone that meets the requirements. Please try with different settings.";
            break;
          case 'AbortError':
            errorMessage = "The microphone operation was aborted. Please try again.";
            break;
          case 'SecurityError':
            errorMessage = "The use of your microphone is blocked by your browser's security settings.";
            setShowPermissionGuide(true);
            break;
        }
      }
      
      toast({
        title: "Microphone Error",
        description: errorMessage + " Please check your browser settings.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all audio tracks from the stream
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  // Transcribe audio using Gemini
  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      setIsTranscribing(true);
      isTranscribingRef.current = true;
      toast({
        title: "Transcribing audio",
        description: "This may take a few moments...",
      });
      
      // Transcription now goes through server-side API route, no client-side key needed
      
      // Use OpenAI Whisper to transcribe and analyze audio
      const transcriptResult = await transcribeAndAnalyzeAudio(audioBlob);
      
      console.log("Transcription response:", transcriptResult);
      
      if (transcriptResult && transcriptResult.transcription) {
        // Set the transcribed text as the thought process
        setThoughtProcess(transcriptResult.transcription);
        
        // Get sentiment analysis if available
        let sentimentMessage = "";
        if (transcriptResult.sentiment) {
          const sentiment = transcriptResult.sentiment.tone;
          const confidence = transcriptResult.sentiment.confidence;
          sentimentMessage = `Your explanation has a ${sentiment.toLowerCase()} tone (${Math.round(confidence * 100)}% confidence).`;
        }
        
        // Show filler words if any
        let fillerWordsMessage = "";
        if (transcriptResult.filler_words && transcriptResult.filler_words.length > 0) {
          const fillerCount = transcriptResult.filler_words.reduce(
            (sum: number, item: {word: string, count: number}) => sum + item.count, 
            0
          );
          if (fillerCount > 0) {
            fillerWordsMessage = ` You used ${fillerCount} filler words.`;
          }
        }
        
        toast({
          title: "Transcription complete",
          description: sentimentMessage + fillerWordsMessage || "Your explanation has been transcribed.",
        });
      } else {
        toast({
          title: "Transcription issue",
          description: "Could not transcribe audio clearly. Please try again or type your explanation.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Transcription error:', error);
      let errorMessage = "There was an error transcribing your audio.";
      
      // Extract more specific error message if available
      if (error instanceof Error) {
        errorMessage += " Error: " + error.message;
      }
      
      toast({
        title: "Transcription failed",
        description: errorMessage + " Please try again or type your explanation.",
        variant: "destructive"
      });
    } finally {
      setIsTranscribing(false);
      isTranscribingRef.current = false;
    }
  };

  // Add Grind 75 problems mapping
  const GRIND75_PROBLEMS = {
    'Array': [
      { id: 238, title: 'Product of Array Except Self', difficulty: 'Medium' },
      { id: 169, title: 'Majority Element', difficulty: 'Easy' },
      { id: 75, title: 'Sort Colors', difficulty: 'Medium' },
      { id: 217, title: 'Contains Duplicate', difficulty: 'Easy' },
      { id: 53, title: 'Maximum Subarray', difficulty: 'Medium' },
      { id: 56, title: 'Merge Intervals', difficulty: 'Medium' },
      { id: 57, title: 'Insert Interval', difficulty: 'Medium' },
      { id: 15, title: '3Sum', difficulty: 'Medium' },
      { id: 54, title: 'Spiral Matrix', difficulty: 'Medium' },
      { id: 42, title: 'Trapping Rain Water', difficulty: 'Hard' },
      { id: 84, title: 'Largest Rectangle in Histogram', difficulty: 'Hard' }
    ],
    'Binary': [
      { id: 67, title: 'Add Binary', difficulty: 'Easy' }
    ],
    'Binary Search': [
      { id: 278, title: 'First Bad Version', difficulty: 'Easy' },
      { id: 33, title: 'Search in Rotated Sorted Array', difficulty: 'Medium' },
      { id: 230, title: 'Kth Smallest Element in a BST', difficulty: 'Medium' },
      { id: 981, title: 'Time Based Key-Value Store', difficulty: 'Medium' },
      { id: 310, title: 'Minimum Height Trees', difficulty: 'Medium' }
    ],
    'Binary Tree': [
      { id: 104, title: 'Maximum Depth of Binary Tree', difficulty: 'Easy' },
      { id: 543, title: 'Diameter of Binary Tree', difficulty: 'Easy' },
      { id: 102, title: 'Binary Tree Level Order Traversal', difficulty: 'Medium' },
      { id: 236, title: 'Lowest Common Ancestor of a Binary Tree', difficulty: 'Medium' },
      { id: 199, title: 'Binary Tree Right Side View', difficulty: 'Medium' },
      { id: 98, title: 'Validate Binary Search Tree', difficulty: 'Medium' },
      { id: 297, title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard' },
      { id: 230, title: 'Kth Smallest Element in a BST', difficulty: 'Medium' },
      { id: 105, title: 'Construct Binary Tree from Preorder and Inorder Traversal', difficulty: 'Medium' }
    ],
    'Dynamic Programming': [
      { id: 70, title: 'Climbing Stairs', difficulty: 'Easy' },
      { id: 322, title: 'Coin Change', difficulty: 'Medium' },
      { id: 416, title: 'Partition Equal Subset Sum', difficulty: 'Medium' },
      { id: 139, title: 'Word Break', difficulty: 'Medium' },
      { id: 1235, title: 'Maximum Profit in Job Scheduling', difficulty: 'Hard' }
    ],
    'Graph': [
      { id: 133, title: 'Clone Graph', difficulty: 'Medium' },
      { id: 207, title: 'Course Schedule', difficulty: 'Medium' },
      { id: 200, title: 'Number of Islands', difficulty: 'Medium' },
      { id: 994, title: 'Rotting Oranges', difficulty: 'Medium' },
      { id: 127, title: 'Word Ladder', difficulty: 'Hard' },
      { id: 721, title: 'Accounts Merge', difficulty: 'Medium' },
      { id: 310, title: 'Minimum Height Trees', difficulty: 'Medium' },
      { id: 621, title: 'Task Scheduler', difficulty: 'Medium' },
      { id: 150, title: 'Evaluate Reverse Polish Notation', difficulty: 'Medium' },
      { id: 79, title: 'Word Search', difficulty: 'Medium' }
    ],
    'Hash Table': [
      { id: 383, title: 'Ransom Note', difficulty: 'Easy' }
    ],
    'Heap': [
      { id: 973, title: 'K Closest Points to Origin', difficulty: 'Medium' },
      { id: 295, title: 'Find Median from Data Stream', difficulty: 'Hard' },
      { id: 621, title: 'Task Scheduler', difficulty: 'Medium' },
      { id: 23, title: 'Merge k Sorted Lists', difficulty: 'Hard' }
    ],
    'Linked List': [
      { id: 206, title: 'Reverse Linked List', difficulty: 'Easy' },
      { id: 23, title: 'Merge k Sorted Lists', difficulty: 'Hard' },
      { id: 876, title: 'Middle of the Linked List', difficulty: 'Easy' },
      { id: 146, title: 'LRU Cache', difficulty: 'Medium' },
      { id: 19, title: 'Remove Nth Node From End of List', difficulty: 'Medium' }
    ],
    'Matrix': [
      { id: 542, title: '01 Matrix', difficulty: 'Medium' }
    ],
    'Recursion': [
      { id: 39, title: 'Combination Sum', difficulty: 'Medium' },
      { id: 46, title: 'Permutations', difficulty: 'Medium' },
      { id: 105, title: 'Construct Binary Tree from Preorder and Inorder Traversal', difficulty: 'Medium' }
    ],
    'Stack': [
      { id: 20, title: 'Valid Parentheses', difficulty: 'Easy' },
      { id: 155, title: 'Min Stack', difficulty: 'Medium' },
      { id: 150, title: 'Evaluate Reverse Polish Notation', difficulty: 'Medium' },
      { id: 22, title: 'Generate Parentheses', difficulty: 'Medium' },
      { id: 224, title: 'Basic Calculator', difficulty: 'Hard' },
      { id: 84, title: 'Largest Rectangle in Histogram', difficulty: 'Hard' },
      { id: 19, title: 'Remove Nth Node From End of List', difficulty: 'Medium' }
    ],
    'String': [
      { id: 409, title: 'Longest Palindrome', difficulty: 'Easy' },
      { id: 3, title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium' },
      { id: 8, title: 'String to Integer (atoi)', difficulty: 'Medium' },
      { id: 5, title: 'Longest Palindromic Substring', difficulty: 'Medium' },
      { id: 17, title: 'Letter Combinations of a Phone Number', difficulty: 'Medium' },
      { id: 438, title: 'Find All Anagrams in a String', difficulty: 'Medium' },
      { id: 76, title: 'Minimum Window Substring', difficulty: 'Hard' },
      { id: 127, title: 'Word Ladder', difficulty: 'Hard' }
    ],
    'Trie': [
      { id: 208, title: 'Implement Trie (Prefix Tree)', difficulty: 'Medium' },
      { id: 79, title: 'Word Search', difficulty: 'Medium' }
    ]
  };

  // Add Blind 75 problems mapping
  const BLIND75_PROBLEMS = {
    'Arrays & Hashing': [
      { id: 242, title: 'Valid Anagram', difficulty: 'Easy' },
      { id: 1, title: 'Two Sum', difficulty: 'Easy' },
      { id: 49, title: 'Group Anagrams', difficulty: 'Medium' },
      { id: 347, title: 'Top K Frequent Elements', difficulty: 'Medium' },
      { id: 238, title: 'Product of Array Except Self', difficulty: 'Medium' },
      { id: 271, title: 'Encode and Decode Strings', difficulty: 'Medium' },
      { id: 217, title: 'Contains Duplicate', difficulty: 'Easy' },
      { id: 128, title: 'Longest Consecutive Sequence', difficulty: 'Medium' }
    ],
    'Two Pointers': [
      { id: 125, title: 'Valid Palindrome', difficulty: 'Easy' },
      { id: 15, title: '3Sum', difficulty: 'Medium' },
      { id: 11, title: 'Container With Most Water', difficulty: 'Medium' }
    ],
    'Sliding Window': [
      { id: 121, title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy' },
      { id: 3, title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium' },
      { id: 424, title: 'Longest Repeating Character Replacement', difficulty: 'Medium' },
      { id: 76, title: 'Minimum Window Substring', difficulty: 'Hard' }
    ],
    'Stack': [
      { id: 20, title: 'Valid Parentheses', difficulty: 'Easy' }
    ],
    'Binary Search': [
      { id: 153, title: 'Find Minimum in Rotated Sorted Array', difficulty: 'Medium' },
      { id: 33, title: 'Search in Rotated Sorted Array', difficulty: 'Medium' }
    ],
    'Linked List': [
      { id: 206, title: 'Reverse Linked List', difficulty: 'Easy' },
      { id: 21, title: 'Merge Two Sorted Lists', difficulty: 'Easy' },
      { id: 141, title: 'Linked List Cycle', difficulty: 'Easy' },
      { id: 143, title: 'Reorder List', difficulty: 'Medium' },
      { id: 19, title: 'Remove Nth Node From End of List', difficulty: 'Medium' },
      { id: 23, title: 'Merge K Sorted Lists', difficulty: 'Hard' }
    ],
    'Trees': [
      { id: 226, title: 'Invert Binary Tree', difficulty: 'Easy' },
      { id: 104, title: 'Maximum Depth of Binary Tree', difficulty: 'Easy' },
      { id: 100, title: 'Same Tree', difficulty: 'Easy' },
      { id: 572, title: 'Subtree of Another Tree', difficulty: 'Easy' },
      { id: 235, title: 'Lowest Common Ancestor of a Binary Search Tree', difficulty: 'Easy' },
      { id: 102, title: 'Binary Tree Level Order Traversal', difficulty: 'Medium' },
      { id: 98, title: 'Validate Binary Search Tree', difficulty: 'Medium' },
      { id: 230, title: 'Kth Smallest Element in a BST', difficulty: 'Medium' },
      { id: 105, title: 'Construct Binary Tree from Preorder and Inorder Traversal', difficulty: 'Medium' },
      { id: 124, title: 'Binary Tree Maximum Path Sum', difficulty: 'Hard' },
      { id: 297, title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard' }
    ],
    'Heap / Priority Queue': [
      { id: 295, title: 'Find Median From Data Stream', difficulty: 'Hard' }
    ],
    'Backtracking': [
      { id: 39, title: 'Combination Sum', difficulty: 'Medium' },
      { id: 79, title: 'Word Search', difficulty: 'Medium' }
    ],
    'Tries': [
      { id: 208, title: 'Implement Trie (Prefix Tree)', difficulty: 'Medium' },
      { id: 211, title: 'Design Add and Search Words Data Structure', difficulty: 'Medium' },
      { id: 212, title: 'Word Search II', difficulty: 'Hard' }
    ],
    'Graphs': [
      { id: 200, title: 'Number of Islands', difficulty: 'Medium' },
      { id: 133, title: 'Clone Graph', difficulty: 'Medium' },
      { id: 417, title: 'Pacific Atlantic Water Flow', difficulty: 'Medium' },
      { id: 207, title: 'Course Schedule', difficulty: 'Medium' },
      { id: 261, title: 'Graph Valid Tree', difficulty: 'Medium' },
      { id: 323, title: 'Number of Connected Components in an Undirected Graph', difficulty: 'Medium' }
    ],
    'Advanced Graphs': [
      { id: 269, title: 'Alien Dictionary', difficulty: 'Hard' }
    ],
    '1-D Dynamic Programming': [
      { id: 70, title: 'Climbing Stairs', difficulty: 'Easy' },
      { id: 198, title: 'House Robber', difficulty: 'Medium' },
      { id: 213, title: 'House Robber II', difficulty: 'Medium' },
      { id: 5, title: 'Longest Palindromic Substring', difficulty: 'Medium' },
      { id: 647, title: 'Palindromic Substrings', difficulty: 'Medium' },
      { id: 91, title: 'Decode Ways', difficulty: 'Medium' },
      { id: 322, title: 'Coin Change', difficulty: 'Medium' },
      { id: 152, title: 'Maximum Product Subarray', difficulty: 'Medium' },
      { id: 139, title: 'Word Break', difficulty: 'Medium' },
      { id: 300, title: 'Longest Increasing Subsequence', difficulty: 'Medium' }
    ],
    '2-D Dynamic Programming': [
      { id: 62, title: 'Unique Paths', difficulty: 'Medium' },
      { id: 1143, title: 'Longest Common Subsequence', difficulty: 'Medium' }
    ],
    'Greedy': [
      { id: 53, title: 'Maximum Subarray', difficulty: 'Medium' },
      { id: 55, title: 'Jump Game', difficulty: 'Medium' }
    ],
    'Intervals': [
      { id: 57, title: 'Insert Interval', difficulty: 'Medium' },
      { id: 56, title: 'Merge Intervals', difficulty: 'Medium' },
      { id: 435, title: 'Non Overlapping Intervals', difficulty: 'Medium' },
      { id: 252, title: 'Meeting Rooms', difficulty: 'Easy' },
      { id: 253, title: 'Meeting Rooms II', difficulty: 'Medium' }
    ],
    'Math & Geometry': [
      { id: 48, title: 'Rotate Image', difficulty: 'Medium' },
      { id: 54, title: 'Spiral Matrix', difficulty: 'Medium' },
      { id: 73, title: 'Set Matrix Zeroes', difficulty: 'Medium' }
    ],
    'Bit Manipulation': [
      { id: 191, title: 'Number of 1 Bits', difficulty: 'Easy' },
      { id: 338, title: 'Counting Bits', difficulty: 'Easy' },
      { id: 190, title: 'Reverse Bits', difficulty: 'Easy' },
      { id: 268, title: 'Missing Number', difficulty: 'Easy' },
      { id: 371, title: 'Sum of Two Integers', difficulty: 'Medium' }
    ]
  };

  // Add NeetCode 150 problems mapping
  const NEETCODE_150_PROBLEMS = {
    'Arrays & Hashing': [
      { id: 217, title: 'Contains Duplicate', difficulty: 'Easy' },
      { id: 242, title: 'Valid Anagram', difficulty: 'Easy' },
      { id: 1, title: 'Two Sum', difficulty: 'Easy' },
      { id: 49, title: 'Group Anagrams', difficulty: 'Medium' },
      { id: 347, title: 'Top K Frequent Elements', difficulty: 'Medium' },
      { id: 271, title: 'Encode and Decode Strings', difficulty: 'Medium' },
      { id: 238, title: 'Product of Array Except Self', difficulty: 'Medium' },
      { id: 36, title: 'Valid Sudoku', difficulty: 'Medium' },
      { id: 128, title: 'Longest Consecutive Sequence', difficulty: 'Medium' }
    ],
    'Two Pointers': [
      { id: 125, title: 'Valid Palindrome', difficulty: 'Easy' },
      { id: 167, title: 'Two Sum II - Input Array Is Sorted', difficulty: 'Medium' },
      { id: 15, title: '3Sum', difficulty: 'Medium' },
      { id: 11, title: 'Container With Most Water', difficulty: 'Medium' },
      { id: 42, title: 'Trapping Rain Water', difficulty: 'Hard' }
    ],
    'Sliding Window': [
      { id: 121, title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy' },
      { id: 3, title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium' },
      { id: 424, title: 'Longest Repeating Character Replacement', difficulty: 'Medium' },
      { id: 567, title: 'Permutation in String', difficulty: 'Medium' },
      { id: 76, title: 'Minimum Window Substring', difficulty: 'Hard' },
      { id: 239, title: 'Sliding Window Maximum', difficulty: 'Hard' }
    ],
    'Stack': [
      { id: 20, title: 'Valid Parentheses', difficulty: 'Easy' },
      { id: 155, title: 'Min Stack', difficulty: 'Medium' },
      { id: 150, title: 'Evaluate Reverse Polish Notation', difficulty: 'Medium' },
      { id: 22, title: 'Generate Parentheses', difficulty: 'Medium' },
      { id: 739, title: 'Daily Temperatures', difficulty: 'Medium' },
      { id: 853, title: 'Car Fleet', difficulty: 'Medium' },
      { id: 84, title: 'Largest Rectangle in Histogram', difficulty: 'Hard' }
    ],
    'Binary Search': [
      { id: 704, title: 'Binary Search', difficulty: 'Easy' },
      { id: 74, title: 'Search a 2D Matrix', difficulty: 'Medium' },
      { id: 875, title: 'Koko Eating Bananas', difficulty: 'Medium' },
      { id: 153, title: 'Find Minimum in Rotated Sorted Array', difficulty: 'Medium' },
      { id: 33, title: 'Search in Rotated Sorted Array', difficulty: 'Medium' },
      { id: 981, title: 'Time Based Key Value Store', difficulty: 'Medium' },
      { id: 4, title: 'Median of Two Sorted Arrays', difficulty: 'Hard' }
    ],
    'Linked List': [
      { id: 206, title: 'Reverse Linked List', difficulty: 'Easy' },
      { id: 21, title: 'Merge Two Sorted Lists', difficulty: 'Easy' },
      { id: 141, title: 'Linked List Cycle', difficulty: 'Easy' },
      { id: 143, title: 'Reorder List', difficulty: 'Medium' },
      { id: 19, title: 'Remove Nth Node From End of List', difficulty: 'Medium' },
      { id: 138, title: 'Copy List With Random Pointer', difficulty: 'Medium' },
      { id: 2, title: 'Add Two Numbers', difficulty: 'Medium' },
      { id: 287, title: 'Find the Duplicate Number', difficulty: 'Medium' },
      { id: 146, title: 'LRU Cache', difficulty: 'Medium' },
      { id: 23, title: 'Merge K Sorted Lists', difficulty: 'Hard' },
      { id: 25, title: 'Reverse Nodes in K Group', difficulty: 'Hard' }
    ],
    'Trees': [
      { id: 226, title: 'Invert Binary Tree', difficulty: 'Easy' },
      { id: 104, title: 'Maximum Depth of Binary Tree', difficulty: 'Easy' },
      { id: 543, title: 'Diameter of Binary Tree', difficulty: 'Easy' },
      { id: 110, title: 'Balanced Binary Tree', difficulty: 'Easy' },
      { id: 100, title: 'Same Tree', difficulty: 'Easy' },
      { id: 572, title: 'Subtree of Another Tree', difficulty: 'Easy' },
      { id: 235, title: 'Lowest Common Ancestor of a Binary Search Tree', difficulty: 'Easy' },
      { id: 102, title: 'Binary Tree Level Order Traversal', difficulty: 'Medium' },
      { id: 199, title: 'Binary Tree Right Side View', difficulty: 'Medium' },
      { id: 1448, title: 'Count Good Nodes in Binary Tree', difficulty: 'Medium' },
      { id: 98, title: 'Validate Binary Search Tree', difficulty: 'Medium' },
      { id: 230, title: 'Kth Smallest Element in a BST', difficulty: 'Medium' },
      { id: 105, title: 'Construct Binary Tree from Preorder and Inorder Traversal', difficulty: 'Medium' },
      { id: 124, title: 'Binary Tree Maximum Path Sum', difficulty: 'Hard' },
      { id: 297, title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard' }
    ],
    'Heap / Priority Queue': [
      { id: 703, title: 'Kth Largest Element in a Stream', difficulty: 'Easy' },
      { id: 1046, title: 'Last Stone Weight', difficulty: 'Easy' },
      { id: 973, title: 'K Closest Points to Origin', difficulty: 'Medium' },
      { id: 215, title: 'Kth Largest Element in an Array', difficulty: 'Medium' },
      { id: 621, title: 'Task Scheduler', difficulty: 'Medium' },
      { id: 355, title: 'Design Twitter', difficulty: 'Medium' },
      { id: 295, title: 'Find Median from Data Stream', difficulty: 'Hard' }
    ],
    'Backtracking': [
      { id: 78, title: 'Subsets', difficulty: 'Medium' },
      { id: 39, title: 'Combination Sum', difficulty: 'Medium' },
      { id: 40, title: 'Combination Sum II', difficulty: 'Medium' },
      { id: 46, title: 'Permutations', difficulty: 'Medium' },
      { id: 90, title: 'Subsets II', difficulty: 'Medium' },
      { id: 79, title: 'Word Search', difficulty: 'Medium' },
      { id: 131, title: 'Palindrome Partitioning', difficulty: 'Medium' },
      { id: 17, title: 'Letter Combinations of a Phone Number', difficulty: 'Medium' },
      { id: 51, title: 'N Queens', difficulty: 'Hard' }
    ],
    'Tries': [
      { id: 208, title: 'Implement Trie (Prefix Tree)', difficulty: 'Medium' },
      { id: 211, title: 'Design Add and Search Words Data Structure', difficulty: 'Medium' },
      { id: 212, title: 'Word Search II', difficulty: 'Hard' }
    ],
    'Graphs': [
      { id: 200, title: 'Number of Islands', difficulty: 'Medium' },
      { id: 133, title: 'Clone Graph', difficulty: 'Medium' },
      { id: 695, title: 'Max Area of Island', difficulty: 'Medium' },
      { id: 417, title: 'Pacific Atlantic Water Flow', difficulty: 'Medium' },
      { id: 130, title: 'Surrounded Regions', difficulty: 'Medium' },
      { id: 994, title: 'Rotting Oranges', difficulty: 'Medium' },
      { id: 286, title: 'Walls and Gates', difficulty: 'Medium' },
      { id: 207, title: 'Course Schedule', difficulty: 'Medium' },
      { id: 210, title: 'Course Schedule II', difficulty: 'Medium' },
      { id: 684, title: 'Redundant Connection', difficulty: 'Medium' },
      { id: 261, title: 'Graph Valid Tree', difficulty: 'Medium' },
      { id: 127, title: 'Word Ladder', difficulty: 'Hard' },
      { id: 332, title: 'Reconstruct Itinerary', difficulty: 'Hard' }
    ],
    'Advanced Graphs': [
      { id: 778, title: 'Swim in Rising Water', difficulty: 'Hard' },
      { id: 743, title: 'Network Delay Time', difficulty: 'Medium' },
      { id: 1584, title: 'Minimum Cost to Connect All Points', difficulty: 'Medium' },
      { id: 787, title: 'Cheapest Flights Within K Stops', difficulty: 'Medium' },
      { id: 269, title: 'Alien Dictionary', difficulty: 'Hard' },
      { id: 399, title: 'Evaluate Division', difficulty: 'Medium' }
    ],
    '1-D Dynamic Programming': [
      { id: 70, title: 'Climbing Stairs', difficulty: 'Easy' },
      { id: 198, title: 'House Robber', difficulty: 'Medium' },
      { id: 213, title: 'House Robber II', difficulty: 'Medium' },
      { id: 5, title: 'Longest Palindromic Substring', difficulty: 'Medium' },
      { id: 647, title: 'Palindromic Substrings', difficulty: 'Medium' },
      { id: 91, title: 'Decode Ways', difficulty: 'Medium' },
      { id: 55, title: 'Jump Game', difficulty: 'Medium' },
      { id: 322, title: 'Coin Change', difficulty: 'Medium' },
      { id: 152, title: 'Maximum Product Subarray', difficulty: 'Medium' },
      { id: 139, title: 'Word Break', difficulty: 'Medium' },
      { id: 300, title: 'Longest Increasing Subsequence', difficulty: 'Medium' },
      { id: 416, title: 'Partition Equal Subset Sum', difficulty: 'Medium' }
    ],
    '2-D Dynamic Programming': [
      { id: 62, title: 'Unique Paths', difficulty: 'Medium' },
      { id: 1143, title: 'Longest Common Subsequence', difficulty: 'Medium' },
      { id: 309, title: 'Best Time to Buy and Sell Stock with Cooldown', difficulty: 'Medium' },
      { id: 518, title: 'Coin Change II', difficulty: 'Medium' },
      { id: 494, title: 'Target Sum', difficulty: 'Medium' },
      { id: 97, title: 'Interleaving String', difficulty: 'Medium' },
      { id: 115, title: 'Distinct Subsequences', difficulty: 'Hard' },
      { id: 72, title: 'Edit Distance', difficulty: 'Hard' },
      { id: 312, title: 'Burst Balloons', difficulty: 'Hard' },
      { id: 10, title: 'Regular Expression Matching', difficulty: 'Hard' },
      { id: 44, title: 'Wildcard Matching', difficulty: 'Hard' }
    ],
    'Greedy': [
      { id: 53, title: 'Maximum Subarray', difficulty: 'Medium' },
      { id: 55, title: 'Jump Game', difficulty: 'Medium' },
      { id: 45, title: 'Jump Game II', difficulty: 'Medium' },
      { id: 134, title: 'Gas Station', difficulty: 'Medium' },
      { id: 846, title: 'Hand of Straights', difficulty: 'Medium' },
      { id: 1899, title: 'Merge Triplets to Form Target Triplet', difficulty: 'Medium' },
      { id: 763, title: 'Partition Labels', difficulty: 'Medium' },
      { id: 678, title: 'Valid Parenthesis String', difficulty: 'Medium' }
    ],
    'Intervals': [
      { id: 57, title: 'Insert Interval', difficulty: 'Medium' },
      { id: 56, title: 'Merge Intervals', difficulty: 'Medium' },
      { id: 435, title: 'Non-overlapping Intervals', difficulty: 'Medium' },
      { id: 252, title: 'Meeting Rooms', difficulty: 'Easy' },
      { id: 253, title: 'Meeting Rooms II', difficulty: 'Medium' },
      { id: 452, title: 'Minimum Number of Arrows to Burst Balloons', difficulty: 'Medium' }
    ],
    'Math & Geometry': [
      { id: 48, title: 'Rotate Image', difficulty: 'Medium' },
      { id: 54, title: 'Spiral Matrix', difficulty: 'Medium' },
      { id: 73, title: 'Set Matrix Zeroes', difficulty: 'Medium' },
      { id: 202, title: 'Happy Number', difficulty: 'Easy' },
      { id: 66, title: 'Plus One', difficulty: 'Easy' },
      { id: 50, title: 'Pow(x, n)', difficulty: 'Medium' },
      { id: 43, title: 'Multiply Strings', difficulty: 'Medium' },
      { id: 2013, title: 'Detect Squares', difficulty: 'Medium' }
    ],
    'Bit Manipulation': [
      { id: 136, title: 'Single Number', difficulty: 'Easy' },
      { id: 191, title: 'Number of 1 Bits', difficulty: 'Easy' },
      { id: 338, title: 'Counting Bits', difficulty: 'Easy' },
      { id: 190, title: 'Reverse Bits', difficulty: 'Easy' },
      { id: 268, title: 'Missing Number', difficulty: 'Easy' },
      { id: 371, title: 'Sum of Two Integers', difficulty: 'Medium' },
      { id: 7, title: 'Reverse Integer', difficulty: 'Medium' }
    ]
  };

  // Function to clean up problem text formatting
  const cleanProblemText = (text: string) => {
    // Split into sections
    const sections = text.split('\n').map(line => line.trim());
    
    // Find the core problem description
    let description = '';
    let foundStart = false;
    
    for (const line of sections) {
      // Skip metadata lines
      if (line.startsWith('#') || 
          line.startsWith('**Difficulty:') || 
          line.startsWith('Difficulty:') ||
          line.startsWith('Problem') ||
          line === '') {
        continue;
      }
      
      // Skip until we find the actual problem description
      if (!foundStart) {
        if (line.includes('Given') || line.includes('You are given')) {
          foundStart = true;
          description = line;
          continue;
        } else if (line.length > 0) {
          // Accept any non-empty line that's not metadata
          foundStart = true;
          description = line;
          continue;
        }
      }
      
      // Stop when we hit examples, constraints, or follow-up
      if (line.startsWith('Example') ||
          line.startsWith('Input:') ||
          line.startsWith('Output:') ||
          line.startsWith('Constraints:') ||
          line.startsWith('Follow-up:') ||
          line.startsWith('Note:')) {
        break;
      }
      
      // Add non-empty lines to our description
      if (line.length > 0) {
        description += ' ' + line;
      }
    }

    // Clean up any remaining markdown and normalize whitespace
    return description
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/`/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Add state for selected question at the top of the TechnicalAssessment component
  const [selectedQuestion, setSelectedQuestion] = useState<{ id: number; title: string; difficulty: string } | null>(null);

  // Add the questions data structure
  const LEETCODE_QUESTIONS = {
    'Array': [
      { id: 238, title: 'Product of Array Except Self', difficulty: 'Medium' },
      { id: 169, title: 'Majority Element', difficulty: 'Easy' },
      { id: 75, title: 'Sort Colors', difficulty: 'Medium' },
      { id: 217, title: 'Contains Duplicate', difficulty: 'Easy' },
      { id: 53, title: 'Maximum Subarray', difficulty: 'Medium' },
      { id: 56, title: 'Merge Intervals', difficulty: 'Medium' },
      { id: 57, title: 'Insert Interval', difficulty: 'Medium' },
      { id: 15, title: '3Sum', difficulty: 'Medium' },
      { id: 54, title: 'Spiral Matrix', difficulty: 'Medium' },
      { id: 42, title: 'Trapping Rain Water', difficulty: 'Hard' },
      { id: 84, title: 'Largest Rectangle in Histogram', difficulty: 'Hard' }
    ],
    'Binary': [
      { id: 67, title: 'Add Binary', difficulty: 'Easy' }
    ],
    'Binary Search': [
      { id: 278, title: 'First Bad Version', difficulty: 'Easy' },
      { id: 33, title: 'Search in Rotated Sorted Array', difficulty: 'Medium' },
      { id: 230, title: 'Kth Smallest Element in a BST', difficulty: 'Medium' },
      { id: 981, title: 'Time Based Key-Value Store', difficulty: 'Medium' },
      { id: 310, title: 'Minimum Height Trees', difficulty: 'Medium' }
    ],
    'Binary Tree': [
      { id: 226, title: 'Invert Binary Tree', difficulty: 'Easy' },
      { id: 104, title: 'Maximum Depth of Binary Tree', difficulty: 'Easy' },
      { id: 100, title: 'Same Tree', difficulty: 'Easy' },
      { id: 572, title: 'Subtree of Another Tree', difficulty: 'Easy' },
      { id: 235, title: 'Lowest Common Ancestor of a Binary Search Tree', difficulty: 'Easy' },
      { id: 102, title: 'Binary Tree Level Order Traversal', difficulty: 'Medium' },
      { id: 98, title: 'Validate Binary Search Tree', difficulty: 'Medium' },
      { id: 230, title: 'Kth Smallest Element in a BST', difficulty: 'Medium' },
      { id: 105, title: 'Construct Binary Tree from Preorder and Inorder Traversal', difficulty: 'Medium' }
    ],
    'Dynamic Programming': [
      { id: 70, title: 'Climbing Stairs', difficulty: 'Easy' },
      { id: 198, title: 'House Robber', difficulty: 'Medium' },
      { id: 213, title: 'House Robber II', difficulty: 'Medium' },
      { id: 5, title: 'Longest Palindromic Substring', difficulty: 'Medium' },
      { id: 647, title: 'Palindromic Substrings', difficulty: 'Medium' }
    ],
    'Graph': [
      { id: 200, title: 'Number of Islands', difficulty: 'Medium' },
      { id: 133, title: 'Clone Graph', difficulty: 'Medium' },
      { id: 417, title: 'Pacific Atlantic Water Flow', difficulty: 'Medium' },
      { id: 207, title: 'Course Schedule', difficulty: 'Medium' },
      { id: 261, title: 'Graph Valid Tree', difficulty: 'Medium' },
      { id: 323, title: 'Number of Connected Components in an Undirected Graph', difficulty: 'Medium' },
      { id: 127, title: 'Word Ladder', difficulty: 'Hard' },
      { id: 269, title: 'Alien Dictionary', difficulty: 'Hard' },
      { id: 332, title: 'Reconstruct Itinerary', difficulty: 'Hard' },
      { id: 787, title: 'Cheapest Flights Within K Stops', difficulty: 'Medium' }
    ],
    'Hash Table': [
      { id: 1, title: 'Two Sum', difficulty: 'Easy' }
    ],
    'Heap': [
      { id: 295, title: 'Find Median from Data Stream', difficulty: 'Hard' },
      { id: 355, title: 'Design Twitter', difficulty: 'Medium' },
      { id: 621, title: 'Task Scheduler', difficulty: 'Medium' },
      { id: 973, title: 'K Closest Points to Origin', difficulty: 'Medium' }
    ],
    'Linked List': [
      { id: 206, title: 'Reverse Linked List', difficulty: 'Easy' },
      { id: 21, title: 'Merge Two Sorted Lists', difficulty: 'Easy' },
      { id: 141, title: 'Linked List Cycle', difficulty: 'Easy' },
      { id: 143, title: 'Reorder List', difficulty: 'Medium' },
      { id: 19, title: 'Remove Nth Node From End of List', difficulty: 'Medium' }
    ],
    'Matrix': [
      { id: 73, title: 'Set Matrix Zeroes', difficulty: 'Medium' }
    ],
    'Recursion': [
      { id: 46, title: 'Permutations', difficulty: 'Medium' },
      { id: 78, title: 'Subsets', difficulty: 'Medium' },
      { id: 17, title: 'Letter Combinations of a Phone Number', difficulty: 'Medium' }
    ],
    'Stack': [
      { id: 20, title: 'Valid Parentheses', difficulty: 'Easy' },
      { id: 155, title: 'Min Stack', difficulty: 'Medium' },
      { id: 150, title: 'Evaluate Reverse Polish Notation', difficulty: 'Medium' },
      { id: 22, title: 'Generate Parentheses', difficulty: 'Medium' },
      { id: 739, title: 'Daily Temperatures', difficulty: 'Medium' },
      { id: 853, title: 'Car Fleet', difficulty: 'Medium' },
      { id: 84, title: 'Largest Rectangle in Histogram', difficulty: 'Hard' }
    ],
    'String': [
      { id: 3, title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium' },
      { id: 424, title: 'Longest Repeating Character Replacement', difficulty: 'Medium' },
      { id: 76, title: 'Minimum Window Substring', difficulty: 'Hard' },
      { id: 242, title: 'Valid Anagram', difficulty: 'Easy' },
      { id: 49, title: 'Group Anagrams', difficulty: 'Medium' },
      { id: 271, title: 'Encode and Decode Strings', difficulty: 'Medium' },
      { id: 128, title: 'Longest Consecutive Sequence', difficulty: 'Medium' },
      { id: 224, title: 'Basic Calculator', difficulty: 'Hard' }
    ],
    'Trie': [
      { id: 208, title: 'Implement Trie (Prefix Tree)', difficulty: 'Medium' },
      { id: 211, title: 'Design Add and Search Words Data Structure', difficulty: 'Medium' }
    ]
  };

  return (
    <div className="container mx-auto p-4 pt-8 space-y-6">
      {/* ── Setup Form ────────────────────────────────────────────── */}
      {!question && (
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '52px 24px 0' }}>
          {/* Title */}
          <h1 style={{
            fontFamily: "'Instrument Serif', serif",
            fontWeight: 400,
            fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
            color: '#dde2f0',
            marginBottom: 8,
            marginTop: 0,
          }}>
            Technical Challenge
          </h1>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.88rem',
            color: '#5a6380',
            marginBottom: 28,
            marginTop: 0,
          }}>
            AI-generated problems matched to your role.
          </p>

          {/* Mode Tabs */}
          <div style={{
            display: 'flex',
            gap: 4,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            padding: 4,
            marginBottom: 28,
          }}>
            {([
              { key: 'ai', label: 'AI Generated' },
              { key: 'specific', label: 'Specific Problem' },
              { key: 'preset', label: 'Popular Presets' },
            ] as const).map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setProblemMode(tab.key)}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: 7,
                  border: 'none',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  background: problemMode === tab.key ? 'rgba(59,130,246,0.18)' : 'transparent',
                  color: problemMode === tab.key ? '#93c5fd' : '#5a6380',
                  borderBottom: problemMode === tab.key ? '1px solid rgba(59,130,246,0.4)' : '1px solid transparent',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Company + Difficulty — only for AI mode */}
          {problemMode === 'ai' && (
            <>
              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: 'block',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase' as const,
                  color: '#8892b0',
                  marginBottom: 7,
                }}>
                  Company <span style={{ color: '#4a5370', fontWeight: 400, textTransform: 'none' as const, letterSpacing: 0 }}>(optional)</span>
                </label>
                {profile.targetCompany && !overridingCompany ? (
                  <PrefilledChip
                    label="Company"
                    value={profile.targetCompany}
                    onChangeRequest={() => setOverridingCompany(true)}
                  />
                ) : (
                  <input
                    type="text"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    placeholder="e.g., Google, Meta, Apple"
                    autoFocus={overridingCompany}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box' as const,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 10,
                      padding: '12px 14px',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.88rem',
                      color: '#dde2f0',
                      outline: 'none',
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = '#3b82f6';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)';
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                )}
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: 'block',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase' as const,
                  color: '#8892b0',
                  marginBottom: 7,
                }}>
                  Difficulty
                </label>
                <ToggleGroup
                  options={['Easy', 'Medium', 'Hard']}
                  value={difficulty}
                  onChange={setDifficulty}
                />
              </div>
            </>
          )}

          {/* ── Specific Problem Mode ── */}
          {problemMode === 'specific' && (
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.68rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase' as const,
                color: '#8892b0',
                marginBottom: 7,
              }}>
                LeetCode Problem Number
              </label>
              <input
                type="number"
                min={1}
                max={3549}
                value={leetcodeNumber}
                onChange={e => {
                  const v = e.target.value;
                  if (v === '') { setLeetcodeNumber(''); return; }
                  const n = parseInt(v);
                  if (!isNaN(n) && n >= 1 && n <= 3549) setLeetcodeNumber(v);
                }}
                placeholder="e.g., 1, 42, 146, 295…"
                style={{
                  width: '100%',
                  boxSizing: 'border-box' as const,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  padding: '12px 14px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.88rem',
                  color: '#dde2f0',
                  outline: 'none',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <span style={{ display: 'block', marginTop: 6, fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: '#4a5370' }}>
                Problems 1–3549
              </span>
            </div>
          )}

          {/* ── Presets Mode ── */}
          {problemMode === 'preset' && (
            <div style={{ marginBottom: 20 }}>
              {/* Preset picker */}
              {!selectedPreset ? (
                <>
                  <label style={{
                    display: 'block',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase' as const,
                    color: '#8892b0',
                    marginBottom: 12,
                  }}>
                    Choose a preset
                  </label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {(['neetcode75', 'neetcode150'] as const).map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => { setSelectedPreset(preset); setSelectedCategory(''); setSelectedQuestion(null); setSelectedCompany(null); setCompanyQuestions(null); }}
                        style={{
                          flex: 1,
                          padding: '18px 14px',
                          borderRadius: 10,
                          border: '1px solid rgba(255,255,255,0.1)',
                          background: 'rgba(255,255,255,0.04)',
                          cursor: 'pointer',
                          fontFamily: "'Inter', sans-serif",
                          transition: 'all 0.15s',
                          textAlign: 'center' as const,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'; e.currentTarget.style.background = 'rgba(59,130,246,0.07)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                      >
                        <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.25rem', color: '#dde2f0', marginBottom: 4 }}>
                          {preset === 'neetcode75' ? 'NeetCode 75' : 'NeetCode 150'}
                        </div>
                        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: '#5a6380' }}>
                          {preset === 'neetcode75' ? '75 curated problems' : '150 essential problems'}
                        </div>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => { setSelectedPreset('companies'); setSelectedCategory(''); setSelectedQuestion(null); setSelectedCompany(null); setCompanyQuestions(null); setCompanySearch(''); }}
                      style={{
                        flex: 1,
                        padding: '18px 14px',
                        borderRadius: 10,
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.04)',
                        cursor: 'pointer',
                        fontFamily: "'Inter', sans-serif",
                        transition: 'all 0.15s',
                        textAlign: 'center' as const,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'; e.currentTarget.style.background = 'rgba(59,130,246,0.07)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                    >
                      <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.25rem', color: '#dde2f0', marginBottom: 4 }}>🏢 Companies</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: '#5a6380' }}>80+ company question sets</div>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Back + preset label */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <button
                      type="button"
                      onClick={() => { setSelectedPreset(''); setSelectedCategory(''); setSelectedQuestion(null); setSelectedCompany(null); setCompanyQuestions(null); }}
                      style={{ background: 'none', border: 'none', color: '#5a6380', cursor: 'pointer', padding: '2px 0', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem' }}
                    >
                      ← Back
                    </button>
                    {selectedCompany && (
                      <button
                        type="button"
                        onClick={() => { setSelectedCompany(null); setCompanyQuestions(null); setSelectedQuestion(null); }}
                        style={{ background: 'none', border: 'none', color: '#5a6380', cursor: 'pointer', padding: '2px 4px', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem' }}
                      >
                        / {fmtCompany(selectedCompany)}
                      </button>
                    )}
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600 }}>
                      {selectedPreset === 'neetcode75' ? 'NeetCode 75' : selectedPreset === 'neetcode150' ? 'NeetCode 150' : selectedCompany ? fmtCompany(selectedCompany) : 'Companies'}
                    </span>
                  </div>

                  {/* ── Companies mode ── */}
                  {selectedPreset === 'companies' && !selectedCompany && (
                    <>
                      {/* Search */}
                      <input
                        type="text"
                        placeholder="Search companies…"
                        value={companySearch}
                        onChange={e => setCompanySearch(e.target.value)}
                        style={{
                          width: '100%', boxSizing: 'border-box' as const, marginBottom: 12,
                          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 8, padding: '7px 12px',
                          fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: '#c0caf5', outline: 'none',
                        }}
                      />
                      {/* Featured row */}
                      {!companySearch && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', color: '#4a5370', textTransform: 'uppercase' as const, marginBottom: 7 }}>Featured</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 7 }}>
                            {FEATURED_COMPANIES.map(c => (
                              <button key={c} type="button"
                                onClick={() => { setSelectedCompany(c); loadCompanyQuestions(c, companyTimeframe); setSelectedQuestion(null); }}
                                style={{ padding: '5px 12px', borderRadius: 20, border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.07)', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: '#93c5fd', cursor: 'pointer' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.15)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.07)'; }}
                              >{fmtCompany(c)}</button>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* All companies grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 6 }}>
                        {ALL_COMPANIES.filter(c => !companySearch || c.includes(companySearch.toLowerCase()) || fmtCompany(c).toLowerCase().includes(companySearch.toLowerCase())).map(c => (
                          <button key={c} type="button"
                            onClick={() => { setSelectedCompany(c); loadCompanyQuestions(c, companyTimeframe); setSelectedQuestion(null); }}
                            style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: '#8892b0', cursor: 'pointer', textAlign: 'left' as const, whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#c0caf5'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#8892b0'; }}
                          >{fmtCompany(c)}</button>
                        ))}
                      </div>
                    </>
                  )}

                  {/* ── Company questions ── */}
                  {selectedPreset === 'companies' && selectedCompany && (
                    <>
                      {/* Timeframe selector */}
                      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' as const }}>
                        {COMPANY_TIMEFRAMES.map(tf => (
                          <button key={tf.value} type="button"
                            onClick={() => { setCompanyTimeframe(tf.value); loadCompanyQuestions(selectedCompany, tf.value); setSelectedQuestion(null); }}
                            style={{
                              padding: '4px 12px', borderRadius: 20, fontSize: '0.72rem', fontFamily: "'Inter', sans-serif", cursor: 'pointer',
                              border: companyTimeframe === tf.value ? '1px solid rgba(59,130,246,0.6)' : '1px solid rgba(255,255,255,0.1)',
                              background: companyTimeframe === tf.value ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)',
                              color: companyTimeframe === tf.value ? '#93c5fd' : '#5a6380',
                            }}
                          >{tf.label}</button>
                        ))}
                      </div>

                      {/* Loading / error / list */}
                      {isLoadingCompany && (
                        <div style={{ color: '#5a6380', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ display: 'inline-block', width: 10, height: 10, border: '2px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                          Loading questions…
                        </div>
                      )}
                      {companyError && !isLoadingCompany && (
                        <div style={{ color: '#f87171', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem' }}>{companyError}</div>
                      )}
                      {companyQuestions && !isLoadingCompany && (
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 5 }}>
                          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.68rem', color: '#4a5370', marginBottom: 4 }}>
                            {companyQuestions.length} questions · sorted by frequency
                          </div>
                          {companyQuestions.map(prob => (
                            <button key={prob.id} type="button"
                              onClick={() => setSelectedQuestion({ id: prob.id, title: prob.title, difficulty: prob.difficulty })}
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 8, textAlign: 'left' as const, cursor: 'pointer',
                                border: `1px solid ${selectedQuestion?.id === prob.id ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.07)'}`,
                                background: selectedQuestion?.id === prob.id ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.02)',
                                fontFamily: "'Inter', sans-serif", fontSize: '0.8rem',
                                color: selectedQuestion?.id === prob.id ? '#93c5fd' : '#8892b0',
                              }}
                            >
                              <span>
                                <span style={{ color: '#4a5370', marginRight: 8, fontSize: '0.7rem' }}>#{prob.id}</span>
                                {prob.title}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 8 }}>
                                {prob.frequency && <span style={{ fontSize: '0.65rem', color: '#4a5370' }}>{parseFloat(prob.frequency).toFixed(0)}%</span>}
                                <span style={{ fontSize: '0.68rem', fontWeight: 600, color: prob.difficulty === 'Easy' ? '#34d399' : prob.difficulty === 'Medium' ? '#fbbf24' : '#f87171' }}>{prob.difficulty}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* ── NeetCode topic/problem grid (existing) ── */}
                  {selectedPreset !== 'companies' && (<>
                  <label style={{
                    display: 'block',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase' as const,
                    color: '#8892b0',
                    marginBottom: 10,
                  }}>
                    Topic
                  </label>

                  {/* Topic grid */}
                  {!selectedCategory ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                      {Object.keys(selectedPreset === 'neetcode75' ? BLIND75_PROBLEMS : NEETCODE_150_PROBLEMS).map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => { setSelectedCategory(cat); setSelectedQuestion(null); }}
                          style={{
                            padding: '7px 14px',
                            borderRadius: 20,
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.04)',
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '0.78rem',
                            color: '#8892b0',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'; e.currentTarget.style.color = '#93c5fd'; e.currentTarget.style.background = 'rgba(59,130,246,0.07)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#8892b0'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <>
                      {/* Back to topics */}
                      <button
                        type="button"
                        onClick={() => { setSelectedCategory(''); setSelectedQuestion(null); }}
                        style={{ background: 'none', border: 'none', color: '#5a6380', cursor: 'pointer', padding: '2px 0', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', marginBottom: 10 }}
                      >
                        ← {selectedCategory}
                      </button>

                      {/* Problem list */}
                      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
                        {((selectedPreset === 'neetcode75' ? BLIND75_PROBLEMS : NEETCODE_150_PROBLEMS) as Record<string, { id: number; title: string; difficulty: string }[]>)[selectedCategory]?.map((prob) => (
                          <button
                            key={prob.id}
                            type="button"
                            onClick={() => setSelectedQuestion(prob)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 14px',
                              borderRadius: 8,
                              border: `1px solid ${selectedQuestion?.id === prob.id ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.07)'}`,
                              background: selectedQuestion?.id === prob.id ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.02)',
                              fontFamily: "'Inter', sans-serif",
                              fontSize: '0.82rem',
                              color: selectedQuestion?.id === prob.id ? '#93c5fd' : '#8892b0',
                              cursor: 'pointer',
                              textAlign: 'left' as const,
                              transition: 'all 0.12s',
                            }}
                          >
                            <span>
                              <span style={{ color: '#4a5370', marginRight: 8, fontSize: '0.72rem' }}>#{prob.id}</span>
                              {prob.title}
                            </span>
                            <span style={{
                              fontSize: '0.68rem',
                              fontWeight: 600,
                              color: prob.difficulty === 'Easy' ? '#34d399' : prob.difficulty === 'Medium' ? '#fbbf24' : '#f87171',
                              flexShrink: 0,
                              marginLeft: 12,
                            }}>
                              {prob.difficulty}
                            </span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  </>)} {/* end selectedPreset !== 'companies' */}
                </>
              )}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={() => {
              const effectiveRole = role || profile.targetRole || 'Software Engineer';
              setProblemMode(problemMode);
              setRole(effectiveRole);
              setTimeout(() => {
                const submitBtn = document.getElementById('ta-hidden-submit');
                submitBtn?.click();
              }, 0);
            }}
            disabled={isLoading || (problemMode === 'preset' && !selectedQuestion) || (problemMode === 'specific' && !leetcodeNumber)}
            style={{
              width: '100%',
              marginTop: 32,
              padding: 14,
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.88rem',
              fontWeight: 500,
              cursor: (isLoading || (problemMode === 'preset' && !selectedQuestion) || (problemMode === 'specific' && !leetcodeNumber)) ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 20px rgba(37,99,235,0.3)',
              opacity: (isLoading || (problemMode === 'preset' && !selectedQuestion) || (problemMode === 'specific' && !leetcodeNumber)) ? 0.5 : 1,
              transition: 'opacity 0.2s, transform 0.15s',
            }}
            onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
            onMouseLeave={e => { e.currentTarget.style.opacity = isLoading ? '0.5' : '1'; e.currentTarget.style.transform = 'none'; }}
          >
            {isLoading ? 'Generating…' : 'Start Challenge'}
          </button>

          {/* Hidden button that triggers the real handleSubmit */}
          <button
            id="ta-hidden-submit"
            onClick={handleSubmit}
            style={{ display: 'none' }}
            aria-hidden
          />
        </div>
      )}

      {question && (() => {
        const lc = parseLeetCodeProblem(question);
        const diffColor = lc.difficulty === 'Easy' ? '#34d399' : lc.difficulty === 'Medium' ? '#fbbf24' : '#f87171';
        const diffBg   = lc.difficulty === 'Easy' ? 'rgba(52,211,153,0.1)' : lc.difficulty === 'Medium' ? 'rgba(251,191,36,0.1)' : 'rgba(248,113,113,0.1)';
        const lcUrl = `https://leetcode.com/problems/${lc.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}/solutions/`;
        const btnBase: React.CSSProperties = {
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '5px 12px', height: 30,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 6,
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.78rem', fontWeight: 500,
          color: '#8892b0', cursor: 'pointer',
          whiteSpace: 'nowrap' as const,
          transition: 'all 0.15s',
        };

        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: 'calc(100vh - 80px)',
              width: '100%',
              overflow: 'hidden',
              background: '#0a0e1a',
            }}
          >
            <OnboardingDialog activityType="technical" steps={TECH_ONBOARDING_STEPS} />
            {/* ── TOP BAR ── */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '0 16px', height: 46,
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              flexShrink: 0, background: '#0d1117',
            }}>
              {/* Back */}
              <button
                onClick={() => { setQuestion(''); setProblemTopics([]); setProblemId(null); }}
                style={{ ...btnBase, color: '#5a6380' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#dde2f0'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#5a6380'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              >
                ← Back
              </button>
              <span style={{ color: 'rgba(255,255,255,0.08)' }}>|</span>
              {/* Title + difficulty */}
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', fontWeight: 600, color: '#dde2f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 340 }}>
                {lc.number}. {lc.title}
              </span>
              <span style={{ padding: '2px 9px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600, color: diffColor, background: diffBg, flexShrink: 0 }}>
                {lc.difficulty}
              </span>
              {/* Topics */}
              {problemTopics.slice(0, 3).map(t => (
                <span key={t} style={{ padding: '2px 8px', borderRadius: 5, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', color: '#5a6380', whiteSpace: 'nowrap' as const }}>{t}</span>
              ))}
              {/* Duration timer */}
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#5a6380', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                <Clock size={13} /> {formatElapsed(elapsedSec)}
              </span>
              <div style={{ flex: 1 }} />
              {/* Run */}
              <button
                onClick={runCode}
                disabled={isRunning || !code || !problemId}
                style={{
                  ...btnBase,
                  color: isRunning ? '#5a6380' : '#34d399',
                  borderColor: isRunning ? 'rgba(255,255,255,0.08)' : 'rgba(52,211,153,0.35)',
                  background: isRunning ? 'rgba(255,255,255,0.03)' : 'rgba(52,211,153,0.07)',
                  cursor: (isRunning || !code || !problemId) ? 'not-allowed' : 'pointer',
                  opacity: (!code || !problemId) ? 0.4 : 1,
                }}
              >
                {isRunning ? (
                  <><span style={{ display: 'inline-block', width: 9, height: 9, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Running…</>
                ) : '▶ Run'}
              </button>
              {/* Record - Highlighted to be more visible */}
              <button
                data-onboarding="tech-record"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isTranscribing}
                style={{
                  ...btnBase,
                  color: isRecording ? '#f87171' : '#60a5fa',
                  borderColor: isRecording ? 'rgba(239,68,68,0.35)' : 'rgba(59,130,246,0.4)',
                  background: isRecording ? 'rgba(239,68,68,0.08)' : 'rgba(59,130,246,0.1)',
                  opacity: isTranscribing ? 0.55 : 1,
                  cursor: isTranscribing ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={e => { if (!isTranscribing && !isRecording) { e.currentTarget.style.color = '#93c5fd'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.6)'; e.currentTarget.style.background = 'rgba(59,130,246,0.15)'; } }}
                onMouseLeave={e => { if (!isTranscribing && !isRecording) { e.currentTarget.style.color = '#60a5fa'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)'; e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; } }}
              >
                {isTranscribing ? (
                  <>
                    <span style={{ display: 'inline-block', width: 9, height: 9, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Transcribing…
                  </>
                ) : isRecording ? (
                  <>
                    <span style={{ width: 7, height: 7, borderRadius: 2, background: '#f87171', display: 'inline-block', flexShrink: 0 }} />
                    Stop
                  </>
                ) : (
                  <>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#60a5fa', display: 'inline-block', flexShrink: 0, marginRight: 4 }} />
                    Record Explanation
                  </>
                )}
              </button>
              {audioUrl && !isTranscribing && (
                <span style={{ fontSize: '0.72rem', color: '#34d399', fontFamily: "'Inter', sans-serif" }}>✓ Recorded</span>
              )}
              {/* Save */}
              <button
                onClick={handleSaveTechnicalQuestion}
                disabled={questionSaved}
                style={{
                  ...btnBase,
                  color: questionSaved ? '#34d399' : '#8892b0',
                  borderColor: questionSaved ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.1)',
                  background: questionSaved ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.05)',
                  cursor: questionSaved ? 'default' : 'pointer',
                }}
              >
                {questionSaved ? '✓ Saved' : '⊕ Save'}
              </button>
              {/* Submit */}
              <button
                data-onboarding="tech-submit"
                onClick={handleNext}
                disabled={isSubmitting || !code}
                style={{
                  ...btnBase,
                  padding: '5px 16px',
                  background: (!code || isSubmitting) ? 'rgba(255,255,255,0.04)' : '#1d4ed8',
                  border: (!code || isSubmitting) ? '1px solid rgba(255,255,255,0.1)' : '1px solid #2563eb',
                  color: (!code || isSubmitting) ? '#4a5370' : '#fff',
                  cursor: (!code || isSubmitting) ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.6 : 1,
                  fontWeight: 600,
                }}
                onMouseEnter={e => { if (code && !isSubmitting) { e.currentTarget.style.background = '#1e40af'; } }}
                onMouseLeave={e => { if (code && !isSubmitting) { e.currentTarget.style.background = '#1d4ed8'; } }}
              >
                {isSubmitting ? 'Submitting…' : 'Submit'}
              </button>
            </div>

            {/* ── SPLIT BODY ── */}
            <div
              style={{ flex: 1, display: 'flex', minHeight: 0, userSelect: splitDragging.current ? 'none' : undefined }}
              onMouseMove={e => {
                if (!splitDragging.current) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = Math.min(70, Math.max(25, ((e.clientX - rect.left) / rect.width) * 100));
                setSplitPos(pct);
              }}
              onMouseUp={() => { splitDragging.current = false; }}
              onMouseLeave={() => { splitDragging.current = false; }}
            >
              {/* LEFT: Problem / Solutions */}
              <div style={{ width: `${splitPos}%`, minWidth: 0, display: 'flex', flexDirection: 'column', background: '#0d1117' }}>
                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0, padding: '0 16px' }}>
                  {[{ key: 'problem', label: 'Problem' }, { key: 'solutions', label: 'Solutions' }].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      style={{
                        padding: '10px 14px',
                        background: 'none', border: 'none',
                        borderBottom: activeTab === tab.key ? '2px solid #3b82f6' : '2px solid transparent',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '0.82rem',
                        fontWeight: activeTab === tab.key ? 600 : 400,
                        color: activeTab === tab.key ? '#93c5fd' : '#4a5370',
                        cursor: 'pointer', marginBottom: -1,
                        transition: 'color 0.15s',
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px 40px' }}>
                  {activeTab === 'problem' && (
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', lineHeight: 1.75, color: '#c9d1d9' }}>
                      <p style={{ marginTop: 0, marginBottom: 20 }}>{lc.description}</p>

                      {lc.examples.map((ex, i) => (
                        <div key={i} style={{ marginBottom: 20 }}>
                          <p style={{ fontWeight: 600, color: '#e6edf3', marginBottom: 8, fontSize: '0.85rem' }}>Example {i + 1}:</p>
                          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '12px 14px', fontFamily: "'Monaco', 'Menlo', monospace", fontSize: '0.82rem' }}>
                            <div><span style={{ color: '#6e7681' }}>Input: </span><span style={{ color: '#e6edf3' }}>{ex.input}</span></div>
                            <div><span style={{ color: '#6e7681' }}>Output: </span><span style={{ color: '#e6edf3' }}>{ex.output}</span></div>
                            {ex.explanation && <div style={{ marginTop: 6, color: '#6e7681', fontSize: '0.78rem' }}>Explanation: {ex.explanation}</div>}
                          </div>
                        </div>
                      ))}

                      <details style={{ marginBottom: 8 }}>
                        <summary style={{ cursor: 'pointer', padding: '9px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, fontSize: '0.82rem', color: '#6e7681', listStyle: 'none', display: 'flex', justifyContent: 'space-between', userSelect: 'none' }}>
                          Time &amp; Space Complexity <span>›</span>
                        </summary>
                        <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderTop: 'none', borderRadius: '0 0 6px 6px', fontSize: '0.82rem', color: '#6e7681' }}>
                          <div>Time: <code style={{ color: '#79c0ff' }}>{lc.timeComplexity}</code></div>
                          <div style={{ marginTop: 4 }}>Space: <code style={{ color: '#d2a8ff' }}>{lc.spaceComplexity}</code></div>
                        </div>
                      </details>

                      {lc.hints.map((hint, i) => (
                        <details key={i} style={{ marginBottom: 8 }}>
                          <summary style={{ cursor: 'pointer', padding: '9px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, fontSize: '0.82rem', color: '#6e7681', listStyle: 'none', display: 'flex', justifyContent: 'space-between', userSelect: 'none' }}>
                            Hint {i + 1} <span>›</span>
                          </summary>
                          <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderTop: 'none', borderRadius: '0 0 6px 6px', fontSize: '0.82rem', color: '#6e7681', lineHeight: 1.6 }}>
                            {hint}
                          </div>
                        </details>
                      ))}

                      {lc.followUp && (
                        <div style={{ marginTop: 14, padding: '10px 12px', background: 'rgba(56,139,253,0.07)', border: '1px solid rgba(56,139,253,0.2)', borderRadius: 6, fontSize: '0.82rem', color: '#79c0ff' }}>
                          <span style={{ fontWeight: 600 }}>Follow-up: </span>{lc.followUp}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'solutions' && (
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', color: '#6e7681' }}>
                      <p style={{ marginTop: 0, marginBottom: 14 }}>Community solutions for {lc.number}. {lc.title}</p>
                      <a
                        href={lcUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#79c0ff', textDecoration: 'none', fontSize: '0.85rem' }}
                        onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline'; }}
                        onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none'; }}
                      >
                        View on LeetCode ↗
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* DRAG HANDLE */}
              <div
                onMouseDown={() => { splitDragging.current = true; }}
                style={{ width: 4, flexShrink: 0, cursor: 'col-resize', background: 'rgba(255,255,255,0.05)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(56,139,253,0.4)'; }}
                onMouseLeave={e => { if (!splitDragging.current) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              />

              {/* RIGHT: Code editor */}
              <div data-onboarding="tech-editor" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: '#0a0e1a' }}>
                {/* Language bar */}
                <div data-onboarding="tech-lang" style={{ padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, background: '#0d1117' }}>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger style={{ width: 140, height: 28, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, color: '#8892b0', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {['javascript','python','java','cpp','typescript','go','rust','csharp'].map(l => (
                        <SelectItem key={l} value={l}>{l === 'cpp' ? 'C++' : l === 'csharp' ? 'C#' : l.charAt(0).toUpperCase() + l.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Editor fills all remaining space */}
                <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ flex: 1, minHeight: 0 }}>
                    <Editor
                      height="100%"
                      language={language}
                      value={code}
                      onChange={v => setCode(v || '')}
                      onMount={handleEditorDidMount}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        wordWrap: 'on',
                        fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                        padding: { top: 14, bottom: 14 },
                        bracketPairColorization: { enabled: true },
                        cursorBlinking: 'blink',
                      }}
                    />
                  </div>
                  {/* Bottom panel: test results + custom input */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: '#0d1117', flexShrink: 0, height: terminalHeight, overflowY: 'auto', position: 'relative' }}>
                    {/* Drag handle */}
                    <div
                      onMouseDown={e => { isDraggingTerminal.current = true; dragStartY.current = e.clientY; dragStartH.current = terminalHeight; e.preventDefault(); }}
                      style={{ position: 'sticky', top: 0, height: 5, cursor: 'ns-resize', background: 'rgba(255,255,255,0.04)', zIndex: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <div style={{ width: 28, height: 2, borderRadius: 2, background: 'rgba(255,255,255,0.15)' }} />
                    </div>
                    {/* Results when running or complete */}
                    {isRunning ? (
                      <div style={{ padding: '12px 16px', color: '#5a6380', fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ display: 'inline-block', width: 10, height: 10, border: '2px solid #34d399', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        Running test cases…
                      </div>
                    ) : testResults && (
                      <div style={{ padding: '10px 16px 6px' }}>
                        {/* Status header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <span style={{
                            fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', fontWeight: 700,
                            color: testResults.status === 'accepted' ? '#34d399' : testResults.status === 'wrong_answer' ? '#f87171' : '#fbbf24',
                          }}>
                            {testResults.status === 'accepted' ? '✓ Accepted' : testResults.status === 'wrong_answer' ? '✗ Wrong Answer' : testResults.status === 'compile_error' ? '⚠ Compile Error' : '⚠ Runtime Error'}
                          </span>
                          {testResults.total > 0 && (
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: '#5a6380' }}>
                              {testResults.passed}/{testResults.total} passed
                            </span>
                          )}
                        </div>
                        {/* Error / stderr */}
                        {(testResults.error || testResults.stderr) && (
                          <pre style={{ margin: '0 0 8px', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: '#f87171', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                            {testResults.error}{testResults.stderr ? '\n' + testResults.stderr : ''}
                          </pre>
                        )}
                        {/* Example test cases — always show output */}
                        {testResults.results.map((r, i) => (
                          <div key={i} style={{ marginBottom: 5, padding: '5px 10px', borderRadius: 6, background: r.passed ? 'rgba(52,211,153,0.05)' : 'rgba(248,113,113,0.06)', border: `1px solid ${r.passed ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.2)'}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const }}>
                              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: r.passed ? '#34d399' : '#f87171', flexShrink: 0 }}>
                                {r.passed ? '✓' : '✗'} Case {i + 1}
                              </span>
                              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.71rem', color: '#8892b0' }}>
                                Output: <span style={{ color: r.passed ? '#a3e4c8' : '#f87171' }}>{r.output}</span>
                              </span>
                              {!r.passed && r.expected && (
                                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.71rem', color: '#8892b0' }}>
                                  Expected: <span style={{ color: '#34d399' }}>{r.expected}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                        {/* Custom test results */}
                        {testResults.customResults && testResults.customResults.length > 0 && (
                          <div style={{ marginTop: 6 }}>
                            {testResults.customResults.map((r, i) => (
                              <div key={i} style={{ marginBottom: 5, padding: '5px 10px', borderRadius: 6, background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.2)' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#60a5fa', marginRight: 8 }}>Custom</span>
                                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.71rem', color: '#8892b0' }}>
                                  Output: <span style={{ color: '#93c5fd' }}>{r.output}</span>
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {/* Custom test case input — always visible */}
                    <div style={{ padding: '8px 16px 10px', borderTop: (isRunning || testResults) ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', fontWeight: 600, color: '#5a6380', letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>Custom Test</span>
                      </div>
                      <textarea
                        value={customInput}
                        onChange={e => setCustomInput(e.target.value)}
                        placeholder={`e.g. [2,7,11,15], 9`}
                        rows={1}
                        style={{
                          width: '100%', boxSizing: 'border-box' as const,
                          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 6, padding: '5px 10px',
                          fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: '#c0caf5',
                          resize: 'none', outline: 'none',
                        }}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); runCode(); } }}
                      />
                      <div style={{ fontSize: '0.65rem', color: '#3a4060', marginTop: 3, fontFamily: "'Inter', sans-serif" }}>Enter to run · values in parameter order</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <MicrophonePermissionGuide 
        isOpen={showPermissionGuide} 
        onClose={() => setShowPermissionGuide(false)} 
      />
    </div>
  );
}