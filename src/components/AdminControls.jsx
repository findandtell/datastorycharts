/**
 * Admin Controls Component
 * Displays admin-specific controls in the ChartEditor
 */

import React, { useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import AdminLogin from './AdminLogin';
import { KeyIcon, CloudArrowUpIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function AdminControls({ chartType, onSaveDefault, onLoadDefault }) {
  const { isAdmin, logout } = useAdmin();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSaveDefault = async () => {
    setIsSaving(true);
    setMessage('');
    try {
      await onSaveDefault();
      setMessage('Default saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadDefault = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      const loaded = await onLoadDefault();
      if (loaded) {
        setMessage('Default loaded successfully!');
      } else {
        setMessage('No default configuration found');
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {!isAdmin ? (
        <button
          onClick={() => setShowLoginModal(true)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
          title="Login as admin to save defaults"
        >
          <KeyIcon className="w-4 h-4" />
          Admin
        </button>
      ) : (
        <>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-md">
            <span className="text-xs font-medium text-blue-700">Admin Mode</span>
            <button
              onClick={logout}
              className="text-blue-600 hover:text-blue-800"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleLoadDefault}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors disabled:opacity-50"
            title="Load default configuration"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CloudArrowUpIcon className="w-4 h-4" />
            )}
            Load Default
          </button>

          <button
            onClick={handleSaveDefault}
            disabled={isSaving}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
            title="Save current configuration as default"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CloudArrowUpIcon className="w-4 h-4" />
            )}
            Save as Default
          </button>
        </>
      )}

      {message && (
        <div className={`px-3 py-1.5 text-sm rounded-md ${
          message.includes('Error')
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message}
        </div>
      )}

      <AdminLogin isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}
