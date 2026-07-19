import { readFileSync } from "node:fs";
import path from "node:path";

import { NextResponse } from "next/server";
import { describe, expect, it } from "vitest";

import {
  NO_STORE_CACHE_CONTROL,
  applyApiSecurityHeaders,
  applyNoStore,
  buildContentSecurityPolicy,
} from "@/lib/security-headers";

const repoRoot = process.cwd();

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

describe("CSP canônica de produção (REC-408 AC2)", () => {
  const policy = buildContentSecurityPolicy("production");

  it("não contém 'unsafe-eval'", () => {
    expect(policy).not.toContain("unsafe-eval");
  });

  it("mantém as diretivas mínimas de endurecimento", () => {
    expect(policy).toContain("base-uri 'self'");
    expect(policy).toContain("form-action 'self'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("default-src 'self'");
  });

  it("removeu a origem sem consumidor (cdn.jsdelivr.net)", () => {
    expect(policy).not.toContain("jsdelivr");
  });

  it("mantém apenas origens com consumidor rastreável", () => {
    // Google Analytics 4 (app/layout.tsx + src/lib/analytics.ts).
    expect(policy).toContain("https://www.googletagmanager.com");
    expect(policy).toContain("https://www.google-analytics.com");
    // Supabase (cliente de dados + realtime).
    expect(policy).toContain("https://*.supabase.co");
    expect(policy).toContain("wss://*.supabase.co");
  });

  it("emite exatamente um valor de política (uma única string ; -separada)", () => {
    // A política canônica é uma única string; não há segunda política concatenada.
    expect(policy.split("default-src")).toHaveLength(2);
  });
});

describe("Fonte única de CSP: nenhuma configuração concorrente ativa (REC-408 AC1)", () => {
  it("next.config.mjs não declara mais uma Content-Security-Policy", () => {
    const nextConfig = readFileSync(path.join(repoRoot, "next.config.mjs"), "utf8");
    expect(nextConfig).not.toMatch(/["']Content-Security-Policy["']/);
  });

  it("public/_headers não declara mais uma Content-Security-Policy ativa", () => {
    const headers = readFileSync(path.join(repoRoot, "public", "_headers"), "utf8");
    // Nenhuma linha de diretiva ativa (não comentada) `Content-Security-Policy:`.
    const activeCsp = headers
      .split("\n")
      .some((line) => /^\s*Content-Security-Policy\s*:/i.test(line));
    expect(activeCsp).toBe(false);
  });
});

describe("Contrato de cache no-store (REC-408 AC3/AC4)", () => {
  it("applyNoStore fixa Cache-Control: no-store", () => {
    const response = applyNoStore(NextResponse.json({ ok: true }));
    expect(response.headers.get("Cache-Control")).toBe(NO_STORE_CACHE_CONTROL);
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(response.headers.get("Pragma")).toBe("no-cache");
  });

  it("applyNoStore funciona sobre um Response cru (proxy do BFF)", () => {
    const response = applyNoStore(new Response("{}", { status: 401 }));
    expect(response.headers.get("Cache-Control")).toContain("no-store");
  });

  it("applyApiSecurityHeaders reutiliza o contrato no-store", () => {
    const response = applyApiSecurityHeaders(NextResponse.json({ ok: false }, { status: 503 }));
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });
});
