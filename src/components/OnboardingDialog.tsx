"use client"

import { useState, useEffect, useCallback, useRef } from 'react';

interface OnboardingStep {
  title: string;
  description: string;
  target?: string;          // CSS selector for the element to spotlight
  position?: 'top' | 'bottom' | 'left' | 'right'; // tooltip position relative to target
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
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const rafRef = useRef<number>(0);

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

  // Find and track the target element for the current step
  const updateTargetRect = useCallback(() => {
    const step = steps[currentStep];
    if (!step?.target) { setTargetRect(null); return; }
    const el = document.querySelector(step.target);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, [currentStep, steps]);

  useEffect(() => {
    if (!visible) return;
    // Small delay to let the page render before finding elements
    const timer = setTimeout(updateTargetRect, 150);
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
      cancelAnimationFrame(rafRef.current);
    };
  }, [visible, updateTargetRect]);

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
  const hasTarget = !!step.target && !!targetRect;
  const pos = step.position || 'bottom';

  // Spotlight cutout dimensions (with padding)
  const pad = 8;
  const sr = hasTarget ? {
    x: targetRect!.left - pad,
    y: targetRect!.top - pad,
    w: targetRect!.width + pad * 2,
    h: targetRect!.height + pad * 2,
    r: 10,
  } : null;

  // Tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    if (!hasTarget || !sr) {
      // Centered fallback
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }
    const gap = 16;
    const base: React.CSSProperties = { position: 'fixed' };
    switch (pos) {
      case 'bottom':
        base.top = sr.y + sr.h + gap;
        base.left = sr.x + sr.w / 2;
        base.transform = 'translateX(-50%)';
        break;
      case 'top':
        base.bottom = window.innerHeight - sr.y + gap;
        base.left = sr.x + sr.w / 2;
        base.transform = 'translateX(-50%)';
        break;
      case 'right':
        base.top = sr.y + sr.h / 2;
        base.left = sr.x + sr.w + gap;
        base.transform = 'translateY(-50%)';
        break;
      case 'left':
        base.top = sr.y + sr.h / 2;
        base.right = window.innerWidth - sr.x + gap;
        base.transform = 'translateY(-50%)';
        break;
    }
    return base;
  };

  // Arrow pointing toward the target
  const getArrowStyle = (): React.CSSProperties | null => {
    if (!hasTarget) return null;
    const base: React.CSSProperties = { position: 'absolute', width: 0, height: 0 };
    const arrowSize = 8;
    switch (pos) {
      case 'bottom':
        return { ...base, top: -arrowSize, left: '50%', transform: 'translateX(-50%)', borderLeft: `${arrowSize}px solid transparent`, borderRight: `${arrowSize}px solid transparent`, borderBottom: `${arrowSize}px solid hsl(222, 40%, 10%)` };
      case 'top':
        return { ...base, bottom: -arrowSize, left: '50%', transform: 'translateX(-50%)', borderLeft: `${arrowSize}px solid transparent`, borderRight: `${arrowSize}px solid transparent`, borderTop: `${arrowSize}px solid hsl(222, 40%, 10%)` };
      case 'right':
        return { ...base, left: -arrowSize, top: '50%', transform: 'translateY(-50%)', borderTop: `${arrowSize}px solid transparent`, borderBottom: `${arrowSize}px solid transparent`, borderRight: `${arrowSize}px solid hsl(222, 40%, 10%)` };
      case 'left':
        return { ...base, right: -arrowSize, top: '50%', transform: 'translateY(-50%)', borderTop: `${arrowSize}px solid transparent`, borderBottom: `${arrowSize}px solid transparent`, borderLeft: `${arrowSize}px solid hsl(222, 40%, 10%)` };
    }
    return null;
  };

  return (
    <>
      {/* Overlay with spotlight cutout */}
      <svg
        onClick={handleDismiss}
        style={{ position: 'fixed', inset: 0, zIndex: 9998, animation: 'obFadeIn 0.2s ease', cursor: 'default' }}
        width="100%" height="100%"
      >
        <defs>
          <mask id="ob-spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {sr && (
              <rect
                x={sr.x} y={sr.y} width={sr.w} height={sr.h}
                rx={sr.r} ry={sr.r}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%" height="100%"
          fill="rgba(0,0,0,0.65)"
          mask="url(#ob-spotlight-mask)"
        />
      </svg>

      {/* Spotlight ring glow around target */}
      {sr && (
        <div style={{
          position: 'fixed',
          left: sr.x - 2,
          top: sr.y - 2,
          width: sr.w + 4,
          height: sr.h + 4,
          borderRadius: sr.r + 2,
          border: '2px solid rgba(59,130,246,0.4)',
          boxShadow: '0 0 20px rgba(59,130,246,0.15), 0 0 0 1px rgba(59,130,246,0.1)',
          zIndex: 9998,
          pointerEvents: 'none',
          animation: 'obFadeIn 0.3s ease',
        }} />
      )}

      {/* Tooltip card */}
      <div style={{
        ...getTooltipStyle(),
        zIndex: 9999,
        width: 340,
        maxWidth: 'calc(100vw - 40px)',
        animation: 'obSlideUp 0.25s ease',
      }}>
        {/* Arrow */}
        {getArrowStyle() && <div style={getArrowStyle()!} />}

        <div style={{
          background: 'hsl(222, 40%, 10%)',
          borderRadius: 12,
          padding: '24px 24px 20px',
          border: '1px solid hsl(220, 20%, 18%)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
        }}>
          {/* Skip */}
          <button
            onClick={handleDismiss}
            style={{
              position: 'absolute', top: 12, right: 16,
              background: 'none', border: 'none',
              fontFamily: "'Inter', sans-serif", fontSize: '0.7rem',
              color: 'hsl(215, 15%, 35%)', cursor: 'pointer',
              padding: '4px 6px', letterSpacing: '0.03em',
            }}
          >
            Skip
          </button>

          {/* Counter */}
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.65rem', fontWeight: 500,
            color: '#3b82f6', marginBottom: 10,
            letterSpacing: '0.08em',
          }}>
            {currentStep + 1} / {steps.length}
          </div>

          {/* Title */}
          <h2 style={{
            fontFamily: "'Instrument Serif', serif",
            fontWeight: 400, fontSize: '1.2rem',
            color: '#f8fafc', margin: '0 0 8px',
            lineHeight: 1.25, paddingRight: 32,
          }}>
            {step.title}
          </h2>

          {/* Description */}
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.82rem', color: 'hsl(215, 15%, 55%)',
            lineHeight: 1.6, margin: '0 0 20px',
          }}>
            {step.description}
          </p>

          {/* Progress bar */}
          <div style={{
            height: 2, background: 'hsl(220, 20%, 14%)',
            borderRadius: 1, marginBottom: 16, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${((currentStep + 1) / steps.length) * 100}%`,
              background: '#3b82f6', borderRadius: 1,
              transition: 'width 0.3s ease',
            }} />
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={handleBack}
              disabled={isFirst}
              style={{
                background: 'none', border: 'none',
                fontFamily: "'Inter', sans-serif", fontSize: '0.78rem',
                color: isFirst ? 'hsl(220, 20%, 20%)' : 'hsl(215, 15%, 45%)',
                cursor: isFirst ? 'default' : 'pointer',
                padding: '6px 0', fontWeight: 500,
              }}
            >
              Back
            </button>
            <button
              onClick={handleNext}
              style={{
                background: '#3b82f6', color: '#ffffff',
                border: 'none', borderRadius: 8,
                padding: '8px 20px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.8rem', fontWeight: 600,
                cursor: 'pointer', transition: 'background 0.15s',
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
        @keyframes obSlideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
}
