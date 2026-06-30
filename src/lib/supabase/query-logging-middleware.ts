import * as Sentry from "@sentry/nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Query logging configuration
 */
export interface QueryLogConfig {
  slowQueryThreshold?: number; // ms, default: 200ms
  enableConsoleLogging?: boolean; // default: true in dev, false in prod
  enableSentryLogging?: boolean; // default: true
  logAllQueries?: boolean; // default: false (only slow queries)
  samplingRate?: number; // 0-1, default: 1.0
}

interface QueryMetrics {
  method: string;
  table?: string;
  duration: number;
  isSlow: boolean;
  timestamp: string;
}

/**
 * Wrap Supabase query operations with performance logging
 *
 * Usage:
 * ```ts
 * const supabase = createClient(url, key);
 * wrapSupabaseWithQueryLogging(supabase);
 * ```
 */
export function wrapSupabaseWithQueryLogging(
  supabase: SupabaseClient,
  config: QueryLogConfig = {}
): void {
  const {
    slowQueryThreshold = 200,
    enableConsoleLogging = process.env.NODE_ENV === "development",
    enableSentryLogging = true,
    logAllQueries = false,
    samplingRate = 1.0
  } = config;

  // Store original methods
  const originalFrom = supabase.from.bind(supabase);

  // Override the from() method to intercept query operations
  supabase.from = function(table: string) {
    const query = originalFrom(table);

    // Intercept select()
    const originalSelect = query.select.bind(query);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (query.select as any) = function(...args: Parameters<typeof originalSelect>) {
      const startTime = performance.now();

      return originalSelect(...args).then((result) => {
        const duration = performance.now() - startTime;
        const isSlow = duration > slowQueryThreshold;

        if (logAllQueries || isSlow) {
          if (Math.random() <= samplingRate) {
            recordQueryMetrics({
              method: "select",
              table,
              duration,
              isSlow,
              timestamp: new Date().toISOString()
            });

            if (enableConsoleLogging) {
              logQueryToConsole("select", table, duration, isSlow);
            }

            if (enableSentryLogging && isSlow) {
              captureSlowQuery("select", table, duration);
            }
          }
        }

        return result;
      });
    };

    // Intercept insert()
    const originalInsert = query.insert.bind(query);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (query.insert as any) = function(...args: Parameters<typeof originalInsert>) {
      const startTime = performance.now();

      return originalInsert(...args).then((result) => {
        const duration = performance.now() - startTime;
        const isSlow = duration > slowQueryThreshold;

        if (logAllQueries || isSlow) {
          if (Math.random() <= samplingRate) {
            recordQueryMetrics({
              method: "insert",
              table,
              duration,
              isSlow,
              timestamp: new Date().toISOString()
            });

            if (enableConsoleLogging) {
              logQueryToConsole("insert", table, duration, isSlow);
            }

            if (enableSentryLogging && isSlow) {
              captureSlowQuery("insert", table, duration);
            }
          }
        }

        return result;
      });
    };

    // Intercept update()
    const originalUpdate = query.update.bind(query);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (query.update as any) = function(...args: Parameters<typeof originalUpdate>) {
      const startTime = performance.now();

      return originalUpdate(...args).then((result) => {
        const duration = performance.now() - startTime;
        const isSlow = duration > slowQueryThreshold;

        if (logAllQueries || isSlow) {
          if (Math.random() <= samplingRate) {
            recordQueryMetrics({
              method: "update",
              table,
              duration,
              isSlow,
              timestamp: new Date().toISOString()
            });

            if (enableConsoleLogging) {
              logQueryToConsole("update", table, duration, isSlow);
            }

            if (enableSentryLogging && isSlow) {
              captureSlowQuery("update", table, duration);
            }
          }
        }

        return result;
      });
    };

    // Intercept delete()
    const originalDelete = query.delete.bind(query);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (query.delete as any) = function(...args: Parameters<typeof originalDelete>) {
      const startTime = performance.now();

      return originalDelete(...args).then((result) => {
        const duration = performance.now() - startTime;
        const isSlow = duration > slowQueryThreshold;

        if (logAllQueries || isSlow) {
          if (Math.random() <= samplingRate) {
            recordQueryMetrics({
              method: "delete",
              table,
              duration,
              isSlow,
              timestamp: new Date().toISOString()
            });

            if (enableConsoleLogging) {
              logQueryToConsole("delete", table, duration, isSlow);
            }

            if (enableSentryLogging && isSlow) {
              captureSlowQuery("delete", table, duration);
            }
          }
        }

        return result;
      });
    };

    return query;
  };
}

/**
 * Log query metrics to Sentry
 */
function captureSlowQuery(
  method: string,
  table: string,
  duration: number
): void {
  // Only if Sentry is configured
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;

  const breadcrumb = {
    category: "database",
    message: `Slow ${method} query on table "${table}"`,
    level: "warning" as const,
    data: {
      method,
      table,
      duration: `${duration.toFixed(2)}ms`
    }
  };

  Sentry.addBreadcrumb(breadcrumb);

  // Also send as a low-priority issue
  if (duration > 500) {
    Sentry.captureMessage(
      `Slow query detected: ${method} on ${table} (${duration.toFixed(2)}ms)`,
      "info"
    );
  }
}

/**
 * Log query metrics to console (development)
 */
function logQueryToConsole(
  method: string,
  table: string,
  duration: number,
  isSlow: boolean
): void {
  const durationStr = `${duration.toFixed(2)}ms`;
  const icon = isSlow ? "🐌" : "⚡";
  const color = isSlow ? "color: orange" : "color: green";

  console.log(
    `%c${icon} [QUERY] ${method.toUpperCase()} "${table}" - ${durationStr}`,
    color
  );
}

/**
 * Record query metrics (for future dashboard/analytics)
 */
function recordQueryMetrics(metrics: QueryMetrics): void {
  // Store in window object for later retrieval by dashboard
  if (typeof window !== "undefined") {
    const key = "__queryMetrics";
    if (!window[key as keyof Window]) {
      window[key as keyof Window] = [];
    }

    const arr = window[key as keyof Window] as QueryMetrics[];
    arr.push(metrics);

    // Keep only last 100 queries to avoid memory leak
    if (arr.length > 100) {
      arr.shift();
    }
  }
}

/**
 * Retrieve collected query metrics (for diagnostics)
 */
export function getQueryMetrics(): QueryMetrics[] {
  if (typeof window !== "undefined") {
    return (window["__queryMetrics" as keyof Window] as QueryMetrics[]) ?? [];
  }
  return [];
}

/**
 * Clear collected query metrics
 */
export function clearQueryMetrics(): void {
  if (typeof window !== "undefined") {
    window["__queryMetrics" as keyof Window] = [] as unknown;
  }
}
