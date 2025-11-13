# Beta Release 1.0.0 - Testing & Deployment Guide

**Last Updated**: November 13, 2024
**Version**: Beta Release 1.0.0
**Status**: Ready for Local Testing

---

## 📦 Test Data Available

All test CSV files are located in the `test-data/` folder.

### Bar Charts
- **bar-simple-revenue.csv** - Single metric by region (6 categories)
  - Use for: Horizontal Bar, Vertical Bar charts
  - Data: Revenue by geographic region
  - Example: North America: $425K, Europe: $380K, Asia Pacific: $520K

- **bar-grouped-sales.csv** - Multiple metrics by category (5 categories, 4 metrics)
  - Use for: Grouped Bar charts (Horizontal/Vertical)
  - Data: Q1-Q4 sales by region (North, South, East, West, Central)
  - Great for comparing quarterly performance

- **bar-stacked-channels.csv** - Multiple metrics to stack (6 months, 5 channels)
  - Use for: Stacked Bar charts (Horizontal/Vertical)
  - Data: Monthly revenue by marketing channel (Organic, Paid Search, Social, Email, Direct)
  - Shows revenue composition over time

### Line & Area Charts
- **line-monthly-growth.csv** - Monthly time series (12 months, 3 metrics)
  - Use for: Line Chart, Area Chart
  - Data: Revenue, Users, Orders for full year 2024
  - Perfect for showing growth trends

- **line-daily-traffic.csv** - Daily time series (13 days, 3 metrics)
  - Use for: Line Chart showing daily patterns
  - Data: Pageviews, Sessions, New Users for Nov 1-13, 2024
  - Demonstrates daily granularity

- **area-stacked-market-share.csv** - Quarterly stacked data (4 quarters, 4 products)
  - Use for: Area Stacked Chart
  - Data: Product A, B, C, D quarterly revenue
  - Shows market share over time

### Slope Chart
- **slope-before-after.csv** - Two-period comparison (5 products)
  - Use for: Slope Chart
  - Data: Product performance before/after marketing campaign
  - Shows individual product changes

### Funnel Chart
- **funnel-conversion.csv** - Sequential conversion stages (6 stages)
  - Use for: Funnel Chart
  - Data: User conversion from 125K visitors → 8.2K repeat customers
  - Classic conversion funnel example

---

## ✅ What's New in Beta Release 1.0.0

### Fixed Issues
- ✅ **React Hook Error #321** - Fixed hooks being called inside useEffect
- ✅ **Axis Input Performance** - Changed to onBlur to prevent crashes when typing partial numbers
- ✅ **Axis Value Accuracy** - Fixed Min/Max/Units not respecting manual values
- ✅ **Theme Auto-Sync** - Axis colors now automatically update when switching Light ↔ Dark
- ✅ **Emphasis Brackets** - Fixed visibility and spacing issues
- ✅ **Debug Logs Removed** - Cleaned up console.log statements

### New Features
- ✨ **Version Display** - Shows "Beta Release 1.0.0" in menu
- ✨ **Share Feedback Link** - Menu item for beta tester feedback (link pending)
- ✨ **Test Data Suite** - 8 professional CSV datasets for testing

### Known Limitations
- ⚠️ **Bundle Size**: 717KB (larger than recommended, consider optimization post-beta)
- ⚠️ **Lemon Squeezy**: Checkout URL placeholder (waiting for store approval)
- ⚠️ **Example Charts**: Gallery empty (to be populated during testing)

---

## 🎯 RECOMMENDED TESTING WORKFLOW

### Phase 1: Local Testing (DO THIS FIRST!)

**Location**: http://localhost:5175

#### Step 1: Test All Chart Types
Load each CSV file and verify rendering:

- [ ] **Bar Horizontal** - Load `bar-simple-revenue.csv`
  - Check: Bars render horizontally
  - Check: Values display correctly
  - Check: Theme switching works

- [ ] **Bar Vertical** - Load `bar-simple-revenue.csv`
  - Check: Bars render vertically
  - Check: Labels are readable
  - Check: Orientation switch works

- [ ] **Bar Grouped Horizontal** - Load `bar-grouped-sales.csv`
  - Check: Groups render side-by-side
  - Check: Legend shows all quarters
  - Check: Colors are distinct

- [ ] **Bar Grouped Vertical** - Load `bar-grouped-sales.csv`
  - Check: Groups render correctly
  - Check: Spacing looks good

- [ ] **Bar Stacked Horizontal** - Load `bar-stacked-channels.csv`
  - Check: Segments stack correctly
  - Check: Total values make sense
  - Check: Legend shows all channels

- [ ] **Bar Stacked Vertical** - Load `bar-stacked-channels.csv`
  - Check: Segments stack correctly
  - Check: Tooltips work

- [ ] **Line Chart (Monthly)** - Load `line-monthly-growth.csv`
  - Check: Lines render smoothly
  - Check: Points are visible
  - Check: Direct labels appear
  - Check: Date formatting looks good

- [ ] **Line Chart (Daily)** - Load `line-daily-traffic.csv`
  - Check: Daily granularity works
  - Check: Axis labels are clear
  - Check: Time scale is appropriate

- [ ] **Area Chart** - Load `line-monthly-growth.csv`
  - Check: Area fill renders
  - Check: Opacity is good
  - Check: Gradient option works

- [ ] **Area Stacked Chart** - Load `area-stacked-market-share.csv`
  - Check: Areas stack correctly
  - Check: Colors are visible
  - Check: Hover shows correct values

- [ ] **Slope Chart** - Load `slope-before-after.csv`
  - Check: Lines connect correctly
  - Check: Labels on both sides
  - Check: Changes are clear

- [ ] **Funnel Chart** - Load `funnel-conversion.csv`
  - Check: Stages render in order
  - Check: Conversion rates calculate
  - Check: Labels are readable

#### Step 2: Test Key Features

**Theme Switching**
- [ ] Switch Light → Dark - Axis should turn white
- [ ] Switch Dark → Light - Axis should turn black
- [ ] Check all text remains readable
- [ ] Check colors look good in both themes

**Axis Controls** (Bar & Line Charts)
- [ ] Enter "50000" in Maximum - should wait for blur
- [ ] Chart should NOT update while typing "5", "50", "500"...
- [ ] Chart SHOULD update after clicking away
- [ ] Uncheck "Auto" - input should show your value
- [ ] Check "Auto" - input should show calculated value

**Export Functions**
- [ ] Export as PNG - check quality
- [ ] Export as SVG - check vector quality
- [ ] Check filename is appropriate
- [ ] Verify chart matches screen

**Save/Load**
- [ ] Save a chart JSON
- [ ] Clear the chart
- [ ] Load the JSON back
- [ ] Verify all settings restored

**Google Sheets Integration** (if applicable)
- [ ] Test with Google Sheets Add-on
- [ ] Verify data loads correctly
- [ ] Check chart insertion works

---

### Phase 2: Create Example Charts

After confirming everything works locally, create beautiful example charts.

#### Creating Examples:
1. Load one of the test CSVs
2. Style it beautifully:
   - Choose theme (Light/Dark)
   - Select color palette
   - Adjust fonts and spacing
   - Enable/disable gridlines
   - Set axis bounds if needed
3. Save as JSON following `EXAMPLE_CHARTS_GUIDE.md`
4. Export as SVG for thumbnail (800×600px recommended)
5. Place files in appropriate `example-charts/` folder

#### Recommended First Examples:
- **Bar Chart** - `bar-simple-revenue.csv` → Modern business style
- **Line Chart** - `line-monthly-growth.csv` → Growth trend style
- **Funnel Chart** - `funnel-conversion.csv` → Conversion style

#### File Naming (from EXAMPLE_CHARTS_GUIDE.md):
Use kebab-case, 2-4 words:
- ✅ `regional-revenue-comparison.json`
- ✅ `monthly-growth-trend.json`
- ✅ `user-conversion-funnel.json`
- ❌ `chart1.json`
- ❌ `MyChart.json`

---

### Phase 3: Production Deployment

**Only deploy after successful local testing!**

#### Pre-Deployment Checklist:
- [ ] All 11 chart types tested and working
- [ ] Theme switching works correctly
- [ ] Axis inputs respect manual values (onBlur working)
- [ ] No console errors in browser DevTools
- [ ] 2-3 example charts created (optional but recommended)
- [ ] Google Form link ready for "Share Feedback" (optional)

#### Deployment Commands:
```bash
cd funnel-viz-refactored

# Commit all changes
git add -A
git commit -m "Beta Release 1.0.0 - Ready for beta testing"
git push

# Deploy to Vercel
npx vercel --prod --yes
```

#### Post-Deployment:
1. Wait 2-3 minutes for CDN propagation
2. Test production URL (not charts.findandtell.co - use direct Vercel URL)
3. Clear browser cache completely
4. Verify no React Hook errors
5. Test with at least 2 different chart types
6. If everything works, test custom domain

---

## 🐛 Troubleshooting

### Issue: React Hook Error #321 Still Appears
**Solution**:
- Hard refresh browser: `Ctrl+Shift+F5` (Windows) or `Cmd+Shift+R` (Mac)
- Clear browser cache completely
- Try direct Vercel URL instead of custom domain
- Wait 5-10 minutes for CDN propagation

### Issue: Axis Inputs Update While Typing
**Solution**: This should be fixed in Beta 1.0.0. If still happening:
- Verify you're on the latest deployment
- Check that inputs use `onBlur` not `onChange`
- Clear cache and try again

### Issue: Axis Values Don't Update When Unchecking Auto
**Solution**: Fixed in Beta 1.0.0 with proper `key` props
- Clear browser cache
- Verify using latest version

### Issue: Theme Switch Doesn't Update Axis Color
**Solution**: Fixed in Beta 1.0.0 with auto-sync
- Should automatically set black (Light) or white (Dark)
- If not working, clear cache and reload

### Issue: Chart Crashes with Large Numbers
**Solution**: Fixed by `onBlur` - chart only updates after typing complete
- No longer tries to render with partial values like "1" when typing "10000"

---

## 📋 Beta Tester Feedback Form

### When Google Form is Ready:
1. Create Google Form with these questions:
   - Which chart types did you test?
   - Did you encounter any bugs or errors?
   - Was the interface intuitive?
   - What features are you most excited about?
   - What features are missing?
   - Performance feedback (speed, responsiveness)
   - Any charts that didn't export correctly?
   - Would you use this in production?
   - Overall rating (1-5 stars)
   - Open feedback

2. Get the form link

3. Update ChartEditor.jsx line 2030:
   - Change `href="#"` to `href="YOUR_GOOGLE_FORM_URL"`

---

## 📊 Testing Data Reference

### How to Load CSV Data

#### Method 1: Copy-Paste
1. Open a test CSV in a text editor
2. Copy all contents
3. In the app, click "Load Data" → "Paste CSV"
4. Paste and click "Load CSV Data"

#### Method 2: File Upload
1. In the app, click "Load Data" → "Upload CSV File"
2. Select a CSV file from `test-data/` folder
3. Chart automatically loads

#### Method 3: Google Sheets (if available)
1. Import CSV to Google Sheets
2. Make sheet publicly viewable (link sharing)
3. Use Google Sheets integration

---

## 🎨 Style Templates

Consider creating style templates for common use cases:
- **Business Report** - Professional, clean, corporate colors
- **Marketing Dashboard** - Vibrant, modern, engaging
- **Data Analysis** - High contrast, clear gridlines, academic
- **Presentation** - Bold, high visibility, minimal clutter
- **Dark Theme** - Optimized for dark backgrounds

---

## 📝 Notes for Beta Testers

### What to Focus On:
1. **Stability** - Does anything crash or error?
2. **Usability** - Is the interface intuitive?
3. **Performance** - Are there lag issues with large datasets?
4. **Aesthetics** - Do charts look professional?
5. **Export Quality** - Are PNG/SVG exports high quality?

### Known Limitations (Don't Report These):
- License system placeholder (waiting for Lemon Squeezy approval)
- Example charts gallery empty (will be populated)
- Bundle size warning (optimization planned for post-beta)

### Please Report:
- Any console errors
- Charts that don't render correctly
- Export quality issues
- Performance problems
- UI/UX confusion
- Feature requests

---

## 🚀 Success Metrics for Beta

Consider the beta successful if:
- [ ] All 11 chart types render without errors
- [ ] No React Hook errors in production
- [ ] Axis controls work smoothly (no crashes while typing)
- [ ] Theme switching is reliable
- [ ] Export functions produce high-quality output
- [ ] At least 3 beta testers complete full testing
- [ ] No critical bugs reported
- [ ] Positive feedback on usability
- [ ] At least 5 example charts created and working

---

## 📅 Timeline Recommendation

**Week 1: Local Testing**
- Day 1-2: Test all 11 chart types with test data
- Day 3-4: Create 5-10 example charts
- Day 5: Final local verification

**Week 2: Beta Deployment**
- Day 1: Deploy to production
- Day 2-3: Internal testing on production
- Day 4-7: Share with 3-5 beta testers

**Week 3: Feedback & Iteration**
- Collect feedback from Google Form
- Fix any critical bugs
- Make minor improvements
- Consider public launch

---

## 🔗 Important Links

- **Local Dev**: http://localhost:5175
- **Production** (Vercel): Check deployment output
- **Custom Domain**: charts.findandtell.co
- **Documentation**: https://docs.findandtell.co (when ready)
- **Guides**: https://guides.findandtell.co (when ready)
- **YouTube**: https://youtube.com/@findandtell
- **Feedback Form**: [Add your Google Form link here]

---

## 📞 Support During Beta

For urgent issues during beta testing:
1. Check this guide first
2. Try clearing browser cache
3. Test on direct Vercel URL (not custom domain)
4. Check browser console for errors
5. Take screenshots of any issues
6. Report via feedback form

---

## ✅ Final Pre-Launch Checklist

Before sharing with beta testers:

**Testing Complete**
- [ ] All 11 chart types tested locally
- [ ] Theme switching verified
- [ ] Axis inputs tested thoroughly
- [ ] Export functions working
- [ ] No console errors

**Content Ready**
- [ ] At least 3 example charts created
- [ ] Google Form for feedback created
- [ ] Feedback link updated in menu

**Documentation**
- [ ] Beta testers have access to this guide
- [ ] Known limitations communicated
- [ ] Support process established

**Deployment**
- [ ] Deployed to production
- [ ] Verified on production URL
- [ ] CDN cache cleared
- [ ] Custom domain working (optional)

---

**Ready to Begin?** Start with Phase 1 local testing using the CSV files in `test-data/` folder!

Good luck with your beta launch! 🎉
