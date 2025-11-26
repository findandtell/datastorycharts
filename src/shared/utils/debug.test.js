/**
 * Unit tests for debug utility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debug } from './debug';

describe('debug utility', () => {
  let consoleSpy;

  beforeEach(() => {
    // Spy on console methods
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      trace: vi.spyOn(console, 'trace').mockImplementation(() => {}),
      group: vi.spyOn(console, 'group').mockImplementation(() => {}),
      groupEnd: vi.spyOn(console, 'groupEnd').mockImplementation(() => {}),
      time: vi.spyOn(console, 'time').mockImplementation(() => {}),
      timeEnd: vi.spyOn(console, 'timeEnd').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('debug.log', () => {
    it('should log message with group prefix in development', () => {
      debug.log('TestGroup', 'Test message');

      if (import.meta.env.DEV) {
        expect(consoleSpy.log).toHaveBeenCalledWith('[TestGroup] Test message');
      }
    });

    it('should log message with data when provided', () => {
      const testData = { key: 'value' };
      debug.log('TestGroup', 'Test message', testData);

      if (import.meta.env.DEV) {
        expect(consoleSpy.log).toHaveBeenCalledWith('[TestGroup] Test message', testData);
      }
    });
  });

  describe('debug.warn', () => {
    it('should warn with emoji prefix in development', () => {
      debug.warn('TestGroup', 'Warning message');

      if (import.meta.env.DEV) {
        expect(consoleSpy.warn).toHaveBeenCalledWith('[TestGroup] ⚠️ Warning message');
      }
    });

    it('should include data when provided', () => {
      const testData = { warning: true };
      debug.warn('TestGroup', 'Warning message', testData);

      if (import.meta.env.DEV) {
        expect(consoleSpy.warn).toHaveBeenCalledWith('[TestGroup] ⚠️ Warning message', testData);
      }
    });
  });

  describe('debug.error', () => {
    it('should always log errors (even in production)', () => {
      debug.error('TestGroup', 'Error message');

      // Errors should always log
      expect(consoleSpy.error).toHaveBeenCalledWith('[TestGroup] ❌ Error message');
    });

    it('should include error object when provided', () => {
      const testError = new Error('Test error');
      debug.error('TestGroup', 'Error message', testError);

      expect(consoleSpy.error).toHaveBeenCalledWith('[TestGroup] ❌ Error message', testError);
    });
  });

  describe('debug.trace', () => {
    it('should log with trace in development', () => {
      debug.trace('TestGroup', 'Trace message');

      if (import.meta.env.DEV) {
        expect(consoleSpy.log).toHaveBeenCalledWith('[TestGroup] Trace message');
        expect(consoleSpy.trace).toHaveBeenCalled();
      }
    });
  });

  describe('debug.group', () => {
    it('should group logs in development', () => {
      const mockFn = vi.fn();
      debug.group('Test Group', mockFn);

      if (import.meta.env.DEV) {
        expect(consoleSpy.group).toHaveBeenCalledWith('Test Group');
        expect(mockFn).toHaveBeenCalled();
        expect(consoleSpy.groupEnd).toHaveBeenCalled();
      }
    });
  });

  describe('debug.time', () => {
    it('should return timer object with end method', () => {
      const timer = debug.time('TestTimer');

      expect(timer).toHaveProperty('end');
      expect(typeof timer.end).toBe('function');

      // Should not throw when calling end
      expect(() => timer.end()).not.toThrow();
    });

    it('should call console.time and console.timeEnd in development', () => {
      const timer = debug.time('TestTimer');
      timer.end();

      if (import.meta.env.DEV) {
        expect(consoleSpy.time).toHaveBeenCalledWith('TestTimer');
        expect(consoleSpy.timeEnd).toHaveBeenCalledWith('TestTimer');
      }
    });
  });

  describe('debug.isEnabled', () => {
    it('should return boolean indicating debug mode', () => {
      const result = debug.isEnabled();
      expect(typeof result).toBe('boolean');
    });
  });
});
