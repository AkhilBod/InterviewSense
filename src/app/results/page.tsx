'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, ChevronLeft, Download, Share2, RefreshCw, BarChart, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/components/ui/avatar';
import ProtectedRoute from '@/components/ProtectedRoute'
import { generateInterviewSummary, InterviewSummary } from '@/lib/gemini';
import { toast } from "@/components/ui/use-toast";

export default function ResultsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [interviewSummary, setInterviewSummary] = useState<InterviewSummary>({
    jobRole: "Software Engineer",
    company: "Google",
    date: new Date().toLocaleDateString(),
    duration: "24 minutes",
    overallScore: 83,
    strengthAreas: ["Problem solving", "Technical knowledge", "Communication"],
    improvementAreas: ["Leadership examples", "Quantifying achievements", "Brevity"],
    completedQuestions: 5,
    questionScores: [
      { id: 1, question: "Tell me about yourself", score: 86 },
      { id: 2, question: "Describe a challenging project", score: 92 },
      { id: 3, question: "How do you handle conflicting priorities", score: 78 },
      { id: 4, question: "What are your greatest strengths", score: 88 },
      { id: 5, question: "Where do you see yourself in 5 years", score: 71 }
    ],
    fillerWordStats: {
      total: 27,
      mostCommon: "like"
    },
    keywordStats: {
      matched: 14,
      missed: 7,
      mostImpactful: ["algorithms", "distributed systems", "scalability"]
    }
  });
  
  useEffect(() => {
    const loadInterviewSummary = async () => {
      setIsLoading(true);
      try {
        // Check if we have answers stored
        const answersJson = localStorage.getItem('interviewAnswers');
        if (!answersJson) {
          toast({
            title: "No interview data found",
            description: "Using sample data instead",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        // Generate the summary using all answers and resume
        const summary = await generateInterviewSummary();
        setInterviewSummary(summary);
        
        // Check if resume was used
        const resumeText = localStorage.getItem('resume') || '';
        const hasResume = resumeText.trim() !== '';
        
        if (hasResume) {
          toast({
            title: "Resume-enhanced analysis",
            description: "Your interview analysis includes resume context",
            variant: "default",
          });
        }
      } catch (error) {
        console.error('Error loading interview summary:', error);
        toast({
          title: "Error generating summary",
          description: "Using sample data instead",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInterviewSummary();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 75) return "text-blue-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getBarColor = (score: number) => {
    if (score >= 90) return "bg-green-600";
    if (score >= 75) return "bg-blue-600";
    if (score >= 60) return "bg-yellow-600";
    return "bg-red-600";
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-zinc-400">Analyzing your interview performance...</p>
          <p className="mt-2 text-sm text-zinc-500">This may take a few moments...</p>
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
              <MessageSquare className="h-6 w-6 text-blue-500" />
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
                <Link href="/interview">
                  <ChevronLeft className="h-4 w-4" />
                  Back to Interview
                </Link>
              </Button>
            </div>

            <div className="max-w-5xl mx-auto">
              {/* Summary Card */}
              <Card className="mb-8 bg-slate-800 border-slate-700 text-slate-100">
                <CardHeader className="pb-4 border-b border-slate-700">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div>
                      <CardTitle className="text-2xl">Interview Performance Summary</CardTitle>
                      <CardDescription className="mt-1 text-slate-400">
                        {interviewSummary.jobRole} at {interviewSummary.company} • {interviewSummary.date}
                      </CardDescription>
                    </div>
                    <div className="mt-4 md:mt-0 flex flex-col items-center justify-center">
                      <div className="text-3xl font-bold mb-1 text-blue-500">{interviewSummary.overallScore}%</div>
                      <div className="text-sm text-slate-400">Overall Score</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="font-medium text-sm mb-2 text-slate-300">Strengths</h3>
                      <div className="flex flex-wrap gap-2">
                        {interviewSummary.strengthAreas.map(strength => (
                          <Badge key={strength} className="bg-green-700 text-green-100 hover:bg-green-600">
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-sm mb-2 text-slate-300">Areas for Improvement</h3>
                      <div className="flex flex-wrap gap-2">
                        {interviewSummary.improvementAreas.map(area => (
                          <Badge key={area} className="bg-yellow-700 text-yellow-100 hover:bg-yellow-600">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-sm mb-2 text-slate-300">Interview Stats</h3>
                      <div className="text-sm space-y-1 text-slate-300">
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span className="font-medium text-white">{interviewSummary.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Questions:</span>
                          <span className="font-medium text-white">{interviewSummary.completedQuestions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Filler Words:</span>
                          <span className="font-medium text-white">{interviewSummary.fillerWordStats.total} (mostly "{interviewSummary.fillerWordStats.mostCommon}")</span>
                        </div>
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

              {/* Questions & Keywords */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="md:col-span-2">
                  <Card className="bg-slate-800 border-slate-700 text-slate-100">
                    <CardHeader>
                      <CardTitle className="text-lg">Question Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-4">
                        {interviewSummary.questionScores.map((item) => (
                          <li key={item.id} className="pb-2">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-slate-300">{item.question}</span>
                              <span className={`text-sm font-bold ${getScoreColor(item.score)}`}>
                                {item.score}%
                              </span>
                            </div>
                            <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                              <div className={`h-full ${getBarColor(item.score)} rounded-full`} style={{ width: `${item.score}%` }} />
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card className="bg-slate-800 border-slate-700 text-slate-100">
                    <CardHeader>
                      <CardTitle className="text-lg">Keyword Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-slate-300">Keyword Match Rate</span>
                            <span className="text-sm font-bold text-blue-500">
                              {Math.round((interviewSummary.keywordStats.matched / (interviewSummary.keywordStats.matched + interviewSummary.keywordStats.missed)) * 100)}%
                            </span>
                          </div>
                          <Progress value={(interviewSummary.keywordStats.matched / (interviewSummary.keywordStats.matched + interviewSummary.keywordStats.missed)) * 100} className="h-2 bg-slate-700" />
                        </div>

                        <div>
                          <h3 className="text-sm font-medium mb-2 text-slate-300">High-Impact Keywords Used</h3>
                          <div className="flex flex-wrap gap-2">
                            {interviewSummary.keywordStats.mostImpactful.map((keyword) => (
                              <Badge key={keyword} className="bg-blue-700 text-blue-100 hover:bg-blue-600">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* AI Coach */}
              <Card className="mb-8 bg-slate-800 border-slate-700 text-slate-100">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src="/avatar.png" />
                      <AvatarFallback className="bg-blue-700 text-white">AI</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">AI Coach Feedback</CardTitle>
                      <CardDescription className="text-slate-400">
                        Personalized advice to improve your interview performance
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-slate-300">
                    <p>
                      Based on your mock interview for <strong>{interviewSummary.jobRole}</strong> at <strong>{interviewSummary.company}</strong>,
                      here are my observations and recommendations:
                    </p>

                    <h3 className="font-semibold text-white">Strengths:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Your technical knowledge came across clearly and you demonstrated good problem-solving skills.</li>
                      <li>You articulated your thoughts well and maintained good communication throughout.</li>
                      <li>Your answers to behavioral questions followed a logical structure.</li>
                    </ul>

                    <h3 className="font-semibold text-white">Areas for Improvement:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Include more examples of leadership and initiative in your responses.</li>
                      <li>Try to quantify your achievements with specific metrics and numbers.</li>
                      <li>Some answers were slightly verbose - practice being more concise while still being thorough.</li>
                      <li>Watch for filler words like "{interviewSummary.fillerWordStats.mostCommon}".</li>
                    </ul>

                    <h3 className="font-semibold text-white">Interview Strategy Suggestions:</h3>
                    <p>
                      For a <strong>{interviewSummary.jobRole}</strong> position, emphasize your experience with system design,
                      algorithms, and collaborative problem-solving. Prepare more specific examples that demonstrate how your
                      technical skills translated to business impact.
                    </p>
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
                      <Link href="/start">
                        <RefreshCw className="h-6 w-6 mb-2" />
                        <span className="text-base font-medium">Try Another Role</span>
                        <span className="text-xs text-slate-400 mt-1">Practice for a different position</span>
                      </Link>
                    </Button>

                    <Button variant="outline" className="h-auto py-6 flex flex-col border-slate-700 text-slate-300 hover:bg-slate-800" asChild>
                      <Link href="/interview">
                        <BarChart className="h-6 w-6 mb-2" />
                        <span className="text-base font-medium">Retry Interview</span>
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
