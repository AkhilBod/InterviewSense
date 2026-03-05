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

    const subId = user.subscription.stripeSubscriptionId

    let cancelAt: Date | null = null

    // Only call Stripe if we have a valid-looking subscription ID
    if (subId && subId.startsWith('sub_')) {
      try {
        const stripeSubscription = await stripe.subscriptions.update(subId, {
          cancel_at_period_end: true,
        })
        cancelAt = stripeSubscription.cancel_at
          ? new Date(stripeSubscription.cancel_at * 1000)
          : null
      } catch (stripeErr: any) {
        // If Stripe says the subscription doesn't exist, treat it as already gone
        if (stripeErr?.code !== 'resource_missing') {
          throw stripeErr
        }
        console.warn(`Stripe subscription ${subId} not found — marking DB as canceled anyway`)
      }
    } else {
      console.warn(`No valid stripeSubscriptionId (got: ${subId}) — canceling in DB only`)
    }

    // Always update the DB
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
