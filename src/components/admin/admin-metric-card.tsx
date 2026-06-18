import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AdminMetricCardProps = {
  icon: ReactNode;
  label: string;
  value: string | number;
  tone?: "navy" | "gold";
  detail?: string;
  negative?: boolean;
};

export function AdminMetricCard({
  icon,
  label,
  value,
  tone = "navy",
  detail,
  negative = false,
}: AdminMetricCardProps) {
  return (
    <Card className="min-h-42">
      <CardContent className="p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
            {label}
          </p>
          <div
            className={cn(
              "flex size-11 items-center justify-center rounded-md",
              tone === "gold"
                ? "bg-brand-gold/15 text-brand-navy-900"
                : "bg-brand-navy-50 text-brand-navy-700",
            )}
          >
            {icon}
          </div>
        </div>
        <h2 className="font-heading text-4xl font-bold leading-none text-foreground">{value}</h2>
        {detail ? (
          <p className={cn("mt-3 text-sm font-bold", negative ? "text-destructive" : "text-emerald-700")}>
            {detail}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
