import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Input } from "./input";

/**
 * `Input` é o campo de texto base. Sempre associe um `<label>` (ou `aria-label`)
 * para acessibilidade — o componente apenas estiliza o `<input>` nativo e
 * encaminha todos os atributos HTML.
 */
const meta = {
  title: "UI/Input",
  component: Input,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { placeholder: "seu@email.com", "aria-label": "E-mail" },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true, value: "Indisponível" } };
export const Password: Story = { args: { type: "password", placeholder: "Senha", "aria-label": "Senha" } };

export const WithLabel: Story = {
  render: (args) => (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 280 }}>
      <span className="text-sm font-semibold">E-mail corporativo</span>
      <Input {...args} />
    </label>
  ),
};
