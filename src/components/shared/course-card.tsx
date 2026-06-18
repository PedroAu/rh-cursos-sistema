import type { Course } from "@/lib/site-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type CourseCardProps = {
  course: Course;
};

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="min-h-80">
      <CardContent className="flex h-full flex-col gap-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <Badge variant="secondary">{course.category}</Badge>
          <p className="text-sm font-bold text-foreground">{course.price}</p>
        </div>
        <div className="flex-1">
          <h3 className="text-balance font-heading text-2xl font-bold leading-tight text-foreground">
            {course.title}
          </h3>
          <p className="mt-3 leading-7 text-muted-foreground">{course.summary}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{course.duration}</Badge>
          <Badge className="border-brand-gold text-brand-navy-700" variant="outline">
            {course.format}
          </Badge>
        </div>
        <div className="mt-auto flex flex-wrap gap-3">
          <Button asChild variant="gold">
            <a href={`/cursos/${course.slug}`}>Ver detalhes</a>
          </Button>
          <Button asChild variant="outline">
            <a href={`/inscricao/${course.slug}`}>Inscricao</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
