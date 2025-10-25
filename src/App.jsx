import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ChartEditor from './pages/ChartEditor';

/**
 * Main App Component with Routing
 * Routes:
 * - / : Home page with chart gallery
 * - /chart/:chartType : Chart editor for specific chart type
 */
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chart/:chartType" element={<ChartEditor />} />
      </Routes>
    </Router>
  );
}
