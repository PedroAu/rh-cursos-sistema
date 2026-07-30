import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CommandPalette } from "./command-palette";
import { withAppStore } from "@/components/storybook/decorators";

/**
 * `CommandPalette` é a navegação rápida acionada por `Ctrl/Cmd + K`. Consome a
 * store de cursos para sugerir resultados, por isso a story é semeada com a
 * `AppStoreProvider` mockada. Pressione `Ctrl/Cmd + K` no canvas para abrir.
 */
const meta = {
  title: "Common/CommandPalette",
  component: CommandPalette,
  decorators: [withAppStore],
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof CommandPalette>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="text-sm text-muted-foreground">
      Pressione <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>K</kbd> para abrir a paleta de comandos.
      <CommandPalette />
    </div>
  ),
};
