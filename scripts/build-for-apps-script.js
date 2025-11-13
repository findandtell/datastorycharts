/**
 * Build script to create an inline HTML file for Google Apps Script
 * This combines the built React app (HTML, CSS, JS) into a single file
 * that can be served directly by Apps Script HTML Service
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '..', 'dist');
const outputDir = path.join(__dirname, '..', 'google-sheets-addon');
const outputFile = path.join(outputDir, 'SidebarInline.html');

console.log('Building inline HTML for Apps Script...');

// Read the built index.html
const indexPath = path.join(distDir, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('Error: dist/index.html not found. Run "npm run build" first.');
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf8');

// Find CSS file
const cssMatch = html.match(/<link rel="stylesheet" crossorigin href="([^"]+)">/);
if (cssMatch) {
  const cssFile = cssMatch[1];
  const cssPath = path.join(distDir, cssFile);

  if (fs.existsSync(cssPath)) {
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    const inlineStyle = `<style>${cssContent}</style>`;
    html = html.replace(cssMatch[0], inlineStyle);
    console.log(`✓ Inlined CSS: ${cssFile} (${(cssContent.length / 1024).toFixed(2)} KB)`);
  }
}

// Find JS file
const jsMatch = html.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/);
if (jsMatch) {
  const jsFile = jsMatch[1];
  const jsPath = path.join(distDir, jsFile);

  if (fs.existsSync(jsPath)) {
    const jsContent = fs.readFileSync(jsPath, 'utf8');
    const inlineScript = `<script type="module">${jsContent}</script>`;
    html = html.replace(jsMatch[0], inlineScript);
    console.log(`✓ Inlined JS: ${jsFile} (${(jsContent.length / 1024).toFixed(2)} KB)`);
  }
}

// Add Apps Script specific wrapper
const appsScriptAPI = `
<script>
  // Inject Google Apps Script API into window BEFORE React loads
  window.googleSheetsAPI = {
    getSelectedData: function(callback) {
      console.log('[Apps Script API] getSelectedData called');
      google.script.run
        .withSuccessHandler(function(result) {
          console.log('[Apps Script API] Data retrieved:', result);
          callback(null, result);
        })
        .withFailureHandler(function(error) {
          console.error('[Apps Script API] Error getting data:', error);
          callback(error, null);
        })
        .getSelectedData();
    },

    insertChart: function(imageBase64, format, chartState, callback) {
      console.log('[Apps Script API] insertChart called');
      google.script.run
        .withSuccessHandler(function(result) {
          console.log('[Apps Script API] Chart inserted:', result);
          callback(null, result);
        })
        .withFailureHandler(function(error) {
          console.error('[Apps Script API] Error inserting chart:', error);
          callback(error, null);
        })
        .insertChartToSheet(imageBase64, format, chartState);
    },

    logUsage: function(action, metadata) {
      console.log('[Apps Script API] logUsage called:', action);
      google.script.run
        .withSuccessHandler(function() {
          console.log('[Apps Script API] Usage logged');
        })
        .withFailureHandler(function(error) {
          console.error('[Apps Script API] Error logging usage:', error);
        })
        .logUsage(action, metadata);
    },

    getUserInfo: function(callback) {
      console.log('[Apps Script API] getUserInfo called');
      google.script.run
        .withSuccessHandler(function(userInfo) {
          google.script.run
            .withSuccessHandler(function(license) {
              callback(null, { user: userInfo.user, license: license.license });
            })
            .withFailureHandler(function(error) {
              callback(error, null);
            })
            .checkLicense();
        })
        .withFailureHandler(function(error) {
          callback(error, null);
        })
        .getUserInfo();
    }
  };

  console.log('[Apps Script API] API injected into window. React app will now load.');
</script>
`;

// Insert the API script right after <head> tag
html = html.replace('<head>', '<head>\n  <base target="_top">' + appsScriptAPI);

// Write the output file
fs.writeFileSync(outputFile, html, 'utf8');

const finalSize = (html.length / 1024).toFixed(2);
console.log(`\n✓ Inline HTML created: ${outputFile}`);
console.log(`  Total size: ${finalSize} KB`);
console.log('\nNext steps:');
console.log('1. Copy the contents of google-sheets-addon/SidebarInline.html');
console.log('2. Create or replace Sidebar.html in your Apps Script project');
console.log('3. Deploy and test!');
