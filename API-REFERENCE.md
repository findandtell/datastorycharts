# API Reference

Complete reference for all hooks, utilities, components, and datasets in the Funnel Viz application.

---

## Table of Contents

1. [Hooks](#hooks)
   - [useChartData](#usechartdata)
   - [useStyleSettings](#usestylesettings)
2. [Utilities](#utilities)
   - [Data Formatters](#data-formatters)
   - [Color Utils](#color-utils)
   - [CSV Utils](#csv-utils)
   - [Time Aggregation](#time-aggregation)
3. [Sample Datasets](#sample-datasets)
4. [Design System](#design-system)
5. [Chart Registry](#chart-registry)

---

## Hooks

### useChartData

**Location:** `src/shared/hooks/useChartData.js`

**Purpose:** Manages all data-related state including chart data, editing, and data loading.

#### Signature

```javascript
const chartData = useChartData(chartType = 'funnel')
```

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `chartType` | `string` | `'funnel'` | Chart type ('funnel', 'bar', 'line', 'slope') |

#### Return Value

Returns an object with the following properties:

##### State

```javascript
{
  // Primary data
  data: Array<Object>,              // Filtered chart data (visible rows only)
  editableData: Array<Object>,      // Full data including hidden rows
  periodNames: string[],            // Column/metric names

  // Mode flags
  isComparisonMode: boolean,        // true if multiple periods

  // Hidden elements
  hiddenPeriods: Set<string>,       // Set of hidden column names

  // Data source tracking
  rawCSV: string,                   // Original CSV string
  source: string,                   // 'sample' | 'csv-upload' | 'csv-paste' | 'google-sheets'
  googleSheetsUrl: string,

  // Metadata
  error: string | null,             // Error message if any
  hasData: boolean,                 // Computed: data !== null && length > 0
  stageCount: number,               // Computed: data?.length || 0
  periodCount: number,              // Computed: periodNames.length
}
```

##### Actions: Data Loading

```javascript
{
  // Load from sample datasets
  loadSampleData: (datasetKey: string) => boolean,

  // Load from file upload
  loadCSVFile: (file: File) => Promise<boolean>,

  // Load from pasted text
  loadCSVText: (csvText: string, delimiter?: string, source?: string) => Promise<boolean>,

  // Load from snapshot (for restore functionality)
  loadSnapshotData: (snapshotData: Array, snapshotPeriods: string[], snapshotIsComparison?: boolean) => boolean,
}
```

##### Actions: Data Editing

```javascript
{
  // Update cell value
  updateDataValue: (stageIndex: number, periodKey: string, value: number) => void,

  // Update row name
  updateStageName: (stageIndex: number, newName: string, fieldName?: string) => void,

  // Update column name
  updatePeriodName: (oldName: string, newName: string) => void,
}
```

##### Actions: Row Operations

```javascript
{
  // Add new row
  addStage: (stageName: string, fieldName?: string) => boolean,

  // Remove row
  removeStage: (stageIndex: number) => boolean,

  // Reorder rows (drag and drop)
  reorderStages: (fromIndex: number, toIndex: number) => void,

  // Show/hide row
  toggleStageHidden: (stageIndex: number, hidden: boolean) => void,

  // Sort rows by column values
  sortByPeriod: (periodName: string, ascending?: boolean) => void,
}
```

##### Actions: Column Operations

```javascript
{
  // Add new column
  addPeriod: (periodName: string) => boolean,

  // Remove column
  removePeriod: (periodName: string) => boolean,

  // Reorder columns
  reorderPeriods: (fromIndex: number, toIndex: number) => void,

  // Set column order from array
  setPeriodOrder: (newOrder: string[]) => void,

  // Show/hide column
  togglePeriodHidden: (periodName: string, hidden: boolean) => void,
}
```

##### Actions: Data Manipulation

```javascript
{
  // Swap rows and columns
  transposeData: () => void,

  // Apply edits from editableData to data
  applyEdits: () => void,

  // Discard edits (reset editableData to data)
  resetEdits: () => void,

  // Clear all data
  clearData: () => void,

  // Set all hidden periods
  setHiddenPeriods: (set: Set<string>) => void,
}
```

##### Getters

```javascript
{
  // Get data for specific column
  getPeriodData: (periodName: string) => Array<{ stage: string, value: number }>,

  // Get data for specific row
  getStageData: (stageName: string) => Array<{ period: string, value: number }>,
}
```

#### Examples

**Load sample data:**

```javascript
const chartData = useChartData('bar');

// Load bar chart sample
const success = chartData.loadSampleData('barSimple');
if (success) {
  console.log('Data loaded:', chartData.data);
}
```

**Update cell value:**

```javascript
// Update value at row 0, column 'Jan' to 1000
chartData.updateDataValue(0, 'Jan', 1000);
```

**Add and remove rows:**

```javascript
// Add new row
chartData.addStage('New Region');

// Remove row at index 2
chartData.removeStage(2);
```

**Transpose data:**

```javascript
// Swap rows and columns
chartData.transposeData();
```

---

### useStyleSettings

**Location:** `src/shared/hooks/useStyleSettings.js`

**Purpose:** Manages all visual styling and chart configuration.

#### Signature

```javascript
const styleSettings = useStyleSettings(initialTheme = theme)
```

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `initialTheme` | `Object` | `theme` | Initial theme object from design system |

#### Return Value

Returns an object with state and setters for all style settings:

##### Typography

```javascript
{
  // Title and subtitle
  title: string,
  setTitle: (value: string) => void,
  subtitle: string,
  setSubtitle: (value: string) => void,
  titleAlignment: 'left' | 'center',
  setTitleAlignment: (value: string) => void,

  // Fonts
  fontFamily: string,
  setFontFamily: (value: string) => void,
  titleFontSize: number,
  setTitleFontSize: (value: number) => void,
  subtitleFontSize: number,
  setSubtitleFontSize: (value: number) => void,
  legendFontSize: number,
  setLegendFontSize: (value: number) => void,
  // ... more font size setters
}
```

##### Colors

```javascript
{
  // Single color mode
  barColor: string,                 // Hex color
  setBarColor: (value: string) => void,

  // Comparison mode
  comparisonPalette: string,        // Palette key
  setComparisonPalette: (value: string) => void,
  userCustomColors: string[],       // Array of hex colors
  setUserCustomColors: (value: string[]) => void,

  // Color effects
  colorTransition: number,          // 0-100 gradient intensity
  setColorTransition: (value: number) => void,
}
```

##### Layout

```javascript
{
  // Orientation
  orientation: 'vertical' | 'horizontal',
  setOrientation: (value: string) => void,

  // Dimensions
  aspectRatio: string,              // '1:1' | '16:9' | '4:3' | etc.
  setAspectRatio: (value: string) => void,
  canvasWidth: number,
  setCanvasWidth: (value: number) => void,
  canvasHeight: number,
  setCanvasHeight: (value: number) => void,
  chartWidth: number,
  setChartWidth: (value: number) => void,
  chartHeight: number,
  setChartHeight: (value: number) => void,

  // Spacing
  chartPadding: number,
  setChartPadding: (value: number) => void,
  stageGap: number,
  setStageGap: (value: number) => void,
  barWidth: number,
  setBarWidth: (value: number) => void,
}
```

##### Visual

```javascript
{
  // Theme
  darkMode: boolean,
  setDarkMode: (value: boolean) => void,
  backgroundColor: string,
  setBackgroundColor: (value: string) => void,
  backgroundOpacity: number,        // 0-100
  setBackgroundOpacity: (value: number) => void,

  // Lines
  axisLineWidth: number,
  setAxisLineWidth: (value: number) => void,
}
```

##### Display Options

```javascript
{
  // Emphasis
  emphasis: 'throughput' | 'conversion',
  setEmphasis: (value: string) => void,

  // Numbers
  compactNumbers: boolean,
  setCompactNumbers: (value: boolean) => void,
  normalizeToHundred: boolean,
  setNormalizeToHundred: (value: boolean) => void,

  // Legend
  showLegend: boolean,
  setShowLegend: (value: boolean) => void,
  legendPosition: 'direct' | 'legend',
  setLegendPosition: (value: string) => void,

  // Percent change
  percentChangeEnabled: boolean,
  setPercentChangeEnabled: (value: boolean) => void,
  percentChangeLabelFormat: 'percent' | 'percent-volume',
  setPercentChangeLabelFormat: (value: string) => void,
}
```

##### Chart-Specific Settings

**Bar Chart:**

```javascript
{
  // Bar mode
  barMode: 'grouped' | 'stacked',
  setBarMode: (value: string) => void,

  // Labels
  labelMode: 'legend' | 'direct',
  setLabelMode: (value: string) => void,
  directLabelContent: 'metrics' | 'metrics-category' | 'category',
  setDirectLabelContent: (value: string) => void,

  // Emphasis
  emphasizedBars: Array<string>,
  setEmphasizedBars: (value: Array<string>) => void,

  // Axis
  axisMinimum: number,
  setAxisMinimum: (value: number) => void,
  axisMinimumAuto: boolean,
  setAxisMinimumAuto: (value: boolean) => void,
  axisMaximum: number,
  setAxisMaximum: (value: number) => void,
  axisMaximumAuto: boolean,
  setAxisMaximumAuto: (value: boolean) => void,
  // ... more axis settings

  // Number formatting
  valuePrefix: string,
  setValuePrefix: (value: string) => void,
  valueSuffix: string,
  setValueSuffix: (value: string) => void,
  valueDecimalPlaces: number,
  setValueDecimalPlaces: (value: number) => void,
  valueFormat: 'number' | 'percentage',
  setValueFormat: (value: string) => void,
}
```

**Line Chart:**

```javascript
{
  // Line styling
  lineThickness: number,            // 1-7px
  setLineThickness: (value: number) => void,
  lineOpacity: number,              // 0-1
  setLineOpacity: (value: number) => void,
  lineSaturation: number,           // 0-100
  setLineSaturation: (value: number) => void,
  smoothLines: boolean,
  setSmoothLines: (value: boolean) => void,

  // Points
  showPoints: boolean,
  setShowPoints: (value: boolean) => void,
  pointSize: number,
  setPointSize: (value: number) => void,
  pointStyle: 'filled' | 'outlined',
  setPointStyle: (value: string) => void,

  // Area fill
  showAreaFill: boolean,
  setShowAreaFill: (value: boolean) => void,
  areaOpacity: number,
  setAreaOpacity: (value: number) => void,
  areaGradient: boolean,
  setAreaGradient: (value: boolean) => void,

  // Time settings
  timeScale: 'year' | 'month' | 'week' | 'day' | 'hour',
  setTimeScale: (value: string) => void,
  aggregationLevel: 'day' | 'week' | 'month' | 'quarter' | 'year',
  setAggregationLevel: (value: string) => void,
  aggregationMethod: 'sum' | 'average' | 'min' | 'max' | 'count',
  setAggregationMethod: (value: string) => void,

  // Emphasis
  emphasizedPoints: Array<string>,   // Max 4 points
  setEmphasizedPoints: (value: Array<string>) => void,
  emphasizedMetric: string | null,
  setEmphasizedMetric: (value: string) => void,
}
```

**Slope Chart:**

```javascript
{
  // Color mode
  colorMode: 'category' | 'trend' | 'custom' | 'gradient',
  setColorMode: (value: string) => void,

  // Line styling
  lineThickness: number,
  setLineThickness: (value: number) => void,
  lineOpacity: number,
  setLineOpacity: (value: number) => void,

  // Endpoints
  endpointSize: number,
  setEndpointSize: (value: number) => void,
  endpointStyle: 'filled' | 'outlined',
  setEndpointStyle: (value: string) => void,

  // Labels
  labelPosition: 'left' | 'right' | 'both',
  setLabelPosition: (value: string) => void,
  showCategoryLabels: boolean,
  setShowCategoryLabels: (value: boolean) => void,
  showValueLabels: boolean,
  setShowValueLabels: (value: boolean) => void,

  // Trend colors
  increaseColor: string,
  setIncreaseColor: (value: string) => void,
  decreaseColor: string,
  setDecreaseColor: (value: string) => void,
  noChangeColor: string,
  setNoChangeColor: (value: string) => void,
}
```

##### Actions

```javascript
{
  // Aspect ratio (updates width/height automatically)
  updateAspectRatio: (ratio: string) => void,

  // Reset all settings to defaults
  resetToDefaults: () => void,

  // Export settings as JSON
  exportSettings: () => Object,

  // Import settings from JSON
  importSettings: (settings: Object, currentChartType?: string) => void,
}
```

#### Examples

**Update title and colors:**

```javascript
const styleSettings = useStyleSettings();

// Update title
styleSettings.setTitle('Q4 Regional Sales');

// Update color palette for comparison mode
styleSettings.setComparisonPalette('observable10');

// Set custom colors
styleSettings.setUserCustomColors(['#1e40af', '#dc2626', '#059669']);
```

**Export and import settings:**

```javascript
// Export current settings
const settings = styleSettings.exportSettings();
localStorage.setItem('chartSettings', JSON.stringify(settings));

// Import saved settings
const saved = JSON.parse(localStorage.getItem('chartSettings'));
styleSettings.importSettings(saved, 'bar');
```

**Reset to defaults:**

```javascript
styleSettings.resetToDefaults();
```

---

## Utilities

### Data Formatters

**Location:** `src/shared/utils/dataFormatters.js`

#### formatCompactNumber

Format number with compact notation (K, M, B).

```javascript
formatCompactNumber(num: number) => string
```

**Examples:**

```javascript
formatCompactNumber(1000);      // "1.0K"
formatCompactNumber(1500000);   // "1.5M"
formatCompactNumber(2500000000); // "2.5B"
formatCompactNumber(500);        // "500"
```

#### formatFullNumber

Format number with commas (locale-aware).

```javascript
formatFullNumber(num: number) => string
```

**Examples:**

```javascript
formatFullNumber(1000);      // "1,000"
formatFullNumber(1500000);   // "1,500,000"
```

#### formatNumber

Format number based on compact preference.

```javascript
formatNumber(num: number, compact: boolean = false) => string
```

**Examples:**

```javascript
formatNumber(1500000, false);  // "1,500,000"
formatNumber(1500000, true);   // "1.5M"
```

#### formatPercentage

Format number as percentage.

```javascript
formatPercentage(num: number, decimals: number = 1) => string
```

**Examples:**

```javascript
formatPercentage(45.678, 1);   // "45.7%"
formatPercentage(45.678, 2);   // "45.68%"
```

#### formatPercentageChange

Format percentage change with sign.

```javascript
formatPercentageChange(num: number, decimals: number = 1) => string
```

**Examples:**

```javascript
formatPercentageChange(12.5, 1);   // "+12.5%"
formatPercentageChange(-8.3, 1);   // "-8.3%"
formatPercentageChange(0, 1);      // "0.0%"
```

#### parseNumber

Parse number from string (handles K, M, B notation).

```javascript
parseNumber(str: string | number) => number
```

**Examples:**

```javascript
parseNumber("1.5K");       // 1500
parseNumber("2.3M");       // 2300000
parseNumber("1,500");      // 1500
parseNumber(1000);         // 1000
```

#### isValidNumber

Validate if string is a valid number.

```javascript
isValidNumber(str: string) => boolean
```

**Examples:**

```javascript
isValidNumber("1.5K");     // true
isValidNumber("abc");      // false
isValidNumber("1,500");    // true
```

#### roundTo

Round to specified decimal places.

```javascript
roundTo(num: number, decimals: number = 0) => number
```

**Examples:**

```javascript
roundTo(12.3456, 2);   // 12.35
roundTo(12.3456, 0);   // 12
```

#### getPrecision

Get number of decimal places.

```javascript
getPrecision(num: number) => number
```

**Examples:**

```javascript
getPrecision(12.345);   // 3
getPrecision(12);       // 0
```

---

### Color Utils

**Location:** `src/shared/utils/colorUtils.js`

#### hexToRgb

Convert hex color to RGB object.

```javascript
hexToRgb(hex: string) => { r: number, g: number, b: number } | null
```

**Examples:**

```javascript
hexToRgb("#1e40af");   // { r: 30, g: 64, b: 175 }
hexToRgb("invalid");   // null
```

#### rgbToHex

Convert RGB to hex color.

```javascript
rgbToHex(r: number, g: number, b: number) => string
```

**Examples:**

```javascript
rgbToHex(30, 64, 175);   // "#1e40af"
```

#### interpolateColor

Interpolate between two colors.

```javascript
interpolateColor(color1: string, color2: string, factor: number) => string
```

**Parameters:**
- `color1`: Start color (hex)
- `color2`: End color (hex)
- `factor`: Interpolation factor (0 = color1, 1 = color2)

**Examples:**

```javascript
interpolateColor("#ff0000", "#0000ff", 0);     // "#ff0000" (red)
interpolateColor("#ff0000", "#0000ff", 0.5);   // "#7f007f" (purple)
interpolateColor("#ff0000", "#0000ff", 1);     // "#0000ff" (blue)
```

#### lightenColor

Lighten a color by percentage.

```javascript
lightenColor(color: string, percent: number) => string
```

**Examples:**

```javascript
lightenColor("#1e40af", 20);   // Lighter blue
lightenColor("#000000", 50);   // Gray
```

#### darkenColor

Darken a color by percentage.

```javascript
darkenColor(color: string, percent: number) => string
```

**Examples:**

```javascript
darkenColor("#1e40af", 20);   // Darker blue
darkenColor("#ffffff", 50);   // Gray
```

#### setColorOpacity

Adjust color opacity (returns rgba).

```javascript
setColorOpacity(color: string, opacity: number) => string
```

**Parameters:**
- `color`: Hex color
- `opacity`: Opacity 0-100

**Examples:**

```javascript
setColorOpacity("#1e40af", 50);   // "rgba(30, 64, 175, 0.5)"
setColorOpacity("#ff0000", 100);  // "rgba(255, 0, 0, 1)"
```

#### generateColorGradient

Generate color gradient array.

```javascript
generateColorGradient(startColor: string, endColor: string, steps: number) => string[]
```

**Examples:**

```javascript
generateColorGradient("#ff0000", "#0000ff", 5);
// Returns 5 colors from red to blue
```

#### calculateSegmentColor

Calculate color for funnel segment based on position.

```javascript
calculateSegmentColor(
  baseColor: string,
  index: number,
  totalSegments: number,
  colorTransition: number = 60
) => string
```

**Examples:**

```javascript
// Generate colors for 4-segment funnel
calculateSegmentColor("#1e40af", 0, 4, 60);   // Lightest
calculateSegmentColor("#1e40af", 1, 4, 60);
calculateSegmentColor("#1e40af", 2, 4, 60);
calculateSegmentColor("#1e40af", 3, 4, 60);   // Darkest
```

#### getContrastTextColor

Get contrasting text color (black or white) for background.

```javascript
getContrastTextColor(backgroundColor: string) => string
```

**Examples:**

```javascript
getContrastTextColor("#ffffff");   // "#000000" (black on white)
getContrastTextColor("#000000");   // "#ffffff" (white on black)
getContrastTextColor("#1e40af");   // "#ffffff" (white on dark blue)
```

#### isValidHexColor

Validate if string is a valid hex color.

```javascript
isValidHexColor(color: string) => boolean
```

**Examples:**

```javascript
isValidHexColor("#1e40af");   // true
isValidHexColor("#fff");      // true
isValidHexColor("blue");      // false
isValidHexColor("1e40af");    // false (missing #)
```

#### generateRandomColor

Generate random hex color.

```javascript
generateRandomColor() => string
```

**Examples:**

```javascript
generateRandomColor();   // "#a3f2b1" (random)
```

#### mixColors

Mix multiple colors together with optional weights.

```javascript
mixColors(colors: string[], weights?: number[]) => string
```

**Examples:**

```javascript
mixColors(["#ff0000", "#0000ff"]);              // Equal mix
mixColors(["#ff0000", "#0000ff"], [3, 1]);      // 75% red, 25% blue
```

#### getColorScheme

Get color scheme variations.

```javascript
getColorScheme(baseColor: string, type: string = "analogous") => string[]
```

**Types:**
- `"complementary"` - Base + opposite color
- `"triadic"` - 3 colors evenly spaced
- `"analogous"` - Base + lighter/darker variations
- `"monochromatic"` - 5 shades of base color

**Examples:**

```javascript
getColorScheme("#1e40af", "complementary");   // [base, opposite]
getColorScheme("#1e40af", "analogous");       // [lighter, base, darker]
getColorScheme("#1e40af", "monochromatic");   // 5 shades
```

---

### CSV Utils

**Location:** `src/shared/utils/csvUtils.js`

#### parseCSV

Parse CSV file using PapaParse.

```javascript
parseCSV(file: File) => Promise<Object>
```

**Returns:** PapaParse result object with `data`, `errors`, `meta` properties.

**Example:**

```javascript
const file = event.target.files[0];
const results = await parseCSV(file);

if (results.errors.length === 0) {
  console.log('Parsed data:', results.data);
}
```

#### validateCSVStructure

Validate CSV structure for chart compatibility.

```javascript
validateCSVStructure(data: Array, fieldOrder: string[]) => {
  valid: boolean,
  errors: string[]
}
```

**Example:**

```javascript
const validation = validateCSVStructure(data, fieldOrder);
if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}
```

#### csvToChartData

Convert CSV data to chart format.

```javascript
csvToChartData(data: Array, fieldOrder: string[], stageFieldName: string = 'Stage') => {
  data: Array,
  periods: string[]
}
```

**Example:**

```javascript
const { data, periods } = csvToChartData(csvData, fieldOrder, 'Category');
```

---

### Time Aggregation

**Location:** `src/shared/utils/timeAggregation.js`

Functions for aggregating time-series data.

#### aggregateByDay

Aggregate data by day.

```javascript
aggregateByDay(data: Array, method: string = 'sum') => Array
```

#### aggregateByWeek

Aggregate data by week.

```javascript
aggregateByWeek(data: Array, method: string = 'sum') => Array
```

#### aggregateByMonth

Aggregate data by month.

```javascript
aggregateByMonth(data: Array, method: string = 'sum') => Array
```

#### aggregateByQuarter

Aggregate data by quarter.

```javascript
aggregateByQuarter(data: Array, method: string = 'sum') => Array
```

#### aggregateByYear

Aggregate data by year.

```javascript
aggregateByYear(data: Array, method: string = 'sum') => Array
```

**Aggregation Methods:**
- `'sum'` - Sum values
- `'average'` - Average values
- `'min'` - Minimum value
- `'max'` - Maximum value
- `'count'` - Count values

---

## Sample Datasets

**Location:** `src/shared/data/sampleDatasets.js`

### getSampleDataset

Get sample dataset by key.

```javascript
getSampleDataset(key: string) => {
  name: string,
  data: Array<Object>,
  metricNames?: string[],
  stylePreset?: string,
  description?: string
}
```

### Available Datasets

#### Funnel Charts

```javascript
getSampleDataset('generic');          // Generic funnel example
getSampleDataset('ecommerce');        // E-commerce conversion funnel
getSampleDataset('saas');             // SaaS signup funnel
```

#### Bar Charts

```javascript
getSampleDataset('barSimple');        // Simple bar chart
getSampleDataset('barGrouped');       // Grouped bars
getSampleDataset('barStacked');       // Stacked bars
getSampleDataset('regionalSales');    // Regional sales data
```

#### Line Charts

```javascript
getSampleDataset('marketingChannelRevenue');  // Marketing data
getSampleDataset('dailySales');               // Daily sales
getSampleDataset('clothingRetail');           // Retail data
```

#### Slope Charts

```javascript
getSampleDataset('slopeRevenue');     // Revenue comparison
getSampleDataset('slopeMarketShare'); // Market share changes
```

### isComparisonDataset

Check if dataset is for comparison (multiple periods).

```javascript
isComparisonDataset(key: string) => boolean
```

**Example:**

```javascript
isComparisonDataset('barGrouped');    // true (multiple periods)
isComparisonDataset('barSimple');     // false (single period)
```

---

## Design System

**Location:** `src/shared/design-system/`

### Theme

**Location:** `src/shared/design-system/theme.js`

```javascript
import theme from '@shared/design-system/theme';

// Typography
theme.typography.families       // ["Inter", "Lora", ...]
theme.typography.sizes.title    // 28
theme.typography.sizes.subtitle // 20
theme.typography.sizes.legend   // 14

// Layout
theme.layout.aspectRatios["1:1"]   // { width: 900, height: 900 }
theme.layout.aspectRatios["16:9"]  // { width: 1600, height: 900 }

// Colors
theme.colors.primary            // "#1e40af"
theme.colors.secondary          // "#dc2626"
```

### Color Palettes

**Location:** `src/shared/design-system/colorPalettes.js`

```javascript
import { comparisonPalettes, defaultUserColors } from '@shared/design-system/colorPalettes';

// Get palette colors
const colors = comparisonPalettes['observable10'].colors;
// ["#4269d0", "#efb118", "#ff725c", ...]

// Available palettes
Object.keys(comparisonPalettes);
// ["observable10", "vibrant", "professional", "pastel", "earth", "user"]

// Default custom colors
defaultUserColors;
// ["#1e40af", "#dc2626", "#059669", "#d97706"]
```

---

## Chart Registry

**Location:** `src/shared/chartRegistry.js`

### getChartConfig

Get chart configuration by type.

```javascript
getChartConfig(chartType: string) => {
  name: string,
  component: React.Component,
  icon: React.Component,
  path: string,
  category: string,
  description: string,
  defaultDataset: string
}
```

**Example:**

```javascript
import { getChartConfig } from '@shared/chartRegistry';

const config = getChartConfig('bar-horizontal');
console.log(config.name);          // "Horizontal Bar Chart"
console.log(config.defaultDataset); // "barSimple"
```

### Available Chart Types

```javascript
// Funnel
'funnel'

// Bar Charts
'bar-vertical'
'bar-horizontal'
'bar-grouped-vertical'
'bar-grouped-horizontal'

// Line Charts
'line'
'area'
'area-stacked'

// Slope Charts
'slope'
```

---

## Quick Reference

### Common Patterns

**Load and display data:**

```javascript
const chartData = useChartData('bar');
const styleSettings = useStyleSettings();

// Load sample data
chartData.loadSampleData('barSimple');

// Update styling
styleSettings.setTitle('Q4 Sales');
styleSettings.setComparisonPalette('vibrant');
```

**Format numbers:**

```javascript
import { formatNumber, formatPercentage } from '@shared/utils/dataFormatters';

formatNumber(1500000, true);       // "1.5M"
formatPercentage(23.456, 1);       // "23.5%"
```

**Work with colors:**

```javascript
import { lightenColor, getContrastTextColor } from '@shared/utils/colorUtils';

const light = lightenColor("#1e40af", 20);
const textColor = getContrastTextColor("#1e40af");
```

**Save and restore state:**

```javascript
// Save
const snapshot = {
  data: chartData.data,
  periods: chartData.periodNames,
  settings: styleSettings.exportSettings(),
};
localStorage.setItem('chart', JSON.stringify(snapshot));

// Restore
const saved = JSON.parse(localStorage.getItem('chart'));
chartData.loadSnapshotData(saved.data, saved.periods);
styleSettings.importSettings(saved.settings);
```

---

## Related Documentation

- [STATE-MANAGEMENT.md](STATE-MANAGEMENT.md) - Deep dive into state architecture
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture overview
- [PATTERNS.md](PATTERNS.md) - React + D3 patterns and best practices
- [ADDING-CHARTS.md](ADDING-CHARTS.md) - Guide to adding new chart types

---

**Last Updated:** 2025-01-18
**Maintainer:** Project Team
**Status:** ✅ Complete API Reference
