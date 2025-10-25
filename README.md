# Funnel Visualization Platform - Refactored Architecture

A scalable, maintainable React-based data visualization platform for creating professional funnel charts and other visualizations.

## 🚀 Live Demo

**Production URL**: [https://datastorycharts.vercel.app](https://datastorycharts.vercel.app)

## ✨ Latest Features (v2.0)

### Recent Updates
- **Direct Labels (In-Stage)**: Period labels displayed directly inside bars as default
- **Traditional Legend**: Optional top legend for period identification
- **Enhanced Font Options**:
  - 5 Sans-Serif fonts: Inter, Montserrat, Roboto, Open Sans (default), Lato
  - 2 Condensed fonts: Roboto Condensed, Open Sans Condensed
  - 5 Serif fonts: Merriweather, Playfair Display, Lora, PT Serif, Georgia
- **Improved Layout**: Fixed scrolling behavior - chart stays centered, only control panel scrolls
- **Smart Label Positioning**: Dynamic label placement in horizontal mode to avoid conflicts with conversion brackets and legends
- **Responsive UI**: Sticky header and chart area with scrollable configuration panel

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

## 🎯 Key Features

### Chart Visualization
- **Multiple Orientations**: Vertical and horizontal funnel layouts
- **Dual Emphasis Modes**:
  - Throughput (conversion through funnel)
  - Fallout (drop-off visualization)
- **Flexible Aspect Ratios**: 1:1, 4:3, 16:9, 3:4, 9:16
- **Comparison Mode**: Track multiple time periods (up to 3) with color-coded bars
- **Conversion Brackets**: Click two stages to see conversion rate between them
- **Sparklines**: Trend visualization for each stage (volume or conversion-based)

### Data Management
- **Interactive Data Editing**: In-place editing with live preview
- **CSV Import/Export**: Load and save data as CSV files
- **Sample Datasets**: Pre-configured examples for quick testing
- **Normalize to 100%**: Option to normalize first stage to 100%
- **Compact Numbers**: Toggle between full numbers and abbreviated format (K, M, B)

### Styling & Customization
- **Typography Controls**:
  - 12 professional fonts (sans-serif, condensed, serif)
  - Independent font size controls for title, subtitle, labels, metrics, and legend
  - Direct Labels (in-stage) or Traditional Legend positioning
- **Color Customization**:
  - Single color with gradient transition
  - 5 preset comparison palettes (professional, vibrant, warm, cool, neutral)
  - Custom color palette with 8 user-defined colors
  - Intelligent text contrast (white/black based on background)
- **Layout Options**:
  - Adjustable chart padding and stage gaps
  - Stage label positioning (top/bottom for horizontal, left/right for vertical)
  - Dynamic label positioning to avoid UI conflicts

### Export & Sharing
- **PNG Export**: High-resolution image export (2x scaling)
- **SVG Export**: Vector graphics for scalable designs
- **Copy Settings**: JSON-based settings export/import
- **Deployed on Vercel**: Live production environment with automatic deployments

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

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/findandtell/datastorycharts.git
cd datastorycharts

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
# Create optimized build
npm run build

# Preview production build
npm run preview
```

### Deploy to Vercel

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Deploy to production
vercel --prod
```

## 📦 Tech Stack

### Core Dependencies
- **React 18.2.0** - UI framework
- **Vite 7.1.12** - Build tool and dev server
- **D3.js 7.9.0** - Data visualization library
- **Papa Parse 5.4.1** - CSV parsing and export

### UI & Styling
- **Tailwind CSS 3.4.0** - Utility-first CSS framework
- **PostCSS** - CSS processing
- **Lucide React** - Icon library

### Fonts (Google Fonts)
- Inter, Montserrat, Roboto, Open Sans, Lato
- Roboto Condensed, Open Sans Condensed
- Merriweather, Playfair Display, Lora, PT Serif

### Development Tools
- ESLint - Code linting
- Vite plugins for React
- Fast Refresh for instant HMR

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

## 📋 Changelog

### v2.0.0 (January 2025)
**New Features:**
- Direct Labels (in-stage) as default legend position
- Traditional legend option with smart positioning
- Added 2 condensed fonts (Roboto Condensed, Open Sans Condensed)
- Set Open Sans as default font family
- 12 total font options organized by category (sans-serif, condensed, serif)

**UI/UX Improvements:**
- Fixed scrolling behavior: chart stays centered, only control panel scrolls
- Sticky header and chart area for better navigation
- Dynamic label positioning in horizontal mode to prevent conflicts
- Labels automatically adjust when conversion bracket or legend is visible
- Renamed "In-Stage Labels" to "Direct Labels" for clarity

**Bug Fixes:**
- Fixed label overlap with conversion brackets in horizontal orientation
- Fixed label conflicts with traditional legend
- Improved responsive layout for different screen sizes

### v1.0.0 (Initial Release)
- Funnel chart visualization with vertical/horizontal orientations
- Throughput and fallout emphasis modes
- CSV import/export functionality
- Multiple comparison periods
- Conversion rate brackets
- Color customization and palettes
- Export to PNG/SVG
- Sample datasets

## 🔮 Future Enhancements

### Planned Features
- Additional chart types (bar, line, sankey, pie)
- Real-time data connections
- Advanced filtering and drill-down
- Collaboration features
- Template library
- Animation controls
- Accessibility improvements (WCAG 2.1 AA compliance)
- Dark mode support
- Mobile-responsive touch controls
- Data annotations and callouts

### Extension Points
- Custom renderers
- Plugin system
- Theme marketplace
- Data source adapters
- API integrations
- Embedded widget mode

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
