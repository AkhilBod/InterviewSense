'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface SubscriptionData {
  plan: string;
  status: string;
  trialDaysRemaining: number;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export default function BillingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);

  useEffect(() => {
    fetch('/api/subscription-status')
      .then(r => r.json())
      .then(data => {
        if (data.subscription) setSubscription(data.subscription);
      })
      .catch(() => {});
  }, []);

  const handleManageBilling = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.error) { alert(data.error); setLoading(false); return; }
      if (data.url) router.push(data.url);
    } catch (error) {
      console.error('Portal error:', error);
      alert('Failed to open billing portal. Please try again.');
      setLoading(false);
    }
  };

  const handleCancelConfirm = async () => {
    setCancelLoading(true);
    try {
      const res = await fetch('/api/subscription/cancel', { method: 'POST' });
      const data = await res.json();
      if (data.error) { alert(data.error); setCancelLoading(false); return; }
      setShowConfirm(false);
      setSubscription(prev => prev ? { ...prev, cancelAtPeriodEnd: true } : prev);
    } catch (error) {
      console.error('Cancel error:', error);
      alert('Failed to cancel. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  const daysRemaining = (() => {
    if (!subscription) return 0;
    if (subscription.status === 'TRIALING') return subscription.trialDaysRemaining;
    if (subscription.currentPeriodEnd) {
      const diff = new Date(subscription.currentPeriodEnd).getTime() - Date.now();
      return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }
    return 0;
  })();

  const isActive = subscription && (subscription.status === 'ACTIVE' || subscription.status === 'TRIALING');
  const alreadyCanceled = subscription?.cancelAtPeriodEnd;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Billing & Subscription</h1>

      <div className="max-w-2xl">
        <div
          className="p-6 rounded-lg mb-6"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(29,100,255,0.2)' }}
        >
          <h2 className="text-xl font-semibold mb-4">Manage Your Subscription</h2>
          <p className="mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Update payment method, view invoices, or cancel your subscription.
          </p>

          <Button
            onClick={handleManageBilling}
            disabled={loading}
            style={{ background: '#1877f2' }}
          >
            {loading ? 'Loading...' : 'Manage Billing'}
          </Button>

          {isActive && !alreadyCanceled && (
            <button
              onClick={() => setShowConfirm(true)}
              className="mt-4 block text-sm"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              Cancel subscription
            </button>
          )}

          {alreadyCanceled && (
            <p className="mt-4 text-sm" style={{ color: 'rgba(255,165,0,0.8)' }}>
              Your subscription is set to cancel at the end of the current billing period.
            </p>
          )}

          <p className="mt-4 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            You can cancel your subscription at any time. Your access continues until the end of your current billing period.
          </p>
        </div>
      </div>

      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="rounded-xl p-8 max-w-md w-full mx-4"
            style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-2 text-white">Are you sure you want to cancel?</h2>

            {daysRemaining > 0 && (
              <p className="mb-4 text-sm" style={{ color: 'rgba(255,165,0,0.9)' }}>
                You still have <strong>{daysRemaining} day{daysRemaining !== 1 ? 's' : ''}</strong> remaining on your current plan.
              </p>
            )}

            <p className="mb-3 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              You will lose access to:
            </p>
            <ul className="mb-6 space-y-2">
              {[
                'Unlimited mock interviews',
                'AI-powered feedback on every session',
                'Technical and behavioral interview prep',
                'Resume review and analysis',
                'Progress tracking and performance history',
              ].map(feature => (
                <li key={feature} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  <span style={{ color: '#ef4444', marginTop: 2 }}>&#x2715;</span>
                  {feature}
                </li>
              ))}
            </ul>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2 rounded-lg text-sm font-medium"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'white' }}
              >
                Keep my plan
              </button>
              <button
                onClick={handleCancelConfirm}
                disabled={cancelLoading}
                className="flex-1 py-2 rounded-lg text-sm font-medium"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
              >
                {cancelLoading ? 'Canceling...' : 'Yes, cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
