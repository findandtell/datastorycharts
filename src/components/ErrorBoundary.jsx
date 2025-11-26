/**
 * ErrorBoundary component for catching and handling React errors gracefully
 * Prevents the entire app from crashing when a component throws an error
 */

import React, { Component } from 'react';
import { debug } from '../shared/utils/debug';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error using our debug utility
    debug.error('ErrorBoundary', 'Component error caught', {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
    });

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // Call optional onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Call optional onReset callback if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, name = 'Component' } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return typeof fallback === 'function'
          ? fallback({ error, errorInfo, reset: this.handleReset })
          : fallback;
      }

      // Default fallback UI
      return (
        <div className="error-boundary-fallback flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg m-4">
          <div className="text-red-600 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Something went wrong
          </h2>

          <p className="text-gray-600 text-center mb-4 max-w-md">
            {name} encountered an error and couldn&apos;t render properly.
            You can try refreshing or resetting the component.
          </p>

          <div className="flex gap-3">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>

            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Refresh Page
            </button>
          </div>

          {/* Show error details in development mode */}
          {import.meta.env.DEV && error && (
            <details className="mt-6 w-full max-w-2xl">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Error Details (Development Only)
              </summary>
              <div className="mt-2 p-4 bg-gray-100 rounded text-xs font-mono overflow-auto">
                <p className="text-red-600 font-semibold mb-2">
                  {error.toString()}
                </p>
                {errorInfo && (
                  <pre className="text-gray-600 whitespace-pre-wrap">
                    {errorInfo.componentStack}
                  </pre>
                )}
              </div>
            </details>
          )}
        </div>
      );
    }

    return children;
  }
}

/**
 * Higher-order component to wrap a component with ErrorBoundary
 * @param {React.Component} WrappedComponent - Component to wrap
 * @param {Object} errorBoundaryProps - Props to pass to ErrorBoundary
 * @returns {React.Component} Wrapped component with error boundary
 */
export const withErrorBoundary = (WrappedComponent, errorBoundaryProps = {}) => {
  const WithErrorBoundary = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundary.displayName = `WithErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithErrorBoundary;
};

export default ErrorBoundary;
