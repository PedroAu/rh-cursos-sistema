import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { Button } from "./button";

/**
 * `Dialog` (Radix) é o modal base. Sempre inclua `DialogTitle` (mesmo que
 * visualmente oculto) para que leitores de tela anunciem o diálogo. O foco é
 * preso dentro do modal e devolvido ao gatilho ao fechar.
 */
const meta = {
  title: "UI/Dialog",
  component: Dialog,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Abrir confirmação</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar inscrição</DialogTitle>
          <DialogDescription>
            Você está prestes a confirmar a inscrição na turma de julho.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancelar</Button>
          <Button>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
