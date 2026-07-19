import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookies: {
    get: vi.fn(),
    getAll: vi.fn(() => []),
    set: vi.fn(),
  },
  signOut: vi.fn(),
  signInWithPassword: vi.fn(),
  checkRateLimit: vi.fn(),
  signInSSR: vi.fn(),
  signOutSSR: vi.fn(),
  readSSRSession: vi.fn(),
  supabaseServerClient: null as
    | null
    | {
        auth: {
          signInWithPassword: ReturnType<typeof vi.fn>;
        };
      },
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

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: () => mocks.supabaseServerClient,
  isSupabaseServerConfigured: true,
}));

vi.mock("@/lib/supabase/admin", () => ({
  get supabaseAdmin() {
    return mocks.supabaseAdmin;
  },
}));

vi.mock("@/lib/supabase/session", () => ({
  isSupabaseSsrConfigured: true,
  createSupabaseSSRClient: vi.fn(() => ({ auth: {} })),
  signInSSR: (...args: unknown[]) => mocks.signInSSR(...args),
  signOutSSR: (...args: unknown[]) => mocks.signOutSSR(...args),
  readSSRSession: (...args: unknown[]) => mocks.readSSRSession(...args),
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

describe("app/api/auth/session POST", () => {
  beforeEach(() => {
    process.env.SSR_AUTH_ROLLOUT_ACCOUNTS = "";
    mocks.signInWithPassword.mockReset();
    mocks.signInSSR.mockReset();
    mocks.checkRateLimit.mockReset();
    mocks.checkRateLimit.mockResolvedValue({ allowed: true, remaining: 4, retryAfter: 0 });
    mocks.supabaseServerClient = {
      auth: {
        signInWithPassword: mocks.signInWithPassword,
      },
    };
  });

  it("uses only the SSR login path for an allowlisted account", async () => {
    process.env.SSR_AUTH_ROLLOUT_ACCOUNTS = "rollout@rhcursos.test";
    mocks.signInSSR.mockResolvedValue({
      status: "authenticated",
      aal: "aal2",
      role: "admin",
      email: "rollout@rhcursos.test",
      name: "Rollout",
    });

    const { POST } = await import("../../../../app/api/auth/session/route");
    const response = await POST(
      new Request("http://localhost/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "admin",
          email: "rollout@rhcursos.test",
          password: "valid-password",
          mfaCode: "123456",
        }),
      })
    );

    expect(mocks.signInSSR).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ email: "rollout@rhcursos.test", mfaCode: "123456" })
    );
    expect(mocks.signInWithPassword).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
    // REC-408 (AC3): login bem-sucedido é no-store.
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      authMode: "ssr",
      token: null,
      supabaseSession: null,
      aal: "aal2",
    });
  });

  it("requests MFA without emitting a legacy token for an allowlisted account", async () => {
    process.env.SSR_AUTH_ROLLOUT_ACCOUNTS = "rollout@rhcursos.test";
    mocks.signInSSR.mockResolvedValue({
      status: "mfa_required",
      factorId: "factor-redacted",
    });

    const { POST } = await import("../../../../app/api/auth/session/route");
    const response = await POST(
      new Request("http://localhost/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "admin",
          email: "rollout@rhcursos.test",
          password: "valid-password",
        }),
      })
    );

    expect(response.status).toBe(401);
    expect(mocks.signInWithPassword).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      authMode: "ssr",
      mfaRequired: true,
    });
  });

  it("blocks login attempts before Supabase auth when the rate limiter is exhausted", async () => {
    mocks.checkRateLimit.mockResolvedValue({ allowed: false, remaining: 0, retryAfter: 60 });

    const { POST } = await import("../../../../app/api/auth/session/route");

    const response = await POST(
      new Request("http://localhost/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "admin",
          email: "admin@rhcursos.test",
          password: "senha-invalida",
        }),
      })
    );

    expect(mocks.checkRateLimit).toHaveBeenCalledWith(
      "auth:203.0.113.9",
      expect.objectContaining({
        maxRequests: 5,
      })
    );
    expect(mocks.signInWithPassword).not.toHaveBeenCalled();
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("60");
    // REC-408 (AC3): resposta de rate limit também é no-store.
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Muitas tentativas. Tente novamente mais tarde.",
    });
  });

  it("rejects a valid user when the requested portal role does not match metadata", async () => {
    // REC-204 Fase B: o login é 100% SSR; a checagem de papel ocorre em
    // signInSSR, que devolve `unauthorized` no mismatch → 403.
    mocks.signInSSR.mockResolvedValue({ status: "unauthorized", role: "student" });

    const { POST } = await import("../../../../app/api/auth/session/route");
    const response = await POST(
      new Request("http://localhost/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "admin",
          email: "student@rhcursos.test",
          password: "valid-password",
        }),
      })
    );

    expect(mocks.signInWithPassword).not.toHaveBeenCalled();
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      authMode: "ssr",
      error: "Acesso nao autorizado.",
    });
  });

  it("rejects non-text multipart credentials instead of throwing", async () => {
    const form = new FormData();
    form.set("role", "admin");
    form.set("email", new Blob(["not-a-text-field"]), "email.txt");
    form.set("password", "valid-password");

    const { POST } = await import("../../../../app/api/auth/session/route");
    const response = await POST(
      new Request("http://localhost/api/auth/session", {
        method: "POST",
        body: form,
      })
    );

    expect(response.status).toBe(400);
    expect(mocks.signInWithPassword).not.toHaveBeenCalled();
  });
});

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
    expect(mocks.signOutSSR).toHaveBeenCalledTimes(1);
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
