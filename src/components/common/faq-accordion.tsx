import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const items = [
  {
    value: "item-1",
    question: "Como faço minha inscrição?",
    answer: "Escolha o curso, selecione a turma e envie a pré-inscrição. A equipe analisará a solicitação antes de confirmar a vaga."
  },
  {
    value: "item-2",
    question: "Recebo certificado?",
    answer: "Sim. A equipe RH Cursos orienta a emissão e o envio de certificados conforme a turma contratada."
  },
  {
    value: "item-3",
    question: "Órgãos públicos podem contratar?",
    answer: "Sim. O fluxo e as páginas consideram contratação direta, inexigibilidade, atendimento consultivo e pagamento por empenho."
  },
  {
    value: "item-4",
    question: "O que acontece após a pré-inscrição?",
    answer: "A equipe confere os dados e entra em contato para orientar os próximos passos e as condições comerciais aplicáveis."
  }
];

export function FAQAccordion() {
  return (
    <Accordion type="single" collapsible className="mx-auto grid max-w-4xl gap-3">
      {items.map((item) => (
        <AccordionItem
          key={item.value}
          value={item.value}
          className="rounded-lg border border-tk-brand/10 bg-white px-5 shadow-soft"
        >
          <AccordionTrigger className="text-left font-tk-display text-base font-bold tracking-[var(--tk-tracking-display)] text-tk-ink hover:no-underline">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="text-sm leading-7 text-tk-ink-muted">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
