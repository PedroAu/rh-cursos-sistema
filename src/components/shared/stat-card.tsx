import { TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type StatCardProps = {
  value: string;
  label: string;
};

export function StatCard({ value, label }: StatCardProps) {
  return (
    <Card className="min-h-42">
      <CardContent className="space-y-3 p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-heading text-3xl font-bold leading-none text-foreground">{value}</h2>
          <TrendingUp className="size-5 text-brand-navy-600" aria-hidden="true" />
        </div>
        <p className="text-sm font-bold uppercase tracking-[0.05em] text-muted-foreground">
          {label}
        </p>
      </CardContent>
    </Card>
  );
}
