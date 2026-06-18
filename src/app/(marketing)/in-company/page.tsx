import {
  IconArrowDown,
  IconBrandWhatsapp,
  IconCalendarCheck,
  IconEdit,
  IconReceipt2,
  IconUsersGroup,
} from "@tabler/icons-react";
import { PublicLeadForm } from "@/components/forms/public-lead-form";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const whatsappHref = `https://wa.me/5561991129682?text=${encodeURIComponent(
  "Olá, quero falar com um consultor técnico da RH Cursos sobre treinamento In Company.",
)}`;

const benefits = [
  {
    title: "Conteúdo 100% Customizado",
    text: "Nossos especialistas adaptam ementa, estudos de caso e linguagem técnica para a realidade da sua empresa ou órgão público. O treinamento foca nos problemas que sua equipe enfrenta no dia a dia.",
    icon: IconEdit,
    variant: "wide",
  },
  {
    title: "Flexibilidade Total",
    text: "Escolha datas, horários e formato presencial, online ao vivo ou híbrido de acordo com a jornada de trabalho da sua equipe.",
    icon: IconCalendarCheck,
    variant: "dark",
  },
  {
    title: "Redução de Custos",
    text: "Economize com deslocamentos e hospedagens. O treinamento coletivo reduz o investimento por colaborador de forma significativa.",
    icon: IconReceipt2,
    variant: "default",
  },
  {
    title: "Logística Simplificada",
    text: "Cuidamos da infraestrutura educacional, material didático, suporte e certificados. Sua equipe fica focada no aprendizado.",
    icon: IconUsersGroup,
    variant: "highlight",
  },
] as const;

const processSteps = [
  {
    number: "01",
    title: "Diagnóstico",
    text: "Análise das necessidades, lacunas de competência e objetivos práticos da equipe.",
  },
  {
    number: "02",
    title: "Personalização",
    text: "Adaptação do programa pedagógico, seleção do instrutor e definição do melhor formato.",
  },
  {
    number: "03",
    title: "Execução e Avaliação",
    text: "Entrega do treinamento com suporte operacional e leitura de eficácia pós-curso.",
  },
];

export default function InCompanyPage() {
  return (
    <>
      <section className="overflow-hidden bg-[linear-gradient(90deg,rgba(6,44,65,0.96)_0%,rgba(8,59,86,0.9)_46%,rgba(8,59,86,0.46)_100%),radial-gradient(circle_at_85%_20%,rgba(212,160,23,0.22),transparent_28%),url('/hero-training-bg.svg')] bg-cover bg-center text-white">
        <div className="mx-auto w-full max-w-page px-6 py-16 md:py-24 xl:py-32">
          <div className="grid items-center gap-8 xl:gap-14 lg:grid-cols-[minmax(0,0.62fr)_minmax(0,0.38fr)]">
            <div className="max-w-content space-y-6">
                <Badge className="w-fit bg-brand-gold text-brand-navy-900" variant="gold">
                  IN COMPANY
                </Badge>
                <h1 className="text-balance font-heading text-4xl font-bold leading-tight text-white md:text-6xl">
                  In Company: Treinamento Estratégico para Resultados Reais
                </h1>
                <p className="max-w-content-sm text-lg leading-8 text-white/85">
                  Capacite sua equipe com soluções educacionais personalizadas,
                  focadas nos desafios específicos da sua organização e do setor público.
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <Button asChild size="lg" variant="gold">
                    <a href="#proposta">
                    Solicitar Proposta
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="inverse">
                    <a href="#beneficios">
                      Saiba Mais
                      <IconArrowDown size={16} />
                    </a>
                  </Button>
                </div>
            </div>
          </div>
        </div>
      </section>

      <section id="beneficios" className="py-16 md:py-24 xl:py-32">
        <div className="mx-auto w-full max-w-page px-6">
          <SectionHeading
            eyebrow="Por que escolher o In Company?"
            title="Vantagens para sua Organização"
            align="center"
          />

          <div className="mt-12 grid gap-4 md:grid-cols-12 xl:gap-6">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              const isDark = benefit.variant === "dark";
              const isWide = benefit.variant === "wide" || benefit.variant === "highlight";

              return (
                <div className={isWide ? "md:col-span-8" : "md:col-span-4"} key={benefit.title}>
                  <Card
                    className={isDark ? "h-full bg-brand-navy-900 text-white" : benefit.variant === "highlight" ? "h-full border-brand-gold bg-brand-gold/10" : "h-full"}
                  >
                    <CardContent className={isWide ? "flex flex-col gap-6 p-6 xl:flex-row xl:p-8" : "space-y-5 p-6 xl:p-8"}>
                      <span className={isDark ? "inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold" : "inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-navy-50 text-brand-navy-700"}>
                        <Icon size={28} />
                      </span>
                      <div className="flex-1 space-y-3">
                        <h3 className={isDark ? "font-heading text-2xl font-bold text-white" : "font-heading text-2xl font-bold text-brand-navy-700"}>
                          {benefit.title}
                        </h3>
                        <p className={isDark ? "leading-7 text-white/75" : "leading-7 text-muted-foreground"}>
                          {benefit.text}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-linear-to-b from-background to-muted py-16 md:py-24 xl:py-32">
        <div className="mx-auto w-full max-w-page px-6">
          <div className="grid items-center gap-8 xl:grid-cols-2 xl:gap-16">
            <div className="space-y-8">
                <div className="space-y-3">
                  <p className="text-sm font-extrabold uppercase tracking-[0.08em] text-brand-navy-700">
                    Processo consultivo
                  </p>
                  <h2 className="font-heading text-3xl font-bold text-foreground md:text-4xl">Como funciona a implementação</h2>
                  <p className="max-w-content-sm text-lg leading-8 text-muted-foreground">
                    A proposta é construída com base no contexto real da organização,
                    evitando pacotes genéricos e priorizando aplicabilidade.
                  </p>
                </div>

                <div className="space-y-8">
                  {processSteps.map((step) => (
                    <div className="flex items-start gap-6" key={step.number}>
                      <p className="min-w-24 font-heading text-[clamp(3.5rem,7vw,5.5rem)] font-extrabold leading-[0.82] text-brand-navy-50">
                        {step.number}
                      </p>
                      <div className="space-y-1.5">
                        <p className="text-sm font-extrabold uppercase tracking-[0.06em] text-brand-navy-700">
                          {step.title}
                        </p>
                        <p className="leading-7 text-muted-foreground">
                          {step.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
            </div>

            <div>
              <Card className="shadow-lg" id="proposta">
                <CardContent className="space-y-6 p-6 md:p-8">
                  <h3 className="font-heading text-2xl font-bold text-foreground">Solicitar proposta In Company</h3>
                  <PublicLeadForm
                    hiddenFields={{
                      tipo: "In Company",
                      origem: "In Company site RH Cursos",
                      path_to_revalidate: "/in-company",
                    }}
                    submitLabel="Enviar Solicitação"
                    submitColor="navy"
                    submitTextColor="white"
                    showDescriptions={false}
                    fields={[
                      "nome",
                      "email",
                      "telefone",
                      "orgao",
                      "num_participantes",
                      "tema_treinamento",
                      "objetivo_treinamento",
                      "desafios_principais",
                    ]}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-gold py-12 md:py-16 xl:py-24">
        <div className="mx-auto grid w-full max-w-page items-center gap-6 px-6 md:grid-cols-[1fr_auto] xl:gap-12">
            <div className="space-y-2">
                <h2 className="font-heading text-3xl font-bold text-brand-navy-900">
                  Precisa de algo ainda mais específico?
                </h2>
                <p className="text-lg text-brand-navy-900/80">
                  Fale diretamente com nosso consultor técnico pelo WhatsApp.
                </p>
            </div>
                <Button asChild className="w-full rounded-full md:w-auto" size="lg" variant="navy">
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                  <IconBrandWhatsapp size={20} />
                  Falar com Consultor
                  </a>
                </Button>
        </div>
      </section>
    </>
  );
}
