import { CalendarDays, Clock3, MapPin, TriangleAlert, UserRound } from "lucide-react";
import { Link } from "@/lib/router-compat";

import { StatusBadge } from "@/components/common/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { isTrainingClassSoldOut } from "@/lib/enrollment-class-resolution";
import { formatDate } from "@/lib/utils";
import type { Course, Instructor, TrainingClass } from "@/types";

export function ClassCard({
  trainingClass,
  course,
  instructor
}: {
  trainingClass: TrainingClass;
  course: Course;
  instructor?: Instructor;
}) {
  const soldOut = isTrainingClassSoldOut(trainingClass);
  const [month, day] = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short"
  })
    .format(new Date(trainingClass.startDate))
    .replace(".", "")
    .split(" ");

  const urgencyLabel =
    soldOut
      ? "Esgotada"
      : trainingClass.status === "Poucas vagas"
      ? "Últimas vagas"
      : trainingClass.status === "Inscrições abertas"
        ? "Vagas abertas"
        : trainingClass.status;

  return (
    <Card variant="elevated" interactive={false} size="md" className="overflow-hidden">
      <div className="grid lg:grid-cols-[172px_minmax(0,1fr)]">
        <div className="flex min-h-[172px] flex-col items-center justify-center bg-tk-brand-hover px-6 py-8 text-center text-white">
          <span className="font-tk-display text-5xl font-bold leading-none tracking-[var(--tk-tracking-display)]">{day}</span>
          <span className="mt-2 font-tk-display text-xl font-bold uppercase tracking-[var(--tk-tracking-display)]">{month}</span>
          <span className="mt-2 text-base text-white/80">
            {new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(new Date(trainingClass.startDate))}
          </span>
        </div>

        <CardContent className="space-y-5 p-5 pt-5 lg:p-6">
          <div className="flex flex-col gap-4 border-b border-outline-variant pb-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex rounded-full bg-tk-accent-soft px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-tk-brand-hover">
                  {trainingClass.modality}
                </span>
                <StatusBadge status={soldOut ? "Esgotada" : trainingClass.status} />
              </div>
              <h3 className="max-w-2xl font-tk-display text-[1.45rem] font-bold leading-tight tracking-[var(--tk-tracking-display)] text-tk-ink">
                {course.title}
              </h3>
            </div>

          <div className={`flex items-center gap-2 text-right text-sm font-bold ${soldOut ? "text-tk-error" : "text-tk-success"}`}>
              {trainingClass.status === "Poucas vagas" && !soldOut ? (
                <TriangleAlert className="h-4 w-4 text-warning" />
              ) : (
                <span className={`h-2.5 w-2.5 rounded-full ${soldOut ? "bg-tk-error" : "bg-tk-success"}`} />
              )}
              <span>{urgencyLabel}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-base text-tk-ink-muted">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-tk-brand-hover" />
              <span>{trainingClass.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-tk-brand-hover" />
              <span>{instructor?.name ?? "Instrutor a definir"}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-tk-brand-hover" />
              <span>{formatDate(trainingClass.startDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-tk-brand-hover" />
              <span>{trainingClass.location}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              to={`/cursos/${course.slug}`}
              className="inline-flex items-center text-sm font-semibold text-tk-brand-hover transition hover:text-tk-brand"
            >
              Ver curso
            </Link>
            {soldOut ? (
              <span className="inline-flex min-h-11 items-center justify-center rounded-md bg-tk-ink-muted px-5 text-sm font-bold text-white" aria-disabled="true">
                Esgotada
              </span>
            ) : (
              <Link
                to={`/cursos/${course.slug}/checkout?classId=${trainingClass.id}`}
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-tk-accent px-5 text-sm font-bold text-white transition hover:bg-tk-brand"
              >
                Inscrever-se
              </Link>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
