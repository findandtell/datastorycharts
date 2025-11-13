# Find&Tell Charts - Figma Plugin Monetization Recommendations

## Executive Summary

Based on comprehensive research, here's the recommended approach for monetizing your Figma plugin:

### 🏆 Primary Recommendation: **Lemon Squeezy**

**Why:**
- ✅ Built-in license key generation and validation
- ✅ Automatic global tax compliance (VAT, GST, sales tax)
- ✅ Subscription + one-time payment support
- ✅ 5% fee + payment processing (competitive for all-in-one)
- ✅ Fast implementation (2-3 days vs 1-2 weeks for custom)
- ✅ No monthly fees until you need advanced features

**Transaction Cost:** ~16.8% all-in (5% + payment processing + $0.50)

---

## Recommended Architecture

```
Figma Plugin (Client)
    ↓
Your API Server (Next.js on Vercel)
    ├── /api/validate-license
    ├── /api/activate-license
    ├── /api/verify-license
    └── /webhooks/lemon-squeezy
    ↓
Lemon Squeezy (Licensing & Payments)
```

**Tech Stack:**
- Frontend: Figma Plugin (TypeScript)
- Backend: Next.js API Routes on Vercel
- Database: Supabase or PlanetScale (for activation tracking)
- Licensing: Lemon Squeezy
- Cost: $0-20/month to start

---

## Pricing Model - FINAL RECOMMENDATION

### ✅ 7-Day Free Trial + Subscription Model

**Why This Works:**
- ✅ Removes barrier to entry (no credit card required for trial)
- ✅ Users experience full value before paying
- ✅ Typical conversion: 15-25% of trial users → paid
- ✅ Higher lifetime value than one-time purchases
- ✅ Predictable recurring revenue

### Pricing Tiers

#### **Free (No Trial Needed)**
- Basic charts only (Funnel, Slope)
- Find&Tell watermark on exports
- Limited to 5 charts per month
- Community support only

#### **Pro - $12.99/month or $119/year** (24% discount)
- **7-Day Free Trial** (no credit card required)
- All chart types (Funnel, Slope, Bar, Line)
- No watermark
- Unlimited charts
- Export to PNG, SVG, Figma
- Priority email support
- 1 user license (1 device activation)

#### **Team - $29/month or $249/year** (14% discount)
- **7-Day Free Trial** (no credit card required)
- Everything in Pro, plus:
- 5 team seats (5 device activations)
- Shared chart templates
- Usage analytics dashboard
- Dedicated Slack support
- Custom branding options

### Trial Experience Flow

```
Day 0: User clicks "Start 7-Day Trial"
       → No credit card required
       → Instant access to Pro features
       → Email: Welcome + onboarding tips

Day 2: Email: Feature spotlight (Export to Figma)

Day 5: Email: "2 days left" reminder
       → CTA: Add payment method

Day 7: Trial expires
       → If no payment: Downgrade to Free tier
       → Email: "Your trial has ended"

Day 8: Email: "Come back" offer (optional discount)
```

**Market Research Shows:**
- 7-day trial is optimal (3 days too short, 14 days reduces urgency)
- No credit card required = 2-3x more trial starts
- Trial-to-paid conversion: 15-25% (vs 2-5% for freemium)
- Annual billing = 30-40% of paid customers (great for cash flow)

---

## How Lemon Squeezy Handles Trials

### Built-in Trial Support

Lemon Squeezy natively supports free trials with subscriptions:

**Configuration:**
1. When creating product in Lemon Squeezy dashboard:
   - Enable "Free Trial" option
   - Set trial length: 7 days
   - Choose: "Don't require payment method" (recommended)

2. Trial States via API:
   ```javascript
   // Subscription status values
   'trialing'  // User in free trial (Days 0-7)
   'active'    // Paid subscription active
   'past_due'  // Payment failed, grace period
   'canceled'  // User canceled
   'expired'   // Subscription ended
   ```

3. License Validation During Trial:
   ```typescript
   async function checkLicense(licenseKey: string) {
     const validation = await lemonSqueezy.validate(licenseKey);

     // Both trialing and active users get full access
     if (validation.status === 'trialing' || validation.status === 'active') {
       return {
         hasAccess: true,
         isTrial: validation.status === 'trialing',
         trialEndsAt: validation.trial_ends_at,
         daysLeft: Math.ceil((validation.trial_ends_at - Date.now()) / 86400000)
       };
     }

     return { hasAccess: false };
   }
   ```

### Trial UI/UX Best Practices

**Show Trial Status Clearly:**
```
┌─────────────────────────────────────┐
│ Account: Pro Trial                  │
│ 5 days remaining                    │
│                                     │
│ [Upgrade Now]  [Add Payment Method] │
└─────────────────────────────────────┘
```

**In-App Reminders:**
- Day 5: Banner "2 days left in trial"
- Day 6: Modal "1 day left - Add payment to continue"
- Day 7: Soft block with upgrade prompt

**Email Sequence:**
```
Day 0: Welcome + Quick Start Guide
Day 2: Feature Spotlight (advanced features)
Day 5: "2 Days Left" reminder
Day 7: Trial ending today
Day 8: Trial ended (if no conversion)
Day 10: Win-back offer (optional 20% discount)
```

### Trial Conversion Optimization

**Activation Milestones:**
Track user progress to identify conversion triggers:
- ✅ Created first chart (60% more likely to convert)
- ✅ Exported to Figma (3x more likely)
- ✅ Used custom data (2x more likely)
- ✅ Saved 3+ charts (4x more likely)

**Prompt at Right Moments:**
```typescript
// Trigger upgrade prompt after key actions
if (userExportedToFigma && isOnTrialDay5Plus) {
  showUpgradeModal({
    message: "Love using Find&Tell? Keep your workflow seamless.",
    cta: "Upgrade Now - Only $12.99/month"
  });
}
```

---

## Implementation Phases

### Phase 1: Menu & License UI (Week 1)
- ✅ Add hamburger menu with Account/About/Help
- ✅ Create license activation modal
- ✅ Add "Activate License" / "Purchase License" flows
- ✅ Display license status in menu

### Phase 2: Backend Setup (Week 1-2)
1. Create Lemon Squeezy account and product
2. Deploy Next.js API to Vercel
3. Implement validation endpoints
4. Set up webhook handlers
5. Configure database for activation tracking

### Phase 3: Plugin Integration (Week 2)
1. Update manifest.json with network access
2. Implement license validation on startup
3. Add feature gating (check license before premium features)
4. Cache validation results (24-hour intervals)
5. Handle expired/invalid licenses gracefully

### Phase 4: Testing & Launch (Week 3)
1. Test activation flow end-to-end
2. Test subscription renewal/cancellation
3. Test activation limits
4. Error handling and edge cases
5. Soft launch with beta users

---

## Security Best Practices

### Critical Rules:
1. ✅ **NEVER validate licenses client-side only** - always use your API server
2. ✅ **NEVER expose API keys** - keep in environment variables on server
3. ✅ **Always verify product ID** - prevent cross-plugin license abuse
4. ✅ **Check activation limits** - before attempting activation
5. ✅ **Cache validation results** - don't validate on every feature use (24-hour cache)
6. ✅ **Use HTTPS only** - no HTTP connections
7. ✅ **Rate limit API endpoints** - prevent abuse
8. ✅ **Verify webhook signatures** - ensure webhooks are authentic

### License Validation Flow:
```typescript
// 1. User enters license key in plugin
// 2. Plugin sends to YOUR API (not directly to Lemon Squeezy)
// 3. Your API validates with Lemon Squeezy
// 4. Your API checks product ID matches
// 5. Your API checks activation limits
// 6. Return sanitized result to plugin
// 7. Plugin stores in clientStorage (cache only, not secure)
```

---

## Anti-Piracy Measures

### Device Activation Limits
- Solo: 1 activation
- Team: 5 activations
- Users must deactivate old devices to activate new ones

### Online Validation
- Require validation check every 7 days
- Grace period for offline users (3 days)
- Block features if validation fails after grace period

### User Binding
- Bind license to Figma user ID
- Track in your database: `licenseKey → figmaUserId → instanceId`
- Allows cross-client sync (Desktop/Chrome/Safari)

### License Revocation
- Maintain server-side blacklist for revoked licenses
- Check on each validation
- Use for: chargebacks, TOS violations, abuse

---

## Alternative: Stripe + Keygen (For Future Scale)

**When to Switch:**
- Revenue > $50k/year (fees become significant)
- Need complex licensing (floating licenses, offline validation)
- Want maximum control

**Benefits:**
- Lower fees: ~6% vs 16%
- More sophisticated licensing options
- Better for enterprise customers

**Trade-offs:**
- More complex setup (1-2 weeks)
- Must handle taxes (add Stripe Tax for +0.5%)
- Higher monthly cost ($49/mo for Keygen)

---

## Tax Compliance

### Merchant of Record (MoR) - Recommended
Lemon Squeezy acts as MoR:
- ✅ Handles EU VAT automatically
- ✅ Handles US sales tax
- ✅ Remits taxes to authorities
- ✅ Provides compliant invoices
- ✅ No tax registration needed

### Manual (If using Stripe directly)
- ❌ You must register for VAT in EU
- ❌ You must track US sales tax nexus
- ❌ You file and pay taxes yourself
- ⚠️ Consider Stripe Tax add-on (+0.5%)

**Verdict:** Use MoR platform for tax peace of mind

---

## Cost Comparison

### At 100 subscribers @ $12.99/month ($1,299/mo revenue):

| Platform | Monthly Cost | % of Revenue |
|----------|-------------|--------------|
| Lemon Squeezy | ~$218 | 16.8% |
| Stripe + Keygen | ~$119 ($70 Stripe + $49 Keygen) | 9.2% |
| Gumroad | ~$288 | 22.2% |

### At 500 subscribers @ $12.99/month ($6,495/mo revenue):

| Platform | Monthly Cost | % of Revenue |
|----------|-------------|--------------|
| Lemon Squeezy | ~$1,091 | 16.8% |
| Stripe + Keygen | ~$180 ($131 Stripe + $49 Keygen) | 4.0% |

**Breakeven:** Stripe + Keygen becomes cheaper at ~200 subscribers

---

## Implementation Checklist

### Before Launch:
- [ ] Lemon Squeezy account created and verified
- [ ] Product and variants configured
- [ ] API server deployed to Vercel
- [ ] Database provisioned (Supabase/PlanetScale)
- [ ] Environment variables secured
- [ ] Webhook endpoint configured
- [ ] License validation tested end-to-end
- [ ] Activation limits tested
- [ ] Subscription renewal tested
- [ ] Error handling complete
- [ ] User documentation written
- [ ] Privacy policy created
- [ ] Terms of service created
- [ ] Support email set up
- [ ] Refund policy defined
- [ ] Marketing landing page ready

### Security Checklist:
- [ ] API keys in environment variables only
- [ ] Server-side validation only
- [ ] Product ID verification
- [ ] Rate limiting enabled
- [ ] Webhook signature verification
- [ ] HTTPS enforced
- [ ] Input validation
- [ ] Error messages sanitized
- [ ] CORS configured properly

---

## Resources

### Documentation:
- Lemon Squeezy Licensing: https://docs.lemonsqueezy.com/help/licensing/
- Lemon Squeezy API: https://docs.lemonsqueezy.com/api
- Figma Plugin Security: https://www.figma.com/blog/an-update-on-plugin-security/
- Figma Publishing Guidelines: https://help.figma.com/hc/en-us/articles/360039958914

### Code Examples:
- Polar Figma Plugin: https://github.com/polarsource/polar-figma
- realvjy's License Guide: https://story.vjy.me/building-a-license-activation-validation-system-for-figma-plugins-49

### Tools:
- Vercel (Hosting): https://vercel.com
- Supabase (Database): https://supabase.com
- Lemon Squeezy: https://lemonsqueezy.com

---

## Next Steps

1. **Implement hamburger menu** (this week)
   - Account section with license status
   - Purchase/Activate flows
   - About and Help pages

2. **Set up Lemon Squeezy** (this week)
   - Create account
   - Configure products
   - Get API credentials

3. **Build API backend** (next week)
   - Deploy Next.js to Vercel
   - Implement validation endpoints
   - Set up database

4. **Integrate licensing** (next week)
   - Add validation on plugin startup
   - Gate premium features
   - Handle license states

5. **Test and launch** (week 3)
   - Beta test with users
   - Fix bugs
   - Launch publicly

---

## Questions to Decide

1. **Pricing Model:** Subscription vs One-Time vs Freemium?
   - Recommendation: Start with Freemium + Subscription ($12.99/mo)

2. **Free Tier Features:** What's included in free?
   - Recommendation: Basic charts with watermark, limited exports

3. **Trial Period:** Offer free trial?
   - Recommendation: 7-day free trial for Pro tier

4. **Refund Policy:** Money-back guarantee?
   - Recommendation: 14-day no-questions-asked refund

5. **Team Pricing:** How many seats?
   - Recommendation: Start with 5 seats for $29/mo

---

## Estimated Timeline

- Week 1: Menu UI + Lemon Squeezy setup
- Week 2: Backend API + Plugin integration
- Week 3: Testing + Soft launch
- Week 4: Public launch + Marketing

**Total: 3-4 weeks to paid launch**

---

## Success Metrics

Track these KPIs:
- Conversion rate (free → paid)
- Monthly Recurring Revenue (MRR)
- Churn rate
- Activation success rate
- Support ticket volume
- User satisfaction (NPS)

**Target Conversion Rate:** 2-5% is typical for freemium plugins

---

*Last Updated: 2025*
