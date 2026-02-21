'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PricingSection() {
  const router = useRouter();
  const [giftCode, setGiftCode] = useState('');
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
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
      setLoading(null);
    }
  };

  return (
    <section className="py-24 px-4 bg-black">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 text-white">
            Choose Your Plan
          </h2>
          <p className="text-xl text-zinc-300">
            Start your 3-day free trial today. Cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Monthly Plan */}
          <Card className="bg-zinc-900/50 border border-zinc-700 p-8 relative hover:border-zinc-600 transition-all">
            <h3 className="text-2xl font-bold mb-2 text-white">Monthly</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-5xl font-bold text-white">$25</span>
              <span className="text-zinc-400">/month</span>
            </div>

            <Button
              onClick={() =>
                handleSubscribe(process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID, 'Monthly')
              }
              disabled={loading === 'Monthly'}
              className="w-full mb-6 bg-white text-black hover:bg-zinc-200 font-semibold py-6 text-lg transition-all hover:scale-105"
            >
              {loading === 'Monthly' ? 'Loading...' : 'Try 3-day free trial'}
            </Button>

            <ul className="space-y-3 text-zinc-300">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>Access to all questions, problems, and quizzes</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>Interview video guides</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>Advanced filtering and question playlists</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>5% off all coaching services</span>
              </li>
            </ul>
          </Card>

          {/* Annual Plan */}
          <Card className="bg-zinc-900/50 border-2 border-blue-500 p-8 relative hover:border-blue-400 transition-all">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-blue-600 rounded-full text-sm font-semibold text-white">
              Best Value
            </div>

            <h3 className="text-2xl font-bold mb-2 text-white">Annual</h3>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-5xl font-bold text-white">$199</span>
              <span className="text-zinc-400">/year</span>
            </div>
            <div className="text-green-400 text-sm font-semibold mb-6">Save 33%</div>

            <Button
              onClick={() =>
                handleSubscribe(process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID, 'Annual')
              }
              disabled={loading === 'Annual'}
              className="w-full mb-6 bg-blue-600 text-white hover:bg-blue-500 font-semibold py-6 text-lg transition-all hover:scale-105"
            >
              {loading === 'Annual' ? 'Loading...' : 'Try 3-day free trial'}
            </Button>

            <ul className="space-y-3 text-zinc-300">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>Access to all questions, problems, and quizzes</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>Interview video guides</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>Advanced filtering and question playlists</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>15% off all coaching services</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>Premium community with working professionals</span>
              </li>
            </ul>
          </Card>
        </div>

        {/* Gift Code */}
        <div className="max-w-md mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Gift code"
              value={giftCode}
              onChange={(e) => setGiftCode(e.target.value)}
              className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-all"
            />
            <Button
              variant="outline"
              className="border-zinc-700 text-white hover:bg-zinc-800 transition-all"
              onClick={() => {
                if (giftCode) {
                  // Handle gift code validation
                  console.log('Gift code:', giftCode);
                }
              }}
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
