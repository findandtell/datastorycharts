import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Chart Thumbnail Component
 * Tries to load custom default thumbnail first, falls back to static image
 */
const ChartThumbnail = ({ chartKey, fallbackImage, alt }) => {
  const [imageSrc, setImageSrc] = useState(`/api/admin/get-thumbnail?chartType=${chartKey}`);
  const [useDefault, setUseDefault] = useState(true);

  const handleError = () => {
    if (useDefault) {
      // Default thumbnail not found, fall back to static image
      setImageSrc(fallbackImage);
      setUseDefault(false);
    }
  };

  return (
    <object
      data={imageSrc}
      type="image/svg+xml"
      className="pointer-events-none w-full h-full object-contain"
      style={{ objectFit: 'contain' }}
      aria-label={alt}
      onError={handleError}
    />
  );
};

/**
 * Home Page - Chart Gallery
 * Displays all available chart types for user selection
 */
export default function Home() {
  const navigate = useNavigate();

  // Check if CSV data was passed via URL (from "Open in New Tab" feature)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const csvData = urlParams.get('csv');

    if (csvData) {
      // CSV data detected - redirect to bar chart with the data
      // Store CSV in sessionStorage so ChartEditor can load it
      sessionStorage.setItem('pendingCSVData', csvData);
      navigate(`/chart/bar-vertical${window.location.search}`);
    }
  }, [navigate]);

  // Chart gallery organized by type
  const barCharts = [
    {
      key: 'bar-horizontal',
      name: 'Bar Chart Horizontal',
      description: 'Horizontal bar chart for comparing categories side-by-side.',
      image: '/Examples/regional-sales-bar-horizontal.svg',
    },
    {
      key: 'bar-vertical',
      name: 'Bar Chart Vertical',
      description: 'Vertical bar chart for comparing categories.',
      image: '/Examples/bar_chart_revenue_asia_latinamerica.svg',
    },
    {
      key: 'bar-grouped-horizontal',
      name: 'Grouped Bar Horizontal',
      description: 'Compare multiple series across categories horizontally.',
      image: '/Examples/bar_chart_revenue_asia_latinamerica.svg',
    },
    {
      key: 'bar-grouped-vertical',
      name: 'Grouped Bar Vertical',
      description: 'Compare multiple series across categories vertically.',
      image: '/Examples/bar_chart_revenue_asia_latinamerica.svg',
    },
  ];

  const lineAreaCharts = [
    {
      key: 'line',
      name: 'Line Chart',
      description: 'Visualize trends and patterns over time with continuous data points connected by lines.',
      image: '/Examples/line_chart_marketing_channels.svg',
    },
    {
      key: 'area',
      name: 'Area Chart',
      description: 'Show trends with filled areas under lines for visual emphasis.',
      image: '/Examples/line_chart_marketing_channels.svg',
    },
    {
      key: 'area-stacked',
      name: 'Stacked Area',
      description: 'Show cumulative trends with stacked areas, perfect for part-to-whole relationships.',
      image: '/Examples/line_chart_marketing_channels.svg',
    },
    {
      key: 'slope',
      name: 'Slope Chart',
      description: 'Show change between two points in time with connecting lines.',
      image: '/Examples/slope_chart_tufte.svg',
    },
  ];

  const otherCharts = [
    {
      key: 'funnel',
      name: 'Funnel Chart',
      description: 'Track progression through sequential stages in a process, displaying conversion rates and drop-off points.',
      image: '/Examples/funnel_chart_ab.svg',
    },
  ];

  const handleChartSelect = (chartKey) => {
    // Preserve query parameters (like ?mode=addon) when navigating
    const searchParams = window.location.search;
    navigate(`/chart/${chartKey}${searchParams}`);
  };

  const renderChartCard = (chart) => (
    <div
      key={chart.key}
      onClick={() => handleChartSelect(chart.key)}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-cyan-400"
    >
      {/* Chart Preview Image */}
      <div className="bg-white border-b border-gray-200 relative h-48 overflow-hidden flex items-center justify-center p-4">
        <ChartThumbnail
          chartKey={chart.key}
          fallbackImage={chart.image}
          alt={`${chart.name} Example`}
        />
      </div>

      {/* Chart Info */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {chart.name}
        </h3>
        <p className="text-gray-600 text-xs mb-4 leading-relaxed">
          {chart.description}
        </p>

        {/* CTA Button */}
        <button className="w-full px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors text-sm">
          Create Chart
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Google Fonts for SVG thumbnail rendering */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&family=Montserrat:wght@300;400;500;600;700;800&family=Roboto:wght@300;400;500;700&family=Lato:wght@300;400;700&family=Poppins:wght@300;400;500;600;700&family=Source+Sans+Pro:wght@300;400;600;700&family=Raleway:wght@300;400;500;600;700&family=Economica:wght@400;700&family=Newsreader:wght@300;400;500;600;700&display=swap"
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex flex-col items-center mb-6">
            <img
              src="/findandtell_logo.png"
              alt="Find&Tell"
              className="h-20 mb-4"
            />
            <h1 className="text-4xl font-bold text-gray-900">
              Data Story Charts
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto text-center">
            Create clean and clear data visualizations to be used in your data stories.
          </p>
        </div>
      </div>

      {/* Chart Gallery */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Select a Chart Type
          </h2>
          <p className="text-lg text-gray-600">
            Choose from our collection of professional chart types to get started
          </p>
        </div>

        {/* Bar Charts Row */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Bar Charts</h3>
          <div className="grid grid-cols-4 gap-6">
            {barCharts.map(renderChartCard)}
          </div>
        </div>

        {/* Line/Area/Slope Charts Row */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Line & Area Charts</h3>
          <div className="grid grid-cols-4 gap-6">
            {lineAreaCharts.map(renderChartCard)}
          </div>
        </div>

        {/* Other Charts Row */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Other Charts</h3>
          <div className="grid grid-cols-4 gap-6">
            {otherCharts.map(renderChartCard)}
            {/* Empty placeholders to maintain grid */}
            <div className="invisible"></div>
            <div className="invisible"></div>
            <div className="invisible"></div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          {/* Watermark/Attribution */}
          <p className="text-sm font-medium text-blue-900 mb-3">
            <a
              href="https://findandtell.co"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-600 transition-colors"
            >
              Made with Find&Tell | Charts for Data Stories™ | FindandTell.co
            </a>
          </p>
          {/* Tech stack */}
          <p className="text-gray-500 text-xs">
            Built with React, D3.js, and Tailwind CSS • Export to PNG, SVG, or D3 code
          </p>
        </div>
      </div>
    </div>
  );
}
