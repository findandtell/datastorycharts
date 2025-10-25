/**
 * Export helpers for chart rendering
 */

/**
 * Export SVG element as PNG
 */
export const exportAsPNG = (svgElement, filename = "chart.png", scale = 2) => {
  return new Promise((resolve, reject) => {
    try {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        canvas.width = svgElement.width.baseVal.value * scale;
        canvas.height = svgElement.height.baseVal.value * scale;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          const link = document.createElement("a");
          link.download = filename;
          link.href = URL.createObjectURL(blob);
          link.click();
          URL.revokeObjectURL(url);
          resolve();
        });
      };

      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(err);
      };

      img.src = url;
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Export SVG element as SVG file
 */
export const exportAsSVG = (svgElement, filename = "chart.svg") => {
  try {
    const svgData = new XMLSerializer().serializeToString(svgElement);
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
