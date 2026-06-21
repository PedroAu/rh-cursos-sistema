import { screen } from "@testing-library/react";

import { TextField, TextareaField } from "@/components/forms/field";
import { renderWithProviders } from "@/test/test-utils";

describe("TextField", () => {
  it("liga descrição e erro ao input via aria-describedby e marca aria-invalid", () => {
    renderWithProviders(
      <TextField
        description="Usaremos para retorno."
        error="E-mail inválido."
        label="E-mail"
        name="email"
        required
      />,
    );

    const input = screen.getByLabelText(/E-mail/);
    expect(input).toHaveAttribute("aria-describedby", "email-description email-error");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-required", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("E-mail inválido.");
  });

  it("omite aria-invalid e errorId quando não há erro", () => {
    renderWithProviders(<TextField description="Inclua DDD." label="Telefone" name="telefone" />);

    const input = screen.getByLabelText("Telefone");
    expect(input).toHaveAttribute("aria-describedby", "telefone-description");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renderiza adorno rightIcon", () => {
    renderWithProviders(
      <TextField label="CPF" name="cpf" rightIcon={<span data-testid="icon">x</span>} />,
    );

    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });
});

describe("TextareaField", () => {
  it("propaga aria-invalid e role=alert no erro", () => {
    renderWithProviders(<TextareaField error="Campo obrigatório." label="Mensagem" name="mensagem" />);

    expect(screen.getByLabelText("Mensagem")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Campo obrigatório.");
  });
});
