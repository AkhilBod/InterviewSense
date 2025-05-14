"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Upload, FileText, AlertCircle, MessageSquare, User, LogOut, ChevronLeft, Download, Share2, RefreshCw, Printer, Brain } from "lucide-react";
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
import { useRouter } from 'next/navigation'; // <--- CHANGE THIS LINE
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ResumeAnalysisData {
  jobTitle: string;
  company?: string;
  overallScore: number;
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
        strengths: data.strengths || [],
        improvementAreas: data.areasForImprovement || [],
        analysis: data.analysis,
        fileType: data.stats.fileType || 'unknown',
        resumeLength: data.stats.resumeLength || undefined,
        keywordMatch: data.stats.keywordMatch || undefined,
        skillsCount: data.stats.skillsCount || undefined,
        atsCompatibility: data.stats.atsCompatibility || undefined,
      });
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
    // Optionally reset form fields here if desired, e.g., setResume(null); setJobTitle(""); etc.
  };

  // Helper functions for results display (copied from ResumeResultsPage)
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
      <div className="min-h-screen bg-zinc-900 text-white px-4 py-10 flex flex-col items-center">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-zinc-950/80 border-b border-zinc-800/50">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-blue-500" />
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

        <div className="w-full max-w-2xl mx-auto mt-16">
          {!showResults ? (
            // Resume Checker Form
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
          ) : (
            // Resume Analysis Results
            <div className="max-w-5xl mx-auto">
              <div className="mb-6">
                <Button variant="ghost" size="sm" onClick={handleBackToChecker} className="gap-2 text-slate-300 hover:text-white hover:bg-slate-800">
                  <ChevronLeft className="h-4 w-4" />
                  Back to Resume Checker
                </Button>
              </div>

              {resumeData && (
                <>
                  {/* Summary Card */}
                  <Card className="mb-8 bg-slate-800 border-slate-700 text-slate-100">
                    <CardHeader className="pb-4 border-b border-slate-700">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div>
                          <CardTitle className="text-2xl">Resume Analysis Report</CardTitle>
                          <CardDescription className="mt-1 text-slate-400">
                            For a {resumeData.jobTitle} position{resumeData.company ? ` at ${resumeData.company}` : ""} • {new Date().toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="mt-4 md:mt-0 flex flex-col items-center justify-center">
                          <div className={`text-3xl font-bold mb-1 ${getScoreColor(resumeData.overallScore)}`}>
                            {resumeData.overallScore}%
                          </div>
                          <div className="text-sm text-slate-400">Overall Score</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="py-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <h3 className="font-medium text-sm mb-2 text-slate-300">Key Strengths</h3>
                          <div className="flex flex-wrap gap-2">
                            {resumeData.strengths.length > 0 ? resumeData.strengths.map(strength => (
                              <Badge key={strength} className="bg-green-700 text-green-100 hover:bg-green-600">
                                {strength}
                              </Badge>
                            )) : <p className="text-zinc-400 text-sm">No specific strengths identified.</p>}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-medium text-sm mb-2 text-slate-300">Areas for Improvement</h3>
                          <div className="flex flex-wrap gap-2">
                            {resumeData.improvementAreas.length > 0 ? resumeData.improvementAreas.map(area => (
                              <Badge key={area} className="bg-yellow-700 text-yellow-100 hover:bg-yellow-600">
                                {area}
                              </Badge>
                            )) : <p className="text-zinc-400 text-sm">No specific areas for improvement identified.</p>}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-medium text-sm mb-2 text-slate-300">Resume Stats</h3>
                          <div className="text-sm space-y-1 text-slate-300">
                            <div className="flex justify-between">
                              <span>File Type:</span>
                              <span className="font-medium text-white">{resumeData.fileType.split('/')[1] || resumeData.fileType}</span>
                            </div>
                            {resumeData.resumeLength && (
                              <div className="flex justify-between">
                                <span>Estimated Pages:</span>
                                <span className="font-medium text-white">{resumeData.resumeLength}</span>
                              </div>
                            )}
                            {resumeData.keywordMatch !== undefined && (
                              <div className="flex justify-between">
                                <span>Keyword Match:</span>
                                <span className="font-medium text-white">{resumeData.keywordMatch}%</span>
                              </div>
                            )}
                            {resumeData.skillsCount !== undefined && (
                              <div className="flex justify-between">
                                <span>Skills Identified:</span>
                                <span className="font-medium text-white">{resumeData.skillsCount}</span>
                              </div>
                            )}
                            {resumeData.atsCompatibility && (
                              <div className="flex justify-between">
                                <span>ATS Compatibility:</span>
                                <Badge className={`${getAtsBadgeColor(resumeData.atsCompatibility)} text-xs`}>
                                  {resumeData.atsCompatibility}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <div className="flex flex-wrap gap-2 w-full justify-center md:justify-end">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800"
                          onClick={() => {
                            if (resumeData) {
                              // Create a text blob with the report data
                              const reportContent = `
# Resume Analysis Report for ${resumeData.jobTitle} position
Date: ${new Date().toLocaleDateString()}
Overall Score: ${resumeData.overallScore}%

## Key Strengths
${resumeData.strengths.map(s => `- ${s}`).join('\n')}

## Areas for Improvement
${resumeData.improvementAreas.map(a => `- ${a}`).join('\n')}

## Full Analysis
${resumeData.analysis}
                              `.trim();
                              
                              const blob = new Blob([reportContent], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `ResumeAnalysis-${new Date().toISOString().slice(0, 10)}.txt`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              URL.revokeObjectURL(url);
                            }
                          }}
                        >
                          <Download className="h-4 w-4" /> Download Report
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800"
                          onClick={() => {
                            window.print();
                          }}
                        >
                          <Printer className="h-4 w-4" /> Print
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800"
                          onClick={() => {
                            if (navigator.share && resumeData) {
                              navigator.share({
                                title: `Resume Analysis for ${resumeData.jobTitle} position`,
                                text: `Check out my resume analysis from InterviewSense: Score ${resumeData.overallScore}%`,
                                url: window.location.href
                              }).catch(err => {
                                console.error('Error sharing:', err);
                                alert('Sharing failed. You can manually copy the URL and share it.');
                              });
                            } else {
                              navigator.clipboard.writeText(window.location.href)
                                .then(() => alert('Report link copied to clipboard!'))
                                .catch(err => console.error('Failed to copy:', err));
                            }
                          }}
                        >
                          <Share2 className="h-4 w-4" /> Share
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>

                  {/* AI Coach Feedback */}
                  <Card className="mb-8 bg-slate-800 border-slate-700 text-slate-100">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src="/avatar.png" />
                          <AvatarFallback className="bg-blue-700 text-white">AI</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">AI Reviewer Feedback</CardTitle>
                          <CardDescription className="text-slate-400">
                            Personalized advice to optimize your resume
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 text-slate-300">
                        {parseAnalysisContent(resumeData.analysis)}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800"
                        onClick={handleBackToChecker}
                      >
                        <RefreshCw className="h-4 w-4" />
                        Re-analyze Resume
                      </Button>
                    </CardFooter>
                  </Card>

                  {/* Next Steps */}
                  <Card className="bg-slate-800 border-slate-700 text-slate-100">
                    <CardHeader>
                      <CardTitle className="text-lg">What's Next?</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center">
                        <Button variant="outline" className="h-auto py-6 px-8 w-full flex flex-col border-slate-700 text-slate-300 hover:bg-slate-800" onClick={handleBackToChecker}>
                          <RefreshCw className="h-6 w-6 mb-2" />
                          <span className="text-base font-medium">Refine Resume</span>
                          <span className="text-xs text-slate-400 mt-1">Make edits and get new feedback</span>
                        </Button>

                        <Button variant="outline" className="h-auto py-6 px-8 w-full flex flex-col border-slate-700 text-slate-300 hover:bg-slate-800" asChild>
                          <Link href="/interview">
                            <MessageSquare className="h-6 w-6 mb-2" />
                            <span className="text-base font-medium">Practice Interview</span>
                            <span className="text-xs text-slate-400 mt-1">Prepare for your next interview</span>
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}
        </div>

        <footer className="py-6 border-t border-zinc-800 bg-zinc-900 mt-auto w-full">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center">
              <p className="text-sm text-zinc-500">© {new Date().getFullYear()} InterviewSense. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
}