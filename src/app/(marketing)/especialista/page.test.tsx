import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SpecialistPage from "@/app/(marketing)/especialista/page";
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
    <form aria-label="Formulário especialista">
      <input type="hidden" data-testid="show-descriptions" value={String(showDescriptions)} />
      <span>{labels?.nome}</span>
      <span>{labels?.email}</span>
      <span>{labels?.telefone}</span>
      <span>{labels?.orgao}</span>
      <span>{labels?.tema_interesse}</span>
      <span>{labels?.mensagem}</span>
      <button type="submit">{submitLabel}</button>
    </form>
  ),
}));

describe("SpecialistPage", () => {
  it("renders the consultative wireframe with UI sections and concise form", () => {
    renderWithProviders(<SpecialistPage />);

    expect(screen.getByRole("heading", { name: /Fale com um especialista da RH Cursos/i })).toBeInTheDocument();
    expect(screen.getByText(/Conte o que sua equipe precisa aprender/i)).toBeInTheDocument();
    expect(screen.getAllByText("Análise objetiva")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Orientação comercial")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Retorno direcionado")[0]).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Sua demanda no caminho certo/i })).toBeInTheDocument();
    expect(screen.getByText(/transformar uma dúvida sobre curso/i)).toBeInTheDocument();
    expect(screen.getByText("Diagnóstico Personalisado")).toBeInTheDocument();
    expect(screen.getByText(/Analisamos as dores específicas/i)).toBeInTheDocument();
    expect(screen.getByText("Expertise em Setor Público")).toBeInTheDocument();
    expect(screen.getByText(/anos de experiência no setor público/i)).toBeInTheDocument();
    expect(screen.queryByText(/Leitura rápida dos principais pontos/i)).not.toBeInTheDocument();

    expect(screen.getByRole("heading", { name: /Receba orientação antes de decidir/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ver cursos/i })).toHaveAttribute("href", "/cursos");
    expect(screen.getByRole("link", { name: /Soluções in company/i })).toHaveAttribute("href", "/in-company");

    expect(screen.getByRole("heading", { name: /Fale com especialista/i })).toBeInTheDocument();
    expect(screen.getByText("Nome completo")).toBeInTheDocument();
    expect(screen.getByText("E-mail profissional")).toBeInTheDocument();
    expect(screen.getByText("WhatsApp")).toBeInTheDocument();
    expect(screen.getByText("Órgão ou empresa")).toBeInTheDocument();
    expect(screen.getByText("Tema de interesse")).toBeInTheDocument();
    expect(screen.getByText("Contexto da necessidade")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Enviar solicitação/i })).toBeInTheDocument();
    expect(screen.getByTestId("show-descriptions")).toHaveValue("false");

    expect(screen.getByRole("heading", { name: /Precisa de uma orientação/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Voltar ao formulário/i })).toHaveAttribute("href", "#formulario");
    expect(screen.queryByRole("heading", { name: "Diagnóstico rápido" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Um atendimento simples/i })).not.toBeInTheDocument();
    expect(screen.queryByText("Prefeituras")).not.toBeInTheDocument();
  });
});
