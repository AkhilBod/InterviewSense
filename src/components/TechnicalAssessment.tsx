"use client"

import Link from "next/link";
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  const { data: session } = useSession();
  const router = useRouter();

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

  const startRecording = () => {
    setIsRecording(true);
    // TODO: Implement recording functionality
  };
  const stopRecording = () => {
    setIsRecording(false);
    // TODO: Implement stop recording functionality
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
              <Label>Thought Process</Label>
              <div className="flex gap-2">
                <Button
                  variant={isRecording ? "destructive" : "default"}
                  onClick={isRecording ? stopRecording : startRecording}
                >
                  {isRecording ? "Stop Recording" : "Start Recording"}
                </Button>
              </div>
              <Textarea
                value={thoughtProcess}
                onChange={(e) => setThoughtProcess(e.target.value)}
                className="h-[200px]"
                placeholder="Record your thought process here..."
              />
            </div>
            <Button onClick={onComplete}>Submit Solution</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 