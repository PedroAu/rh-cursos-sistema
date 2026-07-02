import type * as React from "react";

import { cn } from "@/lib/utils";

export function PaperCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-tk-card border border-rh-paper-line bg-[linear-gradient(158deg,var(--rh-paper-a),var(--rh-paper-b))] p-8 text-tk-ink shadow-tk-card",
        className
      )}
      {...props}
    />
  );
}
