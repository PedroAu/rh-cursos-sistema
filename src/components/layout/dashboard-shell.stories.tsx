import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DashboardShell } from "./dashboard-shell";
import { withAppStore } from "@/components/storybook/decorators";

/**
 * `DashboardShell` é o layout do painel administrativo (sidebar + área de
 * conteúdo). Recebe `role` e o conteúdo da rota via `children`. Depende da store
 * autenticada, semeada aqui pelo decorator.
 */
const meta = {
  title: "Layout/DashboardShell",
  component: DashboardShell,
  decorators: [withAppStore],
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  args: { role: "admin" },
} satisfies Meta<typeof DashboardShell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DashboardShell {...args}>
      <div className="p-8 text-sm text-muted-foreground">Conteúdo do painel.</div>
    </DashboardShell>
  ),
};
