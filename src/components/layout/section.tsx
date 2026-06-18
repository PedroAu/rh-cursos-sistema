import { cn } from "@/lib/utils";
import type { ElementType, ReactNode } from "react";

type SectionSize = "sm" | "md" | "lg";

const sizePadding: Record<SectionSize, string> = {
  sm: "py-8 md:py-12 xl:py-16",
  md: "py-12 md:py-16 xl:py-24",
  lg: "py-16 md:py-24 xl:py-32",
};

type SectionProps = {
  size?: SectionSize;
  as?: ElementType;
  className?: string;
  children: ReactNode;
};

export function Section({ size = "md", as: Tag = "section", className, children }: SectionProps) {
  return <Tag className={cn(sizePadding[size], className)}>{children}</Tag>;
}
