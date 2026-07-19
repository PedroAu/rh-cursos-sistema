import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  readSSRSession: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    getAll: vi.fn(() => []),
  })),
}));

vi.mock("@/lib/supabase/session", () => ({
  createSupabaseSSRClient: vi.fn(() => ({ auth: {} })),
  readSSRSession: (...args: unknown[]) => mocks.readSSRSession(...args),
}));

// REC-204 Fase B (cutover total): getServerSession resolve a sessão admin
// EXCLUSIVAMENTE pela sessão Supabase SSR. O caminho legado (decodeSession do
// cookie HMAC) e a allowlist de rollout foram removidos — sem fallback HMAC.
describe("getServerSession — autoridade SSR exclusiva (REC-204 Fase B)", () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.readSSRSession.mockReset();
  });

  it("retorna a sessão quando há SSR ativa", async () => {
    mocks.readSSRSession.mockResolvedValue({
      status: "active",
      aal: "aal2",
      role: "admin",
      email: "admin@example.com",
      name: "Fresh",
    });

    const { getServerSession } = await import("@/lib/server-session");
    await expect(getServerSession()).resolves.toEqual({
      role: "admin",
      email: "admin@example.com",
      name: "Fresh",
    });
  });

  it("fecha (null) quando não há sessão SSR ativa — sem fallback HMAC", async () => {
    mocks.readSSRSession.mockResolvedValue({ status: "none" });

    const { getServerSession } = await import("@/lib/server-session");
    await expect(getServerSession()).resolves.toBeNull();
  });

  it("fecha (null) quando a sessão SSR ativa não tem papel resolvido", async () => {
    mocks.readSSRSession.mockResolvedValue({ status: "active", role: null });

    const { getServerSession } = await import("@/lib/server-session");
    await expect(getServerSession()).resolves.toBeNull();
  });
});
