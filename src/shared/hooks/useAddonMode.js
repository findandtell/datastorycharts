import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to detect and handle Google Sheets Add-on mode
 * @returns {object} Add-on state and communication functions
 */
export function useAddonMode() {
  const [isAddonMode, setIsAddonMode] = useState(false);
  const [addonReady, setAddonReady] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [license, setLicense] = useState(null);
  const [sheetData, setSheetData] = useState(null);
  const [useDirectAPI, setUseDirectAPI] = useState(false);

  // Check if we're in add-on mode
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    setIsAddonMode(mode === 'addon');

    if (mode === 'addon') {
      console.log('[Add-on Mode] Initialized');

      // Check for injected API
      const checkAPI = () => {
        if (window.googleSheetsAPI) {
          console.log('[Add-on Mode] Direct API detected!');
          setUseDirectAPI(true);
          setAddonReady(true);

          // Get user info via direct API
          window.googleSheetsAPI.getUserInfo((error, data) => {
            if (!error && data) {
              setUserInfo(data.user);
              setLicense(data.license);
            }
          });
        } else {
          console.log('[Add-on Mode] Direct API not available, will check again...');
          setTimeout(checkAPI, 500);
        }
      };

      // Start checking for API
      setTimeout(checkAPI, 100);
    }
  }, []);

  // Listen for messages from Apps Script
  useEffect(() => {
    if (!isAddonMode) return;

    const handleMessage = (event) => {
      // In production, verify origin:
      // if (event.origin !== 'expected-origin') return;

      const message = event.data;
      console.log('[Add-on Mode] Message received:', message);

      switch (message.type) {
        case 'ADDON_READY':
          console.log('[Add-on Mode] Add-on is ready');
          setAddonReady(true);
          // Send ready acknowledgment
          sendMessageToAddon({
            type: 'READY'
          });
          break;

        case 'USER_INFO':
          console.log('[Add-on Mode] User info received');
          setUserInfo(message.data.user);
          setLicense(message.data.license);
          break;

        case 'SHEET_DATA':
          console.log('[Add-on Mode] Sheet data received:', message.data);
          setSheetData(message.data);
          break;

        case 'INSERT_SUCCESS':
          console.log('[Add-on Mode] Chart inserted successfully with ID:', message.chartId);
          // Show alert with chart ID so user can edit it later
          if (message.chartId) {
            alert(`Chart inserted successfully!\n\nChart ID: ${message.chartId}\n\nSave this ID to edit the chart later using "Find&Tell Charts" → "Edit Chart by ID"`);
          }
          break;

        default:
          console.log('[Add-on Mode] Unknown message type:', message.type);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isAddonMode]);

  // Send message to Apps Script
  const sendMessageToAddon = useCallback((message) => {
    if (!isAddonMode) {
      console.warn('[Add-on Mode] Not in add-on mode, message not sent');
      return;
    }

    console.log('[Add-on Mode] Sending message:', message);
    console.log('[Add-on Mode] window.parent:', window.parent);
    console.log('[Add-on Mode] Are we in iframe?:', window !== window.parent);

    // Try multiple ways to send the message
    try {
      window.parent.postMessage(message, '*');
      console.log('[Add-on Mode] postMessage sent successfully');
    } catch (error) {
      console.error('[Add-on Mode] postMessage failed:', error);
    }
  }, [isAddonMode]);

  // Request sheet data
  const requestSheetData = useCallback(() => {
    console.log('[Add-on Mode] Requesting sheet data...');
    console.log('[Add-on Mode] Using direct API:', useDirectAPI);

    if (useDirectAPI && window.googleSheetsAPI) {
      // Use direct API
      window.googleSheetsAPI.getSelectedData((error, result) => {
        if (error) {
          console.error('[Add-on Mode] Error getting data:', error);
          alert('Error getting data: ' + error.message);
        } else if (result && result.success) {
          console.log('[Add-on Mode] Data received via direct API');
          setSheetData(result.data);
        } else {
          console.error('[Add-on Mode] Invalid data response');
        }
      });
    } else {
      // Fallback to postMessage
      sendMessageToAddon({
        type: 'REQUEST_DATA'
      });
    }
  }, [useDirectAPI, sendMessageToAddon]);

  // Insert chart to sheet
  const insertChartToSheet = useCallback((imageBase64, format = 'png', chartState = null) => {
    console.log('[Add-on Mode] Inserting chart...');
    console.log('[Add-on Mode] Using direct API:', useDirectAPI);

    if (useDirectAPI && window.googleSheetsAPI) {
      // Use direct API
      window.googleSheetsAPI.insertChart(imageBase64, format, chartState, (error, result) => {
        if (error) {
          console.error('[Add-on Mode] Error inserting chart:', error);
          alert('Error inserting chart: ' + error.message);
        } else if (result && result.success) {
          console.log('[Add-on Mode] Chart inserted successfully');
          if (result.chartId) {
            alert(`Chart inserted successfully!\n\nChart ID: ${result.chartId}\n\nSave this ID to edit the chart later using "Find&Tell Charts" → "Edit Chart by ID"`);
          }
        }
      });
    } else {
      // Fallback to postMessage
      sendMessageToAddon({
        type: 'INSERT_CHART',
        data: {
          imageBase64,
          format,
          chartState
        }
      });
    }
  }, [useDirectAPI, sendMessageToAddon]);

  // Log usage
  const logUsage = useCallback((action, metadata = {}) => {
    if (useDirectAPI && window.googleSheetsAPI) {
      window.googleSheetsAPI.logUsage(action, metadata);
    } else {
      sendMessageToAddon({
        type: 'LOG_USAGE',
        action,
        metadata
      });
    }
  }, [useDirectAPI, sendMessageToAddon]);

  return {
    isAddonMode,
    addonReady,
    userInfo,
    license,
    sheetData,
    requestSheetData,
    insertChartToSheet,
    logUsage,
    sendMessageToAddon,
    useDirectAPI
  };
}
