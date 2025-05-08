"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function ResumeChecker() {
  const [file, setFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    console.log("🔍 Resume Checker Component Loaded - Check browser console (F12) for logs");
  }, []);

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

          {analysis && (
            <div className="mt-8 space-y-4">
              <h3 className="text-xl font-semibold">Analysis Results</h3>
              <div className="prose prose-sm max-w-none bg-zinc-900/50 p-4 rounded-lg">
                {analysis.split("\n").map((line, i) => (
                  <p key={i} className="mb-2">{line}</p>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 