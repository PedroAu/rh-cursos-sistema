import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const chipVariants = cva(
  "inline-flex items-center justify-center rounded-tk-pill border text-sm font-medium transition-all duration-200 ease-[var(--tk-ease)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tk-focus focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        info: "border-tk-line bg-tk-surface px-[15px] py-2 text-tk-ink shadow-tk-glass",
        filter:
          "border-tk-line bg-tk-surface px-4 py-[9px] text-tk-ink hover:border-tk-accent aria-pressed:bg-tk-brand aria-pressed:text-tk-surface"
      }
    },
    defaultVariants: {
      variant: "info"
    }
  }
);

export interface ChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof chipVariants> {
  active?: boolean;
}

export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, variant, active = false, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-pressed={variant === "filter" ? active : undefined}
      className={cn(chipVariants({ variant }), className)}
      {...props}
    />
  )
);
Chip.displayName = "Chip";
