/**
 * Color palettes and presets for charts
 * Using D3.js categorical color schemes from d3-scale-chromatic
 */

import * as d3 from 'd3';
// Import color schemes directly to ensure they're included in production bundle
import {
  schemeObservable10,
  schemeCategory10,
  schemeAccent,
  schemeDark2,
  schemePaired,
  schemePastel1,
  schemePastel2,
  schemeSet1,
  schemeSet2,
  schemeSet3,
  schemeTableau10,
} from 'd3-scale-chromatic';

/**
 * Single color presets for monochrome charts
 */
export const colorPresets = [
  { name: "Navy", color: "#1e40af" },
  { name: "Sky Blue", color: "#0284c7" },
  { name: "Teal", color: "#0d9488" },
  { name: "Emerald", color: "#059669" },
  { name: "Amber", color: "#d97706" },
  { name: "Orange", color: "#ea580c" },
  { name: "Red", color: "#dc2626" },
  { name: "Rose", color: "#e11d48" },
  { name: "Purple", color: "#7c3aed" },
  { name: "Fuchsia", color: "#c026d3" },
  { name: "Slate", color: "#475569" },
  { name: "Indigo", color: "#4f46e5" },
];

/**
 * Multi-color palettes for comparison charts
 * Using D3.js categorical color schemes
 */
export const comparisonPalettes = {
  observable10: {
    name: "Observable10",
    description: "Observable's 10-color palette",
    colors: schemeObservable10,
  },
  category10: {
    name: "Category10",
    description: "D3's classic 10-color palette",
    colors: schemeCategory10,
  },
  accent: {
    name: "Accent",
    description: "ColorBrewer Accent palette (max 8 colors)",
    colors: schemeAccent,
  },
  dark2: {
    name: "Dark2",
    description: "ColorBrewer Dark2 palette (max 8 colors)",
    colors: schemeDark2,
  },
  paired: {
    name: "Paired",
    description: "ColorBrewer Paired palette (12 colors)",
    colors: schemePaired,
  },
  pastel1: {
    name: "Pastel1",
    description: "ColorBrewer Pastel1 palette (max 9 colors)",
    colors: schemePastel1,
  },
  pastel2: {
    name: "Pastel2",
    description: "ColorBrewer Pastel2 palette (max 8 colors)",
    colors: schemePastel2,
  },
  set1: {
    name: "Set1",
    description: "ColorBrewer Set1 palette (max 9 colors)",
    colors: schemeSet1,
  },
  set2: {
    name: "Set2",
    description: "ColorBrewer Set2 palette (max 8 colors)",
    colors: schemeSet2,
  },
  set3: {
    name: "Set3",
    description: "ColorBrewer Set3 palette (12 colors)",
    colors: schemeSet3,
  },
  monochrome: {
    name: "Monochrome Grey",
    description: "Warm grey shades from medium to light",
    colors: [
      "#78716c", // Medium gray (warm)
      "#8b8680", // Medium-light gray (warm)
      "#9c9691", // Medium-light gray (warmer)
      "#a8a29e", // Light-medium gray (warm)
      "#b8b2ad", // Light-medium gray (warmer)
      "#c4bfba", // Light gray (warm)
      "#ccc7c2", // Light gray (warmer)
      "#d6d1cc", // Very light gray (warm)
      "#ddd9d4", // Very light gray (warmer)
      "#e4e0db", // Almost white (warm)
      "#ebe7e2", // Almost white (warmer)
      "#f0ece7", // Nearly white (warm)
    ],
  },
  user: {
    name: "Custom",
    description: "User-defined colors",
    colors: [], // Will be populated by user
  },
};

/**
 * Get a color from a palette by index
 */
export const getColorFromPalette = (paletteKey, index, userColors = []) => {
  if (paletteKey === "user" && userColors.length > 0) {
    return userColors[index % userColors.length];
  }

  const palette = comparisonPalettes[paletteKey];
  if (!palette || !palette.colors.length) {
    return comparisonPalettes.observable10.colors[index % comparisonPalettes.observable10.colors.length];
  }

  return palette.colors[index % palette.colors.length];
};

/**
 * Get all colors from a palette
 */
export const getPaletteColors = (paletteKey, userColors = []) => {
  if (paletteKey === "user") {
    return userColors.length > 0
      ? userColors
      : comparisonPalettes.observable10.colors;
  }

  return comparisonPalettes[paletteKey]?.colors || comparisonPalettes.observable10.colors;
};

/**
 * Get available palette keys
 */
export const getPaletteKeys = () => {
  return Object.keys(comparisonPalettes);
};

/**
 * Default user custom colors (using Observable10 as default)
 */
export const defaultUserColors = d3.schemeObservable10;
