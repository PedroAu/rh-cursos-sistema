import { NextResponse } from "next/server";

export interface SecurityHeadersConfig {
  contentSecurityPolicy?: string;
  xFrameOptions?: string;
  xContentTypeOptions?: string;
  xXssProtection?: string;
  referrerPolicy?: string;
  strictTransportSecurity?: string;
  permissionsPolicy?: string;
}

// Content Security Policy - strict by default
export const CSP_POLICIES = {
  // Production CSP - very restrictive
  production: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net", // Only self + CDN for next.js
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https:",
    "connect-src 'self' https://api.rhcursos.com.br https://*.supabase.co wss://*.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; "),

  // Development CSP - more permissive for webpack HMR
  development: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' ws://localhost:*",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https: data:",
    "connect-src 'self' ws://localhost:* wss://localhost:* https://*.supabase.co wss://*.supabase.co http://localhost:*",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
};

// Default security headers
export const DEFAULT_SECURITY_HEADERS: SecurityHeadersConfig = {
  // Content Security Policy
  contentSecurityPolicy:
    process.env.NODE_ENV === "production"
      ? CSP_POLICIES.production
      : CSP_POLICIES.development,

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
    "ambient-light-sensor=()",
    "autoplay=()",
    "battery=()",
    "camera=()",
    "document-domain=()",
    "encrypted-media=()",
    "fullscreen=()",
    "geolocation=()",
    "gyroscope=()",
    "magnetometer=()",
    "microphone=()",
    "midi=()",
    "navigation-override=()",
    "payment=()",
    "picture-in-picture=()",
    "sync-xhr=()",
    "usb=()",
    "vr=()",
    "xr-spatial-tracking=()",
  ].join(", "),
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

  return response;
}

/**
 * Additional security headers for API responses
 */
export function applyApiSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent caching of sensitive data
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  // Additional headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");

  return response;
}
