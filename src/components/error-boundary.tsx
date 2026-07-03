"use client";

import * as Sentry from "@sentry/nextjs";
import type { ReactNode } from "react";
import { Component } from "react";

import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

class ErrorBoundaryRoot extends Component<
  ErrorBoundaryProps & { onReset: () => void },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    error: null
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error) {
    Sentry.captureException(error, {
      level: "error",
      tags: {
        component_error: "true"
      }
    });
  }

  private reset = () => {
    this.setState({ error: null });
    this.props.onReset();
  };

  render() {
    const { children, fallback } = this.props;
    const { error } = this.state;

    if (error) {
      if (fallback) {
        return <>{fallback(error, this.reset)}</>;
      }

      return (
        <section className="mx-auto flex min-h-[50vh] w-full max-w-3xl items-center px-6 py-16">
          <div className="w-full rounded-lg border border-border bg-card p-8 shadow-soft">
            <div className="space-y-4">
              <h1 className="text-2xl font-semibold text-foreground">
                Oops! Algo deu errado
              </h1>
              <p className="text-sm leading-6 text-muted-foreground">
                Desculpe, encontramos um erro inesperado. Nossa equipe foi
                notificada e estamos investigando.
              </p>

              {process.env.NODE_ENV === "development" ? (
                <pre className="max-h-64 overflow-auto rounded-md border border-border bg-muted p-4 text-xs text-foreground">
                  {error.toString()}
                  {"\n\n"}
                  {error.stack}
                </pre>
              ) : null}

              <Button onClick={this.reset} variant="primary">
                Tentar novamente
              </Button>
            </div>
          </div>
        </section>
      );
    }

    return children;
  }
}

export function ErrorBoundary({
  children,
  fallback
}: ErrorBoundaryProps): React.ReactElement {
  return (
    <ErrorBoundaryRoot fallback={fallback} onReset={() => undefined}>
      {children}
    </ErrorBoundaryRoot>
  );
}

export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: (error: Error, reset: () => void) => ReactNode
) {
  const ComponentWithBoundary = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  ComponentWithBoundary.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;

  return ComponentWithBoundary;
}
