import { useState, useEffect, useCallback } from 'react';
import { debug } from '../utils/debug';

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
      debug.log('FigmaMode', 'Figma mode detected and persisted');
    }

    // If already in Figma mode from sessionStorage, keep it
    const stored = sessionStorage.getItem('figmaMode');
    if (stored === 'true') {
      setIsFigmaMode(true);
      debug.log('FigmaMode', 'Figma mode restored from session');
    }

    debug.log('FigmaMode', 'Is Figma mode', isFigma || stored === 'true');
  }, []);

  /**
   * Send chart SVG to Figma plugin
   * @param {string} svgString - The SVG markup as a string
   * @param {string} chartName - Name for the chart in Figma
   * @param {Object} chartConfig - Complete chart configuration for reload
   */
  const sendToFigma = useCallback((svgString, chartName = 'Find&Tell Chart', chartConfig = null) => {
    if (!isFigmaMode) {
      debug.warn('FigmaMode', 'Not in Figma mode, cannot send chart');
      return false;
    }

    try {
      debug.log('FigmaMode', 'Sending chart to Figma', chartName);

      // Send message to Figma plugin via parent window
      parent.postMessage({
        pluginMessage: {
          type: 'insert-chart',
          svg: svgString,
          name: chartName,
          chartConfig: chartConfig,
        }
      }, '*');

      debug.log('FigmaMode', 'Chart sent successfully');
      return true;
    } catch (error) {
      debug.error('FigmaMode', 'Error sending chart to Figma', error);
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

  /**
   * Request to load chart configuration from selected node in Figma
   * Triggers Figma plugin to read chart config and send it back to UI
   */
  const requestReloadFromFigma = useCallback(() => {
    if (!isFigmaMode) {
      debug.warn('FigmaMode', 'Not in Figma mode, cannot reload');
      return false;
    }

    try {
      debug.log('FigmaMode', 'Requesting chart reload from Figma selection');

      parent.postMessage({
        pluginMessage: {
          type: 'load-from-selection',
        }
      }, '*');

      return true;
    } catch (error) {
      debug.error('FigmaMode', 'Error requesting reload', error);
      return false;
    }
  }, [isFigmaMode]);

  return {
    isFigmaMode,
    sendToFigma,
    notifyFigma,
    closeFigma,
    resizeFigma,
    requestReloadFromFigma,
  };
}
