import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUsage() {
  console.log('🔍 Checking feature usage logs...\n')

  const usage = await prisma.featureUsage.findMany({
    include: {
      user: {
        select: { email: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  if (usage.length === 0) {
    console.log('❌ No feature usage found')
    console.log('\nTo test credit deduction, try generating a cover letter:')
    console.log('1. Go to http://localhost:3000/dashboard')
    console.log('2. Click "Create Cover Letter"')
    console.log('3. Upload a resume and fill in job details')
    console.log('4. Generate a cover letter')
    console.log('5. Check your credits - should go from 50 to 49')
  } else {
    console.log(`Found ${usage.length} usage records:\n`)
    usage.forEach((record, i) => {
      console.log(`${i + 1}. ${record.user.email}`)
      console.log(`   Feature: ${record.feature}`)
      console.log(`   Credits used: ${record.creditsUsed}`)
      console.log(`   Time: ${record.createdAt}`)
      console.log('')
    })
  }

  await prisma.$disconnect()
}

checkUsage()
