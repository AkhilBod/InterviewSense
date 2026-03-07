'use client';

import { Suspense } from 'react';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';

function BehavioralInterviewPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'hsl(222.2, 84%, 4.9%)' }}>
        <div style={{ width: 32, height: 32, border: '2px solid transparent', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Inter:wght@400;500;600&display=swap');`}</style>
        <main style={{ flex: 1, overflowY: 'auto', background: 'hsl(222.2, 84%, 4.9%)', position: 'relative' }}>
          {/* Aurora glow */}
          <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '80vw', height: 340, background: 'radial-gradient(ellipse at bottom center, rgba(37,99,235,0.13) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: 520, margin: '0 auto', padding: '80px 24px 60px' }}>
            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', color: '#f8fafc', margin: 0, lineHeight: 1.15 }}>
              Behavioral Interview
            </h1>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', color: 'hsl(215, 15%, 55%)', marginTop: 8, marginBottom: 48 }}>
              Practice answering behavioral interview questions with AI-powered feedback.
            </p>

            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', color: 'hsl(215, 15%, 40%)' }}>
                Behavioral questions feature is coming soon.
              </p>
            </div>
          </div>
        </main>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default function BehavioralInterviewPageWithSuspense() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'hsl(222.2, 84%, 4.9%)' }}>
        <div style={{ width: 32, height: 32, border: '2px solid transparent', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <BehavioralInterviewPage />
    </Suspense>
  );
}
