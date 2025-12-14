import { PrismaClient } from "@prisma/client";
import { SERVICE_COSTS } from "./stripe";

const prisma = new PrismaClient();

export type ServiceType = keyof typeof SERVICE_COSTS;

export async function checkAndDeductCredits(
  userId: string,
  serviceType: ServiceType,
  sessionId?: string
): Promise<{
  success: boolean;
  creditsRemaining: number;
  message: string;
}> {
  const creditCost = SERVICE_COSTS[serviceType];

  if (!creditCost) {
    return {
      success: false,
      creditsRemaining: 0,
      message: "Invalid service type",
    };
  }

  try {
    // Get user's subscription
    let subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    // Create default free subscription if doesn't exist
    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: {
          userId,
          tier: "basic",
          status: "active",
          creditsBalance: 6, // Free credits
        },
      });
    }

    // Pro tier has unlimited credits (-1)
    if (subscription.tier === "pro" && subscription.status === "active") {
      // Log the usage for analytics
      await prisma.creditLedger.create({
        data: {
          userId,
          serviceType,
          creditsDeducted: creditCost,
          balanceBefore: -1, // Unlimited
          balanceAfter: -1,
          sessionId,
          status: "completed",
        },
      });

      return {
        success: true,
        creditsRemaining: -1,
        message: "Unlimited access - Pro tier",
      };
    }

    // Check if user has enough credits
    if (subscription.creditsBalance < creditCost) {
      return {
        success: false,
        creditsRemaining: subscription.creditsBalance,
        message: `Insufficient credits. Need ${creditCost}, have ${subscription.creditsBalance}`,
      };
    }

    // Deduct credits
    const balanceBefore = subscription.creditsBalance;
    const balanceAfter = balanceBefore - creditCost;

    // Update subscription and log usage atomically
    await prisma.subscription.update({
      where: { userId },
      data: {
        creditsBalance: balanceAfter,
        creditsUsed: {
          increment: creditCost,
        },
      },
    });

    await prisma.creditLedger.create({
      data: {
        userId,
        serviceType,
        creditsDeducted: creditCost,
        balanceBefore,
        balanceAfter,
        sessionId,
        status: "completed",
      },
    });

    return {
      success: true,
      creditsRemaining: balanceAfter,
      message: `Successfully deducted ${creditCost} credits`,
    };
  } catch (error) {
    console.error("Credit deduction error:", error);
    return {
      success: false,
      creditsRemaining: 0,
      message: "Error processing credits",
    };
  }
}

export async function getUserSubscription(userId: string) {
  let subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    subscription = await prisma.subscription.create({
      data: {
        userId,
        tier: "basic",
        status: "active",
        creditsBalance: 6,
      },
    });
  }

  return subscription;
}

export async function getUserCreditUsage(userId: string) {
  const usage = await prisma.creditLedger.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50, // Get last 50 transactions
  });

  const byService = Object.keys(SERVICE_COSTS).reduce(
    (acc, service) => {
      acc[service as ServiceType] = {
        count: 0,
        totalCredits: 0,
      };
      return acc;
    },
    {} as Record<ServiceType, { count: number; totalCredits: number }>
  );

  usage.forEach((entry) => {
    const service = entry.serviceType as ServiceType;
    if (service in byService) {
      byService[service].count++;
      byService[service].totalCredits += entry.creditsDeducted;
    }
  });

  return {
    recentUsage: usage,
    usageByService: byService,
  };
}
