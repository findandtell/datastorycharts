import React, { useEffect, useRef, useState } from 'react';
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
    axisFontSize = 12,
    axisWeight = 400,
    showValueLabels = true,
    showCategoryLabels = true,
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
    marginTop = 40,
    marginRight = 40,
    marginBottom = 80,
    marginLeft = 80,
  } = styleSettings;

  // Get color scheme from comparison palettes or use custom colors
  const colorScheme = customColors.length > 0
    ? customColors
    : (comparisonPalettes[colorPalette]?.colors || comparisonPalettes.vibrant.colors);

  // Handle container resize
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const container = svgRef.current.parentElement;
        setDimensions({
          width: container.clientWidth,
          height: chartHeight,
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [chartHeight]);

  // Main chart rendering
  useEffect(() => {
    if (!data || data.length === 0 || !periodNames || periodNames.length === 0 || dimensions.width === 0) {
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = dimensions.width;
    const height = dimensions.height;

    // Calculate inner dimensions
    const innerWidth = width - marginLeft - marginRight;
    const innerHeight = height - marginTop - marginBottom;

    // Create main SVG group
    const g = svg
      .append('g')
      .attr('transform', `translate(${marginLeft},${marginTop})`);

    // Extract categories and prepare data
    const categories = data.map(d => d.Category || d.category || d.Stage || '');
    const periods = periodNames;

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

    // Calculate max value for scale
    let maxValue = 0;
    if (barMode === 'stacked') {
      // For stacked, sum all periods for each category
      maxValue = d3.max(data, d => {
        return periods.reduce((sum, period) => sum + (d[period] || 0), 0);
      });
    } else {
      // For grouped, find max across all values
      maxValue = d3.max(data, d => {
        return d3.max(periods, period => d[period] || 0);
      });
    }

    // Add 10% padding to max value for better visual spacing
    maxValue = maxValue * 1.1;

    // Create scales based on orientation
    let xScale, yScale, xAxis, yAxis;

    if (orientation === 'vertical') {
      // Vertical bars: categories on X, values on Y
      xScale = d3.scaleBand()
        .domain(categories)
        .range([0, innerWidth])
        .padding(groupPadding);

      yScale = d3.scaleLinear()
        .domain([0, maxValue])
        .range([innerHeight, 0]);

      xAxis = d3.axisBottom(xScale);
      yAxis = d3.axisLeft(yScale);
    } else {
      // Horizontal bars: categories on Y, values on X
      yScale = d3.scaleBand()
        .domain(categories)
        .range([0, innerHeight])
        .padding(groupPadding);

      xScale = d3.scaleLinear()
        .domain([0, maxValue])
        .range([0, innerWidth]);

      xAxis = d3.axisBottom(xScale);
      yAxis = d3.axisLeft(yScale);
    }

    // Draw grid lines
    if (showGrid) {
      if (orientation === 'vertical') {
        // Horizontal grid lines for vertical bars
        g.append('g')
          .attr('class', 'grid')
          .selectAll('line')
          .data(yScale.ticks())
          .enter()
          .append('line')
          .attr('x1', 0)
          .attr('x2', innerWidth)
          .attr('y1', d => yScale(d))
          .attr('y2', d => yScale(d))
          .attr('stroke', axisColor)
          .attr('stroke-opacity', gridOpacity)
          .attr('stroke-width', 1);
      } else {
        // Vertical grid lines for horizontal bars
        g.append('g')
          .attr('class', 'grid')
          .selectAll('line')
          .data(xScale.ticks())
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
        .attr('font-size', axisFontSize)
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
    }

    if (showYAxis) {
      const yAxisGroup = g.append('g')
        .attr('class', 'y-axis')
        .call(yAxis);

      yAxisGroup.selectAll('text')
        .attr('font-family', axisFont)
        .attr('font-size', axisFontSize)
        .attr('font-weight', axisWeight)
        .attr('fill', axisColor)
        .attr('opacity', axisOpacity);

      yAxisGroup.selectAll('line, path')
        .attr('stroke', axisColor)
        .attr('opacity', axisOpacity);
    }

    // Draw bars
    if (barMode === 'grouped') {
      // Grouped bars
      const groupWidth = orientation === 'vertical' ? xScale.bandwidth() : yScale.bandwidth();
      const barWidth = groupWidth / periods.length * (1 - barPadding);
      const barOffset = groupWidth / periods.length;

      data.forEach((d, categoryIndex) => {
        const categoryValue = categories[categoryIndex];

        periods.forEach((period, periodIndex) => {
          const value = d[period] || 0;
          const color = colorScheme[periodIndex % colorScheme.length];

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
              .attr('fill', color)
              .attr('opacity', barOpacity)
              .attr('stroke', barBorderColor)
              .attr('stroke-width', barBorderWidth)
              .style('cursor', onBarClick ? 'pointer' : 'default')
              .on('click', onBarClick ? () => onBarClick(d, period) : null);

            // Value label on top of bar
            if (showValueLabels) {
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
              .attr('fill', color)
              .attr('opacity', barOpacity)
              .attr('stroke', barBorderColor)
              .attr('stroke-width', barBorderWidth)
              .style('cursor', onBarClick ? 'pointer' : 'default')
              .on('click', onBarClick ? () => onBarClick(d, period) : null);

            // Value label at end of bar
            if (showValueLabels) {
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
              .attr('fill', color)
              .attr('opacity', barOpacity)
              .attr('stroke', barBorderColor)
              .attr('stroke-width', barBorderWidth)
              .style('cursor', onBarClick ? 'pointer' : 'default')
              .on('click', onBarClick ? () => onBarClick(d, period) : null);

            // Value label in center of segment
            if (showValueLabels && height > 20) { // Only show if segment is large enough
              barGroup.append('text')
                .attr('x', x + barWidth / 2)
                .attr('y', y + height / 2)
                .attr('dy', '0.35em')
                .attr('text-anchor', 'middle')
                .attr('font-family', valueFont)
                .attr('font-size', valueFontSize)
                .attr('font-weight', valueWeight)
                .attr('fill', '#ffffff')
                .text(formatValue(value));
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
              .attr('fill', color)
              .attr('opacity', barOpacity)
              .attr('stroke', barBorderColor)
              .attr('stroke-width', barBorderWidth)
              .style('cursor', onBarClick ? 'pointer' : 'default')
              .on('click', onBarClick ? () => onBarClick(d, period) : null);

            // Value label in center of segment
            if (showValueLabels && width > 40) { // Only show if segment is large enough
              barGroup.append('text')
                .attr('x', x + width / 2)
                .attr('y', y + barWidth / 2)
                .attr('dy', '0.35em')
                .attr('text-anchor', 'middle')
                .attr('font-family', valueFont)
                .attr('font-size', valueFontSize)
                .attr('font-weight', valueWeight)
                .attr('fill', '#ffffff')
                .text(formatValue(value));
            }
          }

          cumulativeValue += value;
        });
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
