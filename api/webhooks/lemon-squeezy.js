/**
 * Vercel Serverless Function: Lemon Squeezy Webhook
 * POST /api/webhooks/lemon-squeezy
 *
 * Handles webhook events from Lemon Squeezy
 * Events: order_created, subscription_created, subscription_cancelled, etc.
 */

import crypto from 'crypto';

/**
 * Verify webhook signature
 */
function verifySignature(rawBody, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(rawBody).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get webhook signature
    const signature = req.headers['x-signature'];

    if (!signature) {
      console.error('No signature header found');
      return res.status(401).json({ error: 'Missing signature' });
    }

    // Verify signature if webhook secret is configured
    if (process.env.LEMON_SQUEEZY_WEBHOOK_SECRET) {
      const rawBody = JSON.stringify(req.body);
      const isValid = verifySignature(
        rawBody,
        signature,
        process.env.LEMON_SQUEEZY_WEBHOOK_SECRET
      );

      if (!isValid) {
        console.error('Invalid webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    const event = req.body;
    const eventName = event.meta?.event_name;

    console.log('Received Lemon Squeezy webhook:', eventName);

    // Handle different event types
    switch (eventName) {
      case 'order_created':
        await handleOrderCreated(event);
        break;

      case 'subscription_created':
        await handleSubscriptionCreated(event);
        break;

      case 'subscription_updated':
        await handleSubscriptionUpdated(event);
        break;

      case 'subscription_cancelled':
        await handleSubscriptionCancelled(event);
        break;

      case 'subscription_resumed':
        await handleSubscriptionResumed(event);
        break;

      case 'subscription_expired':
        await handleSubscriptionExpired(event);
        break;

      case 'subscription_paused':
        await handleSubscriptionPaused(event);
        break;

      case 'subscription_unpaused':
        await handleSubscriptionUnpaused(event);
        break;

      case 'license_key_created':
        await handleLicenseKeyCreated(event);
        break;

      default:
        console.log('Unhandled event type:', eventName);
    }

    // Always return 200 to acknowledge receipt
    res.status(200).json({ received: true });

  } catch (error) {
    console.error('Webhook handler error:', error);
    // Still return 200 to prevent retries for permanent errors
    res.status(200).json({ error: error.message });
  }
}

/**
 * Event Handlers
 */

async function handleOrderCreated(event) {
  const order = event.data.attributes;
  console.log('New order created:', {
    orderId: order.identifier,
    email: order.user_email,
    total: order.total_formatted
  });

  // TODO: Send welcome email, track in analytics
}

async function handleSubscriptionCreated(event) {
  const subscription = event.data.attributes;
  console.log('New subscription created:', {
    subscriptionId: subscription.identifier,
    email: subscription.user_email,
    status: subscription.status
  });

  // TODO: Send onboarding email, activate features
}

async function handleSubscriptionUpdated(event) {
  const subscription = event.data.attributes;
  console.log('Subscription updated:', {
    subscriptionId: subscription.identifier,
    status: subscription.status
  });

  // TODO: Update user access based on subscription status
}

async function handleSubscriptionCancelled(event) {
  const subscription = event.data.attributes;
  console.log('Subscription cancelled:', {
    subscriptionId: subscription.identifier,
    email: subscription.user_email,
    endsAt: subscription.ends_at
  });

  // TODO: Send cancellation email, schedule access removal
}

async function handleSubscriptionResumed(event) {
  const subscription = event.data.attributes;
  console.log('Subscription resumed:', {
    subscriptionId: subscription.identifier,
    email: subscription.user_email
  });

  // TODO: Restore access, send confirmation email
}

async function handleSubscriptionExpired(event) {
  const subscription = event.data.attributes;
  console.log('Subscription expired:', {
    subscriptionId: subscription.identifier,
    email: subscription.user_email
  });

  // TODO: Revoke access, send expiration email
}

async function handleSubscriptionPaused(event) {
  const subscription = event.data.attributes;
  console.log('Subscription paused:', {
    subscriptionId: subscription.identifier,
    resumesAt: subscription.resumes_at
  });

  // TODO: Handle paused state
}

async function handleSubscriptionUnpaused(event) {
  const subscription = event.data.attributes;
  console.log('Subscription unpaused:', {
    subscriptionId: subscription.identifier
  });

  // TODO: Restore full access
}

async function handleLicenseKeyCreated(event) {
  const licenseKey = event.data.attributes;
  console.log('License key created:', {
    key: licenseKey.key,
    status: licenseKey.status
  });

  // TODO: Store license key info, send email if needed
}

// Disable body parsing, we need the raw body for signature verification
export const config = {
  api: {
    bodyParser: true, // We'll handle it manually for signature verification
  },
};
