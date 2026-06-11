import type { LucideIcon } from "lucide-react";
import { Mail, ReceiptText, UserPlus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeTime, type DashboardActivity } from "@/features/admin/dashboard/model/dashboard-activity";

const iconByKind: Record<DashboardActivity["kind"], LucideIcon> = {
  enrollment: UserPlus,
  payment: ReceiptText,
  lead: Mail
};

export function RecentActivitiesCard({ activities }: { activities: DashboardActivity[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividades recentes</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm leading-6 text-label-secondary">Nenhuma atividade registrada até o momento.</p>
        ) : (
          <ul className="space-y-5">
            {activities.map((activity) => {
              const Icon = iconByKind[activity.kind];
              return (
                <li key={activity.id} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/8 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-semibold text-foreground">{activity.title}</p>
                    <p className="text-sm leading-6 text-label-secondary">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{formatRelativeTime(new Date(activity.timestamp).toISOString())}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
