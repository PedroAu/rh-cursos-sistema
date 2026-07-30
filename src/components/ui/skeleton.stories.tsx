import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Skeleton } from "./skeleton";

/**
 * `Skeleton` sinaliza carregamento. Combine vários blocos para espelhar o
 * layout final. Em regiões dinâmicas, anuncie o estado com `aria-busy`/
 * `aria-live` no contêiner (ver `LoadingBlocks`).
 */
const meta = {
  title: "UI/Skeleton",
  component: Skeleton,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { className: "h-6 w-48" },
} satisfies Meta<typeof Skeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Line: Story = {};

export const CardPlaceholder: Story = {
  render: () => (
    <div className="surface-card space-y-3 p-5" style={{ width: 320 }} aria-busy="true">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  ),
};
