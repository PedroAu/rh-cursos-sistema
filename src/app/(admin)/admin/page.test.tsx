import { screen } from "@testing-library/react";
import AdminDashboardPage from "@/app/(admin)/admin/page";
import { renderWithProviders } from "@/test/test-utils";

const { requireAdmin, getAdminDashboardSnapshot } = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  getAdminDashboardSnapshot: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAdmin,
}));

vi.mock("@/lib/admin-data", () => ({
  getAdminDashboardSnapshot,
}));

describe("AdminDashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders profile context and the operational snapshot", async () => {
    requireAdmin.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      nome: "Pedro",
      role: "admin",
    });
    getAdminDashboardSnapshot.mockResolvedValue({
      coursesCount: 8,
      turmasCount: 4,
      leadsCount: 12,
      profilesCount: 3,
      recentLeads: [
        {
          id: "lead-1",
          name: "Maria",
          email: "maria@example.com",
          phone: "11",
          type: "Curso",
          interest: "Lideranca",
          origin: "Site",
          crmStatus: "Novo",
          createdAt: "2026-06-10",
        },
      ],
      upcomingTurmas: [
        {
          id: "class-1",
          courseId: "course-1",
          instructorId: null,
          courseTitle: "Curso X",
          startDate: "2026-06-20",
          endDate: null,
          format: "Online",
          schedule: "08:00",
          location: "Zoom",
          status: "Aberta",
          seatsTotal: 20,
          updatedAt: "2026-06-01",
        },
      ],
      recentCourses: [
        {
          id: "course-1",
          title: "Curso X",
          slug: "curso-x",
          category: "Gestao",
          format: "Online",
          courseFormat: "Online",
          price: "R$ 1.000",
          status: "Aberta",
          courseStatus: "Ativo",
          highlighted: false,
          seatsLabel: "10 / 20 vagas",
          occupancy: 50,
          updatedAt: "2026-06-01",
        },
      ],
    });

    renderWithProviders(await AdminDashboardPage());

    expect(screen.getByText(/Bem-vindo, Pedro\./i)).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Atividades Recentes" })).toBeInTheDocument();
    expect(screen.getByText("Novo lead: Maria")).toBeInTheDocument();
    expect(screen.getAllByText("Curso X").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("heading", { name: "Relatório de Performance" })).toBeInTheDocument();
  });
});
