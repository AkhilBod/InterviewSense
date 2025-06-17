"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Download, Upload, MessageSquare, User, LogOut, Copy, Check } from "lucide-react";
import Image from 'next/image';
import jsPDF from 'jspdf'; // Import jsPDF
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import ProtectedRoute from '@/components/ProtectedRoute'
import CoverLetterLoadingModal from '@/components/CoverLetterLoadingModal';

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
          <Card className="bg-zinc-800/50 border-zinc-700/50 shadow-xl">
            <CardHeader className="text-center pt-8">
              <CardTitle className="text-2xl font-bold">Cover Letter Generator</CardTitle>
              <p className="text-zinc-400 mt-2 text-base">
                Generate a personalized cover letter for your next job application.
              </p>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <p className="text-sm text-zinc-400 mb-4">Upload your resume, enter the company name, and provide a job description to generate a personalized cover letter.</p>
                
                {/* Company Name Section */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-zinc-500 mb-3">
                    Enter the name of the company you're applying to. This will be used to personalize your cover letter.
                  </p>
                  <Input
                    placeholder="e.g., Google, Microsoft, Apple..."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="bg-zinc-700/50 border-zinc-600 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Resume Upload Section */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Upload Resume <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-zinc-500 mb-3">
                    We'll extract your personal information, experience, and skills from your resume automatically.
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="bg-zinc-800 hover:bg-zinc-700/70 border-zinc-700 text-zinc-300 whitespace-nowrap"
                      onClick={() =>
                        document.getElementById("resume-upload")?.click()
                      }
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {resumeName ? "Change File" : "Upload Resume"}
                    </Button>
                    <input
                      id="resume-upload"
                      name="resume"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleResumeChange}
                    />
                    {resumeName && (
                      <span className="text-sm text-zinc-400 truncate" title={resumeName}>
                        {resumeName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Job Description Section */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Job Description <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-zinc-500 mb-3">
                    Paste the complete job posting here. We'll extract the job title, company name, and requirements automatically.
                  </p>
                  <Textarea
                    placeholder="Paste the full job description here including job title, company name, responsibilities, and requirements..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[250px] bg-zinc-700/50 border-zinc-600 focus:ring-blue-500 focus:border-blue-500"
                    required
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
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-full py-3 text-base font-semibold"
                  size="lg"
                  disabled={isLoading || !resume || !jobDescription || !companyName}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Generating...
                    </div>
                  ) : (
                    "Generate Cover Letter"
                  )}
                </Button>
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
            </CardContent>
          </Card>
        </div>

        {/* Loading Modal */}
        <CoverLetterLoadingModal 
          isOpen={isLoading}
          onClose={() => {}} // Prevent closing during generation
        />
      </div>
    </ProtectedRoute>
  );
}