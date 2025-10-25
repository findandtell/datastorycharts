/**
 * Main entry point - exports all shared modules
 */

// Design System
export { default as theme, getAspectRatioDimensions, getFontFamilies, createCustomTheme } from './shared/design-system/theme';
export { 
  colorPresets, 
  comparisonPalettes, 
  getColorFromPalette, 
  getPaletteColors,
  defaultUserColors 
} from './shared/design-system/colorPalettes';

// Hooks
export { useChartData } from './shared/hooks/useChartData';
export { useStyleSettings } from './shared/hooks/useStyleSettings';

// Utilities - Data Formatters
export {
  formatCompactNumber,
  formatFullNumber,
  formatNumber,
  formatPercentage,
  formatPercentageChange,
  parseNumber,
  isValidNumber,
  roundTo,
  formatForSpace
} from './shared/utils/dataFormatters';

// Utilities - Calculations
export {
  calculateConversionRate,
  calculateDropOffRate,
  calculatePercentageChange,
  calculateOverallConversion,
  normalizeToHundred,
  calculateStageConversions,
  calculateCumulativeConversions,
  findBiggestDropOff,
  calculateAverage,
  calculateMedian,
  calculateTrend,
  calculateStdDev,
  findOutliers,
  calculateGrowthRate
} from './shared/utils/calculations';

// Utilities - Color Utils
export {
  hexToRgb,
  rgbToHex,
  interpolateColor,
  lightenColor,
  darkenColor,
  setColorOpacity,
  generateColorGradient,
  calculateSegmentColor,
  getContrastTextColor,
  isValidHexColor,
  generateRandomColor,
  mixColors,
  getColorScheme
} from './shared/utils/colorUtils';

// Utilities - CSV
export {
  parseCSV,
  csvToChartData,
  validateCSVStructure,
  checkFunnelPattern,
  exportToCSV,
  cleanCSVData,
  getCSVSummary
} from './shared/utils/csvUtils';

// Utilities - Export
export {
  exportAsPNG,
  exportAsSVG,
  copySVGToClipboard,
  downloadDataURL,
  svgToDataURL,
  getSVGDimensions,
  addWatermark,
  isValidExportFormat,
  getRecommendedExportSettings
} from './shared/utils/exportHelpers';

// Sample Data
export {
  sampleDatasets,
  getSampleDataset,
  getSampleDatasetKeys,
  isComparisonDataset
} from './shared/data/sampleDatasets';

// Charts
export { default as FunnelChart } from './charts/FunnelChart/FunnelChart';
export {
  chartRegistry,
  getChart,
  getChartKeys,
  getChartsByCategory,
  getCategories,
  supportsComparison,
  getDefaultSettings,
  isValidChartKey
} from './charts/registry';
