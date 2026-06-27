import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

/**
 * Captura erros de render no servidor (Server Components, Route Handlers e SSR)
 * e os encaminha ao Sentry. É um no-op quando o DSN não está configurado.
 */
export const onRequestError = Sentry.captureRequestError;
