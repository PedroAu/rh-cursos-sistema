import type * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex min-h-7 items-center rounded-pill border px-3 py-1.5 text-caption font-semibold uppercase tracking-[0.05em]",
  {
    variants: {
      variant: {
        default: "border-bright-blue bg-bright-blue-light text-trust-keith-teal",
        success: "border-success bg-[#f0fdf4] text-success",
        warning: "border-[#fde68a] bg-[#fffbeb] text-[#92400e]",
        danger: "border-danger bg-[#fef2f2] text-danger",
        muted: "border-surface-neutral bg-surface-light text-text-secondary"
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
