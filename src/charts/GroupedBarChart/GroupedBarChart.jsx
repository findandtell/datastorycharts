import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { comparisonPalettes } from '../../shared/design-system/colorPalettes';

/**
 * GroupedBarChart Component
 * Displays grouped vertical bar charts for Datawrapper-style data
 * Data format: { Period: "Nov '18", "Group - Value": 21, ... }
 * Transforms to show periods on X-axis with grouped/stacked bars per period
 */
const GroupedBarChart = ({ data, periodNames, styleSettings = {}, onBarClick }) => {
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
    barMode = 'grouped', // 'grouped' or 'stacked'
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
    axisColor = '#000000',
    axisOpacity = 1,
    barPadding = 0.2,
    groupPadding = 0.3,
    barOpacity = 1,
    barBorderWidth = 0,
    barBorderColor = '#ffffff',
    chartHeight = 500,
    chartWidth = 600,
    marginTop = 60,
    marginRight = 40,
    marginBottom = 80,
    marginLeft = 80,
    showValueLabels = true,
    labelMode = 'legend',
    legendPosition = 'above',
    compactNumbers = false,
    showGrid = true,
    gridOpacity = 0.1,
    backgroundColor = null,
    darkMode = false,
  } = styleSettings;

  // Get color scheme
  const colorScheme = useMemo(() => {
    if (colorPalette === 'user' && customColors.length > 0) {
      return customColors;
    }
    return comparisonPalettes[colorPalette]?.colors || comparisonPalettes.vibrant.colors;
  }, [customColors, colorPalette]);

  // Handle container resize
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const totalWidth = chartWidth + marginLeft + marginRight;
        const totalHeight = chartHeight + marginTop + marginBottom;
        setDimensions({ width: totalWidth, height: totalHeight });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [chartWidth, chartHeight, marginLeft, marginRight, marginTop, marginBottom]);

  useEffect(() => {
    if (!data || data.length === 0 || !periodNames || periodNames.length === 0 || dimensions.width === 0) {
      return;
    }

    // Clear previous chart
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Determine background color
    const bgColor = backgroundColor || (darkMode ? '#1f2937' : '#ffffff');

    // Set up SVG
    svg
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .attr('viewBox', `0 0 ${dimensions.width} ${dimensions.height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('background-color', bgColor);

    // Create main group with margins
    const g = svg.append('g')
      .attr('transform', `translate(${marginLeft},${marginTop})`);

    const innerWidth = chartWidth;
    const innerHeight = chartHeight;

    // Format value function
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
      return value.toLocaleString();
    };

    // Extract unique groups from data
    const uniqueGroups = [];
    if (data.length > 0 && data[0].Group) {
      uniqueGroups.push(...new Set(data.map(d => d.Group)));
    }

    // Extract value column names (columns after Group and Period)
    const valueColumns = data.length > 0
      ? Object.keys(data[0]).filter(key => key !== 'Group' && key !== 'Period')
      : [];

    // Calculate max value for scale
    let maxValue = 0;
    if (barMode === 'stacked') {
      periodNames.forEach(period => {
        uniqueGroups.forEach(group => {
          const groupPeriodData = data.filter(d => d.Period === period && d.Group === group);
          if (groupPeriodData.length > 0) {
            const stackTotal = valueColumns.reduce((sum, col) => sum + (groupPeriodData[0][col] || 0), 0);
            maxValue = Math.max(maxValue, stackTotal);
          }
        });
      });
    } else {
      // Grouped mode
      data.forEach(d => {
        valueColumns.forEach(col => {
          maxValue = Math.max(maxValue, d[col] || 0);
        });
      });
    }

    // Create scales
    const xScale = d3.scaleBand()
      .domain(periodNames)
      .range([0, innerWidth])
      .padding(groupPadding);

    const yScale = d3.scaleLinear()
      .domain([0, maxValue * 1.1]) // Add 10% padding
      .range([innerHeight, 0])
      .nice();

    // Draw grid
    if (showGrid) {
      g.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(yScale)
          .tickSize(-innerWidth)
          .tickFormat(''))
        .attr('opacity', gridOpacity)
        .selectAll('line')
        .attr('stroke', axisColor);

      g.select('.grid .domain').remove();
    }

    // Draw axes
    const xAxis = g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .attr('color', axisColor)
      .attr('opacity', axisOpacity);

    xAxis.selectAll('text')
      .attr('font-family', axisFont)
      .attr('font-size', xAxisFontSize);

    const yAxis = g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale).tickFormat(formatValue))
      .attr('color', axisColor)
      .attr('opacity', axisOpacity);

    yAxis.selectAll('text')
      .attr('font-family', axisFont)
      .attr('font-size', yAxisFontSize);

    // Draw title
    if (title) {
      svg.append('text')
        .attr('x', titleAlignment === 'center' ? dimensions.width / 2 :
               titleAlignment === 'right' ? dimensions.width - marginRight : marginLeft)
        .attr('y', 30)
        .attr('text-anchor', titleAlignment === 'center' ? 'middle' :
               titleAlignment === 'right' ? 'end' : 'start')
        .attr('font-family', fontFamily)
        .attr('font-size', titleFontSize)
        .attr('font-weight', 'bold')
        .attr('fill', axisColor)
        .text(title);
    }

    // Draw subtitle
    if (subtitle) {
      svg.append('text')
        .attr('x', titleAlignment === 'center' ? dimensions.width / 2 :
               titleAlignment === 'right' ? dimensions.width - marginRight : marginLeft)
        .attr('y', title ? 52 : 30)
        .attr('text-anchor', titleAlignment === 'center' ? 'middle' :
               titleAlignment === 'right' ? 'end' : 'start')
        .attr('font-family', fontFamily)
        .attr('font-size', subtitleFontSize)
        .attr('fill', axisColor)
        .attr('opacity', 0.7)
        .text(subtitle);
    }

    // Draw legend if needed
    if (labelMode === 'legend' && legendPosition === 'above') {
      const legendGroup = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${marginLeft}, ${marginTop - 30})`);

      const legendItemWidth = 120;
      const legendItemSpacing = 10;

      uniqueGroups.forEach((group, i) => {
        const x = i * (legendItemWidth + legendItemSpacing);
        const color = colorScheme[i % colorScheme.length];

        // Color swatch
        legendGroup.append('rect')
          .attr('x', x)
          .attr('y', 0)
          .attr('width', 12)
          .attr('height', 12)
          .attr('fill', color);

        // Label
        legendGroup.append('text')
          .attr('x', x + 16)
          .attr('y', 10)
          .attr('font-family', fontFamily)
          .attr('font-size', 12)
          .attr('fill', axisColor)
          .text(group);
      });
    }

    // Draw bars
    if (barMode === 'grouped') {
      // Grouped bars
      const groupWidth = xScale.bandwidth();
      const barWidth = groupWidth / uniqueGroups.length * (1 - barPadding);
      const barOffset = groupWidth / uniqueGroups.length;

      periodNames.forEach((period) => {
        const periodX = xScale(period) || 0;

        uniqueGroups.forEach((group, groupIndex) => {
          const groupPeriodData = data.find(d => d.Period === period && d.Group === group);

          if (groupPeriodData) {
            valueColumns.forEach((col, colIndex) => {
              const value = groupPeriodData[col] || 0;
              const color = colorScheme[groupIndex % colorScheme.length];
              const x = periodX + barOffset * groupIndex + (barOffset - barWidth) / 2;
              const y = yScale(value);
              const height = innerHeight - y;

              const barGroup = g.append('g').attr('class', 'bar-group');

              barGroup.append('rect')
                .attr('x', x)
                .attr('y', y)
                .attr('width', barWidth)
                .attr('height', height)
                .attr('fill', color)
                .attr('opacity', barOpacity)
                .attr('stroke', barBorderColor)
                .attr('stroke-width', barBorderWidth)
                .style('cursor', 'pointer')
                .on('click', () => {
                  if (onBarClick) onBarClick(groupPeriodData, period, `${group}-${period}`);
                });

              // Value label
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
            });
          }
        });
      });
    } else if (barMode === 'stacked') {
      // Stacked bars
      const groupWidth = xScale.bandwidth();
      const barWidth = groupWidth / uniqueGroups.length * (1 - barPadding);
      const barOffset = groupWidth / uniqueGroups.length;

      periodNames.forEach((period) => {
        const periodX = xScale(period) || 0;

        uniqueGroups.forEach((group, groupIndex) => {
          const groupPeriodData = data.find(d => d.Period === period && d.Group === group);

          if (groupPeriodData) {
            let cumulativeValue = 0;

            valueColumns.forEach((col, colIndex) => {
              const value = groupPeriodData[col] || 0;
              const color = colorScheme[groupIndex % colorScheme.length];
              const x = periodX + barOffset * groupIndex + (barOffset - barWidth) / 2;
              const y = yScale(cumulativeValue + value);
              const height = yScale(cumulativeValue) - y;

              const barGroup = g.append('g').attr('class', 'bar-group');

              barGroup.append('rect')
                .attr('x', x)
                .attr('y', y)
                .attr('width', barWidth)
                .attr('height', height)
                .attr('fill', color)
                .attr('opacity', barOpacity)
                .attr('stroke', barBorderColor)
                .attr('stroke-width', barBorderWidth)
                .style('cursor', 'pointer')
                .on('click', () => {
                  if (onBarClick) onBarClick(groupPeriodData, period, `${group}-${period}-${col}`);
                });

              // Value label inside stack segment
              if (showValueLabels && height > 20) {
                barGroup.append('text')
                  .attr('x', x + barWidth / 2)
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
          }
        });
      });
    }

  }, [data, periodNames, dimensions, styleSettings, barMode, colorScheme, onBarClick]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <svg ref={svgRef} style={{ maxWidth: '100%', height: 'auto' }} />
    </div>
  );
};

export default React.memo(GroupedBarChart);
