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
          background: 'rgba(0,0,0,0.55)',
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
        maxWidth: 400,
        padding: '0 20px',
        animation: 'obSlideUp 0.25s ease',
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: 14,
          padding: '28px 28px 22px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.35), 0 4px 20px rgba(0,0,0,0.15)',
        }}>
          {/* Close */}
          <button
            onClick={handleDismiss}
            style={{
              position: 'absolute',
              top: 16,
              right: 36,
              background: 'none',
              border: 'none',
              fontSize: '1.1rem',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: 4,
              lineHeight: 1,
            }}
          >
            ×
          </button>

          {/* Title */}
          <h2 style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: '1.15rem',
            color: '#111827',
            margin: '0 0 10px',
            lineHeight: 1.3,
            paddingRight: 24,
          }}>
            {step.title}
          </h2>

          {/* Description */}
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.88rem',
            color: '#6b7280',
            lineHeight: 1.6,
            margin: '0 0 28px',
          }}>
            {step.description}
          </p>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Step counter */}
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.78rem',
              color: '#3b82f6',
              fontWeight: 500,
            }}>
              {currentStep + 1} of {steps.length}
            </span>

            {/* Nav buttons */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                onClick={handleBack}
                disabled={isFirst}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.82rem',
                  color: isFirst ? '#d1d5db' : '#9ca3af',
                  cursor: isFirst ? 'default' : 'pointer',
                  padding: '6px 10px',
                  fontWeight: 500,
                }}
              >
                ← Back
              </button>
              <button
                onClick={handleNext}
                style={{
                  background: '#111827',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '9px 22px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#1f2937')}
                onMouseLeave={e => (e.currentTarget.style.background = '#111827')}
              >
                {isLast ? 'Got it' : 'Next →'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes obFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes obSlideUp { from { opacity: 0; transform: translate(-50%, -46%); } to { opacity: 1; transform: translate(-50%, -50%); } }
      `}</style>
    </>
  );
}
