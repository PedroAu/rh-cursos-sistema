"use client";

import { useEffect } from "react";

import { ErrorFallback } from "@/components/common/error-fallback";

/**
 * Error boundary de segmento (App Router). Captura erros de renderização nas
 * rotas abaixo de `app/`, mantendo o root layout e os providers montados.
 *
 * O monitoramento via Sentry e o alerting serão configurados na Phase B
 * (Story 8.2 / AC3); por ora o erro é logado no console para debugging.
 */
export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[error-boundary]", error.digest ?? "sem-digest", error);
  }, [error]);

  return <ErrorFallback errorId={error.digest} onReset={reset} />;
}
