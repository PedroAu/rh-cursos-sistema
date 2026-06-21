import Link from "next/link";
import {
  IconArrowUpRight,
  IconBook2,
  IconBuildingBank,
  IconChartBar,
  IconShieldCheck,
  IconTargetArrow,
} from "@tabler/icons-react";

import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const values = [
  "Excelência Técnica",
  "Ética e Transparência",
  "Foco em Resultados",
  "Inovação Contínua",
];

const historyItems = [
  {
    year: "2007",
    title: "Fundação",
    text: "Iniciamos nossas atividades com o propósito de suprir a carência de treinamentos específicos para RH no setor público em Brasília.",
  },
  {
    year: "2012",
    title: "Expansão Nacional",
    text: "Consolidação como referência no Centro-Oeste e início dos primeiros treinamentos In Company em outros estados brasileiros.",
  },
  {
    year: "2018",
    title: "Transformação Digital",
    text: "Lançamento de novas frentes digitais para ampliar o acesso a cursos de alta qualidade para municípios e instituições remotas.",
  },
  {
    year: "HOJE",
    title: "Liderança em Capacitação",
    text: "Com mais de 15 mil alunos e parcerias institucionais, seguimos evoluindo com metodologias práticas e foco em impacto.",
  },
];

const leaders = [
  {
    name: "Ricardo Henrique",
    role: "Direção Executiva",
    initials: "RH",
    text: "Condução estratégica da operação, relacionamento institucional e expansão de programas corporativos.",
  },
  {
    name: "Ana Silveira",
    role: "Direção Acadêmica",
    initials: "AS",
    text: "Curadoria técnica, qualidade pedagógica e coordenação de projetos In Company.",
  },
  {
    name: "Marcus Oliveira",
    role: "Inovação e Tecnologia",
    initials: "MO",
    text: "Evolução digital, melhoria de processos e integração entre experiência pública e backoffice.",
  },
  {
    name: "Carla Mendes",
    role: "Relacionamento Institucional",
    initials: "CM",
    text: "Atendimento consultivo, suporte a órgãos públicos e acompanhamento de demandas estratégicas.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="overflow-hidden bg-[radial-gradient(circle_at_82%_18%,rgba(212,160,23,0.2),transparent_24%),linear-gradient(135deg,#062c41_0%,#083b56_50%,#0d5b85_100%)] text-white">
        <div className="mx-auto w-full max-w-page px-6 py-16 md:py-24 xl:py-32">
          <div className="max-w-content space-y-6">
            <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-brand-gold-200">
              Desde 2007
            </p>
            <h1 className="text-balance font-heading text-4xl font-bold leading-tight text-white md:text-6xl">
              Formando quem transforma o setor público.
            </h1>
            <p className="max-w-content-sm text-lg leading-8 text-white/85">
              Somos parceiros estratégicos na capacitação de gestores e profissionais de Recursos Humanos,
              entregando conhecimento prático e soluções para a administração moderna.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 xl:py-32">
        <div className="mx-auto grid w-full max-w-page gap-4 px-6 md:grid-cols-3 xl:gap-6">
          <Card className="h-full">
            <CardContent className="space-y-5 p-6 xl:p-8">
              <span className="inline-flex size-13 items-center justify-center rounded-lg bg-brand-navy-50 text-brand-navy-700">
                <IconTargetArrow size={26} />
              </span>
              <h2 className="font-heading text-2xl font-bold text-brand-navy-700">Missão</h2>
              <p className="leading-7 text-muted-foreground">
                Capacitar profissionais através de treinamentos de alta performance,
                unindo teoria robusta e prática aplicável para elevar o padrão da gestão pública no Brasil.
              </p>
            </CardContent>
          </Card>

          <Card className="min-h-96 h-full bg-brand-navy-900 text-white">
            <CardContent className="flex h-full flex-col justify-between gap-8 p-6 xl:p-8">
              <div className="space-y-5">
                <span className="inline-flex size-13 items-center justify-center rounded-lg bg-brand-gold text-brand-navy-900">
                  <IconChartBar size={26} />
                </span>
                <h2 className="font-heading text-2xl font-bold text-brand-gold-200">Visão</h2>
                <p className="leading-8 text-white/75">
                  Ser referência nacional em educação corporativa para o setor público,
                  reconhecida pela excelência técnica e pelo impacto transformador em cada aluno e instituição atendida.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-1 flex-1 rounded-full bg-brand-gold" />
                <span className="text-sm font-extrabold uppercase text-brand-gold-200">Progresso</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex h-full flex-col gap-6">
            <Card className="flex-1">
              <CardContent className="space-y-5 p-6 xl:p-8">
                <span className="inline-flex size-13 items-center justify-center rounded-lg bg-brand-navy-50 text-brand-navy-700">
                  <IconShieldCheck size={26} />
                </span>
                <h2 className="font-heading text-2xl font-bold text-brand-navy-700">Valores</h2>
                <ul className="space-y-2">
                  {values.map((value) => (
                    <li className="text-muted-foreground" key={value}>{value}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-brand-gold text-brand-navy-900">
              <CardContent className="p-6 text-center xl:p-8">
                <p className="font-heading text-[clamp(2.5rem,5vw,4rem)] font-extrabold leading-none">15k+</p>
                <p className="mt-2 text-sm font-extrabold uppercase">Alunos Formados</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-linear-to-b from-background to-muted py-16 md:py-24 xl:py-32">
        <div className="mx-auto grid w-full max-w-page items-start gap-8 px-6 xl:grid-cols-[0.45fr_0.55fr] xl:gap-16">
          <div className="space-y-6">
            <SectionHeading
              eyebrow="História"
              title="Nossa Trajetória"
              description="Desde a nossa fundação em 2007, evoluímos junto com as necessidades da administração pública brasileira."
            />
            <Card className="min-h-64 bg-[radial-gradient(circle_at_top_right,rgba(212,160,23,0.22),transparent_26%),linear-gradient(135deg,#ffffff_0%,var(--background)_100%)]">
              <CardContent className="space-y-5 p-6 xl:p-8">
                <span className="inline-flex size-13 items-center justify-center rounded-full bg-brand-navy-50 text-brand-navy-700">
                  <IconBuildingBank size={26} />
                </span>
                <p className="text-lg font-extrabold leading-7 text-brand-navy-700">
                  Educação corporativa com foco público, operação consultiva e continuidade.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-6 md:p-8">
              <ol className="space-y-8 border-l border-border pl-6">
                {historyItems.map((item) => (
                  <li className="relative" key={item.year}>
                    <span className="absolute -left-[1.95rem] top-1 size-3 rounded-full bg-brand-navy-700 ring-4 ring-background" />
                    <div className="flex flex-wrap items-baseline gap-2">
                      <h3 className="font-heading text-lg font-extrabold text-brand-navy-700">{item.title}</h3>
                      <Badge className="bg-brand-gold text-brand-navy-900" variant="gold">{item.year}</Badge>
                    </div>
                    <p className="mt-2 leading-7 text-muted-foreground">{item.text}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16 md:py-24 xl:py-32">
        <div className="mx-auto w-full max-w-page px-6">
          <SectionHeading
            eyebrow="Equipe"
            title="Nossa Liderança"
            description="Especialistas comprometidos com a excelência acadêmica e a transformação institucional."
            align="center"
          />

          <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
            {leaders.map((leader) => (
              <Card className="h-full" key={leader.name}>
                <CardContent className="space-y-5 p-6 xl:p-8">
                  <div className="inline-flex size-avatar-xl items-center justify-center rounded-full bg-brand-navy-50 font-heading text-xl font-extrabold text-brand-navy-700">
                    {leader.initials}
                  </div>
                  <div>
                    <h3 className="font-heading text-2xl font-bold text-foreground">{leader.name}</h3>
                    <p className="mt-1 text-sm font-extrabold text-brand-navy-700">{leader.role}</p>
                  </div>
                  <p className="leading-7 text-muted-foreground">{leader.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(212,160,23,0.28),transparent_28%),linear-gradient(135deg,#062c41_0%,#083b56_58%,#0d5b85_100%)] py-16 text-white md:py-24 xl:py-32">
        <div className="mx-auto flex w-full max-w-content-lg flex-col items-center gap-8 px-6 text-center">
          <span className="inline-flex size-14 items-center justify-center rounded-full bg-brand-gold text-brand-navy-900">
            <IconBook2 size={28} />
          </span>
          <div className="space-y-4">
            <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">
              Pronto para transformar sua gestão?
            </h2>
            <p className="text-lg leading-8 text-white/80">
              Conheça nossos cursos ou solicite uma proposta personalizada para sua instituição.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" variant="gold">
              <Link href="/cursos">Ver Catálogo de Cursos</Link>
            </Button>
            <Button asChild className="rounded-full" size="lg" variant="ctaOutline">
              <Link href="/especialista">
                Falar com Consultor
                <IconArrowUpRight size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
