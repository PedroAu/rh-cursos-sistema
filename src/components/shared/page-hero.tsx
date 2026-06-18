import type { ReactNode } from "react";
import { ArrowUpRight, BadgeCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type PageHeroPanelItem = {
  title: string;
  text: string;
  icon?: ReactNode;
};

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  meta?: string[];
  align?: "left" | "center";
  showPanel?: boolean;
  panelEyebrow?: string;
  panelTitle?: string;
  panelDescription?: string;
  panelItems?: PageHeroPanelItem[];
};

export function PageHero({
  eyebrow,
  title,
  description,
  meta = [],
  align = "left",
  showPanel = true,
  panelEyebrow = "Visão executiva",
  panelTitle,
  panelDescription = "Leitura rápida dos principais pontos desta página.",
  panelItems,
}: PageHeroProps) {
  const isCentered = align === "center";
  const fallbackPanelItems: PageHeroPanelItem[] = (meta.length > 0 ? meta : ["Curadoria aplicada", "Operação estruturada"])
    .slice(0, 4)
    .map((item) => ({ title: item, text: "" }));
  const resolvedPanelItems = panelItems ?? fallbackPanelItems;

  return (
    <section className="overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(212,160,23,0.26),transparent_20%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_22%),linear-gradient(135deg,#0A2E45_0%,#0F4363_45%,#1D6B8D_100%)] text-white">
      <div className="mx-auto w-full max-w-page px-6 py-16 md:py-24 xl:py-32">
        <div
          className={cn(
            "grid items-center gap-8 xl:gap-14",
            showPanel ? "xl:grid-cols-[1.35fr_1fr]" : "xl:grid-cols-[minmax(0,1fr)]",
            isCentered && "justify-items-center",
          )}
        >
          <div
            className={cn(
              "space-y-6",
              isCentered ? "mx-auto max-w-content-lg text-center" : "max-w-content-lg",
            )}
          >
            <Badge className="w-fit bg-brand-gold text-brand-navy-900" variant="gold">
              {eyebrow}
            </Badge>
            <h1
              className={cn(
                "text-balance font-heading text-4xl font-bold leading-tight md:text-5xl xl:text-6xl",
                isCentered && "mx-auto max-w-content-lg",
              )}
            >
              {title}
            </h1>
            <p
              className={cn(
                "max-w-content text-lg leading-8 text-white/85",
                isCentered && "mx-auto",
              )}
            >
              {description}
            </p>
            {meta.length > 0 ? (
              <div className={cn("flex flex-wrap gap-2 pt-2", isCentered && "justify-center")}>
                {meta.map((item) => (
                  <span
                    className="rounded-full border border-white/25 bg-white/15 px-4 py-2 text-sm font-bold text-white"
                    key={item}
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {showPanel ? (
            <Card className="relative overflow-hidden border-white/25 bg-white/10 text-white shadow-2xl backdrop-blur">
              <div className="absolute inset-x-0 top-0 h-1 bg-brand-gold" />
              <CardContent className="space-y-6 p-6 md:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-extrabold uppercase tracking-[0.08em] text-brand-gold">
                      {panelEyebrow}
                    </p>
                    {panelTitle ? (
                      <h2 className="mt-2 text-balance font-heading text-2xl font-bold text-white">
                        {panelTitle}
                      </h2>
                    ) : null}
                    <p className="mt-2 text-sm leading-7 text-white/90">{panelDescription}</p>
                  </div>
                  <div className="flex size-13 shrink-0 items-center justify-center rounded-full bg-brand-gold/20 text-brand-gold">
                    <BadgeCheck className="size-7" aria-hidden="true" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {resolvedPanelItems.map((item) => (
                    <div
                      className="rounded-lg border border-white/20 bg-white/10 p-4"
                      key={item.title}
                    >
                      <div className="mb-3 flex size-9 items-center justify-center rounded-full bg-white text-brand-navy-700">
                        {item.icon ?? <ArrowUpRight className="size-5" aria-hidden="true" />}
                      </div>
                      <p className="font-extrabold leading-snug">{item.title}</p>
                      {item.text ? (
                        <p className="mt-2 text-sm leading-6 text-white/80">{item.text}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </section>
  );
}
