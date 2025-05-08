"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Download, Upload } from "lucide-react"; // Added Upload icon

export default function CoverLetterGenerator() {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidatePhone, setCandidatePhone] = useState("");
  const [resume, setResume] = useState<File | null>(null); // State for the resume file
  const [resumeName, setResumeName] = useState<string>(""); // State for the resume file name
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    setGeneratedCoverLetter(null);
    setError(null);

    if (!jobTitle || !company || !candidateName || !candidateEmail || !candidatePhone) {
      setError("Please fill out all required fields marked with an asterisk (*).");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("jobTitle", jobTitle);
    formData.append("company", company);
    formData.append("candidateName", candidateName);
    formData.append("candidateEmail", candidateEmail);
    formData.append("candidatePhone", candidatePhone);

    if (jobDescription) {
      formData.append("jobDescription", jobDescription);
    }
    if (resume) {
      formData.append("resume", resume); // Append the resume file
    }

    try {
      const response = await fetch("/api/generate-cover-letter", {
        method: "POST",
        body: formData, // FormData will handle the multipart/form-data encoding
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate cover letter. Please try again.");
      }

      setGeneratedCoverLetter(data.coverLetter);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedCoverLetter) return;

    const element = document.createElement("a");
    const file = new Blob([generatedCoverLetter], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Cover_Letter_${company}_${jobTitle.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto">
        <Card className="bg-zinc-800/50 border-zinc-700/50 shadow-xl">
          <CardHeader className="text-center pt-8">
            <CardTitle className="text-2xl font-bold">Cover Letter Generator</CardTitle>
            <p className="text-zinc-400 mt-2 text-base">
              Generate a tailored cover letter for your job application in seconds.
            </p>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <p className="text-sm text-zinc-400 mb-4">Fields marked with <span className="text-red-500">*</span> are required</p>
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-zinc-300">Job Details</h3>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Target Job Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Software Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    required
                    className="bg-zinc-700/50 border-zinc-600 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Google, Amazon"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                    className="bg-zinc-700/50 border-zinc-600 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Job Description (Optional but recommended)
                  </label>
                  <Textarea
                    placeholder="Paste the job description here for a more personalized cover letter..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[100px] bg-zinc-700/50 border-zinc-600 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-zinc-300">Your Information</h3>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. John Doe"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    required
                    className="bg-zinc-700/50 border-zinc-600 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g. john@example.com"
                      type="email"
                      value={candidateEmail}
                      onChange={(e) => setCandidateEmail(e.target.value)}
                      required
                      className="bg-zinc-700/50 border-zinc-600 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g. (123) 456-7890"
                      value={candidatePhone}
                      onChange={(e) => setCandidatePhone(e.target.value)}
                      required
                      className="bg-zinc-700/50 border-zinc-600 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Resume Upload Section */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Upload Resume (Optional - PDF, DOC, DOCX, TXT)
                  </label>
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
                      name="resume" // Name attribute is good practice for forms
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
              </div>

              {error && (
                <div className="rounded-lg bg-red-900/30 border border-red-800 text-red-200 p-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <div className="text-sm">{error}</div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-full py-3 text-base font-semibold" // Adjusted padding and font for better look
                size="lg" // Size prop might be overridden by className, ensure consistency
                disabled={isLoading || !jobTitle || !company || !candidateName || !candidateEmail || !candidatePhone}
              >
                {isLoading ? "Generating..." : "Generate Cover Letter"}
              </Button>
            </form>

            {generatedCoverLetter && (
              <div className="mt-8"> {/* Increased margin-top */}
                <div className="flex items-center justify-between mb-4"> {/* Increased margin-bottom */}
                  <h3 className="text-lg font-medium flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-2" /> {/* Slightly larger icon, adjusted color */}
                    Your Cover Letter
                  </h3>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-zinc-800 hover:bg-zinc-700/70 border-zinc-700 text-zinc-300"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                <div className="p-4 bg-zinc-900/70 border border-zinc-700 rounded-lg text-zinc-200 whitespace-pre-line leading-relaxed"> {/* Added leading-relaxed */}
                  {generatedCoverLetter}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}