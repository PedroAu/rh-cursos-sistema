import type * as React from "react";

import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  accent?: "none" | "top";
};

export function Card({
  accent = "none",
  className,
  ...props
}: CardProps) {
  return <div className={cn("surface-card", className)} data-accent={accent === "top" ? "top" : undefined} {...props} />;
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
