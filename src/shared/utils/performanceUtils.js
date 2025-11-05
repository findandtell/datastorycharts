/**
 * Performance optimization utilities
 */

/**
 * Throttle function - limits how often a function can be called
 * @param {Function} func - The function to throttle
 * @param {number} limit - Time in milliseconds to wait between calls
 * @returns {Function} Throttled function
 */
export function throttle(func, limit = 100) {
  let inThrottle;
  let lastResult;
  let lastArgs;

  return function(...args) {
    lastArgs = args;

    if (!inThrottle) {
      lastResult = func.apply(this, args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
        // Execute with the most recent args if there were additional calls
        if (lastArgs !== args) {
          lastResult = func.apply(this, lastArgs);
        }
      }, limit);
    }

    return lastResult;
  };
}

/**
 * Debounce function - delays execution until after a period of inactivity
 * @param {Function} func - The function to debounce
 * @param {number} delay - Time in milliseconds to wait
 * @returns {Function} Debounced function
 */
export function debounce(func, delay = 300) {
  let timeoutId;

  return function(...args) {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

/**
 * Request Animation Frame throttle - limits function to run at most once per frame
 * Useful for visual updates like chart rendering
 * @param {Function} func - The function to throttle
 * @returns {Function} RAF-throttled function
 */
export function rafThrottle(func) {
  let rafId = null;

  return function(...args) {
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        func.apply(this, args);
        rafId = null;
      });
    }
  };
}
