import React, { useRef, useEffect, useState, useCallback } from "react";
import * as d3 from "d3";
import { comparisonPalettes } from "../../shared/design-system/colorPalettes";
import {
  formatCompactNumber,
  formatFullNumber,
} from "../../shared/utils/dataFormatters";
import {
  getContrastTextColor,
  generateColorGradient,
} from "../../shared/utils/colorUtils";

/**
 * FunnelChart Component
 *
 * A comprehensive funnel chart visualization component that supports:
 * - Vertical and horizontal orientations
 * - Single period and comparison modes
 * - Throughput and fallout emphasis modes
 * - Sparklines for trend visualization
 * - Interactive stage selection and conversion rate calculation
 * - Customizable styling and colors
 *
 * @param {Object} props - Component props
 * @param {Array} props.data - Chart data (from useChartData hook)
 * @param {Array} props.periodNames - Period/column names (from useChartData hook)
 * @param {Boolean} props.isComparisonMode - Whether in comparison mode
 * @param {Object} props.styleSettings - Style settings object (from useStyleSettings hook)
 * @param {Function} props.onStageClick - Optional callback when stage is clicked
 */
const FunnelChart = ({
  data,
  periodNames,
  isComparisonMode,
  styleSettings,
  onStageClick,
}) => {
  const svgRef = useRef(null);
  const [selectedStages, setSelectedStages] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(0);

  /**
   * Handle bar click for selection and conversion rate calculation
   */
  const handleBarClick = useCallback(
    (stageIndex, periodIndex) => {
      const isSamePeriod = selectedPeriod === periodIndex;
      const isStageSelected = selectedStages.includes(stageIndex);

      if (isSamePeriod && isStageSelected) {
        setSelectedPeriod(0);
        setSelectedStages([]);
        return;
      }

      setSelectedPeriod(periodIndex);
      setSelectedStages((prev) => {
        if (prev.length === 0) {
          return [stageIndex];
        } else if (prev.length === 1) {
          if (prev[0] !== stageIndex) {
            return [prev[0], stageIndex];
          }
          return prev;
        } else {
          return [stageIndex];
        }
      });

      if (onStageClick) {
        onStageClick(stageIndex, periodIndex);
      }
    },
    [selectedPeriod, selectedStages, onStageClick]
  );

  /**
   * Generate color shades for periods
   */
  const generateColorShades = useCallback(
    (baseColor, count) => {
      if (isComparisonMode) {
        const palette = comparisonPalettes[styleSettings.comparisonPalette];
        const colors =
          styleSettings.comparisonPalette === "user"
            ? styleSettings.userCustomColors
            : palette.colors;
        return colors.slice(0, count);
      }

      if (count === 1) return [baseColor];

      const color = d3.color(baseColor);
      const hsl = d3.hsl(color);
      const shades = [];
      const transitionFactor = styleSettings.colorTransition / 100;

      for (let i = 0; i < count; i++) {
        const lightnessFactor = i / (count - 1);
        const newLightness =
          hsl.l + lightnessFactor * (0.75 - hsl.l) * transitionFactor;
        const newSaturation =
          hsl.s * (1 - lightnessFactor * 0.4 * transitionFactor);
        const shade = d3.hsl(hsl.h, newSaturation, newLightness);
        shades.push(shade.formatHex());
      }
      return shades;
    },
    [isComparisonMode, styleSettings.comparisonPalette, styleSettings.userCustomColors, styleSettings.colorTransition]
  );

  /**
   * Generate grey shades for background
   */
  const generateGreyShades = useCallback((count, opacity) => {
    if (opacity === 0) {
      return Array(count).fill("rgb(255,255,255)");
    }

    const opacityFactor = Math.pow(opacity / 100, 1.5);
    const minGrey = Math.round(255 - 35 * opacityFactor);
    const maxGrey = Math.round(255 - 135 * opacityFactor);

    if (count === 1) {
      return ["rgb(" + maxGrey + "," + maxGrey + "," + maxGrey + ")"];
    }

    const shades = [];
    for (let i = 0; i < count; i++) {
      const lightnessFactor = (count - 1 - i) / (count - 1);
      const easedFactor = Math.pow(lightnessFactor, 0.7);
      const greyValue = Math.round(
        minGrey - (minGrey - maxGrey) * easedFactor
      );
      shades.push("rgb(" + greyValue + "," + greyValue + "," + greyValue + ")");
    }
    return shades;
  }, []);

  /**
   * Abbreviate numbers based on compact setting
   */
  const abbreviateNumber = useCallback(
    (num) => {
      return styleSettings.compactNumbers
        ? formatCompactNumber(num)
        : formatFullNumber(num);
    },
    [styleSettings.compactNumbers]
  );

  /**
   * Render chart with D3
   */
  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    // Convert data format from hook to chart format
    const chartData = data.map((row) => ({
      label: row.Stage,
      periods: periodNames.map((p) => row[p] || 0),
      hidden: row.hidden || false,
    }));

    const visibleData = chartData.filter((d) => !d.hidden);
    if (visibleData.length === 0) return;

    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll("*").remove();

    // Define theme-aware colors based on dark mode
    const themeColors = {
      // Background
      backgroundColor: styleSettings.backgroundColor || (styleSettings.darkMode ? '#1f2937' : '#ffffff'),
      // Title and subtitle
      titleColor: styleSettings.darkMode ? '#f9fafb' : '#111827',
      subtitleColor: styleSettings.darkMode ? '#d1d5db' : '#6b7280',
      // Stage labels and text
      stageLabelColor: styleSettings.darkMode ? '#e5e7eb' : '#374151',
      primaryTextColor: styleSettings.darkMode ? '#e5e7eb' : '#374151',
      secondaryTextColor: styleSettings.darkMode ? '#9ca3af' : '#6b7280',
      // Legend text
      legendTextColor: styleSettings.darkMode ? '#d1d5db' : '#4b5563',
      // Bracket and axis colors
      bracketColor: styleSettings.darkMode ? '#f9fafb' : '#000000',
      axisColor: styleSettings.darkMode ? '#f9fafb' : '#000000',
    };

    // Calculate max label width for dynamic margin
    const tempSvg = svgElement.append("g");
    let maxLabelWidth = 0;

    visibleData.forEach((d) => {
      const tempText = tempSvg
        .append("text")
        .attr("font-family", styleSettings.fontFamily)
        .attr("font-size", styleSettings.segmentLabelFontSize + "px")
        .attr("font-weight", "500")
        .text(d.label);

      const bbox = tempText.node().getBBox();
      maxLabelWidth = Math.max(maxLabelWidth, bbox.width);
      tempText.remove();
    });

    tempSvg.remove();

    const requiredLeftMargin = Math.max(120, maxLabelWidth + 20);

    // Calculate header heights
    const titleHeight = styleSettings.titleFontSize;
    const subtitleHeight = styleSettings.subtitle
      ? styleSettings.subtitleFontSize
      : 0;
    const legendHeight =
      styleSettings.showLegend && styleSettings.legendPosition === "legend" && periodNames.length > 0 ? 10 : 0;

    const titleToSubtitleGap = styleSettings.subtitle ? 5 : 0;
    const subtitleToLegendGap =
      styleSettings.showLegend && styleSettings.legendPosition === "legend" && periodNames.length > 0 ? 24 : 0;
    const legendToChartGap =
      styleSettings.showLegend && styleSettings.legendPosition === "legend" && periodNames.length > 0 ? 20 : 15;

    const headerHeight =
      titleHeight +
      titleToSubtitleGap +
      subtitleHeight +
      subtitleToLegendGap +
      legendHeight +
      legendToChartGap;

    const sparklineHeight = styleSettings.showSparklines ? 50 : 0;
    const bracketHeight = selectedStages.length === 2 ? 40 : 0;

    const verticalRightMargin = styleSettings.showSparklines
      ? selectedStages.length === 2
        ? 280
        : 200
      : selectedStages.length === 2
      ? 180
      : 120;

    const margin =
      styleSettings.orientation === "vertical"
        ? {
            top: 40 + headerHeight,
            right: verticalRightMargin,
            bottom: 100,
            left: requiredLeftMargin,
          }
        : {
            top:
              40 +
              headerHeight +
              sparklineHeight +
              (sparklineHeight > 0 ? 15 : 0) +
              bracketHeight +
              (bracketHeight > 0 ? 10 : 0),
            right: 80,
            bottom: Math.max(100, maxLabelWidth + 40),
            left: 120,
          };

    const width = styleSettings.chartWidth - margin.left - margin.right;
    const height = styleSettings.chartHeight - margin.top - margin.bottom;

    // Set background color
    svgElement.style('background-color', themeColors.backgroundColor);

    const svg = svgElement
      .attr("width", styleSettings.chartWidth)
      .attr("height", styleSettings.chartHeight)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const actualMaxValue = Math.max(...visibleData.flatMap((d) => d.periods));
    const maxValue = actualMaxValue;
    const colorShades = generateColorShades(
      styleSettings.barColor,
      periodNames.length
    );
    const greyShades = generateGreyShades(
      periodNames.length,
      styleSettings.backgroundOpacity
    );

    // Create index mapping for visible data
    const visibleIndices = chartData
      .map((d, i) => (d.hidden ? -1 : i))
      .filter((i) => i !== -1);
    const mapOriginalToVisible = new Map();
    let visibleCount = 0;
    chartData.forEach((d, i) => {
      if (!d.hidden) {
        mapOriginalToVisible.set(i, visibleCount);
        visibleCount++;
      }
    });

    if (styleSettings.orientation === "vertical") {
      renderVerticalFunnel(
        svg,
        visibleData,
        chartData,
        visibleIndices,
        mapOriginalToVisible,
        periodNames,
        width,
        height,
        maxValue,
        colorShades,
        greyShades,
        styleSettings,
        selectedStages,
        selectedPeriod,
        handleBarClick,
        abbreviateNumber,
        themeColors
      );
    } else {
      renderHorizontalFunnel(
        svg,
        visibleData,
        chartData,
        visibleIndices,
        mapOriginalToVisible,
        periodNames,
        width,
        height,
        margin,
        maxValue,
        colorShades,
        greyShades,
        styleSettings,
        selectedStages,
        selectedPeriod,
        handleBarClick,
        abbreviateNumber,
        headerHeight,
        themeColors
      );
    }

    // Render header elements (title, subtitle, legend)
    renderHeader(
      svg,
      margin,
      styleSettings,
      periodNames,
      colorShades,
      titleHeight,
      subtitleHeight,
      themeColors
    );

    // Add watermark/attribution for free tier users
    if (styleSettings.userTier !== 'pro') {
      const watermarkText = 'Made with Find&Tell | Charts for Data Stories™ | FindandTell.co';
      const watermarkFontSize = 14; // Match homepage text-sm
      const watermarkY = styleSettings.chartHeight - 5; // 5px from bottom edge

      // Add clickable link
      const watermarkLink = svgElement
        .append('a')
        .attr('href', 'https://findandtell.co')
        .attr('target', '_blank')
        .attr('rel', 'noopener noreferrer');

      watermarkLink
        .append('text')
        .attr('x', styleSettings.chartWidth / 2)
        .attr('y', watermarkY)
        .attr('text-anchor', 'middle')
        .attr('font-family', styleSettings.fontFamily)
        .attr('font-size', watermarkFontSize + 'px')
        .attr('font-weight', '500') // Medium weight to match homepage
        .attr('fill', '#1e3a8a') // Blue-900 to match homepage
        .attr('opacity', 1.0) // Fully opaque like homepage
        .style('cursor', 'pointer')
        .text(watermarkText)
        .on('mouseover', function() {
          d3.select(this).attr('fill', '#0891b2'); // Cyan-600 on hover
        })
        .on('mouseout', function() {
          d3.select(this).attr('fill', '#1e3a8a'); // Back to blue-900
        });
    }
  }, [
    data,
    periodNames,
    styleSettings,
    selectedStages,
    selectedPeriod,
    handleBarClick,
    abbreviateNumber,
    generateColorShades,
    generateGreyShades,
  ]);

  return (
    <svg
      ref={svgRef}
      style={{
        width: "100%",
        height: "100%",
        fontFamily: styleSettings.fontFamily,
      }}
    />
  );
};

/**
 * Render vertical orientation funnel
 */
function renderVerticalFunnel(
  svg,
  visibleData,
  chartData,
  visibleIndices,
  mapOriginalToVisible,
  periods,
  width,
  height,
  maxValue,
  colorShades,
  greyShades,
  styleSettings,
  selectedStages,
  selectedPeriod,
  handleBarClick,
  abbreviateNumber,
  themeColors
) {
  const xScale = d3.scaleLinear().domain([0, maxValue]).range([0, width]);
  const barHeight =
    (height - (visibleData.length - 1) * styleSettings.stageGap) /
    visibleData.length;
  const periodBarHeight = barHeight / periods.length;

  visibleData.forEach((d, visibleIdx) => {
    const originalIdx = visibleIndices[visibleIdx];
    const yPos = visibleIdx * (barHeight + styleSettings.stageGap);

    const barWidths = d.periods.map((value, periodIdx) => {
      const displayValue =
        styleSettings.normalizeToHundred && visibleIdx === 0 ? maxValue : value;
      return xScale(displayValue);
    });
    const minBarWidth = Math.min(...barWidths);
    const allLabelsInside =
      styleSettings.emphasis === "throughput" && minBarWidth > 100;

    d.periods.forEach((value, periodIdx) => {
      const periodY =
        yPos + (periods.length - 1 - periodIdx) * periodBarHeight;
      const isSelected =
        selectedStages.length === 0 || selectedStages.includes(originalIdx);
      const isPeriodSelected = periodIdx === selectedPeriod;
      // If nothing is selected, show all bars at full opacity
      // If something is selected, reduce opacity for non-selected bars
      const opacity = selectedStages.length === 0
        ? 1
        : (isSelected && isPeriodSelected ? 1 : isSelected ? 0.5 : 0.25);

      if (styleSettings.emphasis === "throughput") {
        renderThroughputBar(
          svg,
          periodY,
          periodBarHeight,
          width,
          value,
          visibleIdx,
          periodIdx,
          maxValue,
          xScale,
          colorShades,
          greyShades,
          opacity,
          styleSettings,
          originalIdx,
          handleBarClick,
          abbreviateNumber,
          allLabelsInside,
          visibleData,
          periods,
          themeColors
        );
      } else {
        renderFalloutBar(
          svg,
          periodY,
          periodBarHeight,
          width,
          value,
          visibleIdx,
          periodIdx,
          maxValue,
          colorShades,
          greyShades,
          opacity,
          styleSettings,
          originalIdx,
          handleBarClick,
          abbreviateNumber,
          visibleData,
          periods,
          themeColors
        );
      }
    });

    // Stage label
    svg
      .append("text")
      .attr("x", -15)
      .attr("y", yPos + barHeight / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .attr("fill", themeColors.stageLabelColor)
      .attr("font-family", styleSettings.fontFamily)
      .attr("font-size", styleSettings.segmentLabelFontSize + "px")
      .attr("font-weight", "500")
      .text(d.label);
  });

  // Sparklines
  if (styleSettings.showSparklines) {
    renderVerticalSparklines(
      svg,
      visibleData,
      chartData,
      visibleIndices,
      periods,
      barHeight,
      styleSettings,
      colorShades,
      width,
      selectedStages,
      themeColors
    );
  }

  // Conversion bracket
  if (selectedStages.length === 2) {
    renderVerticalConversionBracket(
      svg,
      selectedStages,
      chartData,
      mapOriginalToVisible,
      barHeight,
      periodBarHeight,
      periods,
      selectedPeriod,
      width,
      styleSettings,
      themeColors
    );
  }

  // Axis
  renderVerticalAxis(svg, height, width, styleSettings, themeColors);
}

/**
 * Render horizontal orientation funnel
 */
function renderHorizontalFunnel(
  svg,
  visibleData,
  chartData,
  visibleIndices,
  mapOriginalToVisible,
  periods,
  width,
  height,
  margin,
  maxValue,
  colorShades,
  greyShades,
  styleSettings,
  selectedStages,
  selectedPeriod,
  handleBarClick,
  abbreviateNumber,
  headerHeight,
  themeColors
) {
  const yScale = d3
    .scaleLinear()
    .domain([0, maxValue])
    .range([height, 0]);
  const barWidth =
    (width - (visibleData.length - 1) * styleSettings.stageGap) /
    visibleData.length;
  const periodBarWidth = barWidth / periods.length;

  visibleData.forEach((d, visibleIdx) => {
    const originalIdx = visibleIndices[visibleIdx];
    const xPos = visibleIdx * (barWidth + styleSettings.stageGap);

    const barHeights = d.periods.map((value, periodIdx) => {
      const displayValue =
        styleSettings.normalizeToHundred && visibleIdx === 0 ? maxValue : value;
      return height - yScale(displayValue);
    });
    const minBarHeight = Math.min(...barHeights);
    const allLabelsInside =
      styleSettings.emphasis === "throughput" &&
      periodBarWidth > 30 &&
      minBarHeight > 70;

    d.periods.forEach((value, periodIdx) => {
      const periodX =
        xPos + (periods.length - 1 - periodIdx) * periodBarWidth;
      const isSelected =
        selectedStages.length === 0 || selectedStages.includes(originalIdx);
      const isPeriodSelected = periodIdx === selectedPeriod;
      // If nothing is selected, show all bars at full opacity
      // If something is selected, reduce opacity for non-selected bars
      const opacity = selectedStages.length === 0
        ? 1
        : (isSelected && isPeriodSelected ? 1 : isSelected ? 0.5 : 0.25);

      if (styleSettings.emphasis === "throughput") {
        renderHorizontalThroughputBar(
          svg,
          periodX,
          periodBarWidth,
          height,
          value,
          visibleIdx,
          periodIdx,
          maxValue,
          yScale,
          colorShades,
          greyShades,
          opacity,
          styleSettings,
          originalIdx,
          handleBarClick,
          abbreviateNumber,
          allLabelsInside,
          visibleData,
          periods,
          themeColors
        );
      } else {
        renderHorizontalFalloutBar(
          svg,
          periodX,
          periodBarWidth,
          height,
          value,
          visibleIdx,
          periodIdx,
          colorShades,
          greyShades,
          opacity,
          styleSettings,
          originalIdx,
          handleBarClick,
          abbreviateNumber,
          visibleData,
          periods,
          themeColors
        );
      }
    });

    // Stage label
    if (styleSettings.stageLabelPosition === "top") {
      // Dynamic positioning: move labels higher when conversion bracket OR traditional legend is visible
      const hasConversionBracket = selectedStages.length === 2;
      const hasTraditionalLegend = styleSettings.showLegend && styleSettings.legendPosition === "legend";
      const labelY = (hasConversionBracket || hasTraditionalLegend) ? -55 : -15;
      svg
        .append("text")
        .attr("x", xPos + barWidth / 2)
        .attr("y", labelY)
        .attr("text-anchor", "middle")
        .attr("fill", themeColors.stageLabelColor)
        .attr("font-family", styleSettings.fontFamily)
        .attr("font-size", styleSettings.segmentLabelFontSize + "px")
        .attr("font-weight", "500")
        .text(d.label);
    } else {
      svg
        .append("text")
        .attr("x", xPos + barWidth / 2)
        .attr("y", height + 25)
        .attr("text-anchor", "middle")
        .attr("fill", themeColors.stageLabelColor)
        .attr("font-family", styleSettings.fontFamily)
        .attr("font-size", styleSettings.segmentLabelFontSize + "px")
        .attr("font-weight", "500")
        .text(d.label);
    }
  });

  // Sparklines
  if (styleSettings.showSparklines) {
    renderHorizontalSparklines(
      svg,
      visibleData,
      chartData,
      visibleIndices,
      periods,
      barWidth,
      styleSettings,
      colorShades,
      margin,
      headerHeight,
      themeColors
    );
  }

  // Conversion bracket
  if (selectedStages.length === 2) {
    renderHorizontalConversionBracket(
      svg,
      selectedStages,
      chartData,
      mapOriginalToVisible,
      barWidth,
      periodBarWidth,
      periods,
      selectedPeriod,
      height,
      styleSettings,
      themeColors
    );
  }

  // Axis
  renderHorizontalAxis(svg, height, width, styleSettings, themeColors);
}

/**
 * Render throughput bar (vertical)
 */
function renderThroughputBar(
  svg,
  periodY,
  periodBarHeight,
  width,
  value,
  visibleIdx,
  periodIdx,
  maxValue,
  xScale,
  colorShades,
  greyShades,
  opacity,
  styleSettings,
  originalIdx,
  handleBarClick,
  abbreviateNumber,
  allLabelsInside,
  visibleData,
  periods,
  themeColors
) {
  // Background
  if (styleSettings.backgroundOpacity > 0) {
    svg
      .append("rect")
      .attr("x", 0)
      .attr("y", periodY)
      .attr("width", width)
      .attr("height", periodBarHeight)
      .attr("fill", greyShades[periodIdx])
      .attr("opacity", opacity * (styleSettings.backgroundOpacity / 100))
      .style("cursor", "pointer")
      .on("click", () => handleBarClick(originalIdx, periodIdx));
  }

  // Bar
  const displayValue =
    styleSettings.normalizeToHundred && visibleIdx === 0 ? maxValue : value;
  const barWidth = xScale(displayValue);

  svg
    .append("rect")
    .attr("x", 0)
    .attr("y", periodY)
    .attr("width", barWidth)
    .attr("height", periodBarHeight)
    .attr("fill", colorShades[periodIdx])
    .attr("opacity", opacity)
    .style("cursor", "pointer")
    .on("click", () => handleBarClick(originalIdx, periodIdx));

  // Labels
  let percent;
  if (visibleIdx === 0) {
    percent = 100;
  } else {
    const prevStageData = visibleData[visibleIdx - 1];
    const prevValue = prevStageData.periods[periodIdx];
    percent = prevValue > 0 ? Math.round((value / prevValue) * 100) : 0;
  }

  const primaryText =
    styleSettings.metricEmphasis === "volume"
      ? abbreviateNumber(value)
      : percent + "%";
  const secondaryText =
    styleSettings.metricEmphasis === "volume"
      ? "(" + percent + "%)"
      : "(" + abbreviateNumber(value) + ")";

  if (allLabelsInside) {
    const textColor = getContrastTextColor(colorShades[periodIdx]);

    const textGroup = svg
      .append("text")
      .attr("x", barWidth - 12)
      .attr("y", periodY + periodBarHeight / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .attr("opacity", opacity);

    textGroup
      .append("tspan")
      .attr("fill", textColor)
      .attr("font-family", styleSettings.fontFamily)
      .attr("font-size", styleSettings.metricLabelFontSize + "px")
      .attr("font-weight", "700")
      .text(primaryText);

    textGroup
      .append("tspan")
      .attr("fill", textColor)
      .attr("font-family", styleSettings.fontFamily)
      .attr("font-size", styleSettings.metricLabelFontSize - 1 + "px")
      .attr("font-weight", "400")
      .attr("opacity", 0.8)
      .text(" " + secondaryText);
  } else {
    const textGroup = svg
      .append("text")
      .attr("x", barWidth + 8)
      .attr("y", periodY + periodBarHeight / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "start")
      .attr("opacity", opacity);

    textGroup
      .append("tspan")
      .attr("fill", themeColors.primaryTextColor)
      .attr("font-family", styleSettings.fontFamily)
      .attr("font-size", styleSettings.metricLabelFontSize + "px")
      .attr("font-weight", "700")
      .text(primaryText);

    textGroup
      .append("tspan")
      .attr("fill", themeColors.secondaryTextColor)
      .attr("font-family", styleSettings.fontFamily)
      .attr("font-size", styleSettings.metricLabelFontSize - 1 + "px")
      .attr("font-weight", "400")
      .text(" " + secondaryText);
  }

  // Direct labels for first stage
  if (visibleIdx === 0 && styleSettings.showLegend && styleSettings.legendPosition === "direct") {
    const periodName = periods[periodIdx] || `Period ${periodIdx + 1}`;
    const textColor = getContrastTextColor(colorShades[periodIdx]);

    svg
      .append("text")
      .attr("x", 10)
      .attr("y", periodY + periodBarHeight / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "start")
      .attr("fill", textColor)
      .attr("font-family", styleSettings.fontFamily)
      .attr("font-size", styleSettings.inStageLabelFontSize + "px")
      .attr("font-weight", "600")
      .attr("opacity", opacity)
      .text(periodName);
  }
}

/**
 * Render fallout bar (vertical)
 */
function renderFalloutBar(
  svg,
  periodY,
  periodBarHeight,
  width,
  value,
  visibleIdx,
  periodIdx,
  maxValue,
  colorShades,
  greyShades,
  opacity,
  styleSettings,
  originalIdx,
  handleBarClick,
  abbreviateNumber,
  visibleData,
  periods,
  themeColors
) {
  if (visibleIdx === 0) {
    // First stage - full bar
    svg
      .append("rect")
      .attr("x", 0)
      .attr("y", periodY)
      .attr("width", width)
      .attr("height", periodBarHeight)
      .attr("fill", colorShades[periodIdx])
      .attr("opacity", opacity)
      .style("cursor", "pointer")
      .on("click", () => handleBarClick(originalIdx, periodIdx));

    const percent = 100;
    const primaryText =
      styleSettings.metricEmphasis === "volume"
        ? abbreviateNumber(value)
        : percent + "%";
    const secondaryText =
      styleSettings.metricEmphasis === "volume"
        ? "(" + percent + "%)"
        : "(" + abbreviateNumber(value) + ")";

    const textColor = getContrastTextColor(colorShades[periodIdx]);
    const textGroup = svg
      .append("text")
      .attr("x", width - 12)
      .attr("y", periodY + periodBarHeight / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .attr("opacity", opacity);

    textGroup
      .append("tspan")
      .attr("fill", textColor)
      .attr("font-family", styleSettings.fontFamily)
      .attr("font-size", styleSettings.metricLabelFontSize + "px")
      .attr("font-weight", "700")
      .text(primaryText);

    textGroup
      .append("tspan")
      .attr("fill", textColor)
      .attr("font-family", styleSettings.fontFamily)
      .attr("font-size", styleSettings.metricLabelFontSize - 1 + "px")
      .attr("font-weight", "400")
      .attr("opacity", 0.8)
      .text(" " + secondaryText);
  } else {
    // Subsequent stages - show fallout
    const prevStageData = visibleData[visibleIdx - 1];
    const prevValue = prevStageData.periods[periodIdx];

    const throughputPercent = prevValue > 0 ? value / prevValue : 0;
    const falloutPercent = 1 - throughputPercent;

    const throughputWidth = width * throughputPercent;
    const falloutWidth = width * falloutPercent;

    const throughputOpacity = opacity * (styleSettings.backgroundOpacity / 100);

    // Throughput (grey)
    svg
      .append("rect")
      .attr("x", 0)
      .attr("y", periodY)
      .attr("width", throughputWidth)
      .attr("height", periodBarHeight)
      .attr("fill", greyShades[periodIdx])
      .attr("opacity", throughputOpacity)
      .style("cursor", "pointer")
      .on("click", () => handleBarClick(originalIdx, periodIdx));

    // Fallout (colored)
    svg
      .append("rect")
      .attr("x", throughputWidth)
      .attr("y", periodY)
      .attr("width", falloutWidth)
      .attr("height", periodBarHeight)
      .attr("fill", colorShades[periodIdx])
      .attr("opacity", opacity)
      .style("cursor", "pointer")
      .on("click", () => handleBarClick(originalIdx, periodIdx));

    const falloutValue = prevValue - value;
    const falloutPercentLabel = Math.round(falloutPercent * 100);

    const primaryText =
      styleSettings.metricEmphasis === "volume"
        ? abbreviateNumber(falloutValue)
        : falloutPercentLabel + "%";
    const secondaryText =
      styleSettings.metricEmphasis === "volume"
        ? "(" + falloutPercentLabel + "%)"
        : "(" + abbreviateNumber(falloutValue) + ")";

    const textColor = getContrastTextColor(colorShades[periodIdx]);

    if (falloutWidth > 100) {
      const textGroup = svg
        .append("text")
        .attr("x", width - 12)
        .attr("y", periodY + periodBarHeight / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .attr("opacity", opacity);

      textGroup
        .append("tspan")
        .attr("fill", textColor)
        .attr("font-family", styleSettings.fontFamily)
        .attr("font-size", styleSettings.metricLabelFontSize + "px")
        .attr("font-weight", "700")
        .text(primaryText);

      textGroup
        .append("tspan")
        .attr("fill", textColor)
        .attr("font-family", styleSettings.fontFamily)
        .attr("font-size", styleSettings.metricLabelFontSize - 1 + "px")
        .attr("font-weight", "400")
        .attr("opacity", 0.8)
        .text(" " + secondaryText);
    } else {
      const textGroup = svg
        .append("text")
        .attr("x", width + 8)
        .attr("y", periodY + periodBarHeight / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "start")
        .attr("opacity", opacity);

      textGroup
        .append("tspan")
        .attr("fill", themeColors.primaryTextColor)
        .attr("font-family", styleSettings.fontFamily)
        .attr("font-size", styleSettings.metricLabelFontSize + "px")
        .attr("font-weight", "700")
        .text(primaryText);

      textGroup
        .append("tspan")
        .attr("fill", themeColors.secondaryTextColor)
        .attr("font-family", styleSettings.fontFamily)
        .attr("font-size", styleSettings.metricLabelFontSize - 1 + "px")
        .attr("font-weight", "400")
        .text(" " + secondaryText);
    }
  }

  // Direct labels for first stage (fallout mode)
  if (visibleIdx === 0 && styleSettings.showLegend && styleSettings.legendPosition === "direct") {
    const periodName = periods[periodIdx] || `Period ${periodIdx + 1}`;
    const textColor = getContrastTextColor(colorShades[periodIdx]);

    svg
      .append("text")
      .attr("x", 10)
      .attr("y", periodY + periodBarHeight / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "start")
      .attr("fill", textColor)
      .attr("font-family", styleSettings.fontFamily)
      .attr("font-size", styleSettings.inStageLabelFontSize + "px")
      .attr("font-weight", "600")
      .attr("opacity", opacity)
      .text(periodName);
  }
}

/**
 * Render horizontal throughput bar
 */
function renderHorizontalThroughputBar(
  svg,
  periodX,
  periodBarWidth,
  height,
  value,
  visibleIdx,
  periodIdx,
  maxValue,
  yScale,
  colorShades,
  greyShades,
  opacity,
  styleSettings,
  originalIdx,
  handleBarClick,
  abbreviateNumber,
  allLabelsInside,
  visibleData,
  periods,
  themeColors
) {
  // Background
  if (styleSettings.backgroundOpacity > 0) {
    svg
      .append("rect")
      .attr("x", periodX)
      .attr("y", 0)
      .attr("width", periodBarWidth)
      .attr("height", height)
      .attr("fill", greyShades[periodIdx])
      .attr("opacity", opacity * (styleSettings.backgroundOpacity / 100))
      .style("cursor", "pointer")
      .on("click", () => handleBarClick(originalIdx, periodIdx));
  }

  // Bar
  const displayValue =
    styleSettings.normalizeToHundred && visibleIdx === 0 ? maxValue : value;
  const barHeight = height - yScale(displayValue);
  const barY = yScale(displayValue);

  svg
    .append("rect")
    .attr("x", periodX)
    .attr("y", barY)
    .attr("width", periodBarWidth)
    .attr("height", barHeight)
    .attr("fill", colorShades[periodIdx])
    .attr("opacity", opacity)
    .style("cursor", "pointer")
    .on("click", () => handleBarClick(originalIdx, periodIdx));

  // Labels
  let percent;
  if (visibleIdx === 0) {
    percent = 100;
  } else {
    const prevStageData = visibleData[visibleIdx - 1];
    const prevValue = prevStageData.periods[periodIdx];
    percent = prevValue > 0 ? Math.round((value / prevValue) * 100) : 0;
  }

  const primaryText =
    styleSettings.metricEmphasis === "volume"
      ? abbreviateNumber(value)
      : percent + "%";
  const secondaryText =
    styleSettings.metricEmphasis === "volume"
      ? "(" + percent + "%)"
      : "(" + abbreviateNumber(value) + ")";

  if (allLabelsInside) {
    const textColor = getContrastTextColor(colorShades[periodIdx]);
    const primaryY = barY + 18;
    const secondaryY = barY + 36;

    svg
      .append("text")
      .attr("x", periodX + periodBarWidth / 2)
      .attr("y", primaryY)
      .attr("text-anchor", "middle")
      .attr("fill", textColor)
      .attr("font-family", styleSettings.fontFamily)
      .attr("font-size", styleSettings.metricLabelFontSize + "px")
      .attr("font-weight", "700")
      .attr("opacity", opacity)
      .text(primaryText);

    svg
      .append("text")
      .attr("x", periodX + periodBarWidth / 2)
      .attr("y", secondaryY)
      .attr("text-anchor", "middle")
      .attr("fill", textColor)
      .attr("font-family", styleSettings.fontFamily)
      .attr("font-size", styleSettings.metricLabelFontSize - 1 + "px")
      .attr("font-weight", "400")
      .attr("opacity", opacity * 0.9)
      .text(secondaryText);
  } else {
    const labelY = barY - 8;

    svg
      .append("text")
      .attr("x", periodX + periodBarWidth / 2)
      .attr("y", labelY)
      .attr("text-anchor", "middle")
      .attr("fill", themeColors.primaryTextColor)
      .attr("font-family", styleSettings.fontFamily)
      .attr("font-size", styleSettings.metricLabelFontSize + "px")
      .attr("font-weight", "700")
      .attr("opacity", opacity)
      .text(primaryText);

    svg
      .append("text")
      .attr("x", periodX + periodBarWidth / 2)
      .attr("y", labelY - 16)
      .attr("text-anchor", "middle")
      .attr("fill", themeColors.secondaryTextColor)
      .attr("font-family", styleSettings.fontFamily)
      .attr("font-size", styleSettings.metricLabelFontSize - 1 + "px")
      .attr("font-weight", "400")
      .attr("opacity", opacity)
      .text(secondaryText);
  }

  // Direct labels for first stage (bottom-aligned, centered)
  if (visibleIdx === 0 && styleSettings.showLegend && styleSettings.legendPosition === "direct") {
    const periodName = periods[periodIdx] || `Period ${periodIdx + 1}`;
    const textColor = getContrastTextColor(colorShades[periodIdx]);

    svg
      .append("text")
      .attr("x", periodX + periodBarWidth / 2)
      .attr("y", height - 20)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "baseline")
      .attr("fill", textColor)
      .attr("font-family", styleSettings.fontFamily)
      .attr("font-size", styleSettings.inStageLabelFontSize + "px")
      .attr("font-weight", "600")
      .attr("opacity", opacity)
      .text(periodName);
  }
}

/**
 * Render horizontal fallout bar
 */
function renderHorizontalFalloutBar(
  svg,
  periodX,
  periodBarWidth,
  height,
  value,
  visibleIdx,
  periodIdx,
  colorShades,
  greyShades,
  opacity,
  styleSettings,
  originalIdx,
  handleBarClick,
  abbreviateNumber,
  visibleData,
  periods,
  themeColors
) {
  if (visibleIdx === 0) {
    // First stage - full bar
    svg
      .append("rect")
      .attr("x", periodX)
      .attr("y", 0)
      .attr("width", periodBarWidth)
      .attr("height", height)
      .attr("fill", colorShades[periodIdx])
      .attr("opacity", opacity)
      .style("cursor", "pointer")
      .on("click", () => handleBarClick(originalIdx, periodIdx));

    const percent = 100;
    const primaryText =
      styleSettings.metricEmphasis === "volume"
        ? abbreviateNumber(value)
        : percent + "%";
    const secondaryText =
      styleSettings.metricEmphasis === "volume"
        ? "(" + percent + "%)"
        : "(" + abbreviateNumber(value) + ")";

    const textColor = getContrastTextColor(colorShades[periodIdx]);

    if (periodBarWidth > 30 && height > 70) {
      const primaryY = 18;
      const secondaryY = 36;

      svg
        .append("text")
        .attr("x", periodX + periodBarWidth / 2)
        .attr("y", primaryY)
        .attr("text-anchor", "middle")
        .attr("fill", textColor)
        .attr("font-family", styleSettings.fontFamily)
        .attr("font-size", styleSettings.metricLabelFontSize + "px")
        .attr("font-weight", "700")
        .attr("opacity", opacity)
        .text(primaryText);

      svg
        .append("text")
        .attr("x", periodX + periodBarWidth / 2)
        .attr("y", secondaryY)
        .attr("text-anchor", "middle")
        .attr("fill", textColor)
        .attr("font-family", styleSettings.fontFamily)
        .attr("font-size", styleSettings.metricLabelFontSize - 1 + "px")
        .attr("font-weight", "400")
        .attr("opacity", opacity * 0.9)
        .text(secondaryText);
    } else {
      const labelY = -8;

      svg
        .append("text")
        .attr("x", periodX + periodBarWidth / 2)
        .attr("y", labelY)
        .attr("text-anchor", "middle")
        .attr("fill", themeColors.primaryTextColor)
        .attr("font-family", styleSettings.fontFamily)
        .attr("font-size", styleSettings.metricLabelFontSize + "px")
        .attr("font-weight", "700")
        .attr("opacity", opacity)
        .text(primaryText);

      svg
        .append("text")
        .attr("x", periodX + periodBarWidth / 2)
        .attr("y", labelY - 16)
        .attr("text-anchor", "middle")
        .attr("fill", themeColors.secondaryTextColor)
        .attr("font-family", styleSettings.fontFamily)
        .attr("font-size", styleSettings.metricLabelFontSize - 1 + "px")
        .attr("font-weight", "400")
        .attr("opacity", opacity)
        .text(secondaryText);
    }
  } else {
    // Subsequent stages - show fallout
    const prevStageData = visibleData[visibleIdx - 1];
    const prevValue = prevStageData.periods[periodIdx];

    const throughputPercent = prevValue > 0 ? value / prevValue : 0;
    const falloutPercent = 1 - throughputPercent;

    const throughputHeight = height * throughputPercent;
    const falloutHeight = height * falloutPercent;

    const throughputOpacity = opacity * (styleSettings.backgroundOpacity / 100);

    // Throughput (grey)
    svg
      .append("rect")
      .attr("x", periodX)
      .attr("y", height - throughputHeight)
      .attr("width", periodBarWidth)
      .attr("height", throughputHeight)
      .attr("fill", greyShades[periodIdx])
      .attr("opacity", throughputOpacity)
      .style("cursor", "pointer")
      .on("click", () => handleBarClick(originalIdx, periodIdx));

    // Fallout (colored)
    svg
      .append("rect")
      .attr("x", periodX)
      .attr("y", 0)
      .attr("width", periodBarWidth)
      .attr("height", falloutHeight)
      .attr("fill", colorShades[periodIdx])
      .attr("opacity", opacity)
      .style("cursor", "pointer")
      .on("click", () => handleBarClick(originalIdx, periodIdx));

    const falloutValue = prevValue - value;
    const falloutPercentLabel = Math.round(falloutPercent * 100);

    const primaryText =
      styleSettings.metricEmphasis === "volume"
        ? abbreviateNumber(falloutValue)
        : falloutPercentLabel + "%";
    const secondaryText =
      styleSettings.metricEmphasis === "volume"
        ? "(" + falloutPercentLabel + "%)"
        : "(" + abbreviateNumber(falloutValue) + ")";

    const textColor = getContrastTextColor(colorShades[periodIdx]);

    if (periodBarWidth > 30 && falloutHeight > 70) {
      const primaryY = 18;
      const secondaryY = 36;

      svg
        .append("text")
        .attr("x", periodX + periodBarWidth / 2)
        .attr("y", primaryY)
        .attr("text-anchor", "middle")
        .attr("fill", textColor)
        .attr("font-family", styleSettings.fontFamily)
        .attr("font-size", styleSettings.metricLabelFontSize + "px")
        .attr("font-weight", "700")
        .attr("opacity", opacity)
        .text(primaryText);

      svg
        .append("text")
        .attr("x", periodX + periodBarWidth / 2)
        .attr("y", secondaryY)
        .attr("text-anchor", "middle")
        .attr("fill", textColor)
        .attr("font-family", styleSettings.fontFamily)
        .attr("font-size", styleSettings.metricLabelFontSize - 1 + "px")
        .attr("font-weight", "400")
        .attr("opacity", opacity * 0.9)
        .text(secondaryText);
    } else {
      const labelY = -8;

      svg
        .append("text")
        .attr("x", periodX + periodBarWidth / 2)
        .attr("y", labelY)
        .attr("text-anchor", "middle")
        .attr("fill", themeColors.primaryTextColor)
        .attr("font-family", styleSettings.fontFamily)
        .attr("font-size", styleSettings.metricLabelFontSize + "px")
        .attr("font-weight", "700")
        .attr("opacity", opacity)
        .text(primaryText);

      svg
        .append("text")
        .attr("x", periodX + periodBarWidth / 2)
        .attr("y", labelY - 16)
        .attr("text-anchor", "middle")
        .attr("fill", themeColors.secondaryTextColor)
        .attr("font-family", styleSettings.fontFamily)
        .attr("font-size", styleSettings.metricLabelFontSize - 1 + "px")
        .attr("font-weight", "400")
        .attr("opacity", opacity)
        .text(secondaryText);
    }
  }

  // Direct labels for first stage (horizontal fallout mode)
  if (visibleIdx === 0 && styleSettings.showLegend && styleSettings.legendPosition === "direct") {
    const periodName = periods[periodIdx] || `Period ${periodIdx + 1}`;
    const textColor = getContrastTextColor(colorShades[periodIdx]);

    svg
      .append("text")
      .attr("x", periodX + periodBarWidth / 2)
      .attr("y", height - 20)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "baseline")
      .attr("fill", textColor)
      .attr("font-family", styleSettings.fontFamily)
      .attr("font-size", styleSettings.inStageLabelFontSize + "px")
      .attr("font-weight", "600")
      .attr("opacity", opacity)
      .text(periodName);
  }
}

/**
 * Render vertical sparklines
 */
function renderVerticalSparklines(
  svg,
  visibleData,
  chartData,
  visibleIndices,
  periods,
  barHeight,
  styleSettings,
  colorShades,
  width,
  selectedStages,
  themeColors
) {
  const sparkWidth = 90;
  const sparkHeight = 45;
  const sparkX = width + 30 + (selectedStages.length === 2 ? 80 : 0);

  visibleData.forEach((d, visibleIdx) => {
    if (visibleIdx === 0) return;

    const yPos = visibleIdx * (barHeight + styleSettings.stageGap);
    const sparkY = yPos + (barHeight - sparkHeight) / 2;

    let sparklineData;
    if (styleSettings.sparklineType === "volume") {
      sparklineData = d.periods.map((value, idx) => ({
        period: idx,
        value,
      }));
    } else {
      const prevStageData = chartData[visibleIndices[visibleIdx - 1]];
      sparklineData = d.periods.map((value, idx) => {
        const prevValue = prevStageData.periods[idx];
        const conversionRate = prevValue > 0 ? (value / prevValue) * 100 : 0;
        return { period: idx, value: conversionRate };
      });
    }

    sparklineData = sparklineData.slice().reverse();

    const sparkXScale = d3
      .scaleLinear()
      .domain([0, sparklineData.length - 1])
      .range([0, sparkWidth]);

    const sparkYScale = d3
      .scaleLinear()
      .domain([0, d3.max(sparklineData, (d) => d.value)])
      .range([sparkHeight, 0]);

    const line = d3
      .line()
      .x((d, i) => sparkXScale(i))
      .y((d) => sparkYScale(d.value))
      .curve(d3.curveMonotoneX);

    const gradientId = "sparkline-gradient-" + visibleIdx;
    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", gradientId)
      .attr("x1", "0%")
      .attr("x2", "100%");

    colorShades
      .slice()
      .reverse()
      .forEach((color, idx) => {
        const offset = (idx / (colorShades.length - 1)) * 100;
        gradient
          .append("stop")
          .attr("offset", offset + "%")
          .attr("stop-color", color);
      });

    const sparkGroup = svg
      .append("g")
      .attr("transform", "translate(" + sparkX + "," + sparkY + ")");

    sparkGroup
      .append("path")
      .datum(sparklineData)
      .attr("fill", "none")
      .attr("stroke", "url(#" + gradientId + ")")
      .attr("stroke-width", 2)
      .attr("d", line);

    sparklineData.forEach((point, idx) => {
      sparkGroup
        .append("circle")
        .attr("cx", sparkXScale(idx))
        .attr("cy", sparkYScale(point.value))
        .attr("r", 3)
        .attr("fill", colorShades[colorShades.length - 1 - idx])
        .attr("stroke", "white")
        .attr("stroke-width", 1);
    });
  });

  const stage1YPos = 0 * (barHeight + styleSettings.stageGap);
  svg
    .append("text")
    .attr("x", sparkX + sparkWidth / 2)
    .attr("y", stage1YPos + barHeight / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .attr("font-family", styleSettings.fontFamily)
    .attr("font-size", "10px")
    .attr("fill", themeColors.secondaryTextColor)
    .text(
      styleSettings.sparklineType === "volume"
        ? "Volume Trend"
        : "Conversion Trend"
    );
}

/**
 * Render horizontal sparklines
 */
function renderHorizontalSparklines(
  svg,
  visibleData,
  chartData,
  visibleIndices,
  periods,
  barWidth,
  styleSettings,
  colorShades,
  margin,
  headerHeight,
  themeColors
) {
  const sparkWidth = 90;
  const sparkHeight = 40;
  const sparkY = -margin.top + 40 + headerHeight + 15;

  visibleData.forEach((d, visibleIdx) => {
    if (visibleIdx === 0) return;

    const xPos = visibleIdx * (barWidth + styleSettings.stageGap);
    const sparkX = xPos + (barWidth - sparkWidth) / 2;

    let sparklineData;
    if (styleSettings.sparklineType === "volume") {
      sparklineData = d.periods.map((value, idx) => ({
        period: idx,
        value,
      }));
    } else {
      const prevStageData = chartData[visibleIndices[visibleIdx - 1]];
      sparklineData = d.periods.map((value, idx) => {
        const prevValue = prevStageData.periods[idx];
        const conversionRate = prevValue > 0 ? (value / prevValue) * 100 : 0;
        return { period: idx, value: conversionRate };
      });
    }

    sparklineData = sparklineData.slice().reverse();

    const sparkXScale = d3
      .scaleLinear()
      .domain([0, sparklineData.length - 1])
      .range([0, sparkWidth]);

    const sparkYScale = d3
      .scaleLinear()
      .domain([0, d3.max(sparklineData, (d) => d.value)])
      .range([sparkHeight, 0]);

    const line = d3
      .line()
      .x((d, i) => sparkXScale(i))
      .y((d) => sparkYScale(d.value))
      .curve(d3.curveMonotoneX);

    const gradientId = "sparkline-gradient-h-" + visibleIdx;
    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", gradientId)
      .attr("x1", "0%")
      .attr("x2", "100%");

    colorShades
      .slice()
      .reverse()
      .forEach((color, idx) => {
        const offset = (idx / (colorShades.length - 1)) * 100;
        gradient
          .append("stop")
          .attr("offset", offset + "%")
          .attr("stop-color", color);
      });

    const sparkGroup = svg
      .append("g")
      .attr("transform", "translate(" + sparkX + "," + sparkY + ")");

    sparkGroup
      .append("path")
      .datum(sparklineData)
      .attr("fill", "none")
      .attr("stroke", "url(#" + gradientId + ")")
      .attr("stroke-width", 2)
      .attr("d", line);

    sparklineData.forEach((point, idx) => {
      sparkGroup
        .append("circle")
        .attr("cx", sparkXScale(idx))
        .attr("cy", sparkYScale(point.value))
        .attr("r", 3)
        .attr("fill", colorShades[colorShades.length - 1 - idx])
        .attr("stroke", "white")
        .attr("stroke-width", 1);
    });
  });

  const stage1XPos = 0 * (barWidth + styleSettings.stageGap);
  svg
    .append("text")
    .attr("x", stage1XPos + barWidth / 2)
    .attr("y", sparkY + sparkHeight / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .attr("font-family", styleSettings.fontFamily)
    .attr("font-size", "11px")
    .attr("fill", themeColors.secondaryTextColor)
    .text(
      styleSettings.sparklineType === "volume"
        ? "Volume Trend"
        : "Conversion Trend"
    );
}

/**
 * Render vertical conversion bracket
 */
function renderVerticalConversionBracket(
  svg,
  selectedStages,
  chartData,
  mapOriginalToVisible,
  barHeight,
  periodBarHeight,
  periods,
  selectedPeriod,
  width,
  styleSettings,
  themeColors
) {
  const visibleSelectedStages = selectedStages.filter(
    (idx) => !chartData[idx].hidden
  );
  if (visibleSelectedStages.length !== 2) return;

  const sortedStages = visibleSelectedStages.sort((a, b) => a - b);
  const idx1 = sortedStages[0];
  const idx2 = sortedStages[1];
  const visIdx1 = mapOriginalToVisible.get(idx1);
  const visIdx2 = mapOriginalToVisible.get(idx2);

  const reversePeriodIdx = periods.length - 1 - selectedPeriod;
  const y1 =
    visIdx1 * (barHeight + styleSettings.stageGap) +
    reversePeriodIdx * periodBarHeight +
    periodBarHeight / 2;
  const y2 =
    visIdx2 * (barHeight + styleSettings.stageGap) +
    reversePeriodIdx * periodBarHeight +
    periodBarHeight / 2;
  const bracketX = width + 20;

  svg
    .append("line")
    .attr("x1", bracketX)
    .attr("y1", y1)
    .attr("x2", bracketX)
    .attr("y2", y2)
    .attr("stroke", themeColors.bracketColor)
    .attr("stroke-width", 2);

  svg
    .append("line")
    .attr("x1", bracketX)
    .attr("y1", y1)
    .attr("x2", bracketX - 15)
    .attr("y2", y1)
    .attr("stroke", themeColors.bracketColor)
    .attr("stroke-width", 2);

  svg
    .append("line")
    .attr("x1", bracketX)
    .attr("y1", y2)
    .attr("x2", bracketX - 15)
    .attr("y2", y2)
    .attr("stroke", themeColors.bracketColor)
    .attr("stroke-width", 2);

  const val1 = chartData[idx1].periods[selectedPeriod];
  const val2 = chartData[idx2].periods[selectedPeriod];

  let conversionRate;
  if (styleSettings.emphasis === "throughput") {
    conversionRate = ((val2 / val1) * 100).toFixed(2);
  } else {
    conversionRate = (((val1 - val2) / val1) * 100).toFixed(2);
  }

  svg
    .append("text")
    .attr("x", bracketX + 10)
    .attr("y", (y1 + y2) / 2)
    .attr("text-anchor", "start")
    .attr("dy", "0.35em")
    .attr("font-family", styleSettings.fontFamily)
    .attr("font-size", styleSettings.conversionLabelFontSize + "px")
    .attr("font-weight", "700")
    .attr("fill", themeColors.bracketColor)
    .text(conversionRate + "%");
}

/**
 * Render horizontal conversion bracket
 */
function renderHorizontalConversionBracket(
  svg,
  selectedStages,
  chartData,
  mapOriginalToVisible,
  barWidth,
  periodBarWidth,
  periods,
  selectedPeriod,
  height,
  styleSettings,
  themeColors
) {
  const visibleSelectedStages = selectedStages.filter(
    (idx) => !chartData[idx].hidden
  );
  if (visibleSelectedStages.length !== 2) return;

  const sortedStages = visibleSelectedStages.sort((a, b) => a - b);
  const idx1 = sortedStages[0];
  const idx2 = sortedStages[1];
  const visIdx1 = mapOriginalToVisible.get(idx1);
  const visIdx2 = mapOriginalToVisible.get(idx2);

  const reversePeriodIdx = periods.length - 1 - selectedPeriod;
  const x1 =
    visIdx1 * (barWidth + styleSettings.stageGap) +
    reversePeriodIdx * periodBarWidth +
    periodBarWidth / 2;
  const x2 =
    visIdx2 * (barWidth + styleSettings.stageGap) +
    reversePeriodIdx * periodBarWidth +
    periodBarWidth / 2;
  const bracketY = -20;

  svg
    .append("line")
    .attr("x1", x1)
    .attr("y1", bracketY)
    .attr("x2", x2)
    .attr("y2", bracketY)
    .attr("stroke", themeColors.bracketColor)
    .attr("stroke-width", 2);

  svg
    .append("line")
    .attr("x1", x1)
    .attr("y1", bracketY)
    .attr("x2", x1)
    .attr("y2", bracketY + 15)
    .attr("stroke", themeColors.bracketColor)
    .attr("stroke-width", 2);

  svg
    .append("line")
    .attr("x1", x2)
    .attr("y1", bracketY)
    .attr("x2", x2)
    .attr("y2", bracketY + 15)
    .attr("stroke", themeColors.bracketColor)
    .attr("stroke-width", 2);

  const val1 = chartData[idx1].periods[selectedPeriod];
  const val2 = chartData[idx2].periods[selectedPeriod];

  let conversionRate;
  if (styleSettings.emphasis === "throughput") {
    conversionRate = ((val2 / val1) * 100).toFixed(2);
  } else {
    conversionRate = (((val1 - val2) / val1) * 100).toFixed(2);
  }

  svg
    .append("text")
    .attr("x", (x1 + x2) / 2)
    .attr("y", bracketY - 5)
    .attr("text-anchor", "middle")
    .attr("font-family", styleSettings.fontFamily)
    .attr("font-size", styleSettings.conversionLabelFontSize + "px")
    .attr("font-weight", "700")
    .attr("fill", themeColors.bracketColor)
    .text(conversionRate + "%");
}

/**
 * Render vertical axis
 */
function renderVerticalAxis(svg, height, width, styleSettings, themeColors) {
  svg
    .append("line")
    .attr(
      "x1",
      styleSettings.emphasis === "throughput" ? 0 : width
    )
    .attr("y1", 0)
    .attr(
      "x2",
      styleSettings.emphasis === "throughput" ? 0 : width
    )
    .attr("y2", height + 20)
    .attr("stroke", themeColors.axisColor)
    .attr("stroke-width", styleSettings.axisLineWidth);

  const arrowSize = Math.max(6, styleSettings.axisLineWidth * 2);
  if (styleSettings.emphasis === "throughput") {
    svg
      .append("polygon")
      .attr(
        "points",
        -arrowSize +
          "," +
          (height + 20) +
          " 0," +
          (height + 20 + arrowSize * 1.5) +
          " " +
          arrowSize +
          "," +
          (height + 20)
      )
      .attr("fill", themeColors.axisColor);
  } else {
    svg
      .append("polygon")
      .attr(
        "points",
        width -
          arrowSize +
          "," +
          (height + 20) +
          " " +
          width +
          "," +
          (height + 20 + arrowSize * 1.5) +
          " " +
          (width + arrowSize) +
          "," +
          (height + 20)
      )
      .attr("fill", themeColors.axisColor);
  }
}

/**
 * Render horizontal axis
 */
function renderHorizontalAxis(svg, height, width, styleSettings, themeColors) {
  svg
    .append("line")
    .attr("x1", 0)
    .attr("y1", height)
    .attr("x2", width + 20)
    .attr("y2", height)
    .attr("stroke", themeColors.axisColor)
    .attr("stroke-width", styleSettings.axisLineWidth);

  const arrowSize = Math.max(6, styleSettings.axisLineWidth * 2);
  svg
    .append("polygon")
    .attr(
      "points",
      width +
        20 +
        "," +
        (height - arrowSize) +
        " " +
        (width + 20 + arrowSize * 1.5) +
        "," +
        height +
        " " +
        (width + 20) +
        "," +
        (height + arrowSize)
    )
    .attr("fill", themeColors.axisColor);
}

/**
 * Render header (title, subtitle, legend)
 */
function renderHeader(
  svg,
  margin,
  styleSettings,
  periods,
  colorShades,
  titleHeight,
  subtitleHeight,
  themeColors
) {
  const headerStartY = -margin.top + 40;

  // Title
  svg
    .append("text")
    .attr("x", 0)
    .attr("y", headerStartY)
    .attr("font-family", styleSettings.fontFamily)
    .attr("font-size", styleSettings.titleFontSize + "px")
    .attr("font-weight", "700")
    .attr("fill", themeColors.titleColor)
    .text(styleSettings.title);

  let currentY = headerStartY + titleHeight;

  // Subtitle
  if (styleSettings.subtitle) {
    currentY += 5;
    svg
      .append("text")
      .attr("x", 0)
      .attr("y", currentY)
      .attr("font-family", styleSettings.fontFamily)
      .attr("font-size", styleSettings.subtitleFontSize + "px")
      .attr("font-weight", "400")
      .attr("fill", themeColors.subtitleColor)
      .text(styleSettings.subtitle);
    currentY += subtitleHeight;
  }

  // Legend (only show traditional legend when legendPosition is "legend")
  if (styleSettings.showLegend && styleSettings.legendPosition === "legend" && periods.length > 0) {
    currentY += 24;
    let legendX = 0;
    periods.forEach((period, idx) => {
      svg
        .append("circle")
        .attr("cx", legendX + 5)
        .attr("cy", currentY)
        .attr("r", 5)
        .attr("fill", colorShades[idx]);

      const text = svg
        .append("text")
        .attr("x", legendX + 15)
        .attr("y", currentY)
        .attr("dy", "0.35em")
        .attr("font-family", styleSettings.fontFamily)
        .attr("font-size", styleSettings.legendFontSize + "px")
        .attr("fill", themeColors.legendTextColor)
        .text(period);

      legendX += 15 + text.node().getBBox().width + 20;
    });
  }
}

export default React.memo(FunnelChart);
