# Quick Reference: Adding Credit Checks to Feature APIs

## Files to Update (in order of priority)

### HIGH PRIORITY - Main Features

1. **Resume Check** `/src/app/api/resume-check/route.ts`
   - Feature: `FeatureType.RESUME_REVIEW`
   - Cost: 1 credit
   - Quantity: 1

2. **Behavioral Interview** `/src/app/api/behavioral-interview/route.ts`
   - Feature: `FeatureType.BEHAVIORAL_PRACTICE`
   - Cost: 0.25 credits
   - Quantity: Number of questions answered (check request body)

3. **Technical Assessment** `/src/app/api/technical-assessment/route.ts`
   - Feature: `FeatureType.TECHNICAL_INTERVIEW`
   - Cost: 10 credits
   - Quantity: Number of questions (check request body)

4. **System Design** `/src/app/api/system-design/route.ts`
   - Feature: `FeatureType.SYSTEM_DESIGN`
   - Cost: 5 credits
   - Quantity: 1

### MEDIUM PRIORITY - Additional Features

5. **Portfolio Review** `/src/app/api/portfolio-review/route.ts`
   - Feature: `FeatureType.PORTFOLIO_REVIEW`
   - Cost: 1 credit
   - Quantity: 1

6. **Career Roadmap** `/src/app/api/career-roadmap/route.ts`
   - Feature: `FeatureType.CAREER_ROADMAP`
   - Cost: 1 credit
   - Quantity: 1

## Code Template

Copy this template for each API file:

```typescript
// Add to imports at top
import { deductCredits, hasEnoughCredits } from "@/lib/credits";
import { FeatureType } from "@prisma/client";

// After session authentication
const user = await prisma.user.findUnique({
    where: { email: session.user.email },
});

if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
}

// Check credits BEFORE processing
const creditCheck = await hasEnoughCredits(
    user.id,
    FeatureType.YOUR_FEATURE_HERE, // e.g., FeatureType.RESUME_REVIEW
    1 // or quantity from request
);

if (!creditCheck.hasCredits) {
    return NextResponse.json({
        error: "Insufficient credits",
        message: `You need ${creditCheck.required} credits but only have ${creditCheck.available} remaining today. Upgrade your plan for more credits.`,
        creditsAvailable: creditCheck.available,
        creditsRequired: creditCheck.required,
    }, { status: 402 }); // 402 = Payment Required
}

// ... your existing feature logic ...

// After successful operation, DEDUCT credits
const deduction = await deductCredits(
    user.id,
    FeatureType.YOUR_FEATURE_HERE,
    1, // or quantity
    {
        // Optional metadata for logging
        anyRelevantInfo: "value",
    }
);

if (!deduction.success) {
    console.error("Failed to deduct credits:", deduction.error);
    // Log error but still return result to user
}

// Include remaining credits in response
return NextResponse.json({
    ...yourExistingResponse,
    creditsRemaining: deduction.remainingCredits,
});
```

## Find Files Command

Run this to find all feature API files:

```bash
cd /Users/akhil/Desktop/InterviewSense
ls -la src/app/api/*/route.ts | grep -E "(resume|interview|behavioral|technical|system-design|portfolio|career)"
```

## Testing Each Feature

After updating each API:

1. **Test insufficient credits:**
   ```sql
   -- Set user credits to 0
   UPDATE "User" SET "dailyCredits" = 0 WHERE email = 'your-test-email@example.com';
   ```

2. **Make API call** - Should return 402 error

3. **Reset credits:**
   ```sql
   -- Reset to normal
   UPDATE "User" SET "dailyCredits" = 50 WHERE email = 'your-test-email@example.com';
   ```

4. **Make API call** - Should succeed and deduct credits

5. **Check credits:**
   ```sql
   SELECT "dailyCredits", "dailyCreditLimit" FROM "User" WHERE email = 'your-test-email@example.com';
   ```

6. **Check usage log:**
   ```sql
   SELECT * FROM "FeatureUsage" WHERE "userId" = 'user-id' ORDER BY "createdAt" DESC LIMIT 10;
   ```

## Frontend Error Handling

Add to your frontend fetch calls:

```typescript
async function callFeatureAPI(endpoint: string, data: any) {
  const response = await fetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  const result = await response.json();

  // Handle insufficient credits
  if (response.status === 402) {
    toast.error(result.message || "Insufficient credits");
    // Show upgrade modal
    showUpgradeModal(result.creditsRequired, result.creditsAvailable);
    return null;
  }

  // Update credit display if available
  if (result.creditsRemaining !== undefined) {
    updateCreditDisplay(result.creditsRemaining);
  }

  return result;
}
```
