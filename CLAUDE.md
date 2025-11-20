# DataStory Charts - Project Memory

**Project:** DataStory Charts - Professional Data Visualization Platform
**Type:** React + D3.js + Vite Application + Figma Plugin
**Purpose:** Production-ready chart visualization library with reusable patterns
**Status:** ✅ Production-ready with 100 tests passing
**Deployment:**
- 🌐 **Standalone Web App**: https://charts.findandtell.co
- 🎨 **Figma Plugin**: Embeds full web app in Figma (see [FIGMA_PLUGIN.md](FIGMA_PLUGIN.md))

---

## Quick Start

This is a React + D3.js data visualization application. All chart types share common hooks and patterns for consistency.

**Common Commands:**
```bash
npm run dev          # Start dev server (http://localhost:5173)
npm test             # Run all tests
npm run test:ui      # Vitest UI
npm run build        # Production build
```

**Figma Plugin Development:**
```bash
cd figma-plugin      # Navigate to plugin directory
npm run build        # Build plugin (code.ts → code.js)
npm run watch        # Watch mode for development
```

**Key Directories:**
- `src/charts/` - Chart implementations (FunnelChart, BarChart, LineChart, SlopeChart)
- `src/shared/hooks/` - Reusable hooks (useChartData, useStyleSettings, useFigmaMode)
- `src/shared/utils/` - Utility functions (dataFormatters, colorUtils, csvUtils)
- `src/shared/data/` - Sample datasets
- `src/test/` - Test files and templates
- `figma-plugin/` - Figma plugin code (manifest, UI, main thread)

---

## Core Architecture

### Hook-Based State Management

**Two primary hooks manage all state:**

1. **useChartData** - Data state (loading, editing, manipulation)
2. **useStyleSettings** - Style state (all visual settings)

**Pattern:**
```javascript
const MyChart = () => {
  const chartData = useChartData('bar');
  const styleSettings = useStyleSettings();

  useEffect(() => {
    if (!chartData.data) return;
    renderChart(chartData.data, styleSettings);
  }, [chartData.data, styleSettings]);
};
```

### Critical D3 + React Pattern

**ALWAYS follow this pattern in chart components:**

```javascript
useEffect(() => {
  const svg = d3.select(svgRef.current);

  // 1. CRITICAL: Clear previous render
  svg.selectAll('*').remove();

  // 2. Render new visualization
  svg.append('g')
    .selectAll('rect')
    .data(data)
    .join('rect')
    // ...

}, [data, width, height]); // 3. ALL dependencies
```

**Three critical rules:**
1. ✅ **Always clear** with `svg.selectAll('*').remove()` before rendering
2. ✅ **Include ALL dependencies** in useEffect array
3. ✅ **Import color schemes directly** from d3-scale-chromatic (Vite tree-shaking issue)

---

## Production-Proven Patterns

### Color Schemes (CRITICAL)

```javascript
// ❌ WRONG - Gets tree-shaken in production
import * as d3 from 'd3';
const colors = d3.schemeTableau10; // undefined in production!

// ✅ CORRECT - Import directly
import { schemeTableau10 } from 'd3-scale-chromatic';
const colors = schemeTableau10;
```

### Dependency Arrays

```javascript
// ❌ WRONG - Missing dependencies
useEffect(() => {
  renderChart(data, width, height);
}, [data]); // width, height changes won't trigger!

// ✅ CORRECT - All dependencies
useEffect(() => {
  renderChart(data, width, height);
}, [data, width, height]);
```

### Post-Render Effects

```javascript
// For accessing element coordinates AFTER D3 renders
useEffect(() => {
  const elements = d3.selectAll('.bar').nodes();

  if (elements.length === 0) {
    return; // Not rendered yet, wait
  }

  // Now safe to access coordinates
  elements.forEach(el => {
    const bbox = el.getBBox();
    console.log('Position:', bbox.x, bbox.y);
  });
}, [data, styleSettings]); // Runs after chart renders
```

### Admin Defaults Loading

```javascript
// ❌ WRONG - Clears before importing
clearEmphasis();
importSettings(defaults);

// ✅ CORRECT - Just import
importSettings(defaults);
```

---

## Code Conventions

### File Organization

```
ChartName/
├── ChartName.jsx           # Component
├── chartNameDefaults.js    # Default settings
└── ChartName.test.jsx      # Tests
```

### Naming Conventions

- **Components:** PascalCase (`FunnelChart.jsx`)
- **Utilities:** camelCase (`dataFormatters.js`)
- **Hooks:** useCamelCase (`useChartData.js`)
- **Constants:** UPPER_SNAKE_CASE (`DEFAULT_COLORS`)

### Import Order

```javascript
// 1. React
import { useState, useEffect } from 'react';

// 2. Third-party
import * as d3 from 'd3';
import { schemeTableau10 } from 'd3-scale-chromatic';

// 3. Internal
import { useChartData } from '@shared/hooks/useChartData';
import { formatNumber } from '@shared/utils/dataFormatters';
```

### State Updates

```javascript
// ✅ CORRECT - Immutable updates
setData(prev => [...prev, newItem]);
setSettings(prev => ({ ...prev, color: newColor }));

// ❌ WRONG - Mutation
data.push(newItem);
setData(data); // React won't detect!
```

---

## Common Workflows

### Adding a New Chart Type

See [@ADDING-CHARTS.md](ADDING-CHARTS.md) for complete guide.

**Quick steps:**
1. Copy `src/charts/_ChartTemplate/` folder
2. Rename files and component
3. Implement D3 rendering logic
4. Add to chart registry
5. Create sample dataset
6. Write tests

### Debugging Chart Rendering

**Step 1: Check data structure**
```javascript
console.log('Data:', {
  hasData: !!data,
  length: data?.length,
  firstRow: data?.[0],
  keys: data?.[0] ? Object.keys(data[0]) : [],
});
```

**Step 2: Check D3 selections**
```javascript
const bars = svg.selectAll('.bar');
console.log('Bars:', bars.size(), bars.nodes());
```

**Step 3: Verify dependencies**
```javascript
useEffect(() => {
  console.log('Effect running with:', { data, width, height });
  // Render logic
}, [data, width, height]);
```

### Loading and Saving State

**Save complete state:**
```javascript
const snapshot = {
  data: chartData.data,
  periodNames: chartData.periodNames,
  settings: styleSettings.exportSettings(),
  timestamp: new Date().toISOString(),
};
localStorage.setItem('chart', JSON.stringify(snapshot));
```

**Restore state:**
```javascript
const saved = JSON.parse(localStorage.getItem('chart'));
chartData.loadSnapshotData(saved.data, saved.periodNames);
styleSettings.importSettings(saved.settings, chartType);
```

---

## Figma Plugin Integration

### Overview

DataStory Charts is available as a **Figma plugin** that embeds the full web application inside Figma. Users can create charts and insert them as native, editable vector nodes.

**Key files:**
- `figma-plugin/` - Plugin code and configuration
- `src/shared/hooks/useFigmaMode.js` - Detection and communication hook

### How It Works

**Architecture:**
1. **Plugin loads web app in iframe** (`ui.html` → `https://charts.findandtell.co?mode=figma`)
2. **App detects Figma mode** via `?mode=figma` URL parameter
3. **User creates chart** in embedded React app
4. **App sends SVG** to plugin via `postMessage` API
5. **Plugin creates Figma nodes** from SVG using `figma.createNodeFromSvg()`
6. **Chart appears** on canvas as editable vectors

### Using useFigmaMode Hook

```javascript
import { useFigmaMode } from '@shared/hooks/useFigmaMode';

const ChartEditor = () => {
  const figma = useFigmaMode();

  // Check if running in Figma
  if (figma.isFigmaMode) {
    console.log('Running in Figma plugin');
  }

  // Send chart to Figma
  const handleInsertToFigma = () => {
    const svgElement = svgRef.current?.querySelector('svg');
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const success = figma.sendToFigma(svgString, styleSettings.title);

    if (success) {
      figma.notifyFigma('Chart inserted! ✅');
    }
  };

  return (
    <>
      {figma.isFigmaMode && (
        <button onClick={handleInsertToFigma}>
          Insert to Figma
        </button>
      )}
    </>
  );
};
```

### Plugin Development

**Build plugin:**
```bash
cd figma-plugin
npm run build        # Compiles code.ts → code.js
npm run watch        # Watch mode
```

**Load in Figma Desktop:**
1. `Figma → Plugins → Development → Import plugin from manifest...`
2. Select `figma-plugin/manifest.json`
3. Run: `Plugins → Development → Find&Tell Charts`

**Test with local app:**
```javascript
// Edit ui.html line 99
src="http://localhost:5173?mode=figma"  // Local
src="https://charts.findandtell.co?mode=figma"  // Production
```

**See [@FIGMA_PLUGIN.md](FIGMA_PLUGIN.md) for complete documentation.**

---

## Testing

**Run tests:**
```bash
npm test                 # All tests
npm run test:ui          # Vitest UI (recommended)
npm run test:coverage    # Coverage report
npm test -- BarChart     # Specific file
```

**Test structure:**
- `src/shared/utils/*.test.js` - Unit tests for utilities
- `src/test/integration/*.test.jsx` - Integration tests
- `src/charts/*/ChartName.test.jsx` - Component tests

**Coverage targets:**
- Utilities: 90%+
- Hooks: 80%+
- Components: 70%+
- Overall: 75%+

---

## Common Issues & Solutions

### Chart doesn't update when data changes
→ Add `data` to useEffect dependency array

### Colors undefined in production
→ Import color schemes directly from `d3-scale-chromatic`

### Element coordinates are (0, 0)
→ Use POST-RENDER effect pattern (see PATTERNS.md)

### Duplicate elements after re-render
→ Add `svg.selectAll('*').remove()` before rendering

### Admin defaults don't load
→ Don't call `clearEmphasis()` before `importSettings()`

**See [@TROUBLESHOOTING.md](TROUBLESHOOTING.md) for complete troubleshooting guide.**

---

## Documentation Map

### Getting Started
- [@README.md](README.md) - Project overview and setup
- [@QUICKSTART.md](QUICKSTART.md) - Quick examples and debugging
- [@CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute

### Architecture & Patterns
- [@ARCHITECTURE.md](ARCHITECTURE.md) - System architecture deep dive ⭐
- [@PATTERNS.md](PATTERNS.md) - Production-proven patterns ⭐
- [@STATE-MANAGEMENT.md](STATE-MANAGEMENT.md) - State architecture guide
- [@API-REFERENCE.md](API-REFERENCE.md) - Complete API documentation

### Development Guides
- [@ADDING-CHARTS.md](ADDING-CHARTS.md) - Adding new chart types
- [@TESTING.md](TESTING.md) - Testing guide
- [@IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md) - Common workflows

### Reference
- [@TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues and solutions
- [@PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Project history

---

## Key Learnings from Production

### Vite Tree-Shaking
**Problem:** D3 color schemes undefined in production
**Solution:** Import directly from `d3-scale-chromatic`

### CDN Caching
**Problem:** Custom domain caches bundles for 24+ hours
**Solution:** Test on direct Vercel URL first (`yourapp.vercel.app`)

### React + D3 Integration
**Problem:** Duplicate elements, stale closures, missing updates
**Solution:** Clear before render, include all dependencies, use refs for D3

### Admin Defaults Loading
**Problem:** Settings cleared before import
**Solution:** Import settings without clearing first

### POST-RENDER Pattern
**Problem:** Element coordinates unavailable immediately
**Solution:** Separate effect that runs after chart renders

---

## Quick Reference

### Load Sample Data
```javascript
const chartData = useChartData('bar');
chartData.loadSampleData('barSimple');
```

### Update Styling
```javascript
const styleSettings = useStyleSettings();
styleSettings.setTitle('Q4 Sales');
styleSettings.setComparisonPalette('vibrant');
```

### Format Numbers
```javascript
import { formatNumber, formatPercentage } from '@shared/utils/dataFormatters';
formatNumber(1500000, true);    // "1.5M"
formatPercentage(23.456, 1);    // "23.5%"
```

### Work with Colors
```javascript
import { lightenColor, getContrastTextColor } from '@shared/utils/colorUtils';
const lighter = lightenColor("#1e40af", 20);
const textColor = getContrastTextColor("#1e40af");
```

### Export Chart Settings
```javascript
const settings = styleSettings.exportSettings();
localStorage.setItem('settings', JSON.stringify(settings));
```

---

## Project Stats

- **Total Documentation:** 40,000+ words
- **Tests:** 100 passing (43 unit + 57 integration)
- **Chart Types:** Funnel, Bar (4 variants), Line (3 variants), Slope
- **Sample Datasets:** 15+ production-ready examples
- **Code Coverage:** 75%+ overall

---

## Important Reminders

### Before Committing
- [ ] Run tests: `npm test`
- [ ] Run linter: `npm run lint`
- [ ] Check coverage: `npm run test:coverage`
- [ ] Test production build: `npm run build && npm run preview`

### Before Deploying
- [ ] All tests pass
- [ ] No console.logs in production code
- [ ] Color schemes imported directly (not from d3)
- [ ] All dependencies in useEffect arrays
- [ ] Clear SVG before each render

### Code Review Checklist
- [ ] Follows existing patterns
- [ ] Includes tests
- [ ] Updates documentation
- [ ] No commented-out code
- [ ] No security vulnerabilities (XSS, injection, etc.)

---

## Need Help?

1. **Check docs first:**
   - [ARCHITECTURE.md](ARCHITECTURE.md) for system design
   - [PATTERNS.md](PATTERNS.md) for React + D3 patterns
   - [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues

2. **Search issues:**
   - GitHub Issues
   - GitHub Discussions

3. **Debug yourself:**
   - Add console.logs
   - Use React DevTools
   - Check browser console

4. **Still stuck?** Open a GitHub Discussion with:
   - Clear description of problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages
   - What you've tried

---

**Last Updated:** 2025-01-18
**Maintainer:** Project Team
**Version:** 2.0.0
**Status:** ✅ Production Ready

---

## Claude Code Memory Notes

This file auto-loads when starting Claude Code sessions in this project. It provides:
- Essential coding conventions
- Critical production patterns
- Quick reference for common tasks
- Links to comprehensive documentation

For deeper dives into specific topics, see the imported documentation files above using the @ syntax.
