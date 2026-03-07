import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe-server';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Retrieve the checkout session from Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    // Verify that the session belongs to this user
    if (checkoutSession.metadata?.userId !== session.user.id) {
      return NextResponse.json({ 
        error: 'Invalid session',
        success: false 
      }, { status: 403 });
    }

    // Check if payment was successful
    if (checkoutSession.payment_status !== 'paid' && checkoutSession.status !== 'complete') {
      return NextResponse.json({ 
        error: 'Payment not completed',
        success: false 
      }, { status: 400 });
    }

    // Verify subscription exists
    if (!checkoutSession.subscription) {
      return NextResponse.json({ 
        error: 'No subscription found',
        success: false 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true,
      subscriptionId: checkoutSession.subscription,
    });

  } catch (error: any) {
    console.error('Session verification error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to verify session',
        success: false 
      },
      { status: 500 }
    );
  }
}
