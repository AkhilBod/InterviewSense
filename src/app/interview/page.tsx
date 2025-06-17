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
  const [isAnalyzingFeedback, setIsAnalyzingFeedback] = useState(false);
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
  const setupSessionRef = useRef<number | null>(null);

  // New TTS and interview flow states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [interviewPhase, setInterviewPhase] = useState<'loading' | 'speaking' | 'ready' | 'recording' | 'processing' | 'feedback'>('loading');
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Audio visualization states
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(40).fill(4)); // Enhanced with baseline
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const audioVisualizationRef = useRef<number | null>(null);
  
  // Speaking animation states
  const [speakingIntensity, setSpeakingIntensity] = useState(0);
  const speakingAnimationRef = useRef<number | null>(null);
  
  // Voice loading state
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  
  // AssemblyAI will be initialized in the transcription function

  // Initialize voices on component mount
  useEffect(() => {
    const initializeVoices = () => {
      if ('speechSynthesis' in window) {
        const loadVoices = () => {
          const voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) {
            setVoicesLoaded(true);
            console.log('Available voices:', voices.map(v => v.name));
          }
        };
        
        // Load voices immediately if available
        loadVoices();
        
        // Also listen for voices changed event (some browsers load voices asynchronously)
        window.speechSynthesis.onvoiceschanged = loadVoices;
        
        return () => {
          window.speechSynthesis.onvoiceschanged = null;
        };
      }
    };
    
    initializeVoices();
  }, []);

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
          setInterviewPhase('speaking');
          return;
        }

        // Get job details from localStorage or state management
        const interviewType = localStorage.getItem('interviewType') || 'Behavioral';
        const jobDetails = {
          jobTitle: localStorage.getItem('jobTitle') || 'Software Engineer',
          company: localStorage.getItem('company') || '',
          industry: interviewType === 'Behavioral' ? '' : (localStorage.getItem('industry') || 'Technology'),
          experienceLevel: localStorage.getItem('experienceLevel') || 'Mid-level',
          interviewType: interviewType,
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
        setInterviewPhase('speaking');
      } catch (error) {
        console.error('Error fetching questions:', error);
        // Fallback to mock questions if API fails
        setQuestions(mockQuestions);
        // Show only the first 5 mock questions initially
        setVisibleQuestions(mockQuestions.slice(0, 5));
        localStorage.setItem('allQuestions', JSON.stringify(mockQuestions));
        setIsLoading(false);
        setInterviewPhase('speaking');
      }
    };

    fetchQuestions();
  }, []);

  // Start TTS and interview flow when questions are loaded or question changes
  useEffect(() => {
    if (interviewPhase === 'speaking' && visibleQuestions.length > 0 && visibleQuestions[currentQuestionIndex] && voicesLoaded) {
      // Small delay to ensure state is properly set and voices are ready
      const timer = setTimeout(() => {
        startQuestionFlow();
      }, 500); // Increased delay for first question
      
      return () => clearTimeout(timer);
    }
  }, [interviewPhase, currentQuestionIndex, visibleQuestions, voicesLoaded]);

  // TTS and Interview Flow Functions
  const startQuestionFlow = async () => {
    const currentQuestion = visibleQuestions[currentQuestionIndex];
    if (!currentQuestion) return;

    setFeedbackVisible(false);
    setCurrentTranscript('');
    setAnswer('');
    
    // Start speaking the question
    speakQuestion(currentQuestion.question);
  };

  // Add effect to handle audio permissions and initialization
  useEffect(() => {
    // Initialize audio permissions on component mount
    const initializeAudio = async () => {
      try {
        // Try to enable audio context for better browser compatibility
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          // Wait for voices to load
          await ensureVoicesLoaded();
          console.log('🎵 Audio system initialized successfully');
        }
      } catch (error) {
        console.warn('⚠️ Audio initialization warning:', error);
      }
    };

    initializeAudio();
  }, []);

  // Add click handler to enable audio on user interaction
  useEffect(() => {
    const enableAudioOnInteraction = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        // Try speaking a silent phrase to enable audio
        const enablerUtterance = new SpeechSynthesisUtterance('');
        enablerUtterance.volume = 0;
        try {
          window.speechSynthesis.speak(enablerUtterance);
          console.log('🔓 Audio enabled via user interaction');
          
          // If this is the first question and TTS failed, retry
          if (currentQuestionIndex === 0 && interviewPhase === 'ready' && currentTranscript.includes('Click anywhere')) {
            console.log('🔄 Retrying first question TTS after user interaction');
            setTimeout(() => {
              if (visibleQuestions[0]) {
                speakQuestion(visibleQuestions[0].question);
              }
            }, 500);
          }
        } catch (error) {
          console.warn('⚠️ Could not enable audio:', error);
        }
      }
    };

    // Add event listeners for user interaction
    document.addEventListener('click', enableAudioOnInteraction, { once: true });
    document.addEventListener('keydown', enableAudioOnInteraction, { once: true });
    document.addEventListener('touchstart', enableAudioOnInteraction, { once: true });

    return () => {
      document.removeEventListener('click', enableAudioOnInteraction);
      document.removeEventListener('keydown', enableAudioOnInteraction);
      document.removeEventListener('touchstart', enableAudioOnInteraction);
    };
  }, [currentQuestionIndex, interviewPhase, currentTranscript, visibleQuestions]);

  const testAudioSystem = async () => {
    console.log('🧪 Starting comprehensive audio test...');
    
    // Test 1: Check browser support
    if (!('speechSynthesis' in window)) {
      console.error('❌ Speech synthesis not supported in this browser');
      alert('Speech synthesis is not supported in your browser. Please try a different browser.');
      return false;
    }
    console.log('✅ Speech synthesis is supported');

    // Test 2: Check voices
    const voices = await ensureVoicesLoaded();
    console.log(`✅ Found ${voices.length} voices:`, voices.map(v => v.name));
    
    if (voices.length === 0) {
      console.warn('⚠️ No voices available');
      alert('No speech voices are available. This might be a browser or system issue.');
      return false;
    }

    // Test 3: Try speaking
    try {
      const testPhrase = "Audio test successful. You should hear this message clearly.";
      const utterance = new SpeechSynthesisUtterance(testPhrase);
      
      // Use the best available voice
      const englishVoices = voices.filter(v => v.lang.startsWith('en'));
      if (englishVoices.length > 0) {
        utterance.voice = englishVoices[0];
        console.log('🎤 Using voice:', englishVoices[0].name);
      }
      
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      return new Promise((resolve) => {
        utterance.onstart = () => {
          console.log('🔊 Test audio started');
        };
        
        utterance.onend = () => {
          console.log('✅ Test audio completed successfully');
          resolve(true);
        };
        
        utterance.onerror = (event) => {
          console.error('❌ Test audio failed:', event.error);
          const errorMessage = event.error || 'Unknown audio error';
          alert(`Audio test failed: ${errorMessage}. Please check your system audio settings.`);
          resolve(false);
        };

        // Cancel any ongoing speech and speak the test
        window.speechSynthesis.cancel();
        setTimeout(() => {
          window.speechSynthesis.speak(utterance);
        }, 100);
      });
    } catch (error) {
      console.error('❌ Audio test exception:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Audio test failed with error: ${errorMessage}`);
      return false;
    }
  };

  const ensureVoicesLoaded = (): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve) => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
      } else {
        // Wait for voiceschanged event
        const handleVoicesChanged = () => {
          window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
          resolve(window.speechSynthesis.getVoices());
        };
        window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
        
        // Fallback timeout in case voiceschanged never fires
        setTimeout(() => {
          window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
          resolve(window.speechSynthesis.getVoices());
        }, 1000);
      }
    });
  };

  const speakQuestion = async (questionText: string) => {
    if (!('speechSynthesis' in window)) {
      console.warn('⚠️ Speech synthesis not supported');
      // Fallback if TTS not supported
      setCurrentTranscript(questionText);
      setIsSpeaking(false);
      setInterviewPhase('ready'); // Ready for user to start recording
      return;
    }

    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Wait for voices to be loaded - extra robust for first question
      console.log('🔄 Loading voices...');
      const voices = await ensureVoicesLoaded();
      console.log('Total voices available:', voices.length);
      console.log('All voices:', voices.map(v => `${v.name} (${v.lang})`));
      
      // Extra wait for first question to ensure voices are truly ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const utterance = new SpeechSynthesisUtterance(questionText);
      
      // Find Google UK English Male voice
      const selectedVoice = voices.find(v => 
        v.lang.startsWith('en') && 
        v.name.includes('Google') && 
        v.name.includes('UK') && 
        v.name.includes('Male')
      ) || voices.find(v => 
        v.lang.startsWith('en') && 
        v.name.includes('Google') && 
        v.name.includes('Male')
      ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('✅ Selected voice:', selectedVoice.name, '(', selectedVoice.lang, ')');
      } else {
        console.warn('⚠️ No voice selected - using default');
      }
      
      // Enhanced settings for more natural speech
      utterance.rate = 0.85; // Slightly slower for clarity
      utterance.pitch = 0.95; // Slightly lower pitch for warmth
      utterance.volume = 1.0; // Maximum volume to ensure audibility
      
      // Add natural pauses by preprocessing the text
      const processedText = questionText
        .replace(/\./g, '. ') // Ensure periods have space after
        .replace(/,/g, ', ') // Add slight pause after commas
        .replace(/\?/g, '? ') // Questions get natural inflection
        .replace(/:/g, ': ') // Colons get pause
        .replace(/;/g, '; ') // Semicolons get pause
        .replace(/\s+/g, ' ') // Clean up multiple spaces
        .trim();
      
      utterance.text = processedText;
      
      console.log('🎤 Starting TTS for:', processedText.substring(0, 50) + '...');
      
      // Show transcript as it speaks - but don't start text until audio starts
      setCurrentTranscript('');
      setIsSpeaking(true);
      
      // Start speaking animation
      startSpeakingAnimation();
      
      // Prepare transcript timing but don't start until audio begins
      let currentIndex = 0;
      const words = processedText.split(' ');
      let transcriptTimer: NodeJS.Timeout | null = null;
      
      // Calculate timing based on speech rate and word complexity
      const baseWordDuration = 1000 / (utterance.rate * 2.5); // Base duration per word
      
      const scheduleNextWord = () => {
        if (currentIndex < words.length && isSpeaking) {
          setCurrentTranscript(words.slice(0, currentIndex + 1).join(' '));
          currentIndex++;
          
          // Dynamic timing based on word length and punctuation
          let wordDuration = baseWordDuration;
          const currentWord = words[currentIndex - 1];
          
          if (currentWord) {
            // Longer pause for punctuation
            if (currentWord.includes('.') || currentWord.includes('?') || currentWord.includes('!')) {
              wordDuration *= 2.5; // Longer pause for sentence endings
            } else if (currentWord.includes(',') || currentWord.includes(':') || currentWord.includes(';')) {
              wordDuration *= 1.8; // Medium pause for commas/colons
            } else if (currentWord.length > 6) {
              wordDuration *= 1.3; // Slightly longer for longer words
            }
          }
          
          transcriptTimer = setTimeout(scheduleNextWord, wordDuration);
        }
      };

      utterance.onstart = () => {
        console.log('🔊 TTS started successfully - Audio should be playing now!');
        console.log('📊 TTS Settings - Rate:', utterance.rate, 'Pitch:', utterance.pitch, 'Volume:', utterance.volume);
        
        // Start the word-by-word display ONLY when audio actually starts
        setTimeout(scheduleNextWord, 300); // Small delay to sync with actual audio
      };

      utterance.onend = () => {
        console.log('✅ TTS completed');
        if (transcriptTimer) {
          clearTimeout(transcriptTimer);
        }
        setIsSpeaking(false);
        stopSpeakingAnimation();
        setCurrentTranscript(questionText);
        setInterviewPhase('ready'); // Ready for user to start recording
      };

      utterance.onerror = (event) => {
        console.error('❌ TTS error:', event.error, event);
        console.log('❌ Error on question index:', currentQuestionIndex);
        if (transcriptTimer) {
          clearTimeout(transcriptTimer);
        }
        setIsSpeaking(false);
        stopSpeakingAnimation();
        
        // Special handling for first question - retry once
        if (currentQuestionIndex === 0 && event.error) {
          console.log('🔄 Retrying first question TTS...');
          setTimeout(() => {
            // Try a simple retry for the first question
            const retryUtterance = new SpeechSynthesisUtterance(questionText);
            retryUtterance.rate = 0.85;
            retryUtterance.pitch = 0.95;
            retryUtterance.volume = 1.0;
            
            retryUtterance.onstart = () => {
              console.log('🔊 Retry TTS started for first question');
              setIsSpeaking(true);
              setCurrentTranscript('');
              startSpeakingAnimation();
              setTimeout(() => setCurrentTranscript(questionText), 300);
            };
            
            retryUtterance.onend = () => {
              console.log('✅ Retry TTS completed for first question');
              setIsSpeaking(false);
              stopSpeakingAnimation();
              setCurrentTranscript(questionText);
              setInterviewPhase('ready');
            };
            
            retryUtterance.onerror = () => {
              console.log('❌ Retry failed, falling back to text');
              setCurrentTranscript(questionText);
              setInterviewPhase('ready');
            };
            
            try {
              window.speechSynthesis.speak(retryUtterance);
            } catch (retryError) {
              console.error('❌ Retry attempt failed:', retryError);
              setCurrentTranscript(questionText);
              setInterviewPhase('ready');
            }
          }, 1000);
        } else {
          setCurrentTranscript(questionText);
          setInterviewPhase('ready'); // Ready for user to start recording
        }
      };

      speechSynthRef.current = utterance;
      
      // Add timeout detection for TTS that doesn't start
      let speechTimeout: NodeJS.Timeout | null = null;
      let speechStarted = false;
      
      utterance.onstart = () => {
        console.log('🔊 TTS started successfully - Audio should be playing now!');
        console.log('📊 TTS Settings - Rate:', utterance.rate, 'Pitch:', utterance.pitch, 'Volume:', utterance.volume);
        speechStarted = true;
        if (speechTimeout) {
          clearTimeout(speechTimeout);
          speechTimeout = null;
        }
        
        // Start the word-by-word display ONLY when audio actually starts
        setTimeout(scheduleNextWord, 300); // Small delay to sync with actual audio
      };

      utterance.onend = () => {
        console.log('✅ TTS completed');
        speechStarted = true;
        if (speechTimeout) {
          clearTimeout(speechTimeout);
          speechTimeout = null;
        }
        if (transcriptTimer) {
          clearTimeout(transcriptTimer);
        }
        setIsSpeaking(false);
        stopSpeakingAnimation();
        setCurrentTranscript(questionText);
        setInterviewPhase('ready'); // Ready for user to start recording
      };
      
      // Set a timeout to detect if speech never starts
      speechTimeout = setTimeout(() => {
        if (!speechStarted) {
          console.warn('⚠️ TTS timeout - speech never started, falling back to text display');
          console.log('🔄 Attempting to restart TTS for question:', currentQuestionIndex);
          
          // Cancel the current attempt
          window.speechSynthesis.cancel();
          setIsSpeaking(false);
          stopSpeakingAnimation();
          
          // Show the text immediately as fallback
          setCurrentTranscript(questionText);
          setInterviewPhase('ready');
          
          // For first question, try one more time with user interaction
          if (currentQuestionIndex === 0) {
            console.log('🤚 First question TTS failed, requesting user interaction');
            setCurrentTranscript(questionText + ' (Click anywhere if you don\'t hear audio, then we\'ll continue)');
          }
        }
      }, 3000); // 3 second timeout
      
      // Try to enable audio with user interaction (if needed)
      try {
        // Check if browser requires user interaction
        if (document.visibilityState === 'visible') {
          console.log('🎵 Speaking with voice:', selectedVoice?.name || 'default');
          console.log('🎵 Question index:', currentQuestionIndex, 'Voices loaded:', voicesLoaded);
          
          // For first question, try to ensure user interaction first
          if (currentQuestionIndex === 0) {
            console.log('🤚 First question - ensuring user interaction for audio');
            // Try a silent utterance first to prime the audio system
            const primerUtterance = new SpeechSynthesisUtterance('');
            primerUtterance.volume = 0;
            primerUtterance.onend = () => {
              console.log('🔧 Audio system primed, speaking question');
              window.speechSynthesis.speak(utterance);
            };
            primerUtterance.onerror = () => {
              console.log('🔧 Primer failed, speaking directly');
              window.speechSynthesis.speak(utterance);
            };
            window.speechSynthesis.speak(primerUtterance);
          } else {
            window.speechSynthesis.speak(utterance);
          }
          
          console.log('🎵 Speech synthesis speak() called successfully');
        } else {
          throw new Error('Page not visible - user interaction required');
        }
      } catch (error) {
        console.error('❌ Error calling speak():', error);
        // Try to get user interaction first
        console.log('🤚 Trying to enable audio with user interaction...');
        setCurrentTranscript(questionText + ' (Click anywhere to enable audio)');
        setIsSpeaking(false);
        setInterviewPhase('ready');
      }
    } catch (error) {
      console.error('❌ TTS setup error:', error);
      console.log('❌ Question index when error occurred:', currentQuestionIndex);
      // Fallback to text display
      setCurrentTranscript(questionText);
      setIsSpeaking(false);
      setInterviewPhase('ready');
    }
  };

  // Speaking animation functions
  const startSpeakingAnimation = () => {
    let animationTime = 0;
    const animate = () => {
      animationTime += 0.08;
      // Create more realistic speaking pattern with varied intensity
      const baseWave = Math.sin(animationTime * 2.5) * 0.7;
      const speechPattern = Math.sin(animationTime * 8) * 0.3;
      const microVariation = Math.sin(animationTime * 15) * 0.1;
      
      // Combine waves to create natural speaking rhythm
      const combinedIntensity = baseWave + speechPattern + microVariation;
      
      // Add some randomness to simulate natural speech patterns
      const randomFactor = (Math.random() - 0.5) * 0.2;
      const finalIntensity = Math.abs(combinedIntensity + randomFactor);
      
      // Scale and clamp the intensity
      setSpeakingIntensity(Math.min(1, Math.max(0.1, finalIntensity)));
      
      if (isSpeaking) {
        speakingAnimationRef.current = requestAnimationFrame(animate);
      }
    };
    speakingAnimationRef.current = requestAnimationFrame(animate);
  };

  const stopSpeakingAnimation = () => {
    if (speakingAnimationRef.current) {
      cancelAnimationFrame(speakingAnimationRef.current);
      speakingAnimationRef.current = null;
    }
    setSpeakingIntensity(0);
  };

  const startRecording = async () => {
    // Prevent multiple calls to startRecording
    if (isSettingUpRecording || isRecording || setupSessionRef.current !== null) {
      console.log("Recording already in progress or being set up, skipping startRecording call");
      return;
    }
    
    // Set recording state immediately to prevent button flickering
    setIsRecording(true);
    setInterviewPhase('recording');
    await toggleRecording();
  };

  // Audio visualization functions
  const setupAudioVisualization = (stream: MediaStream) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyserNode = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      
      // Advanced settings optimized for human speech detection
      analyserNode.fftSize = 1024; // Higher resolution for better frequency analysis
      analyserNode.smoothingTimeConstant = 0.2; // Minimal smoothing for faster response
      analyserNode.minDecibels = -100; // Lower threshold for quiet speech
      analyserNode.maxDecibels = -10; // Higher ceiling for dynamic range
      
      // Add a gain node for better control over input sensitivity
      const gainNode = audioCtx.createGain();
      gainNode.gain.value = 2.0; // Boost input signal for better detection
      
      // Create a high-pass filter to reduce low-frequency noise
      const highPassFilter = audioCtx.createBiquadFilter();
      highPassFilter.type = 'highpass';
      highPassFilter.frequency.value = 80; // Cut frequencies below 80Hz
      highPassFilter.Q.value = 0.7;
      
      // Create a low-pass filter to focus on speech frequencies
      const lowPassFilter = audioCtx.createBiquadFilter();
      lowPassFilter.type = 'lowpass';
      lowPassFilter.frequency.value = 8000; // Cut frequencies above 8kHz
      lowPassFilter.Q.value = 0.7;
      
      // Connect the audio pipeline: source -> highpass -> lowpass -> gain -> analyser
      source.connect(highPassFilter);
      highPassFilter.connect(lowPassFilter);
      lowPassFilter.connect(gainNode);
      gainNode.connect(analyserNode);
      
      setAudioContext(audioCtx);
      setAnalyser(analyserNode);
      
      console.log('🎤 Enhanced audio visualization setup with speech-optimized pipeline');
      console.log('📊 Audio settings - FFT:', analyserNode.fftSize, 'Smoothing:', analyserNode.smoothingTimeConstant);
      startAudioVisualization(analyserNode);
    } catch (error) {
      console.error('Error setting up audio visualization:', error);
    }
  };

  const startAudioVisualization = (analyserNode: AnalyserNode) => {
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const frequencyData = new Uint8Array(bufferLength);
    
    // Store previous levels for enhanced smoothing and responsiveness
    let previousLevels = new Array(40).fill(4);
    let peakLevels = new Array(40).fill(4);
    let noiseFloor = 0;
    let noiseCalibrated = false;
    let speechThreshold = 0;
    let adaptiveGain = 1.0;
    let recentSpeechActivity = 0;
    
    // Enhanced noise floor calibration with multiple samples
    const calibrateNoise = () => {
      const samples: Array<{ rms: number; speechFreqEnergy: number }> = [];
      let sampleCount = 0;
      const maxSamples = 10;
      
      const takeSample = () => {
        analyserNode.getByteTimeDomainData(dataArray);
        analyserNode.getByteFrequencyData(frequencyData);
        
        let rms = 0;
        let speechFreqEnergy = 0;
        
        // Calculate RMS of time domain
        for (let i = 0; i < bufferLength; i++) {
          const sample = (dataArray[i] - 128) / 128;
          rms += sample * sample;
        }
        rms = Math.sqrt(rms / bufferLength);
        
        // Calculate speech frequency energy (300-3400 Hz range)
        const speechStart = Math.floor(bufferLength * 0.05); // ~300Hz
        const speechEnd = Math.floor(bufferLength * 0.4);    // ~3400Hz
        for (let i = speechStart; i < speechEnd; i++) {
          speechFreqEnergy += frequencyData[i] / 255;
        }
        speechFreqEnergy /= (speechEnd - speechStart);
        
        samples.push({ rms, speechFreqEnergy });
        sampleCount++;
        
        if (sampleCount < maxSamples) {
          setTimeout(takeSample, 50);
        } else {
          // Calculate robust noise floor from samples
          const rmsValues = samples.map(s => s.rms).sort((a, b) => a - b);
          const speechValues = samples.map(s => s.speechFreqEnergy).sort((a, b) => a - b);
          
          // Use median of lower quartile for robust noise estimation
          const medianIndex = Math.floor(rmsValues.length * 0.25);
          noiseFloor = rmsValues[medianIndex] * 1.5; // 50% buffer
          speechThreshold = speechValues[medianIndex] * 2.0; // Speech threshold
          
          noiseCalibrated = true;
          console.log('🎤 Enhanced noise floor calibrated:', { noiseFloor, speechThreshold });
        }
      };
      
      takeSample();
    };
    
    // Start calibration immediately
    setTimeout(calibrateNoise, 50);
    
    const updateLevels = () => {
      // Get both time domain and frequency domain data
      analyserNode.getByteTimeDomainData(dataArray);
      analyserNode.getByteFrequencyData(frequencyData);
      
      // Calculate enhanced RMS and peak detection
      let rms = 0;
      let peak = 0;
      for (let i = 0; i < bufferLength; i++) {
        const sample = (dataArray[i] - 128) / 128;
        rms += sample * sample;
        peak = Math.max(peak, Math.abs(sample));
      }
      rms = Math.sqrt(rms / bufferLength);
      
      // Advanced speech detection in frequency domain
      const speechStart = Math.floor(bufferLength * 0.05); // ~300Hz
      const speechEnd = Math.floor(bufferLength * 0.4);    // ~3400Hz
      const lowFreqEnd = Math.floor(bufferLength * 0.15);  // ~1000Hz (vowels)
      const midFreqEnd = Math.floor(bufferLength * 0.25);  // ~2000Hz (consonants)
      
      let speechEnergy = 0;
      let vowelEnergy = 0;
      let consonantEnergy = 0;
      
      // Analyze speech frequency ranges
      for (let i = speechStart; i < speechEnd; i++) {
        const freqValue = frequencyData[i] / 255;
        speechEnergy += freqValue;
        
        if (i < lowFreqEnd) {
          vowelEnergy += freqValue * 1.2; // Boost vowel detection
        } else if (i < midFreqEnd) {
          consonantEnergy += freqValue * 1.1; // Boost consonant detection
        }
      }
      
      speechEnergy /= (speechEnd - speechStart);
      vowelEnergy /= (lowFreqEnd - speechStart);
      consonantEnergy /= (midFreqEnd - lowFreqEnd);
      
      // Intelligent noise gating with speech context
      if (noiseCalibrated) {
        if (rms < noiseFloor && speechEnergy < speechThreshold) {
          rms = 0;
          peak = 0;
          speechEnergy = 0;
          vowelEnergy = 0;
          consonantEnergy = 0;
        } else {
          // Subtract noise floor but preserve speech dynamics
          rms = Math.max(0, rms - noiseFloor);
          peak = Math.max(0, peak - noiseFloor);
          
          // Update speech activity tracker
          if (speechEnergy > speechThreshold * 1.5) {
            recentSpeechActivity = Math.min(1.0, recentSpeechActivity + 0.1);
          } else {
            recentSpeechActivity = Math.max(0, recentSpeechActivity - 0.02);
          }
        }
      }
      
      // Adaptive gain based on recent speech activity
      if (recentSpeechActivity > 0.3) {
        adaptiveGain = Math.min(2.0, adaptiveGain + 0.05);
      } else {
        adaptiveGain = Math.max(1.0, adaptiveGain - 0.02);
      }
      
      // Enhanced sensitivity with speech-aware scaling
      const baseMultiplier = 600 * adaptiveGain; // Adaptive base sensitivity
      const peakMultiplier = 250 * adaptiveGain;
      const speechMultiplier = 80 * adaptiveGain;
      
      const overallVolume = (rms * baseMultiplier) + 
                           (peak * peakMultiplier) + 
                           (speechEnergy * speechMultiplier) +
                           (vowelEnergy * 40) + 
                           (consonantEnergy * 30);
      
      // Create enhanced waveform visualization with speech-focused processing
      const newLevels = [];
      const chunks = Math.floor(bufferLength / 40);
      
      for (let i = 0; i < 40; i++) {
        let sum = 0;
        let chunkPeak = 0;
        let chunkFreq = 0;
        let chunkSpeechFreq = 0;
        
        // Analyze each chunk with enhanced speech detection
        for (let j = 0; j < chunks; j++) {
          const index = i * chunks + j;
          if (index < bufferLength) {
            const timeSample = Math.abs((dataArray[index] - 128) / 128);
            const freqSample = frequencyData[index] / 255;
            
            sum += timeSample;
            chunkPeak = Math.max(chunkPeak, timeSample);
            chunkFreq += freqSample;
            
            // Enhanced speech frequency detection for this chunk
            if (index >= speechStart && index < speechEnd) {
              chunkSpeechFreq += freqSample * 1.5; // Boost speech frequencies
            }
          }
        }
        
        const average = sum / chunks;
        const avgFreq = chunkFreq / chunks;
        const avgSpeechFreq = chunkSpeechFreq / chunks;
        
        // Advanced combination of time domain, frequency domain, and speech analysis
        const combinedValue = (average * 0.25) + 
                             (chunkPeak * 0.35) + 
                             (avgFreq * 0.15) + 
                             (avgSpeechFreq * 0.15) + 
                             (speechEnergy * 0.1);
        
        // Dynamic scaling with speech context awareness
        let barHeight = combinedValue * 450 + 
                       overallVolume * 1.5 + 
                       speechEnergy * 70 + 
                       recentSpeechActivity * 30;
        
        // Add intelligent variation for natural speech patterns
        if (overallVolume > 0.001 || speechEnergy > speechThreshold) {
          const speechVariation = (vowelEnergy + consonantEnergy) * 25;
          const adaptiveRandom = (Math.random() - 0.5) * Math.min(20, overallVolume * 25) * adaptiveGain;
          barHeight += speechVariation + adaptiveRandom;
        }
        
        // Enhanced noise gate with context
        if (noiseCalibrated && barHeight < noiseFloor * 120) {
          barHeight = Math.random() * 4 + 3; // Minimal baseline
        }
        
        // Speech-aware smoothing with dynamic response
        const isSpeechActive = speechEnergy > speechThreshold || recentSpeechActivity > 0.2;
        const responseSpeed = isSpeechActive ? 0.25 : 0.65; // Much faster for speech
        const momentum = isSpeechActive ? 0.5 : 0.15; // More momentum for speech
        
        const smoothedHeight = (previousLevels[i] * responseSpeed) + 
                              (barHeight * (1 - responseSpeed)) + 
                              (peakLevels[i] * momentum);
        
        // Dynamic bounds based on speech activity and context
        const minHeight = isSpeechActive ? 6 : 3;
        const maxHeight = isSpeechActive ? 130 : 95;
        const finalHeight = Math.max(minHeight, Math.min(maxHeight, smoothedHeight));
        
        newLevels.push(finalHeight);
        previousLevels[i] = smoothedHeight;
        
        // Enhanced peak tracking with speech-aware decay
        if (finalHeight > peakLevels[i]) {
          peakLevels[i] = finalHeight;
        } else {
          const decayRate = isSpeechActive ? 0.86 : 0.93; // Faster decay during speech
          peakLevels[i] *= decayRate;
        }
      }
      
      setAudioLevels(newLevels);
      
      if (interviewPhase === 'recording') {
        audioVisualizationRef.current = requestAnimationFrame(updateLevels);
      }
    };
    
    audioVisualizationRef.current = requestAnimationFrame(updateLevels);
  };

  const stopAudioVisualization = () => {
    if (audioVisualizationRef.current) {
      cancelAnimationFrame(audioVisualizationRef.current);
      audioVisualizationRef.current = null;
    }
    setAudioLevels(new Array(40).fill(4)); // Enhanced baseline
    
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close().catch(err => console.warn('Error closing audio context:', err));
      setAudioContext(null);
    }
    setAnalyser(null);
  };

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
      // Cleanup all timers and intervals
      if (speakingAnimationRef.current) {
        cancelAnimationFrame(speakingAnimationRef.current);
        speakingAnimationRef.current = null;
      }
      
      if (audioVisualizationRef.current) {
        cancelAnimationFrame(audioVisualizationRef.current);
        audioVisualizationRef.current = null;
      }
      
      // Stop any ongoing speech synthesis
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      
      // Only clear session storage if we're not going to the results page
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

  // Add state to prevent duplicate submissions
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Add state to prevent recording setup race conditions
  const [isSettingUpRecording, setIsSettingUpRecording] = useState(false);

  // Function to complete the interview early
  const completeEarly = async () => {
    if (isSubmitting) return; // Prevent double submissions
    setIsSubmitting(true);
    
    try {
      // Transfer session answers to localStorage for results page
      const sessionAnswers = sessionStorage.getItem('interviewAnswers');
      if (sessionAnswers) {
        localStorage.setItem('interviewAnswers', sessionAnswers);
      }
      
      // Save the questions that were actually seen and answered
      localStorage.setItem('visibleQuestions', JSON.stringify(visibleQuestions));
      
      // Save completed questions count for results page
      localStorage.setItem('completedQuestionsCount', String(completedQuestions.length));
      
      // Track progress in database before going to results
      try {
        const interviewType = localStorage.getItem('interviewType') || 'Behavioral';
        const answersData = sessionAnswers ? JSON.parse(sessionAnswers) : {};
        
        // Prepare questions and answers for API
        const questionsForAPI = visibleQuestions.map(q => ({
          question: q.question,
          answer: answersData[q.id] || ''
        }));
        
        // Call the behavioral interview API to track progress
        await fetch('/api/behavioral-interview', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            questions: questionsForAPI,
            interviewType: interviewType.toLowerCase()
          }),
        });
        
        console.log('✅ Early completion progress tracked successfully');
      } catch (error) {
        console.error('Error tracking early completion progress:', error);
        // Don't block the user from seeing results if tracking fails
      }
      
      // Clear session storage as we're done with this interview
      sessionStorage.removeItem('interviewAnswers');
      
      // Navigate to results page
      router.push('/results');
    } finally {
      setIsSubmitting(false);
    }
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

      // Clean up speech synthesis
      if (speechSynthRef.current) {
        window.speechSynthesis.cancel();
      }

      // Clean up audio visualization
      stopAudioVisualization();
      
      // Clean up speaking animation
      stopSpeakingAnimation();
      
      // Reset setup state
      setIsSettingUpRecording(false);
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
    // Add comprehensive state guards to prevent multiple calls
    if (isTranscribing) {
      console.log("Cannot toggle recording while transcribing");
      return;
    }

    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current) {
        try {
          console.log("Stopping recording...");
          
          // Stop audio visualization first
          stopAudioVisualization();
          
          // Make sure we're stopping the recorder if it's active
          if (mediaRecorderRef.current.state === "recording" || mediaRecorderRef.current.state === "paused") {
            console.log("Stopping active recorder...");
            mediaRecorderRef.current.stop();
          }
          
          // Stop all audio tracks from the stream
          if (mediaRecorderRef.current.stream) {
            console.log("Stopping all audio tracks...");
            mediaRecorderRef.current.stream.getTracks().forEach(track => {
              track.stop();
              console.log("Track stopped:", track.kind, track.readyState);
            });
          }
          
        } catch (stopError) {
          console.error("Error stopping recording:", stopError);
        }
        
        // Clear the recorder reference
        mediaRecorderRef.current = null;
        setMediaRecorder(null);
        
        toast({
          title: "Recording stopped",
          description: "Processing your audio..."
        });
      } else {
        // No active recorder but UI shows recording, fix the state
        setIsRecording(false);
        stopAudioVisualization();
        console.warn("Recording state was active but no recorder found");
      }
    } else {
      // Start recording - add multiple guards
      if (isSettingUpRecording) {
        console.warn("Already setting up recording, ignoring start request");
        return;
      }
      
      if (mediaRecorderRef.current) {
        console.warn("MediaRecorder already exists, cleaning up first");
        // Clean up existing recorder
        try {
          if (mediaRecorderRef.current.state === "recording" || mediaRecorderRef.current.state === "paused") {
            mediaRecorderRef.current.stop();
          }
          if (mediaRecorderRef.current.stream) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
          }
        } catch (error) {
          console.error("Error cleaning up existing recorder:", error);
        }
        mediaRecorderRef.current = null;
        setMediaRecorder(null);
      }
      
      try {
        console.log("Starting recording...");
        
        // Set setup flag to prevent race conditions - CRITICAL: Set this immediately
        setIsSettingUpRecording(true);
        
        // Use a ref to track the current setup session to prevent cancellation
        const setupSessionId = Date.now();
        setupSessionRef.current = setupSessionId;
        
        // Add a small delay to ensure state is set before proceeding
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Check if this setup session is still valid
        if (setupSessionRef.current !== setupSessionId) {
          console.log("Setup session was cancelled (session mismatch)");
          setIsSettingUpRecording(false);
          setIsRecording(false); // Reset recording state if setup was cancelled
          return;
        }
        
        // First check if browser supports getUserMedia
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setIsSettingUpRecording(false);
          setIsRecording(false);
          setupSessionRef.current = null;
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
        
        // Check if this setup session is still valid
        if (setupSessionRef.current !== setupSessionId) {
          console.log("Setup session was cancelled before microphone test");
          setIsSettingUpRecording(false);
          setIsRecording(false);
          return;
        }
        
        // Do a pre-check on microphone accessibility
        console.log("Testing microphone access...");
        const micTest = await testMicrophone();
        
        // Check if this setup session is still valid after async operation
        if (setupSessionRef.current !== setupSessionId) {
          console.log("Setup session was cancelled during microphone test");
          setIsSettingUpRecording(false);
          setIsRecording(false);
          return;
        }
        
        if (!micTest.success) {
          setIsSettingUpRecording(false);
          setIsRecording(false);
          setupSessionRef.current = null;
          toast({
            title: "Microphone Error",
            description: micTest.message || "Could not access your microphone. Please check permissions.",
            variant: "destructive"
          });
          
          if (micTest.message?.includes("denied") || micTest.message?.includes("settings")) {
            setShowPermissionGuide(true);
          }
          return;
        }
        
        // Simple audio constraints
        const audioConstraints = { 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          } 
        };
        
        console.log("Getting user media...");
        const stream = await navigator.mediaDevices.getUserMedia(audioConstraints);
        
        // Final check - make sure this setup session is still valid
        if (setupSessionRef.current !== setupSessionId) {
          console.log("Setup session was cancelled during getUserMedia, stopping stream");
          stream.getTracks().forEach(track => track.stop());
          setIsSettingUpRecording(false);
          setIsRecording(false);
          return;
        }
        
        // Now it's safe to finalize recording state
        console.log("Setup successful, finalizing recording state...");
        setIsSettingUpRecording(false);
        setupSessionRef.current = null;
        
        // Set up audio visualization
        setupAudioVisualization(stream);
        
        // Create MediaRecorder
        let recorder: MediaRecorder;
        let blobType = 'audio/webm';
        
        if (browserInfo.isSafari) {
          console.log("Safari detected, using basic configuration");
          blobType = 'audio/mp4';
          recorder = new MediaRecorder(stream);
        } else {
          try {
            recorder = new MediaRecorder(stream, {
              mimeType: 'audio/webm;codecs=opus',
              audioBitsPerSecond: 128000
            });
          } catch (error: any) {
            console.error("MediaRecorder error:", error);
            recorder = new MediaRecorder(stream);
          }
        }
        
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];
        
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
            console.log("Audio data chunk received:", e.data.size);
          }
        };
        
        recorder.onstop = async () => {
          console.log("Recorder stopped, processing audio...");
          
          // Update state to reflect that recording has stopped
          setIsRecording(false);
          
          // Clear the recorder reference immediately to prevent reuse
          mediaRecorderRef.current = null;
          setMediaRecorder(null);
          
          // Create a blob from audio chunks
          const audioBlob = new Blob(audioChunksRef.current, { type: blobType });
          console.log("Audio blob created:", audioBlob.size, "bytes");
          
          if (audioBlob.size > 0) {
            setAudioChunks(audioChunksRef.current);
            
            // Create a URL for the audio blob
            const audioUrl = URL.createObjectURL(audioBlob);
            setAudioUrl(audioUrl);
            
            // Start transcription
            await transcribeAudio(audioBlob);
          } else {
            console.error("Audio blob is empty");
            
            setInterviewPhase('feedback');
            toast({
              title: "Recording Error",
              description: "No audio was recorded. Please try again.",
              variant: "destructive"
            });
          }
        };
        
        recorder.onerror = (event) => {
          console.error("MediaRecorder error:", event);
          setIsRecording(false);
          setIsSettingUpRecording(false);
          
          stopAudioVisualization();
          setMediaRecorder(null);
          mediaRecorderRef.current = null;
        };
        
        // Start recording
        try {
          if (browserInfo.isSafari) {
            recorder.start(1000); // 1 second chunks for Safari
          } else {
            recorder.start();
          }
          
          setMediaRecorder(recorder);
          
          console.log("Recording started successfully");
          
          toast({
            title: "Recording started",
            description: "Speak clearly into your microphone",
          });
          
        } catch (startError: any) {
          console.error("Error starting recorder:", startError);
          setIsRecording(false);
          setIsSettingUpRecording(false);
          
          stopAudioVisualization();
          setMediaRecorder(null);
          
          // Stop the stream if recording failed to start
          stream.getTracks().forEach(track => track.stop());
          
          toast({
            title: "Recording Error", 
            description: "Could not start recording: " + (startError?.message || "Unknown error"),
            variant: "destructive"
          });
        }
        
      } catch (error) {
        console.error('Error accessing microphone:', error);
        setIsRecording(false);
        setIsSettingUpRecording(false);
        
        stopAudioVisualization();
        setMediaRecorder(null);
        setupSessionRef.current = null;
        
        let errorMessage = "Could not access your microphone.";
        
        if (error instanceof DOMException) {
          switch (error.name) {
            case 'NotAllowedError':
            case 'PermissionDeniedError':
              errorMessage = "Microphone access was denied. Please allow microphone access in your browser settings and try again.";
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
            default:
              errorMessage = `Microphone error: ${error.message || 'Unknown error'}`;
          }
        }
        
        toast({
          title: "Microphone Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
    }
  };
  
  // Transcribe audio using Gemini AI
  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      setInterviewPhase('processing');
      setIsTranscribing(true);
      toast({
        title: "Processing your answer",
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
        setInterviewPhase('feedback');
        return;
      }
      
      // Use our new Gemini function to transcribe and analyze the audio
      const transcriptResult = await transcribeAndAnalyzeAudio(audioBlob);
      
      console.log("Transcription response from Gemini:", transcriptResult);
      
      if (transcriptResult && transcriptResult.transcription) {
        // Set the transcribed text as the answer
        setAnswer(transcriptResult.transcription);
        setInterviewPhase('feedback');
        
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
          title: "Answer processed",
          description: sentimentMessage + fillerWordsMessage || "Your answer has been transcribed.",
        });
      } else {
        console.error("Transcription failed: Empty or invalid response", transcriptResult);
        
        setInterviewPhase('feedback');
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
      
      setInterviewPhase('feedback');
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
        // Reset to speaking phase to trigger TTS for next question
        setInterviewPhase('speaking');
        // Note: answer will be restored by the useEffect that watches currentQuestionIndex
      }
    }
  };

  const handleComplete = async () => {
    if (isSubmitting) return; // Prevent double submissions
    setIsSubmitting(true);
    
    try {
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
        
        // Track progress in database before going to results
        try {
          const interviewType = localStorage.getItem('interviewType') || 'Behavioral';
          
          // Prepare questions and answers for API
          const questionsForAPI = visibleQuestions.map(q => ({
            question: q.question,
            answer: updatedAnswers[q.id] || ''
          }));
          
          // Call the behavioral interview API to track progress
          await fetch('/api/behavioral-interview', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              questions: questionsForAPI,
              interviewType: interviewType.toLowerCase()
            }),
          });
          
          console.log('✅ Interview progress tracked successfully');
        } catch (error) {
          console.error('Error tracking interview progress:', error);
          // Don't block the user from seeing results if tracking fails
        }
        
        // Clear session storage as we're done with this interview
        sessionStorage.removeItem('interviewAnswers');
        
        router.push('/results');
      }
    } finally {
      setIsSubmitting(false);
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
      // Reset to speaking phase to trigger TTS for previous question
      setInterviewPhase('speaking');
      // Note: answer will be restored by the useEffect that watches currentQuestionIndex
    }
  };

  const showFeedback = async () => {
    setIsAnalyzingFeedback(true);
    
    // Add a small delay to show the analyzing state
    setTimeout(() => {
      setFeedbackVisible(true);
      setIsAnalyzingFeedback(false);
    }, 1500); // 1.5 second delay to simulate analysis
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 flex flex-col">
        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Image src="https://i.ibb.co/hNsCy7F/logo.webp" alt="InterviewSense" width={32} height={32} className="object-contain" />
              <span className="font-bold text-xl text-white">InterviewSense</span>
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

        {/* Main Interview Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-4xl">
            {/* Speaking Circle - Centered at Top */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  {/* Breathing Dotted Circle Pattern with Enhanced TTS Animation */}
                  <div className={`w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 rounded-full relative ${isSpeaking ? 'animate-talking' : 'animate-breathing'}`} 
                       style={isSpeaking ? {
                         transform: `scale(${1 + speakingIntensity * 0.2}) rotate(${speakingIntensity * 3}deg)`,
                         transition: 'transform 0.08s ease-out'
                       } : {}}>
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      {/* Main dotted circle with enhanced talking animation and growing dots */}
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="rgb(59 130 246)"
                        strokeWidth={isSpeaking ? `${0.8 + speakingIntensity * 1.2}` : "0.8"}
                        strokeLinecap="round"
                        strokeDasharray={isSpeaking ? 
                          `${0.5 + speakingIntensity * 0.8} ${1.5 + speakingIntensity * 0.5} ${1 + speakingIntensity * 0.7} ${2 + speakingIntensity * 1} ${0.3 + speakingIntensity * 0.6} ${1.8 + speakingIntensity * 0.4} ${1.2 + speakingIntensity * 0.8} ${1.2 + speakingIntensity * 0.6} ${0.7 + speakingIntensity * 0.5} ${2.5 + speakingIntensity * 1.2} ${0.4 + speakingIntensity * 0.7} ${1.6 + speakingIntensity * 0.8} ${1.5 + speakingIntensity * 0.9} ${1 + speakingIntensity * 0.5} ${0.6 + speakingIntensity * 0.6} ${2.2 + speakingIntensity * 1.1} ${0.8 + speakingIntensity * 0.7} ${1.4 + speakingIntensity * 0.6} ${1.1 + speakingIntensity * 0.8} ${1.8 + speakingIntensity * 0.9} ${0.5 + speakingIntensity * 0.5} ${2 + speakingIntensity * 1} ${0.9 + speakingIntensity * 0.7} ${1.3 + speakingIntensity * 0.6}` :
                          "0.5 1.5 1 2 0.3 1.8 1.2 1.2 0.7 2.5 0.4 1.6 1.5 1 0.6 2.2 0.8 1.4 1.1 1.8 0.5 2 0.9 1.3 0.7 1.9 1.3 1.1 0.4 2.3 0.6 1.7 1.2 1.4 0.8 2.1 0.5 1.5 1 1.6 0.9 1.2 1.4 1.8 0.7 2.4 0.3 1.9"
                        }
                        className={`${isSpeaking ? 'animate-talking-flow' : 'animate-dot-flow'}`}
                        style={isSpeaking ? {
                          opacity: 0.8 + speakingIntensity * 0.2,
                          strokeDashoffset: speakingIntensity * -15,
                          transition: 'opacity 0.05s ease-out, stroke-dashoffset 0.05s ease-out, stroke-dasharray 0.1s ease-out'
                        } : { opacity: 0.9 }}
                      />
                      {/* Second layer with talking rhythm and growing dots */}
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="rgb(59 130 246)"
                        strokeWidth={isSpeaking ? `${0.6 + speakingIntensity * 0.8}` : "0.6"}
                        strokeLinecap="round"
                        strokeDasharray={isSpeaking ? 
                          `${0.3 + speakingIntensity * 0.5} ${2 + speakingIntensity * 0.8} ${1.5 + speakingIntensity * 0.7} ${1 + speakingIntensity * 0.6} ${0.7 + speakingIntensity * 0.4} ${1.8 + speakingIntensity * 0.9} ${0.4 + speakingIntensity * 0.5} ${2.2 + speakingIntensity * 1} ${1.2 + speakingIntensity * 0.6} ${1.3 + speakingIntensity * 0.7} ${0.6 + speakingIntensity * 0.4} ${1.9 + speakingIntensity * 0.8} ${0.8 + speakingIntensity * 0.5} ${1.6 + speakingIntensity * 0.7} ${1.1 + speakingIntensity * 0.6} ${1.4 + speakingIntensity * 0.8} ${0.5 + speakingIntensity * 0.4} ${2.1 + speakingIntensity * 1} ${0.9 + speakingIntensity * 0.5} ${1.7 + speakingIntensity * 0.7}` :
                          "0.3 2 1.5 1 0.7 1.8 0.4 2.2 1.2 1.3 0.6 1.9 0.8 1.6 1.1 1.4 0.5 2.1 0.9 1.7"
                        }
                        className={`${isSpeaking ? 'animate-talking-flow-reverse' : 'animate-dot-flow-reverse'}`}
                        style={isSpeaking ? {
                          opacity: 0.5 + speakingIntensity * 0.3,
                          strokeDashoffset: speakingIntensity * 12,
                          transition: 'opacity 0.05s ease-out, stroke-dashoffset 0.05s ease-out, stroke-dasharray 0.1s ease-out'
                        } : { opacity: 0.6 }}
                      />
                      {/* Dynamic inner glow for speech - enhanced */}
                      {isSpeaking && (
                        <circle
                          cx="50"
                          cy="50"
                          r={35 + speakingIntensity * 8}
                          fill="none"
                          stroke="rgb(59 130 246)"
                          strokeWidth={speakingIntensity * 3}
                          opacity={speakingIntensity * 0.4}
                          className="animate-talking-glow"
                        />
                      )}
                      {/* Subtle background circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="48"
                        fill="none"
                        stroke="rgb(51 65 85 / 0.2)"
                        strokeWidth="0.5"
                        strokeDasharray="0.2 3 0.8 2.5 0.4 3.2 1.1 2.8 0.6 3.5 0.3 2.9 0.9 3.1 0.5 2.7"
                        className={isSpeaking ? "animate-talking-pulse" : "animate-pulse-slow"}
                      />
                    </svg>
                  </div>
                </div>

                {/* Phase Status */}
                <div className="text-slate-400 text-lg text-center">
                  {interviewPhase === 'speaking' && "Speaking Question"}
                  {interviewPhase === 'ready' && "Ready to Record"}
                  {interviewPhase === 'recording' && "Recording Your Answer"}
                  {interviewPhase === 'processing' && "Processing Response"}
                  {interviewPhase === 'feedback' && "Ready for Feedback"}
                </div>
              </div>
            </div>

            {/* Question Content - Below Speaking Circle */}
            <div className="max-w-2xl mx-auto">
              {/* Question Counter */}
              <div className="text-sm text-slate-500 mb-4 text-center">
                Question {currentQuestionIndex + 1} of {visibleQuestions.length}
              </div>

              {/* Question Display */}
              <div className="bg-slate-900/50 border border-slate-700 backdrop-blur-sm rounded-2xl p-6 sm:p-8 mb-6">
                <p className="text-white text-base sm:text-lg leading-relaxed text-center">
                  {currentTranscript || (currentQuestion ? currentQuestion.question : '')}
                </p>
                
                {/* Replay Question Button */}
                {interviewPhase === 'ready' && currentQuestion && (
                  <div className="mt-4 flex justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setInterviewPhase('speaking');
                        speakQuestion(currentQuestion.question);
                      }}
                      className="text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Replay Question
                    </Button>
                  </div>
                )}
              </div>

              {/* Enhanced waveform visualization when recording */}
              {interviewPhase === 'recording' && (
                <div className="mb-6">
                  <div className="bg-slate-900/40 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-6">
                    <div className="flex items-end justify-center space-x-1 h-24 bg-gradient-to-b from-slate-950/30 to-slate-950/70 rounded-xl p-4 relative overflow-hidden">
                      {/* Background grid effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent"></div>
                      
                      {/* Waveform bars */}
                      {audioLevels.map((level, i) => (
                        <div
                          key={i}
                          className="relative transition-all duration-100 ease-out rounded-sm"
                          style={{
                            width: '3px',
                            height: `${Math.max(3, level * 0.9)}px`,
                            background: level > 25 
                              ? `linear-gradient(to top, rgb(59 130 246), rgb(147 197 253), rgb(191 219 254))`
                              : `linear-gradient(to top, rgb(59 130 246 / 0.6), rgb(147 197 253 / 0.4))`,
                            boxShadow: level > 30 
                              ? `0 0 8px rgba(59, 130, 246, ${Math.min(0.8, level / 100)}), 0 0 16px rgba(59, 130, 246, ${Math.min(0.4, level / 150)})` 
                              : level > 15 
                                ? `0 0 4px rgba(59, 130, 246, ${Math.min(0.6, level / 120)})` 
                                : 'none',
                            transform: level > 40 ? `scaleY(${1 + (level - 40) / 200})` : 'scaleY(1)',
                            opacity: Math.max(0.4, Math.min(1, level / 60))
                          }}
                        >
                          {/* Peak indicator */}
                          {level > 50 && (
                            <div 
                              className="absolute top-0 left-0 w-full h-1 bg-blue-300 rounded-full animate-pulse"
                              style={{
                                boxShadow: '0 0 6px rgba(147, 197, 253, 0.8)'
                              }}
                            ></div>
                          )}
                        </div>
                      ))}
                      
                      {/* Center line indicator */}
                      <div className="absolute inset-x-0 bottom-4 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent opacity-30"></div>
                    </div>
                    
                    <div className="flex items-center justify-center mt-4 space-x-3">
                      <div className="relative">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <div className="absolute top-0 left-0 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
                      </div>
                      <p className="text-slate-300 text-sm font-medium">Recording your response...</p>
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0ms'}}></div>
                        <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '200ms'}}></div>
                        <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '400ms'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Answer Display (when available) */}
              {answer && interviewPhase === 'feedback' && (
                <div className="mb-6">
                  <div className="bg-slate-900/50 border border-slate-700 backdrop-blur-sm rounded-2xl p-6">
                    <div className="text-sm text-slate-400 mb-3">Your Response:</div>
                    <p className="text-slate-300 text-sm leading-relaxed">{answer}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4">
                {interviewPhase === 'feedback' && answer.trim() !== '' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={showFeedback}
                      disabled={isAnalyzingFeedback}
                      className="w-full border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white rounded-2xl py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAnalyzingFeedback ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <BarChart className="h-4 w-4 mr-2" /> Get Feedback
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={currentQuestionIndex < visibleQuestions.length - 1 ? handleNextQuestion : handleComplete}
                      disabled={isSubmitting}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-2xl py-3"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Saving...
                        </>
                      ) : currentQuestionIndex < visibleQuestions.length - 1 ? (
                        <>Next Question <ChevronRight className="h-4 w-4 ml-2" /></>
                      ) : (
                        <>Complete Interview <Save className="h-4 w-4 ml-2" /></>
                      )}
                    </Button>
                  </>
                )}

                {interviewPhase === 'ready' && (
                  <Button
                    onClick={startRecording}
                    disabled={isSettingUpRecording}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-3"
                  >
                    {isSettingUpRecording ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Setting up...
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4 mr-2" />
                        Start Recording
                      </>
                    )}
                  </Button>
                )}

                {interviewPhase === 'recording' && (
                  <Button
                    variant="destructive"
                    onClick={toggleRecording}
                    className="w-full bg-red-600 hover:bg-red-700 text-white rounded-2xl py-3"
                  >
                    <MicOff className="h-4 w-4 animate-pulse mr-2" /> Stop Recording
                  </Button>
                )}

                {/* Emergency/Fallback buttons - show if TTS is stuck or failed */}
                {(interviewPhase === 'speaking' || interviewPhase === 'loading') && (
                  <Button
                    onClick={() => {
                      console.log('🚨 Emergency override: Skipping to ready state');
                      window.speechSynthesis.cancel();
                      setIsSpeaking(false);
                      stopSpeakingAnimation();
                      setCurrentTranscript(visibleQuestions[currentQuestionIndex]?.question || '');
                      setInterviewPhase('ready');
                    }}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white rounded-2xl py-3"
                  >
                    <Mic className="h-4 w-4 mr-2" />
                    Skip to Recording
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Panel - Full Width */}
        {feedbackVisible && answer.trim() !== '' && (
          <div className="border-t border-slate-800 p-8">
            <div className="max-w-4xl mx-auto">
              <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm text-white rounded-2xl">
                <CardContent className="p-8">
                  <InterviewFeedback 
                    answer={answer} 
                    question={currentQuestion?.question || ''} 
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Permission guide dialog */}
        <MicrophonePermissionGuide 
          isOpen={showPermissionGuide}
          onClose={() => setShowPermissionGuide(false)}
        />

        {/* Animation Styles - Exact copy from start page */}
        <style jsx>{`
          @keyframes breathing {
            0%, 100% {
              transform: translateY(0px) scale(1);
            }
            50% {
              transform: translateY(-8px) scale(1.02);
            }
          }
          @keyframes dot-flow {
            0% {
              stroke-dashoffset: 0;
              opacity: 0.9;
            }
            50% {
              opacity: 0.6;
            }
            100% {
              stroke-dashoffset: 20;
              opacity: 0.9;
            }
          }
          @keyframes dot-flow-reverse {
            0% {
              stroke-dashoffset: 20;
              opacity: 0.6;
            }
            50% {
              opacity: 0.3;
            }
            100% {
              stroke-dashoffset: 0;
              opacity: 0.6;
            }
          }
          @keyframes pulse-slow {
            0%, 100% {
              opacity: 0.2;
              stroke-width: 0.5;
            }
            50% {
              opacity: 0.4;
              stroke-width: 0.7;
            }
          }
          .animate-breathing {
            animation: breathing 4s ease-in-out infinite;
          }
          .animate-dot-flow {
            animation: dot-flow 6s linear infinite;
          }
          .animate-dot-flow-reverse {
            animation: dot-flow-reverse 8s linear infinite;
          }
          .animate-pulse-slow {
            animation: pulse-slow 3s ease-in-out infinite;
          }
        `}</style>
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
