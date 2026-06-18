import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PublicEnrollmentForm } from "@/components/forms/public-enrollment-form";
import { renderWithProviders } from "@/test/test-utils";

describe("PublicEnrollmentForm", () => {
  it("renders LGPD, review and conditional payment fields", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <PublicEnrollmentForm
        courseId="course-1"
        courseTitle="Gestão Estratégica de Pessoas no Setor Público"
        courseSlug="gestao-pessoas-setor-publico"
        classOptions={[{ value: "class-1", label: "2026-07-12 · Online", status: "Aberta" }]}
      />,
    );

    expect(screen.getByRole("heading", { name: /Dados do Aluno/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome Completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/E-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/CPF/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Dados da Empresa/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Razão Social/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/CNPJ/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Telefone Corporativo/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Pagamento ou Empenho/i })).toBeInTheDocument();
    expect(screen.getAllByText("Cartão").length).toBeGreaterThan(0);
    expect(screen.getByText("PIX")).toBeInTheDocument();
    expect(screen.getByText("Boleto")).toBeInTheDocument();
    expect(screen.getByText("Empenho")).toBeInTheDocument();
    expect(screen.getByLabelText(/Número do Cartão/i)).toBeInTheDocument();
    await user.click(screen.getByLabelText("Empenho"));
    expect(screen.queryByLabelText(/Número do Cartão/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Observações para empenho/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /LGPD/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Revisão/i })).toBeInTheDocument();
    expect(screen.getByText(/Lei Geral de Proteção de Dados/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Política de Privacidade/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /FINALIZAR INSCRIÇÃO AGORA/i })).toBeInTheDocument();
  });
});
