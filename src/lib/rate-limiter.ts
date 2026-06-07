// Simple in-memory rate limiter with cleanup
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

export const rateLimitConfigs = {
  // Public endpoints - strict limits
  publicAPI: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 per minute

  // Authentication endpoints - very strict
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 per 15 minutes

  // Admin endpoints - moderate limits
  admin: { windowMs: 60 * 1000, maxRequests: 30 }, // 30 per minute

  // Enrollment endpoints - moderate limits
  enrollment: { windowMs: 60 * 1000, maxRequests: 20 }, // 20 per minute

  // Data retrieval - generous limits
  dataRetrieval: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 per minute
};

/**
 * Check if request exceeds rate limit
 * @param identifier - Unique identifier (IP, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns { allowed: boolean, remaining: number, retryAfter: number }
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; retryAfter: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // First request or window expired
  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      retryAfter: 0,
    };
  }

  // Within window
  if (entry.count < config.maxRequests) {
    entry.count++;
    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      retryAfter: 0,
    };
  }

  // Limit exceeded
  return {
    allowed: false,
    remaining: 0,
    retryAfter: Math.ceil((entry.resetTime - now) / 1000), // seconds
  };
}

/**
 * Get rate limit status for an identifier
 */
export function getRateLimitStatus(identifier: string, config: RateLimitConfig) {
  const entry = rateLimitStore.get(identifier);
  const now = Date.now();

  if (!entry || entry.resetTime < now) {
    return {
      count: 0,
      remaining: config.maxRequests,
      resetAt: new Date(now + config.windowMs),
    };
  }

  return {
    count: entry.count,
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetAt: new Date(entry.resetTime),
  };
}

/**
 * Reset rate limit for an identifier
 */
export function resetRateLimit(identifier: string) {
  rateLimitStore.delete(identifier);
}
