/**
 * Admin Context - Manages admin mode and authentication
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { debug } from '../shared/utils/debug';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminToken, setAdminToken] = useState(null);

  /**
   * Authenticate as admin
   */
  const login = useCallback((token) => {
    setAdminToken(token);
    setIsAdmin(true);
    // Store in session storage for persistence across page reloads
    sessionStorage.setItem('adminToken', token);
  }, []);

  /**
   * Logout from admin mode
   */
  const logout = useCallback(() => {
    setAdminToken(null);
    setIsAdmin(false);
    sessionStorage.removeItem('adminToken');
  }, []);

  /**
   * Check if admin token is stored in session
   */
  React.useEffect(() => {
    const storedToken = sessionStorage.getItem('adminToken');
    if (storedToken) {
      setAdminToken(storedToken);
      setIsAdmin(true);
    }
  }, []);

  /**
   * Save default chart configuration
   * @param {string} chartType - The type of chart (e.g., 'line', 'bar-vertical')
   * @param {object} configuration - The chart configuration object
   * @param {string} svgThumbnail - Optional SVG string for gallery thumbnail
   */
  const saveDefault = useCallback(async (chartType, configuration, svgThumbnail = null) => {
    if (!adminToken) {
      throw new Error('Not authenticated as admin');
    }

    const response = await fetch('/api/admin/save-default', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        chartType,
        configuration,
        svgThumbnail
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to save default configuration');
    }

    return data;
  }, [adminToken]);

  /**
   * Load default chart configuration
   */
  const loadDefault = useCallback(async (chartType) => {
    debug.log('AdminContext', 'Fetching default for chartType', chartType);

    try {
      const response = await fetch(`/api/admin/get-default?chartType=${chartType}`);
      debug.log('AdminContext', 'Response status', { status: response.status, ok: response.ok });

      // Check content-type to avoid parsing non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // In local dev mode, Vite returns the JS source file instead of executing it
        // This is expected behavior - admin defaults only work when deployed to Vercel
        debug.log('AdminContext', 'Non-JSON response (likely local dev mode), returning null');
        return null;
      }

      const data = await response.json();

      // Debug logging
      debug.log('AdminContext', 'Raw response data', data);
      debug.log('AdminContext', 'data.success', data.success);
      debug.log('AdminContext', 'configuration', data.configuration);
      debug.log('AdminContext', 'emphasizedBars', data.configuration?.styleSettings?.chartSpecific?.bar?.emphasizedBars);

      if (!response.ok || !data.success) {
        // Not found is okay - means no default is set yet
        if (response.status === 404) {
          debug.log('AdminContext', 'No default found (404), returning null');
          return null;
        }
        debug.log('AdminContext', 'Error loading default', data.error);
        throw new Error(data.error || 'Failed to load default configuration');
      }

      debug.log('AdminContext', 'Successfully loaded configuration');
      return data.configuration;
    } catch (error) {
      // Handle JSON parse errors gracefully (happens in local dev)
      if (error instanceof SyntaxError) {
        debug.log('AdminContext', 'JSON parse error (likely local dev mode), returning null');
        return null;
      }
      throw error;
    }
  }, []);

  const value = {
    isAdmin,
    adminToken,
    login,
    logout,
    saveDefault,
    loadDefault
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};
