import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanup() {
  console.log('🧹 Cleaning up stale subscription data...')

  // Delete all subscriptions
  const deletedSubs = await prisma.subscription.deleteMany({})
  console.log(`✅ Deleted ${deletedSubs.count} subscription records`)

  // Reset all users' Stripe customer IDs and credits to FREE tier
  const updatedUsers = await prisma.user.updateMany({
    data: {
      stripeCustomerId: null,
      dailyCredits: 15,
      dailyCreditLimit: 15,
    }
  })
  console.log(`✅ Reset ${updatedUsers.count} users to FREE tier (15 credits)`)

  console.log('✨ Cleanup complete! Ready for fresh testing.')
  await prisma.$disconnect()
}

cleanup().catch((error) => {
  console.error('❌ Error during cleanup:', error)
  process.exit(1)
})
