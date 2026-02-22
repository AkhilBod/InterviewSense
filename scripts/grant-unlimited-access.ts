import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function grantUnlimitedAccess(email: string) {
  
  try {
    console.log(`[GRANT ACCESS] Starting for ${email}...`);
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.error(`[GRANT ACCESS] User not found: ${email}`);
      return;
    }
    
    console.log(`[GRANT ACCESS] Found user: ${user.id}`);
    
    // Update user to mark questionnaire as complete and set high daily credits
    await prisma.user.update({
      where: { id: user.id },
      data: {
        questionnaireCompleted: true,
        dailyCredits: 999999,
        dailyCreditLimit: 999999,
        emailVerified: new Date()
      }
    });
    
    console.log(`[GRANT ACCESS] Updated user with unlimited credits`);
    
    // Delete any existing subscriptions
    await prisma.subscription.deleteMany({
      where: { userId: user.id }
    });
    
    console.log(`[GRANT ACCESS] Cleared old subscriptions`);
    
    // Create an active subscription that expires way in the future (2099)
    const farFutureDate = new Date('2099-12-31');
    
    await prisma.subscription.create({
      data: {
        userId: user.id,
        stripeSubscriptionId: `unlimited_${user.id}_${Date.now()}`,
        stripePriceId: 'price_unlimited',
        stripeCustomerId: `cus_unlimited_${user.id}`,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: farFutureDate,
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    console.log(`[GRANT ACCESS] ✅ Unlimited access granted to ${email}`);
    console.log(`[GRANT ACCESS] - Questionnaire: complete`);
    console.log(`[GRANT ACCESS] - Daily credits: 999,999`);
    console.log(`[GRANT ACCESS] - Subscription: active until 2099-12-31`);
    
  } catch (error) {
    console.error('[GRANT ACCESS] Error:', error);
    throw error;
  }
}

async function main() {
  const emails = [
    'akkiisan9@gmail.com',
    'brownbananaburrito@gmail.com'
  ];
  
  for (const email of emails) {
    await grantUnlimitedAccess(email);
  }
  
  await prisma.$disconnect();
}

main();
