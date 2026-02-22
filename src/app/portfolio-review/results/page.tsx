"use client""use client""use client""use client"



import { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import Link from 'next/link';import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';import { useRouter } from 'next/navigation';

import { Progress } from '@/components/ui/progress';

import { import Link from 'next/link';import { useState, useEffect } from 'react';import { useState, useEffect } from 'react';

  Lightbulb,

  Code2,import { Button } from '@/components/ui/button';

  Palette,

  Target,import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';import { useSession, signOut } from 'next-auth/react';import { useSession, signOut } from 'next-auth/react';

  TrendingUp,

  RefreshCw,import { Badge } from '@/components/ui/badge';

  BarChart

} from 'lucide-react';import { Progress } from '@/components/ui/progress';import { useRouter } from 'next/navigation';import { useRouter } from 'next/navigation';

import ProtectedRoute from '@/components/ProtectedRoute';

import { DashboardLayout } from '@/components/DashboardLayout';import { 



export default function PortfolioResultsPage() {  CheckCircle,import Link from 'next/link';import Link from 'next/link';

  const router = useRouter();

  const [results, setResults] = useState<any>(null);  AlertTriangle,

  const [loading, setLoading] = useState(true);

  Lightbulb,import Image from 'next/image';import Image from 'next/image';

  useEffect(() => {

    const storedResults = sessionStorage.getItem('portfolioReviewResults');  Code2,

    if (storedResults) {

      try {  Palette,import { Button } from '@/components/ui/button';import { Button } from '@/components/ui/            <Card className="bg-white border-gray-200">

        const parsedResults = JSON.parse(storedResults);

        setResults(parsedResults);  Target,

      } catch (error) {

        console.error('Error parsing results:', error);  TrendingUp,import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';              <CardContent className="p-6">

        router.push('/portfolio-review');

      }  RefreshCw,

    } else {

      router.push('/portfolio-review');  BarChartimport { Badge } from '@/components/ui/badge';                <div className="flex items-center gap-3 mb-3">

    }

    setLoading(false);} from 'lucide-react';

  }, [router]);

import ProtectedRoute from '@/components/ProtectedRoute';import { Progress } from '@/components/ui/progress';                  <TrendingUp className="h-5 w-5 text-orange-500" />

  if (loading) {

    return (import { DashboardLayout } from '@/components/DashboardLayout';

      <ProtectedRoute>

        <DashboardLayout>import {                   <span className="font-medium text-gray-900">Growth</span>

          <div className="flex items-center justify-center min-h-screen">

            <div className="text-gray-600">Loading results...</div>export default function PortfolioResultsPage() {

          </div>

        </DashboardLayout>  const router = useRouter();  ArrowLeft,                </div>

      </ProtectedRoute>

    );  const [results, setResults] = useState<any>(null);

  }

  const [loading, setLoading] = useState(true);  Star,                <div className={`text-2xl font-bold ${getScoreColor(75)}`}>

  if (!results) {

    return (

      <ProtectedRoute>

        <DashboardLayout>  useEffect(() => {  Github,                  75

          <div className="flex items-center justify-center min-h-screen">

            <div className="text-center">    const storedResults = sessionStorage.getItem('portfolioReviewResults');

              <p className="text-gray-600 mb-4">No results found</p>

              <Link href="/portfolio-review">    if (storedResults) {  ExternalLink,                </div>

                <Button>Go Back</Button>

              </Link>      try {

            </div>

          </div>        const parsedResults = JSON.parse(storedResults);  CheckCircle,                <Progress value={75} className="h-2 mt-2" />

        </DashboardLayout>

      </ProtectedRoute>        setResults(parsedResults);

    );

  }      } catch (error) {  AlertTriangle,              </CardContent>



  const { analysis } = results;        console.error('Error parsing results:', error);



  return (        router.push('/portfolio-review');  Lightbulb,            </Card>

    <ProtectedRoute>

      <DashboardLayout>      }

        <div className="p-6 max-w-6xl mx-auto">

          <Card className="bg-white border-gray-200 mb-6">    } else {  Code2,          </div>

            <CardHeader className="text-center py-6">

              <CardTitle className="text-2xl text-gray-900">Portfolio Analysis Report</CardTitle>      router.push('/portfolio-review');

              <div className="text-gray-600">

                Comprehensive review of your portfolio and projects    }  Palette,

              </div>

            </CardHeader>    setLoading(false);

          </Card>

  }, [router]);  Target,          {/* Strengths and Weaknesses */}

          <Card className="bg-white border-gray-200 shadow-sm mb-6">

            <CardContent className="p-6">

              <div className="flex flex-col items-center text-center">

                <div className="text-4xl font-bold text-blue-600 mb-2">  if (loading) {  TrendingUp,          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                  {analysis?.overallScore || 85}

                </div>    return (

                <div className="text-gray-600 mb-4">Overall Portfolio Score</div>

                <p className="text-gray-700 max-w-2xl">      <ProtectedRoute>  User,            <Card className="bg-white border-gray-200">

                  {analysis?.overallFeedback || "Your portfolio demonstrates strong technical capabilities and project diversity."}

                </p>        <DashboardLayout>

              </div>

            </CardContent>          <div className="flex items-center justify-center min-h-screen">  LogOut,              <CardHeader>

          </Card>

            <div className="text-gray-600">Loading results...</div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

            <Card className="bg-white border-gray-200">          </div>  Copy,                <CardTitle className="flex items-center gap-2 text-green-600">

              <CardContent className="p-6">

                <div className="flex items-center gap-3 mb-3">        </DashboardLayout>

                  <Palette className="h-5 w-5 text-blue-500" />

                  <span className="font-medium text-gray-900">Design</span>      </ProtectedRoute>  Share2,                  <CheckCircle className="h-5 w-5" />

                </div>

                <div className="text-2xl font-bold text-blue-500">    );

                  {analysis?.portfolioAnalysis?.designScore || 80}

                </div>  }  Download,                  Strengths

                <Progress value={analysis?.portfolioAnalysis?.designScore || 80} className="h-2 mt-2" />

              </CardContent>

            </Card>

  if (!results) {  RefreshCw,                </CardTitle>

            <Card className="bg-white border-gray-200">

              <CardContent className="p-6">    return (

                <div className="flex items-center gap-3 mb-3">

                  <Code2 className="h-5 w-5 text-green-500" />      <ProtectedRoute>  BarChart              </CardHeader>

                  <span className="font-medium text-gray-900">Technical Skills</span>

                </div>        <DashboardLayout>

                <div className="text-2xl font-bold text-green-500">

                  {analysis?.technicalSkills?.score || 85}          <div className="flex items-center justify-center min-h-screen">} from 'lucide-react';              <CardContent>

                </div>

                <Progress value={analysis?.technicalSkills?.score || 85} className="h-2 mt-2" />            <div className="text-center">

              </CardContent>

            </Card>              <p className="text-gray-600 mb-4">No results found</p>import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';                <div className="space-y-3">



            <Card className="bg-white border-gray-200">              <Link href="/portfolio-review">

              <CardContent className="p-6">

                <div className="flex items-center gap-3 mb-3">                <Button>Go Back</Button>import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';                  {analysis.portfolioAnalysis?.strengths?.map((strength, index) => (

                  <Target className="h-5 w-5 text-purple-500" />

                  <span className="font-medium text-gray-900">Role Alignment</span>              </Link>

                </div>

                <div className="text-2xl font-bold text-purple-500">            </div>import ProtectedRoute from '@/components/ProtectedRoute';                    <div key={index} className="flex items-start gap-3">

                  {analysis?.roleAlignment?.score || 75}

                </div>          </div>

                <Progress value={analysis?.roleAlignment?.score || 75} className="h-2 mt-2" />

              </CardContent>        </DashboardLayout>import { DashboardLayout } from '@/components/DashboardLayout';                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>

            </Card>

      </ProtectedRoute>

            <Card className="bg-white border-gray-200">

              <CardContent className="p-6">    );                      <p className="text-gray-700">{strength}</p>

                <div className="flex items-center gap-3 mb-3">

                  <TrendingUp className="h-5 w-5 text-orange-500" />  }

                  <span className="font-medium text-gray-900">Growth</span>

                </div>interface PortfolioAnalysis {                    </div>

                <div className="text-2xl font-bold text-orange-500">75</div>

                <Progress value={75} className="h-2 mt-2" />  const { analysis } = results;

              </CardContent>

            </Card>  overallScore: number;                  ))}

          </div>

  return (

          <Card className="bg-white border-gray-200 mb-8">

            <CardHeader>    <ProtectedRoute>  overallFeedback: string;                </div>

              <CardTitle className="flex items-center gap-2 text-blue-600">

                <Lightbulb className="h-5 w-5" />      <DashboardLayout>

                Key Recommendations

              </CardTitle>        <div className="p-6 max-w-6xl mx-auto">  portfolioAnalysis: {              </CardContent>

            </CardHeader>

            <CardContent>          {/* Header Card */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {(analysis?.recommendations || [          <Card className="bg-white border-gray-200 mb-6">    designScore: number;            </Card>

                  "Add more detailed project documentation",

                  "Include live demo links for projects",             <CardHeader className="text-center py-6">

                  "Showcase more diverse technology stack",

                  "Add performance metrics and results"              <CardTitle className="text-2xl text-gray-900">Portfolio Analysis Report</CardTitle>    strengths?: string[];

                ]).map((recommendation: string, index: number) => (

                  <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">              <div className="text-gray-600">

                    <div className="flex items-start gap-3">

                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">                Comprehensive review of your portfolio and projects    weaknesses?: string[];            <Card className="bg-white border-gray-200">

                        {index + 1}

                      </div>              </div>

                      <p className="text-gray-700">{recommendation}</p>

                    </div>            </CardHeader>  };              <CardHeader>

                  </div>

                ))}          </Card>

              </div>

            </CardContent>  technicalSkills: {                <CardTitle className="flex items-center gap-2 text-orange-600">

          </Card>

          {/* Overall Score */}

          <div className="text-center mt-12">

            <div className="flex flex-col sm:flex-row justify-center gap-4">          <Card className="bg-white border-gray-200 shadow-sm mb-6">    score: number;                  <AlertTriangle className="h-5 w-5" />

              <Link href="/portfolio-review">

                <Button className="bg-blue-600 hover:bg-blue-500 px-8 py-3">            <CardContent className="p-6">

                  <RefreshCw className="mr-2 h-4 w-4" />

                  Review Another Portfolio              <div className="flex flex-col items-center text-center">    feedback: string;                  Areas for Improvement

                </Button>

              </Link>                <div className="text-4xl font-bold text-blue-600 mb-2">

              <Link href="/dashboard">

                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3">                  {analysis?.overallScore || 85}    strengths: string[];                </CardTitle>

                  <BarChart className="mr-2 h-4 w-4" />

                  Back to Dashboard                </div>

                </Button>

              </Link>                <div className="text-gray-600 mb-4">Overall Portfolio Score</div>    gaps: string[];              </CardHeader>

            </div>

          </div>                <p className="text-gray-700 max-w-2xl">

        </div>

      </DashboardLayout>                  {analysis?.overallFeedback || "Your portfolio demonstrates strong technical capabilities and project diversity. Continue building on these strengths while addressing the improvement areas highlighted below."}  };              <CardContent>

    </ProtectedRoute>

  );                </p>

}
              </div>  roleAlignment: {                <div className="space-y-3">

            </CardContent>

          </Card>    score: number;                  {analysis.portfolioAnalysis?.weaknesses?.map((weakness, index) => (



          {/* Score Breakdown */}    feedback: string;                    <div key={index} className="flex items-start gap-3">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

            <Card className="bg-white border-gray-200">    relevantProjects: string[];                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>

              <CardContent className="p-6">

                <div className="flex items-center gap-3 mb-3">    missingSkills: string[];                      <p className="text-gray-700">{weakness}</p>

                  <Palette className="h-5 w-5 text-blue-500" />

                  <span className="font-medium text-gray-900">Design</span>  };                    </div>

                </div>

                <div className="text-2xl font-bold text-blue-500">  projectAnalysis?: Array<{                  ))}

                  {analysis?.portfolioAnalysis?.designScore || 80}

                </div>    name: string;                </div>

                <Progress value={analysis?.portfolioAnalysis?.designScore || 80} className="h-2 mt-2" />

              </CardContent>    score: number;              </CardContent>

            </Card>

    feedback: string;            </Card>

            <Card className="bg-white border-gray-200">

              <CardContent className="p-6">    techStack: string[];          </div>

                <div className="flex items-center gap-3 mb-3">

                  <Code2 className="h-5 w-5 text-green-500" />    highlights: string[];

                  <span className="font-medium text-gray-900">Technical Skills</span>

                </div>    improvements: string[];          {/* Project Analysis */}

                <div className="text-2xl font-bold text-green-500">

                  {analysis?.technicalSkills?.score || 85}  }>;          {analysis.projectAnalysis && analysis.projectAnalysis.length > 0 && (

                </div>

                <Progress value={analysis?.technicalSkills?.score || 85} className="h-2 mt-2" />  recommendations: string[];            <Card className="bg-white border-gray-200 mb-8">

              </CardContent>

            </Card>}              <CardHeader>



            <Card className="bg-white border-gray-200">                <CardTitle className="flex items-center gap-2">

              <CardContent className="p-6">

                <div className="flex items-center gap-3 mb-3">interface Repository {                  <Code2 className="h-5 w-5 text-purple-500" />

                  <Target className="h-5 w-5 text-purple-500" />

                  <span className="font-medium text-gray-900">Role Alignment</span>  name: string;                  Project Analysis

                </div>

                <div className="text-2xl font-bold text-purple-500">  url: string;                </CardTitle>

                  {analysis?.roleAlignment?.score || 75}

                </div>  description?: string;              </CardHeader>

                <Progress value={analysis?.roleAlignment?.score || 75} className="h-2 mt-2" />

              </CardContent>  language?: string;              <CardContent>

            </Card>

  stars: number;                <div className="space-y-6">

            <Card className="bg-white border-gray-200">

              <CardContent className="p-6">  topics?: string[];                  {analysis.projectAnalysis.map((project, index) => (

                <div className="flex items-center gap-3 mb-3">

                  <TrendingUp className="h-5 w-5 text-orange-500" />}                    <div key={index} className="bg-gray-50 p-6 rounded-lg border border-gray-200">

                  <span className="font-medium text-gray-900">Growth</span>

                </div>                      <div className="flex items-center justify-between mb-4">

                <div className="text-2xl font-bold text-orange-500">75</div>

                <Progress value={75} className="h-2 mt-2" />interface PortfolioResults {                        <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>

              </CardContent>

            </Card>  analysis: PortfolioAnalysis;                        <div className={`text-2xl font-bold ${getScoreColor(project.score)}`}>

          </div>

  repos: Repository[];                          {project.score}

          {/* Recommendations */}

          <Card className="bg-white border-gray-200 mb-8">}                        </div>

            <CardHeader>

              <CardTitle className="flex items-center gap-2 text-blue-600">                      </div>

                <Lightbulb className="h-5 w-5" />

                Key Recommendationsexport default function PortfolioResultsPage() {                      

              </CardTitle>

            </CardHeader>  const { data: session, status } = useSession();                      <p className="text-gray-700 mb-4">{project.feedback}</p>

            <CardContent>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">  const router = useRouter();                      

                {(analysis?.recommendations || [

                  "Add more detailed project documentation",  const [results, setResults] = useState<PortfolioResults | null>(null);                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  "Include live demo links for projects", 

                  "Showcase more diverse technology stack",  const [loading, setLoading] = useState(true);                        <div>

                  "Add performance metrics and results"

                ]).map((recommendation: string, index: number) => (                          <h4 className="text-sm font-medium text-blue-600 mb-2">Tech Stack</h4>

                  <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">

                    <div className="flex items-start gap-3">  useEffect(() => {                          <div className="flex flex-wrap gap-2">

                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">

                        {index + 1}    const storedResults = sessionStorage.getItem('portfolioReviewResults');                            {project.techStack.map((tech, techIndex) => (

                      </div>

                      <p className="text-gray-700">{recommendation}</p>    if (storedResults) {                              <Badge key={techIndex} variant="secondary" className="bg-gray-200 text-gray-800">

                    </div>

                  </div>      try {                                {tech}

                ))}

              </div>        const parsedResults = JSON.parse(storedResults);                              </Badge>

            </CardContent>

          </Card>        setResults(parsedResults);                            ))}



          {/* Action Buttons */}      } catch (error) {                          </div>

          <div className="text-center mt-12">

            <div className="flex flex-col sm:flex-row justify-center gap-4">        console.error('Error parsing results:', error);                        </div>

              <Link href="/portfolio-review">

                <Button className="bg-blue-600 hover:bg-blue-500 px-8 py-3">        router.push('/portfolio-review');                        

                  <RefreshCw className="mr-2 h-4 w-4" />

                  Review Another Portfolio      }                        <div>

                </Button>

              </Link>    } else {                          <h4 className="text-sm font-medium text-green-600 mb-2">Highlights</h4>

              <Link href="/dashboard">

                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3">      router.push('/portfolio-review');                          <ul className="space-y-1">

                  <BarChart className="mr-2 h-4 w-4" />

                  Back to Dashboard    }                            {project.highlights.map((highlight, highlightIndex) => (

                </Button>

              </Link>    setLoading(false);                              <li key={highlightIndex} className="text-sm text-gray-700 flex items-start gap-2">

            </div>

          </div>  }, [router]);                                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />

        </div>

      </DashboardLayout>                                {highlight}

    </ProtectedRoute>

  );  const getScoreColor = (score: number) => {                              </li>

}
    if (score >= 90) return 'text-green-500';                            ))}

    if (score >= 80) return 'text-blue-500';                          </ul>

    if (score >= 70) return 'text-yellow-500';                        </div>

    if (score >= 60) return 'text-orange-500';                        

    return 'text-red-500';                        <div>

  };                          <h4 className="text-sm font-medium text-orange-600 mb-2">Improvements</h4>

                          <ul className="space-y-1">

  if (loading) {                            {project.improvements.map((improvement, improvementIndex) => (

    return (                              <li key={improvementIndex} className="text-sm text-gray-700 flex items-start gap-2">

      <ProtectedRoute>                                <AlertTriangle className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />

        <DashboardLayout>                                {improvement}

          <div className="min-h-screen flex items-center justify-center">                              </li>

            <div className="text-gray-600">Loading results...</div>                            ))}

          </div>                          </ul>

        </DashboardLayout>                        </div>

      </ProtectedRoute>                      </div>

    );                    </div>

  }                  ))}

                </div>

  if (!results) {              </CardContent>

    return (            </Card>

      <ProtectedRoute>          )}

        <DashboardLayout>

          <div className="min-h-screen flex items-center justify-center">          {/* Recommendations */}

            <div className="text-center">          <Card className="bg-white border-gray-200 mb-8">

              <p className="text-gray-600 mb-4">No results found</p>            <CardHeader>

              <Link href="/portfolio-review">              <CardTitle className="flex items-center gap-2 text-blue-600">

                <Button>Go Back</Button>                <Lightbulb className="h-5 w-5" />

              </Link>                Recommendations

            </div>              </CardTitle>

          </div>            </CardHeader>

        </DashboardLayout>            <CardContent>

      </ProtectedRoute>              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

    );                {analysis.recommendations.map((recommendation, index) => (

  }                  <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">

                    <div className="flex items-start gap-3">

  const { analysis, repos } = results;                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">

                        {index + 1}

  return (                      </div>

    <ProtectedRoute>                      <p className="text-gray-700">{recommendation}</p>

      <DashboardLayout>                    </div>

        <div className="p-6 max-w-6xl mx-auto">                  </div>

          {/* Header Card */}                ))}

          <Card className="bg-white border-gray-200 mb-6">              </div>

            <CardHeader className="text-center py-6">            </CardContent>

              <CardTitle className="text-2xl text-gray-900">Portfolio Analysis Report</CardTitle>          </Card>

              <div className="text-gray-600">

                Comprehensive review of your portfolio and projects          {/* GitHub Repositories */}

              </div>          {repos && repos.length > 0 && (

            </CardHeader>            <Card className="bg-white border-gray-200 mb-8">

          </Card>              <CardHeader>

                <CardTitle className="flex items-center gap-2">

          {/* Score Card with Modern Design */}                  <Github className="h-5 w-5" />

          <Card className="bg-white border-gray-200 shadow-sm mb-6">                  GitHub Repositories

            <CardContent className="p-6">                </CardTitle>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">              </CardHeader>

                {/* Overall Score with Circular Progress */}              <CardContent>

                <div className="flex flex-col items-center bg-gray-50 rounded-2xl p-8 min-w-[200px] mx-auto md:mx-0">                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div className="relative w-32 h-32 mb-4">                  {repos.map((repo, index) => (

                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">

                      {/* Background circle */}                      <div className="flex items-start justify-between mb-3">

                      <circle                        <div>

                        cx="50"                          <h3 className="font-semibold text-gray-900">{repo.name}</h3>

                        cy="50"                          <p className="text-sm text-gray-600 mt-1">{repo.description || 'No description'}</p>

                        r="42"                        </div>

                        stroke="currentColor"                        <Link href={repo.url} target="_blank" rel="noopener noreferrer">

                        strokeWidth="6"                          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">

                        fill="transparent"                            <ExternalLink className="h-4 w-4" />

                        className="text-gray-200"                          </Button>

                      />                        </Link>

                      {/* Progress circle */}                      </div>

                      <circle                      

                        cx="50"                      <div className="flex items-center gap-4 mb-3">

                        cy="50"                        {repo.language && (

                        r="42"                          <div className="flex items-center gap-1">

                        stroke="currentColor"                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>

                        strokeWidth="6"                            <span className="text-sm text-gray-700">{repo.language}</span>

                        fill="transparent"                          </div>

                        strokeDasharray={`${2 * Math.PI * 42}`}                        )}

                        strokeDashoffset={`${2 * Math.PI * 42 * (1 - analysis.overallScore / 100)}`}                        <div className="flex items-center gap-1">

                        className={analysis.overallScore >= 80 ? 'text-green-500' : analysis.overallScore >= 60 ? 'text-yellow-500' : 'text-red-500'}                          <Star className="h-4 w-4 text-yellow-500" />

                        strokeLinecap="round"                          <span className="text-sm text-gray-700">{repo.stars}</span>

                        style={{                        </div>

                          transition: 'all 0.3s ease'                      </div>

                        }}                      

                      />                      {repo.topics && repo.topics.length > 0 && (

                    </svg>                        <div className="flex flex-wrap gap-1">

                    <div className="absolute inset-0 flex flex-col items-center justify-center">                          {repo.topics.slice(0, 3).map((topic, topicIndex) => (

                      <span className={`text-3xl font-bold ${analysis.overallScore >= 80 ? 'text-green-500' : analysis.overallScore >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>                            <Badge key={topicIndex} variant="outline" className="text-xs border-gray-300 text-gray-600">

                        {analysis.overallScore}                              {topic}

                      </span>                            </Badge>

                      <span className="text-sm text-gray-500 font-medium">/ 100</span>                          ))}

                    </div>                          {repo.topics.length > 3 && (

                  </div>                            <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">

                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Overall Score</h3>                              +{repo.topics.length - 3}

                  <p className="text-sm text-gray-500 text-center">                            </Badge>

                    {analysis.overallScore >= 80 ? 'Excellent Portfolio' :                           )}

                     analysis.overallScore >= 60 ? 'Good Portfolio' : 'Needs Improvement'}                        </div>

                  </p>                      )}

                </div>                    </div>

                  ))}

                {/* Feedback Summary */}                </div>

                <div className="flex-1 bg-gray-50 rounded-xl p-6">              </CardContent>

                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Portfolio Summary</h3>            </Card>

                  <p className="text-gray-700 leading-relaxed">{analysis.overallFeedback}</p>          )}

                </div>

              </div>          {/* Detailed Analysis Sections */}

            </CardContent>          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          </Card>            {/* Technical Skills */}

            <Card className="bg-white border-gray-200">

          {/* Score Breakdown */}              <CardHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">                <CardTitle className="flex items-center gap-2">

            <Card className="bg-white border-gray-200">                  <Code2 className="h-5 w-5 text-green-500" />

              <CardContent className="p-6">                  Technical Skills Analysis

                <div className="flex items-center gap-3 mb-3">                </CardTitle>

                  <Palette className="h-5 w-5 text-blue-500" />              </CardHeader>

                  <span className="font-medium text-gray-900">Design</span>              <CardContent className="space-y-4">

                </div>                <p className="text-gray-700">{analysis.technicalSkills.feedback}</p>

                <div className={`text-2xl font-bold ${getScoreColor(analysis.portfolioAnalysis.designScore)}`}>                

                  {analysis.portfolioAnalysis.designScore}                <div>

                </div>                  <h4 className="text-sm font-medium text-green-600 mb-2">Technical Strengths</h4>

                <Progress value={analysis.portfolioAnalysis.designScore} className="h-2 mt-2" />                  <ul className="space-y-1">

              </CardContent>                    {analysis.technicalSkills.strengths.map((strength, index) => (

            </Card>                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">

                        <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />

            <Card className="bg-white border-gray-200">                        {strength}

              <CardContent className="p-6">                      </li>

                <div className="flex items-center gap-3 mb-3">                    ))}

                  <Code2 className="h-5 w-5 text-green-500" />                  </ul>

                  <span className="font-medium text-gray-900">Technical Skills</span>                </div>

                </div>                

                <div className={`text-2xl font-bold ${getScoreColor(analysis.technicalSkills.score)}`}>                <div>

                  {analysis.technicalSkills.score}                  <h4 className="text-sm font-medium text-orange-600 mb-2">Skill Gaps</h4>

                </div>                  <ul className="space-y-1">

                <Progress value={analysis.technicalSkills.score} className="h-2 mt-2" />                    {analysis.technicalSkills.gaps.map((gap, index) => (

              </CardContent>                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">

            </Card>                        <AlertTriangle className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />

                        {gap}

            <Card className="bg-white border-gray-200">                      </li>

              <CardContent className="p-6">                    ))}

                <div className="flex items-center gap-3 mb-3">                  </ul>

                  <Target className="h-5 w-5 text-purple-500" />                </div>

                  <span className="font-medium text-gray-900">Role Alignment</span>              </CardContent>

                </div>            </Card>

                <div className={`text-2xl font-bold ${getScoreColor(analysis.roleAlignment.score)}`}>

                  {analysis.roleAlignment.score}            {/* Role Alignment */}

                </div>            <Card className="bg-white border-gray-200">

                <Progress value={analysis.roleAlignment.score} className="h-2 mt-2" />              <CardHeader>

              </CardContent>                <CardTitle className="flex items-center gap-2">

            </Card>                  <Target className="h-5 w-5 text-purple-500" />

                  Role Alignment Analysis

            <Card className="bg-white border-gray-200">                </CardTitle>

              <CardContent className="p-6">              </CardHeader>

                <div className="flex items-center gap-3 mb-3">              <CardContent className="space-y-4">

                  <TrendingUp className="h-5 w-5 text-orange-500" />                <p className="text-gray-700">{analysis.roleAlignment.feedback}</p>

                  <span className="font-medium text-gray-900">Growth</span>                

                </div>                <div>

                <div className={`text-2xl font-bold ${getScoreColor(75)}`}>                  <h4 className="text-sm font-medium text-green-600 mb-2">Relevant Projects</h4>

                  75                  <ul className="space-y-1">

                </div>                    {analysis.roleAlignment.relevantProjects.map((project, index) => (

                <Progress value={75} className="h-2 mt-2" />                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">

              </CardContent>                        <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />

            </Card>                        {project}

          </div>                      </li>

                    ))}

          {/* Strengths and Weaknesses */}                  </ul>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">                </div>

            <Card className="bg-white border-gray-200">                

              <CardHeader>                <div>

                <CardTitle className="flex items-center gap-2 text-green-600">                  <h4 className="text-sm font-medium text-orange-600 mb-2">Missing Skills</h4>

                  <CheckCircle className="h-5 w-5" />                  <ul className="space-y-1">

                  Strengths                    {analysis.roleAlignment.missingSkills.map((skill, index) => (

                </CardTitle>                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">

              </CardHeader>                        <AlertTriangle className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />

              <CardContent>                        {skill}

                <div className="space-y-3">                      </li>

                  {(analysis.portfolioAnalysis?.strengths || []).map((strength, index) => (                    ))}

                    <div key={index} className="flex items-start gap-3">                  </ul>

                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>                </div>

                      <p className="text-gray-700">{strength}</p>              </CardContent>

                    </div>            </Card>

                  ))}          </div>

                </div>

              </CardContent>          {/* Action Buttons */}

            </Card>          <div className="text-center mt-12">

            <div className="flex flex-col sm:flex-row justify-center gap-4">

            <Card className="bg-white border-gray-200">              <Link href="/portfolio-review">

              <CardHeader>                <Button className="bg-blue-600 hover:bg-blue-500 px-8 py-3">

                <CardTitle className="flex items-center gap-2 text-orange-600">                  <RefreshCw className="mr-2 h-4 w-4" />

                  <AlertTriangle className="h-5 w-5" />                  Review Another Portfolio

                  Areas for Improvement                </Button>

                </CardTitle>              </Link>

              </CardHeader>              <Link href="/dashboard">

              <CardContent>                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3">

                <div className="space-y-3">                  <BarChart className="mr-2 h-4 w-4" />

                  {(analysis.portfolioAnalysis?.weaknesses || []).map((weakness, index) => (                  Back to Dashboard

                    <div key={index} className="flex items-start gap-3">                </Button>

                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>              </Link>

                      <p className="text-gray-700">{weakness}</p>            </div>

                    </div>          </div>

                  ))}        </div>

                </div>      </DashboardLayout>

              </CardContent>    </ProtectedRoute>

            </Card>  );rt { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

          </div>import { Badge } from '@/components/ui/badge';

import { Progress } from '@/components/ui/progress';

          {/* Recommendations */}import { 

          <Card className="bg-white border-gray-200 mb-8">  ArrowLeft,

            <CardHeader>  Star,

              <CardTitle className="flex items-center gap-2 text-blue-600">  Github,

                <Lightbulb className="h-5 w-5" />  ExternalLink,

                Recommendations  CheckCircle,

              </CardTitle>  AlertTriangle,

            </CardHeader>  Lightbulb,

            <CardContent>  Code2,

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">  Palette,

                {analysis.recommendations.map((recommendation, index) => (  Target,

                  <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">  TrendingUp,

                    <div className="flex items-start gap-3">  User,

                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">  LogOut,

                        {index + 1}  Copy,

                      </div>  Share2,

                      <p className="text-gray-700">{recommendation}</p>  Download,

                    </div>  RefreshCw,

                  </div>  BarChart

                ))}} from 'lucide-react';

              </div>import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

            </CardContent>import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

          </Card>import ProtectedRoute from '@/components/ProtectedRoute';

import { DashboardLayout } from '@/components/DashboardLayout';

          {/* Technical Skills and Role Alignment */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">interface PortfolioAnalysis {

            {/* Technical Skills */}  overallScore: number;

            <Card className="bg-white border-gray-200">  overallFeedback: string;

              <CardHeader>  strengths: string[];

                <CardTitle className="flex items-center gap-2">  weaknesses: string[];

                  <Code2 className="h-5 w-5 text-green-500" />  recommendations: string[];

                  Technical Skills Analysis  portfolioAnalysis: {

                </CardTitle>    designScore: number;

              </CardHeader>    designFeedback: string;

              <CardContent className="space-y-4">    contentScore: number;

                <p className="text-gray-700">{analysis.technicalSkills.feedback}</p>    contentFeedback: string;

                  };

                <div>  projectAnalysis: Array<{

                  <h4 className="text-sm font-medium text-green-600 mb-2">Technical Strengths</h4>    name: string;

                  <ul className="space-y-1">    score: number;

                    {analysis.technicalSkills.strengths.map((strength, index) => (    feedback: string;

                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">    techStack: string[];

                        <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />    highlights: string[];

                        {strength}    improvements: string[];

                      </li>  }>;

                    ))}  technicalSkills: {

                  </ul>    score: number;

                </div>    feedback: string;

                    strengths: string[];

                <div>    gaps: string[];

                  <h4 className="text-sm font-medium text-orange-600 mb-2">Skill Gaps</h4>  };

                  <ul className="space-y-1">  roleAlignment: {

                    {analysis.technicalSkills.gaps.map((gap, index) => (    score: number;

                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">    feedback: string;

                        <AlertTriangle className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />    missingSkills: string[];

                        {gap}    relevantProjects: string[];

                      </li>  };

                    ))}}

                  </ul>

                </div>interface GitHubRepo {

              </CardContent>  name: string;

            </Card>  description: string | null;

  language: string | null;

            {/* Role Alignment */}  stars: number;

            <Card className="bg-white border-gray-200">  forks: number;

              <CardHeader>  url: string;

                <CardTitle className="flex items-center gap-2">  topics: string[];

                  <Target className="h-5 w-5 text-purple-500" />}

                  Role Alignment Analysis

                </CardTitle>interface ResultsData {

              </CardHeader>  success: boolean;

              <CardContent className="space-y-4">  analysis: PortfolioAnalysis;

                <p className="text-gray-700">{analysis.roleAlignment.feedback}</p>  repos: GitHubRepo[];

                }

                <div>

                  <h4 className="text-sm font-medium text-green-600 mb-2">Relevant Projects</h4>export default function PortfolioResultsPage() {

                  <ul className="space-y-1">  const { data: session } = useSession();

                    {analysis.roleAlignment.relevantProjects.map((project, index) => (  const router = useRouter();

                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">  const [results, setResults] = useState<ResultsData | null>(null);

                        <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />  const [loading, setLoading] = useState(true);

                        {project}

                      </li>  useEffect(() => {

                    ))}    // Get results from sessionStorage

                  </ul>    const storedResults = sessionStorage.getItem('portfolioReviewResults');

                </div>    if (storedResults) {

                      try {

                <div>        const parsedResults = JSON.parse(storedResults);

                  <h4 className="text-sm font-medium text-orange-600 mb-2">Missing Skills</h4>        setResults(parsedResults);

                  <ul className="space-y-1">      } catch (error) {

                    {analysis.roleAlignment.missingSkills.map((skill, index) => (        console.error('Error parsing results:', error);

                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">        router.push('/portfolio-review');

                        <AlertTriangle className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />      }

                        {skill}    } else {

                      </li>      router.push('/portfolio-review');

                    ))}    }

                  </ul>    setLoading(false);

                </div>  }, [router]);

              </CardContent>

            </Card>  const getScoreColor = (score: number) => {

          </div>    if (score >= 90) return 'text-green-400';

    if (score >= 80) return 'text-cyan-400';

          {/* Action Buttons */}    if (score >= 70) return 'text-yellow-400';

          <div className="text-center mt-12">    if (score >= 60) return 'text-orange-400';

            <div className="flex flex-col sm:flex-row justify-center gap-4">    return 'text-red-400';

              <Link href="/portfolio-review">  };

                <Button className="bg-blue-600 hover:bg-blue-500 px-8 py-3">

                  <RefreshCw className="mr-2 h-4 w-4" />  const getScoreBackground = (score: number) => {

                  Review Another Portfolio    if (score >= 90) return 'from-green-500/20 to-green-600/10';

                </Button>    if (score >= 80) return 'from-cyan-500/20 to-cyan-600/10';

              </Link>    if (score >= 70) return 'from-yellow-500/20 to-yellow-600/10';

              <Link href="/dashboard">    if (score >= 60) return 'from-orange-500/20 to-orange-600/10';

                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3">    return 'from-red-500/20 to-red-600/10';

                  <BarChart className="mr-2 h-4 w-4" />  };

                  Back to Dashboard

                </Button>  if (loading) {

              </Link>    return (

            </div>      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center">

          </div>        <div className="text-white">Loading results...</div>

        </div>      </div>

      </DashboardLayout>    );

    </ProtectedRoute>  }

  );

}  if (!results) {
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
      <DashboardLayout>
        <div className="p-6 max-w-6xl mx-auto">
          {/* Header Card */}
          <Card className="bg-white border-gray-200 mb-6">
            <CardHeader className="text-center py-6">
              <CardTitle className="text-2xl text-gray-900">Portfolio Analysis Report</CardTitle>
              <div className="text-gray-600">
                Comprehensive review of your portfolio and projects
              </div>
            </CardHeader>
          </Card>

          {/* Score Card with Modern Design */}
          <Card className="bg-white border-gray-200 shadow-sm mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                {/* Overall Score with Circular Progress */}
                <div className="flex flex-col items-center bg-gray-50 rounded-2xl p-8 min-w-[200px] mx-auto md:mx-0">
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
                        className="text-gray-200"
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
                        className={analysis.overallScore >= 80 ? 'text-green-500' : analysis.overallScore >= 60 ? 'text-yellow-500' : 'text-red-500'}
                        strokeLinecap="round"
                        style={{
                          transition: 'all 0.3s ease'
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-3xl font-bold ${analysis.overallScore >= 80 ? 'text-green-500' : analysis.overallScore >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {analysis.overallScore}
                      </span>
                      <span className="text-sm text-gray-500 font-medium">/ 100</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Overall Score</h3>
                  <p className="text-sm text-gray-500 text-center">
                    {analysis.overallScore >= 80 ? 'Excellent Portfolio' : 
                     analysis.overallScore >= 60 ? 'Good Portfolio' : 'Needs Improvement'}
                  </p>
                </div>

                {/* Feedback Summary */}
                <div className="flex-1 bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Portfolio Summary</h3>
                  <p className="text-gray-700 leading-relaxed">{analysis.overallFeedback}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Palette className="h-5 w-5 text-blue-500" />
                  <span className="font-medium text-gray-900">Design</span>
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(analysis.portfolioAnalysis.designScore)}`}>
                  {analysis.portfolioAnalysis.designScore}
                </div>
                <Progress value={analysis.portfolioAnalysis.designScore} className="h-2 mt-2" />
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Code2 className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-gray-900">Technical Skills</span>
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(analysis.technicalSkills.score)}`}>
                  {analysis.technicalSkills.score}
                </div>
                <Progress value={analysis.technicalSkills.score} className="h-2 mt-2" />
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Target className="h-5 w-5 text-purple-500" />
                  <span className="font-medium text-gray-900">Role Alignment</span>
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(analysis.roleAlignment.score)}`}>
                  {analysis.roleAlignment.score}
                </div>
                <Progress value={analysis.roleAlignment.score} className="h-2 mt-2" />
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                  <span className="font-medium text-gray-900">Growth</span>
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(analysis.growthPotential?.score || 75)}`}>
                  {analysis.growthPotential?.score || 75}
                </div>
                <Progress value={analysis.growthPotential?.score || 75} className="h-2 mt-2" />
              </CardContent>
            </Card>
          </div>
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