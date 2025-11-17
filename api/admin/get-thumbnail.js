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

    // Process SVG to make it responsive
    let processedSvg = svgThumbnail;

    // Extract width and height from the SVG tag
    const svgMatch = processedSvg.match(/<svg([^>]*)>/);
    if (svgMatch) {
      const svgAttributes = svgMatch[1];
      const widthMatch = svgAttributes.match(/width="([^"]+)"/);
      const heightMatch = svgAttributes.match(/height="([^"]+)"/);
      const viewBoxMatch = svgAttributes.match(/viewBox="([^"]+)"/);

      if (widthMatch && heightMatch) {
        const width = widthMatch[1];
        const height = heightMatch[1];

        // If no viewBox exists, create one from width and height
        let viewBox = viewBoxMatch ? viewBoxMatch[1] : `0 0 ${width} ${height}`;

        // Remove width and height attributes, keep viewBox, and add responsive attributes
        processedSvg = processedSvg.replace(
          /<svg([^>]*)>/,
          `<svg viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet" style="max-width: 100%; height: auto;">`
        );
      }
    }

    // Return processed SVG with proper content type
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.status(200).send(processedSvg);

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
