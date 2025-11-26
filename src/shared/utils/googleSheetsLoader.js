/**
 * Google Sheets CSV loader utility
 * Converts Google Sheets URLs to CSV export URLs and fetches data
 */

import { debug } from './debug';

/**
 * Extract Sheet ID and GID from various Google Sheets URL formats
 * Supports:
 * - https://docs.google.com/spreadsheets/d/SHEET_ID/edit#gid=GID
 * - https://docs.google.com/spreadsheets/d/SHEET_ID/edit
 * - https://docs.google.com/spreadsheets/d/SHEET_ID
 */
export const parseGoogleSheetsUrl = (url) => {
  try {
    // Extract Sheet ID (required)
    const sheetIdMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!sheetIdMatch) {
      throw new Error('Invalid Google Sheets URL - could not find Sheet ID');
    }
    const sheetId = sheetIdMatch[1];

    // Extract GID (optional - defaults to 0 for first sheet)
    const gidMatch = url.match(/[#&]gid=([0-9]+)/);
    const gid = gidMatch ? gidMatch[1] : '0';

    return { sheetId, gid };
  } catch (error) {
    throw new Error(`Failed to parse Google Sheets URL: ${error.message}`);
  }
};

/**
 * Convert Google Sheets URL to CSV export URL
 */
export const getGoogleSheetsCsvUrl = (url) => {
  const { sheetId, gid } = parseGoogleSheetsUrl(url);
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
};

/**
 * Parse CSV text to JSON array
 * Returns array of objects with column headers as keys
 */
export const parseCsvToJson = (csvText) => {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }

  // Parse header row
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

  // Parse data rows
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));

    if (values.length === headers.length) {
      const row = {};
      headers.forEach((header, index) => {
        // Try to convert to number if possible
        const value = values[index];
        row[header] = isNaN(value) || value === '' ? value : parseFloat(value);
      });
      data.push(row);
    }
  }

  return data;
};

/**
 * Fetch data from Google Sheets and convert to JSON
 * @param {string} sheetsUrl - Google Sheets URL
 * @returns {Promise<Array>} Array of row objects
 */
export const loadGoogleSheetsData = async (sheetsUrl) => {
  try {
    // Convert to CSV export URL
    const csvUrl = getGoogleSheetsCsvUrl(sheetsUrl);

    // Fetch CSV data
    const response = await fetch(csvUrl);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Sheet not found. Make sure the sheet is publicly accessible (Anyone with the link can view).');
      } else if (response.status === 403) {
        throw new Error('Access denied. Please set sheet sharing to "Anyone with the link can view".');
      } else {
        throw new Error(`Failed to load sheet (HTTP ${response.status})`);
      }
    }

    const csvText = await response.text();

    if (!csvText || csvText.trim().length === 0) {
      throw new Error('Sheet is empty or could not be loaded');
    }

    // Parse CSV to JSON
    const data = parseCsvToJson(csvText);

    if (data.length === 0) {
      throw new Error('No data rows found in sheet');
    }

    return data;
  } catch (error) {
    debug.error('GoogleSheetsLoader', 'Error loading Google Sheets data', error);
    throw error;
  }
};

/**
 * Validate if a URL is a Google Sheets URL
 */
export const isGoogleSheetsUrl = (url) => {
  return url.includes('docs.google.com/spreadsheets');
};

/**
 * Get instructions for making a Google Sheet public
 */
export const getPublicSharingInstructions = () => {
  return `To load data from Google Sheets:

1. Open your Google Sheet
2. Click "Share" button (top right)
3. Click "Change to anyone with the link"
4. Set permission to "Viewer"
5. Click "Done"
6. Copy the sheet URL and paste it here

Your data will remain view-only and secure.`;
};
