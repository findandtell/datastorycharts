# Lemon Squeezy Integration - Setup Guide

## What's Been Completed

### 1. Frontend Integration ✅
- **Created `useLicense.js` hook** ([src/shared/hooks/useLicense.js](src/shared/hooks/useLicense.js))
  - License validation and activation logic
  - Caching with localStorage
  - Trial countdown tracking
  - Device instance ID generation

- **Updated `ChartEditor.jsx`** ([src/pages/ChartEditor.jsx](src/pages/ChartEditor.jsx))
  - Integrated useLicense hook
  - Dynamic license status display in hamburger menu
  - Shows different UI based on license state (Free/Trial/Pro)
  - License activation modal with input form
  - Button handlers for trial signup and license activation

### 2. Backend API Endpoints ✅
Created three Vercel Serverless Functions in `/api` directory:

- **`/api/validate-license.js`** - Validates license keys
  - Product ID verification (prevents cross-product abuse)
  - Activation limit checking
  - Returns sanitized license data

- **`/api/activate-license.js`** - Activates new licenses
  - Creates instance binding
  - Returns activation confirmation

- **`/api/webhooks/lemon-squeezy.js`** - Handles subscription webhooks
  - Signature verification for security
  - Event handlers for subscription lifecycle
  - Placeholder handlers ready for implementation

### 3. Configuration Files ✅
- **`.env.example`** - Template for environment variables
- **`package.json`** - Added @lemonsqueezy/lemonsqueezy.js dependency

---

## What You Need to Do Next

### Step 1: Set Up Lemon Squeezy Account (30 minutes)

1. **Create Products in Dashboard**
   - Log in to [Lemon Squeezy Dashboard](https://app.lemonsqueezy.com)
   - Go to Products → New Product

   **Create Product: "Find&Tell Charts Pro"**
   - Price: $12.99/month or $119/year
   - Enable "License Keys" feature
   - Enable "7-Day Free Trial"
   - Set trial to "Don't require payment method"

   **Create Product: "Find&Tell Charts Team"** (optional for later)
   - Price: $29/month or $249/year
   - Enable "License Keys" feature
   - Enable "7-Day Free Trial"
   - Activation limit: 5 devices

2. **Get API Credentials**
   - Go to Settings → API
   - Create new API key
   - Copy the API key (you'll need this for `.env`)

3. **Get Product IDs**
   - Go to Products → Your Product → Settings
   - Copy the Product ID (numeric ID in URL or settings)

4. **Set Up Webhook**
   - Go to Settings → Webhooks
   - Create new webhook
   - URL: `https://charts.findandtell.co/api/webhooks/lemon-squeezy`
   - Select events:
     - `order_created`
     - `subscription_created`
     - `subscription_updated`
     - `subscription_cancelled`
     - `subscription_expired`
     - `license_key_created`
   - Copy the webhook secret

5. **Get Checkout URL**
   - Go to Products → Your Product → Checkout Links
   - Create a new checkout link or copy existing
   - Format: `https://your-store.lemonsqueezy.com/checkout/buy/YOUR_VARIANT_ID`

### Step 2: Configure Environment Variables (5 minutes)

1. **Create `.env` file** (copy from `.env.example`)
   ```bash
   cp .env.example .env
   ```

2. **Fill in your Lemon Squeezy credentials:**
   ```env
   # Lemon Squeezy API Configuration
   LEMON_SQUEEZY_API_KEY=your_api_key_here
   LEMON_SQUEEZY_PRODUCT_ID=your_product_id_here
   LEMON_SQUEEZY_WEBHOOK_SECRET=your_webhook_secret_here
   VITE_APP_URL=http://localhost:5173
   VITE_API_URL=http://localhost:3000/api
   ```

3. **Configure Vercel Environment Variables**
   ```bash
   cd funnel-viz-refactored
   vercel env add LEMON_SQUEEZY_API_KEY
   vercel env add LEMON_SQUEEZY_PRODUCT_ID
   vercel env add LEMON_SQUEEZY_WEBHOOK_SECRET
   ```

   Or via Vercel Dashboard:
   - Go to Project → Settings → Environment Variables
   - Add each variable for Production, Preview, and Development

### Step 3: Update Checkout URL (2 minutes)

In [src/pages/ChartEditor.jsx](src/pages/ChartEditor.jsx), replace the TODO checkout URL:

```javascript
// Find this function (around line 708):
const handleStartTrial = () => {
  // TODO: Replace with actual Lemon Squeezy checkout URL
  const checkoutUrl = 'https://findandtell.lemonsqueezy.com/checkout/buy/YOUR_VARIANT_ID';
  window.open(checkoutUrl, '_blank');
  setShowHamburgerMenu(false);
};
```

Replace `YOUR_VARIANT_ID` with your actual variant ID from Lemon Squeezy.

### Step 4: Deploy to Vercel (10 minutes)

1. **Deploy the application**
   ```bash
   cd funnel-viz-refactored
   vercel --prod
   ```

2. **Verify API endpoints are working**
   - Visit: `https://charts.findandtell.co/api/validate-license` (should return 405 Method Not Allowed)
   - This confirms the endpoint is deployed

3. **Update Figma Plugin manifest** ([figma-plugin/manifest.json](figma-plugin/manifest.json))
   ```json
   {
     "networkAccess": {
       "allowedDomains": [
         "https://charts.findandtell.co",
         "https://charts.findandtell.co"
       ]
     }
   }
   ```

### Step 5: Test the Integration (20 minutes)

#### Test License Activation Flow:

1. **Get a Test License Key**
   - In Lemon Squeezy Dashboard → Products → Your Product
   - Go to License Keys → Create License Key
   - Generate a test key

2. **Test in the App**
   - Open your app: `http://localhost:5173`
   - Go to Chart Editor
   - Click hamburger menu → "Have a license? Activate here"
   - Enter your test license key
   - Click "Activate License"
   - Should see success message and menu should update to show "Pro" status

3. **Test Trial Signup**
   - Click "Start 7-Day Free Trial"
   - Should open Lemon Squeezy checkout in new tab
   - Complete checkout (use test mode if available)
   - Receive license key via email
   - Activate license key in app

4. **Check Browser Console**
   - Open DevTools → Console
   - Look for `[useLicense]` logs showing license validation
   - Verify no errors

#### Test API Endpoints Directly:

**Test Validation:**
```bash
curl -X POST https://charts.findandtell.co/api/validate-license \
  -H "Content-Type: application/json" \
  -d '{"licenseKey": "YOUR_TEST_KEY", "instanceId": "test-instance"}'
```

**Expected Response:**
```json
{
  "valid": true,
  "license": {
    "key": "XXXX-XXXX-XXXX-XXXX",
    "status": "active",
    "isTrial": false,
    "expiresAt": null,
    "activationLimit": 1,
    "activationUsage": 1
  }
}
```

### Step 6: Update Webhook Handlers (15 minutes)

The webhook handlers in [api/webhooks/lemon-squeezy.js](api/webhooks/lemon-squeezy.js) currently just log events. You should implement actual logic:

```javascript
async function handleOrderCreated(event) {
  const order = event.data.attributes;

  // TODO: Implement your logic:
  // - Send welcome email
  // - Track in analytics (Google Analytics, Mixpanel, etc.)
  // - Add user to mailing list
  // - Store order in database (optional)
}

async function handleSubscriptionCancelled(event) {
  const subscription = event.data.attributes;

  // TODO: Implement your logic:
  // - Send cancellation email
  // - Schedule access removal at ends_at date
  // - Track churn in analytics
}
```

---

## Testing Checklist

- [ ] Lemon Squeezy account created and products configured
- [ ] API credentials added to Vercel environment variables
- [ ] Checkout URL updated in ChartEditor.jsx
- [ ] Application deployed to Vercel
- [ ] Test license key generated
- [ ] License activation works in app
- [ ] Trial signup button opens checkout
- [ ] License status displays correctly in hamburger menu
- [ ] License validation caches for 24 hours
- [ ] Webhook endpoint configured in Lemon Squeezy
- [ ] Webhook signature verification works
- [ ] Browser console shows no errors

---

## Current User Experience

### Free User:
1. Opens app → sees hamburger menu
2. Clicks menu → sees "Free" plan with "Start 7-Day Free Trial" button
3. Clicks trial button → redirected to Lemon Squeezy checkout
4. Completes purchase → receives license key via email
5. Returns to app → clicks "Have a license? Activate here"
6. Enters license key → app validates and activates
7. Menu now shows "Pro Trial Active" with days remaining

### Trial User (Days 1-7):
1. Opens app → license auto-validated from localStorage cache
2. Clicks hamburger menu → sees "Pro Trial Active - X days remaining"
3. Has access to all Pro features
4. Day 5+ → sees upgrade prompt: "Upgrade to Pro - $12.99/mo"

### Pro User (After Trial or Direct Purchase):
1. Opens app → license auto-validated
2. Clicks hamburger menu → sees "Pro - Active" status
3. Full access to all features
4. License re-validated every 24 hours automatically

---

## Troubleshooting

### License activation fails with "Invalid license"
- **Check:** Product ID in .env matches the product ID in Lemon Squeezy
- **Check:** API key has correct permissions
- **Check:** License key hasn't been deactivated in Lemon Squeezy dashboard

### License activation fails with "Activation limit reached"
- **Reason:** User has already activated on maximum number of devices
- **Solution:** User must deactivate an old device first (implement deactivation feature)

### Webhook not firing
- **Check:** Webhook URL is correct (https://charts.findandtell.co/api/webhooks/lemon-squeezy)
- **Check:** Webhook signature secret matches .env
- **Check:** Events are selected in Lemon Squeezy webhook configuration
- **Debug:** Check Vercel Function logs for incoming requests

### API returns 500 errors
- **Check:** Environment variables are set in Vercel
- **Check:** Vercel Function logs for actual error messages
- **Debug:** Test API locally first with `vercel dev`

---

## Next Steps After Basic Integration Works

1. **Add Database** (Optional but recommended)
   - Track activations in database (Supabase or PlanetScale)
   - Store user information for better support
   - Enable cross-device sync of charts

2. **Implement Deactivation**
   - Add "Manage Devices" section in hamburger menu
   - Allow users to deactivate old devices
   - Call Lemon Squeezy deactivation API

3. **Add Team Plans**
   - Create Team product in Lemon Squeezy
   - Implement team member invitation
   - Shared templates and brand kits

4. **Analytics Integration**
   - Track trial conversions
   - Monitor churn rate
   - Identify feature usage patterns

5. **Email Automation**
   - Welcome email on trial start
   - Feature highlights on Day 2
   - Reminder on Day 5 ("2 days left")
   - Win-back email on Day 8 if not converted

6. **Feature Gating**
   - Determine which features are Pro-only
   - Add checks using `license.hasAccess` before allowing feature use
   - Show upgrade prompts when free users try Pro features

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│  Browser (React App)                            │
│  ├─ ChartEditor.jsx                             │
│  │  └─ useLicense() hook                        │
│  │     ├─ validateLicense()                     │
│  │     └─ activateLicense()                     │
│  │                                               │
│  └─ localStorage cache                          │
│     └─ findtell_license (24hr cache)            │
└────────────────┬────────────────────────────────┘
                 │
                 │ fetch()
                 ├─ POST /api/validate-license
                 └─ POST /api/activate-license
                 │
┌────────────────▼────────────────────────────────┐
│  Vercel Serverless Functions                    │
│  ├─ /api/validate-license.js                    │
│  │  └─ Checks product ID, activation limits     │
│  ├─ /api/activate-license.js                    │
│  │  └─ Creates device binding                   │
│  └─ /api/webhooks/lemon-squeezy.js              │
│     └─ Handles subscription events              │
└────────────────┬────────────────────────────────┘
                 │
                 │ Lemon Squeezy SDK
                 ├─ lemonsqueezy.validate()
                 └─ lemonsqueezy.activate()
                 │
┌────────────────▼────────────────────────────────┐
│  Lemon Squeezy API                              │
│  ├─ License validation                          │
│  ├─ Activation management                       │
│  ├─ Subscription handling                       │
│  └─ Webhook events                              │
└─────────────────────────────────────────────────┘
```

---

## Support & Resources

- **Lemon Squeezy Documentation:** https://docs.lemonsqueezy.com/
- **License API Guide:** https://docs.lemonsqueezy.com/help/licensing
- **Webhook Reference:** https://docs.lemonsqueezy.com/api/webhooks
- **Test Mode:** Use Lemon Squeezy's test mode for development

---

**Status:** ✅ Integration code complete, awaiting Lemon Squeezy account configuration

**Last Updated:** 2025-11-12
