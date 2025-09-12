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
  Lightbulb,
  PenTool
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface AnalysisStep {
  id: number;
  icon: LucideIcon;
  title: string;
  description: string;
  duration: number; // in milliseconds
  color: string; // tailwind color class
  tip: string; // helpful information for users
}

interface CoverLetterLoadingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const analysisSteps: AnalysisStep[] = [
  {
    id: 1,
    icon: FileText,
    title: "Analyzing Your Resume",
    description: "Extracting key achievements, skills, and experience",
    duration: 3000,
    color: "text-blue-400",
    tip: "We're identifying your most compelling achievements and quantifiable results"
  },
  {
    id: 2,
    icon: Brain,
    title: "Understanding Job Requirements",
    description: "Mapping your background to role requirements",
    duration: 4000,
    color: "text-purple-400",
    tip: "Analyzing the job description to find the perfect alignment points"
  },
  {
    id: 3,
    icon: Target,
    title: "Company Research & Personalization",
    description: "Tailoring content specifically for the target company",
    duration: 4500,
    color: "text-green-400",
    tip: "Incorporating company-specific insights and demonstrating cultural fit"
  },
  {
    id: 4,
    icon: Sparkles,
    title: "Optimizing Language",
    description: "Using industry-specific terminology and keywords",
    duration: 3500,
    color: "text-yellow-400",
    tip: "Incorporating language that resonates with hiring managers in your field"
  },
  {
    id: 5,
    icon: PenTool,
    title: "Formatting & Structure",
    description: "Organizing content for maximum impact",
    duration: 2500,
    color: "text-indigo-400",
    tip: "Creating a professional layout that guides the reader's attention"
  },
  {
    id: 6,
    icon: Shield,
    title: "Final Quality Check",
    description: "Ensuring professional standards and accuracy",
    duration: 2500,
    color: "text-emerald-400",
    tip: "Checking for grammar, tone, and overall persuasiveness"
  }
];

const CoverLetterLoadingModal: React.FC<CoverLetterLoadingModalProps> = ({
  isOpen,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Calculate total duration for overall progress
  const totalDuration = analysisSteps.reduce((sum, step) => sum + step.duration, 0);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setProgress(0);
      setStepProgress(0);
      setIsCompleted(false);
      startTimeRef.current = Date.now();
      startAnalysis();
    } else {
      // Cleanup timers when modal closes
      if (stepTimerRef.current) {
        clearTimeout(stepTimerRef.current);
        stepTimerRef.current = null;
      }
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    }
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stepTimerRef.current) {
        clearTimeout(stepTimerRef.current);
      }
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, []);

  const startAnalysis = () => {
    // Start progress update timer (50ms intervals for smooth animation)
    progressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const overallProgress = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(overallProgress);

      // Calculate current step progress
      let accumulatedTime = 0;
      let currentStepIndex = 0;
      
      for (let i = 0; i < analysisSteps.length; i++) {
        if (elapsed >= accumulatedTime && elapsed < accumulatedTime + analysisSteps[i].duration) {
          currentStepIndex = i;
          const stepElapsed = elapsed - accumulatedTime;
          const stepProgressPercent = (stepElapsed / analysisSteps[i].duration) * 100;
          setStepProgress(Math.min(stepProgressPercent, 100));
          break;
        }
        accumulatedTime += analysisSteps[i].duration;
      }

      // Check if analysis is complete
      if (elapsed >= totalDuration) {
        setProgress(100);
        setStepProgress(100);
        setIsCompleted(true);
        if (progressTimerRef.current) {
          clearInterval(progressTimerRef.current);
          progressTimerRef.current = null;
        }
      }
    }, 50);

    // Start step progression
    progressThroughSteps(0);
  };

  const progressThroughSteps = (stepIndex: number) => {
    if (stepIndex >= analysisSteps.length) {
      return;
    }

    setCurrentStep(stepIndex);
    setStepProgress(0);

    stepTimerRef.current = setTimeout(() => {
      progressThroughSteps(stepIndex + 1);
    }, analysisSteps[stepIndex].duration);
  };

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'pending';
  };

  const currentStepData = analysisSteps[currentStep];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative mx-4 w-full max-w-2xl transform transition-all duration-300 scale-100 opacity-100">
        <div className="bg-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className="px-8 pt-8 pb-6 text-center">
            <div className="relative inline-block mb-4">
              {currentStepData && (
                <currentStepData.icon 
                  className={`w-16 h-16 ${currentStepData.color} animate-pulse`}
                  strokeWidth={1.5}
                />
              )}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-ping" />
            </div>
            
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent mb-2">
              Crafting Your Cover Letter
            </h2>
            <p className="text-slate-400 text-lg">
              Our AI is creating a personalized letter that highlights your best qualifications
            </p>
          </div>

          {/* Progress Section */}
          <div className="px-8 pb-6">
            {/* Overall Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-300">Overall Progress</span>
                <span className="text-sm font-medium text-slate-300">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Current Step Highlight */}
            {currentStepData && (
              <div className="bg-slate-800/50 rounded-xl border border-slate-600/50 p-4 mb-6">
                <div className="flex items-center space-x-3 mb-3">
                  <currentStepData.icon 
                    className={`w-6 h-6 ${currentStepData.color}`}
                    strokeWidth={2}
                  />
                  <div>
                    <h3 className="font-semibold text-white">{currentStepData.title}</h3>
                    <p className="text-sm text-slate-400">{currentStepData.description}</p>
                  </div>
                </div>
                
                {/* Step Progress Bar */}
                <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ease-out bg-gradient-to-r ${
                      currentStepData.color.includes('blue') ? 'from-blue-500 to-blue-400' :
                      currentStepData.color.includes('purple') ? 'from-purple-500 to-purple-400' :
                      currentStepData.color.includes('green') ? 'from-green-500 to-green-400' :
                      currentStepData.color.includes('yellow') ? 'from-yellow-500 to-yellow-400' :
                      currentStepData.color.includes('indigo') ? 'from-indigo-500 to-indigo-400' :
                      'from-emerald-500 to-emerald-400'
                    }`}
                    style={{ width: `${stepProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Steps Checklist */}
            <div className="space-y-3">
              {analysisSteps.map((step, index) => {
                const status = getStepStatus(index);
                const StepIcon = step.icon;
                
                return (
                  <div 
                    key={step.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                      status === 'current' ? 'bg-slate-800/70 border border-slate-600/50' :
                      status === 'completed' ? 'bg-green-900/20 border border-green-700/30' :
                      'bg-slate-800/30 border border-slate-700/20'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      status === 'completed' ? 'bg-green-500 border-green-500' :
                      status === 'current' ? `border-slate-400 bg-slate-800` :
                      'border-slate-600 bg-slate-700'
                    }`}>
                      {status === 'completed' ? (
                        <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                      ) : (
                        <StepIcon 
                          className={`w-4 h-4 ${
                            status === 'current' ? step.color : 'text-slate-500'
                          } ${status === 'current' ? 'animate-pulse' : ''}`}
                          strokeWidth={2}
                        />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className={`font-medium transition-colors duration-300 ${
                        status === 'completed' ? 'text-green-300' :
                        status === 'current' ? 'text-white' :
                        'text-slate-500'
                      }`}>
                        {step.title}
                      </h4>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tips Section */}
          {currentStepData && (
            <div className="px-8 pb-8">
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-700/30 p-4">
                <div className="flex items-start space-x-3">
                  <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-200 mb-1">Pro Tip</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {currentStepData.tip}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoverLetterLoadingModal;
