"use client";

import type { ReactNode } from "react";
import { useCallback, useMemo } from "react";
import { ArrowRight, BookOpen, CircleDollarSign, Download, Pencil, TrendingUp, Trash2, UserPlus, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  buildPerformanceStats,
  buildRecentActivities,
  formatRelativeTime,
  type DashboardActivity
} from "@/features/admin/dashboard/model/dashboard-activity";
import { buildDashboardMetrics } from "@/features/admin/dashboard/model/dashboard-metrics";
import { useAppStore } from "@/lib/app-store";
import { useAdminSearch } from "@/lib/hooks/useAdminSearch";
import { useRealTimeMetrics } from "@/lib/hooks/useRealTimeMetrics";
import { Link } from "@/lib/router-compat";
import { exportToCSV } from "@/lib/utils/csv-export";

function pickMetric(
  metrics: ReturnType<typeof buildDashboardMetrics>,
  label: string,
  fallbackValue = "0",
  fallbackHelper = ""
) {
  return metrics.find((metric) => metric.label === label) ?? { label, value: fallbackValue, helper: fallbackHelper };
}

function getActivityIcon(kind: DashboardActivity["kind"]) {
  if (kind === "lead") return UserPlus;
  if (kind === "payment") return CircleDollarSign;
  return BookOpen;
}

function getActivityTone(kind: DashboardActivity["kind"]) {
  if (kind === "lead") return { background: "#fff2dc", color: "#b56d06" };
  if (kind === "payment") return { background: "#e7f5ec", color: "#2d8a4f" };
  return { background: "#eaf3fb", color: "#0b4668" };
}

export function AdminDashboardPage() {
  const appStore = useAppStore();
  const { courses, classes, students, leads, enrollments } = appStore;
  const rtData = useRealTimeMetrics({ courses, classes, students, leads, enrollments });

  const metrics = useMemo(
    () =>
      buildDashboardMetrics({
        courses: rtData.courses,
        classes: rtData.classes,
        students: rtData.students,
        leads: rtData.leads,
        enrollments: rtData.enrollments
      }),
    [rtData.classes, rtData.courses, rtData.enrollments, rtData.leads, rtData.students]
  );

  const activities = useMemo(
    () => buildRecentActivities({ enrollments: rtData.enrollments, leads: rtData.leads, courses: rtData.courses }),
    [rtData.courses, rtData.enrollments, rtData.leads]
  );

  const performanceStats = useMemo(
    () => buildPerformanceStats({ enrollments: rtData.enrollments, leads: rtData.leads }),
    [rtData.enrollments, rtData.leads]
  );

  const { results: searchedCourses, handleSearch, query: searchQuery } = useAdminSearch(
    rtData.courses.slice(0, 100),
    (course, q) => {
      const lowerQ = q.toLowerCase();
      return course.title.toLowerCase().includes(lowerQ) || (course.category?.toLowerCase() ?? "").includes(lowerQ);
    },
    { debounceMs: 300, minChars: 1 }
  );

  const handleExportCourses = useCallback(() => {
    const exportData = rtData.courses.map((course) => ({
      id: course.id,
      title: course.title,
      category: course.category,
      status: course.status,
      price: course.price,
      enrollments: rtData.enrollments.filter((e) => e.courseId === course.id).length
    }));
    exportToCSV(exportData, { filename: `courses-export-${new Date().toISOString().split("T")[0]}.csv` });
  }, [rtData.courses, rtData.enrollments]);

  const kpis = useMemo(
    () => [
      {
        label: "TOTAL DE ALUNOS",
        value: pickMetric(metrics, "Total de alunos").value,
        helper: pickMetric(metrics, "Total de alunos").helper,
        accent: "+12% este mês",
        accentTone: "#2f8b4f",
        icon: Users,
        iconTone: { background: "#edf5fb", color: "#0b4668" }
      },
      {
        label: "CURSOS ATIVOS",
        value: pickMetric(metrics, "Total de cursos").value,
        helper: "Catálogo publicado",
        accent: `${rtData.courses.filter((course) => course.status === "Ativo" || course.status === "Destaque").length} em destaque`,
        accentTone: "#4b5563",
        icon: BookOpen,
        iconTone: { background: "#fff8e2", color: "#8f6a00" }
      },
      {
        label: "VENDAS DO MÊS",
        value: pickMetric(metrics, "Receita total").value,
        helper: "Receita confirmada",
        accent: `${pickMetric(metrics, "Taxa de conversão").value} de conversão`,
        accentTone: "#2f8b4f",
        icon: CircleDollarSign,
        iconTone: { background: "#e8f5ea", color: "#2f8b4f" }
      },
      {
        label: "NOVOS LEADS",
        value: pickMetric(metrics, "Leads").value,
        helper: "Funil comercial",
        accent: `${rtData.leads.filter((lead) => lead.status === "Novo").length} aguardando retorno`,
        accentTone: "#cc4f4f",
        icon: TrendingUp,
        iconTone: { background: "#fff1f1", color: "#d17a00" }
      }
    ],
    [metrics, rtData.courses, rtData.leads]
  );

  const highlightedCourses = useMemo(
    () =>
      (searchQuery ? searchedCourses : rtData.courses).slice(0, 4).map((course) => {
        const courseEnrollments = rtData.enrollments.filter((item) => item.courseId === course.id);
        const category = course.pathName ?? course.category ?? "Geral";
        const isDraft = course.status === "Em breve" || course.status === "Inativo";

        return {
          id: course.id,
          title: course.title,
          category,
          status: isDraft ? "Rascunho" : "Ativo",
          tone: isDraft ? "#d17a00" : "#2f8b4f",
          detail: `ID: #${course.id.replace(/\D/g, "").slice(-4) || course.id.slice(-4)}`,
          students: `${courseEnrollments.length} inscriç${courseEnrollments.length === 1 ? "ão" : "ões"}`
        };
      }),
    [rtData.courses, rtData.enrollments, searchQuery, searchedCourses]
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-[#0b4668]">Visão Geral</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((metric) => {
          const Icon = metric.icon;

          return (
            <Card key={metric.label} className="p-8">
              <CardContent className="mt-0 p-0">
                <div className="flex items-start justify-between gap-4">
                  <p className="max-w-[140px] text-[0.9rem] font-extrabold text-[#303744]">{metric.label}</p>
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ background: metric.iconTone.background, color: metric.iconTone.color }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-10 text-[2.2rem] font-extrabold text-[#101828]">{metric.value}</p>
                <p className="mt-1.5 font-semibold" style={{ color: metric.accentTone }}>{metric.accent}</p>
                <p className="mt-1 text-sm text-[#667085]">{metric.helper}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <h2 className="text-2xl font-bold text-[#0b4668]">Gerenciar Cursos</h2>
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" onClick={handleExportCourses}>
                <Download className="h-4 w-4" />
                Exportar CSV
              </Button>
              <Button type="button" size="sm" variant="outline">
                <Users className="h-4 w-4" />
                Novo Cadastro
              </Button>
            </div>
          </div>

          <Input
            placeholder="Buscar por título ou categoria..."
            value={searchQuery}
            onChange={(event) => handleSearch(event.currentTarget.value)}
          />

          <Card className="overflow-hidden p-0">
            <Table className="min-w-[720px]">
              <TableHeader className="bg-[#f8fafc]">
                <TableRow className="hover:bg-[#f8fafc]">
                  <TableHead>Título</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {highlightedCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <p className="font-bold text-[#111827]">{course.title}</p>
                      <p className="mt-1 text-sm text-[#5f6876]">{course.detail}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="rounded-full">{course.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: course.tone }} />
                          <span className="font-semibold" style={{ color: course.tone }}>{course.status}</span>
                        </div>
                        <p className="text-sm text-[#667085]">{course.students}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <IconAction label={`Editar ${course.title}`}>
                          <Pencil className="h-4 w-4" />
                        </IconAction>
                        <IconAction label={`Excluir ${course.title}`} danger={true}>
                          <Trash2 className="h-4 w-4" />
                        </IconAction>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between gap-4 border-t border-tk-line px-6 py-4">
              <p className="text-sm text-[#5f6876]">Mostrando {highlightedCourses.length} de {courses.length} cursos</p>
              <div className="flex gap-2">
                <IconAction label="Página anterior">
                  <span aria-hidden="true">‹</span>
                </IconAction>
                <IconAction label="Próxima página">
                  <span aria-hidden="true">›</span>
                </IconAction>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-[#0b4668]">Atividades Recentes</h2>
          <Card className="p-6">
            <CardContent className="mt-0 space-y-5 p-0">
              {activities.map((activity) => {
                const Icon = getActivityIcon(activity.kind);
                const tone = getActivityTone(activity.kind);

                return (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                      style={{ background: tone.background, color: tone.color }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="leading-7 text-[#111827]">{activity.description}</p>
                      <p className="mt-1 text-sm text-[#5f6876]">
                        {formatRelativeTime(new Date(activity.timestamp).toISOString())}
                      </p>
                    </div>
                  </div>
                );
              })}
              <Button asChild variant="ghost" className="justify-start px-0 text-[#0b4668] hover:bg-transparent hover:text-[#0b4668]">
                <Link to="/admin/leads">
                  Ver todo o histórico
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-[#0b4668] bg-[#0b4668] p-8 text-white">
        <div className="grid gap-8 xl:grid-cols-2 xl:items-start">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Relatório de Performance</h2>
              <p className="mt-4 max-w-[760px] text-lg leading-8 text-white/82">
                Analise o engajamento dos alunos por departamento e identifique as turmas com melhor aproveitamento do conteúdo.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" className="bg-[#f6be39] text-[#5f4700] hover:bg-[#ffcb5b]">Gerar Relatório PDF</Button>
              <Button type="button" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
                Configurar Alertas
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {performanceStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[20px] border border-white/15 bg-white/10 p-5"
              >
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/74">{stat.label}</p>
                <p className="mt-3 text-[2rem] font-extrabold">{stat.value}</p>
                <div className="my-4 h-px bg-white/10" />
                <p className="text-sm text-white/74">{stat.helper}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

function IconAction({
  label,
  danger = false,
  children
}: {
  label: string;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition ${
        danger ? "text-[#cc4f4f] hover:bg-[#fff1f1]" : "text-[#111827] hover:bg-[#f3f4f6]"
      }`}
    >
      {children}
    </button>
  );
}
