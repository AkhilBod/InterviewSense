"use client";

import { useState, useEffect } from "react";
import { Download, Upload, Copy, Check, FileText, ChevronLeft } from "lucide-react";
import jsPDF from 'jspdf';
import { useSession } from "next-auth/react";
import ProtectedRoute from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/components/DashboardLayout';
import { PrefilledChip } from '@/components/ProfileFormComponents';
import { useProfileData } from '@/hooks/useProfileData';
import CoverLetterLoadingModal from '@/components/CoverLetterLoadingModal';

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

interface CoverLetter {
  id: string;
  content: string;
  timestamp: Date;
}

export default function CoverLetterPage() {
  const { data: session } = useSession();
  const { profile, loading: profileLoading } = useProfileData();
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [overridingCompany, setOverridingCompany] = useState(false);
  const [resume, setResume] = useState<File | null>(null);
  const [overridingResume, setOverridingResume] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previousLetters, setPreviousLetters] = useState<CoverLetter[]>([]);
  const [currentLetterId, setCurrentLetterId] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Pre-fill company from profile
  useEffect(() => {
    if (profile?.targetCompany) setCompanyName(profile.targetCompany);
  }, [profile]);

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResume(e.target.files[0]);
    } else {
      setResume(null);
    }
  };

  // Resolves the resume to a File, either from state or by fetching profile URL
  const resolveResume = async (): Promise<File | null> => {
    if (resume) return resume;
    if (profile?.resumeUrl) {
      try {
        const resp = await fetch(profile.resumeUrl);
        const blob = await resp.blob();
        return new File([blob], profile.resumeFilename || 'resume.pdf', { type: blob.type });
      } catch {
        return null;
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const effectiveCompany = overridingCompany ? companyName : (profile?.targetCompany || companyName);

    if (!effectiveCompany || !jobDescription) {
      setError("Please enter the company name and provide a job description.");
      setIsLoading(false);
      return;
    }

    const resolvedResume = await resolveResume();
    if (!resolvedResume) {
      setError("Could not load your resume. Please upload it manually.");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    formData.append("companyName", effectiveCompany);
    formData.append("resume", resolvedResume);

    try {
      setLoadingStep("Analyzing your resume...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoadingStep("Processing job description...");
      await new Promise(resolve => setTimeout(resolve, 800));
      setLoadingStep("Creating your personalized cover letter...");

      const response = await fetch("/api/generate-cover-letter", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate cover letter. Please try again.");
      }

      const cleanedLetter = data.coverLetter
        .replace(/\\n/g, '\n')
        .replace(/\n\n\n+/g, '\n\n')
        .trim();

      const newLetter: CoverLetter = {
        id: `letter_${Date.now()}`,
        content: cleanedLetter,
        timestamp: new Date()
      };

      setPreviousLetters(prev => [newLetter, ...prev]);
      setCurrentLetterId(newLetter.id);
      setGeneratedCoverLetter(cleanedLetter);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  const handleCopyToClipboard = async () => {
    if (!generatedCoverLetter) return;
    try {
      await navigator.clipboard.writeText(generatedCoverLetter);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {}
  };

  const switchToLetter = (letterId: string) => {
    const letter = previousLetters.find(l => l.id === letterId);
    if (letter) {
      setCurrentLetterId(letterId);
      setGeneratedCoverLetter(letter.content);
    }
  };

  const generateNewLetter = async () => {
    await handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  const handleDownload = () => {
    if (!generatedCoverLetter) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxLineWidth = pageWidth - margin * 2;
    let yPosition = margin;
    const sections = generatedCoverLetter.split('\n\n');
    sections.forEach((section, index) => {
      if (!section.trim()) return;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      const lines = doc.splitTextToSize(section, maxLineWidth);
      lines.forEach((line: string) => {
        if (yPosition + 15 > pageHeight - margin) { doc.addPage(); yPosition = margin; }
        doc.text(line, margin, yPosition);
        yPosition += 6;
      });
      if (index < sections.length - 1) yPosition += 6;
    });
    doc.save(`Cover_Letter_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <style>{pageStyles}</style>
        <div className="h-screen overflow-y-auto">
          {!generatedCoverLetter ? (
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
                  Cover Letter
                </h1>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.88rem',
                  color: '#5a6380',
                  marginBottom: 36,
                  marginTop: 0,
                }}>
                  Written around your resume and the specific role.
                </p>

                <form onSubmit={handleSubmit}>
                  {/* Company */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Company Name</label>
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
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                        style={inputStyle}
                        onFocus={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
                        onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                      />
                    )}
                  </div>

                  {/* Resume */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Resume</label>
                    {profile?.resumeFilename && !overridingResume ? (
                      <PrefilledChip
                        label="Saved"
                        value={profile.resumeFilename}
                        onChangeRequest={() => setOverridingResume(true)}
                      />
                    ) : (
                      <div>
                        <button
                          type="button"
                          onClick={() => document.getElementById("cl-resume-upload")?.click()}
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
                          }}
                        >
                          {resume ? (
                            <><FileText size={15} /><span>{resume.name.length > 35 ? `${resume.name.substring(0, 35)}…` : resume.name}</span></>
                          ) : (
                            <><Upload size={15} /><span>Upload Resume</span></>
                          )}
                        </button>
                        <input id="cl-resume-upload" type="file" style={{ display: 'none' }} accept=".pdf,.doc,.docx,.txt" onChange={handleResumeChange} />
                      </div>
                    )}
                  </div>

                  {/* Job Description */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Job Description</label>
                    <textarea
                      placeholder="Paste the complete job description here for the most targeted cover letter…"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      required
                      rows={8}
                      style={{ ...inputStyle, resize: 'vertical', minHeight: 180 }}
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
                    disabled={isLoading || !jobDescription || (!companyName && !profile?.targetCompany)}
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
                      cursor: (isLoading || !jobDescription || (!companyName && !profile?.targetCompany)) ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 20px rgba(37,99,235,0.25)',
                      opacity: (isLoading || !jobDescription || (!companyName && !profile?.targetCompany)) ? 0.5 : 1,
                      transition: 'opacity 0.2s, transform 0.15s',
                    }}
                    onMouseEnter={e => { if (!isLoading && jobDescription) { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = (isLoading || !jobDescription) ? '0.5' : '1'; e.currentTarget.style.transform = 'none'; }}
                  >
                    Generate Cover Letter
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* Generated cover letter view */
            <div className="w-full px-4 py-8">
              <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <div className="mb-6">
                  <button
                    onClick={() => setGeneratedCoverLetter(null)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      background: 'transparent',
                      border: 'none',
                      color: '#94a3b8',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      borderRadius: 8,
                      transition: 'color 0.15s, background 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    <ChevronLeft size={16} />
                    Back to Form
                  </button>
                </div>

                {generatedCoverLetter && (
                  <div className="space-y-6">
                    {/* Header Card */}
                    <div style={{
                      background: 'rgba(37, 99, 235, 0.08)',
                      border: '1px solid rgba(59,130,246,0.15)',
                      borderRadius: 16,
                      padding: '24px 28px',
                    }}>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <h2 style={{
                            fontFamily: "'Instrument Serif', serif",
                            fontSize: '1.75rem',
                            color: '#dde2f0',
                            marginBottom: 4,
                          }}>
                            Your Cover Letter
                          </h2>
                          <p style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '0.85rem',
                            color: '#64748b',
                          }}>
                            Generated {new Date().toLocaleDateString()} • Ready to send
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {previousLetters.length > 1 && (
                            <select 
                              value={currentLetterId || ''}
                              onChange={(e) => switchToLetter(e.target.value)}
                              style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 8,
                                padding: '8px 12px',
                                color: '#dde2f0',
                                fontFamily: "'Inter', sans-serif",
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                              }}
                            >
                              {previousLetters.map((letter, index) => (
                                <option key={letter.id} value={letter.id}>
                                  {index === 0 ? 'Latest' : `Version ${previousLetters.length - index}`}
                                </option>
                              ))}
                            </select>
                          )}
                          <button
                            onClick={handleDownload}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 8,
                              padding: '10px 16px',
                              background: '#2563eb',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 10,
                              fontFamily: "'Inter', sans-serif",
                              fontSize: '0.85rem',
                              fontWeight: 500,
                              cursor: 'pointer',
                              boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
                            }}
                          >
                            <Download size={15} />
                            Download PDF
                          </button>
                        </div>
                      </div>
                    </div>
                      
                    {/* Cover Letter Preview */}
                    <div style={{
                      background: '#fff',
                      borderRadius: 16,
                      padding: '40px 48px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}>
                      <div style={{ 
                        fontFamily: 'Georgia, serif',
                        lineHeight: '1.7',
                        fontSize: '14px',
                        color: '#1f2937',
                      }}>
                        {generatedCoverLetter.split('\n').map((line, index) => {
                          const trimmedLine = line.trim();
                          
                          // Empty lines for spacing
                          if (!trimmedLine) {
                            return <div key={index} style={{ height: 16 }} />;
                          }
                          
                          // Header sections (contact info)
                          if (trimmedLine.includes('@') || /^\(\d{3}\)/.test(trimmedLine) || /^\d+/.test(trimmedLine)) {
                            return (
                              <div key={index} style={{ fontSize: '13px', color: '#4b5563', marginBottom: 4 }}>
                                {trimmedLine}
                              </div>
                            );
                          }
                          
                          // Date
                          if (/^\w+\s+\d+,\s+\d{4}/.test(trimmedLine)) {
                            return (
                              <div key={index} style={{ fontSize: '13px', color: '#4b5563', marginBottom: 24, marginTop: 16 }}>
                                {trimmedLine}
                              </div>
                            );
                          }
                          
                          // Salutation
                          if (trimmedLine.toLowerCase().startsWith('dear')) {
                            return (
                              <div key={index} style={{ fontSize: '15px', fontWeight: 500, color: '#1f2937', marginBottom: 16 }}>
                                {trimmedLine}
                              </div>
                            );
                          }
                          
                          // Closing
                          if (trimmedLine.toLowerCase().includes('sincerely') || 
                              trimmedLine.toLowerCase().includes('best regards') ||
                              trimmedLine.toLowerCase().includes('yours truly')) {
                            return (
                              <div key={index} style={{ fontSize: '14px', color: '#1f2937', marginTop: 24, marginBottom: 8 }}>
                                {trimmedLine}
                              </div>
                            );
                          }
                          
                          // Name at the end
                          if (index > 0 && generatedCoverLetter.split('\n')[index - 1].toLowerCase().includes('sincerely')) {
                            return (
                              <div key={index} style={{ fontSize: '14px', fontWeight: 500, color: '#1f2937', marginTop: 32 }}>
                                {trimmedLine}
                              </div>
                            );
                          }
                          
                          // Regular paragraphs
                          return (
                            <p key={index} style={{ fontSize: '14px', color: '#374151', marginBottom: 16, lineHeight: 1.7 }}>
                              {trimmedLine}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                      
                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                      <button
                        onClick={handleCopyToClipboard}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '10px 16px',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 10,
                          color: '#94a3b8',
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#94a3b8'; }}
                      >
                        {copySuccess ? (
                          <>
                            <Check size={15} style={{ color: '#4ade80' }} />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={15} />
                            Copy to Clipboard
                          </>
                        )}
                      </button>
                      <button
                        onClick={generateNewLetter}
                        disabled={isLoading}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '10px 16px',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 10,
                          color: '#94a3b8',
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '0.85rem',
                          cursor: isLoading ? 'not-allowed' : 'pointer',
                          opacity: isLoading ? 0.5 : 1,
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#fff'; }}}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#94a3b8'; }}
                      >
                        Generate New Letter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Cover Letter Loading Modal */}
        <CoverLetterLoadingModal
          isOpen={isLoading}
          onClose={() => setIsLoading(false)}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}