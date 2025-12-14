# 💳 Stripe Setup Guide - Complete

Your payment system is ready! Now set up Stripe to accept payments.

---

## Step 1: Get Your Stripe API Keys

1. Go to https://dashboard.stripe.com/apikeys
2. You'll see two keys:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

**For development:** Use test keys (they have `test` in them)
**For production:** Use live keys (they have `live` in them)

---

## Step 2: Create Products in Stripe

You need to create 2 products for your subscription tiers.

### Create Plus Product

1. Go to https://dashboard.stripe.com/products/create
2. Fill in:
   - **Product name:** `Plus`
   - **Type:** Recurring (select this!)
   - **Pricing:** 
     - **Billing period:** Monthly
     - **Price:** $5.00
   - Click **Create product**

3. **Save the Price ID** (looks like `price_1234567890`)
   - You'll see it on the product page
   - Copy it and save it somewhere safe

### Create Pro Product

1. Go to https://dashboard.stripe.com/products/create again
2. Fill in:
   - **Product name:** `Pro`
   - **Type:** Recurring (select this!)
   - **Pricing:**
     - **Billing period:** Monthly
     - **Price:** $9.00
   - Click **Create product**

3. **Save the Price ID** (looks like `price_abcdefghijk`)

---

## Step 3: Set Up Webhook

Your app needs to listen for payment events from Stripe.

### Get Your Webhook Secret

1. Go to https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. Fill in:
   - **Endpoint URL:** `https://yourdomain.com/api/stripe/webhook`
   - **Events:** Select:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
4. Click **Add endpoint**
5. Click on your endpoint and scroll to **Signing secret**
6. Copy the secret (starts with `whsec_`)

**For local testing:**
```bash
# Install Stripe CLI if you haven't
brew install stripe/stripe-cli/stripe

# Listen for events
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy the signing secret it gives you
```

---

## Step 4: Add to Your .env.local

Update `.env.local` with your keys:

```env
# Database
DATABASE_URL=postgresql://neondb_owner:npg_7vylsjbXI2BZ@ep-steep-dawn-a4zchebm-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=your-nextauth-secret-key-for-testing

# Stripe Keys
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_PRICE_ID_PLUS=price_YOUR_PLUS_ID
STRIPE_PRICE_ID_PRO=price_YOUR_PRO_ID
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE

# API Keys
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
GEMINI_API_KEY=your-gemini-api-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

Replace `YOUR_KEY_HERE`, `YOUR_PLUS_ID`, `YOUR_PRO_ID`, and `YOUR_SECRET_HERE` with the actual values.

---

## Step 5: Test Locally

### Start Your App

```bash
npm run dev
```

Your app runs at http://localhost:3000

### Test the Pricing Page

1. Go to http://localhost:3000/pricing
2. Click "Upgrade to Plus" or "Upgrade to Pro"
3. You should be redirected to Stripe checkout

### Use Test Card

On the Stripe checkout page, use this test card:
- **Card Number:** `4242 4242 4242 4242`
- **Expiry:** Any future date (e.g., 12/25)
- **CVC:** Any 3 digits (e.g., 123)
- **Name:** Any name

### Complete Payment

1. Fill in the card details
2. Click **Pay**
3. You should see a success message
4. Check your database - new Subscription record should appear!

---

## Step 6: Verify Webhook

### Local Testing

1. Open a new terminal and run:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

2. Keep it running
3. Go back to http://localhost:3000/pricing
4. Complete a test payment
5. You should see webhook events in the Stripe CLI terminal:
   - `checkout.session.completed`
   - `charge.succeeded`

### Check Your Database

1. Open Prisma Studio:
```bash
export DATABASE_URL='postgresql://neondb_owner:npg_7vylsjbXI2BZ@ep-steep-dawn-a4zchebm-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' && npx prisma studio
```

2. Go to http://localhost:5555
3. Look at the **Subscription** table
4. You should see a new record with:
   - `tier: "plus"` or `"pro"`
   - `status: "active"`
   - `stripeSubscriptionId`: Your Stripe subscription ID
   - `creditsBalance: -1` (unlimited for Plus/Pro)

---

## Step 7: Set Up for Production (Vercel)

### 1. Get Live Keys

1. Go to https://dashboard.stripe.com/apikeys
2. Switch from **Test mode** to **Live mode** (toggle at top)
3. Copy the live keys (they start with `pk_live_` and `sk_live_`)

### 2. Add to Vercel

1. Go to https://vercel.com/dashboard
2. Select your InterviewSense project
3. Go to **Settings → Environment Variables**
4. Add:
   - `STRIPE_SECRET_KEY` = your live secret key
   - `STRIPE_PUBLISHABLE_KEY` = your live public key
   - `STRIPE_PRICE_ID_PLUS` = price ID from Stripe dashboard
   - `STRIPE_PRICE_ID_PRO` = price ID from Stripe dashboard
   - `STRIPE_WEBHOOK_SECRET` = webhook secret from Stripe

### 3. Update Webhook URL

1. Go to https://dashboard.stripe.com/webhooks
2. Find your endpoint
3. Edit it and change URL to:
   ```
   https://yourdomain.com/api/stripe/webhook
   ```
   (Replace `yourdomain.com` with your actual domain)

4. Save

### 4. Deploy

```bash
git add .
git commit -m "Add Stripe configuration"
git push
```

Vercel will automatically deploy with your new environment variables.

---

## 🧪 Testing Checklist

- [ ] Stripe account created
- [ ] Plus product created ($5/month)
- [ ] Pro product created ($9/month)
- [ ] Price IDs copied
- [ ] API keys copied
- [ ] Webhook secret copied
- [ ] `.env.local` updated with all keys
- [ ] App starts without errors
- [ ] `/pricing` page loads
- [ ] Click "Upgrade" button works
- [ ] Stripe checkout page appears
- [ ] Test card payment succeeds
- [ ] Subscription appears in database
- [ ] Webhook events received in CLI
- [ ] Vercel environment variables set (if deploying)
- [ ] Live webhook URL configured (if deploying)

---

## 🆘 Troubleshooting

### "Invalid API Key"
```
Error: Invalid API Key provided
```
- Check you copied the key correctly
- Make sure you're using the right key (secret vs public)
- Try test keys first, not live keys

### "Price ID not found"
```
Error: No such price: 'price_xxx'
```
- Go back to Stripe dashboard
- Find your products (https://dashboard.stripe.com/products)
- Copy the Price ID from the pricing section
- Update `.env.local` and restart

### "Webhook not firing"
```
No webhook events received
```
- Make sure Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Check the webhook secret matches what Stripe CLI gives you
- Look at server logs for errors
- Try making another test payment

### "Subscription not appearing in database"
```
No new records in Subscription table after payment
```
- Check webhook is working (should see events in Stripe CLI)
- Check server logs for webhook handler errors
- Verify webhook secret in `.env.local` matches Stripe
- Try refreshing Prisma Studio (F5)

---

## 💡 Quick Reference

| Item | Where to Find |
|------|---------------|
| Publishable Key | https://dashboard.stripe.com/apikeys |
| Secret Key | https://dashboard.stripe.com/apikeys |
| Plus Price ID | https://dashboard.stripe.com/products (click Plus product) |
| Pro Price ID | https://dashboard.stripe.com/products (click Pro product) |
| Webhook Secret | https://dashboard.stripe.com/webhooks |
| Test Card | `4242 4242 4242 4242` |

---

## 🚀 Next Steps

1. ✅ Create Stripe account & products (you're here!)
2. ⏭️ Integrate credit checking into service routes
   - Follow: `INTEGRATION_SNIPPETS.md`
3. ⏭️ Set up weekly credit reset
   - Follow: `WEEKLY_RESET_GUIDE.md`
4. ⏭️ Test full payment flow
5. ⏭️ Deploy to production

---

Done! Your Stripe integration is ready. Start testing! 🎉
