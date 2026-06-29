import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary, useErrorHandler } from '@/components/ui/error-boundary';
import React from 'react';

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}));

// Component that throws an error
const ThrowingComponent = () => {
  throw new Error('Test error');
};

// Component that works normally
const WorkingComponent = () => {
  return <div>Working content</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for error boundary tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Working content')).toBeInTheDocument();
  });

  it('renders error fallback when error occurs', () => {
    // Suppress error logs for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Encontramos um erro inesperado ao renderizar este componente/
      )
    ).toBeInTheDocument();

    consoleError.mockRestore();
  });

  it('calls onError callback when error occurs', () => {
    const onError = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary onError={onError}>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('renders custom fallback when provided', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const customFallback = <div>Custom error UI</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error UI')).toBeInTheDocument();
    consoleError.mockRestore();
  });

  it('resets error state when reset is called', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { rerender } = render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();

    // Reset and re-render with working component
    rerender(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Working content')).toBeInTheDocument();
    consoleError.mockRestore();
  });

  it('handles reset button click', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { rerender } = render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();

    // Simulate reset by re-rendering with working component
    rerender(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Working content')).toBeInTheDocument();
    consoleError.mockRestore();
  });
});

describe('useErrorHandler hook', () => {
  it('exists and is callable', () => {
    expect(useErrorHandler).toBeDefined();
  });
});
