"use client"

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Clock,
  Target,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Code2,
  Database,
  Network,
  Zap,
  TrendingUp,
  LogOut,
  User,
  Timer,
  PenTool,
  MessageCircle,
  BarChart3,
  Play,
  Pause,
  RotateCcw,
  Save,
  Eye,
  EyeOff,
  ArrowRight,
  CheckSquare,
  Square,
  Mic,
  MicOff
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { toast } from "@/components/ui/use-toast";
import { testMicrophone } from '@/lib/microphone';
import { transcribeAndAnalyzeAudio } from '@/lib/gemini';

interface SystemDesignTest {
  problem: {
    title: string;
    description: string;
    requirements: string[];
    constraints: string[];
    estimatedTime: string;
  };
  guidance: {
    approach: string[];
    keyComponents: string[];
    scaleConsiderations: string[];
    commonPitfalls: string[];
  };
  evaluation: {
    criteria: Array<{
      category: string;
      description: string;
      weight: number;
    }>;
    sampleSolution: {
      overview: string;
      architecture: string[];
      technologies: string[];
      tradeoffs: string[];
    };
  };
  tips: {
    timeManagement: string[];
    communicationTips: string[];
    drawingTips: string[];
  };
}

const STEPS = [
  { id: 'requirements', title: 'Clarify Requirements', duration: 5 },
  { id: 'estimation', title: 'Estimate Scale', duration: 5 },
  { id: 'highlevel', title: 'High-Level Design', duration: 15 },
  { id: 'detailed', title: 'Detailed Design', duration: 15 },
  { id: 'scale', title: 'Scale & Performance', duration: 5 }
];

export default function SystemDesignTestPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [testData, setTestData] = useState<SystemDesignTest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Test state
  const [currentStep, setCurrentStep] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(45 * 60); // 45 minutes in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showGuidance, setShowGuidance] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  // Drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingTool, setDrawingTool] = useState<'pen' | 'eraser'>('pen');
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [stepExplanations, setStepExplanations] = useState<Record<string, string>>({
    requirements: '',
    estimation: '',
    highlevel: '',
    detailed: '',
    scale: ''
  });
  
  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const data = sessionStorage.getItem('systemDesignTest');
    if (data) {
      setTestData(JSON.parse(data));
    } else {
      router.push('/system-design');
    }
    setIsLoading(false);
  }, [router]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeRemaining]);

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineWidth = drawingTool === 'pen' ? 2 : 20;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = drawingTool === 'pen' ? '#ffffff' : '#1a1a1a';
      ctx.globalCompositeOperation = drawingTool === 'pen' ? 'source-over' : 'destination-out';
      
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Set canvas background to dark
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Initialize canvas background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [testData]);

  // Recording functions
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          title: "Browser Compatibility Error",
          description: "Your browser doesn't support microphone access. Please try using Chrome, Firefox, or Safari.",
          variant: "destructive"
        });
        return;
      }
      
      const micTest = await testMicrophone();
      if (!micTest.success) {
        toast({
          title: "Microphone Error",
          description: micTest.message || "Could not access your microphone. Please check permissions.",
          variant: "destructive"
        });
        return;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
        } 
      });
      
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      });
      
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        await transcribeAudio(audioBlob);
      };
      
      recorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Explain your approach for this step clearly into your microphone",
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone Error",
        description: "Could not access your microphone. Please check your browser settings.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      setIsTranscribing(true);
      toast({
        title: "Transcribing audio",
        description: "This may take a few moments...",
      });
      
      const transcriptResult = await transcribeAndAnalyzeAudio(audioBlob);
      
      if (transcriptResult && transcriptResult.transcription) {
        setStepExplanations(prev => ({
          ...prev,
          [currentStepData.id]: transcriptResult.transcription
        }));
        
        toast({
          title: "Transcription complete",
          description: "Your explanation has been recorded and transcribed.",
        });
      } else {
        toast({
          title: "Transcription issue",
          description: "Could not transcribe audio clearly. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: "Transcription Error",
        description: "There was an error transcribing your audio. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStepComplete = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleFinishTest = () => {
    // Save explanations and navigate to results
    sessionStorage.setItem('systemDesignResponses', JSON.stringify(stepExplanations));
    router.push('/system-design/final-results');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
        <div className="text-white">Loading test...</div>
      </div>
    );
  }

  if (!testData) {
    return null;
  }

  const currentStepData = STEPS[currentStep];

  return (
    <ProtectedRoute>
      <DashboardLayout>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white">
        {/* Timer and Controls */}
        <div className="border-b border-zinc-800/50 px-4 py-2 flex items-center justify-between bg-zinc-900/80">
          <div className="flex items-center gap-2 bg-zinc-800/50 px-3 py-1 rounded-lg">
            <Clock className="h-4 w-4 text-red-400" />
            <span className={`font-mono ${timeRemaining < 300 ? 'text-red-400' : 'text-white'}`}>
              {formatTime(timeRemaining)}
            </span>
            <Button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              {isTimerRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </Button>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Left Sidebar - Problem & Guidance */}
          <div className="w-80 border-r border-zinc-800 bg-zinc-900/50 p-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Problem Overview */}
              <Card className="bg-zinc-800/50 border-red-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-red-300 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    {testData.problem.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {testData.problem.description}
                  </p>
                  
                  <div>
                    <h4 className="text-xs font-medium text-green-300 mb-1">Requirements:</h4>
                    <ul className="space-y-1">
                      {testData.problem.requirements.map((req, index) => (
                        <li key={index} className="text-xs text-zinc-400 flex items-start gap-1">
                          <span className="w-1 h-1 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-medium text-orange-300 mb-1">Constraints:</h4>
                    <ul className="space-y-1">
                      {testData.problem.constraints.map((constraint, index) => (
                        <li key={index} className="text-xs text-zinc-400 flex items-start gap-1">
                          <span className="w-1 h-1 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></span>
                          {constraint}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Step Progress */}
              <Card className="bg-zinc-800/50 border-zinc-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-blue-300 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Progress ({currentStep + 1}/{STEPS.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {STEPS.map((step, index) => (
                      <div 
                        key={step.id}
                        className={`flex items-center gap-2 p-2 rounded text-xs cursor-pointer transition-colors ${
                          index === currentStep 
                            ? 'bg-red-600/20 border border-red-500/30' 
                            : completedSteps.includes(index)
                            ? 'bg-green-600/20 border border-green-500/30'
                            : 'bg-zinc-700/30'
                        }`}
                        onClick={() => setCurrentStep(index)}
                      >
                        {completedSteps.includes(index) ? (
                          <CheckSquare className="h-3 w-3 text-green-400" />
                        ) : (
                          <Square className="h-3 w-3 text-zinc-400" />
                        )}
                        <span className="flex-1">{step.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {step.duration}m
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Current Step Guidance */}
              {showGuidance && (
                <Card className="bg-zinc-800/50 border-blue-500/20">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm text-blue-300 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Step Guidance
                      </CardTitle>
                      <Button
                        onClick={() => setShowGuidance(false)}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                      >
                        <EyeOff className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {testData.guidance.approach.slice(currentStep, currentStep + 1).map((step, index) => (
                        <p key={index} className="text-xs text-zinc-300 leading-relaxed">
                          {step}
                        </p>
                      ))}
                      
                      {currentStep === 2 && ( // High-level design
                        <div className="mt-3">
                          <h5 className="text-xs font-medium text-purple-300 mb-1">Key Components:</h5>
                          <ul className="space-y-1">
                            {testData.guidance.keyComponents.map((component, index) => (
                              <li key={index} className="text-xs text-zinc-400">• {component}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {currentStep === 4 && ( // Scale considerations
                        <div className="mt-3">
                          <h5 className="text-xs font-medium text-cyan-300 mb-1">Scale Considerations:</h5>
                          <ul className="space-y-1">
                            {testData.guidance.scaleConsiderations.map((consideration, index) => (
                              <li key={index} className="text-xs text-zinc-400">• {consideration}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {!showGuidance && (
                <Button
                  onClick={() => setShowGuidance(true)}
                  variant="outline"
                  size="sm"
                  className="w-full border-blue-500/50 text-blue-300 hover:bg-blue-900/20"
                >
                  <Eye className="mr-2 h-3 w-3" />
                  Show Guidance
                </Button>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Current Step Header */}
            <div className="border-b border-zinc-800 bg-zinc-900/30 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Step {currentStep + 1}: {currentStepData.title}
                  </h2>
                  <p className="text-sm text-zinc-400">
                    Recommended time: {currentStepData.duration} minutes
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {currentStep < STEPS.length - 1 ? (
                    <Button
                      onClick={handleStepComplete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Complete Step
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleFinishTest}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Finish Test
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Work Area */}
            <div className="flex-1 flex">
              {/* Drawing Canvas */}
              <div className="flex-1 bg-zinc-800/20 p-4">
                <div className="h-full bg-zinc-900/50 rounded-lg border border-zinc-700/50 relative overflow-hidden">
                  {/* Canvas Toolbar */}
                  <div className="absolute top-2 left-2 z-10 flex items-center gap-2 bg-zinc-800/80 backdrop-blur-sm rounded-lg p-2">
                    <Button
                      onClick={() => setDrawingTool('pen')}
                      variant={drawingTool === 'pen' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <PenTool className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => setDrawingTool('eraser')}
                      variant={drawingTool === 'eraser' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-zinc-600"></div>
                    <Button
                      onClick={clearCanvas}
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-red-400 hover:text-red-300"
                    >
                      Clear
                    </Button>
                  </div>

                  {/* Canvas */}
                  <canvas
                    ref={canvasRef}
                    width={1200}
                    height={800}
                    className="w-full h-full cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      startDrawing(e);
                    }}
                    onTouchMove={(e) => {
                      e.preventDefault();
                      draw(e);
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      stopDrawing();
                    }}
                    style={{ touchAction: 'none' }}
                  />
                </div>
              </div>

              {/* Recording Area */}
              <div className="w-80 border-l border-zinc-800 bg-zinc-900/30 p-4">
                <div className="h-full flex flex-col">
                  <h3 className="text-sm font-medium text-white mb-3">
                    {currentStepData.title} Explanation
                  </h3>
                  
                  {/* Recording Controls */}
                  <div className="mb-4">
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={isTranscribing}
                      className={`w-full ${
                        isRecording 
                          ? 'bg-red-600 hover:bg-red-700' 
                          : 'bg-red-600/20 border border-red-500/50 text-red-300 hover:bg-red-600/30'
                      }`}
                      variant={isRecording ? 'default' : 'outline'}
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="mr-2 h-4 w-4" />
                          <span className="hidden sm:inline">Stop Recording</span>
                          <span className="sm:hidden">Stop</span>
                        </>
                      ) : (
                        <>
                          <Mic className="mr-2 h-4 w-4" />
                          <span className="hidden sm:inline">Record Explanation</span>
                          <span className="sm:hidden">Record</span>
                        </>
                      )}
                    </Button>
                    
                    {isTranscribing && (
                      <div className="mt-2 text-center">
                        <div className="text-xs text-zinc-400">
                          <span className="hidden sm:inline">Transcribing your explanation...</span>
                          <span className="sm:hidden">Transcribing...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Transcribed Content */}
                  <div className="flex-1 overflow-hidden">
                    {stepExplanations[currentStepData.id] ? (
                      <div className="bg-zinc-800/50 rounded-lg p-3 h-full overflow-y-auto">
                        <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                          {stepExplanations[currentStepData.id]}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-zinc-800/30 rounded-lg p-3 h-full flex items-center justify-center">
                        <p className="text-xs text-zinc-500 text-center">
                          Click record to explain your approach for this step
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-zinc-700/50">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>
                        {stepExplanations[currentStepData.id] ? 'Recorded' : 'No recording'}
                      </span>
                      <Mic className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 