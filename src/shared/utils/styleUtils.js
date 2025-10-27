/**
 * Style file utilities for saving and loading chart styles
 */

/**
 * Download style settings as a JSON file
 * @param {Object} settings - The style settings object from exportSettings()
 * @param {Object} metadata - Additional metadata (name, description, chartType)
 */
export const downloadStyleFile = (settings, metadata) => {
  const { name, description, chartType } = metadata;

  // Create the complete style file with metadata
  const styleFile = {
    ...settings,
    metadata: {
      name: name || "Untitled Style",
      description: description || "",
      chartType: chartType || "slope",
      createdDate: new Date().toISOString(),
      author: "User",
    },
  };

  // Convert to JSON string with pretty formatting
  const jsonString = JSON.stringify(styleFile, null, 2);

  // Create a Blob from the JSON string
  const blob = new Blob([jsonString], { type: "application/json" });

  // Create a download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;

  // Generate filename: Title-ChartType-style-Date.json
  const date = new Date().toISOString().split('T')[0];
  const sanitizedName = name
    .replace(/[^a-z0-9]/gi, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
  link.download = `${sanitizedName}-${chartType}-style-${date}.json`;

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Upload and parse a style file
 * @param {File} file - The uploaded file
 * @returns {Promise<Object>} - Parsed style settings
 */
export const uploadStyleFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const parsed = JSON.parse(content);

        // Validate that it's a style file
        if (!parsed.styleVersion) {
          reject(new Error("Invalid style file: missing styleVersion"));
          return;
        }

        resolve(parsed);
      } catch (error) {
        reject(new Error("Failed to parse style file: " + error.message));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
};

/**
 * Validate style file version compatibility
 * @param {Object} styleFile - The parsed style file
 * @param {string} currentVersion - Current app version
 * @returns {Object} - { compatible: boolean, warnings: string[] }
 */
export const validateStyleVersion = (styleFile, currentVersion = "2.0.0") => {
  const warnings = [];

  if (!styleFile.styleVersion) {
    warnings.push("Style file is from an older version and may not be fully compatible");
  }

  if (styleFile.appVersion && styleFile.appVersion !== currentVersion) {
    warnings.push(`Style was created with version ${styleFile.appVersion}, current version is ${currentVersion}`);
  }

  return {
    compatible: true, // For now, we'll always try to import
    warnings,
  };
};

/**
 * Generate a suggested style name based on chart title and type
 * @param {string} title - Chart title
 * @param {string} chartType - Chart type
 * @returns {string} - Suggested style name
 */
export const generateStyleName = (title, chartType) => {
  if (!title || title.trim() === "") {
    return `${chartType}-chart-style`;
  }
  return title;
};
