"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Bookmark, RefreshCw, CheckCircle, AlertCircle, Key, User } from "lucide-react"
import { generateFeedback } from "@/lib/gemini"
import { toast } from "@/components/ui/use-toast"

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
          industry: localStorage.getItem('industry') || undefined,
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
          industry: localStorage.getItem('industry') || undefined,
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
    <div className="space-y-6">
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
        <CardHeader>
          <CardTitle className="text-lg text-white">Suggestions for Improvement</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.id}
                className={`flex items-start gap-3 p-3 rounded-lg transition-colors
                  ${suggestion.type === "resume" 
                    ? "bg-purple-700/20 hover:bg-purple-700/30" 
                    : "bg-zinc-700/20 hover:bg-zinc-700/30"}`}
              >
                <div
                  className={`h-6 w-6 flex-shrink-0 rounded-full flex items-center justify-center
                  ${
                    suggestion.type === "improvement"
                      ? "bg-amber-500/20 text-amber-400"
                      : suggestion.type === "strength"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : suggestion.type === "resume"
                          ? "bg-purple-500/20 text-purple-400"
                          : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  {suggestion.type === "improvement" ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : suggestion.type === "strength" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : suggestion.type === "resume" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Key className="h-4 w-4" />
                  )}
                </div>
                <p className={suggestion.type === "resume" ? "text-purple-200" : "text-zinc-300"}>
                  {suggestion.text}
                  {suggestion.type === "resume" && (
                    <span className="block mt-1 text-xs text-purple-400">Based on your resume</span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="flex justify-center pt-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800/70 rounded-full px-6"
        >
          <Bookmark className="h-4 w-4" /> Save Feedback
        </Button>
      </div>
    </div>
  )
}
