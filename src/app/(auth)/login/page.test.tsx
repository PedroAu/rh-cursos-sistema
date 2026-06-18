import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LoginPage from "@/app/(auth)/login/page";
import { renderWithProviders } from "@/test/test-utils";

vi.mock("@/app/(auth)/login/login-form", () => ({
  LoginForm: ({ nextPath }: { nextPath?: string }) => (
    <form aria-label="Formulário de login">
      <input type="hidden" data-testid="next-path" value={nextPath ?? ""} />
      <button type="submit">Entrar na Plataforma</button>
    </form>
  ),
}));

describe("LoginPage", () => {
  it("renders the authentication wireframe structure", async () => {
    const page = await LoginPage({
      searchParams: Promise.resolve({ next: "/admin" }),
    });

    renderWithProviders(page);

    expect(screen.getByRole("heading", { name: "RH Cursos" })).toBeInTheDocument();
    expect(screen.getByText(/Capacitação estratégica/i)).toBeInTheDocument();
    expect(screen.getByText("Certificado reconhecido")).toBeInTheDocument();
    expect(screen.getByText(/Qualidade técnica/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Acesse sua conta" })).toBeInTheDocument();
    expect(screen.getByText(/Bem-vindo de volta/i)).toBeInTheDocument();
    expect(screen.getByRole("form", { name: "Formulário de login" })).toBeInTheDocument();
    expect(screen.getByText(/Ainda não possui uma conta/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Fale com a equipe" })).toHaveAttribute("href", "/contato");
    expect(screen.getByRole("link", { name: /Voltar para a página inicial/i })).toHaveAttribute("href", "/");
    expect(screen.getByTestId("next-path")).toHaveValue("/admin");
  });
});
