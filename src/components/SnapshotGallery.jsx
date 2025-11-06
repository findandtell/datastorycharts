import React from 'react';

/**
 * SnapshotGallery Component
 * Displays thumbnail grid of captured chart snapshots
 */
export default function SnapshotGallery({ snapshots, onSnapshotClick, onDeleteSnapshot, onSaveChart }) {
  if (!snapshots || snapshots.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">
          Snapshot Gallery ({snapshots.length})
        </h3>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {snapshots.map((snapshot) => (
          <div
            key={snapshot.id}
            className="relative group cursor-pointer bg-white rounded-lg border-2 border-gray-200 hover:border-cyan-500 transition-all duration-200 shadow-md hover:shadow-lg overflow-hidden"
            onClick={() => onSnapshotClick(snapshot)}
          >
            {/* Thumbnail */}
            <div className="w-full bg-white p-2 flex items-center justify-center overflow-hidden" style={{ height: '160px' }}>
              <div
                style={{
                  width: '600px',
                  height: '400px',
                  transform: 'scale(0.24)',
                  transformOrigin: 'center center',
                }}
                dangerouslySetInnerHTML={{ __html: snapshot.svgContent }}
              />
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 truncate">
                    {new Date(snapshot.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {snapshot.chartType}
                  </p>
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSnapshot(snapshot.id);
                  }}
                  className="flex-shrink-0 p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors duration-150"
                  title="Delete snapshot"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Save Chart Button */}
              {onSaveChart && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSaveChart(snapshot);
                  }}
                  className="w-full py-1.5 px-2 bg-green-100 text-green-700 hover:bg-green-200 rounded text-xs font-medium transition-colors duration-150 flex items-center justify-center gap-1"
                  title="Save chart state to file"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save Chart
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
