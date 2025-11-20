# Chart Template

This folder contains template files for creating new chart types.

## How to Use

1. **Copy this entire folder** to `src/charts/YourChartName/`
2. **Rename files** - Replace `_ChartTemplate` with your chart name
3. **Customize** - Update the component, defaults, and tests
4. **Register** - Add entry to `src/charts/registry.js`
5. **Test** - Run tests and verify rendering

## Template Files

- `_ChartTemplate.jsx` - Main chart component template
- `_chartTemplateDefaults.js` - Default style settings template
- `_ChartTemplate.test.jsx` - Test file template
- `README.md` - This file

## Example: Creating a Pie Chart

```bash
# 1. Copy template
cp -r src/charts/_ChartTemplate src/charts/PieChart

# 2. Rename files
cd src/charts/PieChart
mv _ChartTemplate.jsx PieChart.jsx
mv _chartTemplateDefaults.js pieChartDefaults.js
mv _ChartTemplate.test.jsx PieChart.test.jsx

# 3. Update content (search and replace)
# Replace _ChartTemplate with PieChart
# Replace _chartTemplate with pieChart
# Update component logic

# 4. Register in src/charts/registry.js
# Add import and registry entry

# 5. Test
npm test -- PieChart
```

## Quick Reference

See [ADDING-CHARTS.md](../../../ADDING-CHARTS.md) for complete guide.

**Next steps:**
1. Read the template files
2. Customize for your chart type
3. Follow the adding charts guide
4. Write tests
5. Document your chart

---

**Note:** This is a template folder - don't modify these files directly. Copy them first!
