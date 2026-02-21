# Credit System Implementation Guide

## ✅ Completed Changes

### 1. Database Schema Updates (`prisma/schema.prisma`)
- ✅ Removed `onboardingCompleted` field from User model
- ✅ Added credit tracking fields to User model:
  - `dailyCredits` (default: 15)
  - `dailyCreditLimit` (default: 15)
  - `lastCreditReset`
- ✅ Created `FeatureType` enum with all features
- ✅ Created `FeatureUsage` model for tracking all usage

### 2. Credit Management System (`src/lib/credits.ts`)
- ✅ Created comprehensive credit management utilities
- ✅ Defined credit costs per feature:
  - Cover Letter: 1 credit
  - Resume Review: 1 credit
  - Resume Analysis: 1 credit
  - Technical Interview: 10 credits per question
  - Behavioral Practice: 0.25 credits per question
  - System Design: 5 credits
  - Portfolio Review: 1 credit
  - Career Roadmap: 1 credit
- ✅ Daily credit limits by plan:
  - FREE: 15 credits/day
  - MONTHLY: 50 credits/day
  - ANNUAL: 65 credits/day
- ✅ Functions: `hasEnoughCredits()`, `deductCredits()`, `getCreditStatus()`, `checkAndResetCredits()`

### 3. Onboarding Removal
- ✅ Deleted `/src/app/get-started` directory
- ✅ Deleted `/src/app/api/user/onboarding` routes

### 4. Subscription Gate (`src/components/SubscriptionGate.tsx`)
- ✅ Created component to force subscription before accessing app
- ✅ Shows pricing plans (Monthly $25, Annual $199)
- ✅ Displays credit limits per plan

### 5. API Endpoints Created
- ✅ `/api/subscription-status` - Check if user has active subscription
- ✅ `/api/credits/status` - Get user's current credit status
- ✅ `/api/subscription/cancel` - Cancel subscription (sets cancelAtPeriodEnd)

### 6. User Dropdown Updates (`src/components/UserAccountDropdown.tsx`)
- ✅ Added "Cancel Subscription" option with confirmation dialog
- ✅ Added "Billing" link to manage subscription

### 7. Feature APIs Updated
- ✅ Cover Letter API (`/api/generate-cover-letter/route.ts`):
  - Credit check before generation
  - Credit deduction after success
  - Returns `creditsRemaining` in response

## 🔧 Remaining Tasks

### 1. Run Database Migration
```bash
cd /Users/akhil/Desktop/InterviewSense
npx prisma migrate dev --name add_credit_system
npx prisma generate
```

### 2. Update Remaining Feature APIs
Add credit checks and deductions to these APIs (following the pattern used in cover letter):

**Resume APIs:**
- `/src/app/api/resume-check/route.ts` - Add FeatureType.RESUME_REVIEW (1 credit)

**Interview APIs:**
- `/src/app/api/behavioral-interview/route.ts` - Add FeatureType.BEHAVIORAL_PRACTICE (0.25 credits per question)
- `/src/app/api/technical-assessment/route.ts` - Add FeatureType.TECHNICAL_INTERVIEW (10 credits per question)
- `/src/app/api/system-design/route.ts` - Add FeatureType.SYSTEM_DESIGN (5 credits)

**Other Features:**
- `/src/app/api/portfolio-review/route.ts` - Add FeatureType.PORTFOLIO_REVIEW (2 credits)
- `/src/app/api/career-roadmap/route.ts` - Add FeatureType.CAREER_ROADMAP (3 credits)

**Pattern to follow:**
```typescript
// 1. Add imports at top
import { deductCredits, hasEnoughCredits } from "@/lib/credits";
import { FeatureType } from "@prisma/client";

// 2. After auth check, get user and check credits
const user = await prisma.user.findUnique({
    where: { email: session.user.email },
});

if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
}

const creditCheck = await hasEnoughCredits(user.id, FeatureType.FEATURE_NAME, quantity);
if (!creditCheck.hasCredits) {
    return NextResponse.json({
        error: "Insufficient credits",
        message: `You need ${creditCheck.required} credits but only have ${creditCheck.available} remaining today.`,
        creditsAvailable: creditCheck.available,
        creditsRequired: creditCheck.required,
    }, { status: 402 });
}

// 3. After successful operation, deduct credits
const deduction = await deductCredits(
    user.id,
    FeatureType.FEATURE_NAME,
    quantity,
    { /* metadata */ }
);

// 4. Include creditsRemaining in response
return NextResponse.json({
    ...yourData,
    creditsRemaining: deduction.remainingCredits,
});
```

### 3. Wrap Dashboard with Subscription Gate
Update `/src/app/dashboard/page.tsx`:

```typescript
import SubscriptionGate from '@/components/SubscriptionGate'

export default function Dashboard() {
  return (
    <SubscriptionGate>
      {/* existing dashboard code */}
    </SubscriptionGate>
  )
}
```

### 4. Update Stripe Webhook
Update `/src/app/api/stripe/webhook/route.ts` to set credit limits when subscription changes:

```typescript
import { getDailyCreditLimit } from '@/lib/credits';

// In the subscription.created and subscription.updated handlers:
const plan = /* determine plan from priceId */;
const creditLimit = getDailyCreditLimit(plan);

await prisma.user.update({
  where: { id: user.id },
  data: {
    dailyCreditLimit: creditLimit,
    dailyCredits: creditLimit, // Reset to new limit
  },
});
```

### 5. Add Credit Display to Dashboard
Show users their daily credit usage:

```typescript
// In dashboard, fetch credit status
const creditStatus = await fetch('/api/credits/status');
const { dailyCredits, dailyCreditLimit, percentageUsed } = await creditStatus.json();

// Display in UI:
<div className="credit-meter">
  <p>{dailyCredits} / {dailyCreditLimit} credits remaining today</p>
  <progress value={dailyCredits} max={dailyCreditLimit} />
</div>
```

### 6. Handle Credit Errors in Frontend
Update frontend components to handle 402 (Payment Required) errors:

```typescript
try {
  const response = await fetch('/api/feature');
  const data = await response.json();

  if (response.status === 402) {
    // Show upgrade modal or credit purchase option
    showCreditModal(data.message, data.creditsRequired);
    return;
  }

  // Success - show creditsRemaining
  updateCreditDisplay(data.creditsRemaining);
} catch (error) {
  // Handle error
}
```

## 📝 Credit Costs Reference

| Feature | Credits | Notes |
|---------|---------|-------|
| Cover Letter Generation | 1 | Per letter |
| Resume Review | 1 | Per review |
| Resume Analysis | 1 | Per analysis |
| Technical Interview | 10 | Per question |
| Behavioral Practice | 0.25 | Per question |
| System Design | 5 | Per session |
| Portfolio Review | 1 | Per review |
| Career Roadmap | 1 | Per roadmap |

## 🔒 Daily Limits by Plan

| Plan | Daily Credits | Monthly Cost |
|------|--------------|--------------|
| Free Trial | 15 | Free (3 days) |
| Monthly | 50 | $25/month |
| Annual | 65 | $199/year |

## 🚀 Testing Checklist

After completing remaining tasks:

1. ✅ Run migration and verify database schema
2. ✅ Test subscription gate blocks access without subscription
3. ✅ Test credit deduction for each feature
4. ✅ Verify daily credit reset works (set `lastCreditReset` to yesterday)
5. ✅ Test insufficient credits error handling
6. ✅ Test subscription cancellation
7. ✅ Test plan upgrades adjust credit limits
8. ✅ Verify usage logging in `FeatureUsage` table

## 🎯 Key Files Modified

- `prisma/schema.prisma` - Database schema
- `src/lib/credits.ts` - Credit management system (NEW)
- `src/components/SubscriptionGate.tsx` - Subscription gate (NEW)
- `src/components/UserAccountDropdown.tsx` - Added cancel option
- `src/app/api/subscription-status/route.ts` - Subscription check (NEW)
- `src/app/api/credits/status/route.ts` - Credit status (NEW)
- `src/app/api/subscription/cancel/route.ts` - Cancel subscription (NEW)
- `src/app/api/generate-cover-letter/route.ts` - Added credit checks

## 💡 Notes

- Free trial users get 15 credits/day for 3 days
- Credits reset daily at midnight (user's local time based on `lastCreditReset`)
- All usage is logged in `FeatureUsage` table for analytics
- Subscription cancellation happens at period end (no immediate cutoff)
- Users can still use the app during grace period after cancellation
