/**
 * Vercel Serverless Function: Activate License
 * POST /api/activate-license
 *
 * Activates a license key with a unique instance ID
 */

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
    const { licenseKey, instanceName } = req.body;

    // Validate input
    if (!licenseKey || typeof licenseKey !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'License key is required'
      });
    }

    if (!instanceName || typeof instanceName !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Instance name is required'
      });
    }

    // Activate the license
    const response = await fetch('https://api.lemonsqueezy.com/v1/licenses/activate', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`
      },
      body: JSON.stringify({
        license_key: licenseKey,
        instance_name: instanceName
      })
    });

    const data = await response.json();

    // Debug: Log the full response
    console.log('[activate-license] Lemon Squeezy response:', JSON.stringify(data, null, 2));
    console.log('[activate-license] Response status:', response.status);

    // Check if activation failed
    if (!response.ok) {
      console.error('Lemon Squeezy activation error:', data);

      // Provide specific error messages
      let errorMessage = 'Activation failed';

      if (data.error) {
        errorMessage = data.error;
      } else if (response.status === 422) {
        errorMessage = 'Activation limit reached or invalid license';
      }

      return res.status(200).json({
        success: false,
        error: errorMessage
      });
    }

    const activation = data.license_key;

    // Verify product ID (optional)
    const expectedProductId = process.env.LEMON_SQUEEZY_PRODUCT_ID;
    if (expectedProductId && activation && activation.product_id) {
      if (activation.product_id.toString() !== expectedProductId) {
        console.log('[activate-license] Product ID mismatch:', activation.product_id, 'vs', expectedProductId);
        return res.status(200).json({
          success: false,
          error: 'Invalid license for this product'
        });
      }
    }

    // Get the instance info
    const instance = activation.instance || data.instance;

    // Activation successful!
    res.status(200).json({
      success: true,
      license: {
        key: activation?.key || licenseKey,
        status: activation?.status || 'active',
        productId: activation?.product_id,
        activationLimit: activation?.activation_limit,
        activationUsage: activation?.activation_usage,
        expiresAt: activation?.expires_at,
        isTrial: activation?.status === 'trialing',
        instance: instance ? {
          id: instance.id,
          name: instance.name,
          createdAt: instance?.created_at
        } : null
      },
      message: 'License activated successfully'
    });

  } catch (error) {
    console.error('[activate-license] Caught error:', error);
    console.error('[activate-license] Error message:', error.message);
    console.error('[activate-license] Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Server error during activation. Please try again.'
    });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};
