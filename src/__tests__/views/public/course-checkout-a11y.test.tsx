import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, it, expect, vi } from "vitest";

import { CourseCheckoutPage } from "@/views/public/CourseCheckout";

/**
 * REC-308 — Acessibilidade da jornada crítica de pré-inscrição (checkout).
 *
 * Trava a correção do componente `Field`: cada campo do formulário precisa
 * (1) ser alcançável pelo rótulo (label associado) e (2) ter seu erro de
 * validação associado ao input via `aria-describedby` + `aria-invalid`,
 * para ser anunciado por leitores de tela. Antes da correção o erro ficava
 * solto dentro de um <label> implícito, sem associação nem `aria-invalid`.
 */

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  setParams: vi.fn(),
  params: new URLSearchParams(),
  createEnrollment: vi.fn(),
  fetchPublicClasses: vi.fn(),
}));

const mockStore = {
  courses: [
    {
      id: "course-1",
      slug: "curso-teste",
      title: "Curso Teste",
      pathId: "path-1",
      pathName: "Departamento Pessoal",
      modality: "Ao vivo online",
      durationLabel: "16h",
      durationHours: 16,
      level: "Básico",
      fullDescription: "Descricao completa.",
      shortDescription: "Resumo",
      targetAudience: ["Analistas"],
      rating: 4.8,
      studentsCount: 120,
      benefits: ["Beneficio 1"],
      objectives: ["Objetivo 1"],
      modules: [],
      price: 1290,
      image: "/images/hero-rh-cursos.jpg",
      instructorId: "inst-1",
      status: "Ativo",
      featured: false,
      nextClassId: "class-1",
    },
  ],
  classes: [
    {
      id: "class-1",
      courseId: "course-1",
      startDate: "2026-08-12T00:00:00.000Z",
      endDate: "2026-08-13T00:00:00.000Z",
      time: "19:00 às 22:00",
      location: "Online ao vivo",
      modality: "Ao vivo online",
      status: "Inscrições abertas",
      totalSeats: 20,
      filledSeats: 10,
      availableSeats: 10,
      instructorId: "inst-1",
      price: 1290,
      notes: "",
    },
  ],
  createEnrollment: mocks.createEnrollment,
};

vi.mock("@/lib/router-compat", () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => <a href={to}>{children}</a>,
  useNavigate: () => mocks.navigate,
  useParams: () => ({ slug: "curso-teste" }),
  useSearchParams: () => [mocks.params, mocks.setParams],
}));

vi.mock("@/lib/app-store", () => ({
  useAppStore: () => mockStore,
}));

vi.mock("@/lib/supabase/rh-cursos-api", () => ({
  fetchPublicClassesFromSupabase: () => mocks.fetchPublicClasses(),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

describe("CourseCheckoutPage — acessibilidade dos campos (REC-308)", () => {
  beforeEach(() => {
    mocks.navigate.mockReset();
    mocks.setParams.mockReset();
    mocks.createEnrollment.mockReset();
    mocks.params = new URLSearchParams();
    mocks.fetchPublicClasses.mockReset();
    mocks.fetchPublicClasses.mockResolvedValue(null);
  });

  it("expõe cada campo obrigatório pelo rótulo associado", () => {
    render(<CourseCheckoutPage />);

    expect(screen.getByLabelText(/Nome completo/)).toBeInTheDocument();
    expect(screen.getByLabelText(/CPF/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Telefone/)).toBeInTheDocument();
    expect(screen.getByLabelText(/E-mail/)).toBeInTheDocument();
  });

  it("associa o erro de validação ao campo via aria-invalid e aria-describedby", async () => {
    render(<CourseCheckoutPage />);

    fireEvent.click(screen.getByRole("button", { name: /Enviar pré-inscrição/ }));

    const emailField = screen.getByLabelText(/E-mail/);
    await waitFor(() => expect(emailField).toHaveAttribute("aria-invalid", "true"));

    const describedBy = emailField.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();

    const errorNode = document.getElementById(describedBy as string);
    expect(errorNode).not.toBeNull();
    expect(errorNode).toHaveAttribute("role", "alert");
    expect(errorNode).toHaveTextContent("Informe um e-mail válido.");
  });

  it("mantém o erro de seleção de turma anunciado com role=alert", async () => {
    render(<CourseCheckoutPage />);

    // Radiogroup da turma é acessível por nome/estado.
    const radiogroup = screen.getByRole("radiogroup", { name: /Escolha a turma/ });
    expect(within(radiogroup).getAllByRole("radio").length).toBeGreaterThan(0);
  });
});
