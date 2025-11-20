/**
 * _ChartTemplate Component
 *
 * TEMPLATE FILE - Copy and customize for your chart
 *
 * Instructions:
 * 1. Copy this file to your chart folder
 * 2. Rename to YourChart.jsx
 * 3. Update component name and logic
 * 4. Remove this comment block
 *
 * This template includes:
 * - Basic D3 integration pattern
 * - Data processing with useMemo
 * - SVG rendering with useEffect
 * - Proper cleanup
 * - Common patterns and best practices
 */

import { useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
// IMPORTANT: Import color schemes directly to avoid Vite tree-shaking
import { schemeTableau10 } from 'd3-scale-chromatic';

/**
 * _ChartTemplate Component
 *
 * @param {Object} props
 * @param {Array} props.data - Chart data array
 * @param {Array} props.periodNames - Column/metric names
 * @param {Object} props.styleSettings - Chart style configuration
 * @param {Function} props.onDataPointClick - Optional click handler
 */
const _ChartTemplate = ({
  data,
  periodNames = [],
  styleSettings = {},
  onDataPointClick,
}) => {
  // ===== Refs =====
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  // ===== Extract Style Settings =====
  // Extract all settings with defaults
  const {
    // Visual
    colorPalette = 'vibrant',
    customColors = [],
    chartOpacity = 1,
    borderColor = '#ffffff',
    borderWidth = 2,

    // Typography
    labelFont = 'Inter',
    labelFontSize = 14,
    labelWeight = 400,
    labelColor = '#000000',

    valueFont = 'Inter',
    valueFontSize = 12,
    valueWeight = 600,
    valueColor = '#000000',

    // Layout
    chartHeight = 500,
    chartWidth = 800,
    marginTop = 40,
    marginRight = 40,
    marginBottom = 60,
    marginLeft = 60,

    // Display options
    showLabels = true,
    showValues = true,
    showGrid = true,

    // Chart-specific
    chartMode = 'default',
    orientation = 'vertical',

  } = styleSettings;

  // ===== Calculate Dimensions =====
  const innerWidth = chartWidth - marginLeft - marginRight;
  const innerHeight = chartHeight - marginTop - marginBottom;

  // ===== Process Data =====
  /**
   * Transform raw data into D3-friendly format
   * Use useMemo to avoid recalculating on every render
   */
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Example: Extract first period/metric
    const valueColumn = periodNames[0] || 'Value';

    return data.map((row, index) => ({
      id: index,
      category: row.Category || row.Stage || row.label || `Item ${index + 1}`,
      value: row[valueColumn] || 0,
      // Add more processed fields as needed
    }));
  }, [data, periodNames]);

  // ===== Get Colors =====
  const colorScale = useMemo(() => {
    // Use custom colors if provided, otherwise use color scheme
    const colors = customColors.length > 0
      ? customColors
      : schemeTableau10; // Import directly from d3-scale-chromatic

    return d3.scaleOrdinal()
      .domain(processedData.map(d => d.category))
      .range(colors);
  }, [processedData, customColors]);

  // ===== Render Chart =====
  /**
   * Main rendering effect
   * Runs whenever data or settings change
   */
  useEffect(() => {
    // Guard: Check if we have required elements and data
    if (!svgRef.current || !processedData || processedData.length === 0) {
      return;
    }

    // ===== Clear Previous Render =====
    // CRITICAL: Always clear previous render to avoid duplicate elements
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // ===== Set SVG Dimensions =====
    svg
      .attr('width', chartWidth)
      .attr('height', chartHeight);

    // ===== Create Main Group =====
    const g = svg
      .append('g')
      .attr('transform', `translate(${marginLeft}, ${marginTop})`);

    // ===== Create Scales =====
    // Example: Simple bar chart scales
    const xScale = d3.scaleBand()
      .domain(processedData.map(d => d.category))
      .range([0, innerWidth])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(processedData, d => d.value)])
      .nice()
      .range([innerHeight, 0]);

    // ===== Add Grid (Optional) =====
    if (showGrid) {
      g.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(yScale)
          .tickSize(-innerWidth)
          .tickFormat('')
        )
        .style('stroke-opacity', 0.1);
    }

    // ===== Render Data Elements =====
    // Example: Render bars
    g.selectAll('.bar')
      .data(processedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.category))
      .attr('y', d => yScale(d.value))
      .attr('width', xScale.bandwidth())
      .attr('height', d => innerHeight - yScale(d.value))
      .attr('fill', d => colorScale(d.category))
      .attr('opacity', chartOpacity)
      .attr('stroke', borderColor)
      .attr('stroke-width', borderWidth)
      // Add click handler if provided
      .on('click', (event, d) => {
        if (onDataPointClick) {
          onDataPointClick(d);
        }
      })
      .style('cursor', onDataPointClick ? 'pointer' : 'default');

    // ===== Add Labels (Optional) =====
    if (showLabels) {
      g.selectAll('.label')
        .data(processedData)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => xScale(d.category) + xScale.bandwidth() / 2)
        .attr('y', innerHeight + 20)
        .attr('text-anchor', 'middle')
        .attr('font-family', labelFont)
        .attr('font-size', labelFontSize)
        .attr('font-weight', labelWeight)
        .attr('fill', labelColor)
        .text(d => d.category);
    }

    // ===== Add Values (Optional) =====
    if (showValues) {
      g.selectAll('.value')
        .data(processedData)
        .enter()
        .append('text')
        .attr('class', 'value')
        .attr('x', d => xScale(d.category) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(d.value) - 5)
        .attr('text-anchor', 'middle')
        .attr('font-family', valueFont)
        .attr('font-size', valueFontSize)
        .attr('font-weight', valueWeight)
        .attr('fill', valueColor)
        .text(d => d.value);
    }

    // ===== Add Axes =====
    // X Axis
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('font-family', labelFont)
      .attr('font-size', labelFontSize);

    // Y Axis
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .attr('font-family', valueFont)
      .attr('font-size', valueFontSize);

    // ===== Cleanup Function (Optional) =====
    return () => {
      // Clean up event listeners, timers, etc. if needed
    };

  }, [
    // CRITICAL: Include ALL dependencies
    // Missing dependencies cause stale data bugs
    processedData,
    colorScale,
    chartWidth,
    chartHeight,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    chartOpacity,
    borderColor,
    borderWidth,
    showLabels,
    showValues,
    showGrid,
    labelFont,
    labelFontSize,
    labelWeight,
    labelColor,
    valueFont,
    valueFontSize,
    valueWeight,
    valueColor,
    onDataPointClick,
  ]);

  // ===== Render =====
  return (
    <div ref={containerRef} className="chart-template-container">
      <svg ref={svgRef} />
    </div>
  );
};

export default _ChartTemplate;
