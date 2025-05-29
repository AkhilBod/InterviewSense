"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Download, FileText, CheckCircle, AlertCircle, Target, TrendingUp, Award, Users, Star, ChevronDown, ChevronUp, Share2, Printer, RefreshCw } from "lucide-react";
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
  const [expandedSections, setExpandedSections] = useState({
    strengths: true,
    improvements: true,
    suggestions: true, // Default to expanded
    details: false
  });
  const { toast } = useToast();

  useEffect(() => {
    console.log("🔍 Resume Checker Component Loaded - Check browser console (F12) for logs");
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400"; 
    return "text-red-400";
  };

  const getScoreCategory = (score: number) => {
    if (score >= 90) return { label: "Excellent", color: "bg-green-500" };
    if (score >= 80) return { label: "Very Good", color: "bg-green-400" };
    if (score >= 70) return { label: "Good", color: "bg-yellow-400" };
    if (score >= 60) return { label: "Fair", color: "bg-orange-400" };
    return { label: "Needs Work", color: "bg-red-400" };
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

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

          {/* ENHANCED OUTPUT SECTION */}
          {score !== null && (
            <div className="mt-10 w-full max-w-4xl mx-auto space-y-6">
              {/* Header Card with Score */}
              <Card className="bg-gradient-to-br from-blue-950/50 to-purple-950/50 border-blue-800/30 shadow-2xl">
                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Award className="h-8 w-8 text-blue-400" />
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      Resume Analysis Complete
                    </CardTitle>
                  </div>
                  <div className="text-lg text-gray-300">
                    {jobTitle && (
                      <span className="font-semibold">{jobTitle}</span>
                    )}
                    {company && (
                      <span> at <span className="text-blue-300">{company}</span></span>
                    )}
                  </div>
                  {formattedAnalysis?.date && (
                    <div className="text-sm text-gray-400 mt-1">{formattedAnalysis.date}</div>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      <div className="text-6xl font-bold text-center mb-2">
                        <span className={getScoreColor(score)}>{score}</span>
                        <span className="text-2xl text-gray-400">%</span>
                      </div>
                      <Badge className={`${getScoreCategory(score).color} text-white px-3 py-1 text-sm font-medium`}>
                        {getScoreCategory(score).label}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={score} className="w-full h-3 mb-4" />
                  <div className="text-center text-gray-300">
                    Your resume scored in the <span className="font-semibold text-blue-300">{getScoreCategory(score).label.toLowerCase()}</span> range
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-zinc-900/50 border-zinc-700/50">
                  <CardContent className="p-4 text-center">
                    <FileText className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{stats?.resumeLength || 1}</div>
                    <div className="text-xs text-gray-400">Page{(stats?.resumeLength || 1) > 1 ? 's' : ''}</div>
                  </CardContent>
                </Card>
                <Card className="bg-zinc-900/50 border-zinc-700/50">
                  <CardContent className="p-4 text-center">
                    <Target className="h-6 w-6 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{stats?.skillsCount || 0}</div>
                    <div className="text-xs text-gray-400">Skills Found</div>
                  </CardContent>
                </Card>
                <Card className="bg-zinc-900/50 border-zinc-700/50">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{stats?.keywordMatch ?? 'N/A'}%</div>
                    <div className="text-xs text-gray-400">Keyword Match</div>
                  </CardContent>
                </Card>
                <Card className="bg-zinc-900/50 border-zinc-700/50">
                  <CardContent className="p-4 text-center">
                    <CheckCircle className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                    <div className="text-lg font-bold text-white">{stats?.atsCompatibility || 'Unknown'}</div>
                    <div className="text-xs text-gray-400">ATS Score</div>
                  </CardContent>
                </Card>
              </div>

              {/* Strengths Section */}
              <Card className="bg-zinc-900/40 border-zinc-700/50">
                <CardHeader className="cursor-pointer" onClick={() => toggleSection('strengths')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <CardTitle className="text-xl text-green-400">Strengths ({strengths.length})</CardTitle>
                    </div>
                    {expandedSections.strengths ? 
                      <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    }
                  </div>
                </CardHeader>
                {expandedSections.strengths && (
                  <CardContent>
                    <div className="grid gap-3">
                      {strengths.length > 0 ? strengths.map((strength, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-green-950/30 border border-green-800/30 rounded-lg">
                          <Star className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-200">{strength}</span>
                        </div>
                      )) : (
                        <div className="text-gray-400 italic text-center py-4">No specific strengths identified</div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Areas for Improvement */}
              <Card className="bg-zinc-900/40 border-zinc-700/50">
                <CardHeader className="cursor-pointer" onClick={() => toggleSection('improvements')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-400" />
                      <CardTitle className="text-xl text-yellow-400">Areas for Improvement ({areasForImprovement.length})</CardTitle>
                    </div>
                    {expandedSections.improvements ? 
                      <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    }
                  </div>
                </CardHeader>
                {expandedSections.improvements && (
                  <CardContent>
                    <div className="grid gap-3">
                      {areasForImprovement.length > 0 ? areasForImprovement.map((area, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-yellow-950/30 border border-yellow-800/30 rounded-lg">
                          <Target className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-200">{area}</span>
                        </div>
                      )) : (
                        <div className="text-gray-400 italic text-center py-4">No specific improvements identified</div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* High-Impact Keywords */}
              {stats?.highImpactKeywords && stats.highImpactKeywords.length > 0 && (
                <Card className="bg-zinc-900/40 border-zinc-700/50">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-purple-400" />
                      <CardTitle className="text-xl text-purple-400">High-Impact Keywords Used</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {stats.highImpactKeywords.map((keyword: string, i: number) => (
                        <Badge key={i} variant="secondary" className="bg-purple-950/50 text-purple-200 border-purple-800/30">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Detailed Analysis */}
              <Card className="bg-zinc-900/40 border-zinc-700/50">
                <CardHeader className="cursor-pointer" onClick={() => toggleSection('suggestions')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-400" />
                      <CardTitle className="text-xl text-blue-400">Full Analysis Report</CardTitle>
                    </div>
                    {expandedSections.suggestions ? 
                      <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    }
                  </div>
                </CardHeader>
                {expandedSections.suggestions && (
                  <CardContent>
                    <div className="prose prose-invert max-w-none">
                      {analysis ? (
                        <div className="space-y-6">
                          {/* Parse and display sections properly */}
                          {(() => {
                            const sections = [];
                            const lines = analysis.split('\n');
                            let currentSection = '';
                            let currentContent = [];
                            
                            for (let i = 0; i < lines.length; i++) {
                              const line = lines[i].trim();
                              
                              // Check if this is a section header (all caps)
                              if (line && line === line.toUpperCase() && line.length > 5 && !line.includes('Overall Score:')) {
                                // Save previous section
                                if (currentSection && currentContent.length > 0) {
                                  sections.push({
                                    title: currentSection,
                                    content: currentContent.filter(l => l.trim()).join('\n\n')
                                  });
                                }
                                // Start new section
                                currentSection = line;
                                currentContent = [];
                              } else if (line) {
                                currentContent.push(line);
                              }
                            }
                            
                            // Add the last section
                            if (currentSection && currentContent.length > 0) {
                              sections.push({
                                title: currentSection,
                                content: currentContent.filter(l => l.trim()).join('\n\n')
                              });
                            }
                            
                            return sections.map((section, index) => (
                              <div key={index} className="mb-8">
                                <h3 className="text-xl font-semibold text-blue-300 mb-4 border-b border-zinc-700 pb-2">
                                  {section.title.toLowerCase().split(' ').map(word => 
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                  ).join(' ')}
                                </h3>
                                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                                  {section.content}
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      ) : (
                        <div className="text-gray-400 italic text-center py-4">No analysis available</div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Technical Details */}
              <Card className="bg-zinc-900/40 border-zinc-700/50">
                <CardHeader className="cursor-pointer" onClick={() => toggleSection('details')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <CardTitle className="text-xl text-gray-400">Technical Details</CardTitle>
                    </div>
                    {expandedSections.details ? 
                      <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    }
                  </div>
                </CardHeader>
                {expandedSections.details && (
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">File Type:</span>
                          <span className="text-gray-200">{stats?.fileType || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">File Size:</span>
                          <span className="text-gray-200">{stats?.fileSize ? `${(stats.fileSize / 1024).toFixed(1)} KB` : 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Resume Length:</span>
                          <span className="text-gray-200">{stats?.resumeLength || 1} page(s)</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Skills Detected:</span>
                          <span className="text-gray-200">{stats?.skillsCount || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">ATS Compatibility:</span>
                          <span className="text-gray-200">{stats?.atsCompatibility || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Keyword Match:</span>
                          <span className="text-gray-200">{stats?.keywordMatch ?? 'N/A'}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center pt-4">
                <Button 
                  onClick={generatePDF} 
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <Download className="h-4 w-4" /> Download Report
                </Button>
                
                <Button 
                  variant="outline" 
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                  onClick={() => {
                    if (navigator.share && formattedAnalysis) {
                      navigator.share({
                        title: 'Resume Analysis Report',
                        text: `Resume analysis score: ${score}%`,
                        url: window.location.href
                      });
                    } else {
                      toast({
                        title: "Info",
                        description: "Sharing not supported on this device",
                      });
                    }
                  }}
                >
                  <Share2 className="h-4 w-4" /> Share
                </Button>

                <Button 
                  variant="outline" 
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                  onClick={() => window.print()}
                >
                  <Printer className="h-4 w-4" /> Print
                </Button>

                <Button 
                  variant="outline" 
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                  onClick={() => {
                    setAnalysis("");
                    setFormattedAnalysis(null);
                    setScore(null);
                    setStrengths([]);
                    setAreasForImprovement([]);
                    setStats(null);
                    setFile(null);
                    setJobTitle("");
                    setCompany("");
                    setJobDescription("");
                  }}
                >
                  <RefreshCw className="h-4 w-4" /> New Analysis
                </Button>

                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex items-center gap-2">
                  <Award className="h-4 w-4" /> Get Expert Coaching
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 