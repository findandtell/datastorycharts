import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Home Page - Chart Gallery
 * Displays all available chart types for user selection
 */
export default function Home() {
  const navigate = useNavigate();

  const charts = [
    {
      key: 'line',
      name: 'Line Chart',
      description: 'Visualize trends and patterns over time with continuous data points connected by lines, perfect for showing growth, decline, or cyclical patterns.',
      image: '/Examples/line_chart_marketing_channels.svg',
    },
    {
      key: 'bar',
      name: 'Bar Chart',
      description: 'Compare values across different categories or time periods with horizontal or vertical bars, ideal for showing relative sizes and rankings.',
      image: '/Examples/bar_chart_revenue_asia_latinamerica.svg',
    },
    {
      key: 'slope',
      name: 'Slope Chart',
      description: 'Show change between two points in time with connecting lines that emphasize increases, decreases, or stability across multiple categories.',
      image: '/Examples/slope_chart_tufte.svg',
    },
    {
      key: 'funnel',
      name: 'Funnel Chart',
      description: 'Track progression through sequential stages in a process, displaying conversion rates and drop-off points in sales pipelines or user journeys.',
      image: '/Examples/funnel_chart_ab.svg',
    },
  ];

  const handleChartSelect = (chartKey) => {
    // Preserve query parameters (like ?mode=addon) when navigating
    const searchParams = window.location.search;
    navigate(`/chart/${chartKey}${searchParams}`);
  };

  return (
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

        <div className="grid grid-cols-4 gap-8">
          {charts.map((chart) => (
            <div
              key={chart.key}
              onClick={() => handleChartSelect(chart.key)}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-cyan-400"
            >
              {/* Chart Preview Image */}
              <div className="bg-white border-b border-gray-200 relative h-56 overflow-hidden">
                <object
                  data={chart.image}
                  type="image/svg+xml"
                  className="pointer-events-none w-full h-full"
                  aria-label={`${chart.name} Example`}
                />
              </div>

              {/* Chart Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {chart.name}
                </h3>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  {chart.description}
                </p>

                {/* CTA Button */}
                <button className="w-full px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors">
                  Create Chart
                </button>
              </div>
            </div>
          ))}
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
