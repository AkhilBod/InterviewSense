'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Brain, 
  Target, 
  Sparkles, 
  TrendingUp, 
  Shield, 
  Check, 
  X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';

interface AnalysisStep {
  id: number;
  icon: typeof FileText;
  title: string;
  description: string;
  duration: number; // milliseconds
  color: string; // tailwind color class
  tip: string; // helpful information for users
}

interface ResumeAnalysisLoadingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const analysisSteps: AnalysisStep[] = [
  {
    id: 1,
    icon: FileText,
    title: "Processing Your Resume",
    description: "Reading and extracting content from resume file",
    duration: 3000,
    color: "blue",
    tip: "Our AI has been trained on thousands of successful resumes from top companies to understand what makes them effective."
  },
  {
    id: 2,
    icon: Brain,
    title: "Analyzing Content Quality",
    description: "Evaluating experience, skills, and achievements",
    duration: 4000,
    color: "purple",
    tip: "We're checking for quantifiable achievements and impact statements that make your experience stand out to recruiters."
  },
  {
    id: 3,
    icon: Target,
    title: "Role-Specific Assessment",
    description: "Comparing qualifications against industry standards",
    duration: 3500,
    color: "indigo",
    tip: "Your resume is being matched against what hiring managers specifically look for in your target role."
  },
  {
    id: 4,
    icon: Sparkles,
    title: "Identifying Improvements",
    description: "Finding specific words and phrases to enhance",
    duration: 4500,
    color: "violet",
    tip: "We're identifying opportunities to make your achievements more compelling and impactful to employers."
  },
  {
    id: 5,
    icon: TrendingUp,
    title: "Generating Scores",
    description: "Calculating impact, style, and skills ratings",
    duration: 2500,
    color: "cyan",
    tip: "Your scores are calculated based on standards from top companies like Google, Apple, and Microsoft."
  },
  {
    id: 6,
    icon: Shield,
    title: "ATS Optimization Check",
    description: "Ensuring resume passes applicant tracking systems",
    duration: 2500,
    color: "emerald",
    tip: "We're optimizing your resume to get past automated screening systems and reach human recruiters."
  }
];

export function ResumeAnalysisLoadingModal({ isOpen, onClose }: ResumeAnalysisLoadingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentStepRef = useRef(0);

  // Calculate total duration for overall progress
  const totalDuration = analysisSteps.reduce((sum, step) => sum + step.duration, 0);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setProgress(0);
      setStepProgress(0);
      setIsCompleted(false);
      currentStepRef.current = 0;
      startAnalysis();
    } else {
      // Cleanup timers when modal closes
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
      if (stepTimerRef.current) {
        clearTimeout(stepTimerRef.current);
      }
    }
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
      if (stepTimerRef.current) {
        clearTimeout(stepTimerRef.current);
      }
    };
  }, []);

  const startAnalysis = () => {
    let accumulatedTime = 0;
    
    // Start overall progress animation
    const updateProgress = () => {
      const progressUpdateInterval = 50; // 50ms for smooth animation
      
      progressTimerRef.current = setInterval(() => {
        accumulatedTime += progressUpdateInterval;
        const overallProgress = Math.min((accumulatedTime / totalDuration) * 100, 100);
        setProgress(overallProgress);
        
        // Update step progress
        const currentStepDuration = analysisSteps[currentStepRef.current]?.duration || 1000;
        const currentStepStartTime = analysisSteps
          .slice(0, currentStepRef.current)
          .reduce((sum, step) => sum + step.duration, 0);
        const timeInCurrentStep = accumulatedTime - currentStepStartTime;
        const currentStepProgress = Math.min((timeInCurrentStep / currentStepDuration) * 100, 100);
        setStepProgress(currentStepProgress);
        
        // Check if analysis is complete
        if (overallProgress >= 100) {
          setIsCompleted(true);
          if (progressTimerRef.current) {
            clearInterval(progressTimerRef.current);
          }
          // Auto-close after 3 seconds when complete
          setTimeout(() => {
            onClose();
          }, 3000);
        }
      }, progressUpdateInterval);
    };

    // Schedule step transitions
    const scheduleSteps = () => {
      let timeOffset = 0;
      
      analysisSteps.forEach((step, index) => {
        stepTimerRef.current = setTimeout(() => {
          setCurrentStep(index);
          currentStepRef.current = index;
          setStepProgress(0);
        }, timeOffset);
        timeOffset += step.duration;
      });
    };

    updateProgress();
    scheduleSteps();
  };

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'pending';
  };

  const getColorClasses = (color: string, variant: 'bg' | 'text' | 'border' | 'from' | 'to') => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-500',
        text: 'text-blue-400',
        border: 'border-blue-400',
        from: 'from-blue-400',
        to: 'to-blue-600'
      },
      purple: {
        bg: 'bg-purple-500',
        text: 'text-purple-400',
        border: 'border-purple-400',
        from: 'from-purple-400',
        to: 'to-purple-600'
      },
      indigo: {
        bg: 'bg-indigo-500',
        text: 'text-indigo-400',
        border: 'border-indigo-400',
        from: 'from-indigo-400',
        to: 'to-indigo-600'
      },
      violet: {
        bg: 'bg-violet-500',
        text: 'text-violet-400',
        border: 'border-violet-400',
        from: 'from-violet-400',
        to: 'to-violet-600'
      },
      cyan: {
        bg: 'bg-cyan-500',
        text: 'text-cyan-400',
        border: 'border-cyan-400',
        from: 'from-cyan-400',
        to: 'to-cyan-600'
      },
      emerald: {
        bg: 'bg-emerald-500',
        text: 'text-emerald-400',
        border: 'border-emerald-400',
        from: 'from-emerald-400',
        to: 'to-emerald-600'
      }
    };
    
    return colorMap[color as keyof typeof colorMap]?.[variant] || colorMap.blue[variant];
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-2xl bg-slate-900 border-slate-700 text-white"
      >
        <div className="relative">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 text-slate-400 hover:text-white hover:bg-slate-800 z-10"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Header Section */}
          <DialogHeader className="text-center mb-8">
            <div className="relative inline-block">
              <div className="w-16 h-16 mx-auto mb-4 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full animate-pulse opacity-20"></div>
                <div className="relative w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  {isCompleted ? (
                    <Check className="h-8 w-8 text-white" />
                  ) : (
                    <FileText className="h-8 w-8 text-white" />
                  )}
                </div>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
              {isCompleted ? 'Analysis Complete!' : 'Analyzing Your Resume'}
            </h2>
            <p className="text-slate-400 text-lg">
              {isCompleted 
                ? 'Your comprehensive resume analysis is ready'
                : 'Our AI is providing comprehensive feedback on your resume'
              }
            </p>
          </DialogHeader>

        {/* Overall Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-300">Overall Progress</span>
            <span className="text-sm font-medium text-white">{Math.round(progress)}%</span>
          </div>
          <Progress 
            value={progress} 
            className="h-3 bg-slate-700"
          />
        </div>

        {/* Steps Section */}
        <div className="space-y-4 mb-8">
          {analysisSteps.map((step, index) => {
            const Icon = step.icon;
            const status = getStepStatus(index);
            const isCurrentStep = index === currentStep;
            
            return (
              <div 
                key={step.id}
                className={`flex items-center p-4 rounded-lg border transition-all duration-300 ${
                  status === 'completed' 
                    ? 'bg-slate-800/50 border-green-500/30' 
                    : status === 'current' 
                    ? `bg-slate-800/70 ${getColorClasses(step.color, 'border')}/50 shadow-lg` 
                    : 'bg-slate-800/30 border-slate-700/50'
                }`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  status === 'completed' 
                    ? 'bg-green-500' 
                    : status === 'current' 
                    ? `${getColorClasses(step.color, 'bg')}` 
                    : 'bg-slate-700'
                }`}>
                  {status === 'completed' ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : (
                    <Icon className={`h-5 w-5 ${
                      status === 'current' ? 'text-white animate-pulse' : 'text-slate-400'
                    }`} />
                  )}
                </div>
                
                <div className="ml-4 flex-1">
                  <h3 className={`font-semibold ${
                    status === 'completed' 
                      ? 'text-green-400' 
                      : status === 'current' 
                      ? 'text-white' 
                      : 'text-slate-400'
                  }`}>
                    {step.title}
                  </h3>
                  <p className={`text-sm ${
                    status === 'current' ? 'text-slate-300' : 'text-slate-500'
                  }`}>
                    {step.description}
                  </p>
                  
                  {/* Step Progress Bar */}
                  {isCurrentStep && (
                    <div className="mt-2">
                      <Progress 
                        value={stepProgress} 
                        className="h-1 bg-slate-600"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-lg">💡</span>
            </div>
            <div>
              <h4 className="font-semibold text-yellow-400 mb-1">Did you know?</h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                {analysisSteps[currentStep]?.tip || "We're working hard to provide you with the best resume analysis!"}
              </p>
            </div>
          </div>
        </div>

          {/* Completion Message */}
          {isCompleted && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-2">
                <Check className="h-5 w-5 text-green-400" />
                <span className="text-green-400 font-medium">Analysis Complete!</span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
