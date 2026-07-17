import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const env = new Map<string, string>();
const edgeAuthModule = "../../../supabase/functions/_shared/auth.ts";

beforeAll(() => {
  vi.stubGlobal("Deno", {
    env: {
      get: (name: string) => env.get(name),
    },
  });
});

describe("REC-204 Edge auth rollout", () => {
  beforeEach(() => {
    env.clear();
    env.set("AUTH_SESSION_SECRET", "rec204-edge-test-secret-32-characters");
    env.set("SUPABASE_SERVICE_ROLE_KEY", "service-role-test-only");
  });

  it("accepts trusted SSR identity only with both service-role credentials", async () => {
    const { requireTrustedSsrAdmin } = await import(edgeAuthModule);
    const trusted = new Request("https://edge.test/admin-resources", {
      headers: {
        authorization: "Bearer service-role-test-only",
        apikey: "service-role-test-only",
        "x-rh-ssr-admin-id": "user-test",
        "x-rh-ssr-admin-email": "rollout@example.com",
      },
    });

    expect(requireTrustedSsrAdmin(trusted)).toMatchObject({
      role: "admin",
      userId: "user-test",
      email: "rollout@example.com",
    });

    const spoofed = new Request("https://edge.test/admin-resources", {
      headers: {
        authorization: "Bearer public-key",
        apikey: "public-key",
        "x-rh-ssr-admin-id": "user-test",
        "x-rh-ssr-admin-email": "rollout@example.com",
      },
    });
    expect(requireTrustedSsrAdmin(spoofed)).toBeNull();
  });

  it("rejects HMAC from an allowlisted account and preserves HMAC outside it", async () => {
    const { encodeSession, requireAdmin } = await import(edgeAuthModule);
    env.set("SSR_AUTH_ROLLOUT_ACCOUNTS", "rollout@example.com");

    const rolloutToken = await encodeSession({
      role: "admin",
      email: "rollout@example.com",
      name: "Rollout",
    });
    const legacyToken = await encodeSession({
      role: "admin",
      email: "legacy@example.com",
      name: "Legacy",
    });

    await expect(
      requireAdmin(new Request("https://edge.test", { headers: { "x-rh-session": rolloutToken } }))
    ).resolves.toBeNull();
    await expect(
      requireAdmin(new Request("https://edge.test", { headers: { "x-rh-session": legacyToken } }))
    ).resolves.toMatchObject({ email: "legacy@example.com" });
  });

  it("rejects incomplete internal identity even with service-role credentials", async () => {
    const { requireTrustedSsrAdmin } = await import(edgeAuthModule);
    const request = new Request("https://edge.test/admin-resources", {
      headers: {
        authorization: "Bearer service-role-test-only",
        apikey: "service-role-test-only",
        "x-rh-ssr-admin-email": "rollout@example.com",
      },
    });

    expect(requireTrustedSsrAdmin(request)).toBeNull();
  });
});
