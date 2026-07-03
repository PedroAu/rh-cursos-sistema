// Rate limiter global via Postgres (rate_limit_increment RPC).
// Fallback automático para Map in-memory se o banco não responder em 300ms —
// nunca bloqueia o fluxo principal por falha no rate limiter.
//
// A função rate_limit_increment é SECURITY DEFINER e só pode ser chamada
// via service_role (SUPABASE_SERVICE_ROLE_KEY). Se a key não estiver
// configurada, cai no fallback in-memory silenciosamente.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.106.2";

interface Entry {
  count: number;
  resetTime: number;
}

// Fallback in-memory (per-isolate, best-effort)
const fallbackStore = new Map<string, Entry>();
const fallbackCleanup = setInterval(() => {
  const now = Date.now();
  for (const [identifier, entry] of fallbackStore.entries()) {
    if (entry.resetTime < now) {
      fallbackStore.delete(identifier);
    }
  }
}, 5 * 60 * 1000);

Deno.unrefTimer(fallbackCleanup);

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
}

export const rateLimitConfigs = {
  enrollment: { windowMs: 60 * 1000, maxRequests: 20 },
  lead: { windowMs: 60 * 1000, maxRequests: 10 },
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 },
  admin: { windowMs: 60 * 1000, maxRequests: 30 },
} as const;

function checkFallback(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
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
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    retryAfter: 0,
  };
}

async function checkPostgres(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult | null> {
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  if (!serviceRoleKey || !supabaseUrl) return null;

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const timeoutMs = 300;
  const rpc = client.rpc("rate_limit_increment", {
    p_identifier: identifier,
    p_window_ms: config.windowMs,
    p_max_requests: config.maxRequests,
  });

  // Race entre a RPC e um timeout de 300ms
  type RpcResult = { data: number | null; error: { message: string } | null };
  const result = await Promise.race([
    rpc as Promise<RpcResult>,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
  ]);

  if (result === null || result.error || result.data === null) return null;

  const count = result.data;
  const windowMs = config.windowMs;
  const windowStart = Math.floor(Date.now() / windowMs) * windowMs;
  const retryAfter = Math.ceil((windowStart + windowMs - Date.now()) / 1000);

  if (count > config.maxRequests) {
    return { allowed: false, remaining: 0, retryAfter };
  }

  return {
    allowed: true,
    remaining: Math.max(0, config.maxRequests - count),
    retryAfter: 0,
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
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
