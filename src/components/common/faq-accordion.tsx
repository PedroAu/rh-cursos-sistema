import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const items = [
  {
    value: "item-1",
    question: "Como faço minha inscrição?",
    answer: "Escolha o curso, selecione a turma, preencha os dados e conclua o checkout simulado em poucos passos."
  },
  {
    value: "item-2",
    question: "Recebo certificado?",
    answer: "Sim. A plataforma simula emissão de certificado para validar a jornada e a experiência do aluno."
  },
  {
    value: "item-3",
    question: "Órgãos públicos podem contratar?",
    answer: "Sim. O fluxo e as páginas consideram contratação direta, inexigibilidade, atendimento consultivo e pagamento por empenho."
  },
  {
    value: "item-4",
    question: "Quais formas de pagamento aparecem?",
    answer: "Pix, cartão, boleto e empenho são apresentados de forma simulada para validar o fluxo comercial."
  }
];

export function FAQAccordion() {
  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-display text-[36px] font-bold leading-[1.25] text-deep-navy">
          Perguntas frequentes
        </h2>
        <p className="mt-3 text-base leading-7 text-text-muted">
          Tire dúvidas antes de escolher sua próxima turma.
        </p>
      </div>
      <Accordion type="single" collapsible className="mx-auto grid max-w-4xl gap-3">
        {items.map((item) => (
          <AccordionItem
            key={item.value}
            value={item.value}
            className="rounded-lg border border-primary/10 bg-white px-5 shadow-soft"
          >
            <AccordionTrigger className="text-left font-display text-base font-bold text-deep-navy hover:no-underline">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-7 text-text-muted">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
