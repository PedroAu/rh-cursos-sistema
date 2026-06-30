import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_APP_ENV ?? process.env.NODE_ENV,

  // Error tracking sampling
  // 100% in development for comprehensive error tracking
  // 10% in production to manage volume
  sampleRate: 1.0,

  // Performance monitoring
  // 100% in development for detailed performance insights
  // 10% in production to manage quota
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Enable profiling for performance analysis
  profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Debug mode for development
  debug: process.env.NODE_ENV === "development",

  // Enable session replay for error context
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0.5,
  replaysOnErrorSampleRate: 1.0,

  // Capture unhandled promise rejections
  attachStacktrace: true,
  maxValueLength: 1024,

  // Enable client-side integrations
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true
    })
  ],

  // Configure breadcrumb tracking
  beforeBreadcrumb(breadcrumb) {
    // Skip uninteresting breadcrumbs in production
    if (process.env.NODE_ENV === "production") {
      if (breadcrumb.category === "console" && breadcrumb.level === "debug") {
        return null;
      }
    }
    return breadcrumb;
  },

  // Configure error filtering
  beforeSend(event, hint) {
    // Ignore specific errors that are not actionable
    if (hint.originalException instanceof TypeError) {
      if (
        hint.originalException.message?.includes("NetworkError") ||
        hint.originalException.message?.includes("timeout")
      ) {
        // Still capture, but mark as low priority
        event.level = "info";
      }
    }
    return event;
  }
});
