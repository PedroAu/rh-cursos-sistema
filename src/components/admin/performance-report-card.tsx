import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PerformanceStat } from "@/features/admin/dashboard/model/dashboard-activity";

export function PerformanceReportCard({ stats }: { stats: PerformanceStat[] }) {
  return (
    <Card accent="top">
      <CardHeader>
        <CardTitle>Relatório de performance</CardTitle>
        <CardDescription>
          Indicadores do funil derivados das inscrições e leads cadastrados, com valores e rótulos explícitos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-surface-muted/40 p-4">
              <dt className="text-label font-bold uppercase tracking-[0.14em] text-muted-foreground">{stat.label}</dt>
              <dd className="mt-1 text-2xl font-semibold text-foreground">{stat.value}</dd>
              <p className="mt-1 text-xs leading-5 text-label-secondary">{stat.helper}</p>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
