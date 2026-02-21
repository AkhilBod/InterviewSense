'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2 } from 'lucide-react'

interface SubscriptionGateProps {
  children: React.ReactNode
}

export default function SubscriptionGate({ children }: SubscriptionGateProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [hasSubscription, setHasSubscription] = useState(false)
  const [subscriptionLoading, setSubscriptionLoading] = useState<string | null>(null)

  const handleSubscribe = async (priceId: string | undefined, planName: string) => {
    if (!priceId) {
      alert('Price ID not configured. Please set environment variables.')
      return
    }

    setSubscriptionLoading(planName)

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })

      const data = await res.json()

      if (data.error) {
        alert(data.error)
        setSubscriptionLoading(null)
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout. Please try again.')
      setSubscriptionLoading(null)
    }
  }

  useEffect(() => {
    async function checkSubscription() {
      if (status === 'loading') return

      if (!session) {
        router.push('/login')
        return
      }

      try {
        const response = await fetch('/api/subscription-status')
        const data = await response.json()

        if (data.hasActiveSubscription) {
          setHasSubscription(true)
        } else {
          setHasSubscription(false)
        }
      } catch (error) {
        console.error('Error checking subscription:', error)
        setHasSubscription(false)
      } finally {
        setChecking(false)
      }
    }

    checkSubscription()
  }, [session, status, router])

  if (status === 'loading' || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
          <p className="mt-4 text-zinc-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!hasSubscription) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-4xl w-full bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-white mb-4">
              Choose Your Plan to Get Started
            </CardTitle>
            <p className="text-slate-400 text-lg">
              Select a subscription plan to access all InterviewSense features
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Monthly Plan */}
              <div className="bg-slate-700/50 border border-slate-600 rounded-2xl p-8 hover:border-blue-500 transition-all">
                <h3 className="text-2xl font-bold text-white mb-2">Monthly</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-5xl font-bold text-white">$25</span>
                  <span className="text-slate-400">/month</span>
                </div>

                <Button
                  onClick={() => handleSubscribe(process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID, 'Monthly')}
                  disabled={subscriptionLoading === 'Monthly'}
                  className="w-full mb-6 bg-white text-black hover:bg-slate-200 font-semibold py-4 text-lg rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {subscriptionLoading === 'Monthly' ? 'Loading...' : 'Start 3-day trial'}
                </Button>

                <ul className="space-y-3 text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>50 credits per day</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>All features included</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Interview video guides</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>5% off coaching services</span>
                  </li>
                </ul>
              </div>

              {/* Annual Plan */}
              <div className="bg-blue-600/10 border-2 border-blue-500 rounded-2xl p-8 relative shadow-lg">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-blue-600 rounded-full text-sm font-semibold text-white">
                  Best Value
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">Annual</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-5xl font-bold text-white">$199</span>
                  <span className="text-slate-400">/year</span>
                </div>
                <div className="text-green-400 text-sm font-semibold mb-6">Save 33%</div>

                <Button
                  onClick={() => handleSubscribe(process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID, 'Annual')}
                  disabled={subscriptionLoading === 'Annual'}
                  className="w-full mb-6 bg-blue-600 text-white hover:bg-blue-500 font-semibold py-4 text-lg rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {subscriptionLoading === 'Annual' ? 'Loading...' : 'Start 3-day trial'}
                </Button>

                <ul className="space-y-3 text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>65 credits per day</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>All features included</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Interview video guides</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>15% off coaching services</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Premium community access</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center">
              <p className="text-slate-400 text-sm">
                All plans include a 3-day free trial. No credit card required to start.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
