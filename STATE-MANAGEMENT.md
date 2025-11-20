# State Management Guide

Deep dive into the state architecture and management patterns used throughout the Funnel Viz application.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Hook-Based State Management](#hook-based-state-management)
3. [Data State (useChartData)](#data-state-usechartdata)
4. [Style State (useStyleSettings)](#style-state-usestylesettings)
5. [State Flow Through the System](#state-flow-through-the-system)
6. [State Persistence & Snapshots](#state-persistence--snapshots)
7. [Admin Defaults Loading](#admin-defaults-loading)
8. [Best Practices](#best-practices)
9. [Common Pitfalls](#common-pitfalls)
10. [Debugging State Issues](#debugging-state-issues)

---

## Architecture Overview

### Core Principles

The application uses a **hook-based state management architecture** built on React hooks:

1. **Separation of Concerns**
   - **Data state**: Managed by `useChartData` (data, periods, editing)
   - **Style state**: Managed by `useStyleSettings` (all visual settings)
   - **Chart logic**: Encapsulated in individual chart components

2. **Single Source of Truth**
   - Each chart component imports hooks at the top level
   - State flows down through props
   - Updates flow up through setter functions

3. **Immutability**
   - State updates create new objects/arrays
   - Never mutate state directly
   - Use spread operators and array methods

### State Hierarchy

```
App
├── Chart Component (FunnelChart, BarChart, etc.)
│   ├── useChartData() → Data state
│   │   ├── data: Array<Object>
│   │   ├── periodNames: string[]
│   │   ├── editableData: Array<Object>
│   │   └── Actions (loadSampleData, updateDataValue, etc.)
│   │
│   └── useStyleSettings() → Style state
│       ├── Typography (title, subtitle, fontFamily, sizes)
│       ├── Colors (barColor, comparisonPalette, customColors)
│       ├── Layout (dimensions, orientation, padding)
│       ├── Visual (opacity, line widths)
│       ├── Display (emphasis, compact numbers, legends)
│       ├── Chart-specific settings (bar, slope, line)
│       └── Actions (exportSettings, importSettings, reset)
│
└── D3 Rendering (triggered by state changes)
```

---

## Hook-Based State Management

### Why Hooks?

**Benefits:**
- ✅ **Reusable** - Same hooks work across all chart types
- ✅ **Testable** - Easy to test in isolation
- ✅ **Composable** - Combine multiple hooks in components
- ✅ **Type-safe** - Clear interfaces and return values
- ✅ **Co-located** - Logic lives with related functionality

**Pattern:**
```javascript
// Chart component
const MyChart = () => {
  // Import state hooks
  const chartData = useChartData('bar');
  const styleSettings = useStyleSettings();

  // Use state in rendering
  useEffect(() => {
    if (!chartData.data) return;

    // Render chart with data and settings
    renderChart(chartData.data, styleSettings);
  }, [chartData.data, styleSettings]);

  return <svg ref={svgRef} />;
};
```

### Hook Dependencies

**Critical Pattern:** Always include ALL used values in dependency arrays

```javascript
// ❌ WRONG - Missing dependencies
useEffect(() => {
  renderChart(data, width, height);
}, [data]); // width and height changes won't trigger re-render!

// ✅ CORRECT - All dependencies included
useEffect(() => {
  renderChart(data, width, height);
}, [data, width, height]);
```

See [PATTERNS.md#pattern-usememo-with-explicit-dependencies](PATTERNS.md#pattern-usememo-with-explicit-dependencies) for more details.

---

## Data State (useChartData)

### Overview

`useChartData` manages all data-related state:
- Chart data (rows and columns)
- Period/metric names
- Data editing and manipulation
- CSV loading and parsing
- Sample data loading

### State Structure

```javascript
{
  // Primary data state
  data: [                          // Filtered, visible data for chart rendering
    { Category: "East", Jan: 100, Feb: 150 },
    { Category: "West", Jan: 200, Feb: 250 }
  ],

  editableData: [                  // Unfiltered data for data table (includes hidden rows)
    { Category: "East", Jan: 100, Feb: 150, hidden: false },
    { Category: "West", Jan: 200, Feb: 250, hidden: true }
  ],

  periodNames: ["Jan", "Feb"],     // Column names (metrics/periods)

  // Mode flags
  isComparisonMode: false,         // true if showing multiple periods

  // Hidden elements
  hiddenPeriods: Set(),            // Set of hidden column names

  // Data source tracking
  rawCSV: "",                      // Original CSV string (for save/load)
  source: "sample",                // "sample", "csv-upload", "csv-paste", "google-sheets"
  googleSheetsUrl: "",

  // Metadata
  error: null,                     // Error message if loading fails
  hasData: true,                   // Computed: data !== null && data.length > 0
  stageCount: 2,                   // Computed: data?.length || 0
  periodCount: 2,                  // Computed: periodNames.length
}
```

### Key Patterns

#### 1. Dual Data Storage (data vs editableData)

**Why two arrays?**
- `editableData` - Source of truth, includes hidden rows
- `data` - Filtered copy for chart rendering

```javascript
// Automatically sync data from editableData (filtering hidden rows)
useEffect(() => {
  if (editableData && editableData.length > 0) {
    const visibleData = editableData.filter(row => !row.hidden);
    setData(structuredClone(visibleData));
  }
}, [editableData]);
```

**Pattern:**
- User edits → Update `editableData`
- Chart renders → Uses `data` (auto-filtered)

#### 2. Immutable Updates

**Always create new objects/arrays:**

```javascript
// ✅ CORRECT - Update data value
const updateDataValue = useCallback((stageIndex, periodKey, value) => {
  setEditableData((prev) => {
    const updated = [...prev];                    // New array
    updated[stageIndex] = {
      ...updated[stageIndex],                    // New object
      [periodKey]: value,
    };
    return updated;
  });
}, []);

// ❌ WRONG - Direct mutation
const updateDataValue = (stageIndex, periodKey, value) => {
  editableData[stageIndex][periodKey] = value;   // Direct mutation!
  setEditableData(editableData);                 // React won't detect change
};
```

#### 3. Loading Data

**Pattern:** Each loader returns boolean success/failure

```javascript
// Load sample dataset
const loadSampleData = useCallback((datasetKey) => {
  const dataset = getSampleDataset(datasetKey);
  if (!dataset) {
    setError("Sample dataset not found");
    return false;  // ❌ Failed
  }

  setData(dataset.data);
  setPeriodNames(dataset.periodNames);
  setError(null);
  return true;  // ✅ Success
}, []);

// Usage in component
const handleLoadSample = async () => {
  const success = chartData.loadSampleData('barSimple');
  if (success) {
    console.log('✅ Data loaded successfully');
  } else {
    console.error('❌ Failed to load data');
  }
};
```

### Available Actions

```javascript
const {
  // Data loaders
  loadSampleData,           // Load from src/shared/data/sampleDatasets.js
  loadCSVFile,              // Load from File object
  loadCSVText,              // Load from string (paste)
  loadSnapshotData,         // Load from saved snapshot

  // Data editing
  updateDataValue,          // Update cell value
  updateStageName,          // Update row name
  updatePeriodName,         // Update column name

  // Row operations
  addStage,                 // Add new row
  removeStage,              // Remove row
  reorderStages,            // Drag and drop rows
  toggleStageHidden,        // Show/hide row
  sortByPeriod,             // Sort rows by column values

  // Column operations
  addPeriod,                // Add new column
  removePeriod,             // Remove column
  reorderPeriods,           // Reorder columns
  setPeriodOrder,           // Set column order from array
  togglePeriodHidden,       // Show/hide column

  // Data manipulation
  transposeData,            // Swap rows and columns
  applyEdits,               // Apply edits to main data
  resetEdits,               // Discard edits
  clearData,                // Clear all data

  // Getters
  getPeriodData,            // Get data for specific column
  getStageData,             // Get data for specific row
} = useChartData();
```

---

## Style State (useStyleSettings)

### Overview

`useStyleSettings` manages all visual styling:
- Typography (fonts, sizes, alignments)
- Colors (palettes, gradients, custom colors)
- Layout (dimensions, spacing, orientation)
- Chart-specific settings (bar mode, line style, etc.)

### State Structure

**Organized by category:**

```javascript
{
  // Typography
  typography: {
    title: "Units Produced by Region",
    subtitle: "Production units by regional location",
    titleAlignment: "center",        // "left" | "center"
    fontFamily: "Inter",
    titleFontSize: 28,
    subtitleFontSize: 20,
    legendFontSize: 14,
    // ... more font sizes
  },

  // Colors
  colors: {
    barColor: "#1e40af",            // Single bar color
    colorTransition: 60,            // Gradient transition %
    comparisonPalette: "observable10", // Palette key
    userCustomColors: ["#...", "#..."],
  },

  // Layout
  layout: {
    orientation: "vertical",        // "vertical" | "horizontal"
    aspectRatio: "1:1",             // "1:1" | "16:9" | "4:3" | etc.
    canvasWidth: 1000,
    canvasHeight: 600,
    chartWidth: 600,
    chartHeight: 400,
    chartPadding: 15,
    stageGap: 10,
    barWidth: 100,
  },

  // Visual
  visual: {
    axisLineWidth: 3,
    backgroundOpacity: 100,
    darkMode: false,
    backgroundColor: "#ffffff",
  },

  // Display
  display: {
    emphasis: "throughput",
    normalizeToHundred: true,
    compactNumbers: true,
    showLegend: true,
    legendPosition: "direct",
    percentChangeEnabled: false,
    percentChangeLabelFormat: "percent",
  },

  // Chart-specific settings (nested by chart type)
  chartSpecific: {
    bar: { barMode, labelMode, emphasizedBars, ... },
    slope: { colorMode, lineThickness, ... },
    line: { timeScale, smoothLines, ... },
    funnel: { ... }
  }
}
```

### Key Patterns

#### 1. Universal vs Chart-Specific Settings

**Universal settings** apply to all charts:
- Typography (title, subtitle, fonts)
- Colors (palettes, custom colors)
- Layout (dimensions)
- Visual (dark mode, background)

**Chart-specific settings** only apply to certain charts:
- `chartSpecific.bar` - Only for bar charts
- `chartSpecific.slope` - Only for slope charts
- `chartSpecific.line` - Only for line/area charts

```javascript
// ✅ Smart import - Only imports relevant settings
const importSettings = useCallback((settings, currentChartType = 'bar') => {
  // Import universal settings (always)
  if (settings.typography) {
    setTitle(settings.typography.title);
    setFontFamily(settings.typography.fontFamily);
    // ...
  }

  // Import chart-specific settings (conditional)
  if (currentChartType === 'bar' && settings.chartSpecific.bar) {
    setBarMode(settings.chartSpecific.bar.barMode);
    setEmphasizedBars(settings.chartSpecific.bar.emphasizedBars);
    // ...
  }
}, []);
```

#### 2. Export/Import Pattern

**Export** creates complete snapshot:

```javascript
const exportSettings = useCallback(() => {
  return {
    styleVersion: "1.0",
    appVersion: "2.0.0",
    typography: { title, subtitle, fontFamily, ... },
    colors: { barColor, comparisonPalette, ... },
    layout: { orientation, canvasWidth, ... },
    visual: { darkMode, backgroundColor, ... },
    display: { emphasis, compactNumbers, ... },
    chartSpecific: {
      bar: { barMode, emphasizedBars, ... },
      slope: { colorMode, lineThickness, ... },
      line: { smoothLines, showPoints, ... },
    },
  };
}, [/* ALL state variables */]);
```

**Import** validates and applies settings:

```javascript
const importSettings = useCallback((settings, currentChartType) => {
  // Validate palette before setting
  if (settings.colors.comparisonPalette !== undefined) {
    const paletteValue = settings.colors.comparisonPalette;

    if (paletteValue === 'user') {
      setComparisonPalette(paletteValue);
    } else if (comparisonPalettes[paletteValue]) {
      // Check that palette has valid colors array
      if (palette.colors && Array.isArray(palette.colors)) {
        setComparisonPalette(paletteValue);
      } else {
        // Fallback to safe default
        setComparisonPalette('observable10');
      }
    }
  }

  // Import other settings...
}, []);
```

#### 3. Aspect Ratio Updates

**Pattern:** Updating aspect ratio automatically updates canvas dimensions

```javascript
const updateAspectRatio = useCallback((ratio) => {
  setAspectRatio(ratio);
  const dimensions = theme.layout.aspectRatios[ratio];
  setCanvasWidth(dimensions.width);
  setCanvasHeight(dimensions.height);
}, []);

// Usage
updateAspectRatio("16:9");  // Sets ratio + updates width/height
```

#### 4. Dark Mode Syncing

**Pattern:** Dark mode automatically syncs axis color

```javascript
const handleSetDarkMode = useCallback((value) => {
  setDarkMode(value);
  // Auto-sync axis color with theme
  if (value) {
    setAxisColorBrightness(100); // White for dark mode
  } else {
    setAxisColorBrightness(0);   // Black for light mode
  }
}, []);
```

### Available Actions

```javascript
const {
  // Typography setters
  setTitle,
  setSubtitle,
  setFontFamily,
  setTitleFontSize,
  // ... all typography setters

  // Color setters
  setBarColor,
  setComparisonPalette,
  setUserCustomColors,
  // ...

  // Layout setters
  setOrientation,
  updateAspectRatio,  // Special: updates multiple values
  setChartWidth,
  // ...

  // Actions
  resetToDefaults,    // Reset all settings to defaults
  exportSettings,     // Export as JSON object
  importSettings,     // Import from JSON object
} = useStyleSettings();
```

---

## State Flow Through the System

### Typical Flow

```
1. User Action (e.g., click "Load Sample Data")
   ↓
2. Event Handler calls hook action
   chartData.loadSampleData('barSimple')
   ↓
3. Hook updates state
   setData(newData)
   setPeriodNames(newPeriods)
   ↓
4. React detects state change
   Component re-renders
   ↓
5. useEffect with data dependency triggers
   useEffect(() => { renderChart() }, [data])
   ↓
6. D3 renders chart with new data
   svg.selectAll('*').remove()
   // Render new visualization
```

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        User Actions                         │
│  (Upload CSV, Load Sample, Edit Value, Change Setting)     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                     Event Handlers                          │
│  handleLoadSample(), handleUpdateValue(), etc.             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    Hook Actions                             │
│  chartData.loadSampleData()                                │
│  chartData.updateDataValue()                               │
│  styleSettings.setBarColor()                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    React State                              │
│  useState() hooks update internal state                    │
│  React detects changes and schedules re-render            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                Component Re-render                          │
│  React calls component function with new state             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              useEffect Dependencies Trigger                 │
│  useEffect(() => { ... }, [data, styleSettings])          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    D3 Rendering                             │
│  Clear previous render: svg.selectAll('*').remove()        │
│  Render new visualization with updated state              │
└─────────────────────────────────────────────────────────────┘
```

### Example: Loading Admin Defaults

**Step-by-step flow:**

```javascript
// 1. User clicks "Load Admin Defaults"
const handleLoadAdminDefaults = () => {
  // 2. Import settings (but DON'T clear emphasis first!)
  styleSettings.importSettings(adminDefaults);

  // 3. importSettings calls multiple setters
  //    Each setter updates a piece of state
  setTitle(adminDefaults.typography.title);
  setBarColor(adminDefaults.colors.barColor);
  setEmphasizedBars(adminDefaults.chartSpecific.bar.emphasizedBars);
  // ...

  // 4. React batches state updates and re-renders once

  // 5. useEffect detects changes and re-renders chart
  useEffect(() => {
    renderChart(data, styleSettings);
  }, [data, styleSettings]);
};
```

**Critical:** Don't clear state before importing!

```javascript
// ❌ WRONG - Clears emphasis before import
const handleLoadDefaults = () => {
  clearEmphasis();              // Clears emphasizedBars to []
  importSettings(defaults);     // Sets emphasizedBars from defaults
  // Result: emphasizedBars ends up as [] (cleared)
};

// ✅ CORRECT - Only import
const handleLoadDefaults = () => {
  importSettings(defaults);     // Sets emphasizedBars from defaults
  // Result: emphasizedBars = defaults.emphasizedBars ✓
};
```

---

## State Persistence & Snapshots

### localStorage Pattern

**Save settings:**

```javascript
const saveToLocalStorage = () => {
  const settings = styleSettings.exportSettings();
  localStorage.setItem('chartSettings', JSON.stringify(settings));
};
```

**Load settings:**

```javascript
useEffect(() => {
  const saved = localStorage.getItem('chartSettings');
  if (saved) {
    const settings = JSON.parse(saved);
    styleSettings.importSettings(settings, chartType);
  }
}, []); // Run once on mount
```

### Snapshot System

**Save complete state:**

```javascript
const createSnapshot = () => {
  return {
    data: chartData.data,
    periodNames: chartData.periodNames,
    isComparisonMode: chartData.isComparisonMode,
    styleSettings: styleSettings.exportSettings(),
    timestamp: new Date().toISOString(),
  };
};
```

**Restore snapshot:**

```javascript
const restoreSnapshot = (snapshot) => {
  // Restore data state
  chartData.loadSnapshotData(
    snapshot.data,
    snapshot.periodNames,
    snapshot.isComparisonMode
  );

  // Restore style settings
  styleSettings.importSettings(snapshot.styleSettings);
};
```

### CSV State Tracking

**Pattern:** Track raw CSV for save/load functionality

```javascript
const [rawCSV, setRawCSV] = useState('');
const [source, setSource] = useState('sample'); // 'sample', 'csv-upload', etc.

// When loading CSV
const loadCSVFile = async (file) => {
  const fileText = await file.text();
  const parsedData = await parseCSV(file);

  setData(parsedData);
  setRawCSV(fileText);        // Store original CSV
  setSource('csv-upload');    // Track source
};

// Export data as CSV
const exportCSV = () => {
  return rawCSV; // Return original CSV string
};
```

---

## Admin Defaults Loading

### The Problem

Admin defaults are pre-configured settings that should load **completely**, including:
- All typography settings
- All color settings
- Emphasized bars, emphasis settings
- Chart-specific configurations

**Common bug:** Settings get cleared before importing, losing data!

### The Solution

**Pattern:** Import settings WITHOUT clearing first

```javascript
// ✅ CORRECT Pattern
const loadAdminDefaults = () => {
  // 1. Import ALL settings (including emphasis)
  importSettings(adminDefaults, chartType);

  // 2. Don't call clearEmphasis() or resetToDefaults()
  //    Let importSettings handle everything
};
```

### Debug Workflow

**Add logging to track state flow:**

```javascript
const importSettings = useCallback((settings, currentChartType) => {
  console.log('[importSettings] Input settings:', settings);
  console.log('[importSettings] emphasizedBars value:',
    settings.chartSpecific?.bar?.emphasizedBars);

  // Import settings
  if (settings.chartSpecific?.bar?.emphasizedBars !== undefined) {
    console.log('[importSettings] Setting emphasizedBars to:',
      settings.chartSpecific.bar.emphasizedBars);
    setEmphasizedBars(settings.chartSpecific.bar.emphasizedBars);
  }

  console.log('[importSettings] ✅ Import complete');
}, []);

// Track state changes
useEffect(() => {
  console.log('[emphasizedBars] State changed to:', emphasizedBars);
}, [emphasizedBars]);
```

### Common Issues

**Issue 1: Viewport sizing overrides dimensions**

```javascript
// ❌ WRONG - Resizes after import
importSettings(defaults);
applyViewportBasedSizing(); // Overrides imported dimensions!

// ✅ CORRECT - Don't resize when importing
const isImporting = true;
importSettings(defaults);
if (!isImporting) {
  applyViewportBasedSizing();
}
```

**Issue 2: useMemo not detecting changes**

```javascript
// ❌ WRONG - Generic dependency
const chartConfig = useMemo(() => {
  return { barColor, fontSize };
}, [styleSettings]); // Object reference might not change!

// ✅ CORRECT - Explicit dependencies
const chartConfig = useMemo(() => {
  return { barColor, fontSize };
}, [barColor, fontSize]); // Specific values
```

---

## Best Practices

### 1. Always Use Immutable Updates

```javascript
// ✅ CORRECT - Create new objects
setData(prev => [...prev, newItem]);
setSettings(prev => ({ ...prev, color: newColor }));

// ❌ WRONG - Mutate existing
data.push(newItem);
setData(data); // React won't detect change!
```

### 2. Include All Dependencies in useEffect

```javascript
// ✅ CORRECT - All dependencies
useEffect(() => {
  renderChart(data, width, height, colors);
}, [data, width, height, colors]);

// ❌ WRONG - Missing dependencies
useEffect(() => {
  renderChart(data, width, height, colors);
}, [data]); // width, height, colors changes won't trigger!
```

### 3. Use Callback for Complex Updates

```javascript
// ✅ CORRECT - Access previous state safely
const updateValue = useCallback((index, value) => {
  setData(prev => {
    const updated = [...prev];
    updated[index] = { ...updated[index], value };
    return updated;
  });
}, []);

// ❌ WRONG - Stale closure
const updateValue = (index, value) => {
  const updated = [...data];  // Might be stale!
  updated[index] = { ...updated[index], value };
  setData(updated);
};
```

### 4. Validate Before Setting State

```javascript
// ✅ CORRECT - Validate before setting
const setPalette = (paletteKey) => {
  if (paletteKey === 'user' || comparisonPalettes[paletteKey]) {
    setComparisonPalette(paletteKey);
  } else {
    console.warn(`Invalid palette: ${paletteKey}, using default`);
    setComparisonPalette('observable10');
  }
};

// ❌ WRONG - Set without validation
const setPalette = (paletteKey) => {
  setComparisonPalette(paletteKey); // Might be invalid!
};
```

### 5. Structure State Logically

```javascript
// ✅ CORRECT - Grouped by category
const exportSettings = () => ({
  typography: { title, subtitle, fonts },
  colors: { palette, customColors },
  layout: { width, height, orientation },
});

// ❌ WRONG - Flat structure
const exportSettings = () => ({
  title, subtitle, fonts, palette, customColors, width, height, orientation
});
```

### 6. Use Ref for Non-Render State

```javascript
// ✅ CORRECT - Use ref for values that don't affect rendering
const hasAutoPopulatedRef = useRef(false);
const renderedBarsDataRef = useRef({});

// ❌ WRONG - useState for non-render values (causes unnecessary re-renders)
const [hasAutoPopulated, setHasAutoPopulated] = useState(false);
```

---

## Common Pitfalls

### Pitfall 1: Forgetting Dependencies

**Problem:**

```javascript
useEffect(() => {
  // Uses multiple values but only lists one dependency
  renderChart(data, width, height);
}, [data]); // width, height changes ignored!
```

**Solution:**

```javascript
useEffect(() => {
  renderChart(data, width, height);
}, [data, width, height]); // All dependencies ✓
```

### Pitfall 2: Mutating State Directly

**Problem:**

```javascript
const updateRow = (index, value) => {
  data[index].value = value;  // Direct mutation!
  setData(data);              // React won't detect change
};
```

**Solution:**

```javascript
const updateRow = (index, value) => {
  setData(prev => {
    const updated = [...prev];           // New array
    updated[index] = {
      ...updated[index],                 // New object
      value
    };
    return updated;
  });
};
```

### Pitfall 3: State Update Race Conditions

**Problem:**

```javascript
// Multiple state updates in sequence
setData(newData);
setPeriodNames(newPeriods);
setIsComparisonMode(true);
// useEffect fires 3 times!
```

**Solution:**

```javascript
// Batch updates with functional setters
setData(newData);
setPeriodNames(newPeriods);
setIsComparisonMode(true);
// React batches these automatically in event handlers
```

Or use a reducer for complex state:

```javascript
const [state, dispatch] = useReducer(reducer, initialState);

dispatch({
  type: 'LOAD_DATA',
  payload: { data, periodNames, isComparisonMode }
});
// Single update, single re-render
```

### Pitfall 4: Stale Closures

**Problem:**

```javascript
const incrementCounter = () => {
  setTimeout(() => {
    setCount(count + 1); // Uses stale 'count' value!
  }, 1000);
};
```

**Solution:**

```javascript
const incrementCounter = () => {
  setTimeout(() => {
    setCount(prev => prev + 1); // Always uses latest value ✓
  }, 1000);
};
```

### Pitfall 5: Clearing State Before Import

**Problem:**

```javascript
const loadDefaults = () => {
  clearEmphasis();          // Clears emphasizedBars = []
  importSettings(defaults); // Sets emphasizedBars from defaults
  // Result: emphasizedBars stays [] (cleared wins!)
};
```

**Solution:**

```javascript
const loadDefaults = () => {
  importSettings(defaults); // Just import, don't clear first ✓
};
```

---

## Debugging State Issues

### 1. Add Console Logging

```javascript
// Log state changes
useEffect(() => {
  console.log('[State Changed] emphasizedBars:', emphasizedBars);
}, [emphasizedBars]);

// Log setter calls
const setEmphasizedBars = (value) => {
  console.log('[setEmphasizedBars] Called with:', value);
  console.trace(); // Show call stack
  _setEmphasizedBars(value);
};
```

### 2. Use React DevTools

1. Install React DevTools browser extension
2. Open DevTools → Components tab
3. Find your component
4. Inspect hooks and state values
5. Track re-renders with Profiler

### 3. Check Dependency Arrays

```javascript
// Temporarily add exhaustive-deps check
/* eslint-disable react-hooks/exhaustive-deps */
useEffect(() => {
  // Effect logic
}, []); // Check if this should have dependencies
/* eslint-enable react-hooks/exhaustive-deps */
```

### 4. Debug State Flow

```javascript
// Add debug wrapper around state setters
const debugSetter = (setterName, setter) => {
  return (value) => {
    console.log(`[${setterName}] Before:`, getState());
    setter(value);
    console.log(`[${setterName}] After:`, value);
  };
};

const setTitle = debugSetter('setTitle', _setTitle);
```

### 5. Verify State Structure

```javascript
// Export and log complete state
const debugState = () => {
  const currentState = {
    data: chartData.data,
    periodNames: chartData.periodNames,
    settings: styleSettings.exportSettings(),
  };

  console.log('[Current State]', JSON.stringify(currentState, null, 2));
  return currentState;
};

// Call in console or add to component
window.debugState = debugState;
```

### 6. Check for Memory Leaks

```javascript
useEffect(() => {
  // Set up effect
  const subscription = api.subscribe();

  // CRITICAL: Clean up on unmount
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

---

## Quick Reference

### State Hook Cheat Sheet

```javascript
// Data Hook
const {
  data,                    // Current chart data (filtered)
  editableData,            // Editable data (includes hidden)
  periodNames,             // Column names
  loadSampleData,          // Load sample dataset
  loadCSVFile,             // Load from file
  updateDataValue,         // Update cell
  addStage,                // Add row
  removePeriod,            // Remove column
  transposeData,           // Swap rows/columns
} = useChartData(chartType);

// Style Hook
const {
  title, setTitle,         // Chart title
  barColor, setBarColor,   // Primary color
  orientation, setOrientation, // Layout
  exportSettings,          // Export to JSON
  importSettings,          // Import from JSON
  resetToDefaults,         // Reset all
} = useStyleSettings();
```

### Common Patterns

```javascript
// ✅ Load data
chartData.loadSampleData('barSimple');

// ✅ Update value
chartData.updateDataValue(rowIndex, 'Jan', 1000);

// ✅ Change setting
styleSettings.setTitle('New Title');

// ✅ Save snapshot
const snapshot = {
  data: chartData.data,
  periodNames: chartData.periodNames,
  settings: styleSettings.exportSettings(),
};

// ✅ Restore snapshot
chartData.loadSnapshotData(snapshot.data, snapshot.periodNames);
styleSettings.importSettings(snapshot.settings, chartType);
```

---

## Related Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture overview
- [PATTERNS.md](PATTERNS.md) - React + D3 patterns and best practices
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common state issues and fixes
- [TESTING.md](TESTING.md) - Testing hooks and state

---

**Last Updated:** 2025-01-18
**Maintainer:** Project Team
**Status:** ✅ Comprehensive State Management Guide
