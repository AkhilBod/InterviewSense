import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteUsers() {
  const emailsToDelete = [
    'akkiisan9@gmail.com',
    'brownbananaburrito@gmail.com'
  ]

  for (const email of emailsToDelete) {
    try {
      console.log(`\n🗑️  Deleting user: ${email}`)

      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        console.log(`❌ User not found: ${email}`)
        continue
      }

      console.log(`Found user with ID: ${user.id}`)

      // Delete all associated data (cascade will handle some, but be explicit)
      const deletions = {
        userStats: await prisma.userStats.deleteMany({
          where: { userId: user.id }
        }),
        practiceSession: await prisma.practiceSession.deleteMany({
          where: { userId: user.id }
        }),
        account: await prisma.account.deleteMany({
          where: { userId: user.id }
        }),
        session: await prisma.session.deleteMany({
          where: { userId: user.id }
        }),
      }

      // Delete the user (cascade should handle other relations)
      const deletedUser = await prisma.user.delete({
        where: { id: user.id }
      })

      console.log(`✅ Successfully deleted user: ${email}`)
      console.log(`   Deleted records:`)
      console.log(`   - UserStats: ${deletions.userStats.count}`)
      console.log(`   - PracticeSessions: ${deletions.practiceSession.count}`)
      console.log(`   - Accounts: ${deletions.account.count}`)
      console.log(`   - Sessions: ${deletions.session.count}`)
      console.log(`   - And all related data via cascading deletes`)
    } catch (error) {
      console.error(`❌ Error deleting user ${email}:`, error)
    }
  }

  console.log('\n✅ Deletion complete!')
  await prisma.$disconnect()
  process.exit(0)
}

deleteUsers().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
