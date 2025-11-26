import { useState, useEffect, useCallback } from 'react';
import { debug } from '../utils/debug';

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
      debug.log('AddonMode', 'Add-on Mode Initialized');
      debug.log('AddonMode', 'window object keys', Object.keys(window).filter(k => k.includes('google')));

      // Check for injected API
      let checkCount = 0;
      const maxChecks = 20; // Check for 10 seconds max

      const checkAPI = () => {
        checkCount++;
        debug.log('AddonMode', `Checking for API (attempt ${checkCount}/${maxChecks})`);
        debug.log('AddonMode', 'window.googleSheetsAPI exists', !!window.googleSheetsAPI);

        if (window.googleSheetsAPI) {
          debug.log('AddonMode', 'Direct API detected!');
          debug.log('AddonMode', 'API keys', Object.keys(window.googleSheetsAPI));

          // Test the API
          if (window.googleSheetsAPI.test) {
            try {
              const testResult = window.googleSheetsAPI.test();
              debug.log('AddonMode', 'API test result', testResult);
            } catch (e) {
              debug.error('AddonMode', 'API test failed', e);
            }
          }

          setUseDirectAPI(true);
          setAddonReady(true);

          // Get user info via direct API
          debug.log('AddonMode', 'Calling getUserInfo...');
          window.googleSheetsAPI.getUserInfo((error, data) => {
            if (!error && data) {
              debug.log('AddonMode', 'User info received', data);
              setUserInfo(data.user);
              setLicense(data.license);
            } else {
              debug.error('AddonMode', 'Error getting user info', error);
            }
          });
        } else {
          debug.log('AddonMode', 'Direct API not available yet');
          if (checkCount < maxChecks) {
            setTimeout(checkAPI, 500);
          } else {
            debug.error('AddonMode', 'API not found after max attempts', maxChecks);
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
      debug.log('AddonMode', 'Message received', message);

      switch (message.type) {
        case 'ADDON_READY':
          debug.log('AddonMode', 'Add-on is ready');
          setAddonReady(true);
          // Send ready acknowledgment
          sendMessageToAddon({
            type: 'READY'
          });
          break;

        case 'USER_INFO':
          debug.log('AddonMode', 'User info received');
          setUserInfo(message.data.user);
          setLicense(message.data.license);
          break;

        case 'SHEET_DATA':
          debug.log('AddonMode', 'Sheet data received', message.data);
          setSheetData(message.data);
          break;

        case 'INSERT_SUCCESS':
          debug.log('AddonMode', 'Chart inserted successfully with ID', message.chartId);
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
          debug.log('AddonMode', 'Unknown message type', message.type);
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
      debug.warn('AddonMode', 'Not in add-on mode, message not sent');
      return;
    }

    debug.log('AddonMode', 'Sending message', message);
    debug.log('AddonMode', 'window.parent', window.parent);
    debug.log('AddonMode', 'Are we in iframe?', window !== window.parent);

    // Try multiple ways to send the message
    try {
      window.parent.postMessage(message, '*');
      debug.log('AddonMode', 'postMessage sent successfully');
    } catch (error) {
      debug.error('AddonMode', 'postMessage failed', error);
    }
  }, [isAddonMode]);

  // Request sheet data
  const requestSheetData = useCallback(() => {
    debug.log('AddonMode', '========== REQUEST SHEET DATA CALLED ==========');
    debug.log('AddonMode', 'useDirectAPI', useDirectAPI);
    debug.log('AddonMode', 'window.googleSheetsAPI exists', !!window.googleSheetsAPI);

    if (useDirectAPI && window.googleSheetsAPI) {
      debug.log('AddonMode', 'Using direct API to get data');
      debug.log('AddonMode', 'Calling window.googleSheetsAPI.getSelectedData...');

      // Use direct API
      window.googleSheetsAPI.getSelectedData((error, result) => {
        debug.log('AddonMode', 'getSelectedData callback fired');
        debug.log('AddonMode', 'Error', error);
        debug.log('AddonMode', 'Result', result);

        if (error) {
          debug.error('AddonMode', 'Error getting data', error);
          const errorMsg = 'Error getting data: ' + error.message;
          if (showToast) {
            showToast(errorMsg, 'error');
          } else {
            alert('[ERROR] ' + errorMsg);
          }
        } else if (result && result.success) {
          debug.log('AddonMode', 'Data received successfully via direct API');
          debug.log('AddonMode', 'Data', result.data);
          setSheetData(result.data);
          const successMsg = 'Data loaded! CSV length: ' + (result.data.csv ? result.data.csv.length : 'N/A');
          if (showToast) {
            showToast(successMsg, 'success');
          } else {
            alert('[SUCCESS] ' + successMsg);
          }
        } else {
          debug.error('AddonMode', 'Invalid data response', result);
          const errorMsg = 'Invalid data response from Google Sheets';
          if (showToast) {
            showToast(errorMsg, 'error');
          } else {
            alert('[ERROR] ' + errorMsg);
          }
        }
      });
    } else {
      debug.log('AddonMode', 'Using postMessage fallback');
      // Fallback to postMessage
      sendMessageToAddon({
        type: 'REQUEST_DATA'
      });
    }
  }, [useDirectAPI, sendMessageToAddon]);

  // Insert chart to sheet
  const insertChartToSheet = useCallback((imageBase64, format = 'png', chartState = null) => {
    debug.log('AddonMode', '========== INSERT CHART CALLED ==========');
    debug.log('AddonMode', 'useDirectAPI', useDirectAPI);
    debug.log('AddonMode', 'window.googleSheetsAPI exists', !!window.googleSheetsAPI);
    debug.log('AddonMode', 'format', format);
    debug.log('AddonMode', 'imageBase64 length', imageBase64 ? imageBase64.length : 0);

    if (useDirectAPI && window.googleSheetsAPI) {
      debug.log('AddonMode', 'Using direct API to insert chart');
      debug.log('AddonMode', 'Calling window.googleSheetsAPI.insertChart...');

      // Use direct API
      window.googleSheetsAPI.insertChart(imageBase64, format, chartState, (error, result) => {
        debug.log('AddonMode', 'insertChart callback fired');
        debug.log('AddonMode', 'Error', error);
        debug.log('AddonMode', 'Result', result);

        if (error) {
          debug.error('AddonMode', 'Error inserting chart', error);
          const errorMsg = 'Error inserting chart: ' + error.message;
          if (showToast) {
            showToast(errorMsg, 'error');
          } else {
            alert('[ERROR] ' + errorMsg);
          }
        } else if (result && result.success) {
          debug.log('AddonMode', 'Chart inserted successfully');
          const successMsg = `Chart inserted! Chart ID: ${result.chartId || 'N/A'}. Save this ID to edit the chart later.`;
          if (showToast) {
            showToast(successMsg, 'success', 6000);
          } else {
            alert('[SUCCESS] ' + successMsg);
          }
        } else {
          debug.error('AddonMode', 'Invalid insert response', result);
          const errorMsg = 'Invalid response from chart insertion';
          if (showToast) {
            showToast(errorMsg, 'error');
          } else {
            alert('[ERROR] ' + errorMsg);
          }
        }
      });
    } else {
      debug.log('AddonMode', 'Using postMessage fallback');
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
