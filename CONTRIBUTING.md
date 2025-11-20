# Contributing to Funnel Viz

Welcome! This guide will help you get started contributing to the project.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Code Standards](#code-standards)
4. [Testing Requirements](#testing-requirements)
5. [Documentation](#documentation)
6. [Pull Request Process](#pull-request-process)
7. [Where to Find Information](#where-to-find-information)
8. [Getting Help](#getting-help)

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Git** for version control
- **Code editor** (VS Code recommended)
- **Basic knowledge** of React, D3.js, and hooks

### Initial Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/funnel-viz-refactored.git
cd funnel-viz-refactored

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Run tests
npm test

# 5. Open in browser
# Navigate to http://localhost:5173
```

### Project Structure Overview

```
funnel-viz-refactored/
├── src/
│   ├── charts/             # Chart implementations
│   │   ├── _ChartTemplate/ # Template for new charts
│   │   ├── FunnelChart/
│   │   ├── BarChart/
│   │   ├── LineChart/
│   │   └── SlopeChart/
│   ├── shared/
│   │   ├── hooks/          # React hooks (useChartData, etc.)
│   │   ├── utils/          # Utility functions
│   │   ├── data/           # Sample datasets
│   │   └── design-system/  # Theme and colors
│   └── test/               # Test files
│       ├── templates/      # Test templates
│       └── integration/    # Integration tests
├── docs/                   # Documentation
└── public/                 # Static assets
```

**Read First:**
- [README.md](README.md) - Project overview
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture (essential reading!)
- [PATTERNS.md](PATTERNS.md) - Production-proven patterns

---

## Development Workflow

### 1. Pick a Task

- Check GitHub Issues for open tasks
- Look for `good-first-issue` or `help-wanted` labels
- Ask maintainers if unsure where to start

### 2. Create a Branch

```bash
# Feature branch
git checkout -b feature/your-feature-name

# Bug fix branch
git checkout -b fix/issue-description

# Documentation branch
git checkout -b docs/what-youre-documenting
```

### 3. Make Changes

Follow these principles:

✅ **DO:**
- Write clean, readable code
- Add tests for new features
- Update documentation
- Follow existing patterns
- Use shared utilities
- Add comments for complex logic

❌ **DON'T:**
- Commit commented-out code
- Leave console.logs in production code
- Create duplicate utilities
- Skip tests
- Ignore linter warnings

### 4. Test Your Changes

```bash
# Run all tests
npm test

# Run tests in UI mode
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run linter
npm run lint
```

### 5. Commit Your Changes

We use **conventional commits**:

```bash
# Feature
git commit -m "feat: add pie chart component"

# Bug fix
git commit -m "fix: correct bar chart color scaling"

# Documentation
git commit -m "docs: update ADDING-CHARTS.md with examples"

# Test
git commit -m "test: add integration tests for CSV loading"

# Refactor
git commit -m "refactor: extract color utilities to shared module"
```

**Commit message format:**
```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `test` - Adding or updating tests
- `refactor` - Code refactoring
- `style` - Code style changes (formatting, etc.)
- `perf` - Performance improvements
- `chore` - Build process, dependencies, etc.

### 6. Push and Create PR

```bash
# Push your branch
git push origin your-branch-name

# Create pull request on GitHub
# Fill out the PR template
```

---

## Code Standards

### React Patterns

**Use functional components with hooks:**
```javascript
const MyComponent = ({ data, settings }) => {
  const [state, setState] = useState(initialValue);
  const processedData = useMemo(() => /* ... */, [data]);

  useEffect(() => {
    // Side effects
  }, [dependencies]);

  return <div>...</div>;
};
```

**Extract complex logic to custom hooks:**
```javascript
const useChartRendering = (data, settings) => {
  // Complex rendering logic
  return { svg, scales, helpers };
};
```

### D3 Integration

**CRITICAL Pattern - Import color schemes directly:**
```javascript
// ❌ WRONG - Gets tree-shaken
import * as d3 from 'd3';
const colors = d3.schemeTableau10;

// ✅ CORRECT
import { schemeTableau10 } from 'd3-scale-chromatic';
const colors = schemeTableau10;
```

**Always clear previous render:**
```javascript
useEffect(() => {
  const svg = d3.select(svgRef.current);
  svg.selectAll('*').remove(); // CRITICAL

  // Render logic
}, [dependencies]);
```

**Include ALL dependencies:**
```javascript
useEffect(() => {
  // Rendering logic
}, [
  data,           // ✅ Include data
  styleSettings,  // ✅ Include all settings used
  width,          // ✅ Include dimensions
  height,
  // ALL variables used inside effect
]);
```

See [PATTERNS.md](PATTERNS.md) for complete D3 + React patterns.

### File Organization

**Co-locate related files:**
```
BarChart/
├── BarChart.jsx           # Component
├── barChartDefaults.js    # Defaults
└── BarChart.test.jsx      # Tests
```

**Use clear, descriptive names:**
- Components: `PascalCase` (e.g., `FunnelChart.jsx`)
- Utilities: `camelCase` (e.g., `colorUtils.js`)
- Hooks: `useCamelCase` (e.g., `useChartData.js`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_COLORS`)

### Code Style

**Imports:**
```javascript
// React first
import { useState, useEffect } from 'react';

// Third-party libraries
import * as d3 from 'd3';
import { schemeTableau10 } from 'd3-scale-chromatic';

// Internal imports
import { useChartData } from '@shared/hooks/useChartData';
import { formatNumber } from '@shared/utils/dataFormatters';
```

**Destructuring:**
```javascript
// Props
const MyComponent = ({ data, settings, onUpdate }) => {
  const { width, height, colors } = settings;
  // ...
};
```

**Comments:**
```javascript
// Good: Explain WHY
// Use ref to avoid infinite re-renders from D3 updates
const svgRef = useRef(null);

// Bad: Explain WHAT (code is self-explanatory)
// Create a ref
const svgRef = useRef(null);
```

---

## Testing Requirements

### Test Coverage Requirements

- **Utilities**: 90%+ coverage
- **Hooks**: 80%+ coverage
- **Components**: 70%+ coverage
- **Overall**: 75%+ coverage

### What to Test

**Unit Tests (utilities, hooks):**
- ✅ Happy path (typical use cases)
- ✅ Edge cases (empty data, null, undefined)
- ✅ Error conditions
- ✅ Boundary values

**Integration Tests (workflows):**
- ✅ Data loading flows
- ✅ Chart rendering
- ✅ Settings updates
- ✅ User interactions

**Example test:**
```javascript
describe('formatCompactNumber', () => {
  it('should format thousands with K', () => {
    expect(formatCompactNumber(1000)).toBe('1.0K');
    expect(formatCompactNumber(1500)).toBe('1.5K');
  });

  it('should handle edge cases', () => {
    expect(formatCompactNumber(0)).toBe('0');
    expect(formatCompactNumber(null)).toBe('0');
  });
});
```

See [TESTING.md](TESTING.md) for complete testing guide.

---

## Documentation

### When to Update Documentation

Update documentation when you:
- Add a new feature
- Change an API
- Fix a bug (add to troubleshooting)
- Learn something non-obvious
- Create a new pattern

### Documentation Files

- **README.md** - Project overview, quick start
- **ARCHITECTURE.md** - System architecture, data flow
- **PATTERNS.md** - Patterns, anti-patterns, gotchas
- **ADDING-CHARTS.md** - How to add new chart types
- **TESTING.md** - Testing guide
- **CONTRIBUTING.md** - This file

### Documentation Standards

✅ **DO:**
- Use clear, concise language
- Provide code examples
- Link to related docs
- Update table of contents
- Include screenshots for UI changes

❌ **DON'T:**
- Assume prior knowledge
- Use jargon without explanation
- Leave outdated information
- Create duplicate docs

---

## Pull Request Process

### Before Submitting

**Checklist:**
- [ ] Tests pass (`npm test`)
- [ ] Linter passes (`npm run lint`)
- [ ] Code is documented
- [ ] Tests are added/updated
- [ ] Documentation is updated
- [ ] No console.logs or debug code
- [ ] Branch is up to date with main

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How to Test
1. Step 1
2. Step 2
3. Expected result

## Screenshots (if applicable)
[Add screenshots]

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Follows code standards
- [ ] Tested locally
```

### Review Process

1. **Automated checks** run (tests, linting)
2. **Maintainer review** (1-2 days typically)
3. **Address feedback** if needed
4. **Approval** and merge

### After Merge

- Delete your branch
- Celebrate! 🎉
- Look for next contribution

---

## Where to Find Information

### Documentation Map

**Getting Started:**
- [README.md](README.md) - Start here
- [QUICKSTART.md](QUICKSTART.md) - Quick examples

**Architecture & Patterns:**
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture ⭐ **Read this!**
- [PATTERNS.md](PATTERNS.md) - Production patterns ⭐ **Important!**
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Project history

**Development Guides:**
- [ADDING-CHARTS.md](ADDING-CHARTS.md) - Add new chart types
- [TESTING.md](TESTING.md) - Testing guide
- [CONTRIBUTING.md](CONTRIBUTING.md) - This file

**Code Organization:**
- `src/charts/_ChartTemplate/` - Chart template
- `src/test/templates/` - Test templates
- `src/shared/` - Shared utilities and hooks

### Learning Path

**For New Contributors:**
1. Read [README.md](README.md) (5 min)
2. Read [ARCHITECTURE.md](ARCHITECTURE.md) (30 min) ⭐
3. Review [PATTERNS.md](PATTERNS.md) (30 min) ⭐
4. Explore codebase (1 hour)
5. Try adding a simple feature
6. Review [TESTING.md](TESTING.md) (20 min)

**For Chart Development:**
1. Review existing charts (`src/charts/`)
2. Read [ADDING-CHARTS.md](ADDING-CHARTS.md)
3. Copy `_ChartTemplate` folder
4. Follow the guide step-by-step
5. Test thoroughly

---

## Getting Help

### Where to Ask

1. **GitHub Discussions** - General questions, ideas
2. **GitHub Issues** - Bug reports, feature requests
3. **Code Comments** - Implementation questions
4. **Documentation** - Check guides first

### How to Ask

**Good question:**
```
I'm trying to add a pie chart and getting this error:
[error message]

I've tried:
- Importing color scheme directly
- Adding dependency to useEffect

Code: [link to branch]
```

**Less helpful:**
```
Pie chart doesn't work, help!
```

### Common Questions

**Q: Where do I start?**
A: Check "good first issue" label on GitHub Issues, or read ARCHITECTURE.md to understand the system.

**Q: How do I add a new chart?**
A: Follow [ADDING-CHARTS.md](ADDING-CHARTS.md), copy the template from `src/charts/_ChartTemplate/`.

**Q: Tests are failing, what do I do?**
A: Run `npm test -- --reporter=verbose` for detailed output. Check [TESTING.md](TESTING.md) for debugging tips.

**Q: My D3 chart doesn't update when data changes?**
A: Make sure data is in useEffect dependency array. See [PATTERNS.md#d3-react-integration](PATTERNS.md).

**Q: Colors are undefined in production?**
A: Import color schemes directly from `d3-scale-chromatic`. See [PATTERNS.md#gotcha-vite-tree-shaking-d3-schemes](PATTERNS.md).

---

## Code of Conduct

### Our Standards

✅ **We value:**
- Respectful communication
- Constructive feedback
- Collaboration
- Learning and teaching
- Diverse perspectives

❌ **Not acceptable:**
- Harassment or discrimination
- Trolling or insulting comments
- Publishing others' private information
- Unprofessional conduct

### Reporting

If you experience or witness unacceptable behavior:
1. Contact maintainers directly
2. Report via GitHub
3. We will investigate and take appropriate action

---

## Recognition

Contributors are recognized in:
- **Git commit history** - Your commits are永久 preserved
- **Release notes** - Major contributions mentioned
- **README.md** - Contributors section
- **GitHub insights** - Contribution graphs

---

## Additional Resources

### External Resources

- [React Documentation](https://react.dev/)
- [D3.js Documentation](https://d3js.org/)
- [Vitest Documentation](https://vitest.dev/)
- [Conventional Commits](https://www.conventionalcommits.org/)

### Internal Resources

- [Architecture Diagrams](ARCHITECTURE.md#data-flow)
- [Pattern Library](PATTERNS.md)
- [Test Examples](src/test/)
- [Chart Examples](src/charts/)

---

## Thank You!

Thank you for contributing to Funnel Viz! Your contributions help make data visualization more accessible and powerful.

**Questions?** Don't hesitate to ask in GitHub Discussions or Issues.

**Happy coding!** 🎉📊

---

**Last Updated:** 2025-01-18
**Maintainers:** Project Team
**Status:** ✅ Ready for Contributors
