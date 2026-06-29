'use client';

import React from 'react';
import * as Sentry from '@sentry/nextjs';

import { ErrorFallback } from '@/components/common/error-fallback';

type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

/**
 * Client-side Error Boundary component for React errors.
 *
 * Catches React rendering errors, logs to Sentry (when configured),
 * and displays a user-friendly fallback UI.
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary onError={(error) => console.log(error)}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 *
 * Features:
 * - Catches React component rendering errors
 * - Automatic Sentry error reporting
 * - Customizable fallback UI
 * - Type-safe error handling
 * - Focus management on error display
 *
 * @example
 * <ErrorBoundary>
 *   <ComplexForm />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console in development
    console.error('[ErrorBoundary]', error);
    console.error('[ErrorBoundary] Error Info:', errorInfo);

    // Report to Sentry in production
    try {
      Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    } catch (sentryError) {
      console.error('[ErrorBoundary] Failed to report to Sentry:', sentryError);
    }

    // Call user-provided callback if available
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        this.props.fallback ?? (
          <ErrorFallback
            title="Algo deu errado"
            description="Encontramos um erro inesperado ao renderizar este componente. Tente recarregar a página."
            errorId={this.state.error.message}
            onReset={this.handleReset}
          />
        )
      );
    }

    return this.props.children;
  }
}

/**
 * Hook to safely handle errors in async operations.
 *
 * Usage:
 * ```tsx
 * const handleAsyncError = useErrorHandler();
 * try {
 *   await fetchData();
 * } catch (error) {
 *   handleAsyncError(error);
 * }
 * ```
 */
export function useErrorHandler() {
  return (error: Error) => {
    try {
      Sentry.captureException(error);
    } catch (sentryError) {
      console.error('Failed to report error to Sentry:', sentryError);
    }
    console.error('Error caught:', error);
  };
}
