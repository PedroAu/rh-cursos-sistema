import { describe, expect, it } from "vitest";

import {
  getSsrAuthRolloutAccounts,
  isSsrAuthRolloutAccount,
} from "@/lib/supabase/auth-rollout";

describe("REC-204 SSR auth rollout allowlist", () => {
  it("normalizes, trims and deduplicates server-side accounts", () => {
    const accounts = getSsrAuthRolloutAccounts(" Test@Example.com,admin@example.com,test@example.com, ");

    expect([...accounts]).toEqual(["test@example.com", "admin@example.com"]);
    expect(isSsrAuthRolloutAccount("TEST@example.com", accounts)).toBe(true);
  });

  it("is restrictive by default", () => {
    const accounts = getSsrAuthRolloutAccounts("");

    expect(accounts.size).toBe(0);
    expect(isSsrAuthRolloutAccount("admin@example.com", accounts)).toBe(false);
  });
});
