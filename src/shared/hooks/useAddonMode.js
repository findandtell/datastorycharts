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

  // Check if we're in add-on mode
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    setIsAddonMode(mode === 'addon');

    if (mode === 'addon') {
      console.log('[Add-on Mode] Initialized');
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
    window.parent.postMessage(message, '*');
  }, [isAddonMode]);

  // Request sheet data
  const requestSheetData = useCallback(() => {
    sendMessageToAddon({
      type: 'REQUEST_DATA'
    });
  }, [sendMessageToAddon]);

  // Insert chart to sheet
  const insertChartToSheet = useCallback((imageBase64, format = 'png', chartState = null) => {
    sendMessageToAddon({
      type: 'INSERT_CHART',
      data: {
        imageBase64,
        format,
        chartState
      }
    });
  }, [sendMessageToAddon]);

  // Log usage
  const logUsage = useCallback((action, metadata = {}) => {
    sendMessageToAddon({
      type: 'LOG_USAGE',
      action,
      metadata
    });
  }, [sendMessageToAddon]);

  return {
    isAddonMode,
    addonReady,
    userInfo,
    license,
    sheetData,
    requestSheetData,
    insertChartToSheet,
    logUsage,
    sendMessageToAddon
  };
}
