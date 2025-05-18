'use client';

import { useState, useEffect, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Save } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Question {
  id: number;
  question: string;
  type: string;
}

interface Answer {
  text: string;
  transcript?: string;
  audioUrl?: string;
}

function BehavioralResults() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{[key: number]: Answer}>({});
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    try {
      // Get questions from localStorage
      const questionsData = localStorage.getItem('behavioralQuestions');
      const storedQuestions = questionsData ? JSON.parse(questionsData) : [];
      setQuestions(storedQuestions);
      
      // Get answers from localStorage
      const answersData = localStorage.getItem('behavioralAnswers');
      const storedAnswers = answersData ? JSON.parse(answersData) : {};
      setAnswers(storedAnswers);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error retrieving results data:', error);
      setIsLoading(false);
    }
  }, []);

  const handleExportResults = () => {
    try {
      const results = questions.map(q => ({
        questionNumber: q.id,
        question: q.question,
        answer: answers[q.id]?.text || 'No answer provided'
      }));
      
      const resultsText = results.map(r => 
        `Question ${r.questionNumber}: ${r.question}\n\nAnswer: ${r.answer}\n\n-------------------\n\n`
      ).join('');
      
      const blob = new Blob([resultsText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'interview-results.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting results:', error);
    }
  };
  
  const answeredQuestionsCount = Object.keys(answers).length;
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-zinc-400">Loading your results...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Behavioral Interview Results</h1>
            <p className="text-zinc-400">
              You answered {answeredQuestionsCount} out of {questions.length} questions.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
            <Button variant="outline" className="gap-2" onClick={handleExportResults}>
              <Download className="h-4 w-4" /> Export Results
            </Button>
            <Button asChild className="gap-2">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="space-y-6">
          {questions.map((question) => (
            <Card key={question.id} className="border-zinc-800 shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Question {question.id}</CardTitle>
                  <Badge variant={answers[question.id] ? "success" : "outline"}>
                    {answers[question.id] ? "Answered" : "Skipped"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-medium text-lg mb-4">{question.question}</p>
                {answers[question.id] ? (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 whitespace-pre-wrap">
                    {answers[question.id]?.text || 'No answer provided'}
                  </div>
                ) : (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-zinc-500 italic">
                    No answer provided for this question.
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function BehavioralResultsWithSuspense() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-zinc-400">Loading...</p>
        </div>
      </div>
    }>
      <BehavioralResults />
    </Suspense>
  );
}
