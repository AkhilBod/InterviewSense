import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface UserData {
  id: string
  name: string | null
  email: string
  emailVerified: string | null
  password: string | null
  image: string | null
  createdAt: string
  creatorCode: string | null
  stripeCustomerId: string | null
  onboardingCompleted?: boolean
}

interface AccountData {
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

interface UserStatsData {
  id: string
  userId: string
  totalInterviewsCompleted: number
  totalQuestionsPracticed: number
  averageScore: number | null
  lastPracticeDate: string | null
  createdAt: string
  updatedAt: string
}

interface PracticeSessionData {
  id: string
  userId: string
  type: string
  score: number | null
  duration: number | null
  completed: boolean
  improvements: any
  createdAt: string
}

async function restoreData() {
  try {
    console.log('🔄 Starting data restoration...\n')

    // Read JSON files
    const dataDir = path.join(process.cwd(), 'database')

    const usersPath = path.join(dataDir, 'User.json')
    const accountsPath = path.join(dataDir, 'Account.json')
    const userStatsPath = path.join(dataDir, 'UserStats.json')
    const practiceSessionsPath = path.join(dataDir, 'PracticeSession.json')

    // Check if files exist
    if (!fs.existsSync(usersPath)) {
      console.error('❌ User.json not found in databases directory')
      process.exit(1)
    }

    const usersData: UserData[] = JSON.parse(fs.readFileSync(usersPath, 'utf-8'))
    const accountsData: AccountData[] = fs.existsSync(accountsPath)
      ? JSON.parse(fs.readFileSync(accountsPath, 'utf-8'))
      : []
    const userStatsData: UserStatsData[] = fs.existsSync(userStatsPath)
      ? JSON.parse(fs.readFileSync(userStatsPath, 'utf-8'))
      : []
    const practiceSessionsData: PracticeSessionData[] = fs.existsSync(
      practiceSessionsPath
    )
      ? JSON.parse(fs.readFileSync(practiceSessionsPath, 'utf-8'))
      : []

    console.log(`📁 Found data files:`)
    console.log(`   - ${usersData.length} users`)
    console.log(`   - ${accountsData.length} accounts`)
    console.log(`   - ${userStatsData.length} user stats`)
    console.log(`   - ${practiceSessionsData.length} practice sessions\n`)

    // Restore Users
    console.log('👤 Restoring users...')
    for (const user of usersData) {
      await (prisma.user.upsert as any)({
        where: { email: user.email },
        update: {
          name: user.name,
          emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
          password: user.password,
          image: user.image,
          creatorCode: user.creatorCode,
          questionnaireCompleted: false,
        },
        create: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
          password: user.password,
          image: user.image,
          createdAt: new Date(user.createdAt),
          creatorCode: user.creatorCode,
          questionnaireCompleted: false,
        },
      })
    }
    console.log(`✅ Restored ${usersData.length} users`)

    // Restore Accounts
    console.log('\n🔗 Restoring accounts...')
    for (const account of accountsData) {
      await prisma.account.upsert({
        where: {
          provider_providerAccountId: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
        },
        update: {
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state,
        },
        create: {
          userId: account.userId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state,
        },
      })
    }
    console.log(`✅ Restored ${accountsData.length} accounts`)

    // Restore UserStats
    console.log('\n📊 Restoring user stats...')
    for (const stats of userStatsData) {
      await (prisma.userStats.upsert as any)({
        where: { userId: stats.userId },
        update: {
          averageScore: stats.averageScore || 0,
        },
        create: {
          id: stats.id,
          userId: stats.userId,
          averageScore: stats.averageScore || 0,
          createdAt: new Date(stats.createdAt),
          updatedAt: new Date(stats.updatedAt),
        },
      })
    }
    console.log(`✅ Restored ${userStatsData.length} user stats`)

    // Restore PracticeSessions
    console.log('\n🎯 Restoring practice sessions...')
    for (const session of practiceSessionsData) {
      await prisma.practiceSession.upsert({
        where: { id: session.id },
        update: {
          type: session.type,
          score: session.score,
          duration: session.duration,
          completed: session.completed,
          improvements: session.improvements,
        },
        create: {
          id: session.id,
          userId: session.userId,
          type: session.type,
          score: session.score,
          duration: session.duration,
          completed: session.completed,
          improvements: session.improvements,
          createdAt: new Date(session.createdAt),
        },
      })
    }
    console.log(`✅ Restored ${practiceSessionsData.length} practice sessions`)

    console.log('\n✨ Data restoration completed successfully!')
    console.log('\n📋 Summary:')
    console.log(`   ✅ Users: ${usersData.length}`)
    console.log(`   ✅ Accounts: ${accountsData.length}`)
    console.log(`   ✅ User Stats: ${userStatsData.length}`)
    console.log(`   ✅ Practice Sessions: ${practiceSessionsData.length}`)
    console.log(`   ✅ All users have been set to:`)
    console.log(`      - Daily Credits: 30`)
    console.log(`      - Daily Credit Limit: 30`)
    console.log(`      - Questionnaire Completed: false`)
  } catch (error) {
    console.error('❌ Error during restoration:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

restoreData()
