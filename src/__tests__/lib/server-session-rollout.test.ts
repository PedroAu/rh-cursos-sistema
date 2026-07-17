import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookieValue: undefined as string | undefined,
  decodeSession: vi.fn(),
  readSSRSession: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: vi.fn(() => (mocks.cookieValue ? { value: mocks.cookieValue } : undefined)),
    getAll: vi.fn(() => []),
  })),
}));

vi.mock("@/lib/auth", () => ({
  SESSION_COOKIE: "rh_cursos_demo_session",
  decodeSession: (...args: unknown[]) => mocks.decodeSession(...args),
}));

vi.mock("@/lib/supabase/session", () => ({
  createSupabaseSSRClient: vi.fn(() => ({ auth: {} })),
  readSSRSession: (...args: unknown[]) => mocks.readSSRSession(...args),
}));

describe("getServerSession REC-204 rollout", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.SSR_AUTH_ROLLOUT_ACCOUNTS = "rollout@example.com";
    mocks.cookieValue = undefined;
    mocks.decodeSession.mockReset();
    mocks.readSSRSession.mockReset();
    mocks.decodeSession.mockResolvedValue(null);
  });

  it("uses SSR for an allowlisted account even when an old HMAC exists", async () => {
    mocks.cookieValue = "legacy-token";
    mocks.decodeSession.mockResolvedValue({
      role: "admin",
      email: "rollout@example.com",
      name: "Old",
    });
    mocks.readSSRSession.mockResolvedValue({
      status: "active",
      aal: "aal2",
      role: "admin",
      email: "rollout@example.com",
      name: "Fresh",
    });

    const { getServerSession } = await import("@/lib/server-session");
    await expect(getServerSession()).resolves.toEqual({
      role: "admin",
      email: "rollout@example.com",
      name: "Fresh",
    });
  });

  it("fails closed when an allowlisted legacy account has no SSR session", async () => {
    mocks.cookieValue = "legacy-token";
    mocks.decodeSession.mockResolvedValue({
      role: "admin",
      email: "rollout@example.com",
      name: "Old",
    });
    mocks.readSSRSession.mockResolvedValue({ status: "none" });

    const { getServerSession } = await import("@/lib/server-session");
    await expect(getServerSession()).resolves.toBeNull();
  });
});
