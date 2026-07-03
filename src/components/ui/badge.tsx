import type * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex min-h-7 items-center gap-2 rounded-tk-pill border px-3 py-1 text-caption font-semibold",
  {
    variants: {
      tone: {
        accent: "border-transparent bg-tk-accent-soft text-tk-accent-strong",
        neutral: "border-tk-line bg-tk-surface-2 text-tk-ink-muted",
        success: "tk-badge-success border-transparent bg-[color-mix(in_srgb,var(--tk-success)_12%,var(--tk-surface))]",
        error: "border-transparent bg-[color-mix(in_srgb,var(--tk-error)_10%,var(--tk-surface))] text-tk-error"
      },
      variant: {
        default: "border-transparent bg-tk-accent-soft text-tk-accent-strong",
        success: "tk-badge-success border-transparent bg-[color-mix(in_srgb,var(--tk-success)_12%,var(--tk-surface))]",
        warning: "border-tk-line bg-tk-cream text-tk-ink",
        danger: "border-transparent bg-[color-mix(in_srgb,var(--tk-error)_10%,var(--tk-surface))] text-tk-error",
        muted: "border-tk-line bg-tk-surface-2 text-tk-ink-muted"
      }
    },
    defaultVariants: {
      tone: "accent"
    }
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, tone, variant, dot = false, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ tone, variant }), className)} {...props}>
      {dot ? <span className="h-1.5 w-1.5 rounded-tk-pill bg-current" aria-hidden="true" /> : null}
      {children}
    </div>
  );
}
