import type * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface TestimonialProps extends React.HTMLAttributes<HTMLElement> {
  quote: string;
  name: string;
  role: string;
  company?: string;
  imageSrc?: string;
  initials: string;
}

export function Testimonial({ quote, name, role, company, imageSrc, initials, className, ...props }: TestimonialProps) {
  return (
    <figure className={cn("rounded-tk-card border border-tk-line bg-tk-cream p-8 shadow-tk-card", className)} {...props}>
      <blockquote className="font-tk-serif text-subheading leading-relaxed text-tk-ink">{quote}</blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <Avatar size="md">
          {imageSrc ? <AvatarImage src={imageSrc} alt="" /> : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <span className="grid">
          <strong className="text-sm font-semibold text-tk-ink">{name}</strong>
          <span className="text-caption text-tk-ink-muted">{company ? `${role}, ${company}` : role}</span>
        </span>
      </figcaption>
    </figure>
  );
}
