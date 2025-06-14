'use client';

import { useState, useEffect, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Download, Save, CheckCircle, TrendingUp, User, LogOut, MessageSquare, BarChart, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Question {
  id: number;
  question: string;
  type: string;
}

interface Answer {
  text: string;
  transcript?: string;
  audioUrl?: string;
}

function BehavioralResults() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{[key: number]: Answer}>({});
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    try {
      // Get questions from localStorage
      const questionsData = localStorage.getItem('behavioralQuestions');
      const storedQuestions = questionsData ? JSON.parse(questionsData) : [];
      setQuestions(storedQuestions);
      
      // Get answers from localStorage
      const answersData = localStorage.getItem('behavioralAnswers');
      const storedAnswers = answersData ? JSON.parse(answersData) : {};
      setAnswers(storedAnswers);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error retrieving results data:', error);
      setIsLoading(false);
    }
  }, []);

  const handleExportResults = () => {
    try {
      const results = questions.map(q => ({
        questionNumber: q.id,
        question: q.question,
        answer: answers[q.id]?.text || 'No answer provided'
      }));
      
      const resultsText = results.map(r => 
        `Question ${r.questionNumber}: ${r.question}\n\nAnswer: ${r.answer}\n\n-------------------\n\n`
      ).join('');
      
      const blob = new Blob([resultsText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'behavioral-interview-results.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting results:', error);
    }
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };
  
  const answeredQuestionsCount = Object.keys(answers).length;
  const completionRate = questions.length > 0 ? Math.round((answeredQuestionsCount / questions.length) * 100) : 0;
  
  // Calculate quality scores based on answer lengths and completeness
  const calculateQualityScore = (answer: string) => {
    if (!answer || answer.trim().length === 0) return 0;
    const wordCount = answer.trim().split(/\s+/).length;
    if (wordCount < 10) return 30;
    if (wordCount < 50) return 60;
    if (wordCount < 100) return 80;
    return 95;
  };

  const averageQualityScore = questions.length > 0 
    ? Math.round(questions.reduce((sum, q) => {
        const answer = answers[q.id]?.text || '';
        return sum + calculateQualityScore(answer);
      }, 0) / questions.length)
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-zinc-400">Loading your results...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="h-screen bg-zinc-900 text-white overflow-hidden">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-zinc-950/80 border-b border-zinc-800/50">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image src="https://i.ibb.co/hNsCy7F/logo.webp" alt="InterviewSense" width={32} height={32} className="object-contain" />
              <span className="font-semibold text-white">InterviewSense</span>
            </Link>
            <nav className="flex items-center gap-4">
              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session.user?.image || ''} alt={session.user?.name || 'User'} />
                        <AvatarFallback className="bg-blue-500">
                          {session.user?.name?.charAt(0) || <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-zinc-800 border-zinc-700" align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {session.user?.name && (
                          <p className="font-medium text-sm text-white">{session.user.name}</p>
                        )}
                        {session.user?.email && (
                          <p className="w-[200px] truncate text-sm text-zinc-400">
                            {session.user.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer text-white hover:text-white hover:bg-zinc-800">
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-400 focus:text-red-400 focus:bg-red-950/50 cursor-pointer"
                      onClick={() => signOut({ callbackUrl: '/' })}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-white">Log in</Button>
                </Link>
              )}
            </nav>
          </div>
        </header>

        <div className="pt-16 px-4 h-full overflow-y-auto">
          {/* Header with Back Button */}
          <div className="mb-8 px-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <Button variant="ghost" size="sm" onClick={handleBackToDashboard} className="gap-2 text-slate-300 hover:text-white hover:bg-slate-800">
                <ChevronLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              
              {/* Export Button */}
              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={handleExportResults} className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Results
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-9 gap-8 px-4 max-w-[1900px] mx-auto">
            {/* Left Column - Results Analysis (55% on desktop) */}
            <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">
              {/* Header */}
              <Card className="bg-slate-800 border-slate-700 text-slate-100">
                <CardHeader className="text-center py-8">
                  <CardTitle className="text-3xl">Behavioral Interview Report</CardTitle>
                  <CardDescription className="text-slate-400 text-lg">
                    Interview Performance Analysis • {new Date().toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Scores Section */}
              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-slate-100 shadow-xl">
                <CardContent className="p-4 sm:p-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-0">
                    {/* Overall Score with Circular Progress */}
                    <div className="flex flex-col items-center bg-slate-700/30 rounded-2xl p-6 sm:p-8 min-w-[160px] mx-auto md:mx-0">
                      <div className="relative w-24 sm:w-28 h-24 sm:h-28 mb-3">
                        <svg className="w-24 sm:w-28 h-24 sm:h-28 transform -rotate-90" viewBox="0 0 100 100">
                          {/* Background circle */}
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="transparent"
                            className="text-slate-600/40"
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
                            strokeDashoffset={`${2 * Math.PI * 42 * (1 - averageQualityScore / 100)}`}
                            className={getScoreColor(averageQualityScore).replace('text-', 'text-')}
                            strokeLinecap="round"
                            style={{
                              filter: 'drop-shadow(0 0 8px currentColor)',
                              transition: 'all 0.3s ease'
                            }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-2xl sm:text-3xl font-bold ${getScoreColor(averageQualityScore)}`}>
                            {averageQualityScore}
                          </span>
                          <span className="text-xs sm:text-sm text-slate-400 font-medium">/ 100</span>
                        </div>
                      </div>
                      <div className="text-sm sm:text-base font-semibold text-slate-300 tracking-wider">OVERALL</div>
                    </div>

                    {/* Individual Scores */}
                    <div className="flex-1 md:ml-10">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                        {/* Completion Score */}
                        <div className="text-center bg-slate-700/20 rounded-xl p-4 sm:p-6 border border-slate-600/30 hover:bg-slate-700/30 transition-all duration-300">
                          <div className="text-sm sm:text-base font-bold text-slate-300 mb-2 sm:mb-3 tracking-wider">COMPLETION</div>
                          <div className={`text-2xl sm:text-3xl font-bold ${getScoreColor(completionRate)} mb-1 sm:mb-2`}>
                            {completionRate}
                          </div>
                          <div className="text-xs sm:text-sm text-slate-400 font-medium">/ 100</div>
                          <div className="mt-3 sm:mt-4 w-full bg-slate-600/30 rounded-full h-2 sm:h-3">
                            <div 
                              className={`h-2 sm:h-3 rounded-full transition-all duration-500 ${getBarColor(completionRate)}`}
                              style={{ width: `${completionRate}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Quality Score */}
                        <div className="text-center bg-slate-700/20 rounded-xl p-4 sm:p-6 border border-slate-600/30 hover:bg-slate-700/30 transition-all duration-300">
                          <div className="text-sm sm:text-base font-bold text-slate-300 mb-2 sm:mb-3 tracking-wider">QUALITY</div>
                          <div className={`text-2xl sm:text-3xl font-bold ${getScoreColor(averageQualityScore)} mb-1 sm:mb-2`}>
                            {averageQualityScore}
                          </div>
                          <div className="text-xs sm:text-sm text-slate-400 font-medium">/ 100</div>
                          <div className="mt-3 sm:mt-4 w-full bg-slate-600/30 rounded-full h-2 sm:h-3">
                            <div 
                              className={`h-2 sm:h-3 rounded-full transition-all duration-500 ${getBarColor(averageQualityScore)}`}
                              style={{ width: `${averageQualityScore}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Interview Analytics */}
              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-slate-100 shadow-xl">
                <CardHeader className="p-8">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Interview Analytics</CardTitle>
                  <CardDescription className="text-slate-400 text-lg">
                    Comprehensive analysis of your interview performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  {/* Main Analytics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Overall Grade */}
                    <div className="bg-slate-700/40 rounded-2xl p-6 border border-slate-600/50 hover:border-slate-500/70 transition-all duration-300 hover:shadow-xl group">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div className="text-xs font-bold text-slate-400 tracking-widest">OVERALL GRADE</div>
                      </div>
                      <div className={`text-4xl font-black ${getScoreColor(averageQualityScore)} mb-2`}>
                        {averageQualityScore >= 90 ? 'A' : averageQualityScore >= 80 ? 'B' : averageQualityScore >= 70 ? 'C' : 'D'}
                      </div>
                      <div className="text-slate-400">
                        {averageQualityScore >= 80 ? 'Excellent' : averageQualityScore >= 70 ? 'Good' : averageQualityScore >= 60 ? 'Average' : 'Needs Work'}
                      </div>
                    </div>

                    {/* Questions Answered */}
                    <div className="bg-slate-700/40 rounded-2xl p-6 border border-slate-600/50 hover:border-slate-500/70 transition-all duration-300 hover:shadow-xl group">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div className="text-xs font-bold text-slate-400 tracking-widest">QUESTIONS</div>
                      </div>
                      <div className="text-4xl font-black text-blue-400 mb-2">
                        {answeredQuestionsCount}/{questions.length}
                      </div>
                      <div className="text-slate-400">Answered</div>
                    </div>

                    {/* Performance Level */}
                    <div className="bg-slate-700/40 rounded-2xl p-6 border border-slate-600/50 hover:border-slate-500/70 transition-all duration-300 hover:shadow-xl group">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <div className="text-xs font-bold text-slate-400 tracking-widest">PERFORMANCE</div>
                      </div>
                      <div className={`text-4xl font-black mb-2 ${getScoreColor(completionRate)}`}>
                        {completionRate >= 90 ? '★★★' : completionRate >= 70 ? '★★☆' : completionRate >= 50 ? '★☆☆' : '☆☆☆'}
                      </div>
                      <div className="text-slate-400">Rating</div>
                    </div>

                    {/* Interview Stats */}
                    <div className="bg-slate-700/40 rounded-2xl p-6 border border-slate-600/50 hover:border-slate-500/70 transition-all duration-300 hover:shadow-xl group">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="text-xs font-bold text-slate-400 tracking-widest">AVG LENGTH</div>
                      </div>
                      <div className="text-4xl font-black text-orange-400 mb-2">
                        {Math.round(
                          Object.values(answers).reduce((sum, answer) => {
                            const wordCount = answer?.text ? answer.text.trim().split(/\s+/).length : 0;
                            return sum + wordCount;
                          }, 0) / Math.max(answeredQuestionsCount, 1)
                        )}
                      </div>
                      <div className="text-slate-400">Words</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Question Details (45% on desktop) */}
            <div className="lg:col-span-4 space-y-6 order-1 lg:order-2">
              {/* Interview Questions */}
              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-slate-100 shadow-xl">
                <CardHeader className="p-6">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-6 w-6 text-blue-400" />
                    <CardTitle className="text-xl font-bold">Interview Questions & Responses</CardTitle>
                  </div>
                  <CardDescription className="text-slate-400">
                    Review your answers to each behavioral question
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {questions.map((question) => (
                    <div key={question.id} className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
                            {question.id}
                          </div>
                          <span className="font-semibold text-slate-200">Question {question.id}</span>
                        </div>
                        <Badge variant={answers[question.id] ? "default" : "outline"} className={answers[question.id] ? "bg-green-600 hover:bg-green-700" : ""}>
                          {answers[question.id] ? "Answered" : "Skipped"}
                        </Badge>
                      </div>
                      
                      <div className="mb-4">
                        <p className="font-medium text-slate-200 text-lg leading-relaxed">{question.question}</p>
                      </div>
                      
                      {answers[question.id] ? (
                        <div className="bg-slate-800/50 border border-slate-600/40 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span className="text-sm font-medium text-slate-300">Your Response</span>
                            <div className="flex items-center gap-2 ml-auto">
                              <div className="text-xs text-slate-400">
                                {answers[question.id]?.text ? answers[question.id].text.trim().split(/\s+/).length : 0} words
                              </div>
                              <div className={`w-2 h-2 rounded-full ${
                                calculateQualityScore(answers[question.id]?.text || '') >= 80 ? 'bg-green-500' :
                                calculateQualityScore(answers[question.id]?.text || '') >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}></div>
                            </div>
                          </div>
                          <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {answers[question.id]?.text || 'No answer provided'}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-800/30 border border-slate-600/30 rounded-lg p-4 text-slate-500 italic text-center py-8">
                          <MessageSquare className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                          No response provided for this question
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function BehavioralResultsWithSuspense() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-zinc-400">Loading...</p>
        </div>
      </div>
    }>
      <BehavioralResults />
    </Suspense>
  );
}
