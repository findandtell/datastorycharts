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

## Troubleshooting

### Data not loading?
- Check CSV format matches requirements
- Verify numeric columns contain only numbers
- Ensure at least 2 stages present

### Colors not updating?
- Verify color format is hex (#rrggbb)
- Check if comparison mode is enabled for multi-color
- Ensure colorTransition is between 0-100

### Export not working?
- Check if SVG ref is properly connected
- Verify browser supports clipboard API
- Try PNG export instead of SVG

## Next Steps

1. ✅ Run the example app (`npm run dev`)
2. ✅ Load sample data
3. ✅ Customize styles
4. ✅ Upload your own CSV
5. ✅ Export your chart
6. 📖 Read the full [README.md](./README.md)
7. 🔧 Check [MIGRATION.md](./MIGRATION.md) for advanced patterns

## Getting Help

- Check console for errors
- Review example in `src/App.jsx`
- Read inline code comments
- Review utility function documentation

---

**Ready to build amazing visualizations!** 🚀
