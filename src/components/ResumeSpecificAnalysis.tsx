"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, Target } from "lucide-react";
import { SpecificAnalysisData } from "@/types/resume";

interface ResumeSpecificAnalysisProps {
  analysis: SpecificAnalysisData;
  fileName: string;
  jobTitle: string;
  company?: string;
}

export default function ResumeSpecificAnalysis({ 
  analysis, 
  fileName, 
  jobTitle, 
  company 
}: ResumeSpecificAnalysisProps) {
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
      console.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-slate-100 shadow-xl">
        <CardHeader className="text-center py-8">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Specific Resume Analysis
          </CardTitle>
          <p className="text-slate-400 text-lg mt-2">
            Detailed improvements for {jobTitle}{company ? ` at ${company}` : ""} • {fileName}
          </p>
        </CardHeader>
      </Card>

      {/* Summary */}
      <Card className="bg-slate-800 border-slate-700 text-slate-100">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center bg-slate-600/30 rounded-xl p-6 border border-slate-500/30">
            <div className="text-4xl font-bold text-purple-400 mb-2">{analysis.overallScore}</div>
            <div className="text-slate-400 text-lg">Overall Score</div>
          </div>
          
          <div>
            <h4 className="font-semibold text-green-400 mb-2">Strengths to Keep</h4>
            <p className="text-slate-300">{analysis.improvementSummary.strengthsToKeep}</p>
          </div>
          <div>
            <h4 className="font-semibold text-yellow-400 mb-2">Key Opportunities</h4>
            <p className="text-slate-300">{analysis.improvementSummary.keyOpportunities}</p>
          </div>
          <div>
            <h4 className="font-semibold text-red-400 mb-2">Areas to Improve</h4>
            <p className="text-slate-300">{analysis.improvementSummary.criticalIssues}</p>
          </div>
        </CardContent>
      </Card>

      {/* Specific Improvements */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <Target className="h-6 w-6 text-purple-400" />
          Specific Improvements ({analysis.specificImprovements.length})
        </h3>
        
        {analysis.specificImprovements.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700 text-slate-100">
            <CardContent className="p-8 text-center">
              <div className="text-slate-400">No specific improvements found.</div>
            </CardContent>
          </Card>
        ) : (
          analysis.specificImprovements.map((improvement, index) => (
            <Card key={index} className="bg-slate-800 border-slate-700 text-slate-100">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="text-xs text-slate-400">
                    {improvement.location}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-red-400 mb-2 block">Replace:</span>
                  <div className="p-3 rounded-lg bg-red-900/20 border border-red-500/30">
                    <span className="text-red-300 font-mono text-sm">"{improvement.original}"</span>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-green-400 mb-2 block">With:</span>
                  <div className="p-3 rounded-lg bg-green-900/20 border border-green-500/30 relative group">
                    <span className="text-green-300 font-mono text-sm">"{improvement.improved}"</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-green-800/50"
                      onClick={() => copyToClipboard(improvement.improved, index)}
                    >
                      {copiedItems.has(index) ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-green-400" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="text-sm text-slate-300 bg-slate-700/40 p-3 rounded-lg border border-slate-600/50">
                  <strong className="text-slate-200">Why:</strong> {improvement.explanation}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
