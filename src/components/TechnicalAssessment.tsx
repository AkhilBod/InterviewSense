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
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();
  const { profile } = useProfileData();

  // Pre-fill company and role from profile on first load
  useEffect(() => {
    if (profile.targetCompany && !company) setCompany(profile.targetCompany);
    if (profile.targetRole && !role) setRole(profile.targetRole);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.targetCompany, profile.targetRole]);
  
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
    if (!code || Object.values(languageTemplates).includes(code)) {
      setCode(languageTemplates[language]);
    }
  }, [language, code, languageTemplates]);

  // Initialize with default template
  useEffect(() => {
    if (!code) {
      setCode(languageTemplates[language]);
    }
  }, [code, language, languageTemplates]);

  // Reset solutions when question changes
  useEffect(() => {
    if (question) {
      setSolutions([]);
      setSolutionsGenerated(false);
      setSolutionsLoading(false);
      setActiveTab('problem'); // Start with problem tab
    }
  }, [question]);

  // Auto-generate solutions when switching to solutions tab
  useEffect(() => {
    if (activeTab === 'solutions' && question && !solutionsGenerated && !solutionsLoading) {
      generateSolutions();
    }
  }, [activeTab, question, solutionsGenerated, solutionsLoading, generateSolutions]);

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  };

  const runCode = () => {
    toast({
      title: "Code Runner",
      description: "Code execution feature coming soon! For now, test your solution locally.",
    });
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
      setSolutions([]);
      setSolutionsGenerated(false);

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
    if (!code || !thoughtProcess) {
      toast({
        title: "Incomplete Solution",
        description: "Please provide both code and explanation before continuing.",
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
                        onClick={() => { setSelectedPreset(preset); setSelectedCategory(''); setSelectedQuestion(null); }}
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
                  </div>
                </>
              ) : (
                <>
                  {/* Back + preset label */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <button
                      type="button"
                      onClick={() => { setSelectedPreset(''); setSelectedCategory(''); setSelectedQuestion(null); }}
                      style={{ background: 'none', border: 'none', color: '#5a6380', cursor: 'pointer', padding: '2px 0', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem' }}
                    >
                      ← Back
                    </button>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600 }}>
                      {selectedPreset === 'neetcode75' ? 'NeetCode 75' : 'NeetCode 150'}
                    </span>
                  </div>

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
                    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
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
              background: 'linear-gradient(135deg, #1d4ed8, #4338ca)',
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

      {question && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-150px)]">
          {/* Problem/Solutions Panel - Left Side */}
          <Card className="bg-zinc-800 border-zinc-700 text-zinc-100 h-full overflow-hidden">
            <CardHeader className="pb-4 border-b border-zinc-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <CardTitle className="text-2xl font-bold text-white">
                    {(() => {
                      const leetcodeProblem = parseLeetCodeProblem(question);
                      return `${leetcodeProblem.number}. ${leetcodeProblem.title}`;
                    })()}
                  </CardTitle>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    (() => {
                      const leetcodeProblem = parseLeetCodeProblem(question);
                      return leetcodeProblem.difficulty === 'Easy' ? 'bg-blue-500/20 text-blue-500 border border-blue-500/40' :
                        leetcodeProblem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' :
                        'bg-red-500/20 text-red-400 border border-red-500/40';
                    })()
                  }`}>
                    {(() => {
                      const leetcodeProblem = parseLeetCodeProblem(question);
                      return leetcodeProblem.difficulty;
                    })()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <span>Topics:</span>
                  <span className="bg-zinc-700 px-2 py-1 rounded text-xs">Array</span>
                  <span className="bg-zinc-700 px-2 py-1 rounded text-xs">Hash Table</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="h-full overflow-hidden p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <TabsList className="w-full justify-start bg-zinc-800/50 border-b border-zinc-700 rounded-none h-12 p-1">
                  <TabsTrigger 
                    value="problem" 
                    className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-green-300 data-[state=active]:border-blue-500/50 flex items-center gap-2 h-10"
                  >
                    <BookOpen className="h-4 w-4" />
                    Problem
                  </TabsTrigger>
                  <TabsTrigger 
                    value="solutions" 
                    className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-green-300 data-[state=active]:border-blue-500/50 flex items-center gap-2 h-10"
                  >
                    <Lightbulb className="h-4 w-4" />
                    Solutions
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="problem" className="flex-1 overflow-y-auto p-6 space-y-6 mt-0">
                  {(() => {
                    const leetcodeProblem = parseLeetCodeProblem(question);
                    return (
                      <div className="space-y-6 pb-40">
                        {/* Problem Description */}
                        <div className="bg-slate-800 rounded-lg p-6 space-y-4">
                          <div className="text-lg font-semibold text-slate-100">
                            {question ? cleanProblemText(question) : "Loading problem..."}
                          </div>
                        </div>

                        {/* Examples */}
                        {leetcodeProblem.examples && leetcodeProblem.examples.length > 0 && (
                          <div className="space-y-4">
                            {leetcodeProblem.examples.map((example, index) => (
                              <div key={index} className="space-y-3">
                                <h4 className="text-base font-bold text-white">Example {index + 1}:</h4>
                                <div className="bg-zinc-900/80 rounded-lg p-4 border border-zinc-600/50 font-mono text-sm">
                                  <div className="space-y-2">
                                    <div>
                                      <span className="text-zinc-400 font-semibold">Input: </span>
                                      <span className="text-blue-300">{example.input}</span>
                                    </div>
                                    <div>
                                      <span className="text-zinc-400 font-semibold">Output: </span>
                                      <span className="text-blue-300">{example.output}</span>
                                    </div>
                                  </div>
                                </div>
                                {example.explanation && (
                                  <div className="bg-zinc-700/30 rounded-lg p-3 border border-zinc-600/30">
                                    <p className="text-zinc-300 text-sm">
                                      <span className="font-semibold text-zinc-200">Explanation: </span>
                                      {example.explanation}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Individual Dropdowns Section */}
                        <div className="space-y-4">
                          {/* Recommended Time & Space Complexity */}
                          <Collapsible className="bg-zinc-800/50 rounded-lg border border-zinc-700/50 transition-all duration-200 hover:border-zinc-600/50">
                            <CollapsibleTrigger className="w-full p-4 flex items-center justify-between text-left">
                              <span className="font-medium text-zinc-200">Recommended Time & Space Complexity</span>
                              <ChevronDown className="h-4 w-4 text-zinc-400" />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="p-4 pt-0">
                              <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700/50 space-y-3">
                                <div className="flex items-center gap-3">
                                  <Clock className="h-4 w-4 text-blue-400" />
                                  <div className="flex-1">
                                    <div className="text-sm text-zinc-400">Time Complexity</div>
                                    <code className="text-blue-400 text-sm">{leetcodeProblem.timeComplexity}</code>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Box className="h-4 w-4 text-purple-400" />
                                  <div className="flex-1">
                                    <div className="text-sm text-zinc-400">Space Complexity</div>
                                    <code className="text-purple-400 text-sm">{leetcodeProblem.spaceComplexity}</code>
                                  </div>
                                </div>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>

                          {/* Hint 1 */}
                          <Collapsible className="bg-zinc-800/50 rounded-lg border border-zinc-700/50 transition-all duration-200 hover:border-zinc-600/50">
                            <CollapsibleTrigger className="w-full p-4 flex items-center justify-between text-left">
                              <span className="font-medium text-zinc-200">Hint 1</span>
                              <ChevronDown className="h-4 w-4 text-zinc-400" />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="p-4 pt-0">
                              <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700/50">
                                <p className="text-zinc-300 text-sm leading-relaxed">
                                  {leetcodeProblem.hints[0] || "Consider the basic approach first - what data structures could help solve this problem?"}
                                </p>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>

                          {/* Hint 2 */}
                          <Collapsible className="bg-zinc-800/50 rounded-lg border border-zinc-700/50 transition-all duration-200 hover:border-zinc-600/50">
                            <CollapsibleTrigger className="w-full p-4 flex items-center justify-between text-left">
                              <span className="font-medium text-zinc-200">Hint 2</span>
                              <ChevronDown className="h-4 w-4 text-zinc-400" />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="p-4 pt-0">
                              <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700/50">
                                <p className="text-zinc-300 text-sm leading-relaxed">
                                  {leetcodeProblem.hints[1] || "Think about edge cases - what happens with empty inputs, single elements, or boundary conditions?"}
                                </p>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </div>

                        {/* Follow Up */}
                        {leetcodeProblem.followUp && (
                          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                            <h4 className="text-base font-bold text-blue-300 mb-2">Follow-up:</h4>
                            <p className="text-slate-300 text-sm">{leetcodeProblem.followUp}</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </TabsContent>
                
                <TabsContent value="solutions" className="flex-1 overflow-y-auto p-6 space-y-6 mt-0">
                  <div className="space-y-6 pb-40">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-blue-500" />
                        Solution Approaches
                      </h3>
                      <div className="text-sm text-zinc-400">
                        {solutionsLoading ? 'Generating solutions...' : `${solutions.length} approaches available`}
                      </div>
                    </div>
                    
                    {solutionsLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center space-y-4">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
                          <p className="text-zinc-400">Generating optimal solutions with AI...</p>
                        </div>
                      </div>
                    ) : !solutionsGenerated ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center space-y-4">
                          <Zap className="h-8 w-8 text-blue-500 mx-auto" />
                          <p className="text-zinc-400">Click "Generate Solutions" to see AI-powered approaches</p>
                          <Button 
                            onClick={generateSolutions}
                            className="bg-blue-600 hover:bg-green-700 text-white"
                          >
                            <Lightbulb className="h-4 w-4 mr-2" />
                            Generate Solutions
                          </Button>
                        </div>
                      </div>
                    ) : (
                      solutions.map((solution: any, index: number) => (
                      <Card key={solution.id} className="bg-zinc-800/50 border border-zinc-700/50 overflow-hidden mb-6">
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                solution.difficulty === 'Easy' ? 'bg-blue-500/20 text-blue-500' :
                                solution.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {index + 1}
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold text-white">{solution.title}</h4>
                                <div className="flex items-center gap-4 mt-1">
                                  <div className="flex items-center gap-2 text-sm">
                                    <Clock className="h-3 w-3 text-blue-400" />
                                    <span className="text-blue-400">Time: {solution.timeComplexity}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Box className="h-3 w-3 text-purple-400" />
                                    <span className="text-purple-400">Space: {solution.spaceComplexity}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              index === 0 ? 'bg-red-500/20 text-red-400' :
                              index === 1 ? 'bg-blue-500/20 text-blue-500' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {index === 0 ? 'Brute Force' : index === 1 ? 'Optimal' : 'Alternative'}
                            </span>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          <p className="text-zinc-300 text-sm leading-relaxed">
                            {solution.description}
                          </p>
                          
                          {/* Code Implementation */}
                          <Collapsible className="bg-zinc-900/50 rounded-lg border border-zinc-600/50">
                            <CollapsibleTrigger className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-900/70 transition-colors rounded-t-lg">
                              <span className="font-medium text-zinc-200 flex items-center gap-2">
                                <ExternalLink className="h-4 w-4" />
                                View Implementation
                              </span>
                              <ChevronDown className="h-4 w-4 text-zinc-400" />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="px-4 pb-4 rounded-b-lg">
                              <Tabs defaultValue="javascript" className="w-full">
                                <TabsList className="grid grid-cols-3 w-full bg-zinc-800">
                                  <TabsTrigger value="javascript" className="text-xs">JavaScript</TabsTrigger>
                                  <TabsTrigger value="python" className="text-xs">Python</TabsTrigger>
                                  <TabsTrigger value="java" className="text-xs">Java</TabsTrigger>
                                </TabsList>
                                {Object.entries(solution.code).map(([lang, code]: [string, any]) => (
                                  <TabsContent key={lang} value={lang} className="mt-4">
                                    <div className="bg-[#1e1e1e] rounded-lg overflow-hidden border border-zinc-700">
                                      <div className="p-2 bg-zinc-800 border-b border-zinc-700 flex items-center justify-between">
                                        <span className="text-xs text-zinc-400 capitalize">{lang}</span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            navigator.clipboard.writeText(code as string);
                                            toast({
                                              title: "Code copied",
                                              description: "Solution code copied to clipboard",
                                            });
                                          }}
                                          className="h-6 px-2 text-xs hover:bg-zinc-700"
                                        >
                                          Copy
                                        </Button>
                                      </div>
                                      <Editor
                                        height="200px"
                                        language={lang === 'javascript' ? 'javascript' : lang}
                                        value={code as string}
                                        theme="vs-dark"
                                        options={{
                                          readOnly: true,
                                          minimap: { enabled: false },
                                          fontSize: 12,
                                          lineNumbers: 'on',
                                          scrollBeyondLastLine: false,
                                          automaticLayout: true,
                                          tabSize: 2,
                                          wordWrap: 'on',
                                        }}
                                      />
                                    </div>
                                  </TabsContent>
                                ))}
                              </Tabs>
                            </CollapsibleContent>
                          </Collapsible>
                        </CardContent>
                      </Card>
                      ))
                    )}

                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Solution Panel - Right Side */}
          <Card className="bg-slate-800 border-slate-700 text-slate-100 h-full flex flex-col">
            <CardHeader className="pb-4 border-b border-slate-700 flex-shrink-0">
              <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Your Solution
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden p-6">
              {/* Code Editor Section */}
              <div className="space-y-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold text-slate-200 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Code Solution
                  </Label>
                  <div className="flex items-center gap-2">
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="w-[150px] h-8 border-slate-600 bg-slate-700 text-slate-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                        <SelectItem value="typescript">TypeScript</SelectItem>
                        <SelectItem value="go">Go</SelectItem>
                        <SelectItem value="rust">Rust</SelectItem>
                        <SelectItem value="csharp">C#</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={runCode}
                      className="h-8 px-3 border-slate-600 bg-slate-700 hover:bg-slate-600 text-slate-200"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Run
                    </Button>
                  </div>
                </div>
                <div className="border rounded-lg overflow-hidden bg-[#1e1e1e] border-slate-600 shadow-lg">
                  <Editor
                    height="280px"
                    language={language}
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    onMount={handleEditorDidMount}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      wordWrap: 'on',
                      suggest: {
                        showKeywords: true,
                        showSnippets: true,
                      },
                      quickSuggestions: {
                        other: true,
                        comments: true,
                        strings: true,
                      },
                      parameterHints: {
                        enabled: true,
                      },
                      bracketPairColorization: {
                        enabled: true,
                      },
                      cursorBlinking: 'blink',
                      cursorStyle: 'line',
                      fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                      padding: { top: 16, bottom: 16 },
                    }}
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="relative my-4 flex-shrink-0">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-slate-800 px-4 text-slate-400 font-medium">Solution Explanation</span>
                </div>
              </div>

              {/* Explanation Section - Flexible with constrained height */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                  <Label className="text-base font-semibold text-slate-200 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Explain Your Solution
                  </Label>
                  <div className="text-xs text-slate-400">
                    Describe your approach, time/space complexity, and reasoning
                  </div>
                </div>
                
                <div className="bg-slate-700/20 rounded-lg p-4 border border-slate-600/50 flex-1 flex flex-col">
                  <div className="flex gap-3 items-center mb-4 flex-shrink-0">
                    <Button
                      variant={isRecording ? "destructive" : "default"}
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={isTranscribing}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="h-4 w-4" />
                          <span className="hidden sm:inline">Stop Recording</span>
                          <span className="sm:hidden">Stop</span>
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4" />
                          <span className="hidden sm:inline">Record Explanation</span>
                          <span className="sm:hidden">Record</span>
                        </>
                      )}
                    </Button>
                    {isTranscribing && (
                      <div className="flex items-center text-sm text-slate-400">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span className="hidden sm:inline">Transcribing your explanation...</span>
                        <span className="sm:hidden">Transcribing...</span>
                      </div>
                    )}
                    {audioUrl && !isTranscribing && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-500">✓ <span className="hidden sm:inline">Recording saved</span><span className="sm:hidden">Saved</span></span>
                      </div>
                    )}
                  </div>
                  
                  <Textarea
                    value={thoughtProcess}
                    onChange={(e) => setThoughtProcess(e.target.value)}
                    className="flex-1 min-h-[120px] max-h-[200px] resize-none bg-slate-900 border-slate-600 focus:border-blue-500 transition-colors"
                    placeholder="Explain your solution approach here. Consider including:
• Your algorithm strategy and why you chose it
• Time and space complexity analysis
• How you handle edge cases
• Alternative approaches you considered"
                  />
                </div>
              </div>
              
              {/* Submit Section - Always visible at bottom */}
              <div className="pt-4 border-t border-slate-600/50 flex-shrink-0">
                <div className="flex gap-4">
                  {/* Skip button */}
                  <Button 
                    variant="outline"
                    onClick={handleSkip}
                    disabled={isSkipping || isSubmitting}
                    className="flex-1 h-12 text-base font-semibold border-slate-600 hover:bg-slate-700"
                  >
                    {isSkipping ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Skipping...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Skip Question
                      </>
                    )}
                  </Button>
                  
                  {/* Submit/Next button */}
                  <Button 
                    onClick={handleNext}
                    disabled={isSkipping || isSubmitting || !code || !thoughtProcess}
                    className="flex-1 flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 h-12 text-base font-semibold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Submit & Continue
                      </>
                    )}
                  </Button>
                </div>
                
                {(!code || !thoughtProcess) && (
                  <div className="mt-3 text-center">
                    <p className="text-sm text-slate-400">
                      {!code && !thoughtProcess ? "Please provide both your code solution and explanation" :
                       !code ? "Please provide your code solution" :
                       "Please provide an explanation of your solution"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <MicrophonePermissionGuide 
        isOpen={showPermissionGuide} 
        onClose={() => setShowPermissionGuide(false)} 
      />
    </div>
  );
}