import { beforeEach, describe, expect, it, vi } from "vitest";

import { render, screen } from "@/__tests__/utils";
import { CoursesPage } from "@/views/public/Courses";

const mocks = vi.hoisted(() => ({
  params: new URLSearchParams(),
  setSearchParams: vi.fn()
}));

const mockStore = {
  courses: [
    {
      id: "course-open",
      slug: "curso-com-turma",
      title: "Curso com turma",
      pathId: "path-1",
      pathName: "Departamento Pessoal",
      category: "Departamento Pessoal",
      modality: "Ao vivo online",
      modalities: ["Ao vivo online"],
      durationLabel: "16h",
      shortDescription: "Resumo do curso com turma.",
      price: 1290,
      image: "/images/curso-com-turma.jpg",
      status: "Ativo"
    },
    {
      id: "course-no-class",
      slug: "curso-sem-turma",
      title: "Curso sem turma",
      pathId: "path-2",
      pathName: "Gestão Pública",
      category: "Gestão Pública",
      modality: "Híbrido",
      modalities: ["Híbrido"],
      durationLabel: "20h",
      shortDescription: "Resumo do curso sem turma.",
      price: 1490,
      image: "/images/curso-sem-turma.jpg",
      status: "Destaque"
    },
    {
      id: "course-hidden",
      slug: "curso-oculto",
      title: "Curso oculto",
      pathId: "path-3",
      pathName: "Liderança",
      category: "Liderança",
      modality: "Presencial",
      modalities: ["Presencial"],
      durationLabel: "12h",
      shortDescription: "Resumo do curso oculto.",
      price: 990,
      image: "/images/curso-oculto.jpg",
      status: "Rascunho"
    }
  ],
  classes: [
    {
      id: "class-open",
      courseId: "course-open",
      startDate: "2026-08-20T00:00:00.000Z",
      endDate: "2026-08-21T00:00:00.000Z",
      time: "19:00 às 22:00",
      location: "Online ao vivo",
      modality: "Ao vivo online",
      status: "Inscrições abertas",
      totalSeats: 20,
      filledSeats: 5,
      availableSeats: 15,
      instructorId: "inst-1",
      price: 1290
    }
  ]
};

vi.mock("@/lib/router-compat", () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => <a href={to}>{children}</a>,
  useSearchParams: () => [mocks.params, mocks.setSearchParams]
}));

vi.mock("@/hooks/use-simulated-loading", () => ({
  useSimulatedLoading: () => false
}));

vi.mock("@/lib/app-store", () => ({
  useAppStore: () => mockStore
}));

describe("CoursesPage", () => {
  beforeEach(() => {
    mocks.params = new URLSearchParams();
    mocks.setSearchParams.mockReset();
  });

  it("lista curso elegível mesmo sem turma aberta e oculta curso não elegível", () => {
    render(<CoursesPage />);

    expect(screen.getByText("Curso com turma")).toBeInTheDocument();
    expect(screen.getByText("Curso sem turma")).toBeInTheDocument();
    expect(screen.getByText("Sem turma aberta")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ver detalhes/i })).toHaveAttribute("href", "/cursos/curso-sem-turma");
    expect(screen.getByRole("link", { name: /ver turma/i })).toHaveAttribute("href", "/cursos/curso-com-turma");
    expect(screen.queryByText("Curso oculto")).not.toBeInTheDocument();
  });
});
