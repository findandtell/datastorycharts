/**
 * Default style settings for _ChartTemplate
 *
 * TEMPLATE FILE - Copy and customize for your chart
 *
 * Instructions:
 * 1. Copy this file to your chart folder
 * 2. Rename to yourChartDefaults.js
 * 3. Update settings for your chart type
 * 4. Remove this comment block
 */

/**
 * Default style settings
 *
 * Group settings logically:
 * - Visual settings (colors, opacity, borders)
 * - Typography (fonts, sizes, weights)
 * - Layout (dimensions, margins, spacing)
 * - Chart-specific settings
 */
export const defaultStyleSettings = {
  // ===== Visual Settings =====
  colorPalette: 'vibrant', // Color palette name
  customColors: [], // Array of custom hex colors

  chartOpacity: 1, // Overall opacity (0-1)
  borderColor: '#ffffff',
  borderWidth: 2,

  // ===== Typography =====
  // Label fonts
  labelFont: 'Inter',
  labelFontSize: 14,
  labelWeight: 400,
  labelColor: '#000000',

  // Value fonts
  valueFont: 'Inter',
  valueFontSize: 12,
  valueWeight: 600,
  valueColor: '#000000',

  // Axis fonts
  axisFont: 'Inter',
  axisFontSize: 12,
  axisWeight: 400,
  axisColor: '#666666',

  // ===== Layout =====
  chartHeight: 500,
  chartWidth: 800, // or 'auto' for responsive

  marginTop: 40,
  marginRight: 40,
  marginBottom: 60,
  marginLeft: 60,

  // ===== Display Options =====
  showLabels: true,
  showValues: true,
  showLegend: true,
  showGrid: true,

  // Legend position
  legendPosition: 'top', // 'top', 'bottom', 'left', 'right', 'none'

  // ===== Chart-Specific Settings =====
  // Add your chart-specific settings here
  chartMode: 'default', // Chart mode/variant
  orientation: 'vertical', // 'vertical' or 'horizontal'

  // Animation settings (optional)
  enableAnimations: false,
  animationDuration: 300,

  // Interaction settings (optional)
  enableTooltips: false,
  enableHover: false,
};

/**
 * Demo dataset for _ChartTemplate
 *
 * Provide realistic sample data that showcases your chart's capabilities
 */
export const defaultChartData = {
  data: [
    { Category: 'Item 1', Value: 100, Value2: 80 },
    { Category: 'Item 2', Value: 150, Value2: 120 },
    { Category: 'Item 3', Value: 120, Value2: 100 },
    { Category: 'Item 4', Value: 180, Value2: 150 },
    { Category: 'Item 5', Value: 90, Value2: 70 },
  ],
  periods: ['Value', 'Value2'],
};
