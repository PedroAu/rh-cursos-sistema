import { screen } from "@testing-library/react";
import { vi } from "vitest";
import CoursesPage from "@/app/(marketing)/cursos/page";
import { courses } from "@/lib/site-data";
import { renderWithProviders } from "@/test/test-utils";

vi.mock("@/lib/public-data", () => ({
  getPublicCourses: vi.fn(async () => courses),
  getAgendaItems: vi.fn(async () =>
    courses.map((course, index) => ({
      id: `agenda-${course.slug}`,
      courseSlug: course.slug,
      courseTitle: course.title,
      startDate: `2026-07-${String(index + 12).padStart(2, "0")}`,
      endDate: null,
      schedule: "09:00 às 17:00",
      location: course.format,
      format: course.format,
      status: "Turma aberta",
      remainingSeats: 12,
    })),
  ),
}));

describe("CoursesPage", () => {
  it("renders the catalog with centered hero, filters, search and the wireframe CTA", async () => {
    renderWithProviders(await CoursesPage());

    expect(screen.getByRole("heading", { name: "Catálogo de Cursos" })).toBeInTheDocument();
    expect(screen.getByText(/Capacitação de excelência/i)).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Buscar curso pelo nome" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Filtrar por modalidade" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Filtrar por carga horária" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Filtrar por público-alvo" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Filtrar por próxima turma" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Filtrar por nível" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Todos" })).toHaveAttribute("href", "/cursos");
    expect(screen.getByRole("link", { name: "Departamento pessoal" })).toHaveAttribute(
      "href",
      "/cursos?trilha=Departamento+pessoal",
    );
    expect(screen.getByRole("heading", { name: "Cursos disponíveis" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Buscar" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Grade otimizada para consulta rápida em desktop/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Precisa de um treinamento personalizado?" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Solicitar Proposta/i })).toHaveAttribute(
      "href",
      "/in-company",
    );

    expect(screen.queryByText(/Escolha o formato com leitura clara/i)).not.toBeInTheDocument();
    expect(screen.queryByText("COMO ESCOLHER")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Ver Catálogo Completo/i })).not.toBeInTheDocument();
  });

  it("filters courses by trail and searches by course name through search params", async () => {
    renderWithProviders(
      await CoursesPage({
        searchParams: Promise.resolve({
          trilha: "Gestão de pessoas",
          busca: "lideranca",
        }),
      }),
    );

    expect(
      screen.getByRole("heading", { name: "Liderança para RH e Gestão Pública" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Departamento Pessoal Estratégico" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Limpar filtros" })).toHaveAttribute("href", "/cursos");
  });

  it("falls back to all courses when the provided trail is invalid", async () => {
    renderWithProviders(
      await CoursesPage({
        searchParams: Promise.resolve({
          trilha: "Trilha inexistente",
        }),
      }),
    );

    expect(screen.getByRole("link", { name: "Todos" })).toHaveAttribute("href", "/cursos");
    expect(screen.queryByText("Trilha: Trilha inexistente")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Departamento Pessoal Estratégico" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Liderança para RH e Gestão Pública" })).toBeInTheDocument();
  });

  it("matches search terms without accents and renders the empty state when nothing matches", async () => {
    const { rerender } = renderWithProviders(
      await CoursesPage({
        searchParams: Promise.resolve({
          busca: "licitacoes",
        }),
      }),
    );

    expect(
      screen.getByRole("heading", { name: "Licitações sem Ruído Operacional" }),
    ).toBeInTheDocument();

    rerender(
      await CoursesPage({
        searchParams: Promise.resolve({
          busca: "curso inexistente",
        }),
      }),
    );

    expect(screen.getByRole("heading", { name: "Nenhum curso encontrado" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Limpar filtros" })[0]).toHaveAttribute(
      "href",
      "/cursos",
    );
    expect(screen.getByRole("link", { name: "Falar com especialista" })).toHaveAttribute(
      "href",
      "/especialista",
    );
  });
});
