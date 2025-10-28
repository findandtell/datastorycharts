import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { comparisonPalettes } from '../../shared/design-system/colorPalettes';

/**
 * BarChart Component
 * Displays data as rectangular bars with lengths proportional to values
 * Supports vertical/horizontal orientation and grouped/stacked modes
 */
const BarChart = ({ data, periodNames, styleSettings = {}, onBarClick }) => {
  const svgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

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
    colorPalette = 'vibrant',
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
    axisColor = '#000000',
    axisOpacity = 1,
    barPadding = 0.2,
    groupPadding = 0.3,
    barOpacity = 1,
    barBorderWidth = 0,
    barBorderColor = '#ffffff',
    chartHeight = 500,
    chartWidth = 600,
    marginTop = 40,
    marginRight = 40,
    marginBottom = 80,
    marginLeft = 80,
  } = styleSettings;

  // Get color scheme from comparison palettes or use custom colors
  const colorScheme = useMemo(() => {
    // Use custom colors only if palette is set to 'user'
    if (colorPalette === 'user' && customColors.length > 0) {
      return customColors;
    }
    // Otherwise use the selected palette
    return comparisonPalettes[colorPalette]?.colors || comparisonPalettes.vibrant.colors;
  }, [customColors, colorPalette]);

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

  // Main chart rendering
  useEffect(() => {
    if (!data || data.length === 0 || !periodNames || periodNames.length === 0 || dimensions.width === 0) {
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = dimensions.width;
    const height = dimensions.height;

    // Detect if this is grouped-stacked format (has Group and Period columns)
    const isGroupedStackedData = data.length > 0 && data[0].hasOwnProperty('Group') && data[0].hasOwnProperty('Period');

    // Extract categories and periods early for use in layout calculations
    let categories, periods, stackColumns;

    if (isGroupedStackedData && barMode === 'grouped-stacked') {
      // For grouped-stacked mode with Group/Period format
      // Groups become the X-axis categories
      const uniqueGroups = [...new Set(data.map(d => d.Group))];
      categories = uniqueGroups;

      // Periods are the time series that will be stacked
      periods = [...new Set(data.map(d => d.Period))];

      // Stack columns are the value columns (e.g., "Very Well", "Somewhat Well")
      const firstRow = data[0];
      stackColumns = Object.keys(firstRow).filter(key => key !== 'Group' && key !== 'Period');
    } else {
      // Regular format
      categories = data.map(d => d.Category || d.category || d.Stage || '');
      periods = periodNames;
      stackColumns = null;
    }

    // Calculate title and subtitle heights
    const titleHeight = title ? titleFontSize : 0;
    const subtitleHeight = subtitle ? subtitleFontSize : 0;
    const titleToSubtitleGap = title && subtitle ? 5 : 0;
    const headerToChartGap = (title || subtitle) ? 20 : 0;

    // Calculate legend height
    const legendItemHeight = 24;
    const legendGap = 15;
    const legendHeight = (labelMode === 'legend' && legendPosition !== 'off') ? (legendItemHeight + legendGap) : 0;

    const headerHeight = titleHeight + titleToSubtitleGap + subtitleHeight + headerToChartGap +
      (labelMode === 'legend' && legendPosition === 'above' ? legendHeight : 0);

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
        .attr('fill', '#111827')
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
        .attr('fill', '#6b7280')
        .text(subtitle);
    }

    // Render Legend (if labelMode is 'legend' and position is 'above')
    if (labelMode === 'legend' && legendPosition === 'above') {
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
          .attr('fill', '#374151')
          .text(period);
      });
    }

    // Calculate inner dimensions
    const innerWidth = width - marginLeft - marginRight;
    const innerHeight = height - marginTop - marginBottom - headerHeight;

    // Create main SVG group
    const g = svg
      .append('g')
      .attr('transform', `translate(${marginLeft},${marginTop + headerHeight})`);

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

      if (compactNumbers) {
        const absValue = Math.abs(value);
        if (absValue >= 1000000) {
          return (value / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        } else if (absValue >= 1000) {
          return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        }
      }

      if (decimalPlaces === 0) return value.toString();
      return value.toFixed(decimalPlaces);
    };

    /**
     * Format axis tick values in compact format if compactAxisNumbers is enabled
     */
    const formatAxisValue = (value) => {
      if (value == null) return '';

      if (compactAxisNumbers) {
        const absValue = Math.abs(value);
        if (absValue >= 1000000) {
          return (value / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        } else if (absValue >= 1000) {
          return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        }
      }

      if (decimalPlaces === 0) return value.toString();
      return value.toFixed(decimalPlaces);
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

      return `rgb(${newR}, ${newG}, ${newB})`;
    };

    // Calculate max value for scale
    let maxValue = 0;
    if (barMode === 'stacked') {
      // For stacked, sum all periods for each category
      maxValue = d3.max(data, d => {
        return periods.reduce((sum, period) => sum + (d[period] || 0), 0);
      });
    } else if (barMode === 'grouped-stacked') {
      if (isGroupedStackedData) {
        // For new grouped-stacked format with Group/Period columns
        // Find max stacked value across all groups and periods
        maxValue = d3.max(categories, group => {
          return d3.max(periods, period => {
            // Sum all stack columns for this group and period
            const groupData = data.filter(d => d.Group === group && d.Period === period);
            if (groupData.length === 0) return 0;

            return stackColumns.reduce((sum, col) => {
              return sum + (groupData[0][col] || 0);
            }, 0);
          });
        });
      } else {
        // For old grouped-stacked format, find max sum within each period's groups
        // Group categories by base name
        const categoryGroups = {};
        categories.forEach(cat => {
          const baseGroup = cat.replace(/ (Very Well|Somewhat Well)$/, '').trim();
          if (!categoryGroups[baseGroup]) {
            categoryGroups[baseGroup] = [];
          }
          categoryGroups[baseGroup].push(cat);
        });

        maxValue = d3.max(periods, period => {
          return d3.max(Object.values(categoryGroups), groupCategories => {
            return groupCategories.reduce((sum, category) => {
              const dataRow = data.find(d => categories[data.indexOf(d)] === category);
              return sum + (dataRow ? (dataRow[period] || 0) : 0);
            }, 0);
          });
        });
      }
    } else {
      // For grouped, find max across all values
      maxValue = d3.max(data, d => {
        return d3.max(periods, period => d[period] || 0);
      });
    }

    // Determine axis minimum and maximum
    const minValue = axisMinimumAuto ? 0 : axisMinimum;
    const calculatedMaxValue = axisMaximumAuto ? (maxValue * 1.1) : axisMaximum;

    // Create scales based on orientation
    let xScale, yScale, xAxis, yAxis;
    let yTicks, xTicks;
    let yMinorTicks = [];
    let xMinorTicks = [];

    if (orientation === 'vertical') {
      // Vertical bars: categories on X, values on Y
      // For grouped-stacked mode, use periods on X-axis instead of categories
      xScale = d3.scaleBand()
        .domain(barMode === 'grouped-stacked' ? periods : categories)
        .range([0, innerWidth])
        .padding(groupPadding);

      yScale = d3.scaleLinear()
        .domain([minValue, calculatedMaxValue])
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
        for (let i = minValue; i <= calculatedMaxValue; i += axisMajorUnit) {
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
        for (let i = minValue; i <= calculatedMaxValue; i += axisMinorUnit) {
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
      // For grouped-stacked mode, use periods on Y-axis instead of categories
      yScale = d3.scaleBand()
        .domain(barMode === 'grouped-stacked' ? periods : categories)
        .range([0, innerHeight])
        .padding(groupPadding);

      xScale = d3.scaleLinear()
        .domain([minValue, calculatedMaxValue])
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
        for (let i = minValue; i <= calculatedMaxValue; i += axisMajorUnit) {
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
        for (let i = minValue; i <= calculatedMaxValue; i += axisMinorUnit) {
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
          .attr('stroke', axisColor)
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
          .attr('stroke', axisColor)
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
          .attr('stroke', axisColor)
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
          .attr('stroke', axisColor)
          .attr('stroke-opacity', gridOpacity)
          .attr('stroke-width', 1);
      }
    }

    // Draw axes
    if (showXAxis) {
      const xAxisGroup = g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis);

      xAxisGroup.selectAll('text')
        .attr('font-family', axisFont)
        .attr('font-size', xAxisFontSize)
        .attr('font-weight', axisWeight)
        .attr('fill', axisColor)
        .attr('opacity', axisOpacity);

      xAxisGroup.selectAll('line, path')
        .attr('stroke', axisColor)
        .attr('opacity', axisOpacity);

      // Rotate labels if vertical orientation and many categories
      if (orientation === 'vertical' && categories.length > 6) {
        xAxisGroup.selectAll('text')
          .attr('transform', 'rotate(-45)')
          .attr('text-anchor', 'end')
          .attr('dx', '-0.5em')
          .attr('dy', '0.15em');
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
      const yAxisGroup = g.append('g')
        .attr('class', 'y-axis')
        .call(yAxis);

      yAxisGroup.selectAll('text')
        .attr('font-family', axisFont)
        .attr('font-size', yAxisFontSize)
        .attr('font-weight', axisWeight)
        .attr('fill', axisColor)
        .attr('opacity', axisOpacity);

      yAxisGroup.selectAll('line, path')
        .attr('stroke', axisColor)
        .attr('opacity', axisOpacity);

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
          .attr('x', marginLeft + 5)
          .attr('y', marginTop + headerHeight)
          .attr('text-anchor', 'start')
          .attr('dy', '0.32em')
          .attr('font-family', axisFont)
          .attr('font-size', axisLabelFontSize)
          .attr('font-weight', 400)
          .attr('fill', axisColor)
          .text(axisLabel);
      } else {
        // Horizontal orientation: label appears horizontally below the last value, right-aligned with it
        const maxTickValue = xScale.domain()[1];
        svg
          .append('text')
          .attr('x', marginLeft + xScale(maxTickValue))
          .attr('y', marginTop + headerHeight + innerHeight + 40)
          .attr('text-anchor', 'end')
          .attr('dy', '0.71em')
          .attr('font-family', axisFont)
          .attr('font-size', axisLabelFontSize)
          .attr('font-weight', 400)
          .attr('fill', axisColor)
          .text(axisLabel);
      }
    }

    // Draw bars
    if (barMode === 'grouped-stacked') {
      if (isGroupedStackedData) {
        // NEW: Grouped-Stacked bars with Group/Period columns
        // Groups are voter types (All Voters, Rep, Dem), each group has multiple time-based stacked bars

        const groupWidth = orientation === 'vertical' ? xScale.bandwidth() : yScale.bandwidth();
        const periodCount = periods.length;
        const barWidth = groupWidth / periodCount * (1 - barPadding);
        const barOffset = groupWidth / periodCount;

        if (orientation === 'vertical') {
          // Vertical grouped-stacked bars
          categories.forEach((group, groupIndex) => {
            const groupX = xScale(group) || 0;

            periods.forEach((period, periodIndex) => {
              // Find data for this group and period
              const groupPeriodData = data.filter(d => d.Group === group && d.Period === period);
              if (groupPeriodData.length === 0) return;

              const dataRow = groupPeriodData[0];
              const barX = groupX + periodIndex * barOffset;
              const color = colorScheme[periodIndex % colorScheme.length];

              let cumulativeValue = 0;

              // Stack the values (Very Well, Somewhat Well)
              stackColumns.forEach((stackCol, stackIndex) => {
                const value = dataRow[stackCol] || 0;
                const y = yScale(cumulativeValue + value);
                const height = yScale(cumulativeValue) - y;

                const barGroup = g.append('g').attr('class', 'bar-group');

                barGroup.append('rect')
                  .attr('x', barX)
                  .attr('y', y)
                  .attr('width', barWidth)
                  .attr('height', height)
                  .attr('fill', color)
                  .attr('opacity', barOpacity * (stackIndex === 0 ? 1 : 0.6)) // First stack column darker
                  .attr('stroke', barBorderColor)
                  .attr('stroke-width', barBorderWidth)
                  .style('cursor', 'pointer');

                // Add value label if there's space
                if (showValueLabels && height > 15) {
                  barGroup.append('text')
                    .attr('x', barX + barWidth / 2)
                    .attr('y', y + height / 2)
                    .attr('dy', '0.35em')
                    .attr('text-anchor', 'middle')
                    .attr('font-family', valueFont)
                    .attr('font-size', valueFontSize - 2)
                    .attr('font-weight', valueWeight)
                    .attr('fill', '#ffffff')
                    .text(formatValue(value));
                }

                cumulativeValue += value;
              });

              // Add NET total label above the stacked bar
              if (showValueLabels) {
                g.append('text')
                  .attr('x', barX + barWidth / 2)
                  .attr('y', yScale(cumulativeValue) - 5)
                  .attr('text-anchor', 'middle')
                  .attr('font-family', valueFont)
                  .attr('font-size', valueFontSize)
                  .attr('font-weight', 600)
                  .attr('fill', axisColor)
                  .text(formatValue(cumulativeValue));
              }
            });
          });
        } else {
          // Horizontal grouped-stacked bars
          categories.forEach((group, groupIndex) => {
            const groupY = yScale(group) || 0;

            periods.forEach((period, periodIndex) => {
              // Find data for this group and period
              const groupPeriodData = data.filter(d => d.Group === group && d.Period === period);
              if (groupPeriodData.length === 0) return;

              const dataRow = groupPeriodData[0];
              const barY = groupY + periodIndex * barOffset;
              const color = colorScheme[periodIndex % colorScheme.length];

              let cumulativeValue = 0;

              // Stack the values (Very Well, Somewhat Well)
              stackColumns.forEach((stackCol, stackIndex) => {
                const value = dataRow[stackCol] || 0;
                const x = xScale(cumulativeValue);
                const width = xScale(cumulativeValue + value) - x;

                const barGroup = g.append('g').attr('class', 'bar-group');

                barGroup.append('rect')
                  .attr('x', x)
                  .attr('y', barY)
                  .attr('width', width)
                  .attr('height', barWidth)
                  .attr('fill', color)
                  .attr('opacity', barOpacity * (stackIndex === 0 ? 1 : 0.6))
                  .attr('stroke', barBorderColor)
                  .attr('stroke-width', barBorderWidth)
                  .style('cursor', 'pointer');

                // Add value label if there's space
                if (showValueLabels && width > 40) {
                  barGroup.append('text')
                    .attr('x', x + width / 2)
                    .attr('y', barY + barWidth / 2)
                    .attr('dy', '0.35em')
                    .attr('text-anchor', 'middle')
                    .attr('font-family', valueFont)
                    .attr('font-size', valueFontSize - 2)
                    .attr('font-weight', valueWeight)
                    .attr('fill', '#ffffff')
                    .text(formatValue(value));
                }

                cumulativeValue += value;
              });

              // Add NET total label to the right of the stacked bar
              if (showValueLabels) {
                g.append('text')
                  .attr('x', xScale(cumulativeValue) + 5)
                  .attr('y', barY + barWidth / 2)
                  .attr('dy', '0.35em')
                  .attr('text-anchor', 'start')
                  .attr('font-family', valueFont)
                  .attr('font-size', valueFontSize)
                  .attr('font-weight', 600)
                  .attr('fill', axisColor)
                  .text(formatValue(cumulativeValue));
              }
            });
          });
        }
      } else {
        // OLD: Legacy grouped-stacked format (kept for backward compatibility)
        // Groups are periods (time), each period has multiple stacked bars for different voter types
        const categoryGroups = {};
        categories.forEach(cat => {
          const baseGroup = cat.replace(/ (Very Well|Somewhat Well)$/, '').trim();
          if (!categoryGroups[baseGroup]) {
            categoryGroups[baseGroup] = [];
          }
          categoryGroups[baseGroup].push(cat);
        });

        const groupNames = Object.keys(categoryGroups);
        const groupCount = groupNames.length;

        if (orientation === 'vertical') {
          periods.forEach((period, periodIndex) => {
            const periodX = xScale(period) || 0;
            const periodWidth = xScale.bandwidth();
            const groupWidth = periodWidth / groupCount;

            groupNames.forEach((groupName, groupIndex) => {
              const groupX = periodX + groupIndex * groupWidth;
              const groupCategories = categoryGroups[groupName];
              let cumulativeValue = 0;

              groupCategories.forEach((category, catIndex) => {
                const dataRow = data.find(d => categories[data.indexOf(d)] === category);
                if (!dataRow) return;

                const value = dataRow[period] || 0;
                const color = colorScheme[groupIndex % colorScheme.length];
                const y = yScale(cumulativeValue + value);
                const height = yScale(cumulativeValue) - y;

                const barGroup = g.append('g').attr('class', 'bar-group');

                barGroup.append('rect')
                  .attr('x', groupX)
                  .attr('y', y)
                  .attr('width', groupWidth * (1 - barPadding))
                  .attr('height', height)
                  .attr('fill', color)
                  .attr('opacity', barOpacity * (catIndex === 0 ? 1 : 0.7))
                  .attr('stroke', barBorderColor)
                  .attr('stroke-width', barBorderWidth)
                  .style('cursor', 'pointer');

                if (height > 20) {
                  barGroup.append('text')
                    .attr('x', groupX + (groupWidth * (1 - barPadding)) / 2)
                    .attr('y', y + height / 2)
                    .attr('dy', '0.35em')
                    .attr('text-anchor', 'middle')
                    .attr('font-family', valueFont)
                    .attr('font-size', valueFontSize - 2)
                    .attr('font-weight', valueWeight)
                    .attr('fill', '#ffffff')
                    .text(formatValue(value));
                }

                cumulativeValue += value;
              });

              if (showValueLabels) {
                g.append('text')
                  .attr('x', groupX + (groupWidth * (1 - barPadding)) / 2)
                  .attr('y', yScale(cumulativeValue) - 5)
                  .attr('text-anchor', 'middle')
                  .attr('font-family', valueFont)
                  .attr('font-size', valueFontSize)
                  .attr('font-weight', 600)
                  .attr('fill', axisColor)
                  .text(formatValue(cumulativeValue));
              }
            });
          });
        } else {
          periods.forEach((period, periodIndex) => {
            const periodY = yScale(period) || 0;
            const periodHeight = yScale.bandwidth();
            const groupHeight = periodHeight / groupCount;

            groupNames.forEach((groupName, groupIndex) => {
              const groupY = periodY + groupIndex * groupHeight;
              const groupCategories = categoryGroups[groupName];
              let cumulativeValue = 0;

              groupCategories.forEach((category, catIndex) => {
                const dataRow = data.find(d => categories[data.indexOf(d)] === category);
                if (!dataRow) return;

                const value = dataRow[period] || 0;
                const color = colorScheme[groupIndex % colorScheme.length];
                const x = xScale(cumulativeValue);
                const width = xScale(cumulativeValue + value) - x;

                const barGroup = g.append('g').attr('class', 'bar-group');

                barGroup.append('rect')
                  .attr('x', x)
                  .attr('y', groupY)
                  .attr('width', width)
                  .attr('height', groupHeight * (1 - barPadding))
                  .attr('fill', color)
                  .attr('opacity', barOpacity * (catIndex === 0 ? 1 : 0.7))
                  .attr('stroke', barBorderColor)
                  .attr('stroke-width', barBorderWidth)
                  .style('cursor', 'pointer');

                if (width > 40) {
                  barGroup.append('text')
                    .attr('x', x + width / 2)
                    .attr('y', groupY + (groupHeight * (1 - barPadding)) / 2)
                    .attr('dy', '0.35em')
                    .attr('text-anchor', 'middle')
                    .attr('font-family', valueFont)
                    .attr('font-size', valueFontSize - 2)
                    .attr('font-weight', valueWeight)
                    .attr('fill', '#ffffff')
                    .text(formatValue(value));
                }

                cumulativeValue += value;
              });

              if (showValueLabels) {
                g.append('text')
                  .attr('x', xScale(cumulativeValue) + 5)
                  .attr('y', groupY + (groupHeight * (1 - barPadding)) / 2)
                  .attr('dy', '0.35em')
                  .attr('text-anchor', 'start')
                  .attr('font-family', valueFont)
                  .attr('font-size', valueFontSize)
                  .attr('font-weight', 600)
                  .attr('fill', axisColor)
                  .text(formatValue(cumulativeValue));
              }
            });
          });
        }
      }
    } else if (barMode === 'grouped') {
      // Grouped bars
      const groupWidth = orientation === 'vertical' ? xScale.bandwidth() : yScale.bandwidth();
      const barWidth = groupWidth / periods.length * (1 - barPadding);
      const barOffset = groupWidth / periods.length;

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
            const y = yScale(value);
            const height = innerHeight - y;

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
              });

            // Labels (direct or value)
            const showLabel = labelMode === 'direct' || (labelMode === 'off' && isEmphasized);
            if (showLabel) {
              // Direct labels or labels on emphasized bars when mode is 'off'
              if (directLabelContent === 'metrics') {
                barGroup.append('text')
                  .attr('x', x + barWidth / 2)
                  .attr('y', y - 5)
                  .attr('text-anchor', 'middle')
                  .attr('font-family', valueFont)
                  .attr('font-size', valueFontSize)
                  .attr('font-weight', valueWeight)
                  .attr('fill', axisColor)
                  .text(formatValue(value));
              } else if (directLabelContent === 'metrics-category') {
                // Stacked: metric value on top, period below
                const periodFontSize = valueFontSize - 2;
                const lineSpacing = 2;
                const totalHeight = valueFontSize + lineSpacing + periodFontSize;

                // Metric value (top)
                barGroup.append('text')
                  .attr('x', x + barWidth / 2)
                  .attr('y', y - 5 - totalHeight / 2)
                  .attr('text-anchor', 'middle')
                  .attr('font-family', valueFont)
                  .attr('font-size', valueFontSize)
                  .attr('font-weight', valueWeight)
                  .attr('fill', axisColor)
                  .text(formatValue(value));

                // Period name (bottom)
                barGroup.append('text')
                  .attr('x', x + barWidth / 2)
                  .attr('y', y - 5 - totalHeight / 2 + valueFontSize + lineSpacing)
                  .attr('text-anchor', 'middle')
                  .attr('font-family', valueFont)
                  .attr('font-size', periodFontSize)
                  .attr('font-weight', valueWeight)
                  .attr('fill', axisColor)
                  .text(period);
              } else if (directLabelContent === 'category') {
                barGroup.append('text')
                  .attr('x', x + barWidth / 2)
                  .attr('y', y - 5)
                  .attr('text-anchor', 'middle')
                  .attr('font-family', valueFont)
                  .attr('font-size', valueFontSize)
                  .attr('font-weight', valueWeight)
                  .attr('fill', axisColor)
                  .text(categoryValue);
              }
            } else if (labelMode === 'legend' && showValueLabels) {
              // Traditional value label (when labelMode is 'legend')
              barGroup.append('text')
                .attr('x', x + barWidth / 2)
                .attr('y', y - 5)
                .attr('text-anchor', 'middle')
                .attr('font-family', valueFont)
                .attr('font-size', valueFontSize)
                .attr('font-weight', valueWeight)
                .attr('fill', axisColor)
                .text(formatValue(value));
            }
          } else {
            // Horizontal bars
            const y = yScale(categoryValue) + barOffset * periodIndex + (barOffset - barWidth) / 2;
            const width = xScale(value);

            barGroup = g.append('g')
              .attr('class', 'bar-group');

            barGroup.append('rect')
              .attr('x', 0)
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
              });

            // Labels (direct or value)
            const showLabel = labelMode === 'direct' || (labelMode === 'off' && isEmphasized);
            if (showLabel) {
              // Direct labels or labels on emphasized bars when mode is 'off'
              if (directLabelContent === 'metrics') {
                barGroup.append('text')
                  .attr('x', width + 5)
                  .attr('y', y + barWidth / 2)
                  .attr('dy', '0.35em')
                  .attr('text-anchor', 'start')
                  .attr('font-family', valueFont)
                  .attr('font-size', valueFontSize)
                  .attr('font-weight', valueWeight)
                  .attr('fill', axisColor)
                  .text(formatValue(value));
              } else if (directLabelContent === 'metrics-category') {
                // Stacked: metric value on top, period below (side by side for horizontal bars)
                const periodFontSize = valueFontSize - 2;
                const lineSpacing = 2;

                // Metric value (top line)
                barGroup.append('text')
                  .attr('x', width + 5)
                  .attr('y', y + barWidth / 2 - (valueFontSize / 2 + lineSpacing))
                  .attr('text-anchor', 'start')
                  .attr('font-family', valueFont)
                  .attr('font-size', valueFontSize)
                  .attr('font-weight', valueWeight)
                  .attr('fill', axisColor)
                  .text(formatValue(value));

                // Period name (bottom line)
                barGroup.append('text')
                  .attr('x', width + 5)
                  .attr('y', y + barWidth / 2 + (periodFontSize / 2 + lineSpacing))
                  .attr('text-anchor', 'start')
                  .attr('font-family', valueFont)
                  .attr('font-size', periodFontSize)
                  .attr('font-weight', valueWeight)
                  .attr('fill', axisColor)
                  .text(period);
              } else if (directLabelContent === 'category') {
                barGroup.append('text')
                  .attr('x', width + 5)
                  .attr('y', y + barWidth / 2)
                  .attr('dy', '0.35em')
                  .attr('text-anchor', 'start')
                  .attr('font-family', valueFont)
                  .attr('font-size', valueFontSize)
                  .attr('font-weight', valueWeight)
                  .attr('fill', axisColor)
                  .text(categoryValue);
              }
            } else if (labelMode === 'legend' && showValueLabels) {
              // Traditional value label (when labelMode is 'legend')
              barGroup.append('text')
                .attr('x', width + 5)
                .attr('y', y + barWidth / 2)
                .attr('dy', '0.35em')
                .attr('text-anchor', 'start')
                .attr('font-family', valueFont)
                .attr('font-size', valueFontSize)
                .attr('font-weight', valueWeight)
                .attr('fill', axisColor)
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
            const y = yScale(cumulativeValue + value);
            const height = yScale(cumulativeValue) - y;

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
              });

            // Labels (direct or value) in center of segment
            if ((labelMode === 'direct' || showValueLabels) && height > 20) { // Only show if segment is large enough
              if (labelMode === 'direct' && directLabelContent === 'metrics-category') {
                // Stacked: metric value on top, period below
                const periodFontSize = valueFontSize - 2;
                const lineSpacing = 2;
                const totalHeight = valueFontSize + lineSpacing + periodFontSize;

                // Check if there's enough space for stacked text
                if (height > totalHeight + 10) {
                  // Metric value (top)
                  barGroup.append('text')
                    .attr('x', x + barWidth / 2)
                    .attr('y', y + height / 2 - (totalHeight / 4))
                    .attr('text-anchor', 'middle')
                    .attr('font-family', valueFont)
                    .attr('font-size', valueFontSize)
                    .attr('font-weight', valueWeight)
                    .attr('fill', '#ffffff')
                    .text(formatValue(value));

                  // Period name (bottom)
                  barGroup.append('text')
                    .attr('x', x + barWidth / 2)
                    .attr('y', y + height / 2 + (totalHeight / 4))
                    .attr('text-anchor', 'middle')
                    .attr('font-family', valueFont)
                    .attr('font-size', periodFontSize)
                    .attr('font-weight', valueWeight)
                    .attr('fill', '#ffffff')
                    .text(period);
                }
              } else {
                // Single line label
                let labelText = '';
                if (labelMode === 'direct') {
                  if (directLabelContent === 'metrics') {
                    labelText = formatValue(value);
                  } else if (directLabelContent === 'category') {
                    labelText = categoryValue;
                  }
                } else {
                  labelText = formatValue(value);
                }

                barGroup.append('text')
                  .attr('x', x + barWidth / 2)
                  .attr('y', y + height / 2)
                  .attr('dy', '0.35em')
                  .attr('text-anchor', 'middle')
                  .attr('font-family', valueFont)
                  .attr('font-size', valueFontSize)
                  .attr('font-weight', valueWeight)
                  .attr('fill', '#ffffff')
                  .text(labelText);
              }
            }
          } else {
            // Horizontal stacked bars
            const y = yScale(categoryValue);
            const barWidth = yScale.bandwidth();
            const x = xScale(cumulativeValue);
            const width = xScale(cumulativeValue + value) - x;

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
              });

            // Labels (direct or value) in center of segment
            if ((labelMode === 'direct' || showValueLabels) && width > 40) { // Only show if segment is large enough
              if (labelMode === 'direct' && directLabelContent === 'metrics-category') {
                // Stacked: metric value on top, period below
                const periodFontSize = valueFontSize - 2;
                const lineSpacing = 2;
                const totalHeight = valueFontSize + lineSpacing + periodFontSize;

                // Check if there's enough vertical space for stacked text
                if (barWidth > totalHeight + 10) {
                  // Metric value (top line)
                  barGroup.append('text')
                    .attr('x', x + width / 2)
                    .attr('y', y + barWidth / 2 - (totalHeight / 4))
                    .attr('text-anchor', 'middle')
                    .attr('font-family', valueFont)
                    .attr('font-size', valueFontSize)
                    .attr('font-weight', valueWeight)
                    .attr('fill', '#ffffff')
                    .text(formatValue(value));

                  // Period name (bottom line)
                  barGroup.append('text')
                    .attr('x', x + width / 2)
                    .attr('y', y + barWidth / 2 + (totalHeight / 4))
                    .attr('text-anchor', 'middle')
                    .attr('font-family', valueFont)
                    .attr('font-size', periodFontSize)
                    .attr('font-weight', valueWeight)
                    .attr('fill', '#ffffff')
                    .text(period);
                }
              } else {
                // Single line label
                let labelText = '';
                if (labelMode === 'direct') {
                  if (directLabelContent === 'metrics') {
                    labelText = formatValue(value);
                  } else if (directLabelContent === 'category') {
                    labelText = categoryValue;
                  }
                } else {
                  labelText = formatValue(value);
                }

                barGroup.append('text')
                  .attr('x', x + width / 2)
                  .attr('y', y + barWidth / 2)
                  .attr('dy', '0.35em')
                  .attr('text-anchor', 'middle')
                  .attr('font-family', valueFont)
                  .attr('font-size', valueFontSize)
                  .attr('font-weight', valueWeight)
                  .attr('fill', '#ffffff')
                  .text(labelText);
              }
            }
          }

          cumulativeValue += value;
        });
      });
    }

    // Render Legend (if labelMode is 'legend' and position is 'below')
    if (labelMode === 'legend' && legendPosition === 'below') {
      const legendY = marginTop + headerHeight + innerHeight + 25;
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
          .attr('fill', '#374151')
          .text(period);
      });
    }

  }, [data, periodNames, dimensions, orientation, barMode, colorScheme, styleSettings]);

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

export default BarChart;
