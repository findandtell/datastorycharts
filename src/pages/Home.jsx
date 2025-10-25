import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getChartKeys, getChart } from '../charts/registry';

/**
 * Home Page - Chart Gallery
 * Displays all available chart types for user selection
 */
export default function Home() {
  const navigate = useNavigate();
  const chartKeys = getChartKeys();

  const handleChartSelect = (chartKey) => {
    navigate(`/chart/${chartKey}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Funnel Visualization Builder
              </h1>
            </div>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl">
            Create stunning, interactive data visualizations with customizable styles and analytics.
            Build professional funnel charts in minutes.
          </p>

          {/* Feature Badges */}
          <div className="flex flex-wrap gap-3 mt-6">
            <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm font-medium text-green-700">
              ✓ Export PNG & SVG
            </div>
            <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-700">
              ✓ Comparison Mode
            </div>
            <div className="px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg text-sm font-medium text-purple-700">
              ✓ Real-time Preview
            </div>
            <div className="px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg text-sm font-medium text-orange-700">
              ✓ Custom Styling
            </div>
          </div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {chartKeys.map((chartKey) => {
            const chart = getChart(chartKey);
            return (
              <div
                key={chartKey}
                onClick={() => handleChartSelect(chartKey)}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-gray-100 hover:border-cyan-400 overflow-hidden group transform hover:-translate-y-1"
              >
                {/* Chart Preview/Thumbnail */}
                <div className="h-56 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 flex items-center justify-center border-b-2 border-gray-100 group-hover:from-cyan-100 group-hover:via-blue-100 group-hover:to-indigo-100 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent"></div>
                  <div className="text-center relative z-10">
                    <div className="text-7xl mb-4 group-hover:scale-110 transition-transform duration-300">{chart.icon}</div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-white/80 px-3 py-1 rounded-full">
                      {chart.category}
                    </div>
                  </div>
                </div>

                {/* Chart Info */}
                <div className="p-7">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-cyan-600 transition-colors">
                    {chart.name}
                  </h3>
                  <p className="text-gray-600 text-base mb-5 leading-relaxed">
                    {chart.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {chart.supportsComparison && (
                      <span className="px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                        Comparison Mode
                      </span>
                    )}
                    <span className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
                      Interactive
                    </span>
                    <span className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-semibold rounded-full border border-purple-200">
                      Customizable
                    </span>
                  </div>

                  {/* CTA Button */}
                  <button className="w-full px-5 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 group-hover:shadow-lg transform group-hover:scale-[1.02]">
                    Create Chart →
                  </button>
                </div>
              </div>
            );
          })}

          {/* Coming Soon Cards for Future Charts */}
          {[...Array(5)].map((_, index) => (
            <div
              key={`coming-soon-${index}`}
              className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden opacity-70 hover:opacity-85 transition-opacity duration-300"
            >
              <div className="h-56 bg-gradient-to-br from-gray-100 via-gray-150 to-gray-200 flex items-center justify-center border-b-2 border-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"></div>
                <div className="text-center relative z-10">
                  <div className="text-7xl mb-4">🔒</div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-white/70 px-3 py-1 rounded-full">
                    Coming Soon
                  </div>
                </div>
              </div>

              <div className="p-7">
                <h3 className="text-2xl font-bold text-gray-400 mb-3">
                  More Charts Coming
                </h3>
                <p className="text-gray-400 text-base mb-5 leading-relaxed">
                  Bar charts, line charts, pie charts, and more visualization types will be available soon
                </p>
                <button
                  disabled
                  className="w-full px-5 py-3 bg-gray-300 text-gray-500 font-semibold rounded-xl cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-gray-600 text-sm">
          <p>
            Built with React, D3.js, and Tailwind CSS • Export to PNG, SVG, or D3 code
          </p>
        </div>
      </div>
    </div>
  );
}
