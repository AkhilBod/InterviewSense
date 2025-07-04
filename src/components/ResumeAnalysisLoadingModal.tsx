'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Brain, 
  Target, 
  TrendingUp, 
  Check
} from 'lucide-react';

interface AnalysisStep {
  id: number;
  icon: React.ComponentType<any>;
  title: string;
  duration: number;
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
    duration: 2000,
  },
  {
    id: 2,
    icon: Brain,
    title: "Analyzing Content",
    duration: 2500,
  },
  {
    id: 3,
    icon: Target,
    title: "Checking Role Match",
    duration: 2000,
  },
  {
    id: 4,
    icon: TrendingUp,
    title: "Generating Scores",
    duration: 1500,
  }
];

const ResumeAnalysisLoadingModal: React.FC<ResumeAnalysisLoadingModalProps> = ({
  isOpen,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      startAnalysis();
    } else {
      if (stepTimerRef.current) {
        clearTimeout(stepTimerRef.current);
        stepTimerRef.current = null;
      }
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (stepTimerRef.current) {
        clearTimeout(stepTimerRef.current);
      }
    };
  }, []);

  const startAnalysis = () => {
    progressThroughSteps(0);
  };

  const progressThroughSteps = (stepIndex: number) => {
    if (stepIndex >= analysisSteps.length) {
      return;
    }

    setCurrentStep(stepIndex);

    stepTimerRef.current = setTimeout(() => {
      progressThroughSteps(stepIndex + 1);
    }, analysisSteps[stepIndex].duration);
  };

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'pending';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative mx-4 w-full max-w-lg">
        <div className="bg-zinc-900 rounded-2xl border border-zinc-700 shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              Analyzing Your Resume
            </h2>
            <p className="text-zinc-400">
              Please wait while we analyze your resume...
            </p>
          </div>
          
          {/* Steps */}
          <div className="space-y-4">
            {analysisSteps.map((step, index) => {
              const status = getStepStatus(index);
              const StepIcon = step.icon;
              
              return (
                <div 
                  key={step.id}
                  className={`flex items-center space-x-4 p-4 rounded-lg transition-all duration-300 ${
                    status === 'current' ? 'bg-blue-500/10 border border-blue-500/30' :
                    status === 'completed' ? 'bg-green-500/10 border border-green-500/30' :
                    'bg-zinc-800/50 border border-zinc-700/50'
                  }`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    status === 'completed' ? 'bg-green-500 border-green-500' :
                    status === 'current' ? 'border-blue-500 bg-blue-500/20' :
                    'border-zinc-600 bg-zinc-700'
                  }`}>
                    {status === 'completed' ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <StepIcon 
                        className={`w-5 h-5 ${
                          status === 'current' ? 'text-blue-400 animate-pulse' : 'text-zinc-400'
                        }`}
                      />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className={`font-medium transition-colors duration-300 ${
                      status === 'completed' ? 'text-green-300' :
                      status === 'current' ? 'text-white' :
                      'text-zinc-500'
                    }`}>
                      {step.title}
                    </h4>
                  </div>
                  
                  {status === 'current' && (
                    <div className="flex-shrink-0">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalysisLoadingModal;
