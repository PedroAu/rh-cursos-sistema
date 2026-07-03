/**
 * No-op stub for `@sentry/nextjs`.
 *
 * Aliased in via `next.config.mjs` (`turbopack.resolveAlias`) ONLY when Sentry
 * is not configured (no `SENTRY_AUTH_TOKEN` / `NEXT_PUBLIC_SENTRY_DSN`). Without
 * a DSN the real SDK is already a runtime no-op — every `capture*` call does
 * nothing because `Sentry.init` is never wired up. This stub reproduces that
 * exact behavior while keeping `@sentry/node` + OpenTelemetry (~1 MiB+) out of
 * the Cloudflare Worker bundle so it stays under the 3 MiB size limit.
 *
 * When a DSN/token IS present, this alias is not applied and the real SDK is
 * used, so local/dev/observability behavior is unchanged.
 *
 * Note: TypeScript type-checking (`tsc`) resolves against the real
 * `@sentry/nextjs` types, not this file — this stub only affects the Turbopack
 * bundle graph.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

export function init(_options?: unknown): void {}

export function captureException(_error?: unknown, _hint?: unknown): string {
  return "";
}

export function captureMessage(_message?: unknown, _level?: unknown): string {
  return "";
}

export function addBreadcrumb(_breadcrumb?: unknown): void {}

export function captureRequestError(
  _error?: unknown,
  _request?: unknown,
  _context?: unknown
): void {}

export function captureRouterTransitionStart(
  _href?: unknown,
  _navigationType?: unknown
): void {}

export class Replay {
  constructor(_options?: unknown) {}
}

export class BrowserTracing {
  constructor(_options?: unknown) {}
}
