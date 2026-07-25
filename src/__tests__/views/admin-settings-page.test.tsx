import { render, screen } from "@testing-library/react";
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

  it("não oferece salvamento local enganoso", () => {
    render(<AdminSettingsPage />);
    expect(screen.queryByRole("button", { name: "Salvar alterações" })).not.toBeInTheDocument();
    expect(screen.getByText(/Não há edição local persistente/)).toBeInTheDocument();
  });

  it("mantém controles acessíveis e a equipe somente leitura", () => {
    render(<AdminSettingsPage />);

    expect(screen.getByRole("list", { name: "Equipe de acesso" })).toBeInTheDocument();
    expect(screen.queryAllByRole("switch")).toHaveLength(0);
    expect(screen.queryByLabelText("Selecionar logotipo")).not.toBeInTheDocument();
  });
});
