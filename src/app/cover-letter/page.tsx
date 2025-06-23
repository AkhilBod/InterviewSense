"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Download, Upload, MessageSquare, User, LogOut, Copy, Check, FileText } from "lucide-react";
import Image from 'next/image';
import jsPDF from 'jspdf'; // Import jsPDF
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import ProtectedRoute from '@/components/ProtectedRoute'
import { UserAccountDropdown } from '@/components/UserAccountDropdown';

interface CoverLetter {
  id: string;
  content: string;
  timestamp: Date;
}

export default function CoverLetterPage() {
  const { data: session } = useSession();
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [resumeName, setResumeName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previousLetters, setPreviousLetters] = useState<CoverLetter[]>([]);
  const [currentLetterId, setCurrentLetterId] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setResume(file);
      setResumeName(file.name);
    } else {
      setResume(null);
      setResumeName("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!resume || !jobDescription || !companyName) {
      setError("Please upload a resume, provide a job description, and enter the company name.");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    formData.append("companyName", companyName);
    formData.append("resume", resume);

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

      // Clean up newlines and formatting issues
      const cleanedLetter = data.coverLetter
        .replace(/\\n/g, '\n')
        .replace(/\n\n\n+/g, '\n\n')
        .trim();

      // Create new letter version
      const newLetter: CoverLetter = {
        id: `letter_${Date.now()}`,
        content: cleanedLetter,
        timestamp: new Date()
      };

      // Add to previous letters and set as current
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

  // Enhanced copy functionality
  const handleCopyToClipboard = async () => {
    if (!generatedCoverLetter) return;
    
    try {
      await navigator.clipboard.writeText(generatedCoverLetter);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Version management
  const switchToLetter = (letterId: string) => {
    const letter = previousLetters.find(l => l.id === letterId);
    if (letter) {
      setCurrentLetterId(letterId);
      setGeneratedCoverLetter(letter.content);
    }
  };

  // Generate new letter with existing data
  const generateNewLetter = async () => {
    if (!resume || !jobDescription || !companyName) {
      setError("Please ensure you have uploaded a resume, provided a job description, and entered the company name.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    formData.append("companyName", companyName);
    formData.append("resume", resume);

    try {
      setLoadingStep("Analyzing your resume...");
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setLoadingStep("Processing job description...");
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setLoadingStep("Creating new version...");
      
      const response = await fetch("/api/generate-cover-letter", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate cover letter. Please try again.");
      }

      // Clean up newlines and formatting issues
      const cleanedLetter = data.coverLetter
        .replace(/\\n/g, '\n')
        .replace(/\n\n\n+/g, '\n\n')
        .trim();

      // Create new letter version
      const newLetter: CoverLetter = {
        id: `letter_${Date.now()}`,
        content: cleanedLetter,
        timestamp: new Date()
      };

      // Add to previous letters and set as current
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

  const handleDownload = () => {
    if (!generatedCoverLetter) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxLineWidth = pageWidth - margin * 2;
    let yPosition = margin;
    
    // Split cover letter into sections for better formatting
    const sections = generatedCoverLetter.split('\n\n');
    
    sections.forEach((section, index) => {
      if (!section.trim()) return;
      
      // Check if this is a header section (contains contact info)
      const isHeader = section.includes('@') || section.includes('(') || /^\d+/.test(section);
      const isDate = /^\w+\s+\d+,\s+\d{4}/.test(section.trim());
      const isSalutation = section.toLowerCase().startsWith('dear');
      const isClosing = section.toLowerCase().includes('sincerely') || section.toLowerCase().includes('best regards');
      
      // Set appropriate font and size
      if (isHeader) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
      } else if (isDate || isSalutation || isClosing) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
      }
      
      // Split section into lines
      const lines = doc.splitTextToSize(section, maxLineWidth);
      
      lines.forEach((line: string, lineIndex: number) => {
        // Check if we need a new page
        if (yPosition + 15 > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        
        doc.text(line, margin, yPosition);
        yPosition += 6; // Line spacing
      });
      
      // Add extra spacing between sections
      if (index < sections.length - 1) {
        yPosition += 6;
      }
    });

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Cover_Letter_${timestamp}.pdf`;
    
    doc.save(filename);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-900 text-white px-4 py-10 flex items-center justify-center">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-zinc-950/80 border-b border-zinc-800/50">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image src="https://i.ibb.co/hNsCy7F/logo.webp" alt="InterviewSense" width={32} height={32} className="object-contain" />
              <span className="font-semibold text-white">InterviewSense</span>
            </Link>
            <nav className="flex items-center gap-4">
              <UserAccountDropdown />
            </nav>
          </div>
        </header>

        <div className="w-full max-w-2xl mx-auto mt-16">
          {/* Header Section */}
          <div className="text-center mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent mb-3">
              Craft your perfect cover letter
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base">
              Create compelling, personalized cover letters that get you noticed
            </p>
          </div>

          <Card className="bg-gradient-to-br from-zinc-800/80 via-zinc-800/50 to-orange-900/20 border border-orange-500/20 backdrop-blur-sm shadow-2xl shadow-orange-500/10">
            <CardContent className="p-6 sm:p-8 space-y-6">
              {isLoading ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 border-4 border-orange-600/20 border-t-orange-600 rounded-full animate-spin mx-auto mb-6"></div>
                  <h3 className="text-xl font-semibold text-white mb-3">{loadingStep}</h3>
                  <p className="text-zinc-400">Please wait while we craft your perfect cover letter...</p>
                </div>
              ) : (
                <>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Company Name and Resume Upload Row - Better Space Distribution */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Company Name Section - Takes 2/3 of the space */}
                      <div className="md:col-span-2 group">
                        <label className="text-orange-300 text-sm font-medium mb-3 block flex items-center gap-2">
                          <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                          Company Name
                        </label>
                        <div className="relative">
                          <Input
                            placeholder="e.g., Google, Meta, Apple"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="bg-zinc-900/50 border-2 border-zinc-600/50 hover:border-orange-500/50 focus:border-orange-500 h-12 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-orange-500/10 text-lg placeholder:text-zinc-500"
                            required
                          />
                          <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                      </div>

                      {/* Resume Upload Section - Takes 1/3 of the space */}
                      <div className="md:col-span-1 group">
                        <label className="text-orange-300 text-sm font-medium mb-3 block flex items-center gap-2">
                          <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                          Resume
                        </label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="bg-gradient-to-r from-orange-600/10 to-orange-700/10 hover:from-orange-600/20 hover:to-orange-700/20 border-2 border-orange-500/30 hover:border-orange-400/50 text-orange-300 hover:text-orange-200 transition-all duration-300 shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 h-12 px-4"
                            onClick={() => document.getElementById("resume-upload")?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {resumeName ? "Change" : "Upload"}
                          </Button>
                          <input
                            id="resume-upload"
                            name="resume"
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.txt,text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleResumeChange}
                          />
                        </div>
                        {resumeName && (
                          <div className="mt-3">
                            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
                              <FileText className="h-4 w-4 text-green-400 flex-shrink-0" />
                              <span className="text-sm text-green-300 truncate">
                                {resumeName.length > 15
                                  ? `${resumeName.substring(0, 15)}...`
                                  : resumeName}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Job Description Section */}
                    <div className="space-y-3 group">
                      <label className="text-orange-300 text-sm font-medium flex items-center gap-2">
                        <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                        Job Description
                      </label>
                      <div className="relative">
                        <Textarea
                          placeholder="Paste the complete job description here for the most targeted cover letter..."
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                          className="min-h-[250px] bg-zinc-900/50 border-2 border-zinc-600/50 hover:border-orange-500/50 focus:border-orange-500 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-orange-500/10 placeholder:text-zinc-500"
                          required
                        />
                        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    </div>

                    {error && (
                      <div className="rounded-lg bg-red-900/30 border border-red-800 text-red-200 p-3 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <div className="text-sm">{error}</div>
                      </div>
                    )}

                    <div className="pt-4">
                      <Button
                        type="submit"
                        className="w-full h-14 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 hover:from-orange-500 hover:via-orange-400 hover:to-orange-500 text-white rounded-2xl text-base sm:text-lg font-semibold shadow-2xl shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none hover:scale-[1.02] active:scale-[0.98] border border-orange-400/20"
                        disabled={isLoading || !resume || !jobDescription || !companyName}
                      >
                        <FileText className="mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                        <span>Generate Cover Letter</span>
                      </Button>
                      
                      {(!resume || !jobDescription || !companyName) && (
                        <p className="text-center text-zinc-400 text-sm mt-3">
                          Please upload a resume, enter company name, and provide job description
                        </p>
                      )}
                    </div>
                  </form>

                  {generatedCoverLetter && (
                    <div className="mt-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <h3 className="text-xl font-semibold flex items-center text-white">
                            <CheckCircle className="h-6 w-6 text-green-400 mr-3" />
                            Your Cover Letter
                          </h3>
                          {previousLetters.length > 1 && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-zinc-400">Version:</span>
                              <select 
                                value={currentLetterId || ''}
                                onChange={(e) => switchToLetter(e.target.value)}
                                className="bg-zinc-700 border border-zinc-600 text-white text-sm rounded px-2 py-1"
                              >
                                {previousLetters.map((letter, index) => (
                                  <option key={letter.id} value={letter.id}>
                                    {index === 0 ? 'Latest' : `Version ${previousLetters.length - index}`}
                                    ({letter.timestamp.toLocaleTimeString()})
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-blue-600 hover:bg-blue-500 border-blue-600 text-white hover:text-white flex items-center gap-2 px-4 py-2"
                          onClick={handleDownload}
                        >
                          <Download className="h-4 w-4" />
                          Download PDF
                        </Button>
                      </div>
                      
                      {/* Cover Letter Preview */}
                      <div className="bg-white text-gray-900 p-8 rounded-lg shadow-lg border border-zinc-300 font-serif">
                        <div 
                          className="prose prose-lg max-w-none leading-relaxed"
                          style={{ 
                            fontFamily: 'Georgia, "Times New Roman", serif',
                            lineHeight: '1.6',
                            fontSize: '14px'
                          }}
                        >
                          {generatedCoverLetter.split('\n').map((line, index) => {
                            const trimmedLine = line.trim();
                            
                            // Empty lines for spacing
                            if (!trimmedLine) {
                              return <div key={index} className="h-4" />;
                            }
                            
                            // Header sections (contact info)
                            if (trimmedLine.includes('@') || /^\(\d{3}\)/.test(trimmedLine) || /^\d+/.test(trimmedLine)) {
                              return (
                                <div key={index} className="text-sm text-gray-700 mb-1">
                                  {trimmedLine}
                                </div>
                              );
                            }
                            
                            // Date
                            if (/^\w+\s+\d+,\s+\d{4}/.test(trimmedLine)) {
                              return (
                                <div key={index} className="text-sm text-gray-700 mb-6 mt-4">
                                  {trimmedLine}
                                </div>
                              );
                            }
                            
                            // Salutation
                            if (trimmedLine.toLowerCase().startsWith('dear')) {
                              return (
                                <div key={index} className="text-base font-medium text-gray-900 mb-4">
                                  {trimmedLine}
                                </div>
                              );
                            }
                            
                            // Closing
                            if (trimmedLine.toLowerCase().includes('sincerely') || 
                                trimmedLine.toLowerCase().includes('best regards') ||
                                trimmedLine.toLowerCase().includes('yours truly')) {
                              return (
                                <div key={index} className="text-base text-gray-900 mt-6 mb-2">
                                  {trimmedLine}
                                </div>
                              );
                            }
                            
                            // Name at the end
                            if (index > 0 && generatedCoverLetter.split('\n')[index - 1].toLowerCase().includes('sincerely')) {
                              return (
                                <div key={index} className="text-base font-medium text-gray-900 mt-8">
                                  {trimmedLine}
                                </div>
                              );
                            }
                            
                            // Regular paragraphs
                            return (
                              <p key={index} className="text-base text-gray-800 mb-4 leading-relaxed">
                                {trimmedLine}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="mt-6 flex gap-3">
                        <Button
                          variant="outline"
                          className="bg-zinc-800 hover:bg-zinc-700 border-zinc-600 text-zinc-300 hover:text-white flex items-center gap-2"
                          onClick={handleCopyToClipboard}
                        >
                          {copySuccess ? (
                            <>
                              <Check className="h-4 w-4 text-green-400" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              Copy to Clipboard
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          className="bg-zinc-800 hover:bg-zinc-700 border-zinc-600 text-zinc-300 hover:text-white"
                          onClick={generateNewLetter}
                          disabled={isLoading || !resume || !jobDescription || !companyName}
                        >
                          {isLoading ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-zinc-500/30 border-t-zinc-300 rounded-full animate-spin"></div>
                              Generating...
                            </div>
                          ) : (
                            "Generate New Letter"
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}