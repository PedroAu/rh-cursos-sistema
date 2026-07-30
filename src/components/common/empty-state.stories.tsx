import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { EmptyState } from "./empty-state";

/**
 * `EmptyState` comunica ausência de resultados de forma acolhedora. Forneça
 * `actionLabel` + `onAction` juntos para oferecer um próximo passo (ex.: limpar
 * filtros). Sem ação, renderiza apenas título e descrição.
 */
const meta = {
  title: "Common/EmptyState",
  component: EmptyState,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    title: "Nenhum curso encontrado",
    description: "Ajuste os filtros ou limpe a busca para ver todos os cursos disponíveis.",
  },
} satisfies Meta<typeof EmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithAction: Story = {
  args: { actionLabel: "Limpar filtros", onAction: () => undefined },
};
