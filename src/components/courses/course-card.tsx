import { Clock3, Star, Users } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Link } from "@/lib/router-compat";

import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { currency } from "@/lib/utils";
import type { Course, TrainingClass } from "@/types";

type CourseCardProps = {
  course: Course;
  nextClass?: TrainingClass;
  compact?: boolean;
};

export function CourseCard({ course, nextClass, compact = false }: CourseCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="group h-full overflow-hidden border-outline-variant bg-white/95 hover:-translate-y-1 hover:border-accent hover:shadow-card">
        <div className={`relative overflow-hidden ${compact ? "aspect-[16/10]" : "aspect-video"}`}>
          <Image
            src={course.image}
            alt={course.title}
            fill
            sizes={compact ? "(min-width: 1024px) 384px, 100vw" : "(min-width: 1024px) 33vw, 100vw"}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute left-4 top-4 rounded bg-white/92 px-3 py-1 text-micro font-bold uppercase tracking-[0.12em] text-primary shadow-sm backdrop-blur">
            {course.pathName}
          </div>
        </div>
        <div className="border-b border-outline-variant bg-white p-6">
          <div className="space-y-2">
            <div className="inline-flex rounded bg-accent px-2 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
              {course.level}
            </div>
            <StatusBadge status={course.status} />
          </div>
        </div>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-3">
            <h3 className="line-clamp-2 text-card font-bold">{course.title}</h3>
            <p className="line-clamp-3 text-sm leading-7 text-muted-foreground">
              {course.shortDescription}
            </p>
          </div>

          <div className={compact ? "grid grid-cols-2 gap-4 border-t border-surface-container pt-6 text-sm text-muted-foreground" : "grid gap-2 text-sm text-muted-foreground"}>
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4" />
              {course.modality} • {course.durationLabel}
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-accent" />
              {course.rating.toFixed(1)} de avaliação média
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {course.studentsCount} alunos capacitados
            </div>
            <div className="font-bold text-accent">
              {course.price ? `${currency(course.price)}` : "Sob consulta"}
            </div>
            {!compact && nextClass ? (
              <div className="rounded-lg bg-secondary/70 px-4 py-3 text-primary">
                Próxima turma: {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(nextClass.startDate))}
              </div>
            ) : null}
          </div>

          <div className="border-t border-border/70 pt-6">
            <div className="grid gap-2 sm:grid-cols-2">
              <Button asChild variant="outline" className="w-full min-w-0 whitespace-normal px-4 text-center leading-tight">
                <Link to={`/cursos/${course.slug}`}>Ver detalhes</Link>
              </Button>
              <Button asChild className="w-full min-w-0 whitespace-normal px-4 text-center leading-tight">
                <Link to={`/cursos/${course.slug}?checkout=1`}>Inscrever-se</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
