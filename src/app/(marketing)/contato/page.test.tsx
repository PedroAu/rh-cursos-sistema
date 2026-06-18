import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ContactPage from "@/app/(marketing)/contato/page";
import { renderWithProviders } from "@/test/test-utils";

vi.mock("@/components/forms/public-lead-form", () => ({
  PublicLeadForm: ({
    submitLabel,
    showDescriptions,
    labels,
  }: {
    submitLabel: string;
    showDescriptions?: boolean;
    labels?: Record<string, string>;
  }) => (
    <form aria-label="Formulário de contato">
      <input type="hidden" data-testid="show-descriptions" value={String(showDescriptions)} />
      <span>{labels?.nome}</span>
      <span>{labels?.email}</span>
      <span>{labels?.telefone}</span>
      <span>{labels?.mensagem}</span>
      <button type="submit">{submitLabel}</button>
    </form>
  ),
}));

describe("ContactPage", () => {
  it("renders the wireframe contact structure with direct channels and a concise form", () => {
    renderWithProviders(<ContactPage />);

    expect(screen.getByRole("heading", { name: /Entre em Contato/i })).toBeInTheDocument();
    expect(screen.getByText(/\(61\) 3965-1929/i)).toBeInTheDocument();
    expect(screen.getByText(/\(61\) 99112-9682/i)).toBeInTheDocument();
    expect(screen.getByText(/Águas Claras, Brasília - DF/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Envie uma mensagem/i })).toBeInTheDocument();

    expect(screen.getByText("Nome Completo")).toBeInTheDocument();
    expect(screen.getByText("E-mail Corporativo")).toBeInTheDocument();
    expect(screen.getByText("Telefone / WhatsApp")).toBeInTheDocument();
    expect(screen.getByText("Mensagem")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Enviar Mensagem/i })).toBeInTheDocument();
    expect(screen.getByTestId("show-descriptions")).toHaveValue("false");
    expect(screen.queryByText(/Para demandas urgentes/i)).not.toBeInTheDocument();
  });
});
