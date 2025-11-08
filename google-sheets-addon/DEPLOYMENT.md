# Google Sheets Add-on Deployment Guide

## 🎯 Overview

This guide will walk you through deploying the Find&Tell Charts Google Sheets Add-on.

## 📋 Prerequisites

- Google account with access to Google Apps Script
- Vercel account (for hosting the React app)
- The React app has been deployed to Vercel

## 🚀 Deployment Steps

### Step 1: Create a New Google Apps Script Project

1. Go to [Google Apps Script](https://script.google.com)
2. Click **New Project**
3. Name your project "Find&Tell Charts Add-on"

### Step 2: Add Script Files

#### Code.gs

1. In the Apps Script editor, rename `Code.gs` (if needed)
2. Copy the entire contents from `google-sheets-addon/Code.gs`
3. Paste into the editor

#### Sidebar.html

1. Click the **+** button next to Files
2. Select **HTML**
3. Name it `Sidebar`
4. Copy the entire contents from `google-sheets-addon/Sidebar.html`
5. Paste into the editor

#### appsscript.json

1. Click the gear icon (⚙️) in the left sidebar (Project Settings)
2. Check "Show appsscript.json manifest file in editor"
3. Go back to the Editor view
4. Click on `appsscript.json`
5. Copy the entire contents from `google-sheets-addon/appsscript.json`
6. Paste into the editor

### Step 3: Configure OAuth Consent Screen

1. In the Apps Script editor, click **Deploy** → **Test deployments**
2. You'll be prompted to configure OAuth consent screen
3. Follow the Google Cloud Console link
4. Fill in the required fields:
   - App name: "Find&Tell Charts"
   - User support email: Your email
   - Developer contact: Your email
5. Add scopes:
   - `https://www.googleapis.com/auth/spreadsheets.currentonly`
   - `https://www.googleapis.com/auth/userinfo.email`
6. Save and continue

### Step 4: Test the Add-on

1. Open a Google Sheet
2. In the Apps Script editor, click **Run** → **onOpen**
3. Authorize the script when prompted
4. You should see a new menu item "Find&Tell Charts" in the Google Sheet
5. Click **Find&Tell Charts** → **Create Chart**
6. The sidebar should load with the chart editor

### Step 5: Test the Data Flow

1. In your Google Sheet, select some data (e.g., a table with headers)
2. Open the Find&Tell Charts sidebar
3. Click on the **Data** tab
4. You should see the "Load Selected Data from Sheet" button
5. Click the button - the data should load into the chart editor
6. Verify the chart updates with your data

## 🔧 Configuration

### Production URL

The React app is deployed at:
```
https://funnel-viz-refactored-aggq70kuw-matthews-projects-3e12dabf.vercel.app
```

The iframe loads:
```
https://funnel-viz-refactored-aggq70kuw-matthews-projects-3e12dabf.vercel.app?mode=addon
```

### Local Development

For local testing, update `Sidebar.html` line 146:
```html
src="http://localhost:5174?mode=addon"
```

Remember to change it back to the production URL before publishing!

## 📝 Publishing to Google Workspace Marketplace (Optional)

To make this add-on available publicly:

1. In Apps Script editor, click **Deploy** → **New deployment**
2. Select **Add-on**
3. Fill in the deployment details:
   - Version: 1.0
   - Description: "Create beautiful, customizable charts for your Google Sheets"
4. Click **Deploy**
5. Follow the [Google Workspace Marketplace publishing guide](https://developers.google.com/workspace/marketplace/how-to-publish)

## 🎨 Features

- ✅ Auto-loads data from selected Google Sheets range
- ✅ Hidden navigation in add-on mode
- ✅ Prominent "Load Sheet Data" button
- ✅ Real-time chart updates
- ✅ Multiple chart types (Bar, Line, Slope, Funnel)
- ✅ Advanced styling options
- ✅ Export to PNG/SVG
- ✅ License tier support (Free/Pro/Enterprise)

## 🔐 Security Notes

- The iframe uses `postMessage` API for secure communication
- OAuth scopes are limited to:
  - `spreadsheets.currentonly` - Only access the current sheet
  - `userinfo.email` - Get user email for licensing

## 🐛 Troubleshooting

### Sidebar doesn't load
- Check the browser console for errors
- Verify the iframe URL in `Sidebar.html` is correct
- Ensure the Vercel deployment is successful

### Data doesn't load
- Check that you've selected a range in the Google Sheet
- Open browser console and look for postMessage logs
- Verify `useAddonMode.js` hook is working

### "Add-on mode" not detected
- Ensure the URL has `?mode=addon` parameter
- Check the useAddonMode hook in React app
- Verify postMessage listeners are set up

## 📞 Support

For issues or questions:
- Check the browser console for errors
- Review the Apps Script logs (View → Logs)
- Test locally first with `npm run dev`

## 🎉 Success!

If everything works:
1. You can select data in Google Sheets
2. Click "Load Selected Data from Sheet"
3. The chart updates in real-time
4. You can customize and export the chart

Congratulations! Your Google Sheets Add-on is live! 🚀
