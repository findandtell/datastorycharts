/**
 * Vercel Serverless Function: Save Default Chart Configuration
 * POST /api/admin/save-default
 *
 * Saves a chart configuration as the default for a specific chart type
 */

import { kv } from '@vercel/kv';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
    // Check admin authorization
    const authHeader = req.headers.authorization;
    const adminToken = process.env.ADMIN_TOKEN;

    if (!adminToken) {
      return res.status(500).json({
        success: false,
        error: 'Admin authentication not configured'
      });
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (token !== adminToken) {
      return res.status(403).json({
        success: false,
        error: 'Invalid admin token'
      });
    }

    // Get chart type and configuration from request
    const { chartType, configuration } = req.body;

    // Validate input
    if (!chartType || typeof chartType !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Chart type is required'
      });
    }

    if (!configuration || typeof configuration !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Configuration object is required'
      });
    }

    // Save configuration to Vercel KV
    const key = `default:${chartType}`;
    await kv.set(key, {
      chartType,
      configuration,
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin'
    });

    res.status(200).json({
      success: true,
      message: `Default configuration saved for ${chartType}`,
      chartType
    });

  } catch (error) {
    console.error('Save default error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error saving default configuration'
    });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};
