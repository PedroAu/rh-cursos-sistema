import { CalendarDays, Clock3, MapPin, UserRound } from "lucide-react";
import { Link } from "@/lib/router-compat";

import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
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
  return (
    <Card className="h-full border-outline-variant bg-white/95">
      <CardContent className="space-y-6 p-6">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex rounded-full border border-accent bg-accent px-3 py-1 text-badge font-bold uppercase tracking-[0.08em] text-white">
              {course.pathName}
            </span>
            <StatusBadge status={trainingClass.status} />
          </div>
          <h3 className="text-article font-bold text-deep-navy">{course.title}</h3>
        </div>

        <div className="grid gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            {formatDate(trainingClass.startDate)}
          </div>
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4" />
            {trainingClass.time} • {trainingClass.modality}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {trainingClass.location}
          </div>
          <div className="flex items-center gap-2">
            <UserRound className="h-4 w-4" />
            {instructor?.name ?? "Instrutor a definir"}
          </div>
        </div>
        <div className="grid gap-2 border-t border-border/70 pt-6 sm:grid-cols-2">
          <Button asChild variant="outline">
            <Link to={`/cursos/${course.slug}`}>Ver curso</Link>
          </Button>
          <Button asChild>
            <Link to={`/cursos/${course.slug}?checkout=1`}>Inscrever-se</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
