/**
 * Vercel Serverless Function: Get Default Chart Thumbnail
 * GET /api/admin/get-thumbnail?chartType=line
 *
 * Retrieves the default thumbnail SVG for a specific chart type
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

    // Get thumbnail SVG from Vercel KV
    const thumbnailKey = `default:thumbnail:${chartType}`;
    const svgThumbnail = await kv.get(thumbnailKey);

    if (!svgThumbnail) {
      return res.status(404).json({
        success: false,
        error: `No default thumbnail found for ${chartType}`,
        chartType
      });
    }

    // Return SVG with proper content type
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.status(200).send(svgThumbnail);

  } catch (error) {
    console.error('Get thumbnail error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving thumbnail'
    });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
