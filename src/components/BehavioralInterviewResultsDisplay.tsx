"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Brain, MessageSquare, Copy, Check, Users, Smile, Meh, Frown, Info } from 'lucide-react';

// Define interfaces here for now, can be moved to src/types/
interface BehavioralFeedbackItem {
  id: string;
  competency: string; // e.g., "Communication", "Teamwork", "Problem Solving", "STAR Method Usage"
  observation: string; // e.g., "Candidate provided a general answer about teamwork."
  suggestion: string; // e.g., "Consider using the STAR method to structure your answer with a specific example."
  example?: string; // e.g., "For instance, 'Situation: We had a tight deadline...'"
  impact: string; // e.g., "This will help demonstrate your teamwork skills more effectively."
  rating: 'strong' | 'average' | 'needs_improvement'; // Or could be a numerical scale
}

interface BehavioralAnalysisData {
  overallFeedback?: string;
  ratingBreakdown: { strong: number; average: number; needs_improvement: number };
  feedbackItems: BehavioralFeedbackItem[];
  interviewType?: string; // e.g., "Standard Behavioral Interview"
}

interface BehavioralInterviewResultsDisplayProps {
  analysis: BehavioralAnalysisData;
  interviewTitle: string; // e.g., "Behavioral Interview Performance"
}

export default function BehavioralInterviewResultsDisplay({ analysis, interviewTitle }: BehavioralInterviewResultsDisplayProps) {
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set()); // Use feedback item id

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

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'strong': return 'border-green-500/50';
      case 'average': return 'border-yellow-500/50';
      case 'needs_improvement': return 'border-red-500/50';
      default: return 'border-slate-600/50';
    }
  };

  const getRatingBadgeColor = (rating: string) => {
    switch (rating) {
      case 'strong': return 'bg-green-900/30 text-green-300 border-green-500/50';
      case 'average': return 'bg-yellow-900/30 text-yellow-300 border-yellow-500/50';
      case 'needs_improvement': return 'bg-red-900/30 text-red-300 border-red-500/50';
      default: return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  const getRatingLabel = (rating: string) => {
    switch (rating) {
      case 'strong': return 'Strong';
      case 'average': return 'Average';
      case 'needs_improvement': return 'Needs Improvement';
      default: return 'Feedback';
    }
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'strong': return <Smile className="h-4 w-4 mr-1.5 text-green-400" />;
      case 'average': return <Meh className="h-4 w-4 mr-1.5 text-yellow-400" />;
      case 'needs_improvement': return <Frown className="h-4 w-4 mr-1.5 text-red-400" />;
      default: return <Info className="h-4 w-4 mr-1.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-slate-800 border-slate-700 text-slate-100">
        <CardHeader className="text-center py-8">
          <CardTitle className="text-3xl flex items-center justify-center gap-3">
            <Users className="h-8 w-8 text-purple-400" />
            {interviewTitle} Report
          </CardTitle>
          <div className="text-slate-400 text-lg mt-2">
            <p>{analysis.interviewType || "Behavioral Assessment"} • {new Date().toLocaleDateString()}</p>
          </div>
        </CardHeader>
      </Card>

      {/* Overall Feedback */}
      {analysis.overallFeedback && (
        <Card className="bg-gradient-to-br from-purple-900/30 to-slate-900/30 border-purple-500/30 text-slate-100">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-purple-300 flex items-center gap-2">
                <Brain className="h-5 w-5"/> Overall Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 whitespace-pre-line">{analysis.overallFeedback}</p>
          </CardContent>
        </Card>
      )}

      {/* Rating Breakdown */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-slate-100 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Performance Summary
          </CardTitle>
          <div className="text-slate-400 text-lg">
            {analysis.feedbackItems.length} key areas evaluated
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="text-center bg-green-900/20 border border-green-500/30 rounded-xl p-6">
              <div className="text-4xl font-bold text-green-400 mb-2">{analysis.ratingBreakdown.strong}</div>
              <div className="text-slate-400 text-lg">Strong Areas</div>
            </div>
            <div className="text-center bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-6">
              <div className="text-4xl font-bold text-yellow-400 mb-2">{analysis.ratingBreakdown.average}</div>
              <div className="text-slate-400 text-lg">Average Areas</div>
            </div>
            <div className="text-center bg-red-900/20 border border-red-500/30 rounded-xl p-6">
              <div className="text-4xl font-bold text-red-400 mb-2">{analysis.ratingBreakdown.needs_improvement}</div>
              <div className="text-slate-400 text-lg">Areas for Improvement</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Feedback Items */}
      <div className="space-y-4">
        <Card className="bg-slate-800 border-slate-700 text-slate-100">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-purple-400" />
              Detailed Competency Feedback ({analysis.feedbackItems.length})
            </CardTitle>
          </CardHeader>
        </Card>

        {analysis.feedbackItems.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700 text-slate-100">
            <CardContent className="text-center py-8">
              <p className="text-slate-400">No specific feedback items found for this interview.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {analysis.feedbackItems.map((item) => (
              <Card 
                key={item.id} 
                className={`bg-slate-800 border-slate-700 text-slate-100 border-l-4 ${getRatingColor(item.rating)}`}
              >
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                        <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium border ${getRatingBadgeColor(item.rating)}`}>
                            {getRatingIcon(item.rating)}
                            {getRatingLabel(item.rating)}
                        </div>
                    </div>
                    <CardTitle className="text-lg text-slate-200 pt-2">{item.competency}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <div>
                    <span className="text-xs font-medium text-slate-400 mb-1 block">Observation:</span>
                    <div className="p-2 rounded-lg bg-slate-700/30 border border-slate-600/50">
                      <p className="text-slate-300 text-sm">{item.observation}</p>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-xs font-medium text-purple-400 mb-1 block">Suggestion:</span>
                    <div className="p-2 rounded-lg bg-purple-900/20 border border-purple-500/30 relative group">
                      <p className="text-purple-300 text-sm">{item.suggestion}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-purple-800/50"
                        onClick={(e) => {
                          e.stopPropagation(); 
                          copyToClipboard(item.suggestion, item.id);
                        }}
                      >
                        {copiedItems.has(item.id) ? (
                          <Check className="h-3 w-3 text-purple-300" />
                        ) : (
                          <Copy className="h-3 w-3 text-purple-300" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {item.example && (
                     <div>
                        <span className="text-xs font-medium text-blue-400 mb-1 block">Example:</span>
                        <div className="p-2 rounded-lg bg-blue-900/20 border border-blue-500/30">
                        <p className="text-blue-300 text-sm fst-italic">{item.example}</p>
                        </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-slate-300 bg-slate-700/40 p-2 rounded-lg border border-slate-600/50">
                    <strong className="text-slate-200">Impact:</strong> {item.impact}
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
