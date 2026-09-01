import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CourseDetailPage, { generateStaticParams } from "@/app/(marketing)/cursos/[slug]/page";
import { renderWithProviders } from "@/test/test-utils";

const course = {
  slug: "dp-estrategico",
  title: "Departamento Pessoal Estratégico",
  category: "Departamento pessoal",
  summary: "Rotinas, riscos trabalhistas e padrão operacional para times de DP.",
  description: "Programa desenhado para equipes que precisam consolidar processos.",
  duration: "24h",
  format: "Ao vivo online",
  price: "R$ 1.290",
  audience: ["Analistas de DP", "Coordenadores de RH"],
  outcomes: ["Padronizar admissão", "Mapear riscos recorrentes", "Aumentar previsibilidade"],
  instructor: {
    name: "Patricia Freitas",
    role: "Especialista em DP e legislação trabalhista",
  },
};

const related = {
  ...course,
  slug: "lideranca-rh-publico",
  title: "Liderança para RH e Gestão Pública",
  summary: "Ritmo de equipe, comunicação e gestão por indicadores.",
};

vi.mock("@/lib/public-data", () => ({
  getPublicCourseBySlug: vi.fn(async () => course),
  getPublicCourses: vi.fn(async () => [course, related]),
  getAgendaItems: vi.fn(async () => [
    {
      id: "agenda-dp",
      courseSlug: course.slug,
      courseTitle: course.title,
      startDate: "2027-07-12",
      endDate: null,
      schedule: "09:00 às 17:00",
      location: "Online",
      format: "Ao vivo online",
      status: "Turma aberta",
      remainingSeats: 10,
    },
  ]),
}));

describe("CourseDetailPage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-01T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the wireframe sections with UI structure and commercial sidebar", async () => {
    renderWithProviders(
      await CourseDetailPage({ params: Promise.resolve({ slug: "dp-estrategico" }) }),
    );

    expect(screen.getByRole("heading", { name: course.title })).toBeInTheDocument();
    expect(screen.getAllByText("Certificado incluso").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /Inscreva-se agora/i })[0]).toHaveAttribute(
      "href",
      `/inscricao/${course.slug}`,
    );
    expect(screen.getByRole("heading", { name: /Sobre o curso/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Ao final, você será capaz de/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Quem deve fazer/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /O que você vai aprender/i })).toBeInTheDocument();
    expect(screen.getByText("Fundamentos práticos")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: course.instructor.name })).toBeInTheDocument();
    expect(screen.getByText("Especialista RH Cursos")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Inscreva-se agora/i })[1]).toHaveAttribute(
      "href",
      `/inscricao/${course.slug}`,
    );
    expect(screen.getByRole("link", { name: /Solicitar orçamento in-company/i })).toHaveAttribute(
      "href",
      "/in-company",
    );
    expect(screen.getAllByText("Inscrição sujeita à disponibilidade da turma.")).toHaveLength(2);
    expect(screen.queryByRole("heading", { name: /Detalhes do curso/i })).not.toBeInTheDocument();
    expect(screen.getByText("Acesso ao grupo de WhatsApp da turma")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Garantia operacional/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Dúvidas frequentes sobre este curso/i })).toBeInTheDocument();
    expect(screen.getByText(/Próxima turma: 12 de julho de 2027/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Turmas fechadas/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Outros cursos recomendados/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: related.title })).toBeInTheDocument();
    expect(screen.getByText(related.summary)).toBeInTheDocument();
  });

  it("generates static params from public courses", async () => {
    await expect(generateStaticParams()).resolves.toEqual([
      { slug: course.slug },
      { slug: related.slug },
    ]);
  });
});
