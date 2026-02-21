import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe-server';
import { prisma } from '@/lib/prisma';
import { DAILY_CREDIT_LIMITS } from '@/lib/credits';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('📦 Processing checkout.session.completed');

        if (session.mode === 'subscription') {
          const subscriptionId = session.subscription as string;
          const customerId = session.customer as string;
          console.log(`  Customer: ${customerId}, Subscription: ${subscriptionId}`);

          const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

          const plan =
            stripeSubscription.items.data[0].price.id === process.env.STRIPE_ANNUAL_PRICE_ID
              ? 'ANNUAL'
              : 'MONTHLY';
          console.log(`  Plan: ${plan}`);

          // Set credit limit based on plan
          const creditLimit = DAILY_CREDIT_LIMITS[plan];

          // Find existing subscription by customer ID
          const existingSub = await prisma.subscription.findUnique({
            where: { stripeCustomerId: customerId },
          });

          console.log(`  Existing subscription found: ${existingSub ? 'YES' : 'NO'}`);

          if (!existingSub) {
            console.error(`❌ No subscription record found for customer ${customerId}`);
            console.error('   This means checkout API did not create the subscription record!');
            break;
          }

          // Update subscription
          await prisma.subscription.update({
            where: { stripeCustomerId: customerId },
            data: {
              stripeSubscriptionId: subscriptionId,
              stripePriceId: stripeSubscription.items.data[0].price.id,
              plan,
              status: stripeSubscription.status.toUpperCase() as any,
              currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
              currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
              trialStart: stripeSubscription.trial_start
                ? new Date(stripeSubscription.trial_start * 1000)
                : null,
              trialEnd: stripeSubscription.trial_end
                ? new Date(stripeSubscription.trial_end * 1000)
                : null,
            },
          });
          console.log('  ✅ Subscription updated');

          // Update user's credit limits
          const subscription = await prisma.subscription.findUnique({
            where: { stripeCustomerId: customerId },
            select: { userId: true },
          });

          if (subscription) {
            await prisma.user.update({
              where: { id: subscription.userId },
              data: {
                dailyCreditLimit: creditLimit,
                dailyCredits: creditLimit, // Reset to full credits on new subscription
                lastCreditReset: new Date(),
                stripeCustomerId: customerId, // Also set on user
              },
            });

            console.log(`✅ Credits set for user ${subscription.userId}: ${creditLimit} (${plan} plan)`);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        const plan =
          subscription.items.data[0].price.id === process.env.STRIPE_ANNUAL_PRICE_ID
            ? 'ANNUAL'
            : 'MONTHLY';

        // Set credit limit based on plan
        const creditLimit = DAILY_CREDIT_LIMITS[plan];

        // Update subscription
        const dbSubscription = await prisma.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: subscription.status.toUpperCase() as any,
            plan,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
        });

        // Update user's credit limits if plan changed
        await prisma.user.update({
          where: { id: dbSubscription.userId },
          data: {
            dailyCreditLimit: creditLimit,
            dailyCredits: creditLimit, // Reset to full credits on plan change
            lastCreditReset: new Date(),
          },
        });

        console.log(`✅ Credits updated for user ${dbSubscription.userId}: ${creditLimit} (${plan} plan)`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        const dbSubscription = await prisma.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: 'CANCELED',
            plan: 'FREE',
            canceledAt: new Date(),
          },
        });

        // Revert user to FREE tier credit limits
        const freeCreditLimit = DAILY_CREDIT_LIMITS.FREE;
        await prisma.user.update({
          where: { id: dbSubscription.userId },
          data: {
            dailyCreditLimit: freeCreditLimit,
            dailyCredits: freeCreditLimit,
            lastCreditReset: new Date(),
          },
        });

        console.log(`✅ Credits reverted to FREE tier for user ${dbSubscription.userId}: ${freeCreditLimit}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;

        if (invoice.subscription) {
          const subscription = await prisma.subscription.findUnique({
            where: { stripeSubscriptionId: invoice.subscription as string },
          });

          if (subscription) {
            await prisma.paymentHistory.create({
              data: {
                userId: subscription.userId,
                stripeInvoiceId: invoice.id,
                amount: invoice.amount_paid,
                currency: invoice.currency,
                status: invoice.status!,
                plan: subscription.plan,
              },
            });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;

        if (invoice.subscription) {
          await prisma.subscription.update({
            where: { stripeSubscriptionId: invoice.subscription as string },
            data: { status: 'PAST_DUE' },
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
