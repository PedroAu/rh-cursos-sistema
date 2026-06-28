import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";

import { CheckoutModal } from "./checkout-modal";
import { withAppStore } from "@/components/storybook/decorators";
import { Button } from "@/components/ui/button";
import { mockCourse } from "@/components/storybook/mock-data";

/**
 * `CheckoutModal` conduz a inscrição em quatro passos (dados pessoais, contexto
 * profissional, escolha da turma e confirmação). É controlado via `open` /
 * `onOpenChange` e lê turmas da store (decorator mockado).
 */
const meta = {
  title: "Domínio/CheckoutModal",
  component: CheckoutModal,
  decorators: [withAppStore],
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { course: mockCourse, open: false, onOpenChange: () => undefined },
} satisfies Meta<typeof CheckoutModal>;

export default meta;

type Story = StoryObj<typeof meta>;

function CheckoutTrigger() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Inscrever-se no curso</Button>
      <CheckoutModal course={mockCourse} open={open} onOpenChange={setOpen} />
    </>
  );
}

export const Default: Story = { render: () => <CheckoutTrigger /> };
