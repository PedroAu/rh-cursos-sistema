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

    await POST(
      new Request("http://localhost/api/functions/admin-resources", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer publishable",
          apikey: "publishable",
          "x-rh-session": "session-token",
          "x-rh-client-ip": "198.51.100.10",
        },
        body: JSON.stringify({ resource: "courses", action: "list" }),
      }),
      { params: Promise.resolve({ name: "admin-resources" }) }
    );

    expect(fetchMock).toHaveBeenCalledWith(
      new URL("https://server-functions.example.com/functions/v1/admin-resources"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ resource: "courses", action: "list" }),
        headers: expect.any(Headers),
      })
    );

    const headers = fetchMock.mock.calls[0]?.[1]?.headers as Headers;
    expect(headers.get("authorization")).toBe("Bearer publishable");
    expect(headers.get("apikey")).toBe("publishable");
    expect(headers.get("x-rh-session")).toBe("session-token");
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

    await GET(new Request("http://localhost/api/functions/leads"), {
      params: Promise.resolve({ name: "leads" }),
    });

    expect(fetchMock.mock.calls[0]?.[0]).toEqual(
      new URL("https://project-ref.supabase.co/functions/v1/leads")
    );
  });
});
