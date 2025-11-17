/**
 * Admin Login Modal
 * Simple modal for admin authentication
 */

import React, { useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';

export default function AdminLogin({ isOpen, onClose }) {
  const { login } = useAdmin();
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!token.trim()) {
      setError('Admin token is required');
      return;
    }

    try {
      login(token);
      setToken('');
      setError('');
      onClose();
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Admin Login</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Token
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter admin token"
              autoFocus
            />
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Login
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="mt-4 text-xs text-gray-500">
          <p>Admin mode allows you to save default chart configurations.</p>
          <p className="mt-1">Set the ADMIN_TOKEN environment variable in Vercel.</p>
        </div>
      </div>
    </div>
  );
}
