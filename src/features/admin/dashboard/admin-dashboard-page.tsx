"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { BookOpen, type LucideIcon, TrendingUp, Users, Wallet } from "lucide-react";

import {
  buildChartSummaryItems,
  buildDashboardMetrics,
  buildRevenueSummaryItems,
} from "@/features/admin/dashboard/model/dashboard-metrics";
import {
  buildPerformanceStats,
  buildRecentActivities,
} from "@/features/admin/dashboard/model/dashboard-activity";
import { ChartCard } from "@/components/admin/chart-card";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { PerformanceReportCard } from "@/components/admin/performance-report-card";
import { RecentActivitiesCard } from "@/components/admin/recent-activities-card";
import { useAppStore, useDashboardCharts } from "@/lib/app-store";

const metricIcons: Record<string, { icon: LucideIcon; trend?: "up" | "down" }> = {
  "Total de cursos": { icon: BookOpen },
  "Total de turmas": { icon: TrendingUp, trend: "up" },
  "Total de alunos": { icon: Users, trend: "up" },
  "Receita total": { icon: Wallet, trend: "up" },
};

export function AdminDashboardPage() {
  const { courses, classes, students, leads, enrollments } = useAppStore();
  const charts = useDashboardCharts();
  const metrics = buildDashboardMetrics({ courses, classes, students, leads, enrollments });
  const activities = buildRecentActivities({ enrollments, leads, courses });
  const performanceStats = buildPerformanceStats({ enrollments, leads });

  const chartSummaryClassName = "space-y-2 text-sm leading-6 text-label-secondary";

  const renderSummaryList = (
    items: Array<{ label: string; value: number | string }>,
    emptyMessage: string
  ) => {
    if (items.length === 0) {
      return <p className="text-sm leading-6 text-label-secondary">{emptyMessage}</p>;
    }

    return (
      <ul className={chartSummaryClassName}>
        {items.map((item) => (
          <li key={item.label} className="flex items-start justify-between gap-4">
            <span className="font-medium text-foreground">{item.label}</span>
            <span>{item.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <section className="page-section">
      <div className="container space-y-8">
        <div className="space-y-2">
          <span className="eyebrow">Dashboard admin</span>
          <h1 className="text-4xl font-semibold">Visão geral da operação</h1>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => {
            const decoration = metricIcons[metric.label];
            return (
              <DashboardCard
                key={metric.label}
                label={metric.label}
                value={metric.value}
                helper={metric.helper}
                icon={decoration?.icon}
                trend={decoration?.trend}
              />
            );
          })}
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <RecentActivitiesCard activities={activities} />
          </div>
          <PerformanceReportCard stats={performanceStats} />
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <ChartCard
            title="Leads por status"
            description="Mostra a distribuição atual do funil com valores visíveis por barra e resumo textual."
            summary={renderSummaryList(
              buildChartSummaryItems(charts.leadsByStatus),
              "Nenhum lead registrado até o momento."
            )}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.leadsByStatus}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#123f7a" radius={[10, 10, 0, 0]}>
                  <LabelList dataKey="value" position="top" className="fill-foreground text-xs font-semibold" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard
            title="Inscrições por trilha"
            description="Facilita comparar volume entre trilhas sem depender apenas de cor ou tooltip."
            summary={renderSummaryList(
              buildChartSummaryItems(charts.enrollmentsByPath),
              "Nenhuma inscrição registrada nas trilhas."
            )}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.enrollmentsByPath}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-12} textAnchor="end" height={70} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3ea76a" radius={[10, 10, 0, 0]}>
                  <LabelList dataKey="value" position="top" className="fill-foreground text-xs font-semibold" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard
            title="Receita por mês"
            description="Apresenta tendência mensal com valores formatados em real no gráfico e no resumo textual."
            summary={renderSummaryList(
              buildRevenueSummaryItems(charts.revenueByMonth),
              "Sem receita confirmada registrada."
            )}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.revenueByMonth}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value)} />
                <Bar dataKey="value" fill="#74a7e6" radius={[10, 10, 0, 0]}>
                  <LabelList
                    dataKey="value"
                    position="top"
                    formatter={(value: number) =>
                      new Intl.NumberFormat("pt-BR", {
                        notation: "compact",
                        compactDisplay: "short",
                        maximumFractionDigits: 1,
                      }).format(value)
                    }
                    className="fill-foreground text-xs font-semibold"
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard
            title="Turmas por modalidade"
            description="A modalidade aparece como eixo rotulado, com contagem por barra e resumo textual abaixo."
            summary={renderSummaryList(
              buildChartSummaryItems(charts.classesByModality),
              "Nenhuma turma cadastrada nas modalidades."
            )}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.classesByModality} layout="vertical" margin={{ left: 16, right: 16 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#123f7a" radius={[0, 10, 10, 0]}>
                  <LabelList dataKey="value" position="right" className="fill-foreground text-xs font-semibold" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </section>
  );
}
