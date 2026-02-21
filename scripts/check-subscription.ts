import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function check() {
  console.log('🔍 Checking subscription data...\n')

  const users = await prisma.user.findMany({
    include: {
      subscription: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  users.forEach((user, i) => {
    console.log(`User ${i + 1}:`)
    console.log(`  Email: ${user.email}`)
    console.log(`  Stripe Customer ID: ${user.stripeCustomerId || 'None'}`)
    console.log(`  Daily Credits: ${user.dailyCredits}/${user.dailyCreditLimit}`)
    console.log(`  Subscription:`, user.subscription ? {
      plan: user.subscription.plan,
      status: user.subscription.status,
      stripeSubscriptionId: user.subscription.stripeSubscriptionId,
      currentPeriodEnd: user.subscription.currentPeriodEnd,
      cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
      canceledAt: user.subscription.canceledAt,
    } : 'None')
    console.log('')
  })

  await prisma.$disconnect()
}

check()
