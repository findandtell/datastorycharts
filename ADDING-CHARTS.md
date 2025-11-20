# Adding New Chart Types

**Complete guide to extending the chart platform with new visualizations**

This guide walks you through adding a new chart type to the funnel-viz platform. We'll cover the architecture, patterns, and best practices learned from production experience.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start Checklist](#quick-start-checklist)
4. [Step-by-Step Guide](#step-by-step-guide)
5. [Chart Component Structure](#chart-component-structure)
6. [Defaults File Structure](#defaults-file-structure)
7. [Registry Integration](#registry-integration)
8. [D3 Integration Patterns](#d3-integration-patterns)
9. [Testing Your Chart](#testing-your-chart)
10. [Common Patterns](#common-patterns)
11. [Troubleshooting](#troubleshooting)
12. [Examples](#examples)

---

## Overview

The platform uses a **modular chart architecture** where each chart type is:
- **Self-contained** - All chart logic lives in its own folder
- **Registered** - Charts are discoverable via the central registry
- **Consistent** - All charts follow the same interface and patterns

### Current Chart Types

- **Funnel Chart** - Conversion funnels with drop-off visualization
- **Bar Chart** - Horizontal/vertical, grouped/stacked bar charts
- **Line/Area Chart** - Time-series trends with multiple modes
- **Slope Chart** - Change between two time periods

### Architecture Benefits

✅ **Easy to add new charts** - Just create component + defaults + register
✅ **Shared utilities** - Reuse data formatters, color utils, etc.
✅ **Consistent UX** - All charts use the same control panel pattern
✅ **Type-safe** - Clear interfaces and prop structures

---

## Prerequisites

Before adding a new chart, you should understand:

1. **React Hooks** - Charts use hooks for state management
2. **D3.js Basics** - Most charts use D3 for rendering (SVG manipulation, scales, axes)
3. **useChartData Hook** - How data flows through the system (see [ARCHITECTURE.md](ARCHITECTURE.md#data-flow))
4. **Existing Charts** - Review similar chart implementations for patterns

**Recommended Reading:**
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture and data flow
- [PATTERNS.md](PATTERNS.md) - Production-proven patterns and gotchas
- [src/charts/registry.js](src/charts/registry.js) - Chart registry structure

---

## Quick Start Checklist

Adding a new chart type involves these steps:

- [ ] **1. Create chart folder** - `src/charts/YourChart/`
- [ ] **2. Create defaults file** - `YourChart/yourChartDefaults.js`
- [ ] **3. Create chart component** - `YourChart/YourChart.jsx`
- [ ] **4. Register chart** - Add entry to `src/charts/registry.js`
- [ ] **5. Add sample data** - Create dataset in `src/shared/data/sampleDatasets.js`
- [ ] **6. Test rendering** - Verify chart renders with default data
- [ ] **7. Add chart controls** - Create settings panel (optional)
- [ ] **8. Write tests** - Unit and integration tests
- [ ] **9. Document** - Add to README and this guide

**Estimated time:** 4-8 hours for a basic chart, 1-2 days for complex visualizations

---

## Step-by-Step Guide

### Step 1: Create Chart Folder

Create a new folder for your chart in `src/charts/`:

```bash
mkdir src/charts/PieChart
```

**Folder structure:**
```
src/charts/PieChart/
├── PieChart.jsx              # Main chart component
├── pieChartDefaults.js       # Default style settings
└── PieChart.test.jsx         # Tests (optional but recommended)
```

---

### Step 2: Create Defaults File

The defaults file defines the initial style settings for your chart.

**Create `src/charts/PieChart/pieChartDefaults.js`:**

```javascript
/**
 * Default style settings for Pie Chart
 */
export const defaultStyleSettings = {
  // Chart mode
  donutMode: false, // true = donut, false = pie

  // Color settings
  colorPalette: 'vibrant',
  customColors: [],

  // Label settings
  showLabels: true,
  showPercentages: true,
  labelPosition: 'outside', // 'outside', 'inside', or 'none'

  // Font settings
  labelFont: 'Inter',
  labelFontSize: 14,
  labelWeight: 400,

  valueFont: 'Inter',
  valueFontSize: 12,
  valueWeight: 600,

  // Pie styling
  donutThickness: 0.6, // Inner radius ratio (0-1)
  pieOpacity: 1,
  pieStroke: '#ffffff',
  pieStrokeWidth: 2,

  // Chart dimensions
  chartHeight: 500,
  chartWidth: 500,
  marginTop: 40,
  marginRight: 40,
  marginBottom: 40,
  marginLeft: 40,
};

/**
 * Demo dataset for Pie Chart
 */
export const defaultPieChartData = {
  data: [
    { Category: 'Product A', Value: 30 },
    { Category: 'Product B', Value: 25 },
    { Category: 'Product C', Value: 20 },
    { Category: 'Product D', Value: 15 },
    { Category: 'Product E', Value: 10 },
  ],
  periods: ['Value'],
};
```

**Key principles:**
- Group related settings (colors, fonts, layout, etc.)
- Use clear, descriptive names
- Include comments for complex settings
- Provide sensible defaults
- Include demo data for testing

---

### Step 3: Create Chart Component

The chart component receives data and settings, then renders the visualization.

**Create `src/charts/PieChart/PieChart.jsx`:**

```javascript
import { useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';

/**
 * Pie Chart Component
 *
 * Renders a pie or donut chart using D3.js
 *
 * @param {Object} props
 * @param {Array} props.data - Chart data array
 * @param {Array} props.periodNames - Column/metric names
 * @param {Object} props.styleSettings - Chart style configuration
 */
const PieChart = ({ data, periodNames, styleSettings = {} }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  // Extract settings with defaults
  const {
    donutMode = false,
    donutThickness = 0.6,
    colorPalette = 'vibrant',
    customColors = [],
    showLabels = true,
    showPercentages = true,
    labelPosition = 'outside',
    chartHeight = 500,
    chartWidth = 500,
    marginTop = 40,
    marginRight = 40,
    marginBottom = 40,
    marginLeft = 40,
  } = styleSettings;

  // Process data - convert to D3-friendly format
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const valueColumn = periodNames[0] || 'Value';

    return data.map(row => ({
      category: row.Category || row.Stage || row.label,
      value: row[valueColumn] || 0,
    }));
  }, [data, periodNames]);

  // Calculate dimensions
  const innerWidth = chartWidth - marginLeft - marginRight;
  const innerHeight = chartHeight - marginTop - marginBottom;
  const radius = Math.min(innerWidth, innerHeight) / 2;
  const innerRadius = donutMode ? radius * donutThickness : 0;

  // Render chart
  useEffect(() => {
    if (!svgRef.current || processedData.length === 0) return;

    // Clear previous render
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create main group
    const g = svg
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .append('g')
      .attr('transform', `translate(${chartWidth / 2}, ${chartHeight / 2})`);

    // Create pie layout
    const pie = d3.pie()
      .value(d => d.value)
      .sort(null);

    // Create arc generator
    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(radius);

    // Get color scale (from shared utilities)
    const colorScale = d3.scaleOrdinal()
      .domain(processedData.map(d => d.category))
      .range(customColors.length > 0
        ? customColors
        : d3.schemeTableau10 // Use D3 color scheme
      );

    // Draw pie slices
    const slices = g.selectAll('path')
      .data(pie(processedData))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', d => colorScale(d.data.category))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('opacity', 1);

    // Add labels (if enabled)
    if (showLabels && labelPosition !== 'none') {
      const labelArc = d3.arc()
        .innerRadius(radius * 0.7)
        .outerRadius(radius * 0.7);

      g.selectAll('text')
        .data(pie(processedData))
        .enter()
        .append('text')
        .attr('transform', d => `translate(${labelArc.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .attr('font-family', 'Inter')
        .attr('font-size', 14)
        .text(d => {
          const percentage = ((d.endAngle - d.startAngle) / (2 * Math.PI) * 100).toFixed(1);
          return showPercentages
            ? `${d.data.category} (${percentage}%)`
            : d.data.category;
        });
    }

  }, [processedData, donutMode, innerRadius, radius, chartWidth, chartHeight,
      showLabels, showPercentages, labelPosition, customColors]);

  return (
    <div ref={containerRef} className="pie-chart-container">
      <svg ref={svgRef} />
    </div>
  );
};

export default PieChart;
```

**Key patterns:**
- Use `useRef` for SVG and container references
- Use `useMemo` to process data efficiently
- Use `useEffect` to render D3 visualizations
- Clear previous render before drawing new one
- Extract all settings from props with defaults

---

### Step 4: Register Chart

Add your chart to the registry so it's discoverable throughout the app.

**Edit `src/charts/registry.js`:**

```javascript
// 1. Import your chart component
import PieChart from './PieChart/PieChart';

// 2. Import icon (from Heroicons or use emoji)
import { ChartPieIcon } from '@heroicons/react/24/outline';

// 3. Add registry entry
export const chartRegistry = {
  // ... existing charts ...

  pie: {
    name: 'Pie Chart',
    component: PieChart,
    icon: ChartPieIcon,
    description: 'Show proportional relationships',
    supportsComparison: false,
    category: 'distribution',
    defaultSettings: {
      donutMode: false,
      showLabels: true,
    },
    defaultDataset: 'pieChartDefault', // Reference to sample data
  },

  donut: {
    name: 'Donut Chart',
    component: PieChart, // Same component, different defaults
    icon: ChartPieIcon,
    description: 'Pie chart with hollow center',
    supportsComparison: false,
    category: 'distribution',
    defaultSettings: {
      donutMode: true,
      donutThickness: 0.6,
      showLabels: true,
    },
    defaultDataset: 'pieChartDefault',
  },
};
```

**Registry fields:**
- `name` - Display name in UI
- `component` - React component
- `icon` - Heroicon component or emoji
- `description` - Brief description
- `supportsComparison` - Can chart show multiple periods?
- `category` - Chart category (`flow`, `comparison`, `distribution`, `trend`)
- `defaultSettings` - Chart-specific default settings
- `defaultDataset` - Sample dataset key

---

### Step 5: Add Sample Data

Create a sample dataset for your chart in `src/shared/data/sampleDatasets.js`.

**Add to `sampleDatasets.js`:**

```javascript
export const sampleDatasets = {
  // ... existing datasets ...

  pieChartDefault: {
    name: "Market Share by Product",
    description: "Product market share distribution",
    chartType: "pie",
    data: [
      { Category: 'Product A', Value: 35 },
      { Category: 'Product B', Value: 25 },
      { Category: 'Product C', Value: 20 },
      { Category: 'Product D', Value: 12 },
      { Category: 'Product E', Value: 8 },
    ],
  },
};
```

---

### Step 6: Test Your Chart

Run the development server and navigate to your chart:

```bash
npm run dev
# Navigate to http://localhost:5173/chart/pie
```

**Testing checklist:**
- ✅ Chart renders with default data
- ✅ Chart updates when data changes
- ✅ Chart responds to style settings
- ✅ No console errors or warnings
- ✅ Chart handles empty data gracefully
- ✅ Chart handles edge cases (1 item, 100 items, negative values)

---

## Chart Component Structure

### Required Props

All chart components should accept these props:

```javascript
const MyChart = ({
  data,              // Array of data objects
  periodNames,       // Array of column/metric names
  styleSettings,     // Object with style configuration
  ...otherProps      // Chart-specific props
}) => {
  // Component logic
};
```

### Recommended Patterns

**1. Use refs for D3 elements:**
```javascript
const svgRef = useRef(null);
const containerRef = useRef(null);
```

**2. Process data with useMemo:**
```javascript
const processedData = useMemo(() => {
  // Transform data for D3
  return data.map(/* ... */);
}, [data, periodNames]);
```

**3. Render with useEffect:**
```javascript
useEffect(() => {
  if (!svgRef.current || !data) return;

  const svg = d3.select(svgRef.current);
  svg.selectAll('*').remove(); // Clear previous

  // D3 rendering logic

}, [data, styleSettings /* dependencies */]);
```

**4. Handle cleanup:**
```javascript
useEffect(() => {
  // Render logic

  return () => {
    // Cleanup if needed (remove event listeners, etc.)
  };
}, [dependencies]);
```

---

## Defaults File Structure

### Template

```javascript
/**
 * Default style settings for [ChartName]
 */
export const defaultStyleSettings = {
  // ===== Visual Settings =====
  // Colors, opacity, borders, etc.

  // ===== Typography =====
  // Fonts, sizes, weights

  // ===== Layout =====
  // Dimensions, margins, spacing

  // ===== Chart-Specific =====
  // Mode, orientation, etc.
};

/**
 * Demo dataset for [ChartName]
 */
export const defaultChartData = {
  data: [/* sample data */],
  periods: [/* column names */],
};
```

### Best Practices

✅ **Group related settings** - Color settings together, fonts together, etc.
✅ **Use descriptive names** - `barPadding` not `pad`, `showGridLines` not `grid`
✅ **Include comments** - Explain complex settings or valid values
✅ **Provide demo data** - Include realistic sample data for testing
✅ **Match component props** - Settings should map 1:1 to component props

---

## Registry Integration

### Registry Entry Template

```javascript
'chart-key': {
  name: 'Chart Display Name',
  component: ChartComponent,
  icon: IconComponent, // Heroicon or emoji
  description: 'Brief description for UI',
  supportsComparison: true/false,
  category: 'flow' | 'comparison' | 'distribution' | 'trend',
  defaultSettings: {
    // Chart-specific defaults
  },
  defaultDataset: 'datasetKey',
},
```

### Multiple Variants

One component can serve multiple chart types:

```javascript
'bar-horizontal': {
  component: BarChart,
  defaultSettings: { orientation: 'horizontal' },
},

'bar-vertical': {
  component: BarChart,
  defaultSettings: { orientation: 'vertical' },
},
```

---

## D3 Integration Patterns

### Pattern 1: SVG Rendering with useEffect

```javascript
useEffect(() => {
  if (!svgRef.current || !data) return;

  const svg = d3.select(svgRef.current);
  svg.selectAll('*').remove(); // IMPORTANT: Clear previous render

  // Set dimensions
  svg.attr('width', width).attr('height', height);

  // Create scales
  const xScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .range([0, innerWidth]);

  // Render elements
  svg.selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', (d, i) => i * barWidth)
    .attr('y', d => height - yScale(d.value))
    .attr('width', barWidth)
    .attr('height', d => yScale(d.value))
    .attr('fill', colorScale);

}, [data, width, height /* all dependencies */]);
```

**Critical: Always include ALL dependencies** in the useEffect dependency array. Missing dependencies cause stale data bugs. See [PATTERNS.md#pattern-post-render-population](PATTERNS.md#pattern-post-render-population).

---

### Pattern 2: Avoid D3 Color Scheme Tree-Shaking

**❌ WRONG - Gets tree-shaken by Vite:**
```javascript
import * as d3 from 'd3';
const colors = d3.schemeTableau10; // undefined in production!
```

**✅ CORRECT - Import directly:**
```javascript
import { schemeTableau10 } from 'd3-scale-chromatic';
const colors = schemeTableau10;
```

See [PATTERNS.md#gotcha-vite-tree-shaking-d3-schemes](PATTERNS.md#gotcha-vite-tree-shaking-d3-schemes) for details.

---

### Pattern 3: Coordinate Access After Render

If you need element coordinates (e.g., for annotations), ensure D3 has rendered first:

```javascript
// POST-RENDER effect - runs after D3 renders
useEffect(() => {
  // Check if elements exist before accessing coordinates
  const bars = d3.selectAll('.bar').nodes();

  if (bars.length === 0) return; // Guards against premature access

  // Now safe to access coordinates
  bars.forEach(bar => {
    const bbox = bar.getBBox();
    console.log('Bar position:', bbox.x, bbox.y);
  });

}, [data, styleSettings]); // Runs after chart renders
```

See [PATTERNS.md#pattern-post-render-population](PATTERNS.md#pattern-post-render-population) for complete pattern.

---

### Pattern 4: Responsive Sizing

```javascript
const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

useEffect(() => {
  const handleResize = () => {
    if (containerRef.current) {
      const { width } = containerRef.current.getBoundingClientRect();
      setDimensions({ width, height: width * 0.6 });
    }
  };

  window.addEventListener('resize', handleResize);
  handleResize(); // Initial size

  return () => window.removeEventListener('resize', handleResize);
}, []);
```

---

## Testing Your Chart

### Unit Tests

Test the component in isolation:

```javascript
// src/charts/PieChart/PieChart.test.jsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import PieChart from './PieChart';

describe('PieChart', () => {
  const mockData = [
    { Category: 'A', Value: 30 },
    { Category: 'B', Value: 70 },
  ];

  it('should render without crashing', () => {
    const { container } = render(
      <PieChart
        data={mockData}
        periodNames={['Value']}
        styleSettings={{}}
      />
    );
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('should handle empty data', () => {
    const { container } = render(
      <PieChart
        data={[]}
        periodNames={['Value']}
        styleSettings={{}}
      />
    );
    // Should not crash
    expect(container).toBeTruthy();
  });
});
```

### Integration Tests

Test chart rendering with data loading:

```javascript
// src/test/integration/pieChart.test.jsx
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChartData } from '@shared/hooks/useChartData';

describe('PieChart Data Integration', () => {
  it('should load sample data for pie chart', () => {
    const { result } = renderHook(() => useChartData('pie'));

    act(() => {
      result.current.loadSampleData('pieChartDefault');
    });

    expect(result.current.data).toBeTruthy();
    expect(result.current.data.length).toBeGreaterThan(0);
    expect(result.current.periodNames).toContain('Value');
  });
});
```

See [TESTING.md](TESTING.md) for comprehensive testing guide.

---

## Common Patterns

### Pattern: Shared Color Utilities

Use shared color utilities instead of hardcoding colors:

```javascript
import { getColorPalette, interpolateColor } from '@shared/utils/colorUtils';

const colors = getColorPalette(styleSettings.colorPalette, dataLength);
```

### Pattern: Data Formatters

Use shared formatters for consistent number formatting:

```javascript
import { formatCompactNumber, formatPercentage } from '@shared/utils/dataFormatters';

// In labels
.text(d => formatCompactNumber(d.value))
```

### Pattern: Calculations

Use shared calculation utilities:

```javascript
import { calculateConversionRate, calculateTrend } from '@shared/utils/calculations';

const conversionRate = calculateConversionRate(current, previous);
```

### Pattern: Export Functionality

Add export support to your chart:

```javascript
import { exportAsPNG, exportAsSVG } from '@shared/utils/exportHelpers';

// In component
const handleExport = () => {
  if (svgRef.current) {
    exportAsPNG(svgRef.current, 'my-chart.png');
  }
};
```

---

## Troubleshooting

### Chart doesn't render

**Check:**
- Is `svgRef.current` defined in useEffect?
- Is data array not empty?
- Are there console errors?
- Did you clear previous render (`svg.selectAll('*').remove()`)?

### Chart doesn't update when data changes

**Check:**
- Is `data` in useEffect dependency array?
- Is `styleSettings` in dependency array?
- Are you using `useMemo` for processed data?

### Colors are undefined in production

**Problem:** Vite tree-shaking D3 color schemes

**Solution:** Import directly from d3-scale-chromatic:
```javascript
import { schemeTableau10 } from 'd3-scale-chromatic';
```

See [PATTERNS.md#gotcha-vite-tree-shaking-d3-schemes](PATTERNS.md#gotcha-vite-tree-shaking-d3-schemes).

### Coordinates are (0, 0) or undefined

**Problem:** Accessing element coordinates before D3 renders

**Solution:** Use POST-RENDER effect with guards:
```javascript
useEffect(() => {
  const elements = d3.selectAll('.my-element').nodes();
  if (elements.length === 0) return; // Guard

  // Now safe to access coordinates
}, [data, styleSettings]);
```

See [PATTERNS.md#pattern-post-render-population](PATTERNS.md#pattern-post-render-population).

### Settings don't load from admin defaults

**Check:**
- Are settings properly validated in `importSettings()`?
- Is `useMemo` dependency array complete?
- Are you clearing states before importing new ones?

See [PATTERNS.md#pattern-usememo-with-explicit-dependencies](PATTERNS.md#pattern-usememo-with-explicit-dependencies).

---

## Examples

### Example: Simple Bar Chart

Minimal implementation showing core patterns:

```javascript
import { useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import { schemeTableau10 } from 'd3-scale-chromatic';

const SimpleBarChart = ({ data, periodNames, styleSettings = {} }) => {
  const svgRef = useRef(null);

  const {
    chartHeight = 400,
    chartWidth = 600,
    marginTop = 20,
    marginRight = 20,
    marginBottom = 30,
    marginLeft = 40,
  } = styleSettings;

  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const valueCol = periodNames[0] || 'Value';
    return data.map(d => ({
      category: d.Category || d.Stage,
      value: d[valueCol] || 0,
    }));
  }, [data, periodNames]);

  useEffect(() => {
    if (!svgRef.current || processedData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const innerWidth = chartWidth - marginLeft - marginRight;
    const innerHeight = chartHeight - marginTop - marginBottom;

    const g = svg
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .append('g')
      .attr('transform', `translate(${marginLeft},${marginTop})`);

    // Scales
    const xScale = d3.scaleBand()
      .domain(processedData.map(d => d.category))
      .range([0, innerWidth])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(processedData, d => d.value)])
      .range([innerHeight, 0]);

    // Bars
    g.selectAll('rect')
      .data(processedData)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.category))
      .attr('y', d => yScale(d.value))
      .attr('width', xScale.bandwidth())
      .attr('height', d => innerHeight - yScale(d.value))
      .attr('fill', schemeTableau10[0]);

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale));

    g.append('g')
      .call(d3.axisLeft(yScale));

  }, [processedData, chartWidth, chartHeight, marginTop, marginRight, marginBottom, marginLeft]);

  return <svg ref={svgRef} />;
};

export default SimpleBarChart;
```

### Example: Registry Entry with Multiple Variants

```javascript
// One component, multiple chart types
'bar-simple': {
  name: 'Simple Bar',
  component: BarChart,
  icon: ChartBarIcon,
  description: 'Single-series bar chart',
  supportsComparison: false,
  category: 'comparison',
  defaultSettings: {
    orientation: 'vertical',
    barMode: 'simple',
  },
  defaultDataset: 'barSimple',
},

'bar-grouped': {
  name: 'Grouped Bar',
  component: BarChart, // Same component
  icon: ChartBarSquareIcon,
  description: 'Multi-series grouped bars',
  supportsComparison: true,
  category: 'comparison',
  defaultSettings: {
    orientation: 'vertical',
    barMode: 'grouped',
  },
  defaultDataset: 'barGrouped',
},
```

---

## Next Steps

After adding your chart:

1. **Test thoroughly** - Unit tests, integration tests, manual testing
2. **Document** - Add to README, update this guide with learnings
3. **Create examples** - Add sample datasets showcasing your chart
4. **Get feedback** - Share with team, iterate on design
5. **Performance** - Test with large datasets (1000+ rows)
6. **Accessibility** - Ensure keyboard navigation, screen reader support

---

## Additional Resources

- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture and data flow
- [PATTERNS.md](PATTERNS.md) - Production-proven patterns and anti-patterns
- [TESTING.md](TESTING.md) - Testing guide and best practices
- [D3.js Documentation](https://d3js.org/) - D3.js official docs
- [Heroicons](https://heroicons.com/) - Icon library

---

**Questions or issues?** Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) or review existing chart implementations in `src/charts/`.

---

**Last Updated:** 2025-01-18
**Maintainer:** Project Team
**Status:** ✅ Complete & Production-Tested
