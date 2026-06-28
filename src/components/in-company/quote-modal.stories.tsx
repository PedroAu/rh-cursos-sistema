import type { Meta, StoryObj } from "@storybook/nextjs";

import { useQuoteModal } from "./quote-modal";
import { withAppStore } from "@/components/storybook/decorators";
import { Button } from "@/components/ui/button";
import { mockCourse } from "@/components/storybook/mock-data";

/**
 * O fluxo In Company é exposto por contexto: `QuoteModalProvider` (aplicado
 * pelo decorator) hospeda o modal e `useQuoteModal()` fornece `openQuote()`.
 * Qualquer CTA pode abrir o formulário de orçamento, opcionalmente
 * pré-selecionando um curso.
 */
const meta = {
  title: "Domínio/QuoteModal",
  decorators: [withAppStore],
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function QuoteTrigger() {
  const { openQuote } = useQuoteModal();
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <Button onClick={() => openQuote()}>Solicitar orçamento</Button>
      <Button variant="outline" onClick={() => openQuote(mockCourse)}>
        Orçamento com curso
      </Button>
    </div>
  );
}

export const Default: Story = { render: () => <QuoteTrigger /> };
