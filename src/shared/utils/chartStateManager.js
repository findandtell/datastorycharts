/**
 * Chart State Manager
 * Handles serialization and deserialization of complete chart state
 * for save/load functionality
 */

const CHART_STATE_VERSION = '1.0';

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

  const state = {
    // Metadata
    version: CHART_STATE_VERSION,
    chartType,
    timestamp: new Date().toISOString(),
    name: defaultName,

    // Data
    data: {
      csv: chartData.rawCSV || '',
      source: chartData.source || 'unknown',
      googleSheetsUrl: chartData.googleSheetsUrl || null,
      periodNames: chartData.periodNames || [],
      stageCount: chartData.stageCount || 0,
      periodCount: chartData.periodCount || 0,
      isComparisonMode: chartData.isComparisonMode || false,
    },

    // Chart State
    state: {
      hiddenPeriods: chartData.hiddenPeriods ? Array.from(chartData.hiddenPeriods) : [],
      emphasizedBars: styleSettings.emphasizedBars || [],
      emphasizedLines: styleSettings.emphasizedLines || [],
      selectedMetrics: styleSettings.selectedMetrics || [],
    },

    // Style Settings - Use structured format from exportSettings (for style preset compatibility)
    ...styleExport,

    // LEGACY: Keep flat style object for backward compatibility with old imports
    // This can be removed in a future version once all users have migrated
    style_legacy: {
      // Theme & General
      theme: styleSettings.theme,
      darkMode: styleSettings.darkMode,
      backgroundColor: styleSettings.backgroundColor,

      // Canvas & Layout
      canvasWidth: styleSettings.canvasWidth,
      canvasHeight: styleSettings.canvasHeight,
      chartWidth: styleSettings.chartWidth,
      chartHeight: styleSettings.chartHeight,
      chartPadding: styleSettings.chartPadding,

      // Title & Subtitle
      title: styleSettings.title,
      subtitle: styleSettings.subtitle,
      titleFontSize: styleSettings.titleFontSize,
      subtitleFontSize: styleSettings.subtitleFontSize,
      titleAlignment: styleSettings.titleAlignment,

      // Typography
      fontFamily: styleSettings.fontFamily,
      segmentLabelFontSize: styleSettings.segmentLabelFontSize,
      metricLabelFontSize: styleSettings.metricLabelFontSize,
      periodLabelFontSize: styleSettings.periodLabelFontSize,

      // Colors
      comparisonPalette: styleSettings.comparisonPalette,
      userCustomColors: styleSettings.userCustomColors,

      // Bar Chart Specific
      barMode: styleSettings.barMode,
      labelMode: styleSettings.labelMode,
      legendPosition: styleSettings.legendPosition,
      directLabelContent: styleSettings.directLabelContent,
      orientation: styleSettings.orientation,
      showValueLabels: styleSettings.showValueLabels,
      showMetricLabels: styleSettings.showMetricLabels,
      showPeriodLabels: styleSettings.showPeriodLabels,
      metricLabelPosition: styleSettings.metricLabelPosition,
      periodLabelDisplay: styleSettings.periodLabelDisplay,
      barWidth: styleSettings.barWidth,
      stageGap: styleSettings.stageGap,
      percentChangeEnabled: styleSettings.percentChangeEnabled,
      percentChangeLabelFormat: styleSettings.percentChangeLabelFormat,
      percentChangeBracketDistance: styleSettings.percentChangeBracketDistance,
      showTotalLabels: styleSettings.showTotalLabels,
      boldTotal: styleSettings.boldTotal,

      // Funnel Chart Specific
      metricEmphasis: styleSettings.metricEmphasis,
      normalizeToHundred: styleSettings.normalizeToHundred,
      compactNumbers: styleSettings.compactNumbers,
      showLegend: styleSettings.showLegend,
      inStageLabelFontSize: styleSettings.inStageLabelFontSize,

      // Slope Chart Specific
      colorMode: styleSettings.colorMode,
      singleColor: styleSettings.singleColor,
      lineColor: styleSettings.lineColor,
      showDots: styleSettings.showDots,
      dotSize: styleSettings.dotSize,
      lineWidth: styleSettings.lineWidth,
      leftLabelFontSize: styleSettings.leftLabelFontSize,
      rightLabelFontSize: styleSettings.rightLabelFontSize,
      headerLabelFontSize: styleSettings.headerLabelFontSize,
      lineThickness: styleSettings.lineThickness,
      lineOpacity: styleSettings.lineOpacity,
      lineSaturation: styleSettings.lineSaturation,
      endpointSize: styleSettings.endpointSize,
      endpointStyle: styleSettings.endpointStyle,
      labelPosition: styleSettings.labelPosition,
      showCategoryLabels: styleSettings.showCategoryLabels,

      // Line Chart Specific
      timeScale: styleSettings.timeScale,
      aggregationLevel: styleSettings.aggregationLevel,
      aggregationMethod: styleSettings.aggregationMethod,
      fiscalYearStartMonth: styleSettings.fiscalYearStartMonth,
      lineStyle: styleSettings.lineStyle,
      smoothLines: styleSettings.smoothLines,
      showPoints: styleSettings.showPoints,
      pointSize: styleSettings.pointSize,
      pointStyle: styleSettings.pointStyle,
      pointBorderWidth: styleSettings.pointBorderWidth,
      excludeZeroValues: styleSettings.excludeZeroValues,
      showMostRecentPoint: styleSettings.showMostRecentPoint,
      showAreaFill: styleSettings.showAreaFill,
      areaOpacity: styleSettings.areaOpacity,
      areaGradient: styleSettings.areaGradient,
      stackAreas: styleSettings.stackAreas,
      showMarkers: styleSettings.showMarkers,
      markerSize: styleSettings.markerSize,
      showArea: styleSettings.showArea,
      showMovingAverage: styleSettings.showMovingAverage,
      movingAveragePeriod: styleSettings.movingAveragePeriod,
      movingAverageColor: styleSettings.movingAverageColor,
      baselines: styleSettings.baselines,
      emphasizedPoints: styleSettings.emphasizedPoints,
      emphasizedMetric: styleSettings.emphasizedMetric,
      emphasisLabelPosition: styleSettings.emphasisLabelPosition,
      emphasisLabelFontSize: styleSettings.emphasisLabelFontSize,
      dateFormatPreset: styleSettings.dateFormatPreset,
      dateFormatCustom: styleSettings.dateFormatCustom,
      showXAxis: styleSettings.showXAxis,
      showYAxis: styleSettings.showYAxis,
      yAxisFormat: styleSettings.yAxisFormat,

      // Axes & Gridlines
      showHorizontalGridlines: styleSettings.showHorizontalGridlines,
      showVerticalGridlines: styleSettings.showVerticalGridlines,
      axisMinimum: styleSettings.axisMinimum,
      axisMinimumAuto: styleSettings.axisMinimumAuto,
      axisMaximum: styleSettings.axisMaximum,
      axisMaximumAuto: styleSettings.axisMaximumAuto,
      axisMajorUnit: styleSettings.axisMajorUnit,
      axisMajorUnitAuto: styleSettings.axisMajorUnitAuto,
      axisMinorUnit: styleSettings.axisMinorUnit,
      axisMinorUnitAuto: styleSettings.axisMinorUnitAuto,
      axisMajorTickType: styleSettings.axisMajorTickType,
      axisMinorTickType: styleSettings.axisMinorTickType,
      xAxisFontSize: styleSettings.xAxisFontSize,
      yAxisFontSize: styleSettings.yAxisFontSize,
      axisLabel: styleSettings.axisLabel,
      axisLabelFontSize: styleSettings.axisLabelFontSize,
      xAxisLabelRotation: styleSettings.xAxisLabelRotation,
      compactAxisNumbers: styleSettings.compactAxisNumbers,

      // Number Formatting (Labels)
      valuePrefix: styleSettings.valuePrefix,
      valueSuffix: styleSettings.valueSuffix,
      valueDecimalPlaces: styleSettings.valueDecimalPlaces,
      valueFormat: styleSettings.valueFormat,

      // Number Formatting (Axis)
      axisValuePrefix: styleSettings.axisValuePrefix,
      axisValueSuffix: styleSettings.axisValueSuffix,
      axisValueDecimalPlaces: styleSettings.axisValueDecimalPlaces,
      axisValueFormat: styleSettings.axisValueFormat,

      // Branding
      userTier: styleSettings.userTier,
    },
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
    console.warn(`Chart state version mismatch: expected ${CHART_STATE_VERSION}, got ${stateObj.version}`);
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

  return {
    isValid: true,
    version: stateObj.version,
    chartType: stateObj.chartType,
    name: stateObj.name || 'Untitled Chart',
    timestamp: stateObj.timestamp,
    data: stateObj.data,
    state: stateObj.state || {},
    style: stateObj.style || {},
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

    // 4. Apply style settings - Try structured format first (new), then fall back to legacy flat format
    if (chartState.styleVersion && styleSettings.importSettings) {
      // New structured format - use importSettings for proper handling
      styleSettings.importSettings(chartState, chartState.chartType);
    } else if (chartState.style) {
      // Legacy flat format - apply each setting individually
      Object.entries(chartState.style).forEach(([key, value]) => {
        const setterName = `set${key.charAt(0).toUpperCase()}${key.slice(1)}`;
        const setter = styleSettings[setterName];

        if (setter && typeof setter === 'function') {
          setter(value);
        }
      });
    } else if (chartState.style_legacy) {
      // Very old format stored in style_legacy
      Object.entries(chartState.style_legacy).forEach(([key, value]) => {
        const setterName = `set${key.charAt(0).toUpperCase()}${key.slice(1)}`;
        const setter = styleSettings[setterName];

        if (setter && typeof setter === 'function') {
          setter(value);
        }
      });
    }

    // 5. Restore emphasized elements
    if (chartState.state.emphasizedBars && styleSettings.setEmphasizedBars) {
      styleSettings.setEmphasizedBars(chartState.state.emphasizedBars);
    }
    if (chartState.state.emphasizedLines && styleSettings.setEmphasizedLines) {
      styleSettings.setEmphasizedLines(chartState.state.emphasizedLines);
    }
    if (chartState.state.selectedMetrics && styleSettings.setSelectedMetrics) {
      styleSettings.setSelectedMetrics(chartState.state.selectedMetrics);
    }

    return { success: true, message: 'Chart loaded successfully' };
  } catch (error) {
    console.error('Error applying chart state:', error);
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
