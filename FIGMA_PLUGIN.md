# DataStory Charts - Figma Plugin

**Create beautiful, publication-quality charts directly in Figma!**

---

## Overview

The **DataStory Charts Figma Plugin** brings the full power of the DataStory Charts web application into Figma. Design charts with your data, customize with professional style templates, and insert them as native, editable vector nodes—all without leaving your design workflow.

### Key Features

- 📊 **4 Chart Types**: Funnel, Bar (4 variants), Line/Area, and Slope charts
- 🎨 **15+ Style Templates**: Financial Times, The Economist, NYT, WSJ, BBC, Tufte, and more
- 📈 **Google Sheets Integration**: Load live data from Google Sheets with auto-refresh
- 🎯 **Native Figma Vectors**: Charts inserted as fully editable vector nodes
- ⚡ **Full Web App Features**: Same powerful chart editor, embedded in Figma
- 🔄 **Instant Updates**: Modify and re-insert charts anytime

---

## Table of Contents

1. [Installation](#installation)
2. [Using the Plugin](#using-the-plugin)
3. [How It Works](#how-it-works)
4. [Development Setup](#development-setup)
5. [Architecture](#architecture)
6. [Publishing](#publishing)
7. [Troubleshooting](#troubleshooting)

---

## Installation

### For End Users

1. **Install from Figma Community** (once published):
   - Search "Find&Tell Charts" or "DataStory Charts" in Figma plugins
   - Click **Install**
   - Plugin appears in: `Plugins → Find&Tell Charts`

2. **Or install from URL**:
   - Open Figma file
   - Go to `Plugins → Browse plugins in Community`
   - Search for plugin or paste URL

### For Developers (Load Locally)

See [Development Setup](#development-setup) below.

---

## Using the Plugin

### Quick Start

1. **Open the plugin**:
   - In Figma: `Plugins → Find&Tell Charts`
   - Plugin panel opens (1400x900px)

2. **Create your chart**:
   - Select chart type from gallery
   - Load data (CSV, Google Sheets, or sample data)
   - Customize with style templates or manual controls
   - Preview in real-time

3. **Insert into Figma**:
   - Click **Export → Insert to Figma** button
   - Chart appears on your canvas as vector nodes
   - Chart is positioned at viewport center
   - Chart is automatically selected

4. **Edit as vectors**:
   - Ungroup to access individual elements
   - Change colors, fonts, sizes
   - Move, scale, rotate like any Figma object

### Features Available

**Everything from the web app**:
- ✅ All chart types (Funnel, Bar, Line, Slope)
- ✅ 15+ style templates
- ✅ Google Sheets integration
- ✅ CSV import/export
- ✅ Data editing
- ✅ Full customization controls
- ✅ Emphasis modes
- ✅ Percentage change brackets
- ✅ Admin defaults (if configured)

**Figma-specific**:
- ✅ "Insert to Figma" button (only visible in plugin)
- ✅ Native vector insertion (not images)
- ✅ Auto-centering in viewport
- ✅ Auto-selection after insert
- ✅ Named chart nodes (using chart title)

---

## How It Works

### Architecture Overview

```
┌─────────────────────────────────────────────────┐
│          Figma Desktop App                      │
│  ┌───────────────────────────────────────────┐  │
│  │  Plugin Main Thread (code.js)             │  │
│  │  - Accesses Figma scene                   │  │
│  │  - Creates vector nodes from SVG          │  │
│  │  - Handles messages from UI iframe        │  │
│  └────────────┬──────────────────────────────┘  │
│               │                                  │
│               │ postMessage API                  │
│               │                                  │
│  ┌────────────▼──────────────────────────────┐  │
│  │  Plugin UI (iframe)                       │  │
│  │  https://charts.findandtell.co?mode=figma │  │
│  │                                            │  │
│  │  - Full React app loads in iframe         │  │
│  │  - User creates/customizes charts         │  │
│  │  - Generates SVG from D3 visualization    │  │
│  │  - Sends SVG to plugin via postMessage    │  │
│  └────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Message Flow

**When user clicks "Insert to Figma":**

1. **React app captures SVG**:
   ```javascript
   const svgElement = svgRef.current?.querySelector('svg');
   const svgString = new XMLSerializer().serializeToString(svgElement);
   ```

2. **React app sends message** (via `useFigmaMode` hook):
   ```javascript
   parent.postMessage({
     pluginMessage: {
       type: 'insert-chart',
       svg: svgString,
       name: 'Q4 Sales Chart'
     }
   }, '*');
   ```

3. **UI iframe forwards** to plugin main thread:
   ```javascript
   // ui.html forwards message
   parent.postMessage({ pluginMessage: message.pluginMessage }, '*');
   ```

4. **Plugin main thread receives**:
   ```typescript
   figma.ui.onmessage = async (msg) => {
     if (msg.type === 'insert-chart') {
       await handleInsertChart(msg);
     }
   };
   ```

5. **Plugin creates Figma nodes**:
   ```typescript
   const node = figma.createNodeFromSvg(msg.svg);
   node.name = msg.name;
   figma.currentPage.appendChild(node);
   figma.currentPage.selection = [node];
   figma.viewport.scrollAndZoomIntoView([node]);
   ```

6. **User sees chart** as native Figma vectors!

### Figma Mode Detection

The web app detects Figma mode via URL parameter:

```javascript
// src/shared/hooks/useFigmaMode.js
const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get('mode');
const isFigmaMode = mode === 'figma';
```

**URL in plugin**: `https://charts.findandtell.co?mode=figma`

**When in Figma mode**:
- "Insert to Figma" button appears in Export menu
- `sendToFigma()` function becomes available
- Plugin-specific features enabled

---

## Development Setup

### Prerequisites

1. **Figma Desktop App** (required):
   - Download: https://www.figma.com/downloads/
   - Web version won't work for plugin development

2. **Node.js** (v16+):
   ```bash
   node --version  # Check version
   ```

### Installation Steps

1. **Navigate to plugin directory**:
   ```bash
   cd figma-plugin
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the plugin**:
   ```bash
   npm run build
   ```
   - Compiles `code.ts` → `code.js`

4. **Load plugin in Figma Desktop**:
   - Open Figma Desktop App
   - Open any Figma file (or create new)
   - Go to: `Figma menu → Plugins → Development → Import plugin from manifest...`
   - Select: `datastorycharts/figma-plugin/manifest.json`
   - Click **Open**

5. **Run the plugin**:
   - `Plugins → Development → Find&Tell Charts`
   - Plugin panel opens with chart editor!

### Development Workflow

**Watch mode** (auto-recompile on changes):

```bash
npm run watch
```

Then in Figma:
1. Make changes to `code.ts`
2. Rerun plugin: `Plugins → Development → Find&Tell Charts`
3. Changes reflected immediately

### Local Testing

**Test with local web app** (instead of production):

1. **Update iframe URL** in `ui.html` (line 99):
   ```html
   <!-- Change from production -->
   <iframe src="https://charts.findandtell.co?mode=figma" ...>

   <!-- To local -->
   <iframe src="http://localhost:5173?mode=figma" ...>
   ```

2. **Start local dev server**:
   ```bash
   cd ..  # Back to project root
   npm run dev
   ```

3. **Rebuild plugin**:
   ```bash
   cd figma-plugin
   npm run build
   ```

4. **Rerun plugin in Figma** to test changes

**⚠️ Important**: Change back to production URL before publishing!

---

## Architecture

### File Structure

```
figma-plugin/
├── manifest.json       # Plugin configuration
├── code.ts             # Plugin main thread (TypeScript)
├── code.js             # Compiled plugin code
├── ui.html             # Plugin UI (loads iframe)
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript config
└── README.md           # Plugin documentation
```

### Key Files

#### `manifest.json` - Plugin Configuration

```json
{
  "name": "Find&Tell Charts",
  "id": "findtell-charts",
  "api": "1.0.0",
  "main": "code.js",
  "ui": "ui.html",
  "editorType": ["figma", "figjam", "slides"],
  "capabilities": ["textreview"],
  "networkAccess": {
    "allowedDomains": [
      "https://charts.findandtell.co"
    ]
  }
}
```

**Key properties**:
- `main`: Plugin logic (runs in main thread)
- `ui`: UI HTML (loads in iframe)
- `editorType`: Works in Figma, FigJam, and Slides
- `networkAccess`: Allows loading from charts.findandtell.co

#### `code.ts` - Plugin Main Thread

**Responsibilities**:
- Show plugin UI (iframe)
- Listen for messages from UI
- Create Figma nodes from SVG
- Position and select charts

**Key functions**:
- `figma.showUI()` - Open plugin panel
- `figma.ui.onmessage` - Handle messages from UI
- `figma.createNodeFromSvg()` - Convert SVG to vectors
- `figma.notify()` - Show notifications

#### `ui.html` - Plugin UI

**Responsibilities**:
- Load chart app in iframe
- Show loading state
- Forward messages between iframe and plugin
- Handle errors

**Security**:
- Only accepts messages from trusted origins:
  - `https://charts.findandtell.co` (production)
  - `http://localhost:5173` (dev)

#### `useFigmaMode.js` - React Hook

**Location**: `src/shared/hooks/useFigmaMode.js`

**Provides**:
```javascript
const {
  isFigmaMode,      // Boolean: is app in Figma?
  sendToFigma,      // Function: send SVG to Figma
  notifyFigma,      // Function: show notification
  closeFigma,       // Function: close plugin
  resizeFigma,      // Function: resize plugin window
} = useFigmaMode();
```

**Usage in ChartEditor**:
```javascript
const figma = useFigmaMode();

const handleInsertToFigma = () => {
  const svgElement = svgRef.current?.querySelector('svg');
  const svgString = new XMLSerializer().serializeToString(svgElement);
  const success = figma.sendToFigma(svgString, styleSettings.title);

  if (success) {
    figma.notifyFigma('Chart inserted successfully! ✅');
  }
};
```

---

## Publishing

### Preparation Checklist

Before publishing to Figma Community:

- [ ] **Test thoroughly**:
  - [ ] All chart types work
  - [ ] Google Sheets integration works
  - [ ] CSV upload/export works
  - [ ] Style templates apply correctly
  - [ ] Charts insert as vectors (not images)
  - [ ] Test on Mac & Windows

- [ ] **Add plugin icon**:
  - [ ] Create 128x128 PNG icon
  - [ ] Save as `figma-plugin/icon.png`
  - [ ] Add to manifest.json: `"icon": "icon.png"`

- [ ] **Polish manifest**:
  - [ ] Complete description
  - [ ] List key features
  - [ ] Add tags/keywords

- [ ] **Create assets**:
  - [ ] Cover image (1920x960)
  - [ ] Screenshots (at least 3)
  - [ ] Demo video (optional but recommended)

- [ ] **Update README**:
  - [ ] Clear instructions
  - [ ] Troubleshooting section
  - [ ] Support contact

### Publishing Steps

1. **In Figma Desktop**:
   - `Plugins → Development → Manage plugins...`
   - Find "Find&Tell Charts"
   - Click **Publish**

2. **Fill out listing**:
   - Plugin name
   - Tagline (1 sentence)
   - Description (detailed)
   - Tags/categories
   - Upload icon
   - Upload cover image
   - Upload screenshots

3. **Submit for review**:
   - Review guidelines: https://www.figma.com/community/plugin-review-guidelines
   - Submit for Figma team review
   - Response typically within 1-2 weeks

4. **After approval**:
   - Plugin appears in Figma Community
   - Users can install with one click

### Post-Launch

- Monitor plugin reviews/feedback
- Respond to user questions
- Track usage analytics (Figma provides)
- Iterate based on feedback

---

## Troubleshooting

### Plugin not showing in Figma

**Check**:
- [ ] Using Figma Desktop App (not web)
- [ ] `manifest.json` exists in plugin directory
- [ ] `code.js` exists (run `npm run build`)
- [ ] Manifest loaded correctly (check plugin list)

**Solution**:
```bash
cd figma-plugin
npm run build
# Then reload plugin in Figma
```

---

### Iframe not loading

**Symptoms**:
- Stuck on "Loading chart editor..."
- Blank screen after loading spinner

**Check**:
- [ ] Internet connection works
- [ ] https://charts.findandtell.co is accessible
- [ ] Browser console shows errors (open DevTools)

**Common causes**:
- **CORS errors**: Check `networkAccess` in manifest
- **Network blocked**: Firewall/proxy blocking domain
- **SSL errors**: Certificate issues

**Solution**:
```javascript
// Check manifest.json has correct domain
"networkAccess": {
  "allowedDomains": [
    "https://charts.findandtell.co"
  ]
}
```

---

### Chart not inserting (SVG errors)

**Symptoms**:
- "Error inserting chart" notification
- Chart button doesn't work
- Console shows errors

**Check**:
- [ ] SVG is valid (test with simple SVG first)
- [ ] SVG not too large (Figma has limits)
- [ ] SVG contains vector elements (not embedded images)

**Debug**:
```javascript
// Check SVG in console
console.log('SVG:', svgString.substring(0, 200));
```

**Common issues**:
- **Invalid SVG**: Missing closing tags, malformed XML
- **Too large**: SVG file size > 10MB
- **Unsupported elements**: Some SVG features not supported

**Solution**:
- Simplify chart (fewer data points)
- Remove unnecessary SVG attributes
- Test with minimal SVG first

---

### Changes not reflected

**Symptoms**:
- Made changes to `code.ts` but plugin unchanged
- Old version still running

**Solution**:
1. **Recompile**:
   ```bash
   npm run build
   ```

2. **Rerun plugin** in Figma:
   - Close plugin
   - `Plugins → Development → Find&Tell Charts`

3. **Clear cache** (if needed):
   - Close Figma completely
   - Reopen and try again

---

### Local testing issues

**Problem**: Plugin shows production app, not local version

**Solution**:
1. Update `ui.html` line 99:
   ```html
   src="http://localhost:5173?mode=figma"
   ```

2. Rebuild:
   ```bash
   npm run build
   ```

3. Ensure local dev server running:
   ```bash
   cd ..
   npm run dev
   ```

4. Rerun plugin in Figma

---

### Message not reaching plugin

**Symptoms**:
- "Insert to Figma" button doesn't work
- No chart appears on canvas
- No error messages

**Debug**:
```javascript
// In browser console (Figma → View → Toggle Developer Tools)
console.log('[Debug] isFigmaMode:', isFigmaMode);
console.log('[Debug] Sending message:', message);
```

**Check**:
- [ ] `?mode=figma` parameter in URL
- [ ] `useFigmaMode` hook detecting Figma mode
- [ ] Message structure matches plugin expectations

**Common issues**:
- URL parameter missing
- CORS blocking postMessage
- Origin mismatch in security check

---

## Additional Resources

### Documentation

- **Main README**: [README.md](README.md)
- **Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **Web App Guide**: [QUICKSTART.md](QUICKSTART.md)

### External Links

- **Figma Plugin API**: https://www.figma.com/plugin-docs/
- **Figma Community**: https://www.figma.com/community
- **Plugin Guidelines**: https://www.figma.com/community/plugin-review-guidelines

### Support

- 📧 Email: support@findandtell.com
- 🌐 Website: https://findandtell.com
- 💬 Community: [GitHub Discussions](https://github.com/findandtell/datastorycharts/discussions)

---

## Marketing & Positioning

### Value Proposition

**For Designers**:
- "Create publication-quality charts without leaving Figma"
- "15+ professional style templates inspired by leading publications"
- "Native vectors, fully editable after insertion"

**For Data Teams**:
- "Connect live Google Sheets data to your designs"
- "Same powerful chart tool, now in your design workflow"
- "Update data, refresh chart—no re-exporting"

### Key Differentiators

1. **Native Vectors** (not images):
   - Ungroup and edit any element
   - Change colors, fonts, sizes
   - True Figma integration

2. **Full Web App Power**:
   - Not a simplified plugin version
   - All features available
   - Same professional quality

3. **Style Templates**:
   - 15+ publication-inspired presets
   - Financial Times, Economist, NYT, etc.
   - One-click professional styling

4. **Live Data**:
   - Google Sheets integration
   - Auto-refresh on updates
   - Always current

### Target Users

- **Product Designers**: Embedding charts in mockups/prototypes
- **Marketing Teams**: Creating data-driven presentations
- **Data Analysts**: Visualizing insights for stakeholders
- **Agencies**: Client reports and presentations
- **Educators**: Teaching materials with data

---

**Last Updated**: 2025-11-20
**Status**: ✅ Production Ready
**Maintainer**: Find & Tell
**Version**: 1.0.0
