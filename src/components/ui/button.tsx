import * as React from "react";
import { Loader2 } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--ea-button-radius)] text-sm font-semibold transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ea-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--ea-button-primary-bg)] text-[var(--ea-button-primary-fg)] shadow-soft hover:-translate-y-0.5 hover:bg-[var(--ea-button-primary-hover)]",
        secondary:
          "border border-[var(--ea-button-secondary-border)] bg-[var(--ea-button-secondary-bg)] text-[var(--ea-button-secondary-fg)] shadow-soft hover:-translate-y-0.5 hover:bg-[var(--ea-button-secondary-hover)]",
        outline:
          "border border-[var(--ea-button-ghost-border)] bg-[var(--ea-button-ghost-bg)] text-[var(--ea-button-ghost-fg)] hover:-translate-y-0.5 hover:bg-[var(--ea-button-ghost-hover-bg)]",
        ghost: "text-[var(--ea-button-ghost-fg)] hover:bg-[var(--ea-button-ghost-hover-bg)]",
        tertiary:
          "!h-auto !min-h-0 !rounded-none !px-0 !py-0 text-[var(--ea-button-ghost-fg)] underline-offset-4 shadow-none hover:underline focus-visible:ring-offset-4",
        success: "bg-success text-white hover:-translate-y-0.5 hover:bg-success/90",
        danger: "bg-danger text-white hover:bg-danger/90"
      },
      size: {
        default: "h-12 px-6",
        sm: "h-11 px-4 text-xs",
        lg: "h-14 px-8 text-base",
        icon: "h-11 w-11"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, variant, size, asChild = false, disabled, loading = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || loading;
    const content = asChild ? (
      children
    ) : (
      <>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        {children}
      </>
    );

    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        aria-busy={loading || undefined}
        disabled={isDisabled}
        data-loading={loading ? "true" : undefined}
        {...props}
      >
        {content}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
