import { cn } from "@/lib/utils";
import type { ElementType, ReactNode } from "react";

type ContainerVariant = "page" | "admin" | "wide" | "prose-lg" | "prose" | "prose-sm";

// As variantes "prose*" mapeiam para classes `max-w-content-*` (não `max-w-prose`),
// porque o Tailwind v4 já reserva `max-w-prose` (65ch) nativamente. Ver globals.css.
const variantMaxWidth: Record<ContainerVariant, string> = {
  page: "max-w-page",
  admin: "max-w-admin",
  wide: "max-w-wide",
  "prose-lg": "max-w-content-lg",
  prose: "max-w-content",
  "prose-sm": "max-w-content-sm",
};

type ContainerProps = {
  variant?: ContainerVariant;
  as?: ElementType;
  // `padded` controla o gutter horizontal (px-6). Default true para páginas que
  // não têm layout provendo padding (marketing). Admin usa false porque o
  // <main> do AdminShell já aplica p-4 md:p-6 xl:p-8.
  padded?: boolean;
  className?: string;
  children: ReactNode;
};

export function Container({ variant = "page", as: Tag = "div", padded = true, className, children }: ContainerProps) {
  return (
    <Tag className={cn("mx-auto w-full", padded && "px-6", variantMaxWidth[variant], className)}>
      {children}
    </Tag>
  );
}
