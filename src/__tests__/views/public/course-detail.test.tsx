import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { render, screen, waitFor } from "@/__tests__/utils";
import { CourseDetailPage } from "@/views/public/CourseDetail";

const mocks = vi.hoisted(() => ({
  params: new URLSearchParams("checkout=1"),
  setSearchParams: vi.fn(),
  trackEvent: vi.fn(),
  toastMessage: vi.fn()
}));

vi.mock("@/lib/router-compat", () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => <a href={to}>{children}</a>,
  useLocation: () => ({ pathname: "/cursos/curso-teste", search: "?checkout=1", state: null }),
  useNavigate: () => vi.fn(),
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
  useAppStore: () => ({
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
  })
}));

vi.mock("@/components/checkout/checkout-modal", () => ({
  CheckoutModal: ({
    open,
    onOpenChange
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialClassId?: string;
  }) =>
    open ? (
      <div>
        <span>Checkout aberto</span>
        <button type="button" onClick={() => onOpenChange(false)}>
          Fechar checkout
        </button>
      </div>
    ) : null
}));

vi.mock("@/components/agenda/class-card", () => ({
  ClassCard: ({ course }: { course: { title: string } }) => <div>Turma de {course.title}</div>
}));

vi.mock("@/components/common/testimonial-card", () => ({
  TestimonialCard: () => <div>Depoimento</div>
}));

describe("CourseDetailPage", () => {
  beforeEach(() => {
    mocks.params = new URLSearchParams("checkout=1");
    mocks.setSearchParams.mockReset();
    mocks.setSearchParams.mockImplementation((next: URLSearchParams | Record<string, string>) => {
      mocks.params = next instanceof URLSearchParams ? next : new URLSearchParams(next);
    });
    mocks.trackEvent.mockReset();
    mocks.toastMessage.mockReset();
  });

  it("abre o checkout via query string e limpa o parâmetro para evitar reabertura ao fechar", async () => {
    const user = userEvent.setup();

    render(<CourseDetailPage />);

    expect(await screen.findByText("Checkout aberto")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /fechar checkout/i }));

    await waitFor(() => {
      expect(mocks.setSearchParams).toHaveBeenCalledTimes(1);
    });

    const nextParams = mocks.setSearchParams.mock.calls[0][0] as URLSearchParams;
    expect(nextParams.get("checkout")).toBeNull();

    await waitFor(() => {
      expect(screen.queryByText("Checkout aberto")).not.toBeInTheDocument();
    });
  });
});
