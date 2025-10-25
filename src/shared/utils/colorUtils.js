/**
 * Color utilities for manipulation and interpolation
 */

/**
 * Convert hex color to RGB
 */
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Convert RGB to hex color
 */
export const rgbToHex = (r, g, b) => {
  const toHex = (n) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return "#" + toHex(r) + toHex(g) + toHex(b);
};

/**
 * Interpolate between two colors
 */
export const interpolateColor = (color1, color2, factor) => {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);

  if (!c1 || !c2) return color1;

  const r = c1.r + factor * (c2.r - c1.r);
  const g = c1.g + factor * (c2.g - c1.g);
  const b = c1.b + factor * (c2.b - c1.b);

  return rgbToHex(r, g, b);
};

/**
 * Lighten a color by a percentage
 */
export const lightenColor = (color, percent) => {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const factor = percent / 100;
  const r = rgb.r + (255 - rgb.r) * factor;
  const g = rgb.g + (255 - rgb.g) * factor;
  const b = rgb.b + (255 - rgb.b) * factor;

  return rgbToHex(r, g, b);
};

/**
 * Darken a color by a percentage
 */
export const darkenColor = (color, percent) => {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const factor = 1 - percent / 100;
  const r = rgb.r * factor;
  const g = rgb.g * factor;
  const b = rgb.b * factor;

  return rgbToHex(r, g, b);
};

/**
 * Adjust color opacity
 */
export const setColorOpacity = (color, opacity) => {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const alpha = Math.max(0, Math.min(1, opacity / 100));
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
};

/**
 * Generate color gradient array
 */
export const generateColorGradient = (startColor, endColor, steps) => {
  const colors = [];
  for (let i = 0; i < steps; i++) {
    const factor = i / (steps - 1);
    colors.push(interpolateColor(startColor, endColor, factor));
  }
  return colors;
};

/**
 * Calculate color for funnel segment based on position
 */
export const calculateSegmentColor = (
  baseColor,
  index,
  totalSegments,
  colorTransition = 60
) => {
  const transitionFactor = colorTransition / 100;
  const darkenAmount = (index / (totalSegments - 1)) * 40 * transitionFactor;
  return darkenColor(baseColor, darkenAmount);
};

/**
 * Get contrasting text color (black or white) for background
 */
export const getContrastTextColor = (backgroundColor) => {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return "#000000";

  // Calculate relative luminance
  const luminance =
    (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

  return luminance > 0.5 ? "#000000" : "#ffffff";
};

/**
 * Validate if string is a valid hex color
 */
export const isValidHexColor = (color) => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

/**
 * Generate random hex color
 */
export const generateRandomColor = () => {
  return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
};

/**
 * Mix multiple colors together
 */
export const mixColors = (colors, weights = null) => {
  if (!colors || colors.length === 0) return "#000000";
  
  const rgbs = colors.map(hexToRgb).filter(Boolean);
  if (rgbs.length === 0) return "#000000";

  const w = weights || Array(colors.length).fill(1);
  const totalWeight = w.reduce((sum, weight) => sum + weight, 0);

  let r = 0, g = 0, b = 0;
  rgbs.forEach((rgb, i) => {
    const weight = w[i] / totalWeight;
    r += rgb.r * weight;
    g += rgb.g * weight;
    b += rgb.b * weight;
  });

  return rgbToHex(r, g, b);
};

/**
 * Get color scheme variations
 */
export const getColorScheme = (baseColor, type = "analogous") => {
  const rgb = hexToRgb(baseColor);
  if (!rgb) return [baseColor];

  switch (type) {
    case "complementary":
      return [
        baseColor,
        rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b),
      ];
    case "triadic":
      return [
        baseColor,
        rgbToHex(rgb.b, rgb.r, rgb.g),
        rgbToHex(rgb.g, rgb.b, rgb.r),
      ];
    case "analogous":
      return [
        lightenColor(baseColor, 20),
        baseColor,
        darkenColor(baseColor, 20),
      ];
    case "monochromatic":
      return [
        lightenColor(baseColor, 40),
        lightenColor(baseColor, 20),
        baseColor,
        darkenColor(baseColor, 20),
        darkenColor(baseColor, 40),
      ];
    default:
      return [baseColor];
  }
};
