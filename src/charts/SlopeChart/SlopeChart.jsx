import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { comparisonPalettes } from '../../shared/design-system/colorPalettes';
import { getLineColor, calculatePercentageChange, formatLabel, defaultStyleSettings } from './slopeChartDefaults';

/**
 * Convert a color to a pastel/desaturated version (for emphasis)
 * @param {string} color - Hex color string
 * @returns {string} - Desaturated hex color
 */
const desaturateColor = (color) => {
  return applySaturation(color, 30); // 30% saturation for non-emphasized lines
};

/**
 * Apply saturation to a color
 * @param {string} color - Hex color string
 * @param {number} saturationPercent - 0-100%, where 100% = full color, 0% = grey
 * @returns {string} - Adjusted hex color
 */
const applySaturation = (color, saturationPercent) => {
  // Parse the hex color
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Convert to HSL
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case rNorm: h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6; break;
      case gNorm: h = ((bNorm - rNorm) / d + 2) / 6; break;
      case bNorm: h = ((rNorm - gNorm) / d + 4) / 6; break;
      default: h = 0;
    }
  }

  // Apply saturation: 100% = full saturation, 0% = completely grey
  const saturationFactor = saturationPercent / 100;
  s = s * saturationFactor;

  // Convert back to RGB
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let rOut, gOut, bOut;
  if (s === 0) {
    rOut = gOut = bOut = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    rOut = hue2rgb(p, q, h + 1/3);
    gOut = hue2rgb(p, q, h);
    bOut = hue2rgb(p, q, h - 1/3);
  }

  // Convert back to hex
  const toHex = (x) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(rOut)}${toHex(gOut)}${toHex(bOut)}`;
};

/**
 * SlopeChart Component
 *
 * A comprehensive slope chart visualization that shows change between two time periods
 *
 * Features:
 * - Multiple color modes (category, trend, custom, gradient)
 * - Configurable label positioning (left/right)
 * - Line emphasis/selection
 * - Custom styling (line thickness, endpoints, colors)
 * - Interactive data labels
 *
 * @param {Object} props - Component props
 * @param {Array} props.data - Chart data
 * @param {Array} props.periodNames - Period/column names
 * @param {Object} props.styleSettings - Style settings object
 * @param {Function} props.onLineClick - Optional callback when line is clicked
 */
const SlopeChart = ({ data, periodNames, styleSettings = {}, onLineClick }) => {
  const svgRef = useRef(null);
  const [hoveredLine, setHoveredLine] = useState(null);

  /**
   * Main chart rendering effect
   */
  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    // Clear previous render
    d3.select(svgRef.current).selectAll('*').remove();

    // Merge provided settings with defaults
    const settings = { ...defaultStyleSettings, ...styleSettings };

    const {
      width,
      height,
      periodHeight, // Controls vertical spacing between periods
      marginTop,
      marginRight,
      marginBottom,
      marginLeft,
      lineThickness,
      lineOpacity,
      endpointSize,
      endpointStyle,
      endpointBorderWidth,
      labelPosition,
      showCategoryLabels,
      showValueLabels,
      showPercentageChange,
      labelFormat,
      categoryFont,
      categoryFontSize,
      categoryFontWeight,
      valueFont,
      valueFontSize,
      valueFontWeight,
      periodFont,
      periodFontSize,
      periodFontWeight,
      periodColor,
      periodLabelPosition,
      emphasizedLines,
      emphasizedLineThickness,
      emphasizedLabelWeight,
      backgroundColor,
      showAxisLines,
      axisLineColor,
      axisLineWidth,
      axisLineStyle,
      axisEnds,
      periodSpacing,
      colorMode,
      lineSaturation,
    } = settings;

    // Extract periods (should be exactly 2)
    const periods = periodNames.slice(0, 2);
    if (periods.length < 2) {
      console.error('Slope chart requires exactly 2 periods');
      return;
    }

    /**
     * Detect the maximum number of decimal places in the dataset
     */
    const detectDecimalPlaces = () => {
      let maxDecimals = 0;
      data.forEach(d => {
        periods.forEach(period => {
          const value = d[period];
          if (value != null) {
            const strValue = value.toString();
            if (strValue.includes('.')) {
              const decimals = strValue.split('.')[1].length;
              maxDecimals = Math.max(maxDecimals, decimals);
            }
          }
        });
      });
      return maxDecimals;
    };

    const decimalPlaces = detectDecimalPlaces();

    /**
     * Format a number to display with consistent decimal places
     */
    const formatValue = (value) => {
      if (value == null) return '';
      if (decimalPlaces === 0) return value.toString();
      return value.toFixed(decimalPlaces);
    };

    /**
     * Estimate text width based on font size and string length
     * This is a rough approximation - actual width varies by font and characters
     */
    const estimateTextWidth = (text, fontSize, fontWeight = 400) => {
      // Average character width as a multiplier of font size
      // Bold text (>500) takes ~10% more space
      const charWidthMultiplier = fontWeight > 500 ? 0.65 : 0.6;
      const textStr = text != null ? text.toString() : '';
      return textStr.length * fontSize * charWidthMultiplier;
    };

    /**
     * Calculate required margins based on label content and positioning
     */
    let calculatedMarginLeft = marginLeft;
    let calculatedMarginRight = marginRight;

    if (showCategoryLabels || showValueLabels) {
      let maxLeftWidth = 0;
      let maxRightWidth = 0;

      data.forEach((d, i) => {
        const startValue = d[periods[0]];
        const endValue = d[periods[1]];

        // Skip if data is incomplete (e.g., during editing)
        if (startValue == null || endValue == null) return;

        const percentChange = calculatePercentageChange(startValue, endValue);
        const isEmphasized = emphasizedLines.includes(i);
        const shouldShowValueLabels = showValueLabels || isEmphasized;

        // Calculate left side width
        if ((labelPosition === 'left' || labelPosition === 'both') && showCategoryLabels) {
          const categoryText = d.Stage || d.category || '';
          const categoryWidth = estimateTextWidth(
            categoryText,
            categoryFontSize,
            isEmphasized ? emphasizedLabelWeight : categoryFontWeight
          );

          if (shouldShowValueLabels && labelFormat !== 'percentage') {
            // Category + value label both on left
            const valueWidth = estimateTextWidth(formatValue(startValue), valueFontSize);
            maxLeftWidth = Math.max(maxLeftWidth, categoryWidth + valueWidth + 35); // 35px spacing between labels
          } else {
            // Only category on left
            maxLeftWidth = Math.max(maxLeftWidth, categoryWidth + 20);
          }
        } else if (shouldShowValueLabels && labelFormat !== 'percentage') {
          // Only value on left
          const valueWidth = estimateTextWidth(formatValue(startValue), valueFontSize);
          maxLeftWidth = Math.max(maxLeftWidth, valueWidth + 20);
        }

        // Calculate right side width
        if ((labelPosition === 'right' || labelPosition === 'both') && showCategoryLabels) {
          const categoryText = d.Stage || d.category || '';
          const categoryWidth = estimateTextWidth(
            categoryText,
            categoryFontSize,
            isEmphasized ? emphasizedLabelWeight : categoryFontWeight
          );

          if (shouldShowValueLabels) {
            // Category + value label both on right
            let valueText = '';
            if (labelFormat === 'percentage') {
              valueText = `${percentChange > 0 ? '+' : ''}${percentChange}%`;
            } else if (labelFormat === 'both') {
              valueText = `${formatValue(endValue)} (${percentChange > 0 ? '+' : ''}${percentChange}%)`;
            } else {
              valueText = formatValue(endValue);
            }
            const valueWidth = estimateTextWidth(valueText, valueFontSize);
            maxRightWidth = Math.max(maxRightWidth, categoryWidth + valueWidth + 35); // 35px spacing
          } else {
            // Only category on right
            maxRightWidth = Math.max(maxRightWidth, categoryWidth + 20);
          }
        } else if (shouldShowValueLabels) {
          // Only value on right
          let valueText = '';
          if (labelFormat === 'percentage') {
            valueText = `${percentChange > 0 ? '+' : ''}${percentChange}%`;
          } else if (labelFormat === 'both') {
            valueText = `${formatValue(endValue)} (${percentChange > 0 ? '+' : ''}${percentChange}%)`;
          } else {
            valueText = formatValue(endValue);
          }
          const valueWidth = estimateTextWidth(valueText, valueFontSize);
          maxRightWidth = Math.max(maxRightWidth, valueWidth + 20);
        }
      });

      // Ensure margins are at least large enough to fit labels (with 30px buffer from edge)
      calculatedMarginLeft = Math.max(marginLeft, maxLeftWidth + 30);
      calculatedMarginRight = Math.max(marginRight, maxRightWidth + 30);
    }

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('background-color', backgroundColor);

    // Calculate title and subtitle heights
    const titleHeight = settings.title ? (settings.titleFontSize || 20) : 0;
    const subtitleHeight = settings.subtitle ? (settings.subtitleFontSize || 14) : 0;
    const titleToSubtitleGap = settings.title && settings.subtitle ? 5 : 0;
    const headerToChartGap = (settings.title || settings.subtitle) ? 20 : 0;

    const headerHeight = titleHeight + titleToSubtitleGap + subtitleHeight + headerToChartGap;

    // Render Title
    if (settings.title) {
      const titleX = settings.titleAlignment === 'center' ? width / 2 : calculatedMarginLeft;
      const titleAnchor = settings.titleAlignment === 'center' ? 'middle' : 'start';

      svg
        .append('text')
        .attr('x', titleX)
        .attr('y', 30)
        .attr('text-anchor', titleAnchor)
        .attr('font-family', settings.fontFamily || 'Inter')
        .attr('font-size', titleHeight + 'px')
        .attr('font-weight', '700')
        .attr('fill', '#111827')
        .text(settings.title);
    }

    // Render Subtitle
    if (settings.subtitle) {
      const subtitleX = settings.titleAlignment === 'center' ? width / 2 : calculatedMarginLeft;
      const subtitleAnchor = settings.titleAlignment === 'center' ? 'middle' : 'start';

      svg
        .append('text')
        .attr('x', subtitleX)
        .attr('y', 30 + titleHeight + titleToSubtitleGap)
        .attr('text-anchor', subtitleAnchor)
        .attr('font-family', settings.fontFamily || 'Inter')
        .attr('font-size', subtitleHeight + 'px')
        .attr('font-weight', '400')
        .attr('fill', '#6b7280')
        .text(settings.subtitle);
    }

    const chartGroup = svg
      .append('g')
      .attr('transform', `translate(${calculatedMarginLeft},${marginTop + headerHeight})`);

    const chartWidth = width - calculatedMarginLeft - calculatedMarginRight;
    // Use periodHeight if provided to control vertical spacing, otherwise use height-based calculation
    const chartHeight = periodHeight || (height - marginTop - marginBottom);

    // Calculate min and max values for scaling
    const allValues = data.flatMap(d => [d[periods[0]], d[periods[1]]]);
    const minValue = d3.min(allValues);
    const maxValue = d3.max(allValues);

    // Create Y scale
    const yScale = d3
      .scaleLinear()
      .domain([minValue, maxValue])
      .range([chartHeight, 0])
      .nice();

    // X positions for the two time periods (centered based on periodSpacing)
    const effectivePeriodSpacing = periodSpacing || 400;
    const x1 = (chartWidth - effectivePeriodSpacing) / 2;
    const x2 = x1 + effectivePeriodSpacing;

    // Draw axis lines
    if (showAxisLines) {
      // Convert axis line style to stroke-dasharray
      const getStrokeDashArray = (style) => {
        switch (style) {
          case 'solid':
            return 'none';
          case 'dashed':
            return '5,5';
          case 'dotted':
            return '1,3';
          default:
            return '5,5';
        }
      };

      const strokeDashArray = getStrokeDashArray(axisLineStyle);

      // Left axis line
      chartGroup
        .append('line')
        .attr('x1', x1)
        .attr('x2', x1)
        .attr('y1', 0)
        .attr('y2', chartHeight)
        .attr('stroke', axisLineColor)
        .attr('stroke-width', axisLineWidth)
        .attr('stroke-dasharray', strokeDashArray);

      // Right axis line
      chartGroup
        .append('line')
        .attr('x1', x2)
        .attr('x2', x2)
        .attr('y1', 0)
        .attr('y2', chartHeight)
        .attr('stroke', axisLineColor)
        .attr('stroke-width', axisLineWidth)
        .attr('stroke-dasharray', strokeDashArray);

      // Draw T-ends if enabled
      if (axisEnds === 't-end') {
        const capWidth = 12; // Width of the T-end cap

        // Left axis - top cap
        chartGroup
          .append('line')
          .attr('x1', x1 - capWidth / 2)
          .attr('x2', x1 + capWidth / 2)
          .attr('y1', 0)
          .attr('y2', 0)
          .attr('stroke', axisLineColor)
          .attr('stroke-width', axisLineWidth);

        // Left axis - bottom cap
        chartGroup
          .append('line')
          .attr('x1', x1 - capWidth / 2)
          .attr('x2', x1 + capWidth / 2)
          .attr('y1', chartHeight)
          .attr('y2', chartHeight)
          .attr('stroke', axisLineColor)
          .attr('stroke-width', axisLineWidth);

        // Right axis - top cap
        chartGroup
          .append('line')
          .attr('x1', x2 - capWidth / 2)
          .attr('x2', x2 + capWidth / 2)
          .attr('y1', 0)
          .attr('y2', 0)
          .attr('stroke', axisLineColor)
          .attr('stroke-width', axisLineWidth);

        // Right axis - bottom cap
        chartGroup
          .append('line')
          .attr('x1', x2 - capWidth / 2)
          .attr('x2', x2 + capWidth / 2)
          .attr('y1', chartHeight)
          .attr('y2', chartHeight)
          .attr('stroke', axisLineColor)
          .attr('stroke-width', axisLineWidth);
      }
    }

    // Draw period labels (above or below based on periodLabelPosition)
    const periodLabelY = periodLabelPosition === 'above' ? -20 : chartHeight + 40;

    chartGroup
      .append('text')
      .attr('x', x1)
      .attr('y', periodLabelY)
      .attr('text-anchor', 'middle')
      .attr('font-family', periodFont)
      .attr('font-size', periodFontSize)
      .attr('font-weight', periodFontWeight)
      .attr('fill', periodColor)
      .text(periods[0]);

    chartGroup
      .append('text')
      .attr('x', x2)
      .attr('y', periodLabelY)
      .attr('text-anchor', 'middle')
      .attr('font-family', periodFont)
      .attr('font-size', periodFontSize)
      .attr('font-weight', periodFontWeight)
      .attr('fill', periodColor)
      .text(periods[1]);

    // Calculate label offsets to prevent overlaps
    const calculateLabelOffsets = (data, yScale, periods, labelPosition, categoryFontSize) => {
      const positions = data.map((d, i) => {
        const startValue = d[periods[0]];
        const endValue = d[periods[1]];
        const y1 = yScale(startValue);
        const y2 = yScale(endValue);
        return {
          index: i,
          y: labelPosition === 'left' ? y1 : y2,
          originalY: labelPosition === 'left' ? y1 : y2
        };
      });

      // Sort by y position
      positions.sort((a, b) => a.y - b.y);

      // Detect and resolve overlaps
      const minSpacing = categoryFontSize + 2; // Minimum space between labels
      for (let i = 1; i < positions.length; i++) {
        const prev = positions[i - 1];
        const curr = positions[i];
        const gap = curr.y - prev.y;

        if (gap < minSpacing) {
          curr.y = prev.y + minSpacing;
        }
      }

      // Create offset map
      const offsetMap = {};
      positions.forEach(pos => {
        offsetMap[pos.index] = pos.y - pos.originalY;
      });

      return offsetMap;
    };

    const labelOffsets = showCategoryLabels
      ? calculateLabelOffsets(data, yScale, periods, labelPosition, categoryFontSize)
      : {};

    /**
     * Calculate offsets for value labels to prevent overlaps
     * This is needed when value labels are shown for emphasized lines only
     */
    const calculateValueLabelOffsets = (side) => {
      // Skip if no value labels are shown at all
      const hasAnyLabels = showValueLabels || emphasizedLines.length > 0;
      if (!hasAnyLabels) return {};

      const positions = [];

      data.forEach((d, i) => {
        const isEmphasized = emphasizedLines.includes(i);
        const shouldShowLabel = showValueLabels || isEmphasized;

        if (!shouldShowLabel) return; // Skip lines without labels

        const startValue = d[periods[0]];
        const endValue = d[periods[1]];

        // Skip if data is incomplete
        if (startValue == null || endValue == null) return;

        const y1 = yScale(startValue);
        const y2 = yScale(endValue);

        positions.push({
          index: i,
          y: side === 'left' ? y1 : y2,
          originalY: side === 'left' ? y1 : y2
        });
      });

      // No collision avoidance needed if 0-1 labels
      if (positions.length <= 1) return {};

      // Sort by y position
      positions.sort((a, b) => a.y - b.y);

      // Calculate bounding box height for each label (considering font size)
      // Stack spacing should be tight since they're the same label type
      const labelHeight = valueFontSize * 1.2; // Height including some padding
      const stackSpacing = 2; // Minimal gap between stacked labels

      // Detect and resolve overlaps with bidirectional stacking
      let hasOverlaps = true;
      let iterations = 0;
      const maxIterations = 10; // Prevent infinite loops

      while (hasOverlaps && iterations < maxIterations) {
        hasOverlaps = false;
        iterations++;

        for (let i = 0; i < positions.length - 1; i++) {
          const curr = positions[i];
          const next = positions[i + 1];
          const gap = next.y - curr.y;

          // Check if labels overlap
          if (gap < labelHeight) {
            hasOverlaps = true;

            // Calculate how much space is needed
            const overlapAmount = labelHeight - gap;
            const halfOverlap = overlapAmount / 2;

            // Stack: move one up, one down (centered over the midpoint)
            curr.y -= halfOverlap + stackSpacing / 2;
            next.y += halfOverlap + stackSpacing / 2;
          }
        }
      }

      // Create offset map
      const offsetMap = {};
      positions.forEach(pos => {
        offsetMap[pos.index] = pos.y - pos.originalY;
      });

      return offsetMap;
    };

    const leftValueOffsets = calculateValueLabelOffsets('left');
    const rightValueOffsets = calculateValueLabelOffsets('right');

    /**
     * Calculate maximum metric label width for consistent left-side category positioning
     * Need to account for both showValueLabels=true AND emphasized lines
     */
    let maxLeftMetricWidth = 0;
    if ((labelPosition === 'left' || labelPosition === 'both') && showCategoryLabels) {
      data.forEach((d, i) => {
        const isEmphasized = emphasizedLines.includes(i);
        const shouldShowValueLabels = showValueLabels || isEmphasized;

        if (!shouldShowValueLabels || labelFormat === 'percentage') return; // Skip if no left values shown

        const startValue = d[periods[0]];

        // Skip if data is incomplete
        if (startValue == null) return;

        const metricText = startValue.toString();
        const estimatedWidth = metricText.length * valueFontSize * 0.6;
        maxLeftMetricWidth = Math.max(maxLeftMetricWidth, estimatedWidth);
      });
    }
    const leftCategoryX = maxLeftMetricWidth > 0 ? x1 - maxLeftMetricWidth - 20 : x1 - 15;

    /**
     * Calculate maximum metric label width for consistent right-side category positioning
     * Need to account for both showValueLabels=true AND emphasized lines
     */
    let maxRightMetricWidth = 0;
    if ((labelPosition === 'right' || labelPosition === 'both') && showCategoryLabels) {
      data.forEach((d, i) => {
        const isEmphasized = emphasizedLines.includes(i);
        const shouldShowValueLabels = showValueLabels || isEmphasized;

        if (!shouldShowValueLabels) return; // Skip if no values shown for this line

        const startValue = d[periods[0]];
        const endValue = d[periods[1]];

        // Skip if data is incomplete
        if (startValue == null || endValue == null) return;

        const percentChange = calculatePercentageChange(startValue, endValue);

        let metricText = '';
        if (labelFormat === 'percentage') {
          metricText = `${percentChange > 0 ? '+' : ''}${percentChange}%`;
        } else if (labelFormat === 'both') {
          metricText = `${endValue} (${percentChange > 0 ? '+' : ''}${percentChange}%)`;
        } else {
          metricText = endValue.toString();
        }
        const estimatedWidth = metricText.length * valueFontSize * 0.6;
        maxRightMetricWidth = Math.max(maxRightMetricWidth, estimatedWidth);
      });
    }
    const rightCategoryX = maxRightMetricWidth > 0 ? x2 + maxRightMetricWidth + 15 : x2 + 15;

    // Draw lines and endpoints for each category
    data.forEach((d, i) => {
      const startValue = d[periods[0]];
      const endValue = d[periods[1]];

      // Skip if data is incomplete (e.g., during editing)
      if (startValue == null || endValue == null) return;

      const percentChange = calculatePercentageChange(startValue, endValue);
      const isEmphasized = emphasizedLines.includes(i);

      // Calculate opacity and color adjustments for emphasis
      const hasEmphasizedLines = emphasizedLines.length > 0;
      const calculatedOpacity = hoveredLine === i ? 1 : lineOpacity;

      // Get line color
      let lineColor = getLineColor(d, i, settings, comparisonPalettes);

      // Apply global saturation control
      const effectiveSaturation = lineSaturation !== undefined ? lineSaturation : 100;
      if (effectiveSaturation < 100) {
        lineColor = applySaturation(lineColor, effectiveSaturation);
      }

      // Convert to pastel/desaturated version for non-emphasized lines
      if (hasEmphasizedLines && !isEmphasized) {
        lineColor = desaturateColor(lineColor);
      }

      // Calculate y positions for the line
      const y1 = yScale(startValue);
      const y2 = yScale(endValue);

      // Create gradient for gradient mode
      let gradientId = null;
      if (colorMode === 'gradient') {
        gradientId = `gradient-${i}`;
        const gradient = svg
          .append('defs')
          .append('linearGradient')
          .attr('id', gradientId)
          .attr('x1', x1)
          .attr('y1', y1)
          .attr('x2', x2)
          .attr('y2', y2)
          .attr('gradientUnits', 'userSpaceOnUse'); // Use absolute coordinates

        gradient
          .append('stop')
          .attr('offset', '0%')
          .attr('stop-color', settings.startColor);

        gradient
          .append('stop')
          .attr('offset', '100%')
          .attr('stop-color', settings.endColor);
      }

      // Line group for interactivity
      const lineGroup = chartGroup
        .append('g')
        .attr('class', `slope-line-${i}`)
        .style('cursor', 'pointer');

      // Draw line (always visible even when values are equal - creates horizontal line)
      lineGroup
        .append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', gradientId ? `url(#${gradientId})` : lineColor)
        .attr('stroke-width', isEmphasized ? emphasizedLineThickness : lineThickness)
        .attr('opacity', calculatedOpacity)
        .attr('stroke-linecap', 'round')
        .style('vector-effect', 'non-scaling-stroke'); // Ensure line is always visible

      // Determine endpoint colors (use gradient colors in gradient mode)
      let startEndpointColor = colorMode === 'gradient' ? settings.startColor : lineColor;
      let endEndpointColor = colorMode === 'gradient' ? settings.endColor : lineColor;

      // Apply desaturation to endpoints if line is not emphasized
      if (hasEmphasizedLines && !isEmphasized) {
        if (colorMode === 'gradient') {
          startEndpointColor = desaturateColor(settings.startColor);
          endEndpointColor = desaturateColor(settings.endColor);
        }
        // lineColor is already desaturated above, so endpoints will use that
      }

      // Draw start endpoint (only if endpointSize > 0)
      if (endpointSize > 0) {
        if (endpointStyle === 'filled') {
          lineGroup
            .append('circle')
            .attr('cx', x1)
            .attr('cy', y1)
            .attr('r', endpointSize)
            .attr('fill', startEndpointColor)
            .attr('opacity', calculatedOpacity);
        } else {
          // Outlined: white fill with colored border
          lineGroup
            .append('circle')
            .attr('cx', x1)
            .attr('cy', y1)
            .attr('r', endpointSize)
            .attr('fill', 'white')
            .attr('stroke', startEndpointColor)
            .attr('stroke-width', endpointBorderWidth)
            .attr('stroke-opacity', calculatedOpacity)
            .attr('fill-opacity', 1); // White fill always fully opaque
        }
      }

      // Draw end endpoint (only if endpointSize > 0)
      if (endpointSize > 0) {
        if (endpointStyle === 'filled') {
          lineGroup
            .append('circle')
            .attr('cx', x2)
            .attr('cy', y2)
            .attr('r', endpointSize)
            .attr('fill', endEndpointColor)
            .attr('opacity', calculatedOpacity);
        } else {
          // Outlined: white fill with colored border
          lineGroup
            .append('circle')
            .attr('cx', x2)
            .attr('cy', y2)
            .attr('r', endpointSize)
            .attr('fill', 'white')
            .attr('stroke', endEndpointColor)
            .attr('stroke-width', endpointBorderWidth)
            .attr('stroke-opacity', calculatedOpacity)
            .attr('fill-opacity', 1); // White fill always fully opaque
        }
      }

      // Add interactivity
      lineGroup
        .on('mouseenter', () => setHoveredLine(i))
        .on('mouseleave', () => setHoveredLine(null))
        .on('click', () => {
          if (onLineClick) {
            onLineClick(i, d);
          }
        });

      // Labels
      const labelWeight = isEmphasized ? emphasizedLabelWeight : categoryFontWeight;
      const valueLabelWeight = isEmphasized ? emphasizedLabelWeight : valueFontWeight;

      // Value labels - Show when:
      // 1. showValueLabels is true, OR
      // 2. showValueLabels is false BUT line is emphasized
      const shouldShowValueLabels = showValueLabels || isEmphasized;

      if (shouldShowValueLabels) {
        // Get offsets for collision avoidance
        const leftOffset = leftValueOffsets[i] || 0;
        const rightOffset = rightValueOffsets[i] || 0;

        // Left side value label (start value) - Show ONLY when not in percentage mode
        if (labelFormat !== 'percentage') {
          const startLabel = formatValue(startValue);

          // Position closer to chart if category is on left, otherwise at normal position
          const leftMetricX = ((labelPosition === 'left' || labelPosition === 'both') && showCategoryLabels) ? x1 - 10 : x1 - 15;

          chartGroup
            .append('text')
            .attr('x', leftMetricX)
            .attr('y', y1 + leftOffset)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'end')
            .attr('font-family', valueFont)
            .attr('font-size', valueFontSize)
            .attr('font-weight', valueLabelWeight)
            .attr('fill', lineColor)
            .text(startLabel);
        }

        // Right side value label (end value) - Show based on labelFormat
        const endLabel = labelFormat === 'percentage'
          ? `${percentChange > 0 ? '+' : ''}${percentChange}%`
          : labelFormat === 'both'
          ? `${formatValue(endValue)} (${percentChange > 0 ? '+' : ''}${percentChange}%)`
          : formatValue(endValue);

        // Always show right metric value
        // Position closer to chart if category is on right, otherwise at normal position
        const rightMetricX = ((labelPosition === 'right' || labelPosition === 'both') && showCategoryLabels) ? x2 + 10 : x2 + 15;

        chartGroup
          .append('text')
          .attr('x', rightMetricX)
          .attr('y', y2 + rightOffset)
          .attr('dy', '0.35em')
          .attr('text-anchor', 'start')
          .attr('font-family', valueFont)
          .attr('font-size', valueFontSize)
          .attr('font-weight', valueLabelWeight)
          .attr('fill', lineColor)
          .text(endLabel);
      }

      // Category labels (on selected side, OUTSIDE metric labels)
      if (showCategoryLabels) {
        // Use the same collision avoidance offsets as value labels to keep them aligned
        const leftCategoryOffset = leftValueOffsets[i] || 0;
        const rightCategoryOffset = rightValueOffsets[i] || 0;

        if (labelPosition === 'left' || labelPosition === 'both') {
          // Category on far left - use consistent position for all labels (right-aligned)
          const categoryX = leftCategoryX;

          chartGroup
            .append('text')
            .attr('x', categoryX)
            .attr('y', y1 + leftCategoryOffset)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'end')
            .attr('font-family', categoryFont)
            .attr('font-size', categoryFontSize)
            .attr('font-weight', labelWeight)
            .attr('fill', lineColor)
            .text(d.Stage || d.category);
        }

        if (labelPosition === 'right' || labelPosition === 'both') {
          // Category on far right - use consistent position for all labels (left-aligned)
          const categoryX = rightCategoryX;

          chartGroup
            .append('text')
            .attr('x', categoryX)
            .attr('y', y2 + rightCategoryOffset)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'start')
            .attr('font-family', categoryFont)
            .attr('font-size', categoryFontSize)
            .attr('font-weight', labelWeight)
            .attr('fill', lineColor)
            .text(d.Stage || d.category);
        }
      }
    });

  }, [data, periodNames, styleSettings, hoveredLine, onLineClick]);

  return (
    <div className="slope-chart-container">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default SlopeChart;
