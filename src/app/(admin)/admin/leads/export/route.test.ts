import { GET } from "@/app/(admin)/admin/leads/export/route";

const { createAdminClient, createClient, getAdminLeads } = vi.hoisted(() => ({
  createAdminClient: vi.fn(),
  createClient: vi.fn(),
  getAdminLeads: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient,
}));

vi.mock("@/lib/admin-data", () => ({
  getAdminLeads,
}));

describe("GET /admin/leads/export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when the current user is not an admin", async () => {
    createClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
        }),
      },
    });

    const response = await GET(new Request("https://example.com/admin/leads/export"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
    expect(getAdminLeads).not.toHaveBeenCalled();
  });

  it("returns a csv export for admins and escapes quotes correctly", async () => {
    createClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "admin-1",
            },
          },
        }),
      },
    });

    createAdminClient.mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { role: "admin" },
            }),
          })),
        })),
      })),
    });

    getAdminLeads.mockResolvedValue([
      {
        id: 'lead-"1"',
        name: 'Maria "M"',
        email: "maria@example.com",
        phone: "11",
        type: "Curso",
        interest: 'Curso "Premium"',
        origin: "Site",
        crmStatus: "Novo",
        createdAt: "2026-06-10",
      },
    ]);

    const response = await GET(
      new Request(
        "https://example.com/admin/leads/export?query=maria&status=Novo&type=Curso",
      ),
    );

    expect(response.status).toBe(200);
    expect(getAdminLeads).toHaveBeenCalledWith({
      query: "maria",
      status: "Novo",
      type: "Curso",
    });
    expect(response.headers.get("Content-Type")).toContain("text/csv");
    await expect(response.text()).resolves.toContain('"Maria ""M"""');
  });
});
