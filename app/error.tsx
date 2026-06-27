"use client";

import { useEffect } from "react";

import * as Sentry from "@sentry/nextjs";

import { ErrorFallback } from "@/components/common/error-fallback";

/**
 * Error boundary de segmento (App Router). Captura erros de renderização nas
 * rotas abaixo de `app/`, mantendo o root layout e os providers montados.
 *
 * O erro é reportado ao Sentry quando o DSN está configurado; caso contrário,
 * é registrado no console para debugging local.
 */
export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
    console.error("[error-boundary]", error.digest ?? "sem-digest", error);
  }, [error]);

  return <ErrorFallback errorId={error.digest} onReset={reset} />;
}
