import { useState, useCallback } from "react";
import theme from "../design-system/theme";
import { defaultUserColors } from "../design-system/colorPalettes";

/**
 * Custom hook for managing chart style settings
 */
export const useStyleSettings = (initialTheme = theme) => {
  // Typography
  const [title, setTitle] = useState("Marketing & Acquisition Funnel");
  const [subtitle, setSubtitle] = useState("Tracking 3 periods across 5 conversion stages");
  const [fontFamily, setFontFamily] = useState(initialTheme.typography.families[0]);
  const [titleFontSize, setTitleFontSize] = useState(initialTheme.typography.sizes.title);
  const [subtitleFontSize, setSubtitleFontSize] = useState(initialTheme.typography.sizes.subtitle);
  const [segmentLabelFontSize, setSegmentLabelFontSize] = useState(initialTheme.typography.sizes.segmentLabel);
  const [metricLabelFontSize, setMetricLabelFontSize] = useState(initialTheme.typography.sizes.metricLabel);
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
  const [legendPosition, setLegendPosition] = useState("legend"); // "legend" or "direct"
  const [inStageLabelFontSize, setInStageLabelFontSize] = useState(13);
  const [showSparklines, setShowSparklines] = useState(false);
  const [sparklineType, setSparklineType] = useState("volume");
  const [userTier, setUserTier] = useState("pro");

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
    setLegendPosition("legend");
    setInStageLabelFontSize(13);
    setShowSparklines(false);
    setSparklineType("volume");
    setUserTier("pro");
  }, [initialTheme]);

  /**
   * Export settings as JSON
   */
  const exportSettings = useCallback(() => {
    return {
      typography: {
        title,
        subtitle,
        fontFamily,
        titleFontSize,
        subtitleFontSize,
        segmentLabelFontSize,
        metricLabelFontSize,
        legendFontSize,
        conversionLabelFontSize,
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
      },
      display: {
        emphasis,
        metricEmphasis,
        normalizeToHundred,
        compactNumbers,
        showLegend,
        showSparklines,
        sparklineType,
        userTier,
      },
    };
  }, [
    title, subtitle, fontFamily, titleFontSize, subtitleFontSize,
    segmentLabelFontSize, metricLabelFontSize, legendFontSize, conversionLabelFontSize,
    barColor, colorTransition, comparisonPalette, userCustomColors,
    orientation, aspectRatio, canvasWidth, canvasHeight, chartPadding, stageGap, stageLabelPosition,
    axisLineWidth, backgroundOpacity,
    emphasis, metricEmphasis, normalizeToHundred, compactNumbers, showLegend,
    showSparklines, sparklineType, userTier,
  ]);

  /**
   * Import settings from JSON
   */
  const importSettings = useCallback((settings) => {
    if (settings.typography) {
      if (settings.typography.title !== undefined) setTitle(settings.typography.title);
      if (settings.typography.subtitle !== undefined) setSubtitle(settings.typography.subtitle);
      if (settings.typography.fontFamily !== undefined) setFontFamily(settings.typography.fontFamily);
      if (settings.typography.titleFontSize !== undefined) setTitleFontSize(settings.typography.titleFontSize);
      if (settings.typography.subtitleFontSize !== undefined) setSubtitleFontSize(settings.typography.subtitleFontSize);
      if (settings.typography.segmentLabelFontSize !== undefined) setSegmentLabelFontSize(settings.typography.segmentLabelFontSize);
      if (settings.typography.metricLabelFontSize !== undefined) setMetricLabelFontSize(settings.typography.metricLabelFontSize);
      if (settings.typography.legendFontSize !== undefined) setLegendFontSize(settings.typography.legendFontSize);
      if (settings.typography.conversionLabelFontSize !== undefined) setConversionLabelFontSize(settings.typography.conversionLabelFontSize);
    }
    if (settings.colors) {
      if (settings.colors.barColor !== undefined) setBarColor(settings.colors.barColor);
      if (settings.colors.colorTransition !== undefined) setColorTransition(settings.colors.colorTransition);
      if (settings.colors.comparisonPalette !== undefined) setComparisonPalette(settings.colors.comparisonPalette);
      if (settings.colors.userCustomColors !== undefined) setUserCustomColors(settings.colors.userCustomColors);
    }
    if (settings.layout) {
      if (settings.layout.orientation !== undefined) setOrientation(settings.layout.orientation);
      if (settings.layout.aspectRatio !== undefined) setAspectRatio(settings.layout.aspectRatio);
      if (settings.layout.canvasWidth !== undefined) setCanvasWidth(settings.layout.canvasWidth);
      if (settings.layout.canvasHeight !== undefined) setCanvasHeight(settings.layout.canvasHeight);
      if (settings.layout.chartPadding !== undefined) setChartPadding(settings.layout.chartPadding);
      if (settings.layout.stageGap !== undefined) setStageGap(settings.layout.stageGap);
      if (settings.layout.stageLabelPosition !== undefined) setStageLabelPosition(settings.layout.stageLabelPosition);
    }
    if (settings.visual) {
      if (settings.visual.axisLineWidth !== undefined) setAxisLineWidth(settings.visual.axisLineWidth);
      if (settings.visual.backgroundOpacity !== undefined) setBackgroundOpacity(settings.visual.backgroundOpacity);
    }
    if (settings.display) {
      if (settings.display.emphasis !== undefined) setEmphasis(settings.display.emphasis);
      if (settings.display.metricEmphasis !== undefined) setMetricEmphasis(settings.display.metricEmphasis);
      if (settings.display.normalizeToHundred !== undefined) setNormalizeToHundred(settings.display.normalizeToHundred);
      if (settings.display.compactNumbers !== undefined) setCompactNumbers(settings.display.compactNumbers);
      if (settings.display.showLegend !== undefined) setShowLegend(settings.display.showLegend);
      if (settings.display.showSparklines !== undefined) setShowSparklines(settings.display.showSparklines);
      if (settings.display.sparklineType !== undefined) setSparklineType(settings.display.sparklineType);
      if (settings.display.userTier !== undefined) setUserTier(settings.display.userTier);
    }
  }, []);

  return {
    // Typography
    title,
    setTitle,
    subtitle,
    setSubtitle,
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

    // Actions
    updateAspectRatio,
    resetToDefaults,
    exportSettings,
    importSettings,
  };
};

export default useStyleSettings;
