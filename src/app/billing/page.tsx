"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Subscription {
  tier: string;
  creditsBalance: number;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

interface CreditUsage {
  serviceType: string;
  creditsDeducted: number;
  createdAt: string;
}

export default function BillingPage() {
  const { data: session, status } = useSession();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<CreditUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }

    if (status === "authenticated") {
      fetchBillingData();
    }
  }, [status]);

  const fetchBillingData = async () => {
    try {
      const [subRes, usageRes] = await Promise.all([
        fetch("/api/user/subscription"),
        fetch("/api/user/credit-usage"),
      ]);

      if (!subRes.ok || !usageRes.ok) {
        throw new Error("Failed to fetch billing data");
      }

      const subData = await subRes.json();
      const usageData = await usageRes.json();

      setSubscription(subData);
      setUsage(usageData.recentUsage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const tierColors = {
    basic: "bg-slate-700",
    plus: "bg-purple-700",
    pro: "bg-blue-700",
  };

  const tierLabel = {
    basic: "Basic (Free)",
    plus: "Plus",
    pro: "Pro",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Billing</h1>
          <p className="text-slate-400">Manage your subscription and credits</p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-200 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {/* Current Plan Card */}
        {subscription && (
          <Card className={`${tierColors[subscription.tier as keyof typeof tierColors]} p-6 mb-8`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {tierLabel[subscription.tier as keyof typeof tierLabel]}
                </h2>
                <p className="text-slate-300">
                  Status:{" "}
                  <span className="font-semibold capitalize">
                    {subscription.status}
                  </span>
                </p>
              </div>
              <Button className="bg-white text-slate-900 hover:bg-slate-100">
                Manage Subscription
              </Button>
            </div>

            {/* Credits Display */}
            <div className="mt-6 p-4 bg-black/20 rounded-lg">
              <div className="text-slate-300 text-sm mb-2">Credits Balance</div>
              <div className="flex items-baseline gap-2">
                {subscription.tier === "pro" ? (
                  <>
                    <span className="text-4xl font-bold text-white">∞</span>
                    <span className="text-slate-300">Unlimited</span>
                  </>
                ) : (
                  <>
                    <span className="text-4xl font-bold text-white">
                      {subscription.creditsBalance}
                    </span>
                    <span className="text-slate-300">credits</span>
                  </>
                )}
              </div>
            </div>

            {/* Period Info */}
            {subscription.currentPeriodEnd && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-slate-300 text-sm">
                  {subscription.tier === "basic"
                    ? "Credits reset: Weekly (every Monday)"
                    : subscription.tier === "pro"
                      ? "Next billing date: "
                      : "Next billing date: "}
                  <span className="font-semibold">
                    {subscription.tier !== "basic"
                      ? new Date(
                          subscription.currentPeriodEnd
                        ).toLocaleDateString()
                      : "Every Monday"}
                  </span>
                </p>
                {subscription.cancelAtPeriodEnd && (
                  <p className="text-orange-300 text-sm mt-2">
                    ⚠️ Your subscription will be cancelled at the end of the
                    current period
                  </p>
                )}
              </div>
            )}
          </Card>
        )}

        {/* Upgrade Options */}
        <div className="bg-slate-800/50 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">
            Want to upgrade?
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              Switch to Plus (50 credits for $49.99)
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Switch to Pro (Unlimited for $99.99/month)
            </Button>
          </div>
        </div>

        {/* Usage History */}
        <Card className="bg-slate-800/50 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>

          {usage.length === 0 ? (
            <p className="text-slate-400">No activity yet. Start practicing!</p>
          ) : (
            <div className="space-y-3">
              {usage.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg"
                >
                  <div>
                    <p className="text-white font-medium capitalize">
                      {item.serviceType.replace(/_/g, " ")}
                    </p>
                    <p className="text-slate-400 text-sm">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-red-400 font-semibold">
                    -{item.creditsDeducted}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Credit System Info */}
        <Card className="bg-blue-900/20 border border-blue-500/30 p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-200 mb-4">
            Credit System
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-blue-100 text-sm">
            <div>Resume Review: 1 credit</div>
            <div>Behavioral Interview: 3 credits</div>
            <div>Technical Interview: 3 credits</div>
            <div>Cover Letter: 1 credit</div>
            <div>System Design: 4 credits</div>
            <div>Portfolio Review: 3 credits</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
