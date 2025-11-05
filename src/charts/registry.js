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
import GroupedBarChart from './GroupedBarChart/GroupedBarChart';
import LineChart from './LineChart/LineChart';
// import SankeyChart from './SankeyChart/SankeyChart';

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
  funnel: {
    name: 'Funnel Chart',
    component: FunnelChart,
    icon: '📊',
    description: 'Visualize conversion funnels and drop-offs',
    supportsComparison: true,
    category: 'flow',
    defaultSettings: {
      orientation: 'vertical',
      emphasis: 'throughput',
    },
  },

  slope: {
    name: 'Slope Chart',
    component: SlopeChart,
    icon: '📈',
    description: 'Show change between two time periods',
    supportsComparison: false,
    category: 'comparison',
    defaultSettings: {
      colorMode: 'category',
      labelPosition: 'left',
      lineThickness: 3,
    },
  },

  bar: {
    name: 'Bar Chart',
    component: BarChart,
    icon: '📊',
    description: 'Compare values across categories',
    supportsComparison: true,
    category: 'comparison',
    defaultSettings: {
      orientation: 'vertical',
      barMode: 'grouped',
      showGrid: true,
    },
  },

  'grouped-bar': {
    name: 'Bar Chart (Grouped)',
    component: GroupedBarChart,
    icon: '📊',
    description: 'Show grouped categories across periods (Datawrapper style)',
    supportsComparison: false,
    category: 'comparison',
    defaultSettings: {
      barMode: 'grouped',
      showGrid: true,
      legendPosition: 'above',
    },
  },

  line: {
    name: 'Line Chart',
    component: LineChart,
    icon: '📈',
    description: 'Visualize time-series data and trends',
    supportsComparison: true,
    category: 'trend',
    defaultSettings: {
      showPoints: true,
      smoothLines: false,
      showGridLines: true,
      timeScale: 'month',
    },
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
