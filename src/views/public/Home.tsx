import {
  AlertTriangle,
  BookOpenCheck,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  FileWarning,
  HeartHandshake,
  Layers3,
  MessageCircle,
  Quote,
  RefreshCw,
  Star,
  TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";
import { useRef } from "react";
import { Link } from "@/lib/router-compat";

import { CTASection } from "@/components/common/cta-section";
import { FAQAccordion } from "@/components/common/faq-accordion";
import { SectionTitle } from "@/components/common/section-title";
import { TestimonialCard } from "@/components/common/testimonial-card";
import { TrainingPathCard } from "@/components/courses/training-path-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/lib/app-store";

const heroMetrics = [
  { icon: CalendarCheck, label: "de entrega", value: "19 anos" },
  { icon: Layers3, label: "ativas", value: "6 trilhas" },
  { icon: Star, label: "avaliação de satisfação", value: "4,8/5", featured: true }
];

const painPoints = [
  {
    icon: FileWarning,
    title: "Risco de auditoria",
    description: "Erros técnicos detectados em fiscalizações geram multas, retrabalho e exposição para toda a equipe.",
    accent: "border-l-red-500",
    iconClass: "text-red-700"
  },
  {
    icon: BookOpenCheck,
    title: "Cursos teóricos demais",
    description: "Muito conteúdo promete capacitação, mas pouco prepara você para aplicar no dia seguinte.",
    accent: "border-l-prestige-gold",
    iconClass: "bg-accent/12 text-accent"
  },
  {
    icon: RefreshCw,
    title: "Legislação em mudança",
    description: "eSocial, NR-1, licitações e outras normas não esperam. Quem não se atualiza fica para trás.",
    accent: "border-l-deep-navy",
    iconClass: "bg-primary/10 text-primary"
  }
];

const valuePillars = [
  {
    icon: CheckCircle2,
    title: "100% prático",
    description: "Casos reais, legislação atual e exercícios aplicáveis para o participante usar no dia seguinte.",
    proof: "Aplicação imediata",
    accent: "border-t-prestige-gold",
    iconClass: "bg-accent/12 text-accent"
  },
  {
    icon: TrendingUp,
    title: "Resultado acompanhado",
    description: "Avaliação de implementação e indicadores para medir evolução, aplicação e impacto.",
    proof: "Evolução mensurável",
    accent: "border-t-deep-navy",
    iconClass: "bg-primary/10 text-primary"
  },
  {
    icon: HeartHandshake,
    title: "Propósito",
    description: "Capacitação feita para desenvolver pessoas, fortalecer equipes e melhorar o serviço prestado.",
    proof: "Transformação real",
    accent: "border-t-success-green",
    iconClass: "bg-success/10 text-success"
  }
];

const journeySteps = [
  {
    title: "Escolha sua trilha",
    description: "Identifique o desafio técnico do cargo ou da equipe e encontre a trilha ideal."
  },
  {
    title: "Aprenda na prática",
    description: "Estude com casos reais, legislação atual e exemplos do cotidiano público."
  },
  {
    title: "Aplique e veja resultado",
    description: "Saia pronto para aplicar o conteúdo e acompanhar a evolução com mais clareza."
  }
];

export function HomePage() {
  const { trainingPaths, testimonials } = useAppStore();
  const testimonialsTrackRef = useRef<HTMLDivElement>(null);
  const scrollTestimonials = (direction: "previous" | "next") => {
    testimonialsTrackRef.current?.scrollBy({
      left: direction === "next" ? 380 : -380,
      behavior: "smooth"
    });
  };

  return (
    <>
      <section className="executive-hero min-h-[calc(100svh-160px)] overflow-hidden py-14 text-white md:py-20">
        <div className="ea-container flex min-h-[560px] items-center">
          <div className="max-w-3xl space-y-8">
            <div className="space-y-6">
              <span className="inline-flex rounded-full border border-prestige-gold bg-prestige-gold px-4 py-1.5 text-[12px] font-bold uppercase tracking-[0.05em] text-white">
                Treinamento de alta performance, desde 2007.
              </span>
              <h1 className="max-w-3xl text-[44px] leading-[1.08] text-white sm:text-[56px]">
                Formando quem transforma, <span className="text-prestige-gold">há 19 anos</span>.
              </h1>
              <p className="max-w-xl text-[18px] leading-[1.6] text-white/82">
                <strong className="text-white">A RH Cursos</strong> entrega capacitação 100% prática para quem precisa fazer, não apenas saber.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild variant="secondary" size="lg">
                <Link to="/cursos">Ver as trilhas</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
                <a href="#atendimento">
                  <MessageCircle className="h-4 w-4" />
                  Falar com especialista
                </a>
              </Button>
            </div>

            <div className="grid items-stretch gap-4 border-t border-white/10 pt-8 sm:grid-cols-3">
              {heroMetrics.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="apple-material-dark flex min-h-[148px] flex-col justify-between rounded-lg border border-white/20 bg-white/5 backdrop-blur p-4 shadow-soft"
                  >
                    {item.featured ? (
                      <div className="flex gap-1 text-prestige-gold">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            className={`h-5 w-5 ${index < 4 ? "fill-current" : ""}`}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-prestige-gold/15 text-prestige-gold">
                        <Icon className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <p className="text-xl font-bold text-white">{item.value}</p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-[0.05em] text-white/70">{item.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="page-section bg-primary text-white">
        <div className="container space-y-10">
          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded border border-white/12 bg-white/10 px-3 py-1.5 text-[12px] font-bold uppercase tracking-[0.05em] text-white">
              <AlertTriangle className="h-3.5 w-3.5" />
              O problema real
            </span>
            <h2 className="mt-5 max-w-3xl font-display text-[38px] font-bold leading-[1.2] text-white md:text-[44px]">
              A burocracia muda. Quem não se atualiza, erra.
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/76 md:text-lg">
              DP, eSocial, Lei 14.133 e IA aplicada ao serviço público avançam rápido. Enquanto o volume técnico aumenta, o tempo para aprender diminui. E cada erro pode virar multa, retrabalho ou risco para a equipe.
            </p>
          </div>

          <div className="grid items-stretch gap-5 md:grid-cols-3">
            {painPoints.map((item) => {
              const Icon = item.icon;

              return (
                <Card key={item.title} className={`h-full border-l-4 ${item.accent} bg-white shadow-card`}>
                  <CardContent className="flex h-full flex-col gap-5 p-7">
                    <div className={`flex h-[72px] w-[72px] items-center justify-center rounded-lg ${item.iconClass}`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-[25px] font-bold leading-[1.2] text-deep-navy">{item.title}</h3>
                      <p className="text-sm leading-7 text-muted-foreground">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="page-section bg-white">
        <div className="container space-y-10">
          <div className="max-w-4xl">
            <SectionTitle
              eyebrow="Por que funciona"
              title="Três razões que mudam o resultado"
              description="A RH Cursos combina prática, acompanhamento e propósito para transformar conhecimento em execução real."
            />
          </div>

          <div className="grid items-stretch gap-5 md:grid-cols-3">
            {valuePillars.map((item) => {
              const Icon = item.icon;

              return (
                <Card key={item.title} className={`h-full border-t-4 ${item.accent} bg-white shadow-card`}>
                  <CardContent className="flex h-full flex-col gap-6 p-7">
                    <div className={`flex h-[72px] w-[72px] items-center justify-center rounded-lg ${item.iconClass}`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-[25px] font-bold leading-[1.2] text-deep-navy">{item.title}</h3>
                      <p className="text-sm leading-7 text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="mt-auto inline-flex w-fit rounded bg-accent px-3 py-2 text-xs font-bold uppercase tracking-[0.05em] text-white">
                      {item.proof}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="page-section bg-surface-muted">
        <div className="container space-y-12">
          <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr] xl:items-stretch">
            <div className="section-panel flex h-full flex-col justify-center">
              <span className="eyebrow w-fit">Quem está com você</span>
              <h2 className="mt-5 max-w-3xl font-display text-[38px] font-bold leading-[1.2] text-deep-navy md:text-[44px]">
                Entendemos a pressão de não poder errar.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-text-muted md:text-lg">
                Em 2007, a RH Cursos nasceu para apoiar profissionais que precisam aprender direito e transformar o serviço que prestam. Há 19 anos, unimos técnica, propósito e resultado real em capacitações práticas para profissionais, equipes e órgãos públicos.
              </p>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-outline-variant pt-6 text-sm font-bold uppercase tracking-[0.05em] text-deep-navy">
                <span>Desde 2007</span>
                <span>19 anos de atuação</span>
                <span>Capacitação prática</span>
              </div>
            </div>

            <div className="tone-panel flex h-full flex-col justify-between p-8 md:p-10">
              <Quote className="h-12 w-12 text-accent" />
              <blockquote className="mt-8 font-display text-[30px] font-bold leading-[1.25] text-deep-navy md:text-[36px]">
                “Você sai da nossa capacitação pronto para fazer, não apenas para saber.”
              </blockquote>
              <div className="mt-10 flex items-center gap-4 border-t border-primary/10 pt-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-accent text-white font-display text-lg font-bold">
                  ER
                </div>
                <div>
                  <p className="font-display text-xl font-bold text-deep-navy">Ester</p>
                  <p className="text-sm text-muted-foreground">Fundadora da RH Cursos & Soluções</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <SectionTitle
                eyebrow="Depoimentos"
                title="Resultados percebidos por quem já participou."
              />
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Ver depoimentos anteriores"
                  onClick={() => scrollTestimonials("previous")}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Ver próximos depoimentos"
                  onClick={() => scrollTestimonials("next")}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div
              ref={testimonialsTrackRef}
              className="-mx-2 flex snap-x gap-5 overflow-x-auto px-2 pb-4"
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="min-w-[310px] max-w-[310px] snap-start md:min-w-[360px] md:max-w-[360px]">
                  <TestimonialCard testimonial={testimonial} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-section bg-surface-muted">
        <div className="container space-y-10">
          <div className="mx-auto max-w-4xl text-center">
            <SectionTitle
              eyebrow="Nosso currículo"
              title="Escolha sua trilha de capacitação"
              description="+80 cursos em 6 trilhas, prontas para você começar sua transformação."
              align="center"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {trainingPaths.map((path) => (
              <TrainingPathCard key={path.id} path={path} />
            ))}
          </div>

          <div className="mx-auto max-w-xl text-center">
            <p className="mb-5 text-sm leading-7 text-text-muted">
              Compare trilhas, modalidades e próximas turmas em um só lugar.
            </p>
            <Button asChild variant="secondary" size="lg">
              <Link to="/cursos">Ver todos os cursos</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container space-y-8">
          <SectionTitle
            eyebrow="Como funciona"
            title="Três passos para transformar resultado"
            description="Um caminho simples para escolher a trilha certa, aprender com casos reais e aplicar com segurança."
            align="center"
          />
          <div className="relative grid gap-5 md:grid-cols-3">
            {journeySteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-primary/10 bg-white shadow-soft hover:-translate-y-1 hover:shadow-card">
                  <CardContent className="flex h-full flex-col items-center gap-5 p-7 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white font-display text-xl font-bold shadow-soft">
                      {index + 1}
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-[24px] font-bold leading-[1.2] text-deep-navy">{step.title}</h3>
                      <p className="text-sm leading-7 text-muted-foreground">{step.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section bg-surface-muted">
        <div className="container space-y-8">
          <FAQAccordion />
          <CTASection />
        </div>
      </section>
    </>
  );
}
