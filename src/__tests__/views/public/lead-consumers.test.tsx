import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen, waitFor } from "@/__tests__/utils";
import { BlogPage } from "@/views/public/Blog";
import { InCompanyPage } from "@/views/public/InCompany";
import { SpecialistContactPage } from "@/views/public/SpecialistContact";

const mocks = vi.hoisted(() => ({
  createLead: vi.fn(),
  openQuote: vi.fn(),
  setSearchParams: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: mocks.toastSuccess,
    error: mocks.toastError,
  },
}));

vi.mock("@/lib/app-store", () => ({
  useAppStore: () => ({
    blogPosts: [],
    createLead: mocks.createLead,
  }),
}));

vi.mock("@/components/in-company/quote-modal", () => ({
  useQuoteModal: () => ({ openQuote: mocks.openQuote }),
}));

vi.mock("@/hooks/use-simulated-loading", () => ({
  useSimulatedLoading: () => false,
}));

vi.mock("@/lib/router-compat", () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
  useSearchParams: () => [new URLSearchParams(), mocks.setSearchParams],
}));

vi.mock("@/components/ui/select", async () => {
  const React = await import("react");

  function Select({
    children,
    onValueChange,
    value,
  }: {
    children: React.ReactNode;
    onValueChange: (value: string) => void;
    value?: string;
  }) {
    const childArray = React.Children.toArray(children);
    const trigger = childArray.find(
      (child) => React.isValidElement(child) && Boolean((child.props as { id?: string }).id)
    );
    const triggerProps = React.isValidElement(trigger)
      ? (trigger.props as { id?: string; "aria-labelledby"?: string })
      : {};

    return React.createElement(
      "select",
      {
        id: triggerProps.id,
        "aria-labelledby": triggerProps["aria-labelledby"],
        value: value ?? "",
        onChange: (event: React.ChangeEvent<HTMLSelectElement>) => onValueChange(event.target.value),
      },
      childArray
    );
  }

  return {
    Select,
    SelectTrigger: () => null,
    SelectValue: () => null,
    SelectContent: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) =>
      React.createElement("option", { value }, children),
  };
});

describe("consumidores públicos de createLead", () => {
  beforeEach(() => {
    mocks.createLead.mockReset();
    mocks.openQuote.mockReset();
    mocks.setSearchParams.mockReset();
    mocks.toastSuccess.mockReset();
    mocks.toastError.mockReset();
  });

  it("mantém a newsletter preenchida até a persistência e limpa somente após sucesso", async () => {
    const user = userEvent.setup();
    let resolveCreation: (() => void) | undefined;
    mocks.createLead.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveCreation = resolve;
      })
    );

    render(<BlogPage />);

    fireEvent.change(screen.getByLabelText("Seu nome"), { target: { value: "Maria Newsletter" } });
    fireEvent.change(screen.getByLabelText("Seu melhor e-mail"), {
      target: { value: "maria@example.com" },
    });
    await user.click(screen.getByRole("button", { name: /quero receber/i }));

    expect(screen.getByLabelText("Seu nome")).toHaveValue("Maria Newsletter");
    expect(screen.getByLabelText("Seu melhor e-mail")).toHaveValue("maria@example.com");
    expect(mocks.toastSuccess).not.toHaveBeenCalled();
    expect(mocks.toastError).not.toHaveBeenCalled();

    resolveCreation?.();

    await waitFor(() => expect(screen.getByLabelText("Seu nome")).toHaveValue(""));
    expect(screen.getByLabelText("Seu melhor e-mail")).toHaveValue("");
    expect(mocks.toastSuccess).toHaveBeenCalledTimes(1);
    expect(mocks.toastError).not.toHaveBeenCalled();
  });

  it("preserva newsletter e emite um único erro quando createLead rejeita", async () => {
    const user = userEvent.setup();
    mocks.createLead.mockRejectedValueOnce(new Error("Newsletter indisponível."));

    render(<BlogPage />);

    fireEvent.change(screen.getByLabelText("Seu nome"), { target: { value: "Maria Newsletter" } });
    fireEvent.change(screen.getByLabelText("Seu melhor e-mail"), {
      target: { value: "maria@example.com" },
    });
    await user.click(screen.getByRole("button", { name: /quero receber/i }));

    await waitFor(() => expect(mocks.toastError).toHaveBeenCalledWith("Newsletter indisponível."));
    expect(screen.getByLabelText("Seu nome")).toHaveValue("Maria Newsletter");
    expect(screen.getByLabelText("Seu melhor e-mail")).toHaveValue("maria@example.com");
    expect(mocks.toastError).toHaveBeenCalledTimes(1);
    expect(mocks.toastSuccess).not.toHaveBeenCalled();
  });

  it("preserva o formulário In Company em falha e limpa somente no retry bem-sucedido", async () => {
    const user = userEvent.setup();
    mocks.createLead
      .mockRejectedValueOnce(new Error("Proposta indisponível."))
      .mockResolvedValueOnce(undefined);

    render(<InCompanyPage />);

    fireEvent.change(screen.getByPlaceholderText("Seu nome"), { target: { value: "Ana Souza" } });
    fireEvent.change(screen.getByPlaceholderText("voce@organizacao.gov.br"), {
      target: { value: "ana@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Nome da organização"), {
      target: { value: "Secretaria de Gestão" },
    });
    fireEvent.change(screen.getByPlaceholderText("(00) 00000-0000"), {
      target: { value: "61999998888" },
    });
    const inCompanySelects = screen.getAllByRole("combobox");
    await user.selectOptions(inCompanySelects[0], "Gestão pública");
    await user.selectOptions(inCompanySelects[1], "16 a 40 pessoas");
    fireEvent.change(screen.getByPlaceholderText("Ex.: atualizar a equipe para nova legislação."), {
      target: { value: "Atualizar a equipe para a nova legislação." },
    });
    fireEvent.change(screen.getByPlaceholderText("Ex.: eSocial e departamento pessoal."), {
      target: { value: "eSocial aplicado ao setor público." },
    });
    fireEvent.change(
      screen.getByPlaceholderText("Ex.: reduzir retrabalho e padronizar execução."),
      { target: { value: "Reduzir retrabalho e padronizar a execução." } }
    );
    fireEvent.change(
      screen.getByPlaceholderText("Conte o objetivo do treinamento e o contexto da sua equipe"),
      { target: { value: "Precisamos capacitar a equipe pública." } }
    );

    await user.click(screen.getByRole("button", { name: "Enviar solicitação de proposta" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Proposta indisponível.");
    expect(screen.getByPlaceholderText("Seu nome")).toHaveValue("Ana Souza");
    expect(screen.getByPlaceholderText("voce@organizacao.gov.br")).toHaveValue("ana@example.com");
    expect(screen.getByPlaceholderText("Nome da organização")).toHaveValue("Secretaria de Gestão");
    expect(screen.getByPlaceholderText("(00) 00000-0000")).toHaveValue("(61) 99999-8888");
    expect(inCompanySelects[0]).toHaveValue("Gestão pública");
    expect(inCompanySelects[1]).toHaveValue("16 a 40 pessoas");
    expect(screen.getByPlaceholderText("Ex.: atualizar a equipe para nova legislação.")).toHaveValue(
      "Atualizar a equipe para a nova legislação."
    );
    expect(screen.getByPlaceholderText("Ex.: eSocial e departamento pessoal.")).toHaveValue(
      "eSocial aplicado ao setor público."
    );
    expect(screen.getByPlaceholderText("Ex.: reduzir retrabalho e padronizar execução.")).toHaveValue(
      "Reduzir retrabalho e padronizar a execução."
    );
    expect(
      screen.getByPlaceholderText("Conte o objetivo do treinamento e o contexto da sua equipe")
    ).toHaveValue("Precisamos capacitar a equipe pública.");
    expect(screen.queryByText(/Recebemos os seus dados\./)).not.toBeInTheDocument();
    expect(mocks.toastError).toHaveBeenCalledTimes(1);
    expect(mocks.toastSuccess).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Enviar solicitação de proposta" }));

    expect(await screen.findByText(/Recebemos os seus dados\./)).toBeInTheDocument();
    expect(mocks.toastSuccess).toHaveBeenCalledTimes(1);
    expect(mocks.toastError).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["Especialista" as const, "Especialista"],
    ["Consultoria" as const, "Consultoria"],
  ])("preserva o formulário de %s e mantém a origem correta em falha", async (leadOrigin, expectedOrigin) => {
    const user = userEvent.setup();
    mocks.createLead
      .mockRejectedValueOnce(new Error("Especialista indisponível."))
      .mockResolvedValueOnce(undefined);

    render(<SpecialistContactPage leadOrigin={leadOrigin} />);

    fireEvent.change(screen.getByPlaceholderText("Ex.: Maria Oliveira"), {
      target: { value: "Joana Lima" },
    });
    fireEvent.change(screen.getByPlaceholderText("voce@empresa.com.br"), {
      target: { value: "joana@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("(61) 99999-9999"), {
      target: { value: "61999998888" },
    });
    fireEvent.change(screen.getByPlaceholderText("Ex.: Secretaria de Gestão"), {
      target: { value: "Órgão Exemplo" },
    });
    await user.selectOptions(screen.getByRole("combobox"), "Gestão Pública");
    fireEvent.change(
      screen.getByPlaceholderText("Descreva o desafio, o contexto da equipe e o tipo de apoio desejado."),
      { target: { value: "Precisamos de um diagnóstico completo." } }
    );
    await user.click(screen.getByRole("button", { name: "Solicitar contato" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Especialista indisponível.");
    expect(screen.getByPlaceholderText("Ex.: Maria Oliveira")).toHaveValue("Joana Lima");
    expect(screen.getByPlaceholderText("voce@empresa.com.br")).toHaveValue("joana@example.com");
    expect(screen.getByPlaceholderText("(61) 99999-9999")).toHaveValue("(61) 99999-8888");
    expect(screen.getByPlaceholderText("Ex.: Secretaria de Gestão")).toHaveValue("Órgão Exemplo");
    expect(screen.getByRole("combobox")).toHaveValue("Gestão Pública");
    expect(
      screen.getByPlaceholderText("Descreva o desafio, o contexto da equipe e o tipo de apoio desejado.")
    ).toHaveValue(
      "Precisamos de um diagnóstico completo."
    );
    expect(mocks.createLead).toHaveBeenCalledWith(expect.objectContaining({ origin: expectedOrigin }));
    expect(mocks.toastError).toHaveBeenCalledTimes(1);
    expect(mocks.toastSuccess).not.toHaveBeenCalled();
    expect(screen.queryByText(/Solicitação registrada\. Um especialista retorna/)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Solicitar contato" }));

    expect(await screen.findByText(/Solicitação registrada\. Um especialista retorna/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ex.: Maria Oliveira")).toHaveValue("");
    expect(screen.getByPlaceholderText("voce@empresa.com.br")).toHaveValue("");
    expect(mocks.toastSuccess).toHaveBeenCalledTimes(1);
    expect(mocks.toastError).toHaveBeenCalledTimes(1);
  });
});
