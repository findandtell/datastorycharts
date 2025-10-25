# Migration Guide: Monolithic to Refactored Architecture

This guide helps you transition from the original 3,488-line `FunnelVizRefined` component to the new modular architecture.

## Overview of Changes

### Before (Monolithic)
- **1 file**: 3,488 lines
- **40+ state variables**: All in one component
- **Embedded data**: Sample datasets hardcoded
- **Inline utilities**: Functions mixed with component logic
- **Difficult to extend**: Adding features requires modifying large file

### After (Modular)
- **Multiple focused files**: Each <200 lines
- **Custom hooks**: Organized state management
- **Separated concerns**: Data, styles, utilities independent
- **Easy to extend**: Add new charts without touching existing code
- **Reusable**: Share code across chart types

## Step-by-Step Migration

### Step 1: Replace State Variables with Hooks

#### Old Approach
```javascript
const [title, setTitle] = useState("...");
const [subtitle, setSubtitle] = useState("...");
const [fontFamily, setFontFamily] = useState("...");
const [barColor, setBarColor] = useState("...");
// ... 36 more state variables
```

#### New Approach
```javascript
import { useStyleSettings } from './shared/hooks/useStyleSettings';

const {
  title, setTitle,
  subtitle, setSubtitle,
  fontFamily, setFontFamily,
  barColor, setBarColor,
  // ... all style settings
} = useStyleSettings();
```

**Benefits:**
- Reduced boilerplate
- Related state grouped together
- Easy to reset to defaults
- Export/import settings as JSON

### Step 2: Replace Data Management with Hook

#### Old Approach
```javascript
const [csvData, setCsvData] = useState(null);
const [periodNames, setPeriodNames] = useState([]);
const [editableData, setEditableData] = useState([]);

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  Papa.parse(file, {
    // ... lots of parsing logic
  });
};
```

#### New Approach
```javascript
import { useChartData } from './shared/hooks/useChartData';

const {
  data,
  periodNames,
  loadCSVFile,
  loadSampleData,
  hasData,
} = useChartData();

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  await loadCSVFile(file);
};
```

**Benefits:**
- Automatic validation
- Error handling built-in
- Data editing capabilities
- Sample data loading

### Step 3: Extract Sample Data

#### Old Approach
```javascript
const sampleData = {
  generic: [
    { Stage: "Stage 1", "Period 3": 10000, ... },
    // ... embedded in component
  ],
  ecommerce: [...],
  // ... more datasets
};
```

#### New Approach
```javascript
import { getSampleDataset, getSampleDatasetKeys } from './shared/data/sampleDatasets';

// Load a dataset
const ecommerceData = getSampleDataset('ecommerce');

// Get all available datasets
const availableDatasets = getSampleDatasetKeys();
```

**Benefits:**
- Centralized data management
- Easy to add new datasets
- No component bloat
- Shareable across charts

### Step 4: Replace Inline Utilities

#### Old Approach
```javascript
const formatCompactNumber = (num) => {
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + "B";
  // ... embedded in component
};

const calculateConversionRate = (current, previous) => {
  return (current / previous) * 100;
};

// ... many more utility functions
```

#### New Approach
```javascript
import { formatCompactNumber, formatPercentage } from './shared/utils/dataFormatters';
import { calculateConversionRate, calculateOverallConversion } from './shared/utils/calculations';

// Use directly
const formatted = formatCompactNumber(1500000); // "1.5M"
const conversion = calculateConversionRate(500, 1000); // 50
```

**Benefits:**
- Tested independently
- Reusable across components
- Easy to maintain
- Clear separation of concerns

### Step 5: Extract Color Logic

#### Old Approach
```javascript
const calculateSegmentColor = (index) => {
  const baseRGB = hexToRgb(barColor);
  const darkenAmount = (index / totalSegments) * 40;
  // ... color calculation logic
};

const hexToRgb = (hex) => {
  // ... conversion logic
};

// ... more color functions
```

#### New Approach
```javascript
import { 
  calculateSegmentColor, 
  interpolateColor,
  lightenColor 
} from './shared/utils/colorUtils';

const color = calculateSegmentColor(barColor, index, totalSegments, colorTransition);
```

**Benefits:**
- Tested color utilities
- Consistent color handling
- Advanced features available
- Type-safe operations

### Step 6: Break Down Control Panel

#### Old Approach
```javascript
// 500+ lines of JSX for control panel in main component
<div className="control-panel">
  {activeTab === "style" && (
    <div>
      {/* Typography controls */}
      {/* Color controls */}
      {/* Layout controls */}
      {/* ... hundreds of lines */}
    </div>
  )}
  {activeTab === "data" && (
    <div>
      {/* Data controls */}
      {/* ... more lines */}
    </div>
  )}
</div>
```

#### New Approach
```javascript
import ControlPanel from './shared/components/ControlPanel/ControlPanel';
import StyleTab from './shared/components/ControlPanel/StyleTab';
import DataTab from './shared/components/ControlPanel/DataTab';

<ControlPanel activeTab={activeTab} setActiveTab={setActiveTab}>
  <StyleTab {...styleSettings} />
  <DataTab {...dataSettings} />
</ControlPanel>
```

**Benefits:**
- Focused components
- Easy to modify individual sections
- Testable in isolation
- Reusable across charts

### Step 7: Modularize Chart Rendering

#### Old Approach
```javascript
// D3 rendering logic mixed with component
useEffect(() => {
  if (!chartConfig) return;
  
  const svg = d3.select(svgRef.current);
  // ... 300+ lines of D3 code
  
}, [chartConfig, /* many dependencies */]);
```

#### New Approach
```javascript
// charts/FunnelChart/FunnelRenderer.jsx
export function renderFunnel(svg, data, config) {
  // Pure D3 rendering logic
  // No React dependencies
  // Testable
}

// FunnelChart.jsx
useEffect(() => {
  if (!data) return;
  renderFunnel(svgRef.current, data, config);
}, [data, config]);
```

**Benefits:**
- Pure rendering logic
- Easy to test
- No accidental re-renders
- Clearer dependencies

## Component Comparison

### Old Structure (3,488 lines)
```
FunnelVizRefined.jsx
├── 40+ useState declarations (lines 1-100)
├── Sample data objects (lines 119-283)
├── Color presets (lines 104-117)
├── Comparison palettes (lines 49-74)
├── Utility functions (scattered throughout)
├── D3 rendering logic (lines 400-800)
├── Control panel JSX (lines 2500-3400)
└── Export menu JSX (lines 3400-3488)
```

### New Structure (Distributed)
```
src/
├── shared/
│   ├── hooks/
│   │   ├── useChartData.js (150 lines)
│   │   └── useStyleSettings.js (200 lines)
│   ├── utils/
│   │   ├── dataFormatters.js (100 lines)
│   │   ├── calculations.js (150 lines)
│   │   ├── colorUtils.js (180 lines)
│   │   ├── csvUtils.js (120 lines)
│   │   └── exportHelpers.js (120 lines)
│   ├── data/
│   │   └── sampleDatasets.js (400 lines)
│   ├── design-system/
│   │   ├── theme.js (80 lines)
│   │   └── colorPalettes.js (100 lines)
│   └── components/
│       └── ControlPanel/ (to be created)
└── charts/
    └── FunnelChart/
        ├── FunnelChart.jsx (150 lines)
        └── FunnelRenderer.jsx (200 lines)
```

## Common Migration Patterns

### Pattern 1: State → Hook
```javascript
// Before
const [value, setValue] = useState(defaultValue);

// After
const { value, setValue } = useHookName();
```

### Pattern 2: Inline Function → Utility
```javascript
// Before
const formatValue = (v) => { /* logic */ };

// After
import { formatValue } from './shared/utils/formatters';
```

### Pattern 3: Embedded Data → Import
```javascript
// Before
const data = { /* inline data */ };

// After
import { data } from './shared/data/datasets';
```

### Pattern 4: Monolithic JSX → Component
```javascript
// Before
<div>
  {/* 100 lines of JSX */}
</div>

// After
<MyComponent prop={value} />
```

## Testing Strategy

### Before
- Hard to test: everything coupled
- Mock entire component
- Tests depend on implementation

### After
- Test utilities independently
- Test hooks with React Testing Library
- Test components in isolation
- Mock only what you need

## Performance Improvements

### Before Issues
- Large component re-renders
- All state in one place
- Difficult to optimize

### After Benefits
- Only affected components re-render
- Hooks can be memoized
- Easy to use React.memo
- Clear optimization targets

## Checklist for Migration

- [ ] Replace all state with appropriate hooks
- [ ] Move utility functions to shared/utils
- [ ] Extract sample data to shared/data
- [ ] Break control panel into components
- [ ] Separate D3 rendering logic
- [ ] Update imports throughout
- [ ] Test each module independently
- [ ] Verify functionality matches original
- [ ] Remove old monolithic file
- [ ] Update documentation

## Next Steps

1. **Start with utilities**: Easiest to extract, no dependencies
2. **Create hooks**: Build on utilities
3. **Break down UI**: Create components
4. **Migrate rendering**: Separate D3 logic
5. **Test thoroughly**: Ensure feature parity
6. **Optimize**: Add memoization where needed

## Need Help?

Refer to:
- `README.md` for architecture overview
- `src/App.jsx` for usage examples
- Individual file comments for specific APIs

## Benefits Summary

| Aspect | Before | After |
|--------|--------|-------|
| Lines per file | 3,488 | <200 |
| Testability | Hard | Easy |
| Reusability | None | High |
| Maintainability | Low | High |
| Scalability | Limited | Excellent |
| Performance | Potential issues | Optimized |
| Learning curve | Steep | Gradual |

The refactored architecture provides a solid foundation for building multiple chart types while maintaining code quality and developer experience.
