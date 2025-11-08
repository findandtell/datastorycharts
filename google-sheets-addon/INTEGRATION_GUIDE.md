# Integration Guide: Adding Add-on Support to React App

This guide explains how to integrate the React app with the Google Sheets Add-on.

## Files Created

✅ **Apps Script Files** (in `google-sheets-addon/`):
- `Code.gs` - Backend functions for data handling
- `Sidebar.html` - iframe wrapper with communication layer
- `appsscript.json` - Add-on manifest
- `README.md` - Deployment guide

✅ **React Hook** (in `src/shared/hooks/`):
- `useAddonMode.js` - Hook for detecting and communicating with add-on

## Integration Steps for React App

### Step 1: Import the Hook

Add to ChartEditor.jsx (line ~13):
```javascript
import { useAddonMode } from '../shared/hooks/useAddonMode';
```

### Step 2: Initialize Hook

Add after other hooks (line ~80):
```javascript
// Add-on mode support
const addon = useAddonMode();
```

### Step 3: Auto-load Sheet Data

Add effect to automatically load data when received from add-on:
```javascript
// Auto-load data from Google Sheets add-on
useEffect(() => {
  if (addon.isAddonMode && addon.sheetData && addon.sheetData.csv) {
    console.log('[Add-on] Loading sheet data');
    chartData.loadCSVText(addon.sheetData.csv, ',', 'google-sheets-addon');
  }
}, [addon.sheetData]);
```

### Step 4: Add "Load Sheet Data" Button

In the Data Tab, add a button to request data (when in add-on mode):
```jsx
{addon.isAddonMode && (
  <button
    onClick={() => {
      addon.requestSheetData();
      addon.logUsage('request_sheet_data');
    }}
    className="w-full px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium"
  >
    📊 Load Selected Data from Sheet
  </button>
)}
```

### Step 5: Add "Insert to Sheet" Button

Add export button for add-on mode (near Export buttons):
```jsx
{addon.isAddonMode && addon.addonReady && chartData.hasData && (
  <button
    onClick={async () => {
      const svgElement = svgRef.current?.querySelector('svg');
      if (svgElement) {
        // Convert SVG to PNG base64
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const img = new Image();

        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const pngData = canvas.toDataURL('image/png');

          // Send to add-on
          addon.insertChartToSheet(pngData, 'png');
          addon.logUsage('insert_chart', { chartType });
        };

        img.src = 'data:image/svg+xml;base64,' +
          btoa(unescape(encodeURIComponent(svgData)));
      }
    }}
    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
    Insert to Sheet
  </button>
)}
```

### Step 6: Hide Navigation in Add-on Mode

Modify the header/navigation to hide when in add-on mode:
```jsx
{/* Header - Hide in add-on mode */}
{!addon.isAddonMode && (
  <div className="bg-white border-b border-gray-200 flex-shrink-0">
    {/* existing header content */}
  </div>
)}
```

### Step 7: Adjust Layout for Add-on Mode

Modify the main container class to account for missing header:
```jsx
<div className={`flex flex-col h-screen ${addon.isAddonMode ? '' : 'pt-0'}`}>
```

### Step 8: Show License Status (Optional)

Display user license info in add-on mode:
```jsx
{addon.isAddonMode && addon.license && (
  <div className="px-4 py-2 bg-blue-50 border-b border-blue-200">
    <p className="text-xs text-blue-800">
      {addon.license.tier === 'free'
        ? `Free Plan: ${addon.license.chartsRemaining} charts remaining`
        : `${addon.license.tier} Plan`}
    </p>
  </div>
)}
```

## Testing Locally

### 1. Test React App in Add-on Mode

Visit: `http://localhost:5174?mode=addon`

This should:
- Hide the navigation
- Show add-on-specific UI
- Log add-on mode messages to console

### 2. Test Communication

Open browser console and simulate messages:
```javascript
// Simulate sheet data from add-on
window.postMessage({
  type: 'SHEET_DATA',
  data: {
    csv: 'Stage,Q1,Q2,Q3\nVisitors,1000,1200,1400\nSignups,500,600,700',
    sheetName: 'Sheet1'
  }
}, '*');
```

### 3. Deploy Apps Script

Follow `google-sheets-addon/README.md` to:
1. Create Apps Script project
2. Upload Code.gs, Sidebar.html, appsscript.json
3. Test as add-on in Google Sheets

## Communication Flow

```
┌─────────────────┐                    ┌──────────────────┐
│  Apps Script    │                    │   React App      │
│   (Sidebar)     │                    │  (Vercel/Local)  │
└─────────────────┘                    └──────────────────┘
         │                                      │
         │  1. ADDON_READY                    │
         │─────────────────────────────────────>│
         │                                      │
         │  2. READY (acknowledgment)          │
         │<─────────────────────────────────────│
         │                                      │
         │  3. USER_INFO + license             │
         │─────────────────────────────────────>│
         │                                      │
         │                     4. User clicks   │
         │                     "Load Data"      │
         │  5. REQUEST_DATA                    │
         │<─────────────────────────────────────│
         │                                      │
         │  6. getSelectedData()               │
         │     (Apps Script function)           │
         │                                      │
         │  7. SHEET_DATA (CSV)                │
         │─────────────────────────────────────>│
         │                                      │
         │                     8. Chart created │
         │                     User clicks      │
         │                     "Insert to Sheet"│
         │  9. INSERT_CHART (base64)           │
         │<─────────────────────────────────────│
         │                                      │
         │  10. insertChartToSheet()           │
         │      (Apps Script function)          │
         │                                      │
         │  11. INSERT_SUCCESS                 │
         │─────────────────────────────────────>│
         │                                      │
```

## Next Steps

1. ✅ Apps Script wrapper created
2. ✅ Communication hook created
3. ⏳ **Integrate hook into ChartEditor** (follow steps above)
4. ⏳ Test locally with `?mode=addon`
5. ⏳ Deploy to Vercel
6. ⏳ Upload to Apps Script
7. ⏳ Test in real Google Sheets
8. ⏳ Add licensing backend
9. ⏳ Submit to Marketplace

## Quick Reference

### Add-on Mode Detection
```javascript
const addon = useAddonMode();
if (addon.isAddonMode) {
  // Running in Google Sheets sidebar
}
```

### Request Data
```javascript
addon.requestSheetData();
```

### Insert Chart
```javascript
addon.insertChartToSheet(base64ImageData, 'png');
```

### Log Usage
```javascript
addon.logUsage('chart_created', { chartType: 'funnel' });
```

## Troubleshooting

**Q: iframe not loading?**
A: Check Vercel URL in Sidebar.html matches your deployment

**Q: No data received?**
A: Check browser console for postMessage events, verify message format

**Q: Can't insert to sheet?**
A: Ensure image is valid base64, check Apps Script execution logs

**Q: OAuth errors?**
A: Configure OAuth consent screen with required scopes

## Resources

- [useAddonMode Hook](../src/shared/hooks/useAddonMode.js)
- [Apps Script Code](./Code.gs)
- [Sidebar HTML](./Sidebar.html)
- [Deployment Guide](./README.md)
