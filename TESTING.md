# Testing Guide

**Comprehensive guide to testing the Funnel Visualization Platform**

---

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Test Infrastructure](#test-infrastructure)
3. [Running Tests](#running-tests)
4. [Writing Tests](#writing-tests)
5. [Test Templates](#test-templates)
6. [Testing Patterns](#testing-patterns)
7. [Coverage Guidelines](#coverage-guidelines)
8. [Troubleshooting Tests](#troubleshooting-tests)

---

## Testing Philosophy

### Our Testing Approach

We follow a **pragmatic testing strategy** focused on:

1. **Stability**: Ensure core functionality doesn't break
2. **Confidence**: Tests give confidence to refactor
3. **Speed**: Tests run fast enough to use frequently
4. **Maintainability**: Tests are easy to understand and update

### Testing Pyramid

```
        /\
       /  \
      / E2E \         ← Few (critical user flows)
     /------\
    /        \
   /Integration\      ← Some (hooks + components)
  /------------\
 /              \
/  Unit Tests    \    ← Many (utilities, pure functions)
------------------
```

**Priority**:
1. **Unit Tests** (70%) - Fast, focused, many
2. **Integration Tests** (20%) - Medium speed, realistic
3. **E2E Tests** (10%) - Slow, critical paths only

---

## Test Infrastructure

### Tech Stack

- **Vitest** - Fast test runner (Vite-powered)
- **@testing-library/react** - React component testing
- **@testing-library/user-event** - User interaction simulation
- **@testing-library/jest-dom** - DOM matchers
- **jsdom** - DOM environment for tests

### File Structure

```
src/
├── shared/
│   ├── utils/
│   │   ├── dataFormatters.js
│   │   └── dataFormatters.test.js      ← Co-located tests
│   ├── hooks/
│   │   ├── useChartData.js
│   │   └── useChartData.test.jsx       ← Co-located tests
│   └── components/
│       ├── MyComponent.jsx
│       └── MyComponent.test.jsx        ← Co-located tests
├── test/
│   ├── setup.js                        ← Global test setup
│   ├── templates/                      ← Test templates
│   │   ├── utility.test.template.js
│   │   ├── hook.test.template.jsx
│   │   └── component.test.template.jsx
│   └── integration/                    ← Integration tests
│       ├── adminDefault.test.jsx
│       └── chartRendering.test.jsx
```

**Convention**: Tests are co-located with the code they test

---

## Running Tests

### Available Commands

```bash
# Run tests in watch mode (dev)
npm test

# Run tests in watch mode (explicit)
npm run test:watch

# Run all tests once (CI)
npm run test:run

# Run tests with UI (visual test runner)
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Watch Mode

```bash
npm test
```

**Features**:
- Auto-reruns tests on file changes
- Smart file watching
- Filter tests by pattern
- Interactive commands:
  - Press `a` to run all tests
  - Press `f` to run only failed tests
  - Press `p` to filter by filename
  - Press `t` to filter by test name
  - Press `q` to quit

### Coverage Report

```bash
npm run test:coverage
```

**Output**:
- Terminal: Text summary
- HTML: `coverage/index.html` (open in browser)

**Coverage Targets**:
- **Utilities**: 90%+ (pure functions, easy to test)
- **Hooks**: 80%+ (state logic, important)
- **Components**: 70%+ (UI, harder to test)
- **Overall**: 75%+

---

## Writing Tests

### 1. Testing Utilities

**Location**: `src/shared/utils/*.test.js`

**Template**: `src/test/templates/utility.test.template.js`

**Example**: Testing `dataFormatters.js`

```javascript
import { describe, it, expect } from 'vitest';
import { formatCompactNumber, formatPercentage } from '@shared/utils/dataFormatters';

describe('dataFormatters', () => {
  describe('formatCompactNumber', () => {
    it('should format thousands with K', () => {
      expect(formatCompactNumber(1500)).toBe('1.5K');
      expect(formatCompactNumber(2000)).toBe('2K');
      expect(formatCompactNumber(999)).toBe('999');
    });

    it('should format millions with M', () => {
      expect(formatCompactNumber(1500000)).toBe('1.5M');
      expect(formatCompactNumber(2000000)).toBe('2M');
    });

    it('should format billions with B', () => {
      expect(formatCompactNumber(1500000000)).toBe('1.5B');
    });

    it('should handle zero', () => {
      expect(formatCompactNumber(0)).toBe('0');
    });

    it('should handle negative numbers', () => {
      expect(formatCompactNumber(-1500)).toBe('-1.5K');
    });

    it('should handle decimal precision', () => {
      expect(formatCompactNumber(1234)).toBe('1.2K');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage with default decimals', () => {
      expect(formatPercentage(0.456)).toBe('45.6%');
    });

    it('should handle custom decimal places', () => {
      expect(formatPercentage(0.456, 0)).toBe('46%');
      expect(formatPercentage(0.456, 2)).toBe('45.60%');
    });

    it('should handle edge cases', () => {
      expect(formatPercentage(0)).toBe('0%');
      expect(formatPercentage(1)).toBe('100%');
      expect(formatPercentage(0.999)).toBe('99.9%');
    });
  });
});
```

**Key Points**:
- Test edge cases: 0, negatives, very large, very small
- Test typical cases
- Group related tests with `describe`
- Use descriptive test names

---

### 2. Testing Hooks

**Location**: `src/shared/hooks/*.test.jsx`

**Template**: `src/test/templates/hook.test.template.jsx`

**Example**: Testing `useChartData.js`

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChartData } from '@shared/hooks/useChartData';

describe('useChartData', () => {
  it('should initialize with default dataset', () => {
    const { result } = renderHook(() => useChartData('bar'));

    expect(result.current.data).toBeDefined();
    expect(result.current.periodNames).toBeInstanceOf(Array);
    expect(result.current.error).toBeNull();
  });

  it('should load sample data', () => {
    const { result } = renderHook(() => useChartData('bar'));

    act(() => {
      result.current.loadSampleData('barSimple');
    });

    expect(result.current.data).toHaveLength(3);
    expect(result.current.periodNames).toEqual(['Jan', 'Feb', 'Mar']);
  });

  it('should update data when cell is edited', () => {
    const { result } = renderHook(() => useChartData('bar'));

    act(() => {
      result.current.loadSampleData('barSimple');
    });

    act(() => {
      result.current.updateCell(0, 'Jan', 999);
    });

    expect(result.current.data[0].Jan).toBe(999);
  });

  it('should validate CSV structure', async () => {
    const { result } = renderHook(() => useChartData('bar'));

    const invalidCSV = 'invalid,data\nno,numbers';
    const file = new File([invalidCSV], 'test.csv', { type: 'text/csv' });

    await act(async () => {
      await result.current.loadCSVFile(file);
    });

    expect(result.current.error).toContain('Invalid');
  });
});
```

**Key Points**:
- Use `renderHook` from @testing-library/react
- Wrap state updates in `act()`
- Test initialization, state updates, errors
- Test async operations with `async/await`

---

### 3. Testing Components

**Location**: Co-located with components

**Template**: `src/test/templates/component.test.template.jsx`

**Example**: Testing a simple component

```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ColorPicker from './ColorPicker';

describe('ColorPicker', () => {
  const defaultProps = {
    color: '#1e40af',
    onChange: vi.fn(),
  };

  it('should render current color', () => {
    render(<ColorPicker {...defaultProps} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('#1e40af');
  });

  it('should call onChange when color is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<ColorPicker {...defaultProps} onChange={onChange} />);

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '#ff0000');

    expect(onChange).toHaveBeenCalledWith('#ff0000');
  });

  it('should display preset colors', () => {
    render(<ColorPicker {...defaultProps} />);

    const presets = screen.getAllByRole('button', { name: /preset/i });
    expect(presets.length).toBeGreaterThan(0);
  });

  it('should select preset color on click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<ColorPicker {...defaultProps} onChange={onChange} />);

    const firstPreset = screen.getByRole('button', { name: /preset 1/i });
    await user.click(firstPreset);

    expect(onChange).toHaveBeenCalled();
  });
});
```

**Key Points**:
- Use `render` from @testing-library/react
- Query by role, label, or text (accessible queries)
- Use `userEvent` for interactions (more realistic than `fireEvent`)
- Mock callbacks with `vi.fn()`

---

### 4. Integration Tests

**Location**: `src/test/integration/`

**Purpose**: Test multiple components/hooks working together

**Example**: Testing admin default loading flow

```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AdminProvider } from '@/contexts/AdminContext';
import ChartEditor from '@/pages/ChartEditor';

describe('Admin Default Integration', () => {
  it('should load admin default on mount', async () => {
    // Mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          configuration: {
            data: { csv: 'Category,Value\nA,100\nB,200' },
            styleSettings: { title: 'Admin Default Title' },
          },
        }),
      })
    );

    render(
      <AdminProvider>
        <ChartEditor />
      </AdminProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Admin Default Title')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/get-default')
    );
  });

  it('should save admin default when button clicked', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );

    // Login as admin first
    const { container } = render(
      <AdminProvider>
        <ChartEditor />
      </AdminProvider>
    );

    // ... simulate admin login and save
  });
});
```

**Key Points**:
- Test realistic user workflows
- Mock external dependencies (fetch, APIs)
- Test multiple components together
- Focus on critical paths

---

## Test Templates

We provide three test templates to speed up test creation:

### 1. Utility Test Template

**File**: `src/test/templates/utility.test.template.js`

**Usage**:
```bash
# Copy template
cp src/test/templates/utility.test.template.js src/shared/utils/myUtility.test.js

# Edit and fill in your tests
```

**Covers**:
- Typical cases
- Edge cases (null, undefined, empty)
- Error conditions
- Boundary values

---

### 2. Hook Test Template

**File**: `src/test/templates/hook.test.template.jsx`

**Usage**:
```bash
cp src/test/templates/hook.test.template.jsx src/shared/hooks/useMyHook.test.jsx
```

**Covers**:
- Initialization
- State updates (sync and async)
- Error handling
- Cleanup on unmount
- Re-renders

---

### 3. Component Test Template

**File**: `src/test/templates/component.test.template.jsx`

**Usage**:
```bash
cp src/test/templates/component.test.template.jsx src/components/MyComponent.test.jsx
```

**Covers**:
- Rendering
- Props
- User interactions
- Async operations
- Accessibility

---

## Testing Patterns

### Pattern: AAA (Arrange, Act, Assert)

```javascript
it('should calculate conversion rate', () => {
  // Arrange
  const start = 1000;
  const end = 750;

  // Act
  const rate = calculateConversionRate(start, end);

  // Assert
  expect(rate).toBe(0.75);
});
```

---

### Pattern: Testing Async Functions

```javascript
it('should load data asynchronously', async () => {
  const { result } = renderHook(() => useChartData());

  // Act
  await act(async () => {
    await result.current.loadCSVFile(file);
  });

  // Assert
  await waitFor(() => {
    expect(result.current.data).toBeDefined();
  });
});
```

---

### Pattern: Mocking Functions

```javascript
import { vi } from 'vitest';

it('should call callback on click', async () => {
  const onClick = vi.fn();

  render(<Button onClick={onClick} />);

  await userEvent.click(screen.getByRole('button'));

  expect(onClick).toHaveBeenCalledTimes(1);
  expect(onClick).toHaveBeenCalledWith(expectedArg);
});
```

---

### Pattern: Testing Error States

```javascript
it('should display error message on failure', async () => {
  // Mock fetch to fail
  global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

  render(<MyComponent />);

  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

---

### Pattern: Testing State Changes

```javascript
it('should update state when prop changes', () => {
  const { rerender } = render(<Component value="initial" />);

  expect(screen.getByText('initial')).toBeInTheDocument();

  rerender(<Component value="updated" />);

  expect(screen.getByText('updated')).toBeInTheDocument();
});
```

---

## Coverage Guidelines

### What to Test

**✅ Always Test**:
- Utility functions (pure logic)
- Calculations and formatters
- Hooks (state management)
- Critical user flows
- Error handling
- Edge cases

**⚠️ Sometimes Test**:
- UI components (focus on behavior, not styling)
- Integration points
- Complex interactions

**❌ Don't Test**:
- Third-party libraries (D3, React, etc.)
- Trivial getters/setters
- Implementation details (internal state)
- Visual appearance (use visual regression testing instead)

---

### Coverage Targets

| Type | Target | Why |
|------|--------|-----|
| Utilities | 90%+ | Pure functions, easy to test |
| Hooks | 80%+ | State logic, important |
| Components | 70%+ | UI, harder to test exhaustively |
| Integration | Critical paths | Expensive, focus on key flows |
| **Overall** | **75%+** | Balanced approach |

---

### When to Skip Tests

```javascript
// Mark test as skipped
it.skip('should do something (not implemented yet)', () => {
  // ...
});

// Run only this test
it.only('should do critical thing', () => {
  // ...
});

// Skip entire suite
describe.skip('FeatureNotReady', () => {
  // ...
});
```

---

## Troubleshooting Tests

### Issue: Tests fail with "Cannot find module"

**Solution**: Check import paths and aliases

```javascript
// ❌ Wrong
import { something } from '../../../shared/utils/file';

// ✅ Correct
import { something } from '@shared/utils/file';
```

---

### Issue: "act()" warnings

**Symptoms**: Warning about updates not wrapped in act()

**Solution**: Wrap state updates

```javascript
// ❌ Wrong
result.current.setState('value');

// ✅ Correct
act(() => {
  result.current.setState('value');
});
```

---

### Issue: Tests hang or timeout

**Causes**:
- Forgot `await` on async operation
- Infinite loop in component
- Missing cleanup in useEffect

**Solution**:
```javascript
// Add timeout
it('should load data', async () => {
  // ...
}, 10000); // 10 second timeout

// Or use waitFor with timeout
await waitFor(() => {
  expect(screen.getByText('loaded')).toBeInTheDocument();
}, { timeout: 5000 });
```

---

### Issue: Snapshot tests fail after valid changes

**Solution**: Update snapshots

```bash
# Update all snapshots
npm run test:run -- -u

# Update specific test
npm run test:run -- -u MyComponent.test
```

---

### Issue: Mock not working

**Common mistakes**:

```javascript
// ❌ Wrong - mock after import
import { myFunction } from './module';
vi.mock('./module');

// ✅ Correct - mock before import
vi.mock('./module');
import { myFunction } from './module';
```

---

## Best Practices

### 1. Write Tests Before Fixing Bugs

```javascript
// 1. Write failing test that reproduces bug
it('should not crash with null palette', () => {
  expect(() => getColors(null)).not.toThrow();
});

// 2. Fix the bug
// 3. Test now passes
```

**Benefits**:
- Ensures bug is fixed
- Prevents regression
- Documents the bug

---

### 2. Use Descriptive Test Names

```javascript
// ❌ Bad
it('works', () => { ... });

// ✅ Good
it('should format 1500 as "1.5K"', () => { ... });
it('should throw error when palette is null', () => { ... });
it('should call onChange when user types in input', () => { ... });
```

---

### 3. Keep Tests Focused

```javascript
// ❌ Bad - testing multiple things
it('should work correctly', () => {
  expect(formatNumber(100)).toBe('100');
  expect(formatNumber(1000)).toBe('1K');
  expect(calculateRate(100, 50)).toBe(0.5);
  expect(parseCSV('...')).toBeDefined();
});

// ✅ Good - one assertion per test
it('should format hundreds without suffix', () => {
  expect(formatNumber(100)).toBe('100');
});

it('should format thousands with K', () => {
  expect(formatNumber(1000)).toBe('1K');
});
```

---

### 4. Don't Test Implementation Details

```javascript
// ❌ Bad - testing internal state
expect(component.state.isOpen).toBe(true);

// ✅ Good - testing visible behavior
expect(screen.getByRole('dialog')).toBeVisible();
```

---

### 5. Mock External Dependencies

```javascript
// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: 'test' }),
  })
);

// Mock timers
vi.useFakeTimers();
vi.advanceTimersByTime(1000);
vi.useRealTimers();

// Mock dates
vi.setSystemTime(new Date('2025-01-15'));
```

---

## Next Steps

1. **Start with utilities**: Write tests for `dataFormatters.js` and `calculations.js`
2. **Test hooks**: Write tests for `useChartData.js` and `useStyleSettings.js`
3. **Integration tests**: Test admin default loading flow
4. **Run coverage**: `npm run test:coverage` and identify gaps
5. **CI Integration**: Add `npm run test:run` to your CI pipeline

---

**Last Updated**: 2025-01-18
**Maintainer**: Matthew (Find & Tell)
**Status**: Production-Ready Testing Infrastructure
