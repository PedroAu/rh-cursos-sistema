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

  function reportQuery(method: string, table: string, duration: number) {
    const isSlow = duration > slowQueryThreshold;

    if (!logAllQueries && !isSlow) return;
    if (Math.random() > samplingRate) return;

    recordQueryMetrics({
      method,
      table,
      duration,
      isSlow,
      timestamp: new Date().toISOString()
    });

    if (enableConsoleLogging) {
      logQueryToConsole(method, table, duration, isSlow);
    }

    if (enableSentryLogging && isSlow) {
      captureSlowQuery(method, table, duration);
    }
  }

  /**
   * Envolve um método de query (select/insert/update/delete) para medir a
   * duração sem quebrar o encadeamento. Os filtros do postgrest-js (.eq,
   * .order, .not, .single, ...) fazem `return this` na mesma instância do
   * builder — então sobrescrever apenas o `.then()` dessa instância (em vez
   * de substituir o builder inteiro por uma Promise) preserva a cadeia e
   * ainda mede o tempo no momento real da resolução.
   */
  function wrapQueryMethod<T extends (...args: never[]) => { then: PromiseLike<unknown>["then"] }>(
    method: string,
    table: string,
    original: T
  ): T {
    return function (...args: Parameters<T>) {
      const startTime = performance.now();
      const builder = original(...args);
      const originalThen = builder.then.bind(builder);

      builder.then = ((onfulfilled, onrejected) =>
        originalThen((result) => {
          reportQuery(method, table, performance.now() - startTime);
          return typeof onfulfilled === "function" ? onfulfilled(result) : result;
        }, onrejected)) as typeof builder.then;

      return builder;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  }

  // Override the from() method to intercept query operations
  supabase.from = function(table: string) {
    const query = originalFrom(table);

    query.select = wrapQueryMethod("select", table, query.select.bind(query));
    query.insert = wrapQueryMethod("insert", table, query.insert.bind(query));
    query.update = wrapQueryMethod("update", table, query.update.bind(query));
    query.delete = wrapQueryMethod("delete", table, query.delete.bind(query));

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
