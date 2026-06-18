import type { ReactNode } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type LegacyButtonVariant = ButtonProps["variant"] | "white" | "filled" | "subtle" | "light";

type CtaSectionProps = {
  title: string;
  text: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  secondaryColor?: string;
  secondaryVariant?: LegacyButtonVariant;
  secondaryLeftSection?: ReactNode;
  secondaryExternal?: boolean;
};

function resolveSecondaryVariant(variant: LegacyButtonVariant | undefined): ButtonProps["variant"] {
  if (variant === "filled") return "default";
  if (variant === "white" || variant === "light" || variant === "subtle") return "secondary";
  return variant ?? "secondary";
}

function resolveSecondaryClassName(color: string | undefined, variant: LegacyButtonVariant | undefined) {
  return color === "green" && variant === "filled" ? "rounded-full" : undefined;
}

function resolveSecondaryButtonVariant(color: string | undefined, variant: LegacyButtonVariant | undefined) {
  if (color === "green" && variant === "filled") {
    return "whatsapp";
  }

  return resolveSecondaryVariant(variant);
}

export function CtaSection({
  title,
  text,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  secondaryColor,
  secondaryVariant = "secondary",
  secondaryLeftSection,
  secondaryExternal = false,
}: CtaSectionProps) {
  return (
    <Card className="overflow-hidden rounded-xl border-0 bg-[radial-gradient(circle_at_top_right,rgba(212,160,23,0.3),transparent_26%),linear-gradient(135deg,var(--color-brand-navy-800)_0%,var(--color-brand-navy-700)_58%,var(--color-brand-navy-500)_100%)] text-white shadow-md">
      <CardContent className="grid gap-8 p-6 md:p-8 xl:grid-cols-[1.3fr_0.7fr] xl:items-center">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex size-11 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
              <Sparkles aria-hidden className="size-5" />
            </span>
            <Badge variant="gold">PRÓXIMO PASSO</Badge>
          </div>
          <div className="max-w-3xl space-y-4">
            <h2 className="font-heading text-3xl font-bold leading-tight md:text-4xl">
              {title}
            </h2>
            <p className="max-w-3xl text-lg leading-8 text-white/85">
              {text}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-white/15 bg-white/10 p-5 backdrop-blur">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-brand-gold-200">
              Acione agora
            </p>
            <Button asChild className="h-auto min-h-12 w-full py-3" size="lg" variant="gold">
              <a href={primaryHref}>
                {primaryLabel}
                <ArrowUpRight aria-hidden className="size-4" />
              </a>
            </Button>
            {secondaryHref && secondaryLabel ? (
              <Button
                asChild
                className={cn(
                  "h-auto min-h-12 w-full whitespace-normal py-3 text-center leading-5",
                  resolveSecondaryClassName(secondaryColor, secondaryVariant),
                )}
                size="lg"
                variant={resolveSecondaryButtonVariant(secondaryColor, secondaryVariant)}
              >
                <a
                  href={secondaryHref}
                  rel={secondaryExternal ? "noopener noreferrer" : undefined}
                  target={secondaryExternal ? "_blank" : undefined}
                >
                  {secondaryLeftSection}
                  {secondaryLabel}
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
