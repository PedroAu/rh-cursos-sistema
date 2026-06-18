import Link from "next/link";
import {
  IconAlertTriangle,
  IconArrowRight,
  IconBrandWhatsapp,
  IconBolt,
  IconBooks,
  IconBrain,
  IconCalendarStats,
  IconFileAnalytics,
  IconGavel,
  IconMessages,
  IconRoute,
  IconScale,
  IconStar,
  IconUsersGroup,
} from "@tabler/icons-react";
import { CtaSection } from "@/components/shared/cta-section";
import { FaqSection } from "@/components/shared/faq-section";
import { SectionHeading } from "@/components/shared/section-heading";
import { TestimonialsCarousel } from "@/components/shared/testimonials-carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { faqs, testimonials } from "@/lib/site-data";

const stats = [
  { value: "+1500", label: "alunos capacitados", icon: IconUsersGroup },
  { value: "80+", label: "cursos disponíveis", icon: IconBooks },
  { value: "19 anos", label: "anos de atuação", icon: IconCalendarStats },
  { value: "+100", label: "empresas atendidas", icon: IconStar },
];

const problemItems = [
  {
    title: "Risco de auditoria",
    text: "Erros técnicos detectados em fiscalizações geram multas, retrabalho e exposição para toda a equipe.",
    icon: IconAlertTriangle,
  },
  {
    title: "Cursos teóricos demais",
    text: "Muito conteúdo promete capacitação, mas pouco prepara você para aplicar no dia seguinte.",
    icon: IconFileAnalytics,
  },
  {
    title: "Legislação em mudança",
    text: "eSocial, NR-1, licitações e outras normas não esperam. Quem não se atualiza fica para trás.",
    icon: IconScale,
  },
];

const curriculumTracks = [
  {
    title: "Departamento Pessoal, Folha & eSocial",
    text: "Domínio técnico de DP público, legislação trabalhista e conformidade digital com eSocial, FGTS Digital e LGPD.",
    count: "14 Cursos",
    icon: IconUsersGroup,
    trail: "Departamento pessoal",
  },
  {
    title: "Licitações, Compras e Contratos",
    text: "Da legislação básica à fiscalização avançada de contratos, com cobertura completa da Nova Lei 14.133/2021.",
    count: "12 Cursos",
    icon: IconGavel,
    trail: "Licitacoes",
  },
  {
    title: "Gestão de Pessoas & Liderança",
    text: "Formação humanizada para líderes, com foco em inteligência emocional, cultura organizacional e gestão por resultados.",
    count: "16 Cursos",
    icon: IconBrain,
    trail: "Gestão de pessoas",
  },
  {
    title: "Comunicação e Atendimento",
    text: "Comunicação clara e eficiente para o atendimento ao cidadão e redação oficial moderna.",
    count: "10 Cursos",
    icon: IconMessages,
    trail: "Comunicação e Atendimento",
  },
  {
    title: "Auditoria e Contabilidade Pública",
    text: "Domínio técnico em contabilidade, obrigações acessórias, Tesouro, SIAFI e auditoria governamental.",
    count: "18 Cursos",
    icon: IconFileAnalytics,
    trail: "Auditoria e Contabilidade Pública",
  },
  {
    title: "Tecnologia, Dados e Inovação",
    text: "Ferramentas digitais, análise de dados e governança para a transformação digital no setor público.",
    count: "11 Cursos",
    icon: IconBolt,
    trail: "Tecnologia, Dados e Inovação",
  },
];

const heroHighlights = [
  {
    title: "Desde 2007",
    text: "Formação continuada para profissionais que atuam com RH, gestão pública, auditoria e conformidade.",
  },
  {
    title: "Conteúdo aplicável",
    text: "Aulas orientadas por casos reais, legislação atualizada e rotinas que o aluno encontra no trabalho.",
  },
  {
    title: "Setor público e privado",
    text: "Atendimento para turmas abertas, equipes In Company e demandas com nota de empenho.",
  },
  {
    title: "Trilhas técnicas",
    text: "Cursos organizados por área para acelerar decisão, inscrição e desenvolvimento profissional.",
  },
];

const processSteps = [
  {
    title: "Escolha sua trilha",
    text: "Identifique o desafio técnico do seu cargo ou da sua equipe e encontre a trilha mais adequada para suprir essa lacuna.",
  },
  {
    title: "Aprenda na prática",
    text: "Estude com casos reais, legislação atual e ferramentas que fazem parte da rotina profissional.",
  },
  {
    title: "Aplique e veja resultado",
    text: "Saia com direcionamento claro para melhorar processos, reduzir risco e atuar com mais segurança jurídica.",
  },
];

const commercialWhatsAppHref = `https://wa.me/5561991129682?text=${encodeURIComponent(
  "Olá, quero falar com um consultor da RH Cursos sobre trilhas de capacitação.",
)}`;

export default function HomePage() {
  return (
    <>
      <section className="overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(212,160,23,0.22),transparent_22%),linear-gradient(135deg,hsl(var(--background))_0%,hsl(var(--muted))_100%)]">
        <div className="bg-[linear-gradient(180deg,rgba(6,44,65,0.88),rgba(8,59,86,0.76)),url('/hero-training-bg.png')] bg-cover bg-center">
          <div className="mx-auto grid w-full max-w-page gap-8 px-6 py-16 md:py-24 xl:grid-cols-2 xl:gap-14 xl:py-32">
            <div className="flex flex-col justify-center gap-6">
              <Badge variant="gold" className="w-fit uppercase tracking-[0.08em]">
                TREINAMENTO DE ALTA PERFORMANCE, DESDE 2007.
              </Badge>
              <h1 className="max-w-content font-heading text-4xl font-black leading-tight text-white md:text-6xl">
                Formando quem transforma, <span className="text-brand-gold">há 19 anos.</span>
              </h1>
              <p className="max-w-content text-lg leading-8 text-white/90">
                Capacitação 100% prática para profissionais de RH, Gestão Pública e Auditoria que buscam segurança jurídica e excelência operacional.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="gold" size="lg">
                  <Link href="/cursos">
                    Ver Trilhas de Conhecimento
                    <IconArrowRight aria-hidden size={16} />
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link href="/especialista">Falar com Especialista</Link>
                </Button>
              </div>
            </div>

            <Card className="self-stretch border-white/15 bg-white/10 text-white shadow-2xl backdrop-blur-xl">
              <CardContent className="flex h-full flex-col gap-6 p-6 md:p-8">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="text-sm font-extrabold uppercase tracking-[0.08em] text-brand-gold">
                      RH Cursos & Soluções
                    </p>
                    <p className="mt-2 max-w-md text-sm leading-6 text-white/75">
                      Educação corporativa para quem precisa decidir, executar e prestar contas com segurança.
                    </p>
                  </div>
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-gold/20 text-brand-gold">
                    <IconRoute aria-hidden size={28} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {heroHighlights.map((item) => (
                    <Card key={item.title} className="border-white/10 bg-white/5 text-white shadow-none">
                      <CardContent className="p-4">
                        <h2 className="font-heading text-base font-extrabold leading-6 text-brand-gold">
                          {item.title}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-white/75">{item.text}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-page px-6 py-12 md:py-16 xl:py-24">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-8">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.value} className="border-t-4 border-t-brand-navy-700">
                <CardContent className="flex items-center gap-5 p-6">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon aria-hidden size={28} />
                  </div>
                  <div>
                    <p className="font-heading text-3xl font-black text-brand-navy-800">{item.value}</p>
                    <p className="text-sm font-extrabold text-muted-foreground">{item.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="bg-brand-navy-700 py-16 text-white md:py-24 xl:py-32">
        <div className="mx-auto w-full max-w-page px-6">
          <div className="space-y-8">
            <SectionHeading
              eyebrow="O Problema Real"
              title="A burocracia muda. Quem não se atualiza, erra."
              description="DP, eSocial, Lei 14.133 e IA aplicada ao serviço público avançam rápido. Enquanto o volume técnico aumenta, o tempo para aprender diminui. E cada erro pode virar multa, retrabalho ou risco para a equipe."
              align="center"
              inverse
            />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-8">
              {problemItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Card key={item.title} className="min-h-64 border-white/10 bg-white/10 text-white shadow-none">
                    <CardContent className="flex h-full flex-col items-center gap-5 p-6 text-center">
                      <div className="flex size-[52px] items-center justify-center rounded-md bg-brand-gold/15 text-brand-gold">
                        <Icon aria-hidden size={26} />
                      </div>
                      <h2 className="text-balance font-heading text-xl font-extrabold text-white">
                        {item.title}
                      </h2>
                      <p className="max-w-xs leading-7 text-white/80">{item.text}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/70 py-12 md:py-16 xl:py-24">
        <div className="mx-auto w-full max-w-page px-6">
          <div className="space-y-8">
            <SectionHeading
              eyebrow="Nosso Currículo"
              title="Escolha sua trilha de capacitação"
              description="+80 cursos em 6 trilhas, prontas para você começar sua transformação profissional agora."
              align="center"
            />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-8">
              {curriculumTracks.map((item) => (
                <Card key={item.title} className="min-h-80">
                  <CardContent className="flex h-full flex-col gap-5 p-6">
                    <div className="flex items-start">
                      <Badge variant="gold">{item.count}</Badge>
                    </div>
                    <h2 className="font-heading text-2xl font-black leading-tight text-brand-navy-800">
                      {item.title}
                    </h2>
                    <p className="leading-7 text-muted-foreground">{item.text}</p>
                    <Button asChild className="mt-auto w-fit" variant="gold">
                      <Link href={`/cursos?trilha=${encodeURIComponent(item.trail)}`}>
                        Ver cursos da trilha
                        <IconArrowRight aria-hidden size={16} />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 xl:py-24">
        <div className="mx-auto w-full max-w-page px-6">
          <div className="space-y-8">
            <SectionHeading
              eyebrow="Como funciona"
              title="Três passos para transformar resultado"
              description="Da escolha da trilha à aplicação prática, o processo foi pensado para profissionais que precisam se atualizar sem perder tempo com caminhos confusos."
              align="center"
            />
            <div className="grid gap-4 md:grid-cols-3 xl:gap-12">
              {processSteps.map((step, index) => (
                <Card key={step.title} className="min-h-80">
                  <CardContent className="flex h-full flex-col items-center gap-5 p-6 text-center">
                    <div className="flex size-[76px] items-center justify-center rounded-full bg-primary font-heading text-xl font-black text-primary-foreground">
                      {index + 1}
                    </div>
                    <h2 className="text-balance font-heading text-xl font-extrabold text-brand-navy-800">
                      {step.title}
                    </h2>
                    <p className="max-w-xs leading-7 text-muted-foreground">{step.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/70 py-12 md:py-16 xl:py-24">
        <div className="mx-auto w-full max-w-page px-6">
          <div className="space-y-8">
            <SectionHeading
              eyebrow="Depoimentos"
              title="Relatos de quem aplicou a capacitação na rotina"
              description="Os depoimentos abaixo permanecem estáticos até a entrega do CRUD de avaliações no painel administrativo."
              align="center"
            />
            <TestimonialsCarousel items={testimonials} />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-page px-6 py-12 md:py-16 xl:py-24">
        <FaqSection
          title="Dúvidas frequentes"
          description="Respostas diretas sobre inscrição, certificados e contratação por órgãos públicos."
          items={faqs}
        />
      </section>

      <section className="mx-auto w-full max-w-page px-6 py-16 md:py-24 xl:py-32">
        <CtaSection
          title="Pronto para ser referência?"
          text="Inicie agora sua jornada de atualização técnica e ganhe a segurança que seu cargo exige."
          primaryHref="/cursos"
          primaryLabel="Ver trilhas agora"
          secondaryHref={commercialWhatsAppHref}
          secondaryLabel="WhatsApp Consultoria"
          secondaryColor="green"
          secondaryVariant="filled"
          secondaryLeftSection={<IconBrandWhatsapp size={18} />}
          secondaryExternal
        />
      </section>
    </>
  );
}
