# Test Data Sets for Beta Testing

This folder contains example CSV files for testing all chart types in the application.

## Available Test Datasets

### Bar Charts
- **bar-simple-revenue.csv** - Single metric by region (6 categories)
  - Use for: Horizontal Bar, Vertical Bar charts
  - Data: Revenue by geographic region

- **bar-grouped-sales.csv** - Multiple metrics by category (5 categories, 4 metrics)
  - Use for: Grouped Bar charts (Horizontal/Vertical)
  - Data: Quarterly sales by region

- **bar-stacked-channels.csv** - Multiple metrics to stack (6 months, 5 channels)
  - Use for: Stacked Bar charts (Horizontal/Vertical)
  - Data: Monthly revenue by marketing channel

### Line & Area Charts
- **line-monthly-growth.csv** - Monthly time series (12 months, 3 metrics)
  - Use for: Line Chart, Area Chart
  - Data: Revenue, Users, Orders over 1 year

- **line-daily-traffic.csv** - Daily time series (13 days, 3 metrics)
  - Use for: Line Chart showing daily patterns
  - Data: Website traffic metrics

- **area-stacked-market-share.csv** - Quarterly stacked data (4 quarters, 4 products)
  - Use for: Area Stacked Chart
  - Data: Product revenue showing market share over time

### Slope Chart
- **slope-before-after.csv** - Two-period comparison (5 products)
  - Use for: Slope Chart
  - Data: Product performance before/after marketing campaign

### Funnel Chart
- **funnel-conversion.csv** - Sequential conversion stages (6 stages)
  - Use for: Funnel Chart
  - Data: User conversion funnel from visitor to repeat customer

## How to Use

### In Google Sheets:
1. Open Google Sheets
2. File → Import → Upload
3. Select a CSV file from this folder
4. Use with the Find&Tell Charts add-on

### In the Web App:
1. Go to Chart Editor
2. Click "Load Data" → "Paste CSV"
3. Copy the contents of any CSV file
4. Paste and click "Load CSV Data"

### For CSV Upload Feature:
1. Click "Load Data" → "Upload CSV File"
2. Select any CSV file from this folder
3. The chart will automatically load with the data

## Testing Checklist

- [ ] Test bar-simple-revenue.csv with Horizontal Bar chart
- [ ] Test bar-simple-revenue.csv with Vertical Bar chart
- [ ] Test bar-grouped-sales.csv with Grouped Horizontal Bar chart
- [ ] Test bar-grouped-sales.csv with Grouped Vertical Bar chart
- [ ] Test bar-stacked-channels.csv with Stacked Horizontal Bar chart
- [ ] Test bar-stacked-channels.csv with Stacked Vertical Bar chart
- [ ] Test line-monthly-growth.csv with Line Chart
- [ ] Test line-daily-traffic.csv with Line Chart (daily data)
- [ ] Test line-monthly-growth.csv with Area Chart
- [ ] Test area-stacked-market-share.csv with Area Stacked Chart
- [ ] Test slope-before-after.csv with Slope Chart
- [ ] Test funnel-conversion.csv with Funnel Chart

## Notes

- All currency values are in USD
- Date formats use ISO 8601 (YYYY-MM-DD)
- Data is realistic but fictional
- Designed to showcase chart features effectively