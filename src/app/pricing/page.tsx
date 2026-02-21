'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

const plans = [
  {
    name: 'Monthly',
    price: 25,
    priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID,
    interval: 'month',
    features: [
      'Access to all questions, problems, and quizzes',
      'Interview video guides',
      'Advanced filtering and question playlists',
      '5% off all coaching services',
      'Insider community access',
    ],
  },
  {
    name: 'Annual',
    price: 199,
    priceId: process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID,
    interval: 'year',
    savings: '33%',
    features: [
      'Access to all questions, problems, and quizzes',
      'Interview video guides',
      'Advanced filtering and question playlists',
      '15% off all coaching services',
      'Premium community with working professionals',
    ],
    highlighted: true,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string | undefined, planName: string) => {
    if (!priceId) {
      alert('Price ID not configured. Please set environment variables.');
      return;
    }

    setLoading(planName);

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        setLoading(null);
        return;
      }

      if (data.url) {
        router.push(data.url);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
      setLoading(null);
    }
  };

  return (
    <div
      className="min-h-screen bg-black text-white py-24 px-4"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Pricing</h1>
          <p className="text-xl" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Unlock advanced filtering, hundreds of premium questions, video interview guides,
            and exclusive insider community access.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="p-8 rounded-2xl relative"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: plan.highlighted
                  ? '2px solid #1877f2'
                  : '1px solid rgba(29,100,255,0.2)',
              }}
            >
              {plan.highlighted && (
                <div
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2
                              px-4 py-1 rounded-full text-sm font-semibold"
                  style={{ background: '#1877f2', color: 'white' }}
                >
                  Best Value
                </div>
              )}

              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-bold">${plan.price}</span>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>/{plan.interval}</span>
                {plan.savings && (
                  <span
                    className="ml-2 px-2 py-1 rounded text-sm font-semibold"
                    style={{ background: 'rgba(34,197,94,0.2)', color: '#22c55e' }}
                  >
                    Save {plan.savings}
                  </span>
                )}
              </div>

              <Button
                onClick={() => handleSubscribe(plan.priceId, plan.name)}
                disabled={loading === plan.name}
                className="w-full mb-6 text-lg py-6"
                style={{
                  background: plan.highlighted ? '#1877f2' : 'rgba(24,119,242,0.15)',
                  color: plan.highlighted ? 'white' : '#1877f2',
                }}
              >
                {loading === plan.name ? 'Loading...' : 'Try 3-day free trial'}
              </Button>

              <ul className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2
                      className="h-5 w-5 mt-0.5 flex-shrink-0"
                      style={{ color: '#1877f2' }}
                    />
                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
