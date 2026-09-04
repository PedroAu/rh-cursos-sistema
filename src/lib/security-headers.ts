import { NextResponse } from "next/server";

export interface SecurityHeadersConfig {
  contentSecurityPolicy?: string;
  xFrameOptions?: string;
  xContentTypeOptions?: string;
  xXssProtection?: string;
  referrerPolicy?: string;
  strictTransportSecurity?: string;
  permissionsPolicy?: string;
  contentSignal?: string;
}

// REC-408: fonte canônica única da CSP de produção. Cada origem externa tem um
// consumidor rastreável no código:
// - www.googletagmanager.com / www.google-analytics.com / analytics.google.com /
//   www.google.com / stats.g.doubleclick.net: Google Analytics 4,
//   injetado condicionalmente por `app/layout.tsx` via `@next/third-parties`
//   quando `NEXT_PUBLIC_GA_MEASUREMENT_ID` está definido (ver `src/lib/analytics.ts`).
// - static.cloudflareinsights.com / cloudflareinsights.com: beacon do Cloudflare
//   Workers Analytics, injetado pela plataforma no runtime de produção.
// - *.supabase.co / wss://*.supabase.co: cliente Supabase (dados + realtime).
// `unsafe-eval` NÃO aparece em produção. `cdn.jsdelivr.net` e `api.rhcursos.com.br`
// foram removidos por não terem nenhum consumidor no repositório (AC2 — nenhuma
// origem sem consumidor rastreável; `api.rhcursos.com.br` removido na revisão
// @architect/@qa de 2026-07-19 pelo mesmo critério).
const PRODUCTION_CSP_DIRECTIVES = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://static.cloudflareinsights.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://www.googletagmanager.com https://analytics.google.com https://www.google.com https://stats.g.doubleclick.net https://cloudflareinsights.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ];

const DEVELOPMENT_CSP_DIRECTIVES = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' ws://localhost:*",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https: data:",
    "connect-src 'self' ws://localhost:* wss://localhost:* https://*.supabase.co wss://*.supabase.co http://localhost:*",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];

function getLocalSupabaseConnectSources(supabaseUrl?: string) {
  if (!supabaseUrl) return [];

  try {
    const url = new URL(supabaseUrl);
    if (
      url.protocol !== "http:" ||
      !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname)
    ) {
      return [];
    }

    return [url.origin, `ws://${url.host}`];
  } catch {
    return [];
  }
}

export function buildContentSecurityPolicy(
  environment = process.env.NODE_ENV,
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
) {
  const directives =
    environment === "production" ? PRODUCTION_CSP_DIRECTIVES : DEVELOPMENT_CSP_DIRECTIVES;
  const localConnectSources = getLocalSupabaseConnectSources(supabaseUrl);

  return directives
    .map((directive) =>
      directive.startsWith("connect-src") && localConnectSources.length > 0
        ? `${directive} ${localConnectSources.join(" ")}`
        : directive
    )
    .join("; ");
}

// Content Security Policy - strict by default
export const CSP_POLICIES = {
  production: buildContentSecurityPolicy("production"),
  development: buildContentSecurityPolicy("development"),
};

// Default security headers
export const DEFAULT_SECURITY_HEADERS: SecurityHeadersConfig = {
  // Content Security Policy
  contentSecurityPolicy: buildContentSecurityPolicy(),

  // Prevent clickjacking
  xFrameOptions: "DENY",

  // Prevent MIME type sniffing
  xContentTypeOptions: "nosniff",

  // XSS protection (legacy, mostly redundant with CSP)
  xXssProtection: "1; mode=block",

  // Referrer policy
  referrerPolicy: "strict-origin-when-cross-origin",

  // HSTS (Strict Transport Security)
  strictTransportSecurity:
    process.env.NODE_ENV === "production"
      ? "max-age=31536000; includeSubDomains; preload"
      : "max-age=3600", // 1 hour in dev

  // Permissions Policy (formerly Feature Policy)
  permissionsPolicy: [
    "accelerometer=()",
    "autoplay=()",
    "camera=()",
    "encrypted-media=()",
    "fullscreen=()",
    "geolocation=()",
    "gyroscope=()",
    "magnetometer=()",
    "microphone=()",
    "midi=()",
    "payment=()",
    "picture-in-picture=()",
    "sync-xhr=()",
    "usb=()",
    "xr-spatial-tracking=()",
  ].join(", "),

  // Política canônica confirmada pelo responsável: indexação, recuperação e
  // treinamento por IA são permitidos nas superfícies públicas.
  contentSignal: "search=yes, ai-input=yes, ai-train=yes",
};

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(
  response: NextResponse,
  config: SecurityHeadersConfig = {}
): NextResponse {
  const finalConfig = { ...DEFAULT_SECURITY_HEADERS, ...config };

  if (finalConfig.contentSecurityPolicy) {
    response.headers.set("Content-Security-Policy", finalConfig.contentSecurityPolicy);
  }

  if (finalConfig.xFrameOptions) {
    response.headers.set("X-Frame-Options", finalConfig.xFrameOptions);
  }

  if (finalConfig.xContentTypeOptions) {
    response.headers.set("X-Content-Type-Options", finalConfig.xContentTypeOptions);
  }

  if (finalConfig.xXssProtection) {
    response.headers.set("X-XSS-Protection", finalConfig.xXssProtection);
  }

  if (finalConfig.referrerPolicy) {
    response.headers.set("Referrer-Policy", finalConfig.referrerPolicy);
  }

  if (finalConfig.strictTransportSecurity) {
    response.headers.set("Strict-Transport-Security", finalConfig.strictTransportSecurity);
  }

  if (finalConfig.permissionsPolicy) {
    response.headers.set("Permissions-Policy", finalConfig.permissionsPolicy);
  }

  if (finalConfig.contentSignal) {
    response.headers.set("Content-Signal", finalConfig.contentSignal);
  }

  return response;
}

/**
 * REC-408: contrato canônico de cache para respostas sensíveis (auth/BFF/admin).
 * Um único valor de `Cache-Control` garante que caches compartilhados não
 * armazenem dados autenticados. Genérico sobre `Response` e `NextResponse` para
 * cobrir tanto rotas que devolvem `NextResponse.json` quanto o proxy que devolve
 * `Response` cru — inclusive respostas de erro (4xx/5xx) e redirects de sessão.
 */
export const NO_STORE_CACHE_CONTROL = "no-store, no-cache, must-revalidate, proxy-revalidate";

export function applyNoStore<T extends Response>(response: T): T {
  response.headers.set("Cache-Control", NO_STORE_CACHE_CONTROL);
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

/**
 * Additional security headers for API responses
 */
export function applyApiSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent caching of sensitive data (fonte única: applyNoStore).
  applyNoStore(response);

  // Additional headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");

  return response;
}
