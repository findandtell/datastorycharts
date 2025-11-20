# Quick Start Guide

Get up and running with the refactored funnel visualization platform in minutes.

## Installation

```bash
# Clone or download the project
cd funnel-viz-refactored

# Install dependencies
npm install

# Start development server
npm run dev
```

## Basic Usage

### 1. Create a Simple Chart

```javascript
import React from 'react';
import { useChartData } from './shared/hooks/useChartData';
import { useStyleSettings } from './shared/hooks/useStyleSettings';

function MyChart() {
  // Load data
  const { data, loadSampleData, periodNames } = useChartData();
  
  // Load a sample dataset
  React.useEffect(() => {
    loadSampleData('ecommerce');
  }, []);

  // Get style settings
  const { title, barColor } = useStyleSettings();

  return (
    <div>
      <h1>{title}</h1>
      {data && (
        <div>
          {data.map((stage, i) => (
            <div key={i}>
              {stage.Stage}: {stage[periodNames[0]]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 2. Load Custom Data

```javascript
import { useChartData } from './shared/hooks/useChartData';

function DataLoader() {
  const { loadCSVFile, data, error } = useChartData();

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    const success = await loadCSVFile(file);
    
    if (success) {
      console.log('Data loaded:', data);
    } else {
      console.error('Error:', error);
    }
  };

  return (
    <input 
      type="file" 
      accept=".csv" 
      onChange={handleUpload} 
    />
  );
}
```

### 3. Format Data

```javascript
import { formatNumber, formatPercentage } from './shared/utils/dataFormatters';
import { calculateConversionRate } from './shared/utils/calculations';

function MetricsDisplay({ current, previous }) {
  const conversionRate = calculateConversionRate(current, previous);
  
  return (
    <div>
      <p>Current: {formatNumber(current, true)}</p>
      <p>Conversion: {formatPercentage(conversionRate)}</p>
    </div>
  );
}
```

### 4. Customize Colors

```javascript
import { useStyleSettings } from './shared/hooks/useStyleSettings';
import { calculateSegmentColor } from './shared/utils/colorUtils';

function ColoredBars({ data }) {
  const { barColor, colorTransition } = useStyleSettings();
  
  return (
    <div>
      {data.map((item, i) => {
        const color = calculateSegmentColor(
          barColor, 
          i, 
          data.length, 
          colorTransition
        );
        
        return (
          <div 
            key={i} 
            style={{ backgroundColor: color, height: 40 }}
          >
            {item.value}
          </div>
        );
      })}
    </div>
  );
}
```

## Common Patterns

### Pattern 1: Data Loading with Error Handling

```javascript
function SafeDataLoader() {
  const { loadSampleData, error, hasData } = useChartData();
  
  const load = async (key) => {
    const success = loadSampleData(key);
    if (!success && error) {
      alert(`Error: ${error}`);
    }
  };
  
  return (
    <div>
      <button onClick={() => load('ecommerce')}>Load E-commerce</button>
      {hasData && <p>✓ Data loaded</p>}
    </div>
  );
}
```

### Pattern 2: Style Presets

```javascript
function StylePresets() {
  const {
    barColor,
    setBarColor,
    resetToDefaults,
    exportSettings,
  } = useStyleSettings();
  
  const presets = {
    blue: { barColor: '#1e40af' },
    green: { barColor: '#059669' },
    red: { barColor: '#dc2626' },
  };
  
  const applyPreset = (preset) => {
    setBarColor(preset.barColor);
  };
  
  return (
    <div>
      {Object.entries(presets).map(([name, preset]) => (
        <button key={name} onClick={() => applyPreset(preset)}>
          {name}
        </button>
      ))}
      <button onClick={resetToDefaults}>Reset</button>
    </div>
  );
}
```

### Pattern 3: Export Functionality

```javascript
import { exportAsPNG, exportAsSVG } from './shared/utils/exportHelpers';

function ExportButtons({ svgRef }) {
  const handleExport = async (format) => {
    const svg = svgRef.current;
    
    if (format === 'png') {
      await exportAsPNG(svg, 'chart.png', 2);
    } else if (format === 'svg') {
      exportAsSVG(svg, 'chart.svg');
    }
  };
  
  return (
    <div>
      <button onClick={() => handleExport('png')}>Export PNG</button>
      <button onClick={() => handleExport('svg')}>Export SVG</button>
    </div>
  );
}
```

### Pattern 4: Comparison Charts

```javascript
import { comparisonPalettes, getPaletteColors } from './shared/design-system/colorPalettes';

function ComparisonChart({ data, periods }) {
  const colors = getPaletteColors('professional');
  
  return (
    <div>
      {data.map((stage, i) => (
        <div key={i}>
          <h3>{stage.Stage}</h3>
          {periods.map((period, j) => (
            <div 
              key={j}
              style={{ 
                backgroundColor: colors[j % colors.length],
                width: stage[period],
              }}
            >
              {period}: {stage[period]}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

## Available Sample Datasets

```javascript
import { getSampleDataset, getSampleDatasetKeys } from './shared/data/sampleDatasets';

// Get all available keys
const allKeys = getSampleDatasetKeys();
// ['generic', 'ecommerce', 'saas', 'marketing', ...]

// Load specific dataset
const ecommerceData = getSampleDataset('ecommerce');
```

**Available datasets:**
- `generic` - Simple 5-stage funnel
- `ecommerce` - Customer journey
- `saas` - B2B software sales
- `marketing` - Campaign performance
- `content` - Media engagement
- `mobileApp` - App user journey
- `b2bLeads` - Enterprise sales
- `ageComparison` - Age demographics
- `abTest` - A/B test results
- `deviceComparison` - Device performance
- `channelComparison` - Marketing channels
- `timeComparison` - Weekday vs Weekend

## CSV Format

Your CSV should have this structure:

```csv
Stage,Period 1,Period 2,Period 3
Homepage Visit,10000,9500,9000
Product View,5000,4750,4500
Add to Cart,2500,2400,2250
Checkout,1000,960,900
Purchase,500,480,450
```

**Requirements:**
- First column: Stage names
- Other columns: Numeric values for each period
- At least 2 stages
- At least 1 period

## Styling

### Custom Theme

```javascript
import { createCustomTheme } from './shared/design-system/theme';

const myTheme = createCustomTheme({
  typography: {
    sizes: {
      title: 32,
      subtitle: 18,
    }
  },
  colors: {
    primary: '#6366f1',
  }
});

// Use with hook
const styleSettings = useStyleSettings(myTheme);
```

### Color Utilities

```javascript
import { 
  lightenColor, 
  darkenColor, 
  interpolateColor 
} from './shared/utils/colorUtils';

const lightBlue = lightenColor('#1e40af', 20); // Lighten by 20%
const darkBlue = darkenColor('#1e40af', 20);   // Darken by 20%
const midColor = interpolateColor('#1e40af', '#dc2626', 0.5); // 50% between
```

## Tips & Tricks

### 1. Performance Optimization

```javascript
import { useMemo } from 'react';

function OptimizedChart({ data }) {
  const processedData = useMemo(() => {
    return data.map(/* expensive calculation */);
  }, [data]);
  
  return <Chart data={processedData} />;
}
```

### 2. Debouncing User Input

```javascript
import { useState, useCallback } from 'react';
import debounce from 'lodash/debounce';

function SearchableChart() {
  const [query, setQuery] = useState('');
  const { data } = useChartData();
  
  const updateQuery = useCallback(
    debounce((value) => setQuery(value), 300),
    []
  );
  
  return <input onChange={(e) => updateQuery(e.target.value)} />;
}
```

### 3. Responsive Charts

```javascript
function ResponsiveChart() {
  const { 
    canvasWidth, 
    canvasHeight, 
    updateAspectRatio 
  } = useStyleSettings();
  
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        updateAspectRatio('3:4'); // Portrait for mobile
      } else {
        updateAspectRatio('16:9'); // Landscape for desktop
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return <svg width={canvasWidth} height={canvasHeight}>...</svg>;
}
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in UI mode (recommended for development)
npm run test:ui

# Run tests once (CI mode)
npm run test:run

# Run with coverage report
npm run test:coverage

# Run specific test file
npm test -- BarChart

# Run tests matching pattern
npm test -- -t "should render"
```

### Writing Tests

**Test a utility function:**
```javascript
import { describe, it, expect } from 'vitest';
import { formatCompactNumber } from '@shared/utils/dataFormatters';

describe('formatCompactNumber', () => {
  it('should format thousands with K', () => {
    expect(formatCompactNumber(1000)).toBe('1.0K');
    expect(formatCompactNumber(1500)).toBe('1.5K');
  });

  it('should handle edge cases', () => {
    expect(formatCompactNumber(0)).toBe('0');
    expect(formatCompactNumber(999)).toBe('999');
  });
});
```

**Test a hook:**
```javascript
import { renderHook, act } from '@testing-library/react';
import { useChartData } from '@shared/hooks/useChartData';

describe('useChartData', () => {
  it('should load sample data', () => {
    const { result } = renderHook(() => useChartData('funnel'));

    act(() => {
      result.current.loadSampleData('generic');
    });

    expect(result.current.data).toBeTruthy();
    expect(result.current.data.length).toBeGreaterThan(0);
  });
});
```

**Test a component:**
```javascript
import { render } from '@testing-library/react';
import MyChart from './MyChart';

describe('MyChart', () => {
  it('should render without crashing', () => {
    const { container } = render(
      <MyChart data={mockData} settings={mockSettings} />
    );

    expect(container.querySelector('svg')).toBeTruthy();
  });
});
```

### Test Templates

Copy templates from `src/test/templates/`:
- `utility.test.template.js` - For pure functions
- `hook.test.template.jsx` - For React hooks
- `component.test.template.jsx` - For React components

See [TESTING.md](TESTING.md) for complete testing guide.

---

## Debugging

### Enable Console Logging

**Debug data flow:**
```javascript
const { data, loadSampleData } = useChartData();

useEffect(() => {
  console.log('Data updated:', data);
  console.log('Data length:', data?.length);
  console.log('First item:', data?.[0]);
}, [data]);
```

**Debug useEffect execution:**
```javascript
useEffect(() => {
  console.log('Effect running with:', { data, width, height });

  // Your logic

  return () => {
    console.log('Effect cleanup');
  };
}, [data, width, height]);
```

### Use React DevTools

1. Install React DevTools browser extension
2. Open DevTools → **Components** tab
3. Inspect props and state in real-time
4. Track re-renders with **Profiler** tab

### Debug D3 Rendering

**Check if elements are rendering:**
```javascript
useEffect(() => {
  if (!svgRef.current) {
    console.log('❌ SVG ref not available');
    return;
  }

  const svg = d3.select(svgRef.current);
  console.log('✅ SVG selected');

  const bars = svg.selectAll('.bar');
  console.log('Bars found:', bars.size());
  console.log('Bar data:', bars.data());
}, [data]);
```

**Debug coordinates:**
```javascript
useEffect(() => {
  // Wait for render
  const bars = d3.selectAll('.bar').nodes();

  if (bars.length === 0) {
    console.log('⚠️ No bars rendered yet');
    return;
  }

  bars.forEach((bar, i) => {
    const bbox = bar.getBBox();
    console.log(`Bar ${i}:`, { x: bbox.x, y: bbox.y, width: bbox.width });
  });
}, [data, styleSettings]);
```

### Common Debug Patterns

**Check data structure:**
```javascript
console.log('Data structure:', {
  hasData: !!data,
  length: data?.length,
  firstRow: data?.[0],
  keys: data?.[0] ? Object.keys(data[0]) : [],
});
```

**Verify settings applied:**
```javascript
console.log('Style settings:', {
  colorPalette,
  barColor,
  width,
  height,
  orientation,
});
```

**Track state changes:**
```javascript
const [count, setCount] = useState(0);

const setCountWithLog = (newValue) => {
  console.log('Count changing:', { from: count, to: newValue });
  setCount(newValue);
};
```

### Browser DevTools Tips

**Check network requests:**
- Open DevTools → **Network** tab
- Filter by XHR to see data requests
- Check if CSV uploads complete successfully

**Inspect DOM:**
- Right-click element → **Inspect**
- Check if SVG elements exist
- Verify element positions and dimensions

**Performance profiling:**
- DevTools → **Performance** tab
- Record interaction
- Find slow renders or heavy computations

### Debug Production Issues

**Test production build locally:**
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Test in browser at http://localhost:4173
```

**Check for tree-shaking issues:**
```javascript
// ❌ This gets tree-shaken in production
import * as d3 from 'd3';
const colors = d3.schemeTableau10; // undefined!

// ✅ Import directly
import { schemeTableau10 } from 'd3-scale-chromatic';
const colors = schemeTableau10; // works!
```

See [PATTERNS.md#gotcha-vite-tree-shaking-d3-schemes](PATTERNS.md#gotcha-vite-tree-shaking-d3-schemes).

---

## Troubleshooting

### Quick Fixes

**Data not loading?**
- Check CSV format matches requirements
- Verify numeric columns contain only numbers
- Ensure at least 2 stages present
- Check browser console for errors

**Colors not updating?**
- Verify color format is hex (#rrggbb)
- Check if comparison mode is enabled for multi-color
- Ensure colorTransition is between 0-100

**Chart not rendering?**
- Verify data is not null or empty
- Check SVG ref is connected
- Look for errors in console
- Add `console.log` statements to debug

**Export not working?**
- Check if SVG ref is properly connected
- Verify browser supports clipboard API
- Try PNG export instead of SVG

**Tests failing?**
- Run `npm run test -- --reporter=verbose` for details
- Check if dependencies are installed
- Verify test data matches expected structure

### Common Errors

**"Cannot read properties of undefined (reading 'colors')"**
→ D3 color scheme tree-shaking issue. Import directly from `d3-scale-chromatic`.

**"Maximum update depth exceeded"**
→ Infinite loop in useEffect. Check dependencies array.

**"Objects are not valid as a React child"**
→ Trying to render object directly. Render specific property instead.

For detailed troubleshooting, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

## Next Steps

**For New Users:**
1. ✅ Run the example app (`npm run dev`)
2. ✅ Load sample data
3. ✅ Customize styles
4. ✅ Upload your own CSV
5. ✅ Export your chart

**Learn the System:**
6. 📖 Read [ARCHITECTURE.md](ARCHITECTURE.md) - Understand the architecture
7. 📖 Read [PATTERNS.md](PATTERNS.md) - Learn production-proven patterns
8. 🧪 Review [TESTING.md](TESTING.md) - Write tests for your code

**Start Building:**
9. 🔧 Follow [ADDING-CHARTS.md](ADDING-CHARTS.md) - Add new chart types
10. 🤝 Read [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution workflow
11. 🐛 Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Debug issues

## Getting Help

### Before Asking

1. **Check documentation**
   - [QUICKSTART.md](QUICKSTART.md) (this file) - Quick examples
   - [ARCHITECTURE.md](ARCHITECTURE.md) - System design
   - [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues
   - [PATTERNS.md](PATTERNS.md) - Best practices

2. **Check examples**
   - Review example in `src/App.jsx`
   - Look at existing charts in `src/charts/`
   - Check test files for usage examples

3. **Debug yourself**
   - Check browser console for errors
   - Add `console.log` statements
   - Use React DevTools
   - Test with sample data first

### Where to Ask

- **GitHub Discussions** - General questions, ideas
- **GitHub Issues** - Bug reports, feature requests
- **Documentation** - Most questions already answered!

### Useful Resources

**Documentation:**
- [README.md](README.md) - Project overview
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [PATTERNS.md](PATTERNS.md) - Production patterns
- [ADDING-CHARTS.md](ADDING-CHARTS.md) - Add new charts
- [TESTING.md](TESTING.md) - Testing guide
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Debug guide
- [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute

**Code:**
- `src/charts/_ChartTemplate/` - Chart template to copy
- `src/test/templates/` - Test templates
- `src/shared/` - Shared utilities and hooks

---

**Ready to build amazing visualizations!** 🚀

**Questions?** Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) or ask in GitHub Discussions!
