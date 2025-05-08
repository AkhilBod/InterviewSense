"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";

export default function ResumeCheckerPage() {
  const [resume, setResume] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobAd, setJobAd] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResume(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    // TODO: Call API route to analyze resume
    setTimeout(() => {
      setResult("(Gemini feedback will appear here)");
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto">
        <Card className="bg-zinc-800/50 border-zinc-700/50 shadow-xl">
          <CardHeader className="text-center pt-8">
            <CardTitle className="text-2xl font-bold">Resume Checker</CardTitle>
            <p className="text-zinc-400 mt-2 text-base">Upload your resume and get instant AI-powered feedback and suggestions.</p>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Upload Resume (PDF, DOC, DOCX)</label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-zinc-800/50 hover:bg-zinc-700/50 border-zinc-700/50 text-zinc-300"
                    onClick={() => document.getElementById('resume-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {resume ? resume.name : 'Upload Resume'}
                  </Button>
                  <input
                    id="resume-upload"
                    name="resume-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeChange}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Target Job Title</label>
                <Input
                  placeholder="e.g. Software Engineer"
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Target Company (Optional)</label>
                <Input
                  placeholder="e.g. Google, Amazon"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Job Description (Optional)</label>
                <Textarea
                  placeholder="Paste the job description here for more personalized feedback..."
                  value={jobAd}
                  onChange={e => setJobAd(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-full py-6"
                size="lg"
                disabled={isLoading || !resume || !jobTitle}
              >
                {isLoading ? 'Analyzing...' : 'Check Resume'}
              </Button>
            </form>
            {result && (
              <div className="mt-6 p-4 bg-zinc-900/70 border border-zinc-700 rounded-lg text-zinc-200">
                <strong>AI Feedback:</strong>
                <div className="mt-2 whitespace-pre-line">{result}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 