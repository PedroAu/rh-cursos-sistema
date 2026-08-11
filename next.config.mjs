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
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
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
    // REC-408: a Content-Security-Policy é emitida EXCLUSIVAMENTE pela fonte
    // canônica `src/lib/security-headers.ts`, aplicada no runtime por
    // `middleware.ts`. Nenhuma CSP é declarada aqui para que não exista uma
    // segunda política concorrente/divergente (AC1). Os demais headers abaixo
    // cobrem assets estáticos que o matcher do middleware exclui.
    return [
      {
        source: "/(.*)",
        headers: [
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
      },
      {
        source: "/robots.txt",
        headers: [
          {
            key: "Content-Signal",
            value: "search=yes, ai-input=yes"
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
