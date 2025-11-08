# Find&Tell Charts - Google Sheets Add-on

This directory contains the Google Apps Script code for the Find&Tell Charts add-on.

## Files

- **Code.gs** - Main Apps Script code (backend functions)
- **Sidebar.html** - Sidebar UI that loads the React app in an iframe
- **appsscript.json** - Add-on manifest and configuration

## Architecture

```
┌─────────────────────────────────────────┐
│   Google Sheets Add-on (Apps Script)   │
│  ┌─────────────────────────────────┐   │
│  │   Sidebar (HTML + iframe)       │   │
│  │  ┌───────────────────────────┐  │   │
│  │  │ React App (Vercel)        │  │   │
│  │  │ - Chart rendering         │  │   │
│  │  │ - Style customization     │  │   │
│  │  │ - Export functionality    │  │   │
│  │  └───────────────────────────┘  │   │
│  └─────────────────────────────────┘   │
│           ↕ postMessage                 │
│   Apps Script Functions                 │
│   - getSelectedData()                   │
│   - insertChartToSheet()                │
│   - checkLicense()                      │
└─────────────────────────────────────────┘
```

## Setup Instructions

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Note the project ID

### 2. Create Apps Script Project

1. Go to [Google Apps Script](https://script.google.com/)
2. Click "New Project"
3. Name it "Find&Tell Charts"

### 3. Upload the Code

**Option A: Manual Copy/Paste**
1. In Apps Script editor, create 3 files:
   - `Code.gs` - Copy content from Code.gs
   - `Sidebar.html` - Copy content from Sidebar.html
   - `appsscript.json` - Copy content from appsscript.json

**Option B: Use clasp (Command Line)**
```bash
# Install clasp
npm install -g @google/clasp

# Login to Google
clasp login

# Create new project
cd google-sheets-addon
clasp create --type sheets --title "Find&Tell Charts"

# Push code
clasp push
```

### 4. Link to Google Cloud Project

1. In Apps Script editor, click on "Project Settings" (gear icon)
2. Under "Google Cloud Platform (GCP) Project", click "Change project"
3. Enter your GCP project number
4. Click "Set project"

### 5. Test the Add-on

1. In Apps Script editor, click "Run" → "Test as add-on"
2. Select "Installed and enabled" for configuration
3. Select a Google Sheets document to test with
4. Click "Test"
5. The add-on will open in the selected sheet
6. Go to "Find&Tell Charts" menu → "Create Chart"

### 6. Enable OAuth Screen

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" → "OAuth consent screen"
3. Select "External" user type
4. Fill in app information:
   - App name: Find&Tell Charts
   - User support email: your email
   - Developer contact: your email
5. Add scopes:
   - `https://www.googleapis.com/auth/spreadsheets.currentonly`
   - `https://www.googleapis.com/auth/userinfo.email`
6. Add test users (your email)
7. Save

### 7. Deploy as Add-on (Optional)

**For Private Testing:**
1. Click "Deploy" → "Test deployments"
2. Click "Install"
3. The add-on is now available in your Google Sheets

**For Public Marketplace:**
1. Click "Deploy" → "New deployment"
2. Select "Add-on"
3. Fill in store listing information
4. Submit for review

## Communication Protocol

### Messages FROM Apps Script TO React App

```javascript
// When add-on is ready
{
  type: 'ADDON_READY',
  platform: 'google-sheets'
}

// User info and license
{
  type: 'USER_INFO',
  data: {
    user: { email: 'user@example.com' },
    license: {
      tier: 'free',
      chartsRemaining: 10,
      features: { ... }
    }
  }
}

// Sheet data response
{
  type: 'SHEET_DATA',
  data: {
    csv: 'Header1,Header2\nValue1,Value2',
    values: [['Header1', 'Header2'], ['Value1', 'Value2']],
    range: { row: 1, column: 1, numRows: 2, numColumns: 2 },
    sheetName: 'Sheet1'
  }
}

// Chart insertion success
{
  type: 'INSERT_SUCCESS',
  message: 'Chart inserted successfully'
}
```

### Messages FROM React App TO Apps Script

```javascript
// Request sheet data
window.parent.postMessage({
  type: 'REQUEST_DATA'
}, '*');

// Insert chart to sheet
window.parent.postMessage({
  type: 'INSERT_CHART',
  data: {
    imageBase64: 'data:image/png;base64,...',
    format: 'png'
  }
}, '*');

// Log usage analytics
window.parent.postMessage({
  type: 'LOG_USAGE',
  action: 'chart_created',
  metadata: { chartType: 'funnel' }
}, '*');

// Notify ready
window.parent.postMessage({
  type: 'READY'
}, '*');
```

## Development Workflow

1. **Make changes to React app** → Deploy to Vercel
2. **Make changes to Apps Script** → clasp push (or copy/paste)
3. **Test in Google Sheets** → Refresh add-on sidebar

## Troubleshooting

### iframe not loading
- Check that Vercel URL is correct in Sidebar.html
- Check browser console for CORS errors
- Ensure iframe has `allow="clipboard-write"` attribute

### Data not being sent
- Check postMessage origin restrictions
- Verify message format matches protocol
- Check Apps Script execution logs

### OAuth errors
- Ensure all scopes are configured in OAuth consent screen
- Check that scopes match appsscript.json
- Remove and re-add test users if needed

## Next Steps

1. ✅ Add-on code created
2. ⏳ Update React app to handle add-on mode
3. ⏳ Test data flow between Sheets and React app
4. ⏳ Add licensing backend API
5. ⏳ Create marketplace listing
6. ⏳ Submit for Google review

## Resources

- [Apps Script Documentation](https://developers.google.com/apps-script)
- [Google Sheets Add-ons Guide](https://developers.google.com/apps-script/add-ons/editors/sheets)
- [Workspace Marketplace](https://developers.google.com/workspace/marketplace)
- [clasp Documentation](https://github.com/google/clasp)
