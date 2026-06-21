import nextConfig from "./next.config";

describe("next security headers", () => {
  it("defines baseline global security headers", async () => {
    const headersConfig = await nextConfig.headers?.();
    const globalHeaders = headersConfig?.find((entry) => entry.source === "/:path*")?.headers;
    const byKey = new Map(globalHeaders?.map((header) => [header.key, header.value]));

    expect(byKey.get("X-Content-Type-Options")).toBe("nosniff");
    expect(byKey.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(byKey.get("Permissions-Policy")).toContain("camera=()");
    expect(byKey.get("X-Frame-Options")).toBe("SAMEORIGIN");
    expect(byKey.get("Content-Security-Policy-Report-Only")).toContain("frame-ancestors 'self'");
  });

  it("includes HSTS only for production builds", async () => {
    const originalNodeEnv = process.env.NODE_ENV;

    vi.stubEnv("NODE_ENV", "development");
    const developmentHeaders = await nextConfig.headers?.();
    expect(
      developmentHeaders?.[0]?.headers.some((header) => header.key === "Strict-Transport-Security"),
    ).toBe(false);

    vi.stubEnv("NODE_ENV", "production");
    const productionHeaders = await nextConfig.headers?.();
    expect(
      productionHeaders?.[0]?.headers.find((header) => header.key === "Strict-Transport-Security")
        ?.value,
    ).toBe("max-age=15552000; includeSubDomains");

    vi.unstubAllEnvs();
    if (originalNodeEnv !== undefined) {
      vi.stubEnv("NODE_ENV", originalNodeEnv);
    }
  });
});
