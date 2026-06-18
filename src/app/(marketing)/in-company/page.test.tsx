import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import InCompanyPage from "@/app/(marketing)/in-company/page";
import { renderWithProviders } from "@/test/test-utils";

vi.mock("@/components/forms/public-lead-form", () => ({
  PublicLeadForm: ({ submitLabel }: { submitLabel: string }) => (
    <form aria-label="Formulário In Company">
      <button type="submit">{submitLabel}</button>
    </form>
  ),
}));

describe("InCompanyPage", () => {
  it("renders the wireframe structure with hero, bento benefits, process, form and CTA", () => {
    renderWithProviders(<InCompanyPage />);

    expect(
      screen.getByRole("heading", {
        name: /In Company: Treinamento Estratégico para Resultados Reais/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Solicitar Proposta/i })).toHaveAttribute(
      "href",
      "#proposta",
    );
    expect(screen.getByRole("link", { name: /Saiba Mais/i })).toHaveAttribute(
      "href",
      "#beneficios",
    );

    expect(screen.getByRole("heading", { name: /Vantagens para sua Organização/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Conteúdo 100% Customizado/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Flexibilidade Total/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Redução de Custos/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Logística Simplificada/i })).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: /Como funciona a implementação/i })).toBeInTheDocument();
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Solicitar proposta In Company/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Enviar Solicitação/i })).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: /Precisa de algo ainda mais específico/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Falar com consultor/i })).toHaveAttribute(
      "href",
      expect.stringContaining("https://wa.me/5561991129682"),
    );
  });
});
