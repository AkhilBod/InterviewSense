"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  GitBranch, 
  Star, 
  Eye, 
  FileText, 
  Globe, 
  CheckCircle2, 
  AlertTriangle,
  ArrowLeft,
  Github,
  ExternalLink,
  Code,
  Users,
  Zap,
  TrendingUp,
  Target,
  BookOpen,
  Lightbulb,
  Calendar,
  Award,
  Download,
  RefreshCw,
  GitFork,
  Code2,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { UserAccountDropdown } from '@/components/UserAccountDropdown';
import Image from 'next/image';

interface AnalysisResult {
  overallScore: number;
  scores: {
    codeQuality: number;
    projectDiversity: number;
    documentation: number;
    professionalPresentation: number;
    technicalSkills: number;
    contributionConsistency: number;
  };
  githubStats: {
    publicRepos: number;
    totalStars: number;
    followers: number;
    following: number;
    contributionStreak: number;
    topLanguages: Array<{
      language: string;
      count: number;
    }>;
  };
  insights: {
    strengths: string[];
    weaknesses: string[];
    recommendations: Array<{
      title: string;
      description: string;
      priority: 'High' | 'Medium' | 'Low';
    }>;
  };
}

export default function PortfolioReviewPage() {
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalysis = async () => {
    if (!githubUrl.trim()) {
      setError('Please enter a valid GitHub URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/portfolio-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          githubUrl: githubUrl.trim(),
          portfolioUrl: portfolioUrl.trim() || null,
          additionalInfo: additionalInfo.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed. Please try again.');
      }

      const result = await response.json();
      setAnalysisResult(result);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-500/20';
    if (score >= 60) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    }
  };

  const resetAnalysis = () => {
    setAnalysisResult(null);
    setGithubUrl('');
    setPortfolioUrl('');
    setAdditionalInfo('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-zinc-950/80 border-b border-zinc-800/50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="https://i.ibb.co/hNsCy7F/logo.webp" alt="InterviewSense" width={32} height={32} className="object-contain" />
            <span className="font-semibold text-white">InterviewSense</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <UserAccountDropdown />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-20 px-4 pb-8">
        <main className="max-w-6xl mx-auto">
          {!analysisResult ? (
            /* Input Form */
            <>
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2 mb-6">
                  <GitBranch className="h-5 w-5 text-cyan-400" />
                  <span className="text-sm text-cyan-300 font-medium">Portfolio Review</span>
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">
                  Optimize Your Developer Portfolio
                </h1>
                <p className="text-xl text-zinc-300 max-w-3xl mx-auto">
                  Get AI-powered feedback on your GitHub profile and portfolio to make a lasting impression on recruiters
                </p>
              </div>

              <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-2xl text-white flex items-center gap-2">
                    <Github className="h-6 w-6 text-cyan-400" />
                    Portfolio Analysis
                  </CardTitle>
                  <p className="text-zinc-400">
                    We'll analyze your GitHub profile, repositories, and portfolio to provide personalized feedback
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="github" className="text-zinc-200 mb-2 block">
                      GitHub Profile URL *
                    </Label>
                    <Input
                      id="github"
                      type="url"
                      placeholder="https://github.com/yourusername"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="bg-zinc-700/50 border-zinc-600 text-white placeholder:text-zinc-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="portfolio" className="text-zinc-200 mb-2 block">
                      Portfolio Website URL (Optional)
                    </Label>
                    <Input
                      id="portfolio"
                      type="url"
                      placeholder="https://yourportfolio.com"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      className="bg-zinc-700/50 border-zinc-600 text-white placeholder:text-zinc-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="info" className="text-zinc-200 mb-2 block">
                      Additional Information (Optional)
                    </Label>
                    <Textarea
                      id="info"
                      placeholder="Tell us about your career goals, target roles, or specific areas you'd like feedback on..."
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                      className="bg-zinc-700/50 border-zinc-600 text-white placeholder:text-zinc-400 min-h-[100px]"
                    />
                  </div>

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-center gap-2 text-red-400">
                        <AlertTriangle className="h-5 w-5" />
                        <span>{error}</span>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleAnalysis}
                    disabled={loading || !githubUrl.trim()}
                    className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing Portfolio...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Analyze Portfolio
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            /* Results Display */
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Portfolio Analysis Results</h1>
                  <p className="text-zinc-400">Comprehensive review of your developer portfolio</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={resetAnalysis}
                    variant="outline"
                    className="border-zinc-600 text-zinc-300"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    New Analysis
                  </Button>
                  <Button className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </div>

              {/* Overall Score */}
              <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm mb-8">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Overall Portfolio Score</h2>
                      <p className="text-zinc-400">Your portfolio's overall effectiveness and appeal to recruiters</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-5xl font-bold ${getScoreColor(analysisResult.overallScore)} mb-2`}>
                        {analysisResult.overallScore}%
                      </div>
                      <div className={`px-4 py-2 rounded-full text-sm ${getScoreBackground(analysisResult.overallScore)}`}>
                        {analysisResult.overallScore >= 80 ? 'Excellent' : 
                         analysisResult.overallScore >= 60 ? 'Good' : 'Needs Improvement'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Scores */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {Object.entries(analysisResult.scores).map(([key, score]) => (
                  <Card key={key} className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h3>
                        <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                          {score}%
                        </span>
                      </div>
                      <Progress 
                        value={score} 
                        className="h-2"
                        style={{
                          background: 'rgba(113, 113, 122, 0.3)'
                        }}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* GitHub Stats */}
              <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Github className="h-5 w-5 text-cyan-400" />
                    GitHub Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-cyan-400 mb-1">
                        {analysisResult.githubStats.publicRepos}
                      </div>
                      <div className="text-sm text-zinc-400">Public Repos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-400 mb-1">
                        {analysisResult.githubStats.totalStars}
                      </div>
                      <div className="text-sm text-zinc-400">Total Stars</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-400 mb-1">
                        {analysisResult.githubStats.followers}
                      </div>
                      <div className="text-sm text-zinc-400">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-400 mb-1">
                        {analysisResult.githubStats.contributionStreak}
                      </div>
                      <div className="text-sm text-zinc-400">Day Streak</div>
                    </div>
                  </div>

                  {/* Top Languages */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Top Programming Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.githubStats.topLanguages.map((lang, index) => (
                        <Badge key={index} variant="secondary" className="bg-zinc-700/50 text-zinc-300">
                          {lang.language} ({lang.count})
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Strengths */}
                <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {analysisResult.insights.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2 text-zinc-300">
                          <CheckCircle className="h-4 w-4 text-green-400 mt-1 flex-shrink-0" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Areas for Improvement */}
                <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <AlertCircle className="h-5 w-5 text-yellow-400" />
                      Areas for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {analysisResult.insights.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start gap-2 text-zinc-300">
                          <AlertTriangle className="h-4 w-4 text-yellow-400 mt-1 flex-shrink-0" />
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Lightbulb className="h-5 w-5 text-blue-400" />
                    Actionable Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysisResult.insights.recommendations.map((rec, index) => (
                      <div key={index} className="p-4 bg-zinc-700/30 rounded-lg border border-zinc-600/30">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-white">{rec.title}</h3>
                          <Badge className={`${getPriorityColor(rec.priority)} border`}>
                            {rec.priority} Priority
                          </Badge>
                        </div>
                        <p className="text-zinc-300">{rec.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
