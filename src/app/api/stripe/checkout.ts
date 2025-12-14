import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import stripe, { PRICING } from "@/lib/stripe";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { tier } = await req.json();

    if (!["plus", "pro"].includes(tier)) {
      return NextResponse.json(
        { error: "Invalid tier" },
        { status: 400 }
      );
    }

    // Get or create user in database
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name,
        },
        include: { subscription: true },
      });
    }

    // Create or get Stripe customer
    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
      });
      stripeCustomerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      });
    }

    const pricingTier = PRICING[tier as keyof typeof PRICING];
    const returnUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/billing?success=true`;

    if (tier === "plus" || tier === "pro") {
      // Monthly subscription checkout for both Plus and Pro
      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: pricingTier.stripePriceId,
            quantity: 1,
          },
        ],
        success_url: returnUrl,
        cancel_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/pricing`,
        metadata: {
          userId: user.id,
          tier,
        },
      });

      return NextResponse.json({ sessionId: session.id, url: session.url });
    }

    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
