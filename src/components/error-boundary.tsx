"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";
import { Box, Stack, Title, Text, Button } from "@mantine/core";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: (error: Error, reset: () => void) => React.ReactNode;
}

interface ErrorState {
  hasError: boolean;
  error: Error | null;
}

export function ErrorBoundary({
  children,
  fallback
}: ErrorBoundaryProps): React.ReactElement {
  const [state, setState] = useState<ErrorState>({
    hasError: false,
    error: null
  });

  useEffect(() => {
    if (!state.hasError) return;

    // Report to Sentry
    if (state.error) {
      Sentry.captureException(state.error, {
        level: "error",
        tags: {
          component_error: "true"
        }
      });
    }
  }, [state.hasError, state.error]);

  if (state.hasError && state.error) {
    if (fallback) {
      return (
        <>
          {fallback(state.error, () => {
            setState({ hasError: false, error: null });
          })}
        </>
      );
    }

    return (
      <Box p="lg">
        <Stack gap="lg">
          <Title order={1}>Oops! Algo deu errado</Title>
          <Text c="dimmed">
            Desculpe, encontramos um erro inesperado. Nossa equipe foi
            notificada e estamos investigando.
          </Text>

          {process.env.NODE_ENV === "development" && (
            <Box
              p="md"
              style={{
                backgroundColor: "#f5f5f5",
                borderRadius: "4px",
                border: "1px solid #ddd",
                fontFamily: "monospace",
                fontSize: "12px",
                overflow: "auto",
                maxHeight: "200px"
              }}
            >
              <Text component="pre" m={0}>
                {state.error.toString()}
                {"\n\n"}
                {state.error.stack}
              </Text>
            </Box>
          )}

          <Button
            onClick={() => {
              setState({ hasError: false, error: null });
            }}
          >
            Tentar Novamente
          </Button>
        </Stack>
      </Box>
    );
  }

  return <>{children}</>;
}

/**
 * Higher-order component to wrap a component with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: (error: Error, reset: () => void) => React.ReactNode
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
