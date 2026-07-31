import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { createAdminStoreFixture } from "../../../tests/fixtures/admin-store";
import { AdminResourcePage } from "@/views/admin/AdminResourcePage";

const mocks = vi.hoisted(() => ({
  useAppStore: vi.fn(),
}));

vi.mock("@/lib/app-store", () => ({ useAppStore: mocks.useAppStore }));
vi.mock("@/hooks/use-hotkey", () => ({ useHotkey: vi.fn() }));

function createStore() {
  return {
    ...createAdminStoreFixture(),
    deleteInstructor: vi.fn(),
    upsertInstructor: vi.fn(),
    deleteLead: vi.fn(),
    updateLead: vi.fn(),
    createLead: vi.fn(),
  };
}

describe("AdminResourcePage — instrutores e leads", () => {
  beforeEach(() => {
    vi.useRealTimers();
    mocks.useAppStore.mockReset();
  });

  test("exibe instrutores em cards responsivos com contagens reais e ação de edição", () => {
    const store = createStore();
    mocks.useAppStore.mockReturnValue(store);

    render(<AdminResourcePage resource="instructors" />);

    expect(screen.getByRole("heading", { level: 1, name: "Instrutores" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Novo instrutor" })).toBeInTheDocument();

    const grid = screen.getByTestId("instructor-card-grid");
    expect(grid).toHaveClass("grid-cols-1", "md:grid-cols-2", "xl:grid-cols-3");

    const card = screen.getByRole("article", { name: "Instrutor Ana Lima" });
    expect(within(card).getByText("eSocial e folha")).toBeInTheDocument();
    expect(within(card).getByText("Ativo")).toBeInTheDocument();
    expect(within(card).getByText("Cursos").nextElementSibling).toHaveTextContent("1");
    expect(within(card).getByText("Turmas ativas").nextElementSibling).toHaveTextContent("1");

    fireEvent.click(within(card).getByRole("button", { name: "Editar" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Editar registro" })).toBeInTheDocument();
  });

  test("mostra métricas de 30 dias e chips de origem acessíveis que filtram leads", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-17T12:00:00.000Z"));
    const store = createStore();
    store.leads = [
      { ...store.leads[0], id: "recent-site", name: "Lead recente", createdAt: "2026-07-01T10:00:00.000Z", origin: "Site", status: "Novo" },
      { ...store.leads[1], id: "old-linkedin", name: "Lead antigo", createdAt: "2026-05-01T10:00:00.000Z", origin: "LinkedIn", status: "Em atendimento" },
    ];
    mocks.useAppStore.mockReturnValue(store);

    render(<AdminResourcePage resource="leads" />);

    expect(screen.getByRole("heading", { level: 1, name: "Leads" })).toBeInTheDocument();
    expect(screen.getByText("Leads nos últimos 30 dias").parentElement?.parentElement).toHaveTextContent("1");
    expect(screen.getByText("Aguardando contato").parentElement?.parentElement).toHaveTextContent("1");

    const allChip = screen.getByRole("button", { name: "Todas" });
    const siteChip = screen.getByRole("button", { name: "Site" });
    expect(allChip).toHaveAttribute("aria-pressed", "true");
    expect(siteChip).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(siteChip);
    expect(siteChip).toHaveAttribute("aria-pressed", "true");
    expect(allChip).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("Lead recente")).toBeInTheDocument();
    expect(screen.queryByText("Lead antigo")).not.toBeInTheDocument();

    expect(screen.getByRole("columnheader", { name: "Contato" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Recebido" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Exportar" })).toBeInTheDocument();
  });

  test("mantém o estado vazio responsivo ao filtro de busca", () => {
    mocks.useAppStore.mockReturnValue(createStore());
    render(<AdminResourcePage resource="leads" />);

    fireEvent.change(screen.getByPlaceholderText("Buscar por nome, título ou referência."), {
      target: { value: "lead inexistente" },
    });

    expect(screen.getByText("Nenhum registro encontrado.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Exportar" })).not.toBeInTheDocument();
  });

  test("pagina recursos, abre detalhe real e exige confirmação antes de excluir", () => {
    const store = createStore();
    store.instructors = Array.from({ length: 6 }, (_, index) => ({
      ...store.instructors[0],
      id: `instructor-${index + 1}`,
      name: `Instrutor ${index + 1}`,
      email: `instrutor-${index + 1}@example.test`,
    }));
    mocks.useAppStore.mockReturnValue(store);
    vi.stubGlobal("confirm", vi.fn().mockReturnValue(false));

    render(<AdminResourcePage resource="instructors" />);

    expect(screen.getByText("Mostrando 1–5 de 6")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Página 2" }));
    expect(screen.getByText("Mostrando 6–6 de 6")).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "Instrutor Instrutor 6" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Ver detalhes de Instrutor 6" }));
    expect(screen.getByRole("heading", { name: "Instrutores · instructor-6" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Voltar para a lista" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Excluir instrutor Instrutor 6" }));
    expect(window.confirm).toHaveBeenCalledWith("Excluir instrutores instructor-6? Esta ação não pode ser desfeita.");
    expect(store.deleteInstructor).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });
});
