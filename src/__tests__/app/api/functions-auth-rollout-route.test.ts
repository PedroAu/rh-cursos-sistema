import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  decodeSession: vi.fn(),
  getUser: vi.fn(),
  requireServerRole: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    getAll: () => [],
    set: vi.fn(),
  })),
}));

vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  return { ...actual, decodeSession: mocks.decodeSession };
});

vi.mock("@/lib/supabase/authorize", () => ({
  requireServerRole: mocks.requireServerRole,
}));

vi.mock("@/lib/supabase/session", () => ({
  isSupabaseSsrConfigured: true,
  createSupabaseSSRClient: vi.fn(() => ({ auth: { getUser: mocks.getUser } })),
}));

const originalEnv = {
  SUPABASE_FUNCTIONS_URL: process.env.SUPABASE_FUNCTIONS_URL,
  SSR_AUTH_ROLLOUT_ACCOUNTS: process.env.SSR_AUTH_ROLLOUT_ACCOUNTS,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

describe("REC-204 Phase A in /api/functions/[name]", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    process.env.SUPABASE_FUNCTIONS_URL = "https://functions.example.com/functions/v1";
    process.env.SSR_AUTH_ROLLOUT_ACCOUNTS = "rollout@example.com";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "server-service-role";
    mocks.decodeSession.mockResolvedValue(null);
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    mocks.requireServerRole.mockResolvedValue({
      authorized: false,
      reason: "unauthenticated",
      role: null,
    });
  });

  afterEach(() => {
    process.env.SUPABASE_FUNCTIONS_URL = originalEnv.SUPABASE_FUNCTIONS_URL;
    process.env.SSR_AUTH_ROLLOUT_ACCOUNTS = originalEnv.SSR_AUTH_ROLLOUT_ACCOUNTS;
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalEnv.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("authorizes an allowlisted account through fresh SSR authority and does not forward HMAC", async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "user-rollout", email: "rollout@example.com" } },
      error: null,
    });
    mocks.requireServerRole.mockResolvedValue({ authorized: true, role: "admin" });
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const { POST } = await import("../../../../app/api/functions/[name]/route");
    const response = await POST(
      new Request("http://localhost/api/functions/admin-resources", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer public-key",
          apikey: "public-key",
          "x-rh-session": "legacy-token",
          "x-rh-ssr-admin-id": "spoofed-user",
          "x-rh-ssr-admin-email": "rollout@example.com",
        },
        body: JSON.stringify({ resource: "leads", action: "list" }),
      }),
      { params: Promise.resolve({ name: "admin-resources" }) }
    );

    expect(response.status).toBe(200);
    const headers = fetchMock.mock.calls[0]?.[1]?.headers as Headers;
    expect(headers.get("authorization")).toBe("Bearer server-service-role");
    expect(headers.get("apikey")).toBe("server-service-role");
    expect(headers.get("x-rh-ssr-admin-id")).toBe("user-rollout");
    expect(headers.get("x-rh-ssr-admin-email")).toBe("rollout@example.com");
    expect(headers.has("x-rh-session")).toBe(false);
  });

  it("keeps a non-allowlisted account byte-compatible with the legacy path", async () => {
    mocks.decodeSession.mockResolvedValue({
      role: "admin",
      email: "legacy@example.com",
      name: "Legacy",
    });
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const { POST } = await import("../../../../app/api/functions/[name]/route");
    await POST(
      new Request("http://localhost/api/functions/admin-resources", {
        method: "POST",
        headers: {
          authorization: "Bearer public-key",
          apikey: "public-key",
          "x-rh-session": "legacy-token",
          "x-rh-ssr-admin-id": "spoofed-user",
          "x-rh-ssr-admin-email": "spoofed@example.com",
        },
        body: "{}",
      }),
      { params: Promise.resolve({ name: "admin-resources" }) }
    );

    const headers = fetchMock.mock.calls[0]?.[1]?.headers as Headers;
    expect(headers.get("authorization")).toBe("Bearer public-key");
    expect(headers.get("apikey")).toBe("public-key");
    expect(headers.get("x-rh-session")).toBe("legacy-token");
    expect(headers.has("x-rh-ssr-admin-id")).toBe(false);
    expect(headers.has("x-rh-ssr-admin-email")).toBe(false);
  });

  it("fails closed when an allowlisted legacy account has no SSR session", async () => {
    mocks.decodeSession.mockResolvedValue({
      role: "admin",
      email: "rollout@example.com",
      name: "Rollout",
    });

    const { POST } = await import("../../../../app/api/functions/[name]/route");
    const response = await POST(
      new Request("http://localhost/api/functions/admin-resources", {
        method: "POST",
        headers: { "x-rh-session": "legacy-token" },
        body: "{}",
      }),
      { params: Promise.resolve({ name: "admin-resources" }) }
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ ok: false, error: "Sessão SSR obrigatória." });
  });

  it("blocks the next request after the rollout account is downgraded", async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "user-rollout", email: "rollout@example.com" } },
      error: null,
    });
    mocks.requireServerRole.mockResolvedValue({
      authorized: false,
      reason: "insufficient_role",
      role: "student",
    });

    const { POST } = await import("../../../../app/api/functions/[name]/route");
    const response = await POST(
      new Request("http://localhost/api/functions/admin-resources", {
        method: "POST",
        body: "{}",
      }),
      { params: Promise.resolve({ name: "admin-resources" }) }
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ ok: false, error: "Acesso não autorizado." });
  });
});
