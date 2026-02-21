"use client"

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  Star,
  Github,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Code2,
  Palette,
  Target,
  TrendingUp,
  User,
  LogOut,
  Copy,
  Share2,
  Download,
  RefreshCw,
  BarChart
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import ProtectedRoute from '@/components/ProtectedRoute';

interface PortfolioAnalysis {
  overallScore: number;
  overallFeedback: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  portfolioAnalysis: {
    designScore: number;
    designFeedback: string;
    contentScore: number;
    contentFeedback: string;
  };
  projectAnalysis: Array<{
    name: string;
    score: number;
    feedback: string;
    techStack: string[];
    highlights: string[];
    improvements: string[];
  }>;
  technicalSkills: {
    score: number;
    feedback: string;
    strengths: string[];
    gaps: string[];
  };
  roleAlignment: {
    score: number;
    feedback: string;
    missingSkills: string[];
    relevantProjects: string[];
  };
}

interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  url: string;
  topics: string[];
}

interface ResultsData {
  success: boolean;
  analysis: PortfolioAnalysis;
  repos: GitHubRepo[];
}

export default function PortfolioResultsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [results, setResults] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get results from sessionStorage
    const storedResults = sessionStorage.getItem('portfolioReviewResults');
    if (storedResults) {
      try {
        const parsedResults = JSON.parse(storedResults);
        setResults(parsedResults);
      } catch (error) {
        console.error('Error parsing results:', error);
        router.push('/portfolio-review');
      }
    } else {
      router.push('/portfolio-review');
    }
    setLoading(false);
  }, [router]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-cyan-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 90) return 'from-green-500/20 to-green-600/10';
    if (score >= 80) return 'from-cyan-500/20 to-cyan-600/10';
    if (score >= 70) return 'from-yellow-500/20 to-yellow-600/10';
    if (score >= 60) return 'from-orange-500/20 to-orange-600/10';
    return 'from-red-500/20 to-red-600/10';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center">
        <div className="text-white">Loading results...</div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p>No results found</p>
          <Link href="/portfolio-review">
            <Button className="mt-4">Go Back</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { analysis, repos } = results;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-zinc-950/80 border-b border-zinc-800/50">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image src="https://i.ibb.co/hJC8n6NB/Generated-Image-February-20-2026-7-04-PM-Photoroom.png" alt="InterviewSense" width={40} height={40} className="object-contain" />
              <span className="font-semibold text-white">InterviewSense</span>
            </Link>
            <nav className="flex items-center gap-4">
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

        <div className="pt-20 px-4 pb-8">
          <div className="max-w-6xl mx-auto">
            {/* Header Card */}
            <Card className="bg-zinc-800/50 border-zinc-700/50 text-white mb-6">
              <CardHeader className="text-center py-6">
                <CardTitle className="text-2xl">Portfolio Analysis Report</CardTitle>
                <div className="text-zinc-400">
                  Comprehensive review of your portfolio and projects
                </div>
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
                          strokeDashoffset={`${2 * Math.PI * 42 * (1 - analysis.overallScore / 100)}`}
                          className={analysis.overallScore >= 80 ? 'text-cyan-400' : analysis.overallScore >= 60 ? 'text-yellow-400' : 'text-red-400'}
                          strokeLinecap="round"
                          style={{
                            filter: 'drop-shadow(0 0 8px currentColor)',
                            transition: 'all 0.3s ease'
                          }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-3xl font-bold ${analysis.overallScore >= 80 ? 'text-cyan-400' : analysis.overallScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {analysis.overallScore}
                        </span>
                        <span className="text-sm text-slate-400 font-medium">/ 100</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">Overall Score</h3>
                    <p className="text-sm text-slate-400 text-center">
                      {analysis.overallScore >= 80 ? 'Excellent Portfolio' : 
                       analysis.overallScore >= 60 ? 'Good Portfolio' : 'Needs Improvement'}
                    </p>
                  </div>

                  {/* Feedback Summary */}
                  <div className="flex-1 bg-zinc-700/20 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-3">Portfolio Summary</h3>
                    <p className="text-zinc-300 leading-relaxed">{analysis.overallFeedback}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Score Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Palette className="h-5 w-5 text-cyan-400" />
                    <span className="font-medium">Design</span>
                  </div>
                  <div className={`text-2xl font-bold ${getScoreColor(analysis.portfolioAnalysis.designScore)}`}>
                    {analysis.portfolioAnalysis.designScore}
                  </div>
                  <Progress value={analysis.portfolioAnalysis.designScore} className="h-2 mt-2" />
                </CardContent>
              </Card>

              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Code2 className="h-5 w-5 text-green-400" />
                    <span className="font-medium">Technical Skills</span>
                  </div>
                  <div className={`text-2xl font-bold ${getScoreColor(analysis.technicalSkills.score)}`}>
                    {analysis.technicalSkills.score}
                  </div>
                  <Progress value={analysis.technicalSkills.score} className="h-2 mt-2" />
                </CardContent>
              </Card>

              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Target className="h-5 w-5 text-purple-400" />
                    <span className="font-medium">Role Alignment</span>
                  </div>
                  <div className={`text-2xl font-bold ${getScoreColor(analysis.roleAlignment.score)}`}>
                    {analysis.roleAlignment.score}
                  </div>
                  <Progress value={analysis.roleAlignment.score} className="h-2 mt-2" />
                </CardContent>
              </Card>

              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="h-5 w-5 text-orange-400" />
                    <span className="font-medium">Content</span>
                  </div>
                  <div className={`text-2xl font-bold ${getScoreColor(analysis.portfolioAnalysis.contentScore)}`}>
                    {analysis.portfolioAnalysis.contentScore}
                  </div>
                  <Progress value={analysis.portfolioAnalysis.contentScore} className="h-2 mt-2" />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Strengths */}
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.strengths.map((strength, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-zinc-300">{strength}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Areas for Improvement */}
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-400">
                    <AlertTriangle className="h-5 w-5" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.weaknesses.map((weakness, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-zinc-300">{weakness}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Project Analysis */}
            {analysis.projectAnalysis && analysis.projectAnalysis.length > 0 && (
              <Card className="bg-zinc-800/50 border-zinc-700 mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code2 className="h-5 w-5 text-purple-400" />
                    Project Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {analysis.projectAnalysis.map((project, index) => (
                      <div key={index} className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-600">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-semibold text-white">{project.name}</h3>
                          <div className={`text-2xl font-bold ${getScoreColor(project.score)}`}>
                            {project.score}
                          </div>
                        </div>
                        
                        <p className="text-zinc-300 mb-4">{project.feedback}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-cyan-400 mb-2">Tech Stack</h4>
                            <div className="flex flex-wrap gap-2">
                              {project.techStack.map((tech, techIndex) => (
                                <Badge key={techIndex} variant="secondary" className="bg-zinc-700 text-zinc-200">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-green-400 mb-2">Highlights</h4>
                            <ul className="space-y-1">
                              {project.highlights.map((highlight, highlightIndex) => (
                                <li key={highlightIndex} className="text-sm text-zinc-300 flex items-start gap-2">
                                  <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                  {highlight}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-orange-400 mb-2">Improvements</h4>
                            <ul className="space-y-1">
                              {project.improvements.map((improvement, improvementIndex) => (
                                <li key={improvementIndex} className="text-sm text-zinc-300 flex items-start gap-2">
                                  <AlertTriangle className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                                  {improvement}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            <Card className="bg-zinc-800/50 border-zinc-700 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyan-400">
                  <Lightbulb className="h-5 w-5" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.recommendations.map((recommendation, index) => (
                    <div key={index} className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-600">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-cyan-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                          {index + 1}
                        </div>
                        <p className="text-zinc-300">{recommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* GitHub Repositories */}
            {repos && repos.length > 0 && (
              <Card className="bg-zinc-800/50 border-zinc-700 mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Github className="h-5 w-5" />
                    GitHub Repositories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {repos.map((repo, index) => (
                      <div key={index} className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-600">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-white">{repo.name}</h3>
                            <p className="text-sm text-zinc-400 mt-1">{repo.description || 'No description'}</p>
                          </div>
                          <Link href={repo.url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                        
                        <div className="flex items-center gap-4 mb-3">
                          {repo.language && (
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                              <span className="text-sm text-zinc-300">{repo.language}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm text-zinc-300">{repo.stars}</span>
                          </div>
                        </div>
                        
                        {repo.topics && repo.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {repo.topics.slice(0, 3).map((topic, topicIndex) => (
                              <Badge key={topicIndex} variant="outline" className="text-xs border-zinc-600 text-zinc-400">
                                {topic}
                              </Badge>
                            ))}
                            {repo.topics.length > 3 && (
                              <Badge variant="outline" className="text-xs border-zinc-600 text-zinc-400">
                                +{repo.topics.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detailed Analysis Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Technical Skills */}
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code2 className="h-5 w-5 text-green-400" />
                    Technical Skills Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-zinc-300">{analysis.technicalSkills.feedback}</p>
                  
                  <div>
                    <h4 className="text-sm font-medium text-green-400 mb-2">Technical Strengths</h4>
                    <ul className="space-y-1">
                      {analysis.technicalSkills.strengths.map((strength, index) => (
                        <li key={index} className="text-sm text-zinc-300 flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-orange-400 mb-2">Skill Gaps</h4>
                    <ul className="space-y-1">
                      {analysis.technicalSkills.gaps.map((gap, index) => (
                        <li key={index} className="text-sm text-zinc-300 flex items-start gap-2">
                          <AlertTriangle className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                          {gap}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Role Alignment */}
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-400" />
                    Role Alignment Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-zinc-300">{analysis.roleAlignment.feedback}</p>
                  
                  <div>
                    <h4 className="text-sm font-medium text-green-400 mb-2">Relevant Projects</h4>
                    <ul className="space-y-1">
                      {analysis.roleAlignment.relevantProjects.map((project, index) => (
                        <li key={index} className="text-sm text-zinc-300 flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                          {project}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-orange-400 mb-2">Missing Skills</h4>
                    <ul className="space-y-1">
                      {analysis.roleAlignment.missingSkills.map((skill, index) => (
                        <li key={index} className="text-sm text-zinc-300 flex items-start gap-2">
                          <AlertTriangle className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="text-center mt-12">
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/portfolio-review">
                  <Button className="bg-cyan-600 hover:bg-cyan-500 px-8 py-3">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Review Another Portfolio
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 px-8 py-3">
                    <BarChart className="mr-2 h-4 w-4" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 