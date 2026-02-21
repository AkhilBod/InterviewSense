// test-credits.ts - Local Credit System Testing Script
import { PrismaClient, FeatureType } from '@prisma/client'
import {
  hasEnoughCredits,
  deductCredits,
  getCreditStatus,
  checkAndResetCredits
} from './src/lib/credits'

const prisma = new PrismaClient()

async function testCreditSystem() {
  try {
    // CHANGE THIS to your test user's email
    const TEST_USER_EMAIL = 'your-test-email@example.com'

    const user = await prisma.user.findUnique({
      where: { email: TEST_USER_EMAIL },
      include: { subscription: true }
    })

    if (!user) {
      console.error('❌ Test user not found')
      console.log('\n📝 Create a test user first:')
      console.log(`   - Email: ${TEST_USER_EMAIL}`)
      console.log('   - Or change TEST_USER_EMAIL in this script')
      return
    }

    console.log('🧪 Testing Credit System...')
    console.log(`👤 Test User: ${user.email}`)
    console.log(`📦 Plan: ${user.subscription?.plan || 'FREE'}\n`)

    // Test 1: Get credit status
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 Test 1: Get Credit Status')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    const status = await getCreditStatus(user.id)
    console.log('✅ Credit Status:')
    console.log(`   Daily Credits: ${status.dailyCredits}`)
    console.log(`   Daily Limit: ${status.dailyCreditLimit}`)
    console.log(`   Plan: ${status.plan}`)
    console.log(`   Usage: ${status.percentageUsed}%`)
    console.log('')

    // Test 2: Check if user has enough credits for different features
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('💰 Test 2: Check Credit Availability')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    const features = [
      { type: FeatureType.COVER_LETTER, qty: 1, name: 'Cover Letter (1)' },
      { type: FeatureType.RESUME_REVIEW, qty: 1, name: 'Resume Review (1)' },
      { type: FeatureType.TECHNICAL_INTERVIEW, qty: 1, name: 'Tech Interview (10)' },
      { type: FeatureType.BEHAVIORAL_PRACTICE, qty: 4, name: 'Behavioral (1 = 4 questions)' },
    ]

    for (const feature of features) {
      const check = await hasEnoughCredits(user.id, feature.type, feature.qty)
      const icon = check.hasCredits ? '✅' : '❌'
      console.log(`${icon} ${feature.name}`)
      console.log(`   Available: ${check.available} | Required: ${check.required}`)
    }
    console.log('')

    // Test 3: Deduct credits (Cover Letter - 1 credit)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('➖ Test 3: Deduct Credits')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    const beforeCredits = status.dailyCredits
    const deduction = await deductCredits(
      user.id,
      FeatureType.COVER_LETTER,
      1,
      {
        test: true,
        timestamp: new Date().toISOString(),
        companyName: 'Test Company'
      }
    )

    if (deduction.success) {
      console.log('✅ Successfully deducted 1 credit for Cover Letter')
      console.log(`   Before: ${beforeCredits} credits`)
      console.log(`   After: ${deduction.remainingCredits} credits`)
      console.log(`   Change: -${beforeCredits - deduction.remainingCredits}`)
    } else {
      console.log('❌ Failed to deduct credits:', deduction.error)
    }
    console.log('')

    // Test 4: Verify usage was logged
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📝 Test 4: Check Usage Log')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    const usageLog = await prisma.featureUsage.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
    console.log(`✅ Found ${usageLog.length} recent usage entries:`)
    usageLog.forEach((log, i) => {
      const time = new Date(log.createdAt).toLocaleTimeString()
      console.log(`   ${i + 1}. ${log.featureType}: ${log.creditsUsed} credits at ${time}`)
    })
    console.log('')

    // Test 5: Test insufficient credits scenario
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🚫 Test 5: Test Insufficient Credits')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Save current credits
    const currentCredits = deduction.remainingCredits

    // Set credits to 0
    await prisma.user.update({
      where: { id: user.id },
      data: { dailyCredits: 0 }
    })

    const insufficientCheck = await hasEnoughCredits(user.id, FeatureType.TECHNICAL_INTERVIEW, 1)
    console.log('✅ Set credits to 0 and tried Tech Interview (10 credits)')
    console.log(`   Has credits: ${insufficientCheck.hasCredits} (should be false)`)
    console.log(`   Available: ${insufficientCheck.available}`)
    console.log(`   Required: ${insufficientCheck.required}`)
    console.log(`   Error: "Need ${insufficientCheck.required} but have ${insufficientCheck.available}"`)

    // Restore credits
    await prisma.user.update({
      where: { id: user.id },
      data: { dailyCredits: currentCredits }
    })
    console.log(`✅ Restored credits to ${currentCredits}`)
    console.log('')

    // Test 6: Test daily reset
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔄 Test 6: Test Daily Reset')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Set last reset to 25 hours ago
    const yesterday = new Date(Date.now() - 25 * 60 * 60 * 1000)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastCreditReset: yesterday,
        dailyCredits: 5 // Low credits
      }
    })

    console.log('✅ Set lastCreditReset to 25 hours ago with 5 credits')
    const resetResult = await checkAndResetCredits(user.id)
    console.log('✅ Called checkAndResetCredits():')
    console.log(`   New Credits: ${resetResult.dailyCredits} (should be reset to limit)`)
    console.log(`   Credit Limit: ${resetResult.dailyCreditLimit}`)
    console.log(`   Reset successful: ${resetResult.dailyCredits === resetResult.dailyCreditLimit}`)
    console.log('')

    // Test 7: Feature cost calculation
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('💵 Test 7: Feature Cost Calculations')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    const costTests = [
      { feature: FeatureType.COVER_LETTER, qty: 1, expected: 1 },
      { feature: FeatureType.RESUME_REVIEW, qty: 1, expected: 1 },
      { feature: FeatureType.TECHNICAL_INTERVIEW, qty: 1, expected: 10 },
      { feature: FeatureType.TECHNICAL_INTERVIEW, qty: 3, expected: 30 },
      { feature: FeatureType.BEHAVIORAL_PRACTICE, qty: 4, expected: 1 },
      { feature: FeatureType.BEHAVIORAL_PRACTICE, qty: 8, expected: 2 },
      { feature: FeatureType.SYSTEM_DESIGN, qty: 1, expected: 5 },
    ]

    console.log('Verifying credit costs:')
    for (const test of costTests) {
      const check = await hasEnoughCredits(user.id, test.feature, test.qty)
      const actual = check.required
      const match = actual === test.expected
      const icon = match ? '✅' : '❌'
      console.log(`${icon} ${test.feature} x${test.qty}: ${actual} credits (expected ${test.expected})`)
    }
    console.log('')

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n🎉 Your credit system is working correctly!\n')

  } catch (error) {
    console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('❌ TEST FAILED')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('Error:', error)
    console.error('\n')
  } finally {
    await prisma.$disconnect()
  }
}

// Run the tests
console.log('\n')
testCreditSystem()
