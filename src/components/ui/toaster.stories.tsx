import type { Meta, StoryObj } from "@storybook/nextjs";
import { toast } from "sonner";

import { AppToaster } from "./toaster";
import { Button } from "./button";

/**
 * `AppToaster` monta o `Toaster` do sonner com os padrões da aplicação
 * (cores ricas, canto superior direito). Renderize-o uma vez no layout raiz;
 * dispare notificações em qualquer lugar com `toast()` do `sonner`.
 */
const meta = {
  title: "UI/Toaster",
  component: AppToaster,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof AppToaster>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <AppToaster />
      <Button onClick={() => toast.success("Inscrição confirmada!")}>Sucesso</Button>
      <Button variant="outline" onClick={() => toast.error("Falha ao salvar.")}>
        Erro
      </Button>
      <Button variant="secondary" onClick={() => toast("Processando...")}>
        Neutro
      </Button>
    </div>
  ),
};
