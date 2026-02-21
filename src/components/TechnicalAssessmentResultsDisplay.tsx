"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Brain, Code, Copy, Check, AlertTriangle, Zap, CheckCircle } from 'lucide-react';

// Define interfaces here for now, can be moved to src/types/
interface TechnicalFeedbackItem {
  id: string;
  area: string; // e.g., "Algorithm Efficiency", "Code Clarity", "Error Handling"
  originalObservation?: string; // e.g., "The solution uses a nested loop leading to O(n^2) complexity."
  suggestion: string; // e.g., "Consider using a hash map to reduce complexity to O(n)."
  explanation: string; // e.g., "This will improve performance on large datasets."
  severity: 'red' | 'yellow' | 'green'; // Critical, Important, Minor/Good Practice
}

interface LeetCodeExample {
  input: string;
  output: string;
  explanation: string;
}

interface LeetCodeProblem {
  number: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: LeetCodeExample[];
  constraints: string[];
  followUp?: string;
}

interface DetailedTechnicalScores {
  codeQuality: number; // 0-100
  problemSolving: number; // 0-100
  efficiency: number; // 0-100
  communication: number; // 0-100
}

interface TechnicalAnalysisData {
  overallScore?: number; // 0-100
  codeScore?: number; // 0-100
  explanationScore?: number; // 0-100
  summaryMessage?: string;
  detailedScores?: DetailedTechnicalScores; // Added for the 4 specific scores
  leetcodeProblem?: LeetCodeProblem; // Added for LeetCode problem display
  severityBreakdown: { red: number; yellow: number; green: number };
  feedbackItems: TechnicalFeedbackItem[];
  assessmentName?: string; // e.g., "JavaScript Coding Challenge"
  strengths?: string[];
  improvementAreas?: string[];
  codeFeedback?: string;
  explanationFeedback?: string;
}

interface TechnicalAssessmentResultsDisplayProps {
  analysis: TechnicalAnalysisData;
  assessmentTitle: string; // e.g., "Technical Skills Assessment"
}

export default function TechnicalAssessmentResultsDisplay({ analysis, assessmentTitle }: TechnicalAssessmentResultsDisplayProps) {
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set()); // Use feedback item id for keys

  // Utility functions for scoring and colors (similar to resume checker)
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return 'bg-gradient-to-r from-green-500 to-green-400';
    if (score >= 60) return 'bg-gradient-to-r from-yellow-500 to-yellow-400';
    return 'bg-gradient-to-r from-red-500 to-red-400';
  };

  // Generate detailed scores from the API response
  const generateDetailedScores = (): DetailedTechnicalScores => {
    if (analysis.detailedScores) {
      return analysis.detailedScores;
    }
    
    // Generate from available scores if detailed scores aren't provided
    const baseScore = analysis.overallScore || 75;
    const codeScore = analysis.codeScore || baseScore;
    const explanationScore = analysis.explanationScore || baseScore;
    
    return {
      codeQuality: codeScore,
      problemSolving: Math.max(0, Math.min(100, baseScore + (Math.random() * 20 - 10))),
      efficiency: Math.max(0, Math.min(100, codeScore + (Math.random() * 15 - 7))),
      communication: explanationScore
    };
  };

  const detailedScores = generateDetailedScores();

  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => new Set(prev).add(itemId));
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'red': return 'border-red-500/50';
      case 'yellow': return 'border-yellow-500/50';
      case 'green': return 'border-green-500/50';
      default: return 'border-slate-600/50';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'red': return 'bg-red-900/30 text-red-300 border-red-500/50';
      case 'yellow': return 'bg-yellow-900/30 text-yellow-300 border-yellow-500/50';
      case 'green': return 'bg-green-900/30 text-green-300 border-green-500/50';
      default: return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'red': return 'Critical Issue';
      case 'yellow': return 'Important Feedback';
      case 'green': return 'Good Practice / Minor';
      default: return 'Feedback';
    }
  };
  
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'red': return <AlertTriangle className="h-4 w-4 mr-1.5 text-red-400" />;
      case 'yellow': return <Zap className="h-4 w-4 mr-1.5 text-yellow-400" />;
      case 'green': return <CheckCircle className="h-4 w-4 mr-1.5 text-green-400" />;
      default: return <Code className="h-4 w-4 mr-1.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-slate-800 border-slate-700 text-slate-100">
        <CardHeader className="text-center py-8">
          <CardTitle className="text-3xl flex items-center justify-center gap-3">
            <Brain className="h-8 w-8 text-blue-400" />
            {assessmentTitle} Report
          </CardTitle>
          <div className="text-slate-400 text-lg mt-2">
            <p>{analysis.assessmentName || "Assessment Results"} • {new Date().toLocaleDateString()}</p>
            {analysis.overallScore !== undefined && (
                <p className="text-2xl font-bold mt-2">Overall Score: {analysis.overallScore}/100</p>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* LeetCode Problem Display */}
      {analysis.leetcodeProblem && (
        <Card className="bg-slate-800 border-slate-700 text-slate-100">
          <CardHeader>
            <div className="flex items-center gap-4 mb-4">
              <CardTitle className="text-2xl font-bold text-emerald-400">
                {analysis.leetcodeProblem.number}. {analysis.leetcodeProblem.title}
              </CardTitle>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                analysis.leetcodeProblem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400 border border-green-500/40' :
                analysis.leetcodeProblem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' :
                'bg-red-500/20 text-red-400 border border-red-500/40'
              }`}>
                {analysis.leetcodeProblem.difficulty}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Problem Description */}
            <div>
              <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                {analysis.leetcodeProblem.description}
              </p>
            </div>

            {/* Examples */}
            {analysis.leetcodeProblem.examples && analysis.leetcodeProblem.examples.length > 0 && (
              <div className="space-y-4">
                {analysis.leetcodeProblem.examples.map((example, index) => (
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
            {analysis.leetcodeProblem.constraints && analysis.leetcodeProblem.constraints.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-slate-200 mb-3">Constraints:</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300 ml-4">
                  {analysis.leetcodeProblem.constraints.map((constraint, index) => (
                    <li key={index} className="font-mono text-sm">{constraint}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Follow Up */}
            {analysis.leetcodeProblem.followUp && (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-blue-300 mb-2">Follow up:</h4>
                <p className="text-slate-300">{analysis.leetcodeProblem.followUp}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detailed Scores Section */}
      {analysis.detailedScores && (
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-slate-100 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-sky-400 bg-clip-text text-transparent">
              Key Performance Metrics
            </CardTitle>
            <div className="text-slate-400 text-lg">
              Detailed breakdown of technical skill areas.
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(analysis.detailedScores).map(([key, value]) => {
                let scoreLabel = "Unknown Metric";
                if (key === 'problemSolving') scoreLabel = "Problem Solving";
                else if (key === 'codeEfficiency') scoreLabel = "Code Efficiency";
                else if (key === 'codeClarity') scoreLabel = "Code Clarity";
                else if (key === 'testingRobustness') scoreLabel = "Testing & Robustness";
                
                return (
                  <div key={key} className="text-center bg-slate-800/70 border border-slate-700 rounded-xl p-6 transition-all duration-300 hover:bg-slate-700/50">
                    <div className="text-4xl font-bold text-sky-400 mb-2">{value}<span className="text-2xl text-slate-400">/100</span></div>
                    <div className="text-slate-300 text-lg">{scoreLabel}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Message */}
      {analysis.summaryMessage && (
        <Card className="bg-slate-800/50 border-slate-700 text-slate-100">
            <CardHeader>
                <CardTitle className="text-xl font-semibold text-blue-300">Assessment Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-slate-300 whitespace-pre-line">{analysis.summaryMessage}</p>
            </CardContent>
        </Card>
      )}
      
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-slate-100 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Feedback Severity Breakdown
          </CardTitle>
          <div className="text-slate-400 text-lg">
            {analysis.feedbackItems.length} specific feedback points identified
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="text-center bg-red-900/20 border border-red-500/30 rounded-xl p-6">
              <div className="text-4xl font-bold text-red-400 mb-2">{analysis.severityBreakdown.red}</div>
              <div className="text-slate-400 text-lg">Critical Issues</div>
            </div>
            <div className="text-center bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-6">
              <div className="text-4xl font-bold text-yellow-400 mb-2">{analysis.severityBreakdown.yellow}</div>
              <div className="text-slate-400 text-lg">Important Feedback</div>
            </div>
            <div className="text-center bg-green-900/20 border border-green-500/30 rounded-xl p-6">
              <div className="text-4xl font-bold text-green-400 mb-2">{analysis.severityBreakdown.green}</div>
              <div className="text-slate-400 text-lg">Good Practices / Minor</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Feedback */}
      <div className="space-y-4">
        <Card className="bg-slate-800 border-slate-700 text-slate-100">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
              <Code className="h-6 w-6 text-blue-400" />
              Detailed Feedback Items ({analysis.feedbackItems.length})
            </CardTitle>
          </CardHeader>
        </Card>
        
        {analysis.feedbackItems.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700 text-slate-100">
            <CardContent className="text-center py-8">
              <p className="text-slate-400">No specific feedback items found for this assessment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {analysis.feedbackItems.map((item) => (
              <Card 
                key={item.id} 
                className={`bg-slate-800 border-slate-700 text-slate-100 border-l-4 ${getSeverityColor(item.severity)}`}
              >
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium border ${getSeverityBadgeColor(item.severity)}`}>
                            {getSeverityIcon(item.severity)}
                            {getSeverityLabel(item.severity)}
                        </div>
                    </div>
                    <CardTitle className="text-lg text-slate-200 pt-2">{item.area}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  {item.originalObservation && (
                    <div>
                      <span className="text-xs font-medium text-yellow-400 mb-1 block">Observation:</span>
                      <div className="p-2 rounded-lg bg-yellow-900/20 border border-yellow-500/30">
                        <p className="text-yellow-300 text-sm">{item.originalObservation}</p>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-xs font-medium text-green-400 mb-1 block">Suggestion:</span>
                    <div className="p-2 rounded-lg bg-green-900/20 border border-green-500/30 relative group">
                      <p className="text-green-300 text-sm">{item.suggestion}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-green-800/50"
                        onClick={(e) => {
                          e.stopPropagation(); 
                          copyToClipboard(item.suggestion, item.id);
                        }}
                      >
                        {copiedItems.has(item.id) ? (
                          <Check className="h-3 w-3 text-green-400" />
                        ) : (
                          <Copy className="h-3 w-3 text-green-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-xs text-slate-300 bg-slate-700/40 p-2 rounded-lg border border-slate-600/50">
                    <strong className="text-slate-200">Why:</strong> {item.explanation}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
