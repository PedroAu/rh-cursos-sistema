import { CalendarDays, Clock3, MapPin, TriangleAlert, UserRound } from "lucide-react";
import { Link } from "@/lib/router-compat";

import { StatusBadge } from "@/components/common/status-badge";
import { Card, CardContent } from "@/components/ui/card";
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
  const [month, day] = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short"
  })
    .format(new Date(trainingClass.startDate))
    .replace(".", "")
    .split(" ");

  const urgencyLabel =
    trainingClass.status === "Poucas vagas"
      ? "Últimas vagas"
      : trainingClass.status === "Inscrições abertas"
        ? "Vagas abertas"
        : trainingClass.status;

  return (
    <Card className="overflow-hidden border-[#d7dee5] bg-white shadow-[0_8px_24px_rgba(0,67,100,0.08)]">
      <div className="grid lg:grid-cols-[172px_minmax(0,1fr)]">
        <div className="flex min-h-[172px] flex-col items-center justify-center bg-[#0b4668] px-6 py-8 text-center text-white">
          <span className="text-5xl font-extrabold leading-none">{day}</span>
          <span className="mt-2 text-xl font-bold uppercase">{month}</span>
          <span className="mt-2 text-base text-white/80">
            {new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(new Date(trainingClass.startDate))}
          </span>
        </div>

        <CardContent className="space-y-5 p-5 pt-5 lg:p-6">
          <div className="flex flex-col gap-4 border-b border-[#d7dee5] pb-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex rounded-full bg-[#cae6ff] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#004364]">
                  {trainingClass.modality}
                </span>
                <StatusBadge status={trainingClass.status} />
              </div>
              <h3 className="max-w-2xl text-[1.45rem] font-bold leading-tight text-[#11324a]">
                {course.title}
              </h3>
            </div>

          <div className="flex items-center gap-2 text-right text-sm font-bold text-[#1f6f2e]">
              {trainingClass.status === "Poucas vagas" ? (
                <TriangleAlert className="h-4 w-4 text-[#e67e22]" />
              ) : (
                <span className="h-2.5 w-2.5 rounded-full bg-[#1f6f2e]" />
              )}
              <span>{urgencyLabel}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-base text-[#4c5560]">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-[#004364]" />
              <span>{trainingClass.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-[#004364]" />
              <span>{instructor?.name ?? "Instrutor a definir"}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[#004364]" />
              <span>{formatDate(trainingClass.startDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#004364]" />
              <span>{trainingClass.location}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              to={`/cursos/${course.slug}`}
              className="inline-flex items-center text-sm font-semibold text-[#004364] transition hover:text-[#0d5b85]"
            >
              Ver curso
            </Link>
            <Link
              to={`/cursos/${course.slug}?checkout=1`}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#f6be39] px-5 text-sm font-bold text-[#083b56] transition hover:bg-[#ffc641]"
            >
              Inscrever-se
            </Link>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
