import type * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva("border border-tk-line bg-tk-surface text-tk-ink transition duration-200 ease-[var(--tk-ease)]", {
  variants: {
    variant: {
      base: "rounded-tk-card p-8 shadow-tk-card",
      glass: "rounded-tk-glass p-5 shadow-tk-glass",
      elevated: "rounded-tk-card p-8 shadow-tk-card",
      outlined: "rounded-tk-card p-8 shadow-none",
      filled: "rounded-tk-card border-transparent bg-tk-surface-2 p-8 shadow-tk-card"
    },
    interactive: {
      true: "cursor-pointer hover:-translate-y-0.5",
      false: ""
    },
    size: {
      sm: "p-4",
      md: "",
      lg: "p-8"
    }
  },
  defaultVariants: {
    variant: "base",
    interactive: false,
    size: "md"
  }
});

type CardProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof cardVariants> & {
    accent?: "none" | "top";
  };

export function Card({ accent = "none", className, variant, interactive, size, ...props }: CardProps) {
  return (
    <div
      className={cn(cardVariants({ variant, interactive, size }), className)}
      data-accent={accent === "top" ? "top" : undefined}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-2", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-tk-display text-section-heading font-bold leading-tight text-tk-ink", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm leading-6 text-tk-ink-muted", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-5", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-6 flex items-center gap-3", className)} {...props} />;
}
