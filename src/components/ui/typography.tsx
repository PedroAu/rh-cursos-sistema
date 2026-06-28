import type * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const typographyVariants = cva("", {
  variants: {
    variant: {
      "display-hero": "font-display text-display-hero font-bold leading-tight text-text-primary",
      "display-large": "font-display text-display-large font-bold leading-tight text-text-primary",
      "section-heading": "font-display text-section-heading font-bold leading-snug text-text-primary",
      "subheading-large": "font-serif text-subheading-large font-light leading-relaxed text-text-primary",
      "subheading": "font-serif text-subheading font-normal leading-relaxed text-text-primary",
      "body-large": "font-sans text-body-large font-normal leading-relaxed text-text-primary",
      "body": "font-sans text-body font-normal leading-relaxed text-text-primary",
      "body-small": "font-sans text-body-small font-normal leading-relaxed text-text-secondary",
      "button": "font-sans text-button font-medium leading-snug text-text-primary",
      "link": "font-sans text-link font-medium leading-snug text-bright-blue hover:text-bright-blue-dark",
      "caption": "font-sans text-caption font-normal leading-snug text-text-secondary",
      "caption-small": "font-sans text-caption-small font-normal leading-snug text-text-secondary"
    }
  },
  defaultVariants: {
    variant: "body"
  }
});

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: React.ElementType;
}

export function Typography({
  as: Component = "p",
  variant = "body",
  className,
  ...props
}: TypographyProps) {
  return (
    <Component
      className={cn(typographyVariants({ variant }), className)}
      {...props}
    />
  );
}

// Convenience components
export function H1({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h1 className={cn("font-display text-display-hero font-bold leading-tight text-text-primary", className)} {...props} />;
}

export function H2({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("font-display text-display-large font-bold leading-tight text-text-primary", className)} {...props} />;
}

export function H3({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-display text-section-heading font-bold leading-snug text-text-primary", className)} {...props} />;
}

export function H4({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h4 className={cn("font-serif text-subheading-large font-light leading-relaxed text-text-primary", className)} {...props} />;
}

export function P({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("font-sans text-body font-normal leading-relaxed text-text-primary", className)} {...props} />;
}

export function Span({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("font-sans text-body font-normal text-text-primary", className)} {...props} />;
}

export function Caption({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <small className={cn("font-sans text-caption font-normal leading-snug text-text-secondary", className)} {...props} />;
}
