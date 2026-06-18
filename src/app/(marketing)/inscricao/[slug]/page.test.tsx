import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import EnrollmentPage from "@/app/(marketing)/inscricao/[slug]/page";
import { renderWithProviders } from "@/test/test-utils";

const course = {
  slug: "gestao-pessoas-setor-publico",
  title: "Gestão Estratégica de Pessoas no Setor Público",
  category: "Gestão pública",
  summary: "Capacitação completa para profissionais que buscam excelência em RH e liderança governamental.",
  description: "Descrição do curso.",
  duration: "40h",
  format: "Online",
  price: "R$ 897",
  audience: [],
  outcomes: [],
  instructor: {
    name: "Equipe RH Cursos",
    role: "Especialistas",
  },
};

vi.mock("@/lib/public-data", () => ({
  getPublicCourseBySlug: vi.fn(async () => course),
  getEnrollmentContextBySlug: vi.fn(async () => ({
    courseId: "course-1",
    classes: [{ value: "class-1", label: "2026-07-12 · Online · Ao vivo", status: "Aberta" }],
  })),
}));

vi.mock("@/components/forms/public-enrollment-form", () => ({
  PublicEnrollmentForm: () => <form aria-label="Formulário de inscrição">FINALIZAR INSCRIÇÃO AGORA</form>,
}));

describe("EnrollmentPage", () => {
  it("renders the secure enrollment wireframe summary and form column", async () => {
    renderWithProviders(
      await EnrollmentPage({ params: Promise.resolve({ slug: course.slug }) }),
    );

    expect(screen.getByRole("heading", { name: /Inscrição segura/i })).toBeInTheDocument();
    expect(screen.getByText(/Ambiente de Inscrição 100% Seguro/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: course.title })).toBeInTheDocument();
    expect(screen.getByText(course.summary)).toBeInTheDocument();
    expect(screen.getByText(/Carga horária/i)).toBeInTheDocument();
    expect(screen.getByText(/Certificação/i)).toBeInTheDocument();
    expect(screen.getByText(/Início/i)).toBeInTheDocument();
    expect(screen.getByText(/Garantia de 7 dias/i)).toBeInTheDocument();
    expect(screen.getByText(/Suporte prioritário/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Formulário de inscrição")).toBeInTheDocument();
  });
});
