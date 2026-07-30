import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { UserCell } from "./user-cell";

/**
 * `UserCell` é a célula de identidade usada nas tabelas administrativas: avatar
 * de iniciais (sem dependência de imagem externa) + nome e e-mail empilhados.
 */
const meta = {
  title: "Admin/UserCell",
  component: UserCell,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { name: "Maria Souza", email: "maria.souza@example.com" },
} satisfies Meta<typeof UserCell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const LongName: Story = {
  args: { name: "Maria Aparecida da Conceição Souza", email: "maria.aparecida.conceicao@example.com" },
};
