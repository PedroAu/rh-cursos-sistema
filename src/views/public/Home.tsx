"use client";

import Image from "next/image";
import { ArrowRight, BookOpen, BriefcaseBusiness, CheckCircle2, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/app-store";
import { company } from "@/lib/company";
import { Link } from "@/lib/router-compat";
import { cn } from "@/lib/utils";

type JourneyCard = {
  badge: string;
  badgeTone?: "accent";
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
    description:
      "Turmas com agenda pública, presenciais e online ao vivo, com certificação e conteúdo atualizado.",
    href: "/agenda",
    icon: BookOpen,
    linkLabel: "Ver agenda de cursos →",
    title: "Cursos abertos"
  },
  {
    badge: "Para organizações",
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

const footerColumns = [
  {
    items: ["Cursos abertos", "Agenda", "In-company", "Consultoria"],
    title: "Ofertas"
  },
  {
    items: ["Sobre", "Blog", "Instrutores", "Contato"],
    title: "Empresa"
  },
  {
    items: ["Área do aluno", "Área do instrutor", "Entrar"],
    title: "Acesso"
  }
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
    <div className="bg-[#eef0f2] pb-16 md:pb-24">
      <div className="mx-auto w-[min(1180px,calc(100%-24px))] overflow-hidden rounded-[24px] border border-[#ebebeb] bg-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.25)] md:w-[min(1180px,calc(100%-40px))]">
        <section
          data-testid="ui-hero-home"
          className="grid gap-10 bg-[#f3f0e8] px-6 py-12 md:grid-cols-[1.05fr_0.95fr] md:px-10 md:py-[72px]"
        >
          <div>
            <div className="inline-flex items-center rounded-full bg-[#dff3fb] px-4 py-2 text-sm font-semibold text-[#0c6a83]">
              <span className="mr-2 h-2 w-2 rounded-full bg-[#1791a9]" />
              Educação corporativa · Desde 2007
            </div>
            <h1 className="mt-5 max-w-[10ch] font-display text-[3rem] font-bold leading-[1.06] tracking-[-0.02em] text-[#222525] md:max-w-none md:text-[3.75rem]">
              Conhecimento técnico que sua equipe <span className="italic text-[#0c6a83]">aplica no mesmo dia</span>.
            </h1>
            <p className="mt-5 max-w-[48ch] font-serif text-[1.2rem] font-light leading-[1.45] text-[#4f5057] md:text-[1.5rem]">
              Cursos abertos, treinamentos in company e consultoria para o setor público e privado. São quase 80 cursos em
              6 trilhas de conhecimento, do básico ao avançado, presenciais ou online.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-[#0c6a83] hover:bg-[#084f63]">
                <Link to="/agenda">
                  Ver agenda de cursos
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="border-[#ddd7c7] bg-white text-[#084f63] hover:bg-[#ebe5d8]"
              >
                <Link to="/in-company">Solicitar proposta in company</Link>
              </Button>
            </div>

            <div className="mt-7 flex flex-wrap gap-[10px]">
              {["80 cursos · 6 trilhas", "Presencial e online"].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center rounded-full border border-[#ddd7c7] bg-white px-[15px] py-[8px] text-sm text-[#222525] shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-[#ded8c9] bg-[linear-gradient(158deg,#ffffff,#ebebeb)] px-8 py-[38px] shadow-[0_2px_16px_rgba(0,0,0,0.02),0_16px_64px_rgba(0,0,0,0.12)]">
            <div className="flex flex-col items-center gap-[22px]">
              <Image
                src={company.logo.src}
                alt={company.logo.alt}
                width={320}
                height={110}
                priority
                className="h-auto w-full max-w-[320px]"
              />
              <div className="h-px w-full bg-[#ded8c9]" />
            </div>

            <div className="mt-5">
              <p className="mb-3 font-display text-[15px] font-bold text-[#222525]">Próximas turmas</p>
              <div className="grid gap-[10px]">
                {upcomingClasses.map((trainingClass) => {
                  const { day, month } = getClassDateParts(trainingClass.startDate);

                  return (
                    <div
                      key={trainingClass.id}
                      className="flex items-center gap-[14px] rounded-2xl border border-[#ded8c9] bg-white/70 px-[13px] py-[11px]"
                    >
                      <div className="w-12 text-center">
                        <div className="font-display text-[20px] font-bold leading-none text-[#0c6a83]">{day}</div>
                        <div className="mt-px text-[10px] uppercase tracking-[0.06em] text-[#7f8c94]">{month}</div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-[1.3] text-[#222525]">{trainingClass.courseTitle}</p>
                        <p className="mt-0.5 text-xs text-[#4f5057]">{trainingClass.modeLabel}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-[72px] md:px-10 md:py-[88px]">
          <div className="mb-11 max-w-[640px]">
            <div className="inline-flex items-center rounded-full bg-[#dff3fb] px-4 py-2 text-sm font-semibold text-[#0c6a83]">
              Três caminhos, um só objetivo
            </div>
            <h2 className="mt-[18px] font-display text-[2.75rem] font-bold leading-[1.1] tracking-[-0.02em] text-[#222525]">
              Escolha como quer avançar
            </h2>
            <p className="mt-[14px] font-serif text-[1.25rem] font-light leading-[1.45] text-[#4f5057]">
              Conteúdo aplicável à legislação vigente e à realidade de organizações públicas e privadas.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {journeyCards.map((card) => {
              const Icon = card.icon;

              return (
                <article
                  key={card.title}
                  className={cn(
                    "flex min-h-[288px] flex-col gap-4 rounded-[24px] border bg-white p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02),0_16px_64px_rgba(0,0,0,0.12)]",
                    card.bordered ? "border-[#0c6a83]" : "border-[#ebebeb]"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className={cn(
                        "inline-flex h-12 w-12 items-center justify-center rounded-xl",
                        card.iconSolid ? "bg-[#0c6a83] text-white" : "bg-[#e0eeff] text-[#0c6a83]"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold",
                        card.badgeTone === "accent" ? "bg-[#dff3fb] text-[#0c6a83]" : "bg-[#f3f4f6] text-[#4f5057]"
                      )}
                    >
                      {card.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-[1.5rem] font-bold tracking-[-0.01em] text-[#222525]">{card.title}</h3>
                    <p className="mt-4 text-base leading-[1.55] text-[#4f5057]">{card.description}</p>
                  </div>

                  <Link to={card.href} className="mt-auto text-sm font-semibold text-[#0c6a83] transition hover:text-[#084f63]">
                    {card.linkLabel}
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        <section className="border-y border-[#c3b6aa] bg-[#fffaf4] px-6 py-16 md:px-10 md:py-20">
          <div className="grid gap-10 md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-14">
            <div>
              <div className="inline-flex items-center rounded-full bg-[#0c6a83] px-4 py-2 text-sm font-semibold text-white">
                Consultoria
              </div>
              <h2 className="mt-[18px] max-w-[12ch] font-display text-[2.75rem] font-bold leading-[1.1] tracking-[-0.02em] text-[#222525]">
                A norma aplicada ao <span className="italic">seu</span> contexto
              </h2>
              <p className="mb-7 mt-4 max-w-[28ch] font-serif text-[1.25rem] font-light leading-[1.5] text-[#4f5057]">
                Cada norma pesa de um jeito na sua operação. Nossa consultoria traduz requisitos legais em processos claros,
                que a sua equipe aplica no dia a dia.
              </p>

              <div className="space-y-[14px]">
                {consultingBullets.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-[#222525]">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#0c6a83]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <Button asChild size="lg" className="mt-8 bg-[#0c6a83] hover:bg-[#084f63]">
                <Link to="/falar-com-especialista">Solicitar proposta →</Link>
              </Button>
            </div>

            <div className="rounded-[24px] border border-[#ebebeb] bg-white p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02),0_16px_64px_rgba(0,0,0,0.12)]">
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.08em] text-[#4f5057]">Como funciona</p>
              <div className="space-y-5">
                {consultingSteps.map((step, index) => (
                  <div key={step.title}>
                    <div className="flex gap-4">
                      <div
                        className={cn(
                          "inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                          step.solid ? "bg-[#0c6a83] text-white" : "bg-[#e0eeff] text-[#0c6a83]"
                        )}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#222525]">{step.title}</h3>
                        <p className="mt-1 text-sm leading-[1.55] text-[#4f5057]">{step.description}</p>
                      </div>
                    </div>
                    {index < consultingSteps.length - 1 ? <div className="mt-5 h-px bg-[#ebebeb]" /> : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-16 md:px-10 md:py-20">
          <h2 className="mb-11 text-center font-display text-[2rem] font-bold tracking-[-0.02em] text-[#222525]">
            A RH Cursos em números
          </h2>
          <div className="grid gap-x-6 gap-y-8 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => (
              <div key={item.value} className="text-center">
                <p className="font-display text-[2.6rem] font-bold text-[#0c6a83]">{item.value}</p>
                <p className="mx-auto mt-3 max-w-[24ch] text-sm leading-[1.55] text-[#4f5057]">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 pb-[88px] md:px-10">
          <div className="mx-auto max-w-[840px] rounded-[24px] border border-[#efe6d9] bg-[#fffaf4] px-8 py-10 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
            <p className="font-display text-[2rem] font-bold leading-tight text-[#222525]">
              “A RH Cursos traduziu exigências legais complexas em processos que a nossa equipe realmente consegue executar no
              dia a dia.”
            </p>
            <div className="mt-8 flex items-center gap-4">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#dff3fb] text-sm font-semibold text-[#0c6a83]">
                MA
              </div>
              <div>
                <p className="font-semibold text-[#222525]">Mariana Alves</p>
                <p className="text-sm text-[#4f5057]">Coordenadora de Compras, Prefeitura Municipal</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#0c6a83] px-6 py-16 text-center md:px-10 md:py-20">
          <div className="mx-auto max-w-[760px]">
            <h2 className="font-display text-[2.75rem] font-bold leading-[1.12] tracking-[-0.02em] text-white">
              Pronto para capacitar a sua equipe?
            </h2>
            <p className="mx-auto mb-8 mt-4 max-w-[34ch] font-serif text-[1.25rem] font-light leading-[1.5] text-white/85">
              Converse com um especialista e monte a trilha certa — curso aberto, in-company ou consultoria.
            </p>
            <Link
              to="/falar-com-especialista"
              className="inline-flex items-center rounded-[6px] bg-white px-6 py-4 text-base font-medium text-[#0c6a83] transition hover:bg-[#f3f4f6]"
            >
              Fale com um especialista →
            </Link>
          </div>
        </section>

        <footer className="bg-[#fafafa] px-6 py-14 md:px-10 md:pb-10">
          <div className="grid gap-10 border-b border-[#ebebeb] pb-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-[30%] bg-[#0c6a83] text-xs font-bold text-white">
                  RH
                </span>
                <span className="font-display text-[20px] font-bold tracking-[-0.02em] text-[#0c6a83]">RH Cursos</span>
              </div>
              <p className="mt-4 max-w-[34ch] text-sm leading-[1.55] text-[#4f5057]">
                Cursos, treinamento in-company e consultoria para organizações públicas e privadas.
              </p>
            </div>

            {footerColumns.map((column) => (
              <div key={column.title}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#4f5057]">{column.title}</p>
                <div className="space-y-2.5">
                  {column.items.map((item) => (
                    <p key={item} className="text-sm text-[#222525]">
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="pt-6 text-xs text-[#4f5057]">© 2026 RH Cursos. Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
}
