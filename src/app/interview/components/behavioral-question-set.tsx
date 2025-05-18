'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Mic, MicOff, ArrowRight, Send } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';

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

export default function BehavioralQuestionSet() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: Answer}>({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  // Audio recording states and refs
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useState<MediaRecorder | null>(null)[0];
  const audioChunksRef = useState<Blob[]>([]);

  useEffect(() => {
    // Try to load questions from localStorage first
    const storedQuestions = localStorage.getItem('behavioralQuestions');
    
    if (storedQuestions) {
      setQuestions(JSON.parse(storedQuestions));
      setLoadingQuestions(false);
    } else {
      // Generate mock questions if none are stored
      const mockQuestions = generateMockQuestions();
      setQuestions(mockQuestions);
      localStorage.setItem('behavioralQuestions', JSON.stringify(mockQuestions));
      setLoadingQuestions(false);
    }

    // Load any previously saved answers
    const storedAnswers = localStorage.getItem('behavioralAnswers');
    if (storedAnswers) {
      setAnswers(JSON.parse(storedAnswers));
    }
  }, []);

  // Generate mock questions for testing
  const generateMockQuestions = (): Question[] => {
    return [
      {
        id: 1,
        question: "Tell me about a time when you had to adapt to a significant change in your workplace.",
        type: "behavioral"
      },
      {
        id: 2,
        question: "Describe a situation where you had to work with a difficult team member. How did you handle it?",
        type: "behavioral"
      },
      {
        id: 3,
        question: "Give me an example of a time when you had to make a difficult decision with limited information.",
        type: "behavioral"
      },
      {
        id: 4,
        question: "Tell me about a project where you demonstrated leadership skills.",
        type: "behavioral"
      },
      {
        id: 5,
        question: "Describe a time when you failed at something. What did you learn from it?",
        type: "behavioral"
      }
    ];
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      saveCurrentAnswer();
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setCurrentAnswer(answers[questions[currentQuestionIndex - 1]?.id]?.text || '');
      setAudioUrl(answers[questions[currentQuestionIndex - 1]?.id]?.audioUrl || null);
    }
  };

  const handleNext = () => {
    saveCurrentAnswer();
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer(answers[questions[currentQuestionIndex + 1]?.id]?.text || '');
      setAudioUrl(answers[questions[currentQuestionIndex + 1]?.id]?.audioUrl || null);
    }
  };

  const saveCurrentAnswer = () => {
    if (currentAnswer.trim() !== '' || audioUrl) {
      const currentQuestionId = questions[currentQuestionIndex]?.id;
      if (currentQuestionId) {
        const updatedAnswers = {
          ...answers,
          [currentQuestionId]: {
            text: currentAnswer,
            audioUrl: audioUrl
          }
        };
        
        setAnswers(updatedAnswers);
        localStorage.setItem('behavioralAnswers', JSON.stringify(updatedAnswers));
      }
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    saveCurrentAnswer();
    
    try {
      // Save the final state to localStorage
      localStorage.setItem('behavioralAnswers', JSON.stringify(answers));
      
      toast({
        title: "Interview completed",
        description: "Your answers have been saved.",
      });
      
      // Navigate to results page
      router.push('/interview/behavioral/results');
    } catch (error) {
      console.error('Error completing interview:', error);
      toast({
        title: "Error saving answers",
        description: "There was a problem saving your answers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Audio recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      // Clear previous audio chunks
      audioChunksRef.length = 0;
      
      recorder.addEventListener('dataavailable', (e) => {
        if (e.data.size > 0) {
          audioChunksRef.push(e.data);
        }
      });
      
      recorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunksRef, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      });
      
      recorder.start();
      setIsRecording(true);
      mediaRecorderRef.current = recorder;
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording failed",
        description: "Could not access your microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  if (loadingQuestions) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-zinc-400">Loading questions...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const hasAnswer = answers[currentQuestion?.id]?.text || audioUrl;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <Badge className="bg-blue-600 text-white">Question {currentQuestionIndex + 1} of {questions.length}</Badge>
        <div className="text-sm text-zinc-400">Progress: {Math.round(progress)}%</div>
      </div>
      
      <Progress value={progress} className="h-2 bg-zinc-800" />
      
      <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
        <h3 className="text-xl font-medium mb-1">{currentQuestion?.question}</h3>
        <p className="text-zinc-400 text-sm">Answer using the STAR method (Situation, Task, Action, Result) for best results.</p>
      </div>
      
      {audioUrl && (
        <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
          <h4 className="text-sm font-medium mb-2 text-zinc-300">Your recorded audio:</h4>
          <audio src={audioUrl} controls className="w-full" />
        </div>
      )}
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium text-zinc-300">Your answer:</h4>
          <div>
            {isRecording ? (
              <Button
                size="sm"
                variant="destructive"
                className="gap-2"
                onClick={stopRecording}
              >
                <MicOff className="h-4 w-4" />
                Stop Recording
              </Button>
            ) : (
              <Button 
                size="sm" 
                variant="outline" 
                className="gap-2"
                onClick={startRecording}
              >
                <Mic className="h-4 w-4" />
                Record Answer
              </Button>
            )}
          </div>
        </div>
        
        <Textarea
          value={currentAnswer}
          onChange={(e) => setCurrentAnswer(e.target.value)}
          placeholder="Type your answer here..."
          className="min-h-[200px] bg-zinc-900 border-zinc-800 text-white"
        />
      </div>
      
      <div className="flex justify-between pt-4">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0 || isSubmitting}
          className="gap-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>
        
        <div className="flex gap-2">
          {currentQuestionIndex < questions.length - 1 ? (
            <Button 
              onClick={handleNext}
              disabled={!hasAnswer || isSubmitting}
              className="gap-1"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleComplete}
              disabled={!hasAnswer || isSubmitting}
              className="gap-1 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Saving...
                </>
              ) : (
                <>
                  Complete <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
