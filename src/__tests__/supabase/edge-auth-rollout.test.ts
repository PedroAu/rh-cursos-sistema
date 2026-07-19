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

// REC-204 Fase B: a autoridade única do Edge é `requireTrustedSsrAdmin`
// (identidade SSR + service-role). O verificador HMAC (`requireAdmin`/
// `decodeSession`/`getSessionToken`) foi removido — nenhum token HMAC autoriza.
describe("REC-204 Fase B — Edge auth via SSR trusted identity", () => {
  beforeEach(() => {
    env.clear();
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
