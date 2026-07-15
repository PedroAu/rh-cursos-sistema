import { beforeEach, describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen, waitFor } from "@/__tests__/utils";
import { CourseCheckoutPage } from "@/views/public/CourseCheckout";

const mocks = vi.hoisted(() => ({
  createEnrollment: vi.fn(),
  fetchClasses: vi.fn(),
  navigate: vi.fn(),
  setSearchParams: vi.fn(),
  toastError: vi.fn(),
}));

const course = {
  id: "course-1",
  slug: "curso-teste",
  title: "Curso Teste",
  price: 1290,
  nextClassId: "class-1",
};

const trainingClass = {
  id: "class-1",
  courseId: "course-1",
  startDate: "2026-09-01T09:00:00.000Z",
  endDate: "2026-09-01T17:00:00.000Z",
  time: "09:00 às 17:00",
  modality: "Ao vivo online",
  location: "Online",
  instructorId: "instructor-1",
  totalSeats: 20,
  filledSeats: 5,
  availableSeats: 15,
  status: "Inscrições abertas",
  price: 1290,
  notes: "",
};

vi.mock("sonner", () => ({
  toast: { error: mocks.toastError },
}));

vi.mock("@/lib/router-compat", () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
  useNavigate: () => mocks.navigate,
  useParams: () => ({ slug: "curso-teste" }),
  useSearchParams: () => [new URLSearchParams("classId=class-1"), mocks.setSearchParams],
}));

vi.mock("@/lib/app-store", () => ({
  useAppStore: () => ({
    courses: [course],
    classes: [trainingClass],
    createEnrollment: mocks.createEnrollment,
  }),
}));

vi.mock("@/lib/supabase/rh-cursos-api", () => ({
  fetchPublicClassesFromSupabase: () => mocks.fetchClasses(),
}));

function fillValidPersonForm() {
  fireEvent.change(screen.getByLabelText(/nome completo/i), {
    target: { value: "Maria Oliveira" },
  });
  fireEvent.change(screen.getByLabelText(/^cpf/i), { target: { value: "12345678910" } });
  fireEvent.change(screen.getByLabelText(/telefone/i), { target: { value: "61999998888" } });
  fireEvent.change(screen.getByLabelText(/e-mail/i), {
    target: { value: "maria@example.com" },
  });
  fireEvent.click(
    screen.getByLabelText("Li e aceito os termos de uso e a política de privacidade"),
  );
}

describe("CourseCheckoutPage as pre-enrollment", () => {
  beforeEach(() => {
    mocks.createEnrollment.mockReset();
    mocks.fetchClasses.mockReset().mockResolvedValue([trainingClass]);
    mocks.navigate.mockReset();
    mocks.setSearchParams.mockReset();
    mocks.toastError.mockReset();
    window.sessionStorage.clear();
  });

  it("renders no financial controls or purchase claims", () => {
    render(<CourseCheckoutPage />);

    expect(screen.getByRole("heading", { name: "Enviar pré-inscrição" })).toBeInTheDocument();
    expect(screen.getByText("valor de referência")).toBeInTheDocument();
    expect(screen.queryByLabelText(/número do cartão/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/cvv/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/forma de pagamento/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/finalizar compra/i)).not.toBeInTheDocument();
  });

  it("submits a minimal payload and navigates with only the canonical receipt", async () => {
    mocks.createEnrollment.mockResolvedValue({
      enrollmentId: "receipt-public-1",
      classId: "class-1",
    });

    render(<CourseCheckoutPage />);
    fillValidPersonForm();
    fireEvent.click(screen.getByRole("button", { name: /enviar pré-inscrição/i }));

    await waitFor(() => expect(mocks.createEnrollment).toHaveBeenCalledTimes(1));
    const payload = mocks.createEnrollment.mock.calls[0]?.[0];
    expect(payload).toEqual({
      studentName: "Maria Oliveira",
      email: "maria@example.com",
      phone: "(61) 99999-8888",
      cpf: "123.456.789-10",
      organization: "",
      jobTitle: "",
      enrollmentType: "Pessoa física",
      courseId: "course-1",
      classId: "class-1",
      notes: "Pré-inscrição enviada pela rota pública.",
    });
    expect(payload).not.toHaveProperty("paymentMethod");
    expect(mocks.navigate).toHaveBeenCalledWith("/inscricao-confirmada", {
      state: {
        enrollmentId: "receipt-public-1",
        courseId: "course-1",
        classId: "class-1",
      },
    });
    expect(JSON.parse(window.sessionStorage.getItem("__latest_pre_enrollment_receipt__") ?? "null"))
      .toEqual({ enrollmentId: "receipt-public-1", courseId: "course-1", classId: "class-1" });
  });

  it("preserves all entered values when persistence fails", async () => {
    mocks.createEnrollment.mockRejectedValue(new Error("Serviço temporariamente indisponível."));

    render(<CourseCheckoutPage />);
    fillValidPersonForm();
    fireEvent.click(screen.getByRole("button", { name: /enviar pré-inscrição/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Serviço temporariamente indisponível.",
    );
    expect(screen.getByLabelText(/nome completo/i)).toHaveValue("Maria Oliveira");
    expect(screen.getByLabelText(/^cpf/i)).toHaveValue("123.456.789-10");
    expect(screen.getByLabelText(/telefone/i)).toHaveValue("(61) 99999-8888");
    expect(screen.getByLabelText(/e-mail/i)).toHaveValue("maria@example.com");
    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(mocks.toastError).toHaveBeenCalledOnce();
  });
});
