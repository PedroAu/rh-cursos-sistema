import type * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva("bg-surface-white border border-surface-neutral overflow-hidden transition-shadow", {
  variants: {
    variant: {
      base: "rounded-card shadow-standard",
      elevated: "rounded-card shadow-standard hover:shadow-ambient",
      outlined: "rounded-card border-2 shadow-none",
      glass: "rounded-glass shadow-ambient",
      filled: "rounded-card bg-surface-light border-none shadow-standard"
    },
    interactive: {
      true: "cursor-pointer hover:-translate-y-1 transition-transform",
      false: ""
    },
    size: {
      sm: "p-3",
      md: "p-6",
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

export function Card({
  accent = "none",
  className,
  variant = "base",
  interactive = false,
  size = "md",
  ...props
}: CardProps) {
  return (
    <div
      className={cn(cardVariants({ variant, interactive, size }), className)}
      data-accent={accent === "top" ? "top" : undefined}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-2 p-6", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-display text-article font-bold leading-tight text-foreground", className)} {...props} />;
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm leading-7 text-label-secondary", className)} {...props} />;
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center gap-3 p-6 pt-0", className)} {...props} />;
}
