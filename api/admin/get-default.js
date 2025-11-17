/**
 * Vercel Serverless Function: Get Default Chart Configuration
 * GET /api/admin/get-default?chartType=line
 *
 * Retrieves the default configuration for a specific chart type
 */

import { kv } from '@vercel/kv';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { chartType } = req.query;

    // Validate input
    if (!chartType || typeof chartType !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Chart type is required'
      });
    }

    // Get configuration from Vercel KV
    const key = `default:${chartType}`;
    const defaultConfig = await kv.get(key);

    if (!defaultConfig) {
      return res.status(404).json({
        success: false,
        error: `No default configuration found for ${chartType}`,
        chartType
      });
    }

    res.status(200).json({
      success: true,
      chartType,
      configuration: defaultConfig.configuration,
      updatedAt: defaultConfig.updatedAt
    });

  } catch (error) {
    console.error('Get default error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving default configuration'
    });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
