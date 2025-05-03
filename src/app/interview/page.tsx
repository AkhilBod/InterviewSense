'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MessageSquare, Mic, MicOff, ChevronLeft, ChevronRight, RefreshCw, BarChart, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import InterviewFeedback from './components/interview-feedback';

const mockQuestions = [
  {
    id: 1,
    question: "Tell me about yourself and your experience that's relevant to this role.",
    type: "introduction"
  },
  {
    id: 2,
    question: "Describe a challenging project you worked on and how you overcame obstacles.",
    type: "behavioral"
  },
  {
    id: 3,
    question: "How do you handle conflicting priorities when multiple deadlines are approaching?",
    type: "behavioral"
  },
  {
    id: 4,
    question: "What are your greatest strengths and how would they help you succeed in this position?",
    type: "self-assessment"
  },
  {
    id: 5,
    question: "Where do you see yourself in 5 years, and how does this role help you get there?",
    type: "career"
  }
];

export default function InterviewPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState<number[]>([]);

  const currentQuestion = mockQuestions[currentQuestionIndex];
  const totalQuestions = mockQuestions.length;

  useEffect(() => {
    setProgress(((currentQuestionIndex) / (totalQuestions - 1)) * 100);
  }, [currentQuestionIndex, totalQuestions]);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (isRecording && answer === '') {
      setAnswer("This is a simulated transcription of your answer.");
    }
  };

  const handleNextQuestion = () => {
    if (answer.trim() !== '') {
      if (!completedQuestions.includes(currentQuestion.id)) {
        setCompletedQuestions([...completedQuestions, currentQuestion.id]);
      }

      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setAnswer('');
        setFeedbackVisible(false);
      } else {
        setFeedbackVisible(true);
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setFeedbackVisible(false);
    }
  };

  const showFeedback = () => setFeedbackVisible(true);

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white">
      <header className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-blue-500" />
            <span className="font-bold text-xl">InterviewSense</span>
          </div>
          <Button variant="outline" size="sm" asChild className="border-slate-700 text-slate-300 hover:bg-slate-800">
            <Link href="/start">Exit Interview</Link>
          </Button>
        </div>
      </header>

      <div className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2 text-slate-300">
              <p className="text-sm font-medium">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </p>
              <p className="text-sm">{completedQuestions.length} completed</p>
            </div>
            <Progress value={progress} className="h-2 bg-slate-700" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="mb-6 bg-slate-800 border-slate-700 text-slate-100">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="mb-2 text-blue-400 border-blue-500">
                      {currentQuestion.type}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-white">{currentQuestion.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Type your answer here or use the microphone to record..."
                      className="min-h-[200px] resize-none bg-slate-900 border-slate-700 text-white"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                    />
                    <div className="flex items-center justify-between">
                      <Button
                        variant={isRecording ? "destructive" : "outline"}
                        size="sm"
                        className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800"
                        onClick={toggleRecording}
                      >
                        {isRecording ? (
                          <>
                            <MicOff className="h-4 w-4" /> Stop Recording
                          </>
                        ) : (
                          <>
                            <Mic className="h-4 w-4" /> Record Answer
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-slate-400">
                        {isRecording ? "Recording in progress..." : "Click to start recording your answer"}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>
                  <div className="flex gap-2">
                    {answer.trim() !== '' && !feedbackVisible && (
                      <Button
                        variant="outline"
                        onClick={showFeedback}
                        className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800"
                      >
                        <BarChart className="h-4 w-4" /> Get Feedback
                      </Button>
                    )}
                    <Button
                      onClick={handleNextQuestion}
                      disabled={answer.trim() === ''}
                      className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {currentQuestionIndex < totalQuestions - 1 ? (
                        <>Next <ChevronRight className="h-4 w-4" /></>
                      ) : (
                        <>Complete <Save className="h-4 w-4" /></>
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>

            <div className="lg:col-span-1">
              {feedbackVisible ? (
                <InterviewFeedback answer={answer} />
              ) : (
                <Card className="bg-slate-800 border-slate-700 text-slate-100">
                  <CardHeader>
                    <CardTitle className="text-lg">Interview Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-slate-300">
                      {[
                        'Use the STAR method (Situation, Task, Action, Result) for behavioral questions',
                        'Be concise but detailed - aim for 1-2 minute responses',
                        'Include specific metrics and achievements when possible',
                        'Avoid filler words like "um", "like", and "you know"'
                      ].map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <div className="h-5 w-5 flex-shrink-0 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </div>
                          <p>{tip}</p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="fixed bottom-4 right-4 gap-2 border-slate-700 text-slate-300 hover:bg-slate-800">
            <BarChart className="h-4 w-4" /> View Progress
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md bg-slate-900 text-white border-l border-slate-800">
          <SheetHeader>
            <SheetTitle>Interview Progress</SheetTitle>
            <SheetDescription className="text-slate-400">
              {completedQuestions.length} of {totalQuestions} questions completed
            </SheetDescription>
          </SheetHeader>
          <div className="py-6">
            <ul className="space-y-4">
              {mockQuestions.map((q, index) => (
                <li key={q.id} className="flex items-center gap-3">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    completedQuestions.includes(q.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="text-sm flex-1 truncate text-slate-300">
                    {q.question}
                  </div>
                  {completedQuestions.includes(q.id) && (
                    <Badge variant="outline" className="bg-blue-600 text-white border-blue-500">Completed</Badge>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
