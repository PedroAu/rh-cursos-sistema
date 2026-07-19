import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const originalEnv = {
  SUPABASE_FUNCTIONS_URL: process.env.SUPABASE_FUNCTIONS_URL,
  NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL: process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL,
  SUPABASE_URL: process.env.SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
};

describe("app/api/functions/[name] route", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    process.env.SUPABASE_FUNCTIONS_URL = "";
    process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL = "";
    process.env.SUPABASE_URL = "";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "";
  });

  afterEach(() => {
    process.env.SUPABASE_FUNCTIONS_URL = originalEnv.SUPABASE_FUNCTIONS_URL;
    process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL = originalEnv.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL;
    process.env.SUPABASE_URL = originalEnv.SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalEnv.NEXT_PUBLIC_SUPABASE_URL;
  });

  it("prefers server-side functions url and forwards only the required headers", async () => {
    process.env.SUPABASE_FUNCTIONS_URL = "https://server-functions.example.com/functions/v1";
    process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL = "https://public-functions.example.com/functions/v1";

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const { POST } = await import("../../../../app/api/functions/[name]/route");

    // Função de passthrough (não-admin): sem autorização SSR, apenas repasse.
    // REC-204 Fase B removeu o encaminhamento de `x-rh-session`.
    await POST(
      new Request("http://localhost/api/functions/leads", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer publishable",
          apikey: "publishable",
          "x-rh-client-ip": "198.51.100.10",
        },
        body: JSON.stringify({ resource: "leads", action: "list" }),
      }),
      { params: Promise.resolve({ name: "leads" }) }
    );

    expect(fetchMock).toHaveBeenCalledWith(
      new URL("https://server-functions.example.com/functions/v1/leads"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ resource: "leads", action: "list" }),
        headers: expect.any(Headers),
      })
    );

    const headers = fetchMock.mock.calls[0]?.[1]?.headers as Headers;
    expect(headers.get("authorization")).toBe("Bearer publishable");
    expect(headers.get("apikey")).toBe("publishable");
    expect(headers.has("x-rh-session")).toBe(false);
    expect(headers.get("origin")).toBe("http://localhost");
    expect(headers.get("x-forwarded-for")).toBe("198.51.100.10");
    expect(headers.get("x-real-ip")).toBe("198.51.100.10");
    expect(headers.has("cf-connecting-ip")).toBe(false);
  });

  it("falls back to supabase url when no explicit functions host exists", async () => {
    process.env.SUPABASE_URL = "https://project-ref.supabase.co";

    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const { GET } = await import("../../../../app/api/functions/[name]/route");

    const response = await GET(new Request("http://localhost/api/functions/leads"), {
      params: Promise.resolve({ name: "leads" }),
    });

    expect(fetchMock.mock.calls[0]?.[0]).toEqual(
      new URL("https://project-ref.supabase.co/functions/v1/leads")
    );
    // REC-408 (AC4): a resposta do BFF autenticado é no-store, sem propagar cache do upstream.
    expect(response.headers.get("Cache-Control")).toContain("no-store");
  });

  it("forwards DELETE requests to the upstream functions host", async () => {
    process.env.SUPABASE_FUNCTIONS_URL = "https://server-functions.example.com/functions/v1";

    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const { DELETE } = await import("../../../../app/api/functions/[name]/route");

    await DELETE(
      new Request("http://localhost/api/functions/leads", {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer publishable",
          apikey: "publishable",
        },
        body: JSON.stringify({ resource: "leads", action: "delete", id: "lead-1" }),
      }),
      { params: Promise.resolve({ name: "leads" }) }
    );

    expect(fetchMock).toHaveBeenCalledWith(
      new URL("https://server-functions.example.com/functions/v1/leads"),
      expect.objectContaining({
        method: "DELETE",
        body: JSON.stringify({ resource: "leads", action: "delete", id: "lead-1" }),
      })
    );
  });

  it("returns 503 when no functions host is configured", async () => {
    const { POST } = await import("../../../../app/api/functions/[name]/route");

    const response = await POST(
      new Request("http://localhost/api/functions/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "Test" }),
      }),
      { params: Promise.resolve({ name: "leads" }) }
    );

    expect(response.status).toBe(503);
    // REC-408 (AC4): erros do BFF (inclusive 503) também são no-store.
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    const body = await response.json();
    expect(body).toEqual({ ok: false, error: "Supabase Functions não configurado." });
  });
});
