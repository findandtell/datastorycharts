# Common Patterns and Gotchas

**Proven patterns, anti-patterns, and production lessons learned**

This document captures the coding patterns, architectural decisions, and hard-won production lessons that make this codebase work reliably.

---

## Table of Contents

1. [State Management Patterns](#state-management-patterns)
2. [Data Loading Patterns](#data-loading-patterns)
3. [D3 + React Integration](#d3--react-integration)
4. [Performance Patterns](#performance-patterns)
5. [Error Prevention Patterns](#error-prevention-patterns)
6. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
7. [Production Gotchas](#production-gotchas)
8. [Testing Patterns](#testing-patterns)

---

## State Management Patterns

### Pattern: Wrapped Setters with Logging

**When**: You need to trace state changes for debugging

**Example**: `useStyleSettings.js` wraps `setPercentChangeEnabled`

```javascript
// Internal state with private setter
const [percentChangeEnabled, _setPercentChangeEnabled] = useState(false);

// Public setter with logging
const setPercentChangeEnabled = useCallback((value) => {
  console.log('[setPercentChangeEnabled] ⚡ CALLED with value:', value);
  console.trace('[setPercentChangeEnabled] Stack trace:');
  _setPercentChangeEnabled(value);
}, []);

// Track state changes via useEffect
useEffect(() => {
  console.log('[percentChangeEnabled STATE CHANGED] 📊 New value:', percentChangeEnabled);
  console.log('[percentChangeEnabled STATE CHANGED] Timestamp:', new Date().toISOString());
  console.trace('[percentChangeEnabled STATE CHANGED] Stack trace:');
}, [percentChangeEnabled]);
```

**Why**:
- Tracks all calls to the setter (who called it, when, from where)
- Tracks state changes that bypass the setter
- Critical for debugging complex state flows like admin default loading
- Helped solve bracket loading bugs in production

**When to use**:
- Complex state that multiple systems compete to control
- States that seem to change "magically" without clear cause
- Critical features that must work reliably (admin defaults, emphasis, etc.)

---

### Pattern: Ref-Based State Locking

**When**: Prevent race conditions between competing async operations

**Problem**:
```javascript
// ❌ BAD: Both useEffects run simultaneously
useEffect(() => {
  loadAdminDefault();  // Async
}, []);

useEffect(() => {
  loadSampleData();    // Async - may finish first!
}, []);
```

**Solution**:
```javascript
// ✅ GOOD: Use ref as a lock
const hasLoadedDefaultFromDB = useRef(false);

useEffect(() => {
  // Lock IMMEDIATELY (synchronous)
  hasLoadedDefaultFromDB.current = true;

  loadAdminDefault().then(config => {
    if (config) {
      applyConfig(config);
    } else {
      // Unlock if no default found
      hasLoadedDefaultFromDB.current = false;
    }
  });
}, []);

useEffect(() => {
  // Check lock before loading
  if (hasLoadedDefaultFromDB.current) {
    console.log('⏭️ Skipping sample data - admin default loaded');
    return;
  }
  loadSampleData();
}, []);
```

**Why ref instead of state**:
- `ref.current = value` is **synchronous** (happens immediately)
- `setState(value)` is **asynchronous** (batched by React)
- Prevents race where sample data loads before admin check completes

**Real-world impact**:
- Eliminated chart "flash" on page load
- Fixed admin defaults loading wrong data
- Made initialization deterministic

**See**: [ChartEditor.jsx:162-206](src/pages/ChartEditor.jsx#L162-L206)

---

### Pattern: Separate State for Auto vs Manual

**When**: Settings can be calculated automatically OR set manually

**Example**: Axis bounds in bar charts

```javascript
// Separate state for each mode
const [axisMinimum, setAxisMinimum] = useState(0);
const [axisMinimumAuto, setAxisMinimumAuto] = useState(true);

// Calculated values (when Auto is true)
const [calculatedAxisMinimum, setCalculatedAxisMinimum] = useState(0);

// Determine effective value
const effectiveMinimum = axisMinimumAuto ? calculatedAxisMinimum : axisMinimum;
```

**Why**:
- Preserves manual value when switching modes
- User can toggle Auto on/off without losing their custom value
- Clear separation between calculated and user-set values

**Used for**:
- Axis minimum/maximum
- Axis major/minor units
- Any calculated value that can be manually overridden

---

### Pattern: useMemo with Explicit Dependencies

**Problem**: Object references don't change even when properties do

```javascript
// ❌ WRONG - styleSettings ref never changes
const chartProps = useMemo(() => ({
  title: styleSettings.title,
  barColor: styleSettings.barColor,
}), [styleSettings]);  // ❌ Won't detect changes!
```

**Why this fails**:
1. `styleSettings` is the hook object from `useStyleSettings()`
2. This object is created once and reused
3. When `setBarColor('#ff0000')` is called, only `barColor` state changes
4. The `styleSettings` object itself is the same reference
5. useMemo uses `===` comparison, sees same ref, skips recalculation
6. Chart receives stale values

**Solution**:
```javascript
// ✅ CORRECT - Explicitly list changing values
const chartProps = useMemo(() => ({
  title: styleSettings.title,
  barColor: styleSettings.barColor,
  percentChangeEnabled: styleSettings.percentChangeEnabled,
}), [
  styleSettings,
  styleSettings.title,
  styleSettings.barColor,
  styleSettings.percentChangeEnabled,
]);
```

**Rule of thumb**:
- List the object ref (styleSettings)
- ALSO list every individual property you use from that object
- More dependencies is SAFER than fewer

**Real-world impact**:
- Admin defaults not loading (percentChangeEnabled stuck at false)
- Emphasized bars not showing when loaded from defaults
- Any chart setting not updating properly

**See**: [ChartEditor.jsx:1848-1860](src/pages/ChartEditor.jsx#L1848-L1860) for detailed comment

---

### Pattern: Theme-Aware Computed Values

**When**: Some settings should automatically sync with theme changes

**Example**: Axis color brightness syncs with dark mode

```javascript
const handleSetDarkMode = useCallback((value) => {
  setDarkMode(value);

  // Auto-sync axis color with theme
  if (value) {
    setAxisColorBrightness(100); // White for dark mode
  } else {
    setAxisColorBrightness(0);    // Black for light mode
  }
}, []);

// Compute actual color from brightness
const computedAxisColor = useMemo(() => {
  const brightness = Math.round((axisColorBrightness / 100) * 255);
  const hex = brightness.toString(16).padStart(2, '0');
  return `#${hex}${hex}${hex}`;
}, [axisColorBrightness]);
```

**Why**:
- User experience: axis color automatically adapts to theme
- Can still be manually overridden via brightness slider
- Consistent visual design

---

## Data Loading Patterns

### Pattern: POST-RENDER Population

**When**: You need coordinates that don't exist until after D3 renders

**Problem**: Bracket auto-population timing

```javascript
// ❌ BAD: Runs before bars are rendered
useEffect(() => {
  if (percentChangeEnabled && emphasizedBars.length >= 2) {
    autopopulateBrackets();  // ❌ Coordinates don't exist yet!
  }
}, [percentChangeEnabled, emphasizedBars]);
```

**Solution**:
```javascript
// Track whether we've auto-populated
const hasAutoPopulatedRef = useRef(false);

// D3 rendering effect (populates coordinates)
useEffect(() => {
  // ... D3 rendering code ...

  // Store bar coordinates for later use
  renderedBarsDataRef.current = {
    'East-Jan': { x: 100, y: 200, width: 50, height: 100 },
    // ... all bars
  };
}, [data, styleSettings]);

// Separate auto-population effect (runs AFTER rendering)
useEffect(() => {
  // Guard: Wait for bars to be rendered first
  if (Object.keys(renderedBarsDataRef.current).length === 0) {
    console.log('⏭️ Skipping - bars not rendered yet');
    return;
  }

  // Guard: Only auto-populate once
  if (hasAutoPopulatedRef.current) {
    console.log('⏭️ Skipping - already auto-populated');
    return;
  }

  if (percentChangeEnabled && emphasizedBars.length >= 2) {
    // ✅ NOW bars are rendered, coordinates available
    autopopulateBrackets();
    hasAutoPopulatedRef.current = true;
  }
}, [percentChangeEnabled, emphasizedBars]);
```

**Key insight**:
- D3 rendering happens in a `useEffect`
- Coordinate data is populated at the end of that `useEffect`
- Any code that needs coordinates must run in a **separate** `useEffect`
- React guarantees effects run in order, so second effect sees populated coordinates

**Real-world impact**:
- Fixed brackets appearing at (0, 0) when loaded from admin defaults
- Fixed "second bracket pair not appearing" bug
- Made emphasis features work reliably

**See**: [BarChart.jsx:550-650](src/charts/BarChart/BarChart.jsx#L550-L650)

---

### Pattern: Data Source Priority

**When**: Multiple data sources compete (admin defaults, sample data, URL params, uploaded CSV)

**Priority order**:
1. URL parameters (highest - user explicitly linked to specific data)
2. Imported chart (sessionStorage - user explicitly imported)
3. Admin defaults (database - chart-specific configuration)
4. Sample data (lowest - fallback when nothing else specified)

**Implementation**:
```javascript
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const hasSheetsUrl = urlParams.has('sheetsUrl');
  const hasImportedChart = sessionStorage.getItem('importedChart');

  // Priority 1 & 2: URL or imported chart
  if (hasSheetsUrl || hasImportedChart) {
    hasLoadedDefaultFromDB.current = false;
    setIsLoadingInitialDefault(false);
    return; // Skip admin defaults
  }

  // Priority 3: Admin defaults
  hasLoadedDefaultFromDB.current = true;  // Lock sample data

  loadAdminDefault().then(config => {
    if (config) {
      applyConfig(config);
    } else {
      // Priority 4: Fall back to sample data
      hasLoadedDefaultFromDB.current = false;  // Unlock
    }
  });
}, [chartType]);
```

**Why this order**:
- Respects user intent (explicit actions > implicit defaults)
- Prevents admin defaults from overriding user's specific choices
- Falls back gracefully when higher-priority sources aren't available

---

### Pattern: Transform-on-Load

**When**: Data needs format conversion for chart rendering

**Example**: Flattened grouped-stacked to Group/Period format

```javascript
// Detect if data is in flattened format
const isFlattenedGroupedStacked = (data) => {
  if (!data[0]?.Period) return false;
  const otherKeys = Object.keys(data[0]).filter(k => k !== 'Period');
  return otherKeys.some(key => key.includes(' - '));
};

// Transform during load
const loadSampleData = useCallback((datasetKey) => {
  let chartData = dataset.data;

  if (isFlattenedGroupedStacked(chartData)) {
    // Transform: { Period: "Nov '18", "All Voters - Very Well": 21 }
    // To: { Group: "All Voters", Period: "Nov '18", "Very Well": 21 }
    chartData = transformFlattenedToGroupPeriod(chartData);
  }

  setData(chartData);
}, []);
```

**Why**:
- Keeps chart rendering logic simple (expects consistent format)
- Transformation happens once on load, not on every render
- Supports multiple data formats transparently

**See**: [useChartData.js:62-109](src/shared/hooks/useChartData.js#L62-L109)

---

## D3 + React Integration

### Pattern: Ref-Based D3 Rendering

**Standard pattern** for all chart components:

```javascript
const MyChart = ({ data, styleSettings }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);

    // Clear previous render
    svg.selectAll('*').remove();

    // Render chart
    // ... D3 code ...

  }, [data, styleSettings.barColor, styleSettings.canvasWidth, /* ... */]);

  return (
    <svg
      ref={svgRef}
      width={styleSettings.canvasWidth}
      height={styleSettings.canvasHeight}
    />
  );
};
```

**Key points**:
1. Use `useRef` to get DOM reference
2. Use `d3.select(ref.current)` NOT `d3.select('svg')`
3. Clear previous render with `selectAll('*').remove()`
4. List **all** used styleSettings in dependencies
5. Return SVG with ref attached

**Why this pattern**:
- React owns the SVG element
- D3 manipulates its contents
- Clear separation of concerns
- Re-renders correctly when props change

---

### Pattern: Partial Updates for Performance

**When**: Only update what changed, don't re-render entire chart

```javascript
// Separate effects for different concerns

// Full render when data changes
useEffect(() => {
  if (!data) return;
  renderFullChart();
}, [data]);

// Partial update when only color changes
useEffect(() => {
  if (!svgRef.current) return;

  d3.select(svgRef.current)
    .selectAll('.bar')
    .attr('fill', barColor);  // Only update fill
}, [barColor]);

// Partial update for labels
useEffect(() => {
  if (!svgRef.current) return;

  d3.select(svgRef.current)
    .selectAll('.label')
    .text(showLabels ? d => d.value : '');
}, [showLabels]);
```

**Why**:
- Faster than re-rendering everything
- Smoother user experience
- Scales better with large datasets

**Trade-off**:
- More complex code
- Need to carefully manage what updates when
- Usually only worth it for frequently-changing settings (colors, visibility)

---

### Pattern: Data Binding with Key Functions

**Always use key functions** for D3 data binding:

```javascript
// ❌ BAD: No key function
svg.selectAll('.bar')
  .data(data)
  .join('rect')
  .attr('class', 'bar');

// ✅ GOOD: With key function
svg.selectAll('.bar')
  .data(data, d => d.id)  // Key function ensures correct element mapping
  .join('rect')
  .attr('class', 'bar');
```

**Why**:
- Without key: D3 matches by index (bar 0, bar 1, bar 2)
- With key: D3 matches by identity (East-Jan, West-Jan, etc.)
- Prevents visual glitches when data order changes
- Enables smooth transitions

---

## Performance Patterns

### Pattern: Throttle Rapid Updates

**When**: User input triggers expensive operations

```javascript
import { throttle } from '../shared/utils/performanceUtils';

// Slider that updates chart 60 times per second
const handleSliderChange = throttle((value) => {
  styleSettings.setBarWidth(value);
}, 100);  // Limit to 10 updates per second

return (
  <input
    type="range"
    onChange={(e) => handleSliderChange(e.target.value)}
  />
);
```

**Why**:
- Prevents 60 React renders per second
- Prevents 60 D3 re-renders per second
- Dramatically improves responsiveness
- User doesn't notice 100ms delay

**Common use cases**:
- Slider inputs
- Text inputs (debounce instead of throttle)
- Window resize handlers
- Scroll handlers

---

### Pattern: Lazy Calculation with useMemo

**When**: Calculation is expensive and inputs change infrequently

```javascript
// ❌ BAD: Recalculates on every render
const processedData = data.map(d => ({
  ...d,
  calculatedValue: complexCalculation(d)  // Expensive!
}));

// ✅ GOOD: Only recalculates when data changes
const processedData = useMemo(() => {
  return data.map(d => ({
    ...d,
    calculatedValue: complexCalculation(d)
  }));
}, [data]);
```

**Common expensive calculations**:
- Data transformations
- Scale calculations (d3.scaleLinear().domain().range())
- Color interpolations
- Text measurements
- Statistical calculations (mean, median, etc.)

---

### Pattern: Stable Callbacks with useCallback

**When**: Passing callbacks to child components

```javascript
// ❌ BAD: New function on every render
<BarChart
  onBarClick={(barId) => {
    setEmphasizedBars([...emphasizedBars, barId]);
  }}
/>

// ✅ GOOD: Stable function reference
const handleBarClick = useCallback((barId) => {
  setEmphasizedBars(prev => [...prev, barId]);
}, []);  // Empty deps = function never changes

<BarChart onBarClick={handleBarClick} />
```

**Why**:
- Child component can use `React.memo` to skip re-renders
- Prevents unnecessary useEffect triggers in child
- Improves performance with large component trees

**Best practice**: Use updater function form (`prev => ...`) to avoid dependencies

---

## Error Prevention Patterns

### Pattern: Defensive Palette Access

**Problem**: Admin defaults may reference palettes that don't exist

```javascript
// ❌ BAD: Crashes if palette doesn't exist
const colors = comparisonPalettes[colorPalette].colors;
```

**Solution**:
```javascript
// ✅ GOOD: Validate before accessing
const palette = comparisonPalettes[colorPalette];

if (!palette && colorPalette !== "user") {
  console.warn(`Palette "${colorPalette}" not found, using fallback`);
  return '#1e40af';  // Safe fallback color
}

const colors = palette.colors;
```

**Applied in**:
- All chart components
- Color utility functions
- Import/export functions

**Prevents**:
- `Cannot read properties of undefined (reading 'colors')` crashes
- Production crashes from deleted/renamed palettes in old admin defaults

---

### Pattern: Import Validation

**When**: Importing settings from JSON (admin defaults, style files)

```javascript
const importSettings = useCallback((settings, currentChartType) => {
  // Validate palette
  if (settings.colors?.comparisonPalette !== undefined) {
    const paletteValue = settings.colors.comparisonPalette;

    if (paletteValue === 'user') {
      setComparisonPalette(paletteValue);
    } else if (comparisonPalettes[paletteValue]) {
      const palette = comparisonPalettes[paletteValue];

      // Extra validation: ensure .colors exists and is array
      if (palette.colors && Array.isArray(palette.colors) && palette.colors.length > 0) {
        setComparisonPalette(paletteValue);
      } else {
        console.warn(`Invalid palette, using default`);
        setComparisonPalette('observable10');
      }
    } else {
      console.warn(`Palette not found, using default`);
      setComparisonPalette('observable10');
    }
  }

  // Validate emphasized bars exist in data
  if (settings.chartSpecific?.bar?.emphasizedBars) {
    const validBars = settings.chartSpecific.bar.emphasizedBars.filter(barId => {
      return data.some(row => /* check if bar exists */);
    });
    setEmphasizedBars(validBars);
  }
}, [data]);
```

**Validation checklist**:
- [ ] Palette exists in current version
- [ ] Palette has valid .colors array
- [ ] Emphasized items still exist in data
- [ ] Numeric values are within valid ranges
- [ ] Required fields are present

---

### Pattern: Graceful Degradation

**When**: Feature can't work, but app should continue

```javascript
// Export functionality
const handleExport = async () => {
  try {
    await exportAsPNG(svgRef.current);
  } catch (error) {
    console.error('Export failed:', error);
    // Don't crash - show error to user
    setError('Export failed. Please try again.');
    // Continue running
  }
};
```

**Examples**:
- Export fails → Show error message, don't crash
- Google Sheets URL invalid → Show error, keep current data
- Admin default missing → Load sample data instead
- CSV parse error → Show validation message, keep previous data

**Principle**: Never let an optional feature crash the core app

---

## Anti-Patterns to Avoid

### ❌ Anti-Pattern: Direct State Mutation

```javascript
// ❌ WRONG
const handleAddRow = () => {
  data.push(newRow);  // Mutates state directly!
  setData(data);       // React won't detect change (same reference)
};

// ✅ CORRECT
const handleAddRow = () => {
  setData([...data, newRow]);  // New array reference
};
```

**Why it's bad**:
- React uses `===` comparison
- Mutated array has same reference
- React skips re-render
- Chart doesn't update

---

### ❌ Anti-Pattern: Calling setState in Render

```javascript
// ❌ WRONG
const MyComponent = () => {
  if (someCondition) {
    setCount(count + 1);  // setState during render!
  }
  return <div>{count}</div>;
};

// ✅ CORRECT
const MyComponent = () => {
  useEffect(() => {
    if (someCondition) {
      setCount(count + 1);
    }
  }, [someCondition]);

  return <div>{count}</div>;
};
```

**Why it's bad**:
- Causes infinite render loops
- React throws warnings/errors
- Unpredictable behavior

---

### ❌ Anti-Pattern: Missing useCallback Dependencies

```javascript
// ❌ WRONG
const handleClick = useCallback(() => {
  console.log(data.length);  // Uses 'data' but not in deps!
}, []);  // Always logs stale value

// ✅ CORRECT
const handleClick = useCallback(() => {
  console.log(data.length);
}, [data]);  // Fresh value on every data change
```

**Why it's bad**:
- Callback uses stale values (closure over old data)
- Leads to bugs that are hard to trace
- Violations of React's rules

**React Hook Linter**: Install ESLint plugin to catch these automatically

---

### ❌ Anti-Pattern: Async useEffect Without Cleanup

```javascript
// ❌ WRONG
useEffect(() => {
  fetchData().then(data => {
    setState(data);  // Might set state after unmount!
  });
}, []);

// ✅ CORRECT
useEffect(() => {
  let cancelled = false;

  fetchData().then(data => {
    if (!cancelled) {
      setState(data);
    }
  });

  return () => {
    cancelled = true;
  };
}, []);
```

**Why it's bad**:
- Component might unmount before fetch completes
- Setting state on unmounted component causes React warning
- Memory leak

---

### ❌ Anti-Pattern: Storing Derived State

```javascript
// ❌ WRONG
const [data, setData] = useState([]);
const [dataLength, setDataLength] = useState(0);  // Derived from data!

useEffect(() => {
  setDataLength(data.length);
}, [data]);

// ✅ CORRECT
const [data, setData] = useState([]);
const dataLength = data.length;  // Just calculate it
```

**Why it's bad**:
- Extra state to manage
- Can get out of sync
- Unnecessary re-renders

**Rule**: If you can calculate it, don't store it

---

## Production Gotchas

### Gotcha: Vite Tree-Shaking D3 Schemes

**Problem**: D3 color schemes work in dev but are undefined in production

```javascript
// ❌ Works in dev, undefined in production
import * as d3 from 'd3';
const colors = d3.schemeObservable10;  // undefined in build!
```

**Why**:
- Vite's tree-shaker sees `d3.schemeObservable10` as dynamic property access
- Can't statically analyze usage
- Removes "unused" color schemes from bundle

**Solution**:
```javascript
// ✅ Never tree-shaken
import { schemeObservable10 } from 'd3-scale-chromatic';
const colors = schemeObservable10;
```

**Lesson**: Always import D3 modules directly, not via namespace

**See**: [colorPalettes.js:1-20](src/shared/design-system/colorPalettes.js#L1-L20)

---

### Gotcha: CDN Caching at Custom Domain

**Problem**: Deploy fixes to Vercel, but production still broken

**Why**:
- Vercel deploys to unique URLs (e.g., `xyz123.vercel.app`)
- Custom domain (e.g., `charts.findandtell.co`) has CDN layer
- CDN caches old bundle for 24+ hours
- New deployment doesn't clear CDN cache

**Solution**:
1. Test on direct Vercel URL first: `xyz123.vercel.app`
2. If that works, force CDN cache clear:
   - `npx vercel --force` (forces new deployment)
   - Wait 5-10 minutes for CDN propagation
   - Hard refresh browser (Ctrl+Shift+R)
3. Verify bundle hash changed in Network tab

**Lesson**: CDN caching ≠ code caching. Always test direct URL first.

---

### Gotcha: SessionStorage Survives Refresh

**Problem**: User imports chart, expects to see it again after page refresh, but it's gone

**Why**:
- `sessionStorage` persists across page refreshes (same browser tab)
- `sessionStorage` is cleared when tab is closed
- Users expect imported chart to persist within session

**Current implementation**:
```javascript
// Save imported chart
sessionStorage.setItem('importedChart', JSON.stringify(chartState));

// Check on mount
const hasImportedChart = sessionStorage.getItem('importedChart');
```

**Lesson**: sessionStorage is for session-scoped data, not long-term persistence

---

### Gotcha: Admin Defaults Not Clearing Emphasis

**Problem**: Reset View loads admin default but brackets don't appear

**Root cause**: Calling `clearEmphasis()` before `importSettings()`

```javascript
// ❌ WRONG
clearEmphasis();  // Clears emphasizedBars = []
styleSettings.importSettings(config.styleSettings);  // Sets emphasizedBars = ["East-Jan"]
// Result: emphasizedBars = [] (cleared after import!)
```

**Fix**: Don't call `clearEmphasis()` when loading admin defaults

```javascript
// ✅ CORRECT
if (adminDefaultExists) {
  // DON'T clear - let importSettings replace everything
  styleSettings.importSettings(config.styleSettings);
} else {
  // Only clear if no default (fallback mode)
  clearEmphasis();
}
```

**Lesson**: Order matters. Don't clear state you're about to import.

**See**: [ChartEditor.jsx:1772-1836](src/pages/ChartEditor.jsx#L1772-L1836)

---

### Gotcha: Canvas Size Overridden After Import

**Problem**: Admin default has specific canvas size, but Reset View resizes it

**Root cause**: Calling `applyViewportBasedSizing()` after importing

```javascript
// ❌ WRONG
styleSettings.importSettings(config.styleSettings);  // Loads canvasWidth: 1200
applyViewportBasedSizing();  // Overrides to viewport-based size!
```

**Fix**: Don't resize when loading admin defaults

```javascript
// ✅ CORRECT
if (adminDefaultExists) {
  styleSettings.importSettings(config.styleSettings);
  // DON'T call applyViewportBasedSizing() - preserves saved canvas size
} else {
  clearEmphasis();
  applyViewportBasedSizing();  // Only resize in fallback mode
}
```

**Lesson**: Admin defaults are the source of truth. Don't override their values.

---

## Testing Patterns

### Pattern: Test Pure Functions First

**Priority 1**: Utility functions (easiest to test)

```javascript
// src/shared/utils/dataFormatters.test.js
import { formatCompactNumber } from '../dataFormatters';

describe('formatCompactNumber', () => {
  it('formats thousands with K', () => {
    expect(formatCompactNumber(1500)).toBe('1.5K');
  });

  it('formats millions with M', () => {
    expect(formatCompactNumber(2500000)).toBe('2.5M');
  });

  it('handles zero', () => {
    expect(formatCompactNumber(0)).toBe('0');
  });
});
```

**Why start here**:
- Pure functions (input → output)
- No React, no state, no DOM
- Fast, deterministic tests
- High confidence per line of test code

---

### Pattern: Test Hooks with renderHook

**Priority 2**: Custom hooks

```javascript
// src/shared/hooks/useChartData.test.js
import { renderHook, act } from '@testing-library/react';
import { useChartData } from '../useChartData';

describe('useChartData', () => {
  it('loads sample data', () => {
    const { result } = renderHook(() => useChartData('bar'));

    act(() => {
      result.current.loadSampleData('barSimple');
    });

    expect(result.current.data).toHaveLength(3);
    expect(result.current.periodNames).toEqual(['Jan', 'Feb', 'Mar']);
  });

  it('validates CSV structure', async () => {
    const { result } = renderHook(() => useChartData('bar'));

    await act(async () => {
      const file = new File(['invalid,data'], 'test.csv');
      await result.current.loadCSVFile(file);
    });

    expect(result.current.error).toContain('Invalid CSV structure');
  });
});
```

---

### Pattern: Integration Tests for Critical Flows

**Priority 3**: User workflows

```javascript
// tests/integration/adminDefault.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChartEditor from '../src/pages/ChartEditor';

describe('Admin Default Flow', () => {
  it('loads admin default on mount', async () => {
    // Mock API
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          configuration: { /* admin default */ }
        })
      })
    );

    render(<ChartEditor />);

    await waitFor(() => {
      expect(screen.getByText('Admin Default Title')).toBeInTheDocument();
    });
  });

  it('saves admin default when button clicked', async () => {
    const user = userEvent.setup();
    render(<ChartEditor />);

    await user.click(screen.getByText('Save Default'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/save-default',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });
});
```

---

## Summary

### Top 5 Patterns to Follow

1. **Ref-based locking** for async coordination
2. **useMemo with explicit dependencies** for object properties
3. **POST-RENDER population** for coordinate-dependent logic
4. **Defensive validation** in import functions
5. **Wrapped setters with logging** for debugging complex state

### Top 5 Anti-Patterns to Avoid

1. **Direct state mutation** (always create new objects/arrays)
2. **Missing dependencies** in useCallback/useMemo
3. **Calling setState in render** (use useEffect instead)
4. **Storing derived state** (calculate it instead)
5. **D3 namespace access** (import directly to avoid tree-shaking)

### Production Lessons Learned

1. **Test on direct Vercel URL** before assuming CDN issue
2. **Import D3 schemes directly** to prevent tree-shaking
3. **Don't clear state before importing** (order matters)
4. **Don't resize after importing** (respect saved values)
5. **Use refs for synchronous locks** (not state)

---

**Last Updated**: 2025-01-18
**Maintainer**: Matthew (Find & Tell)
**Status**: Production-Proven Patterns
