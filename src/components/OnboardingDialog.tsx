"use client"

import { useState, useEffect, useCallback, useRef } from 'react';

interface OnboardingStep {
  title: string;
  description: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingDialogProps {
  activityType: string;
  steps: OnboardingStep[];
  forceShow?: boolean;
}

interface GlowRect { x: number; y: number; w: number; h: number; r: number }

export default function OnboardingDialog({ activityType, steps, forceShow }: OnboardingDialogProps) {
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [checked, setChecked] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  // The animated glow rect — persists across step changes so CSS transition travels it
  const [glowRect, setGlowRect] = useState<GlowRect | null>(null);
  // Controls tooltip visibility (fades out on step change, back in after glow arrives)
  const [showContent, setShowContent] = useState(false);
  const pendingRevealRef = useRef(false);
  const travelDuration = 420; // ms — how long glow takes to travel to new position

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

  const rectFromDom = (selector: string): GlowRect | null => {
    const el = document.querySelector(selector);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const pad = 10;
    return { x: r.left - pad, y: r.top - pad, w: r.width + pad * 2, h: r.height + pad * 2, r: 12 };
  };

  const updateTargetRect = useCallback(() => {
    const step = steps[currentStep];
    if (!step?.target) {
      setTargetRect(null);
      if (pendingRevealRef.current) {
        pendingRevealRef.current = false;
        setTimeout(() => setShowContent(true), travelDuration);
      }
      return;
    }
    const el = document.querySelector(step.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
      const pad = 10;
      const gr: GlowRect = { x: rect.left - pad, y: rect.top - pad, w: rect.width + pad * 2, h: rect.height + pad * 2, r: 12 };

      if (pendingRevealRef.current) {
        // Glow travels to new position — reveal tooltip after travel completes
        pendingRevealRef.current = false;
        setGlowRect(gr); // triggers CSS transition travel
        setTimeout(() => setShowContent(true), travelDuration);
      } else {
        // First load — set glow immediately
        setGlowRect(gr);
        setTimeout(() => setShowContent(true), 80);
      }
    } else {
      setTargetRect(null);
    }
  }, [currentStep, steps]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(updateTargetRect, 100);
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
    };
  }, [visible, updateTargetRect]);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(`onboarding_${activityType}`, '1');
  };

  const changeStep = (next: number) => {
    if (!showContent) return;
    setShowContent(false); // fade out tooltip immediately
    setTimeout(() => {
      pendingRevealRef.current = true;
      setCurrentStep(next); // triggers updateTargetRect → glow starts traveling
    }, 150);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) changeStep(currentStep + 1);
    else handleDismiss();
  };

  const handleBack = () => {
    if (currentStep > 0) changeStep(currentStep - 1);
  };

  if (!checked || !visible) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;
  const hasTarget = !!step.target && !!targetRect;
  const pos = step.position || 'bottom';
  const pad = 10;

  // SVG cutout follows glowRect for smooth mask travel
  const sr = glowRect;

  const getTooltipStyle = (): React.CSSProperties => {
    if (!hasTarget || !targetRect) {
      return { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
    const r = targetRect;
    const gap = 18;
    const base: React.CSSProperties = { position: 'fixed' };
    switch (pos) {
      case 'bottom':
        base.top = r.bottom + pad + gap;
        base.left = r.left + r.width / 2;
        base.transform = 'translateX(-50%)';
        break;
      case 'top':
        base.bottom = window.innerHeight - r.top + pad + gap;
        base.left = r.left + r.width / 2;
        base.transform = 'translateX(-50%)';
        break;
      case 'right':
        base.top = r.top + r.height / 2;
        base.left = r.right + pad + gap;
        base.transform = 'translateY(-50%)';
        break;
      case 'left':
        base.top = r.top + r.height / 2;
        base.right = window.innerWidth - r.left + pad + gap;
        base.transform = 'translateY(-50%)';
        break;
    }
    return base;
  };

  const getArrowStyle = (): React.CSSProperties | null => {
    if (!hasTarget) return null;
    const base: React.CSSProperties = { position: 'absolute', width: 0, height: 0 };
    const a = 8;
    switch (pos) {
      case 'bottom': return { ...base, top: -a, left: '50%', transform: 'translateX(-50%)', borderLeft: `${a}px solid transparent`, borderRight: `${a}px solid transparent`, borderBottom: `${a}px solid hsl(222, 40%, 10%)` };
      case 'top':    return { ...base, bottom: -a, left: '50%', transform: 'translateX(-50%)', borderLeft: `${a}px solid transparent`, borderRight: `${a}px solid transparent`, borderTop: `${a}px solid hsl(222, 40%, 10%)` };
      case 'right':  return { ...base, left: -a, top: '50%', transform: 'translateY(-50%)', borderTop: `${a}px solid transparent`, borderBottom: `${a}px solid transparent`, borderRight: `${a}px solid hsl(222, 40%, 10%)` };
      case 'left':   return { ...base, right: -a, top: '50%', transform: 'translateY(-50%)', borderTop: `${a}px solid transparent`, borderBottom: `${a}px solid transparent`, borderLeft: `${a}px solid hsl(222, 40%, 10%)` };
    }
    return null;
  };

  const easing = `cubic-bezier(0.4, 0, 0.2, 1)`;

  return (
    <>
      {/* Dark overlay — SVG mask cutout travels with glow */}
      <svg
        onClick={handleDismiss}
        style={{ position: 'fixed', inset: 0, zIndex: 9998, cursor: 'default' }}
        width="100%" height="100%"
      >
        <defs>
          <mask id="ob-spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {sr && (
              <rect
                x={sr.x} y={sr.y} width={sr.w} height={sr.h}
                rx={sr.r} ry={sr.r} fill="black"
                style={{
                  transition: `x ${travelDuration}ms ${easing}, y ${travelDuration}ms ${easing}, width ${travelDuration}ms ${easing}, height ${travelDuration}ms ${easing}`,
                }}
              />
            )}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.7)" mask="url(#ob-spotlight-mask)" />
      </svg>

      {/* Glow ring — travels with CSS transition */}
      {sr && (
        <div style={{
          position: 'fixed',
          left: sr.x - 2, top: sr.y - 2,
          width: sr.w + 4, height: sr.h + 4,
          borderRadius: sr.r + 2,
          border: '1.5px solid rgba(59,130,246,0.55)',
          boxShadow: '0 0 0 3px rgba(59,130,246,0.1), 0 0 32px rgba(59,130,246,0.2)',
          zIndex: 9998, pointerEvents: 'none',
          transition: `left ${travelDuration}ms ${easing}, top ${travelDuration}ms ${easing}, width ${travelDuration}ms ${easing}, height ${travelDuration}ms ${easing}, border-radius ${travelDuration}ms ${easing}`,
        }} />
      )}

      {/* Tooltip — fades out instantly on step change, fades in after glow arrives */}
      <div style={{
        ...getTooltipStyle(),
        zIndex: 9999, width: 340,
        maxWidth: 'calc(100vw - 40px)',
        opacity: showContent ? 1 : 0,
        transform: `${getTooltipStyle().transform ?? ''} translateY(${showContent ? 0 : 8}px)`,
        transition: showContent
          ? 'opacity 0.25s ease, transform 0.25s ease'
          : 'opacity 0.12s ease, transform 0.12s ease',
        pointerEvents: showContent ? 'auto' : 'none',
      }}>
        {getArrowStyle() && <div style={getArrowStyle()!} />}

        <div style={{
          background: 'hsl(222, 40%, 10%)',
          borderRadius: 12, padding: '24px 24px 20px',
          border: '1px solid hsl(220, 20%, 18%)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
        }}>
          <button onClick={handleDismiss} style={{
            position: 'absolute', top: 12, right: 16,
            background: 'none', border: 'none',
            fontFamily: "'Inter', sans-serif", fontSize: '0.7rem',
            color: 'hsl(215, 15%, 35%)', cursor: 'pointer',
            padding: '4px 6px', letterSpacing: '0.03em',
          }}>Skip</button>

          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.65rem', fontWeight: 500,
            color: '#3b82f6', marginBottom: 10, letterSpacing: '0.08em',
          }}>
            {currentStep + 1} / {steps.length}
          </div>

          <h2 style={{
            fontFamily: "'Instrument Serif', serif",
            fontWeight: 400, fontSize: '1.2rem',
            color: '#f8fafc', margin: '0 0 8px',
            lineHeight: 1.25, paddingRight: 32,
          }}>
            {step.title}
          </h2>

          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.82rem', color: 'hsl(215, 15%, 55%)',
            lineHeight: 1.6, margin: '0 0 20px',
          }}>
            {step.description}
          </p>

          <div style={{
            height: 2, background: 'hsl(220, 20%, 14%)',
            borderRadius: 1, marginBottom: 16, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${((currentStep + 1) / steps.length) * 100}%`,
              background: '#3b82f6', borderRadius: 1,
              transition: 'width 0.35s ease',
            }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={handleBack} disabled={isFirst} style={{
              background: 'none', border: 'none',
              fontFamily: "'Inter', sans-serif", fontSize: '0.78rem',
              color: isFirst ? 'hsl(220, 20%, 20%)' : 'hsl(215, 15%, 45%)',
              cursor: isFirst ? 'default' : 'pointer',
              padding: '6px 0', fontWeight: 500,
            }}>Back</button>
            <button onClick={handleNext} style={{
              background: '#3b82f6', color: '#ffffff',
              border: 'none', borderRadius: 8, padding: '8px 20px',
              fontFamily: "'Inter', sans-serif", fontSize: '0.8rem',
              fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s',
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
      `}</style>
    </>
  );
}
