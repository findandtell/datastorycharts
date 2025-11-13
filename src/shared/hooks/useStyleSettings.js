import { useState, useCallback } from "react";
import theme from "../design-system/theme";
import { defaultUserColors } from "../design-system/colorPalettes";

/**
 * Custom hook for managing chart style settings
 */
export const useStyleSettings = (initialTheme = theme) => {
  // Typography
  const [title, setTitle] = useState("Units Produced by Region");
  const [subtitle, setSubtitle] = useState("Production units by regional location (January)");
  const [titleAlignment, setTitleAlignment] = useState("center"); // 'left' or 'center'
  const [fontFamily, setFontFamily] = useState(initialTheme.typography.families[0]);
  const [titleFontSize, setTitleFontSize] = useState(initialTheme.typography.sizes.title);
  const [subtitleFontSize, setSubtitleFontSize] = useState(initialTheme.typography.sizes.subtitle);
  const [segmentLabelFontSize, setSegmentLabelFontSize] = useState(22);
  const [metricLabelFontSize, setMetricLabelFontSize] = useState(24);
  const [periodLabelFontSize, setPeriodLabelFontSize] = useState(14); // Period label font size
  const [legendFontSize, setLegendFontSize] = useState(initialTheme.typography.sizes.legend);
  const [conversionLabelFontSize, setConversionLabelFontSize] = useState(initialTheme.typography.sizes.conversionLabel);

  // Colors
  const [barColor, setBarColor] = useState("#1e40af");
  const [colorTransition, setColorTransition] = useState(60);
  const [comparisonPalette, setComparisonPalette] = useState("observable10");
  const [userCustomColors, setUserCustomColors] = useState(defaultUserColors);

  // Layout
  const [orientation, setOrientation] = useState("vertical");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [canvasWidth, setCanvasWidth] = useState(1000);
  const [canvasHeight, setCanvasHeight] = useState(600);
  const [chartWidth, setChartWidth] = useState(600);
  const [chartHeight, setChartHeight] = useState(400);
  const [chartPadding, setChartPadding] = useState(15);
  const [stageGap, setStageGap] = useState(10);
  const [barWidth, setBarWidth] = useState(100);
  const [stageLabelPosition, setStageLabelPosition] = useState("bottom");

  // Visual
  const [axisLineWidth, setAxisLineWidth] = useState(3);
  const [backgroundOpacity, setBackgroundOpacity] = useState(100);

  // Display options
  const [emphasis, setEmphasis] = useState("throughput");
  const [metricEmphasis, setMetricEmphasis] = useState("volume");
  const [normalizeToHundred, setNormalizeToHundred] = useState(true);
  const [compactNumbers, setCompactNumbers] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [legendPosition, setLegendPosition] = useState("direct"); // "legend" or "direct"
  const [inStageLabelFontSize, setInStageLabelFontSize] = useState(13);
  const [showSparklines, setShowSparklines] = useState(false);
  const [sparklineType, setSparklineType] = useState("volume");
  const [userTier, setUserTier] = useState("free"); // "free" or "pro"

  // Theme settings
  const [darkMode, setDarkMode] = useState(false); // Light/Dark mode toggle
  const [backgroundColor, setBackgroundColor] = useState("#ffffff"); // Background color

  // Slope Chart specific settings
  const [colorMode, setColorMode] = useState("category"); // 'category', 'trend', 'custom', 'gradient'
  const [lineThickness, setLineThickness] = useState(2);
  const [lineOpacity, setLineOpacity] = useState(1.0);
  const [lineSaturation, setLineSaturation] = useState(100); // 0-100%, where 100% = full color, 0% = grey
  const [endpointSize, setEndpointSize] = useState(6);
  const [endpointStyle, setEndpointStyle] = useState("filled"); // 'filled' or 'outlined'
  const [labelPosition, setLabelPosition] = useState("left"); // 'left', 'right', or 'both'
  const [showCategoryLabels, setShowCategoryLabels] = useState(true);
  const [showValueLabels, setShowValueLabels] = useState(true);
  const [showMetricLabels, setShowMetricLabels] = useState(true); // Toggle for metric/value labels
  const [showPeriodLabels, setShowPeriodLabels] = useState(true); // Toggle for period/category labels
  const [metricLabelPosition, setMetricLabelPosition] = useState("outside"); // 'inside' or 'outside' - position at end of bars
  const [periodLabelDisplay, setPeriodLabelDisplay] = useState("first"); // 'first' or 'all' - show in first group only or all groups
  const [labelFormat, setLabelFormat] = useState("value"); // 'value', 'percentage', 'both'
  const [emphasizedLines, setEmphasizedLines] = useState([]);
  const [increaseColor, setIncreaseColor] = useState("#10b981");
  const [decreaseColor, setDecreaseColor] = useState("#ef4444");
  const [noChangeColor, setNoChangeColor] = useState("#6b7280");
  const [startColor, setStartColor] = useState("#1e40af");
  const [endColor, setEndColor] = useState("#10b981");
  const [periodSpacing, setPeriodSpacing] = useState(400);
  const [periodHeight, setPeriodHeight] = useState(700); // Controls vertical spacing of chart content
  const [periodLabelPosition, setPeriodLabelPosition] = useState("below"); // 'above' or 'below'
  const [slopeAxisLineColor, setSlopeAxisLineColor] = useState("#ababab");
  const [slopeAxisLineWidth, setSlopeAxisLineWidth] = useState(1);
  const [slopeAxisLineStyle, setSlopeAxisLineStyle] = useState("solid"); // 'solid', 'dashed', 'dotted'
  const [axisEnds, setAxisEnds] = useState("none"); // 'none', 't-end'

  // Bar Chart specific
  const [barMode, setBarMode] = useState("grouped"); // 'grouped' or 'stacked'
  const [labelMode, setLabelMode] = useState("direct"); // 'legend' or 'direct'
  const [directLabelContent, setDirectLabelContent] = useState("metrics"); // 'metrics', 'metrics-category', or 'category'
  const [emphasizedBars, setEmphasizedBars] = useState([]); // Array of bar identifiers to emphasize
  const [showTotalLabels, setShowTotalLabels] = useState(true); // Show total labels on stacked bars
  const [boldTotal, setBoldTotal] = useState(false); // Make total labels bold
  const [xAxisFontSize, setXAxisFontSize] = useState(12); // X-axis primary label font size
  const [xAxisSecondaryFontSize, setXAxisSecondaryFontSize] = useState(12); // X-axis secondary label font size
  const [yAxisFontSize, setYAxisFontSize] = useState(20); // Y-axis label font size
  const [axisLabel, setAxisLabel] = useState(""); // Axis label text (appears at end of value axis)
  const [axisLabelFontSize, setAxisLabelFontSize] = useState(17); // Axis label font size
  const [xAxisLabelRotation, setXAxisLabelRotation] = useState(0); // X-axis label rotation angle (0-90 degrees)

  // Number Styling (Values)
  const [valuePrefix, setValuePrefix] = useState(""); // Prefix for values (e.g., "$")
  const [valueSuffix, setValueSuffix] = useState(""); // Suffix for values (e.g., "%")
  const [valueDecimalPlaces, setValueDecimalPlaces] = useState(0); // Decimal places for values
  const [valueFormat, setValueFormat] = useState("number"); // 'number' or 'percentage'

  // Bar Chart axis options
  const [axisMinimum, setAxisMinimum] = useState(0);
  const [axisMinimumAuto, setAxisMinimumAuto] = useState(true);
  const [axisMaximum, setAxisMaximum] = useState(50000);
  const [axisMaximumAuto, setAxisMaximumAuto] = useState(true);

  // Percent Change Emphasis
  const [percentChangeEnabled, setPercentChangeEnabled] = useState(false);
  const [percentChangeLabelFormat, setPercentChangeLabelFormat] = useState('percent'); // 'percent' or 'percent-volume'
  const [percentChangeBracketDistance, setPercentChangeBracketDistance] = useState(100); // 0-100, controls how far brackets extend from bars
  const [axisMajorUnit, setAxisMajorUnit] = useState(10000);
  const [axisMajorUnitAuto, setAxisMajorUnitAuto] = useState(true);
  const [axisMinorUnit, setAxisMinorUnit] = useState(5);
  const [axisMinorUnitAuto, setAxisMinorUnitAuto] = useState(true);
  const [axisMajorTickType, setAxisMajorTickType] = useState("outside");
  const [axisMinorTickType, setAxisMinorTickType] = useState("none");
  const [showHorizontalGridlines, setShowHorizontalGridlines] = useState(false);
  const [showVerticalGridlines, setShowVerticalGridlines] = useState(false);
  const [compactAxisNumbers, setCompactAxisNumbers] = useState(true);
  const [xAxisLineThickness, setXAxisLineThickness] = useState(1); // X-axis line thickness (0-3px, 0 = off)
  const [yAxisLineThickness, setYAxisLineThickness] = useState(1); // Y-axis line thickness (0-3px, 0 = off)
  const [axisColorBrightness, setAxisColorBrightness] = useState(0); // Axis color brightness (0=black, 50=grey, 100=white)
  const [showXAxisLabels, setShowXAxisLabels] = useState(true); // Show/hide X-axis labels
  const [showYAxisLabels, setShowYAxisLabels] = useState(true); // Show/hide Y-axis labels

  // Axis-specific number formatting (separate from data label formatting)
  const [axisValuePrefix, setAxisValuePrefix] = useState(""); // Prefix for axis values (e.g., "$")
  const [axisValueSuffix, setAxisValueSuffix] = useState(""); // Suffix for axis values (e.g., "%")
  const [axisValueDecimalPlaces, setAxisValueDecimalPlaces] = useState(0); // Decimal places for axis values
  const [axisValueFormat, setAxisValueFormat] = useState("number"); // 'number' or 'percentage'

  // Calculated bounds (for display when Auto is enabled)
  const [calculatedAxisMinimum, setCalculatedAxisMinimum] = useState(0);
  const [calculatedAxisMaximum, setCalculatedAxisMaximum] = useState(100);
  const [calculatedAxisMajorUnit, setCalculatedAxisMajorUnit] = useState(10);

  // Line Chart specific
  const [timeScale, setTimeScale] = useState('month'); // 'year', 'month', 'week', 'day', 'hour'
  const [lineStyle, setLineStyle] = useState('solid'); // 'solid', 'dashed', 'dotted'
  const [smoothLines, setSmoothLines] = useState(false);
  const [showPoints, setShowPoints] = useState(true);
  const [pointSize, setPointSize] = useState(4);
  const [pointStyle, setPointStyle] = useState('filled'); // 'filled' or 'outlined'
  const [pointBorderWidth, setPointBorderWidth] = useState(2);
  const [showAreaFill, setShowAreaFill] = useState(true);
  const [areaOpacity, setAreaOpacity] = useState(0.2);
  const [areaGradient, setAreaGradient] = useState(true);
  const [stackAreas, setStackAreas] = useState(false);
  const [chartMode, setChartMode] = useState('line');
  const [showXAxis, setShowXAxis] = useState(true);
  const [showYAxis, setShowYAxis] = useState(true);
  const [showGridLines, setShowGridLines] = useState(true);
  const [gridDirection, setGridDirection] = useState('horizontal'); // 'horizontal', 'vertical', 'both'
  const [gridLineColor, setGridLineColor] = useState('#e5e7eb');
  const [gridLineStyle, setGridLineStyle] = useState('solid'); // 'solid', 'dashed', 'dotted'
  const [gridLineOpacity, setGridLineOpacity] = useState(0.5);
  const [showDirectLabels, setShowDirectLabels] = useState(true);
  const [directLabelFontSize, setDirectLabelFontSize] = useState(14); // Direct label font size (Line Chart)
  const [yAxisFormat, setYAxisFormat] = useState('auto');
  const [excludeZeroValues, setExcludeZeroValues] = useState(true); // Exclude zero/null values from plotting
  const [showMostRecentPoint, setShowMostRecentPoint] = useState(false); // Show point marker on most recent value

  // Time aggregation settings (Line Chart)
  const [aggregationLevel, setAggregationLevel] = useState('day'); // 'day', 'week', 'month', 'quarter', 'year'
  const [aggregationMethod, setAggregationMethod] = useState('sum'); // 'sum', 'average', 'min', 'max', 'count'
  const [fiscalYearStartMonth, setFiscalYearStartMonth] = useState(1); // 1-12 (1 = January)
  const [xAxisTimeGrouping, setXAxisTimeGrouping] = useState('auto'); // 'auto', 'day-week', 'day-month', 'week-month', 'month-year', etc.
  const [xAxisLabelLevels, setXAxisLabelLevels] = useState(2); // 1 = single level, 2 = two levels
  const [dateRangeFilter, setDateRangeFilter] = useState([0, 100]); // [startPercent, endPercent] - 0-100
  const [xAxisPrimaryLabel, setXAxisPrimaryLabel] = useState('auto'); // 'auto', 'day', 'week', 'month', 'quarter', 'year', 'date'
  const [xAxisSecondaryLabel, setXAxisSecondaryLabel] = useState('auto'); // 'auto', 'week', 'month', 'quarter', 'year', 'none'
  const [dateFormatPreset, setDateFormatPreset] = useState('MM/dd/yy'); // Date format preset
  const [dateFormatCustom, setDateFormatCustom] = useState(''); // Custom date format (overrides preset if not empty)

  // Emphasis settings (Line Chart)
  const [emphasizedPoints, setEmphasizedPoints] = useState([]); // Array of point identifiers (max 4)
  const [emphasizedMetric, setEmphasizedMetric] = useState(null); // Single metric name to emphasize entire line
  const [emphasisLabelPosition, setEmphasisLabelPosition] = useState('above'); // 'above', 'below'
  const [emphasisLabelFontSize, setEmphasisLabelFontSize] = useState(12); // Font size for emphasis labels
  const [showEmphasisDate, setShowEmphasisDate] = useState(true); // Show date below metric value
  const [emphasisCompactNumbers, setEmphasisCompactNumbers] = useState(false); // Compact number formatting (K, M, B)
  const [emphasisValuePrefix, setEmphasisValuePrefix] = useState(''); // Prefix for emphasis values
  const [emphasisValueSuffix, setEmphasisValueSuffix] = useState(''); // Suffix for emphasis values
  const [emphasisDecimalPlaces, setEmphasisDecimalPlaces] = useState(0); // Decimal places for emphasis values
  const [showEmphasisVerticalLine, setShowEmphasisVerticalLine] = useState(false); // Show vertical line from X-axis to emphasized point

  /**
   * Update canvas dimensions based on aspect ratio
   */
  const updateAspectRatio = useCallback((ratio) => {
    setAspectRatio(ratio);
    const dimensions = initialTheme.layout.aspectRatios[ratio] || initialTheme.layout.aspectRatios["1:1"];
    setCanvasWidth(dimensions.width);
    setCanvasHeight(dimensions.height);
  }, [initialTheme]);

  /**
   * Wrapper for setDarkMode that also syncs axis color
   * Light mode: 0 (black), Dark mode: 100 (white)
   */
  const handleSetDarkMode = useCallback((value) => {
    setDarkMode(value);
    // Auto-sync axis color with theme
    if (value) {
      setAxisColorBrightness(100); // White for dark mode
    } else {
      setAxisColorBrightness(0); // Black for light mode
    }
  }, []);

  /**
   * Reset all settings to defaults
   */
  const resetToDefaults = useCallback(() => {
    setTitle("Units Produced by Region");
    setSubtitle("Production units by regional location (January)");
    setFontFamily(initialTheme.typography.families[0]);
    setTitleFontSize(initialTheme.typography.sizes.title);
    setSubtitleFontSize(initialTheme.typography.sizes.subtitle);
    setSegmentLabelFontSize(22);
    setMetricLabelFontSize(24);
    setLegendFontSize(initialTheme.typography.sizes.legend);
    setConversionLabelFontSize(initialTheme.typography.sizes.conversionLabel);
    setBarColor("#1e40af");
    setColorTransition(60);
    setComparisonPalette("professional");
    setUserCustomColors(defaultUserColors);
    setOrientation("vertical");
    setAspectRatio("1:1");
    setCanvasWidth(900);
    setCanvasHeight(900);
    setChartWidth(600);
    setChartHeight(400);
    setChartPadding(25);
    setStageGap(10);
    setStageLabelPosition("bottom");
    setAxisLineWidth(3);
    setBackgroundOpacity(100);
    setEmphasis("throughput");
    setMetricEmphasis("volume");
    setNormalizeToHundred(true);
    setCompactNumbers(true);
    setShowLegend(true);
    setLegendPosition("direct");
    setInStageLabelFontSize(13);
    setShowSparklines(false);
    setSparklineType("volume");
    setUserTier("pro");
    setBarMode("grouped");
    setLabelMode("direct");
    setDirectLabelContent("metrics");
    setEmphasizedBars([]);
    setXAxisFontSize(20);
    setYAxisFontSize(20);
    setAxisLabel("");
    setAxisLabelFontSize(17);
    setXAxisLabelRotation(0);
    setAxisMinimum(0);
    setAxisMinimumAuto(true);
    setAxisMaximum(50000);
    setAxisMaximumAuto(true);
    setAxisMajorUnit(10000);
    setAxisMajorUnitAuto(true);
    setAxisMinorUnit(5);
    setAxisMinorUnitAuto(true);
    setAxisMajorTickType("outside");
    setAxisMinorTickType("none");
    setShowHorizontalGridlines(false);
    setShowVerticalGridlines(false);
    setCompactAxisNumbers(true);
    setValuePrefix("");
    setValueSuffix("");
    setValueDecimalPlaces(0);
    setValueFormat("number");
    setPeriodLabelFontSize(14);
  }, [initialTheme]);

  /**
   * Export settings as JSON (complete structure for cross-chart compatibility)
   */
  const exportSettings = useCallback(() => {
    return {
      styleVersion: "1.0",
      appVersion: "2.0.0",
      typography: {
        title,
        subtitle,
        titleAlignment,
        fontFamily,
        titleFontSize,
        subtitleFontSize,
        segmentLabelFontSize,
        metricLabelFontSize,
        periodLabelFontSize,
        legendFontSize,
        conversionLabelFontSize,
        inStageLabelFontSize,
      },
      colors: {
        barColor,
        colorTransition,
        comparisonPalette,
        userCustomColors,
      },
      layout: {
        orientation,
        aspectRatio,
        canvasWidth,
        canvasHeight,
        chartWidth,
        chartHeight,
        chartPadding,
        stageGap,
        barWidth,
        stageLabelPosition,
      },
      visual: {
        axisLineWidth,
        backgroundOpacity,
        darkMode,
        backgroundColor,
      },
      display: {
        emphasis,
        metricEmphasis,
        normalizeToHundred,
        compactNumbers,
        showLegend,
        legendPosition,
        showSparklines,
        sparklineType,
        userTier,
        percentChangeEnabled,
        percentChangeLabelFormat,
      },
      chartSpecific: {
        slope: {
          colorMode,
          lineThickness,
          lineOpacity,
          lineSaturation,
          endpointSize,
          endpointStyle,
          labelPosition,
          showCategoryLabels,
          showValueLabels,
          labelFormat,
          increaseColor,
          decreaseColor,
          noChangeColor,
          startColor,
          endColor,
          periodSpacing,
          periodHeight,
          periodLabelPosition,
          slopeAxisLineColor,
          slopeAxisLineWidth,
          slopeAxisLineStyle,
          axisEnds,
        },
        bar: {
          barMode,
          labelMode,
          directLabelContent,
          emphasizedBars,
          showMetricLabels,
          showPeriodLabels,
          metricLabelPosition,
          periodLabelDisplay,
          percentChangeBracketDistance,
          showTotalLabels,
          boldTotal,
          xAxisFontSize,
          xAxisSecondaryFontSize,
          yAxisFontSize,
          axisLabel,
          axisLabelFontSize,
          xAxisLabelRotation,
          axisMinimum,
          axisMinimumAuto,
          axisMaximum,
          axisMaximumAuto,
          axisMajorUnit,
          axisMajorUnitAuto,
          axisMinorUnit,
          axisMinorUnitAuto,
          axisMajorTickType,
          axisMinorTickType,
          showHorizontalGridlines,
          showVerticalGridlines,
          compactAxisNumbers,
          valuePrefix,
          valueSuffix,
          valueDecimalPlaces,
          valueFormat,
          axisValuePrefix,
          axisValueSuffix,
          axisValueDecimalPlaces,
          axisValueFormat,
          xAxisLineThickness,
          yAxisLineThickness,
          axisColorBrightness,
          showXAxisLabels,
          showYAxisLabels,
        },
        funnel: {
          // Funnel-specific settings will be here
        },
        line: {
          // Time settings
          timeScale,
          aggregationLevel,
          aggregationMethod,
          fiscalYearStartMonth,
          xAxisTimeGrouping,
          xAxisLabelLevels,
          dateRangeFilter,
          xAxisPrimaryLabel,
          xAxisSecondaryLabel,
          dateFormatPreset,
          dateFormatCustom,
          // Line styling
          lineStyle,
          smoothLines,
          // Point styling
          showPoints,
          pointSize,
          pointStyle,
          pointBorderWidth,
          excludeZeroValues,
          showMostRecentPoint,
          // Area fill
          showAreaFill,
          areaOpacity,
          areaGradient,
          stackAreas,
          chartMode,
          // Axis display
          showXAxis,
          showYAxis,
          yAxisFormat,
          xAxisLineThickness,
          yAxisLineThickness,
          // Grid
          showGridLines,
          gridDirection,
          gridLineColor,
          gridLineStyle,
          gridLineOpacity,
          // Direct labels
          showDirectLabels,
          directLabelFontSize,
          // Emphasis
          emphasizedPoints,
          emphasizedMetric,
          emphasisLabelPosition,
          emphasisLabelFontSize,
          showEmphasisDate,
          emphasisCompactNumbers,
          emphasisValuePrefix,
          emphasisValueSuffix,
          emphasisDecimalPlaces,
          showEmphasisVerticalLine,
        },
      },
    };
  }, [
    title, subtitle, titleAlignment, fontFamily, titleFontSize, subtitleFontSize,
    segmentLabelFontSize, metricLabelFontSize, periodLabelFontSize, legendFontSize,
    conversionLabelFontSize, inStageLabelFontSize,
    barColor, colorTransition, comparisonPalette, userCustomColors,
    orientation, aspectRatio, canvasWidth, canvasHeight, chartWidth, chartHeight, chartPadding, stageGap, barWidth, stageLabelPosition,
    axisLineWidth, backgroundOpacity, darkMode, backgroundColor,
    emphasis, metricEmphasis, normalizeToHundred, compactNumbers, showLegend, legendPosition,
    showSparklines, sparklineType, userTier, percentChangeEnabled, percentChangeLabelFormat,
    colorMode, lineThickness, lineOpacity, lineSaturation, endpointSize, endpointStyle,
    labelPosition, showCategoryLabels, showValueLabels, labelFormat,
    increaseColor, decreaseColor, noChangeColor, startColor, endColor,
    periodSpacing, periodHeight, periodLabelPosition,
    slopeAxisLineColor, slopeAxisLineWidth, slopeAxisLineStyle, axisEnds,
    barMode, labelMode, directLabelContent, emphasizedBars, showMetricLabels, showPeriodLabels,
    metricLabelPosition, periodLabelDisplay, percentChangeBracketDistance, showTotalLabels, boldTotal,
    xAxisFontSize, xAxisSecondaryFontSize, yAxisFontSize, axisLabel, axisLabelFontSize, xAxisLabelRotation,
    axisMinimum, axisMinimumAuto, axisMaximum, axisMaximumAuto,
    axisMajorUnit, axisMajorUnitAuto, axisMinorUnit, axisMinorUnitAuto,
    axisMajorTickType, axisMinorTickType, showHorizontalGridlines, showVerticalGridlines,
    compactAxisNumbers, valuePrefix, valueSuffix, valueDecimalPlaces, valueFormat,
    axisValuePrefix, axisValueSuffix, axisValueDecimalPlaces, axisValueFormat,
    xAxisLineThickness, yAxisLineThickness, axisColorBrightness,
    showXAxisLabels, showYAxisLabels,
    timeScale, aggregationLevel, aggregationMethod, fiscalYearStartMonth,
    xAxisTimeGrouping, xAxisLabelLevels, dateRangeFilter, xAxisPrimaryLabel, xAxisSecondaryLabel,
    dateFormatPreset, dateFormatCustom, lineStyle, smoothLines,
    showPoints, pointSize, pointStyle, pointBorderWidth, excludeZeroValues, showMostRecentPoint,
    showAreaFill, areaOpacity, areaGradient, showXAxis, showYAxis, yAxisFormat,
    showGridLines, gridDirection, gridLineColor, gridLineStyle, gridLineOpacity,
    showDirectLabels, directLabelFontSize,
    emphasizedPoints, emphasizedMetric, emphasisLabelPosition, emphasisLabelFontSize,
    showEmphasisDate, emphasisCompactNumbers, emphasisValuePrefix, emphasisValueSuffix,
    emphasisDecimalPlaces, showEmphasisVerticalLine,
  ]);

  /**
   * Import settings from JSON with smart cross-chart compatibility
   * @param {Object} settings - The imported settings object
   * @param {string} currentChartType - Current chart type ('slope' or 'funnel')
   */
  const importSettings = useCallback((settings, currentChartType = 'slope') => {
    // Typography (universal - applies to all charts)
    if (settings.typography) {
      if (settings.typography.title !== undefined) setTitle(settings.typography.title);
      if (settings.typography.subtitle !== undefined) setSubtitle(settings.typography.subtitle);
      if (settings.typography.titleAlignment !== undefined) setTitleAlignment(settings.typography.titleAlignment);
      if (settings.typography.fontFamily !== undefined) setFontFamily(settings.typography.fontFamily);
      if (settings.typography.titleFontSize !== undefined) setTitleFontSize(settings.typography.titleFontSize);
      if (settings.typography.subtitleFontSize !== undefined) setSubtitleFontSize(settings.typography.subtitleFontSize);
      if (settings.typography.segmentLabelFontSize !== undefined) setSegmentLabelFontSize(settings.typography.segmentLabelFontSize);
      if (settings.typography.metricLabelFontSize !== undefined) setMetricLabelFontSize(settings.typography.metricLabelFontSize);
      if (settings.typography.periodLabelFontSize !== undefined) setPeriodLabelFontSize(settings.typography.periodLabelFontSize);
      if (settings.typography.legendFontSize !== undefined) setLegendFontSize(settings.typography.legendFontSize);
      if (settings.typography.conversionLabelFontSize !== undefined) setConversionLabelFontSize(settings.typography.conversionLabelFontSize);
      if (settings.typography.inStageLabelFontSize !== undefined) setInStageLabelFontSize(settings.typography.inStageLabelFontSize);
    }

    // Colors (universal - applies to all charts)
    if (settings.colors) {
      if (settings.colors.barColor !== undefined) setBarColor(settings.colors.barColor);
      if (settings.colors.colorTransition !== undefined) setColorTransition(settings.colors.colorTransition);
      if (settings.colors.comparisonPalette !== undefined) setComparisonPalette(settings.colors.comparisonPalette);
      if (settings.colors.userCustomColors !== undefined) setUserCustomColors(settings.colors.userCustomColors);
    }

    // Layout (universal - applies to all charts)
    if (settings.layout) {
      if (settings.layout.orientation !== undefined) setOrientation(settings.layout.orientation);
      if (settings.layout.aspectRatio !== undefined) setAspectRatio(settings.layout.aspectRatio);
      if (settings.layout.canvasWidth !== undefined) setCanvasWidth(settings.layout.canvasWidth);
      if (settings.layout.canvasHeight !== undefined) setCanvasHeight(settings.layout.canvasHeight);
      if (settings.layout.chartWidth !== undefined) setChartWidth(settings.layout.chartWidth);
      if (settings.layout.chartHeight !== undefined) setChartHeight(settings.layout.chartHeight);
      if (settings.layout.chartPadding !== undefined) setChartPadding(settings.layout.chartPadding);
      if (settings.layout.stageGap !== undefined) setStageGap(settings.layout.stageGap);
      if (settings.layout.barWidth !== undefined) setBarWidth(settings.layout.barWidth);
      if (settings.layout.stageLabelPosition !== undefined) setStageLabelPosition(settings.layout.stageLabelPosition);
    }

    // Visual (universal - applies to all charts)
    if (settings.visual) {
      if (settings.visual.axisLineWidth !== undefined) setAxisLineWidth(settings.visual.axisLineWidth);
      if (settings.visual.backgroundOpacity !== undefined) setBackgroundOpacity(settings.visual.backgroundOpacity);
      if (settings.visual.darkMode !== undefined) setDarkMode(settings.visual.darkMode);
      if (settings.visual.backgroundColor !== undefined) setBackgroundColor(settings.visual.backgroundColor);
    }

    // Display (universal - applies to all charts)
    if (settings.display) {
      if (settings.display.emphasis !== undefined) setEmphasis(settings.display.emphasis);
      if (settings.display.metricEmphasis !== undefined) setMetricEmphasis(settings.display.metricEmphasis);
      if (settings.display.normalizeToHundred !== undefined) setNormalizeToHundred(settings.display.normalizeToHundred);
      if (settings.display.compactNumbers !== undefined) setCompactNumbers(settings.display.compactNumbers);
      if (settings.display.showLegend !== undefined) setShowLegend(settings.display.showLegend);
      if (settings.display.legendPosition !== undefined) setLegendPosition(settings.display.legendPosition);
      if (settings.display.showSparklines !== undefined) setShowSparklines(settings.display.showSparklines);
      if (settings.display.sparklineType !== undefined) setSparklineType(settings.display.sparklineType);
      if (settings.display.userTier !== undefined) setUserTier(settings.display.userTier);
      if (settings.display.percentChangeEnabled !== undefined) setPercentChangeEnabled(settings.display.percentChangeEnabled);
      if (settings.display.percentChangeLabelFormat !== undefined) setPercentChangeLabelFormat(settings.display.percentChangeLabelFormat);
    }

    // Chart-specific settings (smart import based on current chart type)
    if (settings.chartSpecific) {
      if (currentChartType === 'slope' && settings.chartSpecific.slope) {
        const slopeSettings = settings.chartSpecific.slope;
        if (slopeSettings.colorMode !== undefined) setColorMode(slopeSettings.colorMode);
        if (slopeSettings.lineThickness !== undefined) setLineThickness(slopeSettings.lineThickness);
        if (slopeSettings.lineOpacity !== undefined) setLineOpacity(slopeSettings.lineOpacity);
        if (slopeSettings.lineSaturation !== undefined) setLineSaturation(slopeSettings.lineSaturation);
        if (slopeSettings.endpointSize !== undefined) setEndpointSize(slopeSettings.endpointSize);
        if (slopeSettings.endpointStyle !== undefined) setEndpointStyle(slopeSettings.endpointStyle);
        if (slopeSettings.labelPosition !== undefined) setLabelPosition(slopeSettings.labelPosition);
        if (slopeSettings.showCategoryLabels !== undefined) setShowCategoryLabels(slopeSettings.showCategoryLabels);
        if (slopeSettings.showValueLabels !== undefined) setShowValueLabels(slopeSettings.showValueLabels);
        if (slopeSettings.labelFormat !== undefined) setLabelFormat(slopeSettings.labelFormat);
        if (slopeSettings.increaseColor !== undefined) setIncreaseColor(slopeSettings.increaseColor);
        if (slopeSettings.decreaseColor !== undefined) setDecreaseColor(slopeSettings.decreaseColor);
        if (slopeSettings.noChangeColor !== undefined) setNoChangeColor(slopeSettings.noChangeColor);
        if (slopeSettings.startColor !== undefined) setStartColor(slopeSettings.startColor);
        if (slopeSettings.endColor !== undefined) setEndColor(slopeSettings.endColor);
        if (slopeSettings.periodSpacing !== undefined) setPeriodSpacing(slopeSettings.periodSpacing);
        if (slopeSettings.periodHeight !== undefined) setPeriodHeight(slopeSettings.periodHeight);
        if (slopeSettings.periodLabelPosition !== undefined) setPeriodLabelPosition(slopeSettings.periodLabelPosition);
        if (slopeSettings.slopeAxisLineColor !== undefined) setSlopeAxisLineColor(slopeSettings.slopeAxisLineColor);
        if (slopeSettings.slopeAxisLineWidth !== undefined) setSlopeAxisLineWidth(slopeSettings.slopeAxisLineWidth);
        if (slopeSettings.slopeAxisLineStyle !== undefined) setSlopeAxisLineStyle(slopeSettings.slopeAxisLineStyle);
        if (slopeSettings.axisEnds !== undefined) setAxisEnds(slopeSettings.axisEnds);
      } else if (currentChartType === 'bar' && settings.chartSpecific.bar) {
        const barSettings = settings.chartSpecific.bar;
        if (barSettings.barMode !== undefined) setBarMode(barSettings.barMode);
        if (barSettings.labelMode !== undefined) setLabelMode(barSettings.labelMode);
        if (barSettings.directLabelContent !== undefined) setDirectLabelContent(barSettings.directLabelContent);
        if (barSettings.emphasizedBars !== undefined) setEmphasizedBars(barSettings.emphasizedBars);
        if (barSettings.xAxisFontSize !== undefined) setXAxisFontSize(barSettings.xAxisFontSize);
        if (barSettings.yAxisFontSize !== undefined) setYAxisFontSize(barSettings.yAxisFontSize);
        if (barSettings.axisLabel !== undefined) setAxisLabel(barSettings.axisLabel);
        if (barSettings.axisLabelFontSize !== undefined) setAxisLabelFontSize(barSettings.axisLabelFontSize);
        if (barSettings.xAxisLabelRotation !== undefined) setXAxisLabelRotation(barSettings.xAxisLabelRotation);
        if (barSettings.axisMinimum !== undefined) setAxisMinimum(barSettings.axisMinimum);
        if (barSettings.axisMinimumAuto !== undefined) setAxisMinimumAuto(barSettings.axisMinimumAuto);
        if (barSettings.axisMaximum !== undefined) setAxisMaximum(barSettings.axisMaximum);
        if (barSettings.axisMaximumAuto !== undefined) setAxisMaximumAuto(barSettings.axisMaximumAuto);
        if (barSettings.axisMajorUnit !== undefined) setAxisMajorUnit(barSettings.axisMajorUnit);
        if (barSettings.axisMajorUnitAuto !== undefined) setAxisMajorUnitAuto(barSettings.axisMajorUnitAuto);
        if (barSettings.axisMinorUnit !== undefined) setAxisMinorUnit(barSettings.axisMinorUnit);
        if (barSettings.axisMinorUnitAuto !== undefined) setAxisMinorUnitAuto(barSettings.axisMinorUnitAuto);
        if (barSettings.axisMajorTickType !== undefined) setAxisMajorTickType(barSettings.axisMajorTickType);
        if (barSettings.axisMinorTickType !== undefined) setAxisMinorTickType(barSettings.axisMinorTickType);
        if (barSettings.showHorizontalGridlines !== undefined) setShowHorizontalGridlines(barSettings.showHorizontalGridlines);
        if (barSettings.showVerticalGridlines !== undefined) setShowVerticalGridlines(barSettings.showVerticalGridlines);
        if (barSettings.compactAxisNumbers !== undefined) setCompactAxisNumbers(barSettings.compactAxisNumbers);
        if (barSettings.xAxisLineThickness !== undefined) setXAxisLineThickness(barSettings.xAxisLineThickness);
        if (barSettings.yAxisLineThickness !== undefined) setYAxisLineThickness(barSettings.yAxisLineThickness);
        if (barSettings.axisColorBrightness !== undefined) setAxisColorBrightness(barSettings.axisColorBrightness);
        if (barSettings.showXAxisLabels !== undefined) setShowXAxisLabels(barSettings.showXAxisLabels);
        if (barSettings.showYAxisLabels !== undefined) setShowYAxisLabels(barSettings.showYAxisLabels);
        if (barSettings.showMetricLabels !== undefined) setShowMetricLabels(barSettings.showMetricLabels);
        if (barSettings.showPeriodLabels !== undefined) setShowPeriodLabels(barSettings.showPeriodLabels);
        if (barSettings.metricLabelPosition !== undefined) setMetricLabelPosition(barSettings.metricLabelPosition);
        if (barSettings.periodLabelDisplay !== undefined) setPeriodLabelDisplay(barSettings.periodLabelDisplay);
        if (barSettings.percentChangeBracketDistance !== undefined) setPercentChangeBracketDistance(barSettings.percentChangeBracketDistance);
        if (barSettings.showTotalLabels !== undefined) setShowTotalLabels(barSettings.showTotalLabels);
        if (barSettings.boldTotal !== undefined) setBoldTotal(barSettings.boldTotal);
        if (barSettings.xAxisSecondaryFontSize !== undefined) setXAxisSecondaryFontSize(barSettings.xAxisSecondaryFontSize);
        if (barSettings.valuePrefix !== undefined) setValuePrefix(barSettings.valuePrefix);
        if (barSettings.valueSuffix !== undefined) setValueSuffix(barSettings.valueSuffix);
        if (barSettings.valueDecimalPlaces !== undefined) setValueDecimalPlaces(barSettings.valueDecimalPlaces);
        if (barSettings.valueFormat !== undefined) setValueFormat(barSettings.valueFormat);
        // Axis-specific formatting (with backward compatibility fallback to label formatting)
        if (barSettings.axisValuePrefix !== undefined) setAxisValuePrefix(barSettings.axisValuePrefix);
        else if (barSettings.valuePrefix !== undefined) setAxisValuePrefix(barSettings.valuePrefix);
        if (barSettings.axisValueSuffix !== undefined) setAxisValueSuffix(barSettings.axisValueSuffix);
        else if (barSettings.valueSuffix !== undefined) setAxisValueSuffix(barSettings.valueSuffix);
        if (barSettings.axisValueDecimalPlaces !== undefined) setAxisValueDecimalPlaces(barSettings.axisValueDecimalPlaces);
        else if (barSettings.valueDecimalPlaces !== undefined) setAxisValueDecimalPlaces(barSettings.valueDecimalPlaces);
        if (barSettings.axisValueFormat !== undefined) setAxisValueFormat(barSettings.axisValueFormat);
        else if (barSettings.valueFormat !== undefined) setAxisValueFormat(barSettings.valueFormat);
      } else if (currentChartType === 'line' && settings.chartSpecific.line) {
        const lineSettings = settings.chartSpecific.line;
        // Time settings
        if (lineSettings.timeScale !== undefined) setTimeScale(lineSettings.timeScale);
        if (lineSettings.aggregationLevel !== undefined) setAggregationLevel(lineSettings.aggregationLevel);
        if (lineSettings.aggregationMethod !== undefined) setAggregationMethod(lineSettings.aggregationMethod);
        if (lineSettings.fiscalYearStartMonth !== undefined) setFiscalYearStartMonth(lineSettings.fiscalYearStartMonth);
        if (lineSettings.xAxisTimeGrouping !== undefined) setXAxisTimeGrouping(lineSettings.xAxisTimeGrouping);
        if (lineSettings.xAxisLabelLevels !== undefined) setXAxisLabelLevels(lineSettings.xAxisLabelLevels);
        if (lineSettings.dateRangeFilter !== undefined) setDateRangeFilter(lineSettings.dateRangeFilter);
        if (lineSettings.xAxisPrimaryLabel !== undefined) setXAxisPrimaryLabel(lineSettings.xAxisPrimaryLabel);
        if (lineSettings.xAxisSecondaryLabel !== undefined) setXAxisSecondaryLabel(lineSettings.xAxisSecondaryLabel);
        if (lineSettings.dateFormatPreset !== undefined) setDateFormatPreset(lineSettings.dateFormatPreset);
        if (lineSettings.dateFormatCustom !== undefined) setDateFormatCustom(lineSettings.dateFormatCustom);
        // Line styling
        if (lineSettings.lineStyle !== undefined) setLineStyle(lineSettings.lineStyle);
        if (lineSettings.smoothLines !== undefined) setSmoothLines(lineSettings.smoothLines);
        // Point styling
        if (lineSettings.showPoints !== undefined) setShowPoints(lineSettings.showPoints);
        if (lineSettings.pointSize !== undefined) setPointSize(lineSettings.pointSize);
        if (lineSettings.pointStyle !== undefined) setPointStyle(lineSettings.pointStyle);
        if (lineSettings.pointBorderWidth !== undefined) setPointBorderWidth(lineSettings.pointBorderWidth);
        if (lineSettings.excludeZeroValues !== undefined) setExcludeZeroValues(lineSettings.excludeZeroValues);
        if (lineSettings.showMostRecentPoint !== undefined) setShowMostRecentPoint(lineSettings.showMostRecentPoint);
        // Area fill
        if (lineSettings.showAreaFill !== undefined) setShowAreaFill(lineSettings.showAreaFill);
        if (lineSettings.areaOpacity !== undefined) setAreaOpacity(lineSettings.areaOpacity);
        if (lineSettings.areaGradient !== undefined) setAreaGradient(lineSettings.areaGradient);
        if (lineSettings.stackAreas !== undefined) setStackAreas(lineSettings.stackAreas);
        if (lineSettings.chartMode !== undefined) setChartMode(lineSettings.chartMode);
        // Axis display
        if (lineSettings.showXAxis !== undefined) setShowXAxis(lineSettings.showXAxis);
        if (lineSettings.showYAxis !== undefined) setShowYAxis(lineSettings.showYAxis);
        if (lineSettings.yAxisFormat !== undefined) setYAxisFormat(lineSettings.yAxisFormat);
        if (lineSettings.xAxisLineThickness !== undefined) setXAxisLineThickness(lineSettings.xAxisLineThickness);
        if (lineSettings.yAxisLineThickness !== undefined) setYAxisLineThickness(lineSettings.yAxisLineThickness);
        // Grid
        if (lineSettings.showGridLines !== undefined) setShowGridLines(lineSettings.showGridLines);
        if (lineSettings.gridDirection !== undefined) setGridDirection(lineSettings.gridDirection);
        if (lineSettings.gridLineColor !== undefined) setGridLineColor(lineSettings.gridLineColor);
        if (lineSettings.gridLineStyle !== undefined) setGridLineStyle(lineSettings.gridLineStyle);
        if (lineSettings.gridLineOpacity !== undefined) setGridLineOpacity(lineSettings.gridLineOpacity);
        // Direct labels
        if (lineSettings.showDirectLabels !== undefined) setShowDirectLabels(lineSettings.showDirectLabels);
        if (lineSettings.directLabelFontSize !== undefined) setDirectLabelFontSize(lineSettings.directLabelFontSize);
        // Emphasis
        if (lineSettings.emphasizedPoints !== undefined) setEmphasizedPoints(lineSettings.emphasizedPoints);
        if (lineSettings.emphasizedMetric !== undefined) setEmphasizedMetric(lineSettings.emphasizedMetric);
        if (lineSettings.emphasisLabelPosition !== undefined) setEmphasisLabelPosition(lineSettings.emphasisLabelPosition);
        if (lineSettings.emphasisLabelFontSize !== undefined) setEmphasisLabelFontSize(lineSettings.emphasisLabelFontSize);
        if (lineSettings.showEmphasisDate !== undefined) setShowEmphasisDate(lineSettings.showEmphasisDate);
        if (lineSettings.emphasisCompactNumbers !== undefined) setEmphasisCompactNumbers(lineSettings.emphasisCompactNumbers);
        if (lineSettings.emphasisValuePrefix !== undefined) setEmphasisValuePrefix(lineSettings.emphasisValuePrefix);
        if (lineSettings.emphasisValueSuffix !== undefined) setEmphasisValueSuffix(lineSettings.emphasisValueSuffix);
        if (lineSettings.emphasisDecimalPlaces !== undefined) setEmphasisDecimalPlaces(lineSettings.emphasisDecimalPlaces);
        if (lineSettings.showEmphasisVerticalLine !== undefined) setShowEmphasisVerticalLine(lineSettings.showEmphasisVerticalLine);
      } else if (currentChartType === 'funnel' && settings.chartSpecific.funnel) {
        // Apply funnel-specific settings when importing to a funnel chart
        // This will be populated when funnel chart settings are defined
      }
    }
  }, []);

  return {
    // Typography
    title,
    setTitle,
    subtitle,
    setSubtitle,
    titleAlignment,
    setTitleAlignment,
    fontFamily,
    setFontFamily,
    titleFontSize,
    setTitleFontSize,
    subtitleFontSize,
    setSubtitleFontSize,
    segmentLabelFontSize,
    setSegmentLabelFontSize,
    metricLabelFontSize,
    setMetricLabelFontSize,
    periodLabelFontSize,
    setPeriodLabelFontSize,
    legendFontSize,
    setLegendFontSize,
    conversionLabelFontSize,
    setConversionLabelFontSize,

    // Colors
    barColor,
    setBarColor,
    colorTransition,
    setColorTransition,
    comparisonPalette,
    setComparisonPalette,
    userCustomColors,
    setUserCustomColors,

    // Layout
    orientation,
    setOrientation,
    aspectRatio,
    setAspectRatio,
    canvasWidth,
    setCanvasWidth,
    canvasHeight,
    setCanvasHeight,
    chartWidth,
    setChartWidth,
    chartHeight,
    setChartHeight,
    chartPadding,
    setChartPadding,
    stageGap,
    setStageGap,
    barWidth,
    setBarWidth,
    stageLabelPosition,
    setStageLabelPosition,

    // Visual
    axisLineWidth,
    setAxisLineWidth,
    backgroundOpacity,
    setBackgroundOpacity,

    // Display
    emphasis,
    setEmphasis,
    metricEmphasis,
    setMetricEmphasis,
    normalizeToHundred,
    setNormalizeToHundred,
    compactNumbers,
    setCompactNumbers,
    showLegend,
    setShowLegend,
    legendPosition,
    setLegendPosition,
    inStageLabelFontSize,
    setInStageLabelFontSize,
    showSparklines,
    setShowSparklines,
    sparklineType,
    setSparklineType,
    userTier,
    setUserTier,
    percentChangeEnabled,
    setPercentChangeEnabled,
    percentChangeLabelFormat,
    setPercentChangeLabelFormat,
    percentChangeBracketDistance,
    setPercentChangeBracketDistance,

    // Theme
    darkMode,
    setDarkMode: handleSetDarkMode,
    backgroundColor,
    setBackgroundColor,

    // Slope Chart specific
    colorMode,
    setColorMode,
    lineThickness,
    setLineThickness,
    lineOpacity,
    setLineOpacity,
    lineSaturation,
    setLineSaturation,
    endpointSize,
    setEndpointSize,
    endpointStyle,
    setEndpointStyle,
    labelPosition,
    setLabelPosition,
    showCategoryLabels,
    setShowCategoryLabels,
    showValueLabels,
    setShowValueLabels,
    showMetricLabels,
    setShowMetricLabels,
    showPeriodLabels,
    setShowPeriodLabels,
    metricLabelPosition,
    setMetricLabelPosition,
    periodLabelDisplay,
    setPeriodLabelDisplay,
    labelFormat,
    setLabelFormat,
    emphasizedLines,
    setEmphasizedLines,
    increaseColor,
    setIncreaseColor,
    decreaseColor,
    setDecreaseColor,
    noChangeColor,
    setNoChangeColor,
    startColor,
    setStartColor,
    endColor,
    setEndColor,
    periodSpacing,
    setPeriodSpacing,
    periodHeight,
    setPeriodHeight,
    periodLabelPosition,
    setPeriodLabelPosition,
    slopeAxisLineColor,
    setSlopeAxisLineColor,
    slopeAxisLineWidth,
    setSlopeAxisLineWidth,
    slopeAxisLineStyle,
    setSlopeAxisLineStyle,
    axisEnds,
    setAxisEnds,

    // Bar Chart specific
    barMode,
    setBarMode,
    labelMode,
    setLabelMode,
    directLabelContent,
    setDirectLabelContent,
    emphasizedBars,
    setEmphasizedBars,
    showTotalLabels,
    setShowTotalLabels,
    boldTotal,
    setBoldTotal,
    xAxisFontSize,
    setXAxisFontSize,
    xAxisSecondaryFontSize,
    setXAxisSecondaryFontSize,
    yAxisFontSize,
    setYAxisFontSize,
    axisLabel,
    setAxisLabel,
    axisLabelFontSize,
    setAxisLabelFontSize,
    xAxisLabelRotation,
    setXAxisLabelRotation,
    valuePrefix,
    setValuePrefix,
    valueSuffix,
    setValueSuffix,
    valueDecimalPlaces,
    setValueDecimalPlaces,
    valueFormat,
    setValueFormat,
    axisMinimum,
    setAxisMinimum,
    axisMinimumAuto,
    setAxisMinimumAuto,
    axisMaximum,
    setAxisMaximum,
    axisMaximumAuto,
    setAxisMaximumAuto,
    axisMajorUnit,
    setAxisMajorUnit,
    axisMajorUnitAuto,
    setAxisMajorUnitAuto,
    axisMinorUnit,
    setAxisMinorUnit,
    axisMinorUnitAuto,
    setAxisMinorUnitAuto,
    axisMajorTickType,
    setAxisMajorTickType,
    axisMinorTickType,
    setAxisMinorTickType,
    showHorizontalGridlines,
    setShowHorizontalGridlines,
    showVerticalGridlines,
    setShowVerticalGridlines,
    compactAxisNumbers,
    setCompactAxisNumbers,
    xAxisLineThickness,
    setXAxisLineThickness,
    yAxisLineThickness,
    setYAxisLineThickness,
    axisColorBrightness,
    setAxisColorBrightness,
    showXAxisLabels,
    setShowXAxisLabels,
    showYAxisLabels,
    setShowYAxisLabels,
    axisValuePrefix,
    setAxisValuePrefix,
    axisValueSuffix,
    setAxisValueSuffix,
    axisValueDecimalPlaces,
    setAxisValueDecimalPlaces,
    axisValueFormat,
    setAxisValueFormat,
    calculatedAxisMinimum,
    setCalculatedAxisMinimum,
    calculatedAxisMaximum,
    setCalculatedAxisMaximum,
    calculatedAxisMajorUnit,
    setCalculatedAxisMajorUnit,

    // Line Chart specific
    timeScale,
    setTimeScale,
    lineStyle,
    setLineStyle,
    smoothLines,
    setSmoothLines,
    showPoints,
    setShowPoints,
    pointSize,
    setPointSize,
    pointStyle,
    setPointStyle,
    pointBorderWidth,
    setPointBorderWidth,
    showAreaFill,
    setShowAreaFill,
    areaOpacity,
    setAreaOpacity,
    areaGradient,
    setAreaGradient,
    stackAreas,
    setStackAreas,
    chartMode,
    setChartMode,
    showXAxis,
    setShowXAxis,
    showYAxis,
    setShowYAxis,
    showGridLines,
    setShowGridLines,
    gridDirection,
    setGridDirection,
    gridLineColor,
    setGridLineColor,
    gridLineStyle,
    setGridLineStyle,
    gridLineOpacity,
    setGridLineOpacity,
    showDirectLabels,
    setShowDirectLabels,
    directLabelFontSize,
    setDirectLabelFontSize,
    yAxisFormat,
    setYAxisFormat,
    excludeZeroValues,
    setExcludeZeroValues,
    showMostRecentPoint,
    setShowMostRecentPoint,

    // Time aggregation (Line Chart)
    aggregationLevel,
    setAggregationLevel,
    aggregationMethod,
    setAggregationMethod,
    fiscalYearStartMonth,
    setFiscalYearStartMonth,
    xAxisTimeGrouping,
    setXAxisTimeGrouping,
    xAxisLabelLevels,
    setXAxisLabelLevels,
    dateRangeFilter,
    setDateRangeFilter,
    xAxisPrimaryLabel,
    setXAxisPrimaryLabel,
    xAxisSecondaryLabel,
    setXAxisSecondaryLabel,
    dateFormatPreset,
    setDateFormatPreset,
    dateFormatCustom,
    setDateFormatCustom,

    // Emphasis (Line Chart)
    emphasizedPoints,
    setEmphasizedPoints,
    emphasizedMetric,
    setEmphasizedMetric,
    emphasisLabelPosition,
    setEmphasisLabelPosition,
    emphasisLabelFontSize,
    setEmphasisLabelFontSize,
    showEmphasisDate,
    setShowEmphasisDate,
    emphasisCompactNumbers,
    setEmphasisCompactNumbers,
    emphasisValuePrefix,
    setEmphasisValuePrefix,
    emphasisValueSuffix,
    setEmphasisValueSuffix,
    emphasisDecimalPlaces,
    setEmphasisDecimalPlaces,
    showEmphasisVerticalLine,
    setShowEmphasisVerticalLine,

    // Actions
    updateAspectRatio,
    resetToDefaults,
    exportSettings,
    importSettings,
  };
};

export default useStyleSettings;
