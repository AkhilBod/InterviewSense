"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, BarChart, MessageSquare, ChevronLeft, Download, Printer, Share2, Brain } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { toast } from "@/components/ui/use-toast";

export interface TechnicalAssessmentResult {
  company: string;
  role: string;
  date: string;
  difficulty: string;
  questions: TechnicalQuestionResult[];
  overallScore: number;
  strengths: string[];
  improvementAreas: string[];
  codeFeedback: string;
  explanationFeedback: string;
}

export interface TechnicalQuestionResult {
  id: number;
  leetCodeTitle: string;
  prompt: string;
  code: string;
  codeLanguage: string;
  codeScore: number;
  explanation: string;
  explanationScore: number;
  audioUrl?: string | null;
  feedback?: string;
}

export default function TechnicalAssessmentResultsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<TechnicalAssessmentResult | null>(null);

  useEffect(() => {
    const loadResults = async () => {
      setIsLoading(true);
      try {
        const stored = localStorage.getItem("technicalAssessmentResult");
        if (stored) {
          setResult(JSON.parse(stored));
        } else {
          toast({ title: "No results found", description: "Using sample data.", variant: "destructive" });
          setResult({
            company: "Sample Corp",
            role: "Software Engineer",
            date: new Date().toLocaleDateString(),
            difficulty: "Medium",
            overallScore: 78,
            strengths: ["Efficient code", "Clear explanation"],
            improvementAreas: ["Edge case handling", "Code comments"],
            codeFeedback: "Your code is efficient but could use more comments.",
            explanationFeedback: "Good explanation, but mention edge cases.",
            questions: [
              {
                id: 1,
                leetCodeTitle: "Two Sum",
                prompt: "Given an array of integers...",
                code: "function twoSum(nums, target) {\n  const map = {};\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map[complement] !== undefined) {\n      return [map[complement], i];\n    }\n    map[nums[i]] = i;\n  }\n}",
                codeLanguage: "javascript",
                codeScore: 85,
                explanation: "I used a hash map to store...",
                explanationScore: 80,
                audioUrl: null,
                feedback: "Efficient, but add edge case discussion."
              }
            ]
          });
        }
      } catch (error) {
        toast({ title: "Error loading results", description: "Using sample data.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    loadResults();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 75) return "text-blue-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  if (isLoading || !result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-zinc-400">Analyzing your technical assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-slate-900 text-white">
        {/* Header */}
        <header className="border-b border-slate-800">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-blue-500" />
              <span className="font-bold text-xl">InterviewSense</span>
            </div>
            <Button variant="outline" size="sm" asChild className="text-slate-300 border-slate-700 hover:bg-slate-800">
              <Link href="/">Home</Link>
            </Button>
          </div>
        </header>

        <div className="flex-1 py-8 bg-slate-900">
          <div className="container mx-auto px-4">
            <div className="mb-6">
              <Button variant="ghost" size="sm" asChild className="gap-2 text-slate-300 hover:text-white hover:bg-slate-800">
                <Link href="/dashboard/technical">
                  <ChevronLeft className="h-4 w-4" />
                  Back to Technical Assessment
                </Link>
              </Button>
            </div>

            <div className="max-w-5xl mx-auto">
              {/* Summary Card */}
              <Card className="mb-8 bg-slate-800 border-slate-700 text-slate-100">
                <CardHeader className="pb-4 border-b border-slate-700">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div>
                      <CardTitle className="text-2xl">Technical Assessment Summary</CardTitle>
                      <CardDescription className="mt-1 text-slate-400">
                        {result.role} at {result.company} • {result.date} • {result.difficulty}
                      </CardDescription>
                    </div>
                    <div className="mt-4 md:mt-0 flex flex-col items-center justify-center">
                      <div className="text-3xl font-bold mb-1 text-blue-500">{result.overallScore}%</div>
                      <div className="text-sm text-slate-400">Overall Score</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-sm mb-2 text-slate-300">Strengths</h3>
                      <div className="flex flex-wrap gap-2">
                        {result.strengths.map((strength) => (
                          <Badge key={strength} className="bg-green-700 text-green-100 hover:bg-green-600">
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm mb-2 text-slate-300">Areas for Improvement</h3>
                      <div className="flex flex-wrap gap-2">
                        {result.improvementAreas.map((area) => (
                          <Badge key={area} className="bg-yellow-700 text-yellow-100 hover:bg-yellow-600">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="flex flex-wrap gap-2 w-full justify-center md:justify-end">
                    <Button variant="outline" size="sm" className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800">
                      <Download className="h-4 w-4" /> Download Report
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800">
                      <Printer className="h-4 w-4" /> Print
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800">
                      <Share2 className="h-4 w-4" /> Share
                    </Button>
                  </div>
                </CardFooter>
              </Card>

              {/* Questions, Code, Audio & Explanation */}
              <div className="space-y-8 mb-8">
                {Array.isArray(result?.questions) && result.questions.map((q) => (
                  <Card key={q.id} className="bg-slate-800 border-slate-700 text-slate-100">
                    <CardHeader>
                      <CardTitle className="text-lg">{q.leetCodeTitle}</CardTitle>
                      <CardDescription className="text-slate-400">{q.prompt}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-2">
                        <span className="text-xs text-slate-400">Your Code:</span>
                        <pre className="bg-slate-900 rounded p-3 mt-1 overflow-x-auto text-sm border border-slate-700">
                          <code>{q.code}</code>
                        </pre>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-slate-400">Code Score:</span>
                          <span className={`font-bold ${getScoreColor(q.codeScore)}`}>{q.codeScore}%</span>
                        </div>
                      </div>
                      <div className="mb-2">
                        <span className="text-xs text-slate-400">Your Explanation:</span>
                        <div className="bg-slate-900 rounded p-3 mt-1 text-sm border border-slate-700">
                          {q.explanation}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-slate-400">Explanation Score:</span>
                          <span className={`font-bold ${getScoreColor(q.explanationScore)}`}>{q.explanationScore}%</span>
                        </div>
                      </div>
                      {q.audioUrl && (
                        <div className="mb-2">
                          <span className="text-xs text-green-400">Audio Explanation:</span>
                          <audio controls src={q.audioUrl} className="w-full mt-1" />
                        </div>
                      )}
                      {q.feedback && (
                        <div className="mt-2 text-blue-300 text-sm italic">Feedback: {q.feedback}</div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* AI Coach */}
              <Card className="mb-8 bg-slate-800 border-slate-700 text-slate-100">
                <CardHeader>
                  <CardTitle className="text-lg">AI Coach Feedback</CardTitle>
                  <CardDescription className="text-slate-400">
                    Personalized advice to improve your technical interview performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-slate-300">
                    <h3 className="font-semibold text-white">Code Feedback:</h3>
                    <div className="bg-slate-900 rounded p-3 border border-slate-700 mb-2 text-sm">
                      {result.codeFeedback}
                    </div>
                    <h3 className="font-semibold text-white">Explanation Feedback:</h3>
                    <div className="bg-slate-900 rounded p-3 border border-slate-700 text-sm">
                      {result.explanationFeedback}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button variant="outline" size="sm" className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800">
                    <RefreshCw className="h-4 w-4" />
                    Get More Feedback
                  </Button>
                </CardFooter>
              </Card>

              {/* Next Steps */}
              <Card className="bg-slate-800 border-slate-700 text-slate-100">
                <CardHeader>
                  <CardTitle className="text-lg">What's Next?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-auto py-6 flex flex-col border-slate-700 text-slate-300 hover:bg-slate-800" asChild>
                      <Link href="/dashboard/technical">
                        <RefreshCw className="h-6 w-6 mb-2" />
                        <span className="text-base font-medium">Try Another Problem</span>
                        <span className="text-xs text-slate-400 mt-1">Practice a new LeetCode question</span>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto py-6 flex flex-col border-slate-700 text-slate-300 hover:bg-slate-800" asChild>
                      <Link href="/dashboard/technical">
                        <BarChart className="h-6 w-6 mb-2" />
                        <span className="text-base font-medium">Retry Assessment</span>
                        <span className="text-xs text-slate-400 mt-1">Apply feedback and improve</span>
                      </Link>
                    </Button>
                    <Button className="h-auto py-6 flex flex-col bg-blue-600 hover:bg-blue-700 text-white" asChild>
                      <Link href="/upgrade">
                        <MessageSquare className="h-6 w-6 mb-2" />
                        <span className="text-base font-medium">Get Expert Coaching</span>
                        <span className="text-xs mt-1">Connect with a human coach</span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <footer className="py-6 border-t border-slate-800 bg-slate-900 mt-auto">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center">
              <p className="text-sm text-slate-500">© {new Date().getFullYear()} InterviewSense. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
}
