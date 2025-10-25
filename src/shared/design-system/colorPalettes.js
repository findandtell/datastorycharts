/**
 * Color palettes and presets for charts
 */

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
 */
export const comparisonPalettes = {
  professional: {
    name: "Professional",
    description: "Classic business colors",
    colors: [
      "#1e40af",
      "#0d9488",
      "#991b1b",
      "#d97706",
      "#475569",
      "#64748b",
      "#0891b2",
      "#7c2d12",
    ],
  },
  vibrant: {
    name: "Vibrant",
    description: "Bold and energetic colors",
    colors: [
      "#2563eb",
      "#ea580c",
      "#16a34a",
      "#9333ea",
      "#dc2626",
      "#0891b2",
      "#f59e0b",
      "#ec4899",
    ],
  },
  corporate: {
    name: "Corporate",
    description: "Conservative corporate palette",
    colors: [
      "#1e3a8a",
      "#0284c7",
      "#065f46",
      "#9a3412",
      "#374151",
      "#475569",
      "#0e7490",
      "#713f12",
    ],
  },
  accessible: {
    name: "Accessible",
    description: "High contrast, colorblind-friendly",
    colors: [
      "#0066cc",
      "#ff6600",
      "#00b8d4",
      "#d81b60",
      "#fdd835",
      "#7b1fa2",
      "#00897b",
      "#c62828",
    ],
  },
  elegant: {
    name: "Elegant",
    description: "Sophisticated and refined",
    colors: [
      "#4f46e5",
      "#059669",
      "#e11d48",
      "#f59e0b",
      "#64748b",
      "#7c3aed",
      "#0d9488",
      "#dc2626",
    ],
  },
  pastel: {
    name: "Pastel",
    description: "Soft and gentle tones",
    colors: [
      "#93c5fd",
      "#fbbf24",
      "#86efac",
      "#c084fc",
      "#fca5a5",
      "#67e8f9",
      "#fdba74",
      "#f9a8d4",
    ],
  },
  earth: {
    name: "Earth",
    description: "Natural, organic tones",
    colors: [
      "#78716c",
      "#a16207",
      "#15803d",
      "#be123c",
      "#92400e",
      "#166534",
      "#b45309",
      "#831843",
    ],
  },
  ocean: {
    name: "Ocean",
    description: "Cool blues and teals",
    colors: [
      "#0369a1",
      "#0891b2",
      "#0e7490",
      "#155e75",
      "#1e40af",
      "#0284c7",
      "#0c4a6e",
      "#164e63",
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
    return comparisonPalettes.professional.colors[index % 8];
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
      : comparisonPalettes.professional.colors;
  }

  return comparisonPalettes[paletteKey]?.colors || comparisonPalettes.professional.colors;
};

/**
 * Get available palette keys
 */
export const getPaletteKeys = () => {
  return Object.keys(comparisonPalettes);
};

/**
 * Default user custom colors
 */
export const defaultUserColors = [
  "#1e40af",
  "#0d9488",
  "#991b1b",
  "#d97706",
  "#475569",
  "#7c3aed",
  "#059669",
  "#dc2626",
];
