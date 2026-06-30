import { createClient } from "@supabase/supabase-js";
import { wrapSupabaseWithQueryLogging } from "./query-logging-middleware";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabasePublishableKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null;

// Initialize query logging middleware if Supabase is configured
if (supabase) {
  wrapSupabaseWithQueryLogging(supabase, {
    slowQueryThreshold: 200,
    enableConsoleLogging: process.env.NODE_ENV === "development",
    enableSentryLogging: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
    logAllQueries: false,
    samplingRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0
  });
}
