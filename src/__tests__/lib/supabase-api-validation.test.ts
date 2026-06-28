import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

const captureException = vi.fn();
vi.mock("@sentry/nextjs", () => ({
  captureException: (...args: unknown[]) => captureException(...args)
}));

import {
  ApiValidationError,
  isTransientError,
  validateResponse,
  withRetry
} from "@/lib/supabase/api-validation";

const context = { endpoint: "testEndpoint", resource: "test", schema: "testSchema" } as const;

beforeEach(() => {
  captureException.mockClear();
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("validateResponse", () => {
  const schema = z.array(z.object({ id: z.string(), nota: z.coerce.number() }));

  it("returns parsed data when the payload matches the schema", () => {
    const result = validateResponse([{ id: "a", nota: 5 }], schema, context);
    expect(result).toEqual([{ id: "a", nota: 5 }]);
  });

  it("coerces numeric-like fields (string -> number)", () => {
    const result = validateResponse([{ id: "a", nota: "4" }], schema, context);
    expect(result[0].nota).toBe(4);
  });

  it("throws ApiValidationError and logs to console + Sentry on mismatch", () => {
    expect(() => validateResponse([{ id: 123 }], schema, context)).toThrow(ApiValidationError);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(captureException).toHaveBeenCalledTimes(1);
  });

  it("includes endpoint and resource context on the error", () => {
    try {
      validateResponse(null, schema, context);
      throw new Error("expected to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiValidationError);
      const validationError = error as ApiValidationError;
      expect(validationError.endpoint).toBe("testEndpoint");
      expect(validationError.resource).toBe("test");
      expect(validationError.issues.length).toBeGreaterThan(0);
    }
  });
});

describe("isTransientError", () => {
  it("treats 5xx responses as transient", () => {
    expect(isTransientError({ status: 500 })).toBe(true);
    expect(isTransientError({ status: 503 })).toBe(true);
  });

  it("does not retry client errors", () => {
    for (const status of [400, 401, 403, 404, 409, 422]) {
      expect(isTransientError({ status })).toBe(false);
    }
  });

  it("treats network-style errors as transient", () => {
    expect(isTransientError(new Error("fetch failed"))).toBe(true);
    expect(isTransientError(new Error("read ECONNRESET"))).toBe(true);
    expect(isTransientError(new Error("network timeout"))).toBe(true);
  });

  it("treats Postgres connection SQLSTATE codes as transient", () => {
    expect(isTransientError({ code: "08006" })).toBe(true);
    expect(isTransientError({ code: "57P01" })).toBe(true);
  });

  it("does not retry PostgREST query errors with an application code", () => {
    expect(isTransientError({ code: "23505" })).toBe(false);
    expect(isTransientError({ code: "PGRST116" })).toBe(false);
  });

  it("returns false for unknown errors", () => {
    expect(isTransientError(new Error("validation failed"))).toBe(false);
    expect(isTransientError("boom")).toBe(false);
  });
});

describe("withRetry", () => {
  const noSleep = vi.fn(async (_ms: number) => undefined);

  beforeEach(() => {
    noSleep.mockClear();
  });

  it("returns immediately on success without retrying", async () => {
    const fn = vi.fn(async () => ({ data: "ok", error: null }));
    const result = await withRetry(fn, { sleep: noSleep });
    expect(result).toEqual({ data: "ok", error: null });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(noSleep).not.toHaveBeenCalled();
  });

  it("retries on transient supabase result errors then succeeds", async () => {
    const fn = vi
      .fn()
      .mockResolvedValueOnce({ data: null, error: { status: 503 } })
      .mockResolvedValueOnce({ data: null, error: { code: "08006" } })
      .mockResolvedValueOnce({ data: "ok", error: null });

    const result = await withRetry(fn, { sleep: noSleep });
    expect(result).toEqual({ data: "ok", error: null });
    expect(fn).toHaveBeenCalledTimes(3);
    expect(noSleep).toHaveBeenCalledTimes(2);
  });

  it("uses exponential backoff (100ms, 200ms, 400ms)", async () => {
    const fn = vi.fn(async () => ({ data: null, error: { status: 500 } }));
    await withRetry(fn, { sleep: noSleep, maxRetries: 3 });
    expect(noSleep.mock.calls.map((call) => call[0])).toEqual([100, 200, 400]);
    expect(fn).toHaveBeenCalledTimes(4);
  });

  it("does not retry non-transient result errors", async () => {
    const fn = vi.fn(async () => ({ data: null, error: { status: 404 } }));
    const result = await withRetry(fn, { sleep: noSleep });
    expect(result).toEqual({ data: null, error: { status: 404 } });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries thrown transient errors then rethrows after max retries", async () => {
    const fn = vi.fn(async () => {
      throw new Error("fetch failed");
    });
    await expect(withRetry(fn, { sleep: noSleep, maxRetries: 2 })).rejects.toThrow("fetch failed");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("rethrows non-transient thrown errors immediately", async () => {
    const fn = vi.fn(async () => {
      throw new Error("validation failed");
    });
    await expect(withRetry(fn, { sleep: noSleep })).rejects.toThrow("validation failed");
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
