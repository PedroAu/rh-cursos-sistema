import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { LoadingBlocks } from "./loading-blocks";

/**
 * `LoadingBlocks` exibe esqueletos em grade enquanto listas carregam. O
 * contêiner usa `aria-live="polite"` e `aria-busy` para anunciar o estado, e
 * `summary` fornece um texto perceptível por leitores de tela.
 */
const meta = {
  title: "Common/LoadingBlocks",
  component: LoadingBlocks,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: { count: 3 },
  argTypes: { count: { control: { type: "range", min: 1, max: 9, step: 1 } } },
} satisfies Meta<typeof LoadingBlocks>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Single: Story = { args: { count: 1, summary: "Carregando curso..." } };
export const Grid: Story = { args: { count: 6 } };
