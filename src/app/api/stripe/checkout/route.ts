import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe-server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId } = await req.json();

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID required' }, { status: 400 });
    }

    // Get or create Stripe customer
    let subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    let customerId = subscription?.stripeCustomerId;

    if (!customerId) {
      // Check if there's an existing Stripe customer with this email who was previously deleted
      const existingCustomers = await stripe.customers.list({
        email: session.user.email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        const existingCustomer = existingCustomers.data[0];
        
        // Check if this customer was previously deleted (marked in metadata)
        if (existingCustomer.metadata?.account_deleted === 'true') {
          // Reuse the existing customer but don't give free trial
          customerId = existingCustomer.id;
          
          // Update customer to remove deleted status since they're creating a new account
          await stripe.customers.update(customerId, {
            metadata: {
              ...existingCustomer.metadata,
              account_deleted: 'false',
              reactivated_at: new Date().toISOString(),
              userId: session.user.id
            }
          });

          await prisma.subscription.upsert({
            where: { userId: session.user.id },
            create: {
              userId: session.user.id,
              stripeCustomerId: customerId,
              plan: 'FREE',
              status: 'ACTIVE',
            },
            update: { stripeCustomerId: customerId },
          });
        } else {
          // This email already has an active Stripe customer, use it
          customerId = existingCustomer.id;
          
          await prisma.subscription.upsert({
            where: { userId: session.user.id },
            create: {
              userId: session.user.id,
              stripeCustomerId: customerId,
              plan: 'FREE',
              status: 'ACTIVE',
            },
            update: { stripeCustomerId: customerId },
          });
        }
      } else {
        // No existing customer, create a new one
        const customer = await stripe.customers.create({
          email: session.user.email,
          metadata: { userId: session.user.id },
        });
        customerId = customer.id;

        await prisma.subscription.upsert({
          where: { userId: session.user.id },
          create: {
            userId: session.user.id,
            stripeCustomerId: customerId,
            plan: 'FREE',
            status: 'ACTIVE',
          },
          update: { stripeCustomerId: customerId },
        });
      }
    }

    // Check if customer was previously deleted to determine trial eligibility
    const customer = await stripe.customers.retrieve(customerId);
    let wasDeleted = false;
    
    if (!customer.deleted && customer.metadata) {
      wasDeleted = customer.metadata.account_deleted === 'true' || !!customer.metadata.reactivated_at;
    }
    
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      subscription_data: {
        // Only give free trial if customer was never deleted
        ...(wasDeleted ? {} : { trial_period_days: 3 }),
        metadata: {
          userId: session.user.id,
          source: 'interviewsense_checkout',
          previous_account_deleted: wasDeleted ? 'true' : 'false',
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      metadata: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
