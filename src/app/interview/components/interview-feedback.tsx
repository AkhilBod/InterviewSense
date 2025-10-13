"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Bookmark, RefreshCw, CheckCircle, AlertCircle, Key, User, Download, Printer, Share2, ChevronLeft, ChevronRight } from "lucide-react"
import { generateFeedback } from "@/lib/gemini"
import { toast } from "@/components/ui/use-toast"
import { exportToPDF, printReport, shareReport } from "@/lib/export"

type FeedbackScore = {
  label: string
  score: number
  color: string
  icon?: string
  isAudio?: boolean
}

type Suggestion = {
  id: number
  text: string
  type: "improvement" | "strength" | "keyword" | "resume"
}

type FeedbackProps = {
  answer: string
  question?: string
}

export default function InterviewFeedback({ answer, question }: FeedbackProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [scores, setScores] = useState<FeedbackScore[]>([])
  const [keywordsMissing, setKeywordsMissing] = useState<string[]>([])
  const [keywordsDetected, setKeywordsDetected] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [fillerWords, setFillerWords] = useState<{ word: string; count: number }[]>([])
  const [useSimulatedData, setUseSimulatedData] = useState(false)
  const [resumeAvailable, setResumeAvailable] = useState(false)
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0)

  // Group suggestions by type for individual column carousels
  const groupedSuggestions = suggestions.reduce((groups, suggestion) => {
    const type = suggestion.type
    if (!groups[type]) {
      groups[type] = []
    }
    groups[type].push(suggestion)
    return groups
  }, {} as Record<string, Suggestion[]>)

  const suggestionTypes = Object.keys(groupedSuggestions)
  
  // State for each column's current index
  const [columnIndices, setColumnIndices] = useState<Record<string, number>>({})

  // Initialize column indices when suggestions change
  useEffect(() => {
    const initialIndices: Record<string, number> = {}
    suggestionTypes.forEach(type => {
      initialIndices[type] = 0
    })
    setColumnIndices(initialIndices)
  }, [suggestions])

  const nextSuggestion = (type: string) => {
    setColumnIndices(prev => ({
      ...prev,
      [type]: ((prev[type] || 0) + 1) % groupedSuggestions[type].length
    }))
  }

  const prevSuggestion = (type: string) => {
    setColumnIndices(prev => ({
      ...prev,
      [type]: ((prev[type] || 0) - 1 + groupedSuggestions[type].length) % groupedSuggestions[type].length
    }))
  }

  const getSuggestionTypeTitle = (type: string) => {
    switch (type) {
      case "improvement":
        return "Areas for Improvement"
      case "strength":
        return "Your Strengths"
      case "keyword":
        return "Keyword Suggestions"
      case "resume":
        return "Resume-Based Insights"
      default:
        return "Suggestions"
    }
  }

  // Check for resume data once the component mounts (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const resumeData = localStorage.getItem('resume');
      setResumeAvailable(!!resumeData && resumeData.trim() !== '');
    }
  }, []);
  
  useEffect(() => {
    const analyzeAnswer = async () => {
      setIsLoading(true)
      
      try {
        // Get job details from localStorage to provide more context
        const jobDetails = typeof window !== 'undefined' ? {
          jobTitle: localStorage.getItem('jobTitle') || undefined,
          company: localStorage.getItem('company') || undefined,
          industry: localStorage.getItem('interviewType') === 'Behavioral' ? undefined : (localStorage.getItem('industry') || undefined),
          experienceLevel: localStorage.getItem('experienceLevel') || undefined,
          interviewType: localStorage.getItem('interviewType') || undefined,
          interviewStage: localStorage.getItem('interviewStage') || undefined,
        } : {};
        
        // Try to use the Gemini API for feedback generation with job details and resume context
        const feedback = await generateFeedback(answer, question, jobDetails);
        
        setScores(feedback.scores);
        setKeywordsDetected(feedback.keywordsDetected);
        setKeywordsMissing(feedback.keywordsMissing);
        setSuggestions(feedback.suggestions);
        setFillerWords(feedback.fillerWords);
        setUseSimulatedData(false);
        
        // Display a badge indicating if resume was used for feedback
        if (resumeAvailable) {
          toast({
            title: "Resume-enhanced feedback",
            description: "Your feedback is personalized using your resume data",
            variant: "default",
          });
        }
      } catch (error) {
        console.error("Failed to generate feedback:", error);
        toast({
          title: "Failed to generate feedback",
          description: "Using simulated data instead",
          variant: "destructive",
        });
        
        // Fall back to simulated data if the API call fails
        simulateAnalysis();
        setUseSimulatedData(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    const simulateAnalysis = () => {
      // Generate mock scores
      setScores([
        { label: "Clarity", score: Math.floor(Math.random() * 30) + 70, color: "bg-blue-600" },
        { label: "Conciseness", score: Math.floor(Math.random() * 30) + 65, color: "bg-emerald-600" },
        { label: "Vocal Tone", score: Math.floor(Math.random() * 25) + 70, color: "bg-purple-600", isAudio: true },
        { label: "Speech Pace", score: Math.floor(Math.random() * 20) + 75, color: "bg-amber-600", isAudio: true },
        { label: "Voice Clarity", score: Math.floor(Math.random() * 25) + 70, color: "bg-indigo-600", isAudio: true },
        { label: "Confidence", score: Math.floor(Math.random() * 30) + 60, color: "bg-violet-600" },
        { label: "Relevance", score: Math.floor(Math.random() * 30) + 75, color: "bg-amber-600" },
      ]);

      // Generate mock keywords detected/missing
      setKeywordsDetected(["communication", "teamwork", "problem-solving", "results"]);
      setKeywordsMissing(["leadership", "innovation", "analytics"]);

      // Generate mock suggestions
      setSuggestions([
        {
          id: 1,
          text: "Try to provide more specific examples with measurable outcomes",
          type: "improvement",
        },
        {
          id: 2,
          text: "Your explanation of the problem-solving process was clear and detailed",
          type: "strength",
        },
        {
          id: 3,
          text: "Consider mentioning how you took initiative or demonstrated leadership",
          type: "improvement",
        },
        {
          id: 4,
          text: "Include industry-specific terms relevant to the role",
          type: "keyword",
        },
        {
          id: 5,
          text: "Your speaking pace was well-balanced and easy to follow",
          type: "strength",
        },
        {
          id: 6,
          text: "Consider varying your vocal tone to emphasize key points",
          type: "improvement",
        },
        {
          id: 7,
          text: "Reduce background noise when recording for clearer audio",
          type: "improvement",
        },
      ]);

      // Generate mock filler words
      setFillerWords([
        { word: "um", count: Math.floor(Math.random() * 5) + 1 },
        { word: "like", count: Math.floor(Math.random() * 6) + 2 },
        { word: "you know", count: Math.floor(Math.random() * 3) },
        { word: "so", count: Math.floor(Math.random() * 7) + 3 },
        { word: "actually", count: Math.floor(Math.random() * 4) + 1 },
        { word: "basically", count: Math.floor(Math.random() * 3) },
        { word: "long pauses", count: Math.floor(Math.random() * 2) + 1 },
      ]);
    };

    analyzeAnswer();
  }, [answer, question])

  const refreshAnalysis = async () => {
    // Re-run the analysis
    setIsLoading(true)
    
    if (useSimulatedData) {
      // If we're using simulated data, just update the scores
      setTimeout(() => {
        setScores((prev) =>
          prev.map((score) => ({
            ...score,
            score: Math.min(100, Math.max(50, score.score + (Math.random() > 0.5 ? 5 : -5))),
          })),
        )
        setIsLoading(false)
      }, 1500)
    } else {
      try {
        // Get job details from localStorage to provide more context
        const jobDetails = typeof window !== 'undefined' ? {
          jobTitle: localStorage.getItem('jobTitle') || undefined,
          company: localStorage.getItem('company') || undefined,
          industry: localStorage.getItem('interviewType') === 'Behavioral' ? undefined : (localStorage.getItem('industry') || undefined),
          experienceLevel: localStorage.getItem('experienceLevel') || undefined,
          interviewType: localStorage.getItem('interviewType') || undefined,
          interviewStage: localStorage.getItem('interviewStage') || undefined,
        } : {};
        
        // Try to use the Gemini API for feedback generation again with job details and resume
        const feedback = await generateFeedback(answer, question, jobDetails);
        
        setScores(feedback.scores);
        setKeywordsDetected(feedback.keywordsDetected);
        setKeywordsMissing(feedback.keywordsMissing);
        setSuggestions(feedback.suggestions);
        setFillerWords(feedback.fillerWords);
        
        // Show a subtle notification that the feedback has been refreshed
        toast({
          title: "Feedback refreshed",
          description: resumeAvailable 
            ? "Analysis has been updated based on your response and resume" 
            : "Analysis has been updated based on your response",
          variant: "default",
        });
      } catch (error) {
        console.error("Failed to refresh feedback:", error);
        toast({
          title: "Failed to refresh feedback",
          description: "Using simulated data instead",
          variant: "destructive",
        });
        
        // Fall back to simulated data
        setUseSimulatedData(true);
        
        // Update the simulated scores to create a refresh effect
        setScores((prev) =>
          prev.map((score) => ({
            ...score,
            score: Math.min(100, Math.max(50, score.score + (Math.random() > 0.5 ? 5 : -5))),
          })),
        )
      } finally {
        setIsLoading(false);
      }
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg text-white">Analyzing Your Response...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="relative">
              <RefreshCw className="h-12 w-12 text-blue-500 animate-spin" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.3),transparent_70%)]"></div>
            </div>
            <p className="text-zinc-400">Our AI is analyzing your answer</p>
            <Progress value={30} className="w-full h-2 bg-zinc-700">
              <div className="h-full bg-blue-600 rounded-full animate-pulse"></div>
            </Progress>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div id="feedback-content" className="space-y-6">
      <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm overflow-hidden">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <CardTitle className="text-lg text-white">Response Analysis</CardTitle>
              {resumeAvailable && (
                <div className="flex items-center mt-1">
                  <Badge className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border-blue-500/30">
                    Resume-Enhanced Feedback
                  </Badge>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshAnalysis}
              className="gap-1 text-zinc-400 hover:text-white hover:bg-zinc-700/50"
            >
              <RefreshCw className="h-3 w-3" /> Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {scores.map((score, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-300">{score.label}</span>
                  <span className="font-medium text-white">{score.score}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${score.color} rounded-full transition-all duration-500`}
                    style={{ width: `${score.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg text-white">Keyword Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium mb-3 text-zinc-300">Relevant Keywords Detected:</p>
              <div className="flex flex-wrap gap-2">
                {keywordsDetected.map((keyword, index) => (
                  <Badge key={index} className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border-blue-500/30">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-3 text-zinc-300">Consider Adding These Keywords:</p>
              <div className="flex flex-wrap gap-2">
                {keywordsMissing.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="text-zinc-400 border-zinc-600 hover:bg-zinc-700/50">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-3 text-zinc-300">Filler Words Used:</p>
              <div className="grid grid-cols-2 gap-3">
                {fillerWords.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center px-4 py-2 bg-zinc-700/30 rounded-lg text-sm"
                  >
                    <span className="text-zinc-300">"{item.word}"</span>
                    <Badge
                      variant="outline"
                      className={
                        item.count > 3
                          ? "bg-red-900/20 text-red-400 border-red-800/30"
                          : "bg-zinc-800/50 text-zinc-400 border-zinc-700"
                      }
                    >
                      {item.count} {item.count === 1 ? "time" : "times"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-white">Suggestions for Improvement</CardTitle>
              <p className="text-sm text-zinc-400 mt-1">One suggestion per category - navigate through each</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {suggestionTypes.length > 0 ? (
            <div className="space-y-6">
              {suggestionTypes.map((type) => {
                const suggestions = groupedSuggestions[type]
                const currentIndex = columnIndices[type] || 0
                const currentSuggestion = suggestions[currentIndex]
                
                if (!currentSuggestion) return null

                return (
                  <div key={type} className="space-y-3">
                    {/* Column Header */}
                    <div className="text-center space-y-2">
                      <h3 className={`text-sm font-semibold
                        ${type === "resume" 
                          ? "text-purple-400" 
                          : type === "improvement"
                            ? "text-amber-400"
                            : type === "strength"
                              ? "text-emerald-400"
                              : "text-blue-400"}`}>
                        {getSuggestionTypeTitle(type)}
                      </h3>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-zinc-400 hover:text-white hover:bg-zinc-700/50"
                          onClick={() => prevSuggestion(type)}
                          disabled={suggestions.length <= 1}
                        >
                          <ChevronLeft className="h-3 w-3" />
                        </Button>
                        <div className="flex gap-1">
                          {suggestions.map((_, index) => (
                            <button
                              key={index}
                              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                                index === currentIndex
                                  ? (type === "resume" ? "bg-purple-500" : 
                                     type === "improvement" ? "bg-amber-500" :
                                     type === "strength" ? "bg-emerald-500" : "bg-blue-500")
                                  : "bg-zinc-600 hover:bg-zinc-500"
                              }`}
                              onClick={() => setColumnIndices(prev => ({ ...prev, [type]: index }))}
                            />
                          ))}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-zinc-400 hover:text-white hover:bg-zinc-700/50"
                          onClick={() => nextSuggestion(type)}
                          disabled={suggestions.length <= 1}
                        >
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-xs text-zinc-500">
                        {currentIndex + 1} of {suggestions.length}
                      </div>
                    </div>

                    {/* Suggestion Card */}
                    <div
                      className={`p-4 rounded-lg border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg min-h-[200px] flex flex-col
                        ${type === "resume" 
                          ? "bg-purple-700/10 border-purple-500/20 hover:bg-purple-700/20 hover:border-purple-500/40" 
                          : type === "improvement"
                            ? "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40"
                            : type === "strength"
                              ? "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40"
                              : "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40"}`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className={`h-8 w-8 flex-shrink-0 rounded-lg flex items-center justify-center
                          ${
                            type === "improvement"
                              ? "bg-amber-500/20 text-amber-400"
                              : type === "strength"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : type === "resume"
                                  ? "bg-purple-500/20 text-purple-400"
                                  : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {type === "improvement" ? (
                            <AlertCircle className="h-4 w-4" />
                          ) : type === "strength" ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : type === "resume" ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Key className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-xs font-medium uppercase tracking-wider mb-1
                            ${type === "resume" 
                              ? "text-purple-400" 
                              : type === "improvement"
                                ? "text-amber-400"
                                : type === "strength"
                                  ? "text-emerald-400"
                                  : "text-blue-400"}`}>
                            {type === "resume" ? "Resume Insight" : type}
                          </div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm leading-relaxed
                          ${type === "resume" ? "text-purple-200" : "text-zinc-300"}`}>
                          {currentSuggestion.text}
                        </p>
                      </div>
                      {type === "resume" && (
                        <div className="mt-3 pt-3 border-t border-purple-500/20">
                          <span className="inline-flex items-center gap-1 text-xs text-purple-400 font-medium">
                            <User className="h-3 w-3" />
                            Based on your resume
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-400">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No suggestions available yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800/70 rounded-full"
          onClick={() => exportToPDF('feedback-content', `Interview_Feedback_${new Date().toISOString().split('T')[0]}`)}
        >
          <Download className="h-3 w-3" /> Download
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800/70 rounded-full"
          onClick={printReport}
        >
          <Printer className="h-3 w-3" /> Print
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800/70 rounded-full"
          onClick={() => shareReport("Interview Feedback", "Interview feedback for this question")}
        >
          <Share2 className="h-3 w-3" /> Share
        </Button>
      </div>
    </div>
  )
}
