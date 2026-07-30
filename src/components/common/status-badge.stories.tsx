import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { StatusBadge } from "./status-badge";

/**
 * `StatusBadge` mapeia um texto de status do domínio para a variante semântica
 * de `Badge` (sucesso/atenção/erro/neutro) por correspondência de padrão. O
 * próprio texto comunica o estado — a cor é reforço, não a única pista.
 */
const meta = {
  title: "Common/StatusBadge",
  component: StatusBadge,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { status: "Confirmada" },
} satisfies Meta<typeof StatusBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Success: Story = { args: { status: "Confirmada" } };
export const Warning: Story = { args: { status: "Poucas vagas" } };
export const Danger: Story = { args: { status: "Cancelada" } };
export const Neutral: Story = { args: { status: "Em análise" } };

export const Spectrum: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {["Confirmada", "Inscrições abertas", "Poucas vagas", "Aguardando pagamento", "Encerrada", "Perdido", "Em análise"].map(
        (status) => (
          <StatusBadge key={status} status={status} />
        )
      )}
    </div>
  ),
};
