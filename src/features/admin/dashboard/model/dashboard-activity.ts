import type { Course, Enrollment, Lead } from "@/types";

export type ActivityKind = "enrollment" | "lead" | "payment";

export type DashboardActivity = {
  id: string;
  kind: ActivityKind;
  title: string;
  description: string;
  timestamp: number;
};

const dateFormatter = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

/**
 * Converte um ISO timestamp em rótulo relativo ("há 2 horas") usando a data
 * de referência informada (default: agora). Mantido determinístico para testes.
 */
export function formatRelativeTime(iso: string, now: number = Date.now()): string {
  const value = new Date(iso).getTime();

  if (Number.isNaN(value)) {
    return "data indisponível";
  }

  const diffSeconds = Math.round((value - now) / 1000);
  const absSeconds = Math.abs(diffSeconds);

  if (absSeconds < 60) {
    return dateFormatter.format(Math.round(diffSeconds / 1), "second");
  }
  if (absSeconds < 3600) {
    return dateFormatter.format(Math.round(diffSeconds / 60), "minute");
  }
  if (absSeconds < 86400) {
    return dateFormatter.format(Math.round(diffSeconds / 3600), "hour");
  }
  return dateFormatter.format(Math.round(diffSeconds / 86400), "day");
}

type ActivityInput = {
  enrollments: Enrollment[];
  leads: Lead[];
  courses: Course[];
};

/**
 * Deriva o feed de atividades recentes a partir dos dados reais do store,
 * combinando inscrições, pagamentos confirmados e novos leads, ordenados do
 * mais recente para o mais antigo.
 */
export function buildRecentActivities({ enrollments, leads, courses }: ActivityInput, limit = 4): DashboardActivity[] {
  const courseName = (courseId: string) => courses.find((course) => course.id === courseId)?.title ?? "curso";

  const enrollmentActivities: DashboardActivity[] = enrollments.map((enrollment) => {
    const isPaid = enrollment.status === "Confirmada" || enrollment.status === "Concluída";
    return {
      id: `enr-${enrollment.id}`,
      kind: isPaid ? "payment" : "enrollment",
      title: isPaid ? "Pagamento aprovado" : "Nova inscrição",
      description: isPaid
        ? `${enrollment.studentName} confirmou a inscrição em ${courseName(enrollment.courseId)}.`
        : `${enrollment.studentName} se inscreveu em ${courseName(enrollment.courseId)}.`,
      timestamp: new Date(enrollment.createdAt).getTime()
    };
  });

  const leadActivities: DashboardActivity[] = leads.map((lead) => ({
    id: `lead-${lead.id}`,
    kind: "lead",
    title: "Novo lead",
    description: `${lead.organization ?? lead.name} demonstrou interesse em ${lead.courseInterest}.`,
    timestamp: new Date(lead.createdAt).getTime()
  }));

  return [...enrollmentActivities, ...leadActivities]
    .filter((activity) => !Number.isNaN(activity.timestamp))
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

export type PerformanceStat = {
  label: string;
  value: string;
  helper: string;
};

type PerformanceInput = {
  enrollments: Enrollment[];
  leads: Lead[];
};

/**
 * Calcula os indicadores de performance do card lateral a partir de proporções
 * reais do funil (retenção, conclusão, conversão), sem números fictícios.
 */
export function buildPerformanceStats({ enrollments, leads }: PerformanceInput): PerformanceStat[] {
  const total = enrollments.length;
  const completed = enrollments.filter((item) => item.status === "Concluída").length;
  const confirmed = enrollments.filter(
    (item) => item.status === "Confirmada" || item.status === "Concluída"
  ).length;
  const converted = leads.filter((lead) => lead.status === "Convertido").length;

  const pct = (numerator: number, denominator: number) =>
    denominator > 0 ? `${Math.round((numerator / denominator) * 100)}%` : "—";

  return [
    {
      label: "Conclusão",
      value: pct(completed, total),
      helper: "Inscrições concluídas sobre o total."
    },
    {
      label: "Confirmação",
      value: pct(confirmed, total),
      helper: "Inscrições confirmadas ou concluídas."
    },
    {
      label: "Conversão",
      value: pct(converted, leads.length),
      helper: "Leads convertidos sobre o total de leads."
    },
    {
      label: "Inscrições",
      value: String(total),
      helper: "Volume total de inscrições registradas."
    }
  ];
}
