"use client";

import { useEffect } from "react";

import * as Sentry from "@sentry/nextjs";

/**
 * Boundary de último recurso. Captura erros lançados no próprio root layout e,
 * por isso, substitui `<html>`/`<body>` inteiros — os providers (Mantine) e o
 * `globals.css` NÃO estão disponíveis aqui. Mantemos a UI auto-contida com
 * estilos inline para garantir que o fallback renderize mesmo nesse cenário.
 */
export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
    console.error("[global-error-boundary]", error.digest ?? "sem-digest", error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          background: "#f8fafc",
          color: "#0f172a"
        }}
      >
        <main style={{ maxWidth: 520, textAlign: "center" }}>
          <div aria-hidden="true" style={{ fontSize: 56, lineHeight: 1 }}>
            ⚠️
          </div>
          <h1 style={{ fontSize: 26, margin: "20px 0 8px" }}>Algo deu errado</h1>
          <p style={{ color: "#475569", lineHeight: 1.6, margin: "0 0 8px" }}>
            Encontramos um problema inesperado. Tente novamente ou recarregue a página.
          </p>
          {error.digest ? (
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 20px" }}>
              Código do erro: {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: 12,
              padding: "12px 24px",
              fontSize: 15,
              fontWeight: 600,
              border: "none",
              borderRadius: 10,
              background: "#1d4ed8",
              color: "#ffffff",
              cursor: "pointer",
              outline: "none"
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = "2px solid #ffffff";
              e.currentTarget.style.outlineOffset = "2px";
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = "none";
            }}
          >
            Tentar novamente
          </button>
        </main>
      </body>
    </html>
  );
}
