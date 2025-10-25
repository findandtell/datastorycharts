/**
 * Theme configuration
 * Centralized design tokens for consistent styling across charts
 */

export const theme = {
  // Typography
  typography: {
    families: [
      "Montserrat",
      "Inter",
      "Roboto",
      "Open Sans",
      "Lato",
      "Poppins",
      "Source Sans Pro",
      "Raleway",
    ],
    sizes: {
      title: 28,
      subtitle: 20,
      segmentLabel: 15,
      metricLabel: 13,
      legend: 13,
      conversionLabel: 19,
      axisLabel: 12,
      tooltipLabel: 11,
    },
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  // Spacing
  spacing: {
    chartPadding: 25,
    stageGap: 18,
    legendSpacing: 20,
    labelPadding: 8,
    tooltipPadding: 10,
  },

  // Layout
  layout: {
    aspectRatios: {
      "1:1": { width: 900, height: 900 },
      "4:3": { width: 1200, height: 900 },
      "16:9": { width: 1600, height: 900 },
      "3:4": { width: 900, height: 1200 },
      "9:16": { width: 900, height: 1600 },
    },
    orientations: ["vertical", "horizontal"],
    stageLabelPositions: ["top", "bottom", "left", "right"],
  },

  // Visual styles
  visual: {
    axisLineWidth: 3,
    colorTransition: 60, // Percentage for color gradient
    backgroundOpacity: 100,
    borderRadius: 4,
    shadowOpacity: 0.1,
  },

  // Animation
  animation: {
    duration: 300,
    easing: "ease-in-out",
  },

  // Default colors (fallbacks)
  colors: {
    primary: "#1e40af",
    text: "#1f2937",
    textLight: "#6b7280",
    background: "#ffffff",
    border: "#e5e7eb",
    gridLine: "#f3f4f6",
  },
};

/**
 * Get aspect ratio dimensions
 */
export const getAspectRatioDimensions = (ratio) => {
  return theme.layout.aspectRatios[ratio] || theme.layout.aspectRatios["1:1"];
};

/**
 * Get font family options
 */
export const getFontFamilies = () => {
  return theme.typography.families;
};

/**
 * Get available aspect ratios
 */
export const getAspectRatios = () => {
  return Object.keys(theme.layout.aspectRatios);
};

/**
 * Create a custom theme by merging with defaults
 */
export const createCustomTheme = (overrides = {}) => {
  return {
    typography: { ...theme.typography, ...overrides.typography },
    spacing: { ...theme.spacing, ...overrides.spacing },
    layout: { ...theme.layout, ...overrides.layout },
    visual: { ...theme.visual, ...overrides.visual },
    animation: { ...theme.animation, ...overrides.animation },
    colors: { ...theme.colors, ...overrides.colors },
  };
};

export default theme;
