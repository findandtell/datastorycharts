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
    .addItem('Create Chart', 'showSidebar')
    .addItem('Help & Documentation', 'showHelp')
    .addSeparator()
    .addItem('About', 'showAbout')
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
 * Opens the main chart creation sidebar.
 */
function showSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('Sidebar')
    .setTitle('Find&Tell Charts')
    .setWidth(420);

  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Opens a help dialog.
 */
function showHelp() {
  const html = HtmlService.createHtmlOutput(
    '<h2>Find&Tell Charts Help</h2>' +
    '<p>1. Select data in your spreadsheet (including headers)</p>' +
    '<p>2. Click "Find&Tell Charts" → "Create Chart"</p>' +
    '<p>3. Choose your chart type and customize styling</p>' +
    '<p>4. Export your chart as PNG, SVG, or save the complete chart state</p>' +
    '<br><p><a href="https://findandtell.com/docs" target="_blank">View Full Documentation</a></p>'
  )
    .setWidth(400)
    .setHeight(300);

  SpreadsheetApp.getUi().showModalDialog(html, 'Help');
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
 * @param {string} imageBase64 Base64 encoded image data
 * @param {string} imageFormat Format of the image (png, svg)
 * @return {object} Result of the insertion
 */
function insertChartToSheet(imageBase64, imageFormat) {
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

    // Insert image at current cell
    sheet.insertImage(blob, cell.getColumn(), cell.getRow());

    return {
      success: true,
      message: 'Chart inserted successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: 'Error inserting chart: ' + error.message
    };
  }
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
