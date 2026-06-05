import { useEffect, useMemo, useState } from "react";
import { Download, MessageCircle, Play, ShieldCheck, Star, Users } from "lucide-react";
import { Link, useParams, useSearchParams } from "@/lib/router-compat";

import { EmptyState } from "@/components/common/empty-state";
import { FAQAccordion } from "@/components/common/faq-accordion";
import { SectionTitle } from "@/components/common/section-title";
import { TestimonialCard } from "@/components/common/testimonial-card";
import { ClassCard } from "@/components/agenda/class-card";
import { CheckoutModal } from "@/components/checkout/checkout-modal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/lib/app-store";
import { currency } from "@/lib/utils";

export function CourseDetailPage() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const { courses, classes, instructors, testimonials } = useAppStore();
  const [openCheckout, setOpenCheckout] = useState(false);

  const course = courses.find((item) => item.slug === slug);
  const courseClasses = useMemo(() => classes.filter((item) => item.courseId === course?.id), [classes, course?.id]);
  const relatedTestimonials = testimonials.filter((item) => item.course === course?.title).slice(0, 3);
  const instructor = instructors.find((item) => item.id === course?.instructorId);

  useEffect(() => {
    if (params.get("checkout") === "1") {
      setOpenCheckout(true);
    }
  }, [params]);

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
          <div className="text-sm text-muted-foreground">
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
                <h1 className="font-display text-primary">{course.title}</h1>
                <p className="max-w-3xl text-lg leading-8 text-muted-foreground">{course.fullDescription}</p>
                <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
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
                <Button size="lg" onClick={() => setOpenCheckout(true)}>
                  Inscrever-se agora
                </Button>
                <Button variant="outline" size="lg">
                  <Download className="h-4 w-4" />
                  Programa PDF
                </Button>
              </div>

              <div className="flex flex-wrap gap-8 border-t border-outline-variant pt-6">
                <div>
                  <span className="ea-label text-text-muted">Investimento</span>
                  <p className="mt-1 font-bold text-primary">{currency(course.price)}</p>
                </div>
                <div>
                  <span className="ea-label text-text-muted">Carga</span>
                  <p className="mt-1 font-bold text-primary">{course.durationLabel}</p>
                </div>
                <div>
                  <span className="ea-label text-text-muted">Modalidade</span>
                  <p className="mt-1 font-bold text-primary">{course.modality}</p>
                </div>
                <div>
                  <span className="ea-label text-text-muted">Certificação</span>
                  <p className="mt-1 font-bold text-primary">Profissional</p>
                </div>
              </div>
            </div>

            <div className="group relative aspect-video overflow-hidden rounded-lg border border-outline-variant bg-slate-200 shadow-card">
                <img
                  src={course.image}
                  alt={course.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-primary/35">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-primary shadow-card">
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
                  <Card key={objective} className={index === 0 || index === 3 ? "md:col-span-2" : index === 1 ? "bg-deep-navy text-white" : ""}>
                    <CardContent className="space-y-3 p-8">
                      <ShieldCheck className={`h-8 w-8 ${index === 1 ? "text-prestige-gold" : "text-prestige-gold"}`} />
                      <h3 className={index === 1 ? "text-white" : "text-primary"}>{objective}</h3>
                      <p className={index === 1 ? "text-sm leading-7 text-white/75" : "text-sm leading-7 text-text-muted"}>
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
              <Card>
                <CardContent className="space-y-6 p-6">
                  <SectionTitle eyebrow="Público-alvo" title="Para quem é este curso" />
                  {course.targetAudience && course.targetAudience.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {course.targetAudience.map((audience) => (
                        <div key={audience} className="flex items-center gap-3 rounded-lg border border-outline-variant bg-white/50 p-4">
                          <ShieldCheck className="h-5 w-5 shrink-0 text-accent" />
                          <span className="text-sm font-medium text-primary">{audience}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Público-alvo não especificado.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-6 p-6">
                  <SectionTitle title="Conteúdo programático" description="Módulos organizados em acordeon, com tópicos e duração." />
                  <Accordion type="multiple" className="w-full">
                    {course.modules.map((module, index) => (
                      <AccordionItem key={module.title} value={`module-${index}`}>
                        <AccordionTrigger>{module.title}</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3">
                            <p>{module.description}</p>
                            <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{module.duration}</div>
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

            <Card className="h-fit border-slate-200 bg-deep-navy text-white lg:sticky lg:top-24">
              <CardContent className="space-y-5 p-6">
                <div className="space-y-1">
                  <div className="inline-flex rounded bg-prestige-gold px-3 py-1.5 text-[12px] font-bold uppercase tracking-[0.05em] text-white">Inscrição garantida</div>
                  <div className="text-4xl font-extrabold text-prestige-gold">{currency(course.price)}</div>
                </div>
                <Button className="w-full bg-prestige-gold text-white hover:bg-warning hover:text-white" size="lg" onClick={() => setOpenCheckout(true)}>
                  Inscrever-se agora
                </Button>
                <div className="rounded-lg border border-white/15 bg-white/10 p-4 text-sm font-medium text-white">
                  Próxima turma disponível: {courseClasses[0] ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(courseClasses[0].startDate)) : "Em breve"}
                </div>
                <ul className="space-y-3 text-sm text-white/80">
                  {course.benefits.slice(0, 4).map((benefit) => (
                    <li key={benefit} className="flex gap-3">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
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
          <div className="grid gap-5 xl:grid-cols-3">
            {courseClasses.map((trainingClass) => (
              <ClassCard key={trainingClass.id} trainingClass={trainingClass} course={course} instructor={instructor} />
            ))}
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <SectionTitle eyebrow="Instrutor" title={instructor?.name ?? "Instrutor"} description={instructor?.bio} />
            <Card>
              <CardContent className="space-y-6 p-6">
                {instructor?.avatar && (
                  <div className="flex justify-center">
                    <img
                      src={instructor.avatar}
                      alt={instructor.name}
                      className="h-24 w-24 rounded-full object-cover border-2 border-outline-variant"
                    />
                  </div>
                )}
                <div className="text-sm text-muted-foreground">Especialidade: {instructor?.specialty}</div>
                <div className="text-sm text-muted-foreground">Avaliação média: {instructor?.rating.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Cursos vinculados: {instructor?.courseIds.length ?? 0}</div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <SectionTitle eyebrow="FAQ do curso" title="Dúvidas frequentes antes da inscrição" />
            <FAQAccordion />
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

      <CheckoutModal course={course} open={openCheckout} onOpenChange={setOpenCheckout} />
    </>
  );
}
