import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_APP_ENV ?? process.env.NODE_ENV,

  // Error tracking sampling
  // 100% in development for comprehensive error tracking
  // 10% in production to manage volume
  sampleRate: 1.0,

  // Performance monitoring (edge is lighter-weight)
  // 100% in development
  // 10% in production to manage quota
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Debug mode for development
  debug: process.env.NODE_ENV === "development",

  // Capture unhandled promise rejections
  attachStacktrace: true
});
