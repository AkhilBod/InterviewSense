'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Globe, Brain, Code2, Target, TrendingUp, Check } from 'lucide-react';

interface AnalysisStep {
  id: number;
  icon: React.ComponentType<any>;
  title: string;
  duration: number;
}

interface PortfolioAnalysisLoadingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const analysisSteps: AnalysisStep[] = [
  { id: 1, icon: Globe,      title: 'Scanning portfolio website',   duration: 2000 },
  { id: 2, icon: Brain,      title: 'Analyzing GitHub projects',    duration: 2500 },
  { id: 3, icon: Code2,      title: 'Evaluating technical skills',  duration: 2000 },
  { id: 4, icon: Target,     title: 'Checking role alignment',      duration: 2000 },
  { id: 5, icon: TrendingUp, title: 'Generating feedback',          duration: 1500 },
];

const totalDuration = analysisSteps.reduce((sum, s) => sum + s.duration, 0);

const PortfolioAnalysisLoadingModal: React.FC<PortfolioAnalysisLoadingModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setProgress(0);
      startTimeRef.current = Date.now();

      progressTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setProgress(Math.min((elapsed / totalDuration) * 100, 100));
        if (elapsed >= totalDuration && progressTimerRef.current) {
          clearInterval(progressTimerRef.current);
          progressTimerRef.current = null;
        }
      }, 50);

      progressThroughSteps(0);
    } else {
      if (stepTimerRef.current) { clearTimeout(stepTimerRef.current); stepTimerRef.current = null; }
      if (progressTimerRef.current) { clearInterval(progressTimerRef.current); progressTimerRef.current = null; }
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);

  const progressThroughSteps = (idx: number) => {
    if (idx >= analysisSteps.length) return;
    setCurrentStep(idx);
    stepTimerRef.current = setTimeout(() => progressThroughSteps(idx + 1), analysisSteps[idx].duration);
  };

  const getStatus = (idx: number) => {
    if (idx < currentStep) return 'completed';
    if (idx === currentStep) return 'current';
    return 'pending';
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{ position: 'relative', width: '100%', maxWidth: 420, margin: '0 16px' }}>
        <div style={{
          background: '#0a0f1a',
          borderRadius: 16,
          border: '1px solid rgba(59,130,246,0.15)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '32px 32px 24px', textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.25rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>
              Analyzing Your Portfolio
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: '#64748b' }}>
              {Math.round(progress)}% complete
            </p>
          </div>

          <div style={{ padding: '0 32px 24px' }}>
            <div style={{ width: '100%', height: 4, background: 'rgba(59,130,246,0.1)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: '#3b82f6', borderRadius: 2, transition: 'width 0.3s ease-out' }} />
            </div>
          </div>

          <div style={{ padding: '0 32px 32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {analysisSteps.map((step, idx) => {
                const status = getStatus(idx);
                const StepIcon = step.icon;
                return (
                  <div key={step.id} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '12px 16px', borderRadius: 10,
                    background: status === 'current' ? 'rgba(59,130,246,0.08)' : status === 'completed' ? 'rgba(34,197,94,0.05)' : 'transparent',
                    border: status === 'current' ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
                    transition: 'all 0.2s ease',
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      background: status === 'completed' ? '#22c55e' : status === 'current' ? 'rgba(59,130,246,0.15)' : 'rgba(100,116,139,0.1)',
                      border: status === 'completed' ? 'none' : status === 'current' ? '1.5px solid #3b82f6' : '1.5px solid rgba(100,116,139,0.3)',
                      transition: 'all 0.2s ease',
                    }}>
                      {status === 'completed'
                        ? <Check style={{ width: 14, height: 14, color: '#fff' }} strokeWidth={2.5} />
                        : <StepIcon style={{ width: 14, height: 14, color: status === 'current' ? '#3b82f6' : '#64748b' }} strokeWidth={2} />
                      }
                    </div>
                    <span style={{
                      fontFamily: 'Inter, sans-serif', fontSize: '0.875rem',
                      fontWeight: status === 'current' ? 500 : 400,
                      color: status === 'completed' ? '#22c55e' : status === 'current' ? '#e2e8f0' : '#64748b',
                      transition: 'color 0.2s ease',
                    }}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioAnalysisLoadingModal;
