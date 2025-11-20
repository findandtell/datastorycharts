/**
 * Template for testing React components
 * Copy this file and rename it to match your component: MyComponent.test.jsx
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Import your component here
// import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  // Mock data
  const defaultProps = {
    title: 'Test Title',
    onAction: vi.fn(),
  };

  it('should render without crashing', () => {
    render(<MyComponent {...defaultProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('should display props correctly', () => {
    render(<MyComponent {...defaultProps} count={5} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    render(<MyComponent {...defaultProps} onAction={onAction} />);

    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('should update when props change', () => {
    const { rerender } = render(<MyComponent {...defaultProps} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();

    rerender(<MyComponent {...defaultProps} title="New Title" />);

    expect(screen.getByText('New Title')).toBeInTheDocument();
    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
  });

  it('should handle async operations', async () => {
    render(<MyComponent {...defaultProps} />);

    const button = screen.getByRole('button', { name: /load/i });
    fireEvent.click(button);

    // Wait for loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/loaded/i)).toBeInTheDocument();
    });
  });

  it('should handle errors gracefully', async () => {
    render(<MyComponent {...defaultProps} shouldFail={true} />);

    const button = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('should be accessible', () => {
    render(<MyComponent {...defaultProps} />);

    // Check for proper ARIA labels
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveAttribute('aria-label');
  });

  it('should match snapshot', () => {
    const { container } = render(<MyComponent {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });
});

/**
 * Testing Tips for Components:
 *
 * 1. Test user interactions with userEvent (preferred) or fireEvent
 * 2. Test rendering with different props
 * 3. Test state changes
 * 4. Test async operations
 * 5. Test error states
 * 6. Test accessibility
 * 7. Use data-testid sparingly (prefer accessible queries)
 *
 * Query Priority (from React Testing Library):
 * 1. getByRole (best - accessible)
 * 2. getByLabelText
 * 3. getByPlaceholderText
 * 4. getByText
 * 5. getByDisplayValue
 * 6. getByAltText
 * 7. getByTitle
 * 8. getByTestId (last resort)
 *
 * Common test cases:
 * - Component renders
 * - Props displayed correctly
 * - User interactions work
 * - Async operations complete
 * - Errors handled
 * - Accessibility features present
 */
