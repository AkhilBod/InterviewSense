import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import stripe from "@/lib/stripe";
import Stripe from "stripe";

const prisma = new PrismaClient();

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier;

  if (!userId) {
    console.error("No userId in session metadata");
    return;
  }

  // Note: For monthly subscriptions (Plus and Pro), we handle this in
  // customer.subscription.updated instead of checkout.session.completed
  // This function is kept for reference but won't be used in current flow
}

async function handleCustomerSubscriptionUpdated(
  subscription: Stripe.Subscription
) {
  const userId = (subscription.metadata as Record<string, string>)?.userId;

  if (!userId) {
    console.error("No userId in subscription metadata");
    return;
  }

  const status =
    subscription.status === "active" ? "active" : "inactive";

  await prisma.subscription.upsert({
    where: { userId },
    update: {
      tier: "pro",
      status,
      stripeSubscriptionId: subscription.id,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    create: {
      userId,
      tier: "pro",
      status,
      stripeSubscriptionId: subscription.id,
      creditsBalance: -1, // Unlimited
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });
}

async function handleCustomerSubscriptionDeleted(
  subscription: Stripe.Subscription
) {
  const userId = (subscription.metadata as Record<string, string>)?.userId;

  if (!userId) {
    console.error("No userId in subscription metadata");
    return;
  }

  await prisma.subscription.update({
    where: { userId },
    data: {
      status: "cancelled",
      stripeSubscriptionId: null,
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleCustomerSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleCustomerSubscriptionDeleted(subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
