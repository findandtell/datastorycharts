/**
 * Export helpers for chart rendering
 */

/**
 * Export SVG element as PNG with embedded fonts
 * This approach embeds fonts in the SVG first, then converts to PNG
 */
export const exportAsPNG = async (svgElement, filename = "chart.png", scale = 2) => {
  try {
    // Wait for all fonts to be loaded
    await document.fonts.ready;

    // Clone the SVG to avoid modifying the original
    const svgClone = svgElement.cloneNode(true);

    // Check if defs already exists
    let defs = svgClone.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      if (svgClone.firstChild) {
        svgClone.insertBefore(defs, svgClone.firstChild);
      } else {
        svgClone.appendChild(defs);
      }
    }

    // Check if style already exists in defs
    let style = defs.querySelector('style');
    if (!style) {
      style = document.createElementNS("http://www.w3.org/2000/svg", "style");
      defs.appendChild(style);
    }

    // Import Google Fonts - embed them in the SVG
    const fontImport = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Montserrat:wght@300;400;500;600;700;800&family=Open+Sans:wght@300;400;500;600;700;800&family=Roboto:wght@300;400;500;700;900&family=Roboto+Condensed:wght@300;400;700&family=Open+Sans+Condensed:wght@300;700&family=Lato:wght@300;400;700;900&family=Merriweather:wght@300;400;700;900&family=Playfair+Display:wght@400;500;600;700;800;900&family=Lora:wght@400;500;600;700&family=PT+Serif:wght@400;700&family=Economica:wght@400;700&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600;6..72,700&display=swap');`;

    // Prepend the font import to existing styles
    style.textContent = fontImport + (style.textContent || '');

    // Serialize the SVG with embedded fonts
    const svgData = new XMLSerializer().serializeToString(svgClone);

    // Create a canvas and draw the SVG to it
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    // Get original SVG dimensions
    const svgWidth = svgElement.width?.baseVal?.value || svgElement.getBoundingClientRect().width;
    const svgHeight = svgElement.height?.baseVal?.value || svgElement.getBoundingClientRect().height;

    // Set canvas size with scaling
    canvas.width = svgWidth * scale;
    canvas.height = svgHeight * scale;

    // Create a blob URL from the SVG data
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    return new Promise((resolve, reject) => {
      img.onload = () => {
        // Draw the SVG image to canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convert canvas to blob and download
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to create PNG blob'));
            return;
          }

          const link = document.createElement("a");
          link.download = filename;
          link.href = URL.createObjectURL(blob);
          link.click();
          URL.revokeObjectURL(link.href);
          URL.revokeObjectURL(url);
          resolve();
        }, 'image/png', 1.0);
      };

      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG image: ' + err));
      };

      img.src = url;
    });
  } catch (err) {
    console.error('Export PNG failed:', err);
    throw err;
  }
};

/**
 * Export SVG element as SVG file with embedded fonts
 */
export const exportAsSVG = (svgElement, filename = "chart.svg") => {
  try {
    // Clone the SVG to avoid modifying the original
    const svgClone = svgElement.cloneNode(true);

    // Get SVG dimensions for viewBox
    const width = svgElement.width?.baseVal?.value || svgElement.getBoundingClientRect().width;
    const height = svgElement.height?.baseVal?.value || svgElement.getBoundingClientRect().height;

    // Add viewBox attribute for proper scaling in containers
    if (!svgClone.hasAttribute('viewBox')) {
      svgClone.setAttribute('viewBox', `0 0 ${width} ${height}`);
    }

    // Add preserveAspectRatio for better scaling behavior
    if (!svgClone.hasAttribute('preserveAspectRatio')) {
      svgClone.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    }

    // Check if defs already exists
    let defs = svgClone.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      if (svgClone.firstChild) {
        svgClone.insertBefore(defs, svgClone.firstChild);
      } else {
        svgClone.appendChild(defs);
      }
    }

    // Check if style already exists in defs
    let style = defs.querySelector('style');
    if (!style) {
      style = document.createElementNS("http://www.w3.org/2000/svg", "style");
      defs.appendChild(style);
    }

    // Import Google Fonts - use both @import and link for maximum compatibility
    const fontImport = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Montserrat:wght@300;400;500;600;700;800&family=Open+Sans:wght@300;400;500;600;700;800&family=Roboto:wght@300;400;500;700;900&family=Roboto+Condensed:wght@300;400;700&family=Open+Sans+Condensed:wght@300;700&family=Lato:wght@300;400;700;900&family=Merriweather:wght@300;400;700;900&family=Playfair+Display:wght@400;500;600;700;800;900&family=Lora:wght@400;500;600;700&family=PT+Serif:wght@400;700&family=Economica:wght@400;700&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600;6..72,700&display=swap');`;

    // Prepend the font import to existing styles
    style.textContent = fontImport + (style.textContent || '');

    const svgData = new XMLSerializer().serializeToString(svgClone);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const link = document.createElement("a");
    link.download = filename;
    link.href = url;
    link.click();

    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error("Failed to export SVG:", err);
    return false;
  }
};

/**
 * Copy SVG to clipboard as image
 */
export const copySVGToClipboard = async (svgElement) => {
  try {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    return new Promise((resolve, reject) => {
      img.onload = async () => {
        canvas.width = svgElement.width.baseVal.value * 2;
        canvas.height = svgElement.height.baseVal.value * 2;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(async (blob) => {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ "image/png": blob }),
            ]);
            URL.revokeObjectURL(url);
            resolve();
          } catch (err) {
            URL.revokeObjectURL(url);
            reject(err);
          }
        });
      };

      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(err);
      };

      img.src = url;
    });
  } catch (err) {
    console.error("Failed to copy to clipboard:", err);
    throw err;
  }
};

/**
 * Download data URL as file
 */
export const downloadDataURL = (dataURL, filename) => {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataURL;
  link.click();
};

/**
 * Convert SVG to data URL
 */
export const svgToDataURL = (svgElement) => {
  const svgData = new XMLSerializer().serializeToString(svgElement);
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgData);
};

/**
 * Get SVG dimensions
 */
export const getSVGDimensions = (svgElement) => {
  return {
    width: svgElement.width.baseVal.value,
    height: svgElement.height.baseVal.value,
  };
};

/**
 * Add watermark to SVG
 */
export const addWatermark = (svgElement, text = "Created with ChartViz", position = "bottom-right") => {
  const svg = svgElement.cloneNode(true);
  const { width, height } = getSVGDimensions(svg);

  const watermark = document.createElementNS("http://www.w3.org/2000/svg", "text");
  watermark.setAttribute("font-family", "Arial, sans-serif");
  watermark.setAttribute("font-size", "10");
  watermark.setAttribute("fill", "#999999");
  watermark.setAttribute("opacity", "0.5");
  watermark.textContent = text;

  // Position watermark
  const positions = {
    "bottom-right": { x: width - 10, y: height - 10, anchor: "end" },
    "bottom-left": { x: 10, y: height - 10, anchor: "start" },
    "top-right": { x: width - 10, y: 20, anchor: "end" },
    "top-left": { x: 10, y: 20, anchor: "start" },
  };

  const pos = positions[position] || positions["bottom-right"];
  watermark.setAttribute("x", pos.x);
  watermark.setAttribute("y", pos.y);
  watermark.setAttribute("text-anchor", pos.anchor);

  svg.appendChild(watermark);
  return svg;
};

/**
 * Validate export format
 */
export const isValidExportFormat = (format) => {
  const validFormats = ["png", "svg", "jpg", "jpeg"];
  return validFormats.includes(format.toLowerCase());
};

/**
 * Get recommended export settings
 */
export const getRecommendedExportSettings = (format, usage) => {
  const settings = {
    png: {
      web: { scale: 2, quality: 0.9 },
      print: { scale: 4, quality: 1.0 },
      social: { scale: 2, quality: 0.85 },
    },
    svg: {
      web: { preserveAspectRatio: "xMidYMid meet" },
      print: { preserveAspectRatio: "xMidYMid meet" },
      social: { preserveAspectRatio: "xMidYMid meet" },
    },
  };

  return settings[format.toLowerCase()]?.[usage] || settings.png.web;
};
