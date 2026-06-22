import * as React from "react";
import { Loader2 } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--mantine-radius-md)] text-sm font-semibold transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-primary)] text-[var(--mantine-color-white)] shadow-soft hover:-translate-y-0.5 hover:bg-[var(--color-primary-hover)]",
        secondary:
          "border border-[var(--form-input-border)] bg-[var(--form-input-bg)] text-[var(--form-input-color)] shadow-soft hover:-translate-y-0.5 hover:bg-tertiary-0",
        outline:
          "border border-[var(--form-input-border)] bg-[var(--form-input-bg)] text-[var(--color-primary)] hover:-translate-y-0.5 hover:bg-primary-0",
        ghost: "text-[var(--color-primary)] hover:bg-primary-0",
        tertiary:
          "!h-auto !min-h-0 !rounded-none !px-0 !py-0 text-[var(--color-primary)] underline-offset-4 shadow-none hover:underline focus-visible:ring-offset-4",
        success: "bg-[var(--color-status-success)] text-white hover:-translate-y-0.5 hover:opacity-90",
        danger: "bg-[var(--color-status-error)] text-white hover:opacity-90"
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
