/**
 * Find&Tell Charts - Google Sheets Add-on
 * Main Apps Script code for the add-on
 */

/**
 * Creates a menu entry in the Google Sheets UI when the document is opened.
 * @param {object} e The event parameter for a simple onOpen trigger.
 */
function onOpen(e) {
  SpreadsheetApp.getUi()
    .createMenu('Find&Tell Charts')
    .addItem('📊 Create New Chart', 'openInBrowser')
    .addItem('🔄 Update Open Chart', 'updateOpenChart')
    .addSeparator()
    .addItem('❓ Help & Documentation', 'showHelp')
    .addToUi();
}

/**
 * Runs when the add-on is installed.
 * @param {object} e The event parameter for a simple onInstall trigger.
 */
function onInstall(e) {
  onOpen(e);
}

/**
 * Opens chart editor in a new browser tab with selected data.
 */
function openInBrowser() {
  const result = getSelectedData();

  if (!result.success) {
    SpreadsheetApp.getUi().alert(
      '⚠️ Please select your data first!\n\n' +
      '1. Select the cells containing your data (including headers)\n' +
      '2. Click "Find&Tell Charts" → "📊 Create New Chart" again\n\n' +
      'The chart editor will open in a new browser tab.'
    );
    return;
  }

  // Encode CSV data for URL
  const encodedCSV = encodeURIComponent(result.data.csv);
  const timestamp = new Date().getTime();

  // Get the current spreadsheet URL for "Back to Sheets" functionality
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheetsUrl = spreadsheet.getUrl();
  const encodedSheetsUrl = encodeURIComponent(sheetsUrl);

  // Create HTML with redirect
  const html = HtmlService.createHtmlOutput(
    '<html><head><style>' +
    'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; ' +
    'padding: 30px; text-align: center; background: #f9fafb; }' +
    'h2 { color: #111827; margin-bottom: 10px; }' +
    'p { color: #6b7280; margin-bottom: 20px; }' +
    '.success { color: #059669; font-weight: 500; }' +
    '</style></head><body>' +
    '<h2>✅ Opening Chart Editor...</h2>' +
    '<p class="success">Your chart editor is opening in a new tab!</p>' +
    '<p><small>If it doesn\'t open automatically, check your pop-up blocker.</small></p>' +
    '<script>' +
    'var chartWindow = window.open("https://charts.findandtell.co?csv=' + encodedCSV + '&sheetsUrl=' + encodedSheetsUrl + '&t=' + timestamp + '", "findtell_chart_' + timestamp + '");' +
    'if (chartWindow) {' +
    '  setTimeout(function() { google.script.host.close(); }, 1500);' +
    '} else {' +
    '  document.body.innerHTML = "<h2>⚠️ Pop-up Blocked</h2><p>Please allow pop-ups for this site and try again.</p>";' +
    '}' +
    '</script>' +
    '</body></html>'
  )
    .setWidth(400)
    .setHeight(200);

  SpreadsheetApp.getUi().showModalDialog(html, 'Find&Tell Charts');
}

/**
 * Updates data in an already-open chart window.
 * Generates a shareable link that user can use to refresh their chart.
 */
function updateOpenChart() {
  const result = getSelectedData();

  if (!result.success) {
    SpreadsheetApp.getUi().alert(
      '⚠️ Please select your data first!\n\n' +
      '1. Select the cells containing your updated data (including headers)\n' +
      '2. Click "Find&Tell Charts" → "🔄 Update Open Chart" again'
    );
    return;
  }

  // Encode CSV data for URL
  const encodedCSV = encodeURIComponent(result.data.csv);
  const timestamp = new Date().getTime();

  // Get the current spreadsheet URL for "Back to Sheets" functionality
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheetsUrl = spreadsheet.getUrl();
  const encodedSheetsUrl = encodeURIComponent(sheetsUrl);

  const updateUrl = 'https://charts.findandtell.co?csv=' + encodedCSV + '&sheetsUrl=' + encodedSheetsUrl + '&t=' + timestamp;

  // Create HTML with update instructions
  const html = HtmlService.createHtmlOutput(
    '<html><head><style>' +
    'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; ' +
    'padding: 30px; background: #f9fafb; }' +
    'h2 { color: #111827; margin-bottom: 15px; }' +
    '.instructions { background: white; padding: 20px; border-radius: 8px; ' +
    'border: 1px solid #e5e7eb; margin-bottom: 20px; }' +
    '.step { margin: 10px 0; color: #374151; }' +
    '.step-number { display: inline-block; width: 24px; height: 24px; ' +
    'background: #06b6d4; color: white; border-radius: 50%; text-align: center; ' +
    'line-height: 24px; margin-right: 8px; font-weight: 600; font-size: 14px; }' +
    'button { background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); ' +
    'color: white; border: none; padding: 12px 24px; border-radius: 6px; ' +
    'font-size: 15px; font-weight: 600; cursor: pointer; width: 100%; ' +
    'margin-top: 15px; }' +
    'button:hover { background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); }' +
    '.url-box { background: #f3f4f6; padding: 12px; border-radius: 6px; ' +
    'border: 1px solid #d1d5db; font-family: monospace; font-size: 12px; ' +
    'word-break: break-all; margin: 15px 0; color: #374151; }' +
    '.success { color: #059669; font-weight: 500; text-align: center; ' +
    'display: none; margin-top: 15px; }' +
    '</style></head><body>' +
    '<h2>🔄 Update Your Chart</h2>' +
    '<div class="instructions">' +
    '<div class="step"><span class="step-number">1</span>Switch to your chart editor tab</div>' +
    '<div class="step"><span class="step-number">2</span>Click the "Refresh Data" button below</div>' +
    '<div class="step"><span class="step-number">3</span>Your chart will reload with the new data!</div>' +
    '</div>' +
    '<button onclick="updateChart()">🔄 Refresh Chart in Open Tab</button>' +
    '<p class="success" id="success">✅ Update sent! Check your chart tab.</p>' +
    '<script>' +
    'function updateChart() {' +
    '  var chartWindow = window.open("' + updateUrl + '", "findtell_chart");' +
    '  if (chartWindow) {' +
    '    chartWindow.focus();' +
    '    document.getElementById("success").style.display = "block";' +
    '    setTimeout(function() { google.script.host.close(); }, 2000);' +
    '  } else {' +
    '    alert("Could not find open chart tab. Click OK to open a new tab.");' +
    '    window.open("' + updateUrl + '", "_blank");' +
    '  }' +
    '}' +
    '</script>' +
    '</body></html>'
  )
    .setWidth(500)
    .setHeight(350);

  SpreadsheetApp.getUi().showModalDialog(html, 'Update Chart Data');
}

/**
 * Loads a saved chart from a .json file.
 * Shows a file picker dialog for the user to select their chart JSON file.
 */
function loadChartFromFile() {
  const html = HtmlService.createHtmlOutput(
    '<html><head><style>' +
    'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; ' +
    'padding: 30px; background: #f9fafb; }' +
    'h2 { color: #111827; margin-bottom: 15px; }' +
    'p { color: #6b7280; margin-bottom: 20px; line-height: 1.6; }' +
    '.file-input-wrapper { position: relative; margin: 20px 0; }' +
    'input[type="file"] { display: none; }' +
    '.file-button { display: block; width: 100%; padding: 40px 20px; ' +
    'background: white; border: 2px dashed #d1d5db; border-radius: 8px; ' +
    'text-align: center; cursor: pointer; transition: all 0.2s; }' +
    '.file-button:hover { border-color: #06b6d4; background: #f0f9ff; }' +
    '.file-icon { font-size: 48px; margin-bottom: 10px; }' +
    '.file-text { color: #374151; font-weight: 500; }' +
    '.file-subtext { color: #9ca3af; font-size: 14px; margin-top: 5px; }' +
    '.selected-file { background: #ecfdf5; padding: 12px; border-radius: 6px; ' +
    'margin: 15px 0; color: #065f46; font-weight: 500; display: none; }' +
    '.error { background: #fee2e2; padding: 12px; border-radius: 6px; ' +
    'margin: 15px 0; color: #991b1b; display: none; }' +
    '.loading { text-align: center; color: #6b7280; display: none; padding: 20px; }' +
    '</style></head><body onload="alert(\'✅ Dialog Loaded - v3.1\');">' +
    '<h2>📂 Load Saved Chart</h2>' +
    '<div style="background: #dcfce7; padding: 8px; border-radius: 4px; margin-bottom: 15px; text-align: center; font-weight: 600; color: #166534;">VERSION 3.1 - DEBUGGING ENABLED</div>' +
    '<p>Select a chart JSON file that you previously saved from the chart editor.</p>' +
    '<div class="file-input-wrapper">' +
    '<label for="fileInput" class="file-button">' +
    '<div class="file-icon">📁</div>' +
    '<div class="file-text">Click to select chart JSON file</div>' +
    '<div class="file-subtext">or drag and drop here</div>' +
    '</label>' +
    '<input type="file" id="fileInput" accept=".json,application/json" />' +
    '</div>' +
    '<div class="selected-file" id="selectedFile"></div>' +
    '<div class="error" id="error"></div>' +
    '<div class="loading" id="loading">🎨 Loading chart editor...</div>' +
    '<script>' +
    'var fileInput = document.getElementById("fileInput");' +
    'var selectedFileDiv = document.getElementById("selectedFile");' +
    'var errorDiv = document.getElementById("error");' +
    'var loadingDiv = document.getElementById("loading");' +
    '' +
    'console.log("[Load Chart] Script loaded");' +
    'alert("✅ Load Chart Dialog Loaded - v3.0");' +
    '' +
    'fileInput.addEventListener("change", function(event) {' +
    '  console.log("[Load Chart] File input change event fired");' +
    '  var file = event.target.files[0];' +
    '  console.log("[Load Chart] File:", file);' +
    '  ' +
    '  if (!file) {' +
    '    console.log("[Load Chart] No file selected");' +
    '    return;' +
    '  }' +
    '  ' +
    '  // Check file extension' +
    '  if (!file.name.endsWith(".json")) {' +
    '    console.log("[Load Chart] Wrong file type:", file.name);' +
    '    errorDiv.textContent = "⚠️ Please select a .json file";' +
    '    errorDiv.style.display = "block";' +
    '    selectedFileDiv.style.display = "none";' +
    '    return;' +
    '  }' +
    '  ' +
    '  console.log("[Load Chart] Valid JSON file selected:", file.name);' +
    '  selectedFileDiv.textContent = "✓ Selected: " + file.name;' +
    '  selectedFileDiv.style.display = "block";' +
    '  errorDiv.style.display = "none";' +
    '  ' +
    '  // Read the file' +
    '  var reader = new FileReader();' +
    '  console.log("[Load Chart] Starting file read...");' +
    '  ' +
    '  reader.onload = function(e) {' +
    '    console.log("[Load Chart] File read complete");' +
    '    try {' +
    '      var jsonString = e.target.result;' +
    '      console.log("[Load Chart] JSON string length:", jsonString.length);' +
    '      ' +
    '      // Validate JSON' +
    '      var jsonObj = JSON.parse(jsonString);' +
    '      console.log("[Load Chart] JSON parsed successfully");' +
    '      ' +
    '      // Encode and create URL' +
    '      var encodedJson = encodeURIComponent(jsonString);' +
    '      var timestamp = new Date().getTime();' +
    '      var url = "https://charts.findandtell.co?chartState=" + encodedJson + "&t=" + timestamp;' +
    '      console.log("[Load Chart] URL length:", url.length);' +
    '      ' +
    '      // Check URL length' +
    '      if (url.length > 8000) {' +
    '        console.error("[Load Chart] URL too large:", url.length);' +
    '        errorDiv.textContent = "⚠️ Chart JSON is too large (" + url.length + " chars). Maximum is 8000 characters.";' +
    '        errorDiv.style.display = "block";' +
    '        return;' +
    '      }' +
    '      ' +
    '      // Show loading' +
    '      loadingDiv.style.display = "block";' +
    '      console.log("[Load Chart] Opening window with URL:", url.substring(0, 100) + "...");' +
    '      ' +
    '      // Open chart editor' +
    '      var chartWindow = window.open(url, "findtell_chart_" + timestamp);' +
    '      console.log("[Load Chart] window.open returned:", chartWindow);' +
    '      ' +
    '      if (chartWindow) {' +
    '        console.log("[Load Chart] Window opened successfully!");' +
    '        chartWindow.focus();' +
    '        setTimeout(function() { ' +
    '          console.log("[Load Chart] Closing dialog...");' +
    '          google.script.host.close(); ' +
    '        }, 1500);' +
    '      } else {' +
    '        console.error("[Load Chart] Window was blocked!");' +
    '        errorDiv.textContent = "⚠️ Pop-up blocked! Please allow pop-ups and try again.";' +
    '        errorDiv.style.display = "block";' +
    '        loadingDiv.style.display = "none";' +
    '      }' +
    '    } catch (error) {' +
    '      console.error("[Load Chart] Error:", error);' +
    '      errorDiv.textContent = "⚠️ Error: " + error.message;' +
    '      errorDiv.style.display = "block";' +
    '      loadingDiv.style.display = "none";' +
    '    }' +
    '  };' +
    '  ' +
    '  reader.onerror = function(error) {' +
    '    console.error("[Load Chart] File read error:", error);' +
    '    errorDiv.textContent = "⚠️ Error reading file: " + error;' +
    '    errorDiv.style.display = "block";' +
    '  };' +
    '  ' +
    '  reader.readAsText(file);' +
    '  console.log("[Load Chart] File read initiated");' +
    '});' +
    '' +
    '// Drag and drop support' +
    'var dropZone = document.querySelector(".file-button");' +
    'dropZone.addEventListener("dragover", function(e) {' +
    '  e.preventDefault();' +
    '  this.style.borderColor = "#06b6d4";' +
    '  this.style.background = "#f0f9ff";' +
    '});' +
    'dropZone.addEventListener("dragleave", function(e) {' +
    '  this.style.borderColor = "#d1d5db";' +
    '  this.style.background = "white";' +
    '});' +
    'dropZone.addEventListener("drop", function(e) {' +
    '  e.preventDefault();' +
    '  this.style.borderColor = "#d1d5db";' +
    '  this.style.background = "white";' +
    '  fileInput.files = e.dataTransfer.files;' +
    '  fileInput.dispatchEvent(new Event("change"));' +
    '});' +
    '</script>' +
    '</body></html>'
  )
    .setWidth(500)
    .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, 'Load Saved Chart');
}

/**
 * Renders a chart from JSON pasted in a cell.
 * Reads the selected cell, extracts chart JSON, and opens the chart editor.
 */
function renderChartFromJson() {
  const ui = SpreadsheetApp.getUi();
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getActiveRange();

  if (!range) {
    ui.alert(
      '⚠️ No cell selected!\n\n' +
      'Please select a cell containing chart JSON and try again.'
    );
    return;
  }

  // Get the JSON from the selected cell(s)
  let jsonString = '';

  if (range.getNumRows() === 1 && range.getNumColumns() === 1) {
    // Single cell
    jsonString = range.getValue();
  } else {
    // Multiple cells - concatenate them
    const values = range.getValues();
    jsonString = values.map(row => row.join('')).join('');
  }

  if (!jsonString || jsonString.trim() === '') {
    ui.alert(
      '⚠️ Cell is empty!\n\n' +
      'Please paste your chart JSON into a cell first, then select it and try again.'
    );
    return;
  }

  // Validate it's valid JSON
  try {
    JSON.parse(jsonString);
  } catch (error) {
    ui.alert(
      '⚠️ Invalid JSON!\n\n' +
      'The selected cell does not contain valid JSON.\n\n' +
      'Error: ' + error.message
    );
    return;
  }

  // Encode the JSON for URL
  const encodedJson = encodeURIComponent(jsonString);
  const timestamp = new Date().getTime();

  // Check URL length (browsers have limits around 2000-8000 chars)
  const url = 'https://charts.findandtell.co?chartState=' + encodedJson + '&t=' + timestamp;

  if (url.length > 8000) {
    ui.alert(
      '⚠️ Chart JSON is too large!\n\n' +
      'The chart configuration is too large to pass via URL (' + url.length + ' characters).\n\n' +
      'Try using "📝 Edit Chart by ID" instead, which stores the state in document properties.'
    );
    return;
  }

  // Open chart editor with the JSON loaded
  const html = HtmlService.createHtmlOutput(
    '<html><head><style>' +
    'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; ' +
    'padding: 30px; text-align: center; background: #f9fafb; }' +
    'h2 { color: #111827; margin-bottom: 10px; }' +
    'p { color: #6b7280; margin-bottom: 20px; }' +
    '.success { color: #059669; font-weight: 500; }' +
    '</style></head><body>' +
    '<h2>🎨 Loading Chart...</h2>' +
    '<p class="success">Opening chart editor with your configuration!</p>' +
    '<p><small>The chart will render in a new tab.</small></p>' +
    '<script>' +
    'var chartWindow = window.open("' + url + '", "findtell_chart_' + timestamp + '");' +
    'if (chartWindow) {' +
    '  setTimeout(function() { google.script.host.close(); }, 1500);' +
    '} else {' +
    '  document.body.innerHTML = "<h2>⚠️ Pop-up Blocked</h2><p>Please allow pop-ups for this site and try again.</p>";' +
    '}' +
    '</script>' +
    '</body></html>'
  )
    .setWidth(400)
    .setHeight(200);

  ui.showModalDialog(html, 'Render Chart from JSON');
}

/**
 * Shows instructions for inserting charts back into sheets.
 */
function showInsertHelp() {
  const html = HtmlService.createHtmlOutput(
    '<html><head><style>' +
    'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; ' +
    'padding: 25px; background: #f9fafb; line-height: 1.6; }' +
    'h2 { color: #111827; margin-bottom: 20px; }' +
    '.method { background: white; padding: 20px; border-radius: 8px; ' +
    'border: 1px solid #e5e7eb; margin-bottom: 15px; }' +
    '.method-title { font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 12px; }' +
    '.step { margin: 10px 0 10px 20px; color: #374151; }' +
    '.highlight { background: #dbeafe; padding: 2px 6px; border-radius: 3px; ' +
    'font-weight: 500; color: #1e40af; }' +
    '.tip { background: #ecfdf5; border-left: 4px solid #10b981; padding: 12px; ' +
    'margin: 15px 0; border-radius: 4px; color: #065f46; font-size: 14px; }' +
    'h3 { color: #059669; font-size: 14px; font-weight: 600; margin: 0 0 8px 0; }' +
    '</style></head><body>' +
    '<h2>📥 How to Insert Charts into Google Sheets</h2>' +
    '<div class="method">' +
    '<div class="method-title">Method 1: Download and Insert (Recommended)</div>' +
    '<div class="step">1️⃣ In the chart editor, click <span class="highlight">💾 Save Chart</span></div>' +
    '<div class="step">2️⃣ Choose <span class="highlight">Download PNG</span> or <span class="highlight">Download SVG</span></div>' +
    '<div class="step">3️⃣ Back in Google Sheets, click <span class="highlight">Insert → Image → Upload from computer</span></div>' +
    '<div class="step">4️⃣ Select your downloaded chart file</div>' +
    '<div class="step">5️⃣ Position and resize the chart as needed!</div>' +
    '</div>' +
    '<div class="method">' +
    '<div class="method-title">Method 2: Copy and Paste (Quick)</div>' +
    '<div class="step">1️⃣ Right-click your chart in the editor</div>' +
    '<div class="step">2️⃣ Select <span class="highlight">Copy image</span></div>' +
    '<div class="step">3️⃣ Back in Google Sheets, press <span class="highlight">Ctrl+V</span> (or Cmd+V on Mac)</div>' +
    '<div class="step">4️⃣ Your chart appears in the sheet!</div>' +
    '</div>' +
    '<div class="method">' +
    '<div class="method-title">Method 3: From Saved JSON (Advanced)</div>' +
    '<div class="step">1️⃣ In chart editor, click <span class="highlight">💾 Save Chart → Download State (JSON)</span></div>' +
    '<div class="step">2️⃣ Open the JSON file and copy its contents</div>' +
    '<div class="step">3️⃣ Paste the JSON into any cell in Google Sheets</div>' +
    '<div class="step">4️⃣ Select that cell → <span class="highlight">Find&Tell Charts → 🎨 Render Chart from JSON</span></div>' +
    '<div class="step">5️⃣ Chart opens with your saved configuration!</div>' +
    '<div class="step">6️⃣ Download or copy-paste the chart back to Sheets</div>' +
    '</div>' +
    '<div class="tip">' +
    '<h3>💡 Pro Tip: JSON = Reusable Chart Templates!</h3>' +
    'Save chart JSON in your sheet to create reusable templates. Just paste it in a cell and click ' +
    '<strong>🎨 Render Chart from JSON</strong> anytime to regenerate the chart with different data!' +
    '</div>' +
    '</body></html>'
  )
    .setWidth(550)
    .setHeight(550);

  SpreadsheetApp.getUi().showModalDialog(html, 'Insert Charts into Sheets');
}

/**
 * Opens a help dialog.
 */
function showHelp() {
  const html = HtmlService.createHtmlOutput(
    '<html><head><style>' +
    'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; ' +
    'padding: 25px; background: #f9fafb; line-height: 1.6; }' +
    'h2 { color: #111827; margin-bottom: 20px; }' +
    '.workflow { background: white; padding: 20px; border-radius: 8px; ' +
    'border: 1px solid #e5e7eb; margin-bottom: 15px; }' +
    '.step { margin: 12px 0; color: #374151; display: flex; align-items: start; }' +
    '.step-number { display: inline-block; min-width: 28px; height: 28px; ' +
    'background: #06b6d4; color: white; border-radius: 50%; text-align: center; ' +
    'line-height: 28px; margin-right: 12px; font-weight: 600; font-size: 14px; ' +
    'flex-shrink: 0; }' +
    '.step-text { flex: 1; padding-top: 4px; }' +
    'h3 { color: #374151; font-size: 16px; margin: 20px 0 10px 0; }' +
    '.tip { background: #ecfdf5; border-left: 4px solid #10b981; padding: 12px; ' +
    'margin: 15px 0; border-radius: 4px; color: #065f46; font-size: 14px; }' +
    'a { color: #06b6d4; text-decoration: none; font-weight: 500; }' +
    'a:hover { text-decoration: underline; }' +
    '</style></head><body>' +
    '<h2>📊 Find&Tell Charts - Quick Start</h2>' +
    '<div class="workflow">' +
    '<h3>Simple 3-Step Workflow:</h3>' +
    '<div class="step">' +
    '  <span class="step-number">1</span>' +
    '  <span class="step-text"><strong>Create:</strong> Select your data → <strong>Find&Tell Charts → 📊 Create New Chart</strong></span>' +
    '</div>' +
    '<div class="step">' +
    '  <span class="step-number">2</span>' +
    '  <span class="step-text"><strong>Edit:</strong> Customize your chart in the editor → Click <strong>💾 Save Chart → Download PNG/SVG</strong></span>' +
    '</div>' +
    '<div class="step">' +
    '  <span class="step-number">3</span>' +
    '  <span class="step-text"><strong>Insert:</strong> Click <strong>← Back to Sheets</strong> → <strong>Insert → Image → Upload from computer</strong></span>' +
    '</div>' +
    '</div>' +
    '<div class="workflow">' +
    '<h3>Updating Charts with New Data:</h3>' +
    '<div class="step">' +
    '  <span class="step-number">1</span>' +
    '  <span class="step-text">Keep the chart editor tab open</span>' +
    '</div>' +
    '<div class="step">' +
    '  <span class="step-number">2</span>' +
    '  <span class="step-text">Select new/updated data in Google Sheets</span>' +
    '</div>' +
    '<div class="step">' +
    '  <span class="step-number">3</span>' +
    '  <span class="step-text">Click <strong>Find&Tell Charts → 🔄 Update Open Chart</strong></span>' +
    '</div>' +
    '<div class="step">' +
    '  <span class="step-number">4</span>' +
    '  <span class="step-text">Your chart automatically refreshes with the new data!</span>' +
    '</div>' +
    '</div>' +
    '<div class="tip">' +
    '✨ <strong>Pro Tips:</strong><br>' +
    '• Use Alt+Tab (Windows) or ⌘+Tab (Mac) to quickly switch between Sheets and Chart Editor<br>' +
    '• Download chart as SVG for best quality when resizing in Sheets<br>' +
    '• Save chart state as JSON to preserve your styling for future charts' +
    '</div>' +
    '<p style="text-align: center; margin-top: 20px;">' +
    '<a href="https://findandtell.com/docs" target="_blank">📖 View Full Documentation</a>' +
    '</p>' +
    '</body></html>'
  )
    .setWidth(550)
    .setHeight(550);

  SpreadsheetApp.getUi().showModalDialog(html, 'Find&Tell Charts - Help');
}

/**
 * Opens an about dialog.
 */
function showAbout() {
  const html = HtmlService.createHtmlOutput(
    '<div style="text-align: center; padding: 20px;">' +
    '<h2>Find&Tell Charts</h2>' +
    '<p>Version 1.0.0</p>' +
    '<p>Professional data visualization for Google Sheets</p>' +
    '<br>' +
    '<p><a href="https://findandtell.com" target="_blank">Visit Website</a></p>' +
    '<p><a href="mailto:support@findandtell.com">Contact Support</a></p>' +
    '</div>'
  )
    .setWidth(350)
    .setHeight(250);

  SpreadsheetApp.getUi().showModalDialog(html, 'About Find&Tell Charts');
}

/**
 * Gets the currently selected range data from the active sheet.
 * @return {object} Object containing the selected data and metadata
 */
function getSelectedData() {
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const range = sheet.getActiveRange();

    if (!range) {
      return {
        success: false,
        error: 'No range selected. Please select data in your spreadsheet first.'
      };
    }

    const values = range.getValues();

    if (values.length === 0) {
      return {
        success: false,
        error: 'Selected range is empty. Please select data with headers.'
      };
    }

    // Convert to CSV format for compatibility with the web app
    const csv = convertToCsv(values);

    return {
      success: true,
      data: {
        values: values,
        csv: csv,
        range: {
          row: range.getRow(),
          column: range.getColumn(),
          numRows: range.getNumRows(),
          numColumns: range.getNumColumns()
        },
        sheetName: sheet.getName()
      }
    };
  } catch (error) {
    return {
      success: false,
      error: 'Error reading data: ' + error.message
    };
  }
}

/**
 * Converts a 2D array to CSV string.
 * @param {Array<Array>} data 2D array of values
 * @return {string} CSV formatted string
 */
function convertToCsv(data) {
  return data.map(function(row) {
    return row.map(function(cell) {
      // Convert cell to string and escape if needed
      var cellString = String(cell);

      // Escape cells containing commas, quotes, or newlines
      if (cellString.indexOf(',') !== -1 ||
          cellString.indexOf('"') !== -1 ||
          cellString.indexOf('\n') !== -1) {
        cellString = '"' + cellString.replace(/"/g, '""') + '"';
      }

      return cellString;
    }).join(',');
  }).join('\n');
}

/**
 * Gets user information for licensing/authentication.
 * @return {object} User information
 */
function getUserInfo() {
  try {
    const user = Session.getActiveUser();
    const email = user.getEmail();

    return {
      success: true,
      user: {
        email: email,
        // We'll use email as a unique identifier
        // In production, you'd verify this with your backend
      }
    };
  } catch (error) {
    return {
      success: false,
      error: 'Error getting user info: ' + error.message
    };
  }
}

/**
 * Checks the user's license status.
 * This will call your backend API to verify the license.
 * @return {object} License information
 */
function checkLicense() {
  try {
    const userInfo = getUserInfo();

    if (!userInfo.success) {
      return userInfo;
    }

    // For now, return a default free tier
    // In production, this would call your backend API
    // Example:
    // var response = UrlFetchApp.fetch('https://funnel-viz-refactored.vercel.app/api/license/check', {
    //   method: 'POST',
    //   payload: JSON.stringify({ email: userInfo.user.email }),
    //   contentType: 'application/json'
    // });
    // return JSON.parse(response.getContentText());

    return {
      success: true,
      license: {
        tier: 'free',
        chartsRemaining: 10,
        features: {
          maxCharts: 10,
          chartTypes: ['funnel', 'bar', 'line'],
          exportFormats: ['png'],
          advancedStyling: false,
          snapshotGallery: false
        }
      }
    };
  } catch (error) {
    return {
      success: false,
      error: 'Error checking license: ' + error.message
    };
  }
}

/**
 * Inserts a chart image into the spreadsheet at the current cursor position.
 * Also stores the chart state for later editing.
 * @param {string} imageBase64 Base64 encoded image data
 * @param {string} imageFormat Format of the image (png, svg)
 * @param {string} chartState JSON string containing complete chart state
 * @return {object} Result of the insertion
 */
function insertChartToSheet(imageBase64, imageFormat, chartState) {
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const cell = sheet.getActiveCell();

    // Remove the data URL prefix if present
    var base64Data = imageBase64;
    if (imageBase64.indexOf('base64,') !== -1) {
      base64Data = imageBase64.split('base64,')[1];
    }

    // Decode base64 to blob
    var blob = Utilities.newBlob(
      Utilities.base64Decode(base64Data),
      'image/' + imageFormat,
      'chart.' + imageFormat
    );

    // Generate unique chart ID
    var chartId = 'chart_' + new Date().getTime();

    // Store chart state in document properties
    var documentProperties = PropertiesService.getDocumentProperties();
    documentProperties.setProperty(chartId, chartState);

    // Insert image at current cell
    sheet.insertImage(blob, cell.getColumn(), cell.getRow());

    return {
      success: true,
      message: 'Chart inserted successfully',
      chartId: chartId
    };
  } catch (error) {
    return {
      success: false,
      error: 'Error inserting chart: ' + error.message
    };
  }
}

/**
 * Retrieves a saved chart state by ID.
 * @param {string} chartId The ID of the chart to retrieve
 * @return {object} Result containing the chart state
 */
function getChartState(chartId) {
  try {
    var documentProperties = PropertiesService.getDocumentProperties();
    var chartState = documentProperties.getProperty(chartId);

    if (!chartState) {
      return {
        success: false,
        error: 'Chart ID not found. Please check the ID and try again.'
      };
    }

    return {
      success: true,
      chartState: chartState
    };
  } catch (error) {
    return {
      success: false,
      error: 'Error retrieving chart: ' + error.message
    };
  }
}

/**
 * Opens the chart editor with a saved chart state.
 */
function editChartById() {
  const ui = SpreadsheetApp.getUi();

  // Prompt user for chart ID
  const response = ui.prompt(
    'Edit Chart',
    'Enter the Chart ID (from when you inserted the chart):',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) {
    return;
  }

  const chartId = response.getResponseText().trim();

  if (!chartId) {
    ui.alert('Please enter a valid Chart ID.');
    return;
  }

  // Get chart state
  const result = getChartState(chartId);

  if (!result.success) {
    ui.alert('Error: ' + result.error);
    return;
  }

  // Open chart editor with the state
  const encodedState = encodeURIComponent(result.chartState);

  const html = HtmlService.createHtmlOutput(
    '<html><body>' +
    '<p>Opening chart editor...</p>' +
    '<script>' +
    'window.open("https://charts.findandtell.co?mode=addon&chartState=' + encodedState + '", "_blank");' +
    'google.script.host.close();' +
    '</script>' +
    '</body></html>'
  )
    .setWidth(300)
    .setHeight(100);

  ui.showModalDialog(html, 'Opening Chart Editor...');
}

/**
 * Logs usage for analytics (optional).
 * @param {string} action The action being logged
 * @param {object} metadata Additional metadata
 */
function logUsage(action, metadata) {
  try {
    // In production, this would send analytics to your backend
    // For now, just log to Apps Script console
    console.log('Usage:', action, metadata);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
