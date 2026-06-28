import type { Meta, StoryObj } from "@storybook/nextjs";

import { AppMantineProvider } from "./mantine-provider";
import { Button } from "@/components/ui/button";

/**
 * `AppMantineProvider` injeta o tema Mantine da aplicação. Deve envolver a
 * árvore que usa componentes Mantine (campos de formulário administrativos). No
 * Storybook ele já é aplicado globalmente — esta story documenta o uso isolado.
 */
const meta = {
  title: "Providers/MantineProvider",
  component: AppMantineProvider,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { children: null },
} satisfies Meta<typeof AppMantineProvider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <AppMantineProvider>
      <Button>Conteúdo dentro do tema Mantine</Button>
    </AppMantineProvider>
  ),
};
