import { beforeEach, describe, expect, it, vi } from "vitest";

import { render, screen } from "@/__tests__/utils";
import { EnrollmentSuccessPage } from "@/views/public/EnrollmentSuccess";

const mocks = vi.hoisted(() => ({
  locationState: null as unknown,
  navigate: vi.fn(),
}));

const store = {
  courses: [{ id: "course-1", title: "Curso de Teste" }],
  classes: [{ id: "class-1", startDate: "2026-09-01T09:00:00.000Z" }],
};

vi.mock("@/lib/router-compat", () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
  useLocation: () => ({ state: mocks.locationState }),
  useNavigate: () => mocks.navigate,
}));

vi.mock("@/lib/app-store", () => ({
  useAppStore: () => store,
}));

describe("EnrollmentSuccessPage pre-enrollment receipt", () => {
  beforeEach(() => {
    mocks.locationState = null;
    mocks.navigate.mockReset();
    window.sessionStorage.clear();
  });

  it("fails closed when there is no canonical receipt", () => {
    render(<EnrollmentSuccessPage />);

    expect(screen.getByText("Nenhuma pré-inscrição recente")).toBeInTheDocument();
    expect(screen.queryByText("Pré-inscrição recebida")).not.toBeInTheDocument();
  });

  it("ignores a corrupted or legacy session payload", () => {
    window.sessionStorage.setItem(
      "__latest_pre_enrollment_receipt__",
      JSON.stringify({ courseId: "course-1", classId: "class-1", studentName: "PII" }),
    );

    render(<EnrollmentSuccessPage />);

    expect(screen.getByText("Nenhuma pré-inscrição recente")).toBeInTheDocument();
  });

  it("fails closed when the browser blocks session storage", () => {
    const getItem = vi.spyOn(Storage.prototype, "getItem").mockImplementationOnce(() => {
      throw new DOMException("Storage blocked", "SecurityError");
    });

    try {
      render(<EnrollmentSuccessPage />);
      expect(screen.getByText("Nenhuma pré-inscrição recente")).toBeInTheDocument();
    } finally {
      getItem.mockRestore();
    }
  });

  it("rejects a receipt that smuggles personal fields beside valid ids", () => {
    window.sessionStorage.setItem(
      "__latest_pre_enrollment_receipt__",
      JSON.stringify({
        enrollmentId: "receipt-valid-looking",
        courseId: "course-1",
        classId: "class-1",
        email: "pii@example.test",
      }),
    );

    render(<EnrollmentSuccessPage />);

    expect(screen.getByText("Nenhuma pré-inscrição recente")).toBeInTheDocument();
    expect(screen.queryByText("Pré-inscrição recebida")).not.toBeInTheDocument();
  });

  it("renders only the persisted reference and non-personal context", () => {
    mocks.locationState = {
      enrollmentId: "receipt-opaque-123",
      courseId: "course-1",
      classId: "class-1",
    };

    render(<EnrollmentSuccessPage />);

    expect(screen.getByText("Pré-inscrição recebida")).toBeInTheDocument();
    expect(screen.getByText("Sua solicitação está pendente de análise.")).toBeInTheDocument();
    expect(screen.getByText("receipt-opaque-123")).toBeInTheDocument();
    expect(screen.getByText("Curso de Teste")).toBeInTheDocument();
    expect(screen.queryByText(/forma de pagamento/i)).not.toBeInTheDocument();
  });

  it("restores a valid minimal receipt after refresh", () => {
    window.sessionStorage.setItem(
      "__latest_pre_enrollment_receipt__",
      JSON.stringify({
        enrollmentId: "receipt-refresh-456",
        courseId: "course-1",
        classId: "class-1",
      }),
    );

    render(<EnrollmentSuccessPage />);

    expect(screen.getByText("receipt-refresh-456")).toBeInTheDocument();
    expect(screen.getByText("Pré-inscrição recebida")).toBeInTheDocument();
  });
});
