import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";

/**
 * `Accordion` (Radix) para conteúdo expansível como FAQs. Use `type="single"`
 * com `collapsible` para perguntas frequentes, ou `type="multiple"` quando
 * várias seções podem ficar abertas. O Radix cuida do teclado e do ARIA.
 */
const meta = {
  title: "UI/Accordion",
  component: Accordion,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: { type: "single" },
} satisfies Meta<typeof Accordion>;

export default meta;

type Story = StoryObj<typeof meta>;

const items = [
  { value: "a", q: "Como faço minha inscrição?", a: "Escolha o curso, selecione a turma e conclua o checkout." },
  { value: "b", q: "Recebo certificado?", a: "Sim, emitido conforme a turma contratada." },
  { value: "c", q: "Órgãos públicos podem contratar?", a: "Sim, inclusive por empenho." },
];

export const Single: Story = {
  render: () => (
    <Accordion type="single" collapsible className="mx-auto grid max-w-2xl gap-3">
      {items.map((item) => (
        <AccordionItem
          key={item.value}
          value={item.value}
          className="rounded-lg border border-tk-brand/10 bg-white px-5"
        >
          <AccordionTrigger>{item.q}</AccordionTrigger>
          <AccordionContent>{item.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
};

export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple" className="mx-auto grid max-w-2xl gap-3">
      {items.map((item) => (
        <AccordionItem
          key={item.value}
          value={item.value}
          className="rounded-lg border border-tk-brand/10 bg-white px-5"
        >
          <AccordionTrigger>{item.q}</AccordionTrigger>
          <AccordionContent>{item.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
};
