"use client"

import { useState, useEffect } from 'react';

interface OnboardingStep {
  title: string;
  description: string;
}

interface OnboardingDialogProps {
  activityType: string;
  steps: OnboardingStep[];
  forceShow?: boolean;
}

export default function OnboardingDialog({ activityType, steps, forceShow }: OnboardingDialogProps) {
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (forceShow) { setVisible(true); setChecked(true); return; }
    const dismissed = localStorage.getItem(`onboarding_${activityType}`);
    if (dismissed === '1') { setChecked(true); return; }
    fetch(`/api/onboarding/check?type=${activityType}`)
      .then(r => r.json())
      .then(data => {
        if (data.isFirstTime) setVisible(true);
        else localStorage.setItem(`onboarding_${activityType}`, '1');
        setChecked(true);
      })
      .catch(() => setChecked(true));
  }, [activityType, forceShow]);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(`onboarding_${activityType}`, '1');
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
    else handleDismiss();
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  if (!checked || !visible) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleDismiss}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 9998,
          animation: 'obFadeIn 0.2s ease',
        }}
      />

      {/* Card */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        width: '100%',
        maxWidth: 420,
        padding: '0 20px',
        animation: 'obSlideUp 0.25s ease',
      }}>
        <div style={{
          background: 'hsl(222, 40%, 8%)',
          borderRadius: 14,
          padding: '32px 30px 24px',
          border: '1px solid hsl(220, 20%, 18%)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,130,246,0.06)',
        }}>
          {/* Skip */}
          <button
            onClick={handleDismiss}
            style={{
              position: 'absolute',
              top: 18,
              right: 38,
              background: 'none',
              border: 'none',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.72rem',
              color: 'hsl(215, 15%, 35%)',
              cursor: 'pointer',
              padding: '4px 8px',
              letterSpacing: '0.03em',
            }}
          >
            Skip
          </button>

          {/* Step counter */}
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.68rem',
            fontWeight: 500,
            color: '#3b82f6',
            marginBottom: 14,
            letterSpacing: '0.08em',
          }}>
            {currentStep + 1} / {steps.length}
          </div>

          {/* Title */}
          <h2 style={{
            fontFamily: "'Instrument Serif', serif",
            fontWeight: 400,
            fontSize: '1.35rem',
            color: '#f8fafc',
            margin: '0 0 10px',
            lineHeight: 1.25,
            paddingRight: 40,
          }}>
            {step.title}
          </h2>

          {/* Description */}
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.84rem',
            color: 'hsl(215, 15%, 55%)',
            lineHeight: 1.65,
            margin: '0 0 30px',
          }}>
            {step.description}
          </p>

          {/* Progress bar */}
          <div style={{
            height: 2,
            background: 'hsl(220, 20%, 14%)',
            borderRadius: 1,
            marginBottom: 20,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${((currentStep + 1) / steps.length) * 100}%`,
              background: '#3b82f6',
              borderRadius: 1,
              transition: 'width 0.3s ease',
            }} />
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Back */}
            <button
              onClick={handleBack}
              disabled={isFirst}
              style={{
                background: 'none',
                border: 'none',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.8rem',
                color: isFirst ? 'hsl(220, 20%, 20%)' : 'hsl(215, 15%, 45%)',
                cursor: isFirst ? 'default' : 'pointer',
                padding: '6px 0',
                fontWeight: 500,
                transition: 'color 0.15s',
              }}
            >
              Back
            </button>

            {/* Next / Done */}
            <button
              onClick={handleNext}
              style={{
                background: '#3b82f6',
                color: '#ffffff',
                border: 'none',
                borderRadius: 8,
                padding: '9px 24px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#2563eb')}
              onMouseLeave={e => (e.currentTarget.style.background = '#3b82f6')}
            >
              {isLast ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
        @keyframes obFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes obSlideUp { from { opacity: 0; transform: translate(-50%, -46%); } to { opacity: 1; transform: translate(-50%, -50%); } }
      `}</style>
    </>
  );
}
