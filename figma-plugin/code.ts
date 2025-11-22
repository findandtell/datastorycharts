/**
 * Find&Tell Charts - Figma Plugin
 * Main plugin code that communicates with the UI iframe
 */

// Show the plugin UI (iframe)
figma.showUI(__html__, {
  width: 1600,
  height: 1000,
  themeColors: true,
});

// Listen for messages from the UI
figma.ui.onmessage = async (msg) => {
  console.log('[Figma Plugin] Received message:', msg.type);

  switch (msg.type) {
    case 'insert-chart':
      await handleInsertChart(msg);
      break;

    case 'load-from-selection':
      await handleLoadFromSelection();
      break;

    case 'close-plugin':
      figma.closePlugin();
      break;

    case 'resize':
      figma.ui.resize(msg.width, msg.height);
      break;

    case 'notify':
      figma.notify(msg.message, { timeout: msg.timeout || 2000 });
      break;

    default:
      console.log('[Figma Plugin] Unknown message type:', msg.type);
  }
};

/**
 * Insert chart SVG into Figma as native vector nodes
 */
async function handleInsertChart(msg: {
  svg: string;
  name: string;
  width?: number;
  height?: number;
  chartConfig?: any;
}) {
  try {
    console.log('[Figma Plugin] Inserting chart:', msg.name);

    // Create node from SVG string
    const node = figma.createNodeFromSvg(msg.svg);

    // Set name for the chart
    node.name = msg.name || 'Find&Tell Chart';

    // Save chart configuration to node for later reload
    if (msg.chartConfig) {
      node.setPluginData('chartConfig', JSON.stringify(msg.chartConfig));
      console.log('[Figma Plugin] Saved chart configuration to node');
    }

    // Position at viewport center
    const viewport = figma.viewport.center;
    node.x = viewport.x - (node.width / 2);
    node.y = viewport.y - (node.height / 2);

    // Add to current page
    figma.currentPage.appendChild(node);

    // Select the newly created chart
    figma.currentPage.selection = [node];

    // Zoom to fit
    figma.viewport.scrollAndZoomIntoView([node]);

    // Notify user
    figma.notify('✅ Chart inserted! (Select & reload anytime)', { timeout: 3000 });

    console.log('[Figma Plugin] Chart inserted successfully');
  } catch (error: any) {
    console.error('[Figma Plugin] Error inserting chart:', error);
    const errorMessage = error && error.message ? error.message : 'Unknown error';
    figma.notify('❌ Error inserting chart: ' + errorMessage, {
      timeout: 5000,
      error: true,
    });
  }
}

/**
 * Load chart configuration from selected node in Figma
 */
async function handleLoadFromSelection() {
  try {
    const selection = figma.currentPage.selection;

    if (selection.length === 0) {
      figma.notify('⚠️ Please select a Find&Tell chart first', { timeout: 3000 });
      return;
    }

    const node = selection[0];
    const configJson = node.getPluginData('chartConfig');

    if (!configJson) {
      figma.notify('⚠️ Selected object is not a Find&Tell chart', { timeout: 3000 });
      return;
    }

    console.log('[Figma Plugin] Loading chart configuration from node:', node.name);

    const chartConfig = JSON.parse(configJson);

    // Send configuration back to UI
    figma.ui.postMessage({
      type: 'load-chart-config',
      config: chartConfig,
    });

    figma.notify('✅ Chart configuration loaded!', { timeout: 2000 });
    console.log('[Figma Plugin] Chart configuration sent to UI');
  } catch (error: any) {
    console.error('[Figma Plugin] Error loading chart configuration:', error);
    const errorMessage = error && error.message ? error.message : 'Unknown error';
    figma.notify('❌ Error loading chart: ' + errorMessage, {
      timeout: 3000,
      error: true,
    });
  }
}

// Log plugin initialization
console.log('[Figma Plugin] Find&Tell Charts plugin initialized');
