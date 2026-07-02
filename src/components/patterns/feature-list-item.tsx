import type * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface FeatureListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureListItem({ icon: Icon, title, description, className, ...props }: FeatureListItemProps) {
  return (
    <div className={cn("flex gap-4 text-tk-ink", className)} {...props}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-tk-pill bg-tk-accent-soft text-tk-accent-strong">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="grid gap-1">
        <strong className="font-semibold">{title}</strong>
        <span className="text-sm leading-6 text-tk-ink-muted">{description}</span>
      </span>
    </div>
  );
}
