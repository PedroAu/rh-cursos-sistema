import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { isLockdownActive, LOCKDOWN_RESPONSE_BODY } from "@/lib/lockdown";

describe("lockdown", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("isLockdownActive", () => {
    it("is inactive when INCIDENT_LOCKDOWN is unset (no regression)", () => {
      delete process.env.INCIDENT_LOCKDOWN;
      expect(isLockdownActive()).toBe(false);
    });

    it('is active when INCIDENT_LOCKDOWN is "true"', () => {
      process.env.INCIDENT_LOCKDOWN = "true";
      expect(isLockdownActive()).toBe(true);
    });

    it('is active when INCIDENT_LOCKDOWN is "1"', () => {
      process.env.INCIDENT_LOCKDOWN = "1";
      expect(isLockdownActive()).toBe(true);
    });

    it("is case-insensitive and tolerates surrounding whitespace", () => {
      process.env.INCIDENT_LOCKDOWN = "  TRUE  ";
      expect(isLockdownActive()).toBe(true);
    });

    it("is inactive for any other value", () => {
      process.env.INCIDENT_LOCKDOWN = "false";
      expect(isLockdownActive()).toBe(false);

      process.env.INCIDENT_LOCKDOWN = "0";
      expect(isLockdownActive()).toBe(false);

      process.env.INCIDENT_LOCKDOWN = "yes";
      expect(isLockdownActive()).toBe(false);
    });

    it("fails closed (returns true) when reading the env var throws", () => {
      const brokenEnv = new Proxy(
        {},
        {
          get() {
            throw new Error("simulated config read failure");
          },
        }
      ) as NodeJS.ProcessEnv;

      const originalProcessEnv = process.env;
      process.env = brokenEnv;

      try {
        expect(isLockdownActive()).toBe(true);
      } finally {
        process.env = originalProcessEnv;
      }
    });
  });

  describe("LOCKDOWN_RESPONSE_BODY", () => {
    it("does not leak internal details", () => {
      expect(LOCKDOWN_RESPONSE_BODY).toEqual({
        ok: false,
        error: "service_unavailable",
        reason: "lockdown",
      });
    });
  });
});
