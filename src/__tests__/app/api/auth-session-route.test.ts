import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookies: {
    get: vi.fn(),
  },
  signOut: vi.fn(),
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

describe("app/api/auth/session DELETE", () => {
  beforeEach(() => {
    mocks.signOut.mockReset();
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
});
