import type { Meta, StoryObj } from "@storybook/nextjs";

import { Textarea } from "./textarea";

/**
 * `Textarea` para entradas longas (mensagens, observações). Associe sempre um
 * rótulo acessível. Herda todos os atributos do `<textarea>` nativo.
 */
const meta = {
  title: "UI/Textarea",
  component: Textarea,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { placeholder: "Conte sobre o objetivo do treinamento...", "aria-label": "Mensagem" },
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true, value: "Indisponível" } };
export const Filled: Story = {
  args: { defaultValue: "Precisamos capacitar 12 analistas em rotinas de eSocial." },
};
