import {
  IconCalendar,
  IconCertificate,
  IconClockHour4,
  IconLock,
  IconHeadset,
  IconCircleCheck,
  IconShieldCheck,
} from "@tabler/icons-react";
import { notFound } from "next/navigation";

import { PublicEnrollmentForm } from "@/components/forms/public-enrollment-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { getEnrollmentContextBySlug, getPublicCourseBySlug } from "@/lib/public-data";

type EnrollmentPageProps = {
  params: Promise<{ slug: string }>;
};

function getInstallmentText(price: string) {
  if (price.toLowerCase().includes("sob consulta")) {
    return "Condição definida após confirmação";
  }

  return "Consulte condições de parcelamento";
}

export default async function EnrollmentPage({ params }: EnrollmentPageProps) {
  const { slug } = await params;
  const [course, enrollmentContext] = await Promise.all([
    getPublicCourseBySlug(slug),
    getEnrollmentContextBySlug(slug),
  ]);

  if (!course) {
    notFound();
  }

  return (
    <main className="bg-muted/30">
      <Section as="div" size="md">
        <Container variant="wide" as="section">
          <div className="space-y-8">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <h1 className="font-heading text-3xl font-bold leading-tight text-brand-navy-700 md:text-4xl">
                Inscrição segura
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <IconLock className="text-emerald-700" size={20} />
                <p className="text-sm font-bold">Ambiente de Inscrição 100% Seguro</p>
              </div>
            </div>

            <div className="grid items-start gap-8 xl:grid-cols-[0.72fr_1fr] xl:gap-10">
              <aside className="space-y-8">
                <Card className="relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-1.5 bg-brand-navy-700" />
                  <CardContent className="space-y-8 p-6 pt-8 xl:p-8 xl:pt-10">
                    <div>
                      <Badge className="mb-4 w-fit" variant="secondary">
                        Curso profissionalizante
                      </Badge>
                      <h2 className="text-balance font-heading text-3xl font-bold leading-tight text-brand-navy-700">
                        {course.title}
                      </h2>
                      <p className="mt-3 leading-7 text-muted-foreground">{course.summary}</p>
                    </div>

                    <div className="space-y-4 border-t pt-6">
                      {[
                        ["Carga horária", `${course.duration} de conteúdo`, <IconClockHour4 size={20} key="clock" />],
                        ["Certificação", "Válida em todo território nacional", <IconCertificate size={20} key="certificate" />],
                        ["Início", "Acesso após confirmação operacional", <IconCalendar size={20} key="calendar" />],
                      ].map(([label, value, icon]) => (
                        <div className="flex items-center gap-4" key={String(label)}>
                          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-navy-50 text-brand-navy-700">
                            {icon}
                          </span>
                          <div>
                            <p className="text-xs font-extrabold uppercase text-muted-foreground">{label}</p>
                            <p className="font-bold text-foreground">{value}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Card className="bg-muted/50">
                      <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
                        <div>
                          <p className="text-xs text-muted-foreground">Investimento</p>
                          <p className="font-heading text-3xl font-bold text-brand-navy-700">{course.price}</p>
                          <p className="text-sm font-bold text-emerald-700">Inscrição sujeita à disponibilidade da turma</p>
                        </div>
                        <div className="sm:text-right">
                          <p className="text-xs text-muted-foreground">Pagamento</p>
                          <p className="font-extrabold text-foreground">{getInstallmentText(course.price)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                      <IconCircleCheck className="text-brand-navy-700" size={28} />
                      <p className="text-sm font-extrabold">Garantia de 7 dias</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                      <IconHeadset className="text-brand-navy-700" size={28} />
                      <p className="text-sm font-extrabold">Suporte prioritário</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-brand-navy-700 text-white">
                  <CardContent className="space-y-4 p-6">
                    <span className="inline-flex size-12 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
                      <IconShieldCheck size={22} />
                    </span>
                    <p className="text-lg font-extrabold leading-7">
                      Junte-se a mais de 15.000 profissionais certificados pela RH Cursos.
                    </p>
                  </CardContent>
                </Card>
              </aside>

              <Card>
                <CardContent className="p-6 md:p-10">
                  <PublicEnrollmentForm
                    courseId={enrollmentContext.courseId}
                    courseTitle={course.title}
                    courseSlug={course.slug}
                    classOptions={enrollmentContext.classes}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
