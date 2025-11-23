import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to detect and handle Google Sheets Add-on mode
 * @param {Function} showToast - Function to show toast notifications (optional)
 * @returns {object} Add-on state and communication functions
 */
export function useAddonMode(showToast = null) {
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
      console.log('[DEBUG] Add-on Mode Initialized');
      console.log('[DEBUG] window object keys:', Object.keys(window).filter(k => k.includes('google')));

      // Check for injected API
      let checkCount = 0;
      const maxChecks = 20; // Check for 10 seconds max

      const checkAPI = () => {
        checkCount++;
        console.log(`[DEBUG] Checking for API (attempt ${checkCount}/${maxChecks})...`);
        console.log('[DEBUG] window.googleSheetsAPI exists:', !!window.googleSheetsAPI);

        if (window.googleSheetsAPI) {
          console.log('[DEBUG] Direct API detected!');
          console.log('[DEBUG] API keys:', Object.keys(window.googleSheetsAPI));

          // Test the API
          if (window.googleSheetsAPI.test) {
            try {
              const testResult = window.googleSheetsAPI.test();
              console.log('[DEBUG] API test result:', testResult);
            } catch (e) {
              console.error('[DEBUG] API test failed:', e);
            }
          }

          setUseDirectAPI(true);
          setAddonReady(true);

          // Get user info via direct API
          console.log('[DEBUG] Calling getUserInfo...');
          window.googleSheetsAPI.getUserInfo((error, data) => {
            if (!error && data) {
              console.log('[DEBUG] User info received:', data);
              setUserInfo(data.user);
              setLicense(data.license);
            } else {
              console.error('[DEBUG] Error getting user info:', error);
            }
          });
        } else {
          console.log('[DEBUG] Direct API not available yet');
          if (checkCount < maxChecks) {
            setTimeout(checkAPI, 500);
          } else {
            console.error('[DEBUG] API not found after', maxChecks, 'attempts');
            const errorMsg = 'Google Sheets API was not injected. Cross-origin restriction may be blocking access.';
            if (showToast) {
              showToast(errorMsg, 'error', 5000);
            } else {
              alert('[ERROR] ' + errorMsg);
            }
          }
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
          // Show notification with chart ID so user can edit it later
          if (message.chartId) {
            const successMsg = `Chart inserted successfully! Chart ID: ${message.chartId}. Save this ID to edit the chart later using "Find&Tell Charts" → "Edit Chart by ID"`;
            if (showToast) {
              showToast(successMsg, 'success', 6000);
            } else {
              alert(successMsg);
            }
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
    console.log('[DEBUG] ========== REQUEST SHEET DATA CALLED ==========');
    console.log('[DEBUG] useDirectAPI:', useDirectAPI);
    console.log('[DEBUG] window.googleSheetsAPI exists:', !!window.googleSheetsAPI);

    if (useDirectAPI && window.googleSheetsAPI) {
      console.log('[DEBUG] Using direct API to get data');
      console.log('[DEBUG] Calling window.googleSheetsAPI.getSelectedData...');

      // Use direct API
      window.googleSheetsAPI.getSelectedData((error, result) => {
        console.log('[DEBUG] getSelectedData callback fired');
        console.log('[DEBUG] Error:', error);
        console.log('[DEBUG] Result:', result);

        if (error) {
          console.error('[DEBUG] Error getting data:', error);
          const errorMsg = 'Error getting data: ' + error.message;
          if (showToast) {
            showToast(errorMsg, 'error');
          } else {
            alert('[ERROR] ' + errorMsg);
          }
        } else if (result && result.success) {
          console.log('[DEBUG] Data received successfully via direct API');
          console.log('[DEBUG] Data:', result.data);
          setSheetData(result.data);
          const successMsg = 'Data loaded! CSV length: ' + (result.data.csv ? result.data.csv.length : 'N/A');
          if (showToast) {
            showToast(successMsg, 'success');
          } else {
            alert('[SUCCESS] ' + successMsg);
          }
        } else {
          console.error('[DEBUG] Invalid data response:', result);
          const errorMsg = 'Invalid data response from Google Sheets';
          if (showToast) {
            showToast(errorMsg, 'error');
          } else {
            alert('[ERROR] ' + errorMsg);
          }
        }
      });
    } else {
      console.log('[DEBUG] Using postMessage fallback');
      // Fallback to postMessage
      sendMessageToAddon({
        type: 'REQUEST_DATA'
      });
    }
  }, [useDirectAPI, sendMessageToAddon]);

  // Insert chart to sheet
  const insertChartToSheet = useCallback((imageBase64, format = 'png', chartState = null) => {
    console.log('[DEBUG] ========== INSERT CHART CALLED ==========');
    console.log('[DEBUG] useDirectAPI:', useDirectAPI);
    console.log('[DEBUG] window.googleSheetsAPI exists:', !!window.googleSheetsAPI);
    console.log('[DEBUG] format:', format);
    console.log('[DEBUG] imageBase64 length:', imageBase64 ? imageBase64.length : 0);

    if (useDirectAPI && window.googleSheetsAPI) {
      console.log('[DEBUG] Using direct API to insert chart');
      console.log('[DEBUG] Calling window.googleSheetsAPI.insertChart...');

      // Use direct API
      window.googleSheetsAPI.insertChart(imageBase64, format, chartState, (error, result) => {
        console.log('[DEBUG] insertChart callback fired');
        console.log('[DEBUG] Error:', error);
        console.log('[DEBUG] Result:', result);

        if (error) {
          console.error('[DEBUG] Error inserting chart:', error);
          const errorMsg = 'Error inserting chart: ' + error.message;
          if (showToast) {
            showToast(errorMsg, 'error');
          } else {
            alert('[ERROR] ' + errorMsg);
          }
        } else if (result && result.success) {
          console.log('[DEBUG] Chart inserted successfully');
          const successMsg = `Chart inserted! Chart ID: ${result.chartId || 'N/A'}. Save this ID to edit the chart later.`;
          if (showToast) {
            showToast(successMsg, 'success', 6000);
          } else {
            alert('[SUCCESS] ' + successMsg);
          }
        } else {
          console.error('[DEBUG] Invalid insert response:', result);
          const errorMsg = 'Invalid response from chart insertion';
          if (showToast) {
            showToast(errorMsg, 'error');
          } else {
            alert('[ERROR] ' + errorMsg);
          }
        }
      });
    } else {
      console.log('[DEBUG] Using postMessage fallback');
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
