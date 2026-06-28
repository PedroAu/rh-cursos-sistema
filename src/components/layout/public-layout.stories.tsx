import type { Meta, StoryObj } from "@storybook/nextjs";

import { PublicLayout } from "./public-layout";
import { withAppStore } from "@/components/storybook/decorators";

/**
 * `PublicLayout` é o invólucro das páginas públicas (cabeçalho, navegação e
 * rodapé). Recebe o conteúdo da rota via `children` (ou `<Outlet />`). Depende
 * da store para dados de navegação, semeada aqui pelo decorator.
 */
const meta = {
  title: "Layout/PublicLayout",
  component: PublicLayout,
  decorators: [withAppStore],
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta<typeof PublicLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <PublicLayout>
      <div className="mx-auto max-w-4xl p-12 text-center text-sm text-muted-foreground">
        Conteúdo da página pública.
      </div>
    </PublicLayout>
  ),
};
