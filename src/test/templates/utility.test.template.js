/**
 * Template for testing utility functions
 * Copy this file and rename it to match your utility file: myUtility.test.js
 */

import { describe, it, expect } from 'vitest';
// Import your utility functions here
// import { myFunction } from '@shared/utils/myUtility';

describe('UtilityName', () => {
  describe('functionName', () => {
    it('should handle typical case', () => {
      // Arrange
      const input = 'test input';
      const expected = 'expected output';

      // Act
      const result = functionName(input);

      // Assert
      expect(result).toBe(expected);
    });

    it('should handle edge case: empty input', () => {
      const result = functionName('');
      expect(result).toBe('');
    });

    it('should handle edge case: null/undefined', () => {
      expect(functionName(null)).toBe(null);
      expect(functionName(undefined)).toBe(undefined);
    });

    it('should handle edge case: large numbers', () => {
      const result = functionName(1000000);
      expect(result).toBeDefined();
    });

    it('should throw error for invalid input', () => {
      expect(() => functionName(invalid)).toThrow();
    });
  });

  describe('anotherFunction', () => {
    it('should return correct value', () => {
      // Test another function
    });
  });
});

/**
 * Testing Tips for Utilities:
 *
 * 1. Test pure functions (input → output)
 * 2. Cover edge cases: null, undefined, empty, very large, very small
 * 3. Test error conditions
 * 4. Use descriptive test names: "should [expected behavior] when [condition]"
 * 5. Follow AAA pattern: Arrange, Act, Assert
 *
 * Example test cases to consider:
 * - Normal input
 * - Empty input
 * - Null/undefined input
 * - Very large numbers
 * - Very small numbers
 * - Negative numbers
 * - Invalid types
 * - Boundary conditions
 */
