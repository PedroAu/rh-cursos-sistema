import Link from "next/link";
import {
  IconArrowRight,
  IconCalendarEvent,
  IconCheck,
  IconChevronRight,
  IconClockHour4,
  IconFileCertificate,
  IconShieldCheck,
  IconUsersGroup,
  IconVideo,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { notFound } from "next/navigation";
import { FaqSection } from "@/components/shared/faq-section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getAgendaItems, getPublicCourseBySlug, getPublicCourses } from "@/lib/public-data";

type CourseDetailPageProps = {
  params: Promise<{ slug: string }>;
};

const includedItems = [
  "Material didático em PDF",
  "Certificado de conclusão",
  "Acesso ao grupo de WhatsApp da turma",
  "Apoio administrativo para inscrição",
];

const contextualFaqs = [
  {
    question: "O certificado informa carga horária?",
    answer:
      "Sim. O certificado informa o curso realizado, carga horária e dados necessários para comprovação de participação.",
  },
  {
    question: "Órgãos públicos podem contratar por nota de empenho?",
    answer:
      "Sim. A equipe comercial orienta o processo de inscrição e contratação conforme a necessidade administrativa do órgão.",
  },
  {
    question: "O material didático está incluso?",
    answer:
      "Sim. O aluno recebe material de apoio em PDF e orientações operacionais relacionadas à turma.",
  },
  {
    question: "A turma possui grupo de WhatsApp?",
    answer:
      "Sim. Quando aplicável, a turma recebe acesso ao grupo de WhatsApp para comunicados e apoio administrativo.",
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0]?.toUpperCase())
    .join("");
}

function splitIntoModules(items: string[]) {
  const safeItems = items.length > 0 ? items : ["Conteúdo em atualização"];
  const chunkSize = Math.max(1, Math.ceil(safeItems.length / 3));

  return Array.from({ length: Math.ceil(safeItems.length / chunkSize) }, (_, index) =>
    safeItems.slice(index * chunkSize, index * chunkSize + chunkSize),
  );
}

function getModuleTitle(index: number) {
  return ["Fundamentos práticos", "Aplicação operacional", "Riscos e conformidade"][index] ?? `Módulo ${String(index + 1).padStart(2, "0")}`;
}

function formatClassDate(value: string) {
  return dayjs(value).locale("pt-br").format("DD [de] MMMM [de] YYYY");
}

export async function generateStaticParams() {
  const courses = await getPublicCourses();
  return courses.map((course) => ({ slug: course.slug }));
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { slug } = await params;
  const [course, allCourses, agendaItems] = await Promise.all([
    getPublicCourseBySlug(slug),
    getPublicCourses(),
    getAgendaItems(),
  ]);

  if (!course) {
    notFound();
  }

  const relatedCourses = allCourses
    .filter((item) => item.slug !== course.slug)
    .slice(0, 3);
  const modules = splitIntoModules(course.outcomes);
  const nextClass = agendaItems
    .filter((item) => item.courseSlug === course.slug && item.startDate >= new Date().toISOString().slice(0, 10))
    .sort((first, second) => first.startDate.localeCompare(second.startDate))[0];
  const isPriceConsultative = course.price.toLowerCase().includes("sob consulta");
  const primaryCtaHref = isPriceConsultative ? "/especialista" : `/inscricao/${course.slug}`;
  const primaryCtaLabel = isPriceConsultative ? "Falar com especialista" : "Inscreva-se agora";
  const commercialNote = isPriceConsultative
    ? "Condição definida após alinhamento da turma."
    : "Inscrição sujeita à disponibilidade da turma.";

  return (
    <>
      <section className="border-b border-border bg-[radial-gradient(circle_at_2px_2px,rgba(13,91,133,0.06)_1px,transparent_0),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted))_100%)] bg-[length:24px_24px,auto] py-16 md:py-24 xl:py-32">
        <div className="mx-auto grid w-full max-w-wide gap-8 px-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:gap-12">
          <div className="flex max-w-content-lg flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="gold">{course.category}</Badge>
              <p className="text-sm font-bold text-muted-foreground">Atualização prática</p>
            </div>

            <h1 className="max-w-content-lg text-balance font-heading text-4xl font-black leading-tight text-brand-navy-700 md:text-6xl">
              {course.title}
            </h1>
            <p className="max-w-content text-lg leading-8 text-muted-foreground">{course.summary}</p>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <IconClockHour4 aria-hidden size={18} />
                </span>
                <strong>{course.duration}</strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <IconVideo aria-hidden size={18} />
                </span>
                <strong>{course.format}</strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <IconFileCertificate aria-hidden size={18} />
                </span>
                <strong>Certificado incluso</strong>
              </div>
            </div>

            <Card className="max-w-content bg-background">
              <CardContent className="flex gap-4 p-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-gold text-brand-navy-900">
                  <IconCalendarEvent aria-hidden size={20} />
                </span>
                <div>
                  <p className="font-extrabold text-brand-navy-800">
                    {nextClass ? `Próxima turma: ${formatClassDate(nextClass.startDate)}` : "Próxima turma sob consulta"}
                  </p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {nextClass
                      ? `${nextClass.format} · ${nextClass.schedule} · ${nextClass.location}`
                      : "Fale com a equipe para confirmar disponibilidade, formato e agenda."}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="gold" size="lg">
                <Link href={primaryCtaHref}>{primaryCtaLabel}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/in-company">Solicitar orçamento in-company</Link>
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="space-y-5 p-6">
              <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-muted-foreground">
                Resumo do curso
              </p>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Investimento</span>
                <strong className="text-right text-brand-navy-700">{course.price}</strong>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Formato</span>
                <strong className="text-right">{course.format}</strong>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Duração</span>
                <strong>{course.duration}</strong>
              </div>
              <Separator />
              <p className="text-sm leading-7 text-muted-foreground">{commercialNote}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-wide gap-8 px-6 py-16 lg:grid-cols-[minmax(0,1fr)_360px] xl:gap-12 md:py-24 xl:py-32">
        <div className="space-y-10">
          <section id="sobre" className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="h-1 w-8 rounded-full bg-brand-gold" />
              <h2 className="font-heading text-3xl font-black text-brand-navy-700">Sobre o curso</h2>
            </div>
            <p className="text-lg leading-8 text-muted-foreground">{course.description}</p>
            <p className="leading-8 text-muted-foreground">
              A estrutura foi pensada para profissionais que precisam transformar conteúdo técnico
              em decisão, rotina e conformidade logo após a capacitação.
            </p>
          </section>

          <Card id="resultado" className="bg-brand-navy-700 text-white">
            <CardContent className="space-y-6 p-6 md:p-8">
              <div className="flex items-center gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-gold text-brand-navy-900">
                  <IconCheck aria-hidden size={22} />
                </span>
                <h2 className="font-heading text-3xl font-black text-white">Ao final, você será capaz de</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {course.outcomes.slice(0, 4).map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-gold text-brand-navy-900">
                      <IconCheck aria-hidden size={15} />
                    </span>
                    <p className="leading-7 text-white/85">{item}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card id="publico" className="bg-muted/70">
            <CardContent className="space-y-6 p-6 md:p-8">
              <h2 className="font-heading text-3xl font-black text-brand-navy-700">Quem deve fazer</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {course.audience.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <IconCheck aria-hidden size={16} />
                    </span>
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <section id="curriculo" className="space-y-6">
            <h2 className="font-heading text-3xl font-black text-brand-navy-700">O que você vai aprender</h2>
            <Accordion type="multiple" defaultValue={modules.map((_, index) => `module-${index}`)} className="space-y-4">
              {modules.map((moduleItems, index) => (
                <AccordionItem key={moduleItems.join("-")} value={`module-${index}`} className="rounded-md border bg-card px-5">
                  <AccordionTrigger className="py-5">
                    <span className="flex items-center gap-3">
                      <span className="flex size-8 items-center justify-center rounded-full bg-primary font-heading text-xs font-black text-primary-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {getModuleTitle(index)}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <ul className="space-y-3">
                      {moduleItems.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <IconChevronRight aria-hidden className="mt-1 shrink-0 text-primary" size={16} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <Card id="instrutor">
            <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:p-8">
              <div className="flex size-26 shrink-0 items-center justify-center rounded-2xl bg-primary font-heading text-2xl font-black text-primary-foreground">
                {getInitials(course.instructor.name)}
              </div>
              <div className="space-y-4">
                <div>
                  <h2 className="font-heading text-3xl font-black text-brand-navy-700">{course.instructor.name}</h2>
                  <p className="font-bold text-muted-foreground">{course.instructor.role}</p>
                  <Badge className="mt-2" variant="secondary">Especialista RH Cursos</Badge>
                </div>
                <p className="leading-8 text-muted-foreground">
                  Instrutor selecionado pela RH Cursos para conduzir uma formação prática,
                  orientada à aplicação em organizações públicas e privadas.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <IconCheck aria-hidden className="mt-1 text-primary" size={15} />
                    <span>Condução orientada a casos práticos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <IconCheck aria-hidden className="mt-1 text-primary" size={15} />
                    <span>Foco em rotina, decisão e conformidade</span>
                  </li>
                </ul>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="secondary">
                    <Link href="/sobre">Conhecer a RH Cursos</Link>
                  </Button>
                  <Button asChild variant="ghost">
                    <Link href="/contato">Tirar dúvidas</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card id="certificado">
              <CardContent className="space-y-4 p-6">
                <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <IconFileCertificate aria-hidden size={22} />
                </span>
                <h2 className="font-heading text-2xl font-black text-brand-navy-700">Certificado incluso</h2>
                <p className="leading-7 text-muted-foreground">
                  Certificado com carga horária de {course.duration}, identificação do curso
                  e conteúdo programático para comprovação de participação.
                </p>
              </CardContent>
            </Card>

            <Card id="garantia-operacional">
              <CardContent className="space-y-4 p-6">
                <span className="flex size-12 items-center justify-center rounded-full bg-brand-gold text-brand-navy-900">
                  <IconShieldCheck aria-hidden size={22} />
                </span>
                <h2 className="font-heading text-2xl font-black text-brand-navy-700">Garantia operacional</h2>
                <p className="leading-7 text-muted-foreground">
                  Apoio administrativo para inscrição, orientação sobre turma, material didático
                  e acesso ao grupo de WhatsApp quando disponível.
                </p>
              </CardContent>
            </Card>
          </div>

          <section id="duvidas">
            <FaqSection
              eyebrow="FAQ DO CURSO"
              title="Dúvidas frequentes sobre este curso"
              description="Respostas objetivas sobre certificado, empenho, material e comunicação da turma."
              items={contextualFaqs}
            />
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-6">
            <Card className="relative overflow-hidden">
              <span className="absolute inset-x-0 top-0 h-1 bg-brand-gold" />
              <CardContent className="space-y-6 p-6">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-muted-foreground">Investimento</p>
                  <p className="font-heading text-3xl font-black text-brand-navy-700">{course.price}</p>
                  <p className="text-sm font-bold text-emerald-700">{commercialNote}</p>
                </div>

                <Button asChild variant="gold" size="lg" className="w-full">
                  <Link href={primaryCtaHref}>{primaryCtaLabel}</Link>
                </Button>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Próxima turma</span>
                    <strong className="text-right">{nextClass ? formatClassDate(nextClass.startDate) : "Sob consulta"}</strong>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Certificado</span>
                    <strong>Incluso</strong>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <p className="font-extrabold">O que está incluído:</p>
                  <ul className="space-y-3">
                    {includedItems.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <IconCheck aria-hidden className="mt-1 text-primary" size={16} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-brand-navy-700 text-white">
              <CardContent className="space-y-4 p-6">
                <span className="flex size-12 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
                  <IconUsersGroup aria-hidden size={22} />
                </span>
                <h2 className="font-heading text-2xl font-black text-white">Turmas fechadas</h2>
                <p className="leading-7 text-white/75">
                  Leve este treinamento para sua organização com agenda e abordagem sob medida.
                </p>
                <Button asChild className="px-0 hover:bg-transparent" variant="goldLink">
                  <Link href="/in-company">
                    Saber mais
                    <IconArrowRight aria-hidden size={16} />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </aside>
      </section>

      {relatedCourses.length > 0 ? (
        <section className="bg-muted/70 py-12 md:py-16 xl:py-24">
          <div className="mx-auto w-full max-w-wide space-y-8 px-6">
            <h2 className="font-heading text-3xl font-black text-brand-navy-700">Outros cursos recomendados</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {relatedCourses.map((item) => (
                <Card key={item.slug}>
                  <CardContent className="flex h-full flex-col gap-4 p-6">
                    <Badge variant="secondary" className="w-fit">{item.category}</Badge>
                    <h3 className="text-balance font-heading text-xl font-black">{item.title}</h3>
                    <p className="line-clamp-3 flex-1 leading-7 text-muted-foreground">{item.summary}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{item.duration}</Badge>
                      <Badge variant="gold">{item.format}</Badge>
                    </div>
                    <Button asChild variant="secondary">
                      <Link href={`/cursos/${item.slug}`}>
                        Ver detalhes
                        <IconArrowRight aria-hidden size={16} />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
