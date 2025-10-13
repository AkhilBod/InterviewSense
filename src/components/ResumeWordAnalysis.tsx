"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Brain, Copy, Check, MessageSquare } from 'lucide-react';
import { WordAnalysisData } from '@/types/resume';

interface ResumeWordAnalysisProps {
  analysis: WordAnalysisData;
  fileName: string;
  jobTitle: string;
  company?: string;
}

export default function ResumeWordAnalysis({ analysis, fileName, jobTitle, company }: ResumeWordAnalysisProps) {
  const [copiedItems, setCopiedItems] = useState<Set<number>>(new Set());

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => new Set(prev).add(index));
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(index);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-slate-800 border-slate-700 text-slate-100">
        <CardHeader className="text-center py-8">
          <CardTitle className="text-3xl flex items-center justify-center gap-3">
            <Brain className="h-8 w-8 text-blue-400" />
            Word-Level Analysis Report
          </CardTitle>
          <div className="text-slate-400 text-lg mt-2">
            <p>For a {jobTitle} position{company && ` at ${company}`} • {new Date().toLocaleDateString()}</p>
          </div>
        </CardHeader>
      </Card>

      {/* Summary */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-slate-100 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Analysis Summary
          </CardTitle>
          <div className="text-slate-400 text-lg">
            {analysis.wordImprovements.length} specific improvements identified
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Critical Issues */}
            <div className="text-center bg-red-900/20 border border-red-500/30 rounded-xl p-6 transition-all duration-300">
              <div className="text-4xl font-bold text-red-400 mb-2">{analysis.severityBreakdown.red}</div>
              <div className="text-slate-400 text-lg">Critical Issues</div>
              <div className="text-xs text-red-300 mt-2">Urgent fixes needed</div>
            </div>
            
            {/* Important Items */}
            <div className="text-center bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-6 transition-all duration-300">
              <div className="text-4xl font-bold text-yellow-400 mb-2">{analysis.severityBreakdown.yellow}</div>
              <div className="text-slate-400 text-lg">Important Items</div>
              <div className="text-xs text-yellow-300 mt-2">Should be addressed</div>
            </div>
            
            {/* Minor Improvements */}
            <div className="text-center bg-green-900/20 border border-green-500/30 rounded-xl p-6 transition-all duration-300">
              <div className="text-4xl font-bold text-green-400 mb-2">{analysis.severityBreakdown.green}</div>
              <div className="text-slate-400 text-lg">Minor Improvements</div>
              <div className="text-xs text-green-300 mt-2">Nice to have fixes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Word Improvements */}
      <div className="space-y-4">
        <Card className="bg-slate-800 border-slate-700 text-slate-100">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-blue-400" />
              Word & Phrase Improvements ({analysis.wordImprovements.length})
            </CardTitle>
          </CardHeader>
        </Card>
        
        {/* Help Text */}
        <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500/30 text-slate-100">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-6 w-6 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-slate-200">
                <p className="font-medium mb-3 text-slate-100">How to use these suggestions:</p>
                <p className="text-slate-300">
                  Replace the highlighted words and phrases with the improved versions to make your resume more impactful. 
                  Focus on quantifying achievements with specific numbers, percentages, and impact metrics.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {analysis.wordImprovements.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700 text-slate-100">
            <CardContent className="text-center py-8">
              <p className="text-slate-400">No word improvements found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {analysis.wordImprovements.map((improvement, index) => {
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
                  case 'red': return 'Critical';
                  case 'yellow': return 'Important';
                  case 'green': return 'Minor';
                  default: return 'Unknown';
                }
              };

              return (
                <Card key={index} className={`bg-slate-800 border-slate-700 text-slate-100 border-l-4 ${getSeverityColor(improvement.severity)}`}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Priority Badge */}
                      <div className="flex justify-between items-start">
                        <div className={`px-2 py-1 rounded-md text-xs font-medium border ${getSeverityBadgeColor(improvement.severity)}`}>
                          {getSeverityLabel(improvement.severity)}
                        </div>
                      </div>

                      {/* Before/After in compact format */}
                      <div className="space-y-3">
                        <div>
                          <span className="text-xs font-medium text-red-400 mb-1 block">Replace:</span>
                          <div className="p-2 rounded-lg bg-red-900/20 border border-red-500/30">
                            <span className="text-red-300 text-sm">"{improvement.original}"</span>
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-xs font-medium text-green-400 mb-1 block">With:</span>
                          <div className="p-2 rounded-lg bg-green-900/20 border border-green-500/30 relative group">
                            <span className="text-green-300 text-sm">"{improvement.improved}"</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-green-800/50"
                              onClick={() => copyToClipboard(improvement.improved, index)}
                            >
                              {copiedItems.has(index) ? (
                                <Check className="h-3 w-3 text-green-400" />
                              ) : (
                                <Copy className="h-3 w-3 text-green-400" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-slate-300 bg-slate-700/40 p-2 rounded-lg border border-slate-600/50">
                        <strong className="text-slate-200">Why:</strong> {improvement.explanation}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
