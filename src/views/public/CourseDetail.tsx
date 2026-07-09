import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, MessageCircle, Play, ShieldCheck, Star, Users } from "lucide-react";
import Image from "next/image";
import { Link, useParams, useSearchParams } from "@/lib/router-compat";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/empty-state";
import { FAQAccordion } from "@/components/common/faq-accordion";
import { SectionTitle } from "@/components/common/section-title";
import { TestimonialCard } from "@/components/common/testimonial-card";
import { ClassCard } from "@/components/agenda/class-card";
import { CheckoutModal } from "@/components/checkout/checkout-modal";
import { trackEvent } from "@/lib/analytics";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/lib/app-store";
import { currency } from "@/lib/utils";

export function CourseDetailPage() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const { courses, classes, instructors, testimonials } = useAppStore();
  const [openCheckout, setOpenCheckout] = useState(false);
  const slugParam = Array.isArray(slug) ? slug[0] : slug;
  const querySlug = params.get("slug") ?? "";

  const course = courses.find((item) => item.slug === (slugParam || querySlug));
  const courseClasses = useMemo(
    () =>
      classes
        .filter((item) => item.courseId === course?.id)
        .sort((left, right) => new Date(left.startDate).getTime() - new Date(right.startDate).getTime()),
    [classes, course?.id]
  );
  const relatedTestimonials = testimonials.filter((item) => item.course === course?.title).slice(0, 3);
  const instructor = instructors.find((item) => item.id === course?.instructorId);
  const nextClass = courseClasses[0];
  const openClassesCount = courseClasses.filter((item) => item.status !== "Encerrada").length;

  const startCheckout = useCallback(
    (origin: "hero_cta" | "sidebar_cta" | "deeplink") => {
      trackEvent("inscricao_cta", { course: course?.slug ?? "", origin });
      trackEvent("checkout_iniciado", { course: course?.slug ?? "", origin });
      setOpenCheckout(true);
    },
    [course?.slug]
  );

  const handleProgramPdfRequest = useCallback(() => {
    trackEvent("lead_enviado", {
      course: course?.slug ?? "",
      fallback: "specialist-contact"
    });
    toast.message("Programa completo disponível sob solicitação pelo atendimento especializado.");
    window.location.assign("/falar-com-especialista");
  }, [course?.slug]);

  const clearCheckoutParam = useCallback(() => {
    if (params.get("checkout") !== "1") return;

    const nextParams = new URLSearchParams(params.toString());
    nextParams.delete("checkout");
    setParams(nextParams);
  }, [params, setParams]);

  const handleCheckoutOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpenCheckout(nextOpen);

      if (!nextOpen) {
        clearCheckoutParam();
      }
    },
    [clearCheckoutParam]
  );

  useEffect(() => {
    if (params.get("checkout") === "1" && !openCheckout) {
      startCheckout("deeplink");
      clearCheckoutParam();
    }
  }, [clearCheckoutParam, openCheckout, params, startCheckout]);

  if (!course) {
    return (
      <section className="page-section">
        <div className="container">
          <EmptyState title="Curso não encontrado." description="Verifique o link ou volte para o catálogo completo." actionLabel="Voltar ao catálogo" onAction={() => window.history.back()} />
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-20">
        <div className="ea-container space-y-10">
          <div className="text-sm text-tk-ink-muted">
            <Link to="/">Home</Link> / <Link to="/cursos">Cursos</Link> / {course.title}
          </div>

          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge>{course.pathName}</Badge>
                  <Badge variant="muted">{course.modality}</Badge>
                  <Badge variant="success">{course.durationLabel}</Badge>
                </div>
                <h1 className="font-tk-display text-display-large font-bold leading-tight tracking-[var(--tk-tracking-display)] text-tk-brand md:text-display-hero">
                  {course.title}
                </h1>
                <p className="max-w-3xl font-tk-serif text-subheading leading-relaxed text-tk-ink-muted">
                  {course.fullDescription}
                </p>
                <div className="flex flex-wrap gap-5 text-sm text-tk-ink-muted">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-accent" />
                    {course.rating.toFixed(1)} de avaliação
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {course.studentsCount} alunos
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <Button size="lg" onClick={() => startCheckout("hero_cta")}>
                  Inscrever-se agora
                </Button>
                <Button variant="outline" size="lg" onClick={handleProgramPdfRequest}>
                  <Download className="h-4 w-4" />
                  Programa PDF
                </Button>
              </div>

              <div className="flex flex-wrap gap-8 border-t border-outline-variant pt-6">
                <div>
                  <span className="ea-label text-tk-ink-muted">Investimento</span>
                  <p className="mt-1 font-bold text-tk-brand">{currency(course.price)}</p>
                </div>
                <div>
                  <span className="ea-label text-tk-ink-muted">Carga</span>
                  <p className="mt-1 font-bold text-tk-brand">{course.durationLabel}</p>
                </div>
                <div>
                  <span className="ea-label text-tk-ink-muted">Modalidade</span>
                  <p className="mt-1 font-bold text-tk-brand">{course.modality}</p>
                </div>
                <div>
                  <span className="ea-label text-tk-ink-muted">Certificação</span>
                  <p className="mt-1 font-bold text-tk-brand">Profissional</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {[
                  {
                    label: "Próxima janela",
                    value: nextClass
                      ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(nextClass.startDate))
                      : "Em breve",
                    helper: nextClass ? `${nextClass.modality} • ${nextClass.location}` : "Atendimento consultivo disponível."
                  },
                  {
                    label: "Turmas abertas",
                    value: openClassesCount,
                    helper: openClassesCount
                      ? "Escolha a agenda com melhor aderência ao seu calendário."
                      : "Novas aberturas são compartilhadas sob consulta."
                  },
                  {
                    label: "Benefícios-chave",
                    value: course.benefits.slice(0, 2).length,
                    helper: "Resumo direto do que está incluído antes da matrícula."
                  }
                ].map((item) => (
                  <div key={item.label} className="surface-card p-5">
                    <p className="text-label font-bold uppercase tracking-[0.08em] text-label-secondary">{item.label}</p>
                    <p className="mt-2 font-tk-display text-3xl font-bold tracking-[var(--tk-tracking-display)] text-tk-ink">
                      {item.value}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-tk-ink-muted">{item.helper}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="group relative aspect-video overflow-hidden rounded-lg border border-outline-variant bg-surface-container shadow-card">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-tk-brand/35">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-tk-brand shadow-card">
                    <Play className="h-9 w-9 fill-current" />
                  </div>
                </div>
              </div>
          </div>

          <section className="bg-surface-muted py-10">
            <div className="ea-container">
              <SectionTitle eyebrow="Objetivos centrais" title="O que voce vai desenvolver" align="center" />
              <div className="mt-8 grid gap-6 md:grid-cols-3">
                {[...course.objectives, ...course.benefits].slice(0, 4).map((objective, index) => (
                  <Card
                    key={objective}
                    className={index === 0 || index === 3 ? "md:col-span-2" : index === 1 ? "bg-tk-brand-hover text-white" : ""}
                  >
                    <CardContent className="space-y-3 p-8">
                      <ShieldCheck className="h-8 w-8 text-tk-accent" />
                      <h3 className={index === 1 ? "text-white" : "text-tk-brand"}>{objective}</h3>
                      <p className={index === 1 ? "text-sm leading-7 text-white/75" : "text-sm leading-7 text-tk-ink-muted"}>
                        Aplicação prática com foco em decisão, rotina profissional e segurança na execução.
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-8">
              <Card className="border-outline-variant bg-white">
                <CardContent className="space-y-6 p-6">
                  <SectionTitle accentBar eyebrow="Decisão rápida" title="O que avaliar antes de se inscrever" />
                  <div className="grid gap-4 md:grid-cols-3">
                    {[
                      {
                        title: "Perfil ideal",
                        description: "Compare o público-alvo com sua função atual para acelerar aplicação prática."
                      },
                      {
                        title: "Agenda",
                        description: "Revise turma, horário e formato antes de reservar a vaga."
                      },
                      {
                        title: "Investimento",
                        description: "Veja o valor total e alinhe forma de pagamento logo no checkout."
                      }
                    ].map((item) => (
                      <div key={item.title} className="rounded-xl border border-outline-variant bg-surface-muted p-4">
                        <h3 className="font-tk-display text-base font-bold tracking-[var(--tk-tracking-display)] text-tk-ink">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-tk-ink-muted">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-6 p-6">
                  <SectionTitle accentBar eyebrow="Público-alvo" title="Para quem é este curso" />
                  {course.targetAudience && course.targetAudience.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {course.targetAudience.map((audience) => (
                        <div key={audience} className="flex items-center gap-3 rounded-lg border border-outline-variant bg-white/50 p-4">
                          <ShieldCheck className="h-5 w-5 shrink-0 text-accent" />
                          <span className="text-sm font-medium text-tk-brand">{audience}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-tk-ink-muted">Público-alvo não especificado.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-6 p-6">
                  <SectionTitle accentBar title="Conteúdo programático" description="Módulos organizados em acordeon, com tópicos e duração." />
                  <Accordion type="multiple" className="w-full">
                    {course.modules.map((module, index) => (
                      <AccordionItem key={module.title} value={`module-${index}`}>
                        <AccordionTrigger>{module.title}</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3">
                            <p>{module.description}</p>
                            <div className="text-xs uppercase tracking-[0.16em] text-tk-ink-muted">{module.duration}</div>
                            <ul className="grid gap-2">
                              {module.topics.map((topic) => (
                                <li key={topic}>• {topic}</li>
                              ))}
                            </ul>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>

            <Card className="h-fit border-outline-variant bg-tk-brand-hover text-white lg:sticky lg:top-24">
              <CardContent className="space-y-5 p-6">
                <div className="space-y-1">
                  <div className="inline-flex rounded bg-tk-accent px-3 py-1.5 text-label font-bold uppercase tracking-[0.05em] text-white">Inscrição garantida</div>
                  <div className="text-4xl font-extrabold text-tk-accent">{currency(course.price)}</div>
                </div>
                <Button className="w-full bg-tk-accent text-white hover:bg-tk-brand hover:text-white" size="lg" onClick={() => startCheckout("sidebar_cta")}>
                  Inscrever-se agora
                </Button>
                <div className="rounded-lg border border-white/15 bg-white/10 p-4 text-sm font-medium text-white">
                  Próxima turma disponível: {courseClasses[0] ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(courseClasses[0].startDate)) : "Em breve"}
                </div>
                <div className="grid gap-3 rounded-lg border border-white/15 bg-white/8 p-4 text-sm text-white/80">
                  <div className="flex items-center justify-between gap-3">
                    <span>Formato</span>
                    <strong className="text-white">{course.modality}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Carga horária</span>
                    <strong className="text-white">{course.durationLabel}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Vagas abertas</span>
                    <strong className="text-white">{nextClass ? nextClass.availableSeats : "Sob consulta"}</strong>
                  </div>
                </div>
                <ul className="space-y-3 text-sm text-white/80">
                  {course.benefits.slice(0, 4).map((benefit) => (
                    <li key={benefit} className="flex gap-3">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-tk-success" />
                      {benefit}
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white" variant="outline" size="lg">
                  <a href="#atendimento">
                    <MessageCircle className="h-4 w-4" />
                    Falar com atendimento
                  </a>
                </Button>
                <div className="rounded-lg border border-dashed border-white/20 p-4 text-sm leading-6 text-white/70">
                  Inclui material de apoio, confirmacao por e-mail e atendimento da equipe RH Cursos.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="page-section bg-white">
        <div className="container space-y-8">
          <SectionTitle eyebrow="Próximas turmas" title="Escolha a turma ideal para sua agenda." />
          {courseClasses.length ? (
            <div className="grid gap-5 xl:grid-cols-3">
              {courseClasses.map((trainingClass) => (
                <ClassCard key={trainingClass.id} trainingClass={trainingClass} course={course} instructor={instructor} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Sem turmas abertas no momento."
              description="Este curso segue disponível para atendimento consultivo e novas aberturas de agenda."
              actionLabel="Falar com atendimento"
              onAction={() => window.location.assign("/falar-com-especialista")}
            />
          )}
        </div>
      </section>

      <section id="atendimento" className="page-section">
        <div className="container grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <SectionTitle eyebrow="Instrutor" title={instructor?.name ?? "Instrutor"} description={instructor?.bio} />
            <Card>
              <CardContent className="space-y-6 p-6">
                {instructor?.avatar && (
                  <div className="flex justify-center">
                    {instructor.avatar.startsWith("http") || instructor.avatar.startsWith("/") ? (
                      <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-outline-variant">
                        <Image
                          src={instructor.avatar}
                          alt={instructor.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-outline-variant bg-surface-container text-xl font-semibold text-tk-brand">
                        {instructor.avatar}
                      </div>
                    )}
                  </div>
                )}
                <div className="text-sm text-tk-ink-muted">Especialidade: {instructor?.specialty}</div>
                <div className="text-sm text-tk-ink-muted">Avaliação média: {instructor?.rating.toFixed(1)}</div>
                <div className="text-sm text-tk-ink-muted">Cursos vinculados: {instructor?.courseIds.length ?? 0}</div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <SectionTitle eyebrow="FAQ do curso" title="Dúvidas frequentes antes da inscrição" />
            <FAQAccordion />
            <Card className="border-outline-variant bg-surface-muted">
              <CardContent className="space-y-4 p-6">
                <h3 className="font-tk-display text-2xl font-bold tracking-[var(--tk-tracking-display)] text-tk-ink">
                  Prefere validar com a equipe antes da matrícula?
                </h3>
                <p className="text-sm leading-6 text-tk-ink-muted">
                  Fale com atendimento para confirmar aderência do conteúdo, política comercial e formato ideal para sua turma.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild>
                    <Link to="/contato">Solicitar orientação</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/in-company">Ver solução in company</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="page-section bg-white">
        <div className="container space-y-8">
          <SectionTitle eyebrow="Depoimentos" title="Percepções de quem já passou pela experiência." />
          <div className="grid gap-5 xl:grid-cols-3">
            {relatedTestimonials.length ? relatedTestimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            )) : <EmptyState title="Sem depoimentos vinculados a este curso." description="A estrutura está pronta para receber depoimentos relacionados." />}
          </div>
        </div>
      </section>

      <CheckoutModal course={course} open={openCheckout} onOpenChange={handleCheckoutOpenChange} />
    </>
  );
}
