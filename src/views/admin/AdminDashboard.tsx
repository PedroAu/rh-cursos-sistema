import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { ChartCard } from "@/components/admin/chart-card";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { useAppStore, useDashboardCharts } from "@/lib/app-store";

export function AdminDashboardPage() {
  const { courses, classes, students, leads, enrollments } = useAppStore();
  const charts = useDashboardCharts();

  const confirmedEnrollments = enrollments.filter((e) => e.status === "Confirmada" || e.status === "Concluída");

  const totalRevenue = confirmedEnrollments.reduce((sum, enrollment) => {
    const course = courses.find((c) => c.id === enrollment.courseId);
    return sum + (course?.price ?? 0);
  }, 0);

  const conversionRate = leads.length > 0
    ? ((confirmedEnrollments.length / leads.length) * 100).toFixed(1)
    : "0,0";

  const topCoursesCount = Object.values(
    enrollments.reduce<Record<string, number>>((acc, e) => {
      acc[e.courseId] = (acc[e.courseId] ?? 0) + 1;
      return acc;
    }, {})
  ).filter((count) => count >= 3).length;

  const revenueFormatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0
  }).format(totalRevenue);

  return (
    <section className="page-section">
      <div className="container space-y-8">
        <div className="space-y-2">
          <span className="eyebrow">Dashboard admin</span>
          <h1 className="text-4xl font-semibold">Visão geral da operação</h1>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <DashboardCard label="Total de cursos" value={courses.length} helper="Cursos ativos no catálogo." />
          <DashboardCard label="Total de turmas" value={classes.length} helper="Turmas cadastradas na plataforma." />
          <DashboardCard label="Total de alunos" value={students.length} helper="Alunos com pelo menos uma inscrição." />
          <DashboardCard label="Leads" value={leads.length} helper="Contatos no funil comercial." />
          <DashboardCard label="Inscrições confirmadas" value={confirmedEnrollments.length} helper="Inscrições com status Confirmada ou Concluída." />
          <DashboardCard label="Receita total" value={revenueFormatted} helper="Soma dos preços das inscrições confirmadas." />
          <DashboardCard label="Taxa de conversão" value={`${conversionRate}%`} helper="Inscrições confirmadas ÷ leads totais." />
          <DashboardCard label="Cursos populares" value={topCoursesCount || courses.length} helper="Cursos com 3 ou mais inscrições." />
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <ChartCard title="Leads por status">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.leadsByStatus}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#123f7a" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Inscrições por trilha">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.enrollmentsByPath}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-12} textAnchor="end" height={70} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3ea76a" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Receita por mês">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.revenueByMonth}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value)} />
                <Bar dataKey="value" fill="#74a7e6" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Turmas por modalidade">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={charts.classesByModality} dataKey="value" nameKey="name" outerRadius={110} fill="#123f7a" />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </section>
  );
}
