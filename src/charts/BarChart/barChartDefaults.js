/**
 * Default style settings for Bar Chart
 */
export const defaultStyleSettings = {
  // Chart orientation
  orientation: 'vertical', // 'vertical' or 'horizontal'

  // Bar display mode
  barMode: 'grouped', // 'grouped' or 'stacked'

  // Color settings
  colorPalette: 'vibrant',
  customColors: [],

  // Font settings
  categoryFont: 'Inter',
  categoryFontSize: 16,
  categoryWeight: 400,

  valueFont: 'Inter',
  valueFontSize: 14,
  valueWeight: 600,

  axisFont: 'Inter',
  axisFontSize: 12,
  axisWeight: 400,

  // Label settings
  showValueLabels: true,
  showCategoryLabels: true,

  // Grid settings
  showGrid: true,
  gridOpacity: 0.1,

  // Axis settings
  showXAxis: true,
  showYAxis: true,
  axisColor: '#000000',
  axisOpacity: 1,

  // Bar spacing
  barPadding: 0.2, // Space between bars within a group (0-1)
  groupPadding: 0.3, // Space between groups (0-1)

  // Bar styling
  barOpacity: 1,
  barBorderWidth: 0,
  barBorderColor: '#ffffff',

  // Chart dimensions
  chartHeight: 500,
  marginTop: 40,
  marginRight: 40,
  marginBottom: 80,
  marginLeft: 80,
};

/**
 * Demo dataset for Bar Chart
 */
export const defaultBarChartData = {
  data: [
    { Category: 'Shirts', 'Unit Sales': 1250, 'Unit Returns': 85 },
    { Category: 'Pants', 'Unit Sales': 980, 'Unit Returns': 62 },
    { Category: 'Shoes', 'Unit Sales': 1540, 'Unit Returns': 128 },
    { Category: 'Socks', 'Unit Sales': 2100, 'Unit Returns': 45 },
    { Category: 'Hats', 'Unit Sales': 760, 'Unit Returns': 38 },
  ],
  periods: ['Unit Sales', 'Unit Returns'],
};
