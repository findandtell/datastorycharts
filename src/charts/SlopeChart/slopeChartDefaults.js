/**
 * Default data and settings for Slope Chart
 */

/**
 * Default sample data - based on the reference image
 * Shows percentage changes between 2015 and 2016
 */
export const defaultData = [
  { category: 'A', 2015: 20, 2016: 20 },
  { category: 'B', 2015: 18, 2016: 19 },
  { category: 'C', 2015: 17, 2016: 18 },
  { category: 'D', 2015: 17, 2016: 17 },
  { category: 'E', 2015: 14, 2016: 13 },
  { category: 'F', 2015: 13, 2016: 12 },
  { category: 'G', 2015: 12, 2016: 11 },
  { category: 'H', 2015: 11, 2016: 8 },
  { category: 'I', 2015: 10, 2016: 4 },
  { category: 'J', 2015: 7, 2016: 9 },
];

/**
 * Default period names
 */
export const defaultPeriodNames = ['2015', '2016'];

/**
 * Default style settings for Slope Chart
 */
export const defaultStyleSettings = {
  // Title and Subtitle
  title: 'Market Share Change',
  subtitle: 'Year-over-year comparison',
  fontFamily: 'Inter',
  titleFontSize: 20,
  subtitleFontSize: 14,

  // Color Mode Options
  colorMode: 'category', // 'category', 'trend', 'custom', 'gradient'
  comparisonPalette: 'professional',
  userCustomColors: ['#1e40af', '#0d9488', '#991b1b', '#d97706', '#475569', '#7c3aed', '#059669', '#dc2626'],

  // Trend-based colors
  increaseColor: '#10b981', // Green for increases
  decreaseColor: '#ef4444', // Red for decreases
  noChangeColor: '#6b7280', // Gray for no change

  // Gradient colors
  startColor: '#1e40af',
  endColor: '#10b981',

  // Line styling
  lineThickness: 3, // 1-7px
  lineOpacity: 1.0,

  // Endpoint styling
  endpointSize: 6, // radius in px
  endpointStyle: 'filled', // 'filled' or 'outlined'
  endpointBorderWidth: 2,

  // Label settings
  labelPosition: 'left', // 'left', 'right', or 'both'
  showCategoryLabels: true,
  showValueLabels: true,
  showPercentageChange: true,
  labelFormat: 'both', // 'value', 'percentage', 'both'

  // Typography
  categoryFont: 'Inter',
  categoryFontSize: 18,
  categoryFontWeight: 500,
  valueFont: 'Inter',
  valueFontSize: 16,
  valueFontWeight: 400,

  // Period labels
  periodFont: 'Inter',
  periodFontSize: 16,
  periodFontWeight: 600,
  periodColor: '#374151',

  // Emphasis/Selection
  emphasizedLines: [], // Array of category indices to emphasize
  emphasizedLineThickness: 5,
  emphasizedLabelWeight: 700,

  // Layout
  width: 600,
  height: 500,
  marginTop: 60,
  marginRight: 120,
  marginBottom: 60,
  marginLeft: 120,
  periodSpacing: 400, // Horizontal distance between the two vertical axis lines

  // Background
  backgroundColor: '#ffffff',

  // Axis lines (vertical lines at each time period)
  showAxisLines: true,
  axisLineColor: '#ababab',
  axisLineWidth: 1,
  axisLineStyle: 'solid', // 'solid', 'dashed', 'dotted'
};

/**
 * Color mode descriptions
 */
export const colorModeDescriptions = {
  category: 'Each category gets a different color from the selected palette',
  trend: 'Colors based on direction: Green (up), Red (down), Gray (no change)',
  custom: 'Manually assign colors to each category',
  gradient: 'Gradient from start color to end color across all lines',
};

/**
 * Label format options
 */
export const labelFormatOptions = [
  { value: 'value', label: 'Values Only' },
  { value: 'percentage', label: 'Percentage Change Only' },
  { value: 'both', label: 'Values & Percentage' },
];

/**
 * Get color for a line based on color mode
 */
export const getLineColor = (dataPoint, index, styleSettings, palettes) => {
  const { colorMode } = styleSettings;

  switch (colorMode) {
    case 'trend': {
      const keys = Object.keys(dataPoint).filter(k => k !== 'category' && k !== 'Stage');
      if (keys.length < 2) return styleSettings.noChangeColor;

      const start = dataPoint[keys[0]];
      const end = dataPoint[keys[1]];
      const change = end - start;

      if (change > 0) return styleSettings.increaseColor;
      if (change < 0) return styleSettings.decreaseColor;
      return styleSettings.noChangeColor;
    }

    case 'gradient': {
      // For gradient mode, we'll interpolate in the component
      return styleSettings.startColor;
    }

    case 'custom': {
      return styleSettings.userCustomColors[index % styleSettings.userCustomColors.length];
    }

    case 'category':
    default: {
      // Defensive: ensure palettes exists before accessing
      if (!palettes) return '#1e40af';

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
 * Calculate percentage change
 */
export const calculatePercentageChange = (startValue, endValue) => {
  if (startValue === 0) return endValue > 0 ? 100 : 0;
  const change = ((endValue - startValue) / startValue) * 100;
  return Math.round(change * 10) / 10; // Round to 1 decimal
};

/**
 * Format label text based on settings
 */
export const formatLabel = (value, percentageChange, labelFormat) => {
  switch (labelFormat) {
    case 'value':
      return `${value}%`;
    case 'percentage':
      return `${percentageChange > 0 ? '+' : ''}${percentageChange}%`;
    case 'both':
      return `${value}% (${percentageChange > 0 ? '+' : ''}${percentageChange}%)`;
    default:
      return `${value}%`;
  }
};
