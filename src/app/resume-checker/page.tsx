"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, AlertCircle } from "lucide-react";

export default function ResumeCheckerPage() {
  const [resume, setResume] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setResume(selectedFile);
    setError(null); // Clear any previous error when a new file is selected
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setError(null);

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

      setResult(data.analysis);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto">
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
            {result && (
              <div className="mt-6 p-4 bg-zinc-900/70 border border-zinc-700 rounded-lg text-zinc-200">
                <h3 className="text-lg font-medium mb-3">AI Feedback:</h3>
                <div className="mt-2 whitespace-pre-line">{result}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}