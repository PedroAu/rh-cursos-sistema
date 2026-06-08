import { ArrowRight, BarChart3, BriefcaseBusiness, Calculator, ClipboardCheck, Landmark, MessageSquareText, Scale, ShieldCheck, Users } from "lucide-react";
import { Link } from "@/lib/router-compat";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { TrainingPath } from "@/types";

const iconMap = {
  Calculator,
  ShieldCheck,
  Landmark,
  Scale,
  Users,
  MessageSquareText,
  ClipboardCheck,
  BarChart3,
  BriefcaseBusiness
};

export function TrainingPathCard({ path }: { path: TrainingPath }) {
  const Icon = iconMap[path.icon as keyof typeof iconMap] ?? BriefcaseBusiness;

  return (
    <Card className="h-full border-outline-variant bg-white/95 hover:-translate-y-1 hover:border-accent hover:shadow-card">
      <CardContent className="space-y-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="rounded-lg bg-secondary/70 p-3 text-primary" aria-hidden="true">
            <Icon className="h-5 w-5" />
          </div>
          <span className="rounded bg-accent px-3 py-1.5 text-badge font-semibold uppercase tracking-[0.12em] text-white">
            {path.courseCount} cursos
          </span>
        </div>
        <div className="space-y-3">
          <h3 className="text-article font-bold">{path.name}</h3>
          <p className="text-sm leading-7 text-muted-foreground">{path.description}</p>
        </div>
        <Button asChild variant="outline">
          <Link to={`/cursos?path=${path.id}`}>
            Ver cursos da trilha
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
