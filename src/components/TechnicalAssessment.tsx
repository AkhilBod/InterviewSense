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
import { Loader2, User, Mic, MicOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

interface TechnicalAssessmentProps {
  onComplete?: () => void;
}

// Helper to parse ASCII tables into arrays
function parseAsciiTable(tableText: string) {
  const rows = tableText
    .split('\n')
    .filter((line) => line.trim().startsWith('|'));
  return rows.map((row) =>
    row
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim())
  );
}

// Helper to render ASCII tables as HTML tables
function RenderAsciiTables({ text }: { text: string }) {
  // Find all ASCII tables in the text
  const tableRegex = /((?:^\+[-+]+\+\n(?:\|.*\|\n)+)+)/gm;
  let lastIndex = 0;
  const elements: React.ReactNode[] = [];
  let match;
  let key = 0;
  while ((match = tableRegex.exec(text)) !== null) {
    // Add text before the table
    if (match.index > lastIndex) {
      elements.push(
        <div key={key++} className="mb-2 whitespace-pre-line">
          {text.slice(lastIndex, match.index)}
        </div>
      );
    }
    // Parse and render the table
    const tableArr = parseAsciiTable(match[0]);
    elements.push(
      <div key={key++} className="overflow-x-auto my-2">
        <table className="border border-zinc-400 text-sm bg-background">
          <tbody>
            {tableArr.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={`border border-zinc-400 px-2 py-1 ${i === 0 ? 'font-semibold bg-zinc-100 dark:bg-zinc-800' : ''}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    lastIndex = match.index + match[0].length;
  }
  // Add any remaining text after the last table
  if (lastIndex < text.length) {
    elements.push(
      <div key={key++} className="mb-2 whitespace-pre-line">
        {text.slice(lastIndex)}
      </div>
    );
  }
  return <>{elements}</>;
}

// Helper to parse Gemini output into sections
function parseLeetCodeFormat(raw: string) {
  // Split by lines and trim
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let title = '';
  let statement = '';
  let examples: { input: string; output: string; explanation?: string }[] = [];
  let constraints: string[] = [];
  let section: 'title' | 'statement' | 'examples' | 'constraints' = 'title';
  let currExample: any = {};
  let statementLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (section === 'title') {
      title = line;
      section = 'statement';
      continue;
    }
    if (/^example/i.test(line)) {
      section = 'examples';
      if (Object.keys(currExample).length) {
        examples.push(currExample);
        currExample = {};
      }
      continue;
    }
    if (/^constraints?/i.test(line)) {
      section = 'constraints';
      if (Object.keys(currExample).length) {
        examples.push(currExample);
        currExample = {};
      }
      continue;
    }
    if (section === 'statement') {
      statementLines.push(line);
    } else if (section === 'examples') {
      if (/^input:?/i.test(line)) {
        currExample.input = line.replace(/^input:?/i, '').trim();
      } else if (/^output:?/i.test(line)) {
        currExample.output = line.replace(/^output:?/i, '').trim();
      } else if (/^explanation:?/i.test(line)) {
        currExample.explanation = line.replace(/^explanation:?/i, '').trim();
      } else if (line) {
        // Sometimes explanation is not labeled
        if (currExample.output && !currExample.explanation) {
          currExample.explanation = line;
        }
      }
    } else if (section === 'constraints') {
      constraints.push(line.replace(/^[-*]/, '').trim());
    }
  }
  if (Object.keys(currExample).length) {
    examples.push(currExample);
  }
  statement = statementLines.join('\n');
  return { title, statement, examples, constraints };
}

export function TechnicalAssessment({ onComplete }: TechnicalAssessmentProps) {
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [question, setQuestion] = useState('');
  const [code, setCode] = useState('');
  const [thoughtProcess, setThoughtProcess] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/technical-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, role, difficulty }),
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      recorder.onstop = async () => {
        // Create a blob from audio chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
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
      toast({
        title: "Microphone Error",
        description: "Could not access your microphone. Please check permissions.",
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

  // Parse the question for display
  const parsed = question ? parseLeetCodeFormat(question) : null;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Technical Assessment</CardTitle>
          <CardDescription>
            Get a personalized LeetCode question based on your target company and role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g., Google"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g., Software Engineer"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Question Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Get Question
            </Button>
          </form>
        </CardContent>
      </Card>

      {parsed && (
        <Card>
          <CardHeader>
            <CardTitle>{parsed.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="mb-4">
              <RenderAsciiTables text={parsed.statement} />
              {parsed.examples.length > 0 && (
                <div className="mt-4">
                  <div className="font-semibold mb-1">Examples:</div>
                  {parsed.examples.map((ex, idx) => (
                    <div key={idx} className="mb-2 p-2 bg-muted rounded">
                      <div><span className="font-semibold">Input:</span> {ex.input}</div>
                      <div><span className="font-semibold">Output:</span> {ex.output}</div>
                      {ex.explanation && <div><span className="font-semibold">Explanation:</span> {ex.explanation}</div>}
                    </div>
                  ))}
                </div>
              )}
              {parsed.constraints.length > 0 && (
                <div className="mt-4">
                  <div className="font-semibold mb-1">Constraints:</div>
                  <ul className="list-disc ml-6">
                    {parsed.constraints.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Code Solution</Label>
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="font-mono h-[300px]"
                placeholder="Write your solution here..."
              />
            </div>
            <div className="space-y-2">
              <Label>Explain Your Solution</Label>
              <div className="flex gap-2 items-center">
                <Button
                  variant={isRecording ? "destructive" : "default"}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isTranscribing}
                  className="flex items-center"
                >
                  {isRecording ? (
                    <>
                      <MicOff className="mr-2 h-4 w-4" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2 h-4 w-4" />
                      Record Explanation
                    </>
                  )}
                </Button>
                {isTranscribing && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Transcribing your explanation...
                  </div>
                )}
                {audioUrl && !isTranscribing && (
                  <audio src={audioUrl} controls className="ml-2 h-8" />
                )}
              </div>
              <Textarea
                value={thoughtProcess}
                onChange={(e) => setThoughtProcess(e.target.value)}
                className="h-[200px]"
                placeholder="Record or type your explanation of the solution here..."
              />
            </div>
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
                    leetCodeTitle: parsed?.title || "Technical Question",
                    prompt: question,
                    code,
                    codeLanguage: code.includes("def ") ? "python" : "javascript", // Simple language detection
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
              className="flex items-center bg-blue-600 hover:bg-blue-700"
            >
              Submit Solution
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}