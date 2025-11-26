/**
 * Unit tests for chart default constants
 */

import { describe, it, expect } from 'vitest';
import {
  TYPOGRAPHY_DEFAULTS,
  LAYOUT_DEFAULTS,
  VISUAL_DEFAULTS,
  AXIS_DEFAULTS,
  BAR_CHART_DEFAULTS,
  LINE_CHART_DEFAULTS,
  ANIMATION_DEFAULTS,
  LIMITS,
  DEFAULTS,
} from './chartDefaults';

describe('chartDefaults constants', () => {
  describe('TYPOGRAPHY_DEFAULTS', () => {
    it('should have required font size properties', () => {
      expect(TYPOGRAPHY_DEFAULTS.TITLE_FONT_SIZE).toBeDefined();
      expect(TYPOGRAPHY_DEFAULTS.SUBTITLE_FONT_SIZE).toBeDefined();
      expect(TYPOGRAPHY_DEFAULTS.SEGMENT_LABEL_FONT_SIZE).toBeDefined();
      expect(TYPOGRAPHY_DEFAULTS.METRIC_LABEL_FONT_SIZE).toBeDefined();
      expect(TYPOGRAPHY_DEFAULTS.LEGEND_FONT_SIZE).toBeDefined();
    });

    it('should have positive font size values', () => {
      Object.entries(TYPOGRAPHY_DEFAULTS).forEach(([key, value]) => {
        if (key.includes('FONT_SIZE')) {
          expect(value).toBeGreaterThan(0);
          expect(typeof value).toBe('number');
        }
      });
    });

    it('should have a default font family', () => {
      expect(TYPOGRAPHY_DEFAULTS.DEFAULT_FONT_FAMILY).toBeDefined();
      expect(typeof TYPOGRAPHY_DEFAULTS.DEFAULT_FONT_FAMILY).toBe('string');
    });
  });

  describe('LAYOUT_DEFAULTS', () => {
    it('should have canvas dimensions', () => {
      expect(LAYOUT_DEFAULTS.CANVAS_WIDTH).toBeDefined();
      expect(LAYOUT_DEFAULTS.CANVAS_HEIGHT).toBeDefined();
      expect(LAYOUT_DEFAULTS.CANVAS_WIDTH).toBeGreaterThan(0);
      expect(LAYOUT_DEFAULTS.CANVAS_HEIGHT).toBeGreaterThan(0);
    });

    it('should have chart dimensions', () => {
      expect(LAYOUT_DEFAULTS.CHART_WIDTH).toBeDefined();
      expect(LAYOUT_DEFAULTS.CHART_HEIGHT).toBeDefined();
      expect(LAYOUT_DEFAULTS.CHART_WIDTH).toBeGreaterThan(0);
      expect(LAYOUT_DEFAULTS.CHART_HEIGHT).toBeGreaterThan(0);
    });

    it('should have spacing values', () => {
      expect(LAYOUT_DEFAULTS.CHART_PADDING).toBeDefined();
      expect(LAYOUT_DEFAULTS.STAGE_GAP).toBeDefined();
      expect(LAYOUT_DEFAULTS.BAR_WIDTH).toBeDefined();
    });

    it('should have chart dimensions smaller than canvas', () => {
      expect(LAYOUT_DEFAULTS.CHART_WIDTH).toBeLessThanOrEqual(LAYOUT_DEFAULTS.CANVAS_WIDTH);
      expect(LAYOUT_DEFAULTS.CHART_HEIGHT).toBeLessThanOrEqual(LAYOUT_DEFAULTS.CANVAS_HEIGHT);
    });
  });

  describe('VISUAL_DEFAULTS', () => {
    it('should have line thickness properties', () => {
      expect(VISUAL_DEFAULTS.LINE_THICKNESS).toBeDefined();
      expect(VISUAL_DEFAULTS.LINE_CHART_LINE_THICKNESS).toBeDefined();
      expect(VISUAL_DEFAULTS.AXIS_LINE_WIDTH).toBeDefined();
    });

    it('should have point properties', () => {
      expect(VISUAL_DEFAULTS.ENDPOINT_SIZE).toBeDefined();
      expect(VISUAL_DEFAULTS.POINT_SIZE).toBeDefined();
      expect(VISUAL_DEFAULTS.POINT_BORDER_WIDTH).toBeDefined();
    });

    it('should have opacity values within valid range', () => {
      expect(VISUAL_DEFAULTS.BACKGROUND_OPACITY).toBeGreaterThanOrEqual(0);
      expect(VISUAL_DEFAULTS.BACKGROUND_OPACITY).toBeLessThanOrEqual(100);
    });

    it('should have saturation values within valid range', () => {
      expect(VISUAL_DEFAULTS.LINE_SATURATION).toBeGreaterThanOrEqual(0);
      expect(VISUAL_DEFAULTS.LINE_SATURATION).toBeLessThanOrEqual(100);
    });
  });

  describe('AXIS_DEFAULTS', () => {
    it('should have axis bounds', () => {
      expect(AXIS_DEFAULTS.AXIS_MINIMUM).toBeDefined();
      expect(AXIS_DEFAULTS.AXIS_MAXIMUM).toBeDefined();
    });

    it('should have axis maximum greater than minimum', () => {
      expect(AXIS_DEFAULTS.AXIS_MAXIMUM).toBeGreaterThan(AXIS_DEFAULTS.AXIS_MINIMUM);
    });

    it('should have axis units', () => {
      expect(AXIS_DEFAULTS.AXIS_MAJOR_UNIT).toBeDefined();
      expect(AXIS_DEFAULTS.AXIS_MINOR_UNIT).toBeDefined();
    });

    it('should have decimal places settings', () => {
      expect(AXIS_DEFAULTS.VALUE_DECIMAL_PLACES).toBeDefined();
      expect(AXIS_DEFAULTS.AXIS_VALUE_DECIMAL_PLACES).toBeDefined();
      expect(AXIS_DEFAULTS.VALUE_DECIMAL_PLACES).toBeGreaterThanOrEqual(0);
    });
  });

  describe('BAR_CHART_DEFAULTS', () => {
    it('should have bar chart specific settings', () => {
      expect(BAR_CHART_DEFAULTS.PERCENT_CHANGE_BRACKET_DISTANCE).toBeDefined();
      expect(BAR_CHART_DEFAULTS.PERCENT_CHANGE_BRACKET_DISTANCE).toBeGreaterThan(0);
    });
  });

  describe('LINE_CHART_DEFAULTS', () => {
    it('should have fiscal year start month', () => {
      expect(LINE_CHART_DEFAULTS.FISCAL_YEAR_START_MONTH).toBeDefined();
      expect(LINE_CHART_DEFAULTS.FISCAL_YEAR_START_MONTH).toBeGreaterThanOrEqual(1);
      expect(LINE_CHART_DEFAULTS.FISCAL_YEAR_START_MONTH).toBeLessThanOrEqual(12);
    });
  });

  describe('ANIMATION_DEFAULTS', () => {
    it('should have animation duration', () => {
      expect(ANIMATION_DEFAULTS.DURATION_MS).toBeDefined();
      expect(ANIMATION_DEFAULTS.DURATION_MS).toBeGreaterThan(0);
    });

    it('should have animation easing', () => {
      expect(ANIMATION_DEFAULTS.EASING).toBeDefined();
      expect(typeof ANIMATION_DEFAULTS.EASING).toBe('string');
    });
  });

  describe('LIMITS', () => {
    it('should have font size limits', () => {
      expect(LIMITS.MIN_FONT_SIZE).toBeDefined();
      expect(LIMITS.MAX_FONT_SIZE).toBeDefined();
      expect(LIMITS.MAX_FONT_SIZE).toBeGreaterThan(LIMITS.MIN_FONT_SIZE);
    });

    it('should have canvas size limits', () => {
      expect(LIMITS.MIN_CANVAS_WIDTH).toBeDefined();
      expect(LIMITS.MAX_CANVAS_WIDTH).toBeDefined();
      expect(LIMITS.MIN_CANVAS_HEIGHT).toBeDefined();
      expect(LIMITS.MAX_CANVAS_HEIGHT).toBeDefined();
    });

    it('should have line thickness limits', () => {
      expect(LIMITS.MIN_LINE_THICKNESS).toBeDefined();
      expect(LIMITS.MAX_LINE_THICKNESS).toBeDefined();
      expect(LIMITS.MAX_LINE_THICKNESS).toBeGreaterThan(LIMITS.MIN_LINE_THICKNESS);
    });

    it('should have point size limits', () => {
      expect(LIMITS.MIN_POINT_SIZE).toBeDefined();
      expect(LIMITS.MAX_POINT_SIZE).toBeDefined();
      expect(LIMITS.MAX_POINT_SIZE).toBeGreaterThan(LIMITS.MIN_POINT_SIZE);
    });

    it('should have opacity limits from 0 to 100', () => {
      expect(LIMITS.MIN_OPACITY).toBe(0);
      expect(LIMITS.MAX_OPACITY).toBe(100);
    });

    it('should have rotation limits', () => {
      expect(LIMITS.MIN_ROTATION).toBeDefined();
      expect(LIMITS.MAX_ROTATION).toBeDefined();
      expect(LIMITS.MIN_ROTATION).toBeGreaterThanOrEqual(0);
      expect(LIMITS.MAX_ROTATION).toBeLessThanOrEqual(360);
    });

    it('should have emphasis limits', () => {
      expect(LIMITS.MAX_EMPHASIZED_POINTS).toBeDefined();
      expect(LIMITS.MAX_EMPHASIZED_BARS).toBeDefined();
      expect(LIMITS.MAX_EMPHASIZED_POINTS).toBeGreaterThan(0);
      expect(LIMITS.MAX_EMPHASIZED_BARS).toBeGreaterThan(0);
    });
  });

  describe('DEFAULTS (combined object)', () => {
    it('should contain all category references', () => {
      expect(DEFAULTS.TYPOGRAPHY).toBe(TYPOGRAPHY_DEFAULTS);
      expect(DEFAULTS.LAYOUT).toBe(LAYOUT_DEFAULTS);
      expect(DEFAULTS.VISUAL).toBe(VISUAL_DEFAULTS);
      expect(DEFAULTS.AXIS).toBe(AXIS_DEFAULTS);
      expect(DEFAULTS.BAR_CHART).toBe(BAR_CHART_DEFAULTS);
      expect(DEFAULTS.LINE_CHART).toBe(LINE_CHART_DEFAULTS);
      expect(DEFAULTS.ANIMATION).toBe(ANIMATION_DEFAULTS);
      expect(DEFAULTS.LIMITS).toBe(LIMITS);
    });

    it('should allow nested access', () => {
      expect(DEFAULTS.TYPOGRAPHY.TITLE_FONT_SIZE).toBe(TYPOGRAPHY_DEFAULTS.TITLE_FONT_SIZE);
      expect(DEFAULTS.LAYOUT.CANVAS_WIDTH).toBe(LAYOUT_DEFAULTS.CANVAS_WIDTH);
      expect(DEFAULTS.LIMITS.MAX_FONT_SIZE).toBe(LIMITS.MAX_FONT_SIZE);
    });
  });

  describe('value consistency', () => {
    it('should have typography defaults within limits', () => {
      expect(TYPOGRAPHY_DEFAULTS.TITLE_FONT_SIZE).toBeGreaterThanOrEqual(LIMITS.MIN_FONT_SIZE);
      expect(TYPOGRAPHY_DEFAULTS.TITLE_FONT_SIZE).toBeLessThanOrEqual(LIMITS.MAX_FONT_SIZE);
    });

    it('should have layout defaults within limits', () => {
      expect(LAYOUT_DEFAULTS.CANVAS_WIDTH).toBeGreaterThanOrEqual(LIMITS.MIN_CANVAS_WIDTH);
      expect(LAYOUT_DEFAULTS.CANVAS_WIDTH).toBeLessThanOrEqual(LIMITS.MAX_CANVAS_WIDTH);
      expect(LAYOUT_DEFAULTS.CANVAS_HEIGHT).toBeGreaterThanOrEqual(LIMITS.MIN_CANVAS_HEIGHT);
      expect(LAYOUT_DEFAULTS.CANVAS_HEIGHT).toBeLessThanOrEqual(LIMITS.MAX_CANVAS_HEIGHT);
    });

    it('should have visual defaults within limits', () => {
      expect(VISUAL_DEFAULTS.LINE_THICKNESS).toBeGreaterThanOrEqual(LIMITS.MIN_LINE_THICKNESS);
      expect(VISUAL_DEFAULTS.LINE_THICKNESS).toBeLessThanOrEqual(LIMITS.MAX_LINE_THICKNESS);
      expect(VISUAL_DEFAULTS.POINT_SIZE).toBeGreaterThanOrEqual(LIMITS.MIN_POINT_SIZE);
      expect(VISUAL_DEFAULTS.POINT_SIZE).toBeLessThanOrEqual(LIMITS.MAX_POINT_SIZE);
    });
  });
});
