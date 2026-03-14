import { prisma } from '@/lib/prisma';

const email = 'rishabh.s.udeshi@gmail.com';

async function grantUnlimited() {
  try {
    console.log(`Granting unlimited access to ${email}...`);

    const user = await prisma.user.findUnique({
      where: { email },
      include: { subscription: true },
    });

    if (!user) {
      console.error(`User not found: ${email}`);
      process.exit(1);
    }

    console.log(`Found user: ${user.name || user.email}`);

    // Update subscription to unlimited
    const updated = await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        plan: 'UNLIMITED',
        status: 'ACTIVE',
        currentPeriodEnd: new Date('2099-12-31'),
      },
    });

    console.log(`✓ Subscription updated:`);
    console.log(`- Plan: ${updated.plan}`);
    console.log(`- Status: ${updated.status}`);
    console.log(`- Active until: 2099-12-31`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

grantUnlimited();
