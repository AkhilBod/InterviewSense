"use client"

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';

interface PortfolioAnalysis {
  overallScore: number;
  overallFeedback: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  portfolioAnalysis: {
    designScore: number;
    designFeedback: string;
    contentScore: number;
    contentFeedback: string;
  };
  projectAnalysis: Array<{
    name: string;
    score: number;
    feedback: string;
    techStack: string[];
    highlights: string[];
    improvements: string[];
  }>;
  technicalSkills: {
    score: number;
    feedback: string;
    strengths: string[];
    gaps: string[];
  };
  roleAlignment: {
    score: number;
    feedback: string;
    missingSkills: string[];
    relevantProjects: string[];
  };
}

interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  url: string;
  topics: string[];
}

interface ResultsData {
  success: boolean;
  analysis: PortfolioAnalysis;
  repos: GitHubRepo[];
}

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Inter:wght@400;500;600&display=swap');
`;

export default function PortfolioResultsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [results, setResults] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedResults = sessionStorage.getItem('portfolioReviewResults');
    if (storedResults) {
      try {
        const parsedResults = JSON.parse(storedResults);
        setResults(parsedResults);
      } catch (error) {
        console.error('Error parsing results:', error);
        router.push('/portfolio-review');
      }
    } else {
      router.push('/portfolio-review');
    }
    setLoading(false);
  }, [router]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#eab308';
    return '#ef4444';
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#94a3b8' }}>Loading results...</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!results) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
            <p style={{ color: '#94a3b8' }}>No results found</p>
            <Link href="/portfolio-review" style={{ color: '#3b82f6', textDecoration: 'underline' }}>Go Back</Link>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const { analysis, repos } = results;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <style>{pageStyles}</style>
        <div style={{ minHeight: '100vh', padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: 40 }}>
            <h1 style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
              fontWeight: 400,
              color: '#e2e8f0',
              marginBottom: 8,
            }}>
              Portfolio Analysis
            </h1>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.9rem',
              color: '#64748b',
            }}>
              Comprehensive review of your portfolio and projects
            </p>
          </div>

          {/* Score Overview */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 20,
            marginBottom: 40,
          }}>
            {/* Overall Score */}
            <div style={{
              background: 'rgba(59, 130, 246, 0.06)',
              border: '1px solid rgba(59, 130, 246, 0.12)',
              borderRadius: 16,
              padding: 28,
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: '3rem',
                fontWeight: 700,
                fontFamily: "'Inter', sans-serif",
                color: getScoreColor(analysis.overallScore),
                lineHeight: 1,
                marginBottom: 8,
              }}>
                {analysis.overallScore}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Overall Score
              </div>
            </div>

            {/* Design */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 16,
              padding: 28,
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                color: getScoreColor(analysis.portfolioAnalysis.designScore),
                lineHeight: 1,
                marginBottom: 8,
              }}>
                {analysis.portfolioAnalysis.designScore}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Design
              </div>
            </div>

            {/* Technical */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 16,
              padding: 28,
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                color: getScoreColor(analysis.technicalSkills.score),
                lineHeight: 1,
                marginBottom: 8,
              }}>
                {analysis.technicalSkills.score}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Technical
              </div>
            </div>

            {/* Content */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 16,
              padding: 28,
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                color: getScoreColor(analysis.portfolioAnalysis.contentScore),
                lineHeight: 1,
                marginBottom: 8,
              }}>
                {analysis.portfolioAnalysis.contentScore}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Content
              </div>
            </div>
          </div>

          {/* Summary */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 16,
            padding: 28,
            marginBottom: 32,
          }}>
            <h2 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#64748b',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}>
              Summary
            </h2>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.95rem',
              color: '#cbd5e1',
              lineHeight: 1.7,
            }}>
              {analysis.overallFeedback}
            </p>
          </div>

          {/* Strengths & Improvements */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 32 }}>
            {/* Strengths */}
            <div style={{
              background: 'rgba(34, 197, 94, 0.04)',
              border: '1px solid rgba(34, 197, 94, 0.12)',
              borderRadius: 16,
              padding: 28,
            }}>
              <h2 style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#22c55e',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 20,
              }}>
                Strengths
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {analysis.strengths.map((strength, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginTop: 8, flexShrink: 0 }} />
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                      {strength}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Areas for Improvement */}
            <div style={{
              background: 'rgba(234, 179, 8, 0.04)',
              border: '1px solid rgba(234, 179, 8, 0.12)',
              borderRadius: 16,
              padding: 28,
            }}>
              <h2 style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#eab308',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 20,
              }}>
                Areas for Improvement
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {analysis.weaknesses.map((weakness, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#eab308', marginTop: 8, flexShrink: 0 }} />
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                      {weakness}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Project Analysis */}
          {analysis.projectAnalysis && analysis.projectAnalysis.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h2 style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#64748b',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 20,
              }}>
                Project Analysis
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {analysis.projectAnalysis.map((project, index) => (
                  <div key={index} style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 16,
                    padding: 24,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <h3 style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        color: '#e2e8f0',
                      }}>
                        {project.name}
                      </h3>
                      <span style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: getScoreColor(project.score),
                      }}>
                        {project.score}
                      </span>
                    </div>
                    <p style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.9rem',
                      color: '#94a3b8',
                      lineHeight: 1.6,
                      marginBottom: 16,
                    }}>
                      {project.feedback}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {project.techStack.map((tech, techIndex) => (
                        <span key={techIndex} style={{
                          background: 'rgba(59, 130, 246, 0.1)',
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                          borderRadius: 6,
                          padding: '4px 10px',
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '0.75rem',
                          color: '#93c5fd',
                        }}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.04)',
            border: '1px solid rgba(59, 130, 246, 0.12)',
            borderRadius: 16,
            padding: 28,
            marginBottom: 32,
          }}>
            <h2 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#3b82f6',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 20,
            }}>
              Recommendations
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {analysis.recommendations.map((recommendation, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <span style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'rgba(59, 130, 246, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#3b82f6',
                    flexShrink: 0,
                  }}>
                    {index + 1}
                  </span>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                    {recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* GitHub Repositories */}
          {repos && repos.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h2 style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#64748b',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 20,
              }}>
                Repositories
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {repos.map((repo, index) => (
                  <a 
                    key={index} 
                    href={repo.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: 12,
                      padding: 20,
                      textDecoration: 'none',
                      transition: 'border-color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)')}
                  >
                    <h3 style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: '#e2e8f0',
                      marginBottom: 8,
                    }}>
                      {repo.name}
                    </h3>
                    <p style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.82rem',
                      color: '#64748b',
                      lineHeight: 1.5,
                      marginBottom: 12,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {repo.description || 'No description'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {repo.language && (
                        <span style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '0.75rem',
                          color: '#94a3b8',
                        }}>
                          {repo.language}
                        </span>
                      )}
                      {repo.stars > 0 && (
                        <span style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '0.75rem',
                          color: '#94a3b8',
                        }}>
                          ★ {repo.stars}
                        </span>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 48 }}>
            <Link
              href="/portfolio-review"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 24px',
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.9rem',
                fontWeight: 500,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
              }}
            >
              Review Another Portfolio
            </Link>
            <Link
              href="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 24px',
                background: 'transparent',
                color: '#94a3b8',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 10,
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.9rem',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 