# 🧪 Stripe Local Testing Guide

## ✅ What's Already Set Up

Your `.env.local` now has:
- ✅ Stripe TEST mode keys (pk_test_... and sk_test_...)
- ✅ Monthly Price ID: `price_1T3KmACkPyW8WRobSrTmPmd6`
- ✅ Annual Price ID: `price_1T3KmbCkPyW8WRobhfopYqgS`
- ✅ Supabase database connection
- ✅ All environment variables configured

---

## 🚀 Step-by-Step Testing Guide

### Step 1: Install Stripe CLI (5 min)

**On macOS:**
```bash
brew install stripe/stripe-cli/stripe
```

**On Windows:**
Download from: https://github.com/stripe/stripe-cli/releases/latest

**On Linux:**
```bash
# Download the latest release
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_x86_64.tar.gz
tar -xvf stripe_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin
```

**Verify installation:**
```bash
stripe --version
```

---

### Step 2: Login to Stripe CLI (2 min)

```bash
stripe login
```

This will:
1. Open browser to authenticate
2. Connect CLI to your Stripe test account
3. Return "Done! The Stripe CLI is configured for [your account]"

---

### Step 3: Run Database Migration (2 min)

Before testing, ensure your database has the credit system tables:

```bash
cd /Users/akhil/Desktop/InterviewSense

# Run Prisma migration
npx prisma migrate dev --name add_credit_system

# Generate Prisma client
npx prisma generate

# Optional: Open Prisma Studio to verify tables
npx prisma studio
```

**Verify these tables exist:**
- ✅ User (with `dailyCredits`, `dailyCreditLimit`, `lastCreditReset`)
- ✅ FeatureUsage
- ✅ SavedQuestion
- ✅ FeatureType enum
- ✅ QuestionType enum

---

### Step 4: Start Your Dev Server (1 min)

Open **Terminal 1**:
```bash
cd /Users/akhil/Desktop/InterviewSense
npm run dev
```

Keep this running! Your app is now at: http://localhost:3000

---

### Step 5: Forward Webhooks to Local Server (1 min)

Open **Terminal 2** (keep both terminals open):
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Important Output:**
You'll see something like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

**Copy that `whsec_xxxxxxxxxxxxx` value!**

---

### Step 6: Update Webhook Secret (30 sec)

Update your `.env.local` with the webhook secret from Step 5:

```bash
# In .env.local, replace this line:
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx  # ← Paste your actual secret here
```

**Restart your dev server** (Terminal 1):
- Press `Ctrl+C` to stop
- Run `npm run dev` again

---

### Step 7: Test Subscription Flow 🎉

Now you're ready to test!

#### 7.1 Sign Up / Login
1. Go to http://localhost:3000
2. Sign up or login with test account
3. You'll be redirected to dashboard

#### 7.2 Start Subscription
1. Click "Upgrade Plan" or go to `/dashboard/billing`
2. Select Monthly ($4.99/mo) or Annual ($49/yr)
3. Click "Subscribe Now"

#### 7.3 Use Stripe Test Cards

When checkout opens, use these **test credit cards**:

**✅ Successful Payment:**
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

**❌ Card Declined:**
```
Card Number: 4000 0000 0000 0002
```

**🔄 Requires 3D Secure:**
```
Card Number: 4000 0025 0000 3155
```

#### 7.4 Complete Checkout
1. Enter card details
2. Click "Subscribe"
3. Stripe redirects to success page
4. You should see webhook events in Terminal 2!

---

### Step 8: Verify Everything Works ✅

#### Check Terminal 2 (Webhook Events)
You should see:
```
✓ customer.created
✓ payment_method.attached
✓ customer.subscription.created
✓ invoice.created
✓ invoice.finalized
✓ payment_intent.created
✓ payment_intent.succeeded
✓ invoice.paid
✓ checkout.session.completed
```

#### Check Database (Prisma Studio)
```bash
npx prisma studio
```

1. Open **User** table
2. Find your user
3. Verify fields updated:
   - ✅ `stripeCustomerId`: `cus_xxxxx`
   - ✅ `stripeSubscriptionId`: `sub_xxxxx`
   - ✅ `stripePriceId`: `price_1T3KmACkPyW8WRob...`
   - ✅ `stripeCurrentPeriodEnd`: future date
   - ✅ `dailyCredits`: 50 (Monthly) or 65 (Annual)
   - ✅ `dailyCreditLimit`: 50 (Monthly) or 65 (Annual)

#### Check Dashboard
1. Go to http://localhost:3000/dashboard
2. Should see credit balance: **50/50** (Monthly) or **65/65** (Annual)
3. Subscription should show as active

---

## 🧪 Test Scenarios

### Test 1: Subscription Creates Credits ✅
- Subscribe with test card
- Check database: `dailyCredits` and `dailyCreditLimit` set correctly
- Dashboard shows credit balance

### Test 2: Credit Deduction ✅
1. Generate a cover letter (costs 1 credit)
2. Check database: `dailyCredits` decreased by 1
3. Check `FeatureUsage` table for log entry
4. Dashboard shows updated balance

### Test 3: Credit Limit Enforcement ✅
1. Manually set `dailyCredits` to 0 in database
2. Try to generate cover letter
3. Should see "Insufficient credits" error
4. Blocked from using feature

### Test 4: Cancel Subscription ✅
1. Click user dropdown → "Cancel Subscription"
2. Confirm cancellation
3. Check Stripe Dashboard: subscription set to cancel at period end
4. Database: `cancelAtPeriodEnd` = true
5. User can still use app until period ends

### Test 5: Daily Credit Reset ✅
1. Use some credits today
2. Manually set `lastCreditReset` to yesterday in database
3. Make any API call (checks and resets credits)
4. Credits should reset to daily limit

### Test 6: Upgrade Plan ✅
1. Subscribe to Monthly
2. Cancel and subscribe to Annual
3. Credits should update to 65
4. Webhook processes correctly

---

## 📊 Monitoring Tools

### 1. Stripe Dashboard (Test Mode)
https://dashboard.stripe.com/test/payments

See all:
- Payments
- Subscriptions
- Customers
- Events
- Webhooks

### 2. Prisma Studio (Database)
```bash
npx prisma studio
```

Browse all tables in real-time.

### 3. Webhook Logs (Terminal 2)
Watch webhook events as they happen.

### 4. Browser DevTools
- Network tab: See API requests
- Console: Check for errors
- Application → Local Storage: Check session data

---

## 🐛 Troubleshooting

### Webhook Secret Mismatch
**Error:** "No signatures found matching the expected signature"

**Fix:**
1. Check Terminal 2 for webhook secret
2. Update `.env.local` with correct `STRIPE_WEBHOOK_SECRET`
3. Restart dev server (Terminal 1)

### Webhook Not Receiving Events
**Fix:**
1. Ensure Terminal 2 is running `stripe listen --forward-to localhost:3000/api/stripe/webhook`
2. Check firewall isn't blocking localhost:3000
3. Verify route exists at `/api/stripe/webhook`

### Database Not Updating
**Fix:**
1. Check webhook route logs for errors
2. Verify Prisma client is generated: `npx prisma generate`
3. Check database connection in `.env.local`

### Credits Not Set After Subscription
**Fix:**
1. Check `checkout.session.completed` event is firing
2. Verify webhook handler updates user credits
3. Check Prisma Studio for user record

### "Insufficient Credits" Even with Credits
**Fix:**
1. Check `lastCreditReset` - if old, credits may need reset
2. Verify API route calls `checkAndResetCredits()` first
3. Check `dailyCreditLimit` is set correctly

---

## 🎯 Test Checklist

Before going to production, test ALL these:

### Subscription Flow
- [ ] User can subscribe to Monthly plan
- [ ] User can subscribe to Annual plan
- [ ] Checkout redirects to success page
- [ ] Database updates with Stripe IDs
- [ ] Credits set to correct limit (50 or 65)

### Credit System
- [ ] Cover letter deducts 1 credit
- [ ] Resume review deducts 1 credit
- [ ] Technical interview deducts 10 credits
- [ ] Behavioral practice deducts 0.25 credits
- [ ] Insufficient credits blocks feature
- [ ] Credits reset daily at midnight

### Subscription Management
- [ ] User can view subscription status
- [ ] User can cancel subscription
- [ ] Cancel sets `cancelAtPeriodEnd` = true
- [ ] User retains access until period ends
- [ ] User can upgrade/downgrade plan

### Edge Cases
- [ ] Free user has 15 credits daily
- [ ] Expired subscription reverts to free tier
- [ ] Multiple subscriptions handled correctly
- [ ] Webhook retries work on failure

---

## 📝 What's Next?

After local testing succeeds:

1. **Add More Credit Checks** (7 APIs remaining):
   - `/api/resume-check`
   - `/api/behavioral-interview`
   - `/api/technical-assessment`
   - `/api/system-design`
   - `/api/portfolio-review`
   - `/api/career-roadmap`
   - `/api/resume-analyses`

2. **Wrap Dashboard with SubscriptionGate**:
   - Force subscription before app access
   - Show pricing page to free users

3. **Test Question Bank Feature**:
   - Save questions from `/questions` page
   - View saved questions in `/dashboard/saved-questions`
   - Practice saved questions

4. **Deploy to Production**:
   - Switch to LIVE Stripe keys in `.env.local`
   - Update webhook endpoint in Stripe Dashboard
   - Test with real bank account (small amount)
   - Monitor first real subscriptions

---

## 💳 Stripe Test Cards Reference

| Scenario | Card Number |
|----------|-------------|
| Success | 4242 4242 4242 4242 |
| Declined | 4000 0000 0000 0002 |
| Insufficient Funds | 4000 0000 0000 9995 |
| Lost Card | 4000 0000 0000 9987 |
| Stolen Card | 4000 0000 0000 9979 |
| Expired Card | 4000 0000 0000 0069 |
| Processing Error | 4000 0000 0000 0119 |
| 3D Secure Required | 4000 0025 0000 3155 |

**For all cards:**
- Use any future expiry date
- Use any 3-digit CVC
- Use any ZIP code

---

## 🎉 You're Ready!

Run these commands in order:

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Forward webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy webhook secret from Terminal 2 output
# Update .env.local with STRIPE_WEBHOOK_SECRET
# Restart Terminal 1 (npm run dev)

# Browser: Test subscription
# Visit http://localhost:3000
# Sign up → Subscribe → Use 4242 4242 4242 4242
```

**Questions?** Check the troubleshooting section above! 🚀
