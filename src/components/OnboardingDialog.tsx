"use client"

import { useState, useEffect } from 'react';

interface OnboardingStep {
  title: string;
  description: string;
  icon?: string; // emoji
}

interface OnboardingDialogProps {
  activityType: string; // 'system_design' | 'technical' | 'behavioral'
  steps: OnboardingStep[];
  /** Override first-time check (for testing) */
  forceShow?: boolean;
}

/**
 * A minimal first-time onboarding dialog that matches the InterviewSense design language.
 * Shows a step-through walkthrough the first time a user visits a feature.
 * Checks the DB via /api/onboarding/check?type=... to see if they've completed one before.
 */
export default function OnboardingDialog({ activityType, steps, forceShow }: OnboardingDialogProps) {
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (forceShow) { setVisible(true); setChecked(true); return; }

    // Check localStorage first for instant dismiss (avoids flicker on repeat visits)
    const dismissed = localStorage.getItem(`onboarding_${activityType}`);
    if (dismissed === '1') { setChecked(true); return; }

    // Then check DB
    fetch(`/api/onboarding/check?type=${activityType}`)
      .then(r => r.json())
      .then(data => {
        if (data.isFirstTime) {
          setVisible(true);
        } else {
          // They've done this before — persist so we skip the API call next time
          localStorage.setItem(`onboarding_${activityType}`, '1');
        }
        setChecked(true);
      })
      .catch(() => setChecked(true));
  }, [activityType, forceShow]);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(`onboarding_${activityType}`, '1');
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleDismiss();
    }
  };

  if (!checked || !visible) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

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
          zIndex: 9998,
          animation: 'obFadeIn 0.2s ease',
        }}
      />

      {/* Dialog */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        width: '100%',
        maxWidth: 420,
        padding: '0 16px',
        animation: 'obSlideUp 0.25s ease',
      }}>
        <div style={{
          background: 'hsl(222, 40%, 8%)',
          border: '1px solid hsl(220, 20%, 18%)',
          borderRadius: 12,
          padding: '32px 28px 24px',
        }}>
          {/* Icon */}
          {step.icon && (
            <div style={{ fontSize: '1.8rem', marginBottom: 16 }}>
              {step.icon}
            </div>
          )}

          {/* Title */}
          <h2 style={{
            fontFamily: "'Instrument Serif', serif",
            fontWeight: 400,
            fontSize: '1.5rem',
            color: '#f8fafc',
            margin: '0 0 8px',
            lineHeight: 1.2,
          }}>
            {step.title}
          </h2>

          {/* Description */}
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.85rem',
            color: 'hsl(215, 15%, 55%)',
            lineHeight: 1.65,
            margin: '0 0 28px',
          }}>
            {step.description}
          </p>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Step dots */}
            {steps.length > 1 ? (
              <div style={{ display: 'flex', gap: 6 }}>
                {steps.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: i === currentStep ? 16 : 6,
                      height: 6,
                      borderRadius: 3,
                      background: i === currentStep ? '#3b82f6' : 'hsl(220, 20%, 18%)',
                      transition: 'all 0.2s ease',
                    }}
                  />
                ))}
              </div>
            ) : (
              <div />
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button
                onClick={handleDismiss}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.8rem',
                  color: 'hsl(215, 15%, 45%)',
                  cursor: 'pointer',
                  padding: '6px 10px',
                }}
              >
                Skip
              </button>
              <button
                onClick={handleNext}
                style={{
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 20px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#2563eb')}
                onMouseLeave={e => (e.currentTarget.style.background = '#3b82f6')}
              >
                {isLast ? 'Got it' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes obFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes obSlideUp { from { opacity: 0; transform: translate(-50%, -46%); } to { opacity: 1; transform: translate(-50%, -50%); } }
      `}</style>
    </>
  );
}
