import { afterEach, describe, expect, it, vi } from "vitest";

import { assertSafeWritableIntegrationEnv } from "../../../tests/helpers/safe-writable-env";

function configureBaseIntegrationEnv() {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://isolatedtestref.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "publishable-test-key");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL", "");
  vi.stubEnv("SUPABASE_FUNCTIONS_URL", "");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-test-key");
  vi.stubEnv("E2E_SUPABASE_PROJECT_REF", "isolatedtestref");
  vi.stubEnv("E2E_PRODUCTION_PROJECT_REF", "productionref");
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("assertSafeWritableIntegrationEnv", () => {
  it("blocks writes when the explicit isolated-test opt-in is absent", () => {
    configureBaseIntegrationEnv();

    expect(() => assertSafeWritableIntegrationEnv(process.env)).toThrow(/E2E_ALLOW_DATABASE_WRITES=1/);
  });

  it("blocks writes when the target is the declared production project", () => {
    configureBaseIntegrationEnv();
    vi.stubEnv("E2E_ALLOW_DATABASE_WRITES", "1");
    vi.stubEnv("E2E_TARGET_KIND", "isolated-test");
    vi.stubEnv("E2E_PRODUCTION_PROJECT_REF", "isolatedtestref");

    expect(() => assertSafeWritableIntegrationEnv(process.env)).toThrow(
      /E2E_SUPABASE_PROJECT_REF diferente de E2E_PRODUCTION_PROJECT_REF/
    );
  });

  it("blocks writes when the URL does not match the declared test project", () => {
    configureBaseIntegrationEnv();
    vi.stubEnv("E2E_ALLOW_DATABASE_WRITES", "1");
    vi.stubEnv("E2E_TARGET_KIND", "isolated-test");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://differentref.supabase.co");

    expect(() => assertSafeWritableIntegrationEnv(process.env)).toThrow(
      /NEXT_PUBLIC_SUPABASE_URL correspondente a E2E_SUPABASE_PROJECT_REF/
    );
  });

  it("blocks writes when an Edge Functions override targets another project", () => {
    configureBaseIntegrationEnv();
    vi.stubEnv("E2E_ALLOW_DATABASE_WRITES", "1");
    vi.stubEnv("E2E_TARGET_KIND", "isolated-test");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL", "https://productionref.supabase.co/functions/v1");

    expect(() => assertSafeWritableIntegrationEnv(process.env)).toThrow(
      /SUPABASE_FUNCTIONS_URL correspondente ao projeto isolado/
    );
  });

  it("validates public and server-side Functions overrides independently", () => {
    configureBaseIntegrationEnv();
    vi.stubEnv("E2E_ALLOW_DATABASE_WRITES", "1");
    vi.stubEnv("E2E_TARGET_KIND", "isolated-test");
    vi.stubEnv(
      "NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL",
      "https://isolatedtestref.supabase.co/functions/v1"
    );
    vi.stubEnv("SUPABASE_FUNCTIONS_URL", "https://productionref.supabase.co/functions/v1");

    expect(() => assertSafeWritableIntegrationEnv(process.env)).toThrow(
      /SUPABASE_FUNCTIONS_URL correspondente ao projeto isolado/
    );
  });

  it("allows an explicitly approved custom Functions origin", () => {
    configureBaseIntegrationEnv();
    vi.stubEnv("E2E_ALLOW_DATABASE_WRITES", "1");
    vi.stubEnv("E2E_TARGET_KIND", "isolated-test");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL", "https://functions.test.internal/v1");
    vi.stubEnv("E2E_APPROVED_FUNCTIONS_ORIGIN", "https://functions.test.internal");

    expect(() => assertSafeWritableIntegrationEnv(process.env)).not.toThrow();
  });

  it("allows writes only when all isolated-project controls agree", () => {
    configureBaseIntegrationEnv();
    vi.stubEnv("E2E_ALLOW_DATABASE_WRITES", "1");
    vi.stubEnv("E2E_TARGET_KIND", "isolated-test");

    expect(() => assertSafeWritableIntegrationEnv(process.env)).not.toThrow();
  });

  it("allows the standard local Supabase stack only with an additional explicit opt-in", () => {
    configureBaseIntegrationEnv();
    vi.stubEnv("E2E_ALLOW_DATABASE_WRITES", "1");
    vi.stubEnv("E2E_TARGET_KIND", "isolated-test");
    vi.stubEnv("E2E_LOCAL_SUPABASE", "1");
    vi.stubEnv("E2E_SUPABASE_PROJECT_REF", "local");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL", "http://127.0.0.1:54321/functions/v1");

    expect(() => assertSafeWritableIntegrationEnv(process.env)).not.toThrow();
  });

  it("blocks a local URL when the additional local opt-in is absent", () => {
    configureBaseIntegrationEnv();
    vi.stubEnv("E2E_ALLOW_DATABASE_WRITES", "1");
    vi.stubEnv("E2E_TARGET_KIND", "isolated-test");
    vi.stubEnv("E2E_SUPABASE_PROJECT_REF", "local");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");

    expect(() => assertSafeWritableIntegrationEnv(process.env)).toThrow(
      /NEXT_PUBLIC_SUPABASE_URL correspondente a E2E_SUPABASE_PROJECT_REF/
    );
  });

  it("blocks non-loopback targets even when local mode is enabled", () => {
    configureBaseIntegrationEnv();
    vi.stubEnv("E2E_ALLOW_DATABASE_WRITES", "1");
    vi.stubEnv("E2E_TARGET_KIND", "isolated-test");
    vi.stubEnv("E2E_LOCAL_SUPABASE", "1");
    vi.stubEnv("E2E_SUPABASE_PROJECT_REF", "local");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://supabase.test.internal:54321");

    expect(() => assertSafeWritableIntegrationEnv(process.env)).toThrow(
      /NEXT_PUBLIC_SUPABASE_URL correspondente a E2E_SUPABASE_PROJECT_REF/
    );
  });

  it("blocks a Functions override outside the local Supabase origin", () => {
    configureBaseIntegrationEnv();
    vi.stubEnv("E2E_ALLOW_DATABASE_WRITES", "1");
    vi.stubEnv("E2E_TARGET_KIND", "isolated-test");
    vi.stubEnv("E2E_LOCAL_SUPABASE", "1");
    vi.stubEnv("E2E_SUPABASE_PROJECT_REF", "local");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL", "http://localhost:54321/functions/v1");

    expect(() => assertSafeWritableIntegrationEnv(process.env)).toThrow(
      /NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL correspondente ao projeto isolado/
    );
  });
});
