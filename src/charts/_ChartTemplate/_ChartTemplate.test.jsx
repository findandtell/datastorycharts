/**
 * Tests for _ChartTemplate Component
 *
 * TEMPLATE FILE - Copy and customize for your chart
 *
 * Instructions:
 * 1. Copy this file to your chart folder
 * 2. Rename to YourChart.test.jsx
 * 3. Update component name and tests
 * 4. Remove this comment block
 *
 * This template includes:
 * - Basic rendering tests
 * - Data handling tests
 * - Settings tests
 * - Edge case tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import _ChartTemplate from './_ChartTemplate';

describe('_ChartTemplate', () => {
  // ===== Mock Data =====
  const mockData = [
    { Category: 'Item 1', Value: 100 },
    { Category: 'Item 2', Value: 150 },
    { Category: 'Item 3', Value: 120 },
  ];

  const mockPeriodNames = ['Value'];

  const mockStyleSettings = {
    chartHeight: 500,
    chartWidth: 800,
    colorPalette: 'vibrant',
    showLabels: true,
    showValues: true,
  };

  // ===== Basic Rendering Tests =====
  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <_ChartTemplate
          data={mockData}
          periodNames={mockPeriodNames}
          styleSettings={mockStyleSettings}
        />
      );

      expect(container).toBeTruthy();
    });

    it('should render SVG element', () => {
      const { container } = render(
        <_ChartTemplate
          data={mockData}
          periodNames={mockPeriodNames}
          styleSettings={mockStyleSettings}
        />
      );

      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    it('should render with correct dimensions', () => {
      const { container } = render(
        <_ChartTemplate
          data={mockData}
          periodNames={mockPeriodNames}
          styleSettings={{ chartHeight: 600, chartWidth: 900 }}
        />
      );

      const svg = container.querySelector('svg');
      expect(svg.getAttribute('width')).toBe('900');
      expect(svg.getAttribute('height')).toBe('600');
    });
  });

  // ===== Data Handling Tests =====
  describe('Data Handling', () => {
    it('should handle empty data gracefully', () => {
      const { container } = render(
        <_ChartTemplate
          data={[]}
          periodNames={mockPeriodNames}
          styleSettings={mockStyleSettings}
        />
      );

      // Should not crash
      expect(container).toBeTruthy();
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    it('should handle null data gracefully', () => {
      const { container } = render(
        <_ChartTemplate
          data={null}
          periodNames={mockPeriodNames}
          styleSettings={mockStyleSettings}
        />
      );

      expect(container).toBeTruthy();
    });

    it('should handle undefined periodNames', () => {
      const { container } = render(
        <_ChartTemplate
          data={mockData}
          periodNames={undefined}
          styleSettings={mockStyleSettings}
        />
      );

      expect(container).toBeTruthy();
    });

    it('should render correct number of data elements', () => {
      const { container } = render(
        <_ChartTemplate
          data={mockData}
          periodNames={mockPeriodNames}
          styleSettings={mockStyleSettings}
        />
      );

      // Count bars (or your chart's data elements)
      const bars = container.querySelectorAll('.bar');
      expect(bars.length).toBe(mockData.length);
    });
  });

  // ===== Settings Tests =====
  describe('Style Settings', () => {
    it('should apply default settings when none provided', () => {
      const { container } = render(
        <_ChartTemplate
          data={mockData}
          periodNames={mockPeriodNames}
          styleSettings={{}}
        />
      );

      expect(container.querySelector('svg')).toBeTruthy();
    });

    it('should respect custom color palette', () => {
      const customColors = ['#FF0000', '#00FF00', '#0000FF'];

      const { container } = render(
        <_ChartTemplate
          data={mockData}
          periodNames={mockPeriodNames}
          styleSettings={{
            ...mockStyleSettings,
            customColors,
          }}
        />
      );

      const bars = container.querySelectorAll('.bar');
      expect(bars[0].getAttribute('fill')).toBe(customColors[0]);
    });

    it('should toggle labels based on setting', () => {
      const { container, rerender } = render(
        <_ChartTemplate
          data={mockData}
          periodNames={mockPeriodNames}
          styleSettings={{ ...mockStyleSettings, showLabels: true }}
        />
      );

      let labels = container.querySelectorAll('.label');
      expect(labels.length).toBeGreaterThan(0);

      // Rerender with labels hidden
      rerender(
        <_ChartTemplate
          data={mockData}
          periodNames={mockPeriodNames}
          styleSettings={{ ...mockStyleSettings, showLabels: false }}
        />
      );

      labels = container.querySelectorAll('.label');
      expect(labels.length).toBe(0);
    });
  });

  // ===== Edge Cases =====
  describe('Edge Cases', () => {
    it('should handle single data point', () => {
      const singleData = [{ Category: 'Only', Value: 100 }];

      const { container } = render(
        <_ChartTemplate
          data={singleData}
          periodNames={mockPeriodNames}
          styleSettings={mockStyleSettings}
        />
      );

      const bars = container.querySelectorAll('.bar');
      expect(bars.length).toBe(1);
    });

    it('should handle large dataset', () => {
      const largeData = Array.from({ length: 100 }, (_, i) => ({
        Category: `Item ${i + 1}`,
        Value: Math.random() * 1000,
      }));

      const { container } = render(
        <_ChartTemplate
          data={largeData}
          periodNames={mockPeriodNames}
          styleSettings={mockStyleSettings}
        />
      );

      const bars = container.querySelectorAll('.bar');
      expect(bars.length).toBe(100);
    });

    it('should handle zero values', () => {
      const zeroData = [
        { Category: 'Zero', Value: 0 },
        { Category: 'Positive', Value: 100 },
      ];

      const { container } = render(
        <_ChartTemplate
          data={zeroData}
          periodNames={mockPeriodNames}
          styleSettings={mockStyleSettings}
        />
      );

      expect(container.querySelector('svg')).toBeTruthy();
    });

    it('should handle negative values', () => {
      const negativeData = [
        { Category: 'Negative', Value: -50 },
        { Category: 'Positive', Value: 100 },
      ];

      const { container } = render(
        <_ChartTemplate
          data={negativeData}
          periodNames={mockPeriodNames}
          styleSettings={mockStyleSettings}
        />
      );

      // Should not crash
      expect(container).toBeTruthy();
    });

    it('should handle very large numbers', () => {
      const largeNumbers = [
        { Category: 'Huge', Value: 1000000000 },
        { Category: 'Normal', Value: 100 },
      ];

      const { container } = render(
        <_ChartTemplate
          data={largeNumbers}
          periodNames={mockPeriodNames}
          styleSettings={mockStyleSettings}
        />
      );

      expect(container.querySelector('svg')).toBeTruthy();
    });
  });

  // ===== Interaction Tests (Optional) =====
  describe('Interactions', () => {
    it('should call click handler when provided', () => {
      let clickedData = null;

      const handleClick = (data) => {
        clickedData = data;
      };

      const { container } = render(
        <_ChartTemplate
          data={mockData}
          periodNames={mockPeriodNames}
          styleSettings={mockStyleSettings}
          onDataPointClick={handleClick}
        />
      );

      const firstBar = container.querySelector('.bar');
      if (firstBar) {
        fireEvent.click(firstBar);
      }

      expect(clickedData).toBeTruthy();
      expect(clickedData.category).toBe('Item 1');
    });
  });

  // ===== Update Tests =====
  describe('Updates', () => {
    it('should update when data changes', () => {
      const { container, rerender } = render(
        <_ChartTemplate
          data={mockData}
          periodNames={mockPeriodNames}
          styleSettings={mockStyleSettings}
        />
      );

      let bars = container.querySelectorAll('.bar');
      expect(bars.length).toBe(3);

      // Update with more data
      const newData = [
        ...mockData,
        { Category: 'Item 4', Value: 200 },
      ];

      rerender(
        <_ChartTemplate
          data={newData}
          periodNames={mockPeriodNames}
          styleSettings={mockStyleSettings}
        />
      );

      bars = container.querySelectorAll('.bar');
      expect(bars.length).toBe(4);
    });

    it('should update when settings change', () => {
      const { container, rerender } = render(
        <_ChartTemplate
          data={mockData}
          periodNames={mockPeriodNames}
          styleSettings={{ ...mockStyleSettings, chartHeight: 500 }}
        />
      );

      let svg = container.querySelector('svg');
      expect(svg.getAttribute('height')).toBe('500');

      rerender(
        <_ChartTemplate
          data={mockData}
          periodNames={mockPeriodNames}
          styleSettings={{ ...mockStyleSettings, chartHeight: 600 }}
        />
      );

      svg = container.querySelector('svg');
      expect(svg.getAttribute('height')).toBe('600');
    });
  });
});
