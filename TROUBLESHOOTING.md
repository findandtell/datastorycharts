# Troubleshooting Guide

Common issues and their solutions, organized by category.

---

## Table of Contents

1. [D3 Rendering Issues](#d3-rendering-issues)
2. [Data Loading Issues](#data-loading-issues)
3. [Testing Issues](#testing-issues)
4. [Build & Deployment Issues](#build--deployment-issues)
5. [Performance Issues](#performance-issues)
6. [State Management Issues](#state-management-issues)
7. [Debugging Tips](#debugging-tips)
8. [Getting More Help](#getting-more-help)

---

## D3 Rendering Issues

### Chart doesn't render at all

**Symptoms:**
- Blank screen
- SVG element exists but is empty
- No errors in console

**Possible causes & solutions:**

**1. SVG ref not available**
```javascript
// Check in useEffect
useEffect(() => {
  if (!svgRef.current) {
    console.log('SVG ref not available'); // Debug
    return;
  }
  // Rendering logic
}, [data]);
```

**2. Data is empty or null**
```javascript
useEffect(() => {
  if (!data || data.length === 0) {
    console.log('No data to render'); // Debug
    return;
  }
  // Rendering logic
}, [data]);
```

**3. Dependencies missing from useEffect**
```javascript
// ❌ WRONG - Missing dependencies
useEffect(() => {
  // Uses 'width' but not in array
}, [data]);

// ✅ CORRECT - All dependencies included
useEffect(() => {
  // Uses data and width
}, [data, width]);
```

---

### Chart doesn't update when data changes

**Symptoms:**
- Chart renders initially but doesn't update
- Data changes but visualization stays the same

**Solution: Include data in useEffect dependencies**
```javascript
// ❌ WRONG - Empty dependency array
useEffect(() => {
  renderChart(data);
}, []); // Chart only renders once!

// ✅ CORRECT - Data in dependencies
useEffect(() => {
  renderChart(data);
}, [data]); // Re-renders when data changes
```

See [PATTERNS.md#pattern-usememo-with-explicit-dependencies](PATTERNS.md#pattern-usememo-with-explicit-dependencies).

---

### Colors are undefined in production

**Symptoms:**
- Colors work in development
- Production build shows `undefined` colors
- Console error: `Cannot read properties of undefined (reading 'colors')`

**Root cause:** Vite tree-shaking D3 color schemes

**Solution: Import color schemes directly**
```javascript
// ❌ WRONG - Gets tree-shaken
import * as d3 from 'd3';
const colors = d3.schemeTableau10; // undefined in production!

// ✅ CORRECT - Import directly
import { schemeTableau10 } from 'd3-scale-chromatic';
const colors = schemeTableau10;
```

See [PATTERNS.md#gotcha-vite-tree-shaking-d3-schemes](PATTERNS.md#gotcha-vite-tree-shaking-d3-schemes) for detailed explanation.

---

### Element coordinates are (0, 0) or undefined

**Symptoms:**
- Trying to get element positions but they're all (0, 0)
- `getBBox()` returns zero dimensions
- Annotations or labels appear in wrong positions

**Root cause:** Accessing coordinates before D3 renders

**Solution: Use POST-RENDER effect with guards**
```javascript
// POST-RENDER effect (runs after chart renders)
useEffect(() => {
  // Guard: Check if elements exist
  const elements = d3.selectAll('.bar').nodes();

  if (elements.length === 0) {
    console.log('Elements not rendered yet');
    return; // Wait for next render
  }

  // Now safe to access coordinates
  elements.forEach(el => {
    const bbox = el.getBBox();
    console.log('Position:', bbox.x, bbox.y);
  });

}, [data, styleSettings]); // Runs after chart effect
```

See [PATTERNS.md#pattern-post-render-population](PATTERNS.md#pattern-post-render-population).

---

### Duplicate elements after re-render

**Symptoms:**
- Elements multiply on each update
- Multiple overlapping charts
- Performance degrades over time

**Root cause:** Not clearing previous render

**Solution: Always clear before rendering**
```javascript
useEffect(() => {
  const svg = d3.select(svgRef.current);

  // CRITICAL: Clear previous render
  svg.selectAll('*').remove();

  // Now render new elements
  svg.append('g')
    // ...
}, [data]);
```

---

## Data Loading Issues

### CSV upload fails silently

**Symptoms:**
- CSV upload doesn't load data
- No error message shown
- Data remains empty

**Debug steps:**

**1. Check CSV structure**
```javascript
// Add logging to loadCSVFile
const loadCSVFile = async (file) => {
  console.log('File:', file.name, file.type);

  const results = await parseCSV(file);
  console.log('Parsed:', results);

  if (results.errors && results.errors.length > 0) {
    console.error('Parse errors:', results.errors);
    // ...
  }
};
```

**2. Verify CSV format**
- First row must be headers
- Consistent number of columns
- Valid encoding (UTF-8)
- No special characters in headers

**3. Check validation**
```javascript
const validation = validateCSVStructure(results.data, fieldOrder);
console.log('Validation:', validation);

if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}
```

---

### Admin defaults don't load

**Symptoms:**
- Settings save but don't restore on refresh
- Some settings load, others don't
- Charts revert to default after loading admin defaults

**Common causes:**

**1. Settings cleared before import**
```javascript
// ❌ WRONG - Clears before importing
clearEmphasis();
importSettings(adminDefaults);

// ✅ CORRECT - Only clear if not loading admin defaults
if (!isLoadingAdminDefaults) {
  clearEmphasis();
}
importSettings(adminDefaults);
```

**2. useMemo not detecting changes**
```javascript
// ❌ WRONG - Generic dependency
useMemo(() => {
  // Uses specific state values
}, [styleSettings]); // Object reference might not change

// ✅ CORRECT - Explicit dependencies
useMemo(() => {
  // Uses barColor, fontSize, etc.
}, [barColor, fontSize, marginTop, marginLeft]); // All specific values
```

See [PATTERNS.md#pattern-usememo-with-explicit-dependencies](PATTERNS.md#pattern-usememo-with-explicit-dependencies).

**3. Viewport sizing overrides imported dimensions**
```javascript
// ❌ WRONG - Resizes after import
importSettings(settings);
applyViewportBasedSizing(); // Overrides imported dimensions!

// ✅ CORRECT - Don't resize when importing
if (!isImporting) {
  applyViewportBasedSizing();
}
```

---

### Sample data loads but chart is blank

**Symptoms:**
- Sample data loads successfully
- Data appears in state
- Chart doesn't render

**Check:**

**1. Data format matches chart expectations**
```javascript
// Bar chart expects:
{ Category: 'A', Value: 100 }

// Line chart expects:
{ date: '2024-01-01', Metric1: 100, Metric2: 200 }

// Check field names match
console.log('Data:', data[0]);
console.log('Expected field:', chartType === 'line' ? 'date' : 'Category');
```

**2. Period names are extracted**
```javascript
console.log('Period names:', periodNames);
// Should not be empty
```

---

## Testing Issues

### Tests failing: "Cannot find module"

**Symptoms:**
```
Error: Cannot find module '@shared/hooks/useChartData'
```

**Solution: Check path aliases in vite.config.js**
```javascript
// vitest.config.js
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@charts': path.resolve(__dirname, './src/charts'),
    },
  },
});
```

---

### Tests pass locally but fail in CI

**Common causes:**

**1. Missing await in async tests**
```javascript
// ❌ WRONG - Missing await
it('should load data', async () => {
  act(() => {
    result.current.loadData(); // Async but not awaited
  });
  expect(result.current.data).toBeTruthy(); // Runs too early!
});

// ✅ CORRECT - Await async operations
it('should load data', async () => {
  await act(async () => {
    await result.current.loadData();
  });
  expect(result.current.data).toBeTruthy();
});
```

**2. Race conditions in tests**
```javascript
// Use waitFor for async state updates
await waitFor(() => {
  expect(result.current.data).toBeTruthy();
});
```

---

### Mock data doesn't match test expectations

**Solution: Check actual vs expected data structure**
```javascript
it('should format data', () => {
  const result = formatData(mockData);

  // Debug: Log actual result
  console.log('Actual result:', result);
  console.log('Expected:', expectedResult);

  expect(result).toEqual(expectedResult);
});
```

---

## Build & Deployment Issues

### Production build succeeds but site is broken

**Symptoms:**
- `npm run build` succeeds
- Deployed site shows errors
- Works fine in development

**Common causes:**

**1. D3 tree-shaking (most common)**
- See [Colors are undefined in production](#colors-are-undefined-in-production)

**2. Environment variables missing**
```javascript
// Check if env vars are defined
console.log('API Key:', import.meta.env.VITE_API_KEY);

// Provide fallbacks
const apiKey = import.meta.env.VITE_API_KEY || 'default-key';
```

**3. CDN caching issues**
- Custom domain may cache old bundles for 24+ hours
- Test on direct Vercel URL first: `yourapp.vercel.app`
- Force fresh deployment if needed

See [PATTERNS.md#gotcha-cdn-caching-at-custom-domain](PATTERNS.md#gotcha-cdn-caching-at-custom-domain).

---

### Build errors about missing dependencies

**Symptoms:**
```
Error: Could not resolve 'd3-scale-chromatic'
```

**Solution:**
```bash
# Install missing dependency
npm install d3-scale-chromatic

# Or reinstall all dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## Performance Issues

### Chart rendering is slow

**Symptoms:**
- Laggy interactions
- Slow initial render
- Browser becomes unresponsive

**Solutions:**

**1. Use useMemo for expensive calculations**
```javascript
// ❌ WRONG - Recalculates on every render
const processedData = data.map(/* expensive transform */);

// ✅ CORRECT - Memoized
const processedData = useMemo(() => {
  return data.map(/* expensive transform */);
}, [data]);
```

**2. Debounce rapid updates**
```javascript
import { useMemo, useState } from 'react';

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

// Use in component
const debouncedSettings = useDebounce(styleSettings, 300);
```

**3. Virtualize large datasets**
- For 1000+ data points, consider:
  - Pagination
  - Virtual scrolling
  - Aggregation/binning

---

### Tests run slowly

**Solutions:**

**1. Run tests in parallel**
```bash
npm run test -- --threads
```

**2. Skip slow tests during development**
```javascript
it.skip('slow integration test', () => {
  // Runs only in CI
});
```

**3. Use test filtering**
```bash
# Run only specific file
npm test -- BarChart

# Run only specific test
npm test -- -t "should render"
```

---

## State Management Issues

### Settings don't persist after reload

**Check:**

**1. localStorage is working**
```javascript
// Test localStorage
try {
  localStorage.setItem('test', 'value');
  const value = localStorage.getItem('test');
  console.log('localStorage works:', value === 'value');
} catch (e) {
  console.error('localStorage blocked:', e);
}
```

**2. Settings are being saved**
```javascript
const saveSettings = () => {
  const settings = {
    title,
    colors,
    // ...
  };

  console.log('Saving settings:', settings);
  localStorage.setItem('chartSettings', JSON.stringify(settings));
};
```

**3. Settings are being loaded**
```javascript
useEffect(() => {
  const saved = localStorage.getItem('chartSettings');
  if (saved) {
    const settings = JSON.parse(saved);
    console.log('Loaded settings:', settings);
    applySettings(settings);
  }
}, []);
```

---

### State updates not triggering re-render

**Symptoms:**
- State changes but UI doesn't update
- Have to click twice for changes to appear

**Common causes:**

**1. Mutating state directly**
```javascript
// ❌ WRONG - Mutates state
const updateData = () => {
  data[0].value = 100; // Direct mutation
  setData(data); // React doesn't detect change!
};

// ✅ CORRECT - Create new object
const updateData = () => {
  const newData = [...data];
  newData[0] = { ...newData[0], value: 100 };
  setData(newData);
};
```

**2. Object reference doesn't change**
```javascript
// ❌ WRONG - Same object reference
setSettings({ ...settings, color: newColor });
// If settings object reference doesn't change, React might skip

// ✅ CORRECT - Force new reference
setSettings(prev => ({ ...prev, color: newColor }));
```

---

## Debugging Tips

### Enable Debug Mode

Add logging to track state changes:

```javascript
const [data, setData] = useState(initialData);

// Wrapped setter with logging
const setDataWithLog = (newData) => {
  console.log('Data updating:', { old: data, new: newData });
  setData(newData);
};

// Use wrapped setter
setDataWithLog(newData);
```

---

### Use React DevTools

1. Install React DevTools browser extension
2. Open DevTools → Components tab
3. Inspect component props and state
4. Track re-renders with Profiler

---

### Check Bundle Size

```bash
# Analyze bundle
npm run build

# Check dist folder size
du -sh dist/
```

---

### Debug D3 Selections

```javascript
// Log D3 selections
const bars = svg.selectAll('.bar');
console.log('Bars found:', bars.size());
console.log('Bar data:', bars.data());
console.log('Bar nodes:', bars.nodes());
```

---

### Debug useEffect Execution

```javascript
useEffect(() => {
  console.log('Effect running with dependencies:', {
    data,
    settings,
    width,
  });

  // Effect logic

  return () => {
    console.log('Effect cleanup');
  };
}, [data, settings, width]);
```

---

## Getting More Help

### Before Asking for Help

1. **Check documentation**
   - [ARCHITECTURE.md](ARCHITECTURE.md)
   - [PATTERNS.md](PATTERNS.md)
   - This guide

2. **Search existing issues**
   - GitHub Issues
   - GitHub Discussions

3. **Try debugging yourself**
   - Add console.logs
   - Use React DevTools
   - Check browser console

### How to Report Issues

**Include:**
- ✅ Clear description of problem
- ✅ Steps to reproduce
- ✅ Expected vs actual behavior
- ✅ Error messages (full stack trace)
- ✅ Code snippet or branch
- ✅ Browser and version
- ✅ What you've tried

**Example:**
```markdown
## Issue: Chart doesn't update when CSV is uploaded

**Steps to reproduce:**
1. Navigate to /chart/bar
2. Click "Upload CSV"
3. Select file with valid CSV data
4. Chart remains blank

**Expected:** Chart should render with CSV data
**Actual:** Chart stays blank, no errors in console

**Environment:**
- Browser: Chrome 120
- OS: macOS 14
- Branch: main

**What I've tried:**
- Checked CSV format (valid)
- Added logging (data loads successfully)
- Verified periodNames extracted correctly

**Code:**
https://github.com/.../tree/my-branch
```

### Where to Get Help

1. **GitHub Discussions** - General questions
2. **GitHub Issues** - Bug reports
3. **Stack Overflow** - Tag: `d3.js`, `react`, `vitest`
4. **Documentation** - [CONTRIBUTING.md](CONTRIBUTING.md)

---

## Common Error Messages

### "Cannot read properties of undefined (reading 'colors')"

→ See [Colors are undefined in production](#colors-are-undefined-in-production)

### "Maximum update depth exceeded"

→ Missing dependency in useEffect or infinite loop in state update

**Fix:**
```javascript
// ❌ WRONG - Infinite loop
useEffect(() => {
  setCount(count + 1); // Updates count, triggers effect, infinite loop
}, [count]);

// ✅ CORRECT - Conditional update
useEffect(() => {
  if (shouldUpdate) {
    setCount(count + 1);
  }
}, [shouldUpdate, count]);
```

### "Objects are not valid as a React child"

→ Trying to render an object directly

**Fix:**
```javascript
// ❌ WRONG
return <div>{data}</div>; // data is an object

// ✅ CORRECT
return <div>{JSON.stringify(data)}</div>;
// or
return <div>{data.value}</div>; // Render specific property
```

---

## Quick Reference

### Most Common Issues

1. **D3 colors undefined** → Import from `d3-scale-chromatic`
2. **Chart doesn't update** → Add data to useEffect dependencies
3. **Coordinates are (0,0)** → Use POST-RENDER effect
4. **Tests fail** → Add await to async operations
5. **Settings don't load** → Check useMemo dependencies

### Debug Checklist

- [ ] Check browser console for errors
- [ ] Verify data structure matches expectations
- [ ] Confirm all useEffect dependencies included
- [ ] Test in clean browser (no extensions)
- [ ] Check production build locally (`npm run build && npm run preview`)
- [ ] Review recent changes in git
- [ ] Search documentation and issues

---

**Still stuck?** Ask in [GitHub Discussions](https://github.com/your-repo/discussions) with details!

---

**Last Updated:** 2025-01-18
**Maintainer:** Project Team
**Status:** ✅ Comprehensive Troubleshooting Guide
