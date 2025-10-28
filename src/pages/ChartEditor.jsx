import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChartData } from '../shared/hooks/useChartData';
import { useStyleSettings } from '../shared/hooks/useStyleSettings';
import { getChart } from '../charts/registry';
import { colorPresets, comparisonPalettes } from '../shared/design-system/colorPalettes';
import { exportAsPNG, exportAsSVG } from '../shared/utils/exportHelpers';
import { downloadStyleFile, uploadStyleFile, generateStyleName } from '../shared/utils/styleUtils';
import FunnelChart from '../charts/FunnelChart/FunnelChart';
import SlopeChart from '../charts/SlopeChart/SlopeChart';
import BarChart from '../charts/BarChart/BarChart';

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
  const [showDataTable, setShowDataTable] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    chartType: true,
    chartSettings: true,
    barEmphasis: false,
    axisOptions: false,
    typography: false,
    colors: false,
    background: false,
    layout: false,
    displayOptions: false,
    sparklines: false,
    watermark: false,
  });

  const chartData = useChartData(chartType);
  const styleSettings = useStyleSettings();
  const svgRef = useRef(null);
  const exportMenuRef = useRef(null);
  const styleFileInputRef = useRef(null);

  // Save Style modal state
  const [showSaveStyleModal, setShowSaveStyleModal] = useState(false);
  const [styleName, setStyleName] = useState('');

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

    // If this bar is already emphasized, clear ALL emphasis
    if (currentEmphasized.includes(barId)) {
      styleSettings.setEmphasizedBars([]);
    } else {
      // Add this bar to emphasis (max 3 bars)
      if (currentEmphasized.length < 3) {
        styleSettings.setEmphasizedBars([...currentEmphasized, barId]);
      } else {
        // If already 3 bars, replace the oldest one
        styleSettings.setEmphasizedBars([currentEmphasized[1], currentEmphasized[2], barId]);
      }
    }
  }, [styleSettings]);

  // Load default sample data on mount
  useEffect(() => {
    if (!chartData.hasData) {
      // Load appropriate sample data based on chart type
      let sampleDataKey;
      if (chartType === 'slope') {
        sampleDataKey = 'slopeDefault';
      } else if (chartType === 'bar') {
        sampleDataKey = 'barSimple';
      } else {
        sampleDataKey = 'mobileApp';
      }
      chartData.loadSampleData(sampleDataKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartType]);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    const svgElement = document.querySelector('svg');
    if (svgElement) {
      await exportAsPNG(svgElement, `${styleSettings.title}.png`);
    }
    setShowExportMenu(false);
  };

  const handleExportSVG = () => {
    const svgElement = document.querySelector('svg');
    if (svgElement) {
      exportAsSVG(svgElement, `${styleSettings.title}.svg`);
    }
    setShowExportMenu(false);
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

  // Create settings object for chart component
  const chartStyleSettings = {
    title: styleSettings.title,
    subtitle: styleSettings.subtitle,
    titleAlignment: styleSettings.titleAlignment,
    fontFamily: styleSettings.fontFamily,
    titleFontSize: styleSettings.titleFontSize,
    subtitleFontSize: styleSettings.subtitleFontSize,
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
    canvasWidth: styleSettings.canvasWidth,
    canvasHeight: styleSettings.canvasHeight,
    chartPadding: styleSettings.chartPadding,
    stageGap: styleSettings.stageGap,
    stageLabelPosition: styleSettings.stageLabelPosition,
    axisLineWidth: chartType === 'slope' ? styleSettings.slopeAxisLineWidth : styleSettings.axisLineWidth,
    backgroundOpacity: styleSettings.backgroundOpacity,
    emphasis: styleSettings.emphasis,
    metricEmphasis: styleSettings.metricEmphasis,
    normalizeToHundred: styleSettings.normalizeToHundred,
    compactNumbers: styleSettings.compactNumbers,
    showLegend: styleSettings.showLegend,
    legendPosition: styleSettings.legendPosition,
    inStageLabelFontSize: styleSettings.inStageLabelFontSize,
    showSparklines: styleSettings.showSparklines,
    sparklineType: styleSettings.sparklineType,
    userTier: styleSettings.userTier,

    // Slope Chart specific settings
    colorMode: styleSettings.colorMode,
    lineThickness: styleSettings.lineThickness,
    lineOpacity: styleSettings.lineOpacity,
    lineSaturation: styleSettings.lineSaturation,
    endpointSize: styleSettings.endpointSize,
    endpointStyle: styleSettings.endpointStyle,
    labelPosition: styleSettings.labelPosition,
    showCategoryLabels: styleSettings.showCategoryLabels,
    showValueLabels: styleSettings.showValueLabels,
    labelFormat: styleSettings.labelFormat,
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
    periodHeight: styleSettings.periodHeight || 700, // Controls vertical spacing of chart content
    marginTop: 60,
    marginRight: 160,
    marginBottom: 140,
    marginLeft: 160,

    // Visual for Slope Chart
    backgroundColor: styleSettings.darkMode ? '#1f2937' : '#ffffff',
    showAxisLines: true,
    periodSpacing: styleSettings.periodSpacing,
    axisLineColor: styleSettings.darkMode ? '#6b7280' : styleSettings.slopeAxisLineColor,
    axisLineStyle: styleSettings.slopeAxisLineStyle,
    axisEnds: styleSettings.axisEnds,
    darkMode: styleSettings.darkMode,

    // Bar Chart specific settings
    barMode: styleSettings.barMode,
    labelMode: styleSettings.labelMode,
    directLabelContent: styleSettings.directLabelContent,
    emphasizedBars: styleSettings.emphasizedBars,
    colorPalette: styleSettings.comparisonPalette,
    customColors: styleSettings.userCustomColors,
    categoryWeight: 500,
    valueWeight: 600,
    axisFont: styleSettings.fontFamily,
    xAxisFontSize: styleSettings.xAxisFontSize,
    yAxisFontSize: styleSettings.yAxisFontSize,
    axisLabel: styleSettings.axisLabel,
    axisLabelFontSize: styleSettings.axisLabelFontSize,
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
    compactAxisNumbers: styleSettings.compactAxisNumbers,
    setCalculatedAxisMinimum: styleSettings.setCalculatedAxisMinimum,
    setCalculatedAxisMaximum: styleSettings.setCalculatedAxisMaximum,
    setCalculatedAxisMajorUnit: styleSettings.setCalculatedAxisMajorUnit,
    showGrid: true,
    gridOpacity: 0.1,
    showXAxis: true,
    showYAxis: true,
    axisColor: '#000000',
    axisOpacity: 1,
    barPadding: 0.2,
    groupPadding: styleSettings.stageGap / 100,
    barOpacity: 1,
    barBorderWidth: 0,
    barBorderColor: '#ffffff',
    chartHeight: styleSettings.chartHeight || 400,
    chartWidth: styleSettings.chartWidth || 600,
  };

  // Render chart component based on type
  const renderChart = () => {
    if (!chartData.hasData) return null;

    switch (chartType) {
      case 'funnel':
        return (
          <FunnelChart
            data={chartData.data}
            periodNames={chartData.periodNames}
            isComparisonMode={chartData.isComparisonMode}
            styleSettings={chartStyleSettings}
          />
        );
      case 'slope':
        return (
          <SlopeChart
            data={chartData.data}
            periodNames={chartData.periodNames}
            styleSettings={chartStyleSettings}
            onLineClick={handleSlopeLineClick}
          />
        );
      case 'bar':
        return (
          <BarChart
            data={chartData.data}
            periodNames={chartData.periodNames}
            styleSettings={chartStyleSettings}
            onBarClick={handleBarClick}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Top Header - Fixed */}
      <div className="bg-white border-b border-gray-200 shadow-sm z-10 flex-shrink-0">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center gap-2"
            >
              ← Back to Gallery
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{chart.name}</h1>
              <p className="text-sm text-gray-500">{chart.description}</p>
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

            {/* Export Menu */}
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
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    disabled
                    className="w-full px-4 py-2 text-left text-gray-400 cursor-not-allowed flex items-center gap-2"
                  >
                    <span>💻</span> Export D3 Code (Soon)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Two Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chart Display Area - Fixed, No Scroll */}
        <div className="flex-1 flex items-center justify-center overflow-hidden p-8">
          {chartData.hasData ? (
            <div className="flex flex-col items-center gap-4 flex-shrink-0">
              {/* Action Buttons - Fixed above chart */}
              <div className="flex justify-center gap-4 flex-shrink-0">
                <button
                  onClick={styleSettings.resetToDefaults}
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
                  width: chartStyleSettings.canvasWidth + chartStyleSettings.chartPadding * 2,
                  height: chartStyleSettings.canvasHeight + chartStyleSettings.chartPadding * 2,
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
                    className="absolute inset-0 bg-white rounded-2xl shadow-lg border border-gray-200"
                    style={{
                      backfaceVisibility: 'hidden',
                      padding: chartStyleSettings.chartPadding + 'px',
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
              </div>
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
          <div className="w-96 bg-white border-l border-gray-200 flex flex-col flex-shrink-0 shadow-lg overflow-hidden">
            {/* Tab Navigation - Fixed at top */}
            <div className="flex border-b border-gray-200 flex-shrink-0">
              <button
                onClick={() => setActiveTab('style')}
                className={`flex-1 px-4 py-3 font-medium transition-colors ${
                  activeTab === 'style'
                    ? 'text-cyan-600 border-b-2 border-cyan-600 bg-cyan-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Style
              </button>
              <button
                onClick={() => setActiveTab('data')}
                className={`flex-1 px-4 py-3 font-medium transition-colors ${
                  activeTab === 'data'
                    ? 'text-cyan-600 border-b-2 border-cyan-600 bg-cyan-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Data
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Style Tab Content */}
              {activeTab === 'style' && (
                <StyleTabContent
                  styleSettings={styleSettings}
                  expandedSections={expandedSections}
                  toggleSection={toggleSection}
                  chartData={chartData}
                  chartType={chartType}
                  onSaveStyle={handleSaveStyle}
                  onImportStyle={handleImportStyle}
                />
              )}

              {/* Data Tab Content */}
              {activeTab === 'data' && (
                <DataTabContent
                  chartData={chartData}
                  chartType={chartType}
                />
              )}
            </div>
          </div>
        )}
      </div>

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
    </div>
  );
}

/**
 * Style Tab Component
 */
function StyleTabContent({ styleSettings, expandedSections, toggleSection, chartData, chartType, onSaveStyle, onImportStyle }) {
  const isSlopeChart = chartType === 'slope';
  const isBarChart = chartType === 'bar';

  return (
    <div className="space-y-4">
      {/* Chart Type Section - Only for Funnel Chart */}
      {!isSlopeChart && !isBarChart && (
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
              onChange={(e) => styleSettings.setOrientation(e.target.value)}
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

      {/* Slope Chart Specific Sections */}
      {isSlopeChart && (
        <>
          {/* Theme Section for Dark Mode */}
          <CollapsibleSection
            title="Theme"
            isExpanded={expandedSections.theme}
            onToggle={() => toggleSection('theme')}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chart Background
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => styleSettings.setDarkMode(false)}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      !styleSettings.darkMode
                        ? 'bg-white text-gray-900 border-2 border-gray-400 shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                    }`}
                  >
                    Light Mode
                  </button>
                  <button
                    onClick={() => styleSettings.setDarkMode(true)}
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
            </div>
          </CollapsibleSection>

          {/* Color Mode Section for Slope Chart */}
          <CollapsibleSection
            title="Color Mode"
            isExpanded={expandedSections.colorMode}
            onToggle={() => toggleSection('colorMode')}
          >
            <div className="space-y-4">
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
                        className="w-16 h-10 rounded-lg cursor-pointer border border-gray-300"
                      />
                      <input
                        type="text"
                        value={styleSettings.increaseColor}
                        onChange={(e) => styleSettings.setIncreaseColor(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
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
                        className="w-16 h-10 rounded-lg cursor-pointer border border-gray-300"
                      />
                      <input
                        type="text"
                        value={styleSettings.decreaseColor}
                        onChange={(e) => styleSettings.setDecreaseColor(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
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
                        className="w-16 h-10 rounded-lg cursor-pointer border border-gray-300"
                      />
                      <input
                        type="text"
                        value={styleSettings.noChangeColor}
                        onChange={(e) => styleSettings.setNoChangeColor(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
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
                        className="w-16 h-10 rounded-lg cursor-pointer border border-gray-300"
                      />
                      <input
                        type="text"
                        value={styleSettings.startColor}
                        onChange={(e) => styleSettings.setStartColor(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
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
                        className="w-16 h-10 rounded-lg cursor-pointer border border-gray-300"
                      />
                      <input
                        type="text"
                        value={styleSettings.endColor}
                        onChange={(e) => styleSettings.setEndColor(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
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
                  <label className="block text-sm font-medium text-gray-700 mb-3">
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

          {/* Labels Section for Slope Chart */}
          <CollapsibleSection
            title="Labels"
            isExpanded={expandedSections.labels}
            onToggle={() => toggleSection('labels')}
          >
            <div className="space-y-4">
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
              )}
            </div>
          </CollapsibleSection>

          {/* Line Styling Section for Slope Chart */}
          <CollapsibleSection
            title="Line Styling"
            isExpanded={expandedSections.lineStyling}
            onToggle={() => toggleSection('lineStyling')}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Line Thickness: {styleSettings.lineThickness}px
                </label>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={styleSettings.lineThickness}
                  onChange={(e) => styleSettings.setLineThickness(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Line Saturation: {styleSettings.lineSaturation}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={styleSettings.lineSaturation}
                  onChange={(e) => styleSettings.setLineSaturation(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  100% = Full vibrant colors, 0% = Grey
                </p>
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
                  onChange={(e) => styleSettings.setEndpointSize(Number(e.target.value))}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Period Spacing: {styleSettings.periodSpacing}px
                </label>
                <input
                  type="range"
                  min="100"
                  max="600"
                  value={styleSettings.periodSpacing}
                  onChange={(e) => styleSettings.setPeriodSpacing(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Distance between the two vertical axis lines
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Period Height: {styleSettings.periodHeight}px
                </label>
                <input
                  type="range"
                  min="200"
                  max="1200"
                  step="50"
                  value={styleSettings.periodHeight}
                  onChange={(e) => styleSettings.setPeriodHeight(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Vertical spacing of chart content
                </p>
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
                    className="w-16 h-10 rounded-lg cursor-pointer border border-gray-300"
                  />
                  <input
                    type="text"
                    value={styleSettings.slopeAxisLineColor}
                    onChange={(e) => styleSettings.setSlopeAxisLineColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
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

          {/* Line Emphasis Section for Slope Chart */}
          <CollapsibleSection
            title="Line Emphasis"
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
        </>
      )}

      {/* Bar Chart Specific Sections */}
      {isBarChart && (
        <>
          {/* Bar Chart Settings */}
          <CollapsibleSection
            title="Chart Settings"
            isExpanded={expandedSections.chartSettings}
            onToggle={() => toggleSection('chartSettings')}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Orientation
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => styleSettings.setOrientation('vertical')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      styleSettings.orientation === 'vertical'
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Vertical
                  </button>
                  <button
                    onClick={() => styleSettings.setOrientation('horizontal')}
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
                  Bar Display Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => styleSettings.setBarMode('grouped')}
                    className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                      styleSettings.barMode === 'grouped'
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Grouped
                  </button>
                  <button
                    onClick={() => styleSettings.setBarMode('stacked')}
                    className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                      styleSettings.barMode === 'stacked'
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Stacked
                  </button>
                  <button
                    onClick={() => styleSettings.setBarMode('grouped-stacked')}
                    className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                      styleSettings.barMode === 'grouped-stacked'
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Grouped+Stacked
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {styleSettings.barMode === 'grouped'
                    ? 'Display bars side by side for each category'
                    : styleSettings.barMode === 'stacked'
                    ? 'Stack bars on top of each other for cumulative values'
                    : 'Group categories with stacked bars (Pew Research style)'}
                </p>
              </div>
            </div>
          </CollapsibleSection>

          {/* Bar Emphasis Section for Bar Chart */}
          <CollapsibleSection
            title="Bar Emphasis"
            isExpanded={expandedSections.barEmphasis}
            onToggle={() => toggleSection('barEmphasis')}
          >
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Click on bars in the chart to emphasize them (up to 3 bars). Click an emphasized bar to clear all selections.
              </p>

              {styleSettings.emphasizedBars && styleSettings.emphasizedBars.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">
                    Selected Bars ({styleSettings.emphasizedBars.length}/3):
                  </div>
                  <div className="space-y-1">
                    {styleSettings.emphasizedBars.map((barId, index) => (
                      <div
                        key={barId}
                        className="flex items-center gap-2 px-3 py-2 bg-cyan-50 rounded-lg border border-cyan-200"
                      >
                        <span className="flex-1 text-sm text-gray-700 font-medium">
                          {barId}
                        </span>
                        <button
                          onClick={() => {
                            const newEmphasized = styleSettings.emphasizedBars.filter(id => id !== barId);
                            styleSettings.setEmphasizedBars(newEmphasized);
                          }}
                          className="text-cyan-600 hover:text-cyan-800 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => styleSettings.setEmphasizedBars([])}
                    className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic">
                  No bars selected. Click on bars in the chart to emphasize them.
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Axis Options Section */}
          <CollapsibleSection
            title="Axis Options"
            isExpanded={expandedSections.axisOptions}
            onToggle={() => toggleSection('axisOptions')}
          >
            <div className="space-y-4">
              {/* Bounds */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-800">Bounds</h4>

                <div className="flex items-center gap-2">
                  <label className="flex-1 text-sm font-medium text-gray-700">
                    Minimum
                  </label>
                  <input
                    type="number"
                    value={styleSettings.axisMinimumAuto ? styleSettings.calculatedAxisMinimum : styleSettings.axisMinimum}
                    onChange={(e) => {
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
                  <label className="flex-1 text-sm font-medium text-gray-700">
                    Maximum
                  </label>
                  <input
                    type="number"
                    value={styleSettings.axisMaximumAuto ? styleSettings.calculatedAxisMaximum : styleSettings.axisMaximum}
                    onChange={(e) => {
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
                <h4 className="text-sm font-semibold text-gray-800">Units</h4>

                <div className="flex items-center gap-2">
                  <label className="flex-1 text-sm font-medium text-gray-700">
                    Major
                  </label>
                  <input
                    type="number"
                    value={styleSettings.axisMajorUnitAuto ? styleSettings.calculatedAxisMajorUnit : styleSettings.axisMajorUnit}
                    onChange={(e) => {
                      styleSettings.setAxisMajorUnit(Number(e.target.value));
                      if (styleSettings.axisMajorUnitAuto) {
                        styleSettings.setAxisMajorUnitAuto(false);
                      }
                    }}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
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
                  <label className="flex-1 text-sm font-medium text-gray-700">
                    Minor
                  </label>
                  <input
                    type="number"
                    value={styleSettings.axisMinorUnit}
                    onChange={(e) => styleSettings.setAxisMinorUnit(Number(e.target.value))}
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
                <h4 className="text-sm font-semibold text-gray-800">Tick Marks</h4>

                <div className="flex items-center gap-2">
                  <label className="flex-1 text-sm font-medium text-gray-700">
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
                  <label className="flex-1 text-sm font-medium text-gray-700">
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
                <h4 className="text-sm font-semibold text-gray-800">Gridlines</h4>

                <div className="flex items-center gap-2">
                  <label className="flex-1 text-sm font-medium text-gray-700">
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
                  <label className="flex-1 text-sm font-medium text-gray-700">
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

              {/* Compact Numbers */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-800">Compact Numbers</h4>

                <div className="flex items-center gap-2">
                  <label className="flex-1 text-sm font-medium text-gray-700">
                    Display axis values in compact format (e.g., 1.5K instead of 1500)
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
            </div>
          </CollapsibleSection>
        </>
      )}

      {/* Typography Section */}
      <CollapsibleSection
        title="Typography"
        isExpanded={expandedSections.typography}
        onToggle={() => toggleSection('typography')}
      >
        <div className="space-y-4">
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

      {/* Colors Section - For Funnel Chart and Bar Chart */}
      {!isSlopeChart && (
        <CollapsibleSection
          title="Colors"
          isExpanded={expandedSections.colors}
          onToggle={() => toggleSection('colors')}
        >
          <div className="space-y-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-3">
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
                    className="w-16 h-10 rounded-lg cursor-pointer border border-gray-300"
                  />
                  <input
                    type="text"
                    value={styleSettings.barColor}
                    onChange={(e) => styleSettings.setBarColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Transition: {styleSettings.colorTransition}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={styleSettings.colorTransition}
                  onChange={(e) => styleSettings.setColorTransition(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Controls the gradient intensity from dark to light across periods
                </p>
              </div>
            </>
          )}
          </div>
        </CollapsibleSection>
      )}

      {/* Background Section - Only for Funnel Chart */}
      {!isSlopeChart && (
        <CollapsibleSection
          title="Background"
          isExpanded={expandedSections.background}
          onToggle={() => toggleSection('background')}
        >
          <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background Opacity: {styleSettings.backgroundOpacity}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={styleSettings.backgroundOpacity}
              onChange={(e) => styleSettings.setBackgroundOpacity(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Controls the grey background fill behind bars
            </p>
          </div>
          </div>
        </CollapsibleSection>
      )}

      {/* Layout Section */}
      <CollapsibleSection
        title="Layout"
        isExpanded={expandedSections.layout}
        onToggle={() => toggleSection('layout')}
      >
        <div className="space-y-4">
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
              onChange={(e) => styleSettings.setCanvasWidth(Number(e.target.value))}
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
              onChange={(e) => styleSettings.setCanvasHeight(Number(e.target.value))}
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
                  onChange={(e) => styleSettings.setChartWidth(Number(e.target.value))}
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
                  onChange={(e) => styleSettings.setChartHeight(Number(e.target.value))}
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

          {!isSlopeChart && !isBarChart && (
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

      {/* Display Options Section - Only for Funnel Chart */}
      {!isSlopeChart && (
        <CollapsibleSection
          title="Display Options"
          isExpanded={expandedSections.displayOptions}
          onToggle={() => toggleSection('displayOptions')}
        >
          <div className="space-y-4">
          {isBarChart ? (
            <>
              {/* Bar Chart Display Options */}
              {/* Label Mode Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Legend Labels
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
                  <button
                    onClick={() => styleSettings.setLabelMode('off')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      styleSettings.labelMode === 'off'
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Off
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {styleSettings.labelMode === 'legend'
                    ? 'Show a separate legend above or below the chart'
                    : styleSettings.labelMode === 'direct'
                    ? 'Display labels directly on or near the bars'
                    : 'No labels shown (labels appear on emphasized bars only)'}
                </p>
              </div>

              {/* Legend Position (only shown when labelMode is 'legend') */}
              {styleSettings.labelMode === 'legend' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Legend Position
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
                      Above
                    </button>
                    <button
                      onClick={() => styleSettings.setLegendPosition('below')}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        styleSettings.legendPosition === 'below'
                          ? 'bg-cyan-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Below
                    </button>
                  </div>
                </div>
              )}

              {/* Direct Label Content (only shown when labelMode is 'direct') */}
              {styleSettings.labelMode === 'direct' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Label Content
                  </label>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => styleSettings.setDirectLabelContent('metrics')}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        styleSettings.directLabelContent === 'metrics'
                          ? 'bg-cyan-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Metrics Only
                    </button>
                    <button
                      onClick={() => styleSettings.setDirectLabelContent('metrics-category')}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        styleSettings.directLabelContent === 'metrics-category'
                          ? 'bg-cyan-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Metric & Period
                    </button>
                    <button
                      onClick={() => styleSettings.setDirectLabelContent('category')}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        styleSettings.directLabelContent === 'category'
                          ? 'bg-cyan-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Category Only
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {styleSettings.directLabelContent === 'metrics' && 'Show only metric values (e.g., "1250")'}
                    {styleSettings.directLabelContent === 'metrics-category' && 'Show metric value and period stacked (e.g., "12.5K" above "Jan")'}
                    {styleSettings.directLabelContent === 'category' && 'Show only category names (e.g., "Shirts")'}
                  </p>
                </div>
              )}

              {/* Compact Numbers */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={styleSettings.compactNumbers}
                  onChange={(e) => styleSettings.setCompactNumbers(e.target.checked)}
                  className="w-4 h-4 text-cyan-600 rounded"
                />
                <span className="text-sm text-gray-700">Compact Numbers (1K, 1M)</span>
              </label>
            </>
          ) : (
            <>
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

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={styleSettings.compactNumbers}
                  onChange={(e) => styleSettings.setCompactNumbers(e.target.checked)}
                  className="w-4 h-4 text-cyan-600 rounded"
                />
                <span className="text-sm text-gray-700">Compact Numbers (1K, 1M)</span>
              </label>

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
            </>
          )}
          </div>
        </CollapsibleSection>
      )}

      {/* Sparklines Section - Only for Funnel Chart */}
      {!isSlopeChart && !isBarChart && (
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

      {/* Watermark Section */}
      <CollapsibleSection
        title="Watermark"
        isExpanded={expandedSections.watermark}
        onToggle={() => toggleSection('watermark')}
      >
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Tier
            </label>
            <select
              value={styleSettings.userTier}
              onChange={(e) => styleSettings.setUserTier(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="pro">Pro (No Watermark)</option>
              <option value="free">Free (With Watermark)</option>
            </select>
          </div>
          <p className="text-xs text-gray-500">
            Free tier shows a "Find&Tell" watermark on the chart
          </p>
        </div>
      </CollapsibleSection>

      {/* Style Management Buttons */}
      <div className="pt-4 border-t border-gray-200">
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
function DataTabContent({ chartData, chartType }) {
  const isSlopeChart = chartType === 'slope';
  const isBarChart = chartType === 'bar';
  const fileInputRef = useRef(null);

  // Chart-specific labels (matching EditDataTable)
  const stageLabel = isBarChart ? 'Category' : 'Stage';
  const periodLabel = isBarChart ? 'Value' : 'Period';
  const periodLabelPlural = isBarChart ? 'Values' : 'Periods';
  const stageFieldName = isBarChart ? 'Category' : 'Stage';

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      await chartData.loadCSVFile(file);
    }
  };

  const handleSampleDataSelect = (event) => {
    const key = event.target.value;
    if (key) {
      chartData.loadSampleData(key);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload CSV Data
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 cursor-pointer"
        />
        <p className="text-xs text-gray-500 mt-1">
          CSV should have a "{stageFieldName}" column and one or more {periodLabel.toLowerCase()} columns
        </p>
      </div>

      {/* Sample Data Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Or Load Sample Data
        </label>
        <select
          onChange={handleSampleDataSelect}
          defaultValue=""
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="">Choose a sample...</option>
          {isSlopeChart ? (
            <optgroup label="Slope Charts">
              <option value="slopeRevenue">Revenue by Product Line</option>
              <option value="slopeCustomerSatisfaction">Customer Satisfaction Scores</option>
              <option value="slopeEmployeeMetrics">Employee Engagement</option>
              <option value="slopeWebsiteMetrics">Website Performance</option>
              <option value="slopeMarketShare">Market Share Changes</option>
              <option value="slopeEducation">Student Test Scores</option>
              <option value="slopeHealthcare">Healthcare Quality Metrics</option>
            </optgroup>
          ) : isBarChart ? (
            <optgroup label="Bar Charts">
              <option value="barSimple">Simple Bar Chart</option>
              <option value="barRegionalSales">Sales Performance by Region</option>
              <option value="barMarketingChannels">Marketing Channel Performance</option>
              <option value="barProductRevenue">Product Category Revenue</option>
              <option value="barTeamPerformance">Team Performance Metrics</option>
              <option value="barCustomerAcquisition">Customer Acquisition by Source</option>
            </optgroup>
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

      {/* Error Display */}
      {chartData.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {chartData.error}
        </div>
      )}

      {/* Data Summary */}
      {chartData.hasData && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <h3 className="font-medium text-gray-900 mb-3">Data Summary</h3>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{stageLabel}s:</span>
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
        </div>
      )}

      {/* Data Preview (Read-Only) */}
      {chartData.hasData && chartData.data && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-gray-900">Data Preview</h3>
            <p className="text-xs text-gray-500">
              Click "Edit Data" button above the chart to modify data
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

  // Chart-specific labels
  const isBarChart = chartType === 'bar';
  const stageLabel = isBarChart ? 'Category' : 'Stage';
  const periodLabel = isBarChart ? 'Value' : 'Period';
  const stageFieldName = isBarChart ? 'Category' : 'Stage'; // The actual data field name
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
                {chartData.periodNames.map((period, idx) => (
                  <th
                    key={idx}
                    draggable
                    onDragStart={(e) => handleColumnDragStart(e, idx)}
                    onDragOver={handleColumnDragOver}
                    onDrop={(e) => handleColumnDrop(e, idx)}
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-move hover:bg-gray-100"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={period}
                          onChange={(e) => chartData.updatePeriodName(period, e.target.value)}
                          className="bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded px-1 flex-1"
                        />
                        <button
                          onClick={() => chartData.removePeriod(period)}
                          className="text-red-600 hover:text-red-800 font-bold"
                          title="Delete column"
                        >
                          ×
                        </button>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            chartData.sortByPeriod(period, false);
                          }}
                          className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                          title="Sort descending"
                        >
                          ↓
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            chartData.sortByPeriod(period, true);
                          }}
                          className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                          title="Sort ascending"
                        >
                          ↑
                        </button>
                      </div>
                    </div>
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
                  {chartData.periodNames.map((period, colIndex) => (
                    <td key={colIndex} className="px-3 py-2">
                      <input
                        type="number"
                        value={row[period] || 0}
                        onChange={(e) => chartData.updateDataValue(rowIndex, period, parseFloat(e.target.value) || 0)}
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
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left font-medium text-gray-900"
      >
        <span>{title}</span>
        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {isExpanded && (
        <div className="px-4 py-4 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}
