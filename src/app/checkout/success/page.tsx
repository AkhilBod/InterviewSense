'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status !== 'authenticated') return;

    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setError('Invalid checkout session');
      setVerifying(false);
      return;
    }

    // Verify the checkout session with our backend
    fetch('/api/stripe/verify-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // Successfully verified, replace history to prevent back navigation
          router.replace('/onboarding?from=checkout');
        } else {
          setError(data.error || 'Failed to verify checkout');
          setVerifying(false);
        }
      })
      .catch((err) => {
        console.error('Verification error:', err);
        setError('Failed to verify checkout');
        setVerifying(false);
      });
  }, [status, searchParams, router]);

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#0a0a0f', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '20px',
      }}>
        <div style={{ 
          textAlign: 'center', 
          maxWidth: '500px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '32px',
        }}>
          <h1 style={{ color: '#ef4444', fontSize: '24px', marginBottom: '16px' }}>
            Checkout Error
          </h1>
          <p style={{ color: '#cbd5e1', marginBottom: '24px' }}>{error}</p>
          <button
            onClick={() => router.push('/pricing')}
            style={{
              background: '#2563eb',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            Back to Pricing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0a0a0f', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid rgba(37, 99, 235, 0.2)',
        borderTopColor: '#2563eb',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ 
        color: '#cbd5e1', 
        marginTop: '20px',
        fontSize: '16px',
      }}>
        Verifying your subscription...
      </p>
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function CheckoutSuccess() {
  return (
    <Suspense fallback={
      <div style={{ 
        minHeight: '100vh', 
        background: '#0a0a0f', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '20px',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(37, 99, 235, 0.2)',
          borderTopColor: '#2563eb',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

