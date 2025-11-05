/**
 * Time Aggregation Utilities
 *
 * Functions for aggregating daily data to week/month/quarter/year levels
 * with support for ISO week numbers and configurable fiscal years
 */

/**
 * Get ISO week number for a date (ISO 8601)
 * Week 1 is the first week with a Thursday (or the week containing Jan 4)
 * Weeks start on Monday
 */
export function getISOWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  // Set to Thursday of this week (current date + 4 - current day number)
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));

  // Get first day of year
  const yearStart = new Date(d.getFullYear(), 0, 1);

  // Calculate week number
  const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);

  return {
    year: d.getFullYear(),
    week: weekNum,
    weekLabel: `Week ${weekNum}`,
    weekKey: `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`,
  };
}

/**
 * Get month information for a date
 */
export function getMonth(date) {
  const d = new Date(date);
  const month = d.getMonth() + 1; // 0-11 to 1-12
  const year = d.getFullYear();

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return {
    year,
    month,
    monthLabel: monthNames[d.getMonth()],
    monthKey: `${year}-${String(month).padStart(2, '0')}`,
  };
}

/**
 * Get quarter information for a date
 * @param {Date|string} date - The date to get quarter for
 * @param {number} fiscalYearStartMonth - Month (1-12) that fiscal year starts (default: 1 = January)
 */
export function getQuarter(date, fiscalYearStartMonth = 1) {
  const d = new Date(date);
  const calendarMonth = d.getMonth() + 1; // 0-11 to 1-12
  const calendarYear = d.getFullYear();

  // Calculate fiscal month (0-11)
  const fiscalMonth = (calendarMonth - fiscalYearStartMonth + 12) % 12;

  // Calculate fiscal quarter (1-4)
  const fiscalQuarter = Math.floor(fiscalMonth / 3) + 1;

  // Calculate fiscal year
  const fiscalYear = calendarMonth >= fiscalYearStartMonth ? calendarYear : calendarYear - 1;

  return {
    year: fiscalYear,
    quarter: fiscalQuarter,
    quarterLabel: `Q${fiscalQuarter}`,
    quarterKey: `${fiscalYear}-Q${fiscalQuarter}`,
  };
}

/**
 * Get year information for a date
 * @param {Date|string} date - The date to get year for
 * @param {number} fiscalYearStartMonth - Month (1-12) that fiscal year starts (default: 1 = January)
 */
export function getYear(date, fiscalYearStartMonth = 1) {
  const d = new Date(date);
  const calendarMonth = d.getMonth() + 1;
  const calendarYear = d.getFullYear();

  // Calculate fiscal year
  const fiscalYear = calendarMonth >= fiscalYearStartMonth ? calendarYear : calendarYear - 1;

  return {
    year: fiscalYear,
    yearLabel: String(fiscalYear),
    yearKey: String(fiscalYear),
  };
}

/**
 * Aggregate data by time period
 * @param {Array} data - Array of data objects with date field
 * @param {string} dateField - Name of the field containing the date
 * @param {Array} metricNames - Names of the metrics to aggregate
 * @param {string} aggregationLevel - 'day', 'week', 'month', 'quarter', 'year'
 * @param {string} aggregationMethod - 'sum', 'average', 'min', 'max', 'count'
 * @param {number} fiscalYearStartMonth - Month (1-12) that fiscal year starts (default: 1)
 * @returns {Array} Aggregated data
 */
export function aggregateData(
  data,
  dateField,
  metricNames,
  aggregationLevel,
  aggregationMethod = 'sum',
  fiscalYearStartMonth = 1
) {
  if (!data || data.length === 0) return [];
  if (aggregationLevel === 'day') return data; // No aggregation needed

  // Group data by time period
  const groups = {};

  data.forEach(row => {
    const dateStr = row[dateField];
    if (!dateStr) return;

    // Parse date safely to avoid timezone issues
    let date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      // For YYYY-MM-DD format, append time to avoid timezone issues
      date = new Date(dateStr + 'T00:00:00');
    } else {
      date = new Date(dateStr);
    }
    let key, periodInfo, normalizedDate;

    switch (aggregationLevel) {
      case 'week':
        periodInfo = getISOWeek(date);
        key = periodInfo.weekKey;
        // Set to Monday of that ISO week (using Thursday as reference, then go back to Monday)
        const weekDate = new Date(date);
        weekDate.setHours(0, 0, 0, 0);
        // Go to Thursday of this week (ISO week determination)
        weekDate.setDate(weekDate.getDate() + 4 - (weekDate.getDay() || 7));
        // Now go back to Monday of the same week
        weekDate.setDate(weekDate.getDate() - 3);
        normalizedDate = weekDate.toISOString().split('T')[0];
        break;
      case 'month':
        periodInfo = getMonth(date);
        key = periodInfo.monthKey;
        // Set to first day of month
        normalizedDate = `${periodInfo.year}-${String(periodInfo.month).padStart(2, '0')}-01`;
        break;
      case 'quarter':
        periodInfo = getQuarter(date, fiscalYearStartMonth);
        key = periodInfo.quarterKey;
        // Set to first day of quarter
        const quarterStartMonth = ((periodInfo.quarter - 1) * 3) + fiscalYearStartMonth;
        const adjustedMonth = ((quarterStartMonth - 1) % 12) + 1;
        normalizedDate = `${periodInfo.year}-${String(adjustedMonth).padStart(2, '0')}-01`;
        break;
      case 'year':
        periodInfo = getYear(date, fiscalYearStartMonth);
        key = periodInfo.yearKey;
        // Set to first day of fiscal year
        normalizedDate = `${periodInfo.year}-${String(fiscalYearStartMonth).padStart(2, '0')}-01`;
        break;
      default:
        return;
    }

    if (!groups[key]) {
      groups[key] = {
        key,
        periodInfo,
        date: normalizedDate, // Use normalized date (start of period)
        rows: [],
      };
    }

    groups[key].rows.push(row);
  });

  // Aggregate metrics for each group
  const aggregated = Object.values(groups).map(group => {
    const aggregatedRow = {
      [dateField]: group.date,
      ...group.periodInfo,
    };

    metricNames.forEach(metric => {
      const values = group.rows
        .map(row => row[metric])
        .filter(v => v != null && !isNaN(v));

      if (values.length === 0) {
        aggregatedRow[metric] = null;
        return;
      }

      switch (aggregationMethod) {
        case 'sum':
          aggregatedRow[metric] = values.reduce((sum, v) => sum + v, 0);
          break;
        case 'average':
          aggregatedRow[metric] = values.reduce((sum, v) => sum + v, 0) / values.length;
          break;
        case 'min':
          aggregatedRow[metric] = Math.min(...values);
          break;
        case 'max':
          aggregatedRow[metric] = Math.max(...values);
          break;
        case 'count':
          aggregatedRow[metric] = values.length;
          break;
        default:
          aggregatedRow[metric] = values.reduce((sum, v) => sum + v, 0);
      }
    });

    return aggregatedRow;
  });

  // Sort by date
  aggregated.sort((a, b) => new Date(a[dateField]) - new Date(b[dateField]));

  return aggregated;
}

/**
 * Get hierarchical time labels for a date
 * Returns labels for displaying multiple time levels on X-axis
 *
 * @param {Date|string} date - The date to get labels for
 * @param {string} aggregationLevel - 'day', 'week', 'month', 'quarter', 'year'
 * @param {number} fiscalYearStartMonth - Month (1-12) that fiscal year starts
 * @returns {Object} Object with primary and secondary labels
 */
export function getHierarchicalLabels(date, aggregationLevel, fiscalYearStartMonth = 1) {
  const d = new Date(date);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const week = getISOWeek(d);
  const month = getMonth(d);
  const quarter = getQuarter(d, fiscalYearStartMonth);
  const year = getYear(d, fiscalYearStartMonth);

  switch (aggregationLevel) {
    case 'day':
      return {
        primary: `${dayNames[d.getDay()]} ${d.getDate()}`,
        secondary: `${month.monthLabel} ${month.year}`,
        tertiary: `Week ${week.week}`,
      };
    case 'week':
      return {
        primary: week.weekLabel,
        secondary: `${month.monthLabel} ${month.year}`,
      };
    case 'month':
      return {
        primary: month.monthLabel,
        secondary: `${quarter.quarterLabel} ${quarter.year}`,
      };
    case 'quarter':
      return {
        primary: quarter.quarterLabel,
        secondary: String(quarter.year),
      };
    case 'year':
      return {
        primary: String(year.year),
      };
    default:
      return {
        primary: d.toLocaleDateString(),
      };
  }
}
