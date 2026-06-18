import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LoginForm } from "@/app/(auth)/login/login-form";
import { renderWithProviders } from "@/test/test-utils";

vi.mock("@/app/(auth)/login/actions", () => ({
  loginAction: vi.fn(),
}));

describe("LoginForm", () => {
  it("renders the wireframe login fields and keeps the real auth field names", () => {
    renderWithProviders(<LoginForm nextPath="/admin/cursos" />);

    expect(screen.getByLabelText(/E-mail Corporativo/)).toHaveAttribute("name", "email");
    expect(screen.getByPlaceholderText("exemplo@rhcursos.com.br")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText(/Senha/)).toHaveAttribute("name", "password");
    expect(screen.getByLabelText("Mantenha-me conectado")).toHaveAttribute("name", "remember");
    expect(screen.getByRole("link", { name: "Esqueceu a senha?" })).toHaveAttribute("href", "/contato");
    expect(screen.getByRole("button", { name: /Entrar na Plataforma/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue("/admin/cursos")).toHaveAttribute("name", "next");
  });
});
