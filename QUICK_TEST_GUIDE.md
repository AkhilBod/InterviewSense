# 🚀 Quick Test Guide - Stripe Integration

## ✅ Current Status
- ✅ Database synced (Supabase)
- ✅ Prisma Studio running at http://localhost:5555
- ✅ Stripe TEST keys configured
- ✅ Credit system ready

---

## 🎯 3-Step Testing Process

### Step 1: Start Dev Server
```bash
npm run dev
```
**Wait for:** "Ready on http://localhost:3000"

---

### Step 2: Start Stripe Webhook Forwarding
```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**You'll see:**
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

**Copy that secret** and update `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx  # ← Paste here
```

**Then restart** your dev server (Step 1).

---

### Step 3: Test Subscription
1. Go to http://localhost:3000
2. **Sign up** with test email (e.g., test@example.com)
3. Click **Upgrade/Subscribe**
4. Use test card: **4242 4242 4242 4242**
   - Expiry: 12/26
   - CVC: 123
   - ZIP: 12345
5. Complete checkout

---

## 🔍 Verify It Worked

### Check Webhook Events (Terminal 2)
You should see:
```
✓ customer.created
✓ customer.subscription.created
✓ invoice.created
✓ payment_intent.succeeded
✓ checkout.session.completed
```

### Check Database (Prisma Studio)
http://localhost:5555

1. Click **User** table
2. Find your test user
3. Verify:
   - ✅ `stripeCustomerId`: cus_xxxxx
   - ✅ `stripeSubscriptionId`: sub_xxxxx
   - ✅ `dailyCredits`: 50 (Monthly) or 65 (Annual)
   - ✅ `dailyCreditLimit`: 50 (Monthly) or 65 (Annual)

### Check App (Browser)
http://localhost:3000/dashboard

Should show:
- ✅ Credit balance: 50/50 (or 65/65)
- ✅ Active subscription status

---

## 🧪 Test Credit Deduction

1. Generate a cover letter (costs 1 credit)
2. Check Prisma Studio → `dailyCredits` should decrease to 49
3. Check `FeatureUsage` table for log entry

---

## 💳 More Test Cards

| Scenario | Card Number |
|----------|-------------|
| ✅ Success | 4242 4242 4242 4242 |
| ❌ Declined | 4000 0000 0000 0002 |
| 🔄 3D Secure | 4000 0025 0000 3155 |

**All cards:**
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

---

## 🐛 Troubleshooting

### "Webhook signature verification failed"
→ Make sure you updated `STRIPE_WEBHOOK_SECRET` in `.env.local`
→ Restart dev server after updating

### "Insufficient credits" immediately
→ Check Prisma Studio: User has `dailyCredits` > 0
→ Check webhook logs for errors

### No webhook events showing
→ Stripe CLI must be running (`stripe listen...`)
→ Check firewall isn't blocking localhost:3000

### Database not updating
→ Check Terminal 2 for webhook errors
→ Verify Supabase connection in `.env.local`

---

## 📊 Quick SQL Queries (Prisma Studio)

Check credits:
```sql
SELECT email, "dailyCredits", "dailyCreditLimit"
FROM "User";
```

Check subscriptions:
```sql
SELECT u.email, s.plan, s.status, s."currentPeriodEnd"
FROM "User" u
JOIN "Subscription" s ON u.id = s."userId";
```

Check usage:
```sql
SELECT u.email, fu.feature, fu."creditsUsed", fu."createdAt"
FROM "FeatureUsage" fu
JOIN "User" u ON fu."userId" = u.id
ORDER BY fu."createdAt" DESC;
```

---

## ✅ Success Checklist

- [ ] Dev server running (localhost:3000)
- [ ] Stripe CLI listening (webhook secret copied)
- [ ] Signed up test user
- [ ] Subscribed with test card 4242...
- [ ] Webhook events appeared in Terminal 2
- [ ] User has credits in Prisma Studio
- [ ] Dashboard shows credit balance
- [ ] Generated cover letter (1 credit deducted)
- [ ] FeatureUsage table logged the action

---

## 🎉 When Everything Works

You've successfully tested:
- ✅ Stripe checkout integration
- ✅ Webhook processing
- ✅ Credit allocation on subscription
- ✅ Credit deduction on feature use
- ✅ Database logging

**Next steps:**
1. Add credit checks to remaining APIs
2. Deploy to production with live Stripe keys
3. Test with real payment (small amount)

🚀 **You're ready to go!**
