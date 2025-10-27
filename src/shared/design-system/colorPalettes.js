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
      "#1e40af", // Navy blue
      "#0d9488", // Teal
      "#991b1b", // Dark red
      "#d97706", // Amber
      "#475569", // Slate
      "#64748b", // Light slate
      "#0891b2", // Cyan
      "#7c2d12", // Brown
      "#7c3aed", // Purple
      "#059669", // Emerald
      "#dc2626", // Red
      "#4f46e5", // Indigo
    ],
  },
  vibrant: {
    name: "Vibrant",
    description: "Bold and energetic colors",
    colors: [
      "#2563eb", // Blue
      "#ea580c", // Orange
      "#16a34a", // Green
      "#9333ea", // Purple
      "#dc2626", // Red
      "#0891b2", // Cyan
      "#f59e0b", // Amber
      "#ec4899", // Pink
      "#14b8a6", // Teal
      "#8b5cf6", // Violet
      "#f97316", // Dark orange
      "#10b981", // Emerald
    ],
  },
  corporate: {
    name: "Corporate",
    description: "Conservative corporate palette",
    colors: [
      "#1e3a8a", // Dark blue
      "#0284c7", // Sky blue
      "#065f46", // Dark green
      "#9a3412", // Dark orange
      "#374151", // Gray
      "#475569", // Slate
      "#0e7490", // Cyan
      "#713f12", // Brown
      "#1e40af", // Navy
      "#047857", // Emerald
      "#92400e", // Amber
      "#6b7280", // Medium gray
    ],
  },
  accessible: {
    name: "Accessible",
    description: "High contrast, colorblind-friendly",
    colors: [
      "#0066cc", // Blue
      "#ff6600", // Orange
      "#00b8d4", // Cyan
      "#d81b60", // Pink
      "#fdd835", // Yellow
      "#7b1fa2", // Purple
      "#00897b", // Teal
      "#c62828", // Red
      "#5e35b1", // Deep purple
      "#00acc1", // Light cyan
      "#ff8f00", // Amber
      "#e53935", // Bright red
    ],
  },
  elegant: {
    name: "Elegant",
    description: "Sophisticated and refined",
    colors: [
      "#4f46e5", // Indigo
      "#059669", // Emerald
      "#e11d48", // Rose
      "#f59e0b", // Amber
      "#64748b", // Slate
      "#7c3aed", // Violet
      "#0d9488", // Teal
      "#dc2626", // Red
      "#8b5cf6", // Purple
      "#10b981", // Green
      "#f43f5e", // Pink
      "#475569", // Dark slate
    ],
  },
  pastel: {
    name: "Pastel",
    description: "Soft and gentle tones",
    colors: [
      "#93c5fd", // Light blue
      "#fbbf24", // Yellow
      "#86efac", // Light green
      "#c084fc", // Light purple
      "#fca5a5", // Light red
      "#67e8f9", // Light cyan
      "#fdba74", // Light orange
      "#f9a8d4", // Light pink
      "#a5b4fc", // Light indigo
      "#bef264", // Lime
      "#fcd34d", // Light amber
      "#d8b4fe", // Light violet
    ],
  },
  earth: {
    name: "Earth",
    description: "Natural, organic tones",
    colors: [
      "#78716c", // Stone
      "#a16207", // Yellow
      "#15803d", // Green
      "#be123c", // Rose
      "#92400e", // Amber
      "#166534", // Dark green
      "#b45309", // Orange
      "#831843", // Pink
      "#6b7280", // Gray
      "#ca8a04", // Yellow
      "#14532d", // Forest green
      "#9f1239", // Dark rose
    ],
  },
  ocean: {
    name: "Ocean",
    description: "Cool blues and teals",
    colors: [
      "#0369a1", // Blue
      "#0891b2", // Cyan
      "#0e7490", // Teal
      "#155e75", // Dark cyan
      "#1e40af", // Navy
      "#0284c7", // Sky
      "#0c4a6e", // Dark blue
      "#164e63", // Dark teal
      "#075985", // Medium blue
      "#06b6d4", // Bright cyan
      "#1e3a8a", // Deep blue
      "#0d9488", // Teal green
    ],
  },
  monochrome: {
    name: "Monochrome Grey",
    description: "Shades of grey from light to dark",
    colors: [
      "#e5e7eb", // Very light gray
      "#d1d5db", // Light gray
      "#c4c4c4", // Light-medium gray
      "#9ca3af", // Medium-light gray
      "#6b7280", // Medium gray
      "#52525b", // Medium-dark gray
      "#4b5563", // Dark gray
      "#374151", // Darker gray
      "#404040", // Very dark gray
      "#2d2d2d", // Near black
      "#1f2937", // Almost black
      "#111827", // Black
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
    return comparisonPalettes.professional.colors[index % 12];
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
  "#0891b2",
  "#f59e0b",
  "#64748b",
  "#4f46e5",
];
