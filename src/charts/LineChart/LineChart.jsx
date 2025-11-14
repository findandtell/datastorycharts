import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { format as formatDate } from 'date-fns';
import { comparisonPalettes } from '../../shared/design-system/colorPalettes';
import { getLineColor, formatNumber, defaultStyleSettings, timeScaleFormats } from './lineChartDefaults';
import { aggregateData, getHierarchicalLabels, getISOWeek, getQuarter } from '../../shared/utils/timeAggregation';

/**
 * LineChart Component
 *
 * A comprehensive line chart for time-series data visualization
 *
 * Features:
 * - Multiple metrics/lines
 * - Time-series focused with different scales
 * - Line styling (thickness, style, smoothing)
 * - Point markers with customization
 * - Area fill with gradient options
 * - Grid lines and axes
 * - Interactive tooltips and emphasis
 * - Direct labels and legends
 * - Moving averages and baselines
 * - Percent change brackets
 */
const LineChart = ({ data, metricNames, styleSettings = {}, onLineClick, onPointClick, onMetricClick, onLabelDrag }) => {
  const svgRef = useRef(null);
  const [hoveredMetric, setHoveredMetric] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [debouncedStyleSettings, setDebouncedStyleSettings] = useState(styleSettings);

  // Debounce style settings to reduce re-renders with large datasets
  // This prevents the expensive D3 re-render from happening on every slider movement
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedStyleSettings(styleSettings);
    }, 100); // 100ms debounce - balances responsiveness with performance

    return () => clearTimeout(timer);
  }, [styleSettings]);

  // Memoize date format detection to avoid testing all parsers for every row
  const detectedDateFormat = useMemo(() => {
    if (!data || data.length === 0) return null;

    const dateField = styleSettings?.dateField || 'date';
    const sampleDate = data[0]?.[dateField] || data[0]?.date;
    if (!sampleDate) return null;

    const parsers = [
      { format: '%Y-%m-%d', parser: d3.timeParse('%Y-%m-%d') },
      { format: '%m/%d/%Y', parser: d3.timeParse('%m/%d/%Y') },
      { format: '%d/%m/%Y', parser: d3.timeParse('%d/%m/%Y') },
      { format: '%b %d, %Y', parser: d3.timeParse('%b %d, %Y') },
      { format: '%B %d, %Y', parser: d3.timeParse('%B %d, %Y') },
      { format: '%Y-%m', parser: d3.timeParse('%Y-%m') },
      { format: '%Y', parser: d3.timeParse('%Y') },
      { format: '%Y-W%U', parser: d3.timeParse('%Y-W%U') },
      { format: '%Y-%m-%d %H', parser: d3.timeParse('%Y-%m-%d %H') },
      { format: '%m-%d-%Y', parser: d3.timeParse('%m-%d-%Y') },
      { format: '%d-%m-%Y', parser: d3.timeParse('%d-%m-%Y') },
    ];

    // Test each parser on the first date value
    for (const { format, parser } of parsers) {
      const parsed = parser(sampleDate);
      if (parsed && !isNaN(parsed.getTime())) {
        return { format, parser };
      }
    }

    // Fallback: check for ISO format
    if (/^\d{4}-\d{2}-\d{2}$/.test(sampleDate)) {
      return { format: 'iso', parser: (d) => new Date(d + 'T00:00:00') };
    }

    return { format: 'native', parser: (d) => new Date(d) };
  }, [data, styleSettings?.dateField]);

  // PERFORMANCE OPTIMIZATION: Memoize data aggregation for large datasets
  // With 730+ days of data, aggregation is expensive and shouldn't run on every render
  const processedData = useMemo(() => {
    const aggregationLevel = debouncedStyleSettings?.aggregationLevel;
    const shouldAggregate = aggregationLevel &&
                           aggregationLevel !== 'day' &&
                           data &&
                           data.length > 0;

    if (!shouldAggregate) {
      return data;
    }

    try {
      return aggregateData(
        data,
        debouncedStyleSettings?.dateField || 'date',
        metricNames,
        aggregationLevel,
        debouncedStyleSettings?.aggregationMethod || 'sum',
        debouncedStyleSettings?.fiscalYearStartMonth || 1
      );
    } catch (error) {
      console.warn('Aggregation failed, using original data:', error);
      return data;
    }
  }, [
    data,
    metricNames,
    debouncedStyleSettings?.aggregationLevel,
    debouncedStyleSettings?.aggregationMethod,
    debouncedStyleSettings?.fiscalYearStartMonth,
    debouncedStyleSettings?.dateField,
  ]);

  // Convert axis color brightness (0-100) to hex color at component level
  // 0 = black, 50 = grey, 100 = white
  const computedAxisColor = useMemo(() => {
    const axisColorBrightness = debouncedStyleSettings?.axisColorBrightness ?? 0;
    const brightness = Math.round((axisColorBrightness / 100) * 255);
    const hex = brightness.toString(16).padStart(2, '0');
    return `#${hex}${hex}${hex}`;
  }, [debouncedStyleSettings?.axisColorBrightness]);

  // Define theme colors at component level (NOT inside useEffect)
  const themeColors = useMemo(() => {
    const darkMode = debouncedStyleSettings?.darkMode || false;
    const gridLineColor = debouncedStyleSettings?.gridLineColor || '#e5e7eb';

    return {
      titleColor: darkMode ? '#f9fafb' : '#111827',
      subtitleColor: darkMode ? '#d1d5db' : '#6b7280',
      // Axis value labels (Y-axis numbers) - affected by axis color slider
      axisValueLabelColor: computedAxisColor,
      // Category labels (X-axis dates/times) - NOT affected by axis color slider
      categoryLabelColor: darkMode ? '#e5e7eb' : '#374151',
      // Axis lines, ticks, and gridlines - affected by axis color slider
      axisLineColor: computedAxisColor,
      gridColor: darkMode ? '#4b5563' : gridLineColor,
    };
  }, [debouncedStyleSettings?.darkMode, debouncedStyleSettings?.gridLineColor, computedAxisColor]);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) {
      return;
    }

    // Clear previous render
    d3.select(svgRef.current).selectAll('*').remove();

    // Merge provided settings with defaults
    // Using debounced settings for better performance with large datasets
    const settings = { ...defaultStyleSettings, ...debouncedStyleSettings };

    // Add extra canvas height for watermark margin area if user is on free tier
    // This extends the SVG canvas to create dedicated space for the watermark
    const watermarkMarginHeight = settings.userTier !== 'pro' ? 50 : 0;

    const {
      width,
      height,
      marginTop,
      marginRight,
      marginBottom,
      marginLeft,
      backgroundColor,
      darkMode,
      fontFamily,
      titleFontSize,
      subtitleFontSize,
      titleAlignment,
      // Line styling
      lineThickness,
      lineStyle,
      lineOpacity,
      smoothLines,
      lineSaturation,
      // Points
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
      // Emphasis
      emphasizedLines,
      emphasizedLineThickness,
      emphasizedPointSize,
      // Labels
      compactNumbers,
      showDirectLabels,
      labelFontSize,
      directLabelFontSize,
      // Axes
      showXAxis,
      showYAxis,
      xAxisLineThickness = 1,
      yAxisLineThickness = 1,
      axisColorBrightness = 0, // 0=black, 50=grey, 100=white
      showXAxisLabels = true,
      showYAxisLabels = true,
      xAxisLabelRotation,
      yAxisFormat,
      xAxisFontSize,
      xAxisSecondaryFontSize,
      yAxisFontSize,
      axisLabel,
      axisLabelFontSize,
      // Axis bounds and units
      axisMinimum,
      axisMinimumAuto,
      axisMaximum,
      axisMaximumAuto,
      axisMajorUnit,
      axisMajorUnitAuto,
      axisMinorUnit,
      axisMinorUnitAuto,
      calculatedAxisMinimum,
      calculatedAxisMaximum,
      calculatedAxisMajorUnit,
      // Tick marks
      axisMajorTickType,
      axisMinorTickType,
      // Grid
      showGridLines,
      gridDirection,
      gridLineColor,
      gridLineStyle,
      gridLineOpacity,
      showHorizontalGridlines,
      showVerticalGridlines,
      compactAxisNumbers,
      // Number formatting (Labels)
      valuePrefix,
      valueSuffix,
      valueDecimalPlaces,
      valueFormat,
      // Number formatting (Axis)
      axisValuePrefix,
      axisValueSuffix,
      axisValueDecimalPlaces,
      axisValueFormat,
      // Legend
      showLegend,
      legendPosition,
      legendFontSize,
      // Time aggregation
      aggregationLevel,
      aggregationMethod,
      fiscalYearStartMonth,
      xAxisTimeGrouping,
      xAxisLabelLevels,
      dateRangeFilter,
      dateField,
      xAxisPrimaryLabel,
      xAxisSecondaryLabel,
      dateFormatPreset,
      dateFormatCustom,
      // Emphasis
      emphasizedPoints,
      emphasizedMetric,
      emphasisLabelPosition,
      emphasisLabelFontSize,
      showEmphasisDate,
      showEmphasisVerticalLine,
      emphasisCompactNumbers,
      emphasisValuePrefix,
      emphasisValueSuffix,
      emphasisDecimalPlaces,
      // Sum labels (area charts)
      showSumLabels,
      sumLabelPosition,
      sumLabelFontSize,
    } = settings;

    // Calculate dynamic right margin for direct labels
    let calculatedMarginRight = marginRight;
    if (showDirectLabels && metricNames && metricNames.length > 0) {
      // Find the longest metric name
      const longestMetric = metricNames.reduce((longest, current) =>
        current.length > longest.length ? current : longest
      , '');

      // Estimate text width: roughly 0.6 * fontSize per character for bold text
      const fontSize = directLabelFontSize || 14;
      const estimatedTextWidth = longestMetric.length * fontSize * 0.6;

      // Add spacing (10px offset from line end + text width + 20px buffer)
      const requiredMargin = 10 + estimatedTextWidth + 20;

      // Use the larger of the default margin or calculated margin
      calculatedMarginRight = Math.max(marginRight, requiredMargin);
    }

    // Use themeColors that were memoized at component level
    // (computedAxisColor and themeColors are now defined outside useEffect)

    // Create SVG with extended height for watermark margin area
    const actualHeight = height + watermarkMarginHeight;
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', actualHeight)
      .style('background-color', backgroundColor);

    // Calculate title and subtitle heights
    const titleHeight = settings.title ? titleFontSize : 0;
    const subtitleHeight = settings.subtitle ? subtitleFontSize : 0;
    const titleToSubtitleGap = settings.title && settings.subtitle ? 5 : 0;
    const headerToChartGap = (settings.title || settings.subtitle) ? 20 : 0;
    const headerHeight = titleHeight + titleToSubtitleGap + subtitleHeight + headerToChartGap;

    // Render Title
    if (settings.title) {
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
        .text(settings.title);
    }

    // Render Subtitle
    if (settings.subtitle) {
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
        .text(settings.subtitle);
    }

    // Create chart group
    const chartGroup = svg
      .append('g')
      .attr('transform', `translate(${marginLeft},${marginTop + headerHeight})`);

    const chartWidth = width - marginLeft - calculatedMarginRight;
    // Chart height uses original height (watermark goes in extended margin area)
    const chartHeight = height - marginTop - marginBottom - headerHeight;

    // Data aggregation is now memoized outside useEffect for better performance
    // (see useMemo above for processedData)

    // Parse dates and prepare data
    // Use the appropriate date parser based on timeScale
    const timeFormat = timeScaleFormats[settings.timeScale] || timeScaleFormats.day;
    const formatTime = d3.timeFormat(timeFormat.format);

    // Use the detected date format for efficient parsing
    const parsedData = processedData
      .map(d => {
        const dateValue = d[dateField] || d.date;

        if (!dateValue) {
          console.warn('Row missing date value:', d);
          return null;
        }

        // Use the detected parser for fast parsing
        let parsed = null;
        if (detectedDateFormat) {
          parsed = detectedDateFormat.parser(dateValue);
        }

        // Fallback: handle edge cases
        if (!parsed || isNaN(parsed.getTime())) {
          // For YYYY-MM-DD format, append time to avoid timezone issues
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
            parsed = new Date(dateValue + 'T00:00:00');
          } else {
            parsed = new Date(dateValue);
          }
        }

        // Validate the parsed date
        if (!parsed || isNaN(parsed.getTime())) {
          console.warn('Could not parse date value:', dateValue);
          return null;
        }

        return {
          ...d,
          parsedDate: parsed,
        };
      })
      .filter(d => d !== null); // Remove rows with invalid dates

    // Apply date range filter if specified
    let filteredData = parsedData;
    if (dateRangeFilter && (dateRangeFilter[0] !== 0 || dateRangeFilter[1] !== 100)) {
      // Sort by date to ensure correct filtering
      const sortedData = [...parsedData].sort((a, b) => a.parsedDate - b.parsedDate);

      const totalPoints = sortedData.length;
      const startIndex = Math.floor((dateRangeFilter[0] / 100) * totalPoints);
      const endIndex = Math.ceil((dateRangeFilter[1] / 100) * totalPoints);

      filteredData = sortedData.slice(startIndex, endIndex);
    }

    // Calculate sums for each metric (for sum labels)
    const metricSums = showSumLabels ? metricNames.reduce((sums, metric) => {
      const sum = filteredData.reduce((total, d) => total + (d[metric] || 0), 0);
      sums[metric] = sum;
      return sums;
    }, {}) : {};

    // Get all values for Y scale
    // For stacked areas, we need to use cumulative sums instead of individual values
    const allValues = (stackAreas && showAreaFill)
      ? filteredData.map(d => {
          // Sum all metric values at this data point
          return metricNames.reduce((sum, metric) => sum + (d[metric] || 0), 0);
        })
      : metricNames.flatMap(metric =>
          filteredData.map(d => d[metric]).filter(v => v != null)
        );

    // Create scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(filteredData, d => d.parsedDate))
      .range([0, chartWidth])
      .nice();

    // Calculate Y-axis domain based on bounds settings
    let yMin, yMax;

    if (axisMinimumAuto) {
      yMin = 0; // Always start at 0 for auto mode
      // Update calculated minimum (this would normally be passed back to ChartEditor)
      if (settings.setCalculatedAxisMinimum) {
        settings.setCalculatedAxisMinimum(yMin);
      }
    } else {
      yMin = axisMinimum;
    }

    if (axisMaximumAuto) {
      yMax = d3.max(allValues) || 100;
      // Update calculated maximum
      if (settings.setCalculatedAxisMaximum) {
        settings.setCalculatedAxisMaximum(yMax);
      }
    } else {
      yMax = axisMaximum;
    }

    const yScale = d3
      .scaleLinear()
      .domain([yMin, yMax])
      .range([chartHeight, 0]);

    // Only apply nice() if both bounds are auto
    if (axisMinimumAuto && axisMaximumAuto) {
      yScale.nice();
    }

    // Create line generator
    // PERFORMANCE: Auto-disable smooth lines for large datasets (expensive curve calculations)
    const shouldSmooth = smoothLines && parsedData.length <= 500;

    const lineGenerator = shouldSmooth
      ? d3.line()
          .x(d => xScale(d.parsedDate))
          .y((d, metric) => yScale(d[metric]))
          .curve(d3.curveCatmullRom.alpha(0.5))
      : d3.line()
          .x(d => xScale(d.parsedDate))
          .y((d, metric) => yScale(d[metric]));

    // Determine effective primary and secondary labels early so we can use them for gridlines
    const effectivePrimaryLabel = xAxisPrimaryLabel && xAxisPrimaryLabel !== 'auto'
      ? xAxisPrimaryLabel
      : aggregationLevel;

    const effectiveSecondaryLabel = xAxisSecondaryLabel && xAxisSecondaryLabel !== 'auto'
      ? xAxisSecondaryLabel
      : (function() {
          // Auto-determine secondary based on primary
          if (effectivePrimaryLabel === 'date') return 'month'; // Default for date
          if (effectivePrimaryLabel === 'day') return 'month';
          if (effectivePrimaryLabel === 'week') return 'month';
          if (effectivePrimaryLabel === 'month') return 'quarter';
          if (effectivePrimaryLabel === 'quarter') return 'year';
          return 'none';
        })();

    // Calculate ticks early for both gridlines and axis labels
    let xAxisTicks;
    if (effectivePrimaryLabel === 'date' || effectivePrimaryLabel === 'day' || effectivePrimaryLabel === 'week' || effectivePrimaryLabel === 'month') {
      // For date/day/week/month, generate ticks for every point in the dataset
      xAxisTicks = filteredData.map(d => d.parsedDate);
    } else {
      // Use D3's automatic tick generation for quarter/year
      xAxisTicks = xScale.ticks(6);
    }

    // Draw grid lines
    // Support both legacy gridDirection and new individual toggles
    const shouldShowHorizontal = showHorizontalGridlines !== undefined
      ? showHorizontalGridlines
      : (showGridLines && (gridDirection === 'horizontal' || gridDirection === 'both'));

    const shouldShowVertical = showVerticalGridlines !== undefined
      ? showVerticalGridlines
      : (showGridLines && (gridDirection === 'vertical' || gridDirection === 'both'));

    if (shouldShowHorizontal || shouldShowVertical) {
      const gridGroup = chartGroup.append('g').attr('class', 'grid');

      const strokeDashArray = gridLineStyle === 'dashed' ? '5,5' : gridLineStyle === 'dotted' ? '1,3' : 'none';

      // Horizontal grid lines
      if (shouldShowHorizontal) {
        gridGroup
          .selectAll('.grid-horizontal')
          .data(yScale.ticks())
          .enter()
          .append('line')
          .attr('class', 'grid-horizontal')
          .attr('x1', 0)
          .attr('x2', chartWidth)
          .attr('y1', d => yScale(d))
          .attr('y2', d => yScale(d))
          .attr('stroke', themeColors.gridColor)
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', strokeDashArray)
          .attr('opacity', gridLineOpacity);
      }

      // Vertical grid lines - use the same ticks as the X-axis labels
      if (shouldShowVertical) {
        gridGroup
          .selectAll('.grid-vertical')
          .data(xAxisTicks)
          .enter()
          .append('line')
          .attr('class', 'grid-vertical')
          .attr('x1', d => xScale(d))
          .attr('x2', d => xScale(d))
          .attr('y1', 0)
          .attr('y2', chartHeight)
          .attr('stroke', themeColors.gridColor)
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', strokeDashArray)
          .attr('opacity', gridLineOpacity);
      }
    }

    // Draw X axis with hierarchical labels
    if (showXAxis) {
      const xAxis = d3.axisBottom(xScale).ticks(6);

      const xAxisGroup = chartGroup
        .append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(xAxis);

      // Remove default tick labels and tick marks (we'll draw our own)
      xAxisGroup.selectAll('text').remove();
      xAxisGroup.selectAll('.tick line').remove();

      // Use the ticks calculated earlier (xAxisTicks)
      const ticks = xAxisTicks;

      // Helper function to get secondary label based on effective secondary label type
      const getSecondaryLabelForTick = (tick) => {
        const date = new Date(tick);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const year = date.getFullYear();

        if (effectiveSecondaryLabel === 'week') {
          const weekInfo = getISOWeek(tick);
          return `Week ${weekInfo.week}`;
        } else if (effectiveSecondaryLabel === 'month') {
          return `${monthNames[date.getMonth()]} ${String(year).slice(-2)}`;
        } else if (effectiveSecondaryLabel === 'quarter') {
          const quarterInfo = getQuarter(tick, fiscalYearStartMonth || 1);
          return `Q${quarterInfo.quarter} ${String(year).slice(-2)}`;
        } else if (effectiveSecondaryLabel === 'year') {
          return String(year);
        }
        return null;
      };

      // Group ticks by secondary label for background boxes
      const secondaryGroups = [];
      let currentGroup = null;

      ticks.forEach((tick, i) => {
        const xPos = xScale(tick);

        // Determine which label to use for grouping based on effective secondary label
        const groupLabel = effectiveSecondaryLabel !== 'none' ? getSecondaryLabelForTick(tick) : null;

        if (groupLabel !== currentGroup?.label) {
          // Start new group
          if (currentGroup) {
            // End previous group at midpoint between this tick and previous tick
            const midpoint = i > 0 ? (xPos + xScale(ticks[i - 1])) / 2 : xPos;
            currentGroup.endX = midpoint;
            secondaryGroups.push(currentGroup);
          }
          // Start new group at midpoint (or 0 for first group)
          const startX = i === 0 ? 0 : (i > 0 ? (xPos + xScale(ticks[i - 1])) / 2 : xPos);
          currentGroup = {
            label: groupLabel,
            startX: startX,
            ticks: [tick]
          };
        } else {
          currentGroup.ticks.push(tick);
        }
      });

      // Close last group - extend to end of chart or midpoint past last tick
      if (currentGroup) {
        const lastTick = ticks[ticks.length - 1];
        const lastXPos = xScale(lastTick);

        // Calculate spacing for extending past last tick
        const tickSpacing = ticks.length > 1 ? (xScale(ticks[ticks.length - 1]) - xScale(ticks[ticks.length - 2])) : 0;
        currentGroup.endX = Math.min(chartWidth, lastXPos + (tickSpacing / 2));
        secondaryGroups.push(currentGroup);
      }

      // Draw background boxes and secondary labels for groups
      // Only show if secondary label is not 'none' and label levels is 2
      if ((xAxisLabelLevels === 2 || xAxisLabelLevels === undefined) && effectiveSecondaryLabel !== 'none') {
        secondaryGroups.forEach((group, groupIdx) => {
          if (!group.label) return;

          const groupWidth = group.endX - group.startX;
          const groupCenterX = group.startX + groupWidth / 2;

          // Draw secondary label centered over the group
          xAxisGroup
            .append('text')
            .attr('x', groupCenterX)
            .attr('y', 66) // Increased from 61 for +5px spacing
            .attr('text-anchor', 'middle')
            .attr('font-family', fontFamily)
            .attr('font-size', `${xAxisSecondaryFontSize || 12}px`) // Use secondary font size
            .attr('font-weight', '400')
            .attr('fill', themeColors.categoryLabelColor)
            .attr('opacity', showXAxisLabels ? 1 : 0) // Hide if toggle is off
            .text(group.label);

          // Draw major tick mark at group boundary
          if (groupIdx > 0) {
            chartGroup
              .append('line')
              .attr('class', 'major-tick')
              .attr('x1', group.startX)
              .attr('x2', group.startX)
              .attr('y1', chartHeight)
              .attr('y2', chartHeight + 12)
              .attr('stroke', themeColors.axisLineColor)
              .attr('stroke-width', 2);
          }
        });

        // Add secondary prefix label (e.g., "Month") to the left of Y-axis based on effective secondary label
        let secondaryPrefixLabel = '';
        if (effectiveSecondaryLabel === 'week') {
          secondaryPrefixLabel = 'Week';
        } else if (effectiveSecondaryLabel === 'month') {
          secondaryPrefixLabel = 'Month';
        } else if (effectiveSecondaryLabel === 'quarter') {
          secondaryPrefixLabel = 'Quarter';
        } else if (effectiveSecondaryLabel === 'year') {
          secondaryPrefixLabel = 'Year';
        }

        if (secondaryPrefixLabel) {
          xAxisGroup
            .append('text')
            .attr('x', -10) // Position to the left of Y-axis
            .attr('y', 66) // Increased from 61 for +5px spacing
            .attr('text-anchor', 'end')
            .attr('font-family', fontFamily)
            .attr('font-size', `${xAxisSecondaryFontSize || 12}px`) // Use secondary font size
            .attr('font-weight', '400')
            .attr('fill', themeColors.categoryLabelColor)
            .attr('opacity', showXAxisLabels ? 1 : 0) // Hide if toggle is off
            .text(secondaryPrefixLabel);
        }
      }

      // Draw primary labels with minor tick marks
      ticks.forEach((tick, i) => {
        const labels = getHierarchicalLabels(
          tick,
          aggregationLevel || 'day',
          fiscalYearStartMonth || 1
        );

        const xPos = xScale(tick);

        // Determine label text - show just the number based on effective primary label
        let primaryLabel;
        const date = new Date(tick);

        if (effectivePrimaryLabel === 'date') {
          // For date level, format the actual date using date-fns
          const dateFormat = dateFormatCustom || dateFormatPreset || 'MM/dd/yy';
          try {
            primaryLabel = formatDate(date, dateFormat);
          } catch (error) {
            // Fallback to ISO format if custom format is invalid
            console.warn('Invalid date format:', dateFormat, error);
            primaryLabel = formatDate(date, 'MM/dd/yy');
          }
        } else if (effectivePrimaryLabel === 'day') {
          // For day level, show just the day number (1-31)
          primaryLabel = String(date.getDate());
        } else if (effectivePrimaryLabel === 'week') {
          // For week level, show ISO week number
          const weekInfo = getISOWeek(tick);
          primaryLabel = String(weekInfo.week);
        } else if (effectivePrimaryLabel === 'month') {
          // For month level, show month number (1-12)
          primaryLabel = String(date.getMonth() + 1);
        } else if (effectivePrimaryLabel === 'quarter') {
          // For quarter level, show quarter number (1-4)
          const quarterInfo = getQuarter(tick, fiscalYearStartMonth || 1);
          primaryLabel = String(quarterInfo.quarter);
        } else if (effectivePrimaryLabel === 'year') {
          // For year level, show the full year
          primaryLabel = String(date.getFullYear());
        } else {
          // Fallback
          primaryLabel = labels.primary;
        }

        // Minor tick mark for each primary label
        chartGroup
          .append('line')
          .attr('class', 'minor-tick')
          .attr('x1', xPos)
          .attr('x2', xPos)
          .attr('y1', chartHeight)
          .attr('y2', chartHeight + 6)
          .attr('stroke', themeColors.axisLineColor)
          .attr('stroke-width', 1)
          .style('opacity', 0.6);

        // Primary label (day number, week, month, etc.)
        xAxisGroup
          .append('text')
          .attr('x', xPos)
          .attr('y', 34) // Increased from 29 for more spacing (+5px)
          .attr('text-anchor', 'middle')
          .attr('font-family', fontFamily)
          .attr('font-size', `${xAxisFontSize || 12}px`)
          .attr('font-weight', '400')
          .attr('fill', themeColors.categoryLabelColor)
          .attr('opacity', showXAxisLabels ? 1 : 0) // Hide if toggle is off
          .text(primaryLabel);
      });

      // Add prefix label at the start (e.g., "Week", "Day", "Month") based on effective primary label
      let prefixLabel = '';
      if (effectivePrimaryLabel === 'date') {
        prefixLabel = 'Date';
      } else if (effectivePrimaryLabel === 'day') {
        prefixLabel = 'Day';
      } else if (effectivePrimaryLabel === 'week') {
        prefixLabel = 'Week';
      } else if (effectivePrimaryLabel === 'month') {
        prefixLabel = 'Month';
      } else if (effectivePrimaryLabel === 'quarter') {
        prefixLabel = 'Q';
      } else if (effectivePrimaryLabel === 'year') {
        prefixLabel = 'Year';
      }

      if (prefixLabel) {
        // Position prefix label to the left of Y-axis
        xAxisGroup
          .append('text')
          .attr('x', -10) // Position to the left of Y-axis (at x=0)
          .attr('y', 34) // Increased from 29 for +5px spacing
          .attr('text-anchor', 'end')
          .attr('font-family', fontFamily)
          .attr('font-size', `${xAxisFontSize || 12}px`)
          .attr('font-weight', '400') // Same weight as other labels
          .attr('fill', themeColors.categoryLabelColor)
          .attr('opacity', showXAxisLabels ? 1 : 0) // Hide if toggle is off
          .text(prefixLabel);
      }

      // Style axis lines - hide domain line if thickness is 0
      xAxisGroup
        .selectAll('.tick line')
        .attr('stroke', themeColors.axisLineColor);

      xAxisGroup
        .select('.domain')
        .attr('stroke', themeColors.axisLineColor)
        .attr('stroke-width', xAxisLineThickness)
        .attr('opacity', xAxisLineThickness > 0 ? 1 : 0);
    }

    // Draw Y axis
    if (showYAxis) {
      // Calculate number of major ticks based on settings
      let numMajorTicks;
      if (axisMajorUnitAuto) {
        numMajorTicks = 6; // Default
        // Calculate what the unit would be
        const calculatedUnit = (yMax - yMin) / numMajorTicks;
        if (settings.setCalculatedAxisMajorUnit) {
          settings.setCalculatedAxisMajorUnit(calculatedUnit);
        }
      } else {
        // User-specified major unit
        numMajorTicks = Math.max(1, Math.floor((yMax - yMin) / axisMajorUnit));
      }

      // Format number with all user settings (using Axis Number Styling)
      const formatYAxisNumber = (value) => {
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

          return `${axisValuePrefix || ''}${formattedValue}%${axisValueSuffix || ''}`;
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
        return `${axisValuePrefix || ''}${formattedValue}${axisValueSuffix || ''}`;
      };

      // Create Y axis with major ticks
      const yAxis = d3.axisLeft(yScale)
        .ticks(numMajorTicks)
        .tickFormat(formatYAxisNumber);

      // Remove default tick marks - we'll draw custom ones
      if (axisMajorTickType === 'none') {
        yAxis.tickSize(0);
      } else if (axisMajorTickType === 'inside') {
        yAxis.tickSize(6);
      } else if (axisMajorTickType === 'outside') {
        yAxis.tickSize(-6);
      } else if (axisMajorTickType === 'cross') {
        yAxis.tickSize(12);
      }

      const yAxisGroup = chartGroup
        .append('g')
        .attr('class', 'y-axis')
        .call(yAxis);

      // Style axis text with additional spacing
      yAxisGroup
        .selectAll('text')
        .attr('fill', themeColors.axisValueLabelColor) // Y-axis shows values
        .attr('font-family', fontFamily)
        .attr('font-size', `${yAxisFontSize || 12}px`)
        .attr('dx', '-5px') // Add 5px spacing between label and axis line
        .attr('opacity', showYAxisLabels ? 1 : 0); // Hide if toggle is off

      // Style axis lines - hide domain line if thickness is 0
      yAxisGroup
        .selectAll('.tick line')
        .attr('stroke', themeColors.axisLineColor);

      yAxisGroup
        .select('.domain')
        .attr('stroke', themeColors.axisLineColor)
        .attr('stroke-width', yAxisLineThickness)
        .attr('opacity', yAxisLineThickness > 0 ? 1 : 0);

      // Draw minor ticks if enabled
      if (axisMinorTickType !== 'none' && !axisMinorUnitAuto) {
        const minorTickValues = [];
        for (let value = yMin; value <= yMax; value += axisMinorUnit) {
          // Only add if not coinciding with a major tick
          const isMajorTick = yAxis.scale().ticks(numMajorTicks).some(
            majorValue => Math.abs(majorValue - value) < 0.001
          );
          if (!isMajorTick) {
            minorTickValues.push(value);
          }
        }

        const minorTickSize = axisMinorTickType === 'inside' ? 3 :
                              axisMinorTickType === 'outside' ? -3 :
                              axisMinorTickType === 'cross' ? 6 : 0;

        yAxisGroup.selectAll('.minor-tick')
          .data(minorTickValues)
          .enter()
          .append('line')
          .attr('class', 'minor-tick')
          .attr('x1', axisMinorTickType === 'cross' ? -3 : 0)
          .attr('x2', minorTickSize)
          .attr('y1', d => yScale(d))
          .attr('y2', d => yScale(d))
          .attr('stroke', themeColors.axisLineColor)
          .attr('stroke-width', 0.5)
          .style('opacity', 0.5);
      }

      // Add custom axis label if provided - positioned at top like Bar Chart
      if (axisLabel) {
        chartGroup
          .append('text')
          .attr('x', 10) // Moved right for more spacing from Y-axis
          .attr('y', 0)
          .attr('text-anchor', 'start')
          .attr('dy', '0.32em')
          .attr('font-family', fontFamily)
          .attr('font-size', `${axisLabelFontSize || 14}px`)
          .attr('font-weight', 400)
          .attr('fill', themeColors.axisValueLabelColor)
          .text(axisLabel);
      }
    }

    // Calculate stacked values if stacking is enabled
    // For stacked areas, we need to calculate cumulative values for each point
    const stackedData = stackAreas && showAreaFill ? filteredData.map(d => {
      const stackedPoint = { ...d };
      let cumulative = 0;
      metricNames.forEach(metric => {
        const value = d[metric] || 0;
        stackedPoint[`${metric}_y0`] = cumulative;
        cumulative += value;
        stackedPoint[`${metric}_y1`] = cumulative;
      });
      return stackedPoint;
    }) : null;

    // Draw lines and points for each metric
    metricNames.forEach((metric, i) => {
      const isEmphasized = emphasizedLines.includes(metric);
      const isMetricEmphasized = emphasizedMetric === metric;
      const shouldDesaturate = emphasizedMetric && emphasizedMetric !== metric;

      let lineColor = getLineColor(metric, i, settings, comparisonPalettes);

      // Desaturate non-emphasized lines if a metric is emphasized
      if (shouldDesaturate) {
        // Convert to grayscale by reducing saturation
        const color = d3.color(lineColor);
        if (color) {
          const hsl = d3.hsl(color);
          hsl.s = hsl.s * 0.2; // Reduce saturation to 20%
          hsl.l = hsl.l * 0.9; // Slightly lighten
          lineColor = hsl.toString();
        }
      }

      // Filter out null/undefined values, and optionally zero values
      const metricData = filteredData.filter(d => {
        const value = d[metric];
        if (value == null) return false;
        if (excludeZeroValues && value === 0) return false;
        return true;
      });

      // Create area fill if enabled
      if (showAreaFill) {
        // Use stacked values if stacking is enabled, otherwise use baseline
        const dataForArea = stackAreas ? stackedData : metricData;

        const areaGenerator = d3.area()
          .x(d => xScale(d.parsedDate))
          .y0(d => stackAreas ? yScale(d[`${metric}_y0`]) : chartHeight)
          .y1(d => stackAreas ? yScale(d[`${metric}_y1`]) : yScale(d[metric]));

        if (smoothLines) {
          areaGenerator.curve(d3.curveCatmullRom.alpha(0.5));
        }

        // Create gradient for area if enabled
        if (areaGradient) {
          const gradientId = `area-gradient-${i}`;
          const gradient = svg
            .append('defs')
            .append('linearGradient')
            .attr('id', gradientId)
            .attr('x1', '0%')
            .attr('x2', '0%')
            .attr('y1', '0%')
            .attr('y2', '100%');

          gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', lineColor)
            .attr('stop-opacity', areaOpacity);

          gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', lineColor)
            .attr('stop-opacity', 0);

          chartGroup
            .append('path')
            .datum(dataForArea)
            .attr('class', `area-${i}`)
            .attr('d', areaGenerator)
            .attr('fill', `url(#${gradientId})`);
        } else {
          chartGroup
            .append('path')
            .datum(dataForArea)
            .attr('class', `area-${i}`)
            .attr('d', areaGenerator)
            .attr('fill', lineColor)
            .attr('opacity', areaOpacity);
        }
      }

      // Draw line
      // For stacked areas, lines follow the top of each stacked area
      const lineGen = stackAreas && showAreaFill
        ? lineGenerator.y(d => yScale(d[`${metric}_y1`]))
        : lineGenerator.y(d => yScale(d[metric]));
      const strokeDashArray = lineStyle === 'dashed' ? '8,4' : lineStyle === 'dotted' ? '2,4' : 'none';

      // Calculate line width: bold if metric is emphasized, normal otherwise
      const currentLineWidth = isMetricEmphasized
        ? emphasizedLineThickness
        : (isEmphasized ? emphasizedLineThickness : lineThickness);

      // Use stacked data for line if stacking is enabled, otherwise use metric data
      const dataForLine = (stackAreas && showAreaFill) ? stackedData : metricData;

      chartGroup
        .append('path')
        .datum(dataForLine)
        .attr('class', `line-${i}`)
        .attr('fill', 'none')
        .attr('stroke', lineColor)
        .attr('stroke-width', currentLineWidth)
        .attr('stroke-dasharray', strokeDashArray)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr('opacity', lineOpacity)
        .attr('d', lineGen)
        .style('cursor', 'pointer')
        .on('mouseenter', () => setHoveredMetric(metric))
        .on('mouseleave', () => setHoveredMetric(null))
        .on('click', () => onLineClick && onLineClick(metric, i));

      // Draw vertical lines for emphasized points (appears above lines, below points)
      if (showEmphasisVerticalLine && emphasizedPoints && emphasizedPoints.length > 0) {
        emphasizedPoints.forEach(emphPoint => {
          // Only draw for current metric
          if (emphPoint.metric !== metric) return;

          // Use filteredData (not metricData) because emphPoint.index is based on filteredData
          const matchingData = filteredData[emphPoint.index];
          if (matchingData && matchingData[metric] != null) {
            const x = xScale(matchingData.parsedDate);
            const y = yScale(matchingData[metric]);

            chartGroup
              .append('line')
              .attr('x1', x)
              .attr('x2', x)
              .attr('y1', chartHeight) // Start at X-axis (bottom)
              .attr('y2', y) // End at the point
              .attr('stroke', '#9ca3af') // Gray color
              .attr('stroke-width', 2)
              .attr('stroke-dasharray', 'none') // Solid line
              .attr('opacity', 0.7)
              .style('pointer-events', 'none'); // Don't interfere with interactions
          }
        });
      }

      // PERFORMANCE OPTIMIZATION: For large datasets, intelligently reduce rendered points
      // This dramatically improves performance while maintaining visual quality
      const isLargeDataset = metricData.length > 200;
      const isVeryLargeDataset = metricData.length > 500;

      // Auto-disable points for very large datasets (500+) to maximize performance
      const effectiveShowPoints = isVeryLargeDataset ? false : showPoints;

      // Use stacked data for points if stacking is enabled, otherwise use metric data
      const dataForPoints = (stackAreas && showAreaFill) ? stackedData : metricData;

      let pointsToShow;

      if (!effectiveShowPoints && !isEmphasized) {
        // Points disabled: only render emphasized points and optionally most recent point
        pointsToShow = dataForPoints
          .map((d, idx) => ({ ...d, _originalIdx: idx }))
          .filter((d, idx, arr) => {
            const isPointEmphasized = emphasizedPoints && emphasizedPoints.some(p =>
              p.metric === metric && p.index === d._originalIdx
            );
            // Include if emphasized OR if it's the last point and showMostRecentPoint is enabled
            const isLastPoint = idx === arr.length - 1;
            return isPointEmphasized || (showMostRecentPoint && isLastPoint);
          });
      } else if (isLargeDataset && !isEmphasized && effectiveShowPoints) {
        // Adaptive decimation: show fewer points for moderately large datasets
        const decimationFactor = dataForPoints.length > 500 ? 5 : 3;

        // Always keep first and last points, plus emphasized points
        pointsToShow = dataForPoints
          .map((d, idx) => ({ ...d, _originalIdx: idx }))
          .filter((d, idx, arr) => {
            // Keep first and last
            if (idx === 0 || idx === arr.length - 1) return true;

            // Keep emphasized points
            const isPointEmphasized = emphasizedPoints && emphasizedPoints.some(p =>
              p.metric === metric && p.index === d._originalIdx
            );
            if (isPointEmphasized) return true;

            // Keep last point if showMostRecentPoint is enabled
            if (showMostRecentPoint && idx === arr.length - 1) return true;

            // Keep every Nth point
            return idx % decimationFactor === 0;
          });
      } else {
        // Small dataset or emphasized line: render all points (or just last if showMostRecentPoint and points disabled)
        if (!effectiveShowPoints && showMostRecentPoint) {
          // Only show last point when points are disabled but showMostRecentPoint is enabled
          pointsToShow = dataForPoints
            .map((d, idx) => ({ ...d, _originalIdx: idx }))
            .filter((d, idx, arr) => idx === arr.length - 1);
        } else {
          pointsToShow = dataForPoints.map((d, idx) => ({ ...d, _originalIdx: idx }));
        }
      }

      // Create emphasis lookup Set for O(1) performance instead of O(n) .some() calls
      const emphasizedPointsSet = new Set(
        (emphasizedPoints || [])
          .filter(p => p.metric === metric)
          .map(p => p.index)
      );

      const circles = chartGroup
        .selectAll(`.point-${i}`)
        .data(pointsToShow)
        .enter()
        .append('circle')
        .attr('class', (d, idx) => `point-${i} point-${metric}-${idx}`)
        .attr('data-metric', metric)
        .attr('data-index', d => d._originalIdx)
        .attr('cx', d => xScale(d.parsedDate))
        .attr('cy', d => stackAreas && showAreaFill ? yScale(d[`${metric}_y1`]) : yScale(d[metric]))
        .attr('r', (d) => {
          // Use Set for O(1) lookup instead of O(n) .some()
          const isPointEmphasized = emphasizedPointsSet.has(d._originalIdx);
          const currentPointSize = isEmphasized ? emphasizedPointSize : pointSize;
          return isPointEmphasized ? currentPointSize + 1 : currentPointSize;
        })
        .attr('fill', (d) => {
          // Check if this point has a custom style (use find only for custom style check)
          const emphPoint = emphasizedPoints && emphasizedPoints.find(p =>
            p.metric === metric && p.index === d._originalIdx
          );

          // Use lineColor (which already has desaturation applied) for filled points
          if (emphPoint && emphPoint.customPointStyle) {
            // Use the custom style (toggled from global setting)
            return emphPoint.customPointStyle === 'filled' ? lineColor : 'white';
          } else {
            // Use global setting
            return pointStyle === 'filled' ? lineColor : 'white';
          }
        })
        .attr('stroke', lineColor)
        .attr('stroke-width', (d) => {
          // Check if this point has a custom style
          const emphPoint = emphasizedPoints && emphasizedPoints.find(p =>
            p.metric === metric && p.index === d._originalIdx
          );
          if (emphPoint && emphPoint.customPointStyle) {
            // Use the custom style's border width
            const baseWidth = emphPoint.customPointStyle === 'outlined' ? pointBorderWidth : 2;
            return baseWidth;
          }
          // Use Set lookup for emphasized check
          const isPointEmphasized = emphasizedPointsSet.has(d._originalIdx);
          const baseWidth = pointStyle === 'outlined' ? pointBorderWidth : 0;
          return isPointEmphasized ? Math.max(baseWidth, 2) : baseWidth;
        })
        .attr('opacity', (d, idx) => {
          // If showPoints is false (or auto-disabled for large datasets), hide non-emphasized points
          if (!effectiveShowPoints) {
            // Use Set for O(1) lookup instead of O(n) .some()
            const isPointEmphasized = emphasizedPointsSet.has(d._originalIdx);
            // Show point if it's emphasized OR if it's the last point and showMostRecentPoint is enabled
            const isLastPoint = d._originalIdx === dataForPoints.length - 1;
            return (isPointEmphasized || (showMostRecentPoint && isLastPoint)) ? 1 : 0;
          }
          return 1;
        })
        .style('cursor', isLargeDataset ? 'default' : 'pointer');

      // Add event listeners separately to properly capture index
      circles.each(function(d) {
        d3.select(this)
          .on('click', (event) => {
            event.stopPropagation();
            if (onPointClick) {
              onPointClick(metric, { ...d, _pointIndex: d._originalIdx });
            }
          });
      });

      // Draw emphasis labels for emphasized points
      if (emphasizedPoints && emphasizedPoints.length > 0) {
        emphasizedPoints.forEach(emphPoint => {
          // Only process points for the current metric
          if (emphPoint.metric !== metric) return;

          // Find the data point by index - use stacked data for stacked areas
          const dataForLabels = (stackAreas && showAreaFill) ? stackedData : metricData;
          const matchingData = dataForLabels[emphPoint.index];

          if (matchingData) {
            const x = xScale(matchingData.parsedDate);
            // For stacked areas, position label at the top (y1) of the stacked segment
            const y = (stackAreas && showAreaFill)
              ? yScale(matchingData[`${metric}_y1`])
              : yScale(matchingData[metric]);

            // Calculate offset to position label above the point without blocking it
            // If date is shown, need more space (metric + date + padding)
            // If no date, just metric + padding
            const labelHeight = showEmphasisDate ? emphasisLabelFontSize + (emphasisLabelFontSize - 2) + 2 : emphasisLabelFontSize;
            const padding = 8; // Extra padding above the point
            const defaultYOffset = emphasisLabelPosition === 'below' ? 20 : -(labelHeight + padding);

            const labelX = emphPoint.labelOffsetX !== undefined ? x + emphPoint.labelOffsetX : x;
            const labelY = emphPoint.labelOffsetY !== undefined ? y + emphPoint.labelOffsetY : y + defaultYOffset;

            // Format the value using emphasis-specific settings
            let value = matchingData[metric];
            let labelText;

            if (emphasisCompactNumbers) {
              // Use compact formatting with decimal control
              const absValue = Math.abs(value);
              const sign = value < 0 ? '-' : '';
              const decimalPlaces = emphasisDecimalPlaces ?? 1;

              if (absValue >= 1000000000) {
                labelText = `${sign}${(absValue / 1000000000).toFixed(decimalPlaces)}B`;
              } else if (absValue >= 1000000) {
                labelText = `${sign}${(absValue / 1000000).toFixed(decimalPlaces)}M`;
              } else if (absValue >= 1000) {
                labelText = `${sign}${(absValue / 1000).toFixed(decimalPlaces)}K`;
              } else {
                labelText = value.toLocaleString('en-US', {
                  minimumFractionDigits: emphasisDecimalPlaces ?? 0,
                  maximumFractionDigits: emphasisDecimalPlaces ?? 0
                });
              }
            } else {
              // Standard formatting with decimal places
              labelText = value.toLocaleString('en-US', {
                minimumFractionDigits: emphasisDecimalPlaces ?? 0,
                maximumFractionDigits: emphasisDecimalPlaces ?? 0
              });
            }

            // Add prefix and suffix
            labelText = `${emphasisValuePrefix || ''}${labelText}${emphasisValueSuffix || ''}`;

            // Create a group for the label so metric and date can be dragged together
            const labelGroup = chartGroup
              .append('g')
              .attr('transform', `translate(${labelX}, ${labelY})`)
              .style('cursor', 'move')
              .style('user-select', 'none');

            // Add metric value text
            labelGroup
              .append('text')
              .attr('x', 0)
              .attr('y', 0)
              .attr('text-anchor', 'middle')
              .attr('font-family', fontFamily)
              .attr('font-size', emphasisLabelFontSize)
              .attr('font-weight', '600')
              .attr('fill', darkMode ? '#f9fafb' : '#111827')
              .text(labelText);

            // Add date text below metric if enabled
            if (showEmphasisDate && matchingData.parsedDate) {
              // Use hierarchical labels for proper aggregation display (Week 1, Jan, Q1, etc.)
              const hierarchicalLabel = getHierarchicalLabels(
                matchingData.parsedDate,
                aggregationLevel || 'day',
                fiscalYearStartMonth || 1
              );
              const dateText = hierarchicalLabel.primary;

              labelGroup
                .append('text')
                .attr('x', 0)
                .attr('y', emphasisLabelFontSize + 2) // Position below metric text
                .attr('text-anchor', 'middle')
                .attr('font-family', fontFamily)
                .attr('font-size', emphasisLabelFontSize - 2) // 2px smaller
                .attr('font-weight', '400')
                .attr('fill', darkMode ? '#d1d5db' : '#6b7280')
                .text(dateText);
            }

            // Add drag behavior to the group
            const drag = d3.drag()
              .on('start', function(event) {
                d3.select(this).raise().attr('opacity', 0.7);
              })
              .on('drag', function(event) {
                d3.select(this)
                  .attr('transform', `translate(${event.x}, ${event.y})`);
              })
              .on('end', function(event) {
                d3.select(this).attr('opacity', 1);

                // Calculate and store the offset from the original point
                const newOffsetX = event.x - x;
                const newOffsetY = event.y - y;

                // Notify parent component to update the label position
                if (onLabelDrag) {
                  onLabelDrag(emphPoint.metric, emphPoint.index, newOffsetX, newOffsetY);
                }
              });

            labelGroup.call(drag);
          }
        });
      }

      // Draw direct labels at end of line
      if (showDirectLabels && metricData.length > 0) {
        // For stacked areas, use the stacked data for label positioning
        const dataForLabels = (stackAreas && showAreaFill) ? stackedData : metricData;
        const lastPoint = dataForLabels[dataForLabels.length - 1];
        const x = xScale(lastPoint.parsedDate);
        // For stacked areas, position label at the top (y1) of the stacked segment
        const y = (stackAreas && showAreaFill)
          ? yScale(lastPoint[`${metric}_y1`])
          : yScale(lastPoint[metric]);

        // Prepare label text - metric name plus optional sum
        let labelText = metric;
        if (showSumLabels && sumLabelPosition === 'direct') {
          const sum = metricSums[metric];
          const formattedSum = formatNumber(
            sum,
            compactNumbers,
            valuePrefix,
            valueSuffix,
            valueDecimalPlaces,
            valueFormat
          );
          labelText = `${metric}: ${formattedSum}`;
        }

        chartGroup
          .append('text')
          .attr('x', x + 10)
          .attr('y', y)
          .attr('dy', '0.35em')
          .attr('font-family', fontFamily)
          .attr('font-size', showSumLabels && sumLabelPosition === 'direct' ? (sumLabelFontSize || 14) : (directLabelFontSize || 14))
          .attr('font-weight', 700) // Always bold
          .attr('fill', lineColor)
          .text(labelText)
          .style('cursor', 'pointer')
          .on('click', function(event) {
            event.stopPropagation();
            if (onMetricClick) {
              onMetricClick(metric);
            }
          });
      }
    });

    // Draw sum labels in center of areas if enabled
    if (showSumLabels && sumLabelPosition === 'center' && (chartMode === 'area' || chartMode === 'area-stacked' || showAreaFill)) {
      metricNames.forEach((metric, i) => {
        const sum = metricSums[metric];
        const formattedSum = formatNumber(
          sum,
          compactNumbers,
          valuePrefix,
          valueSuffix,
          valueDecimalPlaces,
          valueFormat
        );

        // Calculate center X position (midpoint of the data range)
        const centerX = chartWidth / 2;

        // Calculate center Y position
        let centerY;
        if (stackAreas && showAreaFill) {
          // For stacked areas, calculate the average midpoint between y0 and y1 across all data points
          const avgMidpoint = stackedData.reduce((sum, d) => {
            const y0 = d[`${metric}_y0`] || 0;
            const y1 = d[`${metric}_y1`] || 0;
            const midpoint = (y0 + y1) / 2;
            return sum + midpoint;
          }, 0) / stackedData.length;
          centerY = yScale(avgMidpoint);
        } else {
          // For regular areas, use the average value
          const avgValue = sum / filteredData.length;
          centerY = yScale(avgValue);
        }

        const lineColor = getLineColor(metric, i, settings, comparisonPalettes);

        // Add semi-transparent background for better readability
        const textElement = chartGroup
          .append('text')
          .attr('x', centerX)
          .attr('y', centerY)
          .attr('text-anchor', 'middle')
          .attr('font-family', fontFamily)
          .attr('font-size', sumLabelFontSize || 14)
          .attr('font-weight', 700)
          .attr('fill', lineColor)
          .text(formattedSum);

        // Get text bounding box to create background
        const bbox = textElement.node().getBBox();

        // Insert background rectangle before text
        chartGroup
          .insert('rect', () => textElement.node())
          .attr('x', bbox.x - 4)
          .attr('y', bbox.y - 2)
          .attr('width', bbox.width + 8)
          .attr('height', bbox.height + 4)
          .attr('fill', backgroundColor)
          .attr('opacity', 0.85)
          .attr('rx', 3);
      });
    }

    // Draw legend if enabled
    if (showLegend && legendPosition === 'top') {
      const legendGroup = svg
        .append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${marginLeft},${marginTop + headerHeight - 30})`);

      const legendItemWidth = 120;
      metricNames.forEach((metric, i) => {
        const lineColor = getLineColor(metric, i, settings, comparisonPalettes);
        const x = i * legendItemWidth;

        // Create a group for each legend item so it's clickable as a unit
        const legendItem = legendGroup
          .append('g')
          .attr('transform', `translate(${x}, 0)`)
          .style('cursor', 'pointer')
          .on('click', function(event) {
            event.stopPropagation();
            if (onMetricClick) {
              onMetricClick(metric);
            }
          });

        // Legend line
        legendItem
          .append('line')
          .attr('x1', 0)
          .attr('x2', 20)
          .attr('y1', 0)
          .attr('y2', 0)
          .attr('stroke', lineColor)
          .attr('stroke-width', 2);

        // Legend text
        legendItem
          .append('text')
          .attr('x', 25)
          .attr('y', 0)
          .attr('dy', '0.35em')
          .attr('font-family', fontFamily)
          .attr('font-size', legendFontSize)
          .attr('fill', themeColors.titleColor)
          .text(metric);
      });
    }

    // Add watermark/attribution for free tier users
    if (settings.userTier !== 'pro') {
      const watermarkText = 'Made with Find&Tell | Charts for Data Stories™ | FindandTell.co';
      const watermarkFontSize = 14; // Match homepage text-sm
      // Position watermark in the dedicated margin area below the chart
      const watermarkY = height + (watermarkMarginHeight / 2) + 5;

      // Add clickable link
      const watermarkLink = svg
        .append('a')
        .attr('href', 'https://findandtell.co')
        .attr('target', '_blank')
        .attr('rel', 'noopener noreferrer');

      watermarkLink
        .append('text')
        .attr('x', width / 2)
        .attr('y', watermarkY)
        .attr('text-anchor', 'middle')
        .attr('font-family', fontFamily)
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

    // Cleanup function to remove all D3 event listeners
    return () => {
      if (svgRef.current) {
        d3.select(svgRef.current)
          .selectAll('*')
          .on('.drag', null)
          .on('click', null)
          .on('mouseenter', null)
          .on('mouseleave', null);
      }
    };
  }, [processedData, metricNames, debouncedStyleSettings, onLineClick, onPointClick, onMetricClick, onLabelDrag]);

  return (
    <div className="line-chart-container">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default React.memo(LineChart);
