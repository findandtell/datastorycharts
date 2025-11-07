# Test Chart Files for Save/Load Feature

This directory contains test chart files to verify the Save/Load functionality works correctly across all chart types.

## Test Files

### 1. **funnel-chart-example.json**
- **Chart Type**: Funnel
- **Data**: E-commerce conversion funnel (5 stages, 3 periods)
- **Features**:
  - Standard funnel with gradient colors
  - Inside labels with dropoff percentages
  - Clean, professional styling

### 2. **bar-chart-example.json**
- **Chart Type**: Bar
- **Data**: Regional sales performance (4 regions, 6 months)
- **Features**:
  - Emphasized bar for "Jun" period
  - Multi-region comparison
  - Standard bar chart layout

### 3. **line-chart-example.json**
- **Chart Type**: Line
- **Data**: Website traffic metrics (14 days, 3 metrics)
- **Features**:
  - Multiple metrics: Visitors, Page Views, Conversions
  - Emphasized "Conversions" line
  - Smooth lines with points
  - Daily granularity data

### 4. **slope-chart-example.json**
- **Chart Type**: Slope
- **Data**: Market share change (4 products, 2 years)
- **Features**:
  - Year-over-year comparison (2023 vs 2024)
  - Emphasized "Product A" line
  - Change-based coloring (increase/decrease)
  - Inside value labels

### 5. **google-sheets-example.json** ⭐
- **Chart Type**: Bar
- **Data**: Marketing channel performance (5 channels, 4 weeks)
- **Special Features**:
  - ✅ **Google Sheets URL saved** (demonstrates live data integration)
  - ✅ **Hidden period** (Week 1 is hidden)
  - ✅ **Emphasized bar** (Week 4)
  - Light gray background (#f9fafb)
  - Bottom legend placement

## How to Test

### Testing Import Functionality

1. **Navigate to any chart type**:
   - Go to http://localhost:5174
   - Select any chart type from the gallery

2. **Import a test file**:
   - Click the **Import** button (top right, left of Export)
   - Select one of the JSON files from this directory
   - Confirm the replacement when prompted

3. **Verify the import**:
   - ✅ Chart type should match the file (may navigate to correct chart type)
   - ✅ Data should load correctly
   - ✅ All styling should be applied (title, colors, fonts, etc.)
   - ✅ Hidden periods should be hidden
   - ✅ Emphasized elements should be highlighted
   - ✅ Google Sheets URL should be preserved (check Data tab)

### Testing Save Functionality

1. **Create or modify a chart**:
   - Load sample data or create your own
   - Apply custom styling
   - Hide some periods/columns
   - Emphasize specific bars/lines

2. **Save the chart**:
   - Click **Save Chart** button (green button next to Capture Snapshot)
   - File should download automatically with timestamped name

3. **Verify the saved file**:
   - Open the JSON file in a text editor
   - Check that it contains:
     - ✅ `version: "1.0"`
     - ✅ `chartType` matches your chart
     - ✅ `data.csv` contains your CSV data
     - ✅ `state.hiddenPeriods` contains hidden items
     - ✅ `style` contains all your customizations

### Testing Snapshot Gallery Integration

1. **Capture snapshots**:
   - Create a chart with custom styling
   - Click **Capture Snapshot**
   - Make changes and capture another snapshot

2. **Save from gallery**:
   - Scroll down to the Snapshot Gallery
   - Click **Save Chart** button on any snapshot card
   - File should download with the snapshot's state

3. **Verify**:
   - Import the saved file
   - Chart should restore to exact snapshot state

## Cross-Chart Type Testing

Test importing files between different chart types:

1. **Import bar chart into funnel chart page**:
   - Navigate to `/chart/funnel`
   - Import `bar-chart-example.json`
   - Should show confirmation dialog
   - Should navigate to `/chart/bar` automatically

2. **Verify navigation**:
   - Chart type should switch correctly
   - All data and styling should load
   - No errors in console

## Google Sheets Integration Test

1. **Import google-sheets-example.json**:
   - Navigate to any chart type
   - Import the Google Sheets example file

2. **Verify Google Sheets data**:
   - Switch to Data tab
   - Check "Load from Google Sheets" section
   - URL should be pre-filled: `https://docs.google.com/spreadsheets/d/1234567890/edit#gid=0`
   - Note: This is a dummy URL for testing

3. **Verify hidden periods**:
   - "Week 1" should be hidden
   - Only Weeks 2, 3, 4 should be visible in chart

4. **Verify emphasis**:
   - "Week 4" bars should be emphasized (saturated)

## Expected File Structure

All test files follow this structure:

```json
{
  "version": "1.0",
  "chartType": "funnel|bar|line|slope",
  "timestamp": "ISO 8601 timestamp",
  "name": "Human-readable chart name",

  "data": {
    "csv": "CSV data as string",
    "source": "sample|csv-upload|csv-paste|google-sheets",
    "googleSheetsUrl": "URL or null",
    "periodNames": ["array", "of", "periods"],
    "stageCount": 0,
    "periodCount": 0,
    "isComparisonMode": false
  },

  "state": {
    "hiddenPeriods": ["hidden", "items"],
    "emphasizedBars": ["emphasized", "bars"],
    "emphasizedLines": ["emphasized", "lines"],
    "selectedMetrics": ["selected", "metrics"]
  },

  "style": {
    // 100+ style properties
    "title": "Chart title",
    "subtitle": "Subtitle",
    "fontFamily": "Inter",
    // ... all styling settings
  }
}
```

## Troubleshooting

### Import fails with validation error
- Check that the JSON file has a valid `version` field
- Verify `chartType` is one of: funnel, bar, line, slope
- Ensure `data.csv` is present and not empty

### Chart doesn't look right after import
- Check console for errors
- Verify all style properties are being applied
- Some properties may be chart-type specific

### Google Sheets URL not preserved
- Check that `data.googleSheetsUrl` is present in JSON
- Verify it's not set to `null`
- Check Data tab after import to see if URL is loaded

### Hidden periods not working
- Verify `state.hiddenPeriods` is an array in JSON
- Check that period names match exactly (case-sensitive)
- Look for the period in the Data tab's hide/show section

## Success Criteria

A successful Save/Load implementation should:

- ✅ Save complete chart state to JSON file
- ✅ Load chart state from JSON file
- ✅ Preserve all data (including raw CSV)
- ✅ Restore all styling (100+ properties)
- ✅ Maintain hidden periods
- ✅ Restore emphasized elements
- ✅ Handle Google Sheets URLs
- ✅ Track data source correctly
- ✅ Support cross-chart-type imports with navigation
- ✅ Work from Snapshot Gallery
- ✅ Generate proper filenames with timestamps
- ✅ Show validation errors for invalid files

---

**Note**: These are test files created for development. In production, files will be generated by the Save Chart feature with real user data.
