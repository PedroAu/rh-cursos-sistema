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

import { buildDashboardMetrics } from "@/features/admin/dashboard/model/dashboard-metrics";
import { ChartCard } from "@/components/admin/chart-card";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { useAppStore, useDashboardCharts } from "@/lib/app-store";

export function AdminDashboardPage() {
  const { courses, classes, students, leads, enrollments } = useAppStore();
  const charts = useDashboardCharts();
  const metrics = buildDashboardMetrics({ courses, classes, students, leads, enrollments });

  return (
    <section className="page-section">
      <div className="container space-y-8">
        <div className="space-y-2">
          <span className="eyebrow">Dashboard admin</span>
          <h1 className="text-4xl font-semibold">Visão geral da operação</h1>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <DashboardCard key={metric.label} label={metric.label} value={metric.value} helper={metric.helper} />
          ))}
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
