"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Upload, FileText, AlertCircle, MessageSquare, ChevronLeft, RefreshCw, CheckCircle, Brain } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';
import ResumeWordAnalysis from '@/components/ResumeWordAnalysis';
import PDFHighlightViewer from '@/components/PDFHighlightViewer';
import ResumeAnalysisLoadingModal from '@/components/ResumeAnalysisLoadingModal';
import { WordAnalysisData, ResumeHighlight } from '@/types/resume';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PrefilledChip } from '@/components/ProfileFormComponents';
import { useProfileData } from '@/hooks/useProfileData';

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Inter:wght@400;500;600&display=swap');
  body::after {
    content: '';
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80vw;
    height: 340px;
    background: radial-gradient(ellipse at bottom center, rgba(37,99,235,0.13) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }
`;

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  padding: '12px 14px',
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.88rem',
  color: '#dde2f0',
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.68rem',
  fontWeight: 600,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#8892b0',
  marginBottom: 7,
};

interface ResumeAnalysisData {
  jobTitle: string;
  company?: string;
  overallScore: number;
  impactScore: number;
  styleScore: number;
  skillsScore: number;
  strengths: string[];
  improvementAreas: string[];
  analysis: string;
  fileType: string;
  resumeLength?: number;
  keywordMatch?: number;
  skillsCount?: number;
  atsCompatibility?: string;
}

export default function ResumeCheckerPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfileData();

  // Form state
  const [resume, setResume] = useState<File | null>(null);
  const [overridingResume, setOverridingResume] = useState(false);
  const [overridingCompany, setOverridingCompany] = useState(false);
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Results state
  const [showResults, setShowResults] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeAnalysisData | null>(null);

  // Word Analysis State
  const [showWordAnalysis, setShowWordAnalysis] = useState(false);
  const [wordAnalysisData, setWordAnalysisData] = useState<WordAnalysisData | null>(null);
  const [isWordAnalysisLoading, setIsWordAnalysisLoading] = useState(false);

  // Highlight State
  const [highlights, setHighlights] = useState<ResumeHighlight[]>([]);
  const [showPDFHighlights, setShowPDFHighlights] = useState(false);
  // The resolved file used for the preview panel (local upload OR fetched from saved URL)
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  // Pre-fill company from profile
  useEffect(() => {
    if (profile?.targetCompany) {
      setCompany(profile.targetCompany);
    }
  }, [profile]);

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setResume(selectedFile);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setShowResults(false);

    const jobTitle = profile?.targetRole || 'Software Engineer';

    // Resolve resume: use uploaded file, or fetch from profile URL
    let resolvedResume: File | null = resume;
    if (!resolvedResume && profile?.resumeUrl) {
      try {
        const resp = await fetch(profile.resumeUrl);
        const blob = await resp.blob();
        const filename = profile.resumeFilename || 'resume.pdf';
        resolvedResume = new File([blob], filename, { type: blob.type });
      } catch {
        setError("Could not load your saved resume. Please upload it manually.");
        setIsLoading(false);
        return;
      }
    }

    if (!resolvedResume) {
      setError("Please upload a resume.");
      setIsLoading(false);
      return;
    }

    // Store the resolved file so the preview panel always has something to render
    setPreviewFile(resolvedResume);

    const formData = new FormData();
    formData.append("resume", resolvedResume);
    formData.append("jobTitle", jobTitle);
    if (company) formData.append("company", company);
    if (jobDescription) formData.append("jobDescription", jobDescription);

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
        jobTitle,
        company: company || undefined,
        overallScore: data.score,
        impactScore: data.impactScore ?? data.score,
        styleScore: data.styleScore ?? data.score,
        skillsScore: data.skillsScore ?? data.score,
        strengths: data.strengths || [],
        improvementAreas: data.areasForImprovement || [],
        analysis: data.analysis,
        fileType: data.stats.fileType || 'unknown',
        resumeLength: data.stats.resumeLength || undefined,
        keywordMatch: data.stats.keywordMatch || undefined,
        skillsCount: data.stats.skillsCount || undefined,
        atsCompatibility: data.stats.atsCompatibility || undefined,
      });

      if (data.wordAnalysis) {
        setWordAnalysisData(data.wordAnalysis);
        setShowWordAnalysis(true);
        if (data.wordAnalysis.highlights) {
          setHighlights(data.wordAnalysis.highlights);
          setShowPDFHighlights(true);
        }
      }

      setShowResults(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToChecker = () => {
    setShowResults(false);
    setResumeData(null);
    setError(null);
    setShowWordAnalysis(false);
    setWordAnalysisData(null);
    setShowPDFHighlights(false);
    setHighlights([]);
    setPreviewFile(null);
  };

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
      <div className="flex min-h-screen bg-[#0a0f1e] text-white items-center justify-center">
        <p>Please log in to access the resume checker.</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <style>{pageStyles}</style>
        <div className="h-screen overflow-y-auto">
          {!showResults ? (
            <div style={{
              minHeight: 'calc(100vh - 64px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '52px 24px',
              position: 'relative',
              zIndex: 1,
            }}>
              <div style={{ width: '100%', maxWidth: 560 }}>
                <h1 style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontWeight: 400,
                  fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
                  color: '#dde2f0',
                  marginBottom: 8,
                  marginTop: 0,
                }}>
                  Resume Review
                </h1>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.88rem',
                  color: '#5a6380',
                  marginBottom: 36,
                  marginTop: 0,
                }}>
                  AI feedback to help your resume land interviews.
                </p>

                <form onSubmit={handleSubmit}>
                  {/* Resume */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Resume</label>
                    {profile?.resumeFilename && !overridingResume ? (
                      <PrefilledChip
                        label="From profile"
                        value={profile.resumeFilename}
                        onChangeRequest={() => setOverridingResume(true)}
                      />
                    ) : (
                      <div>
                        <button
                          type="button"
                          onClick={() => document.getElementById("resume-upload")?.click()}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            background: resume ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.04)',
                            border: resume ? '1px solid rgba(59,130,246,0.5)' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 10,
                            padding: '12px 14px',
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '0.88rem',
                            color: resume ? '#93c5fd' : '#5a6380',
                            cursor: 'pointer',
                            transition: 'border-color 0.15s',
                          }}
                        >
                          {resume ? (
                            <>
                              <FileText size={15} />
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {resume.name.length > 35 ? `${resume.name.substring(0, 35)}…` : resume.name}
                              </span>
                            </>
                          ) : (
                            <>
                              <Upload size={15} />
                              <span>Upload Resume</span>
                            </>
                          )}
                        </button>
                        <input
                          id="resume-upload"
                          name="resume"
                          type="file"
                          style={{ display: 'none' }}
                          accept=".pdf,.doc,.docx,.txt,text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={handleResumeChange}
                        />
                      </div>
                    )}
                  </div>

                  {/* Company */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>
                      Company <span style={{ color: '#4a5370', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                    </label>
                    {profile?.targetCompany && !overridingCompany ? (
                      <PrefilledChip
                        label="From profile"
                        value={profile.targetCompany}
                        onChangeRequest={() => setOverridingCompany(true)}
                      />
                    ) : (
                      <input
                        type="text"
                        placeholder="e.g., Google, Meta, Apple"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        style={inputStyle}
                        onFocus={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
                        onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                      />
                    )}
                  </div>

                  {/* Job Description */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>
                      Job Description <span style={{ color: '#4a5370', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                    </label>
                    <textarea
                      placeholder="Paste the job description here for more targeted analysis…"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      rows={5}
                      style={{
                        ...inputStyle,
                        resize: 'vertical',
                        minHeight: 120,
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                  </div>

                  {error && (
                    <div style={{
                      borderRadius: 8,
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.25)',
                      color: '#fca5a5',
                      padding: '10px 14px',
                      fontSize: '0.82rem',
                      fontFamily: "'Inter', sans-serif",
                      marginBottom: 16,
                    }}>
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || (!resume && !profile?.resumeUrl)}
                    style={{
                      width: '100%',
                      marginTop: 32,
                      padding: 14,
                      background: 'linear-gradient(135deg, #1d4ed8, #4338ca)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 10,
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.88rem',
                      fontWeight: 500,
                      cursor: (isLoading || (!resume && !profile?.resumeUrl)) ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 20px rgba(37,99,235,0.3)',
                      opacity: (isLoading || (!resume && !profile?.resumeUrl)) ? 0.5 : 1,
                      transition: 'opacity 0.2s, transform 0.15s',
                    }}
                    onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = (isLoading || (!resume && !profile?.resumeUrl)) ? '0.5' : '1'; e.currentTarget.style.transform = 'none'; }}
                  >
                    {isLoading ? 'Analyzing Resume…' : 'Analyze Resume'}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            // Resume Analysis Results - Full Width Layout
            <div className="w-full px-4 py-8">
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
                          <CardTitle className="text-2xl font-bold text-white">Resume Analytics</CardTitle>
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
                      <Card className="bg-slate-800 border-slate-700 text-slate-100 flex flex-col min-h-[85vh]">
                        <CardHeader className="pb-6 flex-shrink-0">
                          <CardTitle className="text-2xl font-semibold flex items-center gap-3">
                            <FileText className="h-7 w-7 text-blue-400" />
                            Resume Preview
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 min-h-0 flex flex-col">
                          {previewFile && (
                            <>
                              {previewFile.type === 'application/pdf' ? (
                                <PDFHighlightViewer
                                  file={previewFile}
                                  highlights={highlights}
                                />
                              ) : (
                                <div className="p-8 bg-[#111827] text-gray-300 h-[65vh] lg:h-[65vh] xl:h-[70vh] overflow-y-auto border border-gray-700 rounded-lg">
                                  <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                      <FileText className="h-24 w-24 text-gray-500 mx-auto mb-8" />
                                      <p className="text-gray-300 font-medium mb-4 text-xl">{previewFile.name}</p>
                                      <p className="text-gray-400 text-lg">File type: {previewFile.type}</p>
                                      <p className="text-gray-400 text-lg">Size: {Math.round(previewFile.size / 1024)} KB</p>
                                      <p className="text-gray-400 text-base mt-6">Preview not available for this file type</p>
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
                    fileName={resume?.name || profile?.resumeFilename || "Resume"}
                    jobTitle={profile?.targetRole || 'Software Engineer'}
                    company={company}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Resume Analysis Loading Modal */}
        <ResumeAnalysisLoadingModal
          isOpen={isLoading}
          onClose={() => setIsLoading(false)}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}