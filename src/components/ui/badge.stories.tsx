import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Badge } from "./badge";

/**
 * `Badge` rotula status e categorias. Use variantes semânticas (`success`,
 * `warning`, `danger`) para reforçar significado — nunca dependa apenas da cor:
 * o texto do badge já comunica o estado para leitores de tela.
 */
const meta = {
  title: "UI/Badge",
  component: Badge,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { children: "Inscrições abertas" },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["default", "success", "warning", "danger", "muted"],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Success: Story = { args: { variant: "success", children: "Confirmada" } };
export const Warning: Story = { args: { variant: "warning", children: "Poucas vagas" } };
export const Danger: Story = { args: { variant: "danger", children: "Encerrada" } };
export const Muted: Story = { args: { variant: "muted", children: "Rascunho" } };

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Badge>Default</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="danger">Danger</Badge>
      <Badge variant="muted">Muted</Badge>
    </div>
  ),
};
