import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Home from './pages/Home';
import ChartEditor from './pages/ChartEditor';
import GoogleSheetsBanner from './shared/components/GoogleSheetsBanner';
import GoogleAnalytics from './components/GoogleAnalytics';
import { AdminProvider } from './contexts/AdminContext';

/**
 * Main App Component with Routing
 * Routes:
 * - / : Home page with chart gallery
 * - /chart/:chartType : Chart editor for specific chart type
 */
export default function App() {
  return (
    <AdminProvider>
      <Router>
        <GoogleSheetsBanner />
        <GoogleAnalytics />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chart/:chartType" element={<ChartEditor />} />
        </Routes>
      </Router>
      <Analytics />
    </AdminProvider>
  );
}
