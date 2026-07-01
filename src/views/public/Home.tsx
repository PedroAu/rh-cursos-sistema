"use client";

import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  Landmark,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Users
} from "lucide-react";
import type { CSSProperties } from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { H1, H2, H3, P, Typography } from "@/components/ui/typography";
import { useAppStore } from "@/lib/app-store";
import { company } from "@/lib/company";
import { Link } from "@/lib/router-compat";

const themeVars = {
  "--rh-teal-deep": "#0c6a83",
  "--rh-teal": "#1791a9",
  "--rh-teal-light": "#37b7cc",
  "--rh-paper": "#f3f0e8",
  "--rh-paper-border": "#ddd7c7",
  "--rh-paper-strong": "#ebe5d8",
  "--rh-copy-soft": "#5b6670",
  "--rh-ink": "#1f2a33",
  "--rh-border": "rgba(12, 106, 131, 0.12)"
} as CSSProperties;

const heroBenefits = [
  "Cursos abertos com aplicação imediata",
  "Treinamentos in company sob medida",
  "Consultoria para setor público e privado"
];

const promiseCards = [
  {
    icon: ShieldCheck,
    title: "Segurança técnica",
    description: "Conteúdo ancorado em legislação, operação real e decisões que reduzem risco para a equipe."
  },
  {
    icon: Sparkles,
    title: "Aprendizado aplicável",
    description: "Aulas desenhadas para sair do treinamento com roteiro, modelo e clareza de execução."
  },
  {
    icon: Users,
    title: "Formatos flexíveis",
    description: "Atendimento para profissionais individuais, equipes corporativas e órgãos públicos."
  }
];

const serviceCards = [
  {
    icon: GraduationCap,
    title: "Cursos abertos",
    description: "Turmas presenciais e online ao vivo para atualização técnica com calendário contínuo.",
    cta: "Ver agenda",
    href: "/agenda"
  },
  {
    icon: BriefcaseBusiness,
    title: "In company",
    description: "Programas customizados para nivelar equipes, acelerar implantação e padronizar operação.",
    cta: "Solicitar proposta",
    href: "/in-company"
  },
  {
    icon: Landmark,
    title: "Consultoria",
    description: "Apoio para revisão de processos, adequação normativa e desenho de jornadas mais seguras.",
    cta: "Conhecer consultoria",
    href: "/consultoria"
  }
];

const processSteps = [
  {
    number: "01",
    title: "Mapeie a necessidade",
    description: "Escolha a trilha, modalidade e formato conforme o desafio operacional da equipe."
  },
  {
    number: "02",
    title: "Capacite com contexto real",
    description: "Aprenda com casos práticos, materiais aplicáveis e mediação de especialistas da área."
  },
  {
    number: "03",
    title: "Implemente com segurança",
    description: "Volte para a rotina com critérios claros, mais rapidez e menos retrabalho."
  }
];

const faqItems = [
  {
    value: "faq-1",
    question: "Como faço minha inscrição?",
    answer: "Você pode se inscrever pela página do curso, pela agenda de turmas ou com apoio consultivo da equipe comercial."
  },
  {
    value: "faq-2",
    question: "Os cursos emitem certificado?",
    answer: "Sim. As turmas oferecem certificado conforme a carga horária e os critérios de participação informados na matrícula."
  },
  {
    value: "faq-3",
    question: "Vocês atendem órgãos públicos e empresas?",
    answer: "Sim. A RH Cursos atua com cursos abertos, treinamentos in company e consultoria para setor público e privado."
  }
];

const pathIcons = [
  BookOpen,
  ClipboardCheck,
  MessageSquareText,
  Users,
  BriefcaseBusiness,
  CalendarDays
];

function getClassDateParts(value: string) {
  const date = new Date(value);
  const day = new Intl.DateTimeFormat("pt-BR", { day: "2-digit" }).format(date);
  const month = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date).replace(".", "");
  return { day, month };
}

export function HomePage() {
  const { classes, courses, testimonials, trainingPaths } = useAppStore();

  const upcomingClasses = [...classes]
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3)
    .map((trainingClass) => ({
      ...trainingClass,
      courseTitle: courses.find((course) => course.id === trainingClass.courseId)?.title ?? "Curso RH Cursos"
    }));

  const highlightedPaths = trainingPaths.slice(0, 6).map((path, index) => ({
    ...path,
    icon: pathIcons[index % pathIcons.length]
  }));

  const heroStats = [
    `${Math.max(courses.length, 80)} cursos`,
    `${Math.max(trainingPaths.length, 6)} trilhas`,
    "Presencial e online"
  ];

  const featuredTestimonials = testimonials.slice(0, 2);

  return (
    <div className="bg-[#eef0f2] pb-16 pt-8 md:pb-24 md:pt-10" style={themeVars}>
      <div className="mx-auto w-[min(1180px,calc(100%-24px))] overflow-hidden rounded-[24px] border border-[var(--rh-border)] bg-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.25)] md:w-[min(1180px,calc(100%-40px))]">
        <section
          data-testid="ui-hero-home"
          className="grid gap-10 bg-[var(--rh-paper)] px-6 py-12 md:grid-cols-[1.05fr_0.95fr] md:px-10 md:py-20"
        >
          <div className="max-w-2xl">
            <Badge className="border-[var(--rh-border)] bg-white px-4 py-2 normal-case tracking-normal text-[var(--rh-teal-deep)] shadow-[0_8px_24px_rgba(12,106,131,0.08)]">
              Educação corporativa · Desde {company.foundedYear}
            </Badge>

            <H1 className="mt-6 text-[2.6rem] leading-[1.02] tracking-[-0.03em] text-[var(--rh-ink)] md:text-[4.2rem]">
              Conhecimento técnico que sua equipe{" "}
              <span className="italic text-[var(--rh-teal-deep)]">aplica no mesmo dia</span>.
            </H1>

            <Typography
              as="p"
              variant="subheading-large"
              className="mt-6 max-w-[48ch] text-[1.1rem] text-[var(--rh-copy-soft)] md:text-[1.45rem]"
            >
              Cursos abertos, treinamentos in company e consultoria para o setor público e privado.
              São quase 80 cursos em trilhas de conhecimento do básico ao avançado, presenciais ou online.
            </Typography>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-[var(--rh-teal-deep)] hover:bg-[#084f63]">
                <Link to="/agenda">
                  Ver agenda de cursos
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="border-[var(--rh-border)] bg-white text-[var(--rh-teal-deep)] hover:bg-[var(--rh-paper-strong)]"
              >
                <Link to="/in-company">Solicitar proposta in company</Link>
              </Button>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              {heroStats.map((item) => (
                <span
                  key={item}
                  className="inline-flex min-h-11 items-center rounded-full border border-[var(--rh-border)] bg-white px-4 text-sm font-medium text-[var(--rh-ink)] shadow-[0_8px_24px_rgba(12,106,131,0.08)]"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {heroBenefits.map((item) => (
                <div
                  key={item}
                  className="rounded-[18px] border border-[var(--rh-border)] bg-white/80 px-4 py-4 text-sm font-medium text-[var(--rh-ink)]"
                >
                  <CheckCircle2 className="mb-2 h-4 w-4 text-[var(--rh-teal)]" aria-hidden="true" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-[var(--rh-paper-border)] bg-[linear-gradient(158deg,#ffffff,#ebebeb)] p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.3)] md:p-8">
            <div className="flex flex-col items-center gap-5">
              <Image
                src={company.logo.src}
                alt={company.logo.alt}
                width={360}
                height={226}
                className="h-auto w-full max-w-[320px]"
                priority
              />
              <div className="h-px w-full bg-[var(--rh-paper-border)]" />
            </div>

            <div className="mt-5">
              <H3 className="text-xl text-[var(--rh-ink)]">Próximas turmas</H3>
              <div className="mt-4 grid gap-3">
                {upcomingClasses.map((trainingClass) => {
                  const { day, month } = getClassDateParts(trainingClass.startDate);
                  return (
                    <div
                      key={trainingClass.id}
                      className="flex items-center gap-4 rounded-[18px] border border-[var(--rh-paper-border)] bg-white/80 px-4 py-3"
                    >
                      <div className="w-12 shrink-0 text-center">
                        <div className="font-display text-2xl font-bold leading-none text-[var(--rh-teal-deep)]">
                          {day}
                        </div>
                        <div className="mt-1 text-[10px] uppercase tracking-[0.08em] text-[var(--rh-copy-soft)]">
                          {month}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-5 text-[var(--rh-ink)]">
                          {trainingClass.courseTitle}
                        </p>
                        <p className="mt-1 text-xs text-[var(--rh-copy-soft)]">
                          {trainingClass.modality} · {trainingClass.location}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button asChild variant="tertiary" className="mt-5 text-[var(--rh-teal-deep)] hover:text-[var(--rh-teal)]">
                <Link to="/agenda">Explorar calendário completo</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="px-6 py-12 md:px-10 md:py-16">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--rh-teal)]">
              Diferenciais
            </p>
            <H2 className="mt-4 text-[2rem] text-[var(--rh-ink)] md:text-[3rem]">
              Formação corporativa com foco em aplicação, clareza e decisão.
            </H2>
            <P className="mt-4 max-w-[60ch] text-[var(--rh-copy-soft)]">
              A home de referência enfatiza uma proposta direta: menos conteúdo abstrato, mais repertório
              operacional. Mantive essa lógica na estrutura da página e transformei em blocos de decisão.
            </P>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {promiseCards.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} variant="glass" className="border-[var(--rh-border)] bg-white" size="lg">
                  <CardHeader className="p-0">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(23,145,169,0.12)] text-[var(--rh-teal-deep)]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <CardTitle className="text-[1.35rem] text-[var(--rh-ink)]">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 pt-3">
                    <P className="text-[var(--rh-copy-soft)]">{item.description}</P>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="bg-[#f7f8f9] px-6 py-12 md:px-10 md:py-16">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--rh-teal)]">
                Trilhas de conhecimento
              </p>
              <H2 className="mt-4 text-[2rem] text-[var(--rh-ink)] md:text-[3rem]">
                Escolha a frente que mais pressiona sua operação hoje.
              </H2>
            </div>
            <Button asChild variant="secondary" className="border-[var(--rh-border)] bg-white text-[var(--rh-teal-deep)]">
              <Link to="/cursos">Ver catálogo completo</Link>
            </Button>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {highlightedPaths.map((path) => {
              const Icon = path.icon;
              return (
                <Card key={path.id} variant="elevated" className="border-[var(--rh-border)] bg-white" size="lg">
                  <CardHeader className="p-0">
                    <div className="flex items-center justify-between gap-4">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(12,106,131,0.1)] text-[var(--rh-teal-deep)]">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <span className="rounded-full bg-[rgba(12,106,131,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--rh-teal-deep)]">
                        {path.courseCount} cursos
                      </span>
                    </div>
                    <CardTitle className="mt-5 text-[1.35rem] text-[var(--rh-ink)]">{path.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 pt-3">
                    <P className="text-[var(--rh-copy-soft)]">{path.description}</P>
                    <Button asChild variant="tertiary" className="mt-4 text-[var(--rh-teal-deep)] hover:text-[var(--rh-teal)]">
                      <Link to="/cursos">Explorar trilha</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="px-6 py-12 md:px-10 md:py-16">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--rh-teal)]">
                Formatos de atendimento
              </p>
              <H2 className="mt-4 text-[2rem] text-[var(--rh-ink)] md:text-[3rem]">
                A mesma profundidade técnica em jornadas diferentes.
              </H2>
              <P className="mt-4 max-w-[58ch] text-[var(--rh-copy-soft)]">
                O site precisa vender clareza de escolha. Por isso a home agora separa os caminhos
                de compra em cursos abertos, treinamentos internos e consultoria.
              </P>
            </div>
            <div className="grid gap-4">
              {serviceCards.map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.title} variant="glass" className="border-[var(--rh-border)] bg-white/90" size="lg">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex gap-4">
                        <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[rgba(23,145,169,0.12)] text-[var(--rh-teal-deep)]">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div>
                          <H3 className="text-[1.3rem] text-[var(--rh-ink)]">{item.title}</H3>
                          <P className="mt-2 text-[var(--rh-copy-soft)]">{item.description}</P>
                        </div>
                      </div>
                      <Button asChild variant="secondary" className="border-[var(--rh-border)] bg-white text-[var(--rh-teal-deep)]">
                        <Link to={item.href}>{item.cta}</Link>
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[var(--rh-teal-deep)] px-6 py-12 text-white md:px-10 md:py-16">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--rh-teal-light)]">
              Como funciona
            </p>
            <H2 className="mt-4 text-[2rem] text-white md:text-[3rem]">
              Três passos para sair da intenção e chegar na execução.
            </H2>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {processSteps.map((step) => (
              <div
                key={step.number}
                className="rounded-[24px] border border-white/10 bg-white/5 p-6 backdrop-blur-[1px]"
              >
                <div className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--rh-teal-light)]">
                  {step.number}
                </div>
                <H3 className="mt-4 text-[1.4rem] text-white">{step.title}</H3>
                <P className="mt-3 text-white/78">{step.description}</P>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 py-12 md:px-10 md:py-16">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--rh-teal)]">
                Credibilidade
              </p>
              <H2 className="mt-4 text-[2rem] text-[var(--rh-ink)] md:text-[3rem]">
                Segurança para quem contrata e para quem precisa aplicar.
              </H2>
              <P className="mt-4 text-[var(--rh-copy-soft)]">
                Mantive uma faixa de prova social, mas sem depender de carrossel. Quando houver depoimentos
                no store, a página os incorpora automaticamente.
              </P>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {(featuredTestimonials.length ? featuredTestimonials : promiseCards).map((item, index) => {
                const isTestimonial = "text" in item;

                return (
                  <Card key={isTestimonial ? item.id : item.title} variant="elevated" className="border-[var(--rh-border)] bg-white" size="lg">
                    <CardContent className="p-0">
                      {isTestimonial ? (
                        <>
                          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--rh-teal)]">
                            {item.organization}
                          </p>
                          <P className="mt-4 italic text-[var(--rh-copy-soft)]">“{item.text}”</P>
                          <div className="mt-5">
                            <p className="font-semibold text-[var(--rh-ink)]">{item.name}</p>
                            <p className="text-sm text-[var(--rh-copy-soft)]">{item.role}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(12,106,131,0.1)] text-[var(--rh-teal-deep)]">
                            {index === 0 ? <ShieldCheck className="h-5 w-5" aria-hidden="true" /> : <Sparkles className="h-5 w-5" aria-hidden="true" />}
                          </div>
                          <H3 className="text-[1.3rem] text-[var(--rh-ink)]">{item.title}</H3>
                          <P className="mt-3 text-[var(--rh-copy-soft)]">{item.description}</P>
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[#f7f8f9] px-6 py-12 md:px-10 md:py-16">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--rh-teal)]">
                Dúvidas frequentes
              </p>
              <H2 className="mt-4 text-[2rem] text-[var(--rh-ink)] md:text-[3rem]">
                O essencial para decidir sem fricção.
              </H2>
            </div>

            <Accordion type="single" collapsible className="grid gap-3">
              {faqItems.map((item) => (
                <AccordionItem
                  key={item.value}
                  value={item.value}
                  className="rounded-[20px] border border-[var(--rh-border)] bg-white px-5"
                >
                  <AccordionTrigger className="text-[var(--rh-ink)]">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-[var(--rh-copy-soft)]">{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section className="bg-[var(--rh-paper)] px-6 py-12 md:px-10 md:py-16">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--rh-teal)]">
                Próximo passo
              </p>
              <H2 className="mt-4 text-[2rem] text-[var(--rh-ink)] md:text-[3rem]">
                Fale com a RH Cursos e direcione a próxima capacitação com mais precisão.
              </H2>
              <P className="mt-4 text-[var(--rh-copy-soft)]">
                Se você já sabe a necessidade, vá para a agenda. Se precisa desenhar a solução com mais cuidado,
                converse com um especialista.
              </P>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-[var(--rh-teal-deep)] hover:bg-[#084f63]">
                <Link to="/agenda">
                  Ver agenda
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="border-[var(--rh-border)] bg-white text-[var(--rh-teal-deep)] hover:bg-[var(--rh-paper-strong)]"
              >
                <Link to="/falar-com-especialista">Fale com um especialista</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
