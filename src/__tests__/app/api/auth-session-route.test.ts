import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookies: {
    get: vi.fn(),
  },
  signOut: vi.fn(),
  checkRateLimit: vi.fn(),
  supabaseAdmin: null as
    | null
    | {
        auth: {
          admin: {
            signOut: typeof vi.fn;
          };
        };
      },
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => mocks.cookies),
}));

vi.mock("@/lib/server-session", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  get supabaseAdmin() {
    return mocks.supabaseAdmin;
  },
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: (...args: unknown[]) => mocks.checkRateLimit(...args),
  clientIp: vi.fn(() => "203.0.113.9"),
  rateLimitConfigs: {
    auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 },
    authGlobalLogout: { windowMs: 60 * 1000, maxRequests: 5 },
    enrollment: { windowMs: 60 * 1000, maxRequests: 20 },
    lead: { windowMs: 60 * 1000, maxRequests: 10 },
    admin: { windowMs: 60 * 1000, maxRequests: 30 },
  },
}));

describe("app/api/auth/session DELETE", () => {
  beforeEach(() => {
    mocks.signOut.mockReset();
    mocks.checkRateLimit.mockReset();
    mocks.checkRateLimit.mockResolvedValue({ allowed: true, remaining: 4, retryAfter: 0 });
    mocks.cookies.get.mockReset();
    mocks.supabaseAdmin = null;
  });

  it("falls back to local-only logout when there is no service-role client", async () => {
    const { DELETE } = await import("../../../../app/api/auth/session/route");

    const response = await DELETE(
      new Request("http://localhost/api/auth/session", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: "jwt-token" }),
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      mode: "local-only",
      revoked: false,
    });
  });

  it("reports global logout when Supabase session revocation succeeds", async () => {
    mocks.signOut.mockResolvedValue({ error: null });
    mocks.supabaseAdmin = {
      auth: {
        admin: {
          signOut: mocks.signOut,
        },
      },
    };

    const { DELETE } = await import("../../../../app/api/auth/session/route");

    const response = await DELETE(
      new Request("http://localhost/api/auth/session", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: "jwt-token" }),
      })
    );

    expect(mocks.signOut).toHaveBeenCalledWith("jwt-token", "global");
    await expect(response.json()).resolves.toEqual({
      ok: true,
      mode: "global",
      revoked: true,
    });
  });

  it("keeps the response local-only when global revocation returns an error", async () => {
    mocks.signOut.mockResolvedValue({ error: { message: "boom" } });
    mocks.supabaseAdmin = {
      auth: {
        admin: {
          signOut: mocks.signOut,
        },
      },
    };

    const { DELETE } = await import("../../../../app/api/auth/session/route");

    const response = await DELETE(
      new Request("http://localhost/api/auth/session", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: "jwt-token" }),
      })
    );

    await expect(response.json()).resolves.toEqual({
      ok: true,
      mode: "local-only",
      revoked: false,
    });
  });

  it("skips global revocation when the dedicated logout limiter blocks the request", async () => {
    mocks.checkRateLimit.mockResolvedValue({ allowed: false, remaining: 0, retryAfter: 60 });
    mocks.signOut.mockResolvedValue({ error: null });
    mocks.supabaseAdmin = {
      auth: {
        admin: {
          signOut: mocks.signOut,
        },
      },
    };

    const { DELETE } = await import("../../../../app/api/auth/session/route");

    const response = await DELETE(
      new Request("http://localhost/api/auth/session", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: "jwt-token" }),
      })
    );

    expect(mocks.signOut).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      ok: true,
      mode: "local-only",
      revoked: false,
    });
  });
});
