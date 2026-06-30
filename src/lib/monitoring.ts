/**
 * Monitoring utilities for Sentry and Query logging diagnostics
 */

/**
 * Check if Sentry is configured
 */
export function isSentryConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);
}

/**
 * Check if Query logging is configured
 */
export function isQueryLoggingConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);
}

/**
 * Get monitoring configuration status
 */
export function getMonitoringStatus() {
  return {
    sentry: {
      configured: isSentryConfigured(),
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NEXT_PUBLIC_APP_ENV ?? process.env.NODE_ENV,
      samplingRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      performanceSamplingRate:
        process.env.NODE_ENV === "production" ? 0.1 : 1.0
    },
    queryLogging: {
      configured: isQueryLoggingConfigured(),
      slowQueryThreshold: 200,
      samplingRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      consoleLoggingEnabled: process.env.NODE_ENV === "development"
    },
    environment: process.env.NODE_ENV
  };
}

/**
 * Test Sentry connection (development only)
 */
export async function testSentryConnection(): Promise<void> {
  if (process.env.NODE_ENV !== "development") {
    console.warn("[Sentry] Testing is only available in development mode");
    return;
  }

  if (!isSentryConfigured()) {
    console.warn("[Sentry] Not configured. Set NEXT_PUBLIC_SENTRY_DSN to enable.");
    return;
  }

  try {
    // Dynamically import Sentry (client-side)
    if (typeof window !== "undefined") {
      const Sentry = await import("@sentry/nextjs");

      // Send a test message
      Sentry.captureMessage("Test message from Sentry", "info");

      console.log("[Sentry] Test message sent successfully");
      console.log(
        "[Sentry] Dashboard: https://sentry.io/organizations/YOUR-ORG/issues/"
      );
    }
  } catch (error) {
    console.error("[Sentry] Test failed:", error);
  }
}

/**
 * Print monitoring status to console (development only)
 */
export function printMonitoringStatus(): void {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  const status = getMonitoringStatus();

  console.group("[Monitoring Status]");
  console.log("Sentry:", {
    configured: status.sentry.configured,
    environment: status.sentry.environment,
    samplingRate: status.sentry.samplingRate
  });
  console.log("Query Logging:", {
    configured: status.queryLogging.configured,
    slowQueryThreshold: `${status.queryLogging.slowQueryThreshold}ms`,
    consoleLoggingEnabled: status.queryLogging.consoleLoggingEnabled
  });
  console.groupEnd();
}

/**
 * Initialize monitoring diagnostics (call from app initialization)
 */
export function initializeMonitoringDiagnostics(): void {
  if (typeof window === "undefined") return;

  if (process.env.NODE_ENV === "development") {
    printMonitoringStatus();

    // Add global test function for development
    (globalThis as typeof globalThis & { __testSentry?: () => void }).__testSentry = () => {
      testSentryConnection();
    };

    console.log("[Monitoring] Run __testSentry() in console to test Sentry connection");
  }
}
