"use client"

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { toast } from "@/components/ui/use-toast";
import { testMicrophone } from '@/lib/microphone';
import { transcribeAndAnalyzeAudio } from '@/lib/gemini';
import SystemDesignCanvas, { DesignNode, DesignConnection } from '@/components/SystemDesignCanvas';
import OnboardingDialog from '@/components/OnboardingDialog';

const SD_ONBOARDING_STEPS = [
  {
    title: 'Drag components onto the canvas',
    description: 'This toolbar has Server, Database, Cache, and more. Drag any component onto the canvas below to start building your architecture.',
    target: '[data-onboarding="sd-palette"]',
    position: 'bottom' as const,
  },
  {
    title: 'Switch to Freehand mode',
    description: 'Toggle between the component canvas and freehand sketching. Pen, eraser, and clear tools appear when you switch to Freehand.',
    target: '[data-onboarding="sd-mode-toggle"]',
    position: 'bottom' as const,
  },
  {
    title: 'Record your explanation',
    description: 'Tap to record your voice for this step. Each of the 5 steps saves its own recording — explain your reasoning as you design.',
    target: '[data-onboarding="sd-record"]',
    position: 'bottom' as const,
  },
  {
    title: 'Follow the steps',
    description: 'Your progress through the 5 design steps is tracked here. Click any step to jump to it, or use "Next Step" in the top bar.',
    target: '[data-onboarding="sd-steps"]',
    position: 'right' as const,
  },
  {
    title: 'Watch the timer',
    description: 'The countdown keeps you honest — just like a real interview. Pause it if you need a break, then hit play to resume.',
    target: '[data-onboarding="sd-timer"]',
    position: 'bottom' as const,
  },
];

interface SystemDesignTest {
  problem: { title: string; description: string; requirements: string[]; constraints: string[]; estimatedTime: string; };
  guidance: { approach: string[]; keyComponents: string[]; scaleConsiderations: string[]; commonPitfalls: string[]; };
  evaluation: { criteria: Array<{ category: string; description: string; weight: number; }>; sampleSolution: { overview: string; architecture: string[]; technologies: string[]; tradeoffs: string[]; }; };
  tips: { timeManagement: string[]; communicationTips: string[]; drawingTips: string[]; };
}

const STEPS = [
  { id: 'requirements', title: 'Clarify Requirements', duration: 5 },
  { id: 'estimation', title: 'Estimate Scale', duration: 5 },
  { id: 'highlevel', title: 'High-Level Design', duration: 15 },
  { id: 'detailed', title: 'Detailed Design', duration: 15 },
  { id: 'scale', title: 'Scale & Performance', duration: 5 }
];

export default function SystemDesignTestPage() {
  const router = useRouter();
  const [testData, setTestData] = useState<SystemDesignTest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(45 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [instructionsWidth, setInstructionsWidth] = useState(320);
  const canvasNodesRef = useRef<{ nodes: DesignNode[]; connections: DesignConnection[] }>({ nodes: [], connections: [] });
  const [drawingMode, setDrawingMode] = useState<'components' | 'freehand'>('components');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingTool, setDrawingTool] = useState<'pen' | 'eraser'>('pen');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [stepExplanations, setStepExplanations] = useState<Record<string, string>>({
    requirements: '', estimation: '', highlevel: '', detailed: '', scale: ''
  });
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentStepData = STEPS[currentStep];

  useEffect(() => {
    const data = sessionStorage.getItem('systemDesignTest');
    if (data) { setTestData(JSON.parse(data)); } else { router.push('/system-design'); }
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeRemaining > 0) { interval = setInterval(() => setTimeRemaining(prev => prev - 1), 1000); }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeRemaining]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => { if (isResizing) setInstructionsWidth(Math.min(Math.max(240, e.clientX - 220), 480)); };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) { document.addEventListener('mousemove', handleMouseMove); document.addEventListener('mouseup', handleMouseUp); }
    return () => { document.removeEventListener('mousemove', handleMouseMove); document.removeEventListener('mouseup', handleMouseUp); };
  }, [isResizing]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current; if (!canvas) return; setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const cX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const cY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = ((cX - rect.left) / rect.width) * canvas.width;
    const y = ((cY - rect.top) / rect.height) * canvas.height;
    const ctx = canvas.getContext('2d'); if (ctx) { ctx.beginPath(); ctx.moveTo(x, y); }
  };
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return; const canvas = canvasRef.current; if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const cY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = ((cX - rect.left) / rect.width) * canvas.width;
    const y = ((cY - rect.top) / rect.height) * canvas.height;
    const ctx = canvas.getContext('2d');
    if (ctx) { ctx.lineWidth = drawingTool === 'pen' ? 2 : 20; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = drawingTool === 'pen' ? '#94a3b8' : '#131928'; ctx.globalCompositeOperation = drawingTool === 'pen' ? 'source-over' : 'destination-out'; ctx.lineTo(x, y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y); }
  };
  const stopDrawing = () => { setIsDrawing(false); const ctx = canvasRef.current?.getContext('2d'); if (ctx) ctx.beginPath(); };
  const clearCanvas = () => { const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (ctx) { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#131928'; ctx.fillRect(0, 0, canvas.width, canvas.height); } };

  useEffect(() => { const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (ctx) { ctx.fillStyle = '#131928'; ctx.fillRect(0, 0, canvas.width, canvas.height); } }, [testData]);

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) { toast({ title: "Browser Error", description: "Microphone not supported", variant: "destructive" }); return; }
      const micTest = await testMicrophone(); if (!micTest.success) { toast({ title: "Microphone Error", description: micTest.message, variant: "destructive" }); return; }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      mediaRecorderRef.current = recorder; audioChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = async () => { const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); await transcribeAudio(audioBlob); };
      recorder.start(); setIsRecording(true); toast({ title: "Recording started" });
    } catch { toast({ title: "Microphone Error", variant: "destructive" }); }
  };
  const stopRecording = () => { if (mediaRecorderRef.current) { mediaRecorderRef.current.stop(); setIsRecording(false); mediaRecorderRef.current.stream?.getTracks().forEach(t => t.stop()); } };
  const transcribeAudio = async (audioBlob: Blob) => {
    try { setIsTranscribing(true); const result = await transcribeAndAnalyzeAudio(audioBlob); if (result?.transcription) { setStepExplanations(prev => ({ ...prev, [currentStepData.id]: result.transcription })); toast({ title: "Transcription complete" }); } }
    catch { toast({ title: "Transcription Error", variant: "destructive" }); } finally { setIsTranscribing(false); }
  };
  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const handleStepComplete = () => { if (!completedSteps.includes(currentStep)) setCompletedSteps([...completedSteps, currentStep]); if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1); };
  const handleFinishTest = () => {
    sessionStorage.setItem('systemDesignResponses', JSON.stringify(stepExplanations));
    // Also store the design diagram data
    sessionStorage.setItem('systemDesignDiagram', JSON.stringify(canvasNodesRef.current));
    router.push('/system-design/final-results');
  };

  if (isLoading || !testData) {
    return (<ProtectedRoute><DashboardLayout><div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: 'hsl(215, 15%, 45%)', fontFamily: "'Inter', sans-serif" }}>Loading test...</p></div></DashboardLayout></ProtectedRoute>);
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <OnboardingDialog activityType="system_design" steps={SD_ONBOARDING_STEPS} />
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', userSelect: isResizing ? 'none' : 'auto', overflow: 'hidden' }}>
          {/* Top Bar */}
          <div style={{ padding: '10px 20px', borderBottom: '1px solid hsl(220, 20%, 18%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'hsl(222, 40%, 8%)', flexShrink: 0 }}>
            <div>
              <h1 style={{ color: '#f8fafc', fontSize: '0.95rem', fontWeight: 600, margin: 0, fontFamily: "'Inter', sans-serif" }}>{testData.problem.title}</h1>
              <p style={{ color: 'hsl(215, 15%, 45%)', fontSize: '0.78rem', marginTop: 2, fontFamily: "'Inter', sans-serif" }}>Step {currentStep + 1} of {STEPS.length} — {currentStepData.title}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Timer */}
              <div data-onboarding="sd-timer" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', padding: '7px 12px', borderRadius: 8, border: '1px solid hsl(220, 20%, 18%)' }}>
                <span style={{ color: timeRemaining < 300 ? '#3b82f6' : '#f8fafc', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', fontWeight: 500, letterSpacing: '0.05em' }}>{formatTime(timeRemaining)}</span>
                <button onClick={() => setIsTimerRunning(!isTimerRunning)} style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isTimerRunning ? <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><rect x="1" y="1" width="3" height="8" rx="0.5"/><rect x="6" y="1" width="3" height="8" rx="0.5"/></svg> : <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><polygon points="2,1 9,5 2,9"/></svg>}
                </button>
              </div>

              {/* Record button */}
              <button
                data-onboarding="sd-record"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isTranscribing}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 8,
                  background: isRecording ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isRecording ? 'rgba(59,130,246,0.35)' : 'hsl(220, 20%, 18%)'}`,
                  color: isRecording ? '#60a5fa' : 'hsl(215, 15%, 55%)',
                  cursor: isTranscribing ? 'not-allowed' : 'pointer',
                  fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', fontWeight: 500,
                  opacity: isTranscribing ? 0.5 : 1,
                  transition: 'all 0.15s',
                }}
              >
                {isRecording ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" opacity="0.3" /><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                )}
                {isTranscribing ? 'Transcribing...' : isRecording ? 'Stop' : `Record`}
                {stepExplanations[currentStepData.id] && !isRecording && (
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} />
                )}
              </button>

              {/* Next / Finish */}
              {currentStep < STEPS.length - 1 ? (
                <button onClick={handleStepComplete} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 8, fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer' }}>Next Step</button>
              ) : (
                <button onClick={handleFinishTest} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 8, fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer' }}>Finish Test</button>
              )}
            </div>
          </div>

          {/* Main */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Left Panel */}
            <div style={{ width: `${instructionsWidth}px`, minWidth: 240, maxWidth: 480, borderRight: '1px solid hsl(220, 20%, 18%)', background: 'hsl(222.2, 84%, 4.9%)', overflow: 'auto', flexShrink: 0 }}>
              <div style={{ padding: 20 }}>
                <div style={{ background: 'rgba(59,130,246,0.04)', borderRadius: 12, padding: 18, marginBottom: 16, border: '1px solid rgba(59,130,246,0.1)' }}>
                  <h3 style={{ fontFamily: "'Inter', sans-serif", color: '#3b82f6', fontSize: '0.7rem', fontWeight: 600, marginBottom: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Problem</h3>
                  <p style={{ fontFamily: "'Inter', sans-serif", color: 'hsl(215, 15%, 75%)', fontSize: '0.82rem', lineHeight: 1.65, marginBottom: 14 }}>{testData.problem.description}</p>
                  <h4 style={{ fontFamily: "'Inter', sans-serif", color: '#3b82f6', fontSize: '0.68rem', fontWeight: 600, marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Requirements</h4>
                  <ul style={{ margin: '0 0 14px 0', paddingLeft: 16 }}>{testData.problem.requirements.map((r, i) => <li key={i} style={{ fontFamily: "'Inter', sans-serif", color: '#94a3b8', fontSize: '0.78rem', marginBottom: 4, lineHeight: 1.5 }}>{r}</li>)}</ul>
                  <h4 style={{ fontFamily: "'Inter', sans-serif", color: 'hsl(215, 15%, 55%)', fontSize: '0.68rem', fontWeight: 600, marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Constraints</h4>
                  <ul style={{ margin: 0, paddingLeft: 16 }}>{testData.problem.constraints.map((c, i) => <li key={i} style={{ fontFamily: "'Inter', sans-serif", color: '#94a3b8', fontSize: '0.78rem', marginBottom: 4, lineHeight: 1.5 }}>{c}</li>)}</ul>
                </div>

                <div data-onboarding="sd-steps" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: 18, marginBottom: 16, border: '1px solid hsl(220, 20%, 18%)' }}>
                  <h3 style={{ fontFamily: "'Inter', sans-serif", color: 'hsl(215, 15%, 45%)', fontSize: '0.7rem', fontWeight: 600, marginBottom: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Progress</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {STEPS.map((step, index) => (
                      <div key={step.id} onClick={() => setCurrentStep(index)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', background: index === currentStep ? 'rgba(59,130,246,0.08)' : 'transparent', border: index === currentStep ? '1px solid rgba(59,130,246,0.15)' : '1px solid transparent', transition: 'all 0.15s' }}>
                        <div style={{ width: 20, height: 20, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontFamily: "'Inter', sans-serif", fontWeight: 600, background: completedSteps.includes(index) ? '#3b82f6' : 'transparent', border: completedSteps.includes(index) ? 'none' : '1.5px solid hsl(215, 15%, 35%)', color: completedSteps.includes(index) ? '#fff' : 'hsl(215, 15%, 45%)' }}>
                          {completedSteps.includes(index) ? <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> : index + 1}
                        </div>
                        <span style={{ flex: 1, fontFamily: "'Inter', sans-serif", color: index === currentStep ? '#f8fafc' : 'hsl(215, 15%, 55%)', fontSize: '0.78rem', fontWeight: index === currentStep ? 500 : 400 }}>{step.title}</span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'hsl(215, 15%, 35%)', fontSize: '0.68rem' }}>{step.duration}m</span>
                      </div>
                    ))}
                  </div>
                </div>

                {showInstructions ? (
                  <div style={{ background: 'rgba(59,130,246,0.04)', borderRadius: 12, padding: 18, border: '1px solid rgba(59,130,246,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <h3 style={{ fontFamily: "'Inter', sans-serif", color: 'hsl(215, 15%, 45%)', fontSize: '0.7rem', fontWeight: 600, margin: 0, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Guidance</h3>
                      <button onClick={() => setShowInstructions(false)} style={{ background: 'none', border: 'none', color: 'hsl(215, 15%, 35%)', cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontSize: '0.72rem' }}>Hide</button>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 16 }}>{testData.guidance.approach.map((t, i) => <li key={i} style={{ fontFamily: "'Inter', sans-serif", color: '#94a3b8', fontSize: '0.78rem', marginBottom: 6, lineHeight: 1.55 }}>{t}</li>)}</ul>
                  </div>
                ) : (
                  <button onClick={() => setShowInstructions(true)} style={{ width: '100%', padding: 10, background: 'transparent', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 8, color: '#3b82f6', cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem' }}>Show Guidance</button>
                )}
              </div>
            </div>

            {/* Resize Handle */}
            <div ref={resizeRef} onMouseDown={() => setIsResizing(true)} style={{ width: 5, cursor: 'col-resize', flexShrink: 0, background: isResizing ? 'rgba(59,130,246,0.4)' : 'transparent', transition: 'background 0.15s' }} onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(59,130,246,0.2)')} onMouseLeave={(e) => !isResizing && (e.currentTarget.style.background = 'transparent')} />

            {/* Canvas */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              {/* Mode toggle toolbar */}
              <div data-onboarding="sd-mode-toggle" style={{ padding: '5px 16px', borderBottom: '1px solid hsl(220, 20%, 18%)', display: 'flex', alignItems: 'center', gap: 4, background: 'hsl(222, 40%, 8%)' }}>
                <button onClick={() => setDrawingMode('components')} style={{ padding: '6px 14px', borderRadius: 6, background: drawingMode === 'components' ? '#3b82f6' : 'transparent', color: drawingMode === 'components' ? '#fff' : 'hsl(215, 15%, 55%)', cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontSize: '0.76rem', fontWeight: 500, border: 'none' }}>Components</button>
                <button onClick={() => setDrawingMode('freehand')} style={{ padding: '6px 14px', borderRadius: 6, background: drawingMode === 'freehand' ? '#3b82f6' : 'transparent', color: drawingMode === 'freehand' ? '#fff' : 'hsl(215, 15%, 55%)', cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontSize: '0.76rem', fontWeight: 500, border: 'none' }}>Freehand</button>
                {drawingMode === 'freehand' && (
                  <>
                    <div style={{ width: 1, height: 18, background: 'hsl(220, 20%, 18%)', margin: '0 4px' }} />
                    {/* Pen icon */}
                    <button onClick={() => setDrawingTool('pen')} title="Pen" style={{ width: 32, height: 32, borderRadius: 6, background: drawingTool === 'pen' ? 'rgba(59,130,246,0.15)' : 'transparent', color: drawingTool === 'pen' ? '#60a5fa' : 'hsl(215, 15%, 55%)', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    </button>
                    {/* Eraser icon */}
                    <button onClick={() => setDrawingTool('eraser')} title="Eraser" style={{ width: 32, height: 32, borderRadius: 6, background: drawingTool === 'eraser' ? 'rgba(59,130,246,0.15)' : 'transparent', color: drawingTool === 'eraser' ? '#60a5fa' : 'hsl(215, 15%, 55%)', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>
                    </button>
                    {/* Clear icon */}
                    <button onClick={clearCanvas} title="Clear canvas" style={{ width: 32, height: 32, borderRadius: 6, background: 'transparent', color: 'hsl(215, 15%, 55%)', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </>
                )}
              </div>

              {/* Draggable component canvas (default) */}
              {drawingMode === 'components' && (
                <SystemDesignCanvas
                  onNodesChange={(nodes, connections) => {
                    canvasNodesRef.current = { nodes, connections };
                  }}
                />
              )}

              {/* Freehand drawing canvas (fallback) */}
              {drawingMode === 'freehand' && (
                <div style={{ flex: 1, padding: 12, background: 'hsl(222.2, 84%, 4.9%)' }}>
                  <div style={{ height: '100%', background: 'hsl(222, 40%, 8%)', borderRadius: 10, border: '1px solid hsl(220, 20%, 18%)', overflow: 'hidden' }}>
                    <canvas ref={canvasRef} width={1200} height={800} style={{ width: '100%', height: '100%', cursor: drawingTool === 'pen' ? 'crosshair' : 'cell', touchAction: 'none' }} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={(e) => { e.preventDefault(); startDrawing(e); }} onTouchMove={(e) => { e.preventDefault(); draw(e); }} onTouchEnd={(e) => { e.preventDefault(); stopDrawing(); }} />
                  </div>
                </div>
              )}
            </div>


          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
