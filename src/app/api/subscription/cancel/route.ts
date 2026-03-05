import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
})

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true },
    })

    if (!user || !user.subscription) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
    }

    const { stripeSubscriptionId, stripeCustomerId } = user.subscription

    let resolvedSubId = stripeSubscriptionId?.startsWith('sub_') ? stripeSubscriptionId : null

    // If we don't have a valid sub ID, look it up from Stripe using the customer ID
    // (this happens when the webhook hasn't fired yet due to misconfiguration)
    if (!resolvedSubId && stripeCustomerId) {
      const subs = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: 'all',
        limit: 5,
      })
      const active = subs.data.find(s => s.status === 'trialing' || s.status === 'active')
      if (active) {
        resolvedSubId = active.id
        // Backfill the DB so future calls work
        await prisma.subscription.update({
          where: { id: user.subscription.id },
          data: { stripeSubscriptionId: active.id },
        })
      }
    }

    let cancelAt: Date | null = null

    if (resolvedSubId) {
      try {
        const stripeSubscription = await stripe.subscriptions.update(resolvedSubId, {
          cancel_at_period_end: true,
        })
        cancelAt = stripeSubscription.cancel_at
          ? new Date(stripeSubscription.cancel_at * 1000)
          : null
      } catch (stripeErr: any) {
        if (stripeErr?.code !== 'resource_missing') throw stripeErr
        console.warn(`Stripe subscription ${resolvedSubId} not found — marking DB as canceled anyway`)
      }
    } else {
      console.warn(`No Stripe subscription found for customer ${stripeCustomerId} — canceling in DB only`)
    }

    await prisma.subscription.update({
      where: { id: user.subscription.id },
      data: {
        cancelAtPeriodEnd: true,
        canceledAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription will be canceled at the end of the billing period',
      cancelAt,
    })
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 })
  }
}
