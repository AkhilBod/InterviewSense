import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe-server';

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user to ensure they exist
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    // If user does not exist, return an error
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If user has a Stripe customer ID, update the customer metadata to mark as deleted
    // but DO NOT delete the Stripe customer to prevent multiple free trials
    if (user.stripeCustomerId) {
      try {
        await stripe.customers.update(user.stripeCustomerId, {
          metadata: {
            account_deleted: 'true',
            deleted_at: new Date().toISOString(),
            original_email: user.email
          }
        });
        console.log('Marked Stripe customer as deleted:', user.stripeCustomerId);
      } catch (stripeError) {
        console.error('Error updating Stripe customer metadata:', stripeError);
        // Continue with user deletion even if Stripe update fails
      }
    }

    // Delete the user record from the database
    await prisma.user.delete({
      where: { email: session.user.email },
    });

    return NextResponse.json({ success: true, message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Error deleting user data:', error);
    return NextResponse.json({ error: 'Failed to delete user data' }, { status: 500 });
  }
}
