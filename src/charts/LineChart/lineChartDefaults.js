/**
 * Default data and settings for Line Chart
 */

/**
 * Default sample data - Monthly revenue trend
 */
export const defaultData = [
  { date: '2024-01', Revenue: 45000, Profit: 12000, Expenses: 33000 },
  { date: '2024-02', Revenue: 52000, Profit: 15000, Expenses: 37000 },
  { date: '2024-03', Revenue: 48000, Profit: 13000, Expenses: 35000 },
  { date: '2024-04', Revenue: 61000, Profit: 18000, Expenses: 43000 },
  { date: '2024-05', Revenue: 58000, Profit: 16000, Expenses: 42000 },
  { date: '2024-06', Revenue: 67000, Profit: 21000, Expenses: 46000 },
  { date: '2024-07', Revenue: 71000, Profit: 23000, Expenses: 48000 },
  { date: '2024-08', Revenue: 69000, Profit: 22000, Expenses: 47000 },
  { date: '2024-09', Revenue: 75000, Profit: 25000, Expenses: 50000 },
  { date: '2024-10', Revenue: 78000, Profit: 27000, Expenses: 51000 },
  { date: '2024-11', Revenue: 82000, Profit: 29000, Expenses: 53000 },
  { date: '2024-12', Revenue: 88000, Profit: 32000, Expenses: 56000 },
];

/**
 * Default metric names (the lines to display)
 */
export const defaultMetricNames = ['Revenue', 'Profit', 'Expenses'];

/**
 * Time scale formats for different granularities
 */
export const timeScaleFormats = {
  year: { format: '%Y', parser: '%Y' },
  month: { format: '%b %Y', parser: '%Y-%m' },
  week: { format: 'Week %U', parser: '%Y-W%U' },
  day: { format: '%b %d', parser: '%Y-%m-%d' },
  hour: { format: '%I %p', parser: '%Y-%m-%d %H' },
};

/**
 * Default style settings for Line Chart
 */
export const defaultStyleSettings = {
  // Title and Subtitle
  title: 'Revenue Trends',
  subtitle: 'Monthly performance overview',
  titleAlignment: 'left',
  fontFamily: 'Inter',
  titleFontSize: 20,
  subtitleFontSize: 14,

  // Time settings
  timeScale: 'month', // 'year', 'month', 'week', 'day', 'hour'
  dateField: 'date', // Which field contains the date/time values

  // Color Mode Options
  colorMode: 'category', // 'category', 'gradient', 'custom'
  comparisonPalette: 'professional',
  userCustomColors: ['#1e40af', '#0d9488', '#991b1b', '#d97706', '#475569', '#7c3aed', '#059669', '#dc2626'],

  // Line styling
  lineThickness: 3, // 1-7px
  lineStyle: 'solid', // 'solid', 'dashed', 'dotted'
  lineOpacity: 1.0,
  smoothLines: false, // Use curved lines (catmullRom) vs straight segments
  lineSaturation: 100, // 0-100%

  // Point styling
  showPoints: true,
  pointSize: 4, // radius in px
  pointStyle: 'filled', // 'filled' or 'outlined'
  pointBorderWidth: 2,

  // Area fill
  showAreaFill: false,
  areaOpacity: 0.2,
  areaGradient: false, // Gradient from line color to transparent

  // Emphasis/Selection
  emphasizedLines: [], // Array of metric names to emphasize
  emphasizedLineThickness: 4,
  emphasizedPointSize: 6,

  // Labels
  showValueLabels: false, // Show value labels at each point
  showDirectLabels: true, // Show metric name labels at end of lines
  labelFontSize: 12,
  compactNumbers: true,

  // Number formatting (Labels)
  valuePrefix: '',
  valueSuffix: '',
  valueDecimalPlaces: 0,
  valueFormat: 'number',

  // Number formatting (Axis)
  axisValuePrefix: '',
  axisValueSuffix: '',
  axisValueDecimalPlaces: 0,
  axisValueFormat: 'number',

  // Axes
  showXAxis: true,
  showYAxis: true,
  xAxisPosition: 'bottom', // 'bottom', 'top', 'both'
  yAxisPosition: 'left', // 'left', 'right', 'both'
  xAxisLabelRotation: 0, // -90 to 90 degrees
  yAxisFormat: 'auto', // 'auto', 'compact', 'full', 'percentage'

  // Grid
  showGridLines: true,
  gridDirection: 'horizontal', // 'horizontal', 'vertical', 'both', 'none'
  gridLineColor: '#e5e7eb',
  gridLineStyle: 'solid', // 'solid', 'dashed', 'dotted'
  gridLineOpacity: 0.5,

  // Legend
  showLegend: true,
  legendPosition: 'top', // 'top', 'bottom', 'left', 'right'
  legendFontSize: 12,

  // Baselines and references
  baselines: [], // Array of { value, label, color, style }
  showMovingAverage: false,
  movingAveragePeriod: 3,
  movingAverageColor: '#6b7280',

  // Percent change brackets
  showPercentChangeBrackets: false,
  percentChangeBracketPairs: [], // Array of [startIndex, endIndex]

  // Tooltips
  showTooltips: true,
  tooltipFormat: 'auto', // 'auto', 'compact', 'full'

  // Layout
  width: 800,
  height: 500,
  marginTop: 80,
  marginRight: 100,
  marginBottom: 100,
  marginLeft: 80,

  // Background
  backgroundColor: '#ffffff',
  darkMode: false,
};

/**
 * Get color for a line based on color mode
 */
export const getLineColor = (metricName, index, styleSettings, palettes) => {
  const { colorMode } = styleSettings;

  switch (colorMode) {
    case 'gradient': {
      // For gradient mode, interpolate between colors
      const colors = styleSettings.userCustomColors;
      if (colors.length === 0) return '#1e40af';
      if (colors.length === 1) return colors[0];

      // Simple interpolation based on index
      const ratio = index / (styleSettings.userCustomColors.length - 1);
      const colorIndex = Math.floor(ratio * (colors.length - 1));
      return colors[colorIndex];
    }

    case 'custom': {
      return styleSettings.userCustomColors[index % styleSettings.userCustomColors.length];
    }

    case 'category':
    default: {
      const palette = palettes[styleSettings.comparisonPalette];
      if (!palette) return '#1e40af';
      const colors = styleSettings.comparisonPalette === 'user'
        ? styleSettings.userCustomColors
        : palette.colors;
      return colors[index % colors.length];
    }
  }
};

/**
 * Format number based on settings
 */
export const formatNumber = (value, format = 'auto', compact = false) => {
  if (value == null) return '';

  if (compact) {
    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (absValue >= 1000000000) {
      return `${sign}${(absValue / 1000000000).toFixed(absValue % 1000000000 === 0 ? 0 : 1)}B`;
    } else if (absValue >= 1000000) {
      return `${sign}${(absValue / 1000000).toFixed(absValue % 1000000 === 0 ? 0 : 1)}M`;
    } else if (absValue >= 1000) {
      return `${sign}${(absValue / 1000).toFixed(absValue % 1000 === 0 ? 0 : 1)}K`;
    }
  }

  if (format === 'percentage') {
    return `${value.toFixed(1)}%`;
  }

  return value.toLocaleString();
};

/**
 * Calculate moving average
 */
export const calculateMovingAverage = (data, metricName, period) => {
  const result = [];

  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - period + 1);
    const slice = data.slice(start, i + 1);
    const sum = slice.reduce((acc, d) => acc + (d[metricName] || 0), 0);
    result.push(sum / slice.length);
  }

  return result;
};

/**
 * Parse date based on time scale
 */
export const parseDate = (dateString, timeScale) => {
  // Simple date parsing - in production, use d3.timeParse
  return new Date(dateString);
};

/**
 * Format date based on time scale
 */
export const formatDate = (date, timeScale) => {
  const options = {
    year: { year: 'numeric' },
    month: { year: 'numeric', month: 'short' },
    week: { year: 'numeric', month: 'short', day: 'numeric' },
    day: { month: 'short', day: 'numeric' },
    hour: { hour: 'numeric', minute: '2-digit' },
  };

  return date.toLocaleDateString('en-US', options[timeScale] || options.month);
};
