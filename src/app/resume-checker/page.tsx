"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";
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
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
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

  // Highlight State — derived from word analysis; PDFHighlightViewer uses
  // PDF.js text extraction to find real bounding boxes via textExcerpt matching.
  const wordHighlights: ResumeHighlight[] = (wordAnalysisData?.wordImprovements || []).map((item, i) => ({
    id: `wh-${i}`,
    page: item.textPosition?.pageNumber || 1,
    x: 0, y: 0, width: 0, height: 0, // ignored — viewer does its own text search
    color: item.severity as 'red' | 'yellow' | 'green',
    title: item.category === 'quantify_impact' ? 'Add Metrics'
      : item.category === 'communication' ? 'Clarify Language'
      : item.category === 'length_depth' ? 'Adjust Length'
      : item.category === 'drive' ? 'Show Initiative'
      : item.category === 'analytical' ? 'Add Analysis'
      : 'Suggestion',
    feedback: item.explanation,
    suggestion: item.improved,
    textExcerpt: item.original, // this is what PDFHighlightViewer uses to locate text
  }));

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
        resolvedResume = new File([blob], filename, { type: blob.type || 'application/pdf' });
        // Update the resume state so the preview can display
        setResume(resolvedResume);
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
  };

  // When word analysis is available, scale ALL scores proportionally so they're consistent.
  // The word analysis score is more granular and honest — use it as the anchor.
  const scoreScaleFactor = (() => {
    if (!resumeData || !wordAnalysisData?.overallScore) return 1;
    const rawOverall = resumeData.overallScore;
    if (rawOverall === 0) return 1;
    // Scale factor to bring inflated main-analysis scores in line with word-analysis reality
    return wordAnalysisData.overallScore / rawOverall;
  })();

  const adjustScore = (raw: number) => Math.round(Math.min(100, Math.max(0, raw * scoreScaleFactor)));

  const adjustedOverallScore = resumeData ? adjustScore(resumeData.overallScore) : 0;

  // Apply scale then normalize: if sub-scores average much higher than overall
  // (AI often inflates impact/style/skills while giving an honest overall),
  // bring them proportionally back down so they're consistent.
  const _rawImpact = resumeData ? adjustScore(resumeData.impactScore) : 0;
  const _rawStyle  = resumeData ? adjustScore(resumeData.styleScore)  : 0;
  const _rawSkills = resumeData ? adjustScore(resumeData.skillsScore) : 0;
  const _avgSub = (_rawImpact + _rawStyle + _rawSkills) / 3;
  const _subNorm = adjustedOverallScore > 0 && _avgSub > adjustedOverallScore + 5
    ? adjustedOverallScore / _avgSub
    : 1;
  const adjustedImpactScore  = Math.min(100, Math.round(_rawImpact  * _subNorm));
  const adjustedStyleScore   = Math.min(100, Math.round(_rawStyle   * _subNorm));
  const adjustedSkillsScore  = Math.min(100, Math.round(_rawSkills  * _subNorm));

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

  const scoreHex = (score: number) => {
    if (score >= 70) return '#22c55e';
    if (score >= 45) return '#eab308';
    return '#ef4444';
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
    // Filter out "What's Next" / "Next Steps" / "Refine Resume" / "Practice Interview" sections
    const filteredText = analysisText
      .replace(/(?:What['']?s Next\??|NEXT STEPS|Continue your career[^\n]*|Refine Resume[^\n]*|Make edits and get new feedback[^\n]*|Practice Interview[^\n]*|Prepare for your next interview[^\n]*)[\s\S]*?(?=\n[A-Z]{2,}|\n##|\n#|$)/gi, '')
      .replace(/(?:^|\n)(?:What['']?s Next\??|NEXT STEPS)[^\n]*/gi, '')
      .replace(/(?:^|\n)(?:Refine Resume|Practice Interview|Make edits|Prepare for your)[^\n]*/gi, '')
      .trim();

    const sections = filteredText.split('\n\n');
    const parsedElements: JSX.Element[] = [];

    sections.forEach((section, index) => {
      const trimmed = section.trim();
      if (!trimmed) return;

      // Skip any leftover "next steps" text
      if (/what['']?s next|next steps|refine resume|practice interview|continue your career/i.test(trimmed)) return;

      if (trimmed.startsWith('## ')) {
        parsedElements.push(
          <h3 key={index} style={{ fontFamily: "'Inter', sans-serif", fontSize: '1rem', fontWeight: 600, color: '#e2e8f0', marginTop: 16, marginBottom: 8 }}>
            {trimmed.substring(3).trim()}
          </h3>
        );
      } else if (trimmed.startsWith('# ')) {
        parsedElements.push(
          <h2 key={index} style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.1rem', fontWeight: 600, color: '#e2e8f0', marginTop: 20, marginBottom: 10 }}>
            {trimmed.substring(2).trim()}
          </h2>
        );
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const listItems = trimmed.split('\n').map((item, itemIndex) => (
          <li key={`${index}-${itemIndex}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', flexShrink: 0, marginTop: 8 }} />
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0, flex: 1 }}>{item.substring(2).trim()}</p>
          </li>
        ));
        parsedElements.push(<ul key={index} style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>{listItems}</ul>);
      } else {
        parsedElements.push(
          <p key={index} style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.95rem', color: '#cbd5e1', lineHeight: 1.7, marginTop: 8 }}>
            {trimmed}
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
                      background: '#2563eb',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 10,
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.88rem',
                      fontWeight: 500,
                      cursor: (isLoading || (!resume && !profile?.resumeUrl)) ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 20px rgba(37,99,235,0.25)',
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
            // Resume Analysis Results
            <div style={{ width: '100%', padding: '32px 16px', fontFamily: 'Inter, sans-serif', color: '#e2e8f0' }}>
              {resumeData && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }} className="resume-results-grid">
                    <style>{`
                      @media (min-width: 1024px) {
                        .resume-results-grid { grid-template-columns: 5fr 4fr !important; }
                      }
                    `}</style>
                    {/* Left Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 900 }}>

                      {/* Header */}
                      <div style={{ marginBottom: 8 }}>
                        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 'clamp(1.8rem,4vw,2.4rem)', color: '#e2e8f0', margin: 0 }}>
                          Resume Analysis
                        </h1>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#64748b', marginTop: 8 }}>
                          {resumeData.jobTitle}{resumeData.company ? ` · ${resumeData.company}` : ''} · {new Date().toLocaleDateString()}
                        </p>
                      </div>

                      {/* Score Cards - matching system design grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 16 }}>
                        {/* Overall Score */}
                        <div style={{
                          background: 'rgba(59,130,246,0.06)',
                          border: '1px solid rgba(59,130,246,0.12)',
                          borderRadius: 16,
                          padding: 20,
                          textAlign: 'center',
                        }}>
                          <div style={{
                            fontSize: '3rem',
                            fontWeight: 700,
                            fontFamily: "'JetBrains Mono', monospace",
                            color: scoreHex(adjustedOverallScore),
                            lineHeight: 1,
                            marginBottom: 8,
                          }}>
                            {adjustedOverallScore}
                          </div>
                          <div style={{
                            fontSize: '0.72rem',
                            color: '#64748b',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 600,
                          }}>
                            Overall Score
                          </div>
                        </div>

                        {/* Category Scores */}
                        {[
                          { label: 'Impact', score: adjustedImpactScore },
                          { label: 'Style', score: adjustedStyleScore },
                          { label: 'Skills', score: adjustedSkillsScore },
                        ].map(({ label, score }) => (
                          <div key={label} style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: 16,
                            padding: 20,
                            textAlign: 'center',
                          }}>
                            <div style={{
                              fontSize: '2.4rem',
                              fontWeight: 600,
                              fontFamily: "'JetBrains Mono', monospace",
                              color: scoreHex(score),
                              lineHeight: 1,
                              marginBottom: 8,
                            }}>
                              {score}
                            </div>
                            <div style={{
                              fontSize: '0.72rem',
                              color: '#64748b',
                              letterSpacing: '0.1em',
                              textTransform: 'uppercase',
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: 600,
                            }}>
                              {label}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Category Breakdown Bars */}
                      <div style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 16,
                        padding: 28,
                      }}>
                        <h2 style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: '#64748b',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          marginBottom: 20,
                        }}>
                          Category Breakdown
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                          {[
                            { label: 'Impact', score: adjustedImpactScore },
                            { label: 'Style', score: adjustedStyleScore },
                            { label: 'Skills', score: adjustedSkillsScore },
                          ].map(({ label, score }) => (
                            <div key={label}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 500 }}>{label}</span>
                                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: scoreHex(score), fontWeight: 600 }}>{score}/100</span>
                              </div>
                              <div style={{ height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ width: `${score}%`, height: '100%', background: scoreHex(score), borderRadius: 3, transition: 'width 0.6s ease' }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Resume Analytics */}
                      <div style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 16,
                        padding: 28,
                      }}>
                        <h2 style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: '#64748b',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          marginBottom: 20,
                        }}>
                          Resume Analytics
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                          {[
                            { label: 'Grade', value: adjustedOverallScore >= 90 ? 'A' : adjustedOverallScore >= 80 ? 'B+' : adjustedOverallScore >= 70 ? 'B' : adjustedOverallScore >= 60 ? 'C' : 'D', sub: adjustedOverallScore >= 80 ? 'Strong' : adjustedOverallScore >= 70 ? 'Good' : adjustedOverallScore >= 60 ? 'Average' : 'Needs Work' },
                            { label: 'ATS Ready', value: (resumeData.atsCompatibility === 'Excellent' || resumeData.atsCompatibility === 'Good') ? 'Yes' : 'No', sub: resumeData.atsCompatibility || 'Unknown' },
                            { label: 'Pages', value: String(resumeData.resumeLength || 1), sub: 'Length' },
                            { label: 'Skills', value: String(resumeData.skillsCount || 0), sub: 'Detected' },
                          ].map(({ label, value, sub }) => (
                            <div key={label} style={{
                              background: 'rgba(255,255,255,0.02)',
                              borderRadius: 10,
                              padding: 18,
                              border: '1px solid rgba(255,255,255,0.04)',
                            }}>
                              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.5rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>
                                {value}
                              </div>
                              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                {label}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Strengths & Improvements side by side */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
                        {/* Strengths */}
                        <div style={{
                          background: 'rgba(34,197,94,0.04)',
                          border: '1px solid rgba(34,197,94,0.12)',
                          borderRadius: 16,
                          padding: 28,
                        }}>
                          <h2 style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#22c55e',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            marginBottom: 20,
                          }}>
                            Strengths
                          </h2>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {resumeData.strengths.length > 0 ? resumeData.strengths.map((s, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginTop: 8, flexShrink: 0 }} />
                                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>{s}</p>
                              </div>
                            )) : <p style={{ color: '#64748b', fontSize: '0.875rem', fontStyle: 'italic', margin: 0 }}>No specific strengths identified.</p>}
                          </div>
                        </div>

                        {/* Areas for Improvement */}
                        <div style={{
                          background: 'rgba(234,179,8,0.04)',
                          border: '1px solid rgba(234,179,8,0.12)',
                          borderRadius: 16,
                          padding: 28,
                        }}>
                          <h2 style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#eab308',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            marginBottom: 20,
                          }}>
                            Areas for Improvement
                          </h2>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {resumeData.improvementAreas.length > 0 ? resumeData.improvementAreas.map((a, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#eab308', marginTop: 8, flexShrink: 0 }} />
                                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>{a}</p>
                              </div>
                            )) : <p style={{ color: '#64748b', fontSize: '0.875rem', fontStyle: 'italic', margin: 0 }}>No improvement areas identified.</p>}
                          </div>
                        </div>
                      </div>

                      {/* Word-Level Analysis */}
                      {wordAnalysisData && (
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
                          <ResumeWordAnalysis
                            analysis={wordAnalysisData}
                            fileName={resume?.name || profile?.resumeFilename || "Resume"}
                            jobTitle={profile?.targetRole || 'Software Engineer'}
                            company={company}
                          />
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 16 }}>
                        <button
                          onClick={handleBackToChecker}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '12px 24px',
                            background: '#2563eb',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 10,
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
                          }}
                        >
                          Analyze Another Resume
                        </button>
                      </div>

                    </div>

                    {/* Right Column - Resume Viewer - Hidden on mobile */}
                    <div className="hidden lg:block" style={{ position: 'sticky', top: 24, height: 'fit-content' }}>
                      <div style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 16,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: '85vh',
                      }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                          <h2 style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#64748b',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            margin: 0,
                          }}>
                            Resume Preview
                          </h2>
                        </div>
                        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                          {resume && (
                            <>
                              {resume.type === 'application/pdf' ? (
                                <PDFHighlightViewer
                                  file={resume}
                                  highlights={wordHighlights}
                                />
                              ) : (
                                <div style={{ padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                                  <div style={{ textAlign: 'center' }}>
                                    <FileText style={{ width: 48, height: 48, color: '#475569', margin: '0 auto 16px' }} />
                                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#e2e8f0', marginBottom: 8 }}>{resume.name}</p>
                                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: '#64748b' }}>
                                      {resume.type} · {Math.round(resume.size / 1024)} KB
                                    </p>
                                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: '#475569', marginTop: 12 }}>Preview not available for this file type</p>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Error Display for Analysis */}
              {error && error.includes('word analysis') && (
                <div style={{ padding: '0 16px', maxWidth: 1900, margin: '0 auto' }}>
                  <div style={{
                    background: 'rgba(239,68,68,0.06)',
                    border: '1px solid rgba(239,68,68,0.15)',
                    borderRadius: 12,
                    padding: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}>
                    <AlertCircle style={{ width: 18, height: 18, color: '#ef4444', flexShrink: 0 }} />
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', color: '#fca5a5', margin: 0 }}>{error}</p>
                  </div>
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