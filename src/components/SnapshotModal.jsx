import React, { useEffect } from 'react';
import { exportAsSVG, exportAsPNG } from '../shared/utils/exportHelpers';

/**
 * SnapshotModal Component
 * Full-size snapshot viewer with export and load options
 */
export default function SnapshotModal({ snapshot, onClose, onLoadChart, onNext, onPrevious, hasNext, hasPrevious }) {
  if (!snapshot) return null;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' && hasNext) {
        onNext();
      } else if (e.key === 'ArrowLeft' && hasPrevious) {
        onPrevious();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasNext, hasPrevious, onNext, onPrevious, onClose]);

  const handleDownloadSVG = async () => {
    // Create a temporary container to export
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = snapshot.svgContent;
    const svgElement = tempDiv.querySelector('svg');

    if (svgElement) {
      await exportAsSVG(svgElement, `snapshot-${snapshot.id}`);
    }
  };

  const handleDownloadPNG = async () => {
    // Create a temporary container to export
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = snapshot.svgContent;
    const svgElement = tempDiv.querySelector('svg');

    if (svgElement) {
      await exportAsPNG(svgElement, `snapshot-${snapshot.id}`);
    }
  };

  const handleLoadChart = () => {
    onLoadChart(snapshot);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {snapshot.chartType} Chart
            </h2>
            <p className="text-sm text-gray-500">
              {new Date(snapshot.timestamp).toLocaleString()}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Snapshot Preview */}
        <div className="flex-1 overflow-auto p-8 bg-gray-50 relative">
          {/* Previous Button */}
          {hasPrevious && (
            <button
              onClick={onPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white text-gray-700 rounded-full shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all z-10 border border-gray-200"
              title="Previous snapshot"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {/* Next Button */}
          {hasNext && (
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white text-gray-700 rounded-full shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all z-10 border border-gray-200"
              title="Next snapshot"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}

          <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-center">
            <div
              dangerouslySetInnerHTML={{ __html: snapshot.svgContent }}
              className="max-w-full"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-2">
            <button
              onClick={handleDownloadSVG}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download SVG
            </button>

            <button
              onClick={handleDownloadPNG}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download PNG
            </button>
          </div>

          <button
            onClick={handleLoadChart}
            className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2 font-medium"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Load Chart
          </button>
        </div>
      </div>
    </div>
  );
}
