/**
 * Chart Styling Section Configuration
 *
 * This file defines the order and metadata for styling sections across all chart types.
 * Centralizing this configuration makes it easy to maintain consistency and update section ordering.
 *
 * IMPLEMENTATION STATUS:
 * ✅ Slope Chart - Fully reorganized (sections physically reordered to match config)
 * ✅ Bar Chart - Fully reorganized (sections physically reordered to match config)
 * ✅ Line Chart - Fully reorganized (sections physically reordered to match config)
 * ✅ Funnel Chart - Fully reorganized (sections physically reordered to match config)
 *
 *
 * ALL CHARTS PHYSICALLY REORGANIZED - 2025-11-04
 *
 * All chart types now have their styling sections physically reordered in ChartEditor.jsx
 * to match the standard order defined in this configuration file.
 */

/**
 * Section order for each chart type
 * Keys correspond to chart type flags: slopeChart, barChart, lineChart, funnelChart
 */
export const CHART_SECTION_ORDER = {
  slopeChart: [
    'theme',
    'canvasLayout',
    'colorsStyling',
    'typography',
    'labels',
    'lineStyling',
    'emphasis',
    'watermark'
  ],

  barChart: [
    'theme',
    'canvasLayout',
    'colorsStyling',
    'typography',
    'labels',
    'chartStructure',
    'axesGridlines',
    'emphasis',
    'displayOptions',
    'watermark'
  ],

  lineChart: [
    'theme',
    'canvasLayout',
    'colorsStyling',
    'typography',
    'labels',
    'lineStyling',
    'dateTime',
    'emphasis',
    'pointMarkers',
    'areaFill',
    'axesGridlines',
    'displayOptions',
    'watermark'
  ],

  funnelChart: [
    'theme',
    'canvasLayout',
    'colorsStyling',
    'typography',
    'labels',
    'chartType',
    'sparklines',
    'watermark'
  ]
};

/**
 * Section metadata including display titles and expandedSections keys
 * This provides a mapping between section IDs and their UI properties
 */
export const SECTION_METADATA = {
  // Common sections (appear in multiple chart types)
  theme: {
    title: 'Theme',
    expandedKey: 'theme'
  },
  canvasLayout: {
    title: 'Canvas & Layout',
    expandedKey: 'layoutCanvas'
  },
  colorsStyling: {
    title: 'Colors & Styling',
    expandedKey: 'colorMode'
  },
  typography: {
    title: 'Typography',
    expandedKey: 'typography'
  },
  labels: {
    title: 'Labels',
    expandedKey: 'labels', // Note: Bar Chart uses 'dataLabels'
    barChartExpandedKey: 'dataLabels' // Override for Bar Chart
  },
  emphasis: {
    title: 'Emphasis',
    expandedKey: 'emphasis', // Note: Slope Chart uses 'lineEmphasis'
    slopeChartExpandedKey: 'lineEmphasis' // Override for Slope Chart
  },
  watermark: {
    title: 'Watermark',
    expandedKey: 'watermark'
  },
  displayOptions: {
    title: 'Display Options',
    expandedKey: 'displayOptions'
  },

  // Chart-specific sections
  chartStructure: {
    title: 'Chart Structure',
    expandedKey: 'chartStructure'
  },
  axesGridlines: {
    title: 'Axes & Gridlines',
    expandedKey: 'axesGridlines'
  },
  lineStyling: {
    title: 'Line Styling',
    expandedKey: 'lineStyling'
  },
  dateTime: {
    title: 'Date / Time',
    expandedKey: 'dateTime'
  },
  pointMarkers: {
    title: 'Point Markers',
    expandedKey: 'pointMarkers'
  },
  areaFill: {
    title: 'Area Fill',
    expandedKey: 'areaFill'
  },
  chartType: {
    title: 'Chart Type',
    expandedKey: 'chartType'
  },
  sparklines: {
    title: 'Sparklines',
    expandedKey: 'sparklines'
  }
};

/**
 * Helper function to get section order for a given chart type
 * @param {Object} flags - Chart type flags {isSlopeChart, isBarChart, isLineChart}
 * @returns {Array} Array of section IDs in display order
 */
export const getSectionOrder = (flags) => {
  const { isSlopeChart, isBarChart, isLineChart } = flags;

  if (isSlopeChart) return CHART_SECTION_ORDER.slopeChart;
  if (isBarChart) return CHART_SECTION_ORDER.barChart;
  if (isLineChart) return CHART_SECTION_ORDER.lineChart;
  return CHART_SECTION_ORDER.funnelChart;
};

/**
 * Helper function to get section metadata by ID
 * @param {string} sectionId - The section identifier
 * @returns {Object} Section metadata {title, expandedKey}
 */
export const getSectionMetadata = (sectionId) => {
  return SECTION_METADATA[sectionId] || null;
};
