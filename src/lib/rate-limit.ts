// Rate limiter global via Postgres (rate_limit_increment RPC).
// Fallback automático para Map in-memory se o banco não responder em 300ms —
// nunca bloqueia o fluxo principal por falha no rate limiter.
//
// Porta Node/Next.js do rate limiter usado nas Edge Functions
// (supabase/functions/_shared/rate-limit.ts). Usa o mesmo RPC
// `rate_limit_increment` (migration 20260609100000_global_rate_limit.sql)
// via o client service_role (`supabaseAdmin`).

import { supabaseAdmin } from "@/lib/supabase/admin";

interface Entry {
  count: number;
  resetTime: number;
}

// Fallback in-memory (per-instance, best-effort)
const fallbackStore = new Map<string, Entry>();
const fallbackCleanup = setInterval(() => {
  const now = Date.now();
  for (const [identifier, entry] of fallbackStore.entries()) {
    if (entry.resetTime < now) {
      fallbackStore.delete(identifier);
    }
  }
}, 5 * 60 * 1000);

(fallbackCleanup as { unref?: () => void }).unref?.();

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export const rateLimitConfigs = {
  enrollment: { windowMs: 60 * 1000, maxRequests: 20 },
  lead: { windowMs: 60 * 1000, maxRequests: 10 },
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 },
  authGlobalLogout: { windowMs: 60 * 1000, maxRequests: 5 },
  admin: { windowMs: 60 * 1000, maxRequests: 30 }
} as const;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
}

function checkFallback(identifier: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const entry = fallbackStore.get(identifier);

  if (!entry || entry.resetTime < now) {
    fallbackStore.set(identifier, { count: 1, resetTime: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, retryAfter: 0 };
  }

  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000)
    };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    retryAfter: 0
  };
}

async function checkPostgres(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult | null> {
  if (!supabaseAdmin) return null;

  const timeoutMs = 300;
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);
  const rpc = supabaseAdmin
    .rpc("rate_limit_increment", {
      p_identifier: identifier,
      p_window_ms: config.windowMs,
      p_max_requests: config.maxRequests
    })
    .abortSignal(abortController.signal);

  type RpcResult = { data: number | null; error: { message: string } | null };
  let result: RpcResult;
  try {
    result = (await rpc) as RpcResult;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }

  if (result.error || result.data === null) return null;

  const count = result.data;
  const windowMs = config.windowMs;
  const windowStart = Math.floor(Date.now() / windowMs) * windowMs;
  const retryAfter = Math.ceil((windowStart + windowMs - Date.now()) / 1000);

  if (count >= config.maxRequests) {
    return { allowed: false, remaining: 0, retryAfter };
  }

  return {
    allowed: true,
    remaining: Math.max(0, config.maxRequests - count),
    retryAfter: 0
  };
}

export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  try {
    const pgResult = await checkPostgres(identifier, config);
    if (pgResult !== null) return pgResult;
  } catch {
    // falha silenciosa — degradação para in-memory
  }
  return checkFallback(identifier, config);
}

export function clientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
