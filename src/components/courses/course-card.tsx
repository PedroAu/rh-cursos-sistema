import { ArrowRight, Building2, Clock3, FolderOpen, Star, Users } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { Link } from "@/lib/router-compat";

import { StatusBadge } from "@/components/common/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { useQuoteModal } from "@/components/in-company/quote-modal";
import { cn, parseDate } from "@/lib/utils";
import type { Course, TrainingClass } from "@/types";

type CourseCardProps = {
  course: Course;
  nextClass?: TrainingClass;
  compact?: boolean;
};

export function CourseCard({ course, nextClass, compact = false }: CourseCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const { openQuote } = useQuoteModal();

  const cardBody = (
    <Card variant="elevated" interactive={true} size={compact ? "sm" : "md"} className="group h-full overflow-hidden transition duration-300 hover:-translate-y-1">
      <div className={cn("relative overflow-hidden", compact ? "aspect-[16/10]" : "aspect-[1.32/1]")}>
        <Image
          src={course.image}
          alt={course.title}
          fill
          sizes={compact ? "(min-width: 1024px) 384px, 100vw" : "(min-width: 1024px) 33vw, 100vw"}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {course.featured ? (
          <div className="absolute left-4 top-4 rounded-full bg-tk-brand px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-tk-surface">
            Novo
          </div>
        ) : null}
      </div>
      <CardContent className="space-y-5 border-t-2 border-warning p-5 pt-4">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-tk-brand">
          <FolderOpen className="h-3.5 w-3.5" />
          <span>{course.pathName}</span>
        </div>

        <div className="space-y-3">
          <h3 className="line-clamp-3 text-[1.05rem] font-bold leading-[1.2] text-tk-ink md:text-[1.2rem]">
            {course.title}
          </h3>
          <p className="line-clamp-4 text-sm leading-6 text-tk-ink-muted">
            {course.shortDescription}
          </p>
        </div>

        <div className="grid gap-2 border-t border-tk-line pt-4 text-sm text-tk-ink-muted">
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-tk-brand" />
            <span>{course.durationLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-[var(--color-status-warning)]" />
            <span>{course.rating.toFixed(1)} de avaliação média</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-tk-brand" />
            <span>{course.studentsCount} alunos capacitados</span>
          </div>
          {nextClass ? (
            <div className="rounded-md bg-tk-accent-soft px-3 py-2 text-xs font-semibold text-tk-brand">
              Próxima turma:{" "}
              {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(parseDate(nextClass.startDate))}
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-tk-line pt-4">
          <Link
            to={`/cursos/${course.slug}`}
            className="inline-flex items-center gap-2 text-sm font-bold text-tk-brand transition hover:text-tk-brand-hover"
          >
            Saiba mais
            <ArrowRight className="h-4 w-4" />
          </Link>

          <button
            type="button"
            onClick={() => openQuote(course)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.04em] text-[var(--color-status-warning)] transition hover:opacity-80"
          >
            <Building2 className="h-4 w-4" />
            Orçamento In Company
          </button>
        </div>

        <div className="flex items-center justify-between gap-2">
          <StatusBadge status={course.status} />
          <Link
            to={nextClass ? `/cursos/${course.slug}/checkout?classId=${nextClass.id}` : `/cursos/${course.slug}/checkout`}
            className="inline-flex min-h-10 items-center justify-center rounded-button bg-warning px-4 text-sm font-bold text-deep-navy transition hover:opacity-90"
          >
            Inscrever-se
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  if (prefersReducedMotion) {
    return <div>{cardBody}</div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      {cardBody}
    </motion.div>
  );
}
