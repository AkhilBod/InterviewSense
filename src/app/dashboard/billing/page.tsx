'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function BillingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleManageBilling = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();

      if (data.error) {
        alert(data.error);
        setLoading(false);
        return;
      }

      if (data.url) {
        router.push(data.url);
      }
    } catch (error) {
      console.error('Portal error:', error);
      alert('Failed to open billing portal. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Billing & Subscription</h1>

      <div className="max-w-2xl">
        <div
          className="p-6 rounded-lg mb-6"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(29,100,255,0.2)',
          }}
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
        </div>
      </div>
    </div>
  );
}
