/**
 * Style Templates
 * Pre-configured style templates inspired by major publications and design systems
 */

export const styleTemplates = {
  financialTimes: {
    id: "financialTimes",
    name: "Financial Times",
    description: "Classic FT style with salmon pink background and serif typography",
    preview: "/templates/ft-preview.png",
    settings: {
      typography: {
        fontFamily: "Georgia",
        titleFontSize: 28,
        subtitleFontSize: 16,
        segmentLabelFontSize: 18,
        metricLabelFontSize: 16,
        legendFontSize: 14,
      },
      visual: {
        backgroundColor: "#FFF1E5", // FT salmon/peach
        darkMode: false,
        axisLineWidth: 2,
      },
      layout: {
        chartPadding: 30,
        stageGap: 12,
        barWidth: 110,
      },
      display: {
        showLegend: true,
        legendPosition: "direct",
        compactNumbers: true,
        showMetricLabels: true,
        metricLabelPosition: "outside",
      },
      colors: {
        comparisonPalette: "user",
        userCustomColors: [
          "#990f3d", // FT claret (primary brand color)
          "#262a33", // Oxford blue
          "#0d7680", // Teal
          "#9e2f50", // Raspberry
          "#00994d", // Green
          "#cc8f00", // Gold
          "#593380", // Purple
        ],
        colorTransition: 70,
      },
    },
  },

  economist: {
    id: "economist",
    name: "The Economist",
    description: "Clean Economist style with bold red accents and Econ Sans typeface",
    preview: "/templates/economist-preview.png",
    settings: {
      typography: {
        fontFamily: "Arial", // Approximation of Econ Sans
        titleFontSize: 26,
        subtitleFontSize: 15,
        segmentLabelFontSize: 17,
        metricLabelFontSize: 15,
        legendFontSize: 13,
      },
      visual: {
        backgroundColor: "#ffffff",
        darkMode: false,
        axisLineWidth: 2,
      },
      layout: {
        chartPadding: 25,
        stageGap: 10,
        barWidth: 95,
      },
      display: {
        showLegend: true,
        legendPosition: "direct",
        compactNumbers: true,
        showMetricLabels: true,
        metricLabelPosition: "outside",
      },
      colors: {
        comparisonPalette: "user",
        userCustomColors: [
          "#e3120b", // Economist red
          "#1e3d59", // Navy blue
          "#00a97f", // Teal
          "#d4af37", // Gold
          "#7c8b99", // Grey
          "#c20019", // Dark red
        ],
        colorTransition: 65,
      },
    },
  },

  nyt: {
    id: "nyt",
    name: "New York Times",
    description: "NYT Upshot style with Helvetica and clean visualization design",
    preview: "/templates/nyt-preview.png",
    settings: {
      typography: {
        fontFamily: "Helvetica",
        titleFontSize: 27,
        subtitleFontSize: 16,
        segmentLabelFontSize: 18,
        metricLabelFontSize: 16,
      },
      visual: {
        backgroundColor: "#ffffff",
        darkMode: false,
      },
      colors: {
        comparisonPalette: "user",
        userCustomColors: [
          "#507EA4", // NYT blue
          "#F3B61F", // Yellow
          "#A1A1A1", // Grey
          "#71B6D6", // Light blue
          "#D8622E", // Orange
          "#6F9E1F", // Green
        ],
      },
    },
  },

  wsj: {
    id: "wsj",
    name: "Wall Street Journal",
    description: "WSJ style with dot pattern aesthetic and classic typography",
    preview: "/templates/wsj-preview.png",
    settings: {
      typography: {
        fontFamily: "Georgia",
        titleFontSize: 27,
        subtitleFontSize: 15,
        segmentLabelFontSize: 17,
        metricLabelFontSize: 15,
      },
      visual: {
        backgroundColor: "#f4f0e8", // Newsprint beige
        darkMode: false,
      },
      colors: {
        comparisonPalette: "user",
        userCustomColors: [
          "#0f4c81", // WSJ blue
          "#cc0000", // Red
          "#008c95", // Teal
          "#f37021", // Orange
          "#7c7c7c", // Grey
          "#006341", // Green
        ],
      },
    },
  },

  bbc: {
    id: "bbc",
    name: "BBC News",
    description: "BBC style with Reith Sans typography and clean presentation",
    preview: "/templates/bbc-preview.png",
    settings: {
      typography: {
        fontFamily: "Helvetica", // Approximation of Reith Sans
        titleFontSize: 28,
        subtitleFontSize: 16,
        segmentLabelFontSize: 18,
        metricLabelFontSize: 16,
      },
      visual: {
        backgroundColor: "#ffffff",
        darkMode: false,
      },
      colors: {
        comparisonPalette: "user",
        userCustomColors: [
          "#b80000", // BBC red
          "#005580", // Blue
          "#e05206", // Orange
          "#83b81a", // Green
          "#640064", // Purple
          "#8f8f8f", // Grey
        ],
      },
    },
  },

  guardian: {
    id: "guardian",
    name: "The Guardian",
    description: "Guardian style with Egyptian typography and blue accents",
    preview: "/templates/guardian-preview.png",
    settings: {
      typography: {
        fontFamily: "Georgia", // Approximation of Guardian Egyptian
        titleFontSize: 29,
        subtitleFontSize: 17,
        segmentLabelFontSize: 19,
        metricLabelFontSize: 17,
      },
      visual: {
        backgroundColor: "#ffffff",
        darkMode: false,
      },
      colors: {
        comparisonPalette: "user",
        userCustomColors: [
          "#052962", // Guardian blue
          "#c70000", // Red
          "#007abc", // Light blue
          "#ff7f0f", // Orange
          "#00b2ff", // Cyan
          "#00a86b", // Green
        ],
      },
    },
  },

  tufte: {
    id: "tufte",
    name: "Edward Tufte",
    description: "Minimalist Tufte style emphasizing data-ink ratio and clarity",
    preview: "/templates/tufte-preview.png",
    settings: {
      typography: {
        fontFamily: "Newsreader",
        titleFontSize: 29,
        subtitleFontSize: 18,
        segmentLabelFontSize: 19,
        metricLabelFontSize: 16,
        legendFontSize: 12,
      },
      visual: {
        backgroundColor: "#ffffff",
        darkMode: false,
        backgroundOpacity: 0, // Minimal background
        axisLineWidth: 1, // Thin, minimal lines
      },
      layout: {
        chartPadding: 20, // Tight spacing
        stageGap: 8,
        barWidth: 85,
      },
      display: {
        showLegend: false, // Tufte prefers direct labeling over legends
        legendPosition: "direct",
        compactNumbers: false, // Show full precision
        showMetricLabels: true,
        metricLabelPosition: "outside",
      },
      colors: {
        comparisonPalette: "observable10",
        userCustomColors: [
          "#000000", // Black (minimal color use)
          "#999999", // Grey
          "#cc0000", // Red (for emphasis only)
          "#333333", // Dark grey
        ],
        colorTransition: 30, // Minimal gradation
      },
      slopeChart: {
        colorMode: "trend", // Tufte style: focus on trend direction
        increaseColor: "#000000", // Black for increasing trends
        decreaseColor: "#000000", // Black for decreasing trends (minimal ink)
        labelFormat: "value", // Values only
        lineThickness: 1, // Minimal line weight
        endpointSize: 1, // Small, subtle endpoints
        endpointStyle: "filled", // Filled endpoints
        periodSpacing: 165, // Compact Tufte spacing
        slopeAxisLineColor: "transparent", // No axis line (minimal ink)
      },
    },
  },

  bloomberg: {
    id: "bloomberg",
    name: "Bloomberg",
    description: "Bloomberg terminal-inspired dark theme with high contrast",
    preview: "/templates/bloomberg-preview.png",
    settings: {
      typography: {
        fontFamily: "Arial",
        titleFontSize: 26,
        subtitleFontSize: 15,
        segmentLabelFontSize: 17,
        metricLabelFontSize: 15,
        legendFontSize: 13,
      },
      visual: {
        backgroundColor: "#000000",
        darkMode: true,
        axisLineWidth: 2,
      },
      layout: {
        chartPadding: 25,
        stageGap: 10,
        barWidth: 100,
      },
      display: {
        showLegend: true,
        legendPosition: "direct",
        compactNumbers: true,
        showMetricLabels: true,
        metricLabelPosition: "outside",
      },
      colors: {
        comparisonPalette: "user",
        userCustomColors: [
          "#ff9500", // Bloomberg orange
          "#00a0d2", // Blue
          "#00ff00", // Terminal green
          "#ff0000", // Red
          "#ffff00", // Yellow
          "#9370db", // Purple
        ],
        colorTransition: 50,
      },
    },
  },

  minimal: {
    id: "minimal",
    name: "Minimal",
    description: "Clean, minimal design with maximum readability",
    preview: "/templates/minimal-preview.png",
    settings: {
      typography: {
        fontFamily: "Inter",
        titleFontSize: 28,
        subtitleFontSize: 16,
        segmentLabelFontSize: 18,
        metricLabelFontSize: 16,
        legendFontSize: 13,
      },
      visual: {
        backgroundColor: "#ffffff",
        darkMode: false,
        axisLineWidth: 1, // Ultra-thin
      },
      layout: {
        chartPadding: 22,
        stageGap: 8,
        barWidth: 90,
      },
      display: {
        showLegend: true,
        legendPosition: "direct",
        compactNumbers: true,
        showMetricLabels: true,
        metricLabelPosition: "outside",
      },
      colors: {
        comparisonPalette: "monochrome",
        userCustomColors: [
          "#111827", // Almost black
          "#6b7280", // Grey
          "#d1d5db", // Light grey
          "#f3f4f6", // Very light grey
        ],
        colorTransition: 35,
      },
    },
  },

  vibrant: {
    id: "vibrant",
    name: "Vibrant",
    description: "Bold, colorful design for presentations and social media",
    preview: "/templates/vibrant-preview.png",
    settings: {
      typography: {
        fontFamily: "Inter",
        titleFontSize: 32,
        subtitleFontSize: 18,
        segmentLabelFontSize: 20,
        metricLabelFontSize: 18,
        legendFontSize: 15,
      },
      visual: {
        backgroundColor: "#f8fafc",
        darkMode: false,
        axisLineWidth: 4, // Bold for impact
      },
      layout: {
        chartPadding: 35,
        stageGap: 14,
        barWidth: 115,
      },
      display: {
        showLegend: true,
        legendPosition: "direct",
        compactNumbers: true,
        showMetricLabels: true,
        metricLabelPosition: "outside",
      },
      colors: {
        comparisonPalette: "user",
        userCustomColors: [
          "#6366f1", // Indigo
          "#ec4899", // Pink
          "#8b5cf6", // Purple
          "#10b981", // Green
          "#f59e0b", // Amber
          "#06b6d4", // Cyan
          "#ef4444", // Red
        ],
        colorTransition: 90, // Maximum vibrancy
      },
    },
  },

  wired: {
    id: "wired",
    name: "Wired Magazine",
    description: "Tech-forward style with bold sans-serif and vibrant accent colors",
    preview: "/templates/wired-preview.png",
    settings: {
      typography: {
        fontFamily: "Arial",
        titleFontSize: 34,
        subtitleFontSize: 18,
        segmentLabelFontSize: 20,
        metricLabelFontSize: 17,
        legendFontSize: 14,
      },
      visual: {
        backgroundColor: "#000000",
        darkMode: true,
        axisLineWidth: 3,
      },
      layout: {
        chartPadding: 28,
        stageGap: 11,
        barWidth: 105,
      },
      display: {
        showLegend: true,
        legendPosition: "direct",
        compactNumbers: true,
        showMetricLabels: true,
        metricLabelPosition: "outside",
      },
      colors: {
        comparisonPalette: "user",
        userCustomColors: [
          "#00ff00", // Wired green
          "#ff006e", // Hot pink
          "#00d9ff", // Cyan
          "#ffbe0b", // Yellow
          "#8338ec", // Purple
          "#ff4800", // Orange
          "#06ffa5", // Mint
        ],
        colorTransition: 85, // High contrast neon
      },
    },
  },

  vox: {
    id: "vox",
    name: "Vox Media",
    description: "Modern web journalism style with bold headlines and clear colors",
    preview: "/templates/vox-preview.png",
    settings: {
      typography: {
        fontFamily: "Helvetica",
        titleFontSize: 32,
        subtitleFontSize: 18,
        segmentLabelFontSize: 19,
        metricLabelFontSize: 17,
      },
      visual: {
        backgroundColor: "#ffffff",
        darkMode: false,
      },
      colors: {
        comparisonPalette: "user",
        userCustomColors: [
          "#f7da22", // Vox yellow
          "#000000", // Black
          "#ff5a5f", // Red
          "#3d5afe", // Blue
          "#00c853", // Green
          "#ff6f00", // Orange
          "#6200ea", // Purple
        ],
      },
    },
  },

  corporate: {
    id: "corporate",
    name: "Corporate Professional",
    description: "Conservative business style with navy, grey, and professional typography",
    preview: "/templates/corporate-preview.png",
    settings: {
      typography: {
        fontFamily: "Arial",
        titleFontSize: 26,
        subtitleFontSize: 16,
        segmentLabelFontSize: 17,
        metricLabelFontSize: 15,
      },
      visual: {
        backgroundColor: "#f5f7fa",
        darkMode: false,
      },
      colors: {
        comparisonPalette: "user",
        userCustomColors: [
          "#1e3a8a", // Navy blue
          "#475569", // Slate grey
          "#0891b2", // Teal
          "#65a30d", // Green
          "#ca8a04", // Gold
          "#dc2626", // Red
          "#7c3aed", // Purple
        ],
      },
    },
  },

  swiss: {
    id: "swiss",
    name: "Swiss Style",
    description: "International Typographic Style with grid-based layout and Helvetica",
    preview: "/templates/swiss-preview.png",
    settings: {
      typography: {
        fontFamily: "Helvetica",
        titleFontSize: 30,
        subtitleFontSize: 16,
        segmentLabelFontSize: 18,
        metricLabelFontSize: 16,
        legendFontSize: 14,
      },
      visual: {
        backgroundColor: "#ffffff",
        darkMode: false,
        axisLineWidth: 3, // Bold, geometric lines
      },
      layout: {
        chartPadding: 40, // Generous grid-based spacing
        stageGap: 15,
        barWidth: 120,
      },
      display: {
        showLegend: true,
        legendPosition: "direct",
        compactNumbers: true,
        showMetricLabels: true,
        metricLabelPosition: "outside",
      },
      colors: {
        comparisonPalette: "user",
        userCustomColors: [
          "#000000", // Black
          "#ff0000", // Red
          "#0000ff", // Blue
          "#ffff00", // Yellow
          "#4d4d4d", // Dark grey
          "#999999", // Light grey
        ],
        colorTransition: 80, // High contrast
      },
    },
  },

  ibcs: {
    id: "ibcs",
    name: "IBCS Business Report",
    description: "Professional business reporting style inspired by IBCS standards - clean, grey-scale, data-focused",
    preview: "/templates/ibcs-preview.png",
    settings: {
      typography: {
        fontFamily: "Arial",
        titleFontSize: 18,
        subtitleFontSize: 14,
        segmentLabelFontSize: 12,
        metricLabelFontSize: 11,
        legendFontSize: 11,
        directLabelFontSize: 16, // IBCS direct label font size
      },
      visual: {
        backgroundColor: "#ffffff",
        darkMode: false,
        backgroundOpacity: 0,
        axisLineWidth: 1, // Minimal, clean lines
      },
      layout: {
        chartPadding: 20, // Tight, professional spacing
        stageGap: 8,
        barWidth: 90,
      },
      display: {
        showLegend: true,
        legendPosition: "above",
        compactNumbers: true,
        showMetricLabels: true,
        metricLabelPosition: "outside",
        xAxisLabelLevels: 1, // IBCS single level axis labels
      },
      lineChart: {
        lineThickness: 1, // IBCS thin lines
        pointSize: 2, // IBCS small markers
        showAreaFill: false, // IBCS no area fill
      },
      colors: {
        comparisonPalette: "user",
        userCustomColors: [
          "#4d4d4d", // Dark grey for actual values
          "#808080", // Medium grey for comparison
          "#b3b3b3", // Light grey for secondary data
          "#666666", // Medium-dark grey
          "#999999", // Medium-light grey
          "#cccccc", // Very light grey
          "#595959", // Subtle dark grey variation
          "#737373", // Subtle medium grey variation
        ],
        colorTransition: 30, // Very subtle transitions
      },
    },
  },

  usafacts: {
    id: "usafacts",
    name: "USAfacts.org",
    description: "Clean, data-driven government data visualization style with Libre Franklin typography and professional navy palette",
    preview: "/templates/usafacts-preview.png",
    settings: {
      typography: {
        fontFamily: "Libre Franklin",
        titleFontSize: 32,
        subtitleFontSize: 18,
        segmentLabelFontSize: 16,
        metricLabelFontSize: 16,
        legendFontSize: 14,
      },
      visual: {
        backgroundColor: "#ffffff",
        darkMode: false,
        axisLineWidth: 2,
      },
      layout: {
        chartPadding: 25,
        stageGap: 10,
        barWidth: 100,
      },
      display: {
        showLegend: true,
        legendPosition: "direct",
        compactNumbers: true,
        showMetricLabels: true,
        metricLabelPosition: "outside",
      },
      colors: {
        comparisonPalette: "user",
        userCustomColors: [
          "#0f4c81", // USAfacts primary navy
          "#2563eb", // Blue
          "#3b82f6", // Light blue
          "#60a5fa", // Lighter blue
          "#1e3a8a", // Dark navy
          "#1d4ed8", // Medium blue
          "#93c5fd", // Very light blue
        ],
        colorTransition: 60,
      },
    },
  },
};

/**
 * Get all template IDs
 */
export const getTemplateIds = () => Object.keys(styleTemplates);

/**
 * Get a template by ID
 */
export const getTemplate = (templateId) => styleTemplates[templateId];

/**
 * Get all templates as an array
 */
export const getAllTemplates = () =>
  Object.values(styleTemplates).map(template => ({
    id: template.id,
    name: template.name,
    description: template.description,
    preview: template.preview,
  }));

/**
 * Apply a template to style settings
 * @param {Object} styleSettings - The useStyleSettings hook object
 * @param {string} templateId - The template ID to apply
 */
export const applyTemplate = (styleSettings, templateId) => {
  const template = styleTemplates[templateId];
  if (!template) {
    console.error(`Template "${templateId}" not found`);
    return;
  }

  const { settings } = template;

  // Apply typography settings
  if (settings.typography) {
    if (settings.typography.fontFamily) styleSettings.setFontFamily(settings.typography.fontFamily);
    if (settings.typography.titleFontSize) styleSettings.setTitleFontSize(settings.typography.titleFontSize);
    if (settings.typography.subtitleFontSize) styleSettings.setSubtitleFontSize(settings.typography.subtitleFontSize);
    if (settings.typography.segmentLabelFontSize) styleSettings.setSegmentLabelFontSize(settings.typography.segmentLabelFontSize);
    if (settings.typography.metricLabelFontSize) styleSettings.setMetricLabelFontSize(settings.typography.metricLabelFontSize);
    if (settings.typography.legendFontSize !== undefined) styleSettings.setLegendFontSize(settings.typography.legendFontSize);
    if (settings.typography.directLabelFontSize !== undefined) styleSettings.setDirectLabelFontSize(settings.typography.directLabelFontSize);
  }

  // Apply visual settings
  if (settings.visual) {
    if (settings.visual.backgroundColor !== undefined) styleSettings.setBackgroundColor(settings.visual.backgroundColor);
    if (settings.visual.darkMode !== undefined) styleSettings.setDarkMode(settings.visual.darkMode);
    if (settings.visual.backgroundOpacity !== undefined) styleSettings.setBackgroundOpacity(settings.visual.backgroundOpacity);
    if (settings.visual.axisLineWidth !== undefined) styleSettings.setAxisLineWidth(settings.visual.axisLineWidth);
  }

  // Apply layout settings
  if (settings.layout) {
    if (settings.layout.chartPadding !== undefined) styleSettings.setChartPadding(settings.layout.chartPadding);
    if (settings.layout.stageGap !== undefined) styleSettings.setStageGap(settings.layout.stageGap);
    if (settings.layout.barWidth !== undefined) styleSettings.setBarWidth(settings.layout.barWidth);
  }

  // Apply display settings
  if (settings.display) {
    if (settings.display.showLegend !== undefined) styleSettings.setShowLegend(settings.display.showLegend);
    if (settings.display.legendPosition) styleSettings.setLegendPosition(settings.display.legendPosition);
    if (settings.display.compactNumbers !== undefined) styleSettings.setCompactNumbers(settings.display.compactNumbers);
    if (settings.display.showMetricLabels !== undefined) styleSettings.setShowMetricLabels(settings.display.showMetricLabels);
    if (settings.display.metricLabelPosition) styleSettings.setMetricLabelPosition(settings.display.metricLabelPosition);
    if (settings.display.xAxisLabelLevels !== undefined) styleSettings.setXAxisLabelLevels(settings.display.xAxisLabelLevels);
  }

  // Apply color settings
  if (settings.colors) {
    if (settings.colors.comparisonPalette) styleSettings.setComparisonPalette(settings.colors.comparisonPalette);
    if (settings.colors.userCustomColors) styleSettings.setUserCustomColors(settings.colors.userCustomColors);
    if (settings.colors.colorTransition !== undefined) styleSettings.setColorTransition(settings.colors.colorTransition);
  }

  // Apply line chart specific settings
  if (settings.lineChart) {
    if (settings.lineChart.lineThickness !== undefined) styleSettings.setLineThickness(settings.lineChart.lineThickness);
    if (settings.lineChart.pointSize !== undefined) styleSettings.setPointSize(settings.lineChart.pointSize);
    if (settings.lineChart.showAreaFill !== undefined) styleSettings.setShowAreaFill(settings.lineChart.showAreaFill);
  }

  // Apply slope chart specific settings
  if (settings.slopeChart) {
    if (settings.slopeChart.colorMode !== undefined) styleSettings.setColorMode(settings.slopeChart.colorMode);
    if (settings.slopeChart.increaseColor !== undefined) styleSettings.setIncreaseColor(settings.slopeChart.increaseColor);
    if (settings.slopeChart.decreaseColor !== undefined) styleSettings.setDecreaseColor(settings.slopeChart.decreaseColor);
    if (settings.slopeChart.labelFormat !== undefined) styleSettings.setLabelFormat(settings.slopeChart.labelFormat);
    if (settings.slopeChart.lineThickness !== undefined) styleSettings.setLineThickness(settings.slopeChart.lineThickness);
    if (settings.slopeChart.endpointSize !== undefined) styleSettings.setEndpointSize(settings.slopeChart.endpointSize);
    if (settings.slopeChart.endpointStyle !== undefined) styleSettings.setEndpointStyle(settings.slopeChart.endpointStyle);
    if (settings.slopeChart.periodSpacing !== undefined) styleSettings.setPeriodSpacing(settings.slopeChart.periodSpacing);
    if (settings.slopeChart.slopeAxisLineColor !== undefined) styleSettings.setSlopeAxisLineColor(settings.slopeChart.slopeAxisLineColor);
  }
};
