/**
 * Lists all users NOT on an active paid subscription.
 * Run: npx tsx scripts/list-free-users.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

  const users = await prisma.user.findMany({
    where: {
      emailUnsubscribed: false,
      emailVerified: { not: null },
      createdAt: { lt: tenDaysAgo },
      OR: [
        { subscription: null },
        {
          subscription: {
            plan: 'FREE',
            status: { not: 'TRIALING' },
          },
        },
      ],
    },
    include: {
      subscription: { select: { plan: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`\nFree users eligible for re-engagement: ${users.length}\n`);
  console.log('email,name,joined,plan');
  for (const u of users) {
    const plan = u.subscription?.plan ?? 'NONE';
    console.log(`${u.email},${u.name ?? ''},${u.createdAt.toISOString().slice(0, 10)},${plan}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
