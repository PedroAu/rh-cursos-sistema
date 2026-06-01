import type * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex min-h-7 items-center rounded px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.05em]",
  {
    variants: {
      variant: {
        default: "bg-secondary text-foreground",
        success: "bg-primary/12 text-primary",
        warning: "bg-accent text-white",
        danger: "bg-danger/15 text-danger",
        muted: "bg-muted text-muted-foreground"
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
