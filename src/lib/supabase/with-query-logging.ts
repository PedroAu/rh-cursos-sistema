import type { SupabaseClient } from "@supabase/supabase-js";
import {
  wrapSupabaseWithQueryLogging,
  type QueryLogConfig
} from "./query-logging-middleware";

/**
 * Initialize a Supabase client with query logging enabled
 *
 * This should be called once when creating the Supabase client instance.
 *
 * @example
 * ```ts
 * import { createClient } from "@supabase/supabase-js";
 * import { initializeQueryLogging } from "@/lib/supabase/with-query-logging";
 *
 * const supabase = createClient(url, key);
 * initializeQueryLogging(supabase);
 * ```
 */
export function initializeQueryLogging(
  supabase: SupabaseClient | null,
  config?: QueryLogConfig
): void {
  if (!supabase) {
    console.warn("[Query Logging] Supabase client not configured");
    return;
  }

  wrapSupabaseWithQueryLogging(supabase, {
    slowQueryThreshold: 200,
    enableConsoleLogging: process.env.NODE_ENV === "development",
    enableSentryLogging: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
    logAllQueries: false,
    samplingRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    ...config
  });

  console.debug("[Query Logging] Initialized with Sentry integration");
}
