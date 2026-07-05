"use client";

import Image from "next/image";
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
import { Link } from "@/lib/router-compat";
import { cn } from "@/lib/utils";

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
      "Turmas com agenda pública, presenciais e online ao vivo, com certificação e conteúdo atualizado.",
    href: "/agenda",
    icon: BookOpen,
    linkLabel: "Ver agenda de cursos →",
    title: "Cursos abertos"
  },
  {
    badge: "Para organizações",
    badgeTone: "neutral",
    description:
      "Programas sob medida para a sua equipe, no seu contexto operacional, com o seu calendário e os seus casos reais.",
    href: "/in-company",
    icon: BriefcaseBusiness,
    linkLabel: "Levar para minha equipe →",
    title: "Cursos in-company"
  },
  {
    badge: "Novo",
    badgeTone: "accent",
    bordered: true,
    description:
      "Apoio especializado para aplicar normas e requisitos regulatórios à realidade do seu órgão ou empresa do diagnóstico à execução.",
    href: "/falar-com-especialista",
    icon: Star,
    iconSolid: true,
    linkLabel: "Solicitar proposta →",
    title: "Consultoria"
  }
] as const;

const consultingSteps: ConsultingStep[] = [
  {
    description: "Entendemos o seu cenário, as normas aplicáveis e as prioridades.",
    title: "Conversa de diagnóstico"
  },
  {
    description: "Uma proposta com escopo, etapas e resultados esperados.",
    title: "Plano sob medida"
  },
  {
    description: "Aplicamos junto com a sua equipe, ajustando ao longo do caminho.",
    solid: true,
    title: "Execução acompanhada"
  }
] as const;

const consultingBullets = [
  "Diagnóstico do seu contexto normativo e operacional",
  "Plano de adequação aplicável, com passos priorizados",
  "Acompanhamento por especialistas com experiência de campo"
] as const;

const stats = [
  { label: "formando servidores e profissionais de organizações públicas e privadas", value: "+15 anos" },
  { label: "turmas realizadas entre cursos abertos e programas in-company", value: "+320" },
  { label: "de recomendação média nas avaliações de turmas concluídas", value: "96%" },
  { label: "organizações atendidas em treinamento e consultoria", value: "+80" }
] as const;

function getClassDateParts(value: string) {
  const date = new Date(value);

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

  const upcomingClasses = [...classes]
    .sort((left, right) => new Date(left.startDate).getTime() - new Date(right.startDate).getTime())
    .slice(0, 3)
    .map((trainingClass) => ({
      ...trainingClass,
      courseTitle: courses.find((course) => course.id === trainingClass.courseId)?.title ?? "Curso RH Cursos",
      modeLabel: formatHeroMode(trainingClass.modality, trainingClass.location)
    }));

  return (
    <div className="bg-tk-surface-2 pb-16 md:pb-24">
      <div className="mx-auto w-[min(1180px,calc(100%-24px))] overflow-hidden rounded-tk-card border border-tk-line bg-tk-surface shadow-tk-card md:w-[min(1180px,calc(100%-40px))]">
        <section
          data-testid="ui-hero-home"
          className="grid gap-10 bg-tk-cream px-6 py-12 md:grid-cols-[1.05fr_0.95fr] md:px-10 md:py-[72px]"
        >
          <div>
            <Badge tone="accent" dot className="w-fit">
              Educação corporativa · Desde 2007
            </Badge>
            <h1 className="mt-5 max-w-[10ch] font-tk-display text-[2.75rem] font-bold leading-[1.06] tracking-[var(--tk-tracking-display)] text-tk-ink md:max-w-none md:text-display-hero">
              Conhecimento técnico que sua equipe <span className="italic text-tk-brand">aplica no mesmo dia</span>.
            </h1>
            <p className="mt-5 max-w-[48ch] font-tk-serif text-subheading font-light leading-[1.45] text-tk-ink-muted md:text-subheading-lg">
              Cursos abertos, treinamentos in company e consultoria para o setor público e privado. São quase 80 cursos em
              6 trilhas de conhecimento, do básico ao avançado, presenciais ou online.
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
              {["80 cursos · 6 trilhas", "Presencial e online"].map((item) => (
                <Chip key={item} variant="info" className="cursor-default" disabled>
                  {item}
                </Chip>
              ))}
            </div>
          </div>

          <Card
            variant="base"
            className="border-[color:var(--rh-paper-line)] bg-[linear-gradient(158deg,var(--tk-surface),var(--tk-line))] px-8 py-[38px]"
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
        </section>

        <section className="px-6 py-[72px] md:px-10 md:py-[88px]">
          <SectionHeading
            eyebrow="Três caminhos, um só objetivo"
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
        </section>

        <section className="border-y border-tk-cream-dark bg-tk-cream px-6 py-16 md:px-10 md:py-20">
          <div className="grid gap-9 md:grid-cols-[1.05fr_0.95fr] md:gap-14">
            <div>
              <Badge tone="accent" className="w-fit bg-tk-brand text-tk-surface">
                Consultoria
              </Badge>
              <h2 className="mt-[18px] max-w-[14ch] font-tk-display text-display-large font-bold leading-tight tracking-[var(--tk-tracking-display)] text-tk-ink">
                A norma aplicada ao <span className="italic">seu</span> contexto
              </h2>
              <p className="mt-4 max-w-[50ch] font-tk-serif text-subheading font-light leading-[1.5] text-tk-ink-muted">
                Cada norma pesa de um jeito na sua operação. Nossa consultoria traduz requisitos legais em processos claros,
                que a sua equipe aplica no dia a dia.
              </p>

              <div className="mt-7 grid gap-[14px]">
                {consultingBullets.map((item) => (
                  <FeatureListItem
                    key={item}
                    icon={CheckCircle2}
                    title={item}
                    description=""
                    className="[&>span:first-child]:bg-tk-brand [&>span:first-child]:text-tk-surface [&_strong]:leading-6"
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

            <Card variant="base" className="p-8">
              <p className="mb-5 text-caption font-semibold uppercase tracking-[var(--tk-tracking-eyebrow)] text-tk-ink-muted">
                Como funciona
              </p>
              <div className="grid gap-5">
                {consultingSteps.map((step, index) => (
                  <div key={step.title} className={cn("grid gap-5", index < consultingSteps.length - 1 ? "border-b border-tk-line pb-5" : "")}>
                    <div className="flex gap-4">
                      <span
                        className={cn(
                          "flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                          step.solid ? "bg-tk-brand text-tk-surface" : "bg-tk-accent-soft text-tk-brand"
                        )}
                      >
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="font-tk-display text-[1.25rem] font-bold leading-tight text-tk-ink">{step.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-tk-ink-muted">{step.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        <section className="px-6 py-16 md:px-10 md:py-20">
          <h2 className="mb-11 text-center font-tk-display text-section-heading font-bold tracking-[var(--tk-tracking-display)] text-tk-ink md:text-section">
            A RH Cursos em números
          </h2>
          <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <StatBlock key={stat.value} value={stat.value} label={stat.label} className="text-center" />
            ))}
          </div>
        </section>

        <section className="px-6 pb-[88px] md:px-10">
          <div className="max-w-[840px]">
            <Testimonial
              quote="A RH Cursos traduziu exigências legais complexas em processos que a nossa equipe realmente consegue executar no dia a dia."
              name="Mariana Alves"
              role="Coordenadora de Compras"
              company="Prefeitura Municipal"
              initials="MA"
            />
          </div>
        </section>

        <section className="bg-tk-brand px-6 py-16 text-center md:px-10 md:py-20">
          <div className="mx-auto max-w-[760px]">
            <h2 className="font-tk-display text-display-large font-bold leading-[1.12] tracking-[var(--tk-tracking-display)] text-tk-surface">
              Pronto para capacitar a sua equipe?
            </h2>
            <p className="mt-4 font-tk-serif text-subheading font-light leading-[1.5] text-tk-surface">
              Converse com um especialista e monte a trilha certa: curso aberto, in-company ou consultoria.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 bg-tk-surface text-tk-brand shadow-tk-glass hover:bg-tk-cream"
            >
              <Link to="/falar-com-especialista">
                Fale com um especialista
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
