# Implementation Checklists

**Step-by-step workflows for common development tasks**

Use these checklists to ensure you follow best practices and don't miss critical steps.

---

## Table of Contents

1. [Adding a New Chart Type](#adding-a-new-chart-type)
2. [Adding a New Feature](#adding-a-new-feature)
3. [Fixing a Bug](#fixing-a-bug)
4. [Adding a New Utility Function](#adding-a-new-utility-function)
5. [Adding a New Hook](#adding-a-new-hook)
6. [Creating a Sample Dataset](#creating-a-sample-dataset)
7. [Updating Documentation](#updating-documentation)
8. [Preparing for Production](#preparing-for-production)
9. [Code Review Checklist](#code-review-checklist)

---

## Adding a New Chart Type

Follow these steps to add a new chart type (e.g., Pie Chart, Sankey Diagram).

### Phase 1: Planning

- [ ] **Define chart requirements**
  - What type of data does it visualize?
  - What are the key features?
  - Does it support comparison mode?

- [ ] **Review similar charts**
  - Check existing charts in `src/charts/`
  - Identify reusable patterns

- [ ] **Choose chart category**
  - `flow` - Process flows (funnel, sankey)
  - `comparison` - Compare values (bar, slope)
  - `distribution` - Show proportions (pie, donut)
  - `trend` - Time series (line, area)

### Phase 2: Implementation

- [ ] **Create chart folder**
  ```bash
  mkdir src/charts/PieChart
  ```

- [ ] **Copy template files**
  ```bash
  cp -r src/charts/_ChartTemplate/* src/charts/PieChart/
  ```

- [ ] **Rename files**
  - `_ChartTemplate.jsx` → `PieChart.jsx`
  - `_chartTemplateDefaults.js` → `pieChartDefaults.js`
  - `_ChartTemplate.test.jsx` → `PieChart.test.jsx`

- [ ] **Update component name**
  - Replace all instances of `_ChartTemplate` with `PieChart`
  - Replace all instances of `_chartTemplate` with `pieChart`

- [ ] **Define default settings** (`pieChartDefaults.js`)
  - Chart-specific settings (donutMode, etc.)
  - Color settings
  - Typography settings
  - Layout settings
  - Demo dataset

- [ ] **Implement chart rendering** (`PieChart.jsx`)
  - Process data with `useMemo`
  - Create D3 scales
  - Render SVG elements
  - Add labels and legends
  - Handle interactions (optional)

- [ ] **Register chart** (`src/charts/registry.js`)
  ```javascript
  import PieChart from './PieChart/PieChart';
  import { ChartPieIcon } from '@heroicons/react/24/outline';

  export const chartRegistry = {
    // ... existing charts ...

    pie: {
      name: 'Pie Chart',
      component: PieChart,
      icon: ChartPieIcon,
      description: 'Show proportional relationships',
      supportsComparison: false,
      category: 'distribution',
      defaultSettings: {
        donutMode: false,
        showLabels: true,
      },
      defaultDataset: 'pieChartDefault',
    },
  };
  ```

### Phase 3: Testing

- [ ] **Write unit tests** (`PieChart.test.jsx`)
  - Rendering tests
  - Data handling tests
  - Settings tests
  - Edge cases (empty data, single item, etc.)

- [ ] **Run tests**
  ```bash
  npm test -- PieChart
  ```

- [ ] **Test manually**
  - Navigate to `/chart/pie`
  - Load sample data
  - Try different settings
  - Test CSV upload
  - Test export functionality

- [ ] **Test edge cases**
  - Empty data
  - Single data point
  - Large dataset (100+ items)
  - Negative values
  - Zero values

### Phase 4: Documentation

- [ ] **Create sample dataset** (see [Creating a Sample Dataset](#creating-a-sample-dataset))

- [ ] **Add to README.md**
  - Update chart types list
  - Add screenshot (optional)

- [ ] **Document in ADDING-CHARTS.md**
  - Add your chart as an example
  - Document any unique patterns

- [ ] **Update PROJECT_SUMMARY.md**
  - Add to "What Was Created" section

### Phase 5: Review & Deploy

- [ ] **Code review checklist**
  - [ ] All tests pass
  - [ ] No console.logs or debug code
  - [ ] TypeScript/JSDoc comments added
  - [ ] Follows code standards
  - [ ] Uses shared utilities
  - [ ] Documentation updated

- [ ] **Create pull request**
  - Fill out PR template
  - Link to any related issues
  - Add screenshots/GIFs

- [ ] **Address review feedback**

- [ ] **Merge and celebrate!** 🎉

**Estimated time:** 4-8 hours for basic chart, 1-2 days for complex visualization

See [ADDING-CHARTS.md](ADDING-CHARTS.md) for detailed guide.

---

## Adding a New Feature

For adding features to existing components or adding new shared functionality.

### Planning

- [ ] **Define feature scope**
  - What problem does it solve?
  - What are the requirements?
  - How will users interact with it?

- [ ] **Check for existing solutions**
  - Search codebase for similar features
  - Check if shared utilities exist
  - Review related issues/PRs

- [ ] **Design the API**
  - How will it be used?
  - What parameters does it need?
  - What does it return?

### Implementation

- [ ] **Create feature branch**
  ```bash
  git checkout -b feature/your-feature-name
  ```

- [ ] **Implement feature**
  - Follow existing patterns
  - Use shared utilities where possible
  - Add JSDoc comments

- [ ] **Update related components**
  - Ensure backwards compatibility
  - Update all consumers if breaking change

- [ ] **Add configuration (if needed)**
  - Add to default settings
  - Add to style settings hook
  - Add to control panel

### Testing

- [ ] **Write tests**
  - Unit tests for new functions
  - Integration tests for workflows
  - Test edge cases

- [ ] **Run full test suite**
  ```bash
  npm test
  npm run test:coverage
  ```

- [ ] **Manual testing**
  - Test in all relevant charts
  - Test with different data sets
  - Test edge cases

### Documentation

- [ ] **Update QUICKSTART.md** (if user-facing)
  - Add usage example
  - Update patterns section

- [ ] **Update ARCHITECTURE.md** (if architectural change)
  - Document new patterns
  - Update data flow diagrams

- [ ] **Add JSDoc comments**
  - Function purpose
  - Parameters
  - Return value
  - Examples

### Review & Merge

- [ ] **Self-review**
  - Check for console.logs
  - Verify all tests pass
  - Ensure documentation is complete

- [ ] **Create pull request**

- [ ] **Address feedback**

- [ ] **Merge**

---

## Fixing a Bug

### Reproduction

- [ ] **Reproduce the bug**
  - Follow steps to reproduce
  - Note exact error message
  - Identify which component/function

- [ ] **Create minimal test case**
  - Isolate the issue
  - Create failing test
  - Document expected vs actual behavior

### Investigation

- [ ] **Add debug logging**
  ```javascript
  console.log('Data:', data);
  console.log('Settings:', settings);
  console.log('Result:', result);
  ```

- [ ] **Check recent changes**
  ```bash
  git log --oneline -10
  git diff HEAD~5
  ```

- [ ] **Review related code**
  - Check dependencies
  - Look for similar patterns
  - Check PATTERNS.md for gotchas

### Fix

- [ ] **Create fix branch**
  ```bash
  git checkout -b fix/issue-description
  ```

- [ ] **Implement fix**
  - Minimal change to fix issue
  - Don't refactor while fixing
  - Add comments explaining why

- [ ] **Verify fix**
  - Test passes
  - Bug no longer reproduces
  - No new bugs introduced

### Testing

- [ ] **Add regression test**
  - Test should fail before fix
  - Test should pass after fix
  - Test should catch similar bugs in future

- [ ] **Run full test suite**
  ```bash
  npm test
  ```

- [ ] **Test manually**
  - Verify bug is fixed
  - Test related functionality
  - Check for side effects

### Documentation

- [ ] **Update TROUBLESHOOTING.md**
  - Add to relevant section
  - Include error message
  - Document solution

- [ ] **Update code comments**
  - Explain non-obvious fixes
  - Add links to issues if relevant

- [ ] **Update PATTERNS.md** (if pattern-related)
  - Document the gotcha
  - Add to anti-patterns if applicable

### Review & Merge

- [ ] **Create pull request**
  - Reference issue number
  - Explain root cause
  - Explain solution

- [ ] **Merge and close issue**

---

## Adding a New Utility Function

For adding shared helper functions in `src/shared/utils/`.

### Planning

- [ ] **Check if function already exists**
  - Search existing utilities
  - Check if lodash/d3 has it

- [ ] **Determine module**
  - `dataFormatters.js` - Number/percentage formatting
  - `calculations.js` - Mathematical operations
  - `colorUtils.js` - Color manipulation
  - `csvUtils.js` - CSV parsing/export
  - `exportHelpers.js` - Export functionality
  - Create new file if none fit

### Implementation

- [ ] **Write function**
  ```javascript
  /**
   * Description of what function does
   *
   * @param {Type} param - Parameter description
   * @returns {Type} - Return value description
   * @example
   * functionName(arg) // => result
   */
  export const functionName = (param) => {
    // Implementation
  };
  ```

- [ ] **Keep it pure** (if possible)
  - No side effects
  - Same input → same output
  - Easier to test

- [ ] **Add JSDoc comments**
  - Purpose
  - Parameters with types
  - Return value
  - Examples

### Testing

- [ ] **Write comprehensive tests**
  ```javascript
  describe('functionName', () => {
    it('should handle typical case', () => {
      expect(functionName(input)).toBe(expected);
    });

    it('should handle edge cases', () => {
      expect(functionName(null)).toBe(fallback);
      expect(functionName(0)).toBe(result);
    });
  });
  ```

- [ ] **Test edge cases**
  - null/undefined
  - Empty values
  - Negative numbers
  - Very large numbers
  - Invalid types

- [ ] **Achieve 90%+ coverage**
  ```bash
  npm run test:coverage -- dataFormatters
  ```

### Integration

- [ ] **Export from module**
  ```javascript
  export { functionName } from './utils/moduleName';
  ```

- [ ] **Update shared index** (if exists)

- [ ] **Use in components**
  - Replace inline logic with utility
  - Ensure consistent behavior

### Documentation

- [ ] **Add to QUICKSTART.md** (if commonly used)

- [ ] **Document in code**
  - Clear JSDoc comments
  - Usage examples

---

## Adding a New Hook

For creating custom React hooks in `src/shared/hooks/`.

### Planning

- [ ] **Define hook purpose**
  - What state does it manage?
  - What operations does it provide?
  - How will it be used?

- [ ] **Design API**
  - What does it return?
  - What parameters does it accept?
  - What are the dependencies?

### Implementation

- [ ] **Create hook file**
  ```javascript
  // src/shared/hooks/useYourHook.js
  import { useState, useCallback, useEffect } from 'react';

  export const useYourHook = (initialValue) => {
    const [state, setState] = useState(initialValue);

    const operation = useCallback(() => {
      // Logic
    }, [dependencies]);

    useEffect(() => {
      // Side effects
    }, [dependencies]);

    return {
      state,
      operation,
    };
  };
  ```

- [ ] **Use proper hooks patterns**
  - `useState` for state
  - `useCallback` for functions
  - `useMemo` for expensive computations
  - `useEffect` for side effects

- [ ] **Minimize dependencies**
  - Keep dependency arrays lean
  - Use refs for values that shouldn't trigger re-renders

### Testing

- [ ] **Write hook tests**
  ```javascript
  import { renderHook, act } from '@testing-library/react';

  describe('useYourHook', () => {
    it('should initialize with default value', () => {
      const { result } = renderHook(() => useYourHook(initialValue));
      expect(result.current.state).toBe(initialValue);
    });

    it('should update state', () => {
      const { result } = renderHook(() => useYourHook(initialValue));

      act(() => {
        result.current.operation(newValue);
      });

      expect(result.current.state).toBe(newValue);
    });
  });
  ```

- [ ] **Test async operations**
  ```javascript
  await act(async () => {
    await result.current.asyncOperation();
  });
  ```

- [ ] **Test cleanup**
  ```javascript
  const { unmount } = renderHook(() => useYourHook());
  unmount();
  // Verify cleanup occurred
  ```

### Documentation

- [ ] **Add JSDoc comments**
  ```javascript
  /**
   * Custom hook for managing ...
   *
   * @param {Type} param - Description
   * @returns {Object} Hook result
   * @returns {Type} result.state - Description
   * @returns {Function} result.operation - Description
   *
   * @example
   * const { state, operation } = useYourHook(initial);
   */
  ```

- [ ] **Add usage example in QUICKSTART.md**

- [ ] **Export from hooks index** (if exists)

---

## Creating a Sample Dataset

For adding new sample datasets in `src/shared/data/sampleDatasets.js`.

### Create Dataset

- [ ] **Define dataset structure**
  ```javascript
  export const sampleDatasets = {
    // ... existing datasets ...

    yourDatasetKey: {
      name: "Dataset Display Name",
      description: "Brief description",
      chartType: "pie", // or "bar", "line", etc.
      data: [
        { Category: 'Item 1', Value: 100 },
        { Category: 'Item 2', Value: 150 },
        // ... more data
      ],
      // Optional: Style preset
      stylePreset: "/Examples/your-style.json",
    },
  };
  ```

- [ ] **Use realistic data**
  - Representative of real-world use
  - Interesting patterns/trends
  - Good range of values

- [ ] **Add metadata**
  - Descriptive name
  - Clear description
  - Chart type
  - Style preset (optional)

### Register Dataset

- [ ] **Add to registry** (`sampleDatasets.js`)

- [ ] **Add to comparison list** (if applicable)
  ```javascript
  export const isComparisonDataset = (key) => {
    const comparisonKeys = [
      "ageComparison",
      "abTest",
      "yourDatasetKey", // Add here
    ];
    return comparisonKeys.includes(key);
  };
  ```

- [ ] **Update chart registry** (`src/charts/registry.js`)
  ```javascript
  defaultDataset: 'yourDatasetKey',
  ```

### Test Dataset

- [ ] **Load in chart**
  - Navigate to chart
  - Select dataset
  - Verify rendering

- [ ] **Test with multiple charts**
  - Ensure compatible with intended chart types

---

## Updating Documentation

When adding features, fixing bugs, or discovering patterns.

### Determine Which Docs to Update

**For new features:**
- [ ] README.md - If user-facing
- [ ] QUICKSTART.md - If commonly used
- [ ] ARCHITECTURE.md - If architectural change
- [ ] API-REFERENCE.md - If API change

**For bugs fixed:**
- [ ] TROUBLESHOOTING.md - Add issue + solution
- [ ] PATTERNS.md - If pattern-related

**For patterns discovered:**
- [ ] PATTERNS.md - Add pattern
- [ ] ADDING-CHARTS.md - If chart-related

### Update Process

- [ ] **Read existing docs first**
  - Understand current structure
  - Match existing tone/style

- [ ] **Add your content**
  - Be concise
  - Include code examples
  - Link to related docs

- [ ] **Update table of contents**

- [ ] **Add cross-references**
  - Link to related sections
  - Create navigation path

- [ ] **Verify all links work**

- [ ] **Check formatting**
  - Consistent markdown style
  - Code blocks properly formatted
  - Headings properly nested

---

## Preparing for Production

Before deploying to production.

### Code Quality

- [ ] **Remove debug code**
  - No console.logs (except error handling)
  - No commented code
  - No TODO comments

- [ ] **Run linter**
  ```bash
  npm run lint
  ```

- [ ] **Fix all warnings**

### Testing

- [ ] **Run full test suite**
  ```bash
  npm test
  npm run test:coverage
  ```

- [ ] **Achieve coverage targets**
  - Utilities: 90%+
  - Hooks: 80%+
  - Components: 70%+
  - Overall: 75%+

- [ ] **Test production build locally**
  ```bash
  npm run build
  npm run preview
  ```

- [ ] **Test in all browsers**
  - Chrome
  - Firefox
  - Safari
  - Edge

### Performance

- [ ] **Check bundle size**
  ```bash
  npm run build
  # Check dist/ folder size
  ```

- [ ] **Test with large datasets**
  - 100+ rows
  - Multiple periods
  - Complex calculations

- [ ] **Check for memory leaks**
  - Load/unload charts multiple times
  - Monitor memory usage
  - Check for cleanup

### Deployment

- [ ] **Update version** (`package.json`)

- [ ] **Update CHANGELOG** (if exists)

- [ ] **Create production build**
  ```bash
  npm run build
  ```

- [ ] **Test on staging environment**

- [ ] **Deploy to production**

- [ ] **Monitor for errors**
  - Check error logs
  - Monitor performance
  - Watch for user reports

---

## Code Review Checklist

For reviewing pull requests.

### Code Quality

- [ ] **Follows code standards**
  - Consistent formatting
  - Proper naming conventions
  - Clear variable names

- [ ] **No debug code**
  - No console.logs
  - No commented code
  - No TODOs

- [ ] **Proper error handling**
  - Try/catch where needed
  - User-friendly error messages
  - Errors logged appropriately

- [ ] **Uses shared utilities**
  - No duplicate code
  - Leverages existing helpers
  - Follows DRY principle

### React Patterns

- [ ] **Hooks used correctly**
  - All dependencies included
  - No unnecessary re-renders
  - Cleanup implemented where needed

- [ ] **Components properly structured**
  - Single responsibility
  - Reusable where appropriate
  - Props properly documented

- [ ] **D3 integration correct**
  - Color schemes imported directly
  - Previous render cleared
  - All dependencies in useEffect

### Testing

- [ ] **Tests included**
  - Happy path tested
  - Edge cases covered
  - Error conditions tested

- [ ] **Tests pass**
  ```bash
  npm test
  ```

- [ ] **Coverage maintained**
  ```bash
  npm run test:coverage
  ```

### Documentation

- [ ] **JSDoc comments added**

- [ ] **Documentation updated**
  - README.md (if needed)
  - QUICKSTART.md (if user-facing)
  - Relevant guides updated

- [ ] **Examples provided**
  - Clear usage examples
  - Edge cases documented

### Performance

- [ ] **No performance regressions**
  - useMemo for expensive calculations
  - Debouncing for rapid updates
  - No unnecessary re-renders

- [ ] **Bundle size reasonable**

### Security

- [ ] **No hardcoded secrets**
  - No API keys
  - No credentials
  - No sensitive data

- [ ] **Input validation**
  - CSV validation
  - User input sanitized
  - Safe from XSS

---

## Quick Reference

### Common Commands

```bash
# Development
npm run dev              # Start dev server
npm test                 # Run tests in watch mode
npm run test:ui          # Open Vitest UI

# Testing
npm run test:run         # Run tests once
npm run test:coverage    # Generate coverage report
npm test -- MyComponent  # Test specific file

# Build
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run linter

# Git
git checkout -b feature/name    # Create feature branch
git add .                       # Stage all changes
git commit -m "feat: message"   # Commit with message
git push origin branch-name     # Push to remote
```

### File Locations

- Charts: `src/charts/`
- Hooks: `src/shared/hooks/`
- Utils: `src/shared/utils/`
- Tests: Co-located with source files
- Docs: Root directory (*.md files)

### Need Help?

- [QUICKSTART.md](QUICKSTART.md) - Quick examples
- [ARCHITECTURE.md](ARCHITECTURE.md) - System design
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues
- [PATTERNS.md](PATTERNS.md) - Best practices

---

**Last Updated:** 2025-01-18
**Maintainer:** Project Team
**Status:** ✅ Complete Implementation Guide
