import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to detect if app is running in Figma plugin
 * and provide function to send charts to Figma
 */
export function useFigmaMode() {
  const [isFigmaMode, setIsFigmaMode] = useState(() => {
    // Check sessionStorage first (persisted across navigation)
    const stored = sessionStorage.getItem('figmaMode');
    return stored === 'true';
  });

  useEffect(() => {
    // Check if app is loaded from Figma plugin
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const isFigma = mode === 'figma';

    // If URL has mode=figma, persist it in sessionStorage
    if (isFigma) {
      sessionStorage.setItem('figmaMode', 'true');
      setIsFigmaMode(true);
      console.log('[useFigmaMode] Figma mode detected and persisted');
    }

    // If already in Figma mode from sessionStorage, keep it
    const stored = sessionStorage.getItem('figmaMode');
    if (stored === 'true') {
      setIsFigmaMode(true);
      console.log('[useFigmaMode] Figma mode restored from session');
    }

    console.log('[useFigmaMode] Is Figma mode:', isFigma || stored === 'true');
  }, []);

  /**
   * Send chart SVG to Figma plugin
   * @param {string} svgString - The SVG markup as a string
   * @param {string} chartName - Name for the chart in Figma
   */
  const sendToFigma = useCallback((svgString, chartName = 'Find&Tell Chart') => {
    if (!isFigmaMode) {
      console.warn('[useFigmaMode] Not in Figma mode, cannot send chart');
      return false;
    }

    try {
      console.log('[useFigmaMode] Sending chart to Figma:', chartName);

      // Send message to Figma plugin via parent window
      parent.postMessage({
        pluginMessage: {
          type: 'insert-chart',
          svg: svgString,
          name: chartName,
        }
      }, '*');

      console.log('[useFigmaMode] Chart sent successfully');
      return true;
    } catch (error) {
      console.error('[useFigmaMode] Error sending chart to Figma:', error);
      return false;
    }
  }, [isFigmaMode]);

  /**
   * Notify user in Figma
   * @param {string} message - Message to show
   * @param {number} timeout - How long to show (ms)
   */
  const notifyFigma = useCallback((message, timeout = 2000) => {
    if (!isFigmaMode) return;

    parent.postMessage({
      pluginMessage: {
        type: 'notify',
        message,
        timeout,
      }
    }, '*');
  }, [isFigmaMode]);

  /**
   * Close Figma plugin
   */
  const closeFigma = useCallback(() => {
    if (!isFigmaMode) return;

    parent.postMessage({
      pluginMessage: {
        type: 'close-plugin',
      }
    }, '*');
  }, [isFigmaMode]);

  /**
   * Resize Figma plugin window
   * @param {number} width - New width in pixels
   * @param {number} height - New height in pixels
   */
  const resizeFigma = useCallback((width, height) => {
    if (!isFigmaMode) return;

    parent.postMessage({
      pluginMessage: {
        type: 'resize',
        width,
        height,
      }
    }, '*');
  }, [isFigmaMode]);

  return {
    isFigmaMode,
    sendToFigma,
    notifyFigma,
    closeFigma,
    resizeFigma,
  };
}
