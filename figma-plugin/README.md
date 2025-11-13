# Find&Tell Charts - Figma Plugin

Create beautiful charts from Google Sheets data directly in Figma!

## Features

- 📊 **4 Chart Types**: Funnel, Bar, Line, and Slope charts
- 📈 **Google Sheets Integration**: Load data directly from Google Sheets
- 🎨 **Native Figma Vectors**: Charts are inserted as editable vector nodes
- ⚡ **Fast & Easy**: Familiar chart editor embedded in Figma
- 🔄 **Live Updates**: Update charts with new data instantly

## Development Setup

### Prerequisites

1. **Figma Desktop App** (required for plugin development)
   - Download from: https://www.figma.com/downloads/
   - Web version won't work for plugin development

2. **Node.js** (v16+)
   - Check: `node --version`

### Installation

```bash
# Navigate to plugin directory
cd figma-plugin

# Install dependencies
npm install

# Build the plugin
npm run build
```

This compiles `code.ts` → `code.js`

### Load Plugin in Figma

1. **Open Figma Desktop App**

2. **Open any Figma file** (or create a new one)

3. **Open Plugins Menu**
   - Mac: `Figma menu → Plugins → Development → Import plugin from manifest...`
   - Windows: `Menu → Plugins → Development → Import plugin from manifest...`

4. **Select manifest.json**
   - Navigate to: `funnel-viz-refactored/figma-plugin/manifest.json`
   - Click **Open**

5. **Run the Plugin**
   - `Plugins → Development → Find&Tell Charts`
   - The chart editor should open in a panel!

## Development Workflow

### Watch Mode

For active development, use watch mode to auto-recompile on changes:

```bash
npm run watch
```

Then in Figma:
- Make changes to `code.ts`
- Rerun the plugin (`Plugins → Development → Find&Tell Charts`)
- Changes are reflected immediately

### Testing Locally

The plugin loads the chart app from:
```
https://charts.findandtell.co?mode=figma
```

For local testing, update `ui.html` line 72:
```html
<iframe
  src="http://localhost:5175?mode=figma"
  ...
></iframe>
```

Make sure your local dev server is running:
```bash
cd ../
npm run dev
```

## How It Works

### Architecture

```
┌─────────────────────────────────────────┐
│          Figma Desktop App              │
│  ┌───────────────────────────────────┐  │
│  │  Plugin Main Thread (code.js)     │  │
│  │  - Access Figma scene             │  │
│  │  - Create/modify nodes            │  │
│  │  - Handle postMessage from UI     │  │
│  └────────────┬──────────────────────┘  │
│               │                          │
│               │ postMessage              │
│               │                          │
│  ┌────────────▼──────────────────────┐  │
│  │  Plugin UI (iframe)               │  │
│  │  https://charts.findandtell.co    │  │
│  │  - Chart editor React app         │  │
│  │  - User creates/customizes charts │  │
│  │  - Sends SVG back to plugin       │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Message Flow

1. **User creates chart** in the React app
2. **React app generates SVG** from chart
3. **React app sends message** to plugin:
   ```javascript
   parent.postMessage({
     pluginMessage: {
       type: 'insert-chart',
       svg: '<svg>...</svg>',
       name: 'Q4 Sales Chart'
     }
   }, '*');
   ```
4. **Plugin receives message** in `code.ts`
5. **Plugin creates Figma node** from SVG:
   ```typescript
   const node = figma.createNodeFromSvg(msg.svg);
   figma.currentPage.appendChild(node);
   ```
6. **Chart appears in Figma** as native vector!

## Using the Plugin

### For End Users

1. **Open the plugin** in Figma
2. **Create/customize your chart** using the embedded editor
3. **Click Export → Insert to Figma** when ready
4. **Chart appears** in your Figma canvas as editable vectors!

The "Insert to Figma" button only appears when the app is loaded within the Figma plugin (detected via `?mode=figma` URL parameter).

### Integration Details

The React app automatically detects when it's running in Figma mode and shows the "Insert to Figma" option in the Export menu. The integration uses the `useFigmaMode` hook:

```javascript
// src/shared/hooks/useFigmaMode.js
const { isFigmaMode, sendToFigma, notifyFigma } = useFigmaMode();

// In ChartEditor.jsx
const handleInsertToFigma = () => {
  const svgElement = svgRef.current?.querySelector('svg');
  const svgString = new XMLSerializer().serializeToString(svgElement);
  figma.sendToFigma(svgString, styleSettings.title);
};
```

## Troubleshooting

### Plugin not showing in Figma
- Make sure you're using **Figma Desktop App** (not web)
- Check `manifest.json` is in the correct location
- Verify `code.js` exists (run `npm run build`)

### Iframe not loading
- Check console for CORS errors
- Verify `networkAccess` in manifest.json
- Ensure chart app is deployed and accessible

### SVG not inserting
- Check browser console for errors
- Verify SVG string is valid
- Test with simple SVG first

### Changes not reflected
- Rerun the plugin after making changes
- Use `npm run watch` for auto-compilation
- Clear Figma cache if needed

## Publishing to Figma Community

Once ready:

1. **Add icon** (128x128 PNG)
   - Save as `icon.png` in plugin directory
   - Add to manifest.json: `"icon": "icon.png"`

2. **Add description & screenshots**
   - Update manifest.json with full description
   - Take screenshots of plugin in action

3. **Test thoroughly**
   - Test on Mac & Windows
   - Try with different chart types
   - Verify Google Sheets integration

4. **Publish**
   - `Plugins → Development → Publish plugin`
   - Fill out listing information
   - Submit for review

## License

MIT

## Support

- 📧 Email: support@findandtell.com
- 🌐 Website: https://findandtell.com
- 📖 Docs: https://findandtell.com/docs
