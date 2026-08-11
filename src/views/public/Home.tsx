"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, BriefcaseBusiness, CheckCircle2, Star } from "lucide-react";

import { FeatureListItem } from "@/components/patterns/feature-list-item";
import { SectionHeading } from "@/components/patterns/section-heading";
import { StatBlock } from "@/components/patterns/stat-block";
import { Testimonial } from "@/components/patterns/testimonial";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { useAppStore } from "@/lib/app-store";
import { company } from "@/lib/company";
import { getPublicCourseName } from "@/lib/seo";
import { Link } from "@/lib/router-compat";
import { cn, parseDate } from "@/lib/utils";

type JourneyCard = {
  badge: string;
  badgeTone?: "accent" | "neutral";
  bordered?: boolean;
  description: string;
  href: string;
  icon: typeof BookOpen;
  iconSolid?: boolean;
  linkLabel: string;
  title: string;
};

type ConsultingStep = {
  description: string;
  solid?: boolean;
  title: string;
};

const journeyCards: JourneyCard[] = [
  {
    badge: "Para profissionais",
    badgeTone: "neutral",
    description:
      "Turmas para profissionais que precisam dominar temas críticos com clareza, segurança e aplicação prática desde o primeiro encontro.",
    href: "/agenda",
    icon: BookOpen,
    linkLabel: "Ver agenda de cursos →",
    title: "Cursos abertos"
  },
  {
    badge: "Para organizações",
    badgeTone: "neutral",
    description:
      "Programas desenhados para a realidade da sua equipe, com foco em contexto, rotina, casos reais e aplicação consistente.",
    href: "/in-company",
    icon: BriefcaseBusiness,
    linkLabel: "Levar para minha equipe →",
    title: "Cursos in-company"
  },
  {
    badge: "Apoio especializado",
    badgeTone: "accent",
    bordered: true,
    description:
      "Apoio técnico para transformar normas, exigências e requisitos regulatórios em decisões mais claras e execução mais segura.",
    href: "/falar-com-especialista",
    icon: Star,
    iconSolid: true,
    linkLabel: "Solicitar proposta →",
    title: "Consultoria"
  }
] as const;

const consultingSteps: ConsultingStep[] = [
  {
    description: "Entendemos o contexto, as exigências aplicáveis e os pontos em que a equipe mais precisa de clareza.",
    title: "Diagnóstico do cenário"
  },
  {
    description: "Estruturamos um caminho com escopo, etapas e ganhos práticos esperados.",
    title: "Plano sob medida"
  },
  {
    description: "Apoiamos a execução junto com a equipe para transformar entendimento em prática segura.",
    solid: true,
    title: "Aplicação acompanhada"
  }
] as const;

const consultingBullets = [
  "Diagnóstico do seu contexto normativo e operacional",
  "Plano de adequação aplicável, com passos priorizados",
  "Acompanhamento por especialistas com experiência de campo"
] as const;

const stats = [
  { label: "formando equipes de organizações públicas e privadas com foco em aplicação prática", value: "+18 anos" },
  { label: "turmas realizadas entre cursos abertos e programas in company", value: "+320" },
  { label: "de recomendação média nas avaliações de turmas concluídas", value: "96%" }
] as const;

const testimonials = [
  {
    company: "CIAMA",
    initials: "CI",
    quote:
      "A RH Cursos transformou conteúdo técnico em entendimento claro e aplicação prática. Saí do curso com mais segurança para revisar procedimentos e atuar no dia a dia."
  },
  {
    company: "TRF1",
    initials: "TR",
    quote:
      "A forma prática como os conteúdos foram apresentados facilitou a compreensão, a visualização dos procedimentos e a resolução de dúvidas reais da rotina profissional."
  },
  {
    company: "CBTU",
    initials: "CB",
    quote:
      "Didática clara, abordagem objetiva e conhecimento aplicável. O curso trouxe mais segurança para entender o tema e colocar o aprendizado em prática."
  }
] as const;

function getClassDateParts(value: string) {
  const date = parseDate(value);

  return {
    day: new Intl.DateTimeFormat("pt-BR", { day: "2-digit" }).format(date),
    month: new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date).replace(".", "").toUpperCase()
  };
}

function formatHeroMode(modality: string, location: string) {
  if (modality === "Ao vivo online" || modality === "Gravado") {
    return "Online ao vivo";
  }

  if (/Bras[ií]lia/i.test(location)) {
    return "Presencial · Brasília";
  }

  if (/S[aã]o Paulo/i.test(location)) {
    return "Presencial · São Paulo";
  }

  return modality;
}

export function HomePage() {
  const { classes, courses } = useAppStore();
  const reduceMotion = useReducedMotion();
  const [motionReady, setMotionReady] = useState(false);
  const sectionContainerClass = "mx-auto w-[min(var(--tk-container),calc(100%-24px))] md:w-[min(var(--tk-container),calc(100%-40px))]";

  useEffect(() => {
    setMotionReady(true);
  }, []);

  const shouldAnimateTestimonials = motionReady && reduceMotion === false;

  const upcomingClasses = [...classes]
    .sort((left, right) => parseDate(left.startDate).getTime() - parseDate(right.startDate).getTime())
    .slice(0, 3)
    .map((trainingClass) => {
      const course = courses.find((item) => item.id === trainingClass.courseId);

      return {
        ...trainingClass,
        courseTitle: course ? getPublicCourseName(course.title) : "Próxima turma",
        modeLabel: formatHeroMode(trainingClass.modality, trainingClass.location)
      };
    });

  return (
    <div className="bg-tk-surface-2 pb-16 md:pb-24">
      <section data-testid="ui-hero-home" className="bg-tk-cream py-10 sm:py-12 lg:py-[72px]">
        <div className={`${sectionContainerClass} grid gap-10 lg:grid-cols-[1.05fr_0.95fr]`}>
          <div>
            <Badge tone="accent" dot className="w-fit">
              Educação corporativa desde 2007
            </Badge>
            <h1 className="mt-5 max-w-[16ch] font-tk-display text-[2.4rem] font-bold leading-[1.06] tracking-[-0.02em] text-tk-ink sm:max-w-[18ch] sm:text-[2.75rem] lg:max-w-[16ch] lg:text-display-hero">
              Cursos e treinamentos para o setor público e privado
            </h1>
            <p className="mt-5 max-w-[56ch] font-tk-serif text-base font-normal leading-[1.55] text-tk-ink-muted sm:text-subheading lg:text-subheading-lg">
              A RH Cursos &amp; Soluções oferece cursos presenciais e online, treinamentos in company e consultoria em eSocial,
              Departamento Pessoal, licitações e contratos, contabilidade pública e gestão — para órgãos públicos e empresas
              de todo o Brasil, desde 2007.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild size="lg">
                <Link to="/agenda">
                  Ver agenda de cursos
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="border border-tk-line bg-tk-surface text-tk-cta-hover hover:bg-tk-surface-2"
              >
                <Link to="/in-company">Solicitar proposta in company</Link>
              </Button>
            </div>

            <div className="mt-7 flex flex-wrap gap-[10px]">
              {["Quase 80 cursos em 6 trilhas", "Presencial, online e in company"].map((item) => (
                <Chip key={item} variant="info" className="cursor-default disabled:opacity-100" disabled>
                  {item}
                </Chip>
              ))}
            </div>
          </div>

          <Card
            variant="base"
            className="self-start border-[color:var(--rh-paper-line)] bg-[linear-gradient(158deg,var(--tk-surface),var(--tk-line))] px-5 py-6 sm:px-8 sm:py-[38px]"
          >
            <div className="flex flex-col items-center gap-[22px]">
              <Image
                src={company.logo.src}
                alt={company.logo.alt}
                width={320}
                height={110}
                priority
                className="h-auto w-full max-w-[320px]"
              />
              <div className="h-px w-full bg-[color:var(--rh-paper-line)]" />
            </div>

            <div className="mt-5">
              <p className="mb-3 font-tk-display text-[15px] font-bold text-tk-ink">Próximas turmas</p>
              <div className="grid gap-[10px]">
                {upcomingClasses.length ? (
                  upcomingClasses.map((trainingClass) => {
                    const { day, month } = getClassDateParts(trainingClass.startDate);

                    return (
                      <Card
                        key={trainingClass.id}
                        variant="glass"
                        className="flex items-center gap-[14px] border-[color:var(--rh-paper-line)] bg-tk-surface/80 px-[13px] py-[11px]"
                      >
                        <div className="w-12 text-center">
                          <div className="font-tk-display text-[20px] font-bold leading-none text-tk-brand">{day}</div>
                          <div className="mt-px text-[10px] uppercase tracking-[0.06em] text-rh-gray">{month}</div>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold leading-[1.3] text-tk-ink">{trainingClass.courseTitle}</p>
                          <p className="mt-0.5 text-caption text-tk-ink-muted">{trainingClass.modeLabel}</p>
                        </div>
                      </Card>
                    );
                  })
                ) : (
                  <Card variant="glass" className="border-[color:var(--rh-paper-line)] bg-tk-surface/80">
                    <p className="text-sm font-semibold text-tk-ink">Nenhuma turma agendada no momento.</p>
                    <p className="mt-1 text-caption text-tk-ink-muted">Consulte a agenda completa para ver novas aberturas.</p>
                    <Button asChild variant="tertiary" className="mt-3 w-fit">
                      <Link to="/agenda">Ver agenda completa →</Link>
                    </Button>
                  </Card>
                )}
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="bg-tk-surface py-16 lg:py-[88px]">
        <div className={`${sectionContainerClass} grid gap-10`}>
          <SectionHeading
            eyebrow="Três caminhos, uma mesma transformação"
            title="Escolha como quer avançar"
            subtitle="Conteúdo aplicável à legislação vigente e à realidade de organizações públicas e privadas."
            className="mb-11 max-w-[640px]"
          />

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {journeyCards.map((card) => {
              const Icon = card.icon;

              return (
                <Card
                  key={card.title}
                  variant="base"
                  className={cn(
                    "flex min-h-[288px] flex-col gap-4",
                    card.bordered ? "border-tk-brand" : "border-tk-line"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl",
                        card.iconSolid ? "bg-tk-brand text-tk-surface" : "bg-tk-accent-soft text-tk-brand"
                      )}
                    >
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <Badge tone={card.badgeTone}>{card.badge}</Badge>
                  </div>

                  <div className="grid gap-3">
                    <CardTitle className="text-subheading-lg tracking-[-0.01em]">{card.title}</CardTitle>
                    <CardDescription className="text-body leading-[1.55]">{card.description}</CardDescription>
                  </div>

                  <Button asChild variant="tertiary" className="mt-auto w-fit font-semibold no-underline hover:no-underline">
                    <Link to={card.href}>{card.linkLabel}</Link>
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-tk-cream-dark bg-tk-cream py-16 lg:py-20">
        <div className={`${sectionContainerClass} grid gap-9 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14`}>
          <div>
            <Badge tone="accent" className="w-fit bg-tk-brand text-tk-surface">
              Consultoria
            </Badge>
            <h2 className="mt-[18px] max-w-[18ch] font-tk-display text-display-large font-bold leading-tight tracking-[var(--tk-tracking-display)] text-tk-ink sm:max-w-[20ch]">
              A norma aplicada ao seu contexto
            </h2>
            <p className="mt-4 max-w-[56ch] font-tk-serif text-subheading font-normal leading-[1.5] text-tk-ink-muted">
              Cada exigência normativa impacta a operação de um jeito. Nossa consultoria transforma complexidade regulatória
              em clareza, direcionamento e prática para a sua equipe atuar com segurança.
            </p>

            <div className="mt-7 grid gap-[12px]">
              {consultingBullets.map((item) => (
                <FeatureListItem
                  key={item}
                  icon={CheckCircle2}
                  title={item}
                  description=""
                  className="gap-3 [&>span:first-child]:h-8 [&>span:first-child]:w-8 [&>span:first-child]:bg-[color-mix(in_srgb,var(--tk-brand)_14%,var(--tk-surface))] [&>span:first-child]:text-tk-brand [&>span:first-child>svg]:h-4 [&>span:first-child>svg]:w-4 [&_strong]:text-[15px] [&_strong]:leading-6 [&_span:last-child]:text-[14px] [&_span:last-child]:leading-[1.45]"
                />
              ))}
            </div>

            <Button asChild size="lg" className="mt-8">
              <Link to="/falar-com-especialista">
                Solicitar proposta
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <Card variant="base" className="h-fit self-center p-4 sm:p-5">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[var(--tk-tracking-eyebrow)] text-tk-ink-muted">
              Como transformamos conhecimento em aplicação
            </p>
            <div className="grid gap-3">
              {consultingSteps.map((step, index) => (
                <div key={step.title} className={cn("grid gap-3", index < consultingSteps.length - 1 ? "border-b border-tk-line pb-3" : "")}>
                  <div className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold",
                        step.solid ? "bg-tk-brand text-tk-surface" : "bg-tk-accent-soft text-tk-brand"
                      )}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-tk-display text-[1.05rem] font-bold leading-tight text-tk-ink">{step.title}</h3>
                      <p className="mt-1 text-[14px] leading-[1.5] text-tk-ink-muted">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="bg-tk-surface py-16 lg:py-20">
        <div className={sectionContainerClass}>
          <h2 className="mb-11 text-center font-tk-display text-section-heading font-bold tracking-[var(--tk-tracking-display)] text-tk-ink md:text-section">
            Conhecimento aplicado
          </h2>
          <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map((stat) => (
              <StatBlock key={stat.value} value={stat.value} label={stat.label} className="text-center" />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-tk-surface pb-16 lg:pb-[88px]">
        <div className={sectionContainerClass}>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {testimonials.map((testimonial, index) => {
              const content = (
                <Testimonial
                  quote={testimonial.quote}
                  name="Participante"
                  role="Avaliação anônima"
                  company={testimonial.company}
                  initials={testimonial.initials}
                />
              );

              if (!shouldAnimateTestimonials) {
                return <div key={testimonial.company}>{content}</div>;
              }

              return (
                <motion.div
                  key={testimonial.company}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.45 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: index * 0.08 }}
                >
                  {content}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-tk-brand py-16 text-center lg:py-20">
        <div className={`${sectionContainerClass} grid max-w-[760px] gap-10`}>
          <div>
            <h2 className="font-tk-display text-display-large font-bold leading-[1.12] tracking-[var(--tk-tracking-display)] text-tk-surface">
              Pronto para capacitar a sua equipe?
            </h2>
            <p className="mt-4 font-tk-serif text-subheading font-normal leading-[1.5] text-tk-surface">
              Converse com um especialista e monte a trilha certa: curso aberto, in-company ou consultoria.
            </p>
            <Button asChild variant="secondary" size="lg" className="mt-8 bg-white text-tk-brand hover:bg-white/90">
              <Link to="/falar-com-especialista">
                Fale com um especialista
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
