import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DashboardCardProps = {
  label: string;
  value: string | number;
  helper: string;
  icon?: LucideIcon;
  trend?: "up" | "down";
};

export function DashboardCard({ label, value, helper, icon: Icon, trend }: DashboardCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : null;

  return (
    <Card>
      <CardContent className="space-y-3 p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="text-label font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
          {Icon ? (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/8 text-primary">
              <Icon className="size-5" aria-hidden="true" />
            </span>
          ) : null}
        </div>
        <div className="text-3xl font-semibold">{value}</div>
        <p className="flex items-center gap-1.5 text-sm leading-6 text-muted-foreground">
          {TrendIcon ? (
            <TrendIcon
              className={cn("size-4 shrink-0", trend === "up" ? "text-success" : "text-danger")}
              aria-hidden="true"
            />
          ) : null}
          {helper}
        </p>
      </CardContent>
    </Card>
  );
}
