import { useState, useCallback } from "react";
import theme from "../design-system/theme";
import { defaultUserColors } from "../design-system/colorPalettes";

/**
 * Custom hook for managing chart style settings
 */
export const useStyleSettings = (initialTheme = theme) => {
  // Typography
  const [title, setTitle] = useState("Revenue by Product Line");
  const [subtitle, setSubtitle] = useState("Annual revenue comparison across product categories (2023 vs 2024)");
  const [titleAlignment, setTitleAlignment] = useState("left"); // 'left' or 'center'
  const [fontFamily, setFontFamily] = useState(initialTheme.typography.families[0]);
  const [titleFontSize, setTitleFontSize] = useState(initialTheme.typography.sizes.title);
  const [subtitleFontSize, setSubtitleFontSize] = useState(initialTheme.typography.sizes.subtitle);
  const [segmentLabelFontSize, setSegmentLabelFontSize] = useState(22);
  const [metricLabelFontSize, setMetricLabelFontSize] = useState(19);
  const [periodLabelFontSize, setPeriodLabelFontSize] = useState(24); // Period label font size for Slope Chart
  const [legendFontSize, setLegendFontSize] = useState(initialTheme.typography.sizes.legend);
  const [conversionLabelFontSize, setConversionLabelFontSize] = useState(initialTheme.typography.sizes.conversionLabel);

  // Colors
  const [barColor, setBarColor] = useState("#1e40af");
  const [colorTransition, setColorTransition] = useState(60);
  const [comparisonPalette, setComparisonPalette] = useState("professional");
  const [userCustomColors, setUserCustomColors] = useState(defaultUserColors);

  // Layout
  const [orientation, setOrientation] = useState("vertical");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [canvasWidth, setCanvasWidth] = useState(900);
  const [canvasHeight, setCanvasHeight] = useState(900);
  const [chartPadding, setChartPadding] = useState(initialTheme.spacing.chartPadding);
  const [stageGap, setStageGap] = useState(initialTheme.spacing.stageGap);
  const [stageLabelPosition, setStageLabelPosition] = useState("bottom");

  // Visual
  const [axisLineWidth, setAxisLineWidth] = useState(initialTheme.visual.axisLineWidth);
  const [backgroundOpacity, setBackgroundOpacity] = useState(initialTheme.visual.backgroundOpacity);

  // Display options
  const [emphasis, setEmphasis] = useState("throughput");
  const [metricEmphasis, setMetricEmphasis] = useState("volume");
  const [normalizeToHundred, setNormalizeToHundred] = useState(true);
  const [compactNumbers, setCompactNumbers] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [legendPosition, setLegendPosition] = useState("direct"); // "legend" or "direct"
  const [inStageLabelFontSize, setInStageLabelFontSize] = useState(13);
  const [showSparklines, setShowSparklines] = useState(false);
  const [sparklineType, setSparklineType] = useState("volume");
  const [userTier, setUserTier] = useState("pro");

  // Theme settings
  const [darkMode, setDarkMode] = useState(false); // Light/Dark mode toggle

  // Slope Chart specific settings
  const [colorMode, setColorMode] = useState("category"); // 'category', 'trend', 'custom', 'gradient'
  const [lineThickness, setLineThickness] = useState(3);
  const [lineOpacity, setLineOpacity] = useState(1.0);
  const [lineSaturation, setLineSaturation] = useState(100); // 0-100%, where 100% = full color, 0% = grey
  const [endpointSize, setEndpointSize] = useState(6);
  const [endpointStyle, setEndpointStyle] = useState("filled"); // 'filled' or 'outlined'
  const [labelPosition, setLabelPosition] = useState("left"); // 'left', 'right', or 'both'
  const [showCategoryLabels, setShowCategoryLabels] = useState(true);
  const [showValueLabels, setShowValueLabels] = useState(true);
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
   * Reset all settings to defaults
   */
  const resetToDefaults = useCallback(() => {
    setTitle("Marketing & Acquisition Funnel");
    setSubtitle("Tracking 3 periods across 5 conversion stages");
    setFontFamily(initialTheme.typography.families[0]);
    setTitleFontSize(initialTheme.typography.sizes.title);
    setSubtitleFontSize(initialTheme.typography.sizes.subtitle);
    setSegmentLabelFontSize(initialTheme.typography.sizes.segmentLabel);
    setMetricLabelFontSize(initialTheme.typography.sizes.metricLabel);
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
    setChartPadding(initialTheme.spacing.chartPadding);
    setStageGap(initialTheme.spacing.stageGap);
    setStageLabelPosition("bottom");
    setAxisLineWidth(initialTheme.visual.axisLineWidth);
    setBackgroundOpacity(initialTheme.visual.backgroundOpacity);
    setEmphasis("throughput");
    setMetricEmphasis("volume");
    setNormalizeToHundred(true);
    setCompactNumbers(false);
    setShowLegend(true);
    setLegendPosition("direct");
    setInStageLabelFontSize(13);
    setShowSparklines(false);
    setSparklineType("volume");
    setUserTier("pro");
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
        chartPadding,
        stageGap,
        stageLabelPosition,
      },
      visual: {
        axisLineWidth,
        backgroundOpacity,
        darkMode,
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
        funnel: {
          // Funnel-specific settings will be here
        },
      },
    };
  }, [
    title, subtitle, titleAlignment, fontFamily, titleFontSize, subtitleFontSize,
    segmentLabelFontSize, metricLabelFontSize, periodLabelFontSize, legendFontSize,
    conversionLabelFontSize, inStageLabelFontSize,
    barColor, colorTransition, comparisonPalette, userCustomColors,
    orientation, aspectRatio, canvasWidth, canvasHeight, chartPadding, stageGap, stageLabelPosition,
    axisLineWidth, backgroundOpacity, darkMode,
    emphasis, metricEmphasis, normalizeToHundred, compactNumbers, showLegend, legendPosition,
    showSparklines, sparklineType, userTier,
    colorMode, lineThickness, lineOpacity, lineSaturation, endpointSize, endpointStyle,
    labelPosition, showCategoryLabels, showValueLabels, labelFormat,
    increaseColor, decreaseColor, noChangeColor, startColor, endColor,
    periodSpacing, periodHeight, periodLabelPosition,
    slopeAxisLineColor, slopeAxisLineWidth, slopeAxisLineStyle, axisEnds,
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
      if (settings.layout.chartPadding !== undefined) setChartPadding(settings.layout.chartPadding);
      if (settings.layout.stageGap !== undefined) setStageGap(settings.layout.stageGap);
      if (settings.layout.stageLabelPosition !== undefined) setStageLabelPosition(settings.layout.stageLabelPosition);
    }

    // Visual (universal - applies to all charts)
    if (settings.visual) {
      if (settings.visual.axisLineWidth !== undefined) setAxisLineWidth(settings.visual.axisLineWidth);
      if (settings.visual.backgroundOpacity !== undefined) setBackgroundOpacity(settings.visual.backgroundOpacity);
      if (settings.visual.darkMode !== undefined) setDarkMode(settings.visual.darkMode);
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
    chartPadding,
    setChartPadding,
    stageGap,
    setStageGap,
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

    // Theme
    darkMode,
    setDarkMode,

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

    // Actions
    updateAspectRatio,
    resetToDefaults,
    exportSettings,
    importSettings,
  };
};

export default useStyleSettings;
