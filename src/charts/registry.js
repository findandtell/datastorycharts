/**
 * Chart Registry
 * Central registry for all available chart types
 *
 * To add a new chart:
 * 1. Create chart component in charts/YourChart/
 * 2. Import it here
 * 3. Add entry to chartRegistry
 * 4. Chart will be available throughout the app
 */

// Import chart components
import FunnelChart from './FunnelChart/FunnelChart';
import SlopeChart from './SlopeChart/SlopeChart';
import BarChart from './BarChart/BarChart';
import LineChart from './LineChart/LineChart';
// import SankeyChart from './SankeyChart/SankeyChart';

// Import Heroicons
import {
  ChartBarIcon,
  ChartBarSquareIcon,
  ArrowTrendingUpIcon,
  PresentationChartLineIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

/**
 * Chart registry object
 * Each chart type should have:
 * - name: Display name
 * - component: React component
 * - icon: Emoji or icon identifier
 * - description: Brief description
 * - supportsComparison: Boolean indicating if chart supports comparison mode
 * - category: Chart category (flow, comparison, distribution, etc.)
 */
export const chartRegistry = {
  'bar-horizontal': {
    name: 'Bar Chart Horizontal',
    component: BarChart,
    icon: ChartBarIcon,
    description: 'Horizontal bar chart for comparing categories',
    supportsComparison: true,
    category: 'comparison',
    defaultSettings: {
      orientation: 'horizontal',
      barMode: 'grouped',
      showGrid: true,
    },
    defaultDataset: 'barHorizontalStyled',
  },

  'bar-vertical': {
    name: 'Bar Chart Vertical',
    component: BarChart,
    icon: ChartBarIcon,
    description: 'Vertical bar chart for comparing categories',
    supportsComparison: true,
    category: 'comparison',
    defaultSettings: {
      orientation: 'vertical',
      barMode: 'grouped',
      showGrid: true,
    },
    defaultDataset: 'barVerticalSingle',
  },

  'bar-grouped-horizontal': {
    name: 'Grouped Bar Horizontal',
    component: BarChart,
    icon: ChartBarSquareIcon,
    description: 'Compare multiple series across categories horizontally',
    supportsComparison: true,
    category: 'comparison',
    defaultSettings: {
      orientation: 'horizontal',
      barMode: 'grouped',
      showGrid: true,
    },
    defaultDataset: 'barGroupedHorizontal',
  },

  'bar-grouped-vertical': {
    name: 'Grouped Bar Vertical',
    component: BarChart,
    icon: ChartBarSquareIcon,
    description: 'Compare multiple series across categories vertically',
    supportsComparison: true,
    category: 'comparison',
    defaultSettings: {
      orientation: 'vertical',
      barMode: 'grouped',
      showGrid: true,
    },
    defaultDataset: 'barGroupedVertical',
  },

  line: {
    name: 'Line Chart',
    component: LineChart,
    icon: PresentationChartLineIcon,
    description: 'Visualize time-series data and trends',
    supportsComparison: true,
    category: 'trend',
    defaultSettings: {
      showPoints: true,
      smoothLines: false,
      showGridLines: true,
      timeScale: 'month',
      chartMode: 'line',
      showAreaFill: false,
      stackAreas: false,
      xAxisTimeGrouping: 'single',
      xAxisPrimaryLabel: 'date',
      xAxisSecondaryLabel: 'none',
      dateFormatPreset: 'M/d/yy',
    },
    defaultDataset: 'marketingChannelRevenue',
  },

  area: {
    name: 'Area Chart',
    component: LineChart,
    icon: PresentationChartLineIcon,
    description: 'Show trends with filled areas under lines',
    supportsComparison: true,
    category: 'trend',
    defaultSettings: {
      showPoints: false,
      smoothLines: false,
      showGridLines: true,
      timeScale: 'month',
      chartMode: 'area',
      areaOpacity: 0.4,
      lineOpacity: 0.10,
      showAreaFill: true,
      stackAreas: false,
      xAxisTimeGrouping: 'single',
      xAxisPrimaryLabel: 'date',
      xAxisSecondaryLabel: 'none',
      dateFormatPreset: 'M/d/yy',
    },
    defaultDataset: 'marketingChannelRevenue',
  },

  'area-stacked': {
    name: 'Stacked Area',
    component: LineChart,
    icon: PresentationChartLineIcon,
    description: 'Show cumulative trends with stacked areas',
    supportsComparison: true,
    category: 'trend',
    defaultSettings: {
      showPoints: false,
      smoothLines: false,
      showGridLines: true,
      timeScale: 'month',
      chartMode: 'area-stacked',
      areaOpacity: 0.8,
      lineOpacity: 0.10,
      showAreaFill: true,
      stackAreas: true,
      xAxisTimeGrouping: 'single',
      xAxisPrimaryLabel: 'date',
      xAxisSecondaryLabel: 'none',
      dateFormatPreset: 'M/d/yy',
    },
    defaultDataset: 'areaStackedDefault',
  },

  slope: {
    name: 'Slope Chart',
    component: SlopeChart,
    icon: ArrowTrendingUpIcon,
    description: 'Show change between two time periods',
    supportsComparison: false,
    category: 'comparison',
    defaultSettings: {
      colorMode: 'category',
      labelPosition: 'left',
      lineThickness: 3,
    },
    defaultDataset: 'tufteSlope',
  },

  funnel: {
    name: 'Funnel Chart',
    component: FunnelChart,
    icon: FunnelIcon,
    description: 'Visualize conversion funnels and drop-offs',
    supportsComparison: true,
    category: 'flow',
    defaultSettings: {
      orientation: 'vertical',
      emphasis: 'throughput',
    },
    defaultDataset: 'abTest',
  },

  // Future chart types:
  /*
  
  sankey: {
    name: 'Sankey Diagram',
    component: SankeyChart,
    icon: '🌊',
    description: 'Visualize flow between stages',
    supportsComparison: false,
    category: 'flow',
    defaultSettings: {
      nodeWidth: 20,
      nodePadding: 10,
    },
  },
  
  pie: {
    name: 'Pie Chart',
    component: PieChart,
    icon: '🥧',
    description: 'Show proportional relationships',
    supportsComparison: false,
    category: 'distribution',
    defaultSettings: {
      donutMode: false,
      showLabels: true,
    },
  },
  */
};

/**
 * Get chart by key
 */
export const getChart = (chartKey) => {
  return chartRegistry[chartKey] || null;
};

/**
 * Get all available chart keys
 */
export const getChartKeys = () => {
  return Object.keys(chartRegistry);
};

/**
 * Get charts by category
 */
export const getChartsByCategory = (category) => {
  return Object.entries(chartRegistry)
    .filter(([_, chart]) => chart.category === category)
    .reduce((acc, [key, chart]) => ({ ...acc, [key]: chart }), {});
};

/**
 * Get available categories
 */
export const getCategories = () => {
  const categories = new Set(
    Object.values(chartRegistry).map(chart => chart.category)
  );
  return Array.from(categories);
};

/**
 * Check if chart supports comparison mode
 */
export const supportsComparison = (chartKey) => {
  const chart = chartRegistry[chartKey];
  return chart?.supportsComparison || false;
};

/**
 * Get default settings for a chart type
 */
export const getDefaultSettings = (chartKey) => {
  const chart = chartRegistry[chartKey];
  return chart?.defaultSettings || {};
};

/**
 * Validate chart key
 */
export const isValidChartKey = (chartKey) => {
  return chartKey in chartRegistry;
};

export default chartRegistry;
