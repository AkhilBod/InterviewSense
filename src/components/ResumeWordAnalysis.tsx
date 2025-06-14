"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, AlertTriangle, TrendingUp, MessageSquare, BarChart3, Zap, Brain, Copy, Check } from 'lucide-react';
import { WordImprovementSuggestion, WordAnalysisData } from '@/types/resume';

interface ResumeWordAnalysisProps {
  analysis: WordAnalysisData;
  fileName: string;
  jobTitle: string;
  company?: string;
}

const categoryIcons = {
  quantify_impact: TrendingUp,
  communication: MessageSquare,
  length_depth: BarChart3,
  drive: Zap,
  analytical: Brain,
  general: AlertCircle
};

const categoryLabels = {
  quantify_impact: "Quantify Impact",
  communication: "Communication",
  length_depth: "Length & Depth",
  drive: "Drive & Initiative",
  analytical: "Analytical Skills",
  general: "General"
};

const severityConfig = {
  red: {
    color: "bg-red-500",
    textColor: "text-red-400",
    bgColor: "bg-slate-700/40",
    borderColor: "border-red-500/30",
    icon: AlertCircle,
    label: "Urgent"
  },
  yellow: {
    color: "bg-yellow-500",
    textColor: "text-yellow-400",
    bgColor: "bg-slate-700/40",
    borderColor: "border-yellow-500/30",
    icon: AlertTriangle,
    label: "Next Priority"
  },
  green: {
    color: "bg-green-500",
    textColor: "text-green-400",
    bgColor: "bg-slate-700/40",
    borderColor: "border-green-500/30",
    icon: CheckCircle,
    label: "Minor Tweaks"
  }
};

export default function ResumeWordAnalysis({ analysis, fileName, jobTitle, company }: ResumeWordAnalysisProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);
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

  const filteredImprovements = analysis.wordImprovements.filter(improvement => {
    if (selectedCategory && improvement.category !== selectedCategory) return false;
    if (selectedSeverity && improvement.severity !== selectedSeverity) return false;
    return true;
  });

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

      {/* Priority Breakdown - 3 Cards Side by Side */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-slate-100 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Priority Breakdown
          </CardTitle>
          <div className="text-slate-400 text-lg">
            Categorized improvements for your resume
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(analysis.severityBreakdown).map(([severity, count]) => {
              const config = severityConfig[severity as keyof typeof severityConfig];
              const Icon = config.icon;
              return (
                <div
                  key={severity}
                  className={`text-center bg-slate-600/30 hover:bg-slate-600/50 border border-slate-500/30 hover:border-slate-500/50 rounded-xl p-6 transition-all duration-300 hover:shadow-lg cursor-pointer ${
                    selectedSeverity === severity ? 'ring-2 ring-blue-400' : ''
                  }`}
                  onClick={() => setSelectedSeverity(selectedSeverity === severity ? null : severity)}
                >
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className={`w-3 h-3 ${config.color} rounded-full`}></div>
                    <div className="text-sm font-bold text-slate-300 tracking-wider">{config.label.toUpperCase()}</div>
                  </div>
                  <div className={`text-3xl font-bold ${config.textColor} mb-2`}>
                    {count}
                  </div>
                  <div className="text-sm text-slate-400 font-medium mb-4">suggestions</div>
                  <div className="w-full bg-slate-700/40 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${config.color}`}
                      style={{ width: `${Math.min(100, (count / Math.max(...Object.values(analysis.severityBreakdown))) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-slate-100 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">Improvement Categories</CardTitle>
          <div className="text-slate-400">
            Filter by type of improvement needed
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(analysis.categoryBreakdown).map(([category, count]) => {
              if (count === 0) return null;
              const Icon = categoryIcons[category as keyof typeof categoryIcons];
              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={`justify-start h-auto p-4 transition-all duration-300 ${
                    selectedCategory === category 
                      ? "bg-blue-600 hover:bg-blue-500 text-white border-blue-500" 
                      : "bg-slate-700/30 hover:bg-slate-600 text-slate-300 border-slate-600"
                  }`}
                  onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium text-sm">
                      {categoryLabels[category as keyof typeof categoryLabels]}
                    </div>
                    <div className="text-xs opacity-70">{count} suggestions</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Clear Filters */}
      {(selectedCategory || selectedSeverity) && (
        <div className="flex gap-2 px-4">
          <Button 
            variant="outline" 
            size="sm"
            className="bg-slate-700/30 hover:bg-slate-600 text-slate-300 border-slate-600"
            onClick={() => {
              setSelectedCategory(null);
              setSelectedSeverity(null);
            }}
          >
            Clear All Filters
          </Button>
          {selectedCategory && (
            <Badge 
              variant="secondary" 
              className="cursor-pointer bg-slate-700 text-slate-300 hover:bg-slate-600"
              onClick={() => setSelectedCategory(null)}
            >
              {categoryLabels[selectedCategory as keyof typeof categoryLabels]} ✕
            </Badge>
          )}
          {selectedSeverity && (
            <Badge 
              variant="secondary" 
              className="cursor-pointer bg-slate-700 text-slate-300 hover:bg-slate-600"
              onClick={() => setSelectedSeverity(null)}
            >
              {severityConfig[selectedSeverity as keyof typeof severityConfig].label} ✕
            </Badge>
          )}
        </div>
      )}

      {/* Word Improvements */}
      <div className="space-y-4">
        <Card className="bg-slate-800 border-slate-700 text-slate-100">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-blue-400" />
              Specific Word & Phrase Improvements ({filteredImprovements.length})
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
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span><strong className="text-red-400">Urgent:</strong> Critical changes that significantly impact your candidacy</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span><strong className="text-yellow-400">Next Priority:</strong> Important improvements that strengthen your resume</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span><strong className="text-green-400">Minor Tweaks:</strong> Good content that can be slightly enhanced</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Focus on quantifying achievements with specific numbers, percentages, and impact metrics</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {filteredImprovements.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700 text-slate-100">
            <CardContent className="text-center py-8">
              <p className="text-slate-400">No improvements match your current filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredImprovements.map((improvement, index) => {
              const severityConfig_ = severityConfig[improvement.severity];
              const CategoryIcon = categoryIcons[improvement.category];
              const SeverityIcon = severityConfig_.icon;
              
              return (
                <Card key={index} className={`bg-slate-800 border-slate-700 text-slate-100 border-l-4 ${severityConfig_.borderColor.replace('border-', 'border-l-')}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex gap-3 mt-1">
                        <SeverityIcon className={`h-5 w-5 ${severityConfig_.textColor}`} />
                        <CategoryIcon className="h-5 w-5 text-slate-400" />
                      </div>
                      
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline" className={`${severityConfig_.textColor} border-current`}>
                            {severityConfig_.label}
                          </Badge>
                          <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                            {categoryLabels[improvement.category]}
                          </Badge>
                        </div>
                        
                        <div className="space-y-3">
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
                        </div>
                        
                        <div className="text-sm text-slate-300 bg-slate-700/40 p-3 rounded-lg border border-slate-600/50">
                          <strong className="text-slate-200">Why:</strong> {improvement.explanation}
                        </div>
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
