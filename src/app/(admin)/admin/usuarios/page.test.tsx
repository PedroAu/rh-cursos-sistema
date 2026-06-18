import { screen } from "@testing-library/react";
import AdminUsersPage from "@/app/(admin)/admin/usuarios/page";
import { renderWithProviders } from "@/test/test-utils";

const { getAdminUsers } = vi.hoisted(() => ({
  getAdminUsers: vi.fn(),
}));

vi.mock("@/lib/admin-data", () => ({
  getAdminUsers,
}));

describe("AdminUsersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders user metrics and the shared table with local pagination", async () => {
    getAdminUsers.mockResolvedValue([
      {
        id: "1",
        name: "Administrador",
        email: "admin@example.com",
        role: "admin",
        status: "ativo",
        createdAt: "2026-06-01",
      },
      {
        id: "2",
        name: "Aluno",
        email: "aluno@example.com",
        role: "aluno",
        status: "pendente",
        createdAt: "2026-06-02",
      },
    ]);

    renderWithProviders(
      await AdminUsersPage({
        searchParams: Promise.resolve({
          query: "example",
          role: "todos",
          status: "todos",
        }),
      }),
    );

    expect(getAdminUsers).toHaveBeenCalledWith({
      query: "example",
      role: "todos",
      status: "todos",
    });
    expect(screen.getByText("Total de usuários")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "2" })).toBeInTheDocument();
    expect(screen.getByText("2 de 2 registros")).toBeInTheDocument();
    expect(screen.getByText("admin@example.com")).toBeInTheDocument();
    expect(screen.getByText("aluno@example.com")).toBeInTheDocument();
  });
});
