# Example Charts Guide

This guide explains how to create, save, and manage example charts for the production gallery.

## Overview

Example charts are pre-styled, production-ready charts that users can browse in the Gallery and load with one click. Each example demonstrates best practices for chart design and showcases different use cases.

---

## Folder Structure

```
/example-charts/
  /bar-horizontal/
    modern-sales-dashboard.json
    modern-sales-dashboard.svg
    regional-performance.json
    regional-performance.svg
  /bar-vertical/
    product-comparison.json
    product-comparison.svg
  /bar-grouped-horizontal/
    quarterly-metrics.json
    quarterly-metrics.svg
  /bar-grouped-vertical/
    team-performance.json
    team-performance.svg
  /bar-stacked-horizontal/
    revenue-breakdown.json
    revenue-breakdown.svg
  /bar-stacked-vertical/
    market-share.json
    market-share.svg
  /line/
    monthly-trends.json
    monthly-trends.svg
  /area/
    cumulative-growth.json
    cumulative-growth.svg
  /area-stacked/
    stacked-revenue.json
    stacked-revenue.svg
  /slope/
    period-comparison.json
    period-comparison.svg
  /funnel/
    conversion-funnel.json
    conversion-funnel.svg
```

---

## Naming Convention

### File Names
- **Format**: `descriptive-use-case-name.json` and `descriptive-use-case-name.svg`
- **Style**: Kebab-case (lowercase with hyphens)
- **Length**: 2-4 words maximum
- **Descriptive**: Should indicate the use case or data type

### Good Examples:
- `modern-sales-dashboard.json`
- `regional-performance.json`
- `quarterly-revenue.json`
- `customer-acquisition.json`
- `monthly-trends.json`

### Bad Examples:
- ❌ `chart1.json` (not descriptive)
- ❌ `BarChart_Sales_Data.json` (wrong case style)
- ❌ `my-really-long-descriptive-chart-name-for-sales.json` (too long)

---

## Chart Types to Create

Create at least 2-3 examples for each chart type:

### Bar Charts
1. **bar-horizontal**: Horizontal bar charts (e.g., product rankings, regional sales)
2. **bar-vertical**: Vertical bar charts (e.g., monthly revenue, category comparison)
3. **bar-grouped-horizontal**: Grouped horizontal bars (e.g., year-over-year comparison)
4. **bar-grouped-vertical**: Grouped vertical bars (e.g., quarterly metrics by region)
5. **bar-stacked-horizontal**: Stacked horizontal bars (e.g., revenue breakdown by source)
6. **bar-stacked-vertical**: Stacked vertical bars (e.g., market share over time)

### Line/Area Charts
7. **line**: Line charts (e.g., monthly trends, daily metrics)
8. **area**: Area charts (e.g., cumulative totals, volume over time)
9. **area-stacked**: Stacked area charts (e.g., traffic sources over time)

### Other Charts
10. **slope**: Slope charts (e.g., before/after comparison)
11. **funnel**: Funnel charts (e.g., conversion funnel, sales pipeline)

---

## How to Create Example Charts

### Step 1: Design Your Chart
1. Open the Chart Editor at http://localhost:5175
2. Select the chart type you want to create an example for
3. Load or create sample data that represents a realistic use case
4. Style the chart with production-ready settings:
   - Professional titles and subtitles
   - Appropriate colors (test in both light and dark mode)
   - Proper axis labels and formatting
   - Clean, readable fonts
   - Consider emphasis features if relevant

### Step 2: Save the Chart JSON
1. Click the **"Save Chart"** button in the chart editor
2. The chart will be downloaded as a `.json` file
3. Rename the file following the naming convention
4. Move the file to the appropriate chart type folder in `/example-charts/`

**Example JSON Structure:**
```json
{
  "chartType": "bar-horizontal",
  "metadata": {
    "title": "Modern Sales Dashboard",
    "description": "A clean, modern bar chart showing product sales by region",
    "tags": ["sales", "regional", "business"],
    "createdDate": "2025-01-13",
    "author": "FindandTell"
  },
  "data": { ... },
  "styleSettings": { ... }
}
```

### Step 3: Create the Thumbnail SVG
You have two options:

#### Option A: Use Capture Snapshot (PNG → Convert to SVG)
1. Click **"Capture Snapshot"** in the chart editor
2. The chart will be downloaded as a PNG
3. Use an online converter or design tool to convert PNG → SVG
4. Save the SVG with the same name as the JSON file

#### Option B: Manual SVG Export (Preferred)
1. Open browser DevTools (F12)
2. Find the chart's `<svg>` element in the DOM
3. Right-click → Copy → Copy element
4. Paste into a text editor
5. Save as `.svg` file with proper formatting
6. Ensure the SVG has appropriate dimensions (e.g., 800x600)

#### Option C: Auto-Generate (Future Enhancement)
We can add an "Export SVG" button to the chart editor that automatically generates the thumbnail.

### Step 4: Verify the Files
Ensure both files are in the correct folder:
```
/example-charts/bar-horizontal/
  modern-sales-dashboard.json ✓
  modern-sales-dashboard.svg ✓
```

---

## SVG Thumbnail Requirements

### Dimensions
- **Recommended**: 800px × 600px (4:3 ratio)
- **Minimum**: 400px × 300px
- **Maximum**: 1200px × 900px

### Quality Guidelines
- Clean, professional styling
- Test visibility at thumbnail size (200px × 150px)
- Ensure text is readable when scaled down
- Use appropriate contrast for both light/dark mode

### SVG Best Practices
- Include `viewBox` attribute for proper scaling
- Embed fonts if using custom typography
- Optimize file size (remove unnecessary elements)
- Test rendering in different browsers

---

## Metadata Standards

Each chart JSON should include metadata for gallery display:

```json
{
  "metadata": {
    "title": "Chart Title",
    "description": "Brief description of what this chart shows (1-2 sentences)",
    "tags": ["industry", "use-case", "style"],
    "createdDate": "2025-01-13",
    "updatedDate": "2025-01-13",
    "author": "FindandTell",
    "difficulty": "beginner|intermediate|advanced",
    "featured": false
  }
}
```

### Tag Categories:
- **Industry**: sales, marketing, finance, healthcare, education, retail
- **Use Case**: dashboard, report, presentation, analytics
- **Style**: modern, minimal, colorful, professional, dark-mode
- **Data Type**: revenue, growth, comparison, trends, breakdown

---

## Gallery Integration

### How Charts Are Loaded
1. User opens the Gallery page
2. Gallery scans `/example-charts/` folder structure
3. Displays thumbnail grid with titles and descriptions
4. User clicks a thumbnail
5. App loads the JSON file and applies all settings
6. Chart renders with the example data and styles

### Gallery Features (To Be Implemented)
- **Filter by chart type** (dropdown or tabs)
- **Search by keywords** (searches titles, descriptions, tags)
- **Sort options** (newest, popular, alphabetical)
- **Preview on hover** (larger thumbnail preview)
- **"Use This Chart" button** (loads into editor)
- **Light/Dark mode toggle** (show thumbnails in both themes)

---

## Quality Checklist

Before adding a chart to the gallery, ensure:

- [ ] Chart has a clear, professional title
- [ ] Data represents a realistic use case
- [ ] Chart is styled appropriately for production use
- [ ] Colors are accessible and work in both light/dark modes
- [ ] Axis labels are clear and properly formatted
- [ ] Text is readable at all sizes
- [ ] JSON file follows naming convention
- [ ] SVG thumbnail is properly sized and optimized
- [ ] Metadata is complete and accurate
- [ ] Files are in the correct folder
- [ ] Chart loads correctly when imported

---

## Updating Example Charts

### When to Update
- Fixing styling issues
- Updating data to reflect current trends
- Improving chart readability
- Adding new features (e.g., emphasis brackets)
- Responding to user feedback

### How to Update
1. Load the existing chart JSON in the editor
2. Make your changes
3. Save the updated JSON with the same filename (overwrites old version)
4. Update the `updatedDate` in metadata
5. If significant changes, create new thumbnail SVG
6. Commit changes to the repository

### Version Control
- All example charts are tracked in Git
- Include meaningful commit messages (e.g., "Update sales-dashboard chart with Q1 2025 data")
- Tag major releases (e.g., `v1.0-examples`)

---

## Best Practices

### Data Guidelines
1. **Realistic**: Use data that represents real-world scenarios
2. **Clean**: No placeholder text like "Lorem ipsum" or "Test data"
3. **Appropriate Scale**: Values should be realistic for the use case
4. **Variety**: Show different data patterns (growth, decline, comparison)

### Styling Guidelines
1. **Professional**: Clean, polished, production-ready
2. **Accessible**: High contrast, readable fonts, clear labels
3. **Consistent**: Follow design system colors and typography
4. **Theme-Aware**: Test in both light and dark modes
5. **Minimal**: Don't over-style; keep it clean and focused

### Naming Guidelines
1. **Descriptive**: Name should indicate the use case
2. **Unique**: No duplicate names across chart types
3. **Professional**: Business-appropriate naming (no slang)
4. **Searchable**: Include relevant keywords in filename

---

## File Size Limits

- **JSON files**: Max 500KB (most will be <50KB)
- **SVG files**: Max 200KB (optimize to <50KB if possible)
- **Total gallery size**: Keep under 50MB for fast loading

If files exceed these limits, optimize:
- Reduce data points (aggregate if necessary)
- Simplify SVG paths
- Remove unnecessary styling from SVG
- Compress JSON (remove whitespace)

---

## Testing Checklist

Before publishing example charts:

### Functional Testing
- [ ] Chart loads correctly from JSON
- [ ] All data displays properly
- [ ] Styles are applied correctly
- [ ] Interactive features work (if applicable)
- [ ] Emphasis/brackets render correctly (if used)

### Visual Testing
- [ ] Test in Light mode
- [ ] Test in Dark mode
- [ ] Test at different screen sizes
- [ ] Verify thumbnail quality
- [ ] Check text readability
- [ ] Ensure proper spacing and alignment

### Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## Future Enhancements

### Planned Features
1. **Auto-Generate SVG Thumbnails**: Add "Export as SVG" button to chart editor
2. **Gallery Search**: Full-text search across titles, descriptions, and tags
3. **User Ratings**: Allow users to rate example charts
4. **Usage Analytics**: Track which examples are most popular
5. **Copy & Customize**: One-click duplicate and edit
6. **Collections**: Curated sets of related charts
7. **Import from URL**: Load example charts by sharing URL

### Automation Scripts (Future)
- Script to validate all JSON files
- Script to generate missing thumbnails
- Script to optimize SVG file sizes
- Script to create gallery index/manifest

---

## Quick Reference

### Commands
```bash
# Navigate to example charts folder
cd example-charts

# List all charts by type
ls -R

# Validate JSON format
npx jsonlint modern-sales-dashboard.json

# Optimize SVG
npx svgo modern-sales-dashboard.svg
```

### Folder Structure Quick Copy
```bash
mkdir -p example-charts/{bar-horizontal,bar-vertical,bar-grouped-horizontal,bar-grouped-vertical,bar-stacked-horizontal,bar-stacked-vertical,line,area,area-stacked,slope,funnel}
```

---

## Support & Questions

- **Documentation Issues**: Open an issue on GitHub
- **Chart Suggestions**: Submit via feedback form
- **Technical Questions**: Contact development team
- **Bug Reports**: Use GitHub issue tracker

---

## Changelog

### v1.0 (2025-01-13)
- Initial guide created
- Folder structure defined
- Naming conventions established
- Quality guidelines documented
