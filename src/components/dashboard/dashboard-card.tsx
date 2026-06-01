import { Card, CardContent } from "@/components/ui/card";

type DashboardCardProps = {
  label: string;
  value: string | number;
  helper: string;
};

export function DashboardCard({ label, value, helper }: DashboardCardProps) {
  return (
    <Card>
      <CardContent className="space-y-3 p-6">
        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
        <div className="text-3xl font-semibold">{value}</div>
        <p className="text-sm leading-6 text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}
