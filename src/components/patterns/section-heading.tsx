import type * as React from "react";

import { cn } from "@/lib/utils";

export interface SectionHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

export function SectionHeading({ eyebrow, title, subtitle, className, ...props }: SectionHeadingProps) {
  return (
    <div className={cn("grid max-w-3xl gap-3 text-tk-ink", className)} {...props}>
      {eyebrow ? <p className="text-caption font-semibold uppercase tracking-[var(--tk-tracking-eyebrow)] text-rh-gray">{eyebrow}</p> : null}
      <h2 className="font-tk-display text-section-heading font-bold leading-tight md:text-display-large">{title}</h2>
      {subtitle ? <p className="font-tk-serif text-subheading leading-relaxed text-tk-ink-muted">{subtitle}</p> : null}
    </div>
  );
}
