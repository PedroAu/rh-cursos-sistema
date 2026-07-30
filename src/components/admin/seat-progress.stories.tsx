import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SeatProgress } from "./seat-progress";

/**
 * `SeatProgress` mostra a ocupação de vagas de uma turma. O percentual é
 * exibido em texto e a barra expõe `role="progressbar"` com `aria-valuenow`,
 * tornando o estado perceptível sem depender de cor.
 */
const meta = {
  title: "Admin/SeatProgress",
  component: SeatProgress,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { filled: 6, total: 20 },
} satisfies Meta<typeof SeatProgress>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PartiallyFilled: Story = {};
export const AlmostFull: Story = { args: { filled: 18, total: 20 } };
export const Full: Story = { args: { filled: 20, total: 20 } };
export const Empty: Story = { args: { filled: 0, total: 20 } };
