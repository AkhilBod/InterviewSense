import { prisma } from '../src/lib/prisma'
import * as fs from 'fs'
import * as path from 'path'

enum SubscriptionPlan {
  FREE = 'FREE',
  MONTHLY = 'MONTHLY',
  ANNUAL = 'ANNUAL',
}

enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  PAST_DUE = 'PAST_DUE',
  TRIALING = 'TRIALING',
  INCOMPLETE = 'INCOMPLETE',
  INCOMPLETE_EXPIRED = 'INCOMPLETE_EXPIRED',
  UNPAID = 'UNPAID',
}

interface OldUser {
  id: string
  name: string | null
  email: string
  emailVerified: string | null
  password: string | null
  image: string | null
  onboardingCompleted?: boolean
  createdAt: string
  creatorCode: string | null
  stripeCustomerId: string | null
}

interface OldAccount {
  id: string
  userId: string
  type: string
  provider: string
  providerAccountId: string
  refresh_token: string | null
  access_token: string | null
  expires_at: number | null
  token_type: string | null
  scope: string | null
  id_token: string | null
  session_state: string | null
}

interface OldPracticeSession {
  id: string
  userId: string
  type: string
  score: number | null
  duration: number | null
  completed: boolean
  improvements: string[] | null
  createdAt: string
}

interface OldUserStats {
  id: string
  userId: string
  dailyStreak: number
  longestStreak: number
  lastActivityDate: string | null
  weeklyGoal: number
  weeklyProgress: number
  weeklyGoalsMet: number
  lastWeekReset: string
  bestInterviewScore: number
  bestResumeScore: number
  bestTechnicalScore: number
  bestBehavioralScore: number
  totalSessions: number
  totalInterviews: number
  totalResumeChecks: number
  totalTimeMinutes: number
  lastScore: number
  averageScore: number
  recentSessions: string | any[]
  scoreImprovement: number
  streakImprovement: number
  strongestArea: string | null
  improvementArea: string | null
  createdAt: string
  updatedAt: string
}

interface OldPasswordResetToken {
  id: string
  token: string
  userId: string
  expires: string
  createdAt: string
}

async function loadJsonFile<T>(filePath: string): Promise<T[]> {
  try {
    const data = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(data) || []
  } catch (error) {
    console.log(`No data found in ${filePath} or file doesn't exist`)
    return []
  }
}

async function migrateUsers() {
  console.log('🔄 Starting user migration...')
  const users = await loadJsonFile<OldUser>(
    path.join(__dirname, '../databases/User.json')
  )

  console.log(`Found ${users.length} users to migrate`)

  let migrated = 0
  let skipped = 0
  let errors = 0

  for (const oldUser of users) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: oldUser.email },
      })

      if (existingUser) {
        console.log(`⏭️  User ${oldUser.email} already exists, skipping...`)
        skipped++
        continue
      }

      // Parse dates
      const createdAt = new Date(oldUser.createdAt)
      const emailVerified = oldUser.emailVerified
        ? new Date(oldUser.emailVerified)
        : null

      await prisma.user.create({
        data: {
          id: oldUser.id,
          name: oldUser.name,
          email: oldUser.email,
          emailVerified: emailVerified,
          password: oldUser.password,
          image: oldUser.image,
          createdAt: createdAt,
          creatorCode: oldUser.creatorCode,
        },
      })

      migrated++
      if (migrated % 10 === 0) {
        console.log(`✅ Migrated ${migrated} users...`)
      }
    } catch (error) {
      console.error(`❌ Error migrating user ${oldUser.email}:`, error)
      errors++
    }
  }

  console.log(
    `✅ User migration complete: ${migrated} migrated, ${skipped} skipped, ${errors} errors`
  )
  return { migrated, skipped, errors }
}

async function migrateAccounts() {
  console.log('\n🔄 Starting account migration...')
  const accounts = await loadJsonFile<OldAccount>(
    path.join(__dirname, '../databases/Account.json')
  )

  console.log(`Found ${accounts.length} accounts to migrate`)

  let migrated = 0
  let skipped = 0
  let errors = 0

  for (const oldAccount of accounts) {
    try {
      const existingAccount = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: oldAccount.provider,
            providerAccountId: oldAccount.providerAccountId,
          },
        },
      })

      if (existingAccount) {
        console.log(
          `⏭️  Account ${oldAccount.provider}:${oldAccount.providerAccountId} already exists, skipping...`
        )
        skipped++
        continue
      }

      await prisma.account.create({
        data: {
          id: oldAccount.id,
          userId: oldAccount.userId,
          type: oldAccount.type,
          provider: oldAccount.provider,
          providerAccountId: oldAccount.providerAccountId,
          refresh_token: oldAccount.refresh_token,
          access_token: oldAccount.access_token,
          expires_at: oldAccount.expires_at,
          token_type: oldAccount.token_type,
          scope: oldAccount.scope,
          id_token: oldAccount.id_token,
          session_state: oldAccount.session_state,
        },
      })

      migrated++
      if (migrated % 10 === 0) {
        console.log(`✅ Migrated ${migrated} accounts...`)
      }
    } catch (error) {
      console.error(
        `❌ Error migrating account ${oldAccount.id}:`,
        error
      )
      errors++
    }
  }

  console.log(
    `✅ Account migration complete: ${migrated} migrated, ${skipped} skipped, ${errors} errors`
  )
  return { migrated, skipped, errors }
}

async function migrateUserStats() {
  console.log('\n🔄 Starting user stats migration...')
  const statsArray = await loadJsonFile<OldUserStats>(
    path.join(__dirname, '../databases/UserStats.json')
  )

  console.log(`Found ${statsArray.length} user stats to migrate`)

  let migrated = 0
  let skipped = 0
  let errors = 0

  for (const oldStats of statsArray) {
    try {
      const existingStats = await prisma.userStats.findUnique({
        where: { userId: oldStats.userId },
      })

      if (existingStats) {
        console.log(`⏭️  Stats for user ${oldStats.userId} already exist, skipping...`)
        skipped++
        continue
      }

      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: oldStats.userId },
      })

      if (!user) {
        console.log(
          `⚠️  User ${oldStats.userId} not found, skipping stats migration...`
        )
        skipped++
        continue
      }

      await prisma.userStats.create({
        data: {
          id: oldStats.id,
          userId: oldStats.userId,
          dailyStreak: oldStats.dailyStreak || 0,
          longestStreak: oldStats.longestStreak || 0,
          lastActivityDate: oldStats.lastActivityDate
            ? new Date(oldStats.lastActivityDate)
            : null,
          weeklyGoal: oldStats.weeklyGoal || 3,
          weeklyProgress: oldStats.weeklyProgress || 0,
          weeklyGoalsMet: oldStats.weeklyGoalsMet || 0,
          lastWeekReset: new Date(oldStats.lastWeekReset),
          bestInterviewScore: oldStats.bestInterviewScore || 0,
          bestResumeScore: oldStats.bestResumeScore || 0,
          bestTechnicalScore: oldStats.bestTechnicalScore || 0,
          bestBehavioralScore: oldStats.bestBehavioralScore || 0,
          totalSessions: oldStats.totalSessions || 0,
          totalInterviews: oldStats.totalInterviews || 0,
          totalResumeChecks: oldStats.totalResumeChecks || 0,
          totalTimeMinutes: oldStats.totalTimeMinutes || 0,
          lastScore: oldStats.lastScore || 0,
          averageScore: oldStats.averageScore || 0,
          recentSessions:
            typeof oldStats.recentSessions === 'string'
              ? JSON.parse(oldStats.recentSessions)
              : oldStats.recentSessions || [],
          scoreImprovement: oldStats.scoreImprovement || 0,
          streakImprovement: oldStats.streakImprovement || 0,
          strongestArea: oldStats.strongestArea,
          improvementArea: oldStats.improvementArea,
          createdAt: new Date(oldStats.createdAt),
          updatedAt: new Date(oldStats.updatedAt),
        },
      })

      migrated++
      if (migrated % 10 === 0) {
        console.log(`✅ Migrated ${migrated} user stats...`)
      }
    } catch (error) {
      console.error(`❌ Error migrating stats for user ${oldStats.userId}:`, error)
      errors++
    }
  }

  console.log(
    `✅ User stats migration complete: ${migrated} migrated, ${skipped} skipped, ${errors} errors`
  )
  return { migrated, skipped, errors }
}

async function migratePracticeSessions() {
  console.log('\n🔄 Starting practice sessions migration...')
  const sessions = await loadJsonFile<OldPracticeSession>(
    path.join(__dirname, '../databases/PracticeSession.json')
  )

  console.log(`Found ${sessions.length} practice sessions to migrate`)

  let migrated = 0
  let skipped = 0
  let errors = 0

  for (const oldSession of sessions) {
    try {
      const existingSession = await prisma.practiceSession.findUnique({
        where: { id: oldSession.id },
      })

      if (existingSession) {
        console.log(`⏭️  Session ${oldSession.id} already exists, skipping...`)
        skipped++
        continue
      }

      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: oldSession.userId },
      })

      if (!user) {
        console.log(`⚠️  User ${oldSession.userId} not found, skipping session...`)
        skipped++
        continue
      }

      await prisma.practiceSession.create({
        data: {
          id: oldSession.id,
          userId: oldSession.userId,
          type: oldSession.type,
          score: oldSession.score,
          duration: oldSession.duration,
          completed: oldSession.completed,
          improvements: oldSession.improvements || undefined,
          createdAt: new Date(oldSession.createdAt),
        },
      })

      migrated++
      if (migrated % 50 === 0) {
        console.log(`✅ Migrated ${migrated} practice sessions...`)
      }
    } catch (error) {
      console.error(`❌ Error migrating session ${oldSession.id}:`, error)
      errors++
    }
  }

  console.log(
    `✅ Practice sessions migration complete: ${migrated} migrated, ${skipped} skipped, ${errors} errors`
  )
  return { migrated, skipped, errors }
}

async function migratePasswordResetTokens() {
  console.log('\n🔄 Starting password reset tokens migration...')
  const tokens = await loadJsonFile<OldPasswordResetToken>(
    path.join(__dirname, '../databases/PasswordResetToken.json')
  )

  console.log(`Found ${tokens.length} password reset tokens to migrate`)

  let migrated = 0
  let skipped = 0
  let errors = 0

  for (const oldToken of tokens) {
    try {
      const existingToken = await prisma.passwordResetToken.findUnique({
        where: { id: oldToken.id },
      })

      if (existingToken) {
        console.log(`⏭️  Token ${oldToken.id} already exists, skipping...`)
        skipped++
        continue
      }

      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: oldToken.userId },
      })

      if (!user) {
        console.log(`⚠️  User ${oldToken.userId} not found, skipping token...`)
        skipped++
        continue
      }

      // Only migrate if token hasn't expired
      const expiresAt = new Date(oldToken.expires)
      if (expiresAt > new Date()) {
        await prisma.passwordResetToken.create({
          data: {
            id: oldToken.id,
            token: oldToken.token,
            userId: oldToken.userId,
            expires: expiresAt,
            createdAt: new Date(oldToken.createdAt),
          },
        })

        migrated++
      } else {
        console.log(`⏭️  Token ${oldToken.id} expired, skipping...`)
        skipped++
      }
    } catch (error) {
      console.error(`❌ Error migrating token ${oldToken.id}:`, error)
      errors++
    }
  }

  console.log(
    `✅ Password reset tokens migration complete: ${migrated} migrated, ${skipped} skipped, ${errors} errors`
  )
  return { migrated, skipped, errors }
}

async function createDefaultSubscriptions() {
  console.log('\n🔄 Creating default subscriptions for old users...')

  try {
    // Get all users
    const allUsers = await prisma.user.findMany()

    console.log(`Found ${allUsers.length} total users`)

    let created = 0
    let skipped = 0
    let errors = 0

    for (const user of allUsers) {
      try {
        // Check if user already has subscription
        const existingSubscription = await prisma.subscription.findUnique({
          where: { userId: user.id },
        })

        if (existingSubscription) {
          console.log(`⏭️  User ${user.email} already has subscription, skipping...`)
          skipped++
          continue
        }

        // Generate a temporary Stripe customer ID (they'll get real one on first payment)
        const tempStripeCustomerId = `cust_${user.id}`

        await prisma.subscription.create({
          data: {
            userId: user.id,
            stripeCustomerId: tempStripeCustomerId,
            plan: 'FREE',
            status: 'ACTIVE',
            createdAt: user.createdAt,
          },
        })

        created++
        if (created % 10 === 0) {
          console.log(`✅ Created ${created} subscriptions...`)
        }
      } catch (error) {
        console.error(`❌ Error creating subscription for user ${user.id}:`, error)
        errors++
      }
    }

    console.log(
      `✅ Subscription creation complete: ${created} created, ${skipped} skipped, ${errors} errors`
    )
    return { created, skipped, errors }
  } catch (error) {
    console.error('❌ Error creating default subscriptions:', error)
    return { created: 0, skipped: 0, errors: 1 }
  }
}

async function main() {
  console.log('🚀 Starting old data migration to Supabase...\n')

  const results = {
    users: await migrateUsers(),
    accounts: await migrateAccounts(),
    userStats: await migrateUserStats(),
    practiceSessions: await migratePracticeSessions(),
    passwordResetTokens: await migratePasswordResetTokens(),
    subscriptions: await createDefaultSubscriptions(),
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 MIGRATION SUMMARY')
  console.log('='.repeat(60))
  console.log(`Users:                 ${results.users.migrated} migrated, ${results.users.skipped} skipped, ${results.users.errors} errors`)
  console.log(`Accounts:              ${results.accounts.migrated} migrated, ${results.accounts.skipped} skipped, ${results.accounts.errors} errors`)
  console.log(`User Stats:            ${results.userStats.migrated} migrated, ${results.userStats.skipped} skipped, ${results.userStats.errors} errors`)
  console.log(`Practice Sessions:     ${results.practiceSessions.migrated} migrated, ${results.practiceSessions.skipped} skipped, ${results.practiceSessions.errors} errors`)
  console.log(`Password Reset Tokens:  ${results.passwordResetTokens.migrated} migrated, ${results.passwordResetTokens.skipped} skipped, ${results.passwordResetTokens.errors} errors`)
  console.log(`Subscriptions Created:  ${results.subscriptions.created} created, ${results.subscriptions.errors} errors`)
  console.log('='.repeat(60))
  console.log('✅ Migration complete! Old users now have FREE tier accounts.')
  console.log('💳 They will need to pay to use premium features.')
  console.log('='.repeat(60))

  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('❌ Fatal error during migration:', error)
  process.exit(1)
})
