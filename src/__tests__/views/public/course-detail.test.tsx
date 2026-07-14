import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { render, screen, waitFor } from "@/__tests__/utils";
import { CourseDetailPage } from "@/views/public/CourseDetail";

const mocks = vi.hoisted(() => ({
  params: new URLSearchParams("checkout=1"),
  setSearchParams: vi.fn(),
  navigate: vi.fn(),
  trackEvent: vi.fn(),
  toastMessage: vi.fn()
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
      fullDescription: "Descricao completa do curso teste.",
      shortDescription: "Resumo",
      targetAudience: ["Analistas", "Gestores"],
      rating: 4.8,
      studentsCount: 120,
      benefits: ["Beneficio 1", "Beneficio 2", "Beneficio 3"],
      objectives: ["Objetivo 1", "Objetivo 2"],
      modules: [
        {
          title: "Modulo 1",
          description: "Descricao do modulo 1",
          topics: ["Topico A", "Topico B"],
          duration: "8h"
        }
      ],
      price: 1290,
      image: "/images/hero-rh-cursos.jpg",
      instructorId: "inst-1",
      status: "Ativo",
      featured: false,
      nextClassId: "class-1"
    }
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
      notes: ""
    }
  ],
  instructors: [
    {
      id: "inst-1",
      name: "Instrutor Teste",
      email: "instrutor@empresa.com",
      phone: "61999990000",
      specialty: "Departamento Pessoal",
      bio: "Especialista em rotinas trabalhistas.",
      courseIds: ["course-1"],
      rating: 4.9,
      avatar: "IT",
      status: "Ativo"
    }
  ],
  coursePublicContents: [],
  testimonials: [],
  createEnrollment: vi.fn()
};

vi.mock("@/lib/router-compat", () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => <a href={to}>{children}</a>,
  useLocation: () => ({ pathname: "/cursos/curso-teste", search: "?checkout=1", state: null }),
  useNavigate: () => mocks.navigate,
  useParams: () => ({ slug: "curso-teste" }),
  useSearchParams: () => [mocks.params, mocks.setSearchParams]
}));

vi.mock("sonner", () => ({
  toast: {
    message: mocks.toastMessage
  }
}));

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />
}));

vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: () => ({ children, ...props }: { children?: React.ReactNode }) => <div {...props}>{children}</div>
    }
  ),
  useReducedMotion: () => true
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: mocks.trackEvent
}));

vi.mock("@/lib/app-store", () => ({
  useAppStore: () => mockStore
}));

vi.mock("@/components/agenda/class-card", () => ({
  ClassCard: ({ course }: { course: { title: string } }) => <div>Turma de {course.title}</div>
}));

vi.mock("@/components/common/testimonial-card", () => ({
  TestimonialCard: () => <div>Depoimento</div>
}));

describe("CourseDetailPage", () => {
  beforeEach(() => {
    mockStore.classes = [
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
        notes: ""
      }
    ];
    mocks.params = new URLSearchParams("checkout=1");
    mocks.setSearchParams.mockReset();
    mocks.setSearchParams.mockImplementation((next: URLSearchParams | Record<string, string>) => {
      mocks.params = next instanceof URLSearchParams ? next : new URLSearchParams(next);
    });
    mocks.navigate.mockReset();
    mocks.trackEvent.mockReset();
    mocks.toastMessage.mockReset();
  });

  it("redireciona o deeplink legado ?checkout=1 para a rota dedicada de checkout", async () => {
    render(<CourseDetailPage />);

    await waitFor(() => {
      expect(mocks.navigate).toHaveBeenCalledWith("/cursos/curso-teste/checkout?classId=class-1", {
        replace: true,
      });
    });
  });

  it("envia o usuario para a rota dedicada ao clicar no CTA de inscrição", async () => {
    const user = userEvent.setup();
    mocks.params = new URLSearchParams("");

    render(<CourseDetailPage />);

    await user.click(screen.getByRole("button", { name: /inscrever-se agora/i }));

    expect(mocks.navigate).toHaveBeenCalledWith("/cursos/curso-teste/checkout?classId=class-1");
  });

  it("mostra CTA de interesse quando não há turma aberta", async () => {
    mockStore.classes = [];
    mocks.params = new URLSearchParams("");

    render(<CourseDetailPage />);

    expect(screen.getByText("Sem turma aberta")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /manifestar interesse/i })).toHaveAttribute(
      "href",
      "/falar-com-especialista"
    );
  });
});
