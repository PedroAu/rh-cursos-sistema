import type { Course, DashboardMetric, Enrollment, Lead, Student, TrainingClass } from "@/types";

type DashboardMetricInput = {
  courses: Course[];
  classes: TrainingClass[];
  students: Student[];
  leads: Lead[];
  enrollments: Enrollment[];
};

function getConfirmedEnrollments(enrollments: Enrollment[]) {
  return enrollments.filter((item) => item.status === "Confirmada" || item.status === "Concluída");
}

export function buildDashboardMetrics({
  courses,
  classes,
  students,
  leads,
  enrollments
}: DashboardMetricInput): DashboardMetric[] {
  const confirmedEnrollments = getConfirmedEnrollments(enrollments);

  const totalRevenue = confirmedEnrollments.reduce((sum, enrollment) => {
    const course = courses.find((item) => item.id === enrollment.courseId);
    return sum + (course?.price ?? 0);
  }, 0);

  const conversionRate = leads.length > 0
    ? ((confirmedEnrollments.length / leads.length) * 100).toFixed(1)
    : "0,0";

  const topCoursesCount = Object.values(
    enrollments.reduce<Record<string, number>>((acc, enrollment) => {
      acc[enrollment.courseId] = (acc[enrollment.courseId] ?? 0) + 1;
      return acc;
    }, {})
  ).filter((count) => count >= 3).length;

  const revenueFormatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0
  }).format(totalRevenue);

  return [
    { label: "Total de cursos", value: courses.length, helper: "Cursos ativos no catálogo." },
    { label: "Total de turmas", value: classes.length, helper: "Turmas cadastradas na plataforma." },
    { label: "Total de alunos", value: students.length, helper: "Alunos com pelo menos uma inscrição." },
    { label: "Leads", value: leads.length, helper: "Contatos no funil comercial." },
    {
      label: "Inscrições confirmadas",
      value: confirmedEnrollments.length,
      helper: "Inscrições com status Confirmada ou Concluída."
    },
    { label: "Receita total", value: revenueFormatted, helper: "Soma dos preços das inscrições confirmadas." },
    { label: "Taxa de conversão", value: `${conversionRate}%`, helper: "Inscrições confirmadas ÷ leads totais." },
    { label: "Cursos populares", value: topCoursesCount || courses.length, helper: "Cursos com 3 ou mais inscrições." }
  ];
}

export type ChartSummaryItem = {
  label: string;
  value: string | number;
};

export function buildChartSummaryItems(items: Array<{ name: string; value: number }>): ChartSummaryItem[] {
  return items.map((item) => ({ label: item.name, value: item.value }));
}

export function buildRevenueSummaryItems(items: Array<{ month: string; value: number }>): ChartSummaryItem[] {
  return items.map((item) => ({
    label: item.month,
    value: new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(item.value),
  }));
}
