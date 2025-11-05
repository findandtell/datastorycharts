import React from 'react';

/**
 * SnapshotGallery Component
 * Displays thumbnail grid of captured chart snapshots
 */
export default function SnapshotGallery({ snapshots, onSnapshotClick, onDeleteSnapshot }) {
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
              <div className="flex items-center justify-between gap-2">
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
