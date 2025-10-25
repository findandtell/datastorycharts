# Funnel Visualization Platform - Refactored Architecture

A scalable, maintainable React-based data visualization platform for creating professional funnel charts and other visualizations.

## 🏗️ Architecture Overview

This refactored codebase separates concerns into modular, reusable components following best practices for scalability and maintainability.

```
src/
├── charts/                      # Chart type implementations
│   ├── FunnelChart/            # Funnel chart component
│   └── registry.js             # Chart type registry
├── shared/                      # Shared resources across charts
│   ├── components/             # Reusable UI components
│   ├── hooks/                  # Custom React hooks
│   ├── design-system/          # Theme and design tokens
│   ├── utils/                  # Utility functions
│   └── data/                   # Sample datasets
└── contexts/                    # React context providers
```

## 📚 Key Design Principles

### 1. **Separation of Concerns**
- **Charts**: Individual chart implementations
- **Shared**: Reusable logic and components
- **Design System**: Centralized styling tokens
- **Utilities**: Pure functions for data manipulation

### 2. **Composability**
- Build complex UIs from small, focused components
- Mix and match hooks for custom behavior
- Share functionality across different chart types

### 3. **Scalability**
- Easy to add new chart types
- Shared infrastructure reduces code duplication
- Consistent patterns across codebase

### 4. **Maintainability**
- Single responsibility principle
- Clear file organization
- Comprehensive utility libraries

## 🧩 Core Modules

### Design System (`shared/design-system/`)

Centralized design tokens ensuring consistency:

- **`theme.js`**: Typography, spacing, layout, colors
- **`colorPalettes.js`**: Color presets and comparison palettes

```javascript
import theme from './shared/design-system/theme';
import { colorPresets, comparisonPalettes } from './shared/design-system/colorPalettes';
```

### Utilities (`shared/utils/`)

Pure functions for common operations:

- **`dataFormatters.js`**: Number formatting (compact/full, percentages)
- **`calculations.js`**: Conversion rates, metrics, statistics
- **`colorUtils.js`**: Color manipulation and interpolation
- **`csvUtils.js`**: CSV parsing, validation, export
- **`exportHelpers.js`**: PNG/SVG export functionality

```javascript
import { formatCompactNumber, formatPercentage } from './shared/utils/dataFormatters';
import { calculateConversionRate } from './shared/utils/calculations';
import { interpolateColor } from './shared/utils/colorUtils';
```

### Custom Hooks (`shared/hooks/`)

Encapsulated state management and side effects:

- **`useChartData.js`**: Data loading, editing, CSV handling
- **`useStyleSettings.js`**: Typography, colors, layout configuration

```javascript
import { useChartData } from './shared/hooks/useChartData';
import { useStyleSettings } from './shared/hooks/useStyleSettings';

function MyChart() {
  const { data, loadSampleData, periodNames } = useChartData();
  const { title, setTitle, barColor, setBarColor } = useStyleSettings();
  
  // Use the hooks...
}
```

### Sample Data (`shared/data/`)

Pre-built datasets for testing and demos:

- **`sampleDatasets.js`**: Multiple funnel scenarios (e-commerce, SaaS, marketing, etc.)

```javascript
import { getSampleDataset, isComparisonDataset } from './shared/data/sampleDatasets';

const ecommerceData = getSampleDataset('ecommerce');
```

## 🎨 Adding a New Chart Type

### Step 1: Create Chart Directory

```bash
mkdir -p src/charts/BarChart
```

### Step 2: Implement Chart Component

```javascript
// src/charts/BarChart/BarChart.jsx
import React from 'react';
import { useChartData } from '../../shared/hooks/useChartData';
import { useStyleSettings } from '../../shared/hooks/useStyleSettings';

export default function BarChart() {
  const { data, periodNames } = useChartData();
  const { title, barColor } = useStyleSettings();
  
  // Implement bar chart rendering...
  
  return (
    <div>
      <h1>{title}</h1>
      {/* Chart rendering */}
    </div>
  );
}
```

### Step 3: Register Chart Type

```javascript
// src/charts/registry.js
import FunnelChart from './FunnelChart/FunnelChart';
import BarChart from './BarChart/BarChart';

export const chartRegistry = {
  funnel: {
    name: 'Funnel Chart',
    component: FunnelChart,
    icon: '📊',
  },
  bar: {
    name: 'Bar Chart',
    component: BarChart,
    icon: '📈',
  },
};
```

### Step 4: Use in App

```javascript
// src/App.jsx
import { chartRegistry } from './charts/registry';

function App() {
  const [selectedChart, setSelectedChart] = useState('funnel');
  const ChartComponent = chartRegistry[selectedChart].component;
  
  return (
    <div>
      <ChartSelector onChange={setSelectedChart} />
      <ChartComponent />
    </div>
  );
}
```

## 🔧 Shared Components

Create reusable UI components in `shared/components/`:

### Control Panel Structure

```
shared/components/ControlPanel/
├── ControlPanel.jsx          # Main container
├── StyleTab.jsx              # Style controls
├── DataTab.jsx               # Data controls
└── ExportTab.jsx             # Export controls
```

### Data Table

```
shared/components/DataTable/
├── DataTable.jsx             # Table container
└── DataTableCell.jsx         # Editable cell
```

## 📊 Working with Data

### Loading Sample Data

```javascript
const { loadSampleData } = useChartData();

// Load e-commerce funnel
loadSampleData('ecommerce');
```

### Loading CSV

```javascript
const { loadCSVFile } = useChartData();

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  await loadCSVFile(file);
};
```

### Editing Data

```javascript
const { editableData, updateDataValue, applyEdits } = useChartData();

// Update a value
updateDataValue(stageIndex, periodName, newValue);

// Apply changes
applyEdits();
```

## 🎨 Styling Charts

### Using Theme

```javascript
import theme from './shared/design-system/theme';

const {
  titleFontSize,
  setTitleFontSize,
  barColor,
  setBarColor
} = useStyleSettings(theme);
```

### Color Palettes

```javascript
import { getPaletteColors } from './shared/design-system/colorPalettes';

const colors = getPaletteColors('professional');
// ['#1e40af', '#0d9488', '#991b1b', ...]
```

## 📤 Exporting Charts

```javascript
import { exportAsPNG, exportAsSVG } from './shared/utils/exportHelpers';

const handleExport = async () => {
  const svgElement = svgRef.current;
  
  // Export as PNG
  await exportAsPNG(svgElement, 'my-chart.png', 2);
  
  // Export as SVG
  exportAsSVG(svgElement, 'my-chart.svg');
};
```

## 🧪 Testing Strategy

### Unit Tests
- Test utilities in isolation
- Test hooks with React Testing Library
- Test calculations and formatters

### Integration Tests
- Test component interactions
- Test data flow through hooks
- Test CSV upload and validation

### E2E Tests
- Test complete user workflows
- Test chart rendering
- Test export functionality

## 🚀 Performance Considerations

### Optimization Techniques
- Memoize expensive calculations
- Use `React.memo` for pure components
- Lazy load chart types
- Debounce user inputs
- Virtualize large datasets

### Code Splitting

```javascript
import { lazy, Suspense } from 'react';

const FunnelChart = lazy(() => import('./charts/FunnelChart/FunnelChart'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <FunnelChart />
    </Suspense>
  );
}
```

## 📦 Dependencies

### Core
- React 18+
- D3.js (data visualization)
- Papa Parse (CSV handling)

### UI (Suggested)
- Tailwind CSS (styling)
- Lucide React (icons)

## 🛠️ Development Workflow

### 1. Start with Shared Utilities
Build and test utilities first - they have no dependencies

### 2. Build Custom Hooks
Compose utilities into reusable hooks

### 3. Create Shared Components
Build UI components using hooks

### 4. Implement Chart Types
Combine hooks and components for chart-specific logic

### 5. Wire Up in App
Connect everything in the main app component

## 📝 Best Practices

### File Naming
- Components: `PascalCase.jsx`
- Hooks: `useCamelCase.js`
- Utilities: `camelCase.js`
- Constants: `UPPER_SNAKE_CASE.js`

### Import Organization
```javascript
// 1. External dependencies
import React, { useState } from 'react';
import * as d3 from 'd3';

// 2. Shared utilities
import { formatNumber } from '../../shared/utils/dataFormatters';

// 3. Shared hooks
import { useChartData } from '../../shared/hooks/useChartData';

// 4. Local components
import ChartRenderer from './ChartRenderer';
```

### State Management
- Use hooks for component-level state
- Use Context for app-level state
- Keep state close to where it's used
- Lift state up only when necessary

## 🔮 Future Enhancements

### Planned Features
- Additional chart types (bar, line, sankey, pie)
- Real-time data connections
- Advanced filtering and drill-down
- Collaboration features
- Template library
- Animation controls
- Accessibility improvements

### Extension Points
- Custom renderers
- Plugin system
- Theme marketplace
- Data source adapters

## 📚 Additional Resources

- [D3.js Documentation](https://d3js.org/)
- [React Hooks Guide](https://react.dev/reference/react)
- [Tailwind CSS](https://tailwindcss.com/)
- [Data Visualization Best Practices](https://www.tableau.com/learn/articles/data-visualization)

## 🤝 Contributing

When adding new features:
1. Follow the existing architecture patterns
2. Add utilities to shared folder
3. Create focused, single-purpose functions
4. Document complex logic
5. Add examples to README
6. Write tests for new functionality

---

**Built with ❤️ for scalable data visualization**
