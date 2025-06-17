"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Upload, FileText, AlertCircle, MessageSquare, User, LogOut, ChevronLeft, Download, Share2, RefreshCw, Printer, CheckCircle, Brain, Target } from "lucide-react";
import Image from 'next/image';
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import ResumeWordAnalysis from '@/components/ResumeWordAnalysis';
import HighlightablePDFViewer from '@/components/HighlightablePDFViewer';
import { WordImprovementSuggestion, WordAnalysisData } from '@/types/resume';

interface ResumeAnalysisData {
  jobTitle: string;
  company?: string;
  overallScore: number;
  impactScore: number;
  styleScore: number;
  skillsScore: number;
  strengths: string[];
  improvementAreas: string[];
  analysis: string; // Full markdown analysis text
  fileType: string;
  resumeLength?: number; // Estimated pages
  keywordMatch?: number; // Percentage
  skillsCount?: number; // Number of strengths
  atsCompatibility?: string; // "Good", "Needs Improvement", "Optimized", "Unknown"
}

export default function ResumeCheckerPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // Form State
  const [resume, setResume] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Results State
  const [showResults, setShowResults] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeAnalysisData | null>(null);
  
  // Word Analysis State
  const [showWordAnalysis, setShowWordAnalysis] = useState(false);
  const [wordAnalysisData, setWordAnalysisData] = useState<WordAnalysisData | null>(null);
  const [isWordAnalysisLoading, setIsWordAnalysisLoading] = useState(false);
  
  // PDF Highlighting State
  const [showPDFHighlights, setShowPDFHighlights] = useState(false);

  // Removed specific analysis - it was redundant with word analysis

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setResume(selectedFile);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setShowResults(false); // Ensure results are hidden while processing

    if (!resume || !jobTitle) {
      setError("Please upload a resume and provide a job title.");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("jobTitle", jobTitle);

    if (company) {
      formData.append("company", company);
    }

    if (jobDescription) {
      formData.append("jobDescription", jobDescription);
    }

    try {
      const response = await fetch("/api/resume-check", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze resume. Please try again.");
      }

      setResumeData({
        jobTitle: jobTitle,
        company: company || undefined,
        overallScore: data.score,
        impactScore: data.impactScore || 75,
        styleScore: data.styleScore || 80,
        skillsScore: data.skillsScore || 85,
        strengths: data.strengths || [],
        improvementAreas: data.areasForImprovement || [],
        analysis: data.analysis,
        fileType: data.stats.fileType || 'unknown',
        resumeLength: data.stats.resumeLength || undefined,
        keywordMatch: data.stats.keywordMatch || undefined,
        skillsCount: data.stats.skillsCount || undefined,
        atsCompatibility: data.stats.atsCompatibility || undefined,
      });
      
      // Automatically process word analysis if available
      if (data.wordAnalysis) {
        console.log("Word analysis received automatically:", data.wordAnalysis);
        setWordAnalysisData(data.wordAnalysis);
        setShowWordAnalysis(true);
        setShowPDFHighlights(true);
      }
      
      setShowResults(true); // Show results after successful analysis
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToChecker = () => {
    setShowResults(false);
    setResumeData(null); // Clear previous results
    setError(null); // Clear any previous errors
    setShowWordAnalysis(false);
    setWordAnalysisData(null);
    setShowPDFHighlights(false);
    // Keep resume file for preview - don't clear it
  };

  // Helper functions for results display (copied from ResumeResultsPage)
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

  const getAtsBadgeColor = (ats: string | undefined) => {
    switch (ats) {
      case 'Optimized': return 'bg-green-700 text-green-100';
      case 'Good': return 'bg-blue-700 text-blue-100';
      case 'Needs Improvement': return 'bg-yellow-700 text-yellow-100';
      default: return 'bg-gray-700 text-gray-100';
    }
  };

  const parseAnalysisContent = (analysisText: string) => {
    const sections = analysisText.split('\n\n');
    const parsedElements: JSX.Element[] = [];

    sections.forEach((section, index) => {
      if (section.startsWith('## ')) {
        parsedElements.push(
          <h3 key={index} className="font-semibold text-white text-lg mb-2 mt-4">
            {section.substring(3).trim()}
          </h3>
        );
      } else if (section.startsWith('# ')) {
        parsedElements.push(
          <h2 key={index} className="text-xl font-bold text-blue-400 mt-6 mb-3">
            {section.substring(2).trim()}
          </h2>
        );
      } else if (section.startsWith('- ') || section.startsWith('* ')) {
        const listItems = section.split('\n').map((item, itemIndex) => (
          <li key={`${index}-${itemIndex}`} className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            <p className="text-zinc-300 flex-1">{item.substring(2).trim()}</p>
          </li>
        ));
        parsedElements.push(<ul key={index} className="list-none pl-0 space-y-1">{listItems}</ul>);
      } else {
        parsedElements.push(
          <p key={index} className="text-zinc-300 leading-relaxed mt-2">
            {section.trim()}
          </p>
        );
      }
    });
    return parsedElements;
  };

  if (!session) {
    return (
      <div className="flex min-h-screen bg-zinc-900 text-white items-center justify-center">
        <p>Please log in to access the resume checker.</p>
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
          {!showResults ? (
            // Resume Checker Form - Centered
            <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
              <div className="w-full max-w-2xl">
                <Card className="bg-zinc-800/50 border-zinc-700/50 shadow-xl">
                  <CardHeader className="text-center pt-8">
                    <CardTitle className="text-2xl font-bold">Resume Checker</CardTitle>
                    <p className="text-zinc-400 mt-2 text-base">
                      Upload your resume and get instant AI-powered feedback and suggestions.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6 px-8 pb-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Upload Resume (PDF, DOC, DOCX)
                        </label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="bg-zinc-800/50 hover:bg-zinc-700/50 border-zinc-700/50 text-zinc-300"
                            onClick={() =>
                              document.getElementById("resume-upload")?.click()
                            }
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {resume ? "Change File" : "Upload Resume"}
                          </Button>
                          <input
                            id="resume-upload"
                            name="resume"
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.txt,text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleResumeChange}
                          />
                          {resume && (
                            <span className="text-sm text-zinc-400 flex items-center">
                              <FileText className="h-3 w-3 mr-1" />
                              {resume.name.length > 20
                                ? `${resume.name.substring(0, 20)}...`
                                : resume.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Target Job Title <span className="text-red-500">*</span>
                        </label>
                        <Input
                          placeholder="e.g. Software Engineer"
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Target Company (Optional)
                        </label>
                        <Input
                          placeholder="e.g. Google, Amazon"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Job Description (Optional)
                        </label>
                        <Textarea
                          placeholder="Paste the job description here for more personalized feedback..."
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>

                      {error && (
                        <div className="rounded-lg bg-red-900/30 border border-red-800 text-red-200 p-3 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 flex-shrink-0" />
                          <div className="text-sm">{error}</div>
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-full py-6"
                        size="lg"
                        disabled={isLoading || !resume || !jobTitle}
                      >
                        {isLoading ? "Analyzing..." : "Check Resume"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            // Resume Analysis Results - Full Width Layout
            <div className="w-full">
              {/* Header with Back Button and Analysis Buttons */}
              <div className="mb-8 px-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <Button variant="ghost" size="sm" onClick={handleBackToChecker} className="gap-2 text-slate-300 hover:text-white hover:bg-slate-800">
                    <ChevronLeft className="h-4 w-4" />
                    Back to Resume Checker
                  </Button>
                  
                  {/* Analysis Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    {/* Remove the separate word analysis button - it's now automatic */}
                  </div>
                </div>
              </div>

              {resumeData && (
                <>
                  {/* Optimized Layout - Balanced proportions */}
                  <div className="grid grid-cols-1 lg:grid-cols-9 gap-8 px-4 max-w-[1900px] mx-auto">
                    {/* Left Column - Analysis Results (Full width on mobile, 55% on desktop) */}
                    <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">
                      {/* Header */}
                      <Card className="bg-slate-800 border-slate-700 text-slate-100">
                        <CardHeader className="text-center py-8">
                          <CardTitle className="text-3xl">Resume Analysis Report</CardTitle>
                          <CardDescription className="text-slate-400 text-lg">
                            For a {resumeData.jobTitle} position{resumeData.company ? ` at ${resumeData.company}` : ""} • {new Date().toLocaleDateString()}
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
                                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - resumeData.overallScore / 100)}`}
                                    className={getScoreColor(resumeData.overallScore).replace('text-', 'text-')}
                                    strokeLinecap="round"
                                    style={{
                                      filter: 'drop-shadow(0 0 8px currentColor)',
                                      transition: 'all 0.3s ease'
                                    }}
                                  />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <span className={`text-2xl sm:text-3xl font-bold ${getScoreColor(resumeData.overallScore)}`}>
                                    {resumeData.overallScore}
                                  </span>
                                  <span className="text-xs sm:text-sm text-slate-400 font-medium">/ 100</span>
                                </div>
                              </div>
                              <div className="text-sm sm:text-base font-semibold text-slate-300 tracking-wider">OVERALL</div>
                            </div>

                            {/* Individual Scores */}
                            <div className="flex-1 md:ml-10">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                                {/* Impact Score */}
                                <div className="text-center bg-slate-700/20 rounded-xl p-4 sm:p-6 border border-slate-600/30 hover:bg-slate-700/30 transition-all duration-300">
                                  <div className="text-sm sm:text-base font-bold text-slate-300 mb-2 sm:mb-3 tracking-wider">IMPACT</div>
                                  <div className={`text-2xl sm:text-3xl font-bold ${getScoreColor(resumeData.impactScore)} mb-1 sm:mb-2`}>
                                    {resumeData.impactScore}
                                  </div>
                                  <div className="text-xs sm:text-sm text-slate-400 font-medium">/ 100</div>
                                  <div className="mt-3 sm:mt-4 w-full bg-slate-600/30 rounded-full h-2 sm:h-3">
                                    <div 
                                      className={`h-2 sm:h-3 rounded-full transition-all duration-500 ${getBarColor(resumeData.impactScore)}`}
                                      style={{ width: `${resumeData.impactScore}%` }}
                                    ></div>
                                  </div>
                                </div>

                                {/* Style Score */}
                                <div className="text-center bg-slate-700/20 rounded-xl p-4 sm:p-6 border border-slate-600/30 hover:bg-slate-700/30 transition-all duration-300">
                                  <div className="text-sm sm:text-base font-bold text-slate-300 mb-2 sm:mb-3 tracking-wider">STYLE</div>
                                  <div className={`text-2xl sm:text-3xl font-bold ${getScoreColor(resumeData.styleScore)} mb-1 sm:mb-2`}>
                                    {resumeData.styleScore}
                                  </div>
                                  <div className="text-xs sm:text-sm text-slate-400 font-medium">/ 100</div>
                                  <div className="mt-3 sm:mt-4 w-full bg-slate-600/30 rounded-full h-2 sm:h-3">
                                    <div 
                                      className={`h-2 sm:h-3 rounded-full transition-all duration-500 ${getBarColor(resumeData.styleScore)}`}
                                      style={{ width: `${resumeData.styleScore}%` }}
                                    ></div>
                                  </div>
                                </div>

                                {/* Skills Score */}
                                <div className="text-center bg-slate-700/20 rounded-xl p-4 sm:p-6 border border-slate-600/30 hover:bg-slate-700/30 transition-all duration-300">
                                  <div className="text-sm sm:text-base font-bold text-slate-300 mb-2 sm:mb-3 tracking-wider">SKILLS</div>
                                  <div className={`text-2xl sm:text-3xl font-bold ${getScoreColor(resumeData.skillsScore)} mb-1 sm:mb-2`}>
                                    {resumeData.skillsScore}
                                  </div>
                                  <div className="text-xs sm:text-sm text-slate-400 font-medium">/ 100</div>
                                  <div className="mt-3 sm:mt-4 w-full bg-slate-600/30 rounded-full h-2 sm:h-3">
                                    <div 
                                      className={`h-2 sm:h-3 rounded-full transition-all duration-500 ${getBarColor(resumeData.skillsScore)}`}
                                      style={{ width: `${resumeData.skillsScore}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Resume Stats */}
                      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-slate-100 shadow-xl">
                        <CardHeader className="p-8">
                          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Resume Analytics</CardTitle>
                          <CardDescription className="text-slate-400 text-lg">
                            Comprehensive analysis of your resume performance
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
                              <div className={`text-4xl font-black ${getScoreColor(resumeData.overallScore)} mb-2`}>
                                {resumeData.overallScore >= 80 ? 'B' : resumeData.overallScore >= 70 ? 'B' : resumeData.overallScore >= 60 ? 'C' : 'D'}
                              </div>
                              <div className="text-slate-400">
                                {resumeData.overallScore >= 70 ? 'Good' : resumeData.overallScore >= 60 ? 'Average' : 'Needs Work'}
                              </div>
                            </div>

                            {/* ATS Ready */}
                            <div className="bg-slate-700/40 rounded-2xl p-6 border border-slate-600/50 hover:border-slate-500/70 transition-all duration-300 hover:shadow-xl group">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <div className="text-xs font-bold text-slate-400 tracking-widest">ATS READY</div>
                              </div>
                              <div className="text-4xl mb-2">
                                {resumeData.atsCompatibility === 'Excellent' ? '✓' : resumeData.atsCompatibility === 'Good' ? '✓' : '✗'}
                              </div>
                              <div className="text-slate-400">
                                {resumeData.atsCompatibility === 'Excellent' ? 'Excellent' : resumeData.atsCompatibility === 'Good' ? 'Excellent' : 'Needs Work'}
                              </div>
                            </div>

                            {/* Readability */}
                            <div className="bg-slate-700/40 rounded-2xl p-6 border border-slate-600/50 hover:border-slate-500/70 transition-all duration-300 hover:shadow-xl group">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <div className="text-xs font-bold text-slate-400 tracking-widest">READABILITY</div>
                              </div>
                              <div className={`text-4xl font-black text-green-400 mb-2`}>
                                85
                              </div>
                              <div className="text-slate-400">Style Score</div>
                            </div>

                            {/* Technical Details */}
                            <div className="bg-slate-700/40 rounded-2xl p-6 border border-slate-600/50 hover:border-slate-500/70 transition-all duration-300 hover:shadow-xl group">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="text-xs font-bold text-slate-400 tracking-widest">TECHNICAL DETAILS</div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="text-center">
                                  <div className="bg-slate-600 text-white px-3 py-2 rounded-lg text-lg font-bold mb-1">
                                    {resumeData.resumeLength || 1}
                                  </div>
                                  <div className="text-slate-400 text-xs uppercase tracking-wide">Pages</div>
                                </div>
                                <div className="text-center">
                                  <div className="bg-slate-600 text-white px-3 py-2 rounded-lg text-lg font-bold mb-1">
                                    {resumeData.skillsCount || 0}
                                  </div>
                                  <div className="text-slate-400 text-xs uppercase tracking-wide">Skills</div>
                                </div>
                                <div className="text-center">
                                  <div className="bg-slate-600 text-white px-3 py-2 rounded-lg text-lg font-bold mb-1">
                                    {resumeData.strengths.length}
                                  </div>
                                  <div className="text-slate-400 text-xs uppercase tracking-wide">Strengths</div>
                                </div>
                                <div className="text-center">
                                  <div className="bg-slate-600 text-white px-3 py-2 rounded-lg text-lg font-bold mb-1">
                                    {resumeData.improvementAreas.length}
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
                          {resumeData.strengths.length > 0 ? resumeData.strengths.map((strength, index) => (
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
                            <AlertCircle className="h-6 w-6 text-yellow-400" />
                          </div>
                          <span className="text-white">Areas for Improvement</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {resumeData.improvementAreas.length > 0 ? resumeData.improvementAreas.map((area, index) => (
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
                                <AlertCircle className="h-8 w-8 text-slate-500" />
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
                          Continue your career journey
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <h4 className="text-sm font-semibold text-slate-300 mb-4 tracking-wider">NEXT STEPS</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Button 
                            variant="outline" 
                            className="h-auto py-4 md:py-6 px-4 md:px-6 flex items-center gap-3 md:gap-4 border-slate-600 bg-slate-700/30 text-slate-300 hover:bg-slate-600 hover:text-white transition-all duration-300 hover:shadow-lg justify-start group" 
                            onClick={handleBackToChecker}
                          >
                            <div className="w-10 md:w-12 h-10 md:h-12 rounded-full flex items-center justify-center transition-colors">
                              <RefreshCw className="h-5 md:h-6 w-5 md:w-6 text-slate-400" />
                            </div>
                            <div className="text-left">
                              <div className="font-semibold text-sm md:text-base">Refine Resume</div>
                              <div className="text-xs md:text-sm text-slate-400 group-hover:text-slate-300 hidden md:block">Make edits and get new feedback</div>
                            </div>
                          </Button>

                          <Button 
                            variant="outline" 
                            className="h-auto py-4 md:py-6 px-4 md:px-6 flex items-center gap-3 md:gap-4 border-slate-600 bg-slate-700/30 text-slate-300 hover:bg-slate-600 hover:text-white transition-all duration-300 hover:shadow-lg justify-start group" 
                            asChild
                          >
                            <Link href="/behavioral-interview">
                              <div className="w-10 md:w-12 h-10 md:h-12 rounded-full flex items-center justify-center transition-colors">
                                <MessageSquare className="h-5 md:h-6 w-5 md:w-6 text-slate-400" />
                              </div>
                              <div className="text-left">
                                <div className="font-semibold text-sm md:text-base">Practice Interview</div>
                                <div className="text-xs md:text-sm text-slate-400 group-hover:text-slate-300 hidden md:block">Prepare for your next interview</div>
                              </div>
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    </div>

                    {/* Right Column - Resume Viewer (44% width) - Hidden on mobile */}
                    <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-6 lg:h-fit order-1 lg:order-2">
                      <Card className="bg-slate-800 border-slate-700 text-slate-100 h-full min-h-[85vh]">
                        <CardHeader className="pb-6">
                          <CardTitle className="text-2xl font-semibold flex items-center gap-3">
                            <FileText className="h-7 w-7 text-blue-400" />
                            Resume Preview
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          {resume && (
                            <>
                              {resume.type === 'application/pdf' ? (
                                <HighlightablePDFViewer
                                  file={resume}
                                  wordImprovements={wordAnalysisData?.wordImprovements || []}
                                  showHighlights={showPDFHighlights}
                                  onHighlightClick={(improvement) => {
                                    // You could add a toast or modal here to show improvement details
                                    console.log('Clicked improvement:', improvement);
                                  }}
                                />
                              ) : (
                                <div className="p-8 bg-white text-gray-800 h-[65vh] lg:h-[65vh] xl:h-[70vh] overflow-y-auto">
                                  <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                      <FileText className="h-24 w-24 text-gray-400 mx-auto mb-8" />
                                      <p className="text-gray-600 font-medium mb-4 text-xl">{resume.name}</p>
                                      <p className="text-gray-500 text-lg">File type: {resume.type}</p>
                                      <p className="text-gray-500 text-lg">Size: {Math.round(resume.size / 1024)} KB</p>
                                      <p className="text-gray-500 text-base mt-6">Preview not available for this file type</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </>
              )}

              {/* Error Display for Analysis */}
              {error && error.includes('word analysis') && (
                <div className="px-4 max-w-[1900px] mx-auto">
                  <Card className="border-red-500 bg-red-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Word Analysis Section */}
              {showWordAnalysis && wordAnalysisData && (
                <div className="px-4 max-w-[1900px] mx-auto mt-8">
                  <ResumeWordAnalysis 
                    analysis={wordAnalysisData}
                    fileName={resume?.name || "Resume"}
                    jobTitle={jobTitle}
                    company={company}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}