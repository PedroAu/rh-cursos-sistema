import { beforeEach, describe, expect, it, vi } from "vitest";
import { assertAdminAction } from "@/lib/admin-action-auth";

const { createClient, createAdminClient } = vi.hoisted(() => ({
  createClient: vi.fn(),
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient,
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient,
}));

function mockSessionUser(user: { id: string } | null) {
  createClient.mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
      }),
    },
  });
}

function mockProfileRole(role: string | null) {
  const maybeSingle = vi.fn().mockResolvedValue({
    data: role ? { role } : null,
  });
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));

  createAdminClient.mockReturnValue({ from });

  return { from, select, eq, maybeSingle };
}

describe("assertAdminAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects requests without an authenticated user", async () => {
    mockSessionUser(null);

    await expect(assertAdminAction()).resolves.toBe(false);

    expect(createAdminClient).not.toHaveBeenCalled();
  });

  it("rejects authenticated non-admin users", async () => {
    mockSessionUser({ id: "user-1" });
    mockProfileRole("aluno");

    await expect(assertAdminAction()).resolves.toBe(false);
  });

  it("allows authenticated admin users", async () => {
    mockSessionUser({ id: "admin-1" });
    const profileQuery = mockProfileRole("admin");

    await expect(assertAdminAction()).resolves.toBe(true);

    expect(profileQuery.from).toHaveBeenCalledWith("profiles");
    expect(profileQuery.eq).toHaveBeenCalledWith("id", "admin-1");
  });
});
