# System Architecture

**Comprehensive technical architecture documentation for the Funnel Visualization Platform**

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Data Flow](#data-flow)
4. [State Management Architecture](#state-management-architecture)
5. [Chart Registry System](#chart-registry-system)
6. [Admin Default Configuration](#admin-default-configuration)
7. [Component Hierarchy](#component-hierarchy)
8. [Critical Patterns & Gotchas](#critical-patterns--gotchas)
9. [Integration Points](#integration-points)
10. [Adding New Charts](#adding-new-charts)
11. [Performance Considerations](#performance-considerations)

---

## System Overview

### Technology Stack

```
React 18           - UI library with hooks
React Router v6    - Client-side routing
D3.js v7          - Data visualization and SVG rendering
Vite 5.x          - Build tool and development server
Tailwind CSS      - Utility-first styling
Vercel KV         - Redis-compatible storage (Upstash)
```

### Architecture Style

- **Frontend**: Single Page Application (SPA)
- **State Management**: Custom hooks with useState/useCallback/useMemo
- **Data Persistence**: Vercel KV for admin defaults, sessionStorage for user state
- **Chart Rendering**: D3.js with React ref-based SVG manipulation
- **Routing**: Client-side routing with React Router

### Key Design Principles

1. **Separation of Concerns**: Data, styling, and rendering are managed separately
2. **Composition**: Small, focused components composed together
3. **Declarative**: React components describe what to render, D3 handles how
4. **Extensibility**: Chart registry system makes adding new charts straightforward
5. **Defensive Programming**: Validation and fallbacks prevent crashes in production

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                           App.jsx                               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     AdminProvider                         │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │              React Router                           │  │  │
│  │  │                                                     │  │  │
│  │  │  Routes:                                            │  │  │
│  │  │  - /                     → Home                     │  │  │
│  │  │  - /chart/:chartType     → ChartEditor             │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       ChartEditor.jsx                           │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐        │
│  │ useChartData │  │useStyleSet...│  │  useAdmin      │        │
│  │   (667 lines)│  │  (1175 lines)│  │  (128 lines)   │        │
│  └──────────────┘  └──────────────┘  └────────────────┘        │
│         │                  │                   │                │
│         ↓                  ↓                   ↓                │
│  ┌───────────────────────────────────────────────────────┐     │
│  │         Orchestration & UI (6000 lines)               │     │
│  │  - Control Panel (Style/Data/Export tabs)             │     │
│  │  - Chart rendering coordination                       │     │
│  │  - Admin default loading                              │     │
│  │  - Import/Export functionality                        │     │
│  └───────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     Chart Components                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  BarChart    │  │  LineChart   │  │ SlopeChart   │          │
│  │  (1400 lines)│  │  (1200 lines)│  │  (900 lines) │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                  │                   │                │
│         ↓                  ↓                   ↓                │
│  ┌───────────────────────────────────────────────────────┐     │
│  │              D3.js Rendering Engine                   │     │
│  │  - SVG element manipulation                           │     │
│  │  - Scale calculations                                 │     │
│  │  - Axis generation                                    │     │
│  │  - Data binding and transitions                       │     │
│  └───────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                            │
│  ┌──────────────────┐              ┌──────────────────┐         │
│  │   Vercel KV      │              │  Google Sheets   │         │
│  │  (Upstash Redis) │              │  Public API      │         │
│  │  - Admin defaults│              │  - Data import   │         │
│  │  - SVG thumbnails│              │  - Auto-refresh  │         │
│  └──────────────────┘              └──────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. Application Initialization

```
User navigates to /chart/bar-horizontal
         ↓
React Router renders <ChartEditor chartType="bar-horizontal" />
         ↓
ChartEditor initializes hooks:
  - useChartData(chartType)
  - useStyleSettings()
  - useAdmin()
         ↓
Auto-load useEffect triggers
         ↓
admin.loadDefault(chartType) fetches from Vercel KV
         ↓
IF admin default exists:
  ├─→ chartData.loadCSVText(config.data.csv)
  └─→ styleSettings.importSettings(config.styleSettings, chartType)
ELSE:
  └─→ chartData.loadSampleData(defaultDatasetKey)
         ↓
Chart component receives data + styleSettings as props
         ↓
D3 renders SVG based on data + styles
```

### 2. User Edits Chart Style

```
User changes "Bar Color" in Control Panel
         ↓
styleSettings.setBarColor('#ff0000')
         ↓
State update triggers re-render
         ↓
chartStyleSettings useMemo recalculates
  (✅ ONLY if barColor is in dependency array!)
         ↓
Chart component receives new styleSettings
         ↓
useEffect in Chart detects prop change
         ↓
D3 updates SVG with new bar color
```

### 3. Admin Saves Default

```
Admin clicks "Save Default"
         ↓
ChartEditor captures current state:
  - chartData.data (current dataset)
  - styleSettings.exportSettings() (all style values)
  - SVG thumbnail (captured from svgRef)
         ↓
admin.saveDefault(chartType, configuration, svgThumbnail)
         ↓
POST /api/admin/save-default
  Headers: Authorization: Bearer {token}
  Body: { chartType, configuration, svgThumbnail }
         ↓
API validates admin token
         ↓
Vercel KV stores:
  - Key: `chart_default:${chartType}`
  - Value: JSON configuration + thumbnail
         ↓
Success response returned
         ↓
User sees "Default saved successfully" message
```

### 4. Reset View Flow

```
User clicks "Reset View" button
         ↓
handleResetView() async function
         ↓
Reset zoom/pan state
         ↓
admin.loadDefault(chartType)
         ↓
IF admin default found:
  ├─→ chartData.loadCSVText(config.data.csv)
  ├─→ styleSettings.importSettings(config.styleSettings, chartType)
  └─→ ✅ DON'T call applyViewportBasedSizing() (preserves canvas size)
ELSE:
  ├─→ clearEmphasis() (reset emphasis states)
  ├─→ styleSettings.setPercentChangeEnabled(false)
  └─→ applyViewportBasedSizing() (resize to viewport)
```

### 5. CSV Data Upload Flow

```
User selects CSV file
         ↓
chartData.loadCSVFile(file)
         ↓
parseCSV(file) using PapaParse
         ↓
validateCSVStructure(parsedData)
         ↓
IF validation fails:
  └─→ Show error message to user
ELSE:
  ├─→ setData(chartData)
  ├─→ setPeriodNames(extractedPeriods)
  ├─→ setRawCSV(fileText)
  └─→ setSource('csv-upload')
         ↓
Chart re-renders with new data
```

---

## State Management Architecture

### Custom Hooks Pattern

The application uses **two primary custom hooks** to manage all state:

#### 1. `useChartData` (667 lines)

**Location**: `src/shared/hooks/useChartData.js`

**Responsibility**: Manages all data-related state

```javascript
const chartData = useChartData(chartType);

// State managed:
chartData.data                  // Current chart data array
chartData.periodNames           // Array of period/metric names
chartData.editableData          // Editable version for data table
chartData.isComparisonMode      // true if multiple periods
chartData.hiddenPeriods         // Set of hidden period names
chartData.error                 // Error message if any
chartData.rawCSV                // Original CSV text
chartData.source                // 'sample', 'csv-upload', 'google-sheets'

// Methods:
chartData.loadSampleData(key)         // Load from sampleDatasets.js
chartData.loadCSVFile(file)           // Upload CSV file
chartData.loadCSVText(csvText)        // Load from text (admin defaults)
chartData.updateCell(rowIdx, col, val)// Edit single cell
chartData.addRow()                    // Add new row
chartData.removeRow(idx)              // Remove row
chartData.togglePeriodVisibility(name)// Show/hide period
```

**Key Implementation Details**:

- Automatically transforms flattened grouped-stacked format to Group/Period format
- Validates CSV structure before loading
- Maintains both `data` (for chart) and `editableData` (for table)
- Filters hidden rows automatically via useEffect

#### 2. `useStyleSettings` (1175 lines)

**Location**: `src/shared/hooks/useStyleSettings.js`

**Responsibility**: Manages all styling-related state

```javascript
const styleSettings = useStyleSettings();

// State managed:
// Typography (9 settings)
styleSettings.title, subtitle, fontFamily, titleFontSize, etc.

// Colors (5 settings)
styleSettings.barColor, comparisonPalette, userCustomColors, etc.

// Layout (11 settings)
styleSettings.canvasWidth, canvasHeight, orientation, aspectRatio, etc.

// Visual (4 settings)
styleSettings.axisLineWidth, backgroundOpacity, darkMode, backgroundColor

// Display (9 settings)
styleSettings.showLegend, compactNumbers, percentChangeEnabled, etc.

// Chart-specific (50+ settings)
// Bar: barMode, emphasizedBars, percentChangeBracketDistance, etc.
// Line: timeScale, showPoints, smoothLines, emphasizedPoints, etc.
// Slope: colorMode, lineThickness, periodSpacing, etc.

// Methods:
styleSettings.exportSettings()              // Serialize to JSON
styleSettings.importSettings(json, chartType) // Deserialize from JSON
styleSettings.resetToDefaults()             // Reset all to defaults
styleSettings.updateAspectRatio(ratio)      // Update canvas dimensions
```

**Key Implementation Details**:

- **Wrapped setters with logging**: `setPercentChangeEnabled` wrapped to trace all calls
- **Separate state for auto vs manual**: e.g., `axisMinimumAuto` + `axisMinimum`
- **Theme-aware defaults**: `handleSetDarkMode` syncs `axisColorBrightness`
- **Export/Import with validation**: `importSettings` validates palettes before setting

#### 3. `useAdmin` (AdminContext, 128 lines)

**Location**: `src/contexts/AdminContext.jsx`

**Responsibility**: Admin authentication and default management

```javascript
const admin = useAdmin();

// State:
admin.isAdmin      // Boolean admin status
admin.adminToken   // JWT token

// Methods:
admin.login(token)                                    // Authenticate
admin.logout()                                         // Clear session
admin.saveDefault(chartType, config, svgThumbnail)    // Save to Vercel KV
admin.loadDefault(chartType)                          // Fetch from Vercel KV
```

### State Export Format

When exporting settings, the structure is:

```javascript
{
  typography: {
    title: "...",
    subtitle: "...",
    fontFamily: "...",
    // ... 9 fields total
  },
  colors: {
    barColor: "#1e40af",
    comparisonPalette: "observable10",
    // ... 5 fields total
  },
  layout: {
    canvasWidth: 1000,
    canvasHeight: 600,
    orientation: "vertical",
    // ... 11 fields total
  },
  visual: {
    axisLineWidth: 3,
    backgroundOpacity: 100,
    // ... 4 fields total
  },
  display: {
    showLegend: true,
    compactNumbers: true,
    percentChangeEnabled: false,
    // ... 9 fields total
  },
  chartSpecific: {
    bar: {
      barMode: "grouped",
      emphasizedBars: ["East-Jan", "West-Feb"],
      percentChangeBracketDistance: 100,
      // ... 30+ bar-specific fields
    },
    line: {
      timeScale: "month",
      showPoints: true,
      // ... 30+ line-specific fields
    },
    slope: {
      colorMode: "category",
      lineThickness: 2,
      // ... 20+ slope-specific fields
    }
  }
}
```

---

## Chart Registry System

### Overview

The chart registry is a **centralized configuration system** that defines all available chart types and their metadata.

**Location**: `src/charts/registry.js`

### Registry Structure

```javascript
export const chartRegistry = {
  'bar-horizontal': {
    name: 'Bar Chart Horizontal',
    component: BarChart,
    icon: ChartBarIcon,
    description: 'Horizontal bar chart for comparing categories',
    supportsComparison: true,
    category: 'comparison',
    defaultSettings: {
      orientation: 'horizontal',
      barMode: 'grouped',
      showGrid: true,
    },
    defaultDataset: 'barHorizontalStyled',
  },
  // ... more chart types
};
```

### Chart Configuration Fields

| Field | Type | Purpose |
|-------|------|---------|
| `name` | string | Display name in UI |
| `component` | React Component | Chart component to render |
| `icon` | Heroicon | Icon for gallery and menu |
| `description` | string | Brief description for tooltips |
| `supportsComparison` | boolean | Can display multiple periods? |
| `category` | string | Category for grouping (comparison, trend, flow) |
| `defaultSettings` | object | Chart-specific default style settings |
| `defaultDataset` | string | Key for default sample data |

### Registry Functions

```javascript
// Get chart by key
const chart = getChart('bar-horizontal');
// Returns: { name, component, icon, ... }

// Get all chart keys
const keys = getChartKeys();
// Returns: ['bar-horizontal', 'line', 'slope', ...]

// Get charts by category
const comparisonCharts = getChartsByCategory('comparison');
// Returns: { 'bar-horizontal': {...}, 'slope': {...} }

// Check if chart supports comparison
const supports = supportsComparison('line');
// Returns: true

// Get default settings
const defaults = getDefaultSettings('bar-horizontal');
// Returns: { orientation: 'horizontal', barMode: 'grouped', ... }

// Validate chart key
const valid = isValidChartKey('bar-vertical');
// Returns: true
```

### How Charts are Loaded

1. User navigates to `/chart/bar-horizontal`
2. React Router passes `chartType="bar-horizontal"` to `<ChartEditor>`
3. ChartEditor calls `getChart(chartType)` from registry
4. Registry returns chart configuration object
5. ChartEditor renders `chart.component` with appropriate props

```jsx
// In ChartEditor.jsx
const { chartType } = useParams();
const chart = getChart(chartType);

// Render chart component dynamically
{chartType === 'bar-horizontal' && <BarChart data={data} styleSettings={styles} />}
{chartType === 'line' && <LineChart data={data} styleSettings={styles} />}
{chartType === 'slope' && <SlopeChart data={data} styleSettings={styles} />}
```

---

## Admin Default Configuration

### Storage Architecture

**Backend**: Vercel KV (Upstash Redis)
**Key Format**: `chart_default:{chartType}`
**Value**: JSON object with configuration + SVG thumbnail

### Configuration Structure

```javascript
{
  data: {
    csv: "Category,Jan,Feb,Mar\nEast,100,200,300\n...",
    periodNames: ["Jan", "Feb", "Mar"]
  },
  styleSettings: {
    typography: { ... },
    colors: { ... },
    layout: { ... },
    visual: { ... },
    display: { ... },
    chartSpecific: {
      bar: {
        emphasizedBars: ["East-Jan"],
        percentChangeEnabled: true,
        percentChangeBracketDistance: 100,
        // ... all bar-specific settings
      }
    }
  },
  svgThumbnail: "<svg>...</svg>",  // Base64 or raw SVG
  savedAt: "2025-01-15T10:30:00Z"
}
```

### Save Flow (Detailed)

```javascript
// 1. Capture current chart state
const configuration = {
  data: {
    csv: chartData.rawCSV,
    periodNames: chartData.periodNames,
  },
  styleSettings: styleSettings.exportSettings(),
  savedAt: new Date().toISOString(),
};

// 2. Capture SVG thumbnail
const svgElement = svgRef.current;
const svgString = new XMLSerializer().serializeToString(svgElement);

// 3. Send to API
const response = await fetch('/api/admin/save-default', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    chartType,
    configuration,
    svgThumbnail: svgString
  })
});

// 4. API stores in Vercel KV
await kv.set(`chart_default:${chartType}`, {
  configuration,
  svgThumbnail,
  updatedAt: new Date().toISOString()
});
```

### Load Flow (Detailed)

```javascript
// 1. Fetch from API
const response = await fetch(`/api/admin/get-default?chartType=${chartType}`);
const data = await response.json();

if (!data.success) {
  // No default exists, load sample data instead
  return null;
}

// 2. Extract configuration
const config = data.configuration;

// 3. Apply to chart
if (config.data?.csv) {
  await chartData.loadCSVText(config.data.csv);
}

if (config.styleSettings) {
  styleSettings.importSettings(config.styleSettings, chartType);
}

// ✅ DON'T clear emphasis states before importing
// ✅ DON'T resize canvas after importing (preserves saved dimensions)
```

### Critical Timing Pattern: Ref-Based Locking

**Problem**: Admin default loading competes with sample data loading, causing flash or incorrect data.

**Solution**: Use a ref to lock sample data loading until we know if admin default exists.

```javascript
// In ChartEditor.jsx
const hasLoadedDefaultFromDB = useRef(false);

// Auto-load useEffect (runs on mount)
useEffect(() => {
  // Set flag IMMEDIATELY (before async call)
  hasLoadedDefaultFromDB.current = true;

  const loadDefaultOnMount = async () => {
    const configuration = await admin.loadDefault(chartType);

    if (configuration) {
      // Apply admin default
      chartData.loadCSVText(configuration.data.csv);
      styleSettings.importSettings(configuration.styleSettings, chartType);
    } else {
      // No default found - clear lock to allow sample data
      hasLoadedDefaultFromDB.current = false;
    }

    setIsLoadingInitialDefault(false);
  };

  loadDefaultOnMount();
}, [chartType]);

// Sample data useEffect (blocked by ref)
useEffect(() => {
  // Don't load sample if admin default was loaded
  if (hasLoadedDefaultFromDB.current) {
    console.log('⏭️ Skipping sample data - admin default loaded');
    return;
  }

  // Safe to load sample data
  chartData.loadSampleData(defaultDatasetKey);
}, [chartType]);
```

**Why use a ref instead of state?**
- State updates are asynchronous
- Ref updates are synchronous and immediate
- Prevents race conditions where sample data loads before admin default check completes

---

## Component Hierarchy

### Top-Level Structure

```
App.jsx (Router + AdminProvider)
  ├─ Home.jsx (Gallery page)
  └─ ChartEditor.jsx (Main editor)
      ├─ Control Panel
      │   ├─ Style Tab
      │   ├─ Data Tab
      │   └─ Export Tab
      ├─ Chart Component (dynamic)
      │   ├─ BarChart.jsx
      │   ├─ LineChart.jsx
      │   ├─ SlopeChart.jsx
      │   └─ FunnelChart.jsx
      ├─ SpreadsheetDataTable
      ├─ SnapshotGallery
      └─ AdminLogin
```

### ChartEditor Responsibilities

**ChartEditor.jsx** (6000 lines) is the **orchestration layer** that:

1. **Manages all hooks**: useChartData, useStyleSettings, useAdmin
2. **Coordinates admin defaults**: Auto-load on mount, save functionality
3. **Renders control panel**: Style/Data/Export tabs
4. **Passes props to charts**: Merges data + styleSettings into chart-specific props
5. **Handles user interactions**: Reset view, export, import, snapshot gallery
6. **Manages viewport state**: Zoom, pan, canvas sizing

### Chart Component Interface

All chart components follow this contract:

```jsx
<BarChart
  data={chartData.data}
  periodNames={chartData.periodNames}
  styleSettings={chartStyleSettings}
  onBarClick={handleBarClick}
  onClearEmphasis={clearEmphasis}
/>
```

**Props:**
- `data`: Array of data objects
- `periodNames`: Array of period/metric names
- `styleSettings`: Merged style object from useStyleSettings
- `onBarClick` / `onPointClick`: Callback for emphasis interactions
- `onClearEmphasis`: Callback to clear all emphasis states

**Responsibilities:**
- Render SVG using D3.js
- Handle interactions (hover, click)
- Update on prop changes via useEffect
- Return SVG ref for export functionality

---

## Critical Patterns & Gotchas

### 1. useMemo Dependency Footgun ⚠️

**Problem**: Object references don't change even when their properties do.

```javascript
// ❌ WRONG - useMemo won't detect changes
const chartStyleSettings = useMemo(() => {
  return {
    title: styleSettings.title,
    barColor: styleSettings.barColor,
    // ... 50 more fields
  };
}, [styleSettings]);  // ❌ styleSettings object ref never changes!
```

**Why this fails:**
- `styleSettings` is the hook object returned by `useStyleSettings()`
- This object reference is created once and never changes
- When `setBarColor('#ff0000')` is called, only `barColor` state changes
- The `styleSettings` object itself is the same reference
- useMemo uses `===` comparison, sees same ref, doesn't recalculate
- Chart receives stale `barColor` value

**Solution**: Explicitly list all changing values in dependency array

```javascript
// ✅ CORRECT - useMemo detects individual value changes
const chartStyleSettings = useMemo(() => {
  return {
    title: styleSettings.title,
    barColor: styleSettings.barColor,
    percentChangeEnabled: styleSettings.percentChangeEnabled,
    emphasizedBars: styleSettings.emphasizedBars,
    // ... 50 more fields
  };
}, [
  styleSettings,
  styleSettings.title,
  styleSettings.barColor,
  styleSettings.percentChangeEnabled,
  styleSettings.emphasizedBars,
  // ... list ALL values that should trigger recalculation
]);
```

**Real-world impact:**
- Admin defaults not loading correctly (percentChangeEnabled stuck at `false`)
- Emphasized bars not displaying when loaded from defaults
- Bracket settings not applying when imported
- Any chart-specific setting not updating when changed

**See**: [ChartEditor.jsx:1848-1860](src/pages/ChartEditor.jsx#L1848-L1860) for detailed comment explaining this pattern.

### 2. Ref-Based Locking Pattern 🔒

**Problem**: Multiple data sources (admin defaults, sample data, URL params) compete during mount.

**Solution**: Use refs to coordinate async loading

```javascript
const hasLoadedDefaultFromDB = useRef(false);

// Primary loader (admin defaults)
useEffect(() => {
  // Lock IMMEDIATELY before async call
  hasLoadedDefaultFromDB.current = true;

  loadDefaultAsync().then(config => {
    if (config) {
      applyConfig(config);
    } else {
      // Unlock if no default found
      hasLoadedDefaultFromDB.current = false;
    }
  });
}, [chartType]);

// Secondary loader (sample data)
useEffect(() => {
  // Check lock before loading
  if (hasLoadedDefaultFromDB.current) {
    return; // Skip sample data
  }
  loadSampleData();
}, [chartType]);
```

**Why use refs not state:**
- Refs update synchronously (immediate)
- State updates are asynchronous (batched)
- Prevents race condition where sample data loads before admin check completes

### 3. Bracket Auto-Population Timing 🕐

**Problem**: Percentage change brackets need bar coordinates, which don't exist until D3 renders.

**Wrong approach:**
```javascript
useEffect(() => {
  if (percentChangeEnabled && emphasizedBars.length >= 2) {
    // ❌ Bars haven't rendered yet - coordinates will be undefined!
    autopopulateBrackets();
  }
}, [percentChangeEnabled, emphasizedBars]);
```

**Correct approach:**
```javascript
// Separate auto-population into its own useEffect
// IMPORTANT: Auto-populate brackets AFTER bars are rendered
useEffect(() => {
  // Only run AFTER initial render (renderedBarsDataRef.current is populated)
  if (Object.keys(renderedBarsDataRef.current).length === 0) {
    console.log('⏭️ Skipping - bars not rendered yet');
    return;
  }

  // Only auto-populate once per chart load
  if (hasAutoPopulatedRef.current) {
    console.log('⏭️ Skipping - already auto-populated');
    return;
  }

  if (percentChangeEnabled && emphasizedBars.length >= 2) {
    // ✅ Bars are rendered, coordinates are available
    autopopulateBrackets();
    hasAutoPopulatedRef.current = true;
  }
}, [percentChangeEnabled, emphasizedBars, renderedBarsDataRef.current]);
```

**Key insight**: D3 rendering happens in a useEffect. Auto-population must happen **after** that useEffect completes and `renderedBarsDataRef` is populated with bar coordinates.

### 4. D3 Color Scheme Tree-Shaking 🌳

**Problem**: Vite production builds tree-shake D3 color schemes when accessed via namespace.

```javascript
// ❌ Tree-shaken in production
import * as d3 from 'd3';
const colors = d3.schemeObservable10;  // undefined in production!
```

**Solution**: Import directly from d3-scale-chromatic

```javascript
// ✅ Never tree-shaken
import {
  schemeObservable10,
  schemeCategory10,
  schemeAccent,
  // ... all schemes
} from 'd3-scale-chromatic';

const colors = schemeObservable10;  // Always available
```

**Why this happens:**
- Vite's tree-shaker sees `d3.schemeObservable10` as dynamic property access
- Cannot statically analyze if it's used
- Assumes it's unused and removes it from bundle
- Direct imports are statically analyzable and preserved

**See**: [colorPalettes.js:1-20](src/shared/design-system/colorPalettes.js#L1-L20)

### 5. Palette Validation in importSettings 🎨

**Problem**: Admin defaults can contain palette names that don't exist (deleted, renamed, or invalid).

**Solution**: Validate palette exists before setting

```javascript
// In useStyleSettings.js importSettings()
if (settings.colors.comparisonPalette !== undefined) {
  const paletteValue = settings.colors.comparisonPalette;

  if (paletteValue === 'user') {
    // Special case: user custom colors
    setComparisonPalette(paletteValue);
  } else if (comparisonPalettes[paletteValue]) {
    const palette = comparisonPalettes[paletteValue];

    // Extra validation: ensure .colors exists and is non-empty array
    if (palette.colors && Array.isArray(palette.colors) && palette.colors.length > 0) {
      setComparisonPalette(paletteValue);
    } else {
      console.warn(`Palette "${paletteValue}" invalid, using default`);
      setComparisonPalette('observable10');
    }
  } else {
    console.warn(`Palette "${paletteValue}" not found, using default`);
    setComparisonPalette('observable10');
  }
}
```

**Prevents**:
- `Cannot read properties of undefined (reading 'colors')` crashes
- Chart rendering failures when palette is missing
- Production crashes from old admin defaults

**See**: [useStyleSettings.js:574-600](src/shared/hooks/useStyleSettings.js#L574-L600)

### 6. Defensive Color Access Pattern 🛡️

**Problem**: Chart components may try to access palette colors before validation completes.

**Solution**: Always check if palette exists before accessing

```javascript
// In chart component
const palette = comparisonPalettes[colorPalette];

if (!palette && colorPalette !== "user") {
  // Fallback to safe default color
  return '#1e40af';
}

// Safe to access palette.colors now
const colors = palette.colors;
```

**Applied in**:
- FunnelChart.jsx
- lineChartDefaults.js
- slopeChartDefaults.js
- All chart components that use comparison palettes

---

## Integration Points

### 1. AdminContext Integration

**Purpose**: Provide admin authentication and default configuration CRUD

**Integration Pattern**:
```javascript
// App.jsx wraps entire app
<AdminProvider>
  <Router>
    {/* All routes */}
  </Router>
</AdminProvider>

// Any component can access admin
const admin = useAdmin();
```

**API Methods**:
```javascript
// Authentication
admin.login(token)    // Set admin token, persist to sessionStorage
admin.logout()        // Clear token, remove from sessionStorage
admin.isAdmin         // Boolean admin status

// Defaults CRUD
admin.saveDefault(chartType, config, svg)  // POST /api/admin/save-default
admin.loadDefault(chartType)               // GET /api/admin/get-default?chartType=...
```

### 2. Hook Integration (ChartEditor ↔ Charts)

**ChartEditor** manages hooks and passes merged props to charts:

```javascript
// ChartEditor.jsx
const chartData = useChartData(chartType);
const styleSettings = useStyleSettings();

// Merge into chart-specific props
const chartStyleSettings = useMemo(() => ({
  ...styleSettings,
  // Add computed or chart-specific values
}), [/* all style values */]);

// Pass to chart
<BarChart
  data={chartData.data}
  periodNames={chartData.periodNames}
  styleSettings={chartStyleSettings}
/>
```

**Chart Component** receives props and renders:

```javascript
const BarChart = ({ data, periodNames, styleSettings }) => {
  const svgRef = useRef();

  useEffect(() => {
    // D3 rendering using data + styleSettings
    renderChart(svgRef.current, data, styleSettings);
  }, [data, periodNames, styleSettings]);

  return <svg ref={svgRef} />;
};
```

### 3. API Integration

**Endpoints**:
- `POST /api/admin/save-default` - Save admin default
- `GET /api/admin/get-default?chartType={type}` - Load admin default
- `POST /api/admin/login` - Admin authentication
- `POST /api/activate-license` - License activation

**Authentication**:
```javascript
headers: {
  'Authorization': `Bearer ${adminToken}`
}
```

**Error Handling**:
```javascript
const response = await fetch('/api/admin/save-default', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify(data)
});

const result = await response.json();

if (!response.ok || !result.success) {
  throw new Error(result.error || 'Failed to save');
}
```

### 4. External Data Integration

**Google Sheets**:
```javascript
// Load from Google Sheets public URL
const sheetData = await loadGoogleSheetsData(url);
chartData.loadCSVText(sheetData.csv);

// Auto-refresh every N minutes
setInterval(() => {
  loadGoogleSheetsData(url).then(data => {
    chartData.loadCSVText(data.csv);
  });
}, autoRefreshInterval * 60 * 1000);
```

---

## Adding New Charts

### Step-by-Step Guide

#### 1. Create Chart Component

**File**: `src/charts/MyChart/MyChart.jsx`

```javascript
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const MyChart = ({ data, periodNames, styleSettings = {} }) => {
  const svgRef = useRef();

  // Destructure styleSettings
  const {
    title = '',
    barColor = '#1e40af',
    canvasWidth = 800,
    canvasHeight = 600,
    // ... other settings
  } = styleSettings;

  // D3 rendering
  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);

    // Clear previous render
    svg.selectAll('*').remove();

    // Render chart...
    // (D3 code here)

  }, [data, periodNames, title, barColor, /* all used styleSettings */]);

  return (
    <svg
      ref={svgRef}
      width={canvasWidth}
      height={canvasHeight}
    />
  );
};

export default MyChart;
```

#### 2. Register Chart

**File**: `src/charts/registry.js`

```javascript
import MyChart from './MyChart/MyChart';

export const chartRegistry = {
  // ... existing charts

  'my-chart': {
    name: 'My Chart',
    component: MyChart,
    icon: ChartBarIcon,  // Import from Heroicons
    description: 'Description of my chart',
    supportsComparison: true,  // or false
    category: 'comparison',    // or 'trend', 'flow', etc.
    defaultSettings: {
      // Chart-specific defaults
      mySpecificSetting: 'value',
    },
    defaultDataset: 'myDefaultDataset',  // Key in sampleDatasets.js
  },
};
```

#### 3. Add Sample Dataset (Optional)

**File**: `src/shared/data/sampleDatasets.js`

```javascript
export const sampleDatasets = {
  // ... existing datasets

  myDefaultDataset: {
    name: 'My Sample Data',
    data: [
      { Category: 'A', Value1: 100, Value2: 200 },
      { Category: 'B', Value1: 150, Value2: 250 },
    ],
    description: 'Sample data for my chart',
  },
};
```

#### 4. Add Chart-Specific Settings to useStyleSettings

**File**: `src/shared/hooks/useStyleSettings.js`

```javascript
// Add state for chart-specific settings
const [myChartSetting, setMyChartSetting] = useState('default');

// Add to exportSettings() in chartSpecific section
chartSpecific: {
  myChart: {
    myChartSetting,
    // ... other settings
  },
  // ... other chart types
}

// Add to importSettings() for cross-chart compatibility
if (currentChartType === 'my-chart' && settings.chartSpecific.myChart) {
  const mySettings = settings.chartSpecific.myChart;
  if (mySettings.myChartSetting !== undefined) {
    setMyChartSetting(mySettings.myChartSetting);
  }
}
```

#### 5. Add Chart Rendering to ChartEditor

**File**: `src/pages/ChartEditor.jsx`

```javascript
// Import your chart
import MyChart from '../charts/MyChart/MyChart';

// Add to chart rendering section (around line 4000)
{chartType === 'my-chart' && (
  <MyChart
    data={chartData.data}
    periodNames={chartData.periodNames}
    styleSettings={chartStyleSettings}
  />
)}
```

#### 6. Add Control Panel Sections (Optional)

**File**: `src/pages/ChartEditor.jsx`

Create chart-specific control panel sections around line 3000:

```javascript
{chartType === 'my-chart' && (
  <div>
    <h3>My Chart Settings</h3>
    <label>
      My Setting:
      <input
        type="text"
        value={styleSettings.myChartSetting}
        onChange={(e) => styleSettings.setMyChartSetting(e.target.value)}
      />
    </label>
  </div>
)}
```

#### 7. Test Your Chart

```bash
npm run dev
```

Navigate to: `http://localhost:5173/chart/my-chart`

**Test checklist**:
- [ ] Chart renders with sample data
- [ ] Chart updates when data changes
- [ ] Chart updates when style settings change
- [ ] Export to PNG/SVG works
- [ ] Admin defaults save and load correctly
- [ ] Reset View works
- [ ] CSV upload works
- [ ] No console errors

---

## Performance Considerations

### 1. useMemo for Expensive Calculations

Use `useMemo` to cache expensive computations:

```javascript
const processedData = useMemo(() => {
  // Expensive data transformation
  return data.map(d => ({
    ...d,
    calculatedValue: complexCalculation(d)
  }));
}, [data]);  // Only recalculate when data changes
```

### 2. useCallback for Event Handlers

Prevent unnecessary re-renders by memoizing callbacks:

```javascript
const handleBarClick = useCallback((barId) => {
  setEmphasizedBars(prev => [...prev, barId]);
}, []);  // Stable reference
```

### 3. Throttle Rapid State Updates

For slider inputs that update rapidly:

```javascript
import { throttle } from '../shared/utils/performanceUtils';

const handleSliderChange = throttle((value) => {
  styleSettings.setBarWidth(value);
}, 100);  // Update at most every 100ms
```

### 4. Conditional D3 Updates

Only update what changed:

```javascript
useEffect(() => {
  const svg = d3.select(svgRef.current);

  // Update only bars, not entire chart
  svg.selectAll('.bar')
    .data(data)
    .attr('fill', barColor);  // Only update color

}, [barColor]);  // Don't re-render entire chart for color change

useEffect(() => {
  // Full re-render only when data changes
  renderFullChart();
}, [data]);
```

### 5. Lazy Loading Charts

Charts are only loaded when navigated to (React Router lazy loading):

```javascript
// Future optimization
const BarChart = React.lazy(() => import('./charts/BarChart/BarChart'));
```

### 6. Minimize ChartEditor Re-renders

ChartEditor is 6000 lines - minimize its re-renders:

```javascript
// Extract heavy components into separate files
const ControlPanel = React.memo(({ ... }) => { ... });
const DataTable = React.memo(({ ... }) => { ... });

// Use in ChartEditor
<ControlPanel styleSettings={styleSettings} />
<DataTable data={chartData.data} />
```

---

## Next Steps

For more detailed information, see:

- [PATTERNS.md](PATTERNS.md) - Common patterns and anti-patterns
- [STATE-MANAGEMENT.md](STATE-MANAGEMENT.md) - Deep dive into state architecture
- [ADDING-CHARTS.md](ADDING-CHARTS.md) - Complete guide to adding new chart types
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues and solutions
- [API-REFERENCE.md](API-REFERENCE.md) - Complete API documentation

---

**Last Updated**: 2025-01-18
**Maintainer**: Matthew (Find & Tell)
**Status**: Production-Ready Knowledge Base
