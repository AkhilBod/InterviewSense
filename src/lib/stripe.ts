import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});

export default stripe;

// Pricing configuration
export const PRICING = {
  basic: {
    name: "Basic",
    credits: 6,
    price: 0,
    description: "6 free credits every week",
    billingPeriod: "weekly",
    features: [
      "6 free credits per week",
      "6 resume reviews per week",
      "2 behavioral interviews per week",
      "2 technical interviews per week",
      "6 cover letters per week",
      "Community support",
    ],
  },
  plus: {
    name: "Plus",
    credits: "more",
    price: 500, // $5.00 in cents per month
    stripePriceId: process.env.STRIPE_PRICE_ID_PLUS || "",
    description: "More credits for dedicated practice",
    billingPeriod: "monthly",
    features: [
      "Unlimited credits per month",
      "Unlimited resume reviews",
      "Unlimited behavioral interviews",
      "Unlimited technical interviews",
      "Unlimited cover letters",
      "Email support",
    ],
  },
  pro: {
    name: "Pro",
    credits: "unlimited",
    price: 900, // $9.00 in cents per month
    stripePriceId: process.env.STRIPE_PRICE_ID_PRO || "",
    description: "Full access with priority support",
    billingPeriod: "monthly",
    features: [
      "Unlimited credits",
      "Unlimited interviews",
      "Unlimited resume reviews",
      "Unlimited system design sessions",
      "Priority support",
      "Advanced analytics",
      "Detailed feedback",
    ],
  },
};

// Service costs in credits
export const SERVICE_COSTS = {
  resume_review: 1,
  behavioral_interview: 3,
  technical_interview: 3,
  cover_letter: 1,
  system_design: 4,
  portfolio_review: 3,
} as const;
