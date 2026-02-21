# Local Testing Guide - Credit System

## 🧪 Safe Local Testing Setup

### Step 1: Backup Your Current Database Schema

Before making any changes, create a backup:

```bash
cd /Users/akhil/Desktop/InterviewSense

# Export current schema
npx prisma db pull --force

# Create a backup of your current migration state
cp -r prisma/migrations prisma/migrations_backup_$(date +%Y%m%d)

# Save current schema
cp prisma/schema.prisma prisma/schema.prisma.backup
```

### Step 2: Run Migration Locally

```bash
# Generate the migration (this creates SQL files but doesn't apply them yet)
npx prisma migrate dev --name add_credit_system --create-only

# Review the generated SQL in prisma/migrations/[timestamp]_add_credit_system/migration.sql
# Make sure it looks correct!

# Apply the migration to your LOCAL database
npx prisma migrate dev

# Generate Prisma Client with new types
npx prisma generate
```

**What this does:**
- Adds `dailyCredits`, `dailyCreditLimit`, `lastCreditReset` to User table
- Creates `FeatureUsage` table
- Creates `FeatureType` enum
- Removes `onboardingCompleted` column (existing users keep their data)

### Step 3: Verify Database Changes

Check your local database to confirm changes:

```bash
# Open Prisma Studio to inspect your database
npx prisma studio
```

Or use SQL directly:

```sql
-- Check User table has new columns
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'User'
AND column_name IN ('dailyCredits', 'dailyCreditLimit', 'lastCreditReset');

-- Check FeatureUsage table exists
SELECT table_name FROM information_schema.tables WHERE table_name = 'FeatureUsage';

-- Check FeatureType enum exists
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'FeatureType'::regtype;
```

### Step 4: Create Test User with Credits

Create a test user to verify the system:

```bash
# Open Prisma Studio
npx prisma studio
```

Then manually:
1. Go to User table
2. Find or create a test user
3. Set their credits:
   - `dailyCredits`: 10
   - `dailyCreditLimit`: 50
   - `lastCreditReset`: Current timestamp

Or use SQL:

```sql
-- Update existing user
UPDATE "User"
SET
  "dailyCredits" = 50,
  "dailyCreditLimit" = 50,
  "lastCreditReset" = NOW()
WHERE email = 'your-test-email@example.com';

-- Or create a new test user
INSERT INTO "User" (id, email, "emailVerified", "dailyCredits", "dailyCreditLimit", "lastCreditReset")
VALUES (
  'test_user_' || gen_random_uuid(),
  'test@example.com',
  NOW(),
  50,
  50,
  NOW()
);
```

### Step 5: Test Credit System Functions

Create a test script to verify credit functions work:

**Create:** `test-credits.ts`

```typescript
// test-credits.ts
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
    // Find your test user
    const user = await prisma.user.findUnique({
      where: { email: 'your-test-email@example.com' }
    })

    if (!user) {
      console.error('❌ Test user not found')
      return
    }

    console.log('🧪 Testing Credit System...\n')

    // Test 1: Get credit status
    console.log('📊 Test 1: Get Credit Status')
    const status = await getCreditStatus(user.id)
    console.log('✅ Credit Status:', {
      dailyCredits: status.dailyCredits,
      dailyCreditLimit: status.dailyCreditLimit,
      plan: status.plan,
      percentageUsed: status.percentageUsed
    })
    console.log('')

    // Test 2: Check if user has enough credits
    console.log('💰 Test 2: Check Credit Availability')
    const check = await hasEnoughCredits(user.id, FeatureType.COVER_LETTER, 1)
    console.log('✅ Has enough credits:', check.hasCredits)
    console.log('   Available:', check.available)
    console.log('   Required:', check.required)
    console.log('')

    // Test 3: Deduct credits
    console.log('➖ Test 3: Deduct Credits')
    const deduction = await deductCredits(
      user.id,
      FeatureType.COVER_LETTER,
      1,
      { test: true, timestamp: new Date().toISOString() }
    )
    console.log('✅ Deduction result:', {
      success: deduction.success,
      remainingCredits: deduction.remainingCredits
    })
    console.log('')

    // Test 4: Verify usage was logged
    console.log('📝 Test 4: Check Usage Log')
    const usageLog = await prisma.featureUsage.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
    console.log('✅ Recent usage:')
    usageLog.forEach(log => {
      console.log(`   - ${log.featureType}: ${log.creditsUsed} credits (${log.createdAt})`)
    })
    console.log('')

    // Test 5: Test insufficient credits
    console.log('🚫 Test 5: Test Insufficient Credits')
    await prisma.user.update({
      where: { id: user.id },
      data: { dailyCredits: 0 }
    })
    const insufficientCheck = await hasEnoughCredits(user.id, FeatureType.TECHNICAL_INTERVIEW, 1)
    console.log('✅ Should be false:', !insufficientCheck.hasCredits)
    console.log('   Error message would be:',
      `Need ${insufficientCheck.required} but have ${insufficientCheck.available}`)
    console.log('')

    // Reset credits for next test
    await prisma.user.update({
      where: { id: user.id },
      data: { dailyCredits: 50 }
    })

    // Test 6: Test daily reset
    console.log('🔄 Test 6: Test Daily Reset')
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastCreditReset: new Date(Date.now() - 25 * 60 * 60 * 1000) // 25 hours ago
      }
    })
    const resetResult = await checkAndResetCredits(user.id)
    console.log('✅ Credits reset:', {
      newCredits: resetResult.dailyCredits,
      limit: resetResult.dailyCreditLimit
    })

    console.log('\n✅ All tests passed!\n')

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCreditSystem()
```

**Run the test:**

```bash
# Install ts-node if needed
npm install -D ts-node

# Run the test
npx ts-node test-credits.ts
```

### Step 6: Test API Endpoints Locally

Start your development server:

```bash
npm run dev
```

**Test 1: Check Subscription Status**

```bash
# Get your session token first (login to your app in browser)
# Then use the session cookie in requests

curl http://localhost:3000/api/subscription-status \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Test 2: Check Credit Status**

```bash
curl http://localhost:3000/api/credits/status \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Test 3: Test Cover Letter Generation with Credits**

```bash
# This should deduct 1 credit
curl -X POST http://localhost:3000/api/generate-cover-letter \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -F "jobDescription=Software Engineer position..." \
  -F "companyName=Test Company" \
  -F "resume=@/path/to/test-resume.pdf"

# Check response for creditsRemaining field
```

**Test 4: Test Insufficient Credits**

```sql
-- Set credits to 0
UPDATE "User" SET "dailyCredits" = 0 WHERE email = 'test@example.com';
```

```bash
# Try the API again - should get 402 error
curl -X POST http://localhost:3000/api/generate-cover-letter \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -F "jobDescription=Test" \
  -F "companyName=Test" \
  -F "resume=@/path/to/test-resume.pdf"

# Expected response:
# {
#   "error": "Insufficient credits",
#   "message": "You need 1 credits but only have 0 remaining today...",
#   "creditsAvailable": 0,
#   "creditsRequired": 1
# }
```

### Step 7: Test Subscription Gate

1. **Without subscription:**
   - Create a test user with no subscription
   - Try to access `/dashboard`
   - Should see subscription gate modal

2. **With subscription:**
   - Set user's subscription status to ACTIVE
   - Access `/dashboard`
   - Should see dashboard normally

```sql
-- Create active subscription for test user
INSERT INTO "Subscription" (
  id,
  "userId",
  "stripeCustomerId",
  plan,
  status,
  "createdAt",
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'your-test-user-id',
  'test_stripe_customer',
  'MONTHLY',
  'ACTIVE',
  NOW(),
  NOW()
);
```

### Step 8: Test Cancel Subscription

1. Login with a test user that has an active subscription
2. Click user dropdown → "Cancel Subscription"
3. Confirm cancellation
4. Check database:

```sql
SELECT
  "cancelAtPeriodEnd",
  "canceledAt",
  status
FROM "Subscription"
WHERE "userId" = 'your-test-user-id';
```

Should show:
- `cancelAtPeriodEnd`: true
- `canceledAt`: timestamp
- `status`: still ACTIVE (until period end)

---

## 🔍 Verification Checklist

Before deploying to production, verify:

- [ ] Migration applied successfully without errors
- [ ] User table has new credit columns
- [ ] FeatureUsage table exists
- [ ] FeatureType enum has all 8 types
- [ ] `onboardingCompleted` column removed (or data migrated)
- [ ] Test user can check credit status
- [ ] Credits deduct correctly after feature use
- [ ] Insufficient credits returns 402 error
- [ ] Daily reset works (test by setting old `lastCreditReset`)
- [ ] FeatureUsage logs are created
- [ ] Subscription gate blocks users without subscription
- [ ] Cancel subscription works and updates database
- [ ] All credit costs are correct per feature

---

## 🚨 Rollback Plan (If Something Goes Wrong)

If you need to rollback:

```bash
# Restore backup schema
cp prisma/schema.prisma.backup prisma/schema.prisma

# Restore migrations
rm -rf prisma/migrations
cp -r prisma/migrations_backup_YYYYMMDD prisma/migrations

# Reset database to previous state
npx prisma migrate reset --force

# Regenerate client
npx prisma generate
```

**Or rollback just the last migration:**

```bash
# This will undo the last migration
npx prisma migrate resolve --rolled-back add_credit_system

# Then manually run SQL to drop tables/columns if needed
```

---

## 📊 Monitoring After Deployment

After deploying to production, monitor:

1. **FeatureUsage table growth:**
   ```sql
   SELECT COUNT(*) FROM "FeatureUsage";
   SELECT featureType, COUNT(*) FROM "FeatureUsage" GROUP BY featureType;
   ```

2. **Users running out of credits:**
   ```sql
   SELECT email, dailyCredits, dailyCreditLimit
   FROM "User"
   WHERE dailyCredits < 5
   AND dailyCreditLimit > 0;
   ```

3. **Failed credit deductions:**
   ```sql
   SELECT * FROM "FeatureUsage" WHERE success = false;
   ```

4. **Daily reset issues:**
   ```sql
   SELECT email, lastCreditReset
   FROM "User"
   WHERE lastCreditReset < NOW() - INTERVAL '25 hours'
   AND dailyCreditLimit > 0;
   ```

---

## 🎯 Quick Test Commands Reference

```bash
# 1. Backup
cp prisma/schema.prisma prisma/schema.prisma.backup

# 2. Migrate
npx prisma migrate dev

# 3. Generate
npx prisma generate

# 4. Studio
npx prisma studio

# 5. Test credits
npx ts-node test-credits.ts

# 6. Start dev server
npm run dev

# 7. Check logs
tail -f .next/server.log
```

---

## ✅ Safe to Deploy When:

- All local tests pass
- Credit deduction works correctly
- Subscription gate blocks unauthorized access
- Cancel subscription updates database correctly
- No console errors in browser
- API returns proper error codes (402 for insufficient credits)
- Usage logs are being created

**Then you're ready to deploy! 🚀**
