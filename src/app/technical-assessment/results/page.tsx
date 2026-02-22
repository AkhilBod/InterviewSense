"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, BarChart, MessageSquare, ChevronLeft, Download, Printer, Share2, User, CheckCircle, TrendingUp, ArrowLeft } from "lucide-react";
import Image from 'next/image';
import ProtectedRoute from "@/components/ProtectedRoute";
import { toast } from "@/components/ui/use-toast";
import { exportToPDF, printReport, shareReport, formatTechnicalReportForSharing } from "@/lib/export";
import { useSession, signOut } from "next-auth/react";
import { UserAccountDropdown } from '@/components/UserAccountDropdown';

// Helper function to parse LeetCode problem from text
function parseLeetCodeProblem(problemText: string) {
  const lines = problemText.split('\n').filter(line => line.trim());
  
  let number = 0;
  let title = '';
  let difficulty = 'Medium';
  let description = '';
  let examples: { input: string; output: string; explanation: string }[] = [];
  let constraints: string[] = [];
  
  let currentSection = '';
  let currentExample: any = {};
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Extract problem number and title
    if (line.match(/^\*\*Problem:\*\*\s*(\d+)\.\s*(.+)$/)) {
      const match = line.match(/^\*\*Problem:\*\*\s*(\d+)\.\s*(.+)$/);
      if (match) {
        number = parseInt(match[1]);
        title = match[2];
      }
      continue;
    }
    
    // Extract difficulty
    if (line.includes('medium-difficulty') || line.includes('Medium')) {
      difficulty = 'Medium';
    } else if (line.includes('easy') || line.includes('Easy')) {
      difficulty = 'Easy';
    } else if (line.includes('hard') || line.includes('Hard')) {
      difficulty = 'Hard';
    }
    
    // Handle different sections
    if (line.startsWith('**Problem Statement:**')) {
      currentSection = 'description';
      continue;
    }
    if (line.startsWith('**Example') || line.startsWith('**Examples:**')) {
      currentSection = 'examples';
      if (Object.keys(currentExample).length > 0) {
        examples.push(currentExample);
        currentExample = {};
      }
      continue;
    }
    if (line.startsWith('**Constraints:**')) {
      currentSection = 'constraints';
      if (Object.keys(currentExample).length > 0) {
        examples.push(currentExample);
        currentExample = {};
      }
      continue;
    }
    
    // Process content based on current section
    if (currentSection === 'description') {
      if (!line.startsWith('**') && line.length > 0) {
        description += (description ? '\n' : '') + line;
      }
    } else if (currentSection === 'examples') {
      if (line.startsWith('```') || line.includes('storeLog') || line.includes('retrieveLogs')) {
        // Skip code blocks
        continue;
      }
      // Try to extract input/output/explanation patterns
      if (line.includes('Input:') || line.includes('Output:') || line.includes('Explanation:')) {
        const inputMatch = line.match(/Input:\s*(.+)/);
        const outputMatch = line.match(/Output:\s*(.+)/);
        const explanationMatch = line.match(/Explanation:\s*(.+)/);
        
        if (inputMatch) currentExample.input = inputMatch[1];
        if (outputMatch) currentExample.output = outputMatch[1];
        if (explanationMatch) currentExample.explanation = explanationMatch[1];
      }
    } else if (currentSection === 'constraints') {
      if (line.startsWith('* ') || line.startsWith('- ')) {
        constraints.push(line.substring(2));
      } else if (line.length > 0 && !line.startsWith('**')) {
        constraints.push(line);
      }
    }
  }
  
  // Add last example if exists
  if (Object.keys(currentExample).length > 0) {
    examples.push(currentExample);
  }
  
  // Fallback parsing if structured parsing fails
  if (!title && lines.length > 0) {
    title = lines[0].replace(/^\*\*Problem:\*\*\s*\d+\.\s*/, '').replace(/\*\*/g, '');
    number = 635; // Default for Design Log Storage System
  }
  
  if (!description) {
    // Find description between title and examples
    const startIdx = lines.findIndex(line => line.includes('Problem Statement') || line.includes('You are given'));
    const endIdx = lines.findIndex(line => line.includes('Example'));
    if (startIdx !== -1 && endIdx !== -1) {
      description = lines.slice(startIdx + 1, endIdx).join('\n');
    } else {
      description = problemText.substring(0, 500) + '...'; // Fallback
    }
  }
  
  return {
    number,
    title,
    difficulty: difficulty as 'Easy' | 'Medium' | 'Hard',
    description: description.trim(),
    examples,
    constraints,
    followUp: "What if there are a lot of merges and the number of disjoint intervals is small compared to the data stream's size?"
  };
}

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
  const { data: session } = useSession();
  const [zoom, setZoom] = useState(1);

  // Function to dynamically calculate PDF scale
  function calculatePDFScale(containerWidth: number, pageWidth: number): number {
    return containerWidth / pageWidth;
  }

  useEffect(() => {
    const loadResults = async () => {
      setIsLoading(true);
      try {
        // First check for already analyzed results
        const analyzed = localStorage.getItem("technicalAssessmentResult");
        if (analyzed) {
          setResult(JSON.parse(analyzed));
          setIsLoading(false);
          return;
        }

        // If no analyzed results, check for raw assessment data
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

        // Parse the assessment data and analyze it
        const assessmentData = JSON.parse(assessmentDataStr);
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
          
          const analysis = await response.json();
          
          // Handle API errors gracefully
          if (!response.ok || !analysis.success) {
            console.warn('API returned error, using fallback data:', analysis.error);
            // Use the fallback data provided by the API
            const fullResult: TechnicalAssessmentResult = {
              company: assessmentData.company,
              role: assessmentData.role,
              date: new Date(assessmentData.date).toLocaleDateString(),
              difficulty: assessmentData.difficulty,
              overallScore: analysis.overallScore || 50,
              strengths: analysis.strengths || ["Code submitted successfully"],
              improvementAreas: analysis.improvementAreas || ["Unable to analyze automatically"],
              codeFeedback: analysis.codeFeedback || "Analysis failed",
              explanationFeedback: analysis.explanationFeedback || "Analysis failed",
              questions: [{
                id: 1,
                leetCodeTitle: question.leetCodeTitle,
                prompt: question.prompt,
                code: question.code,
                codeLanguage: "javascript",
                codeScore: analysis.codeScore || 50,
                explanation: question.explanation,
                explanationScore: analysis.explanationScore || 50,
                audioUrl: question.audioUrl,
                feedback: "Analysis failed - please try again later"
              }]
            };
            
            localStorage.setItem("technicalAssessmentResult", JSON.stringify(fullResult));
            localStorage.removeItem("technicalAssessmentData");
            setResult(fullResult);
            return;
          }
          
          // Create the full result object
          const fullResult: TechnicalAssessmentResult = {
            company: assessmentData.company,
            role: assessmentData.role,
            date: new Date(assessmentData.date).toLocaleDateString(),
            difficulty: assessmentData.difficulty,
            overallScore: analysis.overallScore || 0,
            strengths: analysis.strengths || ["Good effort"],
            improvementAreas: analysis.improvementAreas || ["Practice more"],
            codeFeedback: analysis.codeFeedback || "No specific code feedback available.",
            explanationFeedback: analysis.explanationFeedback || "No specific explanation feedback available.",
            questions: [{
              id: 1,
              leetCodeTitle: question.leetCodeTitle,
              prompt: question.prompt,
              code: question.code,
              codeLanguage: "javascript",
              codeScore: analysis.codeScore || 0,
              explanation: question.explanation,
              explanationScore: analysis.explanationScore || 0,
              audioUrl: question.audioUrl,
              feedback: `Code: ${analysis.codeFeedback || "No feedback"} | Explanation: ${analysis.explanationFeedback || "No feedback"}`
            }]
          };
          
          // Store the results and set state
          localStorage.setItem("technicalAssessmentResult", JSON.stringify(fullResult));
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
        
        // Set sample data as fallback
        setResult({
          company: "Sample Corp",
          role: "Software Engineer",
          date: new Date().toLocaleDateString(),
          difficulty: "Medium",
          overallScore: 78,
          strengths: ["Efficient code", "Clear explanation"],
          improvementAreas: ["Edge case handling", "Code comments"],
          codeFeedback: "Your code solution is efficient...",
          explanationFeedback: "Your explanation demonstrates good understanding...",
          questions: [
            {
              id: 1,
              leetCodeTitle: "Two Sum",
              prompt: "Given an array of integers...",
              code: "function twoSum(nums, target) {...}",
              codeLanguage: "javascript",
              codeScore: 85,
              explanation: "I used a hash map to store...",
              explanationScore: 80,
              audioUrl: null,
              feedback: "Efficient solution using a hash map..."
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

  useEffect(() => {
    const container = document.querySelector('.pdf-preview-container') as HTMLElement | null;
    const canvas = document.querySelector('.pdf-canvas') as HTMLCanvasElement | null;

    if (container && canvas) {
      const containerWidth = container.clientWidth;
      const context = canvas.getContext('2d');

      if (context) {
        const viewport = context.canvas.getBoundingClientRect();
        const scale = calculatePDFScale(containerWidth, viewport.width);

        // Apply the calculated scale
        canvas.style.transform = `scale(${scale})`;
        canvas.style.transformOrigin = 'top left';
      }
    }
  }, []);

  // Zoom controls
  const handleZoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom + 0.1, 2)); // Max zoom level 2x
  };

  const handleZoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom - 0.1, 0.5)); // Min zoom level 0.5x
  };

  const handleResetZoom = () => {
    setZoom(1); // Reset to default zoom
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
        <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-[#000818]/80">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image src="https://i.ibb.co/hJC8n6NB/Generated-Image-February-20-2026-7-04-PM-Photoroom.png" alt="InterviewSense" width={50} height={50} className="object-contain" />
              <span className="font-bold text-xl text-white">InterviewSense</span>
            </Link>
            <nav className="flex items-center gap-4">
              <UserAccountDropdown />
            </nav>
          </div>
        </header>

        <div className="flex-1 py-8 bg-slate-900 pt-20">
          <div className="container mx-auto px-4">

            <div id="technical-results-content" className="max-w-5xl mx-auto">
              {/* Header */}
              <Card className="bg-slate-800 border-slate-700 text-slate-100 mb-4">
                <CardHeader className="text-center py-6">
                  <CardTitle className="text-2xl">Technical Assessment Report</CardTitle>
                  <CardDescription className="text-slate-400">
                    {result.role} at {result.company} • {result.date} • {result.difficulty} Difficulty
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Scores Section */}
              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-slate-100 shadow-xl mb-4">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
                    {/* Overall Score with Circular Progress */}
                    <div className="flex flex-col items-center bg-slate-700/30 rounded-2xl p-6 sm:p-8 min-w-[160px] mx-auto md:mx-0">
                      <div className="relative w-24 sm:w-28 h-24 sm:h-28 mb-3">
                        <svg className="w-24 sm:w-28 h-24 sm:h-28 transform -rotate-90" viewBox="0 0 100 100">
                          {/* Background circle */}
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="transparent"
                            className="text-slate-600/40"
                          />
                          {/* Progress circle */}
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="transparent"
                            strokeDasharray={`${2 * Math.PI * 42}`}
                            strokeDashoffset={`${2 * Math.PI * 42 * (1 - result.overallScore / 100)}`}
                            className={result.overallScore >= 80 ? 'text-green-400' : result.overallScore >= 60 ? 'text-yellow-400' : 'text-red-400'}
                            strokeLinecap="round"
                            style={{
                              filter: 'drop-shadow(0 0 8px currentColor)',
                              transition: 'all 0.3s ease'
                            }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-2xl sm:text-3xl font-bold ${result.overallScore >= 80 ? 'text-green-400' : result.overallScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {result.overallScore}
                          </span>
                          <span className="text-xs sm:text-sm text-slate-400 font-medium">/ 100</span>
                        </div>
                      </div>
                      <div className="text-sm sm:text-base font-semibold text-slate-300 tracking-wider">OVERALL</div>
                    </div>

                    {/* Individual Scores */}
                    <div className="flex-1 md:ml-10">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                        {/* Code Score */}
                        <div className="text-center bg-slate-700/20 rounded-xl p-4 sm:p-6 border border-slate-600/30 hover:bg-slate-700/30 transition-all duration-300">
                          <div className="text-sm sm:text-base font-bold text-slate-300 mb-2 sm:mb-3 tracking-wider">CODE QUALITY</div>
                          <div className={`text-2xl sm:text-3xl font-bold ${(result.questions?.[0]?.codeScore || 0) >= 80 ? 'text-green-400' : (result.questions?.[0]?.codeScore || 0) >= 60 ? 'text-yellow-400' : 'text-red-400'} mb-1 sm:mb-2`}>
                            {result.questions?.[0]?.codeScore || 0}
                          </div>
                          <div className="text-xs sm:text-sm text-slate-400 font-medium">/ 100</div>
                          <div className="mt-3 sm:mt-4 w-full bg-slate-600/30 rounded-full h-2 sm:h-3">
                            <div 
                              className={`h-2 sm:h-3 rounded-full transition-all duration-500 ${(result.questions?.[0]?.codeScore || 0) >= 80 ? 'bg-green-500' : (result.questions?.[0]?.codeScore || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${result.questions?.[0]?.codeScore || 0}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Explanation Score */}
                        <div className="text-center bg-slate-700/20 rounded-xl p-4 sm:p-6 border border-slate-600/30 hover:bg-slate-700/30 transition-all duration-300">
                          <div className="text-sm sm:text-base font-bold text-slate-300 mb-2 sm:mb-3 tracking-wider">EXPLANATION</div>
                          <div className={`text-2xl sm:text-3xl font-bold ${(result.questions?.[0]?.explanationScore || 0) >= 80 ? 'text-green-400' : (result.questions?.[0]?.explanationScore || 0) >= 60 ? 'text-yellow-400' : 'text-red-400'} mb-1 sm:mb-2`}>
                            {result.questions?.[0]?.explanationScore || 0}
                          </div>
                          <div className="text-xs sm:text-sm text-slate-400 font-medium">/ 100</div>
                          <div className="mt-3 sm:mt-4 w-full bg-slate-600/30 rounded-full h-2 sm:h-3">
                            <div 
                              className={`h-2 sm:h-3 rounded-full transition-all duration-500 ${(result.questions?.[0]?.explanationScore || 0) >= 80 ? 'bg-green-500' : (result.questions?.[0]?.explanationScore || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${result.questions?.[0]?.explanationScore || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Assessment Analytics */}
              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-slate-100 shadow-xl mb-4">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Assessment Analytics</CardTitle>
                  <CardDescription className="text-slate-400">
                    Comprehensive analysis of your technical performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  {/* Main Analytics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Overall Grade */}
                    <div className="bg-slate-700/40 rounded-2xl p-6 border border-slate-600/50 hover:border-slate-500/70 transition-all duration-300 hover:shadow-xl group">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div className="text-xs font-bold text-slate-400 tracking-widest">OVERALL GRADE</div>
                      </div>
                      <div className={`text-4xl font-black ${result.overallScore >= 80 ? 'text-green-400' : result.overallScore >= 70 ? 'text-yellow-400' : result.overallScore >= 60 ? 'text-orange-400' : 'text-red-400'} mb-2`}>
                        {result.overallScore >= 90 ? 'A' : result.overallScore >= 80 ? 'B' : result.overallScore >= 70 ? 'C' : result.overallScore >= 60 ? 'D' : 'F'}
                      </div>
                      <div className="text-slate-400">
                        {result.overallScore >= 80 ? 'Excellent' : result.overallScore >= 70 ? 'Good' : result.overallScore >= 60 ? 'Average' : 'Needs Work'}
                      </div>
                    </div>

                    {/* Difficulty Level */}
                    <div className="bg-slate-700/40 rounded-2xl p-6 border border-slate-600/50 hover:border-slate-500/70 transition-all duration-300 hover:shadow-xl group">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <div className="text-xs font-bold text-slate-400 tracking-widest">DIFFICULTY</div>
                      </div>
                      <div className="text-4xl mb-2">
                        {result.difficulty === 'Easy' ? '🟢' : result.difficulty === 'Medium' ? '🟡' : '🔴'}
                      </div>
                      <div className="text-slate-400">{result.difficulty}</div>
                    </div>

                    {/* Performance Level */}
                    <div className="bg-slate-700/40 rounded-2xl p-6 border border-slate-600/50 hover:border-slate-500/70 transition-all duration-300 hover:shadow-xl group">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div className="text-xs font-bold text-slate-400 tracking-widest">PERFORMANCE</div>
                      </div>
                      <div className={`text-4xl font-black text-green-400 mb-2`}>
                        {result.overallScore >= 85 ? '★★★' : result.overallScore >= 70 ? '★★☆' : '★☆☆'}
                      </div>
                      <div className="text-slate-400">
                        {result.overallScore >= 85 ? 'Strong' : result.overallScore >= 70 ? 'Good' : 'Developing'}
                      </div>
                    </div>

                    {/* Assessment Stats */}
                    <div className="bg-slate-700/40 rounded-2xl p-6 border border-slate-600/50 hover:border-slate-500/70 transition-all duration-300 hover:shadow-xl group">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="text-xs font-bold text-slate-400 tracking-widest">ASSESSMENT STATS</div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center">
                          <div className="bg-slate-600 text-white px-3 py-2 rounded-lg text-lg font-bold mb-1">
                            {result.questions?.length || 1}
                          </div>
                          <div className="text-slate-400 text-xs uppercase tracking-wide">Problems</div>
                        </div>
                        <div className="text-center">
                          <div className="bg-slate-600 text-white px-3 py-2 rounded-lg text-lg font-bold mb-1">
                            {result.strengths?.length || 0}
                          </div>
                          <div className="text-slate-400 text-xs uppercase tracking-wide">Strengths</div>
                        </div>
                        <div className="text-center">
                          <div className="bg-slate-600 text-white px-3 py-2 rounded-lg text-lg font-bold mb-1">
                            {result.improvementAreas?.length || 0}
                          </div>
                          <div className="text-slate-400 text-xs uppercase tracking-wide">To Improve</div>
                        </div>
                        <div className="text-center">
                          <div className="bg-slate-600 text-white px-3 py-2 rounded-lg text-lg font-bold mb-1">
                            ✓
                          </div>
                          <div className="text-slate-400 text-xs uppercase tracking-wide">Complete</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Strengths */}
              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-slate-100 shadow-xl mb-6">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-600/40 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-400" />
                    </div>
                    <span className="text-white">Key Strengths</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(result.strengths?.length || 0) > 0 ? result.strengths?.map((strength, index) => (
                      <div key={index} className="group bg-slate-600/30 hover:bg-slate-600/50 border border-slate-500/30 hover:border-slate-500/50 rounded-xl p-4 transition-all duration-300 hover:shadow-lg">
                        <div className="flex items-start gap-4">
                          <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center mt-0.5 group-hover:bg-green-500/30 transition-colors">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          </div>
                          <span className="text-slate-200 leading-relaxed flex-1">{strength}</span>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-slate-600/30 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="h-8 w-8 text-slate-500" />
                        </div>
                        <p className="text-slate-400 italic">No specific strengths identified in the analysis.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Areas for Improvement */}
              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-slate-100 shadow-xl mb-6">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-600/40 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-yellow-400" />
                    </div>
                    <span className="text-white">Areas for Improvement</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(result.improvementAreas?.length || 0) > 0 ? result.improvementAreas?.map((area, index) => (
                      <div key={index} className="group bg-slate-600/30 hover:bg-slate-600/50 border border-slate-500/30 hover:border-slate-500/50 rounded-xl p-4 transition-all duration-300 hover:shadow-lg">
                        <div className="flex items-start gap-4">
                          <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center mt-0.5 group-hover:bg-yellow-500/30 transition-colors">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          </div>
                          <span className="text-slate-200 leading-relaxed flex-1">{area}</span>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-slate-600/30 rounded-full flex items-center justify-center mx-auto mb-4">
                          <TrendingUp className="h-8 w-8 text-slate-500" />
                        </div>
                        <p className="text-slate-400 italic">No specific areas for improvement identified in the analysis.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Card className="bg-slate-800 border-slate-700 text-slate-100 mb-6">
                <CardContent className="p-6">
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
                </CardContent>
              </Card>

              {/* Questions, Code, Audio & Explanation */}
              <div className="space-y-8 mb-8">
                {Array.isArray(result?.questions) && result.questions.map((q) => {
                  const leetcodeProblem = parseLeetCodeProblem(q.prompt);
                  
                  return (
                    <div key={q.id} className="space-y-6">
                      {/* LeetCode Problem Display */}
                      <Card className="bg-slate-800 border-slate-700 text-slate-100">
                        <CardHeader>
                          <div className="flex items-center gap-4 mb-4">
                            <CardTitle className="text-2xl font-bold text-emerald-400">
                              {leetcodeProblem.number}. {leetcodeProblem.title}
                            </CardTitle>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              leetcodeProblem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400 border border-green-500/40' :
                              leetcodeProblem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' :
                              'bg-red-500/20 text-red-400 border border-red-500/40'
                            }`}>
                              {leetcodeProblem.difficulty}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Problem Description */}
                          <div>
                            <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                              {leetcodeProblem.description}
                            </p>
                          </div>

                          {/* Examples */}
                          {leetcodeProblem.examples && leetcodeProblem.examples.length > 0 && (
                            <div className="space-y-4">
                              {leetcodeProblem.examples.map((example, index) => (
                                <div key={index} className="space-y-3">
                                  <h4 className="text-lg font-semibold text-slate-200">Example {index + 1}:</h4>
                                  <div className="bg-slate-900 rounded-lg p-4 border border-slate-600">
                                    <pre className="text-sm text-slate-300 font-mono overflow-x-auto">
                                      <div className="space-y-2">
                                        <div><span className="text-blue-400">Input:</span> {example.input}</div>
                                        <div><span className="text-green-400">Output:</span> {example.output}</div>
                                      </div>
                                    </pre>
                                  </div>
                                  {example.explanation && (
                                    <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/50">
                                      <p className="text-slate-300 text-sm">
                                        <span className="font-semibold text-slate-200">Explanation:</span> {example.explanation}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Constraints */}
                          {leetcodeProblem.constraints && leetcodeProblem.constraints.length > 0 && (
                            <div>
                              <h4 className="text-lg font-semibold text-slate-200 mb-3">Constraints:</h4>
                              <ul className="list-disc list-inside space-y-1 text-slate-300 ml-4">
                                {leetcodeProblem.constraints.map((constraint, index) => (
                                  <li key={index} className="font-mono text-sm">{constraint}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Follow Up */}
                          {leetcodeProblem.followUp && (
                            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                              <h4 className="text-lg font-semibold text-blue-300 mb-2">Follow up:</h4>
                              <p className="text-slate-300">{leetcodeProblem.followUp}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Your Solution */}
                      <Card className="bg-slate-800 border-slate-700 text-slate-100">
                        <CardHeader>
                          <CardTitle className="text-lg">Your Solution</CardTitle>
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
                          
                          {q.audioUrl && (
                            <div className="mb-4">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-green-400">Recorded Explanation:</span>
                                <Badge className="bg-green-700 text-green-100">Transcribed</Badge>
                              </div>
                              <div className="bg-slate-900 rounded p-3 border border-slate-700 mb-2">
                                <audio controls src={q.audioUrl} className="w-full" />
                                <p className="text-xs text-slate-400 mt-2">The audio above has been transcribed into your explanation below.</p>
                              </div>
                            </div>
                          )}
                          
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
                          {q.feedback && (
                            <div className="mt-4 p-3 bg-blue-900/30 rounded-lg border border-blue-800">
                              <h4 className="text-sm font-medium text-blue-400 mb-1">Quick Feedback</h4>
                              <p className="text-blue-100 text-sm">{q.feedback}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>

              {/* AI Coach */}
              <Card className="mb-8 bg-slate-800 border-slate-700 text-slate-100">
                <CardHeader className="border-b border-slate-700">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Image src="https://i.ibb.co/hJC8n6NB/Generated-Image-February-20-2026-7-04-PM-Photoroom.png" alt="InterviewSense" width={30} height={30} className="object-contain text-blue-400" />
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
