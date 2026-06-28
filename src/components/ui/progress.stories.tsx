import type { Meta, StoryObj } from "@storybook/nextjs";

import { Progress } from "./progress";

/**
 * `Progress` (Radix) representa o avanço de uma tarefa. Passe `value` (0–100);
 * o Radix já expõe os atributos `role="progressbar"` e `aria-valuenow`. Para
 * progresso de vagas com rótulo textual, use `SeatProgress`.
 */
const meta = {
  title: "UI/Progress",
  component: Progress,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { value: 60, className: "w-80" },
  argTypes: { value: { control: { type: "range", min: 0, max: 100, step: 5 } } },
} satisfies Meta<typeof Progress>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { args: { value: 0 } };
export const Complete: Story = { args: { value: 100 } };
