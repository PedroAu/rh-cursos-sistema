import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { AdminMobileDrawer } from "@/features/admin-shell/components/admin-mobile-drawer";
import { AdminTopbar } from "@/features/admin-shell/components/admin-topbar";

const mocks = vi.hoisted(() => ({
  logout: vi.fn(),
  leads: [] as Array<{ status: string }>,
  pathname: "/admin"
}));

vi.mock("@/lib/router-compat", () => ({
  Link: ({
    to,
    children,
    onClick,
    ...rest
  }: {
    to: string;
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <a href={to} onClick={onClick} {...rest}>
      {children}
    </a>
  ),
  useLocation: () => ({ pathname: mocks.pathname, search: "", state: null })
}));

vi.mock("@/lib/app-store", () => ({
  useAppStore: () => ({ logout: mocks.logout, leads: mocks.leads })
}));

// Small harness that mirrors DashboardShell wiring: the topbar hamburger and the
// drawer share a single open/close state, exactly as in production.
function MobileNavHarness() {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <AdminTopbar opened={opened} onToggle={() => setOpened((value) => !value)} role="admin" />
      <AdminMobileDrawer opened={opened} onOpenChange={setOpened} role="admin" />
    </>
  );
}

describe("AdminTopbar (REC-306)", () => {
  beforeEach(() => {
    mocks.logout.mockReset();
    mocks.leads = [];
    mocks.pathname = "/admin";
  });

  it("expõe o botão de menu com atributos ARIA corretos", () => {
    render(<AdminTopbar opened={false} onToggle={vi.fn()} role="admin" />);

    const toggle = screen.getByRole("button", { name: "Alternar navegação" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", "admin-mobile-drawer");
  });

  it("reflete o estado aberto em aria-expanded e dispara onToggle no clique", () => {
    const onToggle = vi.fn();
    render(<AdminTopbar opened onToggle={onToggle} role="admin" />);

    const toggle = screen.getByRole("button", { name: "Alternar navegação" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(toggle);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("marca notificações e ajuda como indisponíveis em vez de inertes", () => {
    render(<AdminTopbar opened={false} onToggle={vi.fn()} role="admin" />);

    const notifications = screen.getByRole("button", { name: "Notificações (em breve)" });
    const help = screen.getByRole("button", { name: "Ajuda (em breve)" });

    expect(notifications).toBeDisabled();
    expect(notifications).toHaveAttribute("aria-disabled", "true");
    expect(help).toBeDisabled();
    expect(help).toHaveAttribute("aria-disabled", "true");
  });

  it("não renderiza mais o campo de busca global inerte", () => {
    render(<AdminTopbar opened={false} onToggle={vi.fn()} role="admin" />);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});

describe("AdminMobileDrawer (REC-306)", () => {
  beforeEach(() => {
    mocks.logout.mockReset();
    mocks.leads = [];
    mocks.pathname = "/admin";
  });

  it("permanece fora do DOM quando fechado", () => {
    render(<AdminMobileDrawer opened={false} onOpenChange={vi.fn()} role="admin" />);
    expect(screen.queryByRole("link", { name: /Configurações/i })).not.toBeInTheDocument();
  });

  it("expõe todos os itens de navegação admin, inclusive os ausentes na barra inferior", () => {
    render(<AdminMobileDrawer opened onOpenChange={vi.fn()} role="admin" />);

    // Itens que a barra inferior móvel (slice 0..5) não alcança.
    for (const label of ["Inscrições", "Instrutores", "Blog", "Configurações"]) {
      expect(screen.getByRole("link", { name: new RegExp(label, "i") })).toBeInTheDocument();
    }
    // Total de 9 itens de navegação + "Catálogo de cursos".
    expect(screen.getByRole("link", { name: /Visão geral/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Catálogo de cursos/i })).toBeInTheDocument();
  });

  it("fecha o menu ao navegar por um item (clique)", () => {
    const onOpenChange = vi.fn();
    render(<AdminMobileDrawer opened onOpenChange={onOpenChange} role="admin" />);

    fireEvent.click(screen.getByRole("link", { name: /Configurações/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("executa logout e fecha o menu ao clicar em Sair", () => {
    const onOpenChange = vi.fn();
    render(<AdminMobileDrawer opened onOpenChange={onOpenChange} role="admin" />);

    fireEvent.click(screen.getByRole("button", { name: /Sair/i }));
    expect(mocks.logout).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("exibe o contador de leads novos como badge", () => {
    mocks.leads = [{ status: "Novo" }, { status: "Novo" }, { status: "Contatado" }];
    render(<AdminMobileDrawer opened onOpenChange={vi.fn()} role="admin" />);

    const leadsLink = screen.getByRole("link", { name: /Leads/i });
    expect(leadsLink).toHaveTextContent("2");
  });
});

describe("Navegação móvel integrada (REC-306)", () => {
  beforeEach(() => {
    mocks.logout.mockReset();
    mocks.leads = [];
    mocks.pathname = "/admin";
  });

  it("abre pelo clique no hambúrguer e fecha pela tecla Escape", async () => {
    render(<MobileNavHarness />);

    const toggle = screen.getByRole("button", { name: "Alternar navegação" });
    expect(screen.queryByRole("link", { name: /Configurações/i })).not.toBeInTheDocument();

    fireEvent.click(toggle);
    expect(screen.getByRole("link", { name: /Configurações/i })).toBeInTheDocument();
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("link", { name: /Configurações/i })).not.toBeInTheDocument();
    });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});
