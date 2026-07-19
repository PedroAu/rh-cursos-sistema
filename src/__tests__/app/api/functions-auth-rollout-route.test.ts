import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  requireServerRole: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    getAll: () => [],
    set: vi.fn(),
  })),
}));

vi.mock("@/lib/supabase/authorize", () => ({
  requireServerRole: mocks.requireServerRole,
}));

vi.mock("@/lib/supabase/session", () => ({
  isSupabaseSsrConfigured: true,
  createSupabaseSSRClient: vi.fn(() => ({ auth: { getUser: mocks.getUser } })),
}));

const originalEnv = {
  SUPABASE_FUNCTIONS_URL: process.env.SUPABASE_FUNCTIONS_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

// REC-204 Fase B (cutover total): `admin-resources` é autorizado
// EXCLUSIVAMENTE pela sessão SSR (`requireServerRole`). Não há mais allowlist
// nem fallback HMAC (`x-rh-session`) — token legado sozinho recebe 401 (AC6).
describe("REC-204 Fase B — admin-resources via SSR exclusiva no BFF", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    process.env.SUPABASE_FUNCTIONS_URL = "https://functions.example.com/functions/v1";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "server-service-role";
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    mocks.requireServerRole.mockResolvedValue({
      authorized: false,
      reason: "unauthenticated",
      role: null,
    });
  });

  afterEach(() => {
    process.env.SUPABASE_FUNCTIONS_URL = originalEnv.SUPABASE_FUNCTIONS_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalEnv.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("authorizes an admin through SSR authority and never forwards HMAC", async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "user-admin", email: "admin@example.com" } },
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
          "x-rh-ssr-admin-email": "spoofed@example.com",
        },
        body: JSON.stringify({ resource: "leads", action: "list" }),
      }),
      { params: Promise.resolve({ name: "admin-resources" }) }
    );

    expect(response.status).toBe(200);
    const headers = fetchMock.mock.calls[0]?.[1]?.headers as Headers;
    expect(headers.get("authorization")).toBe("Bearer server-service-role");
    expect(headers.get("apikey")).toBe("server-service-role");
    expect(headers.get("x-rh-ssr-admin-id")).toBe("user-admin");
    expect(headers.get("x-rh-ssr-admin-email")).toBe("admin@example.com");
    expect(headers.has("x-rh-session")).toBe(false);
  });

  it("rejects a legacy HMAC-only request with 401 (no SSR session, AC6)", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

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
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Sessão inválida ou expirada.",
    });
    // Fail-closed: nunca encaminha ao upstream sem sessão SSR válida.
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("blocks the next request after the admin account is downgraded", async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "user-admin", email: "admin@example.com" } },
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
