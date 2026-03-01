"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ToggleGroup } from '@/components/ProfileFormComponents';

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Inter:wght@400;500;600&display=swap');
  body::after {
    content: '';
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80vw;
    height: 340px;
    background: radial-gradient(ellipse at bottom center, rgba(37,99,235,0.13) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }
`;

export default function SystemDesignPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testDifficulty, setTestDifficulty] = useState('medium');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/system-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experienceLevel: 'mid',
          testDifficulty,
          targetCompany: 'general',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate system design test');
      }

      sessionStorage.setItem('systemDesignTest', JSON.stringify(result.data));
      router.push('/system-design/results');
    } catch (error) {
      console.error('System design generation error:', error);
      setError("Failed to generate system design test. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <style>{pageStyles}</style>
      <div style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '52px 24px',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ width: '100%', maxWidth: 560 }}>
          <h1 style={{
            fontFamily: "'Instrument Serif', serif",
            fontWeight: 400,
            fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
            color: '#dde2f0',
            marginBottom: 8,
            marginTop: 0,
          }}>
            System Design
          </h1>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.88rem',
            color: '#5a6380',
            marginBottom: 36,
            marginTop: 0,
          }}>
            Real-world architecture problems with AI evaluation.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Difficulty */}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.68rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase' as const,
                color: '#8892b0',
                marginBottom: 7,
              }}>
                Difficulty
              </label>
              <ToggleGroup
                options={[
                  { label: 'Easy', value: 'easy' },
                  { label: 'Medium', value: 'medium' },
                  { label: 'Hard', value: 'hard' },
                ]}
                value={testDifficulty}
                onChange={setTestDifficulty}
              />
            </div>

            {error && (
              <div style={{
                borderRadius: 8,
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#fca5a5',
                padding: '10px 14px',
                fontSize: '0.82rem',
                fontFamily: "'Inter', sans-serif",
                marginBottom: 16,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                marginTop: 32,
                padding: 14,
                background: 'linear-gradient(135deg, #1d4ed8, #4338ca)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.88rem',
                fontWeight: 500,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 20px rgba(37,99,235,0.3)',
                opacity: isLoading ? 0.5 : 1,
                transition: 'opacity 0.2s, transform 0.15s',
              }}
              onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={e => { e.currentTarget.style.opacity = isLoading ? '0.5' : '1'; e.currentTarget.style.transform = 'none'; }}
            >
              {isLoading ? 'Preparing Test…' : 'Start System Design Test'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}