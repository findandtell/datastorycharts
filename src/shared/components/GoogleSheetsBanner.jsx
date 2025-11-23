import { useState, useEffect } from 'react';
import Toast from '../../components/Toast';

/**
 * Banner shown when app is loaded from Google Sheets
 * Provides helpful tips for the browser-based workflow
 */
export default function GoogleSheetsBanner() {
  const [show, setShow] = useState(true);
  const [fromSheets, setFromSheets] = useState(false);
  const [sheetsUrl, setSheetsUrl] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Check if loaded with CSV data (indicates it came from Sheets)
    const urlParams = new URLSearchParams(window.location.search);
    const hasCsv = urlParams.has('csv');
    const sheetsUrlParam = urlParams.get('sheetsUrl');

    setFromSheets(hasCsv);
    setSheetsUrl(sheetsUrlParam);

    // Add padding to body to account for banner height
    if (hasCsv) {
      document.body.style.paddingTop = '76px';
    }

    return () => {
      document.body.style.paddingTop = '';
    };
  }, []);

  useEffect(() => {
    // Adjust body padding when banner is hidden
    if (!show) {
      document.body.style.paddingTop = '';
    } else if (fromSheets) {
      document.body.style.paddingTop = '76px';
    }
  }, [show, fromSheets]);

  if (!fromSheets || !show) {
    return null;
  }

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const switchTabShortcut = isMac ? '⌘+Tab' : 'Alt+Tab';

  return (
    <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="bg-white/20 rounded-full p-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            <div className="flex-1">
              <div className="font-semibold text-sm">
                Connected to Google Sheets
              </div>
              <div className="text-xs text-cyan-50 flex items-center gap-4 mt-0.5 flex-wrap">
                <span>💡 Use <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-xs font-mono">{switchTabShortcut}</kbd> to switch tabs</span>
                <span>•</span>
                <span>Update data: <strong>Find&Tell Charts → 🔄 Update</strong></span>
                <span>•</span>
                <span>Insert to Sheets: Download chart → <strong>Insert → Image</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {sheetsUrl ? (
              <a
                href={sheetsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Sheets
              </a>
            ) : (
              <button
                onClick={() => {
                  if (window.opener) {
                    window.opener.focus();
                  } else {
                    setToast({
                      message: 'Open Google Sheets in another tab to update data. Tip: Keep both tabs open for easy switching!',
                      type: 'info',
                      duration: 4000
                    });
                  }
                }}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
              >
                Switch to Sheets
              </button>
            )}

            <button
              onClick={() => setShow(false)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              aria-label="Close banner"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
