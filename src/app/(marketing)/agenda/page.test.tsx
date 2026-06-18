import { screen } from "@testing-library/react";
import { vi } from "vitest";
import AgendaPage from "@/app/(marketing)/agenda/page";
import type { AgendaItem } from "@/lib/public-data";
import { renderWithProviders } from "@/test/test-utils";

const agendaItems: AgendaItem[] = [
  {
    id: "agenda-1",
    courseSlug: "dp-estrategico",
    courseTitle: "Departamento Pessoal Estrategico",
    startDate: "2026-07-12",
    endDate: "2026-07-13",
    schedule: "09:00 às 17:00",
    location: "Brasilia",
    format: "Presencial",
    status: "Turma aberta",
    remainingSeats: 12,
  },
  {
    id: "agenda-2",
    courseSlug: "lideranca-rh-publico",
    courseTitle: "Lideranca para RH e Gestao Publica",
    startDate: "2026-08-08",
    endDate: "2026-08-09",
    schedule: "19:00 às 22:00",
    location: "Ao vivo online",
    format: "Online",
    status: "Planejamento",
    remainingSeats: 18,
  },
];

vi.mock("@/lib/public-data", () => ({
  getAgendaItems: vi.fn(async () => agendaItems),
}));

describe("AgendaPage", () => {
  it("renders the wireframe agenda structure with hero, filters, calendar, highlights and newsletter", async () => {
    renderWithProviders(await AgendaPage());

    expect(screen.getByRole("heading", { name: "Agenda de Turmas" })).toBeInTheDocument();
    expect(screen.getByText(/Consulte as próximas turmas/i)).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Buscar turma" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Filtrar por status" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Calendário de turmas" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Turmas em destaque" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Não encontrou a data ideal?" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "E-mail para newsletter" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Receber aviso" })).toHaveAttribute("href", "/contato");
    expect(screen.getAllByRole("link", { name: "Ver curso" })[0]).toHaveAttribute(
      "href",
      "/cursos/dp-estrategico",
    );
  });

  it("starts in list view from search params and keeps filtered status in the controls", async () => {
    renderWithProviders(
      await AgendaPage({
        searchParams: Promise.resolve({
          visualizacao: "lista",
          status: "Planejamento",
          busca: "lideranca",
        }),
      }),
    );

    expect(screen.getByRole("heading", { name: "Lista de turmas" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Buscar turma" })).toHaveValue("lideranca");
    expect(screen.getByRole("combobox", { name: "Filtrar por status" })).toHaveValue("Planejamento");
    expect(screen.getByRole("heading", { name: "Lideranca para RH e Gestao Publica" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Precisa de uma data específica?" })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Departamento Pessoal Estrategico" }),
    ).not.toBeInTheDocument();
  });
});
