'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MessageSquare, Mic, MicOff, ChevronLeft, ChevronRight, RefreshCw, BarChart, Save, User, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { toast } from "@/components/ui/use-toast";
import InterviewFeedback from './components/interview-feedback';
import { generateBehavioralQuestions, transcribeAndAnalyzeAudio } from '@/lib/gemini';
import ProtectedRoute from '@/components/ProtectedRoute';
import { MicrophonePermissionGuide } from '@/components/MicrophonePermissionGuide';
import { MicrophoneTest } from '@/components/MicrophoneTest';
import { testMicrophone } from '@/lib/microphone';
import CodeEditor from '@/components/CodeEditor';

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
  },
  {
    id: 6,
    question: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
    type: "coding"
  },
  {
    id: 7,
    question: "Implement a function to reverse a linked list. What is the time and space complexity of your solution?",
    type: "technical"
  }
];

function InterviewPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState<number[]>([]);
  const [questions, setQuestions] = useState<Array<{ id: number; question: string; type: string }>>([]);
  const [visibleQuestions, setVisibleQuestions] = useState<Array<{ id: number; question: string; type: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Preparing your interview...');
  const [allAnswers, setAllAnswers] = useState<{[key: number]: string}>({});
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Add state for microphone permission guide
  const [showPermissionGuide, setShowPermissionGuide] = useState(false);

  // Audio recording states and refs
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // AssemblyAI will be initialized in the transcription function

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoadingMessage('Generating personalized questions...');
        // Check if API key is available
        if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
          console.error('NEXT_PUBLIC_GEMINI_API_KEY is not set in environment variables');
          setQuestions(mockQuestions);
          setVisibleQuestions(mockQuestions.slice(0, 5));
          localStorage.setItem('allQuestions', JSON.stringify(mockQuestions));
          setIsLoading(false);
          return;
        }

        // Get job details from localStorage or state management
        const jobDetails = {
          jobTitle: localStorage.getItem('jobTitle') || 'Software Engineer',
          company: localStorage.getItem('company') || '',
          industry: localStorage.getItem('industry') || 'Technology',
          experienceLevel: localStorage.getItem('experienceLevel') || 'Mid-level',
          interviewType: localStorage.getItem('interviewType') || 'Behavioral',
          interviewStage: localStorage.getItem('interviewStage') || 'Initial'
        };

        setLoadingMessage('Creating questions specific to your role...');
        const behavioralQuestions = await generateBehavioralQuestions(jobDetails);
        
        setLoadingMessage('Finalizing your interview...');
        
        // Validate that we have exactly 20 questions from Gemini
        if (!Array.isArray(behavioralQuestions) || behavioralQuestions.length !== 20) {
          throw new Error('Invalid number of questions received from API');
        }

        // Create array with behavioral questions
        const allQuestions = behavioralQuestions.map((q: any, index: number) => ({
          id: index + 1,
          question: q.question,
          type: "behavioral"
        }));

        // Validate final question count
        if (allQuestions.length !== 20) {
          throw new Error('Invalid total number of questions');
        }

        setQuestions(allQuestions);
        // Show only the first 5 questions initially
        setVisibleQuestions(allQuestions.slice(0, 5));
        
        // Save all questions to localStorage for later use
        localStorage.setItem('allQuestions', JSON.stringify(allQuestions));
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching questions:', error);
        // Fallback to mock questions if API fails
        setQuestions(mockQuestions);
        // Show only the first 5 mock questions initially
        setVisibleQuestions(mockQuestions.slice(0, 5));
        localStorage.setItem('allQuestions', JSON.stringify(mockQuestions));
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Load previously saved answers from sessionStorage when component mounts
  useEffect(() => {
    const savedAnswers = sessionStorage.getItem('interviewAnswers');
    if (savedAnswers) {
      try {
        const parsedAnswers = JSON.parse(savedAnswers);
        setAllAnswers(parsedAnswers);
      } catch (error) {
        console.error('Error parsing saved answers:', error);
      }
    }
  }, []);

  // Clear session data when component unmounts (user navigates away without completing)
  useEffect(() => {
    return () => {
      // Only clear if we're not going to the results page
      if (!window.location.pathname.includes('/results')) {
        sessionStorage.removeItem('interviewAnswers');
      }
    };
  }, []);

  // Function to load the next batch of 5 questions
  const loadMoreQuestions = () => {
    const currentCount = visibleQuestions.length;
    const nextBatch = questions.slice(currentCount, currentCount + 5);
    
    if (nextBatch.length > 0) {
      // Save current answer before changing questions
      if (answer.trim() !== '' && currentQuestion) {
        const updatedAnswers = {...allAnswers, [currentQuestion.id]: answer};
        setAllAnswers(updatedAnswers);
        sessionStorage.setItem('interviewAnswers', JSON.stringify(updatedAnswers));
      }
      
      // Add the next 5 questions to visible questions
      setVisibleQuestions([...visibleQuestions, ...nextBatch]);
      
      // Move to the next question (first of the new batch)
      setCurrentQuestionIndex(currentCount);
      setFeedbackVisible(false);
      // Note: answer will be cleared by the useEffect since it's a new question
      
      toast({
        title: "New questions loaded",
        description: `${nextBatch.length} more interview questions have been added.`,
      });
    }
  };

  // Function to complete the interview early
  const completeEarly = () => {
    // Transfer session answers to localStorage for results page
    const sessionAnswers = sessionStorage.getItem('interviewAnswers');
    if (sessionAnswers) {
      localStorage.setItem('interviewAnswers', sessionAnswers);
    }
    
    // Save the questions that were actually seen and answered
    localStorage.setItem('visibleQuestions', JSON.stringify(visibleQuestions));
    
    // Save completed questions count for results page
    localStorage.setItem('completedQuestionsCount', String(completedQuestions.length));
    
    // Clear session storage as we're done with this interview
    sessionStorage.removeItem('interviewAnswers');
    
    // Navigate to results page
    router.push('/results');
  };

  const currentQuestion = visibleQuestions[currentQuestionIndex] || mockQuestions[currentQuestionIndex];
  const totalQuestions = visibleQuestions.length || mockQuestions.length;

  // Update answer field when question changes (restore previous answer or clear)
  useEffect(() => {
    if (currentQuestion) {
      const savedAnswer = allAnswers[currentQuestion.id];
      setAnswer(savedAnswer || '');
    }
  }, [currentQuestionIndex, currentQuestion, allAnswers]);

  useEffect(() => {
    // Calculate progress based on visible questions
    const visibleQuestionsCount = visibleQuestions.length;
    setProgress(((currentQuestionIndex) / (visibleQuestionsCount - 1)) * 100);
  }, [currentQuestionIndex, visibleQuestions.length]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);
  
  // Add cleanup effect to ensure recording is stopped when component unmounts
  useEffect(() => {
    // Return cleanup function
    return () => {
      // Stop recording if active when component unmounts
      if (isRecording && mediaRecorderRef.current) {
        console.log("Cleanup: Stopping recording on unmount");
        try {
          if (mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
          }
          
          if (mediaRecorderRef.current.stream) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
          }
        } catch (err) {
          console.error("Error during recording cleanup:", err);
        }
      }
    };
  }, [isRecording]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-zinc-400">{loadingMessage}</p>
          <p className="mt-2 text-sm text-zinc-500">This may take a few moments...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Start or stop the recording process
  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current) {
        try {
          // Make sure we're stopping the recorder if it's active
          if (mediaRecorderRef.current.state === "recording" || mediaRecorderRef.current.state === "paused") {
            console.log("Stopping active recorder...");
            mediaRecorderRef.current.stop();
          } else {
            console.log("Recorder already stopped, just cleaning up");
          }
          
          // Stop all audio tracks from the stream to ensure proper cleanup
          if (mediaRecorderRef.current.stream) {
            console.log("Stopping all audio tracks...");
            mediaRecorderRef.current.stream.getTracks().forEach(track => {
              track.stop();
              console.log("Track stopped:", track.kind, track.readyState);
            });
          }
          
          // Force UI update
          setMediaRecorder(null);
        } catch (stopError) {
          console.error("Error stopping recording:", stopError);
        }
        
        // Always update the recording state regardless of any errors
        setIsRecording(false);
        toast({
          title: "Recording stopped",
          description: "Processing your audio..."
        });
      } else {
        // No active recorder but UI shows recording, fix the state
        setIsRecording(false);
        console.warn("Recording state was active but no recorder found");
      }
    } else {
      try {
        // First check if browser supports getUserMedia
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          toast({
            title: "Browser Compatibility Error",
            description: "Your browser doesn't support microphone access. Please try using Chrome, Firefox, or Safari.",
            variant: "destructive"
          });
          return;
        }
        
        // Browser detection for Safari-specific handling
        const browserInfo = {
          isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent) || 
                   (navigator.userAgent.includes('AppleWebKit') && !navigator.userAgent.includes('Chrome'))
        };
        console.log("Browser detection:", {
          isSafari: browserInfo.isSafari,
          userAgent: navigator.userAgent
        });
        
        // Do a pre-check on microphone accessibility
        const micTest = await testMicrophone();
        if (!micTest.success) {
          toast({
            title: "Microphone Error",
            description: micTest.message || "Could not access your microphone. Please check permissions.",
            variant: "destructive"
          });
          
          // Show the permission guide for denied permissions
          if (micTest.message?.includes("denied") || micTest.message?.includes("settings")) {
            setShowPermissionGuide(true);
          }
          return;
        }
        
        // Try to request mic permission with better error detection
        // Safari needs very simple audio constraints to work properly
        const audioConstraints = browserInfo.isSafari ? { audio: true } : { 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 48000,
          } 
        };
        
        console.log("Using audio constraints:", audioConstraints);
        const stream = await navigator.mediaDevices.getUserMedia(audioConstraints);
        
        // Create MediaRecorder with browser-specific settings
        let recorder: MediaRecorder;
        let blobType = 'audio/webm';
        
        // We already have browserInfo.isSafari from above
        console.log("Browser detection details:", {
          isSafari: browserInfo.isSafari, 
          userAgent: navigator.userAgent
        });
        
        if (browserInfo.isSafari) {
          console.log("Safari detected, using fallback MediaRecorder configuration");
          
          // Safari needs special handling for MediaRecorder
          try {
            // Log which audio formats are supported
            if (typeof MediaRecorder.isTypeSupported === 'function') {
              console.log("Safari supported audio types:", {
                mp4: MediaRecorder.isTypeSupported('audio/mp4'),
                webm: MediaRecorder.isTypeSupported('audio/webm')
              });
            }
            
            // For Safari, use the most basic configuration possible
            blobType = 'audio/mp4'; // For the final blob
            recorder = new MediaRecorder(stream);
            
            console.log("Safari MediaRecorder created with state:", recorder.state);
          } catch (error: any) {
            console.error("Safari MediaRecorder creation failed:", error);
            toast({
              title: "Safari Microphone Setup",
              description: "Debug info: " + (error?.message || "Unknown Safari audio error"),
              variant: "destructive"
            });
            
            // Final attempt with absolutely minimal configuration
            try {
              recorder = new MediaRecorder(stream);
            } catch (finalError: any) {
              console.error("Final Safari MediaRecorder attempt failed:", finalError);
              throw new Error("Cannot initialize audio recording in Safari: " + (finalError?.message || "Unknown error"));
            }
          }
        } else {
          // Non-Safari browsers (Chrome, Firefox, etc)
          try {
            recorder = new MediaRecorder(stream, {
              mimeType: 'audio/webm;codecs=opus',
              audioBitsPerSecond: 128000
            });
          } catch (error: any) {
            console.error("MediaRecorder error:", error);
            // Fallback to basic configuration
            recorder = new MediaRecorder(stream);
          }
        }
        
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];
        
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };
        
        recorder.onstop = async () => {
          // Create a blob from audio chunks
          const audioBlob = new Blob(audioChunksRef.current, { type: blobType });
          setAudioChunks(audioChunksRef.current);
          
          // Create a URL for the audio blob
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudioUrl(audioUrl);
          
          // Start transcription
          await transcribeAudio(audioBlob);
        };
        
        // For Safari, use special handling to ensure audio recording works
        try {
          if (browserInfo.isSafari) {
            // Safari needs time slices to work more reliably
            console.log("Starting Safari recorder with time slices");
            recorder.start(500); // Get data every 500ms for more reliable recording
            
            // Store a timestamp to ensure we can force stop if needed
            const recordingStartTime = Date.now();
            
            // Add recording cleanup after 2 minutes max (safety fallback)
            setTimeout(() => {
              if (isRecording && Date.now() - recordingStartTime > 2 * 60 * 1000) {
                console.warn("Force stopping long-running Safari recording");
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                  try {
                    mediaRecorderRef.current.stop();
                    setIsRecording(false);
                  } catch (err) {
                    console.error("Error auto-stopping Safari recording:", err);
                  }
                }
              }
            }, 2 * 60 * 1000);
            
            // Add a debug toast to show Safari is being used
            toast({
              title: "Safari Recording Mode",
              description: "Press the Stop button when you finish speaking.",
            });
          } else {
            console.log("Starting standard recorder");
            recorder.start();
          }
        } catch (startError: any) {
          console.error("Error starting recorder:", startError);
          toast({
            title: "Recording Error",
            description: "Could not start recording: " + (startError?.message || "Unknown error"),
            variant: "destructive"
          });
          
          // Make sure recording state is reset on error
          setIsRecording(false);
        }
        
        setIsRecording(true);
        setMediaRecorder(recorder);
        
        toast({
          title: "Recording started",
          description: "Speak clearly into your microphone",
        });
      } catch (error) {
        console.error('Error accessing microphone:', error);
        
        // Provide more detailed error messages based on the error type
        let errorMessage = "Could not access your microphone.";
        
        if (error instanceof DOMException) {
          switch (error.name) {
            case 'NotAllowedError':
            case 'PermissionDeniedError':
              errorMessage = "Microphone access was denied. Please allow microphone access in your browser settings and try again.";
              // Show the microphone permission guide dialog
              setShowPermissionGuide(true);
              break;
            case 'NotFoundError':
            case 'DevicesNotFoundError':
              errorMessage = "No microphone detected. Please connect a microphone and try again.";
              break;
            case 'NotReadableError':
            case 'TrackStartError':
              errorMessage = "Your microphone is in use by another application. Please close other applications that might be using your microphone.";
              break;
            case 'OverconstrainedError':
              errorMessage = "Could not find a microphone that meets the requirements. Please try with different settings.";
              break;
            case 'AbortError':
              errorMessage = "The microphone operation was aborted. Please try again.";
              break;
            case 'SecurityError':
              errorMessage = "The use of your microphone is blocked by your browser's security settings.";
              setShowPermissionGuide(true);
              break;
          }
        }
        
        toast({
          title: "Microphone Error",
          description: errorMessage + " Please check your browser settings.",
          variant: "destructive"
        });
      }
    }
  };
  
  // Transcribe audio using Gemini AI
  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      setIsTranscribing(true);
      toast({
        title: "Transcribing audio",
        description: "This may take a few moments...",
      });
      
      console.log("Starting transcription with Gemini AI");
      
      if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        console.error("NEXT_PUBLIC_GEMINI_API_KEY is not defined. Check your .env file.");
        toast({
          title: "Configuration Error",
          description: "API key for transcription is missing. Please contact support.",
          variant: "destructive"
        });
        setIsTranscribing(false);
        return;
      }
      
      // Use our new Gemini function to transcribe and analyze the audio
      const transcriptResult = await transcribeAndAnalyzeAudio(audioBlob);
      
      console.log("Transcription response from Gemini:", transcriptResult);
      
      if (transcriptResult && transcriptResult.transcription) {
        // Set the transcribed text as the answer and reset feedback visibility
        setAnswer(transcriptResult.transcription);
        setFeedbackVisible(false);
        
        // Get sentiment analysis if available
        let sentimentMessage = "";
        if (transcriptResult.sentiment) {
          const sentiment = transcriptResult.sentiment.tone;
          const confidence = transcriptResult.sentiment.confidence;
          sentimentMessage = `Your answer has a ${sentiment.toLowerCase()} tone (${Math.round(confidence * 100)}% confidence).`;
        }
        
        // Show filler words if any
        let fillerWordsMessage = "";
        if (transcriptResult.filler_words && transcriptResult.filler_words.length > 0) {
          const fillerCount = transcriptResult.filler_words.reduce(
            (sum: number, item: {word: string, count: number}) => sum + item.count, 
            0
          );
          if (fillerCount > 0) {
            fillerWordsMessage = ` You used ${fillerCount} filler words.`;
          }
        }
        
        toast({
          title: "Transcription complete",
          description: sentimentMessage + fillerWordsMessage || "Your answer has been transcribed.",
        });
      } else {
        console.error("Transcription failed: Empty or invalid response", transcriptResult);
        toast({
          title: "Transcription issue",
          description: "Could not transcribe audio clearly. Please try again or type your answer.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Transcription error:', error);
      let errorMessage = "There was an error transcribing your audio.";
      
      // Extract more specific error message if available
      if (error instanceof Error) {
        errorMessage += " Error: " + error.message;
      }
      
      toast({
        title: "Transcription failed",
        description: errorMessage + " Please try again or type your answer.",
        variant: "destructive"
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleNextQuestion = () => {
    if (answer.trim() !== '') {
      if (!completedQuestions.includes(currentQuestion.id)) {
        setCompletedQuestions([...completedQuestions, currentQuestion.id]);
      }

      // Store the answer for this question
      const updatedAnswers = {...allAnswers, [currentQuestion.id]: answer};
      setAllAnswers(updatedAnswers);
      
      // Save to sessionStorage
      sessionStorage.setItem('interviewAnswers', JSON.stringify(updatedAnswers));

      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setFeedbackVisible(false);
        // Note: answer will be restored by the useEffect that watches currentQuestionIndex
      }
    }
  };

  const handleComplete = () => {
    if (answer.trim() !== '') {
      if (!completedQuestions.includes(currentQuestion.id)) {
        setCompletedQuestions([...completedQuestions, currentQuestion.id]);
      }
      
      // Store the final answer
      const updatedAnswers = {...allAnswers, [currentQuestion.id]: answer};
      setAllAnswers(updatedAnswers);
      
      // Transfer final answers to localStorage for results page
      localStorage.setItem('interviewAnswers', JSON.stringify(updatedAnswers));

      // Save the questions that were actually shown to localStorage for results page
      localStorage.setItem('visibleQuestions', JSON.stringify(visibleQuestions));
      
      // Save completed questions count for results page
      localStorage.setItem('completedQuestionsCount', String(completedQuestions.length + 1));
      
      // Clear session storage as we're done with this interview
      sessionStorage.removeItem('interviewAnswers');
      
      router.push('/results');
    }
  };
  
  // No longer need handleGenerateMore as we display all 20 questions by default

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      // Save current answer before navigating back
      if (answer.trim() !== '' && currentQuestion) {
        const updatedAnswers = {...allAnswers, [currentQuestion.id]: answer};
        setAllAnswers(updatedAnswers);
        sessionStorage.setItem('interviewAnswers', JSON.stringify(updatedAnswers));
      }
      
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setFeedbackVisible(false);
      // Note: answer will be restored by the useEffect that watches currentQuestionIndex
    }
  };

  const showFeedback = () => setFeedbackVisible(true);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <ProtectedRoute>
      <div className="relative min-h-screen bg-slate-900 py-8 px-4">
        {/* Permission guide dialog */}
        <MicrophonePermissionGuide 
          isOpen={showPermissionGuide}
          onClose={() => setShowPermissionGuide(false)}
        />

        <div className="mx-auto max-w-5xl">
          <header className="border-b border-slate-800">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Image src="/logo.webp" alt="InterviewSense" width={32} height={32} className="object-contain" />
                <span className="font-bold text-xl">InterviewSense</span>
              </div>
              <div className="flex items-center gap-4">
                {session ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={session.user?.image || ''} alt={session.user?.name || 'User'} />
                          <AvatarFallback className="bg-blue-500">
                            {session.user?.name?.charAt(0) || <User className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-slate-900 border-slate-800" align="end">
                      <DropdownMenuLabel className="text-slate-400">My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-slate-800" />
                      <DropdownMenuItem asChild className="text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer">
                        <Link href="/dashboard">Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer">
                        <Link href="/start">Exit Interview</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-400 hover:bg-slate-800 hover:text-red-300 cursor-pointer"
                        onClick={handleSignOut}
                      >
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button variant="outline" size="sm" asChild className="border-slate-700 text-slate-300 hover:bg-slate-800">
                    <Link href="/login">Sign in</Link>
                  </Button>
                )}
              </div>
            </div>
          </header>

          <div className="flex-1 py-8">
            <div className="container mx-auto px-4">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2 text-slate-300">
                  <p className="text-sm font-medium">
                    Question {currentQuestionIndex + 1} of {visibleQuestions.length}
                    {visibleQuestions.length < questions.length && <span className="text-xs text-slate-400"> (showing {visibleQuestions.length} of {questions.length} available)</span>}
                  </p>
                  <p className="text-sm">{completedQuestions.length} completed</p>
                </div>
                <Progress value={progress} className="h-2 bg-slate-700" />
              </div>

              <div className={`grid gap-6 ${(currentQuestion.type === 'coding' || currentQuestion.type === 'technical') ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
                <div className={`${(currentQuestion.type === 'coding' || currentQuestion.type === 'technical') ? '' : 'lg:col-span-2'}`}>
                  <Card className="mb-6 bg-slate-800 border-slate-700 text-slate-100">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-blue-400 border-blue-500">
                          {currentQuestion.type}
                        </Badge>
                        {allAnswers[currentQuestion.id] && (
                          <Badge variant="secondary" className="text-green-400 bg-green-500/10 border-green-500/20">
                            Previously Answered
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl text-white">{currentQuestion.question}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Conditional rendering based on question type */}
                      {(currentQuestion.type === 'coding' || currentQuestion.type === 'technical') ? (
                        <div className="space-y-4">
                          <CodeEditor
                            question={currentQuestion.question}
                            value={answer}
                            onChange={setAnswer}
                            className="min-h-[600px]"
                          />
                        </div>
                      ) : (
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
                              className={`gap-2 ${isRecording ? "bg-red-600 hover:bg-red-700 text-white border-red-700" : "border-slate-700 text-slate-300 hover:bg-slate-800"}`}
                              onClick={toggleRecording}
                              disabled={isTranscribing}
                            >
                              {isRecording ? (
                                <>
                                  <MicOff className={`h-4 w-4 ${isRecording ? "animate-pulse" : ""}`} /> Stop Recording
                                </>
                              ) : isTranscribing ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" /> Transcribing...
                                </>
                              ) : (
                                <>
                                  <Mic className="h-4 w-4" /> Record Answer
                                </>
                              )}
                            </Button>
                            <p className={`text-xs ${isRecording ? "text-red-400 font-medium" : "text-slate-400"}`}>
                              {isRecording 
                                ? "● Recording in progress... (Click Stop when finished)" 
                                : isTranscribing 
                                  ? "Transcribing your answer..." 
                                  : audioUrl 
                                    ? "Audio recorded and transcribed" 
                                    : "Click to start recording your answer"}
                            </p>
                          </div>
                          {/* Audio player removed as requested */}
                        </div>
                      )}
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
                        {/* Show Load More button on multiples of 5, otherwise show feedback button */}
                        {answer.trim() !== '' && !feedbackVisible && (
                          <>
                            {((currentQuestionIndex + 1) % 5 === 0 && visibleQuestions.length < questions.length) ? (
                              <Button
                                variant="outline"
                                onClick={loadMoreQuestions}
                                className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800"
                              >
                                <RefreshCw className="h-4 w-4" /> Show 5 More
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                onClick={showFeedback}
                                className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800"
                              >
                                <BarChart className="h-4 w-4" /> Get Feedback
                              </Button>
                            )}
                          </>
                        )}
                        
                        {/* Show different buttons on multiples of 5 (except the final question) */}
                        {((currentQuestionIndex + 1) % 5 === 0 && currentQuestionIndex !== visibleQuestions.length - 1) ? (
                          <>
                            <Button
                              onClick={completeEarly}
                              disabled={answer.trim() === ''}
                              className="gap-2 bg-slate-700 hover:bg-slate-800 text-white"
                            >
                              <>Complete <Save className="h-4 w-4" /></>
                            </Button>
                            
                            {/* Show "More Questions" button if there are more available */}
                            {visibleQuestions.length < questions.length && (
                              <Button
                                onClick={loadMoreQuestions}
                                disabled={answer.trim() === ''}
                                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <>Next 5 <ChevronRight className="h-4 w-4" /></>
                              </Button>
                            )}
                          </>
                        ) : (
                          <Button
                            onClick={currentQuestionIndex < visibleQuestions.length - 1 ? handleNextQuestion : handleComplete}
                            disabled={answer.trim() === ''}
                            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            {currentQuestionIndex < visibleQuestions.length - 1 ? (
                              <>Next <ChevronRight className="h-4 w-4" /></>
                            ) : (
                              <>Complete <Save className="h-4 w-4" /></>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                </div>

                {/* Sidebar - only show for non-coding questions */}
                {!(currentQuestion.type === 'coding' || currentQuestion.type === 'technical') && (
                  <div className="lg:col-span-1">
                    {feedbackVisible ? (
                      <InterviewFeedback answer={answer} question={questions[currentQuestionIndex]?.question} />
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
                )}
              </div>
            </div>
          </div>

          {/* Microphone Permission Guide */}
          <MicrophonePermissionGuide isOpen={showPermissionGuide} onClose={() => setShowPermissionGuide(false)} />

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
                  {visibleQuestions.map((q, index) => (
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
      </div>
    </ProtectedRoute>
  );
}

export default function InterviewPageWithSuspense() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-zinc-400">Loading...</p>
        </div>
      </div>
    }>
      <InterviewPage />
    </Suspense>
  );
}
