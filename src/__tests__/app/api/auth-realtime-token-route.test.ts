import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookies: {
    getAll: vi.fn(() => []),
    set: vi.fn(),
  },
  isSupabaseSsrConfigured: true,
  createSupabaseSSRClient: vi.fn(),
  requireServerRole: vi.fn(),
  checkRateLimit: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => mocks.cookies),
}));

vi.mock("@/lib/supabase/session", () => ({
  get isSupabaseSsrConfigured() {
    return mocks.isSupabaseSsrConfigured;
  },
  createSupabaseSSRClient: (...args: unknown[]) => mocks.createSupabaseSSRClient(...args),
}));

vi.mock("@/lib/supabase/authorize", () => ({
  requireServerRole: (...args: unknown[]) => mocks.requireServerRole(...args),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: (...args: unknown[]) => mocks.checkRateLimit(...args),
  clientIp: vi.fn(() => "203.0.113.9"),
  rateLimitConfigs: {
    admin: { windowMs: 60 * 1000, maxRequests: 30 },
  },
}));

function buildRequest() {
  return new Request("http://localhost/api/auth/realtime-token", { method: "GET" });
}

describe("app/api/auth/realtime-token GET", () => {
  beforeEach(() => {
    mocks.isSupabaseSsrConfigured = true;
    mocks.createSupabaseSSRClient.mockReset();
    mocks.requireServerRole.mockReset();
    mocks.getSession.mockReset();
    mocks.checkRateLimit.mockReset();
    mocks.checkRateLimit.mockResolvedValue({ allowed: true, remaining: 29, retryAfter: 0 });
    mocks.createSupabaseSSRClient.mockReturnValue({
      auth: { getSession: mocks.getSession },
    });
  });

  it("returns the access token and real expiry for an authenticated admin, with no-store", async () => {
    mocks.requireServerRole.mockResolvedValue({ authorized: true, role: "admin" });
    const expiresAtSeconds = 1_800_000_000;
    mocks.getSession.mockResolvedValue({
      data: { session: { access_token: "rt-access-token", expires_at: expiresAtSeconds } },
      error: null,
    });

    const { GET } = await import("../../../../app/api/auth/realtime-token/route");
    const response = await GET(buildRequest());

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    await expect(response.json()).resolves.toEqual({
      accessToken: "rt-access-token",
      expiresAt: expiresAtSeconds * 1000,
    });
    expect(mocks.requireServerRole).toHaveBeenCalledWith(expect.anything(), "admin");
  });

  it("returns 401 when there is no SSR session", async () => {
    mocks.requireServerRole.mockResolvedValue({ authorized: false, reason: "unauthenticated", role: null });

    const { GET } = await import("../../../../app/api/auth/realtime-token/route");
    const response = await GET(buildRequest());

    expect(response.status).toBe(401);
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(mocks.getSession).not.toHaveBeenCalled();
  });

  it("returns 403 when the session role is insufficient", async () => {
    mocks.requireServerRole.mockResolvedValue({ authorized: false, reason: "insufficient_role", role: "student" });

    const { GET } = await import("../../../../app/api/auth/realtime-token/route");
    const response = await GET(buildRequest());

    expect(response.status).toBe(403);
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(mocks.getSession).not.toHaveBeenCalled();
  });

  it("returns 429 when rate limited", async () => {
    mocks.checkRateLimit.mockResolvedValue({ allowed: false, remaining: 0, retryAfter: 30 });

    const { GET } = await import("../../../../app/api/auth/realtime-token/route");
    const response = await GET(buildRequest());

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("30");
    expect(mocks.requireServerRole).not.toHaveBeenCalled();
  });

  it("returns 503 when SSR auth is not configured", async () => {
    mocks.isSupabaseSsrConfigured = false;

    const { GET } = await import("../../../../app/api/auth/realtime-token/route");
    const response = await GET(buildRequest());

    expect(response.status).toBe(503);
    expect(mocks.checkRateLimit).not.toHaveBeenCalled();
  });

  it("never exposes the refresh token in the response body", async () => {
    mocks.requireServerRole.mockResolvedValue({ authorized: true, role: "admin" });
    mocks.getSession.mockResolvedValue({
      data: {
        session: {
          access_token: "rt-access-token",
          refresh_token: "super-secret-refresh",
          expires_at: 1_800_000_000,
        },
      },
      error: null,
    });

    const { GET } = await import("../../../../app/api/auth/realtime-token/route");
    const response = await GET(buildRequest());
    const body = await response.json();

    expect(body).not.toHaveProperty("refresh_token");
    expect(JSON.stringify(body)).not.toContain("super-secret-refresh");
  });
});
