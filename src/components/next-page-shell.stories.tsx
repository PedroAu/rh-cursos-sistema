import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DashboardPageShell, PublicPageShell } from "./next-page-shell";
import { mockStoreInitialData } from "@/components/storybook/mock-data";

/**
 * Os *page shells* combinam a `AppStoreProvider` semeada com dados do servidor
 * e o layout correspondente, dentro de um `Suspense`. São o ponto de entrada de
 * cada rota:
 * - `PublicPageShell` — páginas públicas, semeadas com `initialData`.
 * - `DashboardPageShell` — painel admin, semeado com `initialSession`.
 */
const meta = {
  title: "Layout/PageShell",
  component: PublicPageShell,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  args: { children: null },
} satisfies Meta<typeof PublicPageShell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Public: Story = {
  render: () => (
    <PublicPageShell initialData={mockStoreInitialData}>
      <div className="mx-auto max-w-4xl p-12 text-center text-sm text-muted-foreground">
        Página pública renderizada dentro do shell.
      </div>
    </PublicPageShell>
  ),
};

export const Dashboard: Story = {
  render: () => (
    <DashboardPageShell
      role="admin"
      initialSession={{ role: "admin", email: "admin@rhcursos.com.br", name: "Administrador" }}
    >
      <div className="p-8 text-sm text-muted-foreground">Conteúdo do painel.</div>
    </DashboardPageShell>
  ),
};
