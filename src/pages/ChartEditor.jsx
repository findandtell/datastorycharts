import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChartData } from '../shared/hooks/useChartData';
import { useStyleSettings } from '../shared/hooks/useStyleSettings';
import { getChart, chartRegistry } from '../charts/registry';
import { colorPresets, comparisonPalettes } from '../shared/design-system/colorPalettes';
import { exportAsPNG, exportAsSVG } from '../shared/utils/exportHelpers';
import { downloadStyleFile, uploadStyleFile, generateStyleName, loadStyleFromURL } from '../shared/utils/styleUtils';
import { getSampleDataset } from '../shared/data/sampleDatasets';
import { getAllTemplates, applyTemplate } from '../shared/design-system/styleTemplates';
import { throttle } from '../shared/utils/performanceUtils';
import { loadGoogleSheetsData, isGoogleSheetsUrl, getPublicSharingInstructions } from '../shared/utils/googleSheetsLoader';
import { serializeChartState, deserializeChartState, applyChartState, generateChartFilename } from '../shared/utils/chartStateManager';
import { useAddonMode } from '../shared/hooks/useAddonMode';
import { useFigmaMode } from '../shared/hooks/useFigmaMode';
import { useLicense } from '../shared/hooks/useLicense';
import FunnelChart from '../charts/FunnelChart/FunnelChart';
import SlopeChart from '../charts/SlopeChart/SlopeChart';
import BarChart from '../charts/BarChart/BarChart';
import LineChart from '../charts/LineChart/LineChart';
import SnapshotGallery from '../components/SnapshotGallery';
import SnapshotModal from '../components/SnapshotModal';
import { getSectionOrder, getSectionMetadata } from '../config/chartStylingConfig';
import {
  ChevronDownIcon,
  RocketLaunchIcon,
  KeyIcon,
  SparklesIcon,
  BookOpenIcon,
  AcademicCapIcon,
  PlayCircleIcon,
  InformationCircleIcon,
  ArrowsPointingOutIcon,
  ViewColumnsIcon,
  Bars3Icon,
  CloudArrowUpIcon,
  AdjustmentsHorizontalIcon,
  PlusIcon,
  MinusIcon,
  ArrowPathIcon,
  CameraIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  DocumentTextIcon,
  ArrowUpTrayIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

/**
 * InfoTooltip Component
 * Reusable info icon with hover tooltip
 */
const InfoTooltip = ({ text }) => (
  <span className="group relative inline-block">
    <InformationCircleIcon className="w-3 h-3 text-gray-400 cursor-help" />
    <span className="invisible group-hover:visible absolute left-0 top-5 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10 whitespace-normal">
      {text}
    </span>
  </span>
);

/**
 * Chart Editor Page
 * Full-featured chart editing interface with control panel
 */
export default function ChartEditor() {
  const navigate = useNavigate();
  const { chartType } = useParams();
  const chart = getChart(chartType);

  const [activeTab, setActiveTab] = useState('style');
  const [showPanel, setShowPanel] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const [showActivateLicenseModal, setShowActivateLicenseModal] = useState(false);
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [isDockMode, setIsDockMode] = useState(false);
  const [isResizingWindow, setIsResizingWindow] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 1400, height: 900 });
  const [windowResizeStart, setWindowResizeStart] = useState({ x: 0, y: 0, startWidth: 1400, startHeight: 900 });
  const [showDataTable, setShowDataTable] = useState(false);
  const [showPasteCSV, setShowPasteCSV] = useState(false);
  const [pastedCSV, setPastedCSV] = useState('');
  const [showGoogleSheets, setShowGoogleSheets] = useState(false);
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState('');
  const [googleSheetsLoading, setGoogleSheetsLoading] = useState(false);
  const [googleSheetsError, setGoogleSheetsError] = useState('');
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(5); // minutes

  // Ref to track if we're currently loading a style preset
  const isLoadingPresetRef = useRef(false);
  const [expandedSections, setExpandedSections] = useState({
    theme: false,
    chartStructure: false,
    dataLabels: false,
    axesGridlines: false,
    colorsStyling: false,
    typography: false,
    layoutCanvas: false,
    exportBranding: false,
    // Slope-specific
    colorMode: false,
    lineStyling: false,
    labelsText: false,
    axesSpacing: false,
    // Funnel-specific
    displayLabels: false,
    visualEffects: false,
  });

  const chartData = useChartData(chartType);
  const styleSettings = useStyleSettings();
  const addon = useAddonMode();
  const figma = useFigmaMode();
  const license = useLicense();
  const svgRef = useRef(null);
  const exportMenuRef = useRef(null);
  const hamburgerMenuRef = useRef(null);
  const styleFileInputRef = useRef(null);
  const chartImportFileInputRef = useRef(null);
  const clearEmphasisRef = useRef(null);

  // Sync license state with userTier (removes watermarks for Pro users)
  useEffect(() => {
    if (license.hasAccess) {
      styleSettings.setUserTier('pro');
    } else {
      styleSettings.setUserTier('free');
    }
  }, [license.hasAccess, styleSettings.setUserTier]);

  // Refs for resize state to avoid stale closures
  const resizeStateRef = useRef({
    isResizing: false,
    startX: 0,
    startY: 0,
    startWidth: 1400,
    startHeight: 900
  });

  // Toggle Dock Mode for Figma
  const toggleDockMode = () => {
    if (!figma.isFigmaMode) return;

    const newDockMode = !isDockMode;
    setIsDockMode(newDockMode);

    if (newDockMode) {
      // Minimal mode - just top bar
      figma.resizeFigma(300, 60);
      setWindowSize({ width: 300, height: 60 });
    } else {
      // Wide mode for floating
      figma.resizeFigma(1400, 900);
      setWindowSize({ width: 1400, height: 900 });
    }
  };

  // Resize handlers for Figma window - using refs to avoid stale closures
  const handleWindowResizeStart = useCallback((e) => {
    if (!figma.isFigmaMode || isDockMode) return;
    e.preventDefault();
    e.stopPropagation();

    resizeStateRef.current = {
      isResizing: true,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: windowSize.width,
      startHeight: windowSize.height
    };
    setIsResizingWindow(true);
  }, [figma.isFigmaMode, isDockMode, windowSize]);

  const handleWindowResizeMove = useCallback((e) => {
    const resizeState = resizeStateRef.current;
    if (!resizeState.isResizing || !figma.isFigmaMode) return;

    // Calculate delta from start position
    const deltaX = e.clientX - resizeState.startX;
    const deltaY = e.clientY - resizeState.startY;

    // Calculate new size based on delta
    const newWidth = Math.max(500, resizeState.startWidth + deltaX);
    const newHeight = Math.max(400, resizeState.startHeight + deltaY);

    setWindowSize({ width: newWidth, height: newHeight });
    figma.resizeFigma(newWidth, newHeight);
  }, [figma]);

  const handleWindowResizeEnd = useCallback(() => {
    if (resizeStateRef.current.isResizing) {
      resizeStateRef.current.isResizing = false;
      setIsResizingWindow(false);
    }
  }, []);

  // Add global mouse event listeners for window resize
  useEffect(() => {
    if (isResizingWindow) {
      // Prevent text selection during drag
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'nwse-resize';

      document.addEventListener('mousemove', handleWindowResizeMove, { passive: false });
      document.addEventListener('mouseup', handleWindowResizeEnd);

      return () => {
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        document.removeEventListener('mousemove', handleWindowResizeMove);
        document.removeEventListener('mouseup', handleWindowResizeEnd);
      };
    }
  }, [isResizingWindow, handleWindowResizeMove, handleWindowResizeEnd]);

  // Collapse all sections when switching tabs
  useEffect(() => {
    setExpandedSections({
      theme: false,
      chartStructure: false,
      dataLabels: false,
      axesGridlines: false,
      colorsStyling: false,
      typography: false,
      layoutCanvas: false,
      exportBranding: false,
      // Slope-specific
      colorMode: false,
      lineStyling: false,
      labelsText: false,
      axesSpacing: false,
      // Funnel-specific
      displayLabels: false,
      visualEffects: false,
    });
  }, [activeTab]);

  // Create throttled versions of frequently-called setters for performance
  // This prevents chart re-renders on every pixel of slider drag
  // Using 100ms throttle for responsive feel while maintaining performance with large datasets
  const throttledSetters = useMemo(() => ({
    setLineThickness: throttle((value) => styleSettings.setLineThickness(value), 100),
    setLineSaturation: throttle((value) => styleSettings.setLineSaturation(value), 100),
    setPointSize: throttle((value) => styleSettings.setPointSize(value), 100),
    setPointBorderWidth: throttle((value) => styleSettings.setPointBorderWidth(value), 100),
    setChartWidth: throttle((value) => styleSettings.setChartWidth(value), 100),
    setChartHeight: throttle((value) => styleSettings.setChartHeight(value), 100),
    setCanvasWidth: throttle((value) => styleSettings.setCanvasWidth(value), 100),
    setCanvasHeight: throttle((value) => styleSettings.setCanvasHeight(value), 100),
    setBackgroundOpacity: throttle((value) => styleSettings.setBackgroundOpacity(value), 100),
    setPeriodSpacing: throttle((value) => styleSettings.setPeriodSpacing(value), 100),
    setEndpointSize: throttle((value) => styleSettings.setEndpointSize(value), 100),
    setColorTransition: throttle((value) => styleSettings.setColorTransition(value), 100),
  }), [styleSettings]);

  // Save Style modal state
  const [showSaveStyleModal, setShowSaveStyleModal] = useState(false);
  const [styleName, setStyleName] = useState('');

  // Snapshot Gallery state
  const [snapshots, setSnapshots] = useState([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);
  const [showSnapshotModal, setShowSnapshotModal] = useState(false);

  // Zoom and Pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const chartContainerRef = useRef(null);

  // Resize state
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null); // 'tl' or 'br'
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Track current sample dataset for Reset View
  const [currentSampleDatasetKey, setCurrentSampleDatasetKey] = useState(null);

  // Track previous chart type to detect changes
  const [previousChartType, setPreviousChartType] = useState(null);

  // Chart type dropdown state
  const [isChartDropdownOpen, setIsChartDropdownOpen] = useState(false);
  const chartDropdownRef = useRef(null);

  // Track last clicked bar for double-click detection (use ref to avoid stale closures)
  const lastClickedBarIdRef = useRef(null);

  // Setup wheel event listener with passive: false to allow preventDefault
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY * -0.001;
      const newZoom = Math.min(Math.max(0.5, zoom + delta), 3);
      setZoom(newZoom);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [zoom]);

  // Close chart dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chartDropdownRef.current && !chartDropdownRef.current.contains(event.target)) {
        setIsChartDropdownOpen(false);
      }
    };

    if (isChartDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isChartDropdownOpen]);

  // Handle slope chart line clicks for emphasis
  const handleSlopeLineClick = useCallback((lineIndex, lineData) => {
    const currentEmphasized = styleSettings.emphasizedLines || [];

    // If this line is already emphasized, clear ALL emphasis
    if (currentEmphasized.includes(lineIndex)) {
      styleSettings.setEmphasizedLines([]);
    } else {
      // Add this line to emphasis (max 2 lines)
      if (currentEmphasized.length < 2) {
        styleSettings.setEmphasizedLines([...currentEmphasized, lineIndex]);
      } else {
        // If already 2 lines, replace the oldest one
        styleSettings.setEmphasizedLines([currentEmphasized[1], lineIndex]);
      }
    }
  }, [styleSettings]);

  // Handle bar chart bar clicks for emphasis
  const handleBarClick = useCallback((d, period, barId) => {
    const currentEmphasized = styleSettings.emphasizedBars || [];

    // If clicking the same bar twice in a row, clear ALL emphasis
    if (lastClickedBarIdRef.current === barId) {
      // Clear immediately
      styleSettings.setEmphasizedBars([]);
      lastClickedBarIdRef.current = null;

      // Clear percent change comparisons immediately
      if (clearEmphasisRef?.current) {
        clearEmphasisRef.current();
      }

      // Also clear after a brief delay to catch any additions from BarChart's handler
      setTimeout(() => {
        if (clearEmphasisRef?.current) {
          clearEmphasisRef.current();
        }
      }, 10);
    } else {
      // Update last clicked bar
      lastClickedBarIdRef.current = barId;

      // If this bar is already emphasized (but wasn't the last click), remove it
      if (currentEmphasized.includes(barId)) {
        styleSettings.setEmphasizedBars(
          currentEmphasized.filter(id => id !== barId)
        );
      } else {
        // Add this bar to emphasis (max 4 bars)
        if (currentEmphasized.length < 4) {
          styleSettings.setEmphasizedBars([...currentEmphasized, barId]);
        } else {
          // If already 4 bars, replace the oldest one
          styleSettings.setEmphasizedBars([currentEmphasized[1], currentEmphasized[2], currentEmphasized[3], barId]);
        }
      }
    }
  }, [styleSettings]);

  // Handle line chart point clicks for emphasis
  const handleLineChartPointClick = useCallback((metric, pointData) => {
    const currentEmphasized = styleSettings.emphasizedPoints || [];
    const pointIndex = pointData._pointIndex;

    // Check if this point is already emphasized
    const isAlreadyEmphasized = currentEmphasized.some(p =>
      p.metric === metric && p.index === pointIndex
    );

    if (isAlreadyEmphasized) {
      // Remove this point from emphasis
      styleSettings.setEmphasizedPoints(
        currentEmphasized.filter(p => !(p.metric === metric && p.index === pointIndex))
      );
    } else {
      // Add this point to emphasis (max 4 points)
      // Toggle point style to opposite of global setting
      const globalPointStyle = styleSettings.pointStyle || 'filled';
      const customPointStyle = globalPointStyle === 'filled' ? 'outlined' : 'filled';

      const newPoint = {
        metric,
        index: pointIndex,
        value: pointData[metric],
        date: pointData.date,
        customPointStyle: customPointStyle, // Toggle to opposite style
      };

      if (currentEmphasized.length < 4) {
        styleSettings.setEmphasizedPoints([...currentEmphasized, newPoint]);
      } else {
        // If already 4 points, replace the oldest one
        styleSettings.setEmphasizedPoints([
          currentEmphasized[1],
          currentEmphasized[2],
          currentEmphasized[3],
          newPoint
        ]);
      }
    }
  }, [styleSettings]);

  // Handle line chart metric emphasis (clicking on legend or direct label)
  const handleLineChartMetricClick = useCallback((metric) => {
    const currentEmphasized = styleSettings.emphasizedMetric;

    if (currentEmphasized === metric) {
      // If clicking the already emphasized metric, de-emphasize it
      styleSettings.setEmphasizedMetric(null);
    } else {
      // Emphasize the clicked metric
      styleSettings.setEmphasizedMetric(metric);
    }
  }, [styleSettings]);

  // Handle line chart label drag to update position
  const handleLineChartLabelDrag = useCallback((metric, index, offsetX, offsetY) => {
    const currentEmphasized = styleSettings.emphasizedPoints || [];

    const updatedPoints = currentEmphasized.map(p => {
      if (p.metric === metric && p.index === index) {
        return { ...p, labelOffsetX: offsetX, labelOffsetY: offsetY };
      }
      return p;
    });

    styleSettings.setEmphasizedPoints(updatedPoints);
  }, [styleSettings]);

  /**
   * Load default sample data and styles on mount
   *
   * IMPORTANT: This useEffect ensures that each chart type loads with its default dataset and styling
   * when first opened. This is critical for maintaining consistent defaults across the application.
   *
   * Why we check !currentSampleDatasetKey:
   * - When navigating to a chart for the first time, currentSampleDatasetKey is null
   * - React state may persist data from previous sessions, causing hasData to be true
   * - Without this check, stale data would display instead of the intended default
   * - This pattern ensures Bar Chart, Line Chart, and Slope Chart ALWAYS load their defaults on first open
   *
   * How default styles are loaded:
   * 1. Sample datasets (in sampleDatasets.js) can include a stylePreset property
   * 2. stylePreset points to a JSON file (e.g., /Examples/affiliate-revenue-...-style.json)
   * 3. The applyStylePreset function loads and applies ALL settings from that file
   * 4. This includes title, subtitle, fonts, colors, layout, and all chart-specific settings
   *
   * Example:
   * - Line Chart default: marketingChannelRevenue dataset with Lora font and custom styling
   * - Bar Chart default: barRegionalSales dataset with its associated style
   * - Slope Chart default: tufteSlope dataset with PT Serif font and classic Tufte styling
   */
  useEffect(() => {
    // Check if current data is compatible with the chart type
    let needsNewData = !chartData.hasData;

    // For Line/Area Charts, check if data has date fields
    const isLineVariant = chartType === 'line' || chartType === 'area' || chartType === 'area-stacked';
    if (isLineVariant && chartData.hasData && chartData.data && chartData.data.length > 0) {
      const firstRow = chartData.data[0];
      const hasDateField = firstRow && (firstRow.date || firstRow.Date || firstRow.time || firstRow.Time);
      if (!hasDateField) {
        needsNewData = true;
      }
    }

    // Get the expected dataset for this chart type
    const chartConfig = getChart(chartType);
    const expectedDatasetKey = chartConfig?.defaultDataset;

    // Detect if chart type has actually changed
    const chartTypeChanged = previousChartType !== null && previousChartType !== chartType;

    // CRITICAL: Always load new data and apply defaults when:
    // 1. No current dataset key (first load)
    // 2. Chart type changed (always reload defaults even if dataset is same)
    // 3. Dataset changed (different expected dataset)
    if (!currentSampleDatasetKey || chartTypeChanged || currentSampleDatasetKey !== expectedDatasetKey) {
      needsNewData = true;
    }

    if (needsNewData) {
      // Load appropriate sample data based on chart type from registry
      const chartConfig = getChart(chartType);
      const sampleDataKey = chartConfig?.defaultDataset || 'abTest'; // Fallback to abTest if no default

      chartData.loadSampleData(sampleDataKey);

      // Store the current sample dataset key
      setCurrentSampleDatasetKey(sampleDataKey);

      // Update previous chart type tracker
      setPreviousChartType(chartType);

      // Reset chart-independent settings to defaults when switching charts
      // This prevents settings from one chart type bleeding into another
      styleSettings.setBackgroundColor('#ffffff');
      styleSettings.setBackgroundOpacity(100);

      // Apply default settings from registry
      if (chartConfig?.defaultSettings) {
        const settings = chartConfig.defaultSettings;
        if (settings.orientation) styleSettings.setOrientation(settings.orientation);
        if (settings.barMode) styleSettings.setBarMode(settings.barMode);
        if (settings.chartMode) styleSettings.setChartMode(settings.chartMode);
        if (settings.stackAreas !== undefined) styleSettings.setStackAreas(settings.stackAreas);
        if (settings.showAreaFill !== undefined) styleSettings.setShowAreaFill(settings.showAreaFill);
        if (settings.areaOpacity !== undefined) styleSettings.setAreaOpacity(settings.areaOpacity);
        if (settings.lineOpacity !== undefined) styleSettings.setLineOpacity(settings.lineOpacity);
        if (settings.showPoints !== undefined) styleSettings.setShowPoints(settings.showPoints);
        if (settings.smoothLines !== undefined) styleSettings.setSmoothLines(settings.smoothLines);
        if (settings.xAxisTimeGrouping) styleSettings.setXAxisTimeGrouping(settings.xAxisTimeGrouping);
        if (settings.xAxisPrimaryLabel) styleSettings.setXAxisPrimaryLabel(settings.xAxisPrimaryLabel);
        if (settings.xAxisSecondaryLabel) styleSettings.setXAxisSecondaryLabel(settings.xAxisSecondaryLabel);
        if (settings.dateFormatPreset) styleSettings.setDateFormatPreset(settings.dateFormatPreset);
      }

      // Get the dataset
      const dataset = getSampleDataset(sampleDataKey);
      if (dataset) {
        // Load title and subtitle from the sample dataset
        if (dataset.title) styleSettings.setTitle(dataset.title);
        if (dataset.subtitle) styleSettings.setSubtitle(dataset.subtitle);

        // Load timeScale for line charts
        if (dataset.timeScale) styleSettings.setTimeScale(dataset.timeScale);

        // Apply default settings from dataset if available
        if (dataset.defaultSettings) {
          if (dataset.defaultSettings.orientation) styleSettings.setOrientation(dataset.defaultSettings.orientation);
          if (dataset.defaultSettings.barMode) styleSettings.setBarMode(dataset.defaultSettings.barMode);
        }

        // Apply style preset if available (will override title/subtitle if present in style)
        if (dataset.stylePreset) {
          applyStylePreset(dataset.stylePreset);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartType]);

  // Set initial chart size based on viewport dimensions (only on mount)
  useEffect(() => {
    applyViewportBasedSizing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run on mount

  // Auto-adjust canvas dimensions for Bar and Line charts
  // Bar and Line charts ALWAYS calculate canvas from chartWidth/chartHeight
  // This means presets should NOT include canvasWidth/canvasHeight - they are derived
  useEffect(() => {
    // Check if current chart is a bar or line variant
    const isBarVariant = chartType?.startsWith('bar-');
    const isLineVariant = chartType === 'line' || chartType === 'area' || chartType === 'area-stacked';

    // Only auto-calculate for Bar and Line charts
    if (!isBarVariant && !isLineVariant) return;

    // BarChart and LineChart include margins inside SVG
    // BarChart defaults: marginLeft=180, marginRight=60, marginTop=60, marginBottom=80
    // LineChart defaults: marginLeft=80, marginRight=80, marginTop=60, marginBottom=60
    const isBarChart = isBarVariant;

    const canvasWidth = isBarChart
      ? styleSettings.chartWidth + 240  // Bar: 180 left + 60 right
      : styleSettings.chartWidth + 160;  // Line: 80 left + 80 right
    const canvasHeight = isBarChart
      ? styleSettings.chartHeight + 140  // Bar: 60 top + 80 bottom
      : styleSettings.chartHeight + 120;  // Line: 60 top + 60 bottom

    styleSettings.setCanvasWidth(canvasWidth);
    styleSettings.setCanvasHeight(canvasHeight);
  }, [styleSettings.chartWidth, styleSettings.chartHeight, chartType, styleSettings]);

  // Auto-adjust canvas dimensions for Slope Chart
  // Slope chart ALWAYS calculates canvas dimensions from periodSpacing and periodHeight
  // This means presets should NOT include canvasWidth/canvasHeight - they are derived
  useEffect(() => {
    if (chartType !== 'slope') return;

    // Slope chart dimensions are based on:
    // - periodHeight: vertical space for the chart
    // - periodSpacing: horizontal distance between the two columns
    // - Label space: approximately 250px on each side for category/value labels
    // - Margins: 120 left, 60 right, 80 top, 60 bottom (from slopeChartDefaults)

    const labelSpace = 250 * 2; // Space for left and right labels
    const margins = 120 + 60; // left + right margins
    const canvasWidth = styleSettings.periodSpacing + labelSpace + margins;
    const canvasHeight = styleSettings.periodHeight + 140; // 80 top + 60 bottom margins

    styleSettings.setCanvasWidth(Math.round(canvasWidth));
    styleSettings.setCanvasHeight(Math.round(canvasHeight));
  }, [styleSettings.periodSpacing, styleSettings.periodHeight, chartType, styleSettings]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
      if (hamburgerMenuRef.current && !hamburgerMenuRef.current.contains(event.target)) {
        setShowHamburgerMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Set larger canvas size for add-on mode to fill the modal
  useEffect(() => {
    if (addon.isAddonMode) {
      // For 1600px modal with 256px panel, we have ~1344px for chart area
      // Set canvas to 1250px width to leave room for zoom controls and padding
      styleSettings.setCanvasWidth(1250);
      styleSettings.setCanvasHeight(800);
    }
  }, [addon.isAddonMode]);

  // Load CSV data from URL (from "Open in New Tab" feature)
  useEffect(() => {
    const pendingCSV = sessionStorage.getItem('pendingCSVData');
    if (pendingCSV) {
      console.log('[URL CSV] Loading CSV data from URL parameter');
      const decodedCSV = decodeURIComponent(pendingCSV);
      chartData.loadCSVText(decodedCSV, ',', 'url-parameter');
      // Clear the pending data
      sessionStorage.removeItem('pendingCSVData');
    }
  }, []);

  // Load chart state from URL (from "Edit Chart by ID" feature)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedChartState = urlParams.get('chartState');

    if (encodedChartState) {
      console.log('[Chart State] Loading chart state from URL parameter');
      try {
        const chartStateJson = decodeURIComponent(encodedChartState);
        const chartState = JSON.parse(chartStateJson);

        // Apply the chart state to restore the chart
        if (applyChartState && navigate && chartData && styleSettings) {
          applyChartState(chartState, { navigate, chartData, styleSettings });
          console.log('[Chart State] Chart state loaded successfully');
        } else {
          console.error('[Chart State] Missing dependencies for applyChartState');
        }
      } catch (error) {
        console.error('[Chart State] Failed to load chart state:', error);
        // Don't show alert for normal page loads, only log error
      }
    }
  }, [navigate, chartData, styleSettings]);

  // Auto-load data from Google Sheets add-on
  useEffect(() => {
    if (addon.isAddonMode && addon.sheetData && addon.sheetData.csv) {
      console.log('[Add-on Mode] Loading sheet data automatically');
      chartData.loadCSVText(addon.sheetData.csv, ',', 'google-sheets-addon');
    }
  }, [addon.sheetData, addon.isAddonMode]);

  if (!chart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Chart Not Found</h1>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
          >
            Back to Gallery
          </button>
        </div>
      </div>
    );
  }

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleExportPNG = async () => {
    // Get the SVG element directly (same as SVG export)
    const svgElement = svgRef.current?.querySelector('svg');
    if (svgElement) {
      await exportAsPNG(svgElement, `${styleSettings.title}.png`);
    }
    setShowExportMenu(false);
  };

  const handleExportSVG = () => {
    // Use svgRef to get the actual chart SVG, not UI icons
    const svgElement = svgRef.current?.querySelector('svg');
    if (svgElement) {
      exportAsSVG(svgElement, `${styleSettings.title}.svg`);
    }
    setShowExportMenu(false);
  };

  // Handle Insert to Figma
  const handleInsertToFigma = () => {
    if (!figma.isFigmaMode) return;

    try {
      // Get the chart SVG element
      const svgElement = svgRef.current?.querySelector('svg');
      if (!svgElement) {
        figma.notifyFigma('⚠️ No chart to insert', 2000);
        return;
      }

      // Get SVG as string
      const svgString = new XMLSerializer().serializeToString(svgElement);

      // Send to Figma
      const success = figma.sendToFigma(svgString, styleSettings.title || 'Find&Tell Chart');

      if (success) {
        figma.notifyFigma('✅ Chart inserted to Figma!', 2000);
      }
    } catch (error) {
      console.error('[ChartEditor] Error inserting to Figma:', error);
      figma.notifyFigma('❌ Error inserting chart', 3000);
    }

    setShowExportMenu(false);
  };

  // Handle License Activation
  const handleActivateLicense = async () => {
    if (!licenseKeyInput.trim()) {
      alert('Please enter a license key');
      return;
    }

    const result = await license.activateLicense(licenseKeyInput.trim());

    if (result.success) {
      alert('✅ License activated successfully!');
      setShowActivateLicenseModal(false);
      setLicenseKeyInput('');

      // Close and reopen menu to refresh license status
      setShowHamburgerMenu(false);
      setTimeout(() => {
        setShowHamburgerMenu(true);
      }, 100);
    } else {
      alert(`❌ Activation failed: ${result.error}`);
    }
  };

  // Handle Start Trial (redirect to Lemon Squeezy checkout)
  const handleStartTrial = () => {
    // TODO: Replace with actual Lemon Squeezy checkout URL
    const checkoutUrl = 'https://findandtell.lemonsqueezy.com/checkout/buy/691427';
    window.open(checkoutUrl, '_blank');
    setShowHamburgerMenu(false);
  };

  // Handle View Plans
  const handleViewPlans = () => {
    window.open('https://findandtell.co/pricing', '_blank');
    setShowHamburgerMenu(false);
  };

  // Handle Insert to Google Sheets
  const handleInsertToSheet = async () => {
    if (!addon.isAddonMode) return;

    try {
      // Get the chart SVG element
      const svgElement = svgRef.current?.querySelector('svg');
      if (!svgElement) {
        alert('Chart not found. Please try again.');
        return;
      }

      // Get SVG as string and convert to base64
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBase64 = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));

      // Serialize complete chart state for later editing
      const chartState = serializeChartState({
        chartType,
        chartData,
        styleSettings,
        name: styleSettings.title || `${chartType}-chart`,
      });

      // Convert chart state to JSON string
      const chartStateJson = JSON.stringify(chartState);

      // Send SVG and chart state to Google Sheets
      addon.insertChartToSheet(svgBase64, 'svg', chartStateJson);

      // Success alert is now handled in useAddonMode hook with Chart ID
    } catch (error) {
      console.error('Error inserting chart:', error);
      alert('Error inserting chart. Please try again.');
    }
  };

  // Handle Save Chart (complete chart state)
  const handleSaveChart = () => {
    try {
      // Serialize complete chart state
      const chartState = serializeChartState({
        chartType,
        chartData,
        styleSettings,
        name: styleSettings.title || `${chartType}-chart`,
      });

      // Convert to JSON string
      const jsonString = JSON.stringify(chartState, null, 2);

      // Create blob and download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = generateChartFilename(styleSettings.title || `${chartType}-chart`, chartType);
      link.click();
      URL.revokeObjectURL(url);

      console.log('Chart saved successfully');
    } catch (error) {
      console.error('Failed to save chart:', error);
      alert('Failed to save chart: ' + error.message);
    }
  };

  // Handle Import Chart (load chart state from file)
  const handleImportChart = () => {
    chartImportFileInputRef.current?.click();
  };

  const handleChartFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Read file content
      const fileText = await file.text();
      const chartState = JSON.parse(fileText);

      // Deserialize and validate
      const parsedState = deserializeChartState(chartState);

      if (!parsedState.isValid) {
        throw new Error('Invalid chart file format');
      }

      // Apply chart state (removed confirmation dialog for Figma plugin compatibility)
      const result = await applyChartState(
        parsedState,
        (newChartType) => {
          if (newChartType !== chartType) {
            // Preserve query parameters (like ?mode=addon) when navigating
            const searchParams = window.location.search;
            navigate(`/chart/${newChartType}${searchParams}`);
          }
        },
        chartData,
        styleSettings
      );

      if (result.success) {
        console.log('Chart loaded successfully');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Failed to import chart:', error);
      alert('Failed to import chart: ' + error.message);
    } finally {
      event.target.value = ''; // Reset file input
    }
  };

  // Handle Save Style
  const handleSaveStyle = () => {
    // Generate suggested name and open modal
    const suggestedName = generateStyleName(styleSettings.title, chartType);
    setStyleName(suggestedName);
    setShowSaveStyleModal(true);
  };

  // Handle Save Style confirmation from modal
  const handleConfirmSaveStyle = () => {
    const settings = styleSettings.exportSettings();
    const metadata = {
      name: styleName,
      description: "",
      chartType: chartType,
    };
    downloadStyleFile(settings, metadata);
    setShowSaveStyleModal(false);
  };

  // Handle Import Style
  const handleImportStyle = () => {
    styleFileInputRef.current?.click();
  };

  // Handle file selection for import
  const handleStyleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const styleFile = await uploadStyleFile(file);
      styleSettings.importSettings(styleFile, chartType);
      alert('Style imported successfully!');
    } catch (error) {
      alert('Failed to import style: ' + error.message);
    }

    // Reset file input
    if (styleFileInputRef.current) {
      styleFileInputRef.current.value = '';
    }
  };

  // Handle paste CSV data
  const handlePasteCSV = async () => {
    if (!pastedCSV.trim()) {
      alert('Please paste CSV data first');
      return;
    }

    try {
      // Auto-detect delimiter
      const lines = pastedCSV.trim().split('\n');
      if (lines.length < 2) {
        alert('CSV data must have at least a header row and one data row');
        return;
      }

      const firstLine = lines[0];
      let delimiter = ',';

      // Count occurrences of common delimiters
      const commas = (firstLine.match(/,/g) || []).length;
      const tabs = (firstLine.match(/\t/g) || []).length;
      const semicolons = (firstLine.match(/;/g) || []).length;
      const spaces = (firstLine.match(/\s{2,}/g) || []).length; // Multiple spaces

      // Choose the most common delimiter
      if (tabs > commas && tabs > semicolons && tabs > spaces) {
        delimiter = '\t';
      } else if (semicolons > commas && semicolons > tabs && semicolons > spaces) {
        delimiter = ';';
      } else if (spaces > commas && spaces > tabs && spaces > semicolons && spaces > 0) {
        // Use regex to split by multiple spaces for space-delimited data
        delimiter = /\s{2,}/;
      }

      // Use the loadCSVText method from chartData hook
      const csvText = pastedCSV.trim();
      const success = await chartData.loadCSVText(csvText, delimiter);

      if (success) {
        // Close the paste area
        setShowPasteCSV(false);
        setPastedCSV('');
        alert('CSV data loaded successfully!');
      } else {
        // Error message is already set in chartData.error
        alert('Error loading CSV data: ' + (chartData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error parsing CSV:', error);
      alert('Error parsing CSV data: ' + error.message);
    }
  };

  // Helper function to clear all emphasis
  const clearEmphasis = () => {
    // Clear percent change comparisons
    if (clearEmphasisRef?.current) {
      clearEmphasisRef.current();
    }

    // Clear bar emphasis (desaturation)
    styleSettings.setEmphasizedBars([]);

    // Clear line emphasis for slope charts
    styleSettings.setEmphasizedLines([]);

    // Reset last clicked bar tracking
    lastClickedBarIdRef.current = null;
  };

  // Snapshot handlers
  const handleCaptureSnapshot = () => {
    if (!svgRef.current) return;

    const svgElement = svgRef.current.querySelector('svg');
    if (!svgElement) return;

    // Clone the SVG to capture current state
    const svgClone = svgElement.cloneNode(true);

    // Helper function to copy computed styles to inline styles
    const copyComputedStyles = (sourceNode, targetNode) => {
      const computedStyle = window.getComputedStyle(sourceNode);
      const criticalStyles = [
        'fill', 'stroke', 'stroke-width', 'font-family', 'font-size',
        'font-weight', 'text-anchor', 'opacity', 'transform',
        'dominant-baseline', 'alignment-baseline'
      ];

      criticalStyles.forEach(style => {
        const value = computedStyle.getPropertyValue(style);
        if (value && value !== 'none' && value !== 'normal') {
          targetNode.style[style] = value;
        }
      });
    };

    // Recursively copy styles from original to clone
    const copyStylesToClone = (original, clone) => {
      copyComputedStyles(original, clone);

      const originalChildren = original.children;
      const cloneChildren = clone.children;

      for (let i = 0; i < originalChildren.length; i++) {
        if (cloneChildren[i]) {
          copyStylesToClone(originalChildren[i], cloneChildren[i]);
        }
      }
    };

    // Copy all computed styles to the clone
    copyStylesToClone(svgElement, svgClone);

    // Ensure SVG has proper namespace
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

    // Serialize the styled SVG
    const svgString = new XMLSerializer().serializeToString(svgClone);

    // Export settings properly using the exportSettings method
    const exportedSettings = styleSettings.exportSettings();

    // Create snapshot object with SVG, settings, and data
    const snapshot = {
      id: `snapshot-${Date.now()}`,
      timestamp: Date.now(),
      chartType: chart.name,
      svgContent: svgString,
      // Store configuration for restoration
      data: {
        data: chartData.data,
        periodNames: chartData.periodNames,
        isComparisonMode: chartData.isComparisonMode,
        // Save/Load state
        rawCSV: chartData.rawCSV,
        source: chartData.source,
        googleSheetsUrl: chartData.googleSheetsUrl,
        hiddenPeriods: chartData.hiddenPeriods,
      },
      settings: exportedSettings,
    };

    setSnapshots(prev => [...prev, snapshot]);
  };

  const handleSnapshotClick = (snapshot) => {
    setSelectedSnapshot(snapshot);
    setShowSnapshotModal(true);
  };

  const handleDeleteSnapshot = (snapshotId) => {
    setSnapshots(prev => prev.filter(s => s.id !== snapshotId));
  };

  // Navigation handlers for snapshot modal
  const handleNextSnapshot = () => {
    if (!selectedSnapshot) return;
    const currentIndex = snapshots.findIndex(s => s.id === selectedSnapshot.id);
    if (currentIndex < snapshots.length - 1) {
      setSelectedSnapshot(snapshots[currentIndex + 1]);
    }
  };

  const handlePreviousSnapshot = () => {
    if (!selectedSnapshot) return;
    const currentIndex = snapshots.findIndex(s => s.id === selectedSnapshot.id);
    if (currentIndex > 0) {
      setSelectedSnapshot(snapshots[currentIndex - 1]);
    }
  };

  const handleSaveChartFromSnapshot = (snapshot) => {
    try {
      // Build chart state from snapshot data
      const chartState = serializeChartState({
        chartType: snapshot.chartType,
        chartData: {
          rawCSV: snapshot.data?.rawCSV || '',
          source: snapshot.data?.source || 'snapshot',
          googleSheetsUrl: snapshot.data?.googleSheetsUrl || '',
          periodNames: snapshot.data?.periodNames || [],
          stageCount: snapshot.data?.data?.length || 0,
          periodCount: snapshot.data?.periodNames?.length || 0,
          isComparisonMode: snapshot.data?.isComparisonMode || false,
          hiddenPeriods: snapshot.data?.hiddenPeriods || new Set(),
        },
        styleSettings: snapshot.settings || {},
        name: snapshot.name || `${snapshot.chartType}-chart`,
      });

      // Convert to JSON string
      const jsonString = JSON.stringify(chartState, null, 2);

      // Create blob and download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = generateChartFilename(snapshot.name || `${snapshot.chartType}-chart`, snapshot.chartType);
      link.click();
      URL.revokeObjectURL(url);

      console.log('Chart saved from snapshot successfully');
    } catch (error) {
      console.error('Failed to save chart from snapshot:', error);
      alert('Failed to save chart from snapshot: ' + error.message);
    }
  };

  const handleLoadChart = (snapshot) => {
    // Restore the data FIRST so it's available when settings are applied
    if (snapshot.data) {
      chartData.loadSnapshotData(
        snapshot.data.data,
        snapshot.data.periodNames,
        snapshot.data.isComparisonMode
      );
    }

    // Then restore the settings (including emphasis state)
    if (snapshot.settings) {
      // Use setTimeout to ensure the data is rendered before applying settings
      setTimeout(() => {
        styleSettings.importSettings(snapshot.settings, chartType);

        // Sync toggles with emphasized bars state
        const hasEmphasizedBars = styleSettings.emphasizedBars && styleSettings.emphasizedBars.length > 0;

        // Force Emphasis toggle to match emphasized bars state
        styleSettings.setEmphasis(hasEmphasizedBars);

        // Force Percent Change toggle to match emphasized bars state
        styleSettings.setPercentChangeEnabled(hasEmphasizedBars);
      }, 100);
    }

    // Scroll to top to show the restored chart
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Zoom and Pan handlers
  const handleMouseDown = (e) => {
    // Don't pan if clicking on SVG elements (the chart) or buttons
    const target = e.target;
    const isSVG = target.tagName === 'svg' || target.closest('svg');
    const isButton = target.tagName === 'BUTTON' || target.closest('button');

    // Only pan if clicking on the background (not the chart or buttons)
    if (!isSVG && !isButton && (e.button === 0 || e.button === 1)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  // Resize handlers
  const handleResizeStart = (e, handle) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizeHandle(handle);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: styleSettings.chartWidth,
      height: styleSettings.chartHeight,
    });
  };

  const handleResizeMove = (e) => {
    if (!isResizing || !resizeHandle) return;

    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;

    // Minimum and maximum dimensions for chart
    const MIN_WIDTH = 300;
    const MIN_HEIGHT = 200;
    const MAX_WIDTH = 1800;
    const MAX_HEIGHT = 1800;

    // Bottom-right: increasing width/height moves the corner down-right
    const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, resizeStart.width + deltaX));
    const newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, resizeStart.height + deltaY));

    // Update dimensions based on chart type
    if (chartType === 'slope') {
      // For Slope Chart: update periodHeight and derive periodSpacing from width
      // Canvas height = periodHeight + margins (80 top + 60 bottom = 140)
      // Canvas width = periodSpacing + label space (500) + margins (180)
      const periodHeight = Math.max(200, newHeight - 140);
      const periodSpacing = Math.max(100, newWidth - 680); // 680 = 500 label space + 180 margins

      styleSettings.setPeriodHeight(periodHeight);
      styleSettings.setPeriodSpacing(periodSpacing);
    } else if (chartType === 'funnel') {
      // For Funnel Chart: update canvasWidth and canvasHeight directly
      styleSettings.setCanvasWidth(newWidth);
      styleSettings.setCanvasHeight(newHeight);
    } else {
      // For Bar and Line charts: update chartWidth and chartHeight
      // (canvas dimensions will auto-update via useEffect)
      styleSettings.setChartWidth(newWidth);
      styleSettings.setChartHeight(newHeight);
    }
  };

  // Add resize move handler to document
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResizing, resizeHandle, resizeStart.x, resizeStart.y, resizeStart.width, resizeStart.height]);

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Apply style preset from sample dataset
  const applyStylePreset = useCallback(async (preset) => {
    if (!preset) return;

    // Set flag to prevent auto-calculation during preset loading
    isLoadingPresetRef.current = true;

    // If preset is a string (URL), fetch it
    if (typeof preset === 'string') {
      try {
        const response = await fetch(preset);
        if (!response.ok) {
          console.error('Failed to load style preset:', preset);
          isLoadingPresetRef.current = false;
          return;
        }
        const styleData = await response.json();
        // Use the importSettings function from useStyleSettings
        styleSettings.importSettings(styleData, chartType);
        // Reset flag after a short delay to allow all state updates to complete
        setTimeout(() => {
          isLoadingPresetRef.current = false;
        }, 100);
      } catch (error) {
        console.error('Error loading style preset:', error);
        isLoadingPresetRef.current = false;
      }
    } else {
      // If preset is already an object, apply directly (legacy support)
      // Apply all style settings from the preset
      if (preset.darkMode !== undefined) styleSettings.setDarkMode(preset.darkMode);
      if (preset.fontFamily) styleSettings.setFontFamily(preset.fontFamily);
      if (preset.titleFontSize) styleSettings.setTitleFontSize(preset.titleFontSize);
      if (preset.subtitleFontSize) styleSettings.setSubtitleFontSize(preset.subtitleFontSize);
      if (preset.segmentLabelFontSize) styleSettings.setSegmentLabelFontSize(preset.segmentLabelFontSize);
      if (preset.metricLabelFontSize) styleSettings.setMetricLabelFontSize(preset.metricLabelFontSize);
      if (preset.periodLabelFontSize) styleSettings.setPeriodLabelFontSize(preset.periodLabelFontSize);
      if (preset.emphasizedLines !== undefined) styleSettings.setEmphasizedLines(preset.emphasizedLines);

      // Slope chart line styling
      if (preset.lineThickness) styleSettings.setLineThickness(preset.lineThickness);
      if (preset.lineOpacity !== undefined) styleSettings.setLineOpacity(preset.lineOpacity);
      if (preset.lineSaturation !== undefined) styleSettings.setLineSaturation(preset.lineSaturation);
      if (preset.endpointSize) styleSettings.setEndpointSize(preset.endpointSize);
      if (preset.endpointStyle) styleSettings.setEndpointStyle(preset.endpointStyle);
      if (preset.labelPosition) styleSettings.setLabelPosition(preset.labelPosition);
      if (preset.showCategoryLabels !== undefined) styleSettings.setShowCategoryLabels(preset.showCategoryLabels);
      if (preset.showValueLabels !== undefined) styleSettings.setShowValueLabels(preset.showValueLabels);
      if (preset.labelFormat) styleSettings.setLabelFormat(preset.labelFormat);
      if (preset.periodSpacing) styleSettings.setPeriodSpacing(preset.periodSpacing);
      if (preset.periodLabelPosition) styleSettings.setPeriodLabelPosition(preset.periodLabelPosition);

      // Color settings
      if (preset.colorMode) styleSettings.setColorMode(preset.colorMode);
      if (preset.userCustomColors) styleSettings.setUserCustomColors(preset.userCustomColors);
      if (preset.startColor) styleSettings.setStartColor(preset.startColor);
      if (preset.endColor) styleSettings.setEndColor(preset.endColor);
      if (preset.increaseColor) styleSettings.setIncreaseColor(preset.increaseColor);
      if (preset.decreaseColor) styleSettings.setDecreaseColor(preset.decreaseColor);
      if (preset.noChangeColor) styleSettings.setNoChangeColor(preset.noChangeColor);

      // Title alignment
      if (preset.titleAlignment) styleSettings.setTitleAlignment(preset.titleAlignment);

      // Axis settings
      if (preset.axisEnds) styleSettings.setAxisEnds(preset.axisEnds);
      if (preset.slopeAxisLineColor) styleSettings.setSlopeAxisLineColor(preset.slopeAxisLineColor);
      if (preset.slopeAxisLineWidth) styleSettings.setSlopeAxisLineWidth(preset.slopeAxisLineWidth);
      if (preset.slopeAxisLineStyle) styleSettings.setSlopeAxisLineStyle(preset.slopeAxisLineStyle);

      // Layout settings
      if (preset.periodHeight) styleSettings.setPeriodHeight(preset.periodHeight);
      if (preset.chartWidth) styleSettings.setChartWidth(preset.chartWidth);
      if (preset.chartHeight) styleSettings.setChartHeight(preset.chartHeight);
      if (preset.canvasWidth) styleSettings.setCanvasWidth(preset.canvasWidth);
      if (preset.canvasHeight) styleSettings.setCanvasHeight(preset.canvasHeight);

      // Reset flag after a short delay to allow all state updates to complete
      setTimeout(() => {
        isLoadingPresetRef.current = false;
      }, 100);
    }
  }, [styleSettings, chartType]);

  // Calculate and apply viewport-based chart sizing
  const applyViewportBasedSizing = useCallback(() => {
    // Configurable viewport percentage - adjust this to change initial sizing
    const VIEWPORT_HEIGHT_PERCENTAGE = 0.70; // 70% of viewport height
    const VIEWPORT_WIDTH_PERCENTAGE = 0.65;  // 65% of viewport width

    // Calculate dimensions based on viewport
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Reserve space for header/controls (~200px) and padding
    const availableHeight = viewportHeight - 200;
    const availableWidth = viewportWidth - 400; // Reserve space for sidebar

    const targetHeight = Math.floor(availableHeight * VIEWPORT_HEIGHT_PERCENTAGE);
    const targetWidth = Math.floor(availableWidth * VIEWPORT_WIDTH_PERCENTAGE);

    // Adjust chart dimensions based on chart type to ensure consistent canvas size
    // Bar Chart adds margins to canvas, so we need to subtract them from chart dimensions
    const isBarChart = chartType?.startsWith('bar-');
    const finalChartWidth = isBarChart ? targetWidth - 240 : targetWidth;  // 180 left + 60 right
    const finalChartHeight = isBarChart ? targetHeight - 140 : targetHeight; // 60 top + 80 bottom

    // Set chart dimensions
    styleSettings.setChartHeight(finalChartHeight);
    styleSettings.setChartWidth(finalChartWidth);
  }, [styleSettings, chartType]);

  // Handle Reset View
  const handleResetView = () => {
    // Clear all emphasis
    clearEmphasis();

    // Reset zoom and pan
    setZoom(1);
    setPan({ x: 0, y: 0 });

    // Reload the current sample dataset to reset everything to defaults
    if (currentSampleDatasetKey) {
      // Reload the same dataset, which will apply its default stylePreset and settings
      chartData.loadSampleData(currentSampleDatasetKey);

      // Get the dataset to restore its default title and subtitle
      const dataset = getSampleDataset(currentSampleDatasetKey);
      if (dataset) {
        if (dataset.title) styleSettings.setTitle(dataset.title);
        if (dataset.subtitle) styleSettings.setSubtitle(dataset.subtitle);

        // Apply the default style preset after a brief delay to ensure data is loaded
        setTimeout(() => {
          if (dataset.stylePreset) {
            applyStylePreset(dataset.stylePreset);
          }
          // Restore viewport-based sizing
          applyViewportBasedSizing();
        }, 100);
      }
    } else {
      // If no sample dataset is loaded, just reset settings
      styleSettings.resetToDefaults();
      setTimeout(() => {
        applyViewportBasedSizing();
      }, 0);
    }
  };

  // Create settings object for chart component
  // PERFORMANCE OPTIMIZATION: Memoize chart style settings to prevent unnecessary re-renders
  // This is critical for large datasets - without memoization, the settings object is recreated
  // on every render, causing React.memo-wrapped chart components to re-render unnecessarily.
  // This optimization works in conjunction with the throttled setters above (line 113) to ensure
  // smooth interactions even with hundreds of data points.
  const chartStyleSettings = useMemo(() => {
    // Common settings for all chart types
    const commonSettings = {
      title: styleSettings.title,
      subtitle: styleSettings.subtitle,
      titleAlignment: styleSettings.titleAlignment,
      fontFamily: styleSettings.fontFamily,
      titleFontSize: styleSettings.titleFontSize,
      subtitleFontSize: styleSettings.subtitleFontSize,
      canvasWidth: styleSettings.canvasWidth,
      canvasHeight: styleSettings.canvasHeight,
      chartPadding: styleSettings.chartPadding,
      backgroundOpacity: styleSettings.backgroundOpacity,
      darkMode: styleSettings.darkMode,
      userTier: styleSettings.userTier,
    };

  // Funnel Chart specific settings
  const funnelSettings = chartType === 'funnel' ? {
    segmentLabelFontSize: styleSettings.segmentLabelFontSize,
    metricLabelFontSize: styleSettings.metricLabelFontSize,
    legendFontSize: styleSettings.legendFontSize,
    conversionLabelFontSize: styleSettings.conversionLabelFontSize,
    barColor: styleSettings.barColor,
    colorTransition: styleSettings.colorTransition,
    comparisonPalette: styleSettings.comparisonPalette,
    userCustomColors: styleSettings.userCustomColors,
    orientation: styleSettings.orientation,
    aspectRatio: styleSettings.aspectRatio,
    stageGap: styleSettings.stageGap,
    stageLabelPosition: styleSettings.stageLabelPosition,
    axisLineWidth: styleSettings.axisLineWidth,
    emphasis: styleSettings.emphasis,
    metricEmphasis: styleSettings.metricEmphasis,
    normalizeToHundred: styleSettings.normalizeToHundred,
    compactNumbers: styleSettings.compactNumbers,
    showLegend: styleSettings.showLegend,
    legendPosition: styleSettings.legendPosition,
    inStageLabelFontSize: styleSettings.inStageLabelFontSize,
    showSparklines: styleSettings.showSparklines,
    sparklineType: styleSettings.sparklineType,
    backgroundOpacity: styleSettings.backgroundOpacity,
    backgroundColor: styleSettings.backgroundColor,
    // Layout for Funnel Chart - uses canvas dimensions directly
    chartWidth: styleSettings.canvasWidth,
    chartHeight: styleSettings.canvasHeight,
  } : {};

  // Slope Chart specific settings
  const slopeSettings = chartType === 'slope' ? {
    colorMode: styleSettings.colorMode,
    comparisonPalette: styleSettings.comparisonPalette,
    userCustomColors: styleSettings.userCustomColors,
    lineThickness: styleSettings.lineThickness,
    lineOpacity: styleSettings.lineOpacity,
    lineSaturation: styleSettings.lineSaturation,
    endpointSize: styleSettings.endpointSize,
    endpointStyle: styleSettings.endpointStyle,
    labelPosition: styleSettings.labelPosition,
    showCategoryLabels: styleSettings.showCategoryLabels,
    showValueLabels: styleSettings.showValueLabels,
    labelFormat: styleSettings.labelFormat,
    compactNumbers: styleSettings.compactNumbers,
    emphasizedLines: styleSettings.emphasizedLines,
    increaseColor: styleSettings.increaseColor,
    decreaseColor: styleSettings.decreaseColor,
    noChangeColor: styleSettings.noChangeColor,
    startColor: styleSettings.startColor,
    endColor: styleSettings.endColor,
    // Typography for Slope Chart
    categoryFont: styleSettings.fontFamily,
    categoryFontSize: styleSettings.segmentLabelFontSize,
    categoryFontWeight: 500,
    valueFont: styleSettings.fontFamily,
    valueFontSize: styleSettings.metricLabelFontSize,
    valueFontWeight: 400,
    periodFont: styleSettings.fontFamily,
    periodFontSize: styleSettings.periodLabelFontSize,
    periodFontWeight: 600,
    periodColor: styleSettings.darkMode ? '#e5e7eb' : '#374151',
    periodLabelPosition: styleSettings.periodLabelPosition,
    emphasizedLineThickness: 5,
    emphasizedLabelWeight: 700,
    // Layout for Slope Chart
    width: styleSettings.canvasWidth,
    height: styleSettings.canvasHeight,
    // Use periodHeight directly from settings (not calculated from chartHeight)
    periodHeight: styleSettings.periodHeight,
    marginTop: 60,
    marginRight: 160,
    marginBottom: 140,
    marginLeft: 160,
    // Visual for Slope Chart
    backgroundColor: styleSettings.backgroundColor,
    showAxisLines: true,
    periodSpacing: styleSettings.periodSpacing,
    axisLineColor: styleSettings.darkMode ? '#6b7280' : styleSettings.slopeAxisLineColor,
    axisLineWidth: styleSettings.slopeAxisLineWidth,
    axisLineStyle: styleSettings.slopeAxisLineStyle,
    axisEnds: styleSettings.axisEnds,
    darkMode: styleSettings.darkMode,
  } : {};

  // Bar Chart specific settings
  const barSettings = (chartType?.startsWith('bar-')) ? {
    barMode: styleSettings.barMode,
    labelMode: styleSettings.labelMode,
    legendPosition: styleSettings.legendPosition,
    directLabelContent: styleSettings.directLabelContent,
    emphasizedBars: styleSettings.emphasizedBars,
    barColor: styleSettings.barColor,
    colorPalette: styleSettings.comparisonPalette,
    customColors: styleSettings.userCustomColors,
    orientation: styleSettings.orientation,
    showValueLabels: styleSettings.showValueLabels,
    showMetricLabels: styleSettings.showMetricLabels,
    showPeriodLabels: styleSettings.showPeriodLabels,
    metricLabelPosition: styleSettings.metricLabelPosition,
    periodLabelDisplay: styleSettings.periodLabelDisplay,
    // Typography for Bar Chart
    categoryFont: styleSettings.fontFamily,
    categoryFontSize: styleSettings.segmentLabelFontSize,
    categoryWeight: 500,
    valueFont: styleSettings.fontFamily,
    valueFontSize: styleSettings.metricLabelFontSize,
    valueWeight: 600,
    axisFont: styleSettings.fontFamily,
    xAxisFontSize: styleSettings.xAxisFontSize,
    yAxisFontSize: styleSettings.yAxisFontSize,
    axisLabel: styleSettings.axisLabel,
    axisLabelFontSize: styleSettings.axisLabelFontSize,
    xAxisLabelRotation: styleSettings.xAxisLabelRotation,
    axisWeight: 400,
    axisMinimum: styleSettings.axisMinimum,
    axisMinimumAuto: styleSettings.axisMinimumAuto,
    axisMaximum: styleSettings.axisMaximum,
    axisMaximumAuto: styleSettings.axisMaximumAuto,
    axisMajorUnit: styleSettings.axisMajorUnit,
    axisMajorUnitAuto: styleSettings.axisMajorUnitAuto,
    axisMinorUnit: styleSettings.axisMinorUnit,
    axisMinorUnitAuto: styleSettings.axisMinorUnitAuto,
    axisMajorTickType: styleSettings.axisMajorTickType,
    axisMinorTickType: styleSettings.axisMinorTickType,
    showHorizontalGridlines: styleSettings.showHorizontalGridlines,
    showVerticalGridlines: styleSettings.showVerticalGridlines,
    xAxisLineThickness: styleSettings.xAxisLineThickness,
    yAxisLineThickness: styleSettings.yAxisLineThickness,
    axisColorBrightness: styleSettings.axisColorBrightness,
    showXAxisLabels: styleSettings.showXAxisLabels,
    showYAxisLabels: styleSettings.showYAxisLabels,
    valuePrefix: styleSettings.valuePrefix,
    valueSuffix: styleSettings.valueSuffix,
    valueDecimalPlaces: styleSettings.valueDecimalPlaces,
    valueFormat: styleSettings.valueFormat,
    axisValuePrefix: styleSettings.axisValuePrefix,
    axisValueSuffix: styleSettings.axisValueSuffix,
    axisValueDecimalPlaces: styleSettings.axisValueDecimalPlaces,
    axisValueFormat: styleSettings.axisValueFormat,
    periodLabelFontSize: styleSettings.periodLabelFontSize,
    compactAxisNumbers: styleSettings.compactAxisNumbers,
    compactNumbers: styleSettings.compactNumbers,
    setCalculatedAxisMinimum: styleSettings.setCalculatedAxisMinimum,
    setCalculatedAxisMaximum: styleSettings.setCalculatedAxisMaximum,
    setCalculatedAxisMajorUnit: styleSettings.setCalculatedAxisMajorUnit,
    showGrid: true,
    gridOpacity: 0.1,
    showXAxis: true,
    showYAxis: true,
    axisColor: '#000000',
    axisOpacity: 1,
    barWidthPercent: styleSettings.barWidth,
    groupPadding: styleSettings.stageGap / 100,
    barOpacity: 1,
    barBorderWidth: 0,
    barBorderColor: '#ffffff',
    chartHeight: styleSettings.chartHeight || 400,
    chartWidth: styleSettings.chartWidth || 600,
    percentChangeEnabled: styleSettings.percentChangeEnabled,
    percentChangeLabelFormat: styleSettings.percentChangeLabelFormat,
    percentChangeBracketDistance: styleSettings.percentChangeBracketDistance,
    darkMode: styleSettings.darkMode,
    backgroundColor: styleSettings.backgroundColor,
    showTotalLabels: styleSettings.showTotalLabels,
    boldTotal: styleSettings.boldTotal,
  } : {};

  // Line Chart specific settings
  const lineSettings = (chartType === 'line' || chartType === 'area' || chartType === 'area-stacked') ? {
    // Time settings
    timeScale: styleSettings.timeScale || 'month',
    dateField: 'date',

    // Time aggregation
    aggregationLevel: styleSettings.aggregationLevel || 'day',
    aggregationMethod: styleSettings.aggregationMethod || 'sum',
    fiscalYearStartMonth: styleSettings.fiscalYearStartMonth || 1,
    xAxisTimeGrouping: styleSettings.xAxisTimeGrouping || 'auto',
    xAxisLabelLevels: styleSettings.xAxisLabelLevels || 2,
    dateRangeFilter: styleSettings.dateRangeFilter || [0, 100],
    xAxisPrimaryLabel: styleSettings.xAxisPrimaryLabel || 'auto',
    xAxisSecondaryLabel: styleSettings.xAxisSecondaryLabel || 'auto',
    dateFormatPreset: styleSettings.dateFormatPreset || 'MM/dd/yy',
    dateFormatCustom: styleSettings.dateFormatCustom || '',

    // Line styling
    lineThickness: styleSettings.lineThickness || 2,
    lineStyle: styleSettings.lineStyle || 'solid',
    lineOpacity: styleSettings.lineOpacity || 1.0,
    smoothLines: styleSettings.smoothLines || false,
    lineSaturation: styleSettings.lineSaturation || 100,

    // Color mode
    colorMode: styleSettings.colorMode || 'category',
    comparisonPalette: styleSettings.comparisonPalette || 'observable10',
    userCustomColors: styleSettings.userCustomColors || ['#1e40af', '#0d9488', '#991b1b'],

    // Point styling
    showPoints: styleSettings.showPoints !== undefined ? styleSettings.showPoints : true,
    pointSize: styleSettings.pointSize || 4,
    pointStyle: styleSettings.pointStyle || 'filled',
    pointBorderWidth: styleSettings.pointBorderWidth || 2,
    excludeZeroValues: styleSettings.excludeZeroValues !== undefined ? styleSettings.excludeZeroValues : true,
    showMostRecentPoint: styleSettings.showMostRecentPoint || false,

    // Area fill
    showAreaFill: styleSettings.showAreaFill || false,
    areaOpacity: styleSettings.areaOpacity || 0.2,
    areaGradient: styleSettings.areaGradient || false,
    stackAreas: styleSettings.stackAreas || false,
    chartMode: styleSettings.chartMode || 'line',

    // Emphasis
    emphasizedLines: styleSettings.emphasizedLines || [],
    emphasizedLineThickness: styleSettings.emphasizedLineThickness || 4,
    emphasizedPointSize: styleSettings.emphasizedPointSize || 6,
    emphasizedPoints: styleSettings.emphasizedPoints || [],
    emphasizedMetric: styleSettings.emphasizedMetric || null,
    emphasisLabelPosition: styleSettings.emphasisLabelPosition || 'above',
    emphasisLabelFontSize: styleSettings.emphasisLabelFontSize || 12,
    showEmphasisDate: styleSettings.showEmphasisDate || false,
    showEmphasisVerticalLine: styleSettings.showEmphasisVerticalLine || false,
    emphasisCompactNumbers: styleSettings.emphasisCompactNumbers || false,
    emphasisValuePrefix: styleSettings.emphasisValuePrefix || '',
    emphasisValueSuffix: styleSettings.emphasisValueSuffix || '',
    emphasisDecimalPlaces: styleSettings.emphasisDecimalPlaces ?? 0,

    // Labels
    showValueLabels: styleSettings.showValueLabels || false,
    showDirectLabels: styleSettings.showDirectLabels !== undefined ? styleSettings.showDirectLabels : true,
    labelFontSize: styleSettings.labelFontSize || 12,
    directLabelFontSize: styleSettings.directLabelFontSize || 14,
    showSumLabels: styleSettings.showSumLabels || false,
    sumLabelPosition: styleSettings.sumLabelPosition || 'direct',
    sumLabelFontSize: styleSettings.sumLabelFontSize || 14,
    compactNumbers: styleSettings.compactNumbers !== undefined ? styleSettings.compactNumbers : true,

    // Axes
    showXAxis: styleSettings.showXAxis !== undefined ? styleSettings.showXAxis : true,
    showYAxis: styleSettings.showYAxis !== undefined ? styleSettings.showYAxis : true,
    xAxisPosition: styleSettings.xAxisPosition || 'bottom',
    yAxisPosition: styleSettings.yAxisPosition || 'left',
    xAxisLabelRotation: styleSettings.xAxisLabelRotation || 0,
    yAxisFormat: styleSettings.yAxisFormat || 'auto',
    xAxisFontSize: styleSettings.xAxisFontSize || 12,
    xAxisSecondaryFontSize: styleSettings.xAxisSecondaryFontSize || 12,
    yAxisFontSize: styleSettings.yAxisFontSize || 20,
    axisLabel: styleSettings.axisLabel || '',
    axisLabelFontSize: styleSettings.axisLabelFontSize || 17,

    // Axis bounds and units
    axisMinimum: styleSettings.axisMinimum || 0,
    axisMinimumAuto: styleSettings.axisMinimumAuto !== undefined ? styleSettings.axisMinimumAuto : true,
    axisMaximum: styleSettings.axisMaximum || 50000,
    axisMaximumAuto: styleSettings.axisMaximumAuto !== undefined ? styleSettings.axisMaximumAuto : true,
    axisMajorUnit: styleSettings.axisMajorUnit || 10000,
    axisMajorUnitAuto: styleSettings.axisMajorUnitAuto !== undefined ? styleSettings.axisMajorUnitAuto : true,
    axisMinorUnit: styleSettings.axisMinorUnit || 5,
    axisMinorUnitAuto: styleSettings.axisMinorUnitAuto !== undefined ? styleSettings.axisMinorUnitAuto : true,
    calculatedAxisMinimum: styleSettings.calculatedAxisMinimum || 0,
    calculatedAxisMaximum: styleSettings.calculatedAxisMaximum || 100,
    calculatedAxisMajorUnit: styleSettings.calculatedAxisMajorUnit || 10,

    // Tick marks
    axisMajorTickType: styleSettings.axisMajorTickType || 'outside',
    axisMinorTickType: styleSettings.axisMinorTickType || 'none',

    // Grid
    showGridLines: styleSettings.showGridLines !== undefined ? styleSettings.showGridLines : true,
    gridDirection: styleSettings.gridDirection || 'horizontal',
    gridLineColor: styleSettings.darkMode ? '#4b5563' : '#e5e7eb',
    gridLineStyle: styleSettings.gridLineStyle || 'solid',
    gridLineOpacity: styleSettings.gridLineOpacity || 0.5,
    showHorizontalGridlines: styleSettings.showHorizontalGridlines !== undefined ? styleSettings.showHorizontalGridlines : false,
    showVerticalGridlines: styleSettings.showVerticalGridlines !== undefined ? styleSettings.showVerticalGridlines : false,
    compactAxisNumbers: styleSettings.compactAxisNumbers !== undefined ? styleSettings.compactAxisNumbers : true,
    xAxisLineThickness: styleSettings.xAxisLineThickness !== undefined ? styleSettings.xAxisLineThickness : 1,
    yAxisLineThickness: styleSettings.yAxisLineThickness !== undefined ? styleSettings.yAxisLineThickness : 1,
    axisColorBrightness: styleSettings.axisColorBrightness,
    showXAxisLabels: styleSettings.showXAxisLabels,
    showYAxisLabels: styleSettings.showYAxisLabels,

    // Number formatting (Labels)
    valuePrefix: styleSettings.valuePrefix || '',
    valueSuffix: styleSettings.valueSuffix || '',
    valueDecimalPlaces: styleSettings.valueDecimalPlaces || 0,
    valueFormat: styleSettings.valueFormat || 'number',

    // Number formatting (Axis)
    axisValuePrefix: styleSettings.axisValuePrefix || '',
    axisValueSuffix: styleSettings.axisValueSuffix || '',
    axisValueDecimalPlaces: styleSettings.axisValueDecimalPlaces || 0,
    axisValueFormat: styleSettings.axisValueFormat || 'number',

    // Legend
    showLegend: styleSettings.showLegend !== undefined ? styleSettings.showLegend : true,
    legendPosition: styleSettings.legendPosition || 'top',
    legendFontSize: styleSettings.legendFontSize || 12,

    // Advanced features
    baselines: styleSettings.baselines || [],
    showMovingAverage: styleSettings.showMovingAverage || false,
    movingAveragePeriod: styleSettings.movingAveragePeriod || 3,
    movingAverageColor: styleSettings.movingAverageColor || '#6b7280',
    showPercentChangeBrackets: styleSettings.showPercentChangeBrackets || false,
    percentChangeBracketPairs: styleSettings.percentChangeBracketPairs || [],

    // Tooltips
    showTooltips: styleSettings.showTooltips !== undefined ? styleSettings.showTooltips : true,
    tooltipFormat: styleSettings.tooltipFormat || 'auto',

    // Layout
    width: styleSettings.chartWidth,
    height: styleSettings.chartHeight,
    marginTop: 60,
    marginRight: 80,
    marginBottom: 60,
    marginLeft: 80,

    // Background
    backgroundColor: styleSettings.backgroundColor,
    darkMode: styleSettings.darkMode,
  } : {};

    // Combine all settings based on chart type
    return {
      ...commonSettings,
      ...funnelSettings,
      ...slopeSettings,
      ...barSettings,
      ...lineSettings,
    };
  }, [styleSettings, chartType, chartData.hiddenPeriods]);

  // Render chart component based on type
  const renderChart = () => {
    if (!chartData.hasData) return null;

    // Handle bar chart variants (all use BarChart component)
    if (chartType?.startsWith('bar-')) {
      const visibleBarPeriods = (chartData.periodNames || []).filter(
        period => !chartData.hiddenPeriods?.has(period)
      );
      return (
        <BarChart
          data={chartData.data}
          periodNames={visibleBarPeriods}
          styleSettings={chartStyleSettings}
          onBarClick={handleBarClick}
          onClearEmphasis={(clearFn) => { clearEmphasisRef.current = clearFn; }}
        />
      );
    }

    // Handle line/area chart variants (all use LineChart component)
    if (chartType === 'line' || chartType === 'area' || chartType === 'area-stacked') {
      const visibleMetrics = (chartData.periodNames || []).filter(
        metric => !chartData.hiddenPeriods?.has(metric)
      );
      return (
        <LineChart
          data={chartData.data}
          metricNames={visibleMetrics}
          styleSettings={chartStyleSettings}
          onPointClick={handleLineChartPointClick}
          onMetricClick={handleLineChartMetricClick}
          onLabelDrag={handleLineChartLabelDrag}
        />
      );
    }

    switch (chartType) {
      case 'funnel':
        // Filter out hidden periods
        const visibleFunnelPeriods = (chartData.periodNames || []).filter(
          period => !chartData.hiddenPeriods?.has(period)
        );
        return (
          <FunnelChart
            data={chartData.data}
            periodNames={visibleFunnelPeriods}
            isComparisonMode={chartData.isComparisonMode}
            styleSettings={chartStyleSettings}
          />
        );
      case 'slope':
        // Filter out hidden periods
        const visibleSlopePeriods = (chartData.periodNames || []).filter(
          period => !chartData.hiddenPeriods?.has(period)
        );
        return (
          <SlopeChart
            data={chartData.data}
            periodNames={visibleSlopePeriods}
            styleSettings={chartStyleSettings}
            onLineClick={handleSlopeLineClick}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Top Header - Fixed - Hidden in add-on mode */}
      {!addon.isAddonMode && (
        <div className="bg-white border-b border-gray-200 shadow-sm z-10 flex-shrink-0">
          {isDockMode && figma.isFigmaMode ? (
            /* Minimal Dock Mode Header - 300x60 */
            <div className="px-2 py-2 flex items-center justify-between">
              {/* Dock Mode Toggle */}
              <button
                onClick={toggleDockMode}
                className="px-2 py-1.5 bg-cyan-100 text-cyan-700 hover:bg-cyan-200 rounded font-medium transition-colors"
                title="Click to expand (1400px wide mode)"
              >
                <ArrowsPointingOutIcon className="w-4 h-4" />
              </button>

              {/* Find&Tell Logo */}
              <img
                src="/findandtell_logo.png"
                alt="Find&Tell"
                className="h-8"
              />
            </div>
          ) : (
            /* Full Header - Reorganized */
            <div className="px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Dock Mode Toggle (Figma only) - Leftmost */}
                {figma.isFigmaMode && (
                  <button
                    onClick={toggleDockMode}
                    className="px-2 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                    title="Minimize window"
                  >
                    <ViewColumnsIcon className="w-5 h-5" />
                  </button>
                )}

                {/* Find&Tell Logo */}
                <img
                  src="/findandtell_logo.png"
                  alt="Find&Tell"
                  className="h-10"
                />

                {/* Hamburger Menu */}
                <div className="relative" ref={hamburgerMenuRef}>
                  <button
                    onClick={() => setShowHamburgerMenu(!showHamburgerMenu)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                    title="Menu"
                  >
                    <Bars3Icon className="w-6 h-6" />
                  </button>

                  {showHamburgerMenu && (
                    <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      {/* Account Section */}
                      <div className="px-4 py-2 border-b border-gray-200">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Account</div>

                        {/* Show license status dynamically */}
                        {license.hasAccess && license.isTrial ? (
                          /* Trial Active */
                          <>
                            <div className="px-3 py-2 mb-2 bg-cyan-50 border border-cyan-200 rounded">
                              <div className="text-xs text-cyan-700 font-medium">Pro Trial Active</div>
                              <div className="text-xs text-cyan-600 mt-0.5">
                                {license.getTrialDaysRemaining} day{license.getTrialDaysRemaining !== 1 ? 's' : ''} remaining
                              </div>
                            </div>
                            <button
                              onClick={handleStartTrial}
                              className="w-full px-3 py-2.5 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-all"
                            >
                              Upgrade to Pro - $12.99/mo
                            </button>
                          </>
                        ) : license.hasAccess ? (
                          /* Pro Active */
                          <div className="px-3 py-2 mb-2 bg-green-50 border border-green-200 rounded">
                            <div className="text-xs text-green-700 font-medium">{license.getPlanName}</div>
                            <div className="text-xs text-green-600 mt-0.5">Active</div>
                          </div>
                        ) : (
                          /* Free Tier */
                          <>
                            <div className="px-3 py-2 mb-2 bg-gray-50 rounded">
                              <div className="text-xs text-gray-500">Current Plan</div>
                              <div className="text-sm font-medium text-gray-900">Free</div>
                            </div>

                            <div className="space-y-1">
                              {/* Primary CTA - Start Trial */}
                              <button
                                onClick={handleStartTrial}
                                className="w-full px-3 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
                              >
                                <RocketLaunchIcon className="w-5 h-5" /> Start 7-Day Free Trial
                              </button>

                              {/* Secondary options */}
                              <button
                                onClick={() => {
                                  setShowActivateLicenseModal(true);
                                  setShowHamburgerMenu(false);
                                }}
                                className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 rounded flex items-center gap-2"
                              >
                                <KeyIcon className="w-4 h-4" /> Have a license? Activate here
                              </button>

                              <button
                                onClick={handleViewPlans}
                                className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 rounded flex items-center gap-2"
                              >
                                <SparklesIcon className="w-4 h-4" /> View Pro & Team plans
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Help Section */}
                      <div className="px-4 py-2 border-b border-gray-200">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Help</div>
                        <div className="space-y-1">
                          <a
                            href="https://docs.findandtell.co"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center gap-2"
                          >
                            <BookOpenIcon className="w-5 h-5" /> Documentation
                          </a>
                          <a
                            href="https://guides.findandtell.co"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center gap-2"
                          >
                            <AcademicCapIcon className="w-5 h-5" /> Guides
                          </a>
                          <a
                            href="https://youtube.com/@findandtell"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center gap-2"
                          >
                            <PlayCircleIcon className="w-5 h-5" /> Video Tutorials
                          </a>
                          <a
                            href="#"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center gap-2"
                            title="Share your feedback (link coming soon)"
                          >
                            <ChatBubbleLeftRightIcon className="w-5 h-5" /> Share Feedback
                          </a>
                        </div>
                      </div>

                      {/* Version */}
                      <div className="px-4 py-2">
                        <div className="text-xs text-gray-400 text-center">Beta Release 1.0.0</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chart Gallery Button */}
                <button
                  onClick={() => navigate('/')}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                >
                  Chart Gallery
                </button>

                {/* Chart Type Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Switch to:</span>
                  <div className="relative" ref={chartDropdownRef}>
                    <button
                      onClick={() => setIsChartDropdownOpen(!isChartDropdownOpen)}
                      className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 flex items-center gap-2 min-w-[220px]"
                    >
                      {React.createElement(chartRegistry[chartType].icon, { className: 'w-5 h-5' })}
                      <span className="flex-1 text-left">{chartRegistry[chartType].name}</span>
                      <ChevronDownIcon className={`w-4 h-4 transition-transform ${isChartDropdownOpen ? 'transform rotate-180' : ''}`} />
                    </button>

                    {isChartDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                        {Object.entries(chartRegistry).map(([key, chartInfo]) => {
                          const Icon = chartInfo.icon;
                          return (
                            <button
                              key={key}
                              onClick={() => {
                                if (key === chartType) {
                                  setIsChartDropdownOpen(false);
                                  return;
                                }

                                // Removed confirmation dialog for Figma plugin compatibility
                                // User's action of clicking the chart type is explicit consent
                                setIsChartDropdownOpen(false);
                                // Preserve query parameters (like ?sheetsUrl=...)
                                const searchParams = window.location.search;
                                navigate(`/chart/${key}${searchParams}`);
                              }}
                              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${
                                key === chartType ? 'bg-cyan-50 text-cyan-700' : 'text-gray-700'
                              }`}
                            >
                              <Icon className="w-5 h-5 flex-shrink-0" />
                              <span>{chartInfo.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">

              {!showPanel && (
                <button
                  onClick={() => setShowPanel(true)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Show Controls
                </button>
              )}

              {/* Import Chart Button */}
              <button
                onClick={handleImportChart}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center gap-2"
                title="Import chart from file"
              >
                <CloudArrowUpIcon className="w-4 h-4" />
                Import
              </button>

              {/* Hidden file input for chart import */}
              <input
                ref={chartImportFileInputRef}
                type="file"
                accept=".json"
                onChange={handleChartFileChange}
                className="hidden"
              />

              {/* Export - In Figma mode: direct button, otherwise dropdown */}
              {figma.isFigmaMode ? (
                /* Direct Insert to Figma button - no dropdown needed */
                <button
                  onClick={handleInsertToFigma}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium flex items-center gap-2"
                >
                  <span>🎨</span> Insert to Figma
                </button>
              ) : (
                /* Export dropdown for non-Figma mode */
                <div className="relative" ref={exportMenuRef}>
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium flex items-center gap-2"
                  >
                    Export
                    <span className="text-sm">▼</span>
                  </button>

                  {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                      <button
                        onClick={handleExportPNG}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700 flex items-center gap-2"
                      >
                        <span>📷</span> Export as PNG
                      </button>
                      <button
                        onClick={handleExportSVG}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700 flex items-center gap-2"
                      >
                        <span>📐</span> Export as SVG
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content Area - Hidden in dock mode */}
      {!(isDockMode && figma.isFigmaMode) && (
      <div className="flex-1 flex overflow-hidden">
        {/* Chart Display Area - Scrollable when needed */}
        <div
          className="flex-1 flex items-center justify-center overflow-auto"
          style={{
            cursor: isPanning ? 'grabbing' : 'grab',
          }}
          ref={chartContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Toggle Controls Button - Top Right */}
          {!showPanel && (
            <button
              onClick={() => setShowPanel(true)}
              onMouseDown={(e) => e.stopPropagation()}
              className="absolute top-4 right-4 px-4 py-2 bg-cyan-600 text-white rounded-lg shadow-lg hover:bg-cyan-700 font-medium flex items-center gap-2 z-50 transition-all"
              style={{ pointerEvents: 'auto' }}
              title="Show Controls"
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
              Controls
            </button>
          )}

          {/* Zoom Controls - Fixed Position */}
          {chartData.hasData && !showDataTable && (
            <div className="absolute bottom-8 left-8 flex flex-col gap-2 z-50" style={{ pointerEvents: 'auto' }}>
              <button
                onClick={handleZoomIn}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-12 h-12 bg-white border-2 border-gray-300 rounded-lg shadow-lg hover:bg-gray-50 hover:border-cyan-500 flex items-center justify-center transition-all"
                title="Zoom In"
              >
                <PlusIcon className="w-6 h-6 text-gray-700" />
              </button>
              <button
                onClick={handleZoomOut}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-12 h-12 bg-white border-2 border-gray-300 rounded-lg shadow-lg hover:bg-gray-50 hover:border-cyan-500 flex items-center justify-center transition-all"
                title="Zoom Out"
              >
                <MinusIcon className="w-6 h-6 text-gray-700" />
              </button>
              <button
                onClick={handleResetZoom}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-12 h-12 bg-white border-2 border-gray-300 rounded-lg shadow-lg hover:bg-gray-50 hover:border-cyan-500 flex items-center justify-center transition-all"
                title="Reset Zoom & Pan"
              >
                <ArrowPathIcon className="w-6 h-6 text-gray-700" />
              </button>
              <div className="px-3 py-2 bg-white border-2 border-gray-300 rounded-lg shadow-lg text-sm font-semibold text-gray-700 text-center">
                {Math.round(zoom * 100)}%
              </div>
            </div>
          )}

          {chartData.hasData ? (
            <div
              className="flex flex-col items-center gap-4 flex-shrink-0 p-4"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
                transition: isPanning ? 'none' : 'transform 0.1s ease-out',
                minWidth: 'min-content',
              }}
            >
              {/* Action Buttons - Fixed above chart */}
              <div className="flex justify-center gap-4 flex-shrink-0">
                <button
                  onClick={handleResetView}
                  className="text-cyan-600 hover:text-cyan-700 font-medium text-sm underline"
                >
                  Reset View
                </button>
                <button
                  onClick={() => setShowDataTable(!showDataTable)}
                  className="px-4 py-2 bg-cyan-600 text-white font-medium text-sm rounded-lg hover:bg-cyan-700"
                >
                  {showDataTable ? '← Back to Chart' : 'Edit Data'}
                </button>
              </div>

              {/* Chart/Data Table Card with Flip Animation */}
              <div
                className="relative flex-shrink-0"
                style={{
                  // Add 30px (15px * 2 sides) to accommodate padding
                  width: chartStyleSettings.canvasWidth + 30,
                  // Add 30px for padding + 50px for watermark on free tier
                  height: chartStyleSettings.canvasHeight + 30 + (styleSettings.userTier !== 'pro' ? 50 : 0),
                  perspective: '1000px',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    transformStyle: 'preserve-3d',
                    transform: showDataTable ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    transition: 'transform 0.6s',
                  }}
                >
                  {/* Front: Chart */}
                  <div
                    className="absolute inset-0 bg-white rounded-2xl shadow-lg border border-gray-200 flex items-center justify-center"
                    style={{
                      backfaceVisibility: 'hidden',
                      padding: '15px',
                    }}
                    ref={svgRef}
                  >
                    {renderChart()}
                  </div>

                  {/* Back: Data Table */}
                  <div
                    className="absolute inset-0 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-auto"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      padding: '20px',
                    }}
                  >
                    <EditDataTable
                      chartData={chartData}
                      chartType={chartType}
                      onClose={() => setShowDataTable(false)}
                    />
                  </div>
                </div>

                {/* Resize Handle on Chart Corner - Only show when not in data table mode */}
                {!showDataTable && (
                  <div
                    className="absolute cursor-se-resize"
                    style={{
                      bottom: 6,
                      right: 6,
                      width: 16,
                      height: 16,
                      transform: `scale(${1 / zoom})`,
                      transformOrigin: 'bottom right',
                      pointerEvents: 'auto',
                      zIndex: 100,
                    }}
                    onMouseDown={(e) => handleResizeStart(e, 'br')}
                    title="Resize chart"
                  >
                    <div className="w-full h-full bg-cyan-500 border-2 border-white rounded-full shadow-lg hover:bg-cyan-600 transition-colors" />
                  </div>
                )}
              </div>

              {/* Capture Snapshot and Save Chart Buttons */}
              {!showDataTable && (
                <div className="flex items-center gap-3">
                  {/* Insert to Sheet button - only in add-on mode */}
                  {addon.isAddonMode && (
                    <button
                      onClick={handleInsertToSheet}
                      className="px-6 py-2 bg-purple-600 text-white font-medium text-sm rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
                      title="Insert chart into Google Sheets"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      Insert to Sheet
                    </button>
                  )}
                  <button
                    onClick={handleCaptureSnapshot}
                    className="px-6 py-2 bg-cyan-600 text-white font-medium text-sm rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <CameraIcon className="w-4 h-4" />
                    Capture Snapshot
                  </button>
                  <button
                    onClick={handleSaveChart}
                    className="px-6 py-2 bg-green-600 text-white font-medium text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
                    title="Save complete chart with data and styling"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    Save Chart
                  </button>
                </div>
              )}

              {/* Snapshot Gallery */}
              {!showDataTable && (
                <div style={{ maxWidth: chartStyleSettings.canvasWidth + chartStyleSettings.chartPadding * 2 }}>
                  <SnapshotGallery
                    snapshots={snapshots}
                    onSnapshotClick={handleSnapshotClick}
                    onDeleteSnapshot={handleDeleteSnapshot}
                    onSaveChart={handleSaveChartFromSnapshot}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">
                No Data Loaded
              </h2>
              <p className="text-gray-500">
                Upload a CSV file or select a sample dataset to get started
              </p>
            </div>
          )}
        </div>

        {/* Right Control Panel - Only this scrolls */}
        {showPanel && (
          <div className="w-64 bg-white border-l border-gray-200 flex flex-col flex-shrink-0 shadow-lg overflow-hidden">
            {/* Tab Navigation - Fixed at top */}
            <div className="flex items-center border-b border-gray-200 flex-shrink-0">
              <button
                onClick={() => setActiveTab('style')}
                className={`flex-1 px-4 py-2 font-medium text-sm transition-colors ${
                  activeTab === 'style'
                    ? 'text-cyan-600 border-b-2 border-cyan-600 bg-cyan-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Style
              </button>
              <button
                onClick={() => setActiveTab('data')}
                className={`flex-1 px-4 py-2 font-medium text-sm transition-colors ${
                  activeTab === 'data'
                    ? 'text-cyan-600 border-b-2 border-cyan-600 bg-cyan-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Data
              </button>
              <button
                onClick={() => setShowPanel(false)}
                className="px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                title="Hide Controls"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Style Tab Content */}
              {activeTab === 'style' && (
                <StyleTabContent
                  styleSettings={styleSettings}
                  expandedSections={expandedSections}
                  toggleSection={toggleSection}
                  chartData={chartData}
                  chartType={chartType}
                  clearEmphasisRef={clearEmphasisRef}
                  clearEmphasis={clearEmphasis}
                  onSaveStyle={handleSaveStyle}
                  onImportStyle={handleImportStyle}
                  throttledSetters={throttledSetters}
                  license={license}
                />
              )}

              {/* Data Tab Content */}
              {activeTab === 'data' && (
                <DataTabContent
                  chartData={chartData}
                  chartType={chartType}
                  onEditData={() => setShowDataTable(true)}
                  styleSettings={styleSettings}
                  addon={addon}
                  setCurrentSampleDatasetKey={setCurrentSampleDatasetKey}
                  applyStylePreset={applyStylePreset}
                  showPasteCSV={showPasteCSV}
                  setShowPasteCSV={setShowPasteCSV}
                  pastedCSV={pastedCSV}
                  setPastedCSV={setPastedCSV}
                  handlePasteCSV={handlePasteCSV}
                  showGoogleSheets={showGoogleSheets}
                  setShowGoogleSheets={setShowGoogleSheets}
                  googleSheetsUrl={googleSheetsUrl}
                  setGoogleSheetsUrl={setGoogleSheetsUrl}
                  googleSheetsLoading={googleSheetsLoading}
                  setGoogleSheetsLoading={setGoogleSheetsLoading}
                  googleSheetsError={googleSheetsError}
                  setGoogleSheetsError={setGoogleSheetsError}
                  autoRefreshEnabled={autoRefreshEnabled}
                  setAutoRefreshEnabled={setAutoRefreshEnabled}
                  autoRefreshInterval={autoRefreshInterval}
                  setAutoRefreshInterval={setAutoRefreshInterval}
                />
              )}
            </div>
          </div>
        )}
      </div>
      )}

      {/* Save Style Modal */}
      {showSaveStyleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Save Style</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Style Name
              </label>
              <input
                type="text"
                value={styleName}
                onChange={(e) => setStyleName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter style name"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowSaveStyleModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSaveStyle}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input for Style Import */}
      <input
        ref={styleFileInputRef}
        type="file"
        accept=".json"
        onChange={handleStyleFileSelect}
        className="hidden"
      />

      {/* Snapshot Modal */}
      {showSnapshotModal && selectedSnapshot && (
        <SnapshotModal
          snapshot={selectedSnapshot}
          onClose={() => {
            setShowSnapshotModal(false);
            setSelectedSnapshot(null);
          }}
          onLoadChart={handleLoadChart}
          onNext={handleNextSnapshot}
          onPrevious={handlePreviousSnapshot}
          hasNext={snapshots.findIndex(s => s.id === selectedSnapshot.id) < snapshots.length - 1}
          hasPrevious={snapshots.findIndex(s => s.id === selectedSnapshot.id) > 0}
        />
      )}

      {/* Transparent Overlay During Resize - Captures all mouse events */}
      {isResizingWindow && (
        <div
          className="fixed inset-0 z-[60]"
          style={{
            cursor: 'nwse-resize',
            userSelect: 'none',
          }}
          onMouseMove={handleWindowResizeMove}
          onMouseUp={handleWindowResizeEnd}
        />
      )}

      {/* Resize Handle - Bottom Right Corner (Figma only, not in dock mode) */}
      {figma.isFigmaMode && !isDockMode && (
        <div
          onMouseDown={handleWindowResizeStart}
          className="fixed bottom-1 right-1 cursor-nwse-resize z-50"
          style={{
            cursor: isResizingWindow ? 'nwse-resize' : 'nwse-resize',
          }}
        >
          {/* Blue dot resize handle - matches chart style */}
          <div className="relative">
            <div
              className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-md hover:bg-blue-600 hover:scale-110 transition-all"
              style={{
                boxShadow: '0 0 0 1px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.2)',
              }}
            />
          </div>
        </div>
      )}

      {/* License Activation Modal */}
      {showActivateLicenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Activate License</h2>
              <p className="text-sm text-gray-600 mt-1">Enter your license key to unlock Pro features</p>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              {license.error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {license.error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Key
                  </label>
                  <input
                    type="text"
                    value={licenseKeyInput}
                    onChange={(e) => setLicenseKeyInput(e.target.value)}
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleActivateLicense();
                      }
                    }}
                  />
                </div>

                <div className="text-xs text-gray-500">
                  <p>Your license key was sent to your email after purchase.</p>
                  <p className="mt-1">
                    Don't have a license?{' '}
                    <button
                      onClick={handleStartTrial}
                      className="text-cyan-600 hover:text-cyan-700 font-medium"
                    >
                      Start 7-day free trial
                    </button>
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowActivateLicenseModal(false);
                  setLicenseKeyInput('');
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={license.isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleActivateLicense}
                disabled={license.isLoading || !licenseKeyInput.trim()}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {license.isLoading ? 'Activating...' : 'Activate License'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Style Tab Component
 */
function StyleTabContent({ styleSettings, expandedSections, toggleSection, chartData, chartType, clearEmphasisRef, clearEmphasis, onSaveStyle, onImportStyle, throttledSetters, license }) {
  const isSlopeChart = chartType === 'slope';
  const isBarChart = chartType?.startsWith('bar-');
  const isLineChart = chartType === 'line' || chartType === 'area' || chartType === 'area-stacked';

  return (
    <div className="space-y-3">
      {/* 1. THEME - Only for Funnel Chart (Slope, Bar Chart, and Line Chart have their own) */}
      {!isSlopeChart && !isBarChart && !isLineChart && (
        <CollapsibleSection
          title="Theme"
          isExpanded={expandedSections.theme}
          onToggle={() => toggleSection('theme')}
        >
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chart Background
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    styleSettings.setDarkMode(false);
                    styleSettings.setBackgroundColor('#ffffff');
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    !styleSettings.darkMode
                      ? 'bg-white text-gray-900 border-2 border-gray-400 shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  Light Mode
                </button>
                <button
                  onClick={() => {
                    styleSettings.setDarkMode(true);
                    styleSettings.setBackgroundColor('#1f2937');
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    styleSettings.darkMode
                      ? 'bg-gray-800 text-white border-2 border-gray-600 shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  Dark Mode
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Toggle between light and dark background themes
              </p>
            </div>

            {/* Background Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Color
              </label>
              <input
                type="color"
                value={styleSettings.backgroundColor}
                onChange={(e) => styleSettings.setBackgroundColor(e.target.value)}
                className="w-full h-10 rounded border border-gray-300 cursor-pointer"
              />
            </div>

            {/* Background Opacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Opacity: {styleSettings.backgroundOpacity}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={styleSettings.backgroundOpacity}
                onChange={(e) => throttledSetters.setBackgroundOpacity(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Adjusts the transparency of the chart background
              </p>
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* Slope Chart Specific Sections (relocated) */}
      {isSlopeChart && (
        <>
          {/* Theme Section for Slope Chart */}
          <CollapsibleSection
            title="Theme"
            isExpanded={expandedSections.theme}
            onToggle={() => toggleSection('theme')}
          >
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chart Background
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                    styleSettings.setDarkMode(false);
                    styleSettings.setBackgroundColor('#ffffff');
                  }}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      !styleSettings.darkMode
                        ? 'bg-white text-gray-900 border-2 border-gray-400 shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                    }`}
                  >
                    Light Mode
                  </button>
                  <button
                    onClick={() => {
                    styleSettings.setDarkMode(true);
                    styleSettings.setBackgroundColor('#1f2937');
                  }}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      styleSettings.darkMode
                        ? 'bg-gray-800 text-white border-2 border-gray-600 shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                    }`}
                  >
                    Dark Mode
                  </button>
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={styleSettings.backgroundColor}
                    onChange={(e) => styleSettings.setBackgroundColor(e.target.value)}
                    className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={styleSettings.backgroundColor}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                        styleSettings.setBackgroundColor(value);
                      }
                    }}
                    placeholder="#ffffff"
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                  />
                </div>
              </div>

              {/* Background Opacity */}
              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                  Background Opacity: {styleSettings.backgroundOpacity}%
                  <InfoTooltip text="Adjusts the transparency of the chart background" />
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={styleSettings.backgroundOpacity}
                  onChange={(e) => throttledSetters.setBackgroundOpacity(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* Canvas & Layout Section for Slope Chart */}
          <CollapsibleSection
            title="Canvas & Layout"
            isExpanded={expandedSections.layoutCanvas}
            onToggle={() => toggleSection('layoutCanvas')}
          >
            <div className="space-y-2">
              {/* Aspect Ratio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aspect Ratio
                </label>
                <select
                  value={styleSettings.aspectRatio}
                  onChange={(e) => styleSettings.updateAspectRatio(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="16:9">16:9 (Widescreen)</option>
                  <option value="4:3">4:3 (Standard)</option>
                  <option value="1:1">1:1 (Square)</option>
                  <option value="3:4">3:4 (Portrait)</option>
                  <option value="9:16">9:16 (Mobile)</option>
                </select>
              </div>

              {/* Canvas Width */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Canvas Width: {styleSettings.canvasWidth}px
                </label>
                <input
                  type="range"
                  min="600"
                  max="2000"
                  value={styleSettings.canvasWidth}
                  onChange={(e) => throttledSetters.setCanvasWidth(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Canvas Height */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Canvas Height: {styleSettings.canvasHeight}px
                </label>
                <input
                  type="range"
                  min="400"
                  max="2000"
                  value={styleSettings.canvasHeight}
                  onChange={(e) => throttledSetters.setCanvasHeight(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Chart Width */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chart Width: {styleSettings.chartWidth}px
                </label>
                <input
                  type="range"
                  min="200"
                  max="1500"
                  value={styleSettings.chartWidth}
                  onChange={(e) => throttledSetters.setChartWidth(Number(e.target.value))}
                  onInput={(e) => styleSettings.setChartWidth(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Chart Height */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chart Height: {styleSettings.chartHeight}px
                </label>
                <input
                  type="range"
                  min="400"
                  max="2000"
                  value={styleSettings.chartHeight}
                  onChange={(e) => throttledSetters.setChartHeight(Number(e.target.value))}
                  onInput={(e) => styleSettings.setChartHeight(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* Colors & Styling Section for Slope Chart */}
          <CollapsibleSection
            title="Colors & Styling"
            isExpanded={expandedSections.colorMode}
            onToggle={() => toggleSection('colorMode')}
          >
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Strategy
                </label>
                <select
                  value={styleSettings.colorMode}
                  onChange={(e) => styleSettings.setColorMode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="category">Category (Different color per line)</option>
                  <option value="trend">Trend (Color by direction)</option>
                  <option value="custom">Custom (Manual colors)</option>
                  <option value="gradient">Gradient (Fade effect)</option>
                </select>
              </div>

              {/* Trend Colors */}
              {styleSettings.colorMode === 'trend' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Increase Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={styleSettings.increaseColor}
                        onChange={(e) => styleSettings.setIncreaseColor(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300"
                      />
                      <input
                        type="text"
                        value={styleSettings.increaseColor}
                        onChange={(e) => styleSettings.setIncreaseColor(e.target.value)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Decrease Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={styleSettings.decreaseColor}
                        onChange={(e) => styleSettings.setDecreaseColor(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300"
                      />
                      <input
                        type="text"
                        value={styleSettings.decreaseColor}
                        onChange={(e) => styleSettings.setDecreaseColor(e.target.value)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      No Change Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={styleSettings.noChangeColor}
                        onChange={(e) => styleSettings.setNoChangeColor(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300"
                      />
                      <input
                        type="text"
                        value={styleSettings.noChangeColor}
                        onChange={(e) => styleSettings.setNoChangeColor(e.target.value)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Gradient Colors */}
              {styleSettings.colorMode === 'gradient' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Color (Left)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={styleSettings.startColor}
                        onChange={(e) => styleSettings.setStartColor(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300"
                      />
                      <input
                        type="text"
                        value={styleSettings.startColor}
                        onChange={(e) => styleSettings.setStartColor(e.target.value)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Color (Right)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={styleSettings.endColor}
                        onChange={(e) => styleSettings.setEndColor(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300"
                      />
                      <input
                        type="text"
                        value={styleSettings.endColor}
                        onChange={(e) => styleSettings.setEndColor(e.target.value)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Category Palette */}
              {styleSettings.colorMode === 'category' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Palette
                  </label>
                  <select
                    value={styleSettings.comparisonPalette}
                    onChange={(e) => styleSettings.setComparisonPalette(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {Object.entries(comparisonPalettes).map(([key, palette]) => (
                      <option key={key} value={key}>
                        {palette.name}
                      </option>
                    ))}
                  </select>
                  {styleSettings.comparisonPalette !== 'user' && (
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-2">
                        {comparisonPalettes[styleSettings.comparisonPalette].colors.slice(0, 8).map((color, index) => (
                          <div
                            key={index}
                            className="w-10 h-10 rounded border-2 border-gray-300"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Custom Colors */}
              {(styleSettings.colorMode === 'custom' || (styleSettings.colorMode === 'category' && styleSettings.comparisonPalette === 'user')) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Colors (up to 8)
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {styleSettings.userCustomColors.map((color, index) => (
                      <div key={index} className="flex flex-col gap-1">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => {
                            const newColors = [...styleSettings.userCustomColors];
                            newColors[index] = e.target.value;
                            styleSettings.setUserCustomColors(newColors);
                          }}
                          className="w-full h-12 rounded-lg cursor-pointer border-2 border-gray-300"
                        />
                        <input
                          type="text"
                          value={color}
                          onChange={(e) => {
                            const newColors = [...styleSettings.userCustomColors];
                            newColors[index] = e.target.value;
                            styleSettings.setUserCustomColors(newColors);
                          }}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Typography Section for Slope Chart */}
          <CollapsibleSection
            title="Typography"
            isExpanded={expandedSections.typography}
            onToggle={() => toggleSection('typography')}
          >
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={styleSettings.title}
                  onChange={(e) => styleSettings.setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={styleSettings.subtitle}
                  onChange={(e) => styleSettings.setSubtitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title Alignment
                </label>
                <select
                  value={styleSettings.titleAlignment}
                  onChange={(e) => styleSettings.setTitleAlignment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Family
                </label>
                <select
                  value={styleSettings.fontFamily}
                  onChange={(e) => styleSettings.setFontFamily(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <optgroup label="Sans-Serif">
                    <option value="Inter">Inter</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                  </optgroup>
                  <optgroup label="Condensed">
                    <option value="Roboto Condensed">Roboto Condensed</option>
                    <option value="Open Sans Condensed">Open Sans Condensed</option>
                    <option value="Economica">Economica</option>
                  </optgroup>
                  <optgroup label="Serif">
                    <option value="Merriweather">Merriweather</option>
                    <option value="Playfair Display">Playfair Display</option>
                    <option value="Lora">Lora</option>
                    <option value="PT Serif">PT Serif</option>
                    <option value="Newsreader">Newsreader</option>
                    <option value="Georgia">Georgia</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title Font Size: {styleSettings.titleFontSize}px
                </label>
                <input
                  type="range"
                  min="16"
                  max="48"
                  value={styleSettings.titleFontSize}
                  onChange={(e) => styleSettings.setTitleFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle Font Size: {styleSettings.subtitleFontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="32"
                  value={styleSettings.subtitleFontSize}
                  onChange={(e) => styleSettings.setSubtitleFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Segment Label Font Size: {styleSettings.segmentLabelFontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="32"
                  value={styleSettings.segmentLabelFontSize}
                  onChange={(e) => styleSettings.setSegmentLabelFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metric Label Font Size: {styleSettings.metricLabelFontSize}px
                </label>
                <input
                  type="range"
                  min="10"
                  max="24"
                  value={styleSettings.metricLabelFontSize}
                  onChange={(e) => styleSettings.setMetricLabelFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Period Font Label: {styleSettings.periodLabelFontSize}px
                </label>
                <input
                  type="range"
                  min="14"
                  max="32"
                  value={styleSettings.periodLabelFontSize}
                  onChange={(e) => styleSettings.setPeriodLabelFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Period Label Position
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => styleSettings.setPeriodLabelPosition('above')}
                    className={`flex-1 px-4 py-2 rounded-lg ${
                      styleSettings.periodLabelPosition === 'above'
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Above
                  </button>
                  <button
                    onClick={() => styleSettings.setPeriodLabelPosition('below')}
                    className={`flex-1 px-4 py-2 rounded-lg ${
                      styleSettings.periodLabelPosition === 'below'
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Below
                  </button>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Labels Section for Slope Chart */}
          <CollapsibleSection
            title="Labels"
            isExpanded={expandedSections.labels}
            onToggle={() => toggleSection('labels')}
          >
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Label Position
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => styleSettings.setLabelPosition('left')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      styleSettings.labelPosition === 'left'
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Left
                  </button>
                  <button
                    onClick={() => styleSettings.setLabelPosition('right')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      styleSettings.labelPosition === 'right'
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Right
                  </button>
                  <button
                    onClick={() => styleSettings.setLabelPosition('both')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      styleSettings.labelPosition === 'both'
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Both
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={styleSettings.showCategoryLabels}
                  onChange={(e) => styleSettings.setShowCategoryLabels(e.target.checked)}
                  className="w-4 h-4 text-cyan-600 rounded"
                />
                <span className="text-sm text-gray-700">Show Category Labels</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={styleSettings.showValueLabels}
                  onChange={(e) => styleSettings.setShowValueLabels(e.target.checked)}
                  className="w-4 h-4 text-cyan-600 rounded"
                />
                <span className="text-sm text-gray-700">Show Value Labels</span>
              </label>

              {styleSettings.showValueLabels && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Label Format
                    </label>
                    <select
                      value={styleSettings.labelFormat}
                      onChange={(e) => styleSettings.setLabelFormat(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="value">Values Only</option>
                      <option value="percentage">Percentage Change Only</option>
                      <option value="both">Values & Percentage</option>
                    </select>
                  </div>

                  {/* Compact Numbers for Slope Chart */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <label className="flex-1 text-sm font-medium text-gray-700">
                        Compact label values (1.5K vs 1500)
                      </label>
                      <button
                        onClick={() => styleSettings.setCompactNumbers(!styleSettings.compactNumbers)}
                        className={`px-4 py-1 rounded text-sm font-medium ${
                          styleSettings.compactNumbers
                            ? 'bg-cyan-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {styleSettings.compactNumbers ? 'On' : 'Off'}
                      </button>
                    </div>
                  </div>

                  {/* Number Styling (Values) */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number Styling (Values)
                      </label>
                    </div>

                    {/* Value Format */}
                    <div>
                      <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1">
                        Value Format
                        <InfoTooltip text="Percentage multiplies values by 100 and adds % symbol" />
                      </label>
                      <select
                        value={styleSettings.valueFormat}
                        onChange={(e) => styleSettings.setValueFormat(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                      >
                        <option value="number">Number</option>
                        <option value="percentage">Percentage</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {/* Prefix */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Prefix
                        </label>
                        <input
                          type="text"
                          value={styleSettings.valuePrefix}
                          onChange={(e) => styleSettings.setValuePrefix(e.target.value)}
                          placeholder="$"
                          maxLength={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                        />
                      </div>

                      {/* Suffix */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Suffix
                        </label>
                        <input
                          type="text"
                          value={styleSettings.valueSuffix}
                          onChange={(e) => styleSettings.setValueSuffix(e.target.value)}
                          placeholder="%"
                          maxLength={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                        />
                      </div>

                      {/* Decimal Places */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Decimal places
                        </label>
                        <input
                          type="number"
                          value={styleSettings.valueDecimalPlaces}
                          onChange={(e) => styleSettings.setValueDecimalPlaces(Math.max(0, Math.min(5, parseInt(e.target.value) || 0)))}
                          min="0"
                          max="5"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CollapsibleSection>

          {/* Line Styling Section for Slope Chart */}
          <CollapsibleSection
            title="Line Styling"
            isExpanded={expandedSections.lineStyling}
            onToggle={() => toggleSection('lineStyling')}
          >
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Line Thickness: {styleSettings.lineThickness}px
                </label>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={styleSettings.lineThickness}
                  onChange={(e) => throttledSetters.setLineThickness(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                  Line Saturation: {styleSettings.lineSaturation}%
                  <InfoTooltip text="100% = Full vibrant colors, 0% = Grey" />
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={styleSettings.lineSaturation}
                  onChange={(e) => throttledSetters.setLineSaturation(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endpoint Size: {styleSettings.endpointSize}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="12"
                  value={styleSettings.endpointSize}
                  onChange={(e) => throttledSetters.setEndpointSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endpoint Style
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => styleSettings.setEndpointStyle('filled')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      styleSettings.endpointStyle === 'filled'
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Filled
                  </button>
                  <button
                    onClick={() => styleSettings.setEndpointStyle('outlined')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      styleSettings.endpointStyle === 'outlined'
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Outlined
                  </button>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                  Period Spacing: {styleSettings.periodSpacing}px
                  <InfoTooltip text="Distance between the two vertical axis lines" />
                </label>
                <input
                  type="range"
                  min="100"
                  max="600"
                  value={styleSettings.periodSpacing}
                  onChange={(e) => throttledSetters.setPeriodSpacing(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Axis Line Style
                </label>
                <select
                  value={styleSettings.slopeAxisLineStyle}
                  onChange={(e) => styleSettings.setSlopeAxisLineStyle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="none">No Line</option>
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Axis Line Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={styleSettings.slopeAxisLineColor}
                    onChange={(e) => styleSettings.setSlopeAxisLineColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300"
                  />
                  <input
                    type="text"
                    value={styleSettings.slopeAxisLineColor}
                    onChange={(e) => styleSettings.setSlopeAxisLineColor(e.target.value)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Axis Ends
                </label>
                <select
                  value={styleSettings.axisEnds}
                  onChange={(e) => styleSettings.setAxisEnds(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="none">No Style</option>
                  <option value="t-end">T-end</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Axis Line Thickness: {styleSettings.slopeAxisLineWidth}px
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={styleSettings.slopeAxisLineWidth}
                  onChange={(e) => styleSettings.setSlopeAxisLineWidth(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* Emphasis Section for Slope Chart */}
          <CollapsibleSection
            title="Emphasis"
            isExpanded={expandedSections.lineEmphasis}
            onToggle={() => toggleSection('lineEmphasis')}
          >
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Click on lines in the chart to emphasize them (max 2)
              </p>
              {styleSettings.emphasizedLines.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Emphasized Lines: {styleSettings.emphasizedLines.join(', ')}
                  </p>
                  <button
                    onClick={() => styleSettings.setEmphasizedLines([])}
                    className="text-sm text-cyan-600 hover:text-cyan-700 underline"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Watermark Section for Slope Chart - Hidden for Pro users */}
          {!license.hasAccess && (
            <CollapsibleSection
              title="Watermark"
              isExpanded={expandedSections.watermark}
              onToggle={() => toggleSection('watermark')}
            >
              <div className="space-y-2">
                <div className="px-3 py-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-amber-600">💎</span>
                    <div>
                      <p className="text-sm font-medium text-amber-900">Upgrade to Pro</p>
                      <p className="text-xs text-amber-700 mt-1">
                        Remove watermarks and unlock unlimited exports with a Pro license
                      </p>
                      <button
                        onClick={() => {
                          setShowHamburgerMenu(true);
                        }}
                        className="mt-2 text-xs text-amber-600 hover:text-amber-700 font-medium underline"
                      >
                        View pricing →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          )}
        </>
      )}

      {/* Bar Chart Specific Sections */}
      {isBarChart && (
        <>
          {/* 1. THEME */}
          <CollapsibleSection
            title="Theme"
            isExpanded={expandedSections.theme}
            onToggle={() => toggleSection('theme')}
          >
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chart Background
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                    styleSettings.setDarkMode(false);
                    styleSettings.setBackgroundColor('#ffffff');
                  }}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      !styleSettings.darkMode
                        ? 'bg-white text-gray-900 border-2 border-gray-400 shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                    }`}
                  >
                    Light Mode
                  </button>
                  <button
                    onClick={() => {
                    styleSettings.setDarkMode(true);
                    styleSettings.setBackgroundColor('#1f2937');
                  }}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      styleSettings.darkMode
                        ? 'bg-gray-800 text-white border-2 border-gray-600 shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                    }`}
                  >
                    Dark Mode
                  </button>
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={styleSettings.backgroundColor}
                    onChange={(e) => styleSettings.setBackgroundColor(e.target.value)}
                    className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={styleSettings.backgroundColor}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                        styleSettings.setBackgroundColor(value);
                      }
                    }}
                    placeholder="#ffffff"
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                  />
                </div>
              </div>

              {/* Background Opacity */}
              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                  Background Opacity: {styleSettings.backgroundOpacity}%
                  <InfoTooltip text="Adjusts the transparency of the chart background" />
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={styleSettings.backgroundOpacity}
                  onChange={(e) => throttledSetters.setBackgroundOpacity(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* 2. CANVAS & LAYOUT */}
          <CollapsibleSection
            title="Canvas & Layout"
            isExpanded={expandedSections.layoutCanvas}
            onToggle={() => toggleSection('layoutCanvas')}
          >
            <div className="space-y-2">
              {/* Aspect Ratio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aspect Ratio
                </label>
                <select
                  value={styleSettings.aspectRatio}
                  onChange={(e) => styleSettings.updateAspectRatio(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="16:9">16:9 (Widescreen)</option>
                  <option value="4:3">4:3 (Standard)</option>
                  <option value="1:1">1:1 (Square)</option>
                  <option value="3:4">3:4 (Portrait)</option>
                  <option value="9:16">9:16 (Mobile)</option>
                </select>
              </div>

              {/* Canvas Width */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Canvas Width: {styleSettings.canvasWidth}px
                </label>
                <input
                  type="range"
                  min="600"
                  max="2000"
                  value={styleSettings.canvasWidth}
                  onChange={(e) => throttledSetters.setCanvasWidth(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Canvas Height */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Canvas Height: {styleSettings.canvasHeight}px
                </label>
                <input
                  type="range"
                  min="400"
                  max="2000"
                  value={styleSettings.canvasHeight}
                  onChange={(e) => throttledSetters.setCanvasHeight(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Chart Width */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chart Width: {styleSettings.chartWidth}px
                </label>
                <input
                  type="range"
                  min="200"
                  max="1500"
                  value={styleSettings.chartWidth}
                  onChange={(e) => throttledSetters.setChartWidth(Number(e.target.value))}
                  onInput={(e) => styleSettings.setChartWidth(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Chart Height */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chart Height: {styleSettings.chartHeight}px
                </label>
                <input
                  type="range"
                  min="200"
                  max="1000"
                  value={styleSettings.chartHeight}
                  onChange={(e) => throttledSetters.setChartHeight(Number(e.target.value))}
                  onInput={(e) => styleSettings.setChartHeight(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Category Spacing */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Spacing: {styleSettings.stageGap}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={styleSettings.stageGap}
                  onChange={(e) => styleSettings.setStageGap(Number(e.target.value))}
                  onInput={(e) => styleSettings.setStageGap(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Bar Width (only for Bar Chart in grouped mode) */}
              {isBarChart && styleSettings.barMode === 'grouped' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bar Width: {styleSettings.barWidth}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="150"
                    value={styleSettings.barWidth}
                    onChange={(e) => styleSettings.setBarWidth(Number(e.target.value))}
                    onInput={(e) => styleSettings.setBarWidth(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* 3. COLORS & STYLING */}
          <CollapsibleSection
            title="Colors & Styling"
            isExpanded={expandedSections.colorsStyling}
            onToggle={() => toggleSection('colorsStyling')}
          >
            <div className="space-y-2">
              {/* Color Strategy Selection */}
              {/* For bar charts, show palette options when there are multiple periods */}
              {((chartType?.startsWith('bar-') && chartData.periodNames && chartData.periodNames.length > 1) || chartData.isComparisonMode) ? (
                <>
                  {/* Comparison Mode - Color Strategy */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color Strategy
                    </label>
                    <select
                      value={styleSettings.colorMode}
                      onChange={(e) => {
                        styleSettings.setColorMode(e.target.value);
                        // When switching to custom mode, set palette to 'user' to use custom colors
                        if (e.target.value === 'custom') {
                          styleSettings.setComparisonPalette('user');
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="category">Category (Different color per series)</option>
                      <option value="custom">Custom (Manual colors)</option>
                    </select>
                  </div>

                  {/* Category Palette */}
                  {styleSettings.colorMode === 'category' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Palette
                      </label>
                      <select
                        value={styleSettings.comparisonPalette}
                        onChange={(e) => styleSettings.setComparisonPalette(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        {Object.entries(comparisonPalettes).map(([key, palette]) => (
                          <option key={key} value={key}>
                            {palette.name}
                          </option>
                        ))}
                      </select>
                      {styleSettings.comparisonPalette !== 'user' && (
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-2">
                            {comparisonPalettes[styleSettings.comparisonPalette].colors.slice(0, 8).map((color, index) => (
                              <div
                                key={index}
                                className="w-10 h-10 rounded border-2 border-gray-300"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Custom Colors */}
                  {(styleSettings.colorMode === 'custom' || (styleSettings.colorMode === 'category' && styleSettings.comparisonPalette === 'user')) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Colors (up to 8)
                      </label>
                      <div className="grid grid-cols-4 gap-3">
                        {styleSettings.userCustomColors.map((color, index) => (
                          <div key={index} className="flex flex-col gap-1">
                            <input
                              type="color"
                              value={color}
                              onChange={(e) => {
                                const newColors = [...styleSettings.userCustomColors];
                                newColors[index] = e.target.value;
                                styleSettings.setUserCustomColors(newColors);
                              }}
                              className="w-full h-12 rounded-lg cursor-pointer border-2 border-gray-300"
                            />
                            <input
                              type="text"
                              value={color}
                              onChange={(e) => {
                                const newColors = [...styleSettings.userCustomColors];
                                newColors[index] = e.target.value;
                                styleSettings.setUserCustomColors(newColors);
                              }}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Single Color Mode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bar Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={styleSettings.barColor}
                        onChange={(e) => styleSettings.setBarColor(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300"
                      />
                      <input
                        type="text"
                        value={styleSettings.barColor}
                        onChange={(e) => styleSettings.setBarColor(e.target.value)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
                      />
                    </div>
                  </div>

                  {/* Palette Selection for Single Color Mode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Palette
                    </label>
                    <select
                      value={styleSettings.comparisonPalette}
                      onChange={(e) => {
                        styleSettings.setComparisonPalette(e.target.value);
                        // Set bar color to first color in selected palette
                        const palette = comparisonPalettes[e.target.value];
                        if (palette && palette.colors && palette.colors.length > 0) {
                          styleSettings.setBarColor(palette.colors[0]);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      {Object.entries(comparisonPalettes)
                        .filter(([key]) => key !== 'user')
                        .map(([key, palette]) => (
                          <option key={key} value={key}>
                            {palette.name}
                          </option>
                        ))}
                    </select>
                    {styleSettings.comparisonPalette !== 'user' && (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-2">
                          {comparisonPalettes[styleSettings.comparisonPalette].colors.slice(0, 8).map((color, index) => (
                            <div
                              key={index}
                              className="w-10 h-10 rounded border-2 border-gray-300"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color Presets
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {colorPresets.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => styleSettings.setBarColor(preset.color)}
                          className="group relative"
                          title={preset.name}
                        >
                          <div
                            className="w-full h-10 rounded border-2 border-gray-300 hover:border-cyan-500 transition-colors"
                            style={{ backgroundColor: preset.color }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs font-medium text-white bg-black bg-opacity-75 px-2 py-1 rounded">
                              {preset.name}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </CollapsibleSection>
          {/* 4. TYPOGRAPHY */}
          <CollapsibleSection
            title="Typography"
            isExpanded={expandedSections.typography}
            onToggle={() => toggleSection('typography')}
          >
            <div className="space-y-2">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={styleSettings.title}
                  onChange={(e) => styleSettings.setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={styleSettings.subtitle}
                  onChange={(e) => styleSettings.setSubtitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Title Alignment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title Alignment
                </label>
                <select
                  value={styleSettings.titleAlignment}
                  onChange={(e) => styleSettings.setTitleAlignment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                </select>
              </div>

              {/* Font Family */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Family
                </label>
                <select
                  value={styleSettings.fontFamily}
                  onChange={(e) => styleSettings.setFontFamily(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <optgroup label="Sans-Serif">
                    <option value="Inter">Inter</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                  </optgroup>
                  <optgroup label="Condensed">
                    <option value="Roboto Condensed">Roboto Condensed</option>
                    <option value="Open Sans Condensed">Open Sans Condensed</option>
                    <option value="Economica">Economica</option>
                  </optgroup>
                  <optgroup label="Serif">
                    <option value="Merriweather">Merriweather</option>
                    <option value="Playfair Display">Playfair Display</option>
                    <option value="Lora">Lora</option>
                    <option value="PT Serif">PT Serif</option>
                    <option value="Newsreader">Newsreader</option>
                    <option value="Georgia">Georgia</option>
                  </optgroup>
                </select>
              </div>

              {/* Title Font Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title Font Size: {styleSettings.titleFontSize}px
                </label>
                <input
                  type="range"
                  min="16"
                  max="48"
                  value={styleSettings.titleFontSize}
                  onChange={(e) => styleSettings.setTitleFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Subtitle Font Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle Font Size: {styleSettings.subtitleFontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="32"
                  value={styleSettings.subtitleFontSize}
                  onChange={(e) => styleSettings.setSubtitleFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* X-Axis Font Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  X-Axis Font Size: {styleSettings.xAxisFontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="32"
                  value={styleSettings.xAxisFontSize}
                  onChange={(e) => styleSettings.setXAxisFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Y-Axis Font Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Y-Axis Font Size: {styleSettings.yAxisFontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="32"
                  value={styleSettings.yAxisFontSize}
                  onChange={(e) => styleSettings.setYAxisFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Metric Label Font Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metric Label Font Size: {styleSettings.metricLabelFontSize}px
                </label>
                <input
                  type="range"
                  min="10"
                  max="24"
                  value={styleSettings.metricLabelFontSize}
                  onChange={(e) => styleSettings.setMetricLabelFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Period Label Font Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Period Label Font Size: {styleSettings.periodLabelFontSize}px
                </label>
                <input
                  type="range"
                  min="10"
                  max="24"
                  value={styleSettings.periodLabelFontSize}
                  onChange={(e) => styleSettings.setPeriodLabelFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Legend Font Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Legend Font Size: {styleSettings.legendFontSize}px
                </label>
                <input
                  type="range"
                  min="8"
                  max="20"
                  value={styleSettings.legendFontSize}
                  onChange={(e) => styleSettings.setLegendFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </CollapsibleSection>
          {/* 5. LABELS */}
          <CollapsibleSection
            title="Labels"
            isExpanded={expandedSections.dataLabels}
            onToggle={() => toggleSection('dataLabels')}
          >
            <div className="space-y-2">
              {/* Metric Labels Toggle */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={styleSettings.showMetricLabels}
                    onChange={(e) => styleSettings.setShowMetricLabels(e.target.checked)}
                    className="w-4 h-4 text-cyan-600 rounded"
                  />
                  <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
                    Metric Labels
                    <InfoTooltip text="Toggle to show or hide metric values (e.g., &quot;1250&quot;)" />
                  </span>
                </label>
              </div>

              {/* Metric Label Position - appears when Metric Labels is ON */}
              {styleSettings.showMetricLabels && (
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                    Metric Label Position
                    <InfoTooltip text="Position metric labels at the end of bars (inside or outside)" />
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => styleSettings.setMetricLabelPosition('inside')}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        styleSettings.metricLabelPosition === 'inside'
                          ? 'bg-cyan-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Inside
                    </button>
                    <button
                      onClick={() => styleSettings.setMetricLabelPosition('outside')}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        styleSettings.metricLabelPosition === 'outside'
                          ? 'bg-cyan-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Outside
                    </button>
                  </div>
                </div>
              )}

              {/* Period Labels Toggle */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={styleSettings.showPeriodLabels}
                    onChange={(e) => styleSettings.setShowPeriodLabels(e.target.checked)}
                    className="w-4 h-4 text-cyan-600 rounded"
                  />
                  <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
                    Period Labels
                    <InfoTooltip text="Toggle to show or hide period names (e.g., &quot;Jan&quot;, &quot;Feb&quot;)" />
                  </span>
                </label>
              </div>

              {(styleSettings.showMetricLabels || styleSettings.showPeriodLabels) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Label Mode
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => styleSettings.setLabelMode('legend')}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                          styleSettings.labelMode === 'legend'
                            ? 'bg-cyan-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Legend
                      </button>
                      <button
                        onClick={() => styleSettings.setLabelMode('direct')}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                          styleSettings.labelMode === 'direct'
                            ? 'bg-cyan-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Direct Labels
                      </button>
                    </div>
                  </div>

              {/* Legend Placement (shown when labelMode is 'legend') */}
              {styleSettings.labelMode === 'legend' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Legend Placement
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => styleSettings.setLegendPosition('above')}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        styleSettings.legendPosition === 'above'
                          ? 'bg-cyan-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Top
                    </button>
                    <button
                      onClick={() => styleSettings.setLegendPosition('below')}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        styleSettings.legendPosition === 'below'
                          ? 'bg-cyan-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Bottom
                    </button>
                  </div>
                </div>
              )}

              {styleSettings.labelMode === 'direct' && styleSettings.barMode === 'grouped' && (
                <>
                  {/* Period Label Display (First Group/All Groups) */}
                  {styleSettings.showPeriodLabels && (
                    <div>
                      <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                        Period Label Display
                        <InfoTooltip text="Show period labels in first group only or all groups" />
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => styleSettings.setPeriodLabelDisplay('first')}
                          className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                            styleSettings.periodLabelDisplay === 'first'
                              ? 'bg-cyan-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          First Group
                        </button>
                        <button
                          onClick={() => styleSettings.setPeriodLabelDisplay('all')}
                          className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                            styleSettings.periodLabelDisplay === 'all'
                              ? 'bg-cyan-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          All Groups
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
                </>
              )}

              {/* Compact Numbers */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <label className="flex-1 text-sm font-medium text-gray-700">
                    Compact label values (1.5K vs 1500)
                  </label>
                  <button
                    onClick={() => styleSettings.setCompactNumbers(!styleSettings.compactNumbers)}
                    className={`px-4 py-1 rounded text-sm font-medium ${
                      styleSettings.compactNumbers
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {styleSettings.compactNumbers ? 'On' : 'Off'}
                  </button>
                </div>
              </div>

              {/* Number Styling (Values) */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number Styling (Values)
                  </label>
                </div>

                {/* Value Format */}
                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1">
                    Value Format
                    <InfoTooltip text="Percentage multiplies values by 100 and adds % symbol" />
                  </label>
                  <select
                    value={styleSettings.valueFormat}
                    onChange={(e) => styleSettings.setValueFormat(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                  >
                    <option value="number">Number</option>
                    <option value="percentage">Percentage</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {/* Prefix */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Prefix
                    </label>
                    <input
                      type="text"
                      value={styleSettings.valuePrefix}
                      onChange={(e) => styleSettings.setValuePrefix(e.target.value)}
                      placeholder="$"
                      maxLength={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                    />
                  </div>

                  {/* Suffix */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Suffix
                    </label>
                    <input
                      type="text"
                      value={styleSettings.valueSuffix}
                      onChange={(e) => styleSettings.setValueSuffix(e.target.value)}
                      placeholder="%"
                      maxLength={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                    />
                  </div>

                  {/* Decimal Places */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Decimal places
                    </label>
                    <input
                      type="number"
                      value={styleSettings.valueDecimalPlaces}
                      onChange={(e) => styleSettings.setValueDecimalPlaces(Math.max(0, Math.min(5, parseInt(e.target.value) || 0)))}
                      min="0"
                      max="5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>
          {/* 6. CHART STRUCTURE */}
          <CollapsibleSection
            title="Chart Structure"
            isExpanded={expandedSections.chartStructure}
            onToggle={() => toggleSection('chartStructure')}
          >
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Orientation
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      styleSettings.setOrientation('vertical');
                      clearEmphasis();
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      styleSettings.orientation === 'vertical'
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Vertical
                  </button>
                  <button
                    onClick={() => {
                      styleSettings.setOrientation('horizontal');
                      clearEmphasis();
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      styleSettings.orientation === 'horizontal'
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Horizontal
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Mode
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      styleSettings.setBarMode('grouped');
                      clearEmphasis();
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                      styleSettings.barMode === 'grouped'
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Grouped
                  </button>
                  <button
                    onClick={() => {
                      styleSettings.setBarMode('stacked');
                      clearEmphasis();
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                      styleSettings.barMode === 'stacked'
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Stacked
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {styleSettings.barMode === 'grouped'
                    ? 'Display bars side by side for each category'
                    : 'Stack bars on top of each other for cumulative values'}
                </p>
              </div>

              {/* Total Labels - Only visible in Stacked mode */}
              {styleSettings.barMode === 'stacked' && (
                <>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="showTotalLabels"
                      checked={styleSettings.showTotalLabels}
                      onChange={(e) => styleSettings.setShowTotalLabels(e.target.checked)}
                      className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                    />
                    <label htmlFor="showTotalLabels" className="text-sm font-medium text-gray-700">
                      Show Total Labels
                    </label>
                  </div>

                  {styleSettings.showTotalLabels && (
                    <div className="flex items-center gap-2 ml-6">
                      <input
                        type="checkbox"
                        id="boldTotal"
                        checked={styleSettings.boldTotal}
                        onChange={(e) => styleSettings.setBoldTotal(e.target.checked)}
                        className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                      />
                      <label htmlFor="boldTotal" className="text-sm font-medium text-gray-700">
                        Bold Total
                      </label>
                    </div>
                  )}
                </>
              )}
            </div>
          </CollapsibleSection>
          {/* 7. AXES & GRIDLINES */}
          <CollapsibleSection
            title="Axes & Gridlines"
            isExpanded={expandedSections.axesGridlines}
            onToggle={() => toggleSection('axesGridlines')}
          >
            <div className="space-y-2">
              {/* Axis Label */}
              <div className="space-y-3">
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                    Axis Label
                    <InfoTooltip text="Optional label at the end of the value axis" />
                  </label>
                </div>

                <input
                  type="text"
                  value={styleSettings.axisLabel}
                  onChange={(e) => styleSettings.setAxisLabel(e.target.value)}
                  placeholder="e.g., Revenue ($)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Number Styling (Axis) */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number Styling (Axis)
                  </label>
                </div>

                {/* Value Format */}
                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1">
                    Value Format
                    <InfoTooltip text="Percentage multiplies values by 100 and adds % symbol" />
                  </label>
                  <select
                    value={styleSettings.axisValueFormat}
                    onChange={(e) => styleSettings.setAxisValueFormat(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                  >
                    <option value="number">Number</option>
                    <option value="percentage">Percentage</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {/* Prefix */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Prefix
                    </label>
                    <input
                      type="text"
                      value={styleSettings.axisValuePrefix}
                      onChange={(e) => styleSettings.setAxisValuePrefix(e.target.value)}
                      placeholder="$"
                      maxLength={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                    />
                  </div>

                  {/* Suffix */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Suffix
                    </label>
                    <input
                      type="text"
                      value={styleSettings.axisValueSuffix}
                      onChange={(e) => styleSettings.setAxisValueSuffix(e.target.value)}
                      placeholder="%"
                      maxLength={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                    />
                  </div>

                  {/* Decimal Places */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Decimal places
                    </label>
                    <input
                      type="number"
                      value={styleSettings.axisValueDecimalPlaces}
                      onChange={(e) => styleSettings.setAxisValueDecimalPlaces(Math.max(0, Math.min(5, parseInt(e.target.value) || 0)))}
                      min="0"
                      max="5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Number Format */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number Format
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex-1 text-sm text-gray-700">
                    Compact axis values (1.5K vs 1500)
                  </label>
                  <button
                    onClick={() => styleSettings.setCompactAxisNumbers(!styleSettings.compactAxisNumbers)}
                    className={`px-4 py-1 rounded text-sm font-medium ${
                      styleSettings.compactAxisNumbers
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {styleSettings.compactAxisNumbers ? 'On' : 'Off'}
                  </button>
                </div>
              </div>

              {/* Bounds */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bounds
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-sm font-medium text-gray-700">
                    Minimum
                  </label>
                  <input
                    type="number"
                    key={`${styleSettings.axisMinimum}-${styleSettings.axisMinimumAuto}`}
                    defaultValue={styleSettings.axisMinimumAuto ? styleSettings.calculatedAxisMinimum : styleSettings.axisMinimum}
                    onBlur={(e) => {
                      styleSettings.setAxisMinimum(Number(e.target.value));
                      if (styleSettings.axisMinimumAuto) {
                        styleSettings.setAxisMinimumAuto(false);
                      }
                    }}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <label className="flex items-center gap-1 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={styleSettings.axisMinimumAuto}
                      onChange={(e) => styleSettings.setAxisMinimumAuto(e.target.checked)}
                      className="rounded"
                    />
                    Auto
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-sm font-medium text-gray-700">
                    Maximum
                  </label>
                  <input
                    type="number"
                    key={`${styleSettings.axisMaximum}-${styleSettings.axisMaximumAuto}`}
                    defaultValue={styleSettings.axisMaximumAuto ? styleSettings.calculatedAxisMaximum : styleSettings.axisMaximum}
                    onBlur={(e) => {
                      styleSettings.setAxisMaximum(Number(e.target.value));
                      if (styleSettings.axisMaximumAuto) {
                        styleSettings.setAxisMaximumAuto(false);
                      }
                    }}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <label className="flex items-center gap-1 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={styleSettings.axisMaximumAuto}
                      onChange={(e) => styleSettings.setAxisMaximumAuto(e.target.checked)}
                      className="rounded"
                    />
                    Auto
                  </label>
                </div>
              </div>

              {/* Units */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Units
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-sm font-medium text-gray-700">
                    Major
                  </label>
                  <input
                    type="number"
                    key={`${styleSettings.axisMajorUnit}-${styleSettings.axisMajorUnitAuto}`}
                    defaultValue={styleSettings.axisMajorUnitAuto ? styleSettings.calculatedAxisMajorUnit : styleSettings.axisMajorUnit}
                    onBlur={(e) => {
                      styleSettings.setAxisMajorUnit(Number(e.target.value));
                      if (styleSettings.axisMajorUnitAuto) {
                        styleSettings.setAxisMajorUnitAuto(false);
                      }
                    }}
                    disabled={styleSettings.axisMajorUnitAuto}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100"
                  />
                  <label className="flex items-center gap-1 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={styleSettings.axisMajorUnitAuto}
                      onChange={(e) => styleSettings.setAxisMajorUnitAuto(e.target.checked)}
                      className="rounded"
                    />
                    Auto
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-sm font-medium text-gray-700">
                    Minor
                  </label>
                  <input
                    type="number"
                    key={`${styleSettings.axisMinorUnit}-${styleSettings.axisMinorUnitAuto}`}
                    defaultValue={styleSettings.axisMinorUnit}
                    onBlur={(e) => styleSettings.setAxisMinorUnit(Number(e.target.value))}
                    disabled={styleSettings.axisMinorUnitAuto}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100"
                  />
                  <label className="flex items-center gap-1 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={styleSettings.axisMinorUnitAuto}
                      onChange={(e) => styleSettings.setAxisMinorUnitAuto(e.target.checked)}
                      className="rounded"
                    />
                    Auto
                  </label>
                </div>
              </div>

              {/* Tick Marks */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tick Marks
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-sm font-medium text-gray-700">
                    Major Type
                  </label>
                  <select
                    value={styleSettings.axisMajorTickType}
                    onChange={(e) => styleSettings.setAxisMajorTickType(e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="none">None</option>
                    <option value="outside">Outside</option>
                    <option value="inside">Inside</option>
                    <option value="cross">Cross</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-sm font-medium text-gray-700">
                    Minor Type
                  </label>
                  <select
                    value={styleSettings.axisMinorTickType}
                    onChange={(e) => styleSettings.setAxisMinorTickType(e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="none">None</option>
                    <option value="outside">Outside</option>
                    <option value="inside">Inside</option>
                    <option value="cross">Cross</option>
                  </select>
                </div>
              </div>

              {/* Gridlines */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gridlines
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-sm font-medium text-gray-700">
                    Horizontal
                  </label>
                  <button
                    onClick={() => styleSettings.setShowHorizontalGridlines(!styleSettings.showHorizontalGridlines)}
                    className={`px-4 py-1 rounded text-sm font-medium ${
                      styleSettings.showHorizontalGridlines
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {styleSettings.showHorizontalGridlines ? 'On' : 'Off'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-sm font-medium text-gray-700">
                    Vertical
                  </label>
                  <button
                    onClick={() => styleSettings.setShowVerticalGridlines(!styleSettings.showVerticalGridlines)}
                    className={`px-4 py-1 rounded text-sm font-medium ${
                      styleSettings.showVerticalGridlines
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {styleSettings.showVerticalGridlines ? 'On' : 'Off'}
                  </button>
                </div>
              </div>

              {/* Axis Lines */}
              <div className="space-y-3">
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                    Axis Lines
                    <InfoTooltip text="Control X and Y axis line thickness (0 = hide axis line)" />
                  </label>
                </div>

                {/* X-Axis Line Thickness */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <label className="flex-1 text-sm text-gray-700">
                      X-Axis Line
                    </label>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {styleSettings.xAxisLineThickness}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.5"
                    value={styleSettings.xAxisLineThickness}
                    onChange={(e) => styleSettings.setXAxisLineThickness(parseFloat(e.target.value))}
                    className="w-full accent-cyan-600"
                  />
                </div>

                {/* Y-Axis Line Thickness */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <label className="flex-1 text-sm text-gray-700">
                      Y-Axis Line
                    </label>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {styleSettings.yAxisLineThickness}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.5"
                    value={styleSettings.yAxisLineThickness}
                    onChange={(e) => styleSettings.setYAxisLineThickness(parseFloat(e.target.value))}
                    className="w-full accent-cyan-600"
                  />
                </div>
              </div>

              {/* Axis Color */}
              <div className="space-y-3">
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                    Axis Color
                    <InfoTooltip text="Control color of all axis elements (0=black, 50=grey, 100=white)" />
                  </label>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <label className="flex-1 text-sm text-gray-700">
                      Brightness
                    </label>
                    <span className="text-sm text-gray-600 w-16 text-right">
                      {styleSettings.axisColorBrightness === 0 ? 'Black' :
                       styleSettings.axisColorBrightness === 100 ? 'White' :
                       `Grey ${styleSettings.axisColorBrightness}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={styleSettings.axisColorBrightness}
                    onChange={(e) => styleSettings.setAxisColorBrightness(parseInt(e.target.value))}
                    className="w-full accent-cyan-600"
                  />
                </div>
              </div>

              {/* Axis Label Visibility */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Axis Label Visibility
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex-1 text-sm text-gray-700">
                    Show X-Axis Labels
                  </label>
                  <button
                    onClick={() => styleSettings.setShowXAxisLabels(!styleSettings.showXAxisLabels)}
                    className={`px-4 py-1 rounded text-sm font-medium ${
                      styleSettings.showXAxisLabels
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {styleSettings.showXAxisLabels ? 'On' : 'Off'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex-1 text-sm text-gray-700">
                    Show Y-Axis Labels
                  </label>
                  <button
                    onClick={() => styleSettings.setShowYAxisLabels(!styleSettings.showYAxisLabels)}
                    className={`px-4 py-1 rounded text-sm font-medium ${
                      styleSettings.showYAxisLabels
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {styleSettings.showYAxisLabels ? 'On' : 'Off'}
                  </button>
                </div>
              </div>

              {/* X-Axis Label Rotation */}
              <div className="space-y-3">
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                    X-Axis Label Rotation
                    <InfoTooltip text="Rotate category labels (0° = horizontal, 90° = vertical)" />
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex-1 text-sm text-gray-700">
                    Rotation Angle
                  </label>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {styleSettings.xAxisLabelRotation}°
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={styleSettings.xAxisLabelRotation}
                  onChange={(e) => styleSettings.setXAxisLabelRotation(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* 8. EMPHASIS */}
          <CollapsibleSection
            title="Emphasis"
            isExpanded={expandedSections.emphasis}
            onToggle={() => toggleSection('emphasis')}
          >
              <div className="space-y-2">
                {/* Percent Change Toggle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Percent Change
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => styleSettings.setPercentChangeEnabled(false)}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        !styleSettings.percentChangeEnabled
                          ? 'bg-cyan-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Off
                    </button>
                    <button
                      onClick={() => styleSettings.setPercentChangeEnabled(true)}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        styleSettings.percentChangeEnabled
                          ? 'bg-cyan-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      On
                    </button>
                  </div>
                </div>

                {/* Label Format (only shown when Percent Change is enabled) */}
                {styleSettings.percentChangeEnabled && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Label Format
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => styleSettings.setPercentChangeLabelFormat('percent')}
                          className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                            styleSettings.percentChangeLabelFormat === 'percent'
                              ? 'bg-cyan-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Percent Only
                        </button>
                        <button
                          onClick={() => styleSettings.setPercentChangeLabelFormat('percent-volume')}
                          className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                            styleSettings.percentChangeLabelFormat === 'percent-volume'
                              ? 'bg-cyan-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Percent / Volume
                        </button>
                      </div>
                    </div>

                    {/* Bracket Distance Slider */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bracket Distance: {styleSettings.percentChangeBracketDistance}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={styleSettings.percentChangeBracketDistance}
                        onChange={(e) => styleSettings.setPercentChangeBracketDistance(Number(e.target.value))}
                        onInput={(e) => styleSettings.setPercentChangeBracketDistance(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    {/* Clear Emphasis Button */}
                    <div>
                      <button
                        onClick={clearEmphasis}
                        className="w-full px-4 py-2 rounded-lg font-medium text-sm transition-all bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                      >
                        Clear Emphasis
                      </button>
                    </div>
                  </>
                )}
              </div>
            </CollapsibleSection>

          {/* 10. WATERMARK - Hidden for Pro users */}
          {!license.hasAccess && (
            <CollapsibleSection
              title="Watermark"
              isExpanded={expandedSections.exportBranding}
              onToggle={() => toggleSection('exportBranding')}
            >
              <div className="space-y-2">
                <div className="px-3 py-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-amber-600">💎</span>
                    <div>
                      <p className="text-sm font-medium text-amber-900">Upgrade to Pro</p>
                      <p className="text-xs text-amber-700 mt-1">
                        Remove watermarks and unlock unlimited exports with a Pro license
                      </p>
                      <button
                        onClick={() => {
                          setShowHamburgerMenu(true);
                        }}
                        className="mt-2 text-xs text-amber-600 hover:text-amber-700 font-medium underline"
                      >
                        View pricing →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          )}
        </>
      )}

      {/* 2. CANVAS & LAYOUT - For Funnel Chart only (Bar, Slope, and Line Charts have their own) */}
      {!isBarChart && !isSlopeChart && !isLineChart && (
        <CollapsibleSection
          title="Canvas & Layout"
          isExpanded={expandedSections.layout}
          onToggle={() => toggleSection('layout')}
        >
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aspect Ratio
            </label>
            <select
              value={styleSettings.aspectRatio}
              onChange={(e) => styleSettings.updateAspectRatio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="16:9">16:9 (Widescreen)</option>
              <option value="4:3">4:3 (Standard)</option>
              <option value="1:1">1:1 (Square)</option>
              <option value="3:4">3:4 (Portrait)</option>
              <option value="9:16">9:16 (Mobile)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Canvas Width: {styleSettings.canvasWidth}px
            </label>
            <input
              type="range"
              min="600"
              max="2000"
              value={styleSettings.canvasWidth}
              onChange={(e) => throttledSetters.setCanvasWidth(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Canvas Height: {styleSettings.canvasHeight}px
            </label>
            <input
              type="range"
              min="400"
              max="2000"
              value={styleSettings.canvasHeight}
              onChange={(e) => throttledSetters.setCanvasHeight(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {isBarChart && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chart Width: {styleSettings.chartWidth}px
                </label>
                <input
                  type="range"
                  min="200"
                  max="1500"
                  value={styleSettings.chartWidth}
                  onChange={(e) => throttledSetters.setChartWidth(Number(e.target.value))}
                  onInput={(e) => styleSettings.setChartWidth(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chart Height: {styleSettings.chartHeight}px
                </label>
                <input
                  type="range"
                  min="200"
                  max="1000"
                  value={styleSettings.chartHeight}
                  onChange={(e) => throttledSetters.setChartHeight(Number(e.target.value))}
                  onInput={(e) => styleSettings.setChartHeight(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </>
          )}

          {!isSlopeChart && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isBarChart ? 'Category Spacing' : 'Stage Gap'}: {styleSettings.stageGap}{isBarChart ? '' : 'px'}
              </label>
              <input
                type="range"
                min="0"
                max={isBarChart ? 100 : 50}
                value={styleSettings.stageGap}
                onChange={(e) => styleSettings.setStageGap(Number(e.target.value))}
                onInput={(e) => styleSettings.setStageGap(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          {chartType === 'funnel' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stage Label Position
              </label>
              <select
                value={styleSettings.stageLabelPosition}
                onChange={(e) => styleSettings.setStageLabelPosition(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
          )}
        </div>
      </CollapsibleSection>
      )}

      {/* 4. TYPOGRAPHY - For Funnel Chart only (Bar, Slope, and Line Charts have their own) */}
      {!isBarChart && !isSlopeChart && !isLineChart && (
        <CollapsibleSection
          title="Typography"
          isExpanded={expandedSections.typography}
          onToggle={() => toggleSection('typography')}
        >
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={styleSettings.title}
              onChange={(e) => styleSettings.setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtitle
            </label>
            <input
              type="text"
              value={styleSettings.subtitle}
              onChange={(e) => styleSettings.setSubtitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title Alignment
            </label>
            <select
              value={styleSettings.titleAlignment}
              onChange={(e) => styleSettings.setTitleAlignment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Family
            </label>
            <select
              value={styleSettings.fontFamily}
              onChange={(e) => styleSettings.setFontFamily(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <optgroup label="Sans-Serif">
                <option value="Inter">Inter</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Lato">Lato</option>
              </optgroup>
              <optgroup label="Condensed">
                <option value="Roboto Condensed">Roboto Condensed</option>
                <option value="Open Sans Condensed">Open Sans Condensed</option>
              </optgroup>
              <optgroup label="Serif">
                <option value="Merriweather">Merriweather</option>
                <option value="Playfair Display">Playfair Display</option>
                <option value="Lora">Lora</option>
                <option value="PT Serif">PT Serif</option>
                <option value="Georgia">Georgia</option>
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title Font Size: {styleSettings.titleFontSize}px
            </label>
            <input
              type="range"
              min="16"
              max="48"
              value={styleSettings.titleFontSize}
              onChange={(e) => styleSettings.setTitleFontSize(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtitle Font Size: {styleSettings.subtitleFontSize}px
            </label>
            <input
              type="range"
              min="12"
              max="32"
              value={styleSettings.subtitleFontSize}
              onChange={(e) => styleSettings.setSubtitleFontSize(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {isBarChart ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  X-Axis Font Size: {styleSettings.xAxisFontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="32"
                  value={styleSettings.xAxisFontSize}
                  onChange={(e) => styleSettings.setXAxisFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Y-Axis Font Size: {styleSettings.yAxisFontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="32"
                  value={styleSettings.yAxisFontSize}
                  onChange={(e) => styleSettings.setYAxisFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Axis Label
                </label>
                <input
                  type="text"
                  value={styleSettings.axisLabel}
                  onChange={(e) => styleSettings.setAxisLabel(e.target.value)}
                  placeholder="e.g., Dollars Per Month"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Axis Label Font Size: {styleSettings.axisLabelFontSize}px
                </label>
                <input
                  type="range"
                  min="10"
                  max="20"
                  value={styleSettings.axisLabelFontSize}
                  onChange={(e) => styleSettings.setAxisLabelFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Segment Label Font Size: {styleSettings.segmentLabelFontSize}px
              </label>
              <input
                type="range"
                min="12"
                max="32"
                value={styleSettings.segmentLabelFontSize}
                onChange={(e) => styleSettings.setSegmentLabelFontSize(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metric Label Font Size: {styleSettings.metricLabelFontSize}px
            </label>
            <input
              type="range"
              min="10"
              max="24"
              value={styleSettings.metricLabelFontSize}
              onChange={(e) => styleSettings.setMetricLabelFontSize(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {isSlopeChart && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Period Font Label: {styleSettings.periodLabelFontSize}px
                </label>
                <input
                  type="range"
                  min="14"
                  max="32"
                  value={styleSettings.periodLabelFontSize}
                  onChange={(e) => styleSettings.setPeriodLabelFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Period Label Position
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => styleSettings.setPeriodLabelPosition('above')}
                    className={`flex-1 px-4 py-2 rounded-lg ${
                      styleSettings.periodLabelPosition === 'above'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Above
                  </button>
                  <button
                    onClick={() => styleSettings.setPeriodLabelPosition('below')}
                    className={`flex-1 px-4 py-2 rounded-lg ${
                      styleSettings.periodLabelPosition === 'below'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Below
                  </button>
                </div>
              </div>
            </>
          )}

          {!isSlopeChart && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Legend Font Size: {styleSettings.legendFontSize}px
              </label>
              <input
                type="range"
                min="8"
                max="20"
                value={styleSettings.legendFontSize}
                onChange={(e) => styleSettings.setLegendFontSize(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          {!isSlopeChart && !isBarChart && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conversion Label Font Size: {styleSettings.conversionLabelFontSize}px
              </label>
              <input
                type="range"
                min="12"
                max="32"
                value={styleSettings.conversionLabelFontSize}
                onChange={(e) => styleSettings.setConversionLabelFontSize(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}
        </div>
      </CollapsibleSection>
      )}

      {/* 3. COLORS & STYLING - For Funnel Chart only (Bar, Slope, and Line Charts have their own) */}
      {!isSlopeChart && !isBarChart && !isLineChart && (
        <CollapsibleSection
          title="Colors & Styling"
          isExpanded={expandedSections.colors}
          onToggle={() => toggleSection('colors')}
        >
          <div className="space-y-2">
          {(chartData.isComparisonMode || isBarChart) ? (
            <>
              {/* Comparison Mode Colors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Palette
                </label>
                <select
                  value={styleSettings.comparisonPalette}
                  onChange={(e) => styleSettings.setComparisonPalette(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {Object.entries(comparisonPalettes).map(([key, palette]) => (
                    <option key={key} value={key}>
                      {palette.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Color Swatches for Comparison */}
              {styleSettings.comparisonPalette === 'user' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Colors (up to 8)
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {styleSettings.userCustomColors.map((color, index) => (
                      <div key={index} className="flex flex-col gap-1">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => {
                            const newColors = [...styleSettings.userCustomColors];
                            newColors[index] = e.target.value;
                            styleSettings.setUserCustomColors(newColors);
                          }}
                          className="w-full h-12 rounded-lg cursor-pointer border-2 border-gray-300"
                        />
                        <input
                          type="text"
                          value={color}
                          onChange={(e) => {
                            const newColors = [...styleSettings.userCustomColors];
                            newColors[index] = e.target.value;
                            styleSettings.setUserCustomColors(newColors);
                          }}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview Colors for Presets */}
              {styleSettings.comparisonPalette !== 'user' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Palette Preview
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {comparisonPalettes[styleSettings.comparisonPalette].colors.slice(0, 8).map((color, index) => (
                      <div
                        key={index}
                        className="w-10 h-10 rounded border-2 border-gray-300"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={styleSettings.barColor}
                    onChange={(e) => styleSettings.setBarColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300"
                  />
                  <input
                    type="text"
                    value={styleSettings.barColor}
                    onChange={(e) => styleSettings.setBarColor(e.target.value)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Presets
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => styleSettings.setBarColor(preset.color)}
                      className="group relative"
                      title={preset.name}
                    >
                      <div
                        className="w-full h-10 rounded border-2 border-gray-300 hover:border-cyan-500 transition-colors"
                        style={{ backgroundColor: preset.color }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-medium text-white bg-black bg-opacity-75 px-2 py-1 rounded">
                          {preset.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                  Color Transition: {styleSettings.colorTransition}%
                  <InfoTooltip text="Controls the gradient intensity from dark to light across periods" />
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={styleSettings.colorTransition}
                  onChange={(e) => throttledSetters.setColorTransition(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </>
          )}
          </div>
        </CollapsibleSection>
      )}

      {/* 6. CHART TYPE - Only for Funnel Chart */}
      {!isSlopeChart && !isBarChart && !isLineChart && (
        <CollapsibleSection
          title="Chart Type"
          isExpanded={expandedSections.chartType}
          onToggle={() => toggleSection('chartType')}
        >
          <div className="space-y-3">
          {/* Data Mode Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Mode
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => chartData.isComparisonMode && chartData.toggleComparisonMode()}
                className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  !chartData.isComparisonMode
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Time Series
              </button>
              <button
                onClick={() => !chartData.isComparisonMode && chartData.toggleComparisonMode()}
                className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  chartData.isComparisonMode
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Comparison
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {chartData.isComparisonMode
                ? 'Multiple colors for comparing different groups/periods'
                : 'Monochrome gradient showing progression over time'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Orientation
            </label>
            <select
              value={styleSettings.orientation}
              onChange={(e) => {
                styleSettings.setOrientation(e.target.value);
                clearEmphasis();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="vertical">Vertical</option>
              <option value="horizontal">Horizontal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emphasis Mode
            </label>
            <select
              value={styleSettings.emphasis}
              onChange={(e) => styleSettings.setEmphasis(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="throughput">Throughput (Volume Flow)</option>
              <option value="fallout">Fallout (Drop-offs)</option>
            </select>
          </div>
          </div>
        </CollapsibleSection>
      )}

      {/* Line Chart Specific Sections */}
      {isLineChart && (
        <>
          {/* 1. THEME */}
          <CollapsibleSection
            title="Theme"
            isExpanded={expandedSections.theme}
            onToggle={() => toggleSection('theme')}
          >
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chart Background
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                    styleSettings.setDarkMode(false);
                    styleSettings.setBackgroundColor('#ffffff');
                  }}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      !styleSettings.darkMode
                        ? 'bg-white text-gray-900 border-2 border-gray-400 shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                    }`}
                  >
                    Light Mode
                  </button>
                  <button
                    onClick={() => {
                    styleSettings.setDarkMode(true);
                    styleSettings.setBackgroundColor('#1f2937');
                  }}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      styleSettings.darkMode
                        ? 'bg-gray-800 text-white border-2 border-gray-600 shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                    }`}
                  >
                    Dark Mode
                  </button>
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={styleSettings.backgroundColor}
                    onChange={(e) => styleSettings.setBackgroundColor(e.target.value)}
                    className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={styleSettings.backgroundColor}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                        styleSettings.setBackgroundColor(value);
                      }
                    }}
                    placeholder="#ffffff"
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                  />
                </div>
              </div>

              {/* Background Opacity */}
              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                  Background Opacity: {styleSettings.backgroundOpacity}%
                  <InfoTooltip text="Adjusts the transparency of the chart background" />
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={styleSettings.backgroundOpacity}
                  onChange={(e) => throttledSetters.setBackgroundOpacity(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </CollapsibleSection>


          {/* 2. CANVAS & LAYOUT */}
          <CollapsibleSection
            title="Canvas & Layout"
            isExpanded={expandedSections.layout}
            onToggle={() => toggleSection('layout')}
          >
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aspect Ratio
                </label>
                <select
                  value={styleSettings.aspectRatio}
                  onChange={(e) => styleSettings.updateAspectRatio(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="16:9">16:9 (Widescreen)</option>
                  <option value="4:3">4:3 (Standard)</option>
                  <option value="1:1">1:1 (Square)</option>
                  <option value="3:4">3:4 (Portrait)</option>
                  <option value="9:16">9:16 (Mobile)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Canvas Width: {styleSettings.canvasWidth}px
                </label>
                <input
                  type="range"
                  min="600"
                  max="2000"
                  value={styleSettings.canvasWidth}
                  onChange={(e) => throttledSetters.setCanvasWidth(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Canvas Height: {styleSettings.canvasHeight}px
                </label>
                <input
                  type="range"
                  min="400"
                  max="2000"
                  value={styleSettings.canvasHeight}
                  onChange={(e) => throttledSetters.setCanvasHeight(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </CollapsibleSection>
          {/* 3. COLORS & STYLING */}
          <CollapsibleSection
            title="Colors & Styling"
            isExpanded={expandedSections.colorMode}
            onToggle={() => toggleSection('colorMode')}
          >
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Strategy
                </label>
                <select
                  value={styleSettings.colorMode || 'category'}
                  onChange={(e) => styleSettings.setColorMode?.(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="category">Category (Different color per line)</option>
                  <option value="custom">Custom (Manual colors)</option>
                </select>
              </div>

              {/* Category Palette */}
              {styleSettings.colorMode === 'category' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Palette
                  </label>
                  <select
                    value={styleSettings.comparisonPalette || 'observable10'}
                    onChange={(e) => styleSettings.setComparisonPalette?.(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {Object.entries(comparisonPalettes).map(([key, palette]) => (
                      <option key={key} value={key}>
                        {palette.name}
                      </option>
                    ))}
                  </select>
                  {styleSettings.comparisonPalette !== 'user' && (
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-2">
                        {(comparisonPalettes[styleSettings.comparisonPalette || 'observable10']?.colors || []).slice(0, 8).map((color, index) => (
                          <div
                            key={index}
                            className="w-10 h-10 rounded border-2 border-gray-300"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Custom Colors */}
              {(styleSettings.colorMode === 'custom' || (styleSettings.colorMode === 'category' && styleSettings.comparisonPalette === 'user')) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Colors (up to 8)
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {(styleSettings.userCustomColors || ['#1e40af', '#0d9488', '#991b1b', '#d97706', '#475569', '#7c3aed', '#059669', '#dc2626']).map((color, index) => (
                      <div key={index} className="flex flex-col gap-1">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => {
                            const newColors = [...(styleSettings.userCustomColors || ['#1e40af', '#0d9488', '#991b1b', '#d97706', '#475569', '#7c3aed', '#059669', '#dc2626'])];
                            newColors[index] = e.target.value;
                            styleSettings.setUserCustomColors?.(newColors);
                          }}
                          className="w-full h-12 rounded-lg cursor-pointer border-2 border-gray-300"
                        />
                        <input
                          type="text"
                          value={color}
                          onChange={(e) => {
                            const newColors = [...(styleSettings.userCustomColors || ['#1e40af', '#0d9488', '#991b1b', '#d97706', '#475569', '#7c3aed', '#059669', '#dc2626'])];
                            newColors[index] = e.target.value;
                            styleSettings.setUserCustomColors?.(newColors);
                          }}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleSection>


          {/* 4. TYPOGRAPHY */}
          <CollapsibleSection
            title="Typography"
            isExpanded={expandedSections.typography}
            onToggle={() => toggleSection('typography')}
          >
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={styleSettings.title}
                  onChange={(e) => styleSettings.setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={styleSettings.subtitle}
                  onChange={(e) => styleSettings.setSubtitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title Alignment
                </label>
                <select
                  value={styleSettings.titleAlignment}
                  onChange={(e) => styleSettings.setTitleAlignment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Family
                </label>
                <select
                  value={styleSettings.fontFamily}
                  onChange={(e) => styleSettings.setFontFamily(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <optgroup label="Sans-Serif">
                    <option value="Inter">Inter</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                  </optgroup>
                  <optgroup label="Condensed">
                    <option value="Roboto Condensed">Roboto Condensed</option>
                    <option value="Open Sans Condensed">Open Sans Condensed</option>
                    <option value="Economica">Economica</option>
                  </optgroup>
                  <optgroup label="Serif">
                    <option value="Merriweather">Merriweather</option>
                    <option value="Playfair Display">Playfair Display</option>
                    <option value="Lora">Lora</option>
                    <option value="PT Serif">PT Serif</option>
                    <option value="Newsreader">Newsreader</option>
                    <option value="Georgia">Georgia</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title Font Size: {styleSettings.titleFontSize}px
                </label>
                <input
                  type="range"
                  min="16"
                  max="48"
                  value={styleSettings.titleFontSize}
                  onChange={(e) => styleSettings.setTitleFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle Font Size: {styleSettings.subtitleFontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="32"
                  value={styleSettings.subtitleFontSize}
                  onChange={(e) => styleSettings.setSubtitleFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Legend Font Size: {styleSettings.legendFontSize}px
                </label>
                <input
                  type="range"
                  min="8"
                  max="20"
                  value={styleSettings.legendFontSize}
                  onChange={(e) => styleSettings.setLegendFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metric Label Font Size: {styleSettings.metricLabelFontSize}px
                </label>
                <input
                  type="range"
                  min="10"
                  max="24"
                  value={styleSettings.metricLabelFontSize}
                  onChange={(e) => styleSettings.setMetricLabelFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </CollapsibleSection>
          {/* 5. LABELS */}
          <CollapsibleSection
            title="Labels"
            isExpanded={expandedSections.labels}
            onToggle={() => toggleSection('labels')}
          >
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Label Type
                </label>
                <select
                  value={styleSettings.legendPosition || 'direct'}
                  onChange={(e) => {
                    styleSettings.setLegendPosition(e.target.value);
                    // Also update showDirectLabels and showLegend based on selection
                    if (e.target.value === 'direct') {
                      styleSettings.setShowDirectLabels(true);
                      styleSettings.setShowLegend(false);
                    } else {
                      styleSettings.setShowDirectLabels(false);
                      styleSettings.setShowLegend(true);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="direct">Direct Labels (at line ends)</option>
                  <option value="top">Legend (top)</option>
                </select>
              </div>

              {styleSettings.legendPosition === 'direct' && (
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                    Direct Label Font Size
                    <InfoTooltip text="Font size for metric name labels at line ends" />
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="8"
                      max="24"
                      value={styleSettings.directLabelFontSize || 14}
                      onChange={(e) => styleSettings.setDirectLabelFontSize?.(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium text-gray-700 w-12 text-right">
                      {styleSettings.directLabelFontSize || 14}px
                    </span>
                  </div>
                </div>
              )}

              {/* Sum Labels for Area Charts */}
              {(chartType === 'area' || chartType === 'area-stacked') && (
                <>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                      Show Sum Labels
                      <InfoTooltip text="Display the total value for each metric across all time periods" />
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={styleSettings.showSumLabels || false}
                        onChange={(e) => styleSettings.setShowSumLabels?.(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                    </label>
                  </div>

                  {styleSettings.showSumLabels && (
                    <>
                      <div>
                        <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                          Sum Label Position
                          <InfoTooltip text="Where to display the sum label - in center of area or on direct label" />
                        </label>
                        <select
                          value={styleSettings.sumLabelPosition || 'direct'}
                          onChange={(e) => styleSettings.setSumLabelPosition?.(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                          <option value="direct">On Direct Label</option>
                          <option value="center">Center of Area</option>
                        </select>
                      </div>

                      <div>
                        <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                          Sum Label Font Size
                          <InfoTooltip text="Font size for the sum value labels" />
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="8"
                            max="24"
                            value={styleSettings.sumLabelFontSize || 14}
                            onChange={(e) => styleSettings.setSumLabelFontSize?.(Number(e.target.value))}
                            className="flex-1"
                          />
                          <span className="text-sm font-medium text-gray-700 w-12 text-right">
                            {styleSettings.sumLabelFontSize || 14}px
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {styleSettings.legendPosition === 'top' && (
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                    Legend Font Size
                    <InfoTooltip text="Font size for legend labels" />
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="8"
                      max="24"
                      value={styleSettings.legendFontSize || 12}
                      onChange={(e) => styleSettings.setLegendFontSize?.(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium text-gray-700 w-12 text-right">
                      {styleSettings.legendFontSize || 12}px
                    </span>
                  </div>
                </div>
              )}

              {/* Compact Numbers */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <label className="flex-1 text-sm font-medium text-gray-700">
                    Compact label values (1.5K vs 1500)
                  </label>
                  <button
                    onClick={() => styleSettings.setCompactNumbers(!styleSettings.compactNumbers)}
                    className={`px-4 py-1 rounded text-sm font-medium ${
                      styleSettings.compactNumbers
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {styleSettings.compactNumbers ? 'On' : 'Off'}
                  </button>
                </div>
              </div>

              {/* Number Styling (Values) */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number Styling (Values)
                  </label>
                </div>

                {/* Value Format */}
                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1">
                    Value Format
                    <InfoTooltip text="Percentage multiplies values by 100 and adds % symbol" />
                  </label>
                  <select
                    value={styleSettings.valueFormat}
                    onChange={(e) => styleSettings.setValueFormat(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                  >
                    <option value="number">Number</option>
                    <option value="percentage">Percentage</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {/* Prefix */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Prefix
                    </label>
                    <input
                      type="text"
                      value={styleSettings.valuePrefix}
                      onChange={(e) => styleSettings.setValuePrefix(e.target.value)}
                      placeholder="$"
                      maxLength={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                    />
                  </div>

                  {/* Suffix */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Suffix
                    </label>
                    <input
                      type="text"
                      value={styleSettings.valueSuffix}
                      onChange={(e) => styleSettings.setValueSuffix(e.target.value)}
                      placeholder="%"
                      maxLength={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                    />
                  </div>

                  {/* Decimal Places */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Decimal places
                    </label>
                    <input
                      type="number"
                      value={styleSettings.valueDecimalPlaces}
                      onChange={(e) => styleSettings.setValueDecimalPlaces(Math.max(0, Math.min(5, parseInt(e.target.value) || 0)))}
                      min="0"
                      max="5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* 6. LINE STYLING */}
          <CollapsibleSection
            title="Line Styling"
            isExpanded={expandedSections.lineStyling}
            onToggle={() => toggleSection('lineStyling')}
          >
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Line Thickness: {styleSettings.lineThickness}px
                </label>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={styleSettings.lineThickness}
                  onChange={(e) => throttledSetters.setLineThickness(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Line Style
                </label>
                <select
                  value={styleSettings.lineStyle || 'solid'}
                  onChange={(e) => styleSettings.setLineStyle?.(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Line Opacity: {(styleSettings.lineOpacity || 1.0).toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={styleSettings.lineOpacity || 1.0}
                  onChange={(e) => styleSettings.setLineOpacity(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={styleSettings.smoothLines || false}
                  onChange={(e) => styleSettings.setSmoothLines?.(e.target.checked)}
                  className="w-4 h-4 text-cyan-600 rounded"
                />
                <span className="text-sm text-gray-700">Smooth Lines (Curve Interpolation)</span>
              </label>
            </div>
          </CollapsibleSection>

          {/* 7. DATE / TIME */}
          <CollapsibleSection
            title="Date / Time"
            isExpanded={expandedSections.dateTime}
            onToggle={() => toggleSection('dateTime')}
          >
            <div className="space-y-2">
              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                  Aggregation Level
                  <InfoTooltip text="Aggregate daily data to higher time periods" />
                </label>
                <select
                  value={styleSettings.aggregationLevel || 'day'}
                  onChange={(e) => styleSettings.setAggregationLevel?.(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                  <option value="quarter">Quarter</option>
                  <option value="year">Year</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                  Aggregation Method
                  <InfoTooltip text="How to combine values when aggregating" />
                </label>
                <select
                  value={styleSettings.aggregationMethod || 'sum'}
                  onChange={(e) => styleSettings.setAggregationMethod?.(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="sum">Sum</option>
                  <option value="average">Average</option>
                  <option value="min">Minimum</option>
                  <option value="max">Maximum</option>
                  <option value="count">Count</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                  Fiscal Year Start Month
                  <InfoTooltip text="For quarter and year calculations" />
                </label>
                <select
                  value={styleSettings.fiscalYearStartMonth || 1}
                  onChange={(e) => styleSettings.setFiscalYearStartMonth?.(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                  X-Axis Label Levels
                  <InfoTooltip text="Show one or two levels of time labels on X-axis" />
                </label>
                <select
                  value={styleSettings.xAxisLabelLevels || 2}
                  onChange={(e) => styleSettings.setXAxisLabelLevels?.(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="1">Single Level (Jan, Week 1, Q1)</option>
                  <option value="2">Two Levels (Jan + Qtr 1, Week 1 + Jan 2024)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Range Filter
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-12">Start</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={styleSettings.dateRangeFilter?.[0] || 0}
                      onChange={(e) => {
                        const newStart = Number(e.target.value);
                        const currentEnd = styleSettings.dateRangeFilter?.[1] || 100;
                        if (newStart <= currentEnd) {
                          styleSettings.setDateRangeFilter?.([newStart, currentEnd]);
                        }
                      }}
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-700 w-20 text-right">
                      {(() => {
                        if (!chartData.data || chartData.data.length === 0) return '0%';
                        const data = chartData.data.filter(d => d.date);
                        if (data.length === 0) return '0%';
                        const sortedDates = data.map(d => d.date).sort();
                        const index = Math.floor((styleSettings.dateRangeFilter?.[0] || 0) / 100 * (sortedDates.length - 1));
                        return sortedDates[index] || sortedDates[0];
                      })()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-12">End</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={styleSettings.dateRangeFilter?.[1] || 100}
                      onChange={(e) => {
                        const newEnd = Number(e.target.value);
                        const currentStart = styleSettings.dateRangeFilter?.[0] || 0;
                        if (newEnd >= currentStart) {
                          styleSettings.setDateRangeFilter?.([currentStart, newEnd]);
                        }
                      }}
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-700 w-20 text-right">
                      {(() => {
                        if (!chartData.data || chartData.data.length === 0) return '100%';
                        const data = chartData.data.filter(d => d.date);
                        if (data.length === 0) return '100%';
                        const sortedDates = data.map(d => d.date).sort();
                        const index = Math.floor((styleSettings.dateRangeFilter?.[1] || 100) / 100 * (sortedDates.length - 1));
                        return sortedDates[index] || sortedDates[sortedDates.length - 1];
                      })()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">
                    Showing {styleSettings.dateRangeFilter?.[0] || 0}% - {styleSettings.dateRangeFilter?.[1] || 100}% of data
                  </p>
                  {(styleSettings.dateRangeFilter?.[0] !== 0 || styleSettings.dateRangeFilter?.[1] !== 100) && (
                    <button
                      onClick={() => styleSettings.setDateRangeFilter?.([0, 100])}
                      className="text-xs text-cyan-600 hover:text-cyan-700 font-medium"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* 8. EMPHASIS */}
          <CollapsibleSection
            title="Emphasis"
            isExpanded={expandedSections.emphasis}
            onToggle={() => toggleSection('emphasis')}
          >
            <div className="space-y-2">
              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Emphasized Points
                  </span>
                  <span className="text-sm font-semibold text-cyan-600">
                    {styleSettings.emphasizedPoints?.length || 0} / 4
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  Click on point markers in the chart to emphasize them (max 4)
                </p>
                {styleSettings.emphasizedPoints && styleSettings.emphasizedPoints.length > 0 && (
                  <button
                    onClick={() => styleSettings.setEmphasizedPoints?.([])}
                    className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                  Label Position
                  <InfoTooltip text="Position of metric labels on emphasized points" />
                </label>
                <select
                  value={styleSettings.emphasisLabelPosition || 'above'}
                  onChange={(e) => styleSettings.setEmphasisLabelPosition?.(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="above">Above</option>
                  <option value="below">Below</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                  Label Font Size
                  <InfoTooltip text="Font size for emphasized point labels" />
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="8"
                    max="20"
                    step="1"
                    value={styleSettings.emphasisLabelFontSize || 12}
                    onChange={(e) => styleSettings.setEmphasisLabelFontSize?.(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium text-gray-700 w-12 text-right">
                    {styleSettings.emphasisLabelFontSize || 12}px
                  </span>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={styleSettings.showEmphasisDate || false}
                    onChange={(e) => styleSettings.setShowEmphasisDate?.(e.target.checked)}
                    className="w-4 h-4 text-cyan-600 rounded"
                  />
                  <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
                    Show Date
                    <InfoTooltip text="Display date below metric value in emphasis labels" />
                  </span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={styleSettings.showEmphasisVerticalLine || false}
                    onChange={(e) => styleSettings.setShowEmphasisVerticalLine?.(e.target.checked)}
                    className="w-4 h-4 text-cyan-600 rounded"
                  />
                  <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
                    Vertical Line
                    <InfoTooltip text="Show vertical line from X-axis to emphasized point" />
                  </span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={styleSettings.emphasisCompactNumbers || false}
                    onChange={(e) => styleSettings.setEmphasisCompactNumbers?.(e.target.checked)}
                    className="w-4 h-4 text-cyan-600 rounded"
                  />
                  <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
                    Compact Numbers
                    <InfoTooltip text="Format numbers as K, M, B (e.g., 1.2K, 3.5M)" />
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
                    Prefix
                    <InfoTooltip text="Text before value (e.g., $ for currency)" />
                  </label>
                  <input
                    type="text"
                    value={styleSettings.emphasisValuePrefix || ''}
                    onChange={(e) => styleSettings.setEmphasisValuePrefix?.(e.target.value)}
                    placeholder="$"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
                    Suffix
                    <InfoTooltip text="Text after value (e.g., % or units)" />
                  </label>
                  <input
                    type="text"
                    value={styleSettings.emphasisValueSuffix || ''}
                    onChange={(e) => styleSettings.setEmphasisValueSuffix?.(e.target.value)}
                    placeholder="%"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
                    Decimals
                    <InfoTooltip text="Number of decimal places (0-5)" />
                  </label>
                  <input
                    type="number"
                    value={styleSettings.emphasisDecimalPlaces ?? 0}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                      styleSettings.setEmphasisDecimalPlaces?.(Math.max(0, Math.min(5, val)));
                    }}
                    min="0"
                    max="5"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                  />
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* 9. POINT MARKERS */}
          <CollapsibleSection
            title="Point Markers"
            isExpanded={expandedSections.pointMarkers}
            onToggle={() => toggleSection('pointMarkers')}
          >
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={styleSettings.showPoints !== undefined ? styleSettings.showPoints : true}
                  onChange={(e) => styleSettings.setShowPoints?.(e.target.checked)}
                  className="w-4 h-4 text-cyan-600 rounded"
                />
                <span className="text-sm text-gray-700">Show Point Markers</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={styleSettings.excludeZeroValues !== undefined ? styleSettings.excludeZeroValues : true}
                  onChange={(e) => styleSettings.setExcludeZeroValues?.(e.target.checked)}
                  className="w-4 h-4 text-cyan-600 rounded"
                />
                <span className="text-sm text-gray-700">Exclude Zero/Null Values</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={styleSettings.showMostRecentPoint || false}
                  onChange={(e) => styleSettings.setShowMostRecentPoint?.(e.target.checked)}
                  className="w-4 h-4 text-cyan-600 rounded"
                />
                <span className="text-sm text-gray-700">Display Most Recent Value</span>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marker Point Style
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => styleSettings.setPointStyle?.('filled')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      (styleSettings.pointStyle || 'filled') === 'filled'
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Filled
                  </button>
                  <button
                    onClick={() => styleSettings.setPointStyle?.('outlined')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      styleSettings.pointStyle === 'outlined'
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Outlined
                  </button>
                </div>
              </div>

              {(styleSettings.showPoints !== false) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Point Size: {styleSettings.pointSize || 4}px
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="12"
                    value={styleSettings.pointSize || 4}
                    onChange={(e) => styleSettings.setPointSize?.(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* 10. AREA FILL */}
          <CollapsibleSection
            title="Area Fill"
            isExpanded={expandedSections.areaFill}
            onToggle={() => toggleSection('areaFill')}
          >
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={styleSettings.showAreaFill || false}
                  onChange={(e) => styleSettings.setShowAreaFill?.(e.target.checked)}
                  className="w-4 h-4 text-cyan-600 rounded"
                />
                <span className="text-sm text-gray-700">Show Area Fill Below Lines</span>
              </label>

              {styleSettings.showAreaFill && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={styleSettings.stackAreas || false}
                    onChange={(e) => styleSettings.setStackAreas?.(e.target.checked)}
                    className="w-4 h-4 text-cyan-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Stack Areas (Cumulative)</span>
                </label>
              )}

              {styleSettings.showAreaFill && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Area Opacity: {(styleSettings.areaOpacity || 0.2).toFixed(2)}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={styleSettings.areaOpacity || 0.2}
                      onChange={(e) => styleSettings.setAreaOpacity?.(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={styleSettings.areaGradient || false}
                      onChange={(e) => styleSettings.setAreaGradient?.(e.target.checked)}
                      className="w-4 h-4 text-cyan-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Use Gradient Fill (Color → Transparent)</span>
                  </label>
                </>
              )}
            </div>
          </CollapsibleSection>

          {/* 11. AXES & GRIDLINES */}
          <CollapsibleSection
            title="Axes & Gridlines"
            isExpanded={expandedSections.axesGridlines}
            onToggle={() => toggleSection('axesGridlines')}
          >
            <div className="space-y-2">
              {/* Axis Label */}
              <div className="space-y-3">
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                    Axis Label
                    <InfoTooltip text="Optional label at the end of the value axis" />
                  </label>
                </div>

                <input
                  type="text"
                  value={styleSettings.axisLabel}
                  onChange={(e) => styleSettings.setAxisLabel(e.target.value)}
                  placeholder="e.g., Revenue ($)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Number Styling (Axis) */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number Styling (Axis)
                  </label>
                </div>

                {/* Value Format */}
                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1">
                    Value Format
                    <InfoTooltip text="Percentage multiplies values by 100 and adds % symbol" />
                  </label>
                  <select
                    value={styleSettings.axisValueFormat}
                    onChange={(e) => styleSettings.setAxisValueFormat(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                  >
                    <option value="number">Number</option>
                    <option value="percentage">Percentage</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {/* Prefix */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Prefix
                    </label>
                    <input
                      type="text"
                      value={styleSettings.axisValuePrefix}
                      onChange={(e) => styleSettings.setAxisValuePrefix(e.target.value)}
                      placeholder="$"
                      maxLength={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                    />
                  </div>

                  {/* Suffix */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Suffix
                    </label>
                    <input
                      type="text"
                      value={styleSettings.axisValueSuffix}
                      onChange={(e) => styleSettings.setAxisValueSuffix(e.target.value)}
                      placeholder="%"
                      maxLength={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                    />
                  </div>

                  {/* Decimal Places */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Decimal places
                    </label>
                    <input
                      type="number"
                      value={styleSettings.axisValueDecimalPlaces}
                      onChange={(e) => styleSettings.setAxisValueDecimalPlaces(Math.max(0, Math.min(5, parseInt(e.target.value) || 0)))}
                      min="0"
                      max="5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Number Format */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number Format
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex-1 text-sm text-gray-700">
                    Compact axis values (1.5K vs 1500)
                  </label>
                  <button
                    onClick={() => styleSettings.setCompactAxisNumbers(!styleSettings.compactAxisNumbers)}
                    className={`px-4 py-1 rounded text-sm font-medium ${
                      styleSettings.compactAxisNumbers
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {styleSettings.compactAxisNumbers ? 'On' : 'Off'}
                  </button>
                </div>
              </div>

              {/* Show/Hide Axes */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={styleSettings.showXAxis !== undefined ? styleSettings.showXAxis : true}
                  onChange={(e) => styleSettings.setShowXAxis?.(e.target.checked)}
                  className="w-4 h-4 text-cyan-600 rounded"
                />
                <span className="text-sm text-gray-700">Show X-Axis (Time)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={styleSettings.showYAxis !== undefined ? styleSettings.showYAxis : true}
                  onChange={(e) => styleSettings.setShowYAxis?.(e.target.checked)}
                  className="w-4 h-4 text-cyan-600 rounded"
                />
                <span className="text-sm text-gray-700">Show Y-Axis (Values)</span>
              </label>

              {/* Bounds */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bounds
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-sm font-medium text-gray-700">
                    Minimum
                  </label>
                  <input
                    type="number"
                    key={`${styleSettings.axisMinimum}-${styleSettings.axisMinimumAuto}`}
                    defaultValue={styleSettings.axisMinimumAuto ? styleSettings.calculatedAxisMinimum : styleSettings.axisMinimum}
                    onBlur={(e) => {
                      styleSettings.setAxisMinimum(Number(e.target.value));
                      if (styleSettings.axisMinimumAuto) {
                        styleSettings.setAxisMinimumAuto(false);
                      }
                    }}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <label className="flex items-center gap-1 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={styleSettings.axisMinimumAuto}
                      onChange={(e) => styleSettings.setAxisMinimumAuto(e.target.checked)}
                      className="rounded"
                    />
                    Auto
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-sm font-medium text-gray-700">
                    Maximum
                  </label>
                  <input
                    type="number"
                    key={`${styleSettings.axisMaximum}-${styleSettings.axisMaximumAuto}`}
                    defaultValue={styleSettings.axisMaximumAuto ? styleSettings.calculatedAxisMaximum : styleSettings.axisMaximum}
                    onBlur={(e) => {
                      styleSettings.setAxisMaximum(Number(e.target.value));
                      if (styleSettings.axisMaximumAuto) {
                        styleSettings.setAxisMaximumAuto(false);
                      }
                    }}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <label className="flex items-center gap-1 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={styleSettings.axisMaximumAuto}
                      onChange={(e) => styleSettings.setAxisMaximumAuto(e.target.checked)}
                      className="rounded"
                    />
                    Auto
                  </label>
                </div>
              </div>

              {/* Units */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Units
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-sm font-medium text-gray-700">
                    Major
                  </label>
                  <input
                    type="number"
                    key={`${styleSettings.axisMajorUnit}-${styleSettings.axisMajorUnitAuto}`}
                    defaultValue={styleSettings.axisMajorUnitAuto ? styleSettings.calculatedAxisMajorUnit : styleSettings.axisMajorUnit}
                    onBlur={(e) => {
                      styleSettings.setAxisMajorUnit(Number(e.target.value));
                      if (styleSettings.axisMajorUnitAuto) {
                        styleSettings.setAxisMajorUnitAuto(false);
                      }
                    }}
                    disabled={styleSettings.axisMajorUnitAuto}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100"
                  />
                  <label className="flex items-center gap-1 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={styleSettings.axisMajorUnitAuto}
                      onChange={(e) => styleSettings.setAxisMajorUnitAuto(e.target.checked)}
                      className="rounded"
                    />
                    Auto
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-sm font-medium text-gray-700">
                    Minor
                  </label>
                  <input
                    type="number"
                    key={`${styleSettings.axisMinorUnit}-${styleSettings.axisMinorUnitAuto}`}
                    defaultValue={styleSettings.axisMinorUnit}
                    onBlur={(e) => styleSettings.setAxisMinorUnit(Number(e.target.value))}
                    disabled={styleSettings.axisMinorUnitAuto}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100"
                  />
                  <label className="flex items-center gap-1 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={styleSettings.axisMinorUnitAuto}
                      onChange={(e) => styleSettings.setAxisMinorUnitAuto(e.target.checked)}
                      className="rounded"
                    />
                    Auto
                  </label>
                </div>
              </div>

              {/* Tick Marks */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tick Marks
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-sm font-medium text-gray-700">
                    Major Type
                  </label>
                  <select
                    value={styleSettings.axisMajorTickType}
                    onChange={(e) => styleSettings.setAxisMajorTickType(e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="none">None</option>
                    <option value="outside">Outside</option>
                    <option value="inside">Inside</option>
                    <option value="cross">Cross</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-sm font-medium text-gray-700">
                    Minor Type
                  </label>
                  <select
                    value={styleSettings.axisMinorTickType}
                    onChange={(e) => styleSettings.setAxisMinorTickType(e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="none">None</option>
                    <option value="outside">Outside</option>
                    <option value="inside">Inside</option>
                    <option value="cross">Cross</option>
                  </select>
                </div>
              </div>

              {/* Gridlines */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gridlines
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-sm font-medium text-gray-700">
                    Horizontal
                  </label>
                  <button
                    onClick={() => styleSettings.setShowHorizontalGridlines(!styleSettings.showHorizontalGridlines)}
                    className={`px-4 py-1 rounded text-sm font-medium ${
                      styleSettings.showHorizontalGridlines
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {styleSettings.showHorizontalGridlines ? 'On' : 'Off'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <label className="w-24 text-sm font-medium text-gray-700">
                    Vertical
                  </label>
                  <button
                    onClick={() => styleSettings.setShowVerticalGridlines(!styleSettings.showVerticalGridlines)}
                    className={`px-4 py-1 rounded text-sm font-medium ${
                      styleSettings.showVerticalGridlines
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {styleSettings.showVerticalGridlines ? 'On' : 'Off'}
                  </button>
                </div>
              </div>

              {/* Axis Lines */}
              <div className="space-y-3">
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                    Axis Lines
                    <InfoTooltip text="Control X and Y axis line thickness (0 = hide axis line)" />
                  </label>
                </div>

                {/* X-Axis Line Thickness */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <label className="flex-1 text-sm text-gray-700">
                      X-Axis Line
                    </label>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {styleSettings.xAxisLineThickness}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.5"
                    value={styleSettings.xAxisLineThickness}
                    onChange={(e) => styleSettings.setXAxisLineThickness(parseFloat(e.target.value))}
                    className="w-full accent-cyan-600"
                  />
                </div>

                {/* Y-Axis Line Thickness */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <label className="flex-1 text-sm text-gray-700">
                      Y-Axis Line
                    </label>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {styleSettings.yAxisLineThickness}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.5"
                    value={styleSettings.yAxisLineThickness}
                    onChange={(e) => styleSettings.setYAxisLineThickness(parseFloat(e.target.value))}
                    className="w-full accent-cyan-600"
                  />
                </div>
              </div>

              {/* X-Axis Label Rotation */}
              <div className="space-y-3">
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                    X-Axis Label Rotation
                    <InfoTooltip text="Rotate time labels (0° = horizontal, 90° = vertical)" />
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex-1 text-sm text-gray-700">
                    Rotation Angle
                  </label>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {styleSettings.xAxisLabelRotation}°
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={styleSettings.xAxisLabelRotation}
                  onChange={(e) => styleSettings.setXAxisLabelRotation(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* X-Axis Time Label Selection */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    X-Axis Time Labels
                  </label>
                </div>

                {/* Primary Label Selection */}
                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1">
                    Primary Label
                    <InfoTooltip text="The detailed time unit shown for each tick mark" />
                  </label>
                  <select
                    value={styleSettings.xAxisPrimaryLabel || 'auto'}
                    onChange={(e) => {
                      const newPrimary = e.target.value;
                      styleSettings.setXAxisPrimaryLabel(newPrimary);

                      // If Date is selected, default secondary to Month
                      if (newPrimary === 'date') {
                        if (styleSettings.xAxisSecondaryLabel === 'auto' || !styleSettings.xAxisSecondaryLabel) {
                          styleSettings.setXAxisSecondaryLabel('month');
                        }
                      } else {
                        // Validate secondary label - if it's now less granular than primary, reset to auto
                        const timeHierarchy = { day: 0, week: 1, month: 2, quarter: 3, year: 4 };
                        const currentSecondary = styleSettings.xAxisSecondaryLabel || 'auto';

                        if (newPrimary !== 'auto' && currentSecondary !== 'auto' && currentSecondary !== 'none') {
                          const primaryLevel = timeHierarchy[newPrimary];
                          const secondaryLevel = timeHierarchy[currentSecondary];

                          // If secondary is not more granular than primary, reset to auto
                          if (secondaryLevel <= primaryLevel) {
                            styleSettings.setXAxisSecondaryLabel('auto');
                          }
                        }
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                  >
                    <option value="auto">Auto (Based on Aggregation)</option>
                    <option value="date">Date</option>
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                    <option value="quarter">Quarter</option>
                    <option value="year">Year</option>
                  </select>
                </div>

                {/* Date Format Selection - only show when Primary Label is "Date" */}
                {styleSettings.xAxisPrimaryLabel === 'date' && (
                  <>
                    <div>
                      <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1">
                        Date Format Preset
                        <InfoTooltip text="Choose a common date format or use custom below" />
                      </label>
                      <select
                        value={styleSettings.dateFormatPreset || 'MM/dd/yy'}
                        onChange={(e) => styleSettings.setDateFormatPreset(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                      >
                        <option value="MM/dd/yy">01/15/24 (MM/dd/yy)</option>
                        <option value="dd/MM/yy">15/01/24 (dd/MM/yy)</option>
                        <option value="yyyy-MM-dd">2024-01-15 (yyyy-MM-dd)</option>
                        <option value="M/d/yy">1/15/24 (M/d/yy)</option>
                        <option value="MMM dd, yyyy">Jan 15, 2024 (MMM dd, yyyy)</option>
                        <option value="dd MMM yyyy">15 Jan 2024 (dd MMM yyyy)</option>
                        <option value="MMM dd">Jan 15 (MMM dd)</option>
                        <option value="dd MMM">15 Jan (dd MMM)</option>
                        <option value="MMMM dd, yyyy">January 15, 2024 (MMMM dd, yyyy)</option>
                        <option value="EEE, MM/dd">Mon, 01/15 (EEE, MM/dd)</option>
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1">
                        Custom Format (Optional)
                        <InfoTooltip text="Override preset with custom format. Use yyyy, MM, dd, MMM, MMMM, EEE, etc." />
                      </label>
                      <input
                        type="text"
                        value={styleSettings.dateFormatCustom || ''}
                        onChange={(e) => styleSettings.setDateFormatCustom(e.target.value)}
                        placeholder="e.g., EEEE, MMMM do, yyyy"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm font-mono"
                      />
                    </div>
                  </>
                )}

                {/* Secondary Label Selection */}
                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1">
                    Secondary Label
                    <InfoTooltip text="The grouping label shown below primary labels" />
                  </label>
                  <select
                    value={styleSettings.xAxisSecondaryLabel || 'auto'}
                    onChange={(e) => {
                      const newSecondary = e.target.value;
                      const currentPrimary = styleSettings.xAxisPrimaryLabel || 'auto';

                      // Validate - secondary must be less granular (higher level) than primary
                      const timeHierarchy = { day: 0, week: 1, month: 2, quarter: 3, year: 4 };

                      if (newSecondary !== 'auto' && newSecondary !== 'none' && currentPrimary !== 'auto') {
                        const primaryLevel = timeHierarchy[currentPrimary];
                        const secondaryLevel = timeHierarchy[newSecondary];

                        // Only allow if secondary is less granular (higher number) than primary
                        if (secondaryLevel > primaryLevel) {
                          styleSettings.setXAxisSecondaryLabel(newSecondary);
                        } else {
                          // Invalid selection - show alert and don't change
                          alert('Secondary label must be less granular than primary label.\nFor example: Primary = Day, Secondary = Month or Year');
                        }
                      } else {
                        // Auto or none, always allowed
                        styleSettings.setXAxisSecondaryLabel(newSecondary);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                  >
                    <option value="auto">Auto (Based on Primary)</option>
                    <option value="none">None</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                    <option value="quarter">Quarter</option>
                    <option value="year">Year</option>
                  </select>
                </div>
              </div>

              {/* X-Axis Label Font Sizes */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    X-Axis Label Font Sizes
                  </label>
                </div>

                {/* Primary Label Font Size (Day numbers, etc.) */}
                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1">
                    Primary Label: {styleSettings.xAxisFontSize || 12}px
                    <InfoTooltip text="Font size for day numbers, weeks, months, etc." />
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="24"
                    value={styleSettings.xAxisFontSize || 12}
                    onChange={(e) => styleSettings.setXAxisFontSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Secondary Label Font Size (Month/Year, etc.) */}
                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1">
                    Secondary Label: {styleSettings.xAxisSecondaryFontSize || 12}px
                    <InfoTooltip text="Font size for month/year grouping labels" />
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="24"
                    value={styleSettings.xAxisSecondaryFontSize || 12}
                    onChange={(e) => styleSettings.setXAxisSecondaryFontSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* 13. WATERMARK - Hidden for Pro users */}
          {!license.hasAccess && (
            <CollapsibleSection
              title="Watermark"
              isExpanded={expandedSections.watermark}
              onToggle={() => toggleSection('watermark')}
            >
              <div className="space-y-2">
                <div className="px-3 py-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-amber-600">💎</span>
                    <div>
                      <p className="text-sm font-medium text-amber-900">Upgrade to Pro</p>
                      <p className="text-xs text-amber-700 mt-1">
                        Remove watermarks and unlock unlimited exports with a Pro license
                      </p>
                      <button
                        onClick={() => {
                          setShowHamburgerMenu(true);
                        }}
                        className="mt-2 text-xs text-amber-600 hover:text-amber-700 font-medium underline"
                      >
                        View pricing →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          )}
        </>
      )}

      {/* 9/12. DISPLAY OPTIONS - For Funnel Chart only (position 7) */}
      {chartType === 'funnel' && (
        <CollapsibleSection
          title="Display Options"
          isExpanded={expandedSections.displayOptions}
          onToggle={() => toggleSection('displayOptions')}
        >
          <div className="space-y-2">
            {/* Funnel Chart Display Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metric Emphasis
              </label>
              <select
                value={styleSettings.metricEmphasis}
                onChange={(e) => styleSettings.setMetricEmphasis(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="volume">Volume (show numbers)</option>
                <option value="percentage">Percentage (show %)</option>
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={styleSettings.normalizeToHundred}
                onChange={(e) => styleSettings.setNormalizeToHundred(e.target.checked)}
                className="w-4 h-4 text-cyan-600 rounded"
              />
              <span className="text-sm text-gray-700">Normalize First Stage to 100%</span>
            </label>

            {/* Compact Numbers */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={styleSettings.compactNumbers}
                onChange={(e) => styleSettings.setCompactNumbers(e.target.checked)}
                className="w-4 h-4 text-cyan-600 rounded"
              />
              <span className="text-sm text-gray-700">Compact numbers (1K, 1M)</span>
            </label>

            {/* Legend Options */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={styleSettings.showLegend}
                onChange={(e) => styleSettings.setShowLegend(e.target.checked)}
                className="w-4 h-4 text-cyan-600 rounded"
              />
              <span className="text-sm text-gray-700">Show Legend</span>
            </label>

            {styleSettings.showLegend && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Legend Position
                </label>
                <select
                  value={styleSettings.legendPosition}
                  onChange={(e) => styleSettings.setLegendPosition(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="legend">Traditional Legend</option>
                  <option value="direct">Direct Labels</option>
                </select>
              </div>
            )}

            {styleSettings.showLegend && styleSettings.legendPosition === 'direct' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Direct Label Font Size: {styleSettings.inStageLabelFontSize}px
                </label>
                <input
                  type="range"
                  min="8"
                  max="20"
                  step="1"
                  value={styleSettings.inStageLabelFontSize}
                  onChange={(e) => styleSettings.setInStageLabelFontSize(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* 8. SPARKLINES - Only for Funnel Chart */}
      {chartType === 'funnel' && (
        <CollapsibleSection
          title="Sparklines"
          isExpanded={expandedSections.sparklines}
          onToggle={() => toggleSection('sparklines')}
        >
          <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={styleSettings.showSparklines}
              onChange={(e) => styleSettings.setShowSparklines(e.target.checked)}
              className="w-4 h-4 text-cyan-600 rounded"
            />
            <span className="text-sm text-gray-700">Show Sparklines</span>
          </label>

          {styleSettings.showSparklines && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sparkline Type
              </label>
              <select
                value={styleSettings.sparklineType}
                onChange={(e) => styleSettings.setSparklineType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="volume">Volume Trend</option>
                <option value="conversion">Conversion Rate Trend</option>
              </select>
            </div>
          )}
          </div>
        </CollapsibleSection>
      )}

      {/* 9. WATERMARK - For Funnel Chart only (Bar, Slope, and Line Charts have their own) */}
      {!isBarChart && !isSlopeChart && !isLineChart && !license.hasAccess && (
        <CollapsibleSection
          title="Watermark"
          isExpanded={expandedSections.watermark}
          onToggle={() => toggleSection('watermark')}
        >
          <div className="space-y-2">
            <div className="px-3 py-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-amber-600">💎</span>
                <div>
                  <p className="text-sm font-medium text-amber-900">Upgrade to Pro</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Remove watermarks and unlock unlimited exports with a Pro license
                  </p>
                  <button
                    onClick={() => {
                      setShowHamburgerMenu(true);
                    }}
                    className="mt-2 text-xs text-amber-600 hover:text-amber-700 font-medium underline"
                  >
                    View pricing →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* Style Management */}
      <div className="pt-4 border-t border-gray-200 space-y-3">
        {/* Style Templates Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Style Templates
          </label>
          <select
            onChange={(e) => {
              if (e.target.value) {
                applyTemplate(styleSettings, e.target.value);
                e.target.value = ''; // Reset selection after applying
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
            defaultValue=""
          >
            <option value="">Choose a template...</option>
            {getAllTemplates().map(template => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Apply preset styles from major publications
          </p>
        </div>

        {/* Save/Import Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onSaveStyle}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium"
          >
            Save Style
          </button>
          <button
            onClick={onImportStyle}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          >
            Import Style
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Data Tab Component
 */
function DataTabContent({
  chartData,
  chartType,
  onEditData,
  styleSettings,
  addon,
  setCurrentSampleDatasetKey,
  applyStylePreset,
  showPasteCSV,
  setShowPasteCSV,
  pastedCSV,
  setPastedCSV,
  handlePasteCSV,
  showGoogleSheets,
  setShowGoogleSheets,
  googleSheetsUrl,
  setGoogleSheetsUrl,
  googleSheetsLoading,
  setGoogleSheetsLoading,
  googleSheetsError,
  setGoogleSheetsError,
  autoRefreshEnabled,
  setAutoRefreshEnabled,
  autoRefreshInterval,
  setAutoRefreshInterval
}) {
  const isSlopeChart = chartType === 'slope';
  const isBarChart = chartType?.startsWith('bar-');
  const isLineChart = chartType === 'line' || chartType === 'area' || chartType === 'area-stacked';
  const fileInputRef = useRef(null);

  // Track which data sections are expanded
  const [expandedDataSections, setExpandedDataSections] = useState({
    googleSheets: false,
    uploadCSV: false,
    pasteCSV: false,
    sampleData: false,
  });

  const toggleDataSection = (section) => {
    setExpandedDataSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Chart-specific labels (matching EditDataTable)
  const stageLabel = isLineChart ? 'Date' : (isBarChart ? 'Category' : 'Stage');
  const stageLabelPlural = isLineChart ? 'Dates' : (isBarChart ? 'Categories' : 'Stages');
  const periodLabel = isLineChart ? 'Metric' : (isBarChart ? 'Value' : 'Period');
  const periodLabelPlural = isLineChart ? 'Metrics' : (isBarChart ? 'Values' : 'Periods');
  const stageFieldName = isLineChart ? 'date' : (isBarChart ? 'Category' : 'Stage');

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      await chartData.loadCSVFile(file);
    }
  };

  const handleGoogleSheetsLoad = async () => {
    if (!googleSheetsUrl.trim()) {
      setGoogleSheetsError('Please enter a Google Sheets URL');
      return;
    }

    if (!isGoogleSheetsUrl(googleSheetsUrl)) {
      setGoogleSheetsError('Please enter a valid Google Sheets URL');
      return;
    }

    setGoogleSheetsLoading(true);
    setGoogleSheetsError('');

    try {
      const data = await loadGoogleSheetsData(googleSheetsUrl);

      // Convert array of objects to CSV text, then use existing CSV loader
      // This ensures we follow the same data processing pipeline as file uploads
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(row => Object.values(row).join(',')).join('\n');
      const csvText = headers + '\n' + rows;

      // Use the existing CSV text loader with 'google-sheets' source
      const success = await chartData.loadCSVText(csvText, ',', 'google-sheets');

      if (success) {
        // Store Google Sheets URL
        chartData.setGoogleSheetsUrl(googleSheetsUrl);

        setGoogleSheetsError('');
        // Don't clear URL or close panel - allow user to refresh or enable auto-refresh
      } else {
        setGoogleSheetsError('Failed to load data from Google Sheets');
      }
    } catch (error) {
      setGoogleSheetsError(error.message);
    } finally {
      setGoogleSheetsLoading(false);
    }
  };

  const handleGoogleSheetsRefresh = async () => {
    if (googleSheetsUrl.trim()) {
      await handleGoogleSheetsLoad();
    }
  };

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefreshEnabled || !googleSheetsUrl.trim()) {
      return;
    }

    const intervalMs = autoRefreshInterval * 60 * 1000; // Convert minutes to milliseconds
    const intervalId = setInterval(() => {
      handleGoogleSheetsRefresh();
    }, intervalMs);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefreshEnabled, autoRefreshInterval, googleSheetsUrl]);

  const handleSampleDataSelect = (event) => {
    const key = event.target.value;
    if (key) {
      chartData.loadSampleData(key);

      // Store the current sample dataset key
      setCurrentSampleDatasetKey(key);

      // Get the dataset
      const dataset = getSampleDataset(key);
      if (dataset) {
        // Load title and subtitle from the sample dataset
        if (dataset.title) styleSettings.setTitle(dataset.title);
        if (dataset.subtitle) styleSettings.setSubtitle(dataset.subtitle);

        // Load timeScale for line charts
        if (dataset.timeScale) styleSettings.setTimeScale(dataset.timeScale);

        // Apply style preset if available
        if (dataset.stylePreset) {
          applyStylePreset(dataset.stylePreset);
        }
      }

      event.target.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {/* Add-on Mode: Load Sheet Data Button */}
      {addon?.isAddonMode && (
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <DocumentTextIcon className="w-6 h-6 text-cyan-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Google Sheets Add-on
              </h3>
              <p className="text-xs text-gray-600 mb-3">
                Select data in your spreadsheet, then click the button below to load it into the chart editor.
              </p>
              <button
                onClick={() => {
                  addon.requestSheetData();
                  addon.logUsage('request_sheet_data', { chartType });
                }}
                className="w-full px-4 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <ArrowUpTrayIcon className="w-4 h-4" />
                Load Selected Data from Sheet
              </button>
              {addon.license && (
                <div className="mt-2 text-xs text-gray-500">
                  {addon.license.tier === 'free'
                    ? `Free Plan: ${addon.license.chartsRemaining || 0} charts remaining`
                    : `${addon.license.tier.charAt(0).toUpperCase() + addon.license.tier.slice(1)} Plan`}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Connect Google Sheets - Collapsible */}
      <CollapsibleSection
        title="Connect Google Sheets"
        isExpanded={expandedDataSections.googleSheets}
        onToggle={() => toggleDataSection('googleSheets')}
      >
        <div className="space-y-3">
          <div>
            <input
              type="text"
              value={googleSheetsUrl}
              onChange={(e) => setGoogleSheetsUrl(e.target.value)}
              placeholder="Paste Google Sheets URL here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Example: https://docs.google.com/spreadsheets/d/abc123.../edit
            </p>
          </div>

          {googleSheetsError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{googleSheetsError}</p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleGoogleSheetsLoad}
              disabled={googleSheetsLoading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {googleSheetsLoading ? 'Loading...' : 'Load Data'}
            </button>
            {googleSheetsUrl.trim() && (
              <button
                onClick={handleGoogleSheetsRefresh}
                disabled={googleSheetsLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                title="Refresh data from Google Sheets"
              >
                🔄
              </button>
            )}
          </div>

          {/* Auto-refresh controls */}
          {googleSheetsUrl.trim() && (
            <div className="p-3 bg-gray-50 rounded-lg space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoRefreshEnabled}
                  onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
                  className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Auto-refresh data
                </span>
              </label>
              {autoRefreshEnabled && (
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600">Every</label>
                  <select
                    value={autoRefreshInterval}
                    onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
                    className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="1">1 minute</option>
                    <option value="5">5 minutes</option>
                    <option value="10">10 minutes</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                  </select>
                </div>
              )}
            </div>
          )}

          <details className="text-xs text-gray-600">
            <summary className="cursor-pointer font-medium mb-1">
              📋 How to share your Google Sheet
            </summary>
            <div className="pl-4 mt-2 space-y-1 whitespace-pre-line">
              {getPublicSharingInstructions()}
            </div>
          </details>
        </div>
      </CollapsibleSection>

      {/* Upload CSV Data - Collapsible */}
      <CollapsibleSection
        title="Upload CSV Data"
        isExpanded={expandedDataSections.uploadCSV}
        onToggle={() => toggleDataSection('uploadCSV')}
      >
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 cursor-pointer"
          />
          <p className="text-xs text-gray-500">
            CSV should have a "{stageFieldName}" column and one or more {periodLabel.toLowerCase()} columns
          </p>
        </div>
      </CollapsibleSection>

      {/* Copy/Paste CSV Data - Collapsible */}
      <CollapsibleSection
        title="Copy/Paste CSV Data"
        isExpanded={expandedDataSections.pasteCSV}
        onToggle={() => toggleDataSection('pasteCSV')}
      >
        <div className="space-y-3">
          <textarea
            value={pastedCSV}
            onChange={(e) => setPastedCSV(e.target.value)}
            placeholder={
              isLineChart
                ? `Paste your CSV data here...\n\nExample (with month names):\nMonth,Revenue,Orders,Customers\nJan,1900000,850,420\nFeb,2000000,920,465\nMar,2300000,1050,531\n\nExample (with dates):\ndate,Revenue,Orders\n2024-01-01,28500,142\n2024-02-01,29800,151`
                : isSlopeChart
                ? `Paste your CSV data here...\n\nExample:\nStage,2023,2024\nEast Region,85000,92000\nWest Region,78000,88000\nNorth Region,62000,71000\nSouth Region,91000,98000\nCentral Region,73000,85000`
                : isBarChart
                ? `Paste your CSV data here...\n\nExample:\nCategory,Sales\nProduct A,245000\nProduct B,198000\nProduct C,312000\nProduct D,156000\nProduct E,287000`
                : `Paste your CSV data here...\n\nExample (Funnel):\nStage,Q1 2024,Q2 2024,Q3 2024,Q4 2024\nWebsite Visitors,125000,135000,142000,138000\nSign Ups,45000,48500,51200,49800\nFree Trial Users,28000,30200,31800,30900\nPaid Customers,12500,13800,14600,14200\nActive Users,9800,10900,11700,11400`
            }
            className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={handlePasteCSV}
              className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
            >
              Save Data
            </button>
            <button
              onClick={() => setPastedCSV('')}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Clear
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Supports comma, tab, semicolon, and space delimiters. Auto-detected automatically.
          </p>
        </div>
      </CollapsibleSection>

      {/* Load Sample Data - Collapsible */}
      <CollapsibleSection
        title="Load Sample Data"
        isExpanded={expandedDataSections.sampleData}
        onToggle={() => toggleDataSection('sampleData')}
      >
        <div>
          <select
            onChange={handleSampleDataSelect}
            defaultValue=""
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">Choose a sample...</option>
          {isSlopeChart ? (
            <>
              <optgroup label="AI Created - Data Stories">
                <option value="aiTechRevenue">AI Created - Tech Revenue Revolution</option>
                <option value="aiMarketBattle">AI Created - Market Share Shake-Up</option>
                <option value="aiWebsiteWin">AI Created - Digital Transformation Win</option>
              </optgroup>
              <optgroup label="Slope Charts">
                <option value="tufteSlope">Tufte Slope Chart - Government Receipts</option>
                <option value="slopeRevenue">Revenue by Product Line</option>
                <option value="slopeCustomerSatisfaction">Customer Satisfaction Scores</option>
                <option value="slopeEmployeeMetrics">Employee Engagement</option>
                <option value="slopeWebsiteMetrics">Website Performance</option>
                <option value="slopeMarketShare">Market Share Changes</option>
                <option value="slopeEducation">Student Test Scores</option>
                <option value="slopeHealthcare">Healthcare Quality Metrics</option>
              </optgroup>
            </>
          ) : isBarChart ? (
            <optgroup label="Bar Charts">
              <option value="barSimple">Simple Bar Chart</option>
              <option value="barRegionalSales">Sales Performance by Region</option>
              <option value="barMarketingChannels">Marketing Channel Performance</option>
              <option value="barProductRevenue">Product Category Revenue</option>
              <option value="barTeamPerformance">Team Performance Metrics</option>
              <option value="barCustomerAcquisition">Customer Acquisition by Source</option>
            </optgroup>
          ) : (chartType === 'line' || chartType === 'area' || chartType === 'area-stacked') ? (
            <>
              <optgroup label="Line Charts - Yearly">
                <option value="webTrafficYearly">Web Traffic (Yearly)</option>
              </optgroup>
              <optgroup label="Line Charts - Monthly">
                <option value="marketingChannelRevenue">Marketing Channel Revenue</option>
                <option value="salesMonthly">Online Sales (Monthly)</option>
                <option value="patientOutcomesMonthly">Patient Outcomes (Monthly)</option>
              </optgroup>
              <optgroup label="Line Charts - Daily">
                <option value="clothingRetail2Years">Online Clothing Retail (2 Years Daily)</option>
                <option value="ecommerceDailyH1">E-commerce Sales (Daily H1 2024)</option>
                <option value="serverMetricsDaily">Server Performance (Daily)</option>
                <option value="stockPricesDaily">Stock Prices (Daily)</option>
              </optgroup>
            </>
          ) : (
            <>
              <optgroup label="Time-Based">
                <option value="generic">Generic 5-Stage Flow</option>
                <option value="ecommerce">E-commerce Funnel</option>
                <option value="saas">SaaS Sales Funnel</option>
                <option value="marketing">Marketing Campaign</option>
                <option value="content">Content/Media Funnel</option>
                <option value="mobileApp">Mobile App Funnel</option>
                <option value="b2bLeads">B2B Lead Generation</option>
              </optgroup>
              <optgroup label="Comparison">
                <option value="ageComparison">Age Group Comparison</option>
                <option value="abTest">A/B Test Comparison</option>
                <option value="deviceComparison">Device Comparison</option>
                <option value="channelComparison">Channel Comparison</option>
                <option value="timeComparison">Weekday vs Weekend</option>
              </optgroup>
            </>
          )}
        </select>
        </div>
      </CollapsibleSection>

      {/* Error Display */}
      {chartData.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {chartData.error}
        </div>
      )}

      {/* Separator */}
      <div className="border-t-2 border-gray-300 my-4"></div>

      {/* Data Summary - Always Visible */}
      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 space-y-2">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-gray-900">Data Summary</h3>
          {chartData.hasData && (
            <button
              onClick={onEditData}
              className="px-4 py-2 bg-cyan-600 text-white font-medium text-sm rounded-lg hover:bg-cyan-700 transition-colors"
            >
              Edit Data
            </button>
          )}
        </div>
        {chartData.hasData ? (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Data Source:</span>
              <span className="font-medium text-gray-900">
                {googleSheetsUrl.trim() ? 'Google Sheets' : 'CSV Data'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{stageLabelPlural}:</span>
              <span className="font-medium">{chartData.stageCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{periodLabelPlural}:</span>
              <span className="font-medium">{chartData.periodCount}</span>
            </div>
            {!isBarChart && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Mode:</span>
                <span className={`font-medium ${chartData.isComparisonMode ? 'text-cyan-600' : 'text-blue-600'}`}>
                  {chartData.isComparisonMode ? 'Comparison' : 'Time-Based'}
                </span>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-500 italic">No data loaded</p>
        )}
      </div>

      {/* Data Preview (Read-Only) */}
      {chartData.hasData && chartData.data && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-gray-900">Data Preview</h3>
            <p className="text-xs text-gray-500">
              Read-only preview
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto max-h-96">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {stageLabel}
                    </th>
                    {chartData.periodNames.map((period, index) => (
                      <th
                        key={index}
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {period}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {chartData.data.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-900">
                        {row[stageFieldName]}
                      </td>
                      {chartData.periodNames.map((period, colIndex) => (
                        <td key={colIndex} className="px-3 py-2 whitespace-nowrap text-gray-700">
                          {row[period]?.toLocaleString() || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Edit Data Table Component (for flip card)
 */
function EditDataTable({ chartData, chartType, onClose }) {
  const [newPeriodName, setNewPeriodName] = useState('');
  const [newStageName, setNewStageName] = useState('');

  // Detect if we're using flattened grouped-stacked format (Datawrapper style)
  const isFlattenedGroupedStacked = chartData.editableData.length > 0 &&
    chartData.editableData[0].hasOwnProperty('Period') &&
    Object.keys(chartData.editableData[0]).some(key => key !== 'Period' && key.includes(' - '));

  // Chart-specific labels
  const isBarChart = chartType?.startsWith('bar-');
  const isLineChart = chartType === 'line' || chartType === 'area' || chartType === 'area-stacked';

  // For flattened format, rows are Periods and columns are "Group - Value" combinations
  // For regular format, rows are Stage/Category/Date and columns are period/metric names
  const stageLabel = isFlattenedGroupedStacked ? 'Period' : (isLineChart ? 'Date' : (isBarChart ? 'Category' : 'Stage'));
  const periodLabel = isFlattenedGroupedStacked ? 'Series' : (isLineChart ? 'Metric' : (isBarChart ? 'Value' : 'Period'));
  const stageFieldName = isFlattenedGroupedStacked ? 'Period' : (isLineChart ? 'date' : (isBarChart ? 'Category' : 'Stage'));

  // For flattened format, "periods" are actually the Group-Value column names
  const columnNames = isFlattenedGroupedStacked
    ? (chartData.editableData.length > 0 ? Object.keys(chartData.editableData[0]).filter(key => key !== 'Period') : [])
    : chartData.periodNames;

  const [draggedColumn, setDraggedColumn] = useState(null);
  const [draggedRow, setDraggedRow] = useState(null);

  const handleAddPeriod = () => {
    if (newPeriodName.trim()) {
      if (chartData.addPeriod(newPeriodName.trim())) {
        setNewPeriodName('');
      }
    }
  };

  const handleAddStage = () => {
    if (newStageName.trim()) {
      if (chartData.addStage(newStageName.trim(), stageFieldName)) {
        setNewStageName('');
      }
    }
  };

  const handleColumnDragStart = (e, index) => {
    setDraggedColumn(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColumnDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleColumnDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedColumn !== null && draggedColumn !== dropIndex) {
      chartData.reorderPeriods(draggedColumn, dropIndex);
    }
    setDraggedColumn(null);
  };

  const handleRowDragStart = (e, index) => {
    setDraggedRow(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleRowDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleRowDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedRow !== null && draggedRow !== dropIndex) {
      chartData.reorderStages(draggedRow, dropIndex);
    }
    setDraggedRow(null);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Edit Data</h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              chartData.applyEdits();
              onClose();
            }}
            className="px-4 py-2 bg-cyan-600 text-white text-sm font-semibold rounded-lg hover:bg-cyan-700"
          >
            Apply Changes
          </button>
          <button
            onClick={chartData.resetEdits}
            className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-300"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Add Period Input */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={newPeriodName}
          onChange={(e) => setNewPeriodName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddPeriod()}
          placeholder={`New ${periodLabel.toLowerCase()} name...`}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <button
          onClick={handleAddPeriod}
          className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700"
        >
          + {periodLabel}
        </button>
      </div>

      {/* Data Table */}
      <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-auto h-full">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                  {stageLabel}
                </th>
                {columnNames.map((columnName, idx) => (
                  <th
                    key={idx}
                    draggable={!isFlattenedGroupedStacked}
                    onDragStart={(e) => !isFlattenedGroupedStacked && handleColumnDragStart(e, idx)}
                    onDragOver={!isFlattenedGroupedStacked && handleColumnDragOver}
                    onDrop={(e) => !isFlattenedGroupedStacked && handleColumnDrop(e, idx)}
                    className={`px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${!isFlattenedGroupedStacked ? 'cursor-move hover:bg-gray-100' : ''}`}
                  >
                    {isFlattenedGroupedStacked ? (
                      // For flattened format, just show the column name (Group - Value)
                      <div className="font-medium">{columnName}</div>
                    ) : (
                      // For regular format, show editable period name with controls
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={columnName}
                            onChange={(e) => chartData.updatePeriodName(columnName, e.target.value)}
                            className="bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded px-1 flex-1"
                          />
                          <button
                            onClick={() => chartData.removePeriod(columnName)}
                            className="text-red-600 hover:text-red-800 font-bold"
                            title="Delete column"
                          >
                            ×
                          </button>
                        </div>
                        <div className="flex gap-1 items-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              chartData.sortByPeriod(columnName, false);
                            }}
                            className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                            title="Sort descending"
                          >
                            ↓
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              chartData.sortByPeriod(columnName, true);
                            }}
                            className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                            title="Sort ascending"
                          >
                            ↑
                          </button>
                          <label className="flex items-center gap-1 ml-2" title="Hide this metric">
                            <input
                              type="checkbox"
                              checked={chartData.hiddenPeriods?.has(columnName) || false}
                              onChange={(e) => {
                                e.stopPropagation();
                                chartData.togglePeriodHidden(columnName, e.target.checked);
                              }}
                              className="w-3 h-3 text-cyan-600 focus:ring-cyan-500 rounded"
                            />
                            <span className="text-xs text-gray-500">Hide</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </th>
                ))}
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  Hide
                </th>
                <th className="px-3 py-2 w-16"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {chartData.editableData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  draggable
                  onDragStart={(e) => handleRowDragStart(e, rowIndex)}
                  onDragOver={handleRowDragOver}
                  onDrop={(e) => handleRowDrop(e, rowIndex)}
                  className="hover:bg-gray-50 cursor-move"
                >
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={row[stageFieldName] || ''}
                      onChange={(e) => chartData.updateStageName(rowIndex, e.target.value, stageFieldName)}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </td>
                  {columnNames.map((columnName, colIndex) => (
                    <td key={colIndex} className="px-3 py-2">
                      <input
                        type="number"
                        value={row[columnName] || 0}
                        onChange={(e) => chartData.updateDataValue(rowIndex, columnName, parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </td>
                  ))}
                  <td className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={row.hidden || false}
                      onChange={(e) => chartData.toggleStageHidden(rowIndex, e.target.checked)}
                      className="w-4 h-4 text-cyan-600 focus:ring-cyan-500 rounded"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => chartData.removeStage(rowIndex)}
                      className="text-red-600 hover:text-red-800 font-bold text-lg"
                      title="Delete row"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Stage Input */}
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={newStageName}
          onChange={(e) => setNewStageName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddStage()}
          placeholder={`New ${stageLabel.toLowerCase()} name...`}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <button
          onClick={handleAddStage}
          className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700"
        >
          + {stageLabel}
        </button>
      </div>
    </div>
  );
}

/**
 * Collapsible Section Component
 */
function CollapsibleSection({ title, isExpanded, onToggle, children }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left font-medium text-sm text-gray-900"
      >
        <span>{title}</span>
        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {isExpanded && (
        <div className="px-3 py-3 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}
