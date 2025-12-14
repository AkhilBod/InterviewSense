'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Download, Share2, RefreshCw, BarChart, Printer, User, TrendingUp, CheckCircle, Target, Brain } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import ProtectedRoute from '@/components/ProtectedRoute'
import { generateInterviewSummary, InterviewSummary } from '@/lib/gemini';
import { toast } from "@/components/ui/use-toast";
import { exportToPDF, printReport, shareReport, formatInterviewReportForSharing } from "@/lib/export";
import { useSession } from 'next-auth/react';
import { UserAccountDropdown } from '@/components/UserAccountDropdown';

function ResultsPage() {
  const { data: session } = useSession();
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
        
        // Clean up interview data after generating summary to ensure fresh start for next interview
        localStorage.removeItem('interviewAnswers');
        localStorage.removeItem('visibleQuestions');
        localStorage.removeItem('completedQuestionsCount');
        
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
      <div className="flex min-h-screen items-center justify-center bg-zinc-900">
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
      <div className="min-h-screen bg-zinc-900 text-white">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-zinc-950/80 border-b border-zinc-800/50">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image src="https://i.ibb.co/hNsCy7F/logo.webp" alt="InterviewSense" width={32} height={32} className="object-contain" />
              <span className="font-semibold text-white">InterviewSense</span>
            </Link>
            <UserAccountDropdown />
          </div>
        </header>

        <div className="pt-20 px-4 h-full overflow-y-auto">
          <div className="container mx-auto px-4 py-8">

            <div id="interview-results-content" className="max-w-5xl mx-auto">
              {/* Header Card */}
              <Card className="bg-zinc-800/50 border-zinc-700/50 text-white mb-6">
                <CardHeader className="text-center py-6">
                  <CardTitle className="text-2xl">Interview Performance Report</CardTitle>
                  <CardDescription className="text-zinc-400">
                    {interviewSummary.jobRole} at {interviewSummary.company} • {interviewSummary.date}
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Score Card with Modern Design */}
              <Card className="bg-gradient-to-br from-zinc-800/50 to-zinc-800/70 border-zinc-700/50 text-white shadow-xl mb-6">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    {/* Overall Score with Circular Progress */}
                    <div className="flex flex-col items-center bg-zinc-700/30 rounded-2xl p-8 min-w-[200px] mx-auto md:mx-0">
                      <div className="relative w-32 h-32 mb-4">
                        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                          {/* Background circle */}
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="transparent"
                            className="text-zinc-600/40"
                          />
                          {/* Progress circle */}
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="transparent"
                            strokeDasharray={`${2 * Math.PI * 42}`}
                            strokeDashoffset={`${2 * Math.PI * 42 * (1 - interviewSummary.overallScore / 100)}`}
                            className={interviewSummary.overallScore >= 80 ? 'text-green-400' : interviewSummary.overallScore >= 60 ? 'text-yellow-400' : 'text-red-400'}
                            strokeLinecap="round"
                            style={{
                              filter: 'drop-shadow(0 0 8px currentColor)',
                              transition: 'all 0.3s ease'
                            }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-3xl font-bold ${interviewSummary.overallScore >= 80 ? 'text-green-400' : interviewSummary.overallScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {interviewSummary.overallScore}
                          </span>
                          <span className="text-sm text-slate-400 font-medium">/ 100</span>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-1">Overall Score</h3>
                      <p className="text-sm text-slate-400 text-center">
                        {interviewSummary.overallScore >= 80 ? 'Excellent Performance' : 
                         interviewSummary.overallScore >= 60 ? 'Good Performance' : 'Needs Improvement'}
                      </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Interview Stats */}
                      <div className="bg-slate-700/20 rounded-xl p-4">
                        <h3 className="font-semibold text-slate-200 mb-3 flex items-center gap-2">
                          <BarChart className="h-5 w-5 text-blue-400" />
                          Interview Stats
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Duration:</span>
                            <span className="font-medium text-white">{interviewSummary.duration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Questions:</span>
                            <span className="font-medium text-white">{interviewSummary.completedQuestions}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Filler Words:</span>
                            <span className="font-medium text-white">{interviewSummary.fillerWordStats.total}</span>
                          </div>
                        </div>
                      </div>

                      {/* Performance Summary */}
                      <div className="bg-slate-700/20 rounded-xl p-4">
                        <h3 className="font-semibold text-slate-200 mb-3 flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-green-400" />
                          Performance
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Best Answer:</span>
                            <span className="font-medium text-green-400">
                              {Math.max(...interviewSummary.questionScores.map(q => q.score))}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Avg Score:</span>
                            <span className="font-medium text-white">
                              {Math.round(interviewSummary.questionScores.reduce((sum, q) => sum + q.score, 0) / interviewSummary.questionScores.length)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Areas Strong:</span>
                            <span className="font-medium text-white">{interviewSummary.strengthAreas.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-700/10 border-t border-slate-700/50 rounded-b-lg">
                  <div className="flex flex-wrap gap-2 w-full justify-center md:justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-700"
                      onClick={() => exportToPDF('interview-results-content', `Interview_${interviewSummary.jobRole.replace(/\s+/g, '_')}_${interviewSummary.company.replace(/\s+/g, '_')}`)}
                    >
                      <Download className="h-4 w-4" /> Download Report
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-700"
                      onClick={printReport}
                    >
                      <Printer className="h-4 w-4" /> Print
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-700"
                      onClick={() => shareReport(
                        `Interview Feedback for ${interviewSummary.jobRole} at ${interviewSummary.company}`,
                        formatInterviewReportForSharing(interviewSummary)
                      )}
                    >
                      <Share2 className="h-4 w-4" /> Share
                    </Button>
                  </div>
                </CardFooter>
              </Card>

              {/* Strengths and Improvement Areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Strengths */}
                <Card className="bg-slate-800 border-slate-700 text-slate-100">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      Key Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {interviewSummary.strengthAreas.map((strength, index) => (
                        <div key={strength} className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                          <span className="text-green-100 font-medium">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Improvement Areas */}
                <Card className="bg-slate-800 border-slate-700 text-slate-100">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5 text-yellow-400" />
                      Areas for Growth
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {interviewSummary.improvementAreas.map((area, index) => (
                        <div key={area} className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0"></div>
                          <span className="text-yellow-100 font-medium">{area}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Questions Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                  <Card className="bg-slate-800 border-slate-700 text-slate-100">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-blue-400" />
                        Question Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-4">
                        {interviewSummary.questionScores.map((item) => (
                          <li key={item.id} className="pb-2">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-slate-300 flex-1 pr-4">{item.question}</span>
                              <span className={`text-sm font-bold ${getScoreColor(item.score)} min-w-[50px] text-right`}>
                                {item.score}%
                              </span>
                            </div>
                            <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${getBarColor(item.score)} rounded-full transition-all duration-300`} 
                                style={{ width: `${item.score}%` }} 
                              />
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Keyword Analysis */}
                <div>
                  <Card className="bg-slate-800 border-slate-700 text-slate-100">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart className="h-5 w-5 text-purple-400" />
                        Keyword Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-slate-300">Keyword Match Rate</span>
                            <span className="text-sm font-bold text-blue-400">
                              {Math.round((interviewSummary.keywordStats.matched / (interviewSummary.keywordStats.matched + interviewSummary.keywordStats.missed)) * 100)}%
                            </span>
                          </div>
                          <Progress 
                            value={(interviewSummary.keywordStats.matched / (interviewSummary.keywordStats.matched + interviewSummary.keywordStats.missed)) * 100} 
                            className="h-3 bg-slate-700" 
                          />
                        </div>

                        <div>
                          <h3 className="text-sm font-medium mb-3 text-slate-300">High-Impact Keywords Used</h3>
                          <div className="flex flex-wrap gap-2">
                            {interviewSummary.keywordStats.mostImpactful.map((keyword) => (
                              <Badge key={keyword} className="bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30">
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

              {/* AI Coach Feedback */}
              <Card className="mb-6 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-slate-100 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">AI Coach Feedback</CardTitle>
                      <CardDescription className="text-slate-400">
                        Personalized insights to improve your interview performance
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
                <CardFooter className="bg-slate-700/10 border-t border-slate-700/50">
                  <Button variant="outline" size="sm" className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-700">
                    <RefreshCw className="h-4 w-4" />
                    Get More Feedback
                  </Button>
                </CardFooter>
              </Card>

              {/* Next Steps */}
              <Card className="bg-slate-800 border-slate-700 text-slate-100">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">What's Next?</CardTitle>
                  <CardDescription className="text-slate-400">Continue improving your interview skills</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex flex-col gap-2 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-blue-500 group transition-all duration-200" 
                      asChild
                    >
                      <Link href="/start">
                        <RefreshCw className="h-5 w-5 group-hover:text-blue-400 transition-colors" />
                        <span className="font-medium">Try Another Role</span>
                        <span className="text-xs text-slate-400">Practice for different position</span>
                      </Link>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex flex-col gap-2 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-green-500 group transition-all duration-200" 
                      asChild
                    >
                      <Link href="/dashboard">
                        <BarChart className="h-5 w-5 group-hover:text-green-400 transition-colors" />
                        <span className="font-medium">View Dashboard</span>
                        <span className="text-xs text-slate-400">Track your progress</span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function ResultsPageWithSuspense() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-zinc-400">Loading...</p>
        </div>
      </div>
    }>
      <ResultsPage />
    </Suspense>
  );
}
