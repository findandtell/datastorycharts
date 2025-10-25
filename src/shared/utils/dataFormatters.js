/**
 * Data formatting utilities
 */

/**
 * Format number with compact notation (K, M, B)
 */
export const formatCompactNumber = (num) => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + "B";
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

/**
 * Format number with full notation and commas
 */
export const formatFullNumber = (num) => {
  return num.toLocaleString("en-US");
};

/**
 * Format number based on user preference
 */
export const formatNumber = (num, compact = false) => {
  if (compact) {
    return formatCompactNumber(num);
  }
  return formatFullNumber(num);
};

/**
 * Format percentage
 */
export const formatPercentage = (num, decimals = 1) => {
  return num.toFixed(decimals) + "%";
};

/**
 * Format percentage with sign
 */
export const formatPercentageChange = (num, decimals = 1) => {
  const sign = num > 0 ? "+" : "";
  return sign + num.toFixed(decimals) + "%";
};

/**
 * Parse number from string (handles K, M, B notation)
 */
export const parseNumber = (str) => {
  if (typeof str === "number") return str;
  
  const cleaned = str.toString().replace(/,/g, "");
  const multipliers = {
    K: 1000,
    M: 1000000,
    B: 1000000000,
  };

  for (const [suffix, multiplier] of Object.entries(multipliers)) {
    if (cleaned.toUpperCase().endsWith(suffix)) {
      return parseFloat(cleaned.slice(0, -1)) * multiplier;
    }
  }

  return parseFloat(cleaned) || 0;
};

/**
 * Validate if string is a valid number
 */
export const isValidNumber = (str) => {
  const num = parseNumber(str);
  return !isNaN(num) && isFinite(num);
};

/**
 * Round to specified decimal places
 */
export const roundTo = (num, decimals = 0) => {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
};

/**
 * Get number precision (decimal places)
 */
export const getPrecision = (num) => {
  const str = num.toString();
  if (!str.includes(".")) return 0;
  return str.split(".")[1].length;
};

/**
 * Format large number for display in limited space
 */
export const formatForSpace = (num, maxLength = 8) => {
  const full = formatFullNumber(num);
  if (full.length <= maxLength) return full;
  return formatCompactNumber(num);
};
