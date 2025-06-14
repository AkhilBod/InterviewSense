"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check, AlertTriangle, Target, TrendingUp, Lightbulb, Brain } from "lucide-react";
import { SpecificAnalysisData, SpecificImprovementSuggestion } from "@/types/resume";
import { useToast } from "@/components/ui/use-toast";

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
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { toast } = useToast();

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => new Set(prev).add(index));
      toast({
        title: "Copied!",
        description: "Improvement suggestion copied to clipboard",
      });
      
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(index);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'red': return 'bg-red-900/20 border-red-500/30 text-red-300';
      case 'yellow': return 'bg-yellow-900/20 border-yellow-500/30 text-yellow-300';
      case 'green': return 'bg-green-900/20 border-green-500/30 text-green-300';
      default: return 'bg-slate-700/40 border-slate-600/50 text-slate-300';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'red': return <AlertTriangle className="h-4 w-4" />;
      case 'yellow': return <Target className="h-4 w-4" />;
      case 'green': return <TrendingUp className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'quantify_impact': return <TrendingUp className="h-4 w-4" />;
      case 'communication': return <Brain className="h-4 w-4" />;
      case 'length_depth': return <Target className="h-4 w-4" />;
      case 'drive': return <Lightbulb className="h-4 w-4" />;
      case 'analytical': return <Brain className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const formatCategoryName = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const filteredImprovements = analysis.specificImprovements.filter(improvement => {
    const severityMatch = selectedSeverity === "all" || improvement.severity === selectedSeverity;
    const categoryMatch = selectedCategory === "all" || improvement.category === selectedCategory;
    return severityMatch && categoryMatch;
  });

  const severityOptions = [
    { value: "all", label: "All Priorities", count: analysis.specificImprovements.length },
    { value: "red", label: "Critical", count: analysis.severityBreakdown.red },
    { value: "yellow", label: "Important", count: analysis.severityBreakdown.yellow },
    { value: "green", label: "Polish", count: analysis.severityBreakdown.green },
  ];

  const categoryOptions = [
    { value: "all", label: "All Categories", count: analysis.specificImprovements.length },
    { value: "quantify_impact", label: "Quantify Impact", count: analysis.categoryBreakdown.quantify_impact },
    { value: "communication", label: "Communication", count: analysis.categoryBreakdown.communication },
    { value: "length_depth", label: "Length & Depth", count: analysis.categoryBreakdown.length_depth },
    { value: "drive", label: "Drive", count: analysis.categoryBreakdown.drive },
    { value: "analytical", label: "Analytical", count: analysis.categoryBreakdown.analytical },
  ];

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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800 border-slate-700 text-slate-100">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">{analysis.overallScore}</div>
            <div className="text-slate-400">Overall Score</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700 text-slate-100">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-red-400 mb-2">{analysis.severityBreakdown.red}</div>
            <div className="text-slate-400">Critical Issues</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700 text-slate-100">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">{analysis.severityBreakdown.yellow}</div>
            <div className="text-slate-400">Important Items</div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Summary */}
      <Card className="bg-slate-800 border-slate-700 text-slate-100">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-red-400 mb-2">Critical Issues</h4>
            <p className="text-slate-300">{analysis.improvementSummary.criticalIssues}</p>
          </div>
          <div>
            <h4 className="font-semibold text-yellow-400 mb-2">Key Opportunities</h4>
            <p className="text-slate-300">{analysis.improvementSummary.keyOpportunities}</p>
          </div>
          <div>
            <h4 className="font-semibold text-green-400 mb-2">Strengths to Keep</h4>
            <p className="text-slate-300">{analysis.improvementSummary.strengthsToKeep}</p>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700 text-slate-100">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Filter Improvements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Priority Level</label>
              <div className="flex flex-wrap gap-2">
                {severityOptions.map(option => (
                  <Button
                    key={option.value}
                    variant={selectedSeverity === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSeverity(option.value)}
                    className="gap-2"
                  >
                    {option.label} ({option.count})
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.filter(opt => opt.count > 0).map(option => (
                  <Button
                    key={option.value}
                    variant={selectedCategory === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(option.value)}
                    className="gap-2"
                  >
                    {option.label} ({option.count})
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Specific Improvements */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-slate-100">
          Specific Improvements ({filteredImprovements.length})
        </h3>
        
        {filteredImprovements.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700 text-slate-100">
            <CardContent className="p-8 text-center">
              <div className="text-slate-400">No improvements found for the selected filters.</div>
            </CardContent>
          </Card>
        ) : (
          filteredImprovements.map((improvement, index) => (
            <Card 
              key={index} 
              className={`${getSeverityColor(improvement.severity)} border transition-all duration-300 hover:shadow-lg`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(improvement.severity)}
                      <Badge 
                        variant="secondary" 
                        className={`${getSeverityColor(improvement.severity)} font-medium`}
                      >
                        {improvement.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(improvement.category)}
                      <Badge 
                        variant="outline" 
                        className="border-slate-500/50 text-slate-300"
                      >
                        {formatCategoryName(improvement.category)}
                      </Badge>
                    </div>
                  </div>
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
