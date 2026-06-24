import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
}));

vi.mock('@/lib/supabase/admin', () => ({
  supabaseAdmin: {
    rpc: mocks.rpc,
  },
  isSupabaseAdminConfigured: true,
}));

import { checkRateLimit, rateLimitConfigs, clientIp } from '@/lib/rate-limit';

describe('rate-limit', () => {
  beforeEach(() => {
    mocks.rpc.mockReset();
  });

  describe('checkRateLimit — Postgres RPC success', () => {
    it('returns allowed=true when RPC count is within the configured limit', async () => {
      // count=1 with maxRequests=20 => allowed
      mocks.rpc.mockReturnValue(Promise.resolve({ data: 1, error: null }));

      const result = await checkRateLimit('user-a', rateLimitConfigs.enrollment);

      expect(result.allowed).toBe(true);
    });

    it('returns allowed=false with a retryAfter when RPC count exceeds maxRequests', async () => {
      // count=21 with maxRequests=20 => blocked
      mocks.rpc.mockReturnValue(Promise.resolve({ data: 21, error: null }));

      const result = await checkRateLimit('user-b', rateLimitConfigs.enrollment);

      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('calls supabaseAdmin.rpc with the expected RPC name and params', async () => {
      mocks.rpc.mockReturnValue(Promise.resolve({ data: 1, error: null }));

      await checkRateLimit('user-c', rateLimitConfigs.lead);

      expect(mocks.rpc).toHaveBeenCalledWith('rate_limit_increment', {
        p_identifier: 'user-c',
        p_window_ms: rateLimitConfigs.lead.windowMs,
        p_max_requests: rateLimitConfigs.lead.maxRequests,
      });
    });
  });

  describe('checkRateLimit — fallback in-memory behavior', () => {
    it('falls back to in-memory limiter when the RPC takes longer than 300ms (timeout race)', async () => {
      // Never resolves within the 300ms race window — checkPostgres should
      // resolve to null and the function should fall back to in-memory.
      mocks.rpc.mockReturnValue(new Promise(() => {}));

      const config = { windowMs: 60_000, maxRequests: 5 };
      const result = await checkRateLimit('timeout-identifier', config);

      // First call on a fresh identifier is always allowed by the fallback store.
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(config.maxRequests - 1);
    }, 1000);

    it('falls back to in-memory limiter when the RPC rejects', async () => {
      mocks.rpc.mockReturnValue(Promise.reject(new Error('connection refused')));

      const config = { windowMs: 60_000, maxRequests: 5 };
      const result = await checkRateLimit('rejected-identifier', config);

      expect(result.allowed).toBe(true);
    });

    it('falls back to in-memory limiter when the RPC resolves with an error', async () => {
      mocks.rpc.mockReturnValue(
        Promise.resolve({ data: null, error: { message: 'rpc failed' } })
      );

      const config = { windowMs: 60_000, maxRequests: 5 };
      const result = await checkRateLimit('rpc-error-identifier', config);

      expect(result.allowed).toBe(true);
    });

    it('blocks subsequent in-memory requests once maxRequests is exceeded for the same identifier', async () => {
      mocks.rpc.mockReturnValue(Promise.reject(new Error('always fails')));

      const config = { windowMs: 60_000, maxRequests: 2 };
      const identifier = 'exhaust-identifier';

      const first = await checkRateLimit(identifier, config);
      const second = await checkRateLimit(identifier, config);
      const third = await checkRateLimit(identifier, config);

      expect(first.allowed).toBe(true);
      expect(second.allowed).toBe(true);
      expect(third.allowed).toBe(false);
      expect(third.retryAfter).toBeGreaterThan(0);
    });
  });

  describe('checkRateLimit — bucket isolation across identifiers', () => {
    it('does not block a different identifier when one identifier has hit its limit', async () => {
      mocks.rpc.mockReturnValue(Promise.reject(new Error('always fails')));

      const config = { windowMs: 60_000, maxRequests: 1 };

      const blockedIdentifier = 'isolated-identifier-a';
      const freshIdentifier = 'isolated-identifier-b';

      const firstCallForBlocked = await checkRateLimit(blockedIdentifier, config);
      const secondCallForBlocked = await checkRateLimit(blockedIdentifier, config);
      const firstCallForFresh = await checkRateLimit(freshIdentifier, config);

      expect(firstCallForBlocked.allowed).toBe(true);
      expect(secondCallForBlocked.allowed).toBe(false);
      expect(firstCallForFresh.allowed).toBe(true);
    });
  });

  describe('rateLimitConfigs', () => {
    it('defines the auth config with a 15-minute window and a max of 5 requests', () => {
      expect(rateLimitConfigs.auth).toEqual({
        windowMs: 15 * 60 * 1000,
        maxRequests: 5,
      });
    });

    it('defines the enrollment config with a 1-minute window and a max of 20 requests', () => {
      expect(rateLimitConfigs.enrollment).toEqual({
        windowMs: 60 * 1000,
        maxRequests: 20,
      });
    });

    it('defines the lead config with a 1-minute window and a max of 10 requests', () => {
      expect(rateLimitConfigs.lead).toEqual({
        windowMs: 60 * 1000,
        maxRequests: 10,
      });
    });

    it('defines the admin config with a 1-minute window and a max of 30 requests', () => {
      expect(rateLimitConfigs.admin).toEqual({
        windowMs: 60 * 1000,
        maxRequests: 30,
      });
    });
  });

  describe('clientIp', () => {
    it('prefers cf-connecting-ip when present', () => {
      const request = new Request('https://example.com', {
        headers: {
          'cf-connecting-ip': '192.0.2.44',
          'x-forwarded-for': '203.0.113.5',
        },
      });

      expect(clientIp(request)).toBe('192.0.2.44');
    });

    it('reads the first IP from a comma-separated x-forwarded-for header', () => {
      const request = new Request('https://example.com', {
        headers: { 'x-forwarded-for': '203.0.113.5, 70.41.3.18, 150.172.238.178' },
      });

      expect(clientIp(request)).toBe('203.0.113.5');
    });

    it('trims whitespace around the extracted x-forwarded-for IP', () => {
      const request = new Request('https://example.com', {
        headers: { 'x-forwarded-for': '  203.0.113.5  , 70.41.3.18' },
      });

      expect(clientIp(request)).toBe('203.0.113.5');
    });

    it('falls back to x-real-ip when x-forwarded-for is absent', () => {
      const request = new Request('https://example.com', {
        headers: { 'x-real-ip': '198.51.100.23' },
      });

      expect(clientIp(request)).toBe('198.51.100.23');
    });

    it('returns "unknown" when neither header is present', () => {
      const request = new Request('https://example.com');

      expect(clientIp(request)).toBe('unknown');
    });
  });
});
