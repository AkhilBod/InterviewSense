"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PortfolioAnalysisLoadingModal from '@/components/PortfolioAnalysisLoadingModal';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PrefilledChip } from '@/components/ProfileFormComponents';
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

export default function PortfolioReviewPage() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfileData();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [overridingRole, setOverridingRole] = useState(false);

  const [portfolioData, setPortfolioData] = useState({
    portfolioUrl: '',
    githubUrl: '',
    targetRole: '',
  });

  useEffect(() => {
    if (profile?.targetRole) {
      setPortfolioData(prev => ({ ...prev, targetRole: profile.targetRole! }));
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    if (!portfolioData.portfolioUrl || !portfolioData.targetRole) {
      setError("Please provide your portfolio URL.");
      setIsLoading(false);
      return;
    }
    
    try {
      setShowLoadingModal(true);
      
      const response = await fetch('/api/portfolio-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(portfolioData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to analyze portfolio');
      }

      sessionStorage.setItem('portfolioReviewResults', JSON.stringify(result));
      setShowLoadingModal(false);
      router.push('/portfolio-review/results');
    } catch (error) {
      console.error('Portfolio review error:', error);
      setError("Failed to analyze portfolio. Please try again.");
      setShowLoadingModal(false);
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
            Portfolio Review
          </h1>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.88rem',
            color: '#5a6380',
            marginBottom: 36,
            marginTop: 0,
          }}>
            Professional feedback on your projects and code quality.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Portfolio URL */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>
                Portfolio URL
              </label>
              <input
                type="url"
                placeholder="https://yourportfolio.com"
                value={portfolioData.portfolioUrl}
                onChange={(e) => setPortfolioData(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                required
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>

            {/* GitHub URL */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>
                GitHub Profile <span style={{ color: '#4a5370', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
              </label>
              <input
                type="url"
                placeholder="https://github.com/yourusername"
                value={portfolioData.githubUrl}
                onChange={(e) => setPortfolioData(prev => ({ ...prev, githubUrl: e.target.value }))}
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Target Role */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Target Role</label>
              {profile?.targetRole && !overridingRole ? (
                <PrefilledChip
                  label="From profile"
                  value={profile.targetRole}
                  onChangeRequest={() => setOverridingRole(true)}
                />
              ) : (
                <input
                  type="text"
                  placeholder="e.g., Software Engineer, Frontend Developer"
                  value={portfolioData.targetRole}
                  onChange={(e) => setPortfolioData(prev => ({ ...prev, targetRole: e.target.value }))}
                  autoFocus={overridingRole}
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              )}
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
              disabled={isLoading || !portfolioData.portfolioUrl}
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
                cursor: (isLoading || !portfolioData.portfolioUrl) ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 20px rgba(37,99,235,0.3)',
                opacity: (isLoading || !portfolioData.portfolioUrl) ? 0.5 : 1,
                transition: 'opacity 0.2s, transform 0.15s',
              }}
              onMouseEnter={e => { if (!isLoading && portfolioData.portfolioUrl) { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={e => { e.currentTarget.style.opacity = (isLoading || !portfolioData.portfolioUrl) ? '0.5' : '1'; e.currentTarget.style.transform = 'none'; }}
            >
              {isLoading ? 'Analyzing Portfolio…' : 'Get Portfolio Review'}
            </button>
          </form>
        </div>
      </div>

      <PortfolioAnalysisLoadingModal
        isOpen={showLoadingModal}
        onClose={() => {}}
      />
    </DashboardLayout>
  );
}

