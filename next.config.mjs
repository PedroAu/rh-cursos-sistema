import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import bundleAnalyzer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";

const rootDir = process.cwd();
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true"
});

initOpenNextCloudflareForDev();

// Sentry is a runtime no-op without a DSN. When it is not configured, alias the
// SDK to a local no-op stub so Turbopack does not bundle @sentry/node +
// OpenTelemetry (~1 MiB+) into the Cloudflare Worker, which would otherwise
// exceed the 3 MiB size limit. The alias is skipped when Sentry IS configured,
// so local/dev/observability behavior is unchanged.
const isSentryEnabled = Boolean(
  process.env.SENTRY_AUTH_TOKEN || process.env.NEXT_PUBLIC_SENTRY_DSN
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  turbopack: {
    root: rootDir,
    ...(isSentryEnabled
      ? {}
      : { resolveAlias: { "@sentry/nextjs": "./sentry-noop.ts" } })
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com"
      },
      {
        protocol: "https",
        hostname: "*.supabase.co"
      }
    ]
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com; frame-ancestors 'none';"
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload"
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "X-Frame-Options",
            value: "DENY"
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block"
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()"
          }
        ]
      }
    ];
  }
};

const sentryOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  webpack: {
    treeshake: {
      removeDebugLogging: true
    }
  }
};

// Only apply Sentry's build-time instrumentation when Sentry is actually
// configured (see `isSentryEnabled` above). Without a DSN, Sentry is a runtime
// no-op anyway, and `withSentryConfig` auto-instrumentation would otherwise add
// weight to the worker. Local/dev behavior is unchanged when SENTRY_AUTH_TOKEN
// or NEXT_PUBLIC_SENTRY_DSN is set.
const baseConfig = withBundleAnalyzer(nextConfig);

export default isSentryEnabled
  ? withSentryConfig(baseConfig, sentryOptions)
  : baseConfig;
