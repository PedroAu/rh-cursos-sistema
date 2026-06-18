import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import {
  ArrowRight,
  Banknote,
  BriefcaseBusiness,
  Building2,
  Clock,
  FileCheck2,
  Scale,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AgendaItem } from "@/lib/public-data";
import type { Course } from "@/lib/site-data";

type CourseArticleCardProps = {
  course: Course;
  compact?: boolean;
  level?: string;
  durationGroup?: string;
  nextClass?: AgendaItem;
};

const categoryVisuals: Record<string, { icon: typeof UsersRound; image: string }> = {
  "Departamento pessoal": {
    icon: UsersRound,
    image: "linear-gradient(140deg, rgba(8,59,86,0.92), rgba(13,91,133,0.58)), url('https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80')",
  },
  Licitações: {
    icon: Scale,
    image: "linear-gradient(140deg, rgba(92,67,0,0.88), rgba(212,160,23,0.45)), url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80')",
  },
  "Gestão de pessoas": {
    icon: BriefcaseBusiness,
    image: "linear-gradient(140deg, rgba(0,67,100,0.9), rgba(63,140,190,0.4)), url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80')",
  },
};

function formatNextClass(nextClass?: AgendaItem) {
  if (!nextClass) {
    return "Turma sob consulta";
  }

  return dayjs(nextClass.startDate).locale("pt-br").format("DD MMM YYYY");
}

export function CourseArticleCard({
  course,
  compact = false,
  level = "Aplicação prática",
  durationGroup,
  nextClass,
}: CourseArticleCardProps) {
  const visual = categoryVisuals[course.category] ?? {
    icon: Building2,
    image: "linear-gradient(140deg, rgba(8,59,86,0.9), rgba(13,91,133,0.45)), url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80')",
  };
  const Icon = visual.icon;

  return (
    <Card className="flex h-full min-h-96 flex-col overflow-hidden rounded-lg">
      <div
        className={compact ? "h-42 w-full p-5" : "h-58 w-full p-6"}
        style={{
          background: visual.image,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <Badge variant="gold">{course.category}</Badge>
          <span className="inline-flex size-11 items-center justify-center rounded-full bg-white text-brand-navy-700 shadow-sm">
            <Icon aria-hidden className="size-5" />
          </span>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{level}</Badge>
          {durationGroup ? <Badge variant="outline">{durationGroup}</Badge> : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock aria-hidden className="size-4" />
            {course.duration}
          </span>
          <span aria-hidden>•</span>
          <span className="inline-flex items-center gap-1.5">
            <FileCheck2 aria-hidden className="size-4" />
            {course.format}
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="font-heading text-xl font-bold leading-tight text-foreground">
            {course.title}
          </h3>
          <p className={compact ? "line-clamp-3 leading-7 text-muted-foreground" : "leading-7 text-muted-foreground"}>
            {course.summary}
          </p>
        </div>

        <div className="grid gap-2 text-sm text-muted-foreground">
          <p>
            Público-alvo: <strong className="font-semibold text-foreground">{course.audience.slice(0, 2).join(", ")}</strong>
          </p>
          <p>
            Próxima turma: <strong className="font-semibold text-foreground">{formatNextClass(nextClass)}</strong>
          </p>
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-4 border-t border-border pt-4">
          <div>
            <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Banknote aria-hidden className="size-4" />
              Investimento
            </p>
            <p className="text-lg font-extrabold text-foreground">{course.price}</p>
          </div>
          <Button asChild size={compact ? "sm" : "default"} variant="secondary">
            <Link href={`/cursos/${course.slug}`}>
              Ver detalhes
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
