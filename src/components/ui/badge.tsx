import type * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex min-h-7 items-center rounded-full border px-3 py-1.5 text-label-bold font-semibold uppercase tracking-[0.05em]",
  {
    variants: {
      variant: {
        default: "border-[var(--ea-chip-border)] bg-[var(--ea-chip-bg)] text-[var(--ea-chip-fg)]",
        success: "border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]",
        warning: "border-[#fde68a] bg-[#fffbeb] text-[#92400e]",
        danger: "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]",
        muted: "border-outline-variant bg-muted text-muted-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
