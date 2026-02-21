import { prisma } from '@/lib/prisma';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';

export async function checkSubscriptionAccess(userId: string): Promise<boolean> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) return false;

  return (
    subscription.status === 'ACTIVE' || subscription.status === 'TRIALING'
  );
}

export const PREMIUM_FEATURES = {
  ADVANCED_FILTERS: ['MONTHLY', 'ANNUAL'],
  VIDEO_GUIDES: ['MONTHLY', 'ANNUAL'],
  QUESTION_PLAYLISTS: ['MONTHLY', 'ANNUAL'],
  COACHING_DISCOUNT: ['MONTHLY', 'ANNUAL'],
  COMMUNITY_ACCESS: ['ANNUAL'],
} as const;

export function hasFeatureAccess(
  plan: SubscriptionPlan,
  feature: keyof typeof PREMIUM_FEATURES
): boolean {
  return PREMIUM_FEATURES[feature].includes(plan);
}

export async function getUserSubscription(userId: string) {
  return await prisma.subscription.findUnique({
    where: { userId },
  });
}
