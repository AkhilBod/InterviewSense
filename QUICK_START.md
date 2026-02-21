# 🚀 Quick Start - Test Credit System Locally

## Step-by-Step Testing (5 minutes)

### 1️⃣ Backup Current State (30 seconds)

```bash
cd /Users/akhil/Desktop/InterviewSense

# Backup schema
cp prisma/schema.prisma prisma/schema.prisma.backup

# Backup migrations
cp -r prisma/migrations prisma/migrations_backup
```

### 2️⃣ Run Database Migration (1 minute)

```bash
# This will:
# - Add credit columns to User table
# - Create FeatureUsage table
# - Create FeatureType enum
# - Remove onboardingCompleted column

npx prisma migrate dev --name add_credit_system

# Generate Prisma client with new types
npx prisma generate
```

**✅ Success if you see:** "Your database is now in sync with your schema."

### 3️⃣ Open Database & Verify Changes (30 seconds)

```bash
# Open Prisma Studio
npx prisma studio
```

**Check:**
- [ ] User table has `dailyCredits`, `dailyCreditLimit`, `lastCreditReset` columns
- [ ] FeatureUsage table exists
- [ ] Find/create a test user with some credits (set `dailyCredits` to 50)

### 4️⃣ Run Automated Tests (1 minute)

```bash
# Update test-credits.ts with your test user email (line 11)
# Then run:

npm install -D ts-node  # if not already installed
npx ts-node test-credits.ts
```

**✅ Expected Output:**
```
🧪 Testing Credit System...
✅ Credit Status: 50/50 credits
✅ Successfully deducted 1 credit
✅ Found 1 recent usage entries
✅ ALL TESTS COMPLETED SUCCESSFULLY!
```

### 5️⃣ Test in Browser (2 minutes)

```bash
# Start dev server
npm run dev
```

**Test Flow:**
1. **Login** with your test user
2. **Go to Cover Letter Generator** (or any feature you updated with credits)
3. **Generate a cover letter**
4. **Check console logs** - should see credit deduction
5. **Open Prisma Studio** - verify:
   - User's `dailyCredits` decreased by 1
   - New entry in `FeatureUsage` table

**Test Low Credits:**
1. In Prisma Studio, set user's `dailyCredits` to 0
2. Try generating another cover letter
3. Should get error: "Insufficient credits"

**Test Subscription Gate:**
1. Go to `/dashboard`
2. If you have no subscription, should see pricing modal
3. If you have subscription (status = ACTIVE), should see dashboard

---

## 🎯 Quick Verification Checklist

Run through this quickly:

- [ ] Migration ran without errors
- [ ] Prisma Studio shows new columns/tables
- [ ] `test-credits.ts` passes all tests
- [ ] Cover letter generation deducts 1 credit
- [ ] Low credits shows error message
- [ ] FeatureUsage table logs the action
- [ ] Subscription gate blocks unauthorized users
- [ ] Cancel subscription option appears in dropdown

---

## 🔧 If Something Goes Wrong

**Rollback:**
```bash
cp prisma/schema.prisma.backup prisma/schema.prisma
cp -r prisma/migrations_backup prisma/migrations
npx prisma migrate reset --force
npx prisma generate
```

**Or just fix and re-migrate:**
```bash
# Edit prisma/schema.prisma
npx prisma migrate dev --name fix_credit_system
```

---

## 📝 After Testing Locally - Deploy Steps

When everything works:

1. **Commit changes:**
   ```bash
   git add .
   git commit -m "feat: add credit-based subscription system"
   ```

2. **Push to production:**
   ```bash
   git push origin main
   ```

3. **Run migration on production database:**
   - If using Vercel/Railway/similar: Migration runs automatically
   - If manual: `npx prisma migrate deploy` on production

4. **Monitor production:**
   - Check error logs
   - Watch FeatureUsage table growth
   - Monitor users hitting credit limits

---

## 🎓 Understanding What Changed

**Database:**
- User gets 3 new columns for credit tracking
- New FeatureUsage table logs every feature use
- FeatureType enum defines all 8 features

**Code:**
- `src/lib/credits.ts` - All credit logic (check, deduct, reset)
- `src/components/SubscriptionGate.tsx` - Forces subscription before app access
- `src/app/api/generate-cover-letter/route.ts` - Example with credit checks

**User Experience:**
- Must have active subscription to access app
- See credit balance in dashboard (TODO: add display)
- Get clear error when out of credits
- Credits reset daily automatically
- Can cancel subscription from dropdown

---

## 💡 Pro Tips

1. **Test with different plans:**
   ```sql
   UPDATE "Subscription" SET plan = 'MONTHLY' WHERE "userId" = 'test-user-id';
   -- MONTHLY = 50 credits, ANNUAL = 65 credits
   ```

2. **Test daily reset:**
   ```sql
   UPDATE "User"
   SET "lastCreditReset" = NOW() - INTERVAL '25 hours'
   WHERE email = 'test@example.com';
   -- Next API call will trigger auto-reset
   ```

3. **Monitor usage:**
   ```sql
   SELECT featureType, COUNT(*), SUM(creditsUsed)
   FROM "FeatureUsage"
   WHERE "createdAt" > NOW() - INTERVAL '24 hours'
   GROUP BY featureType;
   ```

4. **Check credit economy:**
   ```sql
   SELECT
     AVG(dailyCredits) as avg_credits_remaining,
     COUNT(CASE WHEN dailyCredits < 10 THEN 1 END) as users_low_credits
   FROM "User"
   WHERE dailyCreditLimit > 0;
   ```

---

## ⚡ Super Quick Test (30 seconds)

If you just want to verify it works:

```bash
# 1. Migrate
npx prisma migrate dev

# 2. Test
npx ts-node test-credits.ts

# 3. Done!
```

If all tests pass ✅, you're good to deploy! 🚀
