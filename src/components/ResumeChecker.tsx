"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Download, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import jsPDF from 'jspdf';

interface FormattedAnalysis {
  title: string;
  date: string;
  content: string;
  fileName: string;
}

export default function ResumeChecker() {
  const [file, setFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [formattedAnalysis, setFormattedAnalysis] = useState<FormattedAnalysis | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [areasForImprovement, setAreasForImprovement] = useState<string[]>([]);
  const [stats, setStats] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    console.log("🔍 Resume Checker Component Loaded - Check browser console (F12) for logs");
  }, []);

  const generatePDF = () => {
    if (!formattedAnalysis) return;

    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - (margin * 2);

    // Add title
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(formattedAnalysis.title, margin, margin);
    
    // Add date
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${formattedAnalysis.date}`, margin, margin + 10);
    
    // Process content with markdown formatting
    const content = formattedAnalysis.content;
    const lines = content.split('\n');
    
    let y = margin + 20;
    let currentFontSize = 12;
    let currentFont = 'helvetica';
    let currentStyle = 'normal';

    lines.forEach((line) => {
      // Check if we need a new page
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }

      // Handle headers
      if (line.startsWith('# ')) {
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(line.substring(2), margin, y);
        y += 15;
        currentFontSize = 12;
        doc.setFontSize(currentFontSize);
        doc.setFont('helvetica', 'normal');
        return;
      }
      if (line.startsWith('## ')) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(line.substring(3), margin, y);
        y += 12;
        currentFontSize = 12;
        doc.setFontSize(currentFontSize);
        doc.setFont('helvetica', 'normal');
        return;
      }

      // Handle bullet points
      if (line.trim().startsWith('* ')) {
        const bulletText = line.trim().substring(2);
        const splitText = doc.splitTextToSize(bulletText, maxWidth - 10);
        doc.text('•', margin, y);
        doc.text(splitText, margin + 5, y);
        y += (splitText.length * 7);
        return;
      }

      // Handle bold text
      if (line.includes('**')) {
        const parts = line.split('**');
        let x = margin;
        parts.forEach((part, index) => {
          if (index % 2 === 0) {
            doc.setFont('helvetica', 'normal');
          } else {
            doc.setFont('helvetica', 'bold');
          }
          const splitText = doc.splitTextToSize(part, maxWidth - (x - margin));
          doc.text(splitText, x, y);
          x += doc.getTextWidth(part);
        });
        y += 7;
        return;
      }

      // Regular text
      const splitText = doc.splitTextToSize(line, maxWidth);
      doc.text(splitText, margin, y);
      y += (splitText.length * 7);
    });

    // Save the PDF
    const fileName = `resume-analysis-${formattedAnalysis.fileName.replace(/\.[^/.]+$/, '')}.pdf`;
    doc.save(fileName);
    
    toast({
      title: "Success",
      description: "PDF downloaded successfully!",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("📝 Form submitted with:", {
      hasFile: !!file,
      fileName: file?.name,
      jobTitle,
      company,
      hasJobDescription: !!jobDescription
    });

    if (!file || !jobTitle) {
      console.log("Validation failed: Missing required fields");
      toast({
        title: "Error",
        description: "Please upload a resume and enter a job title",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setAnalysis(""); // Clear previous analysis
    setFormattedAnalysis(null); // Clear previous formatted analysis
    setScore(null);
    setStrengths([]);
    setAreasForImprovement([]);
    setStats(null);
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobTitle", jobTitle);
    formData.append("company", company);
    formData.append("jobDescription", jobDescription);

    console.log("Sending request to /api/resume-check");
    try {
      const response = await fetch("/api/resume-check", {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze resume");
      }

      if (!data.analysis) {
        throw new Error("No analysis received from the server");
      }

      console.log("Analysis received successfully");
      setAnalysis(data.analysis);
      setFormattedAnalysis(data.formattedAnalysis);
      setScore(data.score);
      setStrengths(data.strengths || []);
      setAreasForImprovement(data.areasForImprovement || []);
      setStats(data.stats || null);
      toast({
        title: "Success",
        description: "Resume analysis complete!",
      });
    } catch (error) {
      console.error("Resume analysis error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Resume Checker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Resume (PDF or DOCX)</label>
              <Input
                type="file"
                accept=".pdf,.docx"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  console.log("File selected:", selectedFile?.name);
                  setFile(selectedFile || null);
                }}
                className="cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Job Title</label>
              <Input
                type="text"
                value={jobTitle}
                onChange={(e) => {
                  console.log("Job title changed:", e.target.value);
                  setJobTitle(e.target.value);
                }}
                placeholder="e.g., Software Engineer"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Company (Optional)</label>
              <Input
                type="text"
                value={company}
                onChange={(e) => {
                  console.log("Company changed:", e.target.value);
                  setCompany(e.target.value);
                }}
                placeholder="e.g., Google"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Job Description (Optional)</label>
              <Textarea
                value={jobDescription}
                onChange={(e) => {
                  console.log("Job description changed:", e.target.value.length, "characters");
                  setJobDescription(e.target.value);
                }}
                placeholder="Paste the job description here..."
                rows={4}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Resume"
              )}
            </Button>
          </form>

          {/* OUTPUT SECTION - INTERVIEW PERFORMANCE SUMMARY STYLE */}
          {score !== null && (
            <div className="mt-10 w-full max-w-3xl mx-auto">
              {/* Summary Card */}
              <Card className="bg-zinc-900/80 border-zinc-700/60 shadow-2xl mb-8">
                <CardHeader className="flex flex-row items-center justify-between gap-6 px-8 pt-8 pb-4">
                  <div>
                    <CardTitle className="text-2xl font-bold mb-1">Resume Performance Summary</CardTitle>
                    <div className="text-zinc-400 text-base">
                      {jobTitle && (
                        <span>{jobTitle}</span>
                      )}
                      {company && (
                        <span> at {company}</span>
                      )}
                      {formattedAnalysis?.date && (
                        <span className="ml-2 text-zinc-500">• {formattedAnalysis.date}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {strengths.length > 0 && strengths.map((s, i) => (
                        <span key={i} className="bg-green-900/70 text-green-200 px-2 py-1 rounded text-xs font-medium">{s}</span>
                      ))}
                      {areasForImprovement.length > 0 && areasForImprovement.map((a, i) => (
                        <span key={i} className="bg-yellow-900/70 text-yellow-200 px-2 py-1 rounded text-xs font-medium">{a}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-center min-w-[100px]">
                    <span className="text-5xl font-extrabold text-blue-400">{score}%</span>
                    <span className="text-xs text-zinc-400">Overall Score</span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-8 px-8 pb-8">
                  {/* Stats Section */}
                  <div>
                    <div className="font-semibold mb-1 text-blue-400">Resume Stats</div>
                    <div className="text-xs text-zinc-200 space-y-1">
                      <div><span className="font-bold">File Type:</span> {stats?.fileType}</div>
                      <div><span className="font-bold">Length:</span> {stats?.resumeLength} page(s)</div>
                      {stats?.keywordMatch !== null && <div><span className="font-bold">Keyword Match:</span> {stats.keywordMatch}%</div>}
                      <div><span className="font-bold">Skills Detected:</span> {stats?.skillsCount}</div>
                      <div><span className="font-bold">ATS Compatibility:</span> {stats?.atsCompatibility}</div>
                    </div>
                  </div>
                  {/* Keyword Analysis Section */}
                  {stats?.keywordMatch !== null && (
                    <div>
                      <div className="font-semibold mb-1 text-purple-400">Keyword Analysis</div>
                      <div className="text-xs text-zinc-200 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">Keyword Match Rate:</span>
                          <span className="text-purple-300">{stats.keywordMatch}%</span>
                        </div>
                        {/* Add high-impact keywords if available */}
                        {stats.highImpactKeywords && stats.highImpactKeywords.length > 0 && (
                          <div className="mt-1">
                            <span className="font-bold">High-Impact Keywords Used:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {stats.highImpactKeywords.map((kw: string, i: number) => (
                                <span key={i} className="bg-blue-900/60 text-blue-200 px-2 py-0.5 rounded text-xs font-medium">{kw}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Coach Feedback Section */}
              <Card className="bg-zinc-900/70 border-zinc-700/60 shadow-xl mb-8">
                <CardHeader className="px-8 pt-8 pb-2">
                  <CardTitle className="text-xl font-semibold text-blue-300">AI Coach Feedback</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <div className="mb-4">
                    <div className="font-semibold text-green-300 mb-1">Strengths:</div>
                    <ul className="list-disc list-inside text-zinc-200">
                      {strengths.length > 0 ? strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      )) : <li>No strengths detected.</li>}
                    </ul>
                  </div>
                  <div className="mb-4">
                    <div className="font-semibold text-yellow-300 mb-1">Areas for Improvement:</div>
                    <ul className="list-disc list-inside text-zinc-200">
                      {areasForImprovement.length > 0 ? areasForImprovement.map((a, i) => (
                        <li key={i}>{a}</li>
                      )) : <li>No areas for improvement detected.</li>}
                    </ul>
                  </div>
                  <div className="mb-2">
                    <div className="font-semibold text-blue-300 mb-1">Interview Strategy Suggestions:</div>
                    <div className="text-zinc-200">
                      {analysis && (
                        <div className="prose prose-invert max-w-none">
                          {analysis.split('\n').map((line, i) => {
                            if (line.startsWith('# ') || line.startsWith('## ')) return null;
                            if (line.trim().startsWith('* ')) return null;
                            return (
                              <p key={i} className="my-1 text-zinc-300">{line}</p>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-end mb-8">
                <Button onClick={generatePDF} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" /> Download Report
                </Button>
                {/* Placeholder for Print/Share/Retry/Coaching buttons */}
                <Button variant="outline" className="flex items-center gap-2" disabled>
                  Print
                </Button>
                <Button variant="outline" className="flex items-center gap-2" disabled>
                  Share
                </Button>

                <Button variant="default" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white">
                  Get Expert Coaching
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 