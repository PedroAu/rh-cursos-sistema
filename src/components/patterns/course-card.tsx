import type * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CourseCardProps extends React.HTMLAttributes<HTMLElement> {
  track: string;
  title: string;
  meta: string;
  cta?: string;
}

export function CourseCard({ track, title, meta, cta = "Ver detalhes ->", className, ...props }: CourseCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-tk-glass border border-tk-line bg-tk-surface p-5 text-tk-ink shadow-tk-glass transition duration-200 ease-[var(--tk-ease)] hover:-translate-y-0.5",
        className
      )}
      {...props}
    >
      <Badge tone="accent" dot>{track}</Badge>
      <h3 className="font-tk-display text-subheading-large font-bold leading-snug">{title}</h3>
      <p className="text-sm leading-6 text-tk-ink-muted">{meta}</p>
      <Button variant="ghost" size="sm" className="mt-auto justify-start px-0">
        {cta}
      </Button>
    </article>
  );
}
