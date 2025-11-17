import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { comparisonPalettes } from '../../shared/design-system/colorPalettes';
import { getContrastTextColor, generateColorGradient } from '../../shared/utils/colorUtils';

/**
 * BarChart Component
 * Displays data as rectangular bars with lengths proportional to values
 * Supports vertical/horizontal orientation and grouped/stacked modes
 * Data format: { Category: "East", "Jan": 41427, "Feb": 52341, ... }
 */
const BarChart = ({ data, periodNames, styleSettings = {}, onBarClick, onClearEmphasis }) => {
  const svgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedBarsForComparison, setSelectedBarsForComparison] = useState([]);

  // Destructure style settings with defaults
  const {
    title = '',
    subtitle = '',
    titleFontSize = 28,
    subtitleFontSize = 20,
    titleAlignment = 'left',
    fontFamily = 'Inter',
    orientation = 'vertical',
    barMode = 'grouped',
    colorPalette = 'observable10',
    customColors = [],
    categoryFont = 'Inter',
    categoryFontSize = 16,
    categoryWeight = 400,
    valueFont = 'Inter',
    valueFontSize = 14,
    valueWeight = 600,
    axisFont = 'Inter',
    xAxisFontSize = 12,
    yAxisFontSize = 12,
    axisLabel = '',
    axisLabelFontSize = 14,
    xAxisLabelRotation = 0,
    axisWeight = 400,
    axisMinimum = 0,
    axisMinimumAuto = true,
    axisMaximum = 100,
    axisMaximumAuto = true,
    axisMajorUnit = 10,
    axisMajorUnitAuto = true,
    axisMinorUnit = 5,
    axisMinorUnitAuto = true,
    axisMajorTickType = 'outside',
    axisMinorTickType = 'none',
    showHorizontalGridlines = true,
    showVerticalGridlines = false,
    setCalculatedAxisMinimum,
    setCalculatedAxisMaximum,
    setCalculatedAxisMajorUnit,
    showValueLabels = true,
    showMetricLabels = true,
    showPeriodLabels = true,
    metricLabelPosition = 'outside',
    periodLabelDisplay = 'all',
    showCategoryLabels = true,
    labelMode = 'legend',
    legendPosition = 'above',
    directLabelContent = 'metrics',
    emphasizedBars = [],
    compactNumbers = false,
    compactAxisNumbers = false,
    showGrid = true,
    gridOpacity = 0.1,
    showXAxis = true,
    showYAxis = true,
    xAxisLineThickness = 1,
    yAxisLineThickness = 1,
    axisColorBrightness = 0, // 0=black, 50=grey, 100=white
    showXAxisLabels = true,
    showYAxisLabels = true,
    axisColor = '#000000',
    axisOpacity = 1,
    barWidthPercent = 100,
    groupPadding = 0.3,
    barOpacity = 1,
    barBorderWidth = 0,
    barBorderColor = '#ffffff',
    chartHeight = 500,
    chartWidth = 600,
    marginTop = 60,
    marginRight = 60,
    marginBottom = 80,
    marginLeft = 180,
    percentChangeEnabled = false,
    percentChangeLabelFormat = 'percent',
    percentChangeBracketDistance = 100,
    barColor = '#1e40af',
    valuePrefix = '',
    valueSuffix = '',
    valueDecimalPlaces = 0,
    valueFormat = 'number',
    axisValuePrefix = '',
    axisValueSuffix = '',
    axisValueDecimalPlaces = 0,
    axisValueFormat = 'number',
    periodLabelFontSize = 14,
    darkMode = false,
    backgroundColor = '#ffffff',
    showTotalLabels = true,
    boldTotal = false,
  } = styleSettings;

  // Convert axis color brightness (0-100) to hex color
  // 0 = black, 50 = grey, 100 = white
  const computedAxisColor = useMemo(() => {
    const brightness = Math.round((axisColorBrightness / 100) * 255);
    const hex = brightness.toString(16).padStart(2, '0');
    return `#${hex}${hex}${hex}`;
  }, [axisColorBrightness]);

  // Define theme-aware colors based on dark mode
  const themeColors = useMemo(() => ({
    // Title and subtitle
    titleColor: darkMode ? '#f9fafb' : '#111827',
    subtitleColor: darkMode ? '#d1d5db' : '#6b7280',
    // Axis value labels (numbers like 0, 1M, 2M) - use computed axis color
    axisValueLabelColor: computedAxisColor,
    // Category labels (bar names) - NOT affected by axis color slider
    categoryLabelColor: darkMode ? '#e5e7eb' : '#374151',
    // Axis lines and gridlines - use computed axis color for lines
    axisLineColor: computedAxisColor,
    gridlineColor: darkMode ? '#374151' : '#e5e7eb',
    // Legend text
    legendTextColor: darkMode ? '#e5e7eb' : '#374151',
    // Emphasis color for brackets and highlights - theme-aware
    emphasisColor: darkMode ? '#ffffff' : '#000000', // white in dark mode, black in light mode
  }), [darkMode, computedAxisColor]);

  // Determine if we're in comparison mode (multiple periods) or single-color mode
  const isComparisonMode = periodNames && periodNames.length > 1;

  // Get color scheme
  const colorScheme = useMemo(() => {
    if (isComparisonMode) {
      // Comparison mode: use palettes
      if (colorPalette === 'user' && customColors.length > 0) {
        return customColors;
      }
      return comparisonPalettes[colorPalette]?.colors || comparisonPalettes.observable10.colors;
    } else {
      // Single-color mode: use barColor for all bars
      return [barColor];
    }
  }, [isComparisonMode, customColors, colorPalette, barColor, periodNames]);

  // Handle container resize
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        // Use explicit chartWidth and chartHeight for the inner plot area
        // Calculate total SVG dimensions including margins
        const totalWidth = chartWidth + marginLeft + marginRight;
        const totalHeight = chartHeight + marginTop + marginBottom;

        setDimensions({
          width: totalWidth,
          height: totalHeight,
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [chartHeight, chartWidth, marginLeft, marginRight, marginTop, marginBottom]);

  // Handle bar click for percent change comparison
  const handleBarClickForComparison = useCallback((barData) => {
    if (!percentChangeEnabled) return;

    setSelectedBarsForComparison(prev => {
      const newSelected = [...prev];
      // Add the clicked bar
      newSelected.push(barData);
      return newSelected;
    });
  }, [percentChangeEnabled]);

  // Check if a bar is selected for comparison
  const isBarSelected = useCallback((barId) => {
    return selectedBarsForComparison.some(bar => bar.barId === barId);
  }, [selectedBarsForComparison]);

  // Expose clear function to parent component
  useEffect(() => {
    if (onClearEmphasis) {
      onClearEmphasis(() => {
        setSelectedBarsForComparison([]);
      });
    }
  }, [onClearEmphasis]);

  // Sync emphasizedBars with selectedBarsForComparison for percentage change brackets
  useEffect(() => {
    if (percentChangeEnabled && emphasizedBars && emphasizedBars.length >= 2 && data && periodNames) {
      // Convert emphasizedBars (array of barIds like "Google Ads-Jan") into bar data objects
      const barsForComparison = emphasizedBars.slice(0, 2).map(barId => {
        // Parse barId format: "Category-Period"
        const lastDashIndex = barId.lastIndexOf('-');
        const category = barId.substring(0, lastDashIndex);
        const period = barId.substring(lastDashIndex + 1);

        // Find the data row for this category
        const dataRow = data.find(row => row.Category === category);
        if (!dataRow) return null;

        const value = dataRow[period];
        if (value === undefined) return null;

        return {
          barId,
          category,
          period,
          value: parseFloat(value)
        };
      }).filter(Boolean);

      if (barsForComparison.length >= 2) {
        console.log('[BarChart] Auto-populating selectedBarsForComparison from emphasizedBars:', barsForComparison);
        setSelectedBarsForComparison(barsForComparison);
      }
    }
  }, [emphasizedBars, percentChangeEnabled, data, periodNames]);

  // Main chart rendering
  useEffect(() => {
    if (!data || data.length === 0 || !periodNames || periodNames.length === 0 || dimensions.width === 0) {
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = dimensions.width;
    const height = dimensions.height;

    // Set background color
    svg.style('background-color', backgroundColor);

    // Extract categories from data (simple format: Category + Value columns)
    const categories = data.map(d => d.Category || d.category || d.Stage || '');
    const periods = periodNames;

    // Calculate title and subtitle heights
    const titleHeight = title ? titleFontSize : 0;
    const subtitleHeight = subtitle ? subtitleFontSize : 0;
    const titleToSubtitleGap = title && subtitle ? 5 : 0;
    const headerToChartGap = (title || subtitle) ? 20 : 0;

    // Calculate legend height
    const legendItemHeight = 24;
    const legendGap = 15;
    const legendHeight = (showPeriodLabels && showValueLabels && labelMode === 'legend' && legendPosition !== 'off') ? (legendItemHeight + legendGap) : 0;

    const headerHeight = titleHeight + titleToSubtitleGap + subtitleHeight + headerToChartGap +
      (showPeriodLabels && showValueLabels && labelMode === 'legend' && legendPosition === 'above' ? legendHeight : 0);

    // Render Title
    if (title) {
      const titleX = titleAlignment === 'center' ? width / 2 : marginLeft;
      const titleAnchor = titleAlignment === 'center' ? 'middle' : 'start';

      svg
        .append('text')
        .attr('x', titleX)
        .attr('y', 30)
        .attr('text-anchor', titleAnchor)
        .attr('font-family', fontFamily)
        .attr('font-size', titleHeight + 'px')
        .attr('font-weight', '700')
        .attr('fill', themeColors.titleColor)
        .text(title);
    }

    // Render Subtitle
    if (subtitle) {
      const subtitleX = titleAlignment === 'center' ? width / 2 : marginLeft;
      const subtitleAnchor = titleAlignment === 'center' ? 'middle' : 'start';

      svg
        .append('text')
        .attr('x', subtitleX)
        .attr('y', 30 + titleHeight + titleToSubtitleGap)
        .attr('text-anchor', subtitleAnchor)
        .attr('font-family', fontFamily)
        .attr('font-size', subtitleHeight + 'px')
        .attr('font-weight', '400')
        .attr('fill', themeColors.subtitleColor)
        .text(subtitle);
    }

    // Render Legend (if labelMode is 'legend' and position is 'above' and showValueLabels is true and showPeriodLabels is true)
    if (showPeriodLabels && showValueLabels && labelMode === 'legend' && legendPosition === 'above') {
      const legendY = 30 + titleHeight + titleToSubtitleGap + subtitleHeight + (title || subtitle ? 20 : 0);
      const legendItemWidth = 120;
      const legendItemSpacing = 20;
      const totalLegendWidth = periods.length * legendItemWidth + (periods.length - 1) * legendItemSpacing;
      const legendStartX = (width - totalLegendWidth) / 2;

      periods.forEach((period, i) => {
        const x = legendStartX + i * (legendItemWidth + legendItemSpacing);
        const color = colorScheme[i % colorScheme.length];

        // Color swatch
        svg
          .append('rect')
          .attr('x', x)
          .attr('y', legendY)
          .attr('width', 16)
          .attr('height', 16)
          .attr('fill', color)
          .attr('rx', 2);

        // Period label
        svg
          .append('text')
          .attr('x', x + 22)
          .attr('y', legendY + 8)
          .attr('dy', '0.35em')
          .attr('font-family', fontFamily)
          .attr('font-size', '14px')
          .attr('font-weight', '500')
          .attr('fill', themeColors.legendTextColor)
          .text(period);
      });
    }

    // Calculate dynamic left margin for horizontal orientation to prevent label clipping
    let dynamicMarginLeft = marginLeft;

    if (orientation === 'horizontal') {
      // Create a temporary text element to measure category label widths
      const tempText = svg.append('text')
        .attr('font-family', categoryFont || axisFont)
        .attr('font-size', yAxisFontSize)
        .attr('font-weight', categoryWeight || axisWeight)
        .style('visibility', 'hidden');

      // Find the maximum width among all category labels
      let maxLabelWidth = 0;
      categories.forEach(category => {
        tempText.text(category);
        const bbox = tempText.node().getBBox();
        maxLabelWidth = Math.max(maxLabelWidth, bbox.width);
      });

      // Remove temporary text
      tempText.remove();

      // Set dynamic margin with some padding (add 30px for tick marks and spacing)
      dynamicMarginLeft = Math.max(marginLeft, maxLabelWidth + 30);
    }

    // Calculate inner dimensions
    // Increase bottom margin when legend is at bottom to accommodate legend + watermark
    const hasBottomLegend = showPeriodLabels && showValueLabels && labelMode === 'legend' && legendPosition === 'below';
    const legendAndWatermarkSpace = 50; // Extra space needed for legend (24px) + spacing + watermark
    const adjustedMarginBottom = hasBottomLegend ? marginBottom + legendAndWatermarkSpace : marginBottom;

    const innerWidth = width - dynamicMarginLeft - marginRight;
    const innerHeight = height - marginTop - adjustedMarginBottom - headerHeight;

    // Create main SVG group
    const g = svg
      .append('g')
      .attr('transform', `translate(${dynamicMarginLeft},${marginTop + headerHeight})`);

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
     * Format a number to display with consistent decimal places or in compact format
     */
    const formatValue = (value) => {
      if (value == null) return '';

      // Handle percentage format
      if (valueFormat === 'percentage') {
        const percentValue = value * 100;
        let formattedValue;

        if (compactNumbers) {
          const absValue = Math.abs(percentValue);
          if (absValue >= 1000000) {
            formattedValue = (percentValue / 1000000).toFixed(valueDecimalPlaces).replace(/\.0+$/, '') + 'M';
          } else if (absValue >= 1000) {
            formattedValue = (percentValue / 1000).toFixed(valueDecimalPlaces).replace(/\.0+$/, '') + 'K';
          } else {
            formattedValue = valueDecimalPlaces === 0 ? percentValue.toString() : percentValue.toFixed(valueDecimalPlaces);
          }
        } else {
          formattedValue = valueDecimalPlaces === 0 ? percentValue.toString() : percentValue.toFixed(valueDecimalPlaces);
        }

        return `${valuePrefix}${formattedValue}%${valueSuffix}`;
      }

      // Handle number format (existing logic)
      let formattedValue;

      if (compactNumbers) {
        const absValue = Math.abs(value);
        if (absValue >= 1000000) {
          formattedValue = (value / 1000000).toFixed(valueDecimalPlaces).replace(/\.0+$/, '') + 'M';
        } else if (absValue >= 1000) {
          formattedValue = (value / 1000).toFixed(valueDecimalPlaces).replace(/\.0+$/, '') + 'K';
        } else {
          formattedValue = valueDecimalPlaces === 0 ? value.toString() : value.toFixed(valueDecimalPlaces);
        }
      } else {
        formattedValue = valueDecimalPlaces === 0 ? value.toString() : value.toFixed(valueDecimalPlaces);
      }

      // Apply prefix and suffix
      return `${valuePrefix}${formattedValue}${valueSuffix}`;
    };

    /**
     * Format axis tick values in compact format if compactAxisNumbers is enabled
     * Applies prefix, suffix, and decimal places from Axis Number Styling settings
     */
    const formatAxisValue = (value) => {
      if (value == null) return '';

      // Handle percentage format
      if (axisValueFormat === 'percentage') {
        const percentValue = value * 100;
        let formattedValue;

        if (compactAxisNumbers) {
          const absValue = Math.abs(percentValue);
          if (absValue >= 1000000) {
            formattedValue = (percentValue / 1000000).toFixed(axisValueDecimalPlaces) + 'M';
          } else if (absValue >= 1000) {
            formattedValue = (percentValue / 1000).toFixed(axisValueDecimalPlaces) + 'K';
          } else {
            formattedValue = percentValue.toFixed(axisValueDecimalPlaces);
          }
        } else {
          formattedValue = percentValue.toFixed(axisValueDecimalPlaces);
        }

        return `${axisValuePrefix}${formattedValue}%${axisValueSuffix}`;
      }

      // Handle number format
      let formattedValue;

      if (compactAxisNumbers) {
        const absValue = Math.abs(value);
        if (absValue >= 1000000) {
          formattedValue = (value / 1000000).toFixed(axisValueDecimalPlaces) + 'M';
        } else if (absValue >= 1000) {
          formattedValue = (value / 1000).toFixed(axisValueDecimalPlaces) + 'K';
        } else {
          formattedValue = value.toFixed(axisValueDecimalPlaces);
        }
      } else {
        formattedValue = value.toFixed(axisValueDecimalPlaces);
      }

      // Apply prefix and suffix
      return `${axisValuePrefix}${formattedValue}${axisValueSuffix}`;
    };

    /**
     * Desaturate a color by converting to grayscale blend
     */
    const desaturateColor = (color) => {
      // Convert hex to RGB
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      // Calculate grayscale value
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

      // Blend original color with grayscale (70% gray, 30% original)
      const newR = Math.round(gray * 0.7 + r * 0.3);
      const newG = Math.round(gray * 0.7 + g * 0.3);
      const newB = Math.round(gray * 0.7 + b * 0.3);

      // Convert back to hex format
      const toHex = (n) => {
        const hex = Math.round(n).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      return '#' + toHex(newR) + toHex(newG) + toHex(newB);
    };

    // Calculate min and max values for scale
    let maxValue = 0;
    let minValue = 0;

    if (barMode === 'stacked') {
      // For stacked, sum all periods for each category
      maxValue = d3.max(data, d => {
        return periods.reduce((sum, period) => sum + (d[period] || 0), 0);
      });
      minValue = d3.min(data, d => {
        return periods.reduce((sum, period) => sum + (d[period] || 0), 0);
      });
    } else {
      // For grouped, find max and min across all values
      maxValue = d3.max(data, d => {
        return d3.max(periods, period => d[period] || 0);
      });
      minValue = d3.min(data, d => {
        return d3.min(periods, period => d[period] || 0);
      });
    }

    // Determine axis minimum and maximum
    // When auto, use calculated min (which could be negative), but default to 0 if all values are positive
    const calculatedMinValue = axisMinimumAuto ? (minValue < 0 ? minValue * 1.1 : 0) : axisMinimum;
    const calculatedMaxValue = axisMaximumAuto ? (maxValue * 1.1) : axisMaximum;

    // Create scales based on orientation
    let xScale, yScale, xAxis, yAxis;
    let yTicks, xTicks;
    let yMinorTicks = [];
    let xMinorTicks = [];

    if (orientation === 'vertical') {
      // Vertical bars: categories on X, values on Y
      xScale = d3.scaleBand()
        .domain(categories)
        .range([0, innerWidth])
        .padding(groupPadding);

      yScale = d3.scaleLinear()
        .domain([calculatedMinValue, calculatedMaxValue])
        .range([innerHeight, 0]);

      if (axisMaximumAuto) {
        yScale.nice();
      }

      // Report calculated bounds back to parent
      if (setCalculatedAxisMinimum && setCalculatedAxisMaximum) {
        const [actualMin, actualMax] = yScale.domain();
        setCalculatedAxisMinimum(actualMin);
        setCalculatedAxisMaximum(actualMax);
      }

      // Create Y-axis with custom major unit or auto ticks
      if (!axisMajorUnitAuto && axisMajorUnit > 0) {
        yTicks = [];
        for (let i = calculatedMinValue; i <= calculatedMaxValue; i += axisMajorUnit) {
          yTicks.push(i);
        }
        // Always include the maximum value if it's not already in the array
        const maxTick = yScale.domain()[1];
        if (!yTicks.includes(maxTick) && maxTick > yTicks[yTicks.length - 1]) {
          yTicks.push(maxTick);
        }
      } else {
        yTicks = yScale.ticks();
        // Always include the maximum value
        const maxTick = yScale.domain()[1];
        if (!yTicks.includes(maxTick)) {
          yTicks.push(maxTick);
        }

        // Report calculated major unit back to parent
        if (setCalculatedAxisMajorUnit && yTicks.length > 1) {
          const interval = yTicks[1] - yTicks[0];
          setCalculatedAxisMajorUnit(interval);
        }
      }

      // Generate minor ticks for Y-axis
      yMinorTicks = [];
      if (!axisMinorUnitAuto && axisMinorUnit > 0 && axisMinorTickType !== 'none') {
        for (let i = calculatedMinValue; i <= calculatedMaxValue; i += axisMinorUnit) {
          // Only include minor ticks that aren't also major ticks
          if (!yTicks.includes(i)) {
            yMinorTicks.push(i);
          }
        }
      }

      // Determine tick sizes based on tick type
      const getMajorTickSize = (type) => {
        if (type === 'none') return 0;
        if (type === 'outside') return 6;
        if (type === 'inside') return -6;
        if (type === 'cross') return 6;
        return 6;
      };

      const getMinorTickSize = (type) => {
        if (type === 'none') return 0;
        if (type === 'outside') return 4;
        if (type === 'inside') return -4;
        if (type === 'cross') return 4;
        return 4;
      };

      const majorTickSize = getMajorTickSize(axisMajorTickType);
      const minorTickSize = getMinorTickSize(axisMinorTickType);

      xAxis = d3.axisBottom(xScale).tickSize(majorTickSize);
      yAxis = d3.axisLeft(yScale).tickValues(yTicks).tickSize(majorTickSize).tickFormat(formatAxisValue);
    } else {
      // Horizontal bars: categories on Y, values on X
      yScale = d3.scaleBand()
        .domain(categories)
        .range([0, innerHeight])
        .padding(groupPadding);

      xScale = d3.scaleLinear()
        .domain([calculatedMinValue, calculatedMaxValue])
        .range([0, innerWidth]);

      if (axisMaximumAuto) {
        xScale.nice();
      }

      // Report calculated bounds back to parent
      if (setCalculatedAxisMinimum && setCalculatedAxisMaximum) {
        const [actualMin, actualMax] = xScale.domain();
        setCalculatedAxisMinimum(actualMin);
        setCalculatedAxisMaximum(actualMax);
      }

      // Create X-axis with custom major unit or auto ticks
      if (!axisMajorUnitAuto && axisMajorUnit > 0) {
        xTicks = [];
        for (let i = calculatedMinValue; i <= calculatedMaxValue; i += axisMajorUnit) {
          xTicks.push(i);
        }
        // Always include the maximum value if it's not already in the array
        const maxTick = xScale.domain()[1];
        if (!xTicks.includes(maxTick) && maxTick > xTicks[xTicks.length - 1]) {
          xTicks.push(maxTick);
        }
      } else {
        xTicks = xScale.ticks();
        // Always include the maximum value
        const maxTick = xScale.domain()[1];
        if (!xTicks.includes(maxTick)) {
          xTicks.push(maxTick);
        }

        // Report calculated major unit back to parent
        if (setCalculatedAxisMajorUnit && xTicks.length > 1) {
          const interval = xTicks[1] - xTicks[0];
          setCalculatedAxisMajorUnit(interval);
        }
      }

      // Generate minor ticks for X-axis
      xMinorTicks = [];
      if (!axisMinorUnitAuto && axisMinorUnit > 0 && axisMinorTickType !== 'none') {
        for (let i = calculatedMinValue; i <= calculatedMaxValue; i += axisMinorUnit) {
          // Only include minor ticks that aren't also major ticks
          if (!xTicks.includes(i)) {
            xMinorTicks.push(i);
          }
        }
      }

      // Determine tick sizes based on tick type
      const getMajorTickSize = (type) => {
        if (type === 'none') return 0;
        if (type === 'outside') return 6;
        if (type === 'inside') return -6;
        if (type === 'cross') return 6;
        return 6;
      };

      const getMinorTickSize = (type) => {
        if (type === 'none') return 0;
        if (type === 'outside') return 4;
        if (type === 'inside') return -4;
        if (type === 'cross') return 4;
        return 4;
      };

      const majorTickSize = getMajorTickSize(axisMajorTickType);
      const minorTickSize = getMinorTickSize(axisMinorTickType);

      xAxis = d3.axisBottom(xScale).tickValues(xTicks).tickSize(majorTickSize).tickFormat(formatAxisValue);
      yAxis = d3.axisLeft(yScale).tickSize(majorTickSize);
    }

    // Draw grid lines (behind bars, using major tick values only)
    if (orientation === 'vertical') {
      // Horizontal grid lines for vertical bars
      if (showHorizontalGridlines && yTicks && yTicks.length > 0) {
        g.append('g')
          .attr('class', 'grid-horizontal')
          .selectAll('line')
          .data(yTicks)
          .enter()
          .append('line')
          .attr('x1', 0)
          .attr('x2', innerWidth)
          .attr('y1', d => yScale(d))
          .attr('y2', d => yScale(d))
          .attr('stroke', themeColors.gridlineColor)
          .attr('stroke-opacity', gridOpacity)
          .attr('stroke-width', 1);
      }

      // Vertical grid lines for vertical bars
      if (showVerticalGridlines) {
        g.append('g')
          .attr('class', 'grid-vertical')
          .selectAll('line')
          .data(categories)
          .enter()
          .append('line')
          .attr('x1', d => xScale(d) + xScale.bandwidth() / 2)
          .attr('x2', d => xScale(d) + xScale.bandwidth() / 2)
          .attr('y1', 0)
          .attr('y2', innerHeight)
          .attr('stroke', themeColors.gridlineColor)
          .attr('stroke-opacity', gridOpacity)
          .attr('stroke-width', 1);
      }
    } else {
      // Horizontal grid lines for horizontal bars
      if (showHorizontalGridlines) {
        g.append('g')
          .attr('class', 'grid-horizontal')
          .selectAll('line')
          .data(categories)
          .enter()
          .append('line')
          .attr('x1', 0)
          .attr('x2', innerWidth)
          .attr('y1', d => yScale(d) + yScale.bandwidth() / 2)
          .attr('y2', d => yScale(d) + yScale.bandwidth() / 2)
          .attr('stroke', themeColors.gridlineColor)
          .attr('stroke-opacity', gridOpacity)
          .attr('stroke-width', 1);
      }

      // Vertical grid lines for horizontal bars
      if (showVerticalGridlines && xTicks && xTicks.length > 0) {
        g.append('g')
          .attr('class', 'grid-vertical')
          .selectAll('line')
          .data(xTicks)
          .enter()
          .append('line')
          .attr('x1', d => xScale(d))
          .attr('x2', d => xScale(d))
          .attr('y1', 0)
          .attr('y2', innerHeight)
          .attr('stroke', themeColors.gridlineColor)
          .attr('stroke-opacity', gridOpacity)
          .attr('stroke-width', 1);
      }
    }

    // Note: Axes rendering moved to after bars to ensure axes are always on top

    // Draw bars
    if (barMode === 'grouped') {
      // Grouped bars
      const groupWidth = orientation === 'vertical' ? xScale.bandwidth() : yScale.bandwidth();
      // Calculate bar width based on barWidthPercent
      // 0% = no width, 100% = bars fill their allocated space (touching), 150% = 50% overlap
      const barSpace = groupWidth / periods.length; // Space allocated per bar
      const barWidth = barSpace * (barWidthPercent / 100);
      const barOffset = barSpace;

      data.forEach((d, categoryIndex) => {
        const categoryValue = categories[categoryIndex];

        periods.forEach((period, periodIndex) => {
          const value = d[period] || 0;
          const color = colorScheme[periodIndex % colorScheme.length];

          // Calculate bar emphasis
          const barId = `${categoryValue}-${period}`;
          const hasEmphasizedBars = emphasizedBars && emphasizedBars.length > 0;
          const isEmphasized = emphasizedBars && emphasizedBars.includes(barId);
          const effectiveColor = hasEmphasizedBars && !isEmphasized ? desaturateColor(color) : color;

          let barGroup;

          if (orientation === 'vertical') {
            const x = xScale(categoryValue) + barOffset * periodIndex + (barOffset - barWidth) / 2;
            // For vertical bars: positive values grow up from zero, negative values grow down from zero
            const zeroY = yScale(0);
            const valueY = yScale(value);
            const y = value >= 0 ? valueY : zeroY;
            const height = Math.abs(valueY - zeroY);

            barGroup = g.append('g')
              .attr('class', 'bar-group');

            barGroup.append('rect')
              .attr('x', x)
              .attr('y', y)
              .attr('width', barWidth)
              .attr('height', height)
              .attr('fill', effectiveColor)
              .attr('opacity', barOpacity)
              .attr('stroke', barBorderColor)
              .attr('stroke-width', barBorderWidth)
              .style('cursor', 'pointer')
              .on('click', () => {
                if (onBarClick) onBarClick(d, period, barId);
                // Calculate label position based on metricLabelPosition setting
                const labelX = x + barWidth / 2;
                let labelY;
                if (value < 0) {
                  // For negative values, position at the bottom (end) of the bar
                  labelY = metricLabelPosition === 'inside' ? y + height - 5 : y + height + valueFontSize + 5;
                } else {
                  // For positive values, position at the top (end) of the bar
                  labelY = metricLabelPosition === 'inside' ? y + valueFontSize + 5 : y - 5;
                }
                handleBarClickForComparison({
                  category: categoryValue,
                  period,
                  value,
                  barId,
                  x,
                  y,
                  barWidth,
                  height,
                  labelX,
                  labelY,
                  orientation: 'vertical'
                });
              });

            // Labels (direct or value)
            // Show label if: (1) showValueLabels is on and labelMode is direct, OR (2) bar is emphasized (clicked)
            const showLabel = (showValueLabels && labelMode === 'direct') || isEmphasized;
            const isSelected = selectedBarsForComparison.some(bar => bar.barId === barId);
            const labelWeight = (isSelected || isEmphasized) ? 700 : valueWeight;

            if (showLabel) {
              // Determine if we should show period label for this bar
              const shouldShowPeriodLabel = showPeriodLabels && (
                periodLabelDisplay === 'all' ||
                (periodLabelDisplay === 'first' && categoryIndex === 0)
              );

              // Metric Label - show if showMetricLabels is on OR bar is emphasized
              if (showMetricLabels || isEmphasized) {
                const textColor = metricLabelPosition === 'inside'
                  ? getContrastTextColor(effectiveColor)
                  : themeColors.categoryLabelColor;

                let metricY;
                if (value < 0) {
                  // For negative values, position at the bottom (end) of the bar
                  metricY = metricLabelPosition === 'inside'
                    ? y + height - 5 // Inside: near the bottom edge
                    : y + height + valueFontSize + 5; // Outside: below the bar
                } else {
                  // For positive values, position at the top (end) of the bar
                  metricY = metricLabelPosition === 'inside'
                    ? y + valueFontSize + 5 // Inside: below the top edge, accounting for font size
                    : y - 5; // Outside: above the bar
                }

                barGroup.append('text')
                  .attr('x', x + barWidth / 2)
                  .attr('y', metricY)
                  .attr('text-anchor', 'middle')
                  .attr('font-family', valueFont)
                  .attr('font-size', valueFontSize)
                  .attr('font-weight', labelWeight)
                  .attr('fill', textColor)
                  .text(formatValue(value));
              }

              // Period Label
              if (shouldShowPeriodLabel) {
                const textColor = getContrastTextColor(effectiveColor);

                // Period label always appears inside the bar, near the base
                const periodY = y + height - 10;

                barGroup.append('text')
                  .attr('x', x + barWidth / 2)
                  .attr('y', periodY)
                  .attr('text-anchor', 'middle')
                  .attr('font-family', valueFont)
                  .attr('font-size', periodLabelFontSize)
                  .attr('font-weight', labelWeight)
                  .attr('fill', textColor)
                  .text(period);
              }
            } else if (labelMode === 'legend' && showValueLabels && showMetricLabels) {
              // Traditional value label (when labelMode is 'legend')
              // This label is OUTSIDE the bar, so it uses axisColor for background contrast
              const legendLabelY = value < 0
                ? y + height + valueFontSize + 5 // Negative: below the bar
                : y - 5; // Positive: above the bar

              barGroup.append('text')
                .attr('x', x + barWidth / 2)
                .attr('y', legendLabelY)
                .attr('text-anchor', 'middle')
                .attr('font-family', valueFont)
                .attr('font-size', valueFontSize)
                .attr('font-weight', labelWeight)
                .attr('fill', themeColors.categoryLabelColor)
                .text(formatValue(value));
            }
          } else {
            // Horizontal bars
            const y = yScale(categoryValue) + barOffset * periodIndex + (barOffset - barWidth) / 2;
            // For horizontal bars: positive values grow right from zero, negative values grow left from zero
            const zeroX = xScale(0);
            const valueX = xScale(value);
            const x = value >= 0 ? zeroX : valueX;
            const width = Math.abs(valueX - zeroX);

            barGroup = g.append('g')
              .attr('class', 'bar-group');

            barGroup.append('rect')
              .attr('x', x)
              .attr('y', y)
              .attr('width', width)
              .attr('height', barWidth)
              .attr('fill', effectiveColor)
              .attr('opacity', barOpacity)
              .attr('stroke', barBorderColor)
              .attr('stroke-width', barBorderWidth)
              .style('cursor', 'pointer')
              .on('click', () => {
                if (onBarClick) onBarClick(d, period, barId);
                // Calculate label position based on metricLabelPosition setting
                let labelX;
                if (value < 0) {
                  // For negative values (extending left)
                  labelX = metricLabelPosition === 'inside' ? x + 15 : x - 5;
                } else {
                  // For positive values (extending right)
                  labelX = metricLabelPosition === 'inside' ? x + width - 15 : x + width + 5;
                }
                const labelY = y + barWidth / 2;
                handleBarClickForComparison({
                  category: categoryValue,
                  period,
                  value,
                  barId,
                  x: 0,
                  y,
                  width,
                  barWidth,
                  labelX,
                  labelY,
                  orientation: 'horizontal'
                });
              });

            // Labels (direct or value)
            // Show label if: (1) showValueLabels is on and labelMode is direct, OR (2) bar is emphasized (clicked)
            const showLabel = (showValueLabels && labelMode === 'direct') || isEmphasized;
            const isSelected = selectedBarsForComparison.some(bar => bar.barId === barId);
            const labelWeight = (isSelected || isEmphasized) ? 700 : valueWeight;

            if (showLabel) {
              // Determine if we should show period label for this bar
              const shouldShowPeriodLabel = showPeriodLabels && (
                periodLabelDisplay === 'all' ||
                (periodLabelDisplay === 'first' && categoryIndex === 0)
              );

              // Metric Label - show if showMetricLabels is on OR bar is emphasized
              if (showMetricLabels || isEmphasized) {
                const textColor = metricLabelPosition === 'inside'
                  ? getContrastTextColor(effectiveColor)
                  : themeColors.categoryLabelColor;

                let metricX, textAnchor;
                if (value < 0) {
                  // For negative values (extending left), position at the left end
                  if (metricLabelPosition === 'inside') {
                    metricX = x + 15; // Inside: inset from the left edge
                    textAnchor = 'start';
                  } else {
                    metricX = x - 5; // Outside: to the left of the bar
                    textAnchor = 'end';
                  }
                } else {
                  // For positive values (extending right), position at the right end
                  if (metricLabelPosition === 'inside') {
                    metricX = x + width - 15; // Inside: inset from the right edge
                    textAnchor = 'end';
                  } else {
                    metricX = x + width + 5; // Outside: to the right of the bar
                    textAnchor = 'start';
                  }
                }

                barGroup.append('text')
                  .attr('x', metricX)
                  .attr('y', y + barWidth / 2)
                  .attr('dy', '0.35em')
                  .attr('text-anchor', textAnchor)
                  .attr('font-family', valueFont)
                  .attr('font-size', valueFontSize)
                  .attr('font-weight', labelWeight)
                  .attr('fill', textColor)
                  .text(formatValue(value));
              }

              // Period Label
              if (shouldShowPeriodLabel) {
                const textColor = getContrastTextColor(effectiveColor);

                // Period label always appears inside the bar, near the left edge
                barGroup.append('text')
                  .attr('x', 15)
                  .attr('y', y + barWidth / 2)
                  .attr('dy', '0.35em')
                  .attr('text-anchor', 'start')
                  .attr('font-family', valueFont)
                  .attr('font-size', periodLabelFontSize)
                  .attr('font-weight', labelWeight)
                  .attr('fill', textColor)
                  .text(period);
              }
            } else if (labelMode === 'legend' && showValueLabels && showMetricLabels) {
              // Traditional value label (when labelMode is 'legend')
              // Label is OUTSIDE the bar, use axisColor for background contrast
              const legendLabelX = value < 0
                ? x - 5 // Negative: to the left of the bar
                : x + width + 5; // Positive: to the right of the bar
              const textAnchor = value < 0 ? 'end' : 'start';

              barGroup.append('text')
                .attr('x', legendLabelX)
                .attr('y', y + barWidth / 2)
                .attr('dy', '0.35em')
                .attr('text-anchor', textAnchor)
                .attr('font-family', valueFont)
                .attr('font-size', valueFontSize)
                .attr('font-weight', labelWeight)
                .attr('fill', themeColors.categoryLabelColor)
                .text(formatValue(value));
            }
          }
        });
      });
    } else {
      // Stacked bars
      data.forEach((d, categoryIndex) => {
        const categoryValue = categories[categoryIndex];
        let cumulativeValue = 0;

        periods.forEach((period, periodIndex) => {
          const value = d[period] || 0;
          const color = colorScheme[periodIndex % colorScheme.length];

          // Calculate bar emphasis
          const barId = `${categoryValue}-${period}`;
          const hasEmphasizedBars = emphasizedBars && emphasizedBars.length > 0;
          const isEmphasized = emphasizedBars && emphasizedBars.includes(barId);
          const effectiveColor = hasEmphasizedBars && !isEmphasized ? desaturateColor(color) : color;

          let barGroup;

          if (orientation === 'vertical') {
            const x = xScale(categoryValue);
            const barWidth = xScale.bandwidth();
            // For stacked vertical bars: stack from cumulative value
            const startY = yScale(cumulativeValue);
            const endY = yScale(cumulativeValue + value);
            const y = Math.min(startY, endY);
            const height = Math.abs(endY - startY);

            barGroup = g.append('g')
              .attr('class', 'bar-group');

            barGroup.append('rect')
              .attr('x', x)
              .attr('y', y)
              .attr('width', barWidth)
              .attr('height', height)
              .attr('fill', effectiveColor)
              .attr('opacity', barOpacity)
              .attr('stroke', barBorderColor)
              .attr('stroke-width', barBorderWidth)
              .style('cursor', 'pointer')
              .on('click', () => {
                if (onBarClick) onBarClick(d, period, barId);
                // For stacked bars, label is in the center of the segment
                const labelX = x + barWidth / 2;
                const labelY = y + height / 2;
                handleBarClickForComparison({
                  category: categoryValue,
                  period,
                  value,
                  barId,
                  x,
                  y,
                  barWidth,
                  height,
                  labelX,
                  labelY,
                  orientation: 'vertical'
                });
              });

            // Labels (direct or value) in center of segment
            const isSelected = selectedBarsForComparison.some(bar => bar.barId === barId);
            const labelWeight = (isSelected || isEmphasized) ? 700 : valueWeight;

            // Show label if: (1) showValueLabels and showMetricLabels are on, OR (2) bar is emphasized (clicked)
            // In stacked mode, labels appear inside segments and work with both direct and legend modes
            if (((showValueLabels && showMetricLabels) || isEmphasized) && height > 20) { // Only show if segment is large enough
              const textColor = getContrastTextColor(effectiveColor);
              // Single line label
              // Show label if: (1) showMetricLabels is on, OR (2) bar is emphasized
              if (showMetricLabels || isEmphasized) {
                barGroup.append('text')
                  .attr('x', x + barWidth / 2)
                  .attr('y', y + height / 2)
                  .attr('dy', '0.35em')
                  .attr('text-anchor', 'middle')
                  .attr('font-family', valueFont)
                  .attr('font-size', valueFontSize)
                  .attr('font-weight', labelWeight)
                  .attr('fill', textColor)
                  .text(formatValue(value));
              }
            }
          } else {
            // Horizontal stacked bars
            const y = yScale(categoryValue);
            const barWidth = yScale.bandwidth();
            // For stacked horizontal bars: stack from cumulative value
            const startX = xScale(cumulativeValue);
            const endX = xScale(cumulativeValue + value);
            const x = Math.min(startX, endX);
            const width = Math.abs(endX - startX);

            barGroup = g.append('g')
              .attr('class', 'bar-group');

            barGroup.append('rect')
              .attr('x', x)
              .attr('y', y)
              .attr('width', width)
              .attr('height', barWidth)
              .attr('fill', effectiveColor)
              .attr('opacity', barOpacity)
              .attr('stroke', barBorderColor)
              .attr('stroke-width', barBorderWidth)
              .style('cursor', 'pointer')
              .on('click', () => {
                if (onBarClick) onBarClick(d, period, barId);
                // For stacked bars, label is in the center of the segment
                const labelX = x + width / 2;
                const labelY = y + barWidth / 2;
                handleBarClickForComparison({
                  category: categoryValue,
                  period,
                  value,
                  barId,
                  x,
                  y,
                  width,
                  barWidth,
                  labelX,
                  labelY,
                  orientation: 'horizontal'
                });
              });

            // Labels (direct or value) in center of segment
            const isSelected = selectedBarsForComparison.some(bar => bar.barId === barId);
            const labelWeight = (isSelected || isEmphasized) ? 700 : valueWeight;

            // Show label if: (1) showValueLabels and showMetricLabels are on, OR (2) bar is emphasized (clicked)
            // In stacked mode, labels appear inside segments and work with both direct and legend modes
            if (((showValueLabels && showMetricLabels) || isEmphasized) && width > 40) { // Only show if segment is large enough
              const textColor = getContrastTextColor(effectiveColor);
              // Single line label
              // Show label if: (1) showMetricLabels is on, OR (2) bar is emphasized
              if (showMetricLabels || isEmphasized) {
                barGroup.append('text')
                  .attr('x', x + width / 2)
                  .attr('y', y + barWidth / 2)
                  .attr('dy', '0.35em')
                  .attr('text-anchor', 'middle')
                  .attr('font-family', valueFont)
                  .attr('font-size', valueFontSize)
                  .attr('font-weight', labelWeight)
                  .attr('fill', textColor)
                  .text(formatValue(value));
              }
            }
          }

          cumulativeValue += value;
        });

        // Add total label and cap line for stacked bars
        if (showTotalLabels && barMode === 'stacked') {
          const totalValue = cumulativeValue;
          const totalWeight = boldTotal ? 700 : 400;

          if (orientation === 'vertical') {
            const x = xScale(categoryValue);
            const barWidth = xScale.bandwidth();
            const y = yScale(totalValue);

            // Add 2px cap line
            g.append('line')
              .attr('x1', x)
              .attr('y1', y)
              .attr('x2', x + barWidth)
              .attr('y2', y)
              .attr('stroke', themeColors.categoryLabelColor)
              .attr('stroke-width', 2);

            // Create a unique barId for the total
            const totalBarId = `${categoryValue}-Total`;

            // Add total label with click handler for percent change
            g.append('text')
              .attr('x', x + barWidth / 2)
              .attr('y', y - 5)
              .attr('text-anchor', 'middle')
              .attr('font-family', valueFont)
              .attr('font-size', valueFontSize)
              .attr('font-weight', totalWeight)
              .attr('fill', themeColors.categoryLabelColor)
              .style('cursor', percentChangeEnabled ? 'pointer' : 'default')
              .text(formatValue(totalValue))
              .on('click', () => {
                if (!percentChangeEnabled) return;
                // Calculate label position
                const labelX = x + barWidth / 2;
                const labelY = y - 5;
                handleBarClickForComparison({
                  category: categoryValue,
                  period: 'Total',
                  value: totalValue,
                  barId: totalBarId,
                  x,
                  y,
                  barWidth,
                  height: innerHeight - y,
                  labelX,
                  labelY,
                  orientation: 'vertical'
                });
              });
          } else {
            // Horizontal stacked bars
            const y = yScale(categoryValue);
            const barWidth = yScale.bandwidth();
            const x = xScale(totalValue);

            // Add 2px cap line
            g.append('line')
              .attr('x1', x)
              .attr('y1', y)
              .attr('x2', x)
              .attr('y2', y + barWidth)
              .attr('stroke', themeColors.axisLabelColor)
              .attr('stroke-width', 2);

            // Create a unique barId for the total
            const totalBarId = `${categoryValue}-Total`;

            // Add total label with click handler for percent change
            g.append('text')
              .attr('x', x + 5)
              .attr('y', y + barWidth / 2)
              .attr('dy', '0.35em')
              .attr('text-anchor', 'start')
              .attr('font-family', valueFont)
              .attr('font-size', valueFontSize)
              .attr('font-weight', totalWeight)
              .attr('fill', themeColors.axisLabelColor)
              .style('cursor', percentChangeEnabled ? 'pointer' : 'default')
              .text(formatValue(totalValue))
              .on('click', () => {
                if (!percentChangeEnabled) return;
                // Calculate label position
                const labelX = x + 5;
                const labelY = y + barWidth / 2;
                handleBarClickForComparison({
                  category: categoryValue,
                  period: 'Total',
                  value: totalValue,
                  barId: totalBarId,
                  x: 0,
                  y,
                  width: x,
                  barWidth,
                  labelX,
                  labelY,
                  orientation: 'horizontal'
                });
              });
          }
        }

        // Add period labels outside stacked bars (only when showPeriodLabels is on and in direct label mode)
        if (showPeriodLabels && labelMode === 'direct') {
          const isLastCategory = categoryIndex === data.length - 1; // Last bar in vertical mode
          const isFirstCategory = categoryIndex === 0; // First bar in horizontal mode

          periods.forEach((period, periodIndex) => {
            const color = colorScheme[periodIndex % colorScheme.length];

            // Check if this period has any emphasized bars
            const hasPeriodEmphasized = emphasizedBars && emphasizedBars.some(barId => barId.endsWith(`-${period}`));
            const periodFontWeight = hasPeriodEmphasized ? 700 : valueWeight;

            if (orientation === 'vertical' && isLastCategory) {
              // Vertical: place period labels to the right of the LAST bar only
              const x = xScale(categoryValue);
              const barWidth = xScale.bandwidth();

              // Calculate Y position for each period label (centered on its segment)
              let segmentStart = 0;
              for (let i = 0; i < periodIndex; i++) {
                segmentStart += d[periods[i]] || 0;
              }
              const segmentValue = d[period] || 0;
              const segmentMiddle = segmentStart + (segmentValue / 2);
              const yPos = yScale(segmentMiddle);

              g.append('text')
                .attr('x', x + barWidth + 10) // 10px to the right of the bar
                .attr('y', yPos)
                .attr('dy', '0.35em')
                .attr('text-anchor', 'start')
                .attr('font-family', valueFont)
                .attr('font-size', periodLabelFontSize)
                .attr('font-weight', periodFontWeight)
                .attr('fill', color)
                .text(period);
            } else if (orientation === 'horizontal' && isFirstCategory) {
              // Horizontal: place period labels at the top of the FIRST bar only
              const y = yScale(categoryValue);
              const barWidth = yScale.bandwidth();

              // Calculate X position for each period label (centered on its segment)
              let segmentStart = 0;
              for (let i = 0; i < periodIndex; i++) {
                segmentStart += d[periods[i]] || 0;
              }
              const segmentValue = d[period] || 0;
              const segmentMiddle = segmentStart + (segmentValue / 2);
              const xPos = xScale(segmentMiddle);

              g.append('text')
                .attr('x', xPos)
                .attr('y', y - 10) // 10px above the bar
                .attr('text-anchor', 'middle')
                .attr('font-family', valueFont)
                .attr('font-size', periodLabelFontSize)
                .attr('font-weight', periodFontWeight)
                .attr('fill', color)
                .text(period);
            }
          });
        }
      });
    }

    // Draw axes (after bars to ensure axes are always on top)
    if (showXAxis) {
      // For vertical orientation with negative values, position X-axis at y=0
      const xAxisPosition = orientation === 'vertical' ? yScale(0) : innerHeight;
      const xAxisGroup = g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${xAxisPosition})`)
        .call(xAxis);

      xAxisGroup.selectAll('text')
        .attr('font-family', axisFont)
        .attr('font-size', xAxisFontSize)
        .attr('font-weight', axisWeight)
        // Vertical orientation: X-axis shows categories (not affected by axis color)
        // Horizontal orientation: X-axis shows values (affected by axis color)
        .attr('fill', orientation === 'vertical' ? themeColors.categoryLabelColor : themeColors.axisValueLabelColor)
        .attr('opacity', showXAxisLabels ? axisOpacity : 0); // Hide labels if toggle is off

      // Make category labels bold if they have emphasized bars (works for both grouped and stacked modes)
      if (emphasizedBars && emphasizedBars.length > 0 && orientation === 'vertical') {
        categories.forEach((category) => {
          // Check if any bar in this category is emphasized
          const hasEmphasizedBar = emphasizedBars.some(barId => barId.startsWith(`${category}-`));

          if (hasEmphasizedBar) {
            xAxisGroup.selectAll('.tick')
              .filter((d) => d === category)
              .select('text')
              .attr('font-weight', 700);
          }
        });
      }

      // Style axis lines - hide domain line if thickness is 0
      xAxisGroup.selectAll('.tick line')
        .attr('stroke', themeColors.axisLineColor)
        .attr('opacity', axisOpacity);

      xAxisGroup.select('.domain')
        .attr('stroke', themeColors.axisLineColor)
        .attr('stroke-width', xAxisLineThickness)
        .attr('opacity', xAxisLineThickness > 0 ? axisOpacity : 0);

      // Apply X-axis label rotation
      if (orientation === 'vertical') {
        if (xAxisLabelRotation > 0) {
          const rotationAngle = -xAxisLabelRotation;
          xAxisGroup.selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .attr('transform', `rotate(${rotationAngle})`);
        } else {
          xAxisGroup.selectAll('text')
            .style('text-anchor', 'middle')
            .attr('dx', null)
            .attr('dy', `${0.71 * xAxisFontSize + 5}px`) // .71em + 5px spacing
            .attr('transform', null);
        }

        // For categories with all negative values, move labels below the bars
        if (calculatedMinValue < 0) {
          categories.forEach((category) => {
            const categoryData = data.find(d => d.Category === category);
            if (!categoryData) return;

            // Check if all values for this category are negative
            const allNegative = periods.every(period => (categoryData[period] || 0) < 0);

            if (allNegative) {
              // Find minimum value for this category
              let minVal;
              if (barMode === 'stacked') {
                minVal = periods.reduce((sum, period) => sum + (categoryData[period] || 0), 0);
              } else {
                minVal = d3.min(periods, period => categoryData[period] || 0);
              }

              const minY = yScale(minVal);
              const offset = minY - xAxisPosition;

              // Select and reposition the label
              xAxisGroup.selectAll('.tick')
                .filter((d) => d === category)
                .select('text')
                .attr('dy', offset + categoryFontSize + 10);
            }
          });
        }
      } else {
        // Horizontal orientation - value labels below X-axis
        xAxisGroup.selectAll('text')
          .style('text-anchor', 'middle')
          .attr('dy', `${0.71 * xAxisFontSize + 5}px`); // .71em + 5px spacing
      }

      // Handle cross tick type for major ticks
      if (axisMajorTickType === 'cross') {
        if (orientation === 'horizontal') {
          xAxisGroup.selectAll('.tick')
            .append('line')
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', 0)
            .attr('y2', -6)
            .attr('stroke', axisColor)
            .attr('opacity', axisOpacity);
        }
      }
    }

    if (showYAxis) {
      // For horizontal orientation with negative values, position Y-axis at x=0
      const yAxisPosition = orientation === 'horizontal' ? xScale(0) : 0;
      const yAxisGroup = g.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${yAxisPosition},0)`)
        .call(yAxis);

      yAxisGroup.selectAll('text')
        .attr('font-family', axisFont)
        .attr('font-size', yAxisFontSize)
        .attr('font-weight', axisWeight)
        // Vertical orientation: Y-axis shows values (affected by axis color)
        // Horizontal orientation: Y-axis shows categories (not affected by axis color)
        .attr('fill', orientation === 'vertical' ? themeColors.axisValueLabelColor : themeColors.categoryLabelColor)
        .attr('opacity', showYAxisLabels ? axisOpacity : 0) // Hide labels if toggle is off
        .attr('dx', '-5px'); // Add 5px spacing from axis line (labels appear to the left)

      // Make category labels bold if they have emphasized bars (works for both grouped and stacked modes)
      if (emphasizedBars && emphasizedBars.length > 0 && orientation === 'horizontal') {
        categories.forEach((category) => {
          // Check if any bar in this category is emphasized
          const hasEmphasizedBar = emphasizedBars.some(barId => barId.startsWith(`${category}-`));

          if (hasEmphasizedBar) {
            yAxisGroup.selectAll('.tick')
              .filter((d) => d === category)
              .select('text')
              .attr('font-weight', 700);
          }
        });
      }

      // Style axis lines - hide domain line if thickness is 0
      yAxisGroup.selectAll('.tick line')
        .attr('stroke', themeColors.axisLineColor)
        .attr('opacity', axisOpacity);

      yAxisGroup.select('.domain')
        .attr('stroke', themeColors.axisLineColor)
        .attr('stroke-width', yAxisLineThickness)
        .attr('opacity', yAxisLineThickness > 0 ? axisOpacity : 0);

      // Handle cross tick type for major ticks
      if (axisMajorTickType === 'cross') {
        const yMajorTicks = orientation === 'vertical' ? yTicks : (yScale.domain ? yScale.domain() : []);
        if (orientation === 'vertical') {
          yAxisGroup.selectAll('.tick')
            .append('line')
            .attr('x1', 0)
            .attr('x2', -6)
            .attr('y1', 0)
            .attr('y2', 0)
            .attr('stroke', axisColor)
            .attr('opacity', axisOpacity);
        }
      }
    }

    // Draw minor ticks
    if (orientation === 'vertical' && yMinorTicks && yMinorTicks.length > 0) {
      const yMinorTickGroup = g.append('g')
        .attr('class', 'y-minor-ticks');

      yMinorTicks.forEach(tickValue => {
        const y = yScale(tickValue);
        const line = yMinorTickGroup.append('line')
          .attr('x1', 0)
          .attr('x2', axisMinorTickType === 'cross' ? -minorTickSize : minorTickSize)
          .attr('y1', y)
          .attr('y2', y)
          .attr('stroke', axisColor)
          .attr('opacity', axisOpacity);

        // Add second line for cross type
        if (axisMinorTickType === 'cross') {
          yMinorTickGroup.append('line')
            .attr('x1', 0)
            .attr('x2', minorTickSize)
            .attr('y1', y)
            .attr('y2', y)
            .attr('stroke', axisColor)
            .attr('opacity', axisOpacity);
        }
      });
    }

    if (orientation === 'horizontal' && xMinorTicks && xMinorTicks.length > 0) {
      const xMinorTickGroup = g.append('g')
        .attr('class', 'x-minor-ticks')
        .attr('transform', `translate(0,${innerHeight})`);

      xMinorTicks.forEach(tickValue => {
        const x = xScale(tickValue);
        const line = xMinorTickGroup.append('line')
          .attr('x1', x)
          .attr('x2', x)
          .attr('y1', 0)
          .attr('y2', axisMinorTickType === 'cross' ? -minorTickSize : minorTickSize)
          .attr('stroke', axisColor)
          .attr('opacity', axisOpacity);

        // Add second line for cross type
        if (axisMinorTickType === 'cross') {
          xMinorTickGroup.append('line')
            .attr('x1', x)
            .attr('x2', x)
            .attr('y1', 0)
            .attr('y2', minorTickSize)
            .attr('stroke', axisColor)
            .attr('opacity', axisOpacity);
        }
      });
    }

    // Render Axis Label (if provided)
    if (axisLabel) {
      if (orientation === 'vertical') {
        // Vertical orientation: label appears horizontally to the right of Y-axis, inline with top value
        svg
          .append('text')
          .attr('x', dynamicMarginLeft + 5)
          .attr('y', marginTop + headerHeight)
          .attr('text-anchor', 'start')
          .attr('dy', '0.32em')
          .attr('font-family', axisFont)
          .attr('font-size', axisLabelFontSize)
          .attr('font-weight', 400)
          .attr('fill', themeColors.axisValueLabelColor)
          .text(axisLabel);
      } else {
        // Horizontal orientation: label appears horizontally below the last value, centered with it
        const maxTickValue = xScale.domain()[1];
        svg
          .append('text')
          .attr('x', dynamicMarginLeft + xScale(maxTickValue))
          .attr('y', marginTop + headerHeight + innerHeight + 40)
          .attr('text-anchor', 'middle')
          .attr('dy', '0.71em')
          .attr('font-family', axisFont)
          .attr('font-size', axisLabelFontSize)
          .attr('font-weight', 400)
          .attr('fill', themeColors.axisValueLabelColor)
          .text(axisLabel);
      }
    }

    // Render Percent Change Brackets
    if (percentChangeEnabled && selectedBarsForComparison.length >= 2) {
      // Build comparison pairs (every 2 clicks = 1 pair)
      const pairs = [];
      for (let i = 0; i < selectedBarsForComparison.length - 1; i += 2) {
        pairs.push({
          first: selectedBarsForComparison[i],
          second: selectedBarsForComparison[i + 1]
        });
      }

      pairs.forEach(pair => {
        const { first, second } = pair;
        const percentChange = ((second.value - first.value) / first.value) * 100;
        const isDecrease = percentChange < 0;

        // Format label based on settings
        const percentSign = percentChange >= 0 ? '+' : '';
        let label = `${percentSign}${percentChange.toFixed(1)}%`;
        if (percentChangeLabelFormat === 'percent-volume') {
          const volumeDiff = second.value - first.value;
          const volumeSign = volumeDiff >= 0 ? '+' : '';
          const formattedVolume = formatValue(Math.abs(volumeDiff));
          label = `${volumeSign}${formattedVolume} (${percentSign}${percentChange.toFixed(1)}%)`;
        }

        if (orientation === 'horizontal') {
          // For horizontal bars, draw bracket from RIGHT SIDE of label positions
          const y1 = first.labelY; // Y position of first bar's label
          const y2 = second.labelY; // Y position of second bar's label

          // Calculate the right edge of each label (approximate based on text width)
          // For horizontal bars, labels are positioned at labelX with text-anchor "start"
          // So we need to add the approximate text width to get the right edge
          const labelText1 = formatValue(first.value);
          const labelText2 = formatValue(second.value);
          // Rough estimate: each character is about 0.6 * fontSize pixels wide
          const estimatedWidth1 = labelText1.length * valueFontSize * 0.6;
          const estimatedWidth2 = labelText2.length * valueFontSize * 0.6;
          const labelSpacing = 10; // Spacing between label and bracket
          const x1 = first.labelX + estimatedWidth1 + labelSpacing; // Right edge of first label + spacing
          const x2 = second.labelX + estimatedWidth2 + labelSpacing; // Right edge of second label + spacing

          // Calculate bracket extension based on slider (0-100%)
          // 100% = full extension to chart edge, 0% = minimal extension
          const maxExtension = chartWidth - Math.max(x1, x2);
          const bracketExtension = maxExtension * (percentChangeBracketDistance / 100);
          const bracketX = Math.max(x1, x2) + bracketExtension;

          // Draw bracket line
          const bracketGroup = g.append('g').attr('class', 'percent-change-bracket');

          // Horizontal line from RIGHT EDGE of first label to right edge of chart
          bracketGroup.append('line')
            .attr('x1', x1)
            .attr('y1', y1)
            .attr('x2', bracketX)
            .attr('y2', y1)
            .attr('stroke', themeColors.emphasisColor)
            .attr('stroke-width', 2);

          // Vertical line connecting the two horizontal lines
          bracketGroup.append('line')
            .attr('x1', bracketX)
            .attr('y1', y1)
            .attr('x2', bracketX)
            .attr('y2', y2)
            .attr('stroke', themeColors.emphasisColor)
            .attr('stroke-width', 2);

          // Horizontal line from right edge back to RIGHT EDGE of second label
          bracketGroup.append('line')
            .attr('x1', bracketX)
            .attr('y1', y2)
            .attr('x2', x2)
            .attr('y2', y2)
            .attr('stroke', themeColors.emphasisColor)
            .attr('stroke-width', 2);

          // Arrow pointing to second bar label (with spacing)
          const arrowSize = 6;
          bracketGroup.append('polygon')
            .attr('points', `
              ${x2},${y2}
              ${x2 + arrowSize},${y2 - arrowSize}
              ${x2 + arrowSize},${y2 + arrowSize}
            `)
            .attr('fill', themeColors.emphasisColor);

          // Label on the vertical connecting line
          const labelY = (y1 + y2) / 2;
          // Check if there's enough space to the right of the bracket
          const labelWidth = label.length * valueFontSize * 0.6; // Estimate label width
          const spaceToRight = (dynamicMarginLeft + innerWidth + marginRight) - (dynamicMarginLeft + bracketX);
          const hasSpaceOnRight = spaceToRight > labelWidth + 20; // 20px padding

          svg.append('text')
            .attr('x', dynamicMarginLeft + bracketX + (hasSpaceOnRight ? 10 : -10))
            .attr('y', marginTop + headerHeight + labelY)
            .attr('dy', '0.35em')
            .attr('text-anchor', hasSpaceOnRight ? 'start' : 'end')
            .attr('font-family', fontFamily)
            .attr('font-size', valueFontSize)
            .attr('font-weight', 700)
            .attr('fill', themeColors.emphasisColor)
            .text(label);

        } else {
          // For vertical bars, draw bracket from TOP SIDE of label positions
          const x1 = first.labelX; // X position of first bar's label
          const x2 = second.labelX; // X position of second bar's label

          // For vertical bars, labels are above the bar with y position at baseline
          // The TOP of the label is approximately fontSize pixels above the baseline
          const labelSpacing = 10; // Spacing between label and bracket
          const y1 = first.labelY - valueFontSize - labelSpacing; // Top edge of first label - spacing
          const y2 = second.labelY - valueFontSize - labelSpacing; // Top edge of second label - spacing

          // Calculate bracket extension based on slider (0-100%)
          // 100% = full extension to chart edge, 0% = minimal extension
          const minY = Math.min(y1, y2);
          const maxExtension = minY; // Distance from label top to chart top
          const bracketExtension = maxExtension * (percentChangeBracketDistance / 100);
          const bracketY = minY - bracketExtension;

          // Draw bracket line
          const bracketGroup = g.append('g').attr('class', 'percent-change-bracket');

          // Vertical line from TOP EDGE of first label to top edge of chart
          bracketGroup.append('line')
            .attr('x1', x1)
            .attr('y1', y1)
            .attr('x2', x1)
            .attr('y2', bracketY)
            .attr('stroke', themeColors.emphasisColor)
            .attr('stroke-width', 2);

          // Horizontal line connecting the two vertical lines
          bracketGroup.append('line')
            .attr('x1', x1)
            .attr('y1', bracketY)
            .attr('x2', x2)
            .attr('y2', bracketY)
            .attr('stroke', themeColors.emphasisColor)
            .attr('stroke-width', 2);

          // Vertical line from top edge back down to TOP EDGE of second label
          bracketGroup.append('line')
            .attr('x1', x2)
            .attr('y1', bracketY)
            .attr('x2', x2)
            .attr('y2', y2)
            .attr('stroke', themeColors.emphasisColor)
            .attr('stroke-width', 2);

          // Arrow pointing to second bar label
          const arrowSize = 6;
          bracketGroup.append('polygon')
            .attr('points', `
              ${x2},${y2}
              ${x2 - arrowSize},${y2 - arrowSize}
              ${x2 + arrowSize},${y2 - arrowSize}
            `)
            .attr('fill', themeColors.emphasisColor);

          // Label on the horizontal connecting line
          const labelX = (x1 + x2) / 2;
          // Check if there's enough space above the bracket
          const spaceAbove = marginTop + headerHeight + bracketY;
          const hasSpaceAbove = spaceAbove > valueFontSize + 20; // Need font size + 20px padding

          svg.append('text')
            .attr('x', dynamicMarginLeft + labelX)
            .attr('y', marginTop + headerHeight + bracketY + (hasSpaceAbove ? -10 : 20))
            .attr('text-anchor', 'middle')
            .attr('font-family', fontFamily)
            .attr('font-size', valueFontSize)
            .attr('font-weight', 700)
            .attr('fill', themeColors.emphasisColor)
            .text(label);
        }
      });
    }

    // Render Legend (if labelMode is 'legend' and position is 'below' and showValueLabels is true and showPeriodLabels is true)
    if (showPeriodLabels && showValueLabels && labelMode === 'legend' && legendPosition === 'below') {
      // Position legend below the chart with proper spacing
      // Chart ends at: marginTop + headerHeight + innerHeight
      // Add space for X-axis labels (35px) + spacing (15px) = 50px
      const legendY = marginTop + headerHeight + innerHeight + 50;
      const legendItemWidth = 120;
      const legendItemSpacing = 20;
      const totalLegendWidth = periods.length * legendItemWidth + (periods.length - 1) * legendItemSpacing;
      const legendStartX = (width - totalLegendWidth) / 2;

      periods.forEach((period, i) => {
        const x = legendStartX + i * (legendItemWidth + legendItemSpacing);
        const color = colorScheme[i % colorScheme.length];

        // Color swatch
        svg
          .append('rect')
          .attr('x', x)
          .attr('y', legendY)
          .attr('width', 16)
          .attr('height', 16)
          .attr('fill', color)
          .attr('rx', 2);

        // Period label
        svg
          .append('text')
          .attr('x', x + 22)
          .attr('y', legendY + 8)
          .attr('dy', '0.35em')
          .attr('font-family', fontFamily)
          .attr('font-size', '14px')
          .attr('font-weight', '500')
          .attr('fill', themeColors.legendTextColor)
          .text(period);
      });
    }

    // Add watermark/attribution for free tier users
    if (styleSettings.userTier !== 'pro') {
      const watermarkText = 'Made with Find&Tell | Charts for Data Stories™ | FindandTell.co';
      const watermarkFontSize = 14; // Match homepage text-sm

      // Always position watermark from the bottom of SVG to avoid clipping
      const watermarkY = height - 8; // 8px from bottom edge

      // Add clickable link
      const watermarkLink = svg
        .append('a')
        .attr('href', 'https://findandtell.co')
        .attr('target', '_blank')
        .attr('rel', 'noopener noreferrer');

      watermarkLink
        .append('text')
        .attr('x', dimensions.width / 2)
        .attr('y', watermarkY)
        .attr('text-anchor', 'middle')
        .attr('font-family', fontFamily)
        .attr('font-size', watermarkFontSize + 'px')
        .attr('font-weight', '500') // Medium weight to match homepage
        .attr('fill', darkMode ? '#60a5fa' : '#1e3a8a') // Blue-400 in dark mode, Blue-900 in light mode
        .attr('opacity', 1.0) // Fully opaque like homepage
        .style('cursor', 'pointer')
        .text(watermarkText)
        .on('mouseover', function() {
          d3.select(this).attr('fill', '#0891b2'); // Cyan-600 on hover
        })
        .on('mouseout', function() {
          d3.select(this).attr('fill', darkMode ? '#60a5fa' : '#1e3a8a'); // Back to original color
        });
    }

  }, [data, periodNames, dimensions, orientation, barMode, colorScheme, styleSettings, selectedBarsForComparison, percentChangeEnabled, percentChangeLabelFormat, percentChangeBracketDistance]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ display: 'block' }}
      />
    </div>
  );
};

export default React.memo(BarChart);
