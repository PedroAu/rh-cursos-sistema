import type * as React from "react";

import { cn } from "@/lib/utils";

export interface StatBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  label: string;
}

export function StatBlock({ value, label, className, ...props }: StatBlockProps) {
  return (
    <div className={cn("grid gap-2 text-tk-ink", className)} {...props}>
      <strong className="font-tk-display text-display-large font-bold leading-tight text-tk-brand">{value}</strong>
      <span className="text-sm leading-6 text-tk-ink-muted">{label}</span>
    </div>
  );
}
