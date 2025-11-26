/**
 * Debug utility for conditional logging
 *
 * Only logs in development mode (import.meta.env.DEV)
 * In production builds, all logging is silently disabled.
 *
 * @example
 * import { debug } from '@shared/utils/debug';
 *
 * debug.log('ChartEditor', 'Component mounted', { chartType });
 * debug.warn('DataLoader', 'No data found');
 * debug.error('Export', 'Failed to export', error);
 * debug.trace('StateChange', 'percentChangeEnabled updated');
 */

const isDev = import.meta.env.DEV;

/**
 * Debug logging utility with conditional output
 */
export const debug = {
  /**
   * Log informational message (only in development)
   * @param {string} group - Component/module name
   * @param {string} message - Log message
   * @param {*} [data] - Optional data to log
   */
  log: (group, message, data) => {
    if (isDev) {
      if (data !== undefined) {
        console.log(`[${group}] ${message}`, data);
      } else {
        console.log(`[${group}] ${message}`);
      }
    }
  },

  /**
   * Log warning message (only in development)
   * @param {string} group - Component/module name
   * @param {string} message - Warning message
   * @param {*} [data] - Optional data to log
   */
  warn: (group, message, data) => {
    if (isDev) {
      if (data !== undefined) {
        console.warn(`[${group}] ⚠️ ${message}`, data);
      } else {
        console.warn(`[${group}] ⚠️ ${message}`);
      }
    }
  },

  /**
   * Log error message (always logs - errors should be visible)
   * @param {string} group - Component/module name
   * @param {string} message - Error message
   * @param {*} [error] - Optional error object
   */
  error: (group, message, error) => {
    // Errors always log, even in production
    if (error !== undefined) {
      console.error(`[${group}] ❌ ${message}`, error);
    } else {
      console.error(`[${group}] ❌ ${message}`);
    }
  },

  /**
   * Log with stack trace (only in development)
   * Useful for tracking where state changes originate
   * @param {string} group - Component/module name
   * @param {string} message - Log message
   */
  trace: (group, message) => {
    if (isDev) {
      console.log(`[${group}] ${message}`);
      console.trace();
    }
  },

  /**
   * Group related logs together (only in development)
   * @param {string} label - Group label
   * @param {Function} fn - Function containing logs to group
   */
  group: (label, fn) => {
    if (isDev) {
      console.group(label);
      fn();
      console.groupEnd();
    }
  },

  /**
   * Log performance timing (only in development)
   * @param {string} label - Timer label
   * @returns {{ end: Function }} Timer object with end() method
   */
  time: (label) => {
    if (isDev) {
      console.time(label);
      return {
        end: () => console.timeEnd(label)
      };
    }
    return { end: () => {} };
  },

  /**
   * Check if debug mode is enabled
   * @returns {boolean}
   */
  isEnabled: () => isDev,
};

export default debug;
