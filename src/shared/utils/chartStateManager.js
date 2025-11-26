/**
 * Chart State Manager
 * Handles serialization and deserialization of complete chart state
 * for save/load functionality
 */

import { debug } from './debug';

const CHART_STATE_VERSION = '1.0';

/**
 * Convert data array to CSV string
 * Preserves sorts, reorders, and manual edits
 * @param {Array} data - Array of data objects
 * @param {Array} periodNames - Array of period/column names
 * @returns {string} CSV string
 */
const dataToCSV = (data, periodNames) => {
  if (!data || data.length === 0) return '';

  // Create header row: Category + period names
  const headers = ['Category', ...periodNames];
  const csvRows = [headers.join(',')];

  // Add data rows
  data.forEach(row => {
    const values = [
      row.Category || '',
      ...periodNames.map(period => row[period] !== undefined ? row[period] : '')
    ];
    csvRows.push(values.join(','));
  });

  return csvRows.join('\n');
};

/**
 * Serialize chart state to JSON-compatible object
 * @param {Object} params - Chart state parameters
 * @param {string} params.chartType - Type of chart (bar, funnel, slope, line)
 * @param {Object} params.chartData - Chart data object from useChartData
 * @param {Object} params.styleSettings - Style settings from useStyleSettings
 * @param {string} params.name - Optional name for the chart
 * @returns {Object} Serialized chart state
 */
export const serializeChartState = ({
  chartType,
  chartData,
  styleSettings,
  name = '',
}) => {
  // Generate default name if not provided
  const defaultName = name || `${chartType}-chart-${new Date().toISOString().split('T')[0]}`;

  // Get structured style settings from exportSettings (same format as style presets)
  const styleExport = styleSettings.exportSettings ? styleSettings.exportSettings() : {};

  // Convert editableData to CSV to preserve sorts, edits, and reorders
  // Falls back to rawCSV if editableData is not available
  const csvData = chartData.editableData && chartData.editableData.length > 0
    ? dataToCSV(chartData.editableData, chartData.periodNames)
    : chartData.rawCSV || '';

  const state = {
    // Metadata
    version: CHART_STATE_VERSION,
    chartType,
    timestamp: new Date().toISOString(),
    name: defaultName,

    // Data - Save editableData (with sorts/edits applied) instead of rawCSV
    data: {
      csv: csvData,
      source: chartData.source || 'unknown',
      googleSheetsUrl: chartData.googleSheetsUrl || null,
      periodNames: chartData.periodNames || [],
      stageCount: chartData.editableData ? chartData.editableData.length : (chartData.stageCount || 0),
      periodCount: chartData.periodCount || 0,
      isComparisonMode: chartData.isComparisonMode || false,
    },

    // Chart State
    state: {
      hiddenPeriods: chartData.hiddenPeriods ? Array.from(chartData.hiddenPeriods) : [],
      emphasizedBars: styleSettings.emphasizedBars || [],
      emphasizedLines: styleSettings.emphasizedLines || [],
    },

    // Style Settings - Use structured format from exportSettings (same format as style presets)
    ...styleExport,
  };

  return state;
};

/**
 * Deserialize chart state from JSON object
 * @param {Object} stateObj - Serialized chart state
 * @returns {Object} Parsed chart state with validation
 */
export const deserializeChartState = (stateObj) => {
  // Version validation
  if (!stateObj.version) {
    throw new Error('Invalid chart state file: missing version');
  }

  if (stateObj.version !== CHART_STATE_VERSION) {
    debug.warn('ChartStateManager', `Chart state version mismatch: expected ${CHART_STATE_VERSION}, got ${stateObj.version}`);
    // For now, we'll try to proceed - future versions should handle migration
  }

  // Chart type validation - must match chartRegistry keys
  const validChartTypes = [
    'bar-horizontal',
    'bar-vertical',
    'bar-grouped-horizontal',
    'bar-grouped-vertical',
    'line',
    'area',
    'area-stacked',
    'slope',
    'funnel'
  ];
  if (!validChartTypes.includes(stateObj.chartType)) {
    throw new Error(`Invalid chart type: ${stateObj.chartType}`);
  }

  // Data validation
  if (!stateObj.data || !stateObj.data.csv) {
    throw new Error('Invalid chart state: missing data');
  }

  // Return the entire stateObj with validation flags
  // This preserves all structured style properties (styleVersion, typography, colors, etc.)
  return {
    ...stateObj,
    isValid: true,
  };
};

/**
 * Apply deserialized chart state to current editor
 * @param {Object} chartState - Deserialized chart state
 * @param {Function} setChartType - Function to set chart type
 * @param {Object} chartData - Chart data object with methods
 * @param {Object} styleSettings - Style settings object with setters
 */
export const applyChartState = async (chartState, setChartType, chartData, styleSettings) => {
  try {
    // 1. Set chart type first
    setChartType(chartState.chartType);

    // 2. Load data
    if (chartState.data.csv) {
      await chartData.loadCSVText(chartState.data.csv);

      // Store Google Sheets URL if present
      if (chartState.data.googleSheetsUrl) {
        chartData.googleSheetsUrl = chartState.data.googleSheetsUrl;
      }
    }

    // 3. Restore hidden periods
    if (chartState.state.hiddenPeriods && chartState.state.hiddenPeriods.length > 0) {
      chartData.setHiddenPeriods(new Set(chartState.state.hiddenPeriods));
    }

    // 4. Apply style settings using importSettings
    if (chartState.styleVersion && styleSettings.importSettings) {
      // Use importSettings for proper structured format handling
      styleSettings.importSettings(chartState, chartState.chartType);
    } else {
      debug.warn('ChartStateManager', 'Chart file missing styleVersion - may not load correctly');
    }

    // 5. Restore emphasized elements
    if (chartState.state.emphasizedBars && styleSettings.setEmphasizedBars) {
      styleSettings.setEmphasizedBars(chartState.state.emphasizedBars);
    }
    if (chartState.state.emphasizedLines && styleSettings.setEmphasizedLines) {
      styleSettings.setEmphasizedLines(chartState.state.emphasizedLines);
    }

    return { success: true, message: 'Chart loaded successfully' };
  } catch (error) {
    debug.error('ChartStateManager', 'Error applying chart state', error);
    return { success: false, message: error.message };
  }
};

/**
 * Generate filename for chart save
 * @param {string} chartName - Name of the chart
 * @param {string} chartType - Type of chart
 * @returns {string} Generated filename
 */
export const generateChartFilename = (chartName, chartType) => {
  const timestamp = new Date().toISOString().split('T')[0];
  const safeName = chartName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${safeName || chartType}-chart-${timestamp}.json`;
};
