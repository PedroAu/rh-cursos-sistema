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
  status: "success" | "error";
  /**
   * REC-408: categoria sanitizada do erro (ex.: "timeout", "network",
   * "server_error"). Nunca contém a mensagem bruta, payload, token, e-mail ou
   * telefone — apenas um rótulo derivado do status/código/formato do erro (AC6).
   */
  errorCategory?: string;
  timestamp: string;
}

/**
 * Deriva uma categoria segura a partir de um erro de query, sem emitir nenhum
 * conteúdo textual bruto (mensagem, payload, parâmetros). Baseia-se apenas em
 * status HTTP, SQLSTATE do PostgREST e padrões estruturais da mensagem — o
 * texto original nunca sai (AC6).
 */
function classifyQueryError(error: unknown): string {
  if (error === null || error === undefined) return "unknown";

  if (typeof error === "object") {
    const candidate =
      (error as { status?: unknown }).status ?? (error as { statusCode?: unknown }).statusCode;
    if (typeof candidate === "number") {
      if (candidate === 401) return "unauthorized";
      if (candidate === 403) return "forbidden";
      if (candidate === 404) return "not_found";
      if (candidate === 409) return "conflict";
      if (candidate === 422) return "unprocessable";
      if (candidate === 429) return "rate_limited";
      if (candidate >= 500) return "server_error";
      if (candidate >= 400) return "bad_request";
    }

    if ("code" in error) {
      const code = String((error as { code?: unknown }).code ?? "");
      if (/^08/.test(code)) return "connection";
      if (/^23/.test(code)) return "integrity";
      if (/^40/.test(code)) return "transaction";
      if (/^53/.test(code)) return "resource_exhausted";
      if (/^57/.test(code)) return "operator_intervention";
      if (code) return "database_error";
    }
  }

  const message = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  if (/timeout|ETIMEDOUT/i.test(message)) return "timeout";
  if (/fetch failed|network|ECONNRESET|ECONNREFUSED|EAI_AGAIN|socket hang up/i.test(message)) {
    return "network";
  }

  return "error";
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

  function reportQuery(method: string, table: string, duration: number, error?: unknown) {
    const isSlow = duration > slowQueryThreshold;
    const status = error ? "error" : "success";
    const errorCategory = error ? classifyQueryError(error) : undefined;

    if (!error && !logAllQueries && !isSlow) return;
    if (Math.random() > samplingRate) return;

    recordQueryMetrics({
      method,
      table,
      duration,
      isSlow,
      status,
      errorCategory,
      timestamp: new Date().toISOString()
    });

    if (enableConsoleLogging) {
      logQueryToConsole(method, table, duration, isSlow, status, errorCategory);
    }

    if (enableSentryLogging && error) {
      captureFailedQuery(method, table, duration, errorCategory);
      return;
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
        }, (reason) => {
          reportQuery(method, table, performance.now() - startTime, reason);
          if (typeof onrejected === "function") {
            return onrejected(reason);
          }
          throw reason;
        })) as typeof builder.then;

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

function captureFailedQuery(
  method: string,
  table: string,
  duration: number,
  errorCategory?: string
): void {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;

  Sentry.addBreadcrumb({
    category: "database",
    message: `Failed ${method} query on table "${table}"`,
    level: "error",
    data: {
      method,
      table,
      duration: `${duration.toFixed(2)}ms`,
      // Apenas a categoria sanitizada — nunca a mensagem bruta do erro (AC6).
      errorCategory: errorCategory ?? "unknown"
    }
  });

  Sentry.captureMessage(
    `Failed query detected: ${method} on ${table} (${duration.toFixed(2)}ms)`,
    "error"
  );
}

/**
 * Log query metrics to console (development)
 */
function logQueryToConsole(
  method: string,
  table: string,
  duration: number,
  isSlow: boolean,
  status: "success" | "error",
  errorCategory?: string
): void {
  const durationStr = `${duration.toFixed(2)}ms`;
  const icon = status === "error" ? "❌" : isSlow ? "🐌" : "⚡";
  const color = status === "error" ? "color: red" : isSlow ? "color: orange" : "color: green";
  // Somente a categoria sanitizada é exibida — nunca a mensagem bruta (AC6).
  const suffix = status === "error" && errorCategory ? ` (${errorCategory})` : "";

  console.log(
    `%c${icon} [QUERY] ${method.toUpperCase()} "${table}" - ${durationStr}${suffix}`,
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
