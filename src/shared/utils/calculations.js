/**
 * Calculation utilities for chart metrics
 */

/**
 * Calculate conversion rate between two stages
 */
export const calculateConversionRate = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return (current / previous) * 100;
};

/**
 * Calculate drop-off rate between two stages
 */
export const calculateDropOffRate = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((previous - current) / previous) * 100;
};

/**
 * Calculate percentage change between two periods
 */
export const calculatePercentageChange = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Calculate overall funnel conversion rate (first to last stage)
 */
export const calculateOverallConversion = (firstStage, lastStage) => {
  if (!firstStage || firstStage === 0) return 0;
  return (lastStage / firstStage) * 100;
};

/**
 * Normalize values to percentage of first stage
 */
export const normalizeToHundred = (values) => {
  const first = values[0];
  if (!first || first === 0) return values;
  return values.map((v) => (v / first) * 100);
};

/**
 * Calculate stage-by-stage conversion rates
 */
export const calculateStageConversions = (values) => {
  const conversions = [];
  for (let i = 1; i < values.length; i++) {
    conversions.push(calculateConversionRate(values[i], values[i - 1]));
  }
  return conversions;
};

/**
 * Calculate cumulative conversion from start
 */
export const calculateCumulativeConversions = (values) => {
  const first = values[0];
  if (!first || first === 0) return values.map(() => 0);
  return values.map((v) => (v / first) * 100);
};

/**
 * Find the stage with the biggest drop-off
 */
export const findBiggestDropOff = (values) => {
  let maxDropOff = 0;
  let maxDropOffIndex = -1;

  for (let i = 1; i < values.length; i++) {
    const dropOff = calculateDropOffRate(values[i], values[i - 1]);
    if (dropOff > maxDropOff) {
      maxDropOff = dropOff;
      maxDropOffIndex = i;
    }
  }

  return { index: maxDropOffIndex, rate: maxDropOff };
};

/**
 * Calculate average value across periods
 */
export const calculateAverage = (values) => {
  if (!values || values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
};

/**
 * Calculate median value
 */
export const calculateMedian = (values) => {
  if (!values || values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
};

/**
 * Calculate trend direction (positive, negative, flat)
 */
export const calculateTrend = (values) => {
  if (!values || values.length < 2) return "flat";
  const first = values[0];
  const last = values[values.length - 1];
  const change = ((last - first) / first) * 100;

  if (Math.abs(change) < 1) return "flat";
  return change > 0 ? "positive" : "negative";
};

/**
 * Calculate standard deviation
 */
export const calculateStdDev = (values) => {
  if (!values || values.length === 0) return 0;
  const avg = calculateAverage(values);
  const squareDiffs = values.map((value) => Math.pow(value - avg, 2));
  const avgSquareDiff = calculateAverage(squareDiffs);
  return Math.sqrt(avgSquareDiff);
};

/**
 * Identify outliers using IQR method
 */
export const findOutliers = (values) => {
  if (!values || values.length < 4) return [];
  
  const sorted = [...values].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  return values
    .map((v, i) => ({ value: v, index: i }))
    .filter((item) => item.value < lowerBound || item.value > upperBound);
};

/**
 * Calculate growth rate (CAGR) over periods
 */
export const calculateGrowthRate = (startValue, endValue, periods) => {
  if (!startValue || startValue === 0 || periods === 0) return 0;
  return (Math.pow(endValue / startValue, 1 / periods) - 1) * 100;
};
