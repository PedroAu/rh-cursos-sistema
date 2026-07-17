import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminSettingsPage } from "@/views/admin/AdminSettingsPage";

vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));

describe("AdminSettingsPage (Story 15.8)", () => {
  beforeEach(() => {
    const values = new Map<string, string>();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        clear: vi.fn(() => values.clear()),
        getItem: vi.fn((key: string) => values.get(key) ?? null),
        removeItem: vi.fn((key: string) => values.delete(key)),
        setItem: vi.fn((key: string, value: string) => values.set(key, value))
      }
    });
  });

  it("exibe o grid canônico sem ações de backend simuladas", () => {
    render(<AdminSettingsPage />);

    expect(screen.getByRole("heading", { name: "Dados da empresa" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Notificações" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Equipe de acesso" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Novo Admin|Conectar|Gerenciar webhooks/i })).not.toBeInTheDocument();
    expect(screen.getByText("A gestão de permissões não está disponível neste painel.")).toBeInTheDocument();
  });

  it("salva dados e notificações no armazenamento local existente", () => {
    const { unmount } = render(<AdminSettingsPage />);
    const companyName = screen.getByRole("textbox", { name: "Nome da empresa" });
    fireEvent.change(companyName, { target: { value: "RH Cursos Atualizada" } });
    fireEvent.click(screen.getByRole("switch", { name: "Relatório mensal" }));
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    unmount();

    render(<AdminSettingsPage />);
    expect(screen.getByRole("textbox", { name: "Nome da empresa" })).toHaveValue("RH Cursos Atualizada");
    expect(screen.getByRole("switch", { name: "Relatório mensal" })).toBeChecked();
  });

  it("mantém controles acessíveis e a equipe somente leitura", () => {
    render(<AdminSettingsPage />);

    expect(screen.getByRole("list", { name: "Equipe de acesso" })).toBeInTheDocument();
    expect(screen.getAllByRole("switch")).toHaveLength(3);
    expect(screen.getByLabelText("Selecionar logotipo")).toHaveAttribute("type", "file");
  });
});
