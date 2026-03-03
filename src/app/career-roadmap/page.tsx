"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CareerRoadmapLoadingModal from '@/components/CareerRoadmapLoadingModal';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useProfileData } from '@/hooks/useProfileData';

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

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  padding: '12px 14px',
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.88rem',
  color: '#dde2f0',
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.68rem',
  fontWeight: 600,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#8892b0',
  marginBottom: 7,
};

export default function CareerRoadmapPage() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfileData();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [careerGoal, setCareerGoal] = useState('');
  const [challenges, setChallenges] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    if (!careerGoal) {
      setError("Please provide your career goal.");
      setIsLoading(false);
      return;
    }
    
    try {
      const submissionData = {
        currentRole: profile?.targetRole || 'Software Engineer',
        careerGoal,
        challenges,
        timeline: '',
        experienceLevel: '',
        skills: [],
        priorities: [],
      };
      
      const response = await fetch('/api/career-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate career roadmap');
      }

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('careerRoadmapResults', JSON.stringify(data));
        setTimeout(() => { router.push('/career-roadmap/results'); }, 100);
      } else {
        throw new Error(data.error || 'Failed to generate career roadmap');
      }
    } catch (error) {
      console.error('Career roadmap generation error:', error);
      setError("Failed to generate career roadmap. Please try again.");
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
            Career Roadmap
          </h1>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.88rem',
            color: '#5a6380',
            marginBottom: 36,
            marginTop: 0,
          }}>
            Chart your path from where you are to where you want to be.
          </p>

          {/* Profile context note */}
          {(profile?.targetRole || profile?.targetCompany) && (
            <div style={{
              borderRadius: 8,
              background: 'rgba(59,130,246,0.06)',
              border: '1px solid rgba(59,130,246,0.15)',
              padding: '9px 14px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.8rem',
              color: '#7da8d4',
              marginBottom: 24,
            }}>
              Building roadmap for{' '}
              {profile?.targetRole && <span style={{ color: '#a8c8ea', fontWeight: 500 }}>{profile.targetRole}</span>}
              {profile?.targetRole && profile?.targetCompany && ' at '}
              {profile?.targetCompany && <span style={{ color: '#a8c8ea', fontWeight: 500 }}>{profile.targetCompany}</span>}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Career Goal */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Dream Role / Career Goal</label>
              <input
                type="text"
                placeholder="e.g., Senior Software Engineer, Tech Lead, CTO…"
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                required
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Challenges */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>
                Current Challenges <span style={{ color: '#4a5370', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
              </label>
              <textarea
                placeholder="What obstacles are you facing in your career journey?"
                value={challenges}
                onChange={(e) => setChallenges(e.target.value)}
                rows={4}
                style={{
                  ...inputStyle,
                  resize: 'vertical',
                  minHeight: 100,
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
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
              disabled={isLoading || !careerGoal}
              style={{
                width: '100%',
                marginTop: 32,
                padding: 14,
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.88rem',
                fontWeight: 500,
                cursor: (isLoading || !careerGoal) ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 20px rgba(37,99,235,0.3)',
                opacity: (isLoading || !careerGoal) ? 0.5 : 1,
                transition: 'opacity 0.2s, transform 0.15s',
              }}
              onMouseEnter={e => { if (!isLoading && careerGoal) { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={e => { e.currentTarget.style.opacity = (isLoading || !careerGoal) ? '0.5' : '1'; e.currentTarget.style.transform = 'none'; }}
            >
              {isLoading ? 'Creating Roadmap…' : 'Create Career Roadmap'}
            </button>
          </form>
        </div>
      </div>

      <CareerRoadmapLoadingModal
        isOpen={isLoading}
        onClose={() => {}}
      />
    </DashboardLayout>
  );
}

