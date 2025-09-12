import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

export interface TechnicalAssessmentResult {
  company: string;
  role: string;
  date: string;
  difficulty: string;
  leetCodeTitle: string;
  overallScore: number;
  codeScore: number;
  explanationScore: number;
  strengths: string[];
  improvementAreas: string[];
  codeFeedback: string;
  explanationFeedback: string;
  keywords: string[];
  thoughtProcess?: string;
  audioUrl?: string | null;
}

export default function TechnicalAssessmentResultsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<TechnicalAssessmentResult | null>(null);

  useEffect(() => {
    const loadResults = async () => {
      setIsLoading(true);
      try {
        const stored = localStorage.getItem('technicalAssessmentResult');
        if (stored) {
          setResult(JSON.parse(stored));
        } else {
          toast({ title: 'No results found', description: 'Using sample data.', variant: 'destructive' });
        }
      } catch (error) {
        toast({ title: 'Error loading results', description: 'Using sample data.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    loadResults();
  }, []);

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
    <div className="flex flex-col min-h-screen bg-slate-900 text-white">
      <header className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <span className="font-bold text-xl">Technical Assessment Results</span>
          <Button variant="outline" size="sm" asChild className="text-slate-300 border-slate-700 hover:bg-slate-800">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </header>
      <div className="flex-1 py-8 bg-slate-900">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className="mb-8 bg-slate-800 border-slate-700 text-slate-100">
            <CardHeader className="pb-4 border-b border-slate-700">
              <div className="flex flex-col md:flex-row justify-between">
                <div>
                  <CardTitle className="text-2xl">{result.leetCodeTitle}</CardTitle>
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
                    {result.strengths.map((s) => (
                      <Badge key={s} className="bg-green-700 text-green-100 hover:bg-green-600">{s}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-sm mb-2 text-slate-300">Areas for Improvement</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.improvementAreas.map((a) => (
                      <Badge key={a} className="bg-yellow-700 text-yellow-100 hover:bg-yellow-600">{a}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="font-medium text-sm mb-2 text-slate-300">Keywords Detected</h3>
                <div className="flex flex-wrap gap-2">
                  {result.keywords.map((k) => (
                    <Badge key={k} className="bg-blue-700 text-blue-100 hover:bg-blue-600">{k}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <div className="flex flex-wrap gap-2 w-full justify-center md:justify-end">
                <Button variant="outline" size="sm" className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800">
                  Download Report
                </Button>
              </div>
            </CardFooter>
          </Card>

          <Card className="mb-8 bg-slate-800 border-slate-700 text-slate-100">
            <CardHeader>
              <CardTitle className="text-lg">Code Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 text-slate-300">Score: <span className="font-bold text-blue-500">{result.codeScore}%</span></div>
              <div className="mb-2 text-slate-300">{result.codeFeedback}</div>
            </CardContent>
          </Card>

          <Card className="mb-8 bg-slate-800 border-slate-700 text-slate-100">
            <CardHeader>
              <CardTitle className="text-lg">Explanation Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 text-slate-300">Score: <span className="font-bold text-blue-500">{result.explanationScore}%</span></div>
              <div className="mb-2 text-slate-300">{result.explanationFeedback}</div>
            </CardContent>
          </Card>
        </div>
        {/* Thought Process Transcript Section */}
        {result.thoughtProcess && (
          <Card className="mb-8 bg-slate-800 border-slate-700 text-slate-100">
            <CardHeader>
              <CardTitle className="text-lg">Thought Process Transcript</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 text-slate-300 whitespace-pre-line">{result.thoughtProcess}</div>
              {result.audioUrl && (
                <audio controls src={result.audioUrl} className="mt-2 w-full" />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
