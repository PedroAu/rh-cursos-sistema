import * as React from "react";
import { Loader2 } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-tk-button font-semibold transition-all duration-200 ease-[var(--tk-ease)] active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tk-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-tk-cta text-tk-surface shadow-tk-glass hover:bg-tk-cta-hover",
        secondary: "bg-[var(--tk-black-5)] text-tk-ink hover:bg-[var(--tk-black-8)]",
        ghost: "bg-transparent text-tk-ink hover:bg-[var(--tk-black-5)]",
        outline: "border border-tk-line bg-tk-surface text-tk-ink hover:border-tk-accent hover:bg-tk-accent-soft",
        tertiary: "h-auto min-h-0 rounded-none px-0 py-0 text-tk-accent-strong underline-offset-4 shadow-none hover:underline",
        success: "bg-tk-success text-tk-surface hover:opacity-90",
        danger: "bg-tk-error text-tk-surface hover:opacity-90",
        default: "bg-tk-cta text-tk-surface shadow-tk-glass hover:bg-tk-cta-hover"
      },
      size: {
        sm: "h-8 px-4 text-caption",
        md: "h-11 px-5 text-button",
        lg: "h-[52px] px-8 text-body",
        default: "h-11 px-5 text-button",
        icon: "h-10 w-10 p-0"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
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
