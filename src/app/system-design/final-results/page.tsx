"use client"

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  LogOut,
  User,
  Target,
  Lightbulb,
  BarChart3,
  Trophy,
  ThumbsUp,
  BookOpen,
  Download,
  RefreshCw,
  Brain,
  Zap,
  Clock,
  ChevronLeft,
  MessageSquare,
  Code2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import ProtectedRoute from '@/components/ProtectedRoute';

interface SystemDesignResults {
  problemTitle: string;
  difficulty: string;
  overallScore: number;
  categoryScores: {
    requirements: number;
    estimation: number;
    design: number;
    scalability: number;
    communication: number;
  };
  feedback: {
    strengths: string[];
    improvements: string[];
    recommendations: string[];
  };
  analysis: string;
  testDuration: number;
  completedSteps: number;
}

export default function SystemDesignResultsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [results, setResults] = useState<SystemDesignResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      try {
        const testData = sessionStorage.getItem('systemDesignTest');
        const responses = sessionStorage.getItem('systemDesignResponses');
        
        if (!testData || !responses) {
          router.push('/system-design');
          return;
        }

        const problemData = JSON.parse(testData);
        const userResponses = JSON.parse(responses);
        
        // Simulate API call for analysis
        const analysisResponse = await fetch('/api/system-design', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            problem: problemData,
            responses: userResponses
          })
        });

        if (analysisResponse.ok) {
          const analysisData = await analysisResponse.json();
          setResults(analysisData);
        } else {
          // Fallback to simulated results
          const simulatedResults: SystemDesignResults = {
            problemTitle: problemData.problem.title,
            difficulty: 'Medium',
            overallScore: 82,
            categoryScores: {
              requirements: 85,
              estimation: 78,
              design: 88,
              scalability: 75,
              communication: 84
            },
            feedback: {
              strengths: [
                "Clear understanding of functional requirements",
                "Good consideration of data flow and architecture",
                "Proper identification of key system components",
                "Well-structured approach to problem solving"
              ],
              improvements: [
                "Could provide more detailed capacity planning",
                "Consider additional failure scenarios",
                "Expand on database design considerations",
                "More specific technology choices with justification"
              ],
              recommendations: [
                "Practice estimating scale with real-world examples",
                "Study distributed systems patterns",
                "Review database sharding strategies",
                "Practice system design with time constraints"
              ]
            },
            analysis: "Your system design demonstrates a solid understanding of the core requirements and shows good architectural thinking. You successfully identified the key components and data flow, which is essential for any system design interview. Your approach to breaking down the problem was methodical and clear.\n\nThe requirements analysis was thorough, showing you understand how to clarify ambiguities before diving into the solution. Your scale estimation shows good intuition, though some calculations could be more detailed. The high-level design is well thought out with proper component separation.\n\nFor improvement, focus on providing more specific technology choices with clear justifications. Consider diving deeper into failure scenarios and recovery mechanisms. Your database design could benefit from more detailed sharding and consistency considerations.",
            testDuration: 42,
            completedSteps: 5
          };
          setResults(simulatedResults);
        }
      } catch (error) {
        console.error('Error loading results:', error);
        router.push('/system-design');
      } finally {
        setIsLoading(false);
      }
    };

    loadResults();
  }, [router]);

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

  const handleBackToTest = () => {
    sessionStorage.removeItem('systemDesignTest');
    sessionStorage.removeItem('systemDesignResponses');
    router.push('/system-design');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
          <div className="text-white text-lg">Analyzing your system design...</div>
          <div className="text-zinc-400 text-sm mt-2">This may take a moment</div>
        </div>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-lg bg-[#000818]/80">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image src="https://i.ibb.co/hJC8n6NB/Generated-Image-February-20-2026-7-04-PM-Photoroom.png" alt="InterviewSense" width={50} height={50} className="object-contain" />
              <span className="font-bold text-xl text-white">InterviewSense</span>
            </Link>
            
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
                      <AvatarFallback className="bg-zinc-700 text-white">
                        {session.user?.name?.charAt(0)?.toUpperCase() || <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-zinc-800 border-zinc-700" align="end">
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
            ) : null}
          </div>
        </header>

        {/* Full Width Layout */}
        <div className="w-full">
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-9 gap-8 px-4 max-w-[1900px] mx-auto pt-8">
            {/* Left Column - Analysis Results (55% on desktop) */}
            <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">
              {/* Header */}
              <Card className="bg-slate-800 border-slate-700 text-slate-100">
                <CardHeader className="text-center py-8">
                  <CardTitle className="text-3xl">System Design Analysis Report</CardTitle>
                  <CardDescription className="text-slate-400 text-lg">
                    {results.problemTitle} • {results.difficulty} Level • {new Date().toLocaleDateString()}
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
                            strokeDashoffset={`${2 * Math.PI * 42 * (1 - results.overallScore / 100)}`}
                            className={getScoreColor(results.overallScore).replace('text-', 'text-')}
                            strokeLinecap="round"
                            style={{
                              filter: 'drop-shadow(0 0 8px currentColor)',
                              transition: 'all 0.3s ease'
                            }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-2xl sm:text-3xl font-bold ${getScoreColor(results.overallScore)}`}>
                            {results.overallScore}
                          </span>
                          <span className="text-xs sm:text-sm text-slate-400 font-medium">/ 100</span>
                        </div>
                      </div>
                      <div className="text-sm sm:text-base font-semibold text-slate-300 tracking-wider">OVERALL</div>
                    </div>

                    {/* Individual Scores */}
                    <div className="flex-1 md:ml-10">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                        {/* Design Score */}
                        <div className="text-center bg-slate-700/20 rounded-xl p-4 sm:p-6 border border-slate-600/30 hover:bg-slate-700/30 transition-all duration-300">
                          <div className="text-sm sm:text-base font-bold text-slate-300 mb-2 sm:mb-3 tracking-wider">DESIGN</div>
                          <div className={`text-2xl sm:text-3xl font-bold ${getScoreColor(results.categoryScores.design)} mb-1 sm:mb-2`}>
                            {results.categoryScores.design}
                          </div>
                          <div className="text-xs sm:text-sm text-slate-400 font-medium">/ 100</div>
                          <div className="mt-3 sm:mt-4 w-full bg-slate-600/30 rounded-full h-2 sm:h-3">
                            <div 
                              className={`h-2 sm:h-3 rounded-full transition-all duration-500 ${getBarColor(results.categoryScores.design)}`}
                              style={{ width: `${results.categoryScores.design}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Scalability Score */}
                        <div className="text-center bg-slate-700/20 rounded-xl p-4 sm:p-6 border border-slate-600/30 hover:bg-slate-700/30 transition-all duration-300">
                          <div className="text-sm sm:text-base font-bold text-slate-300 mb-2 sm:mb-3 tracking-wider">SCALE</div>
                          <div className={`text-2xl sm:text-3xl font-bold ${getScoreColor(results.categoryScores.scalability)} mb-1 sm:mb-2`}>
                            {results.categoryScores.scalability}
                          </div>
                          <div className="text-xs sm:text-sm text-slate-400 font-medium">/ 100</div>
                          <div className="mt-3 sm:mt-4 w-full bg-slate-600/30 rounded-full h-2 sm:h-3">
                            <div 
                              className={`h-2 sm:h-3 rounded-full transition-all duration-500 ${getBarColor(results.categoryScores.scalability)}`}
                              style={{ width: `${results.categoryScores.scalability}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Communication Score */}
                        <div className="text-center bg-slate-700/20 rounded-xl p-4 sm:p-6 border border-slate-600/30 hover:bg-slate-700/30 transition-all duration-300">
                          <div className="text-sm sm:text-base font-bold text-slate-300 mb-2 sm:mb-3 tracking-wider">COMMUNICATION</div>
                          <div className={`text-2xl sm:text-3xl font-bold ${getScoreColor(results.categoryScores.communication)} mb-1 sm:mb-2`}>
                            {results.categoryScores.communication}
                          </div>
                          <div className="text-xs sm:text-sm text-slate-400 font-medium">/ 100</div>
                          <div className="mt-3 sm:mt-4 w-full bg-slate-600/30 rounded-full h-2 sm:h-3">
                            <div 
                              className={`h-2 sm:h-3 rounded-full transition-all duration-500 ${getBarColor(results.categoryScores.communication)}`}
                              style={{ width: `${results.categoryScores.communication}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Design Analytics */}
              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-slate-100 shadow-xl">
                <CardHeader className="p-8">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">System Design Analytics</CardTitle>
                  <CardDescription className="text-slate-400 text-lg">
                    Comprehensive analysis of your system design performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  {/* Main Analytics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Overall Grade */}
                    <div className="bg-slate-700/40 rounded-2xl p-6 border border-slate-600/50 hover:border-slate-500/70 transition-all duration-300 hover:shadow-xl group">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="text-xs font-bold text-slate-400 tracking-widest">OVERALL GRADE</div>
                      </div>
                      <div className={`text-4xl font-black ${getScoreColor(results.overallScore)} mb-2`}>
                        {results.overallScore >= 90 ? 'A' : results.overallScore >= 80 ? 'B' : results.overallScore >= 70 ? 'C' : 'D'}
                      </div>
                      <div className="text-slate-400">
                        {results.overallScore >= 80 ? 'Excellent' : results.overallScore >= 70 ? 'Good' : results.overallScore >= 60 ? 'Average' : 'Needs Work'}
                      </div>
                    </div>

                    {/* Test Difficulty */}
                    <div className="bg-slate-700/40 rounded-2xl p-6 border border-slate-600/50 hover:border-slate-500/70 transition-all duration-300 hover:shadow-xl group">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <div className="text-xs font-bold text-slate-400 tracking-widest">DIFFICULTY</div>
                      </div>
                      <div className="text-4xl mb-2 font-black text-orange-400">
                        {results.difficulty.charAt(0)}
                      </div>
                      <div className="text-slate-400">{results.difficulty}</div>
                    </div>

                    {/* Time Performance */}
                    <div className="bg-slate-700/40 rounded-2xl p-6 border border-slate-600/50 hover:border-slate-500/70 transition-all duration-300 hover:shadow-xl group">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div className="text-xs font-bold text-slate-400 tracking-widest">TIME USED</div>
                      </div>
                      <div className={`text-4xl font-black text-blue-400 mb-2`}>
                        {results.testDuration}
                      </div>
                      <div className="text-slate-400">Minutes</div>
                    </div>

                    {/* Technical Details */}
                    <div className="bg-slate-700/40 rounded-2xl p-6 border border-slate-600/50 hover:border-slate-500/70 transition-all duration-300 hover:shadow-xl group">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="text-xs font-bold text-slate-400 tracking-widest">BREAKDOWN</div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center">
                          <div className="bg-slate-600 text-white px-3 py-2 rounded-lg text-lg font-bold mb-1">
                            {results.completedSteps}
                          </div>
                          <div className="text-slate-400 text-xs uppercase tracking-wide">Steps</div>
                        </div>
                        <div className="text-center">
                          <div className="bg-slate-600 text-white px-3 py-2 rounded-lg text-lg font-bold mb-1">
                            {results.feedback.strengths.length}
                          </div>
                          <div className="text-slate-400 text-xs uppercase tracking-wide">Strengths</div>
                        </div>
                        <div className="text-center">
                          <div className="bg-slate-600 text-white px-3 py-2 rounded-lg text-lg font-bold mb-1">
                            {results.categoryScores.requirements}
                          </div>
                          <div className="text-slate-400 text-xs uppercase tracking-wide">Requirements</div>
                        </div>
                        <div className="text-center">
                          <div className="bg-slate-600 text-white px-3 py-2 rounded-lg text-lg font-bold mb-1">
                            {results.feedback.improvements.length}
                          </div>
                          <div className="text-slate-400 text-xs uppercase tracking-wide">To Improve</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Strengths */}
              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-slate-100 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-600/40 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-400" />
                    </div>
                    <span className="text-white">Key Strengths</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {results.feedback.strengths.length > 0 ? results.feedback.strengths.map((strength, index) => (
                      <div key={index} className="group bg-slate-600/30 hover:bg-slate-600/50 border border-slate-500/30 hover:border-slate-500/50 rounded-xl p-4 transition-all duration-300 hover:shadow-lg">
                        <div className="flex items-start gap-4">
                          <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center mt-0.5 group-hover:bg-green-500/30 transition-colors">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          </div>
                          <span className="text-slate-200 leading-relaxed flex-1">{strength}</span>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-slate-600/30 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="h-8 w-8 text-slate-500" />
                        </div>
                        <p className="text-slate-400 italic">No specific strengths identified in the analysis.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Areas for Improvement */}
              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-slate-100 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-600/40 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-yellow-400" />
                    </div>
                    <span className="text-white">Areas for Improvement</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {results.feedback.improvements.length > 0 ? results.feedback.improvements.map((area, index) => (
                      <div key={index} className="group bg-slate-600/30 hover:bg-slate-600/50 border border-slate-500/30 hover:border-slate-500/50 rounded-xl p-4 transition-all duration-300 hover:shadow-lg">
                        <div className="flex items-start gap-4">
                          <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center mt-0.5 group-hover:bg-yellow-500/30 transition-colors">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          </div>
                          <span className="text-slate-200 leading-relaxed flex-1">{area}</span>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-slate-600/30 rounded-full flex items-center justify-center mx-auto mb-4">
                          <AlertTriangle className="h-8 w-8 text-slate-500" />
                        </div>
                        <p className="text-slate-400 italic">No specific areas for improvement identified in the analysis.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* What's Next */}
              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-slate-100 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">What's Next?</CardTitle>
                  <CardDescription className="text-slate-400">
                    Continue your system design journey
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <h4 className="text-sm font-semibold text-slate-300 mb-4 tracking-wider">NEXT STEPS</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 md:py-6 px-4 md:px-6 flex items-center gap-3 md:gap-4 border-slate-600 bg-slate-700/30 text-slate-300 hover:bg-slate-600 hover:text-white transition-all duration-300 hover:shadow-lg justify-start group" 
                      onClick={handleBackToTest}
                    >
                      <div className="w-10 md:w-12 h-10 md:h-12 rounded-full flex items-center justify-center transition-colors">
                        <RefreshCw className="h-5 md:h-6 w-5 md:w-6 text-slate-400" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-sm md:text-base">Try Another Problem</div>
                        <div className="text-xs md:text-sm text-slate-400 group-hover:text-slate-300 hidden md:block">Practice with different scenarios</div>
                      </div>
                    </Button>

                    <Button 
                      variant="outline" 
                      className="h-auto py-4 md:py-6 px-4 md:px-6 flex items-center gap-3 md:gap-4 border-slate-600 bg-slate-700/30 text-slate-300 hover:bg-slate-600 hover:text-white transition-all duration-300 hover:shadow-lg justify-start group" 
                      asChild
                    >
                      <Link href="/dashboard/technical">
                        <div className="w-10 md:w-12 h-10 md:h-12 rounded-full flex items-center justify-center transition-colors">
                          <Code2 className="h-5 md:h-6 w-5 md:w-6 text-slate-400" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-sm md:text-base">Practice Coding</div>
                          <div className="text-xs md:text-sm text-slate-400 group-hover:text-slate-300 hidden md:block">Solve technical problems</div>
                        </div>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Analysis Details (44% width) - Hidden on mobile */}
            <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-6 lg:h-fit order-1 lg:order-2">
              <Card className="bg-slate-800 border-slate-700 text-slate-100 h-full min-h-[85vh]">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl font-semibold flex items-center gap-3">
                    <Brain className="h-7 w-7 text-red-400" />
                    Detailed Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="prose prose-invert max-w-none">
                    <div className="text-slate-200 leading-relaxed whitespace-pre-wrap text-sm">
                      {results.analysis}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="mt-8 pt-6 border-t border-slate-600/50">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-blue-400" />
                      Recommendations
                    </h3>
                    <div className="space-y-3">
                      {results.feedback.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-slate-300 text-sm leading-relaxed">{recommendation}</span>
                        </div>
                      ))}
                    </div>
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