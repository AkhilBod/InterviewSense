'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'loading' | 'ready' | 'done' | 'already' | 'error'>('loading');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    fetch(`/api/unsubscribe?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setStatus('error'); return; }
        setEmail(data.email);
        setStatus(data.alreadyUnsubscribed ? 'already' : 'ready');
      })
      .catch(() => setStatus('error'));
  }, [token]);

  const handleUnsubscribe = async () => {
    setSubmitting(true);
    const res = await fetch('/api/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    setStatus(data.success ? 'done' : 'error');
    setSubmitting(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0c0c10', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .unsub-card { animation: fadeUp 0.45s ease; }
      `}</style>

      {/* Aurora */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(1,87,255,0.13), transparent 50%), radial-gradient(ellipse 60% 80% at 100% 50%, rgba(46,157,255,0.1), transparent 50%)', pointerEvents: 'none' }} />

      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40, textDecoration: 'none', position: 'relative', zIndex: 1 }}>
        <Image src="https://i.ibb.co/hJC8n6NB/Generated-Image-February-20-2026-7-04-PM-Photoroom.png" alt="InterviewSense" width={32} height={32} style={{ objectFit: 'contain' }} />
        <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 600, color: 'white' }}>InterviewSense</span>
      </Link>

      {/* Card */}
      <div className="unsub-card" style={{ width: '100%', maxWidth: 440, background: '#13131a', border: '1px solid #252533', borderRadius: 16, padding: '40px 36px', position: 'relative', zIndex: 1 }}>

        {status === 'loading' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #252533', borderTopColor: '#3B82F6', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#6b6b88' }}>Loading...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {status === 'ready' && (
          <>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: '#eeeef5', marginBottom: 8 }}>
              Unsubscribe from emails
            </h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#6b6b88', marginBottom: 20, lineHeight: 1.6 }}>
              You are about to unsubscribe the following address from InterviewSense marketing and re-engagement emails.
            </p>

            {/* Email pill */}
            <div style={{ background: '#1a1a24', border: '1px solid #252533', borderRadius: 8, padding: '10px 14px', marginBottom: 24, fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#aaaac0' }}>
              {email}
            </div>

            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#6b6b88', marginBottom: 28, lineHeight: 1.6 }}>
              You will still receive important account and billing emails. This only removes you from practice reminders and promotional emails.
            </p>

            <button
              onClick={handleUnsubscribe}
              disabled={submitting}
              style={{ width: '100%', padding: '11px 0', borderRadius: 9, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500, cursor: submitting ? 'not-allowed' : 'pointer', marginBottom: 12, opacity: submitting ? 0.6 : 1, transition: 'all 0.2s' }}
            >
              {submitting ? 'Unsubscribing...' : 'Unsubscribe'}
            </button>

            <Link href="/dashboard" style={{ display: 'block', textAlign: 'center', fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#6b6b88', textDecoration: 'none' }}>
              Never mind, take me back
            </Link>
          </>
        )}

        {status === 'done' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 22, color: '#22c55e' }}>&#10003;</div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, color: '#eeeef5', marginBottom: 10 }}>You have been unsubscribed</h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#6b6b88', lineHeight: 1.6, marginBottom: 28 }}>
              You will no longer receive marketing emails from InterviewSense. If this was a mistake, you can re-enable emails from your account settings.
            </p>
            <Link href="/dashboard" style={{ display: 'inline-block', padding: '10px 28px', borderRadius: 9999, background: '#3B82F6', color: 'white', fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
              Go to dashboard
            </Link>
          </div>
        )}

        {status === 'already' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 22, color: '#3B82F6' }}>&#10003;</div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, color: '#eeeef5', marginBottom: 10 }}>Already unsubscribed</h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#6b6b88', lineHeight: 1.6 }}>
              {email} is already unsubscribed from marketing emails.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, color: '#eeeef5', marginBottom: 10 }}>Invalid link</h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#6b6b88', lineHeight: 1.6 }}>
              This unsubscribe link is invalid or has expired. Reply to any email from us and we will remove you manually.
            </p>
          </div>
        )}
      </div>

      <p style={{ marginTop: 24, fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#6b6b88', position: 'relative', zIndex: 1 }}>
        &copy; {new Date().getFullYear()} InterviewSense
      </p>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense>
      <UnsubscribeContent />
    </Suspense>
  );
}
