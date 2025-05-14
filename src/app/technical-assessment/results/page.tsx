"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, BarChart, MessageSquare, ChevronLeft, Download, Printer, Share2, Brain } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { toast } from "@/components/ui/use-toast";
import { exportToPDF, printReport, shareReport, formatTechnicalReportForSharing } from "@/lib/export";

export interface TechnicalAssessmentResult {
  company: string;
  role: string;
  date: string;
  difficulty: string;
  questions: TechnicalQuestionResult[];
  overallScore: number;
  strengths: string[];
  improvementAreas: string[];
  codeFeedback: string;
  explanationFeedback: string;
}

export interface TechnicalQuestionResult {
  id: number;
  leetCodeTitle: string;
  prompt: string;
  code: string;
  codeLanguage: string;
  codeScore: number;
  explanation: string;
  explanationScore: number;
  audioUrl?: string | null;
  feedback?: string;
}

export default function TechnicalAssessmentResultsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<TechnicalAssessmentResult | null>(null);

  useEffect(() => {
    const loadResults = async () => {
      setIsLoading(true);
      try {
        // First try to get the assessment data from localStorage
        const assessmentDataStr = localStorage.getItem("technicalAssessmentData");
        
        if (!assessmentDataStr) {
          // If no data found, show sample data
          toast({ title: "No assessment data found", description: "Using sample data.", variant: "destructive" });
          setResult({
            company: "Sample Corp",
            role: "Software Engineer",
            date: new Date().toLocaleDateString(),
            difficulty: "Medium",
            overallScore: 78,
            strengths: ["Efficient code", "Clear explanation"],
            improvementAreas: ["Edge case handling", "Code comments"],
            codeFeedback: "Your code is efficient but could use more comments.",
            explanationFeedback: "Good explanation, but mention edge cases.",
            questions: [
              {
                id: 1,
                leetCodeTitle: "Two Sum",
                prompt: "Given an array of integers...",
                code: "function twoSum(nums, target) {\n  const map = {};\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map[complement] !== undefined) {\n      return [map[complement], i];\n    }\n    map[nums[i]] = i;\n  }\n}",
                codeLanguage: "javascript",
                codeScore: 85,
                explanation: "I used a hash map to store...",
                explanationScore: 80,
                audioUrl: null,
                feedback: "Efficient, but add edge case discussion."
              }
            ]
          });
          setIsLoading(false);
          return;
        }

        // Parse the assessment data
        const assessmentData = JSON.parse(assessmentDataStr);
        
        // Check if we already have analyzed results
        const analyzed = localStorage.getItem("technicalAssessmentResult");
        if (analyzed) {
          setResult(JSON.parse(analyzed));
          setIsLoading(false);
          return;
        }
        
        // If we have data but no analysis yet, send to Gemini for analysis
        const question = assessmentData.questions[0];
        
        toast({ 
          title: "Analyzing your solution", 
          description: "This may take a few moments..." 
        });
        
        try {
          // Send the solution and explanation to Gemini for analysis
          const response = await fetch('/api/technical-assessment', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              company: assessmentData.company,
              role: assessmentData.role,
              difficulty: assessmentData.difficulty,
              question: question.prompt,
              code: question.code,
              explanation: question.explanation
            }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to analyze solution');
          }
          
          const analysis = await response.json();
          
          // Log the received analysis for debugging
          console.log("Analysis received from API:", analysis);
          
          // Create the full result object with proper type checking
          const fullResult: TechnicalAssessmentResult = {
            company: assessmentData.company,
            role: assessmentData.role,
            date: new Date(assessmentData.date).toLocaleDateString(),
            difficulty: assessmentData.difficulty,
            overallScore: typeof analysis.overallScore === 'number' ? analysis.overallScore : 0,
            strengths: Array.isArray(analysis.strengths) ? analysis.strengths : ["Good effort"],
            improvementAreas: Array.isArray(analysis.improvementAreas) ? analysis.improvementAreas : ["Practice more"],
            codeFeedback: typeof analysis.codeFeedback === 'string' ? analysis.codeFeedback : "No specific code feedback available.",
            explanationFeedback: typeof analysis.explanationFeedback === 'string' ? analysis.explanationFeedback : "No specific explanation feedback available.",
            questions: [{
              id: 1,
              leetCodeTitle: question.leetCodeTitle,
              prompt: question.prompt,
              code: question.code,
              codeLanguage: "javascript", // Could be improved with language detection
              codeScore: typeof analysis.codeScore === 'number' ? analysis.codeScore : 0,
              explanation: question.explanation,
              explanationScore: typeof analysis.explanationScore === 'number' ? analysis.explanationScore : 0,
              audioUrl: question.audioUrl,
              feedback: `Code: ${typeof analysis.codeFeedback === 'string' ? analysis.codeFeedback : "No feedback"} | Explanation: ${typeof analysis.explanationFeedback === 'string' ? analysis.explanationFeedback : "No feedback"}`
            }]
          };
          
          // Store the results and set state
          localStorage.setItem("technicalAssessmentResult", JSON.stringify(fullResult));
          
          // Clear the raw assessment data to avoid conflicts on future assessments
          localStorage.removeItem("technicalAssessmentData");
          
          setResult(fullResult);
          
        } catch (analysisError) {
          console.error('Error analyzing solution:', analysisError);
          toast({ 
            title: "Analysis failed", 
            description: "Using partial data without scores.", 
            variant: "destructive" 
          });
          
          // Create a result with the data we have, but no scores
          const partialResult: TechnicalAssessmentResult = {
            company: assessmentData.company,
            role: assessmentData.role,
            date: new Date(assessmentData.date).toLocaleDateString(),
            difficulty: assessmentData.difficulty,
            overallScore: 0,
            strengths: ["Could not analyze solution"],
            improvementAreas: ["Try again later"],
            codeFeedback: "Analysis failed",
            explanationFeedback: "Analysis failed",
            questions: [{
              id: 1,
              leetCodeTitle: question.leetCodeTitle || "Technical Question",
              prompt: question.prompt,
              code: question.code,
              codeLanguage: "javascript",
              codeScore: 0,
              explanation: question.explanation,
              explanationScore: 0,
              audioUrl: question.audioUrl,
              feedback: "Analysis failed"
            }]
          };
          
          setResult(partialResult);
        }
        
      } catch (error) {
        console.error('Error loading assessment data:', error);
        toast({ 
          title: "Error loading data", 
          description: "Using sample data.", 
          variant: "destructive" 
        });
        
        // Set sample data as fallback with comprehensive feedback
        setResult({
          company: "Sample Corp",
          role: "Software Engineer",
          date: new Date().toLocaleDateString(),
          difficulty: "Medium",
          overallScore: 78,
          strengths: ["Efficient code", "Clear explanation"],
          improvementAreas: ["Edge case handling", "Code comments"],
          codeFeedback: "Your code solution is efficient with a time complexity of O(n) which is optimal for this problem. The hash map approach allows for constant-time lookups. However, you could improve by adding comments to explain your approach and handling edge cases like empty arrays or no valid solution. Also, consider adding a return statement for when no solution is found rather than implicitly returning undefined.",
          explanationFeedback: "Your explanation of using a hash map demonstrates good understanding of data structures and algorithm complexity. To improve, explicitly mention the time and space complexity analysis. Also discuss how you handle edge cases and why your approach is better than alternatives like the naive O(n²) solution using nested loops.",
          questions: [
            {
              id: 1,
              leetCodeTitle: "Two Sum",
              prompt: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
              code: "function twoSum(nums, target) {\n  const map = {};\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map[complement] !== undefined) {\n      return [map[complement], i];\n    }\n    map[nums[i]] = i;\n  }\n}",
              codeLanguage: "javascript",
              codeScore: 85,
              explanation: "I used a hash map to store each number as a key and its index as the value. For each number, I calculate the complement (target - current number) and check if it already exists in the hash map. If it does, I've found the pair that adds up to the target, and I return their indices.",
              explanationScore: 80,
              audioUrl: null,
              feedback: "Efficient solution using a hash map with O(n) time complexity. Consider adding edge case handling and improving variable naming for better readability."
            }
          ]
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadResults();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 75) return "text-blue-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  if (isLoading || !result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-zinc-400">Analyzing your technical assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-slate-900 text-white">
        {/* Header */}
        <header className="border-b border-slate-800">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-blue-500" />
              <span className="font-bold text-xl">InterviewSense</span>
            </div>
            <Button variant="outline" size="sm" asChild className="text-slate-300 border-slate-700 hover:bg-slate-800">
              <Link href="/">Home</Link>
            </Button>
          </div>
        </header>

        <div className="flex-1 py-8 bg-slate-900">
          <div className="container mx-auto px-4">
            <div className="mb-6">
              <Button variant="ghost" size="sm" asChild className="gap-2 text-slate-300 hover:text-white hover:bg-slate-800">
                <Link href="/dashboard/technical">
                  <ChevronLeft className="h-4 w-4" />
                  Back to Technical Assessment
                </Link>
              </Button>
            </div>

            <div id="technical-results-content" className="max-w-5xl mx-auto">
              {/* Summary Card */}
              <Card className="mb-8 bg-slate-800 border-slate-700 text-slate-100">
                <CardHeader className="pb-4 border-b border-slate-700">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div>
                      <CardTitle className="text-2xl">Technical Assessment Summary</CardTitle>
                      <CardDescription className="mt-1 text-slate-400">
                        {result.role} at {result.company} • {result.date} • {result.difficulty}
                      </CardDescription>
                    </div>
                    <div className="mt-4 md:mt-0 flex flex-col items-center justify-center">
                      <div className="text-3xl font-bold mb-1 text-blue-500">{result.overallScore}%</div>
                      <div className="text-sm text-slate-400">Overall Score</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-sm mb-2 text-slate-300">Strengths</h3>
                      <div className="flex flex-wrap gap-2">
                        {result.strengths.map((strength) => (
                          <Badge key={strength} className="bg-green-700 text-green-100 hover:bg-green-600">
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm mb-2 text-slate-300">Areas for Improvement</h3>
                      <div className="flex flex-wrap gap-2">
                        {result.improvementAreas.map((area) => (
                          <Badge key={area} className="bg-yellow-700 text-yellow-100 hover:bg-yellow-600">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="flex flex-wrap gap-2 w-full justify-center md:justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800"
                      onClick={() => exportToPDF('technical-results-content', `Technical_Assessment_${result.role.replace(/\s+/g, '_')}_${result.date}`)}
                    >
                      <Download className="h-4 w-4" /> Download Report
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800"
                      onClick={printReport}
                    >
                      <Printer className="h-4 w-4" /> Print
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800"
                      onClick={() => shareReport(
                        `Technical Assessment for ${result.role} at ${result.company}`,
                        formatTechnicalReportForSharing(result)
                      )}
                    >
                      <Share2 className="h-4 w-4" /> Share
                    </Button>
                  </div>
                </CardFooter>
              </Card>

              {/* Questions, Code, Audio & Explanation */}
              <div className="space-y-8 mb-8">
                {Array.isArray(result?.questions) && result.questions.map((q) => (
                  <Card key={q.id} className="bg-slate-800 border-slate-700 text-slate-100">
                    <CardHeader>
                      <CardTitle className="text-lg">{q.leetCodeTitle}</CardTitle>
                      <CardDescription className="text-slate-400">{q.prompt}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-2">
                        <span className="text-xs text-slate-400">Your Code:</span>
                        <pre className="bg-slate-900 rounded p-3 mt-1 overflow-x-auto text-sm border border-slate-700">
                          <code>{q.code}</code>
                        </pre>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-slate-400">Code Score:</span>
                          <span className={`font-bold ${getScoreColor(q.codeScore)}`}>{q.codeScore}%</span>
                        </div>
                      </div>
                      <div className="mb-2">
                        <span className="text-xs text-slate-400">Your Explanation:</span>
                        <div className="bg-slate-900 rounded p-3 mt-1 text-sm border border-slate-700">
                          {q.explanation}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-slate-400">Explanation Score:</span>
                          <span className={`font-bold ${getScoreColor(q.explanationScore)}`}>{q.explanationScore}%</span>
                        </div>
                      </div>
                      {q.audioUrl && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-green-400">Recorded Explanation:</span>
                            <Badge className="bg-green-700 text-green-100">Transcribed</Badge>
                          </div>
                          <div className="bg-slate-900 rounded p-3 border border-slate-700 mb-2">
                            <audio controls src={q.audioUrl} className="w-full" />
                            <p className="text-xs text-slate-400 mt-2">The audio above has been transcribed into your explanation.</p>
                          </div>
                        </div>
                      )}
                      {q.feedback && (
                        <div className="mt-4 p-3 bg-blue-900/30 rounded-lg border border-blue-800">
                          <h4 className="text-sm font-medium text-blue-400 mb-1">Quick Feedback</h4>
                          <p className="text-blue-100 text-sm">{q.feedback}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* AI Coach */}
              <Card className="mb-8 bg-slate-800 border-slate-700 text-slate-100">
                <CardHeader className="border-b border-slate-700">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-400" />
                    AI Coach Feedback
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Personalized advice to improve your technical interview performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6 text-slate-300">
                    <div>
                      <h3 className="font-semibold text-white flex items-center gap-2 mb-3">
                        <Badge className="bg-blue-600">Code Feedback</Badge>
                      </h3>
                      <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 mb-2 text-sm leading-relaxed">
                        {result.codeFeedback || "No specific code feedback available. Try submitting another solution."}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-white flex items-center gap-2 mb-3">
                        <Badge className="bg-green-600">Explanation Feedback</Badge>
                      </h3>
                      <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 text-sm leading-relaxed">
                        {result.explanationFeedback || "No specific explanation feedback available. Try recording a more detailed explanation."}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t border-slate-700 pt-4">
                  <Button variant="outline" size="sm" className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800">
                    <RefreshCw className="h-4 w-4" />
                    Get More Feedback
                  </Button>
                </CardFooter>
              </Card>

              {/* Next Steps */}
              <Card className="bg-slate-800 border-slate-700 text-slate-100">
                <CardHeader>
                  <CardTitle className="text-lg">What's Next?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-auto max-w-2xl">
                    <Button className="h-auto py-6 flex flex-col bg-blue-600 hover:bg-blue-700 text-white" asChild>
                      <Link href="/dashboard/technical">
                        <RefreshCw className="h-6 w-6 mb-2" />
                        <span className="text-base font-medium">Try Another Problem</span>
                        <span className="text-xs mt-1">Practice a new LeetCode question</span>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto py-6 flex flex-col border-slate-700 text-slate-300 hover:bg-slate-800" asChild>
                      <Link href="/dashboard/technical">
                        <BarChart className="h-6 w-6 mb-2" />
                        <span className="text-base font-medium">Retry Assessment</span>
                        <span className="text-xs text-slate-400 mt-1">Apply feedback and improve</span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <footer className="py-6 border-t border-slate-800 bg-slate-900 mt-auto">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center">
              <p className="text-sm text-slate-500">© {new Date().getFullYear()} InterviewSense. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
}
