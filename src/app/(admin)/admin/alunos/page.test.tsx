import { screen } from "@testing-library/react";
import AdminAlunosPage from "@/app/(admin)/admin/alunos/page";
import { renderWithProviders } from "@/test/test-utils";

const { getAdminAlunos, getArchivedAdminEntities } = vi.hoisted(() => ({
  getAdminAlunos: vi.fn(),
  getArchivedAdminEntities: vi.fn(),
}));

vi.mock("@/lib/admin-data", () => ({
  getAdminAlunos,
  getArchivedAdminEntities,
}));

describe("AdminAlunosPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders aluno metrics and the shared CRUD table", async () => {
    getAdminAlunos.mockResolvedValue([
      {
        id: "aluno-1",
        fullName: "Maria Silva",
        email: "maria@example.com",
        cpf: "12345678900",
        phone: "11988887777",
        role: "Analista",
        organization: "RH Cursos",
        studentType: "PF",
        userId: "00000000-0000-0000-0000-000000000000",
        createdAt: "2026-06-01",
        updatedAt: "2026-06-02",
      },
      {
        id: "aluno-2",
        fullName: "Orgao Cliente",
        email: "cliente@example.com",
        cpf: "",
        phone: "",
        role: "",
        organization: "Prefeitura",
        studentType: "PJ",
        userId: "",
        createdAt: "2026-06-03",
        updatedAt: "2026-06-03",
      },
    ]);
    getArchivedAdminEntities.mockResolvedValue([]);

    renderWithProviders(
      await AdminAlunosPage({
        searchParams: Promise.resolve({
          query: "maria",
          type: "todos",
        }),
      }),
    );

    expect(getAdminAlunos).toHaveBeenCalledWith({
      query: "maria",
      type: "todos",
    });
    expect(screen.getByText("Total de alunos")).toBeInTheDocument();
    expect(screen.getByText("2 de 2 registros")).toBeInTheDocument();
    expect(screen.getAllByText("Maria Silva").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("maria@example.com").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("button", { name: "Novo" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Visualizar aluno Maria Silva" }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole("button", { name: "Editar aluno Maria Silva" }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole("button", { name: "Excluir aluno Maria Silva" }).length).toBeGreaterThanOrEqual(1);
  });
});
