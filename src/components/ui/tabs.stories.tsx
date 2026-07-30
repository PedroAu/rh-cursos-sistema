import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

/**
 * `Tabs` (Radix) organiza conteúdo em abas. Use `defaultValue` para a aba
 * inicial. Navegação por teclado e `aria-selected` são fornecidos pelo Radix.
 */
const meta = {
  title: "UI/Tabs",
  component: Tabs,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="ementa" className="mx-auto max-w-2xl">
      <TabsList>
        <TabsTrigger value="ementa">Ementa</TabsTrigger>
        <TabsTrigger value="turmas">Turmas</TabsTrigger>
        <TabsTrigger value="instrutor">Instrutor</TabsTrigger>
      </TabsList>
      <TabsContent value="ementa" className="pt-4 text-sm text-muted-foreground">
        Conteúdo programático com casos práticos do eSocial.
      </TabsContent>
      <TabsContent value="turmas" className="pt-4 text-sm text-muted-foreground">
        Próxima turma: 10/07/2026, ao vivo online.
      </TabsContent>
      <TabsContent value="instrutor" className="pt-4 text-sm text-muted-foreground">
        Ana Lima — especialista em rotinas trabalhistas.
      </TabsContent>
    </Tabs>
  ),
};
