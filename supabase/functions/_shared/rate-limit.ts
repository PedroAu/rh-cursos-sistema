// Rate limiter in-memory por instância da Edge Function.
// Portado de src/lib/rate-limiter.ts. Observação: cada isolate do Deno Deploy
// mantém seu próprio Map — é uma proteção best-effort contra abuso, não um
// limite global rígido. Para limite global, migrar para Postgres/Upstash.

interface Entry {
  count: number;
  resetTime: number;
}

const store = new Map<string, Entry>();

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export const rateLimitConfigs = {
  enrollment: { windowMs: 60 * 1000, maxRequests: 20 },
  lead: { windowMs: 60 * 1000, maxRequests: 10 },
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 },
  admin: { windowMs: 60 * 1000, maxRequests: 30 },
} as const;

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; retryAfter: number } {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || entry.resetTime < now) {
    store.set(identifier, { count: 1, resetTime: now + config.windowMs });
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

export function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
