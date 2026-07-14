import { describe, expect, it } from "vitest";

import { buildContentSecurityPolicy } from "@/lib/security-headers";

describe("buildContentSecurityPolicy", () => {
  it("permite a origem HTTP e WebSocket do Supabase local configurado", () => {
    const policy = buildContentSecurityPolicy("production", "http://127.0.0.1:54321");

    expect(policy).toContain("http://127.0.0.1:54321");
    expect(policy).toContain("ws://127.0.0.1:54321");
  });

  it("não adiciona loopback para um projeto Supabase hospedado", () => {
    const policy = buildContentSecurityPolicy(
      "production",
      "https://isolatedtestref.supabase.co"
    );

    expect(policy).not.toContain("http://127.0.0.1");
    expect(policy).not.toContain("http://localhost");
  });

  it("não confunde um hostname externo que contém 127.0.0.1 com loopback", () => {
    const policy = buildContentSecurityPolicy(
      "production",
      "http://127.0.0.1.example.test:54321"
    );

    expect(policy).not.toContain("127.0.0.1.example.test");
  });
});
