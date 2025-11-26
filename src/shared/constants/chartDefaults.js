/**
 * Chart Default Constants
 * Centralized magic numbers and default values for chart configuration
 *
 * Usage:
 * import { DEFAULTS } from '../constants/chartDefaults';
 * const [fontSize, setFontSize] = useState(DEFAULTS.TYPOGRAPHY.SEGMENT_LABEL_FONT_SIZE);
 */

// ============================================================================
// TYPOGRAPHY DEFAULTS
// ============================================================================
export const TYPOGRAPHY_DEFAULTS = {
  // Font sizes (in pixels)
  TITLE_FONT_SIZE: 28,
  SUBTITLE_FONT_SIZE: 20,
  SEGMENT_LABEL_FONT_SIZE: 22,
  METRIC_LABEL_FONT_SIZE: 24,
  PERIOD_LABEL_FONT_SIZE: 14,
  IN_STAGE_LABEL_FONT_SIZE: 13,
  LEGEND_FONT_SIZE: 13,
  AXIS_LABEL_FONT_SIZE: 17,
  X_AXIS_FONT_SIZE: 12,
  X_AXIS_SECONDARY_FONT_SIZE: 12,
  Y_AXIS_FONT_SIZE: 20,
  DIRECT_LABEL_FONT_SIZE: 14,
  SUM_LABEL_FONT_SIZE: 14,
  EMPHASIS_LABEL_FONT_SIZE: 12,

  // Default font family
  DEFAULT_FONT_FAMILY: 'Open Sans',
};

// ============================================================================
// LAYOUT DEFAULTS
// ============================================================================
export const LAYOUT_DEFAULTS = {
  // Canvas dimensions (in pixels)
  CANVAS_WIDTH: 1000,
  CANVAS_HEIGHT: 600,
  CHART_WIDTH: 600,
  CHART_HEIGHT: 400,

  // Spacing (in pixels)
  CHART_PADDING: 15,
  STAGE_GAP: 10,
  BAR_WIDTH: 100,

  // Slope chart specific
  PERIOD_SPACING: 400,
  PERIOD_HEIGHT: 700,
};

// ============================================================================
// VISUAL STYLE DEFAULTS
// ============================================================================
export const VISUAL_DEFAULTS = {
  // Line properties
  LINE_THICKNESS: 2,
  LINE_CHART_LINE_THICKNESS: 3,
  AXIS_LINE_WIDTH: 3,
  SLOPE_AXIS_LINE_WIDTH: 1,
  X_AXIS_LINE_THICKNESS: 1,
  Y_AXIS_LINE_THICKNESS: 1,

  // Point properties
  ENDPOINT_SIZE: 6,
  POINT_SIZE: 4,
  POINT_BORDER_WIDTH: 2,

  // Opacity and saturation (0-100)
  BACKGROUND_OPACITY: 100,
  LINE_SATURATION: 100,
  LINE_CHART_LINE_SATURATION: 100,
  COLOR_TRANSITION: 60,
  AXIS_COLOR_BRIGHTNESS: 0,

  // Rotation (degrees)
  X_AXIS_LABEL_ROTATION: 0,
};

// ============================================================================
// AXIS DEFAULTS
// ============================================================================
export const AXIS_DEFAULTS = {
  // Axis bounds
  AXIS_MINIMUM: 0,
  AXIS_MAXIMUM: 50000,

  // Axis units
  AXIS_MAJOR_UNIT: 10000,
  AXIS_MINOR_UNIT: 5,

  // Calculated axis defaults
  CALCULATED_AXIS_MINIMUM: 0,
  CALCULATED_AXIS_MAXIMUM: 100,
  CALCULATED_AXIS_MAJOR_UNIT: 10,

  // Decimal places
  VALUE_DECIMAL_PLACES: 0,
  AXIS_VALUE_DECIMAL_PLACES: 0,
  EMPHASIS_DECIMAL_PLACES: 0,

  // Label levels
  X_AXIS_LABEL_LEVELS: 2,
};

// ============================================================================
// CHART-SPECIFIC DEFAULTS
// ============================================================================
export const BAR_CHART_DEFAULTS = {
  PERCENT_CHANGE_BRACKET_DISTANCE: 100,
};

export const LINE_CHART_DEFAULTS = {
  FISCAL_YEAR_START_MONTH: 1,
};

// ============================================================================
// ANIMATION DEFAULTS
// ============================================================================
export const ANIMATION_DEFAULTS = {
  DURATION_MS: 300,
  EASING: 'ease-in-out',
};

// ============================================================================
// LIMITS AND CONSTRAINTS
// ============================================================================
export const LIMITS = {
  // Font size limits
  MIN_FONT_SIZE: 8,
  MAX_FONT_SIZE: 72,

  // Canvas size limits
  MIN_CANVAS_WIDTH: 200,
  MAX_CANVAS_WIDTH: 3000,
  MIN_CANVAS_HEIGHT: 200,
  MAX_CANVAS_HEIGHT: 3000,

  // Line thickness limits
  MIN_LINE_THICKNESS: 1,
  MAX_LINE_THICKNESS: 7,

  // Point size limits
  MIN_POINT_SIZE: 1,
  MAX_POINT_SIZE: 20,

  // Opacity limits
  MIN_OPACITY: 0,
  MAX_OPACITY: 100,

  // Rotation limits
  MIN_ROTATION: 0,
  MAX_ROTATION: 90,

  // Max emphasized items
  MAX_EMPHASIZED_POINTS: 4,
  MAX_EMPHASIZED_BARS: 10,
};

// ============================================================================
// COMBINED DEFAULTS OBJECT (for convenient import)
// ============================================================================
export const DEFAULTS = {
  TYPOGRAPHY: TYPOGRAPHY_DEFAULTS,
  LAYOUT: LAYOUT_DEFAULTS,
  VISUAL: VISUAL_DEFAULTS,
  AXIS: AXIS_DEFAULTS,
  BAR_CHART: BAR_CHART_DEFAULTS,
  LINE_CHART: LINE_CHART_DEFAULTS,
  ANIMATION: ANIMATION_DEFAULTS,
  LIMITS,
};

export default DEFAULTS;
