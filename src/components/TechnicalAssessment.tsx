"use client"

import Link from "next/link";
import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, User, Mic, MicOff, Play, CheckCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { toast } from "@/components/ui/use-toast";
import { transcribeAndAnalyzeAudio } from '@/lib/gemini';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  { id: 'embedded-engineer', title: 'Embedded Systems Engineer', description: 'C/C++, Hardware, IoT, Firmware' }
];

// Helper function to parse LeetCode problem from text with better formatting
function parseLeetCodeProblem(problemText: string) {
  const lines = problemText.split('\n').filter(line => line.trim());
  
  let number = 0;
  let title = '';
  let difficulty = 'Medium';
  let description = '';
  let examples: { input: string; output: string; explanation?: string }[] = [];
  let constraints: string[] = [];
  
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
  
  return {
    number,
    title,
    difficulty: difficulty as 'Easy' | 'Medium' | 'Hard',
    description: description.trim(),
    examples,
    constraints,
    followUp: constraints.length > 0 ? "Can you solve it in O(1) extra space complexity?" : undefined
  };
}



export function TechnicalAssessment({ onComplete }: TechnicalAssessmentProps) {
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [question, setQuestion] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [thoughtProcess, setThoughtProcess] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();
  
  // Add state for LeetCode question number functionality
  const [leetcodeNumber, setLeetcodeNumber] = useState('');
  const [useCustomNumber, setUseCustomNumber] = useState(false);
  
  // Add state for microphone permission guide
  const [showPermissionGuide, setShowPermissionGuide] = useState(false);
  
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

  // Update code when language changes
  useEffect(() => {
    if (!code || Object.values(languageTemplates).includes(code)) {
      setCode(languageTemplates[language]);
    }
  }, [language]);

  // Initialize with default template
  useEffect(() => {
    if (!code) {
      setCode(languageTemplates[language]);
    }
  }, []);

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  };

  const runCode = () => {
    toast({
      title: "Code Runner",
      description: "Code execution feature coming soon! For now, test your solution locally.",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/technical-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          company, 
          role, 
          difficulty,
          useCustomNumber,
          leetcodeNumber: useCustomNumber ? leetcodeNumber : undefined
        }),
      });
      const data = await response.json();
      setQuestion(data.question);
    } catch (error) {
      console.error('Error fetching question:', error);
    } finally {
      setLoading(false);
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
      
      // Check if API key is available
      if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        console.error("NEXT_PUBLIC_GEMINI_API_KEY is not defined. Check your .env file.");
        toast({
          title: "Configuration Error",
          description: "API key for transcription is missing. Please contact support.",
          variant: "destructive"
        });
        setIsTranscribing(false);
        return;
      }
      
      // Use Gemini to transcribe and analyze audio
      const transcriptResult = await transcribeAndAnalyzeAudio(audioBlob);
      
      console.log("Transcription response from Gemini:", transcriptResult);
      
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

  // Parse the question for display - no longer needed since we use the structured display

  return (
    <div className="container mx-auto p-4 pt-8 space-y-6">
      <Card className="bg-gradient-to-br from-zinc-800 to-zinc-900 border-zinc-700 text-zinc-100 adow-xl">
        <CardContent className="space-y-6 pt-8">
          <div className="bg-gradient-to-r from-zinc-700/30 to-zinc-600/30 p-6 rounded-xl border border-zinc-600/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-12 rounded-full transition-colors duration-300 ${useCustomNumber ? 'bg-gradient-to-b from-blue-500 to-blue-600' : 'bg-gradient-to-b from-blue-500 to-blue-600'}`}></div>
                <div>
                  <Label htmlFor="useCustomNumber" className="font-semibold cursor-pointer block mb-2 text-lg">
                    {useCustomNumber ? 'Specific Problem Selection' : 'AI-Powered Problem Selection'}
                  </Label>
                  <p className="text-sm text-zinc-400 leading-relaxed max-w-md">
                    {useCustomNumber 
                      ? 'Get any specific problem from the 3000+ LeetCode database by number' 
                      : 'AI selects optimal problem from 3000+ questions based on company, role, and difficulty'}
                  </p>
                </div>
              </div>
              <Switch
                id="useCustomNumber"
                checked={useCustomNumber}
                onCheckedChange={setUseCustomNumber}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {useCustomNumber ? (
              <div className="space-y-3">
                <Label htmlFor="leetcodeNumber" className="text-base font-semibold text-zinc-200">LeetCode Question Number</Label>
                <Input
                  id="leetcodeNumber"
                  value={leetcodeNumber}
                  onChange={(e) => setLeetcodeNumber(e.target.value)}
                  placeholder="e.g., 1 (Two Sum), 121 (Palindrome Number)"
                  required
                  type="number"
                  min="1"
                  max="3000"
                  className="bg-zinc-700 border-zinc-600 focus:border-blue-500 text-zinc-100 placeholder:text-zinc-400"
                />
                <p className="text-sm text-zinc-400">Enter any problem number from LeetCode's database (1-3000). The system will retrieve the exact problem.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="company" className="text-base font-semibold text-zinc-200">Company</Label>
                  <Input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g., Google"
                    required={!useCustomNumber}
                    disabled={useCustomNumber}
                    className="bg-zinc-700 border-zinc-600 focus:border-blue-500 text-zinc-100 placeholder:text-zinc-400"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="role" className="text-base font-semibold text-zinc-200">Role</Label>
                  <Select 
                    value={role} 
                    onValueChange={setRole}
                    required={!useCustomNumber}
                    disabled={useCustomNumber}
                  >
                    <SelectTrigger className="bg-zinc-700 border-zinc-600 focus:border-blue-500 text-zinc-100 justify-start text-left [&>span]:justify-start [&>span]:text-left">
                      <SelectValue placeholder="Select your role" className="text-left" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-600 max-h-60">
                      {TECH_JOB_TITLES
                        .filter(job => job.title && job.title.trim() !== '')
                        .map(job => (
                          <SelectItem key={job.id} value={job.title} className="justify-start text-left data-[highlighted]:text-left">
                            <div className="flex flex-col items-start w-full text-left">
                              <div className="font-medium text-left w-full">{job.title}</div>
                              <div className="text-sm text-zinc-400 text-left w-full">{job.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="difficulty" className="text-base font-semibold text-zinc-200">Question Difficulty</Label>
                  <Select 
                    value={difficulty} 
                    onValueChange={setDifficulty} 
                    required={!useCustomNumber}
                    disabled={useCustomNumber}
                  >
                    <SelectTrigger className="bg-zinc-700 border-zinc-600 focus:border-blue-500 text-zinc-100">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-600">
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 shadow-lg transition-all duration-200"
            >
              {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {useCustomNumber ? 'Get Specific LeetCode Problem' : 'Get AI-Selected Problem'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {question && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          {/* Problem Panel - Left Side */}
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
                      return leetcodeProblem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400 border border-green-500/40' :
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
            <CardContent className="space-y-6 h-full overflow-y-auto pb-6">
              {(() => {
                const leetcodeProblem = parseLeetCodeProblem(question);
                return (
                  <div className="space-y-6">
                    {/* Problem Description */}
                    <div className="space-y-4">
                      <p className="text-zinc-300 leading-relaxed text-base">
                        {leetcodeProblem.description}
                      </p>
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

                    {/* Constraints */}
                    {leetcodeProblem.constraints && leetcodeProblem.constraints.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-base font-bold text-white">Constraints:</h4>
                        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600/30">
                          <ul className="space-y-2 text-slate-300">
                            {leetcodeProblem.constraints.map((constraint, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-slate-500 mt-1.5 text-xs">•</span>
                                <span className="font-mono text-sm">{constraint}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

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
                        <span className="text-xs text-green-400">✓ <span className="hidden sm:inline">Recording saved</span><span className="sm:hidden">Saved</span></span>
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
                <Button 
                  onClick={() => {
                    if (!code) {
                      toast({
                        title: "Missing code solution",
                        description: "Please provide your code solution before submitting.",
                        variant: "destructive"
                      });
                      return;
                    }
                    
                    if (!thoughtProcess) {
                      toast({
                        title: "Missing explanation",
                        description: "Please provide an explanation for your solution before submitting.",
                        variant: "destructive"
                      });
                      return;
                    }
                    
                    // Store necessary data in localStorage for results page
                    const technicalAssessmentData = {
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
                        explanation: thoughtProcess,
                        audioUrl: audioUrl
                      }]
                    };
                    
                    try {
                      // First clear any previous results to avoid confusion
                      localStorage.removeItem("technicalAssessmentResult");
                      
                      // Then save the new assessment data
                      localStorage.setItem("technicalAssessmentData", JSON.stringify(technicalAssessmentData));
                      
                      toast({
                        title: "Solution submitted",
                        description: "Your solution has been submitted for analysis."
                      });
                      
                      if (onComplete) {
                        onComplete();
                      } else {
                        router.push('/technical-assessment/results');
                      }
                    } catch (error) {
                      console.error("Error saving assessment data:", error);
                      toast({
                        title: "Error submitting solution",
                        description: "There was an error saving your solution. Please try again.",
                        variant: "destructive"
                      });
                    }
                  }}
                  disabled={!code || !thoughtProcess}
                  className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 w-full h-12 text-base font-semibold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {!code || !thoughtProcess ? (
                    <>
                      <span className="hidden sm:inline">Complete Code & Explanation to Submit</span>
                      <span className="sm:hidden">Complete & Submit</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      <span className="hidden sm:inline">Submit Solution for Analysis</span>
                      <span className="sm:hidden">Submit Solution</span>
                    </>
                  )}
                </Button>
                
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