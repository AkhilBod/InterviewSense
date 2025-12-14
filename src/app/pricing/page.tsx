"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckIcon } from "@radix-ui/react-icons";

const TIERS = [
  {
    name: "Basic",
    price: "Free",
    description: "Perfect for getting started",
    credits: "6/week",
    pricePerCredit: "Free",
    features: [
      "6 free credits every week",
      "6 resume reviews per week",
      "2 behavioral interviews per week",
      "2 technical interviews per week",
      "6 cover letters per week",
      "Community support",
    ],
    cta: "Get Started",
    tier: "basic",
    highlighted: false,
  },
  {
    name: "Plus",
    price: "$5",
    description: "Unlimited practice",
    credits: "Unlimited",
    pricePerCredit: "$5/month",
    features: [
      "Unlimited credits per month",
      "Unlimited resume reviews",
      "Unlimited behavioral interviews",
      "Unlimited technical interviews",
      "Unlimited cover letters",
      "Email support",
    ],
    cta: "Subscribe Now",
    tier: "plus",
    highlighted: true,
  },
  {
    name: "Pro",
    price: "$9",
    description: "Best value with priority support",
    credits: "Unlimited",
    pricePerCredit: "$9/month",
    features: [
      "Unlimited credits",
      "Unlimited interviews",
      "Unlimited resume reviews",
      "Unlimited system design sessions",
      "Priority support",
      "Advanced analytics",
      "Detailed feedback on all practice",
    ],
    cta: "Subscribe Pro",
    tier: "pro",
    highlighted: false,
  },
];

export default function PricingPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (tier: string) => {
    if (!session) {
      // Redirect to login
      window.location.href = "/login";
      return;
    }

    if (tier === "basic") {
      // Already have basic
      return;
    }

    setLoading(tier);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      if (!response.ok) throw new Error("Checkout failed");

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to initiate checkout");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-300">
            Choose the perfect plan to ace your interviews
          </p>
        </div>

        {/* Credit System Explainer */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6 mb-12 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-blue-200 mb-3">
            How Credits Work
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-blue-100">
            <div>Resume Review: 1 credit</div>
            <div>Behavioral Interview: 3 credits</div>
            <div>Technical Interview: 3 credits</div>
            <div>Cover Letter: 1 credit</div>
            <div>System Design: 4 credits</div>
            <div>Portfolio Review: 3 credits</div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {TIERS.map((tier) => (
            <Card
              key={tier.tier}
              className={`relative flex flex-col transition-all duration-300 ${
                tier.highlighted
                  ? "ring-2 ring-blue-500 scale-105 bg-slate-800"
                  : "bg-slate-800/50 hover:bg-slate-800/80"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}

              <div className="flex-1 p-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {tier.name}
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  {tier.description}
                </p>

                <div className="mb-4">
                  <div className="text-3xl font-bold text-white">
                    {tier.price}
                  </div>
                  <div className="text-slate-400 text-sm">
                    {tier.pricePerCredit}
                  </div>
                  {tier.credits !== "Unlimited" && (
                    <div className="text-slate-300 font-semibold mt-2">
                      {tier.credits} credits
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => handleCheckout(tier.tier)}
                  disabled={loading === tier.tier || tier.tier === "basic"}
                  className={`w-full mb-6 ${
                    tier.highlighted
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-slate-700 hover:bg-slate-600"
                  }`}
                >
                  {loading === tier.tier ? "Processing..." : tier.cta}
                </Button>

                <div className="space-y-3">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Can I change my plan?",
                a: "Yes! You can upgrade or downgrade anytime.",
              },
              {
                q: "Do credits expire?",
                a: "Plus credits are valid for 1 year. Pro credits renew monthly.",
              },
              {
                q: "Is there a free trial?",
                a: "Yes! Start with 6 free credits on the Basic plan.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards via Stripe.",
              },
            ].map((item) => (
              <div key={item.q} className="bg-slate-800/50 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">{item.q}</h4>
                <p className="text-slate-300 text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
