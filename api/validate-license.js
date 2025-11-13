/**
 * Vercel Serverless Function: Validate License
 * POST /api/validate-license
 *
 * Validates a license key with Lemon Squeezy
 */

import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { licenseKey, instanceId } = req.body;

    // Validate input
    if (!licenseKey || typeof licenseKey !== 'string') {
      return res.status(400).json({
        valid: false,
        error: 'License key is required'
      });
    }

    // Set up Lemon Squeezy
    lemonSqueezySetup({
      apiKey: process.env.LEMON_SQUEEZY_API_KEY
    });

    // Validate the license
    const response = await fetch('https://api.lemonsqueezy.com/v1/licenses/validate', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`
      },
      body: JSON.stringify({
        license_key: licenseKey,
        instance_id: instanceId || undefined
      })
    });

    const data = await response.json();

    // Check if validation failed
    if (!response.ok) {
      console.error('Lemon Squeezy API error:', data);
      return res.status(200).json({
        valid: false,
        error: data.error || 'License validation failed'
      });
    }

    const validation = data.license_key;

    // Verify product ID matches (prevent cross-product license abuse)
    const expectedProductId = process.env.LEMON_SQUEEZY_PRODUCT_ID;
    if (expectedProductId && validation.product_id.toString() !== expectedProductId) {
      return res.status(200).json({
        valid: false,
        error: 'Invalid license for this product'
      });
    }

    // Check if license is actually valid
    if (!validation.valid) {
      return res.status(200).json({
        valid: false,
        error: validation.status === 'expired'
          ? 'License has expired'
          : validation.status === 'disabled'
          ? 'License has been disabled'
          : 'License is not valid',
        status: validation.status
      });
    }

    // Check activation limits
    const activationLimit = validation.activation_limit || 0;
    const activationUsage = validation.activation_usage || 0;

    if (activationLimit > 0 && activationUsage >= activationLimit) {
      return res.status(200).json({
        valid: false,
        error: `Activation limit reached (${activationUsage}/${activationLimit}). Please deactivate on another device.`,
        activationLimit,
        activationUsage
      });
    }

    // License is valid!
    res.status(200).json({
      valid: true,
      license: {
        key: validation.key,
        status: validation.status,
        productId: validation.product_id,
        activationLimit,
        activationUsage,
        expiresAt: validation.expires_at,
        // Check if this is a trial or paid subscription
        isTrial: validation.status === 'trialing',
        statusFormatted: validation.status_formatted,
        // Include instance info if provided
        instance: validation.instance ? {
          id: validation.instance.id,
          name: validation.instance.name
        } : null
      }
    });

  } catch (error) {
    console.error('License validation error:', error);
    res.status(500).json({
      valid: false,
      error: 'Server error during validation. Please try again.'
    });
  }
}

// Add CORS headers to all responses
export const config = {
  api: {
    bodyParser: true,
  },
};
