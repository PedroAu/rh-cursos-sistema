import type { Meta, StoryObj } from "@storybook/nextjs";

import { ErrorFallback } from "./error-fallback";

/**
 * `ErrorFallback` é a UI amigável dos error boundaries (`app/error.tsx`).
 * Passe `onReset` para exibir "Tentar novamente" e `errorId` (ex.:
 * `error.digest`) para facilitar o suporte.
 */
const meta = {
  title: "Common/ErrorFallback",
  component: ErrorFallback,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta<typeof ErrorFallback>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithReset: Story = {
  args: { onReset: () => undefined, errorId: "a1b2c3d4" },
};
export const Custom: Story = {
  args: {
    title: "Página indisponível",
    description: "Estamos em manutenção. Tente novamente em alguns minutos.",
  },
};
