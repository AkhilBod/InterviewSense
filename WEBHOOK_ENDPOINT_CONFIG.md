# ⚙️ Webhook Endpoint Configuration

You're on the right track! Here's what to fill in:

---

## Fill in These Fields

### 1. **Endpoint URL**
```
https://YOUR_DOMAIN/api/stripe/webhook
```

**For local testing:**
```
http://localhost:3000/api/stripe/webhook
```

**For production (Vercel):**
```
https://yourdomain.com/api/stripe/webhook
```
(Replace `yourdomain.com` with your actual Vercel domain)

### 2. **Description** (Optional but helpful)
```
InterviewSense Payment Webhook
```

or

```
Handle checkout and subscription events
```

### 3. **Listening to**
You should see: **3 events** ✅
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

### 4. **Destination name**
Keep as is or change to something meaningful:
```
interviewsense-webhook
```

### 5. **Payload style**
Leave as: **Snapshot** (default)

### 6. **API version**
Leave as is (auto-selected)

---

## Step-by-Step Setup

1. **Endpoint URL:**
   - For now (testing): `http://localhost:3000/api/stripe/webhook`
   - Click in the field and type this

2. **Description:**
   - Type: `InterviewSense Payment Webhook`

3. **Click: Add Endpoint** (or Save if editing)

4. **After creation, you'll see:**
   - A page with your endpoint details
   - **Signing secret** section with `whsec_test_...`
   - Click **Reveal** to see it
   - **Copy this secret!**

5. **Add to .env.local:**
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_test_...
   ```

---

## Your Complete Setup

| Field | Value |
|-------|-------|
| **Endpoint URL** | `http://localhost:3000/api/stripe/webhook` |
| **Description** | `InterviewSense Payment Webhook` |
| **Events** | 3 selected ✅ |
| **Payload Style** | Snapshot |
| **Destination Name** | `interviewsense-webhook` |

---

## After Creating Endpoint

1. Stripe will show you the **Signing secret**
2. Copy it (looks like: `whsec_test_1234567890...`)
3. Paste in `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_test_1234567890...
   ```
4. Your webhook is ready!

---

## Testing the Webhook

Once configured:

1. Start your app: `npm run dev`
2. Open new terminal and run: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. Go to http://localhost:3000/pricing
4. Test a payment with card `4242 4242 4242 4242`
5. Watch the Stripe CLI terminal for events!

---

Done! Fill in those fields and you're set! 🎉
