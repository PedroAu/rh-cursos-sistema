import {
  BriefcaseBusiness,
  Landmark,
  ShieldCheck,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { cn } from "@/lib/utils";

type FeatureItem = {
  title: string;
  text: string;
};

const icons = [ShieldCheck, Landmark, BriefcaseBusiness];

type FeatureCardsSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  items: FeatureItem[];
};

export function FeatureCardsSection({
  eyebrow,
  title,
  description,
  items,
}: FeatureCardsSectionProps) {
  return (
    <section className="bg-gradient-to-b from-slate-50 to-slate-100 py-16 md:py-24 xl:py-32">
      <div className="mx-auto w-full max-w-page px-6">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          align="center"
        />

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-8">
          {items.map((item, index) => {
            const Icon = icons[index % icons.length];

            return (
              <Card
                className={cn(
                  "min-h-75",
                  index === 1
                    ? "bg-gradient-to-b from-amber-50 to-white"
                    : "bg-gradient-to-b from-sky-50/70 to-white",
                )}
                key={item.title}
              >
                <CardContent className="flex h-full flex-col gap-5 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className={cn(
                        "flex size-12 items-center justify-center rounded-md",
                        index === 1
                          ? "bg-brand-gold/20 text-brand-navy-900"
                          : "bg-brand-navy-50 text-brand-navy-700",
                      )}
                    >
                      <Icon className="size-6" aria-hidden="true" />
                    </div>
                    <span className="text-sm font-bold text-muted-foreground">0{index + 1}</span>
                  </div>
                  <h3 className="text-lg font-bold leading-snug text-foreground">{item.title}</h3>
                  <p className="leading-7 text-muted-foreground">{item.text}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
