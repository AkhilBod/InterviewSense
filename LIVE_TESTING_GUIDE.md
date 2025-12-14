# Live Testing Guide - Payment System

## Pre-Testing Checklist
- [ ] Vercel deployment complete and live at https://interviewsense.org
- [ ] All environment variables set in Vercel
- [ ] Database migration deployed to Neon (check tables exist)
- [ ] Stripe webhook configured and receiving events

---

## 1. Basic Page Loads & UI
### Landing Page
- [ ] Visit https://interviewsense.org
- [ ] Scroll to "Simple, Transparent Pricing" section
- [ ] Verify 3 pricing cards display (Basic Free, Plus $5, Pro $9)
- [ ] Check responsive design (mobile, tablet, desktop)
- [ ] Buttons visible and clickable

### Pricing Page
- [ ] Click "View All Plans" or "Upgrade" button
- [ ] Should redirect to https://interviewsense.org/pricing
- [ ] All pricing tiers and features display
- [ ] Compare button shows service costs (Resume=1, Technical=3, etc.)

### Billing Dashboard
- [ ] Login with test account
- [ ] Navigate to /billing or account settings
- [ ] Should show current plan (Basic free 6/week)
- [ ] Shows next billing date (if on paid plan)
- [ ] Credit balance visible

---

## 2. Authentication & User Flow
### Sign Up Flow
- [ ] Create new test account (or use existing)
- [ ] Verify email works
- [ ] Default plan is Basic (6 credits/week free)
- [ ] Can login/logout without issues

### Session Management
- [ ] Stay logged in across pages
- [ ] Pricing page loads when authenticated
- [ ] User profile displays correctly

---

## 3. Credit System Testing

### Basic Tier (Free 6 Credits/Week)
- [ ] Check `/api/user/subscription` endpoint
  - Should return: `tier: "basic"`, `credits: 6`, `periodEnd` timestamp
- [ ] Verify credits display on dashboard
- [ ] Use 1 credit service (Resume Review)
  - Should deduct 1 credit
  - Should show 5 remaining
- [ ] Use 3 credit service (Behavioral Interview)
  - Should deduct 3 credits
  - Should show 2 remaining

### Out of Credits Modal
- [ ] Try to use service needing 3 credits when only 2 remain
- [ ] Modal should popup showing:
  - Current credits: 2
  - Needed: 3
  - Shortage: 1
  - Service cost table
  - Plus ($5) and Pro ($9) upgrade buttons
- [ ] Modal has close button (X)
- [ ] Can click "Upgrade to Plus" or "Upgrade to Pro"

### Credit Ledger
- [ ] Check `/api/user/credit-usage` endpoint
  - Should show transaction history
  - Each entry shows: serviceType, creditsDeducted, balance, timestamp
  - Ledger is immutable (can't modify past transactions)

---

## 4. Stripe Payment Integration

### Checkout Flow
- [ ] Click "Upgrade to Plus" button
- [ ] Redirected to Stripe checkout (test mode)
- [ ] Session created with:
  - Correct price ID: price_1SeM3jCfwBMSq4wO...
  - Billing mode: subscription
  - Success URL: https://interviewsense.org/billing
  - Cancel URL: https://interviewsense.org/pricing

### Test Payment
- [ ] Complete checkout with test card: `4242 4242 4242 4242`
- [ ] Expiry: Any future date (e.g., 12/25)
- [ ] CVC: Any 3 digits (e.g., 123)
- [ ] Name: Your name
- [ ] Email: Your email
- [ ] Click "Subscribe"

### Post-Payment Verification
- [ ] Redirected back to https://interviewsense.org/billing
- [ ] Plan upgraded to Plus
- [ ] Credits show unlimited (or very high number)
- [ ] Next billing date displays
- [ ] Check database: `Subscription` table has new record with:
  - `userId`: Your user ID
  - `tier`: "plus"
  - `stripeCustomerId`: cus_...
  - `stripeSubscriptionId`: sub_...
  - `status`: "active"

---

## 5. Webhook Testing

### Stripe Webhook Events
- [ ] Go to Stripe Dashboard → Developers → Webhooks
- [ ] Check endpoint: https://interviewsense.org/api/stripe/webhook
- [ ] Should show recent events:
  - `checkout.session.completed`
  - `customer.subscription.updated`

### Event Details
- [ ] Click on `checkout.session.completed` event
- [ ] Should show full payload with:
  - Customer ID
  - Subscription ID
  - Email
  - Amount paid
- [ ] Response code: 200 OK

### Database Sync After Webhook
- [ ] Check Neon database → `Subscription` table
- [ ] New subscription record exists
- [ ] `status` is "active"
- [ ] `currentPeriodStart` and `currentPeriodEnd` are correct
- [ ] Stripe IDs match webhook data

---

## 6. Service Integration Tests

### Resume Review (1 credit)
- [ ] Upload resume
- [ ] Check credits before: X
- [ ] Click "Analyze Resume"
- [ ] If credits >= 1:
  - [ ] Analysis completes
  - [ ] Credits now X-1
- [ ] If credits < 1:
  - [ ] Out of credits modal appears
  - [ ] Resume analysis blocked

### Behavioral Interview (3 credits)
- [ ] Start behavioral interview
- [ ] Check credits before: X
- [ ] If credits >= 3:
  - [ ] Interview loads
  - [ ] Can record answer
  - [ ] After completion, credits deducted
- [ ] If credits < 3:
  - [ ] Out of credits modal appears
  - [ ] Interview blocked

### Technical Assessment (3 credits)
- [ ] Similar flow as behavioral
- [ ] Requires 3 credits
- [ ] Test both success (enough credits) and failure (out of credits)

### Cover Letter (1 credit)
- [ ] Generate cover letter
- [ ] Requires 1 credit
- [ ] Test both scenarios

### System Design (4 credits)
- [ ] Start system design session
- [ ] Requires 4 credits
- [ ] Test with sufficient and insufficient credits

### Portfolio Review (3 credits)
- [ ] Upload portfolio
- [ ] Requires 3 credits
- [ ] Test modal triggers when insufficient

---

## 7. Plan Upgrade/Downgrade Tests

### Upgrade Plus → Pro
- [ ] Login with Plus account
- [ ] Go to /pricing
- [ ] Click "Upgrade to Pro"
- [ ] New Stripe checkout for Pro plan
- [ ] After payment:
  - [ ] Dashboard shows Pro plan
  - [ ] Credits show unlimited
  - [ ] Old Plus subscription cancelled
  - [ ] Database shows: tier="pro", status="active"

### Cancel Subscription
- [ ] Go to Stripe Dashboard → Customers
- [ ] Find your test customer
- [ ] Cancel their subscription
- [ ] Check webhook event received
- [ ] Database updates: status="cancelled"
- [ ] Dashboard should show downgraded to Basic (6/week)

---

## 8. Database Verification

### Tables Exist
```sql
-- Run in Neon console
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```
Should show: `Subscription`, `CreditLedger` tables exist

### Subscription Table
```sql
SELECT * FROM "Subscription" WHERE "userId" = 'your-user-id';
```
Should show:
- `id`: UUID
- `userId`: Your ID
- `tier`: "basic", "plus", or "pro"
- `credits`: Number or NULL (if unlimited)
- `stripeCustomerId`: cus_...
- `stripeSubscriptionId`: sub_...
- `stripeProductId`: prod_...
- `status`: "active", "cancelled", etc.
- `currentPeriodStart`: timestamp
- `currentPeriodEnd`: timestamp
- `createdAt`: timestamp

### CreditLedger Table
```sql
SELECT * FROM "CreditLedger" WHERE "userId" = 'your-user-id' 
ORDER BY "createdAt" DESC LIMIT 10;
```
Should show:
- `id`: UUID
- `userId`: Your ID
- `serviceType`: "resume", "behavioral", "technical", "cover_letter", "system_design", "portfolio"
- `creditsDeducted`: 1, 3, 4, etc.
- `balance`: Running total
- `createdAt`: timestamp

---

## 9. Error Scenarios

### Insufficient Credits Modal
- [ ] Service blocks with out-of-credits modal
- [ ] Can close modal with X button
- [ ] Can click pricing link to go to /pricing
- [ ] "Upgrade to Plus" button works
- [ ] "Upgrade to Pro" button works

### Failed Payment
- [ ] Use declined card: `4000 0000 0000 0002`
- [ ] Checkout should fail
- [ ] Error message displays
- [ ] Subscription not created
- [ ] Credits not charged

### Network Errors
- [ ] Simulate offline (DevTools Network tab → Offline)
- [ ] Try to access /pricing
- [ ] Page should handle gracefully
- [ ] Error message or fallback UI

---

## 10. Performance & Security Tests

### API Endpoints
- [ ] Test `/api/user/subscription` - Returns subscription info quickly
- [ ] Test `/api/user/credit-usage` - Returns ledger (< 200ms)
- [ ] Test `/api/stripe/checkout` - Creates session (< 1s)
- [ ] Test `/api/stripe/webhook` - Processes events (< 200ms)

### Security
- [ ] Unauthenticated users cannot access `/api/user/*` endpoints
- [ ] Stripe secret key NOT exposed in browser console
- [ ] Database credentials NOT visible in client-side code
- [ ] Webhook secret properly validated
- [ ] CORS headers configured correctly

### Rate Limiting
- [ ] Rapid checkout requests don't create duplicate sessions
- [ ] Webhook replays don't double-charge
- [ ] Service requests properly debounced

---

## 11. Mobile Testing
- [ ] Pricing cards stack on mobile
- [ ] Buttons clickable on mobile
- [ ] Stripe checkout works on mobile
- [ ] Out-of-credits modal responsive on mobile
- [ ] Dashboard readable on mobile

---

## 12. Cross-Browser Testing
Test on:
- [ ] Chrome/Chromium
- [ ] Safari
- [ ] Firefox
- [ ] Mobile Safari (iPhone)
- [ ] Chrome Mobile (Android)

---

## Troubleshooting

### Payment Not Processing
1. Check Stripe Dashboard → Events → Look for errors
2. Check Vercel logs: https://vercel.com/dashboard → InterviewSense → Logs
3. Verify webhook secret in .env matches Stripe dashboard
4. Verify price IDs are correct

### Credits Not Deducting
1. Check database: Is CreditLedger record created?
2. Check server logs for errors in `/api/stripe/webhook`
3. Verify `checkAndDeductCredits` function called before service

### Modal Not Appearing
1. Check browser console for errors
2. Verify `OutOfCreditsModal` imported in service pages
3. Check state management for modal visibility
4. Verify credit check returns correct balance

### Webhook Not Firing
1. Check Stripe Dashboard → Webhooks → Recent deliveries
2. Verify endpoint URL: https://interviewsense.org/api/stripe/webhook
3. Check response code (should be 200)
4. Review server logs for webhook processing

---

## Success Criteria
✅ All tests pass
✅ No console errors
✅ Database properly updated
✅ Stripe webhooks received
✅ Credits deduct correctly
✅ Modal shows when needed
✅ Payments process successfully
✅ Mobile responsive
✅ Performance acceptable
✅ No security issues
