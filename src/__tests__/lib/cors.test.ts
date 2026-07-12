import { describe, expect, it } from "vitest";

import { isOriginAllowedWithConfig } from "../../../supabase/functions/_shared/cors";

describe("isOriginAllowedWithConfig", () => {
  it("does not allow loopback origins when localhost is disabled", () => {
    expect(
      isOriginAllowedWithConfig("http://localhost:4173", {
        allowLocalhost: false,
        appUrl: null,
        extraAllowedOrigins: [],
      })
    ).toBe(false);

    expect(
      isOriginAllowedWithConfig("http://127.0.0.1:3000", {
        allowLocalhost: false,
        appUrl: null,
        extraAllowedOrigins: [],
      })
    ).toBe(false);
  });

  it("allows loopback origins only when localhost is explicitly enabled", () => {
    expect(
      isOriginAllowedWithConfig("http://localhost:4173", {
        allowLocalhost: true,
        appUrl: null,
        extraAllowedOrigins: [],
      })
    ).toBe(true);

    expect(
      isOriginAllowedWithConfig("http://[::1]:3000", {
        allowLocalhost: true,
        appUrl: null,
        extraAllowedOrigins: [],
      })
    ).toBe(true);
  });

  it("still allows configured production origins", () => {
    expect(
      isOriginAllowedWithConfig("https://app.example.com", {
        allowLocalhost: false,
        appUrl: "https://app.example.com",
        extraAllowedOrigins: [],
      })
    ).toBe(true);
  });
});

